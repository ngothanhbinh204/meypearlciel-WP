/* =============================================================
   RE Polygon Editor — polygon-editor.js
   ACF-aware orchestrator for the SvgOverlay engine.

   Supports two contexts:
     1. re_building edit screen
        image: building_master_plan field (same post)
        polygons: building_hotspots repeater → building_polygon textarea
        label:   building_name  |  color: building_overlay_color

     2. page edit screen (utilities_all_in_one section)
        image: floor_image in parent floor_groups repeater row
        polygons: amenities sub-repeater → amenity_polygon textarea
        label:   amenity_name  |  color: amenity_overlay_color

   Data format stored in ACF textarea:
     {"points": [[12.5, 22.1], [42.8, 19.2], [48.1, 51.3]]}
   ============================================================= */

/* global acf, SvgOverlay, RE_ADMIN, ajaxurl */
;(function () {
  'use strict';

  // ── CONFIGS ───────────────────────────────────────────────────

  var POLY_CONFIGS = [
    {
      id             : 'apartment_layout_buildings_poly',
      title          : 'Masterplan Polygon Editor — Tòa nhà',
      description    : 'Click để thêm đỉnh → click đỉnh đầu (xanh) để đóng polygon',
      context        : 'page-section',
      layoutName     : 'apartment_layout',
      imageSource    : 'field',
      imageFieldName : 'masterplan_image',
      repeaterName   : 'buildings',
      polygonField   : 'building_polygon',
      colorField     : 'building_color',
      labelField     : 'building_ref',
      defaultColor   : '#f97316',
    },
  ];

  // Instances registry (allows append/remove sync)
  var instances = {};


  // ── HELPER UTILS ──────────────────────────────────────────────

  function makeEl(tag, attrs) {
    var e = document.createElement(tag);
    if (!attrs) return e;
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if      (k === 'class')           e.className   = v;
      else if (k === 'html')            e.innerHTML   = v;
      else if (k === 'text')            e.textContent = v;
      else if (k.slice(0, 5) === 'data-') e.setAttribute(k, v);
      else                              e[k] = v;
    });
    return e;
  }

  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function parsePolygonJSON(raw) {
    if (!raw || !raw.trim()) return [];
    try {
      var d = JSON.parse(raw.trim());
      if (Array.isArray(d.points)) return d.points;
    } catch (e) { /* ignore */ }
    return [];
  }


  // ── POLYGON EDITOR CLASS ──────────────────────────────────────

  function PolygonEditor(config, rootEl) {
    this.config      = config;
    this.rootEl      = rootEl || document;
    this.wrapper     = null;
    this.canvas      = null;    // .re-pe-canvas (overflow clip)
    this.viewport    = null;    // .re-pe-viewport (transform target)
    this.imgEl       = null;
    this.overlay     = null;    // SvgOverlay instance
    this.listPanel   = null;
    this.collapsed   = false;
    this._drawingId  = null;
    this._refreshTimer = null;

    // Bound refs for header buttons (updated after build)
    this._btnCancel  = null;
    this._modeLabel  = null;
  }


  // ── MOUNT ─────────────────────────────────────────────────────

  PolygonEditor.prototype.mount = function () {
    var anchor = this.rootEl.querySelector(
      '.acf-field[data-name="' + this.config.repeaterName + '"]'
    );
    if (!anchor) return;

    this._buildUI();
    anchor.parentNode.insertBefore(this.wrapper, anchor);
    this._loadImage();
    this._syncList();
    this._bindACFSync();
    this._bindScaleObserver();
  };


  // ── BUILD UI ──────────────────────────────────────────────────

  PolygonEditor.prototype._buildUI = function () {
    var self = this;
    var cfg  = this.config;

    /* ─ Mode label ─ */
    var modeLabel = makeEl('span', { class: 're-pe-mode', text: '👁 Xem' });

    /* ─ Cancel draw button ─ */
    var btnCancel = makeEl('button', {
      type : 'button',
      class: 'button re-pe-btn re-pe-btn-cancel',
      text : '✕ Hủy vẽ',
    });
    btnCancel.style.display = 'none';
    btnCancel.addEventListener('click', function () {
      if (self.overlay) self.overlay.cancelDraw();
      self._drawingId = null;
      self._setMode('view');
    });

    /* ─ Refresh button ─ */
    var btnRefresh = makeEl('button', {
      type: 'button', class: 'button re-pe-btn', text: '↺ Làm mới',
    });
    btnRefresh.addEventListener('click', function () { self._loadImage(); });

    /* ─ Toggle collapse ─ */
    var btnToggle = makeEl('button', {
      type: 'button', class: 'button re-pe-btn', text: '▼ Thu gọn',
    });
    btnToggle.addEventListener('click', function () {
      self.collapsed = !self.collapsed;
      body.style.display = self.collapsed ? 'none' : '';
      btnToggle.textContent = self.collapsed ? '▶ Mở rộng' : '▼ Thu gọn';
    });

    var headerActions = makeEl('div', { class: 're-pe-header-actions' });
    headerActions.appendChild(modeLabel);
    headerActions.appendChild(btnCancel);
    headerActions.appendChild(btnRefresh);
    headerActions.appendChild(btnToggle);

    var headerTitle = makeEl('div', {
      class: 're-pe-title',
      html : '<span>🔷</span> <strong>' + escHtml(cfg.title) + '</strong>' +
             '<em>' + escHtml(cfg.description) + '</em>',
    });

    var header = makeEl('div', { class: 're-pe-header' });
    header.appendChild(headerTitle);
    header.appendChild(headerActions);

    /* ─ Hint bar ─ */
    var hint = makeEl('div', {
      class: 're-pe-hint',
      html : '💡 <strong>Vẽ:</strong> click liên tục để thêm đỉnh → click đỉnh đầu (xanh) để đóng. ' +
             '<strong>Sửa:</strong> kéo đỉnh để di chuyển. ' +
             '<strong>Xóa đỉnh:</strong> chuột phải vào đỉnh (khi ở chế độ xem). ' +
             '<strong>Zoom:</strong> Ctrl+Scroll. <strong>Pan:</strong> Space+kéo.',
    });

    /* ─ Canvas ─ */
    this.viewport = makeEl('div', { class: 're-pe-viewport' });
    this._setPlaceholder('⏳ Đang tải ảnh…');

    this.canvas = makeEl('div', { class: 're-pe-canvas', 'data-pe': cfg.id });
    this.canvas.appendChild(this.viewport);

    /* ─ List panel ─ */
    this.listPanel = makeEl('div', { class: 're-pe-list' });
    var listHead   = makeEl('div', { class: 're-pe-list-header', text: 'Polygon list' });
    this.listPanel.appendChild(listHead);

    /* ─ Layout ─ */
    var layout = makeEl('div', { class: 're-pe-layout' });
    layout.appendChild(this.canvas);
    layout.appendChild(this.listPanel);

    /* ─ Body ─ */
    var body = makeEl('div', { class: 're-pe-body' });
    body.appendChild(hint);
    body.appendChild(layout);

    /* ─ Wrapper ─ */
    this.wrapper = makeEl('div', {
      class       : 're-polygon-editor',
      'data-pe-id': cfg.id,
    });
    this.wrapper.appendChild(header);
    this.wrapper.appendChild(body);

    /* Store refs used by other methods */
    this._btnCancel = btnCancel;
    this._modeLabel = modeLabel;
    this._bodyEl    = body;
  };


  // ── MODE MANAGEMENT ───────────────────────────────────────────

  PolygonEditor.prototype._setMode = function (mode) {
    var isDraw = (mode === 'draw');
    this._modeLabel.textContent      = isDraw ? '✏ Đang vẽ' : '👁 Xem';
    this._btnCancel.style.display    = isDraw ? '' : 'none';
    this.canvas.classList.toggle('is-drawing', isDraw);
  };

  PolygonEditor.prototype._setPlaceholder = function (text) {
    this.viewport.innerHTML = '<div class="re-pe-placeholder"><span>' + escHtml(text) + '</span></div>';
    this.imgEl   = null;
    this.overlay = null;
  };

  /**
   * Show a placeholder with a button that scrolls to the ACF image field
   * and triggers the media uploader.
   */
  PolygonEditor.prototype._showUploadPrompt = function (fieldEl, fieldName) {
    var self = this;
    var wrap = makeEl('div', { class: 're-pe-placeholder re-pe-placeholder--upload' });

    var msg = makeEl('p', { text: '🖼 Chưa có ảnh masterplan cho polygon editor.' });

    var btn = makeEl('button', {
      type : 'button',
      class: 'button re-pe-btn-upload-jump',
    });
    btn.innerHTML = '↑ Upload ảnh <strong>' + escHtml(fieldName) + '</strong>';
    btn.title = 'Cuộn đến field ảnh và mở media uploader';
    btn.addEventListener('click', function () {
      fieldEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(function () {
        // Try ACF Pro image uploader button selectors
        var trigger = fieldEl.querySelector(
          '.acf-image-uploader .acf-button, ' +
          '.acf-image-uploader a.add-image, ' +
          'a.acf-button.add-image, ' +
          'button.add-image-or-url'
        );
        if (trigger) trigger.click();
      }, 500);
    });

    wrap.appendChild(msg);
    wrap.appendChild(btn);
    this.viewport.innerHTML = '';
    this.viewport.appendChild(wrap);
    this.imgEl   = null;
    this.overlay = null;
  };


  // ── IMAGE LOADING ─────────────────────────────────────────────

  PolygonEditor.prototype._loadImage = function () {
    var self = this;
    if (this.config.imageSource === 'field') {
      this._loadFromACFImageField(this.config.imageFieldName);
    } else if (this.config.imageSource === 'ajax') {
      this._loadFromParentFloor();
    }
  };

  PolygonEditor.prototype._loadFromACFImageField = function (fieldName) {
    var self    = this;
    var fieldEl = this.rootEl.querySelector('.acf-field[data-name="' + fieldName + '"]');
    if (!fieldEl) {
      this._setPlaceholder('Không tìm thấy trường ảnh "' + fieldName + '"');
      return;
    }

    // Check hidden input (attachment ID) as canonical source of truth
    var hidden       = fieldEl.querySelector('input[type="hidden"]');
    var attachmentId = hidden ? parseInt(hidden.value, 10) : 0;
    if (!attachmentId) {
      this._showUploadPrompt(fieldEl, fieldName);
      if (hidden && !hidden.dataset.rePeImgWatch) {
        hidden.dataset.rePeImgWatch = '1';
        hidden.addEventListener('change', function () {
          setTimeout(function () { self._loadFromACFImageField(fieldName); }, 800);
        });
      }
      return;
    }

    // Fetch full-resolution URL via WP REST API to avoid thumbnail blurriness.
    // ACF preview img uses preview_size (e.g. "medium" ~300px) which looks blurry
    // when scaled up inside the canvas. REST API gives us the crisp "large" (1024px) URL.
    this._setPlaceholder('⏳ Đang tải ảnh masterplan…');
    var apiRoot  = (window.wpApiSettings && window.wpApiSettings.root)  || '/wp-json/';
    var apiNonce = (window.wpApiSettings && window.wpApiSettings.nonce) ||
                   (window.RE_ADMIN      && window.RE_ADMIN.nonce)      || '';

    fetch(apiRoot + 'wp/v2/media/' + attachmentId, {
      headers: { 'X-WP-Nonce': apiNonce }
    })
    .then(function (r) { return r.json(); })
    .then(function (media) {
      var sizes = (media.media_details && media.media_details.sizes) || {};
      // Prefer 'large' (1024px) for quality/speed balance; fall back to original
      var url = (sizes.large && sizes.large.source_url) || media.source_url;
      if (url) {
        self._mountImage(url);
      } else {
        self._setPlaceholder('Không lấy được URL ảnh từ Media Library');
      }
    })
    .catch(function () {
      // Fallback: try ACF preview img src
      var preview = fieldEl.querySelector('.acf-image-uploader img, .image-wrap img');
      if (preview && preview.getAttribute('src')) {
        self._mountImage(preview.src);
      } else {
        self._setPlaceholder('Lỗi kết nối — kiểm tra lại');
      }
    });
  };

  PolygonEditor.prototype._loadFromParentFloor = function () {
    var self       = this;
    var parentField = this.rootEl.querySelector(
      '.acf-field[data-name="' + (this.config.parentFloorField || 'parent_floor') + '"]'
    );
    if (!parentField) { this._setPlaceholder('Không tìm thấy trường parent_floor'); return; }

    var select  = parentField.querySelector('select');
    var floorId = select ? select.value : '';
    if (!floorId || floorId === '0') {
      this._setPlaceholder('Chọn "Thuộc tầng" để tải floor plan');
      if (select && !select.dataset.rePeWatch) {
        select.dataset.rePeWatch = '1';
        select.addEventListener('change', function () { self._loadFromParentFloor(); });
      }
      return;
    }

    this._setPlaceholder('⏳ Đang tải floor plan…');
    var form = new FormData();
    form.append('action',   're_get_floor_image');
    form.append('floor_id', floorId);
    form.append('nonce',    (window.RE_ADMIN && window.RE_ADMIN.nonce) || '');

    fetch(ajaxurl, { method: 'POST', body: form })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.success && res.data && res.data.url) {
          self._mountImage(res.data.url);
        } else {
          self._setPlaceholder('Tầng này chưa có ảnh floor plan');
        }
      })
      .catch(function () { self._setPlaceholder('Lỗi kết nối khi tải ảnh'); });
  };

  PolygonEditor.prototype._mountImage = function (url) {
    var self = this;
    this.viewport.innerHTML = '';
    this.overlay = null;

    var img = makeEl('img', { class: 're-pe-img', src: url, draggable: false });
    img.addEventListener('load', function () {
      self.imgEl  = img;
      self.overlay = new SvgOverlay(self.viewport);

      // Wire overlay events → ACF + UI
      self.overlay.on(SvgOverlay.EVT_CHANGE, function (d) {
        self._writeToACF(d.id, d.points);
      });
      self.overlay.on(SvgOverlay.EVT_DRAW_DONE, function (d) {
        self._drawingId = null;
        self._setMode('view');
        self._refreshListItem(d.id);
      });
      self.overlay.on(SvgOverlay.EVT_DRAW_CANCEL, function (d) {
        self._drawingId = null;
        self._setMode('view');
        self._refreshListItem(d.id);
      });
      self.overlay.on(SvgOverlay.EVT_POLY_CLICK, function (d) {
        self.listPanel.querySelectorAll('.re-pe-list-item').forEach(function (item) {
          item.classList.toggle('is-active', item.getAttribute('data-row-idx') === String(d.id));
        });
      });

      // Load existing polygon data from ACF fields
      self._pushACFToOverlay();
    });
    img.addEventListener('error', function () {
      self._setPlaceholder('Không thể tải ảnh — kiểm tra lại field');
    });

    this.viewport.appendChild(img);
  };


  // ── ACF FIELD SYNC ────────────────────────────────────────────

  /** ACF textarea → SvgOverlay: load all existing polygons. */
  PolygonEditor.prototype._pushACFToOverlay = function () {
    if (!this.overlay) return;
    var self    = this;
    var cfg     = this.config;
    var repEl   = this.rootEl.querySelector('.acf-field[data-name="' + cfg.repeaterName + '"]');
    if (!repEl) return;

    var rows = repEl.querySelectorAll('.acf-row:not(.acf-clone)');
    var map  = {};

    rows.forEach(function (row, idx) {
      var polyInput  = row.querySelector('.acf-field[data-name="' + cfg.polygonField + '"] textarea');
      var colorInput = row.querySelector('.acf-field[data-name="' + cfg.colorField + '"] input[type="text"]');
      var labelInput = row.querySelector('.acf-field[data-name="' + cfg.labelField + '"] input[type="text"]');
      var labelS2    = row.querySelector('.acf-field[data-name="' + cfg.labelField + '"] .select2-selection__rendered');

      var pts   = parsePolygonJSON(polyInput  ? polyInput.value  : '');
      var color = (colorInput && colorInput.value) ? colorInput.value : cfg.defaultColor;
      var label = (labelInput && labelInput.value) ? labelInput.value
                : (labelS2 && labelS2.textContent.trim()) ? labelS2.textContent.trim()
                : ('Row ' + (idx + 1));

      map[idx] = { points: pts, color: color, label: label };
    });

    this.overlay.syncPolygons(map);
  };

  /** SvgOverlay change → write JSON to ACF textarea. */
  PolygonEditor.prototype._writeToACF = function (rowIdx, points) {
    var cfg   = this.config;
    var repEl = this.rootEl.querySelector('.acf-field[data-name="' + cfg.repeaterName + '"]');
    if (!repEl) return;

    var rows = repEl.querySelectorAll('.acf-row:not(.acf-clone)');
    var row  = rows[rowIdx];
    if (!row) return;

    var textarea = row.querySelector('.acf-field[data-name="' + cfg.polygonField + '"] textarea');
    if (!textarea) return;

    var json = points.length > 0 ? JSON.stringify({ points: points }) : '';
    textarea.value = json;
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
  };


  // ── LIST PANEL ────────────────────────────────────────────────

  PolygonEditor.prototype._syncList = function () {
    if (!this.listPanel) return;   // mount() exited early — not on this screen
    var self = this;
    var cfg  = this.config;

    // Preserve header
    var listHead = this.listPanel.querySelector('.re-pe-list-header');
    this.listPanel.innerHTML = '';
    if (listHead) this.listPanel.appendChild(listHead);

    var repEl = this.rootEl.querySelector('.acf-field[data-name="' + cfg.repeaterName + '"]');
    if (!repEl) return;

    var rows = repEl.querySelectorAll('.acf-row:not(.acf-clone)');
    rows.forEach(function (row, idx) {
      self.listPanel.appendChild(self._buildListItem(row, idx));
    });

    // After rebuilding list, push latest ACF data to overlay
    if (this.overlay) this._pushACFToOverlay();
    this._hidePolygonFields();
  };

  PolygonEditor.prototype._hidePolygonFields = function () {
    var cfg   = this.config;
    var repEl = this.rootEl.querySelector('.acf-field[data-name="' + cfg.repeaterName + '"]');
    if (!repEl) return;
    repEl.querySelectorAll('.acf-row:not(.acf-clone)').forEach(function (row) {
      var fld = row.querySelector('.acf-field[data-name="' + cfg.polygonField + '"]');
      if (fld) fld.style.display = 'none';
    });
  };

  PolygonEditor.prototype._buildListItem = function (row, idx) {
    var self = this;
    var cfg  = this.config;

    var polyInput  = row.querySelector('.acf-field[data-name="' + cfg.polygonField + '"] textarea');
    var colorInput = row.querySelector('.acf-field[data-name="' + cfg.colorField + '"] input[type="text"]');
    var labelInput = row.querySelector('.acf-field[data-name="' + cfg.labelField + '"] input[type="text"]');
    var labelS2    = row.querySelector('.acf-field[data-name="' + cfg.labelField + '"] .select2-selection__rendered');

    var pts   = parsePolygonJSON(polyInput  ? polyInput.value  : '');
    var color = (colorInput && colorInput.value) ? colorInput.value : cfg.defaultColor;
    var label = (labelInput && labelInput.value) ? labelInput.value
              : (labelS2 && labelS2.textContent.trim()) ? labelS2.textContent.trim()
              : ('Row ' + (idx + 1));

    var hasPoly  = pts.length >= 3;
    var statusTx = hasPoly ? ('✓ ' + pts.length + ' đỉnh') : '— chưa vẽ';

    var item = makeEl('div', {
      class          : 're-pe-list-item' + (hasPoly ? ' has-poly' : ''),
      'data-row-idx' : idx,
    });

    // Color swatch
    var swatch = makeEl('span', { class: 're-pe-swatch' });
    swatch.style.background = color;

    // Info
    var info = makeEl('div', { class: 're-pe-list-info' });
    info.innerHTML =
      '<strong>' + escHtml(label) + '</strong>' +
      '<span class="re-pe-status">' + statusTx + '</span>';

    // Draw button
    var btnDraw = makeEl('button', {
      type : 'button',
      class: 'button button-small re-pe-btn-draw',
      text : '✏ Vẽ',
    });
    btnDraw.title = 'Vẽ lại polygon cho vùng này';
    btnDraw.addEventListener('click', function (e) {
      e.preventDefault();
      if (!self.overlay) { alert('Hãy upload ảnh trước khi vẽ'); return; }

      // Re-read label/color (may have changed since list was built)
      var currentLabel = (labelInput && labelInput.value) ? labelInput.value
                       : (labelS2 && labelS2.textContent.trim()) ? labelS2.textContent.trim()
                       : ('Row ' + (idx + 1));
      var currentColor = (colorInput && colorInput.value) ? colorInput.value : cfg.defaultColor;

      self._drawingId = idx;
      self.overlay.startDraw(idx, currentColor, currentLabel);
      self._setMode('draw');
      self._pushACFToOverlay();

      // Scroll canvas into view
      self.canvas.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Highlight list item
      self.listPanel.querySelectorAll('.re-pe-list-item').forEach(function (li) {
        li.classList.toggle('is-active', li.getAttribute('data-row-idx') === String(idx));
      });
    });

    // Clear button
    var btnClear = makeEl('button', {
      type : 'button',
      class: 'button button-small re-pe-btn-clear',
      text : '🗑',
    });
    btnClear.title = 'Xóa polygon này';
    btnClear.addEventListener('click', function (e) {
      e.preventDefault();
      if (!confirm('Xóa polygon của "' + label + '"?')) return;
      if (self.overlay) self.overlay.clearPolygon(idx);
      self._writeToACF(idx, []);
      self._refreshListItem(idx);
    });

    var actions = makeEl('div', { class: 're-pe-list-actions' });
    actions.appendChild(btnDraw);
    actions.appendChild(btnClear);

    item.appendChild(swatch);
    item.appendChild(info);
    item.appendChild(actions);

    return item;
  };

  PolygonEditor.prototype._refreshListItem = function (rowIdx) {
    var cfg      = this.config;
    var repEl    = this.rootEl.querySelector('.acf-field[data-name="' + cfg.repeaterName + '"]');
    if (!repEl) return;

    var rows = repEl.querySelectorAll('.acf-row:not(.acf-clone)');
    var row  = rows[rowIdx];
    if (!row) return;

    var item = this.listPanel.querySelector('.re-pe-list-item[data-row-idx="' + rowIdx + '"]');
    if (!item) return;

    var polyInput = row.querySelector('.acf-field[data-name="' + cfg.polygonField + '"] textarea');
    var pts       = parsePolygonJSON(polyInput ? polyInput.value : '');
    var hasPoly   = pts.length >= 3;
    var statusEl  = item.querySelector('.re-pe-status');

    if (statusEl) statusEl.textContent = hasPoly ? ('✓ ' + pts.length + ' đỉnh') : '— chưa vẽ';
    item.classList.toggle('has-poly', hasPoly);
  };


  // ── ACF EVENTS BINDING ────────────────────────────────────────

  PolygonEditor.prototype._bindACFSync = function () {
    var self = this;
    var cfg  = this.config;

    // Watch image field changes → reload image
    var imgFieldEl = this.rootEl.querySelector('.acf-field[data-name="' + cfg.imageFieldName + '"]');
    if (imgFieldEl) {
      var hidden = imgFieldEl.querySelector('input[type="hidden"]');
      if (hidden && !hidden.dataset.rePeImg) {
        hidden.dataset.rePeImg = '1';
        hidden.addEventListener('change', function () {
          setTimeout(function () { self._loadImage(); }, 600);
        });
      }
    }

    // Watch label/color changes inside repeater → debounce list refresh
    var repEl = this.rootEl.querySelector('.acf-field[data-name="' + cfg.repeaterName + '"]');
    if (repEl) {
      repEl.addEventListener('input', function (e) {
        var acfField = e.target.closest('.acf-field');
        if (!acfField) return;
        var fname = acfField.dataset.name;
        if (fname !== cfg.labelField && fname !== cfg.colorField) return;
        clearTimeout(self._refreshTimer);
        self._refreshTimer = setTimeout(function () {
          self._syncList();
          if (self.overlay) self._pushACFToOverlay();
        }, 500);
      });
    }
  };

  /** Called after ACF append/remove events to re-sync everything. */
  PolygonEditor.prototype.syncAll = function () {
    if (!this.listPanel) return;   // mount() exited early — not on this screen
    this._syncList();
    if (this.overlay) this._pushACFToOverlay();
  };

  /**
   * Watch canvas `data-ve-state` attribute for viewport-editor scale changes
   * and update vertex circle radii so they appear the same size at any zoom.
   */
  PolygonEditor.prototype._bindScaleObserver = function () {
    var self = this;
    if (!window.MutationObserver || !self.canvas) return;
    var observer = new MutationObserver(function () {
      var raw = self.canvas.dataset.veState;
      if (!raw || !self.overlay) return;
      try {
        var st = JSON.parse(raw);
        if (typeof st.sc === 'number') self.overlay.setVertexScale(st.sc);
      } catch (e) {}
    });
    observer.observe(self.canvas, { attributes: true, attributeFilter: ['data-ve-state'] });
  };


  // ── SINGLE POLYGON EDITOR (re_apartment) ──────────────────────
  //
  // Draws one polygon per post on the floor plan image loaded via AJAX
  // from the related re_floor post. Stores result in apartment_polygon textarea.
  // ──────────────────────────────────────────────────────────────

  var SPE_CONFIGS = [
    {
      id               : 'apartment_polygon_single',
      postType         : 're_apartment',
      title            : 'Apartment Polygon Editor',
      description      : 'Vẽ vùng căn hộ trên floor plan của tầng',
      floorFieldName   : 'parent_floor',
      polygonFieldName : 'apartment_polygon',
      colorFieldName   : 'apartment_hover_color',
      defaultColor     : '#f97316',
    },
  ];

  function SinglePolygonEditor(config) {
    this.config     = config;
    this.wrapper    = null;
    this.canvas     = null;
    this.viewport   = null;
    this.overlay    = null;
    this._polyId    = 'apt';
    this._modeLabel = null;
    this._btnCancel = null;
    this._statusEl  = null;
    this._bodyEl    = null;
    this.collapsed  = false;
  }

  SinglePolygonEditor.prototype.mount = function () {
    var anchor = document.querySelector(
      '.acf-field[data-name="' + this.config.polygonFieldName + '"]'
    );
    if (!anchor) return;

    this._buildUI();
    anchor.parentNode.insertBefore(this.wrapper, anchor);
    anchor.style.display = 'none'; // raw textarea hidden; editor manages it
    this._loadFloorImage();
    this._watchFloorField();
  };

  SinglePolygonEditor.prototype._buildUI = function () {
    var self = this;
    var cfg  = this.config;

    /* ── Header ── */
    var modeLabel = makeEl('span', { class: 're-pe-mode', text: '👁 Xem' });
    var btnCancel = makeEl('button', {
      type: 'button', class: 'button re-pe-btn re-pe-btn-cancel', text: '✕ Hủy vẽ',
    });
    btnCancel.style.display = 'none';
    btnCancel.addEventListener('click', function () {
      if (self.overlay) self.overlay.cancelDraw();
      self._setMode('view');
    });

    var btnRefresh = makeEl('button', { type: 'button', class: 'button re-pe-btn', text: '↺ Làm mới' });
    btnRefresh.addEventListener('click', function () { self._loadFloorImage(); });

    var btnToggle = makeEl('button', { type: 'button', class: 'button re-pe-btn', text: '▼ Thu gọn' });
    btnToggle.addEventListener('click', function () {
      self.collapsed = !self.collapsed;
      bodyEl.style.display = self.collapsed ? 'none' : '';
      btnToggle.textContent = self.collapsed ? '▶ Mở rộng' : '▼ Thu gọn';
    });

    var headerActions = makeEl('div', { class: 're-pe-header-actions' });
    headerActions.appendChild(modeLabel);
    headerActions.appendChild(btnCancel);
    headerActions.appendChild(btnRefresh);
    headerActions.appendChild(btnToggle);

    var headerTitle = makeEl('div', {
      class: 're-pe-title',
      html : '<span>📐</span> <strong>' + escHtml(cfg.title) + '</strong>' +
             '<em>' + escHtml(cfg.description) + '</em>',
    });

    var header = makeEl('div', { class: 're-pe-header' });
    header.appendChild(headerTitle);
    header.appendChild(headerActions);

    /* ── Hint ── */
    var hint = makeEl('div', {
      class: 're-pe-hint',
      html : '💡 <strong>Vẽ:</strong> click thêm đỉnh → click đỉnh đầu (xanh) để đóng. ' +
             '<strong>Sửa:</strong> kéo đỉnh. <strong>Xóa đỉnh:</strong> chuột phải. ' +
             '<strong>Zoom:</strong> Ctrl+Scroll.',
    });

    /* ── Canvas ── */
    this.viewport = makeEl('div', { class: 're-pe-viewport' });
    this._setPlaceholder('⏳ Đang khởi tạo…');
    this.canvas = makeEl('div', { class: 're-pe-canvas', 'data-pe': cfg.id });
    this.canvas.appendChild(this.viewport);

    /* ── Status bar ── */
    var btnDraw = makeEl('button', {
      type: 'button', class: 'button button-primary re-spe-btn-draw', text: '✏ Vẽ polygon',
    });
    btnDraw.addEventListener('click', function (e) {
      e.preventDefault();
      if (!self.overlay) { alert('Hãy chọn tầng để tải floor plan trước'); return; }
      self.overlay.startDraw(self._polyId, self._getColor(), self._getLabel());
      self._setMode('draw');
    });

    var btnClear = makeEl('button', {
      type: 'button', class: 'button re-spe-btn-clear', text: '🗑 Xóa',
    });
    btnClear.addEventListener('click', function (e) {
      e.preventDefault();
      if (!confirm('Xóa polygon của căn hộ này?')) return;
      if (self.overlay) self.overlay.clearPolygon(self._polyId);
      self._writePolygon([]);
      self._updateStatus([]);
    });

    var statusEl = makeEl('span', { class: 're-spe-status', text: '— chưa vẽ' });
    var statusBar = makeEl('div', { class: 're-spe-statusbar' });
    statusBar.appendChild(btnDraw);
    statusBar.appendChild(btnClear);
    statusBar.appendChild(statusEl);

    /* ── Body ── */
    var bodyEl = makeEl('div', { class: 're-pe-body' });
    bodyEl.appendChild(hint);
    bodyEl.appendChild(this.canvas);
    bodyEl.appendChild(statusBar);

    /* ── Wrapper ── */
    this.wrapper = makeEl('div', { class: 're-polygon-editor', 'data-pe-id': cfg.id });
    this.wrapper.appendChild(header);
    this.wrapper.appendChild(bodyEl);

    this._btnCancel = btnCancel;
    this._modeLabel = modeLabel;
    this._statusEl  = statusEl;
    this._bodyEl    = bodyEl;
  };

  SinglePolygonEditor.prototype._setMode = function (mode) {
    var isDraw = (mode === 'draw');
    this._modeLabel.textContent   = isDraw ? '✏ Đang vẽ' : '👁 Xem';
    this._btnCancel.style.display = isDraw ? '' : 'none';
    this.canvas.classList.toggle('is-drawing', isDraw);
  };

  SinglePolygonEditor.prototype._setPlaceholder = function (text) {
    this.viewport.innerHTML = '<div class="re-pe-placeholder"><span>' + escHtml(text) + '</span></div>';
    this.imgEl   = null;
    this.overlay = null;
  };

  SinglePolygonEditor.prototype._showSelectFloorPrompt = function (floorFieldEl) {
    var wrap = makeEl('div', { class: 're-pe-placeholder re-pe-placeholder--upload' });
    wrap.appendChild(makeEl('p', { text: '🏠 Chưa chọn tầng.' }));
    var btn = makeEl('button', { type: 'button', class: 'button re-pe-btn-upload-jump' });
    btn.innerHTML = '↑ Chọn <strong>Thuộc tầng</strong>';
    btn.title = 'Cuộn đến field "Thuộc tầng"';
    btn.addEventListener('click', function () {
      floorFieldEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(function () {
        var focusable = floorFieldEl.querySelector('select, input.select2-search__field');
        if (focusable) focusable.focus();
      }, 400);
    });
    wrap.appendChild(btn);
    this.viewport.innerHTML = '';
    this.viewport.appendChild(wrap);
    this.imgEl   = null;
    this.overlay = null;
  };

  SinglePolygonEditor.prototype._getFloorId = function () {
    var floorFieldEl = document.querySelector(
      '.acf-field[data-name="' + this.config.floorFieldName + '"]'
    );
    if (!floorFieldEl) return 0;
    var select = floorFieldEl.querySelector('select');
    return select ? (parseInt(select.value, 10) || 0) : 0;
  };

  SinglePolygonEditor.prototype._loadFloorImage = function () {
    var self         = this;
    var cfg          = this.config;
    var floorFieldEl = document.querySelector('.acf-field[data-name="' + cfg.floorFieldName + '"]');
    if (!floorFieldEl) {
      this._setPlaceholder('Không tìm thấy field "' + cfg.floorFieldName + '"');
      return;
    }

    var floorId = this._getFloorId();
    if (!floorId) {
      this._showSelectFloorPrompt(floorFieldEl);
      return;
    }

    this._setPlaceholder('⏳ Đang tải floor plan…');
    var ajaxUrl = (window.RE_ADMIN && window.RE_ADMIN.ajaxurl) ||
                  (typeof ajaxurl !== 'undefined' ? ajaxurl : '');
    var form = new FormData();
    form.append('action',   're_get_floor_image');
    form.append('floor_id', floorId);
    form.append('nonce',    (window.RE_ADMIN && window.RE_ADMIN.nonce) || '');

    fetch(ajaxUrl, { method: 'POST', body: form })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.success && res.data && res.data.url) {
          self._mountImage(res.data.url);
        } else {
          self._setPlaceholder('Tầng này chưa có ảnh floor plan — upload ảnh trong Floor post trước');
        }
      })
      .catch(function () { self._setPlaceholder('Lỗi kết nối AJAX'); });
  };

  SinglePolygonEditor.prototype._mountImage = function (url) {
    var self = this;
    this.viewport.innerHTML = '';
    this.overlay = null;

    var img = makeEl('img', { class: 're-pe-img', src: url, draggable: false });
    img.addEventListener('load', function () {
      self.overlay = new SvgOverlay(self.viewport);
      self.overlay.on(SvgOverlay.EVT_CHANGE, function (d) {
        self._writePolygon(d.points);
        self._updateStatus(d.points);
      });
      self.overlay.on(SvgOverlay.EVT_DRAW_DONE, function (d) {
        self._setMode('view');
        self._updateStatus(d.points);
      });
      self.overlay.on(SvgOverlay.EVT_DRAW_CANCEL, function () {
        self._setMode('view');
      });
      self._loadExistingPolygon();
    });
    img.addEventListener('error', function () {
      self._setPlaceholder('Không thể tải ảnh floor plan');
    });
    this.viewport.appendChild(img);
  };

  SinglePolygonEditor.prototype._loadExistingPolygon = function () {
    if (!this.overlay) return;
    var cfg     = this.config;
    var polyEl  = document.querySelector('.acf-field[data-name="' + cfg.polygonFieldName + '"] textarea');
    var colorEl = document.querySelector('.acf-field[data-name="' + cfg.colorFieldName + '"] input[type="text"]');
    var pts   = parsePolygonJSON(polyEl  ? polyEl.value  : '');
    var color = (colorEl && colorEl.value) ? colorEl.value : cfg.defaultColor;
    var label = this._getLabel();

    var map = {};
    map[this._polyId] = { points: pts, color: color, label: label };
    this.overlay.syncPolygons(map);
    this._updateStatus(pts);
    if (pts.length >= 3) this.overlay.setActive(this._polyId);
  };

  SinglePolygonEditor.prototype._writePolygon = function (points) {
    var cfg      = this.config;
    var textarea = document.querySelector('.acf-field[data-name="' + cfg.polygonFieldName + '"] textarea');
    if (!textarea) return;
    textarea.value = points.length > 0 ? JSON.stringify({ points: points }) : '';
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
  };

  SinglePolygonEditor.prototype._updateStatus = function (points) {
    if (!this._statusEl) return;
    var ok = points && points.length >= 3;
    this._statusEl.textContent = ok ? ('✓ ' + points.length + ' đỉnh') : '— chưa vẽ';
    this._statusEl.style.color = ok ? '#16a34a' : '#9ca3af';
  };

  SinglePolygonEditor.prototype._getColor = function () {
    var colorEl = document.querySelector(
      '.acf-field[data-name="' + this.config.colorFieldName + '"] input[type="text"]'
    );
    return (colorEl && colorEl.value) ? colorEl.value : this.config.defaultColor;
  };

  SinglePolygonEditor.prototype._getLabel = function () {
    var nameEl = document.querySelector('.acf-field[data-name="apartment_name"] input[type="text"]');
    if (nameEl && nameEl.value) return nameEl.value;
    var codeEl = document.querySelector('.acf-field[data-name="apartment_code"] input[type="text"]');
    return (codeEl && codeEl.value) ? codeEl.value : 'Căn hộ';
  };

  SinglePolygonEditor.prototype._watchFloorField = function () {
    var self         = this;
    var cfg          = this.config;
    var floorFieldEl = document.querySelector('.acf-field[data-name="' + cfg.floorFieldName + '"]');
    if (!floorFieldEl || floorFieldEl.dataset.reSpeWatch) return;
    floorFieldEl.dataset.reSpeWatch = '1';
    // ACF post_object uses <select> (possibly wrapped by Select2)
    floorFieldEl.addEventListener('change', function (e) {
      if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') {
        self.overlay = null;
        self._loadFloorImage();
      }
    });
  };

  SinglePolygonEditor.prototype.syncAll = function () {
    if (this.overlay) this._loadExistingPolygon();
  };


  // ── UTILITIES FLOOR WIDGET ────────────────────────────────────
  // One per floor_group row inside the utilities_all_in_one layout.
  // Handles:
  //   • Spatial polygon editor for this floor's amenities
  //   • Camera state saver (viewport position → JSON → camera_state field)
  // ─────────────────────────────────────────────────────────────

  // Auto-assigned polygon colors (no color-picker field needed)
  var AMENITY_COLORS = [
    '#3b82f6', '#f97316', '#22c55e', '#a855f7',
    '#ef4444', '#eab308', '#06b6d4', '#ec4899',
  ];

  function UtilitiesFloorWidget(floorRowEl, layoutEl) {
    this.floorRowEl    = floorRowEl;
    this.layoutEl      = layoutEl;
    this.wrapper       = null;
    this.canvas        = null;
    this.viewport      = null;
    this.overlay       = null;
    this.listPanel     = null;
    this.collapsed     = false;
    this._drawingId    = null;
    this._btnCancel    = null;
    this._modeLabel    = null;
    this._refreshTimer = null;
  }

  UtilitiesFloorWidget.prototype.mount = function () {
    var amenitiesField = this.floorRowEl.querySelector('.acf-field[data-name="amenities"]');
    if (!amenitiesField) return;

    this._buildUI();
    amenitiesField.parentNode.insertBefore(this.wrapper, amenitiesField);
    this._loadMasterplan();
    this._syncList();
    this._bindSyncWatcher();
  };

  UtilitiesFloorWidget.prototype._getFloorName = function () {
    var el = this.floorRowEl.querySelector('.acf-field[data-name="floor_name"] input');
    return (el && el.value) ? el.value : 'Tầng';
  };

  UtilitiesFloorWidget.prototype._buildUI = function () {
    var self      = this;
    var floorName = this._getFloorName();

    // Header
    var modeLabel = makeEl('span', { class: 're-pe-mode', text: '👁 Xem' });
    this._modeLabel = modeLabel;

    var btnCancel = makeEl('button', {
      type: 'button', class: 'button re-pe-btn re-pe-btn-cancel', text: '✕ Hủy vẽ',
    });
    btnCancel.style.display = 'none';
    btnCancel.addEventListener('click', function () {
      if (self.overlay) self.overlay.cancelDraw();
      self._drawingId = null;
      self._setMode('view');
    });
    this._btnCancel = btnCancel;

    var btnRefresh = makeEl('button', { type: 'button', class: 'button re-pe-btn', text: '↺ Tải lại' });
    btnRefresh.addEventListener('click', function () { self._loadMasterplan(); });

    var btnToggle = makeEl('button', { type: 'button', class: 'button re-pe-btn', text: '▼ Thu gọn' });

    var headerActions = makeEl('div', { class: 're-pe-header-actions' });
    headerActions.appendChild(modeLabel);
    headerActions.appendChild(btnCancel);
    headerActions.appendChild(btnRefresh);
    headerActions.appendChild(btnToggle);

    var headerTitle = makeEl('div', { class: 're-pe-title' });
    headerTitle.innerHTML = '<span>🗺</span> <strong>Spatial Editor</strong> — <em>' + escHtml(floorName) + '</em>';

    var header = makeEl('div', { class: 're-pe-header' });
    header.appendChild(headerTitle);
    header.appendChild(headerActions);

    // Hint
    var hint = makeEl('div', {
      class: 're-pe-hint',
      html: '💡 Chọn tiện ích → <strong>✏ Vẽ</strong>. Zoom: Ctrl+Scroll / nút +−. Sau khi zoom/pan tới vùng tầng → <strong>💾 Save Camera</strong>.',
    });

    // Canvas + viewport
    this.viewport = makeEl('div', { class: 're-pe-viewport' });
    this.canvas   = makeEl('div', { class: 're-pe-canvas', 'data-pe': 'ufw_' + Date.now() });
    this.canvas.appendChild(this.viewport);
    this._setPlaceholder('⏳ Đang tải masterplan…');

    // Amenity list panel
    this.listPanel = makeEl('div', { class: 're-pe-list' });

    var editorLayout = makeEl('div', { class: 're-pe-layout' });
    editorLayout.appendChild(this.canvas);
    editorLayout.appendChild(this.listPanel);

    // Camera state bar
    var btnSaveCamera = makeEl('button', {
      type: 'button', class: 'button re-cse-save-btn', text: '💾 Save Camera',
    });
    btnSaveCamera.title = 'Lưu viewport hiện tại làm camera state cho tầng này';
    var scaleLabel = makeEl('span', { class: 're-cse-scale', text: '' });
    btnSaveCamera.addEventListener('click', function (e) {
      e.preventDefault();
      self._saveCamera(scaleLabel, btnSaveCamera);
    });

    var cameraBar = makeEl('div', { class: 're-cse-bar' });
    cameraBar.appendChild(btnSaveCamera);
    cameraBar.appendChild(scaleLabel);

    // Body
    var body = makeEl('div', { class: 're-pe-body' });
    body.appendChild(hint);
    body.appendChild(editorLayout);
    body.appendChild(cameraBar);

    // Collapse toggle
    btnToggle.addEventListener('click', function () {
      self.collapsed = !self.collapsed;
      body.style.display = self.collapsed ? 'none' : '';
      btnToggle.textContent = self.collapsed ? '▶ Mở rộng' : '▼ Thu gọn';
    });

    // Wrapper
    this.wrapper = makeEl('div', {
      class: 're-polygon-editor re-utilities-editor',
      'data-pe-id': 'ufw',
    });
    this.wrapper.appendChild(header);
    this.wrapper.appendChild(body);
  };

  // ── IMAGE LOADING ──────────────────────────────────────────

  UtilitiesFloorWidget.prototype._setPlaceholder = function (msg) {
    this.viewport.innerHTML =
      '<div class="re-pe-placeholder"><p>' + escHtml(msg) + '</p></div>';
  };

  UtilitiesFloorWidget.prototype._showMasterplanPrompt = function () {
    this.viewport.innerHTML =
      '<div class="re-pe-placeholder re-pe-placeholder--upload">' +
      '<p>📤 Hãy upload <strong>ảnh masterplan</strong> vào field ' +
      '"Ảnh masterplan tiện ích" bên trên layout này.</p>' +
      '</div>';
  };

  UtilitiesFloorWidget.prototype._loadMasterplan = function () {
    var self    = this;
    var fieldEl = this.layoutEl.querySelector('.acf-field[data-name="masterplan_image"]');
    if (!fieldEl) {
      this._setPlaceholder('Không tìm thấy field "masterplan_image" trong layout');
      return;
    }

    var hidden       = fieldEl.querySelector('input[type="hidden"]');
    var attachmentId = hidden ? parseInt(hidden.value, 10) : 0;

    if (!attachmentId) {
      this._showMasterplanPrompt();
      if (hidden && !hidden.dataset.reUfwWatch) {
        hidden.dataset.reUfwWatch = '1';
        hidden.addEventListener('change', function () {
          setTimeout(function () { self._loadMasterplan(); }, 800);
        });
      }
      return;
    }

    var preview = fieldEl.querySelector('.acf-image-uploader img, .image-wrap img');
    if (preview && preview.naturalWidth > 0) {
      this._mountImage(preview.src);
      return;
    }

    if (preview && preview.getAttribute('src')) {
      this._setPlaceholder('⏳ Đang tải masterplan…');
      var onLoad = function () {
        preview.removeEventListener('load', onLoad);
        preview.removeEventListener('error', onErr);
        if (preview.naturalWidth > 0) {
          self._mountImage(preview.src);
        } else {
          self._showMasterplanPrompt();
        }
      };
      var onErr = function () {
        preview.removeEventListener('load', onLoad);
        preview.removeEventListener('error', onErr);
        self._showMasterplanPrompt();
      };
      preview.addEventListener('load', onLoad);
      preview.addEventListener('error', onErr);
      return;
    }

    this._setPlaceholder('⏳ Đang tải masterplan…');
    setTimeout(function () {
      var img2 = fieldEl.querySelector('.acf-image-uploader img, .image-wrap img');
      if (img2 && img2.getAttribute('src')) {
        self._loadMasterplan();
      } else {
        self._showMasterplanPrompt();
      }
    }, 700);
  };

  UtilitiesFloorWidget.prototype._mountImage = function (url) {
    var self = this;
    this.viewport.innerHTML = '';
    this.overlay = null;

    var img = makeEl('img', { class: 're-pe-img', src: url, draggable: false });
    img.addEventListener('load', function () {
      self.overlay = new SvgOverlay(self.viewport);

      self.overlay.on(SvgOverlay.EVT_CHANGE, function (d) {
        self._writeToACF(d.id, d.points);
      });
      self.overlay.on(SvgOverlay.EVT_DRAW_DONE, function (d) {
        self._drawingId = null;
        self._setMode('view');
        self._refreshListItem(d.id);
      });
      self.overlay.on(SvgOverlay.EVT_DRAW_CANCEL, function (d) {
        self._drawingId = null;
        self._setMode('view');
        self._refreshListItem(d.id);
      });
      self.overlay.on(SvgOverlay.EVT_POLY_CLICK, function (d) {
        self.listPanel.querySelectorAll('.re-pe-list-item').forEach(function (item) {
          item.classList.toggle('is-active', item.getAttribute('data-row-idx') === String(d.id));
        });
      });

      self._pushACFToOverlay();
    });
    img.addEventListener('error', function () {
      self._setPlaceholder('Không thể tải ảnh masterplan');
    });
    this.viewport.appendChild(img);
  };

  // ── ACF SYNC ───────────────────────────────────────────────

  UtilitiesFloorWidget.prototype._getAmenityRows = function () {
    var repFld = this.floorRowEl.querySelector('.acf-field[data-name="amenities"]');
    if (!repFld) return [];
    return Array.from(repFld.querySelectorAll('.acf-row:not(.acf-clone)'));
  };

  UtilitiesFloorWidget.prototype._pushACFToOverlay = function () {
    if (!this.overlay) return;
    var map = {};
    this._getAmenityRows().forEach(function (row, idx) {
      var polyInput  = row.querySelector('.acf-field[data-name="amenity_polygon"] textarea');
      var labelInput = row.querySelector('.acf-field[data-name="amenity_name"] input[type="text"]');
      var pts   = parsePolygonJSON(polyInput ? polyInput.value : '');
      var color = AMENITY_COLORS[idx % AMENITY_COLORS.length];
      var label = (labelInput && labelInput.value) ? labelInput.value : ('Tiện ích ' + (idx + 1));
      map[idx]  = { points: pts, color: color, label: label };
    });
    this.overlay.syncPolygons(map);
  };

  UtilitiesFloorWidget.prototype._writeToACF = function (rowIdx, points) {
    var rows = this._getAmenityRows();
    var row  = rows[rowIdx];
    if (!row) return;
    var ta = row.querySelector('.acf-field[data-name="amenity_polygon"] textarea');
    if (!ta) return;
    ta.value = points.length > 0 ? JSON.stringify({ points: points }) : '';
    ta.dispatchEvent(new Event('change', { bubbles: true }));
  };

  // ── LIST PANEL ─────────────────────────────────────────────

  UtilitiesFloorWidget.prototype._syncList = function () {
    if (!this.listPanel) return;
    var self = this;
    this.listPanel.innerHTML = '';
    var rows = this._getAmenityRows();
    if (!rows.length) {
      this.listPanel.appendChild(makeEl('p', {
        class: 're-pe-list-empty',
        html: '— Chưa có tiện ích. Thêm hàng trong repeater <em>Danh sách tiện ích</em> bên dưới.',
      }));
    } else {
      rows.forEach(function (row, idx) {
        self.listPanel.appendChild(self._buildListItem(row, idx));
      });
    }
    if (this.overlay) this._pushACFToOverlay();
    this._hidePolygonFields();
  };

  UtilitiesFloorWidget.prototype._hidePolygonFields = function () {
    this._getAmenityRows().forEach(function (row) {
      var fld = row.querySelector('.acf-field[data-name="amenity_polygon"]');
      if (fld) fld.style.display = 'none';
    });
  };

  UtilitiesFloorWidget.prototype._buildListItem = function (row, idx) {
    var self       = this;
    var polyInput  = row.querySelector('.acf-field[data-name="amenity_polygon"] textarea');
    var labelInput = row.querySelector('.acf-field[data-name="amenity_name"] input[type="text"]');

    var pts      = parsePolygonJSON(polyInput ? polyInput.value : '');
    var color    = AMENITY_COLORS[idx % AMENITY_COLORS.length];
    var label    = (labelInput && labelInput.value) ? labelInput.value : ('Tiện ích ' + (idx + 1));
    var hasPoly  = pts.length >= 3;
    var statusTx = hasPoly ? ('✓ ' + pts.length + ' đỉnh') : '— chưa vẽ';

    var item = makeEl('div', {
      class: 're-pe-list-item' + (hasPoly ? ' has-poly' : ''),
      'data-row-idx': idx,
    });

    var swatch = makeEl('span', { class: 're-pe-swatch' });
    swatch.style.background = color;

    var info = makeEl('div', { class: 're-pe-list-info' });
    info.innerHTML =
      '<strong>' + escHtml(label) + '</strong>' +
      '<span class="re-pe-status">' + statusTx + '</span>';

    var btnDraw = makeEl('button', {
      type: 'button', class: 'button button-small re-pe-btn-draw', text: '✏ Vẽ',
    });
    btnDraw.title = 'Vẽ polygon cho tiện ích này';
    btnDraw.addEventListener('click', function (e) {
      e.preventDefault();
      if (!self.overlay) { alert('Hãy upload ảnh masterplan trước khi vẽ'); return; }
      var currentLabel = (labelInput && labelInput.value) ? labelInput.value : ('Tiện ích ' + (idx + 1));
      var currentColor = AMENITY_COLORS[idx % AMENITY_COLORS.length];
      self._drawingId = idx;
      self.overlay.startDraw(idx, currentColor, currentLabel);
      self._setMode('draw');
      self._pushACFToOverlay();
      self.canvas.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      self.listPanel.querySelectorAll('.re-pe-list-item').forEach(function (li) {
        li.classList.toggle('is-active', li.getAttribute('data-row-idx') === String(idx));
      });
    });

    var btnClear = makeEl('button', {
      type: 'button', class: 'button button-small re-pe-btn-clear', text: '🗑',
    });
    btnClear.title = 'Xóa polygon này';
    btnClear.addEventListener('click', function (e) {
      e.preventDefault();
      if (!confirm('Xóa polygon của "' + label + '"?')) return;
      if (self.overlay) self.overlay.clearPolygon(idx);
      self._writeToACF(idx, []);
      self._refreshListItem(idx);
    });

    var actions = makeEl('div', { class: 're-pe-list-actions' });
    actions.appendChild(btnDraw);
    actions.appendChild(btnClear);

    item.appendChild(swatch);
    item.appendChild(info);
    item.appendChild(actions);
    return item;
  };

  UtilitiesFloorWidget.prototype._refreshListItem = function (rowIdx) {
    var rows = this._getAmenityRows();
    var row  = rows[rowIdx];
    if (!row) return;
    var item = this.listPanel.querySelector('.re-pe-list-item[data-row-idx="' + rowIdx + '"]');
    if (!item) return;
    var polyInput = row.querySelector('.acf-field[data-name="amenity_polygon"] textarea');
    var pts       = parsePolygonJSON(polyInput ? polyInput.value : '');
    var hasPoly   = pts.length >= 3;
    var statusEl  = item.querySelector('.re-pe-status');
    if (statusEl) statusEl.textContent = hasPoly ? ('✓ ' + pts.length + ' đỉnh') : '— chưa vẽ';
    item.classList.toggle('has-poly', hasPoly);
  };

  // ── MODE HELPERS ───────────────────────────────────────────

  UtilitiesFloorWidget.prototype._setMode = function (mode) {
    if (this._modeLabel) {
      this._modeLabel.textContent = mode === 'draw' ? '✏ Đang vẽ…' : '👁 Xem';
      this._modeLabel.style.color = mode === 'draw' ? '#f97316' : '';
    }
    if (this._btnCancel) {
      this._btnCancel.style.display = mode === 'draw' ? '' : 'none';
    }
  };

  // ── CAMERA STATE SAVE ──────────────────────────────────────

  UtilitiesFloorWidget.prototype._saveCamera = function (scaleLabel, btnSave) {
    // Read viewport state exposed by viewport-editor.js via canvas dataset
    var veStateRaw = this.canvas.dataset.veState;
    var sc = 1, tx = 0, ty = 0;
    if (veStateRaw) {
      try {
        var st = JSON.parse(veStateRaw);
        sc = st.sc || 1;
        tx = st.tx || 0;
        ty = st.ty || 0;
      } catch (e) { /* ignore */ }
    }

    // Compute center of visible area as % of canvas dimensions
    var cW   = this.canvas.offsetWidth  || 1;
    var cH   = this.canvas.offsetHeight || 1;
    // Point on the unscaled image currently at canvas center
    var cx   = (cW / 2 - tx) / sc;
    var cy   = (cH / 2 - ty) / sc;

    var state = {
      scale: Math.round(sc * 100) / 100,
      x    : Math.round((cx / cW) * 1000) / 10,
      y    : Math.round((cy / cH) * 1000) / 10,
    };

    var ta = this.floorRowEl.querySelector('.acf-field[data-name="camera_state"] textarea');
    if (ta) {
      ta.value = JSON.stringify(state);
      ta.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (scaleLabel) {
      scaleLabel.textContent =
        'Scale: ' + state.scale + 'x | X: ' + state.x + '% | Y: ' + state.y + '%';
    }
    if (btnSave) {
      btnSave.textContent = '✓ Đã lưu';
      setTimeout(function () { btnSave.textContent = '💾 Save Camera'; }, 1800);
    }
  };

  // ── SYNC WATCHER ───────────────────────────────────────────

  UtilitiesFloorWidget.prototype._bindSyncWatcher = function () {
    var self   = this;
    var repFld = this.floorRowEl.querySelector('.acf-field[data-name="amenities"]');
    if (repFld) {
      repFld.addEventListener('input', function (e) {
        var fld = e.target.closest('.acf-field');
        if (!fld) return;
        var name = fld.dataset.name;
        if (name !== 'amenity_name') return;
        clearTimeout(self._refreshTimer);
        self._refreshTimer = setTimeout(function () {
          self._syncList();
          if (self.overlay) self._pushACFToOverlay();
        }, 400);
      });
    }

    // Update title when floor_name changes
    var nameInput = this.floorRowEl.querySelector('.acf-field[data-name="floor_name"] input');
    if (nameInput) {
      nameInput.addEventListener('input', function () {
        var titleEl = self.wrapper.querySelector('.re-pe-title em');
        if (titleEl) titleEl.textContent = nameInput.value || 'Tầng';
      });
    }
  };

  UtilitiesFloorWidget.prototype.syncAll = function () {
    if (!this.listPanel) return;
    this._syncList();
    if (this.overlay) this._pushACFToOverlay();
  };


  // ── BOOTSTRAP ─────────────────────────────────────────────────

  function initUtilities() {
    document.querySelectorAll('[data-layout="utilities_all_in_one"]').forEach(function (layoutEl) {
      var floorGroupsField = layoutEl.querySelector('.acf-field[data-name="floor_groups"]');
      if (!floorGroupsField) return;
      floorGroupsField.querySelectorAll('.acf-row:not(.acf-clone)').forEach(function (floorRowEl) {
        // Skip nested amenity rows — only floor_group rows contain an "amenities" sub-repeater
        if (!floorRowEl.querySelector('.acf-field[data-name="amenities"]')) return;
        if (floorRowEl.dataset.ufwInit) return;
        floorRowEl.dataset.ufwInit = '1';
        var widget = new UtilitiesFloorWidget(floorRowEl, layoutEl);
        widget.mount();
        var id = 'ufw_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
        instances[id] = widget;
      });
    });
  }

  function initPolygonEditors() {
    POLY_CONFIGS.forEach(function (cfg) {
      if (cfg.layoutName) {
        // Scoped to each flex layout container — handles layouts added after page load
        document.querySelectorAll('[data-layout="' + cfg.layoutName + '"]').forEach(function (layoutEl) {
          var flagAttr = 'data-pe-init-' + cfg.id;
          if (layoutEl.getAttribute(flagAttr)) return;
          layoutEl.setAttribute(flagAttr, '1');
          var editor = new PolygonEditor(cfg, layoutEl);
          editor.mount();
          var instKey = cfg.id + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5);
          instances[instKey] = editor;
        });
      } else {
        // Global scope — original behavior for top-level repeaters
        if (instances[cfg.id] && instances[cfg.id].wrapper) return;
        var editor = new PolygonEditor(cfg);
        editor.mount();
        instances[cfg.id] = editor;
      }
    });
  }

  function initAll() {
    initPolygonEditors();

    // Single-polygon editors (re_apartment)
    SPE_CONFIGS.forEach(function (cfg) {
      var editor = new SinglePolygonEditor(cfg);
      editor.mount();
      if (editor.wrapper) instances[cfg.id] = editor;
    });

    // Utilities spatial polygon + camera editors (page post type)
    initUtilities();
  }

  function syncAll() {
    setTimeout(function () {
      Object.keys(instances).forEach(function (id) {
        if (instances[id].syncAll) instances[id].syncAll();
      });
      // Init any newly appended floor_group rows
      initUtilities();
      // Init any newly added apartment_layout sections
      initPolygonEditors();
    }, 400);
  }

  if (typeof acf !== 'undefined') {
    acf.addAction('ready',  initAll);
    acf.addAction('append', syncAll);
    acf.addAction('remove', syncAll);
  } else {
    document.addEventListener('DOMContentLoaded', initAll);
  }

}());
