/* =============================================================
   RE Admin Hotspot Picker — admin-hotspot-picker.js
   Visual drag-drop coordinate editor for ACF hotspot fields.

   Supports:
     • re_building  → building_hotspots (repeater) overlaid on building_master_plan
     • re_apartment → apartment_hotspot (group)  overlaid on parent floor plan (AJAX)

   Architecture:
     ACF Repeater / Group  ←→  Hidden x/y inputs
               ↕
     Visual Picker Canvas  (drag markers → sync fields)
               ↕
     Percentage Coordinates (0–100%)   ← stored, NOT pixels

   No jQuery. No React. Vanilla JS only.
   ACF Pro JS API (acf.addAction) used for lifecycle events.
   ============================================================= */

/* global acf, ajaxurl, RE_ADMIN */
;(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────
  // PICKER CONFIGURATIONS
  // Maps each target ACF field → picker behaviour
  // ─────────────────────────────────────────────────────────────
  var PICKER_CONFIGS = [
    {
      id              : 'building_hotspots_picker',
      title           : 'Masterplan Hotspot Picker',
      description     : 'Kéo marker để đặt vị trí hotspot tòa nhà trên ảnh masterplan',
      imageSourceType : 'field',
      imageFieldName  : 'building_master_plan',
      type            : 'repeater',
      targetFieldName : 'building_hotspots',
      xField          : 'x',
      yField          : 'y',
      markerColor     : '#f97316',
    },
    {
      id              : 'apartment_hotspot_picker',
      title           : 'Floor Plan Hotspot Picker',
      description     : 'Đặt vị trí căn hộ trên sơ đồ mặt bằng tầng',
      imageSourceType : 'ajax',
      parentFloorField: 'parent_floor',
      type            : 'group',
      targetFieldName : 'apartment_hotspot',
      xField          : 'x',
      yField          : 'y',
      markerColor     : '#3b82f6',
    },
  ];

  // Global registry — needed for ACF append/remove events
  var instances = {};


  // ─────────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────────

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function toPct(v) { return parseFloat(parseFloat(v).toFixed(2)); }

  function el(tag, attrs) {
    var e = document.createElement(tag);
    if (!attrs) return e;
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (k === 'class')          { e.className   = v; }
      else if (k === 'html')      { e.innerHTML   = v; }
      else if (k === 'text')      { e.textContent = v; }
      else if (k.slice(0, 5) === 'data-') { e.setAttribute(k, v); }
      else                        { e[k] = v; }
    });
    return e;
  }


  // ─────────────────────────────────────────────────────────────
  // HOTSPOT PICKER CLASS
  // ─────────────────────────────────────────────────────────────

  function HotspotPicker(config) {
    this.config    = config;
    this.wrapper   = null;   // outer .re-hotspot-picker
    this.viewport  = null;   // inner .re-picker-viewport (transform target)
    this.imgEl     = null;   // <img>
    this.dragging  = null;   // { marker, fieldCtx }
    this.collapsed = false;

    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp   = this._onMouseUp.bind(this);
  }

  // ── MOUNT ────────────────────────────────────────────────────

  HotspotPicker.prototype.mount = function () {
    var anchor = this._anchor();
    if (!anchor) return;

    this._buildUI();
    anchor.parentNode.insertBefore(this.wrapper, anchor);
    this._loadImage();
    this._bindFieldSync();
  };

  HotspotPicker.prototype._anchor = function () {
    return document.querySelector('.acf-field[data-name="' + this.config.targetFieldName + '"]');
  };


  // ── BUILD UI ─────────────────────────────────────────────────

  HotspotPicker.prototype._buildUI = function () {
    var self = this;
    var cfg  = this.config;

    // Viewport (image + markers live here — transform applied by viewport-picker)
    this.viewport = el('div', { class: 're-picker-viewport' });
    this._setPlaceholder('⏳ Đang tải ảnh…');

    // Canvas (clip container, receives viewport-picker zoom/pan)
    var canvas = el('div', { class: 're-picker-canvas', 'data-picker': cfg.id });
    canvas.appendChild(this.viewport);
    this.canvas = canvas;

    // Hint bar
    var hint = el('div', {
      class: 're-picker-hint',
      html : '💡 <strong>Kéo</strong> marker để đặt vị trí — tọa độ <code>x/y</code> tự động cập nhật. ' +
             'Dùng <kbd>Ctrl</kbd>+cuộn chuột để zoom | <kbd>Space</kbd>+kéo để pan.',
    });

    // Body
    var body = el('div', { class: 're-picker-body' });
    body.appendChild(hint);
    body.appendChild(canvas);

    // Header buttons
    var btnRefresh = el('button', { type: 'button', class: 'button re-btn', text: '↺ Làm mới' });
    btnRefresh.addEventListener('click', function () { self._loadImage(); });

    var btnToggle = el('button', { type: 'button', class: 'button re-btn', text: '▼ Thu gọn' });
    btnToggle.addEventListener('click', function () {
      self.collapsed     = !self.collapsed;
      body.style.display = self.collapsed ? 'none' : '';
      btnToggle.textContent = self.collapsed ? '▶ Mở rộng' : '▼ Thu gọn';
    });

    // Header
    var headerTitle = el('div', {
      class: 're-picker-title',
      html : '<span class="re-picker-icon">📍</span> <strong>' + cfg.title + '</strong>' +
             '<em>' + cfg.description + '</em>',
    });
    var headerActions = el('div', { class: 're-picker-actions' });
    headerActions.appendChild(btnRefresh);
    headerActions.appendChild(btnToggle);

    var header = el('div', { class: 're-picker-header' });
    header.appendChild(headerTitle);
    header.appendChild(headerActions);

    // Wrapper
    this.wrapper = el('div', { class: 're-hotspot-picker', 'data-picker-id': cfg.id });
    this.wrapper.appendChild(header);
    this.wrapper.appendChild(body);
  };

  HotspotPicker.prototype._setPlaceholder = function (text) {
    this.viewport.innerHTML = '<div class="re-picker-placeholder"><span>' + text + '</span></div>';
    this.imgEl = null;
  };


  // ── IMAGE LOADING ────────────────────────────────────────────

  HotspotPicker.prototype._loadImage = function () {
    if (this.config.imageSourceType === 'field') {
      this._loadFromField(this.config.imageFieldName);
    } else {
      this._loadFromParentFloor();
    }
  };

  HotspotPicker.prototype._loadFromField = function (fieldName) {
    var self    = this;
    var fieldEl = document.querySelector('.acf-field[data-name="' + fieldName + '"]');
    if (!fieldEl) { this._setPlaceholder('Không tìm thấy trường "' + fieldName + '"'); return; }

    // ACF image field renders a preview <img> after upload
    var preview = fieldEl.querySelector('.acf-image-uploader img, .image-wrap img');
    if (preview && preview.src && preview.src.indexOf('blank.gif') === -1 && preview.naturalWidth > 0) {
      this._setImage(preview.src);
      return;
    }

    this._setPlaceholder('Upload ảnh "' + fieldName + '" để kích hoạt picker');

    // Watch hidden input change (attachment ID written when image uploaded)
    var hidden = fieldEl.querySelector('input[type="hidden"]');
    if (hidden && !hidden.dataset.reWatch) {
      hidden.dataset.reWatch = '1';
      hidden.addEventListener('change', function () {
        setTimeout(function () { self._loadFromField(fieldName); }, 600);
      });
    }
  };

  HotspotPicker.prototype._loadFromParentFloor = function () {
    var self     = this;
    var fieldEl  = document.querySelector('.acf-field[data-name="' + this.config.parentFloorField + '"]');
    if (!fieldEl) { this._setPlaceholder('Không tìm thấy trường "parent_floor"'); return; }

    // ACF post_object uses Select2 — hidden input holds selected post ID
    var floorId = '';
    var select  = fieldEl.querySelector('select');
    if (select) floorId = select.value;

    if (!floorId || floorId === '0' || floorId === '') {
      this._setPlaceholder('Chọn "Thuộc tầng" để tải floor plan');
      if (select && !select.dataset.reWatch) {
        select.dataset.reWatch = '1';
        select.addEventListener('change', function () { self._loadFromParentFloor(); });
      }
      return;
    }

    this._setPlaceholder('⏳ Đang tải floor plan…');

    var form = new FormData();
    form.append('action', 're_get_floor_image');
    form.append('floor_id', floorId);
    form.append('nonce', (window.RE_ADMIN && window.RE_ADMIN.nonce) || '');

    fetch(ajaxurl, { method: 'POST', body: form })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.success && res.data && res.data.url) {
          self._setImage(res.data.url);
        } else {
          self._setPlaceholder('Tầng này chưa có ảnh floor plan — hãy upload tại post "Tầng"');
        }
      })
      .catch(function () { self._setPlaceholder('Lỗi kết nối khi tải floor plan'); });

    if (select && !select.dataset.reWatch) {
      select.dataset.reWatch = '1';
      select.addEventListener('change', function () { self._loadFromParentFloor(); });
    }
  };

  HotspotPicker.prototype._setImage = function (url) {
    var self = this;
    this.viewport.innerHTML = '';
    this.imgEl = el('img', { class: 're-picker-img', src: url, draggable: false });
    this.imgEl.addEventListener('load', function () { self._renderAllMarkers(); });
    this.imgEl.addEventListener('error', function () { self._setPlaceholder('Không thể tải ảnh'); });
    this.viewport.appendChild(this.imgEl);
  };


  // ── MARKERS ──────────────────────────────────────────────────

  HotspotPicker.prototype.syncMarkersFromFields = function () {
    if (!this.imgEl) return;
    this._renderAllMarkers();
  };

  HotspotPicker.prototype._renderAllMarkers = function () {
    // Remove old markers (keep img)
    var old = this.viewport.querySelectorAll('.re-hotspot-marker');
    old.forEach(function (m) { m.remove(); });

    if (this.config.type === 'repeater') {
      this._renderRepeaterMarkers();
    } else {
      this._renderGroupMarker();
    }
  };

  HotspotPicker.prototype._renderRepeaterMarkers = function () {
    var self      = this;
    var repeaterEl = document.querySelector('.acf-field[data-name="' + this.config.targetFieldName + '"]');
    if (!repeaterEl) return;

    var rows = repeaterEl.querySelectorAll('.acf-row:not(.acf-clone)');
    rows.forEach(function (row, idx) {
      var x = parseFloat(self._readSubfield(row, self.config.xField)) || 0;
      var y = parseFloat(self._readSubfield(row, self.config.yField)) || 0;
      var m = self._createMarker(idx + 1, x, y);
      m.setAttribute('data-row-index', idx);
      self._bindDrag(m, row);
      self.viewport.appendChild(m);
    });
  };

  HotspotPicker.prototype._renderGroupMarker = function () {
    var groupEl = document.querySelector('.acf-field[data-name="' + this.config.targetFieldName + '"]');
    if (!groupEl) return;

    var x = parseFloat(this._readSubfield(groupEl, this.config.xField)) || 0;
    var y = parseFloat(this._readSubfield(groupEl, this.config.yField)) || 0;
    var m = this._createMarker(1, x, y);
    m.setAttribute('data-group', '1');
    this._bindDrag(m, groupEl);
    this.viewport.appendChild(m);
  };

  HotspotPicker.prototype._createMarker = function (num, x, y) {
    var m = el('div', {
      class     : 're-hotspot-marker',
      'data-x'  : x,
      'data-y'  : y,
      'data-num': num,
    });
    m.style.left = x + '%';
    m.style.top  = y + '%';
    m.style.setProperty('--mc', this.config.markerColor);

    var pulse   = el('div',  { class: 're-m-pulse' });
    var badge   = el('span', { class: 're-m-badge',   text: String(num) });
    var tooltip = el('div',  { class: 're-m-tooltip', text: _fmtCoord(x, y) });

    m.appendChild(pulse);
    m.appendChild(badge);
    m.appendChild(tooltip);
    return m;
  };

  function _fmtCoord(x, y) {
    return 'x: ' + parseFloat(x).toFixed(1) + '%  y: ' + parseFloat(y).toFixed(1) + '%';
  }


  // ── DRAG ─────────────────────────────────────────────────────

  HotspotPicker.prototype._bindDrag = function (marker, fieldCtx) {
    var self = this;
    marker.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      self.dragging = { marker: marker, fieldCtx: fieldCtx };
      marker.classList.add('is-dragging');
      document.addEventListener('mousemove', self._onMouseMove);
      document.addEventListener('mouseup',   self._onMouseUp);
    });
  };

  HotspotPicker.prototype._onMouseMove = function (e) {
    if (!this.dragging || !this.imgEl) return;

    var rect = this.imgEl.getBoundingClientRect();
    var xPct = toPct(clamp((e.clientX - rect.left)  / rect.width  * 100, 0, 100));
    var yPct = toPct(clamp((e.clientY - rect.top)   / rect.height * 100, 0, 100));

    var m = this.dragging.marker;
    m.style.left = xPct + '%';
    m.style.top  = yPct + '%';
    m.dataset.x  = xPct;
    m.dataset.y  = yPct;

    var tt = m.querySelector('.re-m-tooltip');
    if (tt) tt.textContent = _fmtCoord(xPct, yPct);

    this._writeToFields(this.dragging.fieldCtx, xPct, yPct);
  };

  HotspotPicker.prototype._onMouseUp = function () {
    if (!this.dragging) return;
    this.dragging.marker.classList.remove('is-dragging');
    this.dragging = null;
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup',   this._onMouseUp);
  };


  // ── FIELD READ / WRITE ────────────────────────────────────────

  HotspotPicker.prototype._readSubfield = function (ctx, name) {
    var inp = ctx.querySelector('.acf-field[data-name="' + name + '"] input');
    return inp ? inp.value : '0';
  };

  HotspotPicker.prototype._writeToFields = function (ctx, x, y) {
    this._writeInput(ctx, this.config.xField, x);
    this._writeInput(ctx, this.config.yField, y);
  };

  HotspotPicker.prototype._writeInput = function (ctx, name, value) {
    var inp = ctx.querySelector('.acf-field[data-name="' + name + '"] input');
    if (!inp) return;
    inp.value = value;
    inp.dispatchEvent(new Event('input',  { bubbles: true }));
    inp.dispatchEvent(new Event('change', { bubbles: true }));
  };


  // ── BIDIRECTIONAL SYNC: manual field edit → move marker ──────

  HotspotPicker.prototype._bindFieldSync = function () {
    var self     = this;
    var targetEl = document.querySelector('.acf-field[data-name="' + this.config.targetFieldName + '"]');
    if (!targetEl) return;

    targetEl.addEventListener('input', function (e) {
      if (e.target.tagName !== 'INPUT') return;
      var acfField = e.target.closest('.acf-field');
      if (!acfField) return;
      var fname = acfField.dataset.name;
      if (fname !== self.config.xField && fname !== self.config.yField) return;

      if (self.config.type === 'repeater') {
        var row     = e.target.closest('.acf-row');
        if (!row) return;
        var rows    = Array.from(targetEl.querySelectorAll('.acf-row:not(.acf-clone)'));
        var rowIdx  = rows.indexOf(row);
        var marker  = self.viewport.querySelector('.re-hotspot-marker[data-row-index="' + rowIdx + '"]');
        if (!marker) return;
        var x = parseFloat(self._readSubfield(row, self.config.xField)) || 0;
        var y = parseFloat(self._readSubfield(row, self.config.yField)) || 0;
        marker.style.left = x + '%';
        marker.style.top  = y + '%';
        var tt = marker.querySelector('.re-m-tooltip');
        if (tt) tt.textContent = _fmtCoord(x, y);
      } else {
        var gmarker = self.viewport.querySelector('.re-hotspot-marker[data-group="1"]');
        if (!gmarker) return;
        var gx = parseFloat(self._readSubfield(targetEl, self.config.xField)) || 0;
        var gy = parseFloat(self._readSubfield(targetEl, self.config.yField)) || 0;
        gmarker.style.left = gx + '%';
        gmarker.style.top  = gy + '%';
      }
    });
  };


  // ─────────────────────────────────────────────────────────────
  // BOOTSTRAP
  // ─────────────────────────────────────────────────────────────

  function initAll() {
    PICKER_CONFIGS.forEach(function (cfg) {
      var picker = new HotspotPicker(cfg);
      picker.mount();
      instances[cfg.id] = picker;
    });
  }

  function syncAll() {
    setTimeout(function () {
      Object.keys(instances).forEach(function (id) {
        instances[id].syncMarkersFromFields();
      });
    }, 350);
  }

  if (typeof acf !== 'undefined') {
    acf.addAction('ready',  initAll);
    acf.addAction('append', syncAll);   // new repeater row added
    acf.addAction('remove', syncAll);   // repeater row removed
  } else {
    document.addEventListener('DOMContentLoaded', initAll);
  }

}());
