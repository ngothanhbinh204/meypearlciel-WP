/* =============================================================
   RE Viewport Editor — viewport-editor.js
   Zoom + pan controls for .re-pe-canvas / .re-pe-viewport.

   Controls:
     Ctrl + Wheel     → zoom (min 0.5×, max 5×), cursor-centred
     Space + drag     → pan
     Middle-click drag → pan
     Buttons (.re-ve-controls) → zoom in / zoom out / reset / pan toggle
   ============================================================= */

/* global acf */
;(function () {
  'use strict';

  var ZOOM_MIN  = 0.5;
  var ZOOM_MAX  = 5;
  var ZOOM_STEP = 0.15;   // multiplier per wheel tick

  // ── ViewportEditor ────────────────────────────────────────────

  function ViewportEditor(canvasEl) {
    this.canvas   = canvasEl;
    this.viewport = canvasEl.querySelector('.re-pe-viewport');
    if (!this.viewport) return;

    this.tx = 0;   // translate X (px)
    this.ty = 0;   // translate Y (px)
    this.sc = 1;   // scale

    this._panMode  = false;
    this._spaceDown = false;
    this._dragging  = false;
    this._dragStart = null;
    this._scaleEl   = null;

    this._buildControls();
    this._bindEvents();
  }


  // ── CONTROLS UI ───────────────────────────────────────────────

  ViewportEditor.prototype._buildControls = function () {
    var self = this;

    var wrap = document.createElement('div');
    wrap.className = 're-ve-controls';

    // Zoom in
    var btnIn = _btn('+', 'Phóng to (Ctrl+Scroll)');
    btnIn.addEventListener('click', function () { self._zoom(ZOOM_STEP, null); });

    // Scale display
    var scaleEl = document.createElement('span');
    scaleEl.className = 're-ve-scale';
    scaleEl.textContent = '100%';
    this._scaleEl = scaleEl;

    // Zoom out
    var btnOut = _btn('−', 'Thu nhỏ (Ctrl+Scroll)');
    btnOut.addEventListener('click', function () { self._zoom(-ZOOM_STEP, null); });

    // Separator
    var sep = document.createElement('span');
    sep.className = 're-ve-sep';

    // Reset
    var btnReset = _btn('⌂', 'Đặt lại (zoom 100%)');
    btnReset.addEventListener('click', function () { self._reset(); });

    // Pan toggle
    var btnPan = _btn('✥', 'Bật/tắt chế độ kéo');
    btnPan.addEventListener('click', function () {
      self._panMode = !self._panMode;
      btnPan.classList.toggle('is-active', self._panMode);
      self.canvas.style.cursor = self._panMode ? 'grab' : '';
    });
    this._btnPan = btnPan;

    wrap.appendChild(btnIn);
    wrap.appendChild(scaleEl);
    wrap.appendChild(btnOut);
    wrap.appendChild(sep);
    wrap.appendChild(btnReset);
    wrap.appendChild(btnPan);

    this.canvas.appendChild(wrap);
  };

  function _btn(txt, title) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 're-ve-btn';
    b.textContent = txt;
    b.title = title || '';
    return b;
  }


  // ── EVENTS ────────────────────────────────────────────────────

  ViewportEditor.prototype._bindEvents = function () {
    var self = this;

    // Ctrl + Wheel → zoom
    this.canvas.addEventListener('wheel', function (e) {
      if (!e.ctrlKey) return;
      e.preventDefault();
      var delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      self._zoom(delta, e);
    }, { passive: false });

    // Mouse-down → start pan (middle button or pan-mode active)
    this.canvas.addEventListener('mousedown', function (e) {
      var isPanBtn  = e.button === 1;                   // middle click
      var isPanMode = self._panMode || self._spaceDown; // pan toggle / spacebar
      if (!isPanBtn && !isPanMode) return;
      if (e.button === 1) e.preventDefault();           // prevent default scroll

      self._dragging  = true;
      self._dragStart = { x: e.clientX - self.tx, y: e.clientY - self.ty };
      self.canvas.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', function (e) {
      if (!self._dragging) return;
      self.tx = e.clientX - self._dragStart.x;
      self.ty = e.clientY - self._dragStart.y;
      self._applyTransform();
    });

    document.addEventListener('mouseup', function () {
      if (!self._dragging) return;
      self._dragging = false;
      self.canvas.style.cursor = self._panMode ? 'grab' : '';
    });

    // Space bar → temporary pan mode
    document.addEventListener('keydown', function (e) {
      if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT' &&
          document.activeElement.tagName !== 'TEXTAREA') {
        if (!self._spaceDown) {
          self._spaceDown = true;
          self.canvas.style.cursor = 'grab';
        }
        e.preventDefault();
      }
    });

    document.addEventListener('keyup', function (e) {
      if (e.code === 'Space') {
        self._spaceDown = false;
        if (!self._panMode) self.canvas.style.cursor = '';
      }
    });

    // Prevent context-menu on middle-click release inside canvas
    this.canvas.addEventListener('contextmenu', function (e) {
      if (self._dragging) e.preventDefault();
    });
  };


  // ── ZOOM / PAN HELPERS ────────────────────────────────────────

  /**
   * @param {number}      delta  fractional zoom delta (+/- ZOOM_STEP)
   * @param {MouseEvent|null} e  null = zoom-to-centre
   */
  ViewportEditor.prototype._zoom = function (delta, e) {
    var prevSc = this.sc;
    var nextSc = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, this.sc + delta));
    if (nextSc === prevSc) return;

    // Zoom towards cursor position (or canvas centre if no event)
    var r   = this.canvas.getBoundingClientRect();
    var cx  = e ? (e.clientX - r.left)  : r.width  / 2;
    var cy  = e ? (e.clientY - r.top)   : r.height / 2;

    // Adjust translate so the cursor stays in place
    this.tx = cx - (cx - this.tx) * (nextSc / prevSc);
    this.ty = cy - (cy - this.ty) * (nextSc / prevSc);

    this.sc = nextSc;
    this._applyTransform();
  };

  ViewportEditor.prototype._reset = function () {
    this.tx = 0; this.ty = 0; this.sc = 1;
    this._applyTransform();
  };

  ViewportEditor.prototype._applyTransform = function () {
    this.viewport.style.transform =
      'translate(' + this.tx + 'px, ' + this.ty + 'px) scale(' + this.sc + ')';
    if (this._scaleEl) {
      this._scaleEl.textContent = Math.round(this.sc * 100) + '%';
    }
    // Expose state on canvas for UtilitiesFloorWidget camera-save
    this.canvas.dataset.veState = JSON.stringify({ sc: this.sc, tx: this.tx, ty: this.ty });
  };


  // ── BOOTSTRAP ─────────────────────────────────────────────────

  function initAll() {
    setTimeout(function () {
      document.querySelectorAll('.re-pe-canvas').forEach(function (canvas) {
        if (canvas.dataset.veInit) return;
        canvas.dataset.veInit = '1';
        new ViewportEditor(canvas);
      });
    }, 300);  // slight delay so polygon-editor.js mounts first
  }

  // Re-run for any new canvases added after ACF append
  function checkNew() {
    setTimeout(function () {
      document.querySelectorAll('.re-pe-canvas:not([data-ve-init])').forEach(function (canvas) {
        canvas.dataset.veInit = '1';
        new ViewportEditor(canvas);
      });
    }, 400);
  }

  if (typeof acf !== 'undefined') {
    acf.addAction('ready',  initAll);
    acf.addAction('append', checkNew);
  } else {
    document.addEventListener('DOMContentLoaded', initAll);
  }

}());
