/* =============================================================
   SVG Overlay Engine — svg-overlay-engine.js
   Pure SVG polygon management layer over an image viewport.
   No ACF knowledge — just SVG rendering and interaction.

   Coordinate system:
     viewBox="0 0 100 100" + preserveAspectRatio="none"
     → every coordinate IS a percentage (0–100) of image size.
     getBoundingClientRect() on the SVG handles zoom/pan transforms
     transparently, so caller needs no extra math.

   API:
     new SvgOverlay(viewportEl)
     .syncPolygons({ id: {points, color, label} })
     .startDraw(id, color, label)  → enter draw mode
     .cancelDraw()
     .clearPolygon(id)
     .setActive(id)
     .on(EVT, callback)

   Events:
     SvgOverlay.EVT_CHANGE      { id, points }   — on every vertex change
     SvgOverlay.EVT_DRAW_DONE   { id, points }   — polygon closed
     SvgOverlay.EVT_DRAW_CANCEL { id }
     SvgOverlay.EVT_POLY_CLICK  { id }
   ============================================================= */

/* exported SvgOverlay */
;(function (global) {
  'use strict';

  var NS             = 'http://www.w3.org/2000/svg';
  var SNAP_DIST      = 3;    // % units — distance to snap-close polygon on first vertex
  var MIN_POLY_PTS   = 3;    // minimum vertices to keep a polygon valid
  var BASE_VERTEX_R  = 1.0;  // SVG user-unit radius at 1× zoom

  // ── HELPERS ───────────────────────────────────────────────────

  function ns(tag) { return document.createElementNS(NS, tag); }

  function ptsStr(pts) {
    return pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' ');
  }

  function ptDist(a, b) {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
  }

  function centroid(pts) {
    var cx = pts.reduce(function (s, p) { return s + p[0]; }, 0) / pts.length;
    var cy = pts.reduce(function (s, p) { return s + p[1]; }, 0) / pts.length;
    return [+cx.toFixed(2), +cy.toFixed(2)];
  }

  function hexRgba(hex, a) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#f97316');
    if (!m) return 'rgba(249,115,22,' + a + ')';
    return 'rgba(' + parseInt(m[1], 16) + ',' + parseInt(m[2], 16) + ',' + parseInt(m[3], 16) + ',' + a + ')';
  }

  function setAttrs(el, map) {
    Object.keys(map).forEach(function (k) { el.setAttribute(k, map[k]); });
  }


  // ── SVGOVERLAY ────────────────────────────────────────────────

  /**
   * @param {HTMLElement} viewportEl  Must have position:relative.
   *                                  The img element should already be a child.
   */
  function SvgOverlay(viewportEl) {
    this.viewport    = viewportEl;
    this.svg         = null;
    this._fills      = null;   // <g> layer: background fills (non-active polygons)
    this._strokes    = null;   // <g> layer: outlines + labels
    this._active     = null;   // <g> layer: vertex handles + active shape
    this._polygons   = {};     // { id: { points[], color, label, closed } }
    this._activeId   = null;
    this._isDrawing  = false;
    this._guideLine  = null;
    this._listeners  = {};
    this._vertexR    = BASE_VERTEX_R;

    this._onSvgClick    = this._onSvgClick.bind(this);
    this._onSvgMove     = this._onSvgMove.bind(this);
    this._onSvgCtxMenu  = this._onSvgCtxMenu.bind(this);

    this._init();
  }

  SvgOverlay.EVT_CHANGE      = 'change';
  SvgOverlay.EVT_DRAW_DONE   = 'draw-done';
  SvgOverlay.EVT_DRAW_CANCEL = 'draw-cancel';
  SvgOverlay.EVT_POLY_CLICK  = 'poly-click';


  // ── INIT ──────────────────────────────────────────────────────

  SvgOverlay.prototype._init = function () {
    var svg = ns('svg');
    setAttrs(svg, {
      'class'              : 're-poly-svg',
      'viewBox'            : '0 0 100 100',
      'preserveAspectRatio': 'none',
      'xmlns'              : NS,
    });

    this._fills   = ns('g'); this._fills.setAttribute('class',   'rp-fills');
    this._strokes = ns('g'); this._strokes.setAttribute('class', 'rp-strokes');
    this._active  = ns('g'); this._active.setAttribute('class',  'rp-active');

    svg.appendChild(this._fills);
    svg.appendChild(this._strokes);
    svg.appendChild(this._active);

    svg.addEventListener('click',       this._onSvgClick);
    svg.addEventListener('mousemove',   this._onSvgMove);
    svg.addEventListener('contextmenu', this._onSvgCtxMenu);

    this.viewport.appendChild(svg);
    this.svg = svg;
  };


  // ── COORDINATE CONVERSION ─────────────────────────────────────

  SvgOverlay.prototype._toCoords = function (e) {
    var r = this.svg.getBoundingClientRect();
    var x = +( Math.max(0, Math.min(100, (e.clientX - r.left) / r.width  * 100)).toFixed(2) );
    var y = +( Math.max(0, Math.min(100, (e.clientY - r.top)  / r.height * 100)).toFixed(2) );
    return [x, y];
  };


  // ── PUBLIC API ────────────────────────────────────────────────

  /**
   * Replace all polygon data from a map { id → { points, color, label } }.
   * Removes polygons not present in the new map.
   */
  SvgOverlay.prototype.syncPolygons = function (map) {
    var self = this;
    // Prune removed ids
    Object.keys(this._polygons).forEach(function (id) {
      if (!(id in map)) delete self._polygons[id];
    });
    // Add / update
    Object.keys(map).forEach(function (id) {
      var d = map[id];
      var pts = d.points || [];
      self._polygons[id] = {
        points : pts,
        color  : d.color || '#f97316',
        label  : d.label || ('Polygon ' + id),
        closed : pts.length >= MIN_POLY_PTS,
      };
    });
    // Validate active
    if (this._activeId !== null && !(this._activeId in this._polygons)) {
      this._activeId = null; this._isDrawing = false;
    }
    this._render();
  };

  /** Set active polygon (select mode, show vertex handles). */
  SvgOverlay.prototype.setActive = function (id) {
    this._activeId  = id;
    this._isDrawing = false;
    this._render();
    this._emit(SvgOverlay.EVT_POLY_CLICK, { id: id });
  };

  /** Enter draw mode for a polygon id (clears existing points). */
  SvgOverlay.prototype.startDraw = function (id, color, label) {
    var existing = this._polygons[id] || {};
    this._polygons[id] = {
      points : [],
      color  : color  || existing.color  || '#f97316',
      label  : label  || existing.label  || ('Polygon ' + id),
      closed : false,
    };
    this._activeId  = id;
    this._isDrawing = true;
    this._render();
  };

  /** Cancel current draw operation (clear in-progress points). */
  SvgOverlay.prototype.cancelDraw = function () {
    var id = this._activeId;
    if (this._isDrawing && id !== null && this._polygons[id]) {
      this._polygons[id].points = [];
    }
    this._isDrawing = false;
    this._render();
    this._emit(SvgOverlay.EVT_DRAW_CANCEL, { id: id });
  };

  /** Remove all vertices from a polygon (keep the polygon object). */
  SvgOverlay.prototype.clearPolygon = function (id) {
    if (this._polygons[id]) {
      this._polygons[id].points = [];
      this._polygons[id].closed = false;
    }
    if (this._activeId === id) this._isDrawing = false;
    this._render();
    this._emit(SvgOverlay.EVT_CHANGE, { id: id, points: [] });
  };

  /** Remove a polygon entirely. */
  SvgOverlay.prototype.removePolygon = function (id) {
    delete this._polygons[id];
    if (this._activeId === id) { this._activeId = null; this._isDrawing = false; }
    this._render();
  };


  // ── EVENT SUBSCRIPTION ────────────────────────────────────────

  SvgOverlay.prototype.on = function (evt, cb) {
    if (!this._listeners[evt]) this._listeners[evt] = [];
    this._listeners[evt].push(cb);
    return this;
  };

  SvgOverlay.prototype._emit = function (evt, data) {
    (this._listeners[evt] || []).forEach(function (cb) { cb(data); });
  };


  // ── RENDERING ─────────────────────────────────────────────────

  SvgOverlay.prototype._render = function () {
    this._renderFills();
    this._renderStrokes();
    this._renderActiveLayer();
    this.svg.style.cursor = this._isDrawing ? 'crosshair' : 'default';
  };

  SvgOverlay.prototype._renderFills = function () {
    var self = this;
    this._fills.innerHTML = '';
    Object.keys(this._polygons).forEach(function (id) {
      var p = self._polygons[id];
      if (id === self._activeId || !p.closed || p.points.length < MIN_POLY_PTS) return;
      var el = ns('polygon');
      setAttrs(el, {
        'points'   : ptsStr(p.points),
        'fill'     : hexRgba(p.color, 0.2),
        'class'    : 'rp-poly-fill',
        'data-id'  : id,
      });
      el.style.cursor = 'pointer';
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        if (!self._isDrawing) self.setActive(id);
      });
      self._fills.appendChild(el);
    });
  };

  SvgOverlay.prototype._renderStrokes = function () {
    var self = this;
    this._strokes.innerHTML = '';
    Object.keys(this._polygons).forEach(function (id) {
      var p = self._polygons[id];
      if (id === self._activeId) return;
      if (p.points.length < 2) return;

      var shape = p.closed ? ns('polygon') : ns('polyline');
      setAttrs(shape, {
        'points'        : ptsStr(p.points),
        'fill'          : 'none',
        'stroke'        : p.color,
        'stroke-width'  : '0.4',
        'stroke-opacity': '0.85',
        'vector-effect' : 'non-scaling-stroke',
        'class'         : 'rp-poly-stroke',
        'data-id'       : id,
      });
      shape.style.cursor = 'pointer';
      shape.addEventListener('click', function (e) {
        e.stopPropagation();
        if (!self._isDrawing) self.setActive(id);
      });
      self._strokes.appendChild(shape);

      // Label centroid
      if (p.closed && p.points.length >= MIN_POLY_PTS) {
        var c = centroid(p.points);
        var t = ns('text');
        setAttrs(t, {
          'x': c[0], 'y': c[1],
          'class'             : 'rp-poly-label',
          'text-anchor'       : 'middle',
          'dominant-baseline' : 'middle',
          'vector-effect'     : 'non-scaling-stroke',
          'pointer-events'    : 'none',
        });
        t.textContent = p.label;
        self._strokes.appendChild(t);
      }
    });
  };

  SvgOverlay.prototype._renderActiveLayer = function () {
    var self = this;
    this._active.innerHTML = '';
    this._guideLine = null;
    if (this._activeId === null) return;

    var p   = this._polygons[this._activeId];
    if (!p) return;
    var pts = p.points;

    // ── Active shape ──────────────────────────────────────────
    if (pts.length >= MIN_POLY_PTS) {
      var shape = p.closed ? ns('polygon') : ns('polyline');
      setAttrs(shape, {
        'points'       : ptsStr(pts),
        'fill'         : p.closed ? hexRgba(p.color, 0.35) : 'none',
        'stroke'       : p.color,
        'stroke-width' : '0.5',
        'vector-effect': 'non-scaling-stroke',
        'class'        : 'rp-active-shape',
        'pointer-events': 'none',
      });
      this._active.appendChild(shape);
    } else if (pts.length === 2) {
      var ln = ns('line');
      setAttrs(ln, {
        'x1': pts[0][0], 'y1': pts[0][1],
        'x2': pts[1][0], 'y2': pts[1][1],
        'stroke': p.color, 'stroke-width': '0.5',
        'vector-effect': 'non-scaling-stroke',
        'pointer-events': 'none',
      });
      this._active.appendChild(ln);
    }

    // ── Guide line (while drawing) ─────────────────────────────
    if (this._isDrawing && pts.length > 0) {
      var gl = ns('line');
      var lp = pts[pts.length - 1];
      setAttrs(gl, {
        'class'           : 'rp-guide',
        'x1': lp[0], 'y1': lp[1],
        'x2': lp[0], 'y2': lp[1],
        'stroke'          : p.color,
        'stroke-width'    : '0.4',
        'stroke-dasharray': '1 0.5',
        'vector-effect'   : 'non-scaling-stroke',
        'pointer-events'  : 'none',
      });
      this._active.appendChild(gl);
      this._guideLine = gl;
    }

    // ── Vertex handles ────────────────────────────────────────
    pts.forEach(function (pt, idx) {
      var isFirst  = (idx === 0);
      var canClose = isFirst && self._isDrawing && pts.length >= MIN_POLY_PTS;

      var c = ns('circle');
      setAttrs(c, {
        'cx'            : pt[0],
        'cy'            : pt[1],
        'r'             : String(self._vertexR),
        'class'         : 're-poly-vertex' + (canClose ? ' can-close' : ''),
        'data-idx'      : idx,
        'vector-effect' : 'non-scaling-stroke',
      });
      c.style.fill        = canClose ? '#22c55e' : p.color;
      c.style.stroke      = '#fff';
      c.style.strokeWidth = '0.3px';
      c.style.cursor      = self._isDrawing ? (canClose ? 'cell' : 'crosshair') : 'grab';

      // Right-click = remove vertex (edit mode only)
      c.addEventListener('contextmenu', function (e) {
        e.preventDefault(); e.stopPropagation();
        if (!self._isDrawing) self._removeVertex(idx);
      });

      // Mouse-down = drag (edit mode only)
      c.addEventListener('mousedown', function (e) {
        if (e.button !== 0 || self._isDrawing) return;
        e.preventDefault(); e.stopPropagation();
        self._startDrag(idx);
      });

      self._active.appendChild(c);
    });

    // ── Active polygon label ───────────────────────────────────
    if (pts.length >= MIN_POLY_PTS) {
      var ctr = centroid(pts);
      var lbl = ns('text');
      setAttrs(lbl, {
        'x': ctr[0], 'y': ctr[1],
        'class'             : 'rp-poly-label rp-label-active',
        'text-anchor'       : 'middle',
        'dominant-baseline' : 'middle',
        'vector-effect'     : 'non-scaling-stroke',
        'pointer-events'    : 'none',
      });
      lbl.textContent = p.label;
      this._active.appendChild(lbl);
    }
  };


  // ── SVG EVENT HANDLERS ────────────────────────────────────────

  SvgOverlay.prototype._onSvgClick = function (e) {
    if (e.button !== 0) return;

    // Click on bare SVG (not a polygon) → deactivate
    if (e.target === this.svg && !this._isDrawing) {
      this._activeId = null;
      this._render();
      return;
    }
    if (!this._isDrawing) return;

    var p = this._polygons[this._activeId];
    if (!p) return;

    var coords = this._toCoords(e);

    // Snap-close: near first vertex + 3+ existing points
    if (p.points.length >= MIN_POLY_PTS) {
      if (ptDist(coords, p.points[0]) < SNAP_DIST) {
        p.closed    = true;
        this._isDrawing = false;
        this._render();
        this._emit(SvgOverlay.EVT_DRAW_DONE,  { id: this._activeId, points: p.points });
        this._emit(SvgOverlay.EVT_CHANGE,     { id: this._activeId, points: p.points });
        return;
      }
    }

    // Add vertex
    p.points.push(coords);
    this._render();
    this._emit(SvgOverlay.EVT_CHANGE, { id: this._activeId, points: p.points });
  };

  SvgOverlay.prototype._onSvgMove = function (e) {
    if (!this._isDrawing || !this._guideLine) return;
    var coords = this._toCoords(e);
    this._guideLine.setAttribute('x2', coords[0]);
    this._guideLine.setAttribute('y2', coords[1]);

    // Snap highlight: first vertex turns green when cursor is close enough
    var p = this._polygons[this._activeId];
    if (p && p.points.length >= MIN_POLY_PTS) {
      var firstV = this._active.querySelector('.re-poly-vertex[data-idx="0"]');
      if (firstV) {
        if (ptDist(coords, p.points[0]) < SNAP_DIST) {
          firstV.setAttribute('r', '2.5'); firstV.style.fill = '#22c55e';
        } else {
          firstV.setAttribute('r', '1.5'); firstV.style.fill = p.color;
        }
      }
    }
  };

  SvgOverlay.prototype._onSvgCtxMenu = function (e) {
    if (!this._isDrawing) return;
    e.preventDefault();
    // Undo last vertex
    var p = this._polygons[this._activeId];
    if (p && p.points.length > 0) {
      p.points.pop();
      this._render();
    }
  };


  // ── VERTEX DRAG ───────────────────────────────────────────────

  SvgOverlay.prototype._startDrag = function (idx) {
    var self = this;
    var p    = this._polygons[this._activeId];
    if (!p) return;

    this.svg.classList.add('dragging');

    var onMove = function (e) {
      var coords = self._toCoords(e);
      p.points[idx] = coords;

      // Optimistic partial updates (avoid full re-render while dragging)
      var vx = self._active.querySelector('.re-poly-vertex[data-idx="' + idx + '"]');
      if (vx) { vx.setAttribute('cx', coords[0]); vx.setAttribute('cy', coords[1]); }

      var activeShape = self._active.querySelector('.rp-active-shape');
      if (activeShape) activeShape.setAttribute('points', ptsStr(p.points));

      var fillEl   = self._fills.querySelector('[data-id="' + self._activeId + '"]');
      if (fillEl)   fillEl.setAttribute('points', ptsStr(p.points));

      var strokeEl = self._strokes.querySelector('[data-id="' + self._activeId + '"]');
      if (strokeEl) strokeEl.setAttribute('points', ptsStr(p.points));

      self._emit(SvgOverlay.EVT_CHANGE, { id: self._activeId, points: p.points });
    };

    var onUp = function () {
      self.svg.classList.remove('dragging');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
  };


  // ── VERTEX REMOVE ─────────────────────────────────────────────

  SvgOverlay.prototype._removeVertex = function (idx) {
    var p = this._polygons[this._activeId];
    if (!p || p.points.length <= MIN_POLY_PTS) return;  // keep minimum
    p.points.splice(idx, 1);
    this._render();
    this._emit(SvgOverlay.EVT_CHANGE, { id: this._activeId, points: p.points });
  };


  /**
   * Adjust vertex radius inversely to the viewport zoom scale so that
   * vertex handles maintain a consistent on-screen size at any zoom level.
   * @param {number} sc  Current CSS transform scale (e.g. 1.0, 2.15, 0.5)
   */
  SvgOverlay.prototype.setVertexScale = function (sc) {
    var r = +(BASE_VERTEX_R / Math.max(sc, 0.05)).toFixed(3);
    this._vertexR = r;
    this.svg.querySelectorAll('.re-poly-vertex').forEach(function (c) {
      c.setAttribute('r', r);
    });
  };


  // ── EXPORT ────────────────────────────────────────────────────

  global.SvgOverlay = SvgOverlay;

}(window));
