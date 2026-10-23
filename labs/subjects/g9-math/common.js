/* رياضيات التاسع (الجزء الأول) — أدوات مشتركة: تسجيل، تنسيق الأعداد والمجموعات، الجذور، المخططات السهمية */
(function (root) {
  'use strict';
  const ML = root.ML; const M = ML.math;
  const G = ML.m9 = {};
  G.S = 'g9-math';
  G.SIMPLE = 'نموذج مبسّط لأغراض التعليم';
  G.reg = (o) => ML.register(Object.assign({ subject: G.S }, o));
  G.narrow = (W) => W < 560;
  // نص على Canvas بأرقام الكتاب العربية واتجاه صحيح
  G.txt = function (ctx, s, x, y, o) {
    o = o || {}; ctx.save();
    ctx.font = (o.w || '600') + ' ' + (o.size || 13) + 'px system-ui, Tajawal, sans-serif';
    ctx.fillStyle = o.color; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
    s = ML.loc ? ML.loc(String(s)) : String(s);
    const ar = /[؀-ۿ]/.test(s); ctx.direction = ar ? 'rtl' : 'ltr';
    const t = ar && ML.bidi ? ML.bidi(s) : s;
    if (o.halo) { ctx.lineWidth = 3.5; ctx.strokeStyle = o.halo; ctx.strokeText(t, x, y); }
    ctx.fillText(t, x, y); ctx.restore();
  };
  // تعبير بأسس مرفوعة على Canvas بترتيب القراءة العربي (من اليمين)، والأس أعلى يسار الأساس كما في صيغ التطبيق المعكوسة
  // items: [[نص، أس اختياري], …]
  G.expr = function (ctx, items, cx, y, o) {
    o = o || {}; const fs = o.size || 16; const L = (t) => (ML.loc ? ML.loc(String(t)) : String(t));
    const font = (sz) => (o.w || '800') + ' ' + sz + 'px system-ui, Tajawal, sans-serif';
    ctx.save(); ctx.fillStyle = o.color; ctx.textBaseline = 'middle'; ctx.textAlign = 'right'; ctx.direction = 'ltr';
    const ws = items.map((it) => { ctx.font = font(fs); const a = ctx.measureText(L(it[0])).width; ctx.font = font(fs * 0.62); return [a, it[1] !== undefined ? ctx.measureText(L(it[1])).width + 2 : 0]; });
    const gap = fs * 0.28; let x = cx + (ws.reduce((t, w) => t + w[0] + w[1], 0) + gap * (items.length - 1)) / 2;
    items.forEach((it, i) => {
      ctx.font = font(fs); ctx.fillText(L(it[0]), x, y); x -= ws[i][0];
      if (it[1] !== undefined) { ctx.font = font(fs * 0.62); ctx.fillText(L(it[1]), x - 1, y - fs * 0.42); x -= ws[i][1]; }
      x -= gap;
    });
    ctx.restore();
  };
  G.arrow = function (ctx, x1, y1, x2, y2, color, w) {
    const L = Math.hypot(x2 - x1, y2 - y1); if (L < 1) return;
    ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w || 2; ctx.lineCap = 'round';
    const a = Math.atan2(y2 - y1, x2 - x1), h = Math.min(11, L * 0.4);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - h * 0.6 * Math.cos(a), y2 - h * 0.6 * Math.sin(a)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - h * Math.cos(a - 0.4), y2 - h * Math.sin(a - 0.4)); ctx.lineTo(x2 - h * Math.cos(a + 0.4), y2 - h * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill();
    ctx.restore();
  };
  // عدد للعرض: كسور الكتاب (½ ، ⅓ ، ¼) أو عدد عشري مختصر
  G.n = function (x) {
    if (typeof x === 'string') return x;
    if (!Number.isFinite(x)) return '—';
    if (M.isInt(x)) return String(Math.round(x));
    const f = M.toFraction(x, 12); if (f) return (f.n < 0 ? '-' : '') + Math.abs(f.n) + '/' + f.d;
    return M.fmt(x, 3);
  };
  // مجموعة وأزواج مرتبة بصيغة الكتاب: { ١ ، ٢ } ، (٢ ، ٧)
  G.set = (a) => (a.length ? '{ ' + a.map(G.n).join(' ، ') + ' }' : '∅');
  G.pair = (p) => '(' + G.n(p[0]) + ' ، ' + G.n(p[1]) + ')';
  G.pairs = (ps) => (ps.length ? '{ ' + ps.map(G.pair).join(' ، ') + ' }' : '∅');
  G.uniq = (a) => a.filter((v, i) => a.findIndex((w) => G.eq(w, v)) === i);
  G.eq = (a, b) => (typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) < 1e-9 : a === b);
  G.has = (a, v) => a.some((w) => G.eq(w, v));
  G.hasPair = (ps, p) => ps.some((q) => G.eq(q[0], p[0]) && G.eq(q[1], p[1]));
  // تبسيط الجذر: √ن = خ √د حيث د خالٍ من المربعات
  G.simplifyRoot = function (n) {
    let out = 1, inside = n;
    for (let k = Math.floor(Math.sqrt(n)); k >= 2; k--) if (inside % (k * k) === 0) { out *= k; inside /= k * k; }
    return [out, inside];
  };
  // صيغة TeX لـ م√ن
  G.rootTeX = function (c, r) {
    if (r === 1) return String(c);
    const cs = c === 1 ? '' : c === -1 ? '-' : String(c);
    return cs + '\\sqrt{' + r + '}';
  };
  // خيارات قائمة بأرقام عربية (تُبنى عند عرض الصفحة)
  G.opts = (list) => () => list.map((o) => [o[0], ML.locDigits ? ML.locDigits(o[1]) : o[1]]);

  /* مخطط سهمي بشكلي ڤن (كما في الكتاب): A يمين ← B يسار في الواجهة العربية
     o.bad: عناصر المجال المقابل المظللة بالأحمر، o.miss: عناصر بلا صورة، o.hi: زوج مظلل */
  G.venn = function (ctx, x, y, w, h, A, B, pairs, c, o) {
    o = o || {}; const nar = w < 420;
    const rx = Math.min(w * 0.17, 70), ry = h / 2 - 8;
    const xa = x + w * 0.76, xb = x + w * 0.24, cy = y + h / 2 + 6;
    const pos = (arr, i) => cy - ry + 26 + (arr.length === 1 ? (2 * ry - 52) / 2 : i * (2 * ry - 52) / (arr.length - 1));
    [[xa, o.la || 'أ'], [xb, o.lb || 'ب']].forEach(([ex, lab]) => {
      ctx.save(); ctx.strokeStyle = c.c1; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(ex, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      G.txt(ctx, lab, ex, y + 2, { color: c.c1, size: 15, w: '800' });
    });
    const PA = A.map((v, i) => [xa, pos(A, i)]), PB = B.map((v, i) => [xb, pos(B, i)]);
    pairs.forEach((p) => {
      const i = A.findIndex((v) => G.eq(v, p[0])), j = B.findIndex((v) => G.eq(v, p[1])); if (i < 0 || j < 0) return;
      const hi = o.hi && G.eq(o.hi[0], p[0]) && G.eq(o.hi[1], p[1]);
      const col = o.pairColor ? o.pairColor(p) : hi ? c.c5 : c.c3;
      G.arrow(ctx, PA[i][0] - 14, PA[i][1], PB[j][0] + 16, PB[j][1], col, hi ? 3 : 2);
    });
    const fs = nar ? 12 : 14;
    A.forEach((v, i) => { const miss = o.miss && G.has(o.miss, v); ctx.fillStyle = miss ? c.c2 : c.text; ctx.beginPath(); ctx.arc(PA[i][0] - 8, PA[i][1], 3.5, 0, 7); ctx.fill(); G.txt(ctx, G.n(v), PA[i][0] + 12, PA[i][1], { color: miss ? c.c2 : c.text, size: fs, w: '700' }); });
    B.forEach((v, j) => { const bad = o.bad && G.has(o.bad, v); const idle = o.idle && G.has(o.idle, v); ctx.fillStyle = bad ? c.c2 : idle ? c.c4 : c.text; ctx.beginPath(); ctx.arc(PB[j][0] + 8, PB[j][1], 3.5, 0, 7); ctx.fill(); G.txt(ctx, G.n(v), PB[j][0] - 14, PB[j][1], { color: bad ? c.c2 : idle ? c.c4 : c.text, size: fs, w: '700' }); });
  };

  // مستوى ديكارتي صغير على Canvas لأزواج مرتبة
  G.plane = function (ctx, x, y, w, h, pairs, c, o) {
    o = o || {};
    const xs = pairs.map((p) => p[0]).concat([0]), ys = pairs.map((p) => p[1]).concat([0]);
    const x0 = Math.floor(Math.min.apply(null, xs)) - 1, x1 = Math.ceil(Math.max.apply(null, xs)) + 1;
    const y0 = Math.floor(Math.min.apply(null, ys)) - 1, y1 = Math.ceil(Math.max.apply(null, ys)) + 1;
    const sx = w / (x1 - x0), sy = h / (y1 - y0);
    const X = (v) => x + (v - x0) * sx, Y = (v) => y + h - (v - y0) * sy;
    ctx.save(); ctx.strokeStyle = c.grid; ctx.lineWidth = 1;
    const stepX = Math.max(1, Math.ceil((x1 - x0) / 14)), stepY = Math.max(1, Math.ceil((y1 - y0) / 10));
    for (let v = x0; v <= x1; v++) { ctx.beginPath(); ctx.moveTo(X(v), y); ctx.lineTo(X(v), y + h); ctx.stroke(); }
    for (let v = y0; v <= y1; v++) { ctx.beginPath(); ctx.moveTo(x, Y(v)); ctx.lineTo(x + w, Y(v)); ctx.stroke(); }
    ctx.strokeStyle = c.axis; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(x, Y(0)); ctx.lineTo(x + w, Y(0)); ctx.moveTo(X(0), y); ctx.lineTo(X(0), y + h); ctx.stroke(); ctx.restore();
    for (let v = x0 + 1; v < x1; v += stepX) if (v) G.txt(ctx, v, X(v), Y(0) + 11, { color: c.muted, size: 10 });
    for (let v = y0 + 1; v < y1; v += stepY) if (v) G.txt(ctx, v, X(0) - 10, Y(v), { color: c.muted, size: 10 });
    G.txt(ctx, 'س', x + w - 6, Y(0) - 10, { color: c.muted, size: 12 }); G.txt(ctx, 'ص', X(0) + 10, y + 8, { color: c.muted, size: 12 });
    pairs.forEach((p) => {
      const hi = o.hi && G.eq(o.hi[0], p[0]) && G.eq(o.hi[1], p[1]);
      const col = o.pairColor ? o.pairColor(p) : hi ? c.c5 : c.c3;
      ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = hi ? 3 : 2.2; const px = X(p[0]), py = Y(p[1]), r = hi ? 6 : 4.5;
      ctx.beginPath(); ctx.moveTo(px - r, py - r); ctx.lineTo(px + r, py + r); ctx.moveTo(px + r, py - r); ctx.lineTo(px - r, py + r); ctx.stroke(); ctx.restore();
    });
    return { X: X, Y: Y };
  };
})(typeof window !== 'undefined' ? window : globalThis);
