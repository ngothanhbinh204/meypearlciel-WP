/* =============================================================
   RE Viewport Picker — viewport-picker.js
   Adds zoom / pan controls to every .re-picker-canvas.
   Works in tandem with admin-hotspot-picker.js.

   Controls:
     Ctrl + Scroll     → zoom in/out
     Space + drag      → pan image
     Toolbar buttons   → zoom in/out/reset + pan toggle

   Coordinate math:
     Hotspot markers use % relative to .re-picker-viewport.
     getBoundingClientRect() on the <img> returns its SCALED
     dimensions, so HotspotPicker drag calc stays correct at
     any zoom level — no extra math needed there.
   ============================================================= */

/* global acf */
;(function () {
  'use strict';

  var ZOOM_MIN  = 0.5;
  var ZOOM_MAX  = 5;
  var ZOOM_STEP = 0.2;


  // ─────────────────────────────────────────────────────────────
  // ViewportPicker CLASS
  // ─────────────────────────────────────────────────────────────

  function ViewportPicker(canvas) {
    this.canvas    = canvas;
    this.viewport  = canvas.querySelector('.re-picker-viewport');
    if (!this.viewport) return;   // no viewport element → skip

    this.scale     = 1;
    this.panX      = 0;
    this.panY      = 0;
    this.isPanning = false;
    this.panMode   = false;       // toggle: true = pan on left-drag
    this.panStart  = { x: 0, y: 0 };
    this.scaleEl   = null;

    this._onWheel     = this._onWheel.bind(this);
    this._onKeyDown   = this._onKeyDown.bind(this);
    this._onKeyUp     = this._onKeyUp.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp   = this._onMouseUp.bind(this);

    this._buildControls();
    this._bindEvents();
  }

  // ── CONTROLS UI ──────────────────────────────────────────────

  ViewportPicker.prototype._buildControls = function () {
    var self     = this;
    var controls = document.createElement('div');
    controls.className = 're-vpc-controls';

    // Zoom In
    var btnIn = _btn('+', 'Zoom in (Ctrl+↑)');
    btnIn.addEventListener('click', function () { self._zoom(ZOOM_STEP); });

    // Scale label
    this.scaleEl = document.createElement('span');
    this.scaleEl.className = 're-vpc-scale';
    this.scaleEl.textContent = '100%';

    // Zoom Out
    var btnOut = _btn('−', 'Zoom out (Ctrl+↓)');
    btnOut.addEventListener('click', function () { self._zoom(-ZOOM_STEP); });

    // Separator
    var sep = document.createElement('div');
    sep.className = 're-vpc-separator';

    // Pan mode toggle
    var btnPan = _btn('✋', 'Bật/tắt chế độ Pan (Space+kéo)');
    btnPan.title = 'Pan mode — giữ Space hoặc bấm nút này, rồi kéo để di chuyển ảnh';
    btnPan.addEventListener('click', function () {
      self.panMode = !self.panMode;
      btnPan.classList.toggle('is-active', self.panMode);
      self.canvas.classList.toggle('vp-pan-mode', self.panMode);
    });

    // Reset
    var btnReset = _btn('⊡', 'Reset zoom & pan');
    btnReset.addEventListener('click', function () { self._reset(); });

    controls.appendChild(btnIn);
    controls.appendChild(this.scaleEl);
    controls.appendChild(btnOut);
    controls.appendChild(sep);
    controls.appendChild(btnPan);
    controls.appendChild(btnReset);

    this.canvas.appendChild(controls);
  };

  function _btn(text, title) {
    var b = document.createElement('button');
    b.type        = 'button';
    b.className   = 're-vpc-btn';
    b.textContent = text;
    b.title       = title || '';
    return b;
  }

  // ── EVENTS ───────────────────────────────────────────────────

  ViewportPicker.prototype._bindEvents = function () {
    // Ctrl+Scroll → zoom
    this.canvas.addEventListener('wheel', this._onWheel, { passive: false });

    // Space key → temporary pan mode
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup',   this._onKeyUp);

    // Mouse drag → pan (when in pan mode or Space held)
    this.canvas.addEventListener('mousedown', this._onMouseDown);
  };

  ViewportPicker.prototype._onWheel = function (e) {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    // Zoom toward cursor
    var rect  = this.viewport.getBoundingClientRect();
    var origX = (e.clientX - rect.left) / this.scale;
    var origY = (e.clientY - rect.top)  / this.scale;

    var delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
    var prevScale = this.scale;
    this.scale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, this.scale + delta));

    // Adjust pan so zoom is centered on cursor
    this.panX -= origX * (this.scale - prevScale);
    this.panY -= origY * (this.scale - prevScale);

    this._applyTransform();
  };

  ViewportPicker.prototype._onKeyDown = function (e) {
    if (e.code === 'Space' && !e.target.matches('input, textarea, select')) {
      e.preventDefault();
      if (!this.panMode) {
        this.canvas.classList.add('vp-pan-mode');
        this._spacePan = true;
      }
    }
  };

  ViewportPicker.prototype._onKeyUp = function (e) {
    if (e.code === 'Space' && this._spacePan) {
      this.canvas.classList.remove('vp-pan-mode');
      this._spacePan = false;
    }
  };

  ViewportPicker.prototype._onMouseDown = function (e) {
    // Activate pan on: pan mode active OR middle-click
    var shouldPan = (e.button === 1) ||
                    (e.button === 0 && (this.panMode || this._spacePan));
    if (!shouldPan) return;

    e.preventDefault();
    this.isPanning = true;
    this.panStart  = { x: e.clientX - this.panX, y: e.clientY - this.panY };
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseup',   this._onMouseUp);
  };

  ViewportPicker.prototype._onMouseMove = function (e) {
    if (!this.isPanning) return;
    this.panX = e.clientX - this.panStart.x;
    this.panY = e.clientY - this.panStart.y;
    this._applyTransform();
  };

  ViewportPicker.prototype._onMouseUp = function () {
    this.isPanning = false;
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup',   this._onMouseUp);
  };

  // ── TRANSFORM ────────────────────────────────────────────────

  ViewportPicker.prototype._zoom = function (delta) {
    this.scale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, this.scale + delta));
    this._applyTransform();
  };

  ViewportPicker.prototype._reset = function () {
    this.scale = 1;
    this.panX  = 0;
    this.panY  = 0;
    this._applyTransform();
  };

  ViewportPicker.prototype._applyTransform = function () {
    // Apply to viewport element (image + markers move together)
    this.viewport.style.transform =
      'translate(' + this.panX.toFixed(1) + 'px, ' + this.panY.toFixed(1) + 'px) ' +
      'scale(' + this.scale.toFixed(3) + ')';
    this.viewport.style.transformOrigin = 'top left';

    if (this.scaleEl) {
      this.scaleEl.textContent = Math.round(this.scale * 100) + '%';
    }
  };


  // ─────────────────────────────────────────────────────────────
  // BOOTSTRAP
  // Init a ViewportPicker for every .re-picker-canvas on the page.
  // Runs after HotspotPicker has mounted (ACF 'ready' + small delay).
  // ─────────────────────────────────────────────────────────────

  function initViewports() {
    // Small delay ensures HotspotPicker has already rendered its canvases
    setTimeout(function () {
      document.querySelectorAll('.re-picker-canvas').forEach(function (canvas) {
        if (!canvas.dataset.vpInit) {
          canvas.dataset.vpInit = '1';
          new ViewportPicker(canvas);
        }
      });
    }, 100);
  }

  if (typeof acf !== 'undefined') {
    acf.addAction('ready', initViewports);
  } else {
    document.addEventListener('DOMContentLoaded', initViewports);
  }

}());
