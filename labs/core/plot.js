/* محرك الرسم الديكارتي على Canvas
 * - شبكة متكيفة، محاور، تسميات
 * - رسم الاقترانات مع كشف الانقطاع وخطوط التقارب (لا توصل الفروع ببعضها)
 * - سحب للتحريك، عجلة/قرص للتكبير، نقاط قابلة للسحب
 * - انتقالات سلسة للعرض
 */
(function (root) {
  'use strict';
  const ML = root.ML = root.ML || {};

  function niceStep(raw) {
    const p = Math.pow(10, Math.floor(Math.log10(raw)));
    const m = raw / p;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
  }
  function cssVar(name, fb) {
    if (typeof getComputedStyle === 'undefined') return fb;
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fb;
  }

  class Plot {
    constructor(canvas, opts) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.opts = Object.assign({ equal: true, xPi: false, interactive: true, grid: true }, opts || {});
      this.view = { xmin: -10, xmax: 10, ymin: -10, ymax: 10 };
      this.handles = [];
      this.onChange = null; // يُستدعى عند تغيّر العرض
      this.dpr = 1; this.W = 300; this.H = 300;
      this._anim = null;
      this._bind();
    }
    colors() {
      return {
        bg: cssVar('--plot-bg', '#fff'), grid: cssVar('--plot-grid', '#e5e7eb'), grid2: cssVar('--plot-grid-minor', '#f1f5f9'),
        axis: cssVar('--plot-axis', '#334155'), text: cssVar('--plot-text', '#475569'),
        c1: cssVar('--c1', '#2563eb'), c2: cssVar('--c2', '#dc2626'), c3: cssVar('--c3', '#059669'),
        c4: cssVar('--c4', '#d97706'), c5: cssVar('--c5', '#7c3aed'), c6: cssVar('--c6', '#db2777'), muted: cssVar('--muted', '#94a3b8')
      };
    }
    setView(v, keepEqual) {
      this.view = Object.assign({}, v);
      if (this.opts.equal && keepEqual !== false) this._fixAspect();
    }
    animateView(target, ms) {
      const from = Object.assign({}, this.view); const t0 = performance.now(); ms = ms || 350;
      const step = (now) => {
        const t = Math.min(1, (now - t0) / ms); const e = 1 - Math.pow(1 - t, 3);
        for (const k of ['xmin', 'xmax', 'ymin', 'ymax']) this.view[k] = from[k] + (target[k] - from[k]) * e;
        if (this.opts.equal) this._fixAspect();
        this.onChange && this.onChange();
        if (t < 1) this._anim = requestAnimationFrame(step);
      };
      cancelAnimationFrame(this._anim); this._anim = requestAnimationFrame(step);
    }
    _fixAspect() {
      const v = this.view; const cx = (v.xmin + v.xmax) / 2, cy = (v.ymin + v.ymax) / 2;
      const sx = (v.xmax - v.xmin) / this.W, sy = (v.ymax - v.ymin) / this.H;
      const s = Math.max(sx, sy);
      v.xmin = cx - s * this.W / 2; v.xmax = cx + s * this.W / 2;
      v.ymin = cy - s * this.H / 2; v.ymax = cy + s * this.H / 2;
    }
    resize() {
      const r = this.canvas.getBoundingClientRect();
      this.dpr = Math.min(3, root.devicePixelRatio || 1);
      this.W = Math.max(10, r.width); this.H = Math.max(10, r.height);
      this.canvas.width = Math.round(this.W * this.dpr); this.canvas.height = Math.round(this.H * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      if (this.opts.equal) this._fixAspect();
    }
    X(x) { const v = this.view; return (x - v.xmin) / (v.xmax - v.xmin) * this.W; }
    Y(y) { const v = this.view; return this.H - (y - v.ymin) / (v.ymax - v.ymin) * this.H; }
    invX(px) { const v = this.view; return v.xmin + px / this.W * (v.xmax - v.xmin); }
    invY(py) { const v = this.view; return v.ymin + (this.H - py) / this.H * (v.ymax - v.ymin); }
    get pxPerUnit() { return this.W / (this.view.xmax - this.view.xmin); }

    clear() {
      const c = this.colors(); const ctx = this.ctx;
      ctx.save(); ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.fillStyle = c.bg; ctx.fillRect(0, 0, this.W, this.H); ctx.restore();
    }
    grid() {
      const c = this.colors(); const ctx = this.ctx; const v = this.view;
      const pi = this.opts.xPi;
      let xs = pi ? Math.PI / 6 : niceStep((v.xmax - v.xmin) / Math.max(4, this.W / 70));
      if (pi) { while (this.X(xs) - this.X(0) < 34) xs *= 2; }
      const ys = niceStep((v.ymax - v.ymin) / Math.max(4, this.H / 60));
      ctx.lineWidth = 1;
      // خطوط فرعية
      ctx.strokeStyle = c.grid2; ctx.beginPath();
      for (let x = Math.ceil(v.xmin / (xs / 2)) * (xs / 2); x <= v.xmax; x += xs / 2) { const p = Math.round(this.X(x)) + 0.5; ctx.moveTo(p, 0); ctx.lineTo(p, this.H); }
      for (let y = Math.ceil(v.ymin / (ys / 2)) * (ys / 2); y <= v.ymax; y += ys / 2) { const p = Math.round(this.Y(y)) + 0.5; ctx.moveTo(0, p); ctx.lineTo(this.W, p); }
      ctx.stroke();
      ctx.strokeStyle = c.grid; ctx.beginPath();
      for (let x = Math.ceil(v.xmin / xs) * xs; x <= v.xmax; x += xs) { const p = Math.round(this.X(x)) + 0.5; ctx.moveTo(p, 0); ctx.lineTo(p, this.H); }
      for (let y = Math.ceil(v.ymin / ys) * ys; y <= v.ymax; y += ys) { const p = Math.round(this.Y(y)) + 0.5; ctx.moveTo(0, p); ctx.lineTo(this.W, p); }
      ctx.stroke();
      // المحاور
      const ox = M_clamp(this.X(0), 0, this.W), oy = M_clamp(this.Y(0), 0, this.H);
      ctx.strokeStyle = c.axis; ctx.lineWidth = 1.4; ctx.beginPath();
      ctx.moveTo(0, oy); ctx.lineTo(this.W, oy); ctx.moveTo(ox, 0); ctx.lineTo(ox, this.H); ctx.stroke();
      if (this.opts.ticks === false) return;
      // تسميات
      ctx.fillStyle = c.text; ctx.font = '11px system-ui, sans-serif'; ctx.direction = 'ltr';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      const ly = oy + 4 > this.H - 14 ? oy - 16 : oy + 4;
      for (let x = Math.ceil(v.xmin / xs) * xs; x <= v.xmax; x += xs) {
        if (Math.abs(x) < xs / 2) continue;
        ctx.fillText(LD(pi ? piLabel(x) : fmtTick(x, xs)), this.X(x), ly);
      }
      ctx.textAlign = ox + 6 > this.W - 30 ? 'right' : 'left'; ctx.textBaseline = 'middle';
      const lx = ox + 6 > this.W - 30 ? ox - 6 : ox + 6;
      for (let y = Math.ceil(v.ymin / ys) * ys; y <= v.ymax; y += ys) {
        if (Math.abs(y) < ys / 2) continue;
        ctx.fillText(LD(fmtTick(y, ys)), lx, this.Y(y));
      }
      ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText(LD('0'), ox + 4, oy + 3);
    }
    _style(st) {
      const ctx = this.ctx; st = st || {};
      ctx.strokeStyle = st.color || this.colors().c1; ctx.lineWidth = st.width || 2.5;
      ctx.setLineDash(st.dash || []); ctx.globalAlpha = st.alpha === undefined ? 1 : st.alpha;
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    }
    _reset() { this.ctx.setLineDash([]); this.ctx.globalAlpha = 1; }
    /* رسم y = f(x) مع كشف الانقطاعات */
    fn(f, st) {
      st = st || {}; const ctx = this.ctx; const v = this.view;
      const a = Math.max(v.xmin, st.domain ? st.domain[0] : -Infinity);
      const b = Math.min(v.xmax, st.domain ? st.domain[1] : Infinity);
      if (!(b > a)) return;
      const N = Math.ceil((this.X(b) - this.X(a)) * 1.5) + 2;
      const asym = (st.asymptotes || []).slice().sort((p, q) => p - q);
      const span = v.ymax - v.ymin; const lo = v.ymin - span * 4, hi = v.ymax + span * 4;
      this._style(st); ctx.beginPath();
      let pen = false, px = null, py = null;
      for (let i = 0; i <= N; i++) {
        let x = a + (b - a) * i / N;
        if (st.openEnds && (i === 0 || i === N)) x += (i === 0 ? 1 : -1) * 1e-9;
        const y = f(x);
        const ok = Number.isFinite(y);
        let brk = !ok;
        if (ok && pen && px !== null) {
          for (const s of asym) if ((px - s) * (x - s) <= 0) { brk = true; break; }
          if (!brk && Math.abs(y - py) > span * 1.5) brk = true;
        }
        if (brk) { pen = false; px = ok ? x : null; py = ok ? y : null; if (ok) { ctx.moveTo(this.X(x), this.Y(M_clamp(y, lo, hi))); pen = true; } continue; }
        const yy = M_clamp(y, lo, hi);
        if (!pen) { ctx.moveTo(this.X(x), this.Y(yy)); pen = true; } else ctx.lineTo(this.X(x), this.Y(yy));
        px = x; py = y;
      }
      ctx.stroke(); this._reset();
    }
    parametric(fx, fy, t0, t1, st, n) {
      const ctx = this.ctx; n = n || 400; this._style(st); ctx.beginPath();
      for (let i = 0; i <= n; i++) { const t = t0 + (t1 - t0) * i / n; const x = this.X(fx(t)), y = this.Y(fy(t)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke(); this._reset();
    }
    segment(x1, y1, x2, y2, st) {
      const ctx = this.ctx; this._style(st); ctx.beginPath();
      ctx.moveTo(this.X(x1), this.Y(y1)); ctx.lineTo(this.X(x2), this.Y(y2)); ctx.stroke(); this._reset();
    }
    arrow(x1, y1, x2, y2, st) {
      this.segment(x1, y1, x2, y2, st);
      const ctx = this.ctx; const X2 = this.X(x2), Y2 = this.Y(y2);
      const ang = Math.atan2(Y2 - this.Y(y1), X2 - this.X(x1)); const L = 9;
      ctx.fillStyle = (st && st.color) || this.colors().c1; ctx.beginPath();
      ctx.moveTo(X2, Y2); ctx.lineTo(X2 - L * Math.cos(ang - 0.4), Y2 - L * Math.sin(ang - 0.4));
      ctx.lineTo(X2 - L * Math.cos(ang + 0.4), Y2 - L * Math.sin(ang + 0.4)); ctx.closePath(); ctx.fill();
    }
    vline(x, st) { const v = this.view; this.segment(x, v.ymin - 1, x, v.ymax + 1, st); }
    hline(y, st) { const v = this.view; this.segment(v.xmin - 1, y, v.xmax + 1, y, st); }
    // مستقيم يمر بنقطة بميل m (أو رأسي إذا m غير منتهٍ)
    lineThrough(x0, y0, m, st) {
      if (!Number.isFinite(m)) return this.vline(x0, st);
      const v = this.view; this.segment(v.xmin - 1, y0 + m * (v.xmin - 1 - x0), v.xmax + 1, y0 + m * (v.xmax + 1 - x0), st);
    }
    point(x, y, st) {
      st = st || {}; const ctx = this.ctx; const r = st.r || 5;
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      ctx.beginPath(); ctx.arc(this.X(x), this.Y(y), r, 0, Math.PI * 2);
      const col = st.color || this.colors().c2;
      if (st.open) { ctx.fillStyle = this.colors().bg; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = col; ctx.stroke(); }
      else { ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = this.colors().bg; ctx.stroke(); }
      if (st.label) this.text(x, y, st.label, { color: col, dx: st.dx === undefined ? 8 : st.dx, dy: st.dy === undefined ? -10 : st.dy, align: st.align });
    }
    text(x, y, s, st) {
      st = st || {}; const ctx = this.ctx;
      ctx.font = (st.bold ? '600 ' : '') + (st.size || 12) + 'px system-ui, "Tajawal", sans-serif';
      ctx.fillStyle = st.color || this.colors().text; ctx.textAlign = st.align || 'left'; ctx.textBaseline = st.baseline || 'middle';
      if (ML.loc) s = ML.loc(s);
      const ar = /[\u0600-\u06FF]/.test(s);
      if (ar) s = ML.bidi(s);
      ctx.direction = ar ? 'rtl' : 'ltr';
      let px = this.X(x) + (st.dx || 0), py = this.Y(y) + (st.dy || 0);
      px = M_clamp(px, 4, this.W - 4); py = M_clamp(py, 8, this.H - 8);
      if (st.halo !== false) { ctx.lineWidth = 3.5; ctx.strokeStyle = this.colors().bg; ctx.strokeText(s, px, py); }
      ctx.fillText(s, px, py); ctx.direction = 'ltr';
    }
    polygon(pts, st) {
      st = st || {}; const ctx = this.ctx; if (!pts.length) return;
      ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(this.X(p[0]), this.Y(p[1])) : ctx.moveTo(this.X(p[0]), this.Y(p[1])))); ctx.closePath();
      if (st.fill) { ctx.fillStyle = st.fill; ctx.globalAlpha = st.fillAlpha === undefined ? 0.18 : st.fillAlpha; ctx.fill(); ctx.globalAlpha = 1; }
      this._style(st); ctx.stroke(); this._reset();
    }
    circle(cx, cy, r, st) {
      st = st || {}; const ctx = this.ctx; const rx = Math.abs(this.X(cx + r) - this.X(cx)), ry = Math.abs(this.Y(cy + r) - this.Y(cy));
      ctx.beginPath(); ctx.ellipse(this.X(cx), this.Y(cy), rx, ry, 0, 0, Math.PI * 2);
      if (st.fill) { ctx.fillStyle = st.fill; ctx.globalAlpha = st.fillAlpha === undefined ? 0.12 : st.fillAlpha; ctx.fill(); ctx.globalAlpha = 1; }
      this._style(st); ctx.stroke(); this._reset();
    }
    // قوس زاوية (بالراديان، عكس عقارب الساعة رياضياً) — للتعليم
    angleArc(cx, cy, rPx, a0, a1, st) {
      st = st || {}; const ctx = this.ctx; this._style(Object.assign({ width: 2 }, st));
      ctx.beginPath(); ctx.arc(this.X(cx), this.Y(cy), rPx, -a0, -a1, a1 > a0); ctx.stroke(); this._reset();
      if (st.fill) { ctx.beginPath(); ctx.moveTo(this.X(cx), this.Y(cy)); ctx.arc(this.X(cx), this.Y(cy), rPx, -a0, -a1, a1 > a0); ctx.closePath(); ctx.fillStyle = st.fill; ctx.globalAlpha = 0.15; ctx.fill(); ctx.globalAlpha = 1; }
    }
    // تظليل المنطقة بين y = f(x) والمحور (أو g) على [a,b]
    shade(f, a, b, st, g) {
      st = st || {}; const ctx = this.ctx; const v = this.view;
      a = Math.max(a, v.xmin); b = Math.min(b, v.xmax); if (!(b > a)) return;
      const N = 200; g = g || (() => 0);
      ctx.beginPath();
      for (let i = 0; i <= N; i++) { const x = a + (b - a) * i / N; const y = M_clamp(f(x), v.ymin - 1, v.ymax + 1); i ? ctx.lineTo(this.X(x), this.Y(y)) : ctx.moveTo(this.X(x), this.Y(y)); }
      for (let i = N; i >= 0; i--) { const x = a + (b - a) * i / N; ctx.lineTo(this.X(x), this.Y(M_clamp(g(x), v.ymin - 1, v.ymax + 1))); }
      ctx.closePath(); ctx.fillStyle = st.color || this.colors().c1; ctx.globalAlpha = st.alpha || 0.15; ctx.fill(); ctx.globalAlpha = 1;
    }
    // تظليل شريط على محور السينات (لمجموعات الحل)
    xBand(a, b, st) {
      st = st || {}; const v = this.view; a = Math.max(a, v.xmin - 1); b = Math.min(b, v.xmax + 1); if (!(b > a)) return;
      const ctx = this.ctx; ctx.fillStyle = st.color || this.colors().c3; ctx.globalAlpha = st.alpha || 0.12;
      ctx.fillRect(this.X(a), 0, this.X(b) - this.X(a), this.H); ctx.globalAlpha = 1;
    }

    /* ---------- التفاعل ---------- */
    _bind() {
      const cv = this.canvas; let drag = null; const pointers = new Map(); let pinch0 = null;
      const pos = (e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
      cv.style.touchAction = 'none';
      cv.addEventListener('pointerdown', (e) => {
        if (!this.opts.interactive) return;
        cv.setPointerCapture(e.pointerId); const p = pos(e); pointers.set(e.pointerId, p);
        if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch0 = { d: Math.hypot(a.x - b.x, a.y - b.y), v: Object.assign({}, this.view), c: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } }; drag = null; return; }
        const h = this._hit(p);
        if (h) { drag = { type: 'handle', h: h }; cv.style.cursor = 'grabbing'; }
        else if (this.opts.pan !== false) drag = { type: 'pan', p: p, v: Object.assign({}, this.view) };
      });
      cv.addEventListener('pointermove', (e) => {
        const p = pos(e);
        if (pointers.has(e.pointerId)) pointers.set(e.pointerId, p);
        if (pinch0 && pointers.size === 2) {
          const [a, b] = [...pointers.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
          const k = pinch0.d / Math.max(10, d); const v0 = pinch0.v;
          const cx = v0.xmin + pinch0.c.x / this.W * (v0.xmax - v0.xmin); const cy = v0.ymin + (this.H - pinch0.c.y) / this.H * (v0.ymax - v0.ymin);
          this.view = { xmin: cx + (v0.xmin - cx) * k, xmax: cx + (v0.xmax - cx) * k, ymin: cy + (v0.ymin - cy) * k, ymax: cy + (v0.ymax - cy) * k };
          this.onChange && this.onChange(); return;
        }
        if (!drag) { cv.style.cursor = this._hit(p) ? 'grab' : (this.opts.pan !== false ? 'move' : 'default'); return; }
        if (drag.type === 'handle') { drag.h.onDrag(this.invX(p.x), this.invY(p.y)); }
        else {
          const v = drag.v; const dx = (p.x - drag.p.x) / this.W * (v.xmax - v.xmin), dy = (p.y - drag.p.y) / this.H * (v.ymax - v.ymin);
          this.view = { xmin: v.xmin - dx, xmax: v.xmax - dx, ymin: v.ymin + dy, ymax: v.ymax + dy };
          this.onChange && this.onChange();
        }
      });
      const up = (e) => { pointers.delete(e.pointerId); if (pointers.size < 2) pinch0 = null; drag = null; cv.style.cursor = 'default'; };
      cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
      cv.addEventListener('wheel', (e) => {
        if (!this.opts.interactive || this.opts.zoom === false) return;
        e.preventDefault(); const p = pos(e); const k = Math.exp(e.deltaY * 0.0015);
        const cx = this.invX(p.x), cy = this.invY(p.y); const v = this.view;
        this.view = { xmin: cx + (v.xmin - cx) * k, xmax: cx + (v.xmax - cx) * k, ymin: cy + (v.ymin - cy) * k, ymax: cy + (v.ymax - cy) * k };
        this.onChange && this.onChange();
      }, { passive: false });
    }
    _hit(p) {
      for (let i = this.handles.length - 1; i >= 0; i--) {
        const h = this.handles[i]; if (Math.hypot(this.X(h.x) - p.x, this.Y(h.y) - p.y) < 16) return h;
      }
      return null;
    }
    zoom(k) {
      const v = this.view; const cx = (v.xmin + v.xmax) / 2, cy = (v.ymin + v.ymax) / 2;
      this.animateView({ xmin: cx + (v.xmin - cx) * k, xmax: cx + (v.xmax - cx) * k, ymin: cy + (v.ymin - cy) * k, ymax: cy + (v.ymax - cy) * k }, 250);
    }
  }
  // عزل المقاطع اللاتينية/الرقمية داخل نص عربي حتى لا ينقلب ترتيبها (مثل الإحداثيات)
  ML.bidi = function (s) {
    return String(s).replace(/[A-Za-z0-9\u0660-\u0669\u00B2\u00B3\u00B9\u2070-\u209F\u0391-\u03C9(\[{][A-Za-z0-9\u0660-\u0669\u00B2\u00B3\u00B9\u2070-\u209F\u0391-\u03C9\-+.,=()\[\]{}'\/ π°θ≈·×√:|<>~∧∨→↔−]*[A-Za-z0-9\u0660-\u0669\u00B2\u00B3\u00B9\u2070-\u209F\u0391-\u03C9)\]}°']|[A-Za-z0-9\u0391-\u03C9]/g, (m) => '\u2066' + m + '\u2069')
      .replace(/(^|\s)([-−])\u2066/g, '$1\u2066$2');
  };
  const LD = (s) => (ML.locDigits ? ML.locDigits(s) : s);
  function M_clamp(x, a, b) { return Math.min(b, Math.max(a, x)); }
  function fmtTick(x, step) {
    const d = Math.max(0, -Math.floor(Math.log10(step)) + 1);
    let s = (+x.toFixed(Math.min(6, d))).toString(); if (s === '-0') s = '0'; return s;
  }
  function piLabel(x) {
    const k = Math.round(x / (Math.PI / 6)); if (k === 0) return '0';
    const g = gcd(Math.abs(k), 6); const n = k / g, d = 6 / g;
    const num = (n === 1 ? '' : n === -1 ? '-' : n) + 'π';
    return d === 1 ? num : num + '/' + d;
  }
  function gcd(a, b) { while (b) { const t = b; b = a % b; a = t; } return a; }
  ML.Plot = Plot;
  ML.niceStep = niceStep;
})(typeof window !== 'undefined' ? window : globalThis);
