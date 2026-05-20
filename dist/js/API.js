/**
 * RE Building/Floor Popup — API Layer
 *
 * Chiến lược ZERO-FETCH (nhanh):
 *   wp_localize_script đã inject RE_DATA inline vào HTML —
 *   chứa TOÀN BỘ buildings + floors + apartments dưới dạng JSON.
 *   → Khi user click polygon: lookup O(1) từ index, hiển thị ngay, 0ms network wait.
 *
 * Fallback (nếu floor không tìm thấy trong RE_DATA):
 *   fetch live từ /re/v1/floor/{id} rồi cập nhật cache.
 *
 * Exposed globals (gọi từ IMP "Run Script"):
 *   window.openFloorPopup(floorId)       — IMP polygon = re_floor post ID
 *   window.openBuildingPopup(buildingId) — legacy, IMP polygon = re_building post ID
 *
 * Depends on: dist/js/core.min.js (window.Fancybox, window.Swiper)
 */
(function () {
    'use strict';

    // ── SVG namespace & Swiper instances ──────────────────────────────────
    var SVG_NS         = 'http://www.w3.org/2000/svg';
    var aptSwiperMain  = null;
    var aptSwiperThumb = null;

    // ── In-memory index (populated từ RE_DATA inline JSON) ────────────────
    // _buildingMap[buildingId] = full building object (với floors + apartments)
    // _floorMap[floorId]       = { floor, building }
    var _buildingMap = {};
    var _floorMap    = {};

    /**
     * Xây dựng index từ window.RE_DATA — chạy ngay khi script load
     * vì RE_DATA là inline <script> block, luôn có sẵn trước API.js.
     */
    function buildIndex() {
        var buildings = (window.RE_DATA && window.RE_DATA.buildings) ? window.RE_DATA.buildings : [];
        buildings.forEach(function (building) {
            _buildingMap[building.id] = building;
            (building.floors || []).forEach(function (floor) {
                _floorMap[floor.id] = { floor: floor, building: building };
            });
        });
    }
    buildIndex();

    function getApiBase() {
        return (window.RE_DATA && window.RE_DATA.meta && window.RE_DATA.meta.api_base)
            ? window.RE_DATA.meta.api_base
            : '/wp-json/re/v1';
    }

    // ════════════════════════════════════════════════════════════════════
    // POPUP RENDERING
    // ════════════════════════════════════════════════════════════════════

    /**
     * Điền nội dung vào #popup-plan shell.
     * @param {Object}      building        Full building object (với floors)
     * @param {number|null} selectedFloorId Floor cần pre-select; null → chọn floor đầu tiên
     */
    function renderBuildingPopup(building, selectedFloorId) {
        if (!building) return;
        selectedFloorId = parseInt(selectedFloorId, 10) || null;

        var meta  = (window.RE_DATA && window.RE_DATA.buildings || [])
                    .find(function (b) { return b.id === building.id; });
        var color = (meta && meta.color) ? meta.color : '#f97316';

        // Tên tòa nhà
        var headerEl = document.getElementById('popup-building-header');
        if (headerEl) headerEl.textContent = building.name || '';

        // Sidebar — floor tabs
        var floorsEl = document.getElementById('popup-floor-tabs');
        if (!floorsEl) return;
        floorsEl.innerHTML = '';

        var floors   = building.floors || [];
        var activeId = selectedFloorId || (floors[0] ? floors[0].id : null);

        floors.forEach(function (floor) {
            var key = floor.number_end
                ? (floor.number + '-' + floor.number_end)
                : String(floor.number);

            var btn             = document.createElement('div');
            btn.className       = 'floor-item' + (floor.id === activeId ? ' active' : '');
            btn.dataset.floor   = key;
            btn.dataset.floorId = floor.id;
            btn.textContent     = floor.name;

            btn.addEventListener('click', function () {
                floorsEl.querySelectorAll('.floor-item')
                        .forEach(function (el) { el.classList.remove('active'); });
                btn.classList.add('active');
                renderFloorPlan(floor, building);
            });

            floorsEl.appendChild(btn);
        });

        // Hiển thị floor được chọn ngay lập tức
        var initial = floors.find(function (f) { return f.id === activeId; }) || floors[0] || null;
        renderFloorPlan(initial, building);

        // Legend màu căn hộ — lấy từ global_legend (ACF Theme Options → RE_DATA.legend)
        var legendEl = document.getElementById('popup-building-legend');
        if (legendEl) {
            var legends = (window.RE_DATA && window.RE_DATA.legend) ? window.RE_DATA.legend : [];
            legendEl.innerHTML = legends.map(function (item) {
                return '<div class="plan-legend-item">' +
                    '<div class="plan-legend-item-color" style="background-color:' + escAttr(item.color || '#ccc') + '"></div>' +
                    '<div class="plan-legend-item-name">' + escHtml(item.label || '') + '</div>' +
                '</div>';
            }).join('');
        }
    }

    /**
     * Render ảnh mặt bằng + SVG polygon overlay căn hộ vào #popup-building-plan.
     * Ưu tiên: floor.image → building.master_plan
     */
    function renderFloorPlan(floor, building) {
        var planEl = document.getElementById('popup-building-plan');
        if (!planEl) return;

        var image    = (floor && floor.image) ? floor.image : null;
        var imageUrl = (image && image.url)
            ? image.url
            : (building && building.master_plan && building.master_plan.url)
                ? building.master_plan.url
                : '';

        if (!imageUrl) { planEl.innerHTML = ''; return; }

        // Aspect ratio từ kích thước ảnh, fallback 550:960
        var aspectPct = (image && image.height && image.width)
            ? (image.height / image.width * 100).toFixed(4)
            : (550 / 960 * 100).toFixed(4);

        var ratioDiv       = document.createElement('div');
        ratioDiv.style.cssText = 'position:relative;width:100%;padding-top:' + aspectPct + '%;';

        var img           = document.createElement('img');
        img.src           = imageUrl;
        img.alt           = (building && building.name) ? building.name : '';
        img.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:fill;display:block;';
        ratioDiv.appendChild(img);

        // SVG overlay — polygon cho từng căn hộ trong tầng
        var apartments = (floor && floor.apartments) ? floor.apartments : [];
        if (apartments.length) {
            var svg = document.createElementNS(SVG_NS, 'svg');
            svg.setAttribute('viewBox', '0 0 100 100');
            svg.setAttribute('preserveAspectRatio', 'none');
            svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:visible;';

            apartments.forEach(function (apt) {
                if (!apt.interaction || !apt.interaction.polygon || !apt.interaction.polygon.length) return;
                svg.appendChild(buildApartmentPolygon(apt));
            });

            ratioDiv.appendChild(svg);
        }

        planEl.innerHTML = '';
        planEl.appendChild(ratioDiv);
    }

    /**
     * Tạo SVG <polygon> cho một căn hộ.
     * Hover: fill đậm lên; Click: mở apartment detail popup.
     */
    function buildApartmentPolygon(apt) {
        var pts       = apt.interaction.polygon.map(function (p) { return p.x + ',' + p.y; }).join(' ');
        var baseColor = (apt.interaction.hover_color) ? apt.interaction.hover_color : '#f97316';
        var fillIdle  = hexToRgba(baseColor, 0.05);
        var fillHover = hexToRgba(baseColor, 0.50);

        var poly = document.createElementNS(SVG_NS, 'polygon');
        poly.setAttribute('points', pts);
        poly.setAttribute('fill', fillIdle);
        poly.setAttribute('stroke', baseColor);
        poly.setAttribute('stroke-width', '0');
        poly.setAttribute('data-apt-id', apt.id);
        poly.style.cssText = 'pointer-events:all;cursor:pointer;transition:fill 0.18s;';

        poly.addEventListener('mouseenter', function () { poly.setAttribute('fill', fillHover); });
        poly.addEventListener('mouseleave', function () { poly.setAttribute('fill', fillIdle); });
        poly.addEventListener('click',      function () { openApartmentDetail(apt); });

        return poly;
    }

    /**
     * Điền thông tin căn hộ vào #popup-detail-plan rồi mở Fancybox.
     */
    function openApartmentDetail(apt) {
        var nameEl = document.querySelector('.js-apt-name');
        if (nameEl) nameEl.textContent = apt.name || '';

        var areaEl = document.querySelector('.js-apt-area');
        if (areaEl) {
            areaEl.innerHTML = '';
            if (apt.area_net)
                areaEl.insertAdjacentHTML('beforeend',
                    '<div class="info-item text-Primary-4 font-normal">DT thông thủy: ' + apt.area_net + 'm\u00b2</div>');
            if (apt.area_gross)
                areaEl.insertAdjacentHTML('beforeend',
                    '<div class="info-item text-Primary-4 font-normal">DT tim tường: ' + apt.area_gross + 'm\u00b2</div>');
        }

        var facEl = document.querySelector('.js-apt-facilities');
        if (facEl) {
            facEl.innerHTML = (apt.facilities || []).map(function (f) {
                var iconUrl = (f.icon && f.icon.url) ? f.icon.url : (typeof f.icon === 'string' ? f.icon : '');
                var iconAlt = (f.icon && f.icon.alt) ? f.icon.alt : '';
                return '<div class="facility-item">' +
                    '<div class="facility-item-icon">' +
                        '<div class="icon">' + (iconUrl ? '<img class="img-svg" src="' + escAttr(iconUrl) + '" alt="' + escAttr(iconAlt) + '">' : '') + '</div>' +
                        '<div class="facility-item-name">' + escHtml(f.label || '') + '</div>' +
                    '</div>' +
                    '<div class="facility-item-quantity body-4 font-normal text-Primary-4">' + escHtml(String(f.value || '')) + '</div>' +
                '</div>';
            }).join('');
        }

        // Gallery: PHP đã merge template gallery (ưu tiên template nếu có)
        var gallery = (apt.gallery && apt.gallery.length) ? apt.gallery : (apt.layout ? [apt.layout] : []);

        // Khởi tạo Swiper bên trong Fancybox.on.done để tránh layout trên element ẩn
        if (window.Fancybox) {
            window.Fancybox.show([{ src: '#popup-detail-plan', type: 'inline' }], {
                on: {
                    done: function (fancybox, slide) {
                        populateAptSwiper(gallery);
                    }
                }
            });
        }
    }

    /**
     * Khởi tạo / reset Swiper thumbnail gallery cho popup căn hộ.
     */
    function populateAptSwiper(gallery) {
        if (aptSwiperMain)  { aptSwiperMain.destroy(true, true);  aptSwiperMain  = null; }
        if (aptSwiperThumb) { aptSwiperThumb.destroy(true, true); aptSwiperThumb = null; }

        var SwiperClass = window.Swiper;
        if (!SwiperClass) { console.warn('[API.js] window.Swiper not available'); return; }

        // Lấy DOM element sau khi Fancybox đã di chuyển/hiển thị chúng
        var mainEl  = document.querySelector('.js-apt-swiper-main');
        var thumbEl = document.querySelector('.js-apt-swiper-thumb');
        if (!mainEl || !thumbEl) { console.warn('[API.js] Swiper containers not found'); return; }

        // Hủy Swiper cũ đang gắn vào element (nếu có từ lần mở trước)
        if (mainEl.swiper)  mainEl.swiper.destroy(true, true);
        if (thumbEl.swiper) thumbEl.swiper.destroy(true, true);

        var slides = (gallery || []).map(function (img) {
            return '<div class="swiper-slide">' +
                       '<div class="img"><a class="img-ratio">' +
                           '<img src="' + escAttr(img.url || '') + '" alt="' + escAttr(img.alt || '') + '">' +
                       '</a></div>' +
                   '</div>';
        }).join('');

        mainEl.querySelector('.swiper-wrapper').innerHTML  = slides;
        thumbEl.querySelector('.swiper-wrapper').innerHTML = slides;

        aptSwiperThumb = new SwiperClass(thumbEl, {
            direction:           'vertical',
            slidesPerView:       4,
            spaceBetween:        8,
            freeMode:            true,
            watchSlidesProgress: true,
        });

        aptSwiperMain = new SwiperClass(mainEl, {
            spaceBetween: 0,
            thumbs: { swiper: aptSwiperThumb },
        });
    }

    // ════════════════════════════════════════════════════════════════════
    // UTILITY HELPERS
    // ════════════════════════════════════════════════════════════════════

    function hexToRgba(hex, alpha) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    }

    function escHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function escAttr(str) {
        return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // ════════════════════════════════════════════════════════════════════
    // PUBLIC API — window.open* (gọi từ IMP "Run Script")
    // ════════════════════════════════════════════════════════════════════

    /**
     * openFloorPopup(55)
     *
     * Cache-first: lookup O(1) từ _floorMap → hiển thị ngay, 0ms network.
     * Fallback: fetch GET /re/v1/floor/{id} nếu floor không có trong RE_DATA.
     *
     * @param {number|string} floorId  Post ID của re_floor
     */
    window.openFloorPopup = function (floorId) {
        floorId = parseInt(floorId, 10);

        var cached = _floorMap[floorId];
        if (cached) {
            renderBuildingPopup(cached.building, cached.floor.id);
            window.Fancybox && Fancybox.show([{ src: '#popup-plan', type: 'inline' }]);
            return;
        }

        // Fallback — live fetch (xảy ra nếu floor không thuộc RE_DATA của trang này)
        fetch(getApiBase() + '/floor/' + floorId)
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(function (data) {
                // Cập nhật index cho lần sau
                _buildingMap[data.building.id] = data.building;
                (data.building.floors || []).forEach(function (f) {
                    _floorMap[f.id] = { floor: f, building: data.building };
                });
                renderBuildingPopup(data.building, data.floor.id);
                window.Fancybox && Fancybox.show([{ src: '#popup-plan', type: 'inline' }]);
            })
            .catch(function (err) { console.error('[openFloorPopup]', err); });
    };

    /**
     * openBuildingPopup(42)
     *
     * Legacy — dùng khi IMP polygon map tới re_building (không chọn floor cụ thể).
     * Khuyến nghị: dùng openFloorPopup() để pre-select đúng floor.
     *
     * @param {number|string} buildingId  Post ID của re_building
     */
    window.openBuildingPopup = function (buildingId) {
        buildingId = parseInt(buildingId, 10);

        var building = _buildingMap[buildingId];
        if (building) {
            renderBuildingPopup(building, null);
            window.Fancybox && Fancybox.show([{ src: '#popup-plan', type: 'inline' }]);
            return;
        }

        fetch(getApiBase() + '/building/' + buildingId + '/floors')
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(function (building) {
                _buildingMap[building.id] = building;
                (building.floors || []).forEach(function (f) {
                    _floorMap[f.id] = { floor: f, building: building };
                });
                renderBuildingPopup(building, null);
                window.Fancybox && Fancybox.show([{ src: '#popup-plan', type: 'inline' }]);
            })
            .catch(function (err) { console.error('[openBuildingPopup]', err); });
    };

})();
