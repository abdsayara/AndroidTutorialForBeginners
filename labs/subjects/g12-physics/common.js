/* فيزياء الثاني عشر — أدوات رسم مشتركة (عربة، بطارية، مقاومة، مجال، بوصلة) وتنسيق */
(function (root) {
  'use strict';
  const ML = root.ML; const D = ML.pdraw; const Q = ML.phys12;
  const K = ML.p12 = {};
  K.S = 'g12-physics';
  K.reg = (o) => ML.register(Object.assign({ subject: K.S, custom: true }, o));
  K.g = 10; // الكتاب يستخدم g = 10 m/s² في حلول الأمثلة
  K.n = (x, d) => { if (!Number.isFinite(x)) return '—'; const a = Math.abs(x); if (a !== 0 && (a >= 1e6 || a < 1e-3)) return ML.phys.sct(x, 3); return String(+x.toFixed(d === undefined ? 3 : d)); };
  K.q = (x, unit, sig) => ML.phys.q(x, unit, sig || 4);
  K.narrow = (W) => W < 560;
  // تلميح أولاً في وضع التعلّم، والجواب في وضع التجربة
  K.tutor = (hint, answer) => {
    const learn = ML.current && ML.current.mode === 'learn';
    return '💡 **سؤال موجّه:** ' + hint + (learn ? '\n\nفكّر أولاً؛ اسألني مرة أخرى في وضع «تجربة» لترى الجواب.' : '\n\n✅ **الجواب:** ' + answer);
  };
  // أعمدة في الرسم البياني: items = [[label, value, color]] ، المحور الأفقي 0..n
  K.bars = function (G, items) {
    items.forEach(([lab, v, col], i) => { const x0 = i + 0.2, x1 = i + 0.8; G.polygon([[x0, 0], [x1, 0], [x1, v], [x0, v]], { color: col, fill: col, fillAlpha: 0.55, width: 1 }); G.text(i + 0.5, v, lab, { color: col, dy: v >= 0 ? -12 : 14, align: 'center', bold: true }); });
  };
  K.barView = (vals, pad) => { const mx = Math.max(1e-9, ...vals.map((v) => Math.abs(v))) * (pad || 1.3); const neg = vals.some((v) => v < -1e-9); return { xmin: 0, xmax: vals.length, ymin: neg ? -mx : 0, ymax: mx }; };
  K.cart = function (ctx, x, y, w, h, color, label, cols) {
    ctx.fillStyle = color; D.rr(ctx, x - w / 2, y - h, w, h, 6); ctx.fill();
    ctx.fillStyle = '#334155'; [-w * 0.3, w * 0.3].forEach((dx) => { ctx.beginPath(); ctx.arc(x + dx, y + 2, Math.max(3, h * 0.18), 0, Math.PI * 2); ctx.fill(); });
    if (label) D.txt(ctx, label, x, y - h / 2, { color: '#fff', size: 12, w: '700' });
  };
  K.vec = function (ctx, x, y, vx, vy, color, label, cols, w) {
    if (Math.hypot(vx, vy) < 2) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill(); }
    else D.arrow(ctx, x, y, x + vx, y + vy, color, w || 3);
    if (label) D.txt(ctx, label, x + vx + (vx >= 0 ? 8 : -8), y + vy - 10, { color: color, size: 12, w: '700', align: vx >= 0 ? 'left' : 'right', halo: cols && cols.bg });
  };
  // بطارية رأسية/أفقية: الخط الطويل موجب
  K.battery = function (ctx, x, y, horiz, label, cols) {
    ctx.save(); ctx.strokeStyle = cols.text; ctx.lineWidth = 2.5;
    if (horiz) { ctx.beginPath(); ctx.moveTo(x - 4, y - 14); ctx.lineTo(x - 4, y + 14); ctx.stroke(); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + 4, y - 7); ctx.lineTo(x + 4, y + 7); ctx.stroke(); }
    else { ctx.beginPath(); ctx.moveTo(x - 14, y - 4); ctx.lineTo(x + 14, y - 4); ctx.stroke(); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 7, y + 4); ctx.lineTo(x + 7, y + 4); ctx.stroke(); }
    ctx.restore(); if (label) D.txt(ctx, label, x + (horiz ? 0 : 28), y + (horiz ? 26 : 0), { color: cols.c2, size: 12, w: '700', align: horiz ? 'center' : 'left' });
  };
  // مقاومة متعرجة بين نقطتين
  K.resistor = function (ctx, x1, y1, x2, y2, label, cols, color) {
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L; const a = L * 0.25, b = L * 0.75;
    ctx.save(); ctx.strokeStyle = color || cols.text; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + ux * a, y1 + uy * a);
    for (let i = 1; i <= 6; i++) { const t = a + (b - a) * i / 6, s = (i % 2 ? 1 : -1) * 7; ctx.lineTo(x1 + ux * t - uy * (i === 6 ? 0 : s), y1 + uy * t + ux * (i === 6 ? 0 : s)); }
    ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
    if (label) D.txt(ctx, label, (x1 + x2) / 2 - uy * 20, (y1 + y2) / 2 + ux * 20, { color: color || cols.text, size: 12, w: '700', halo: cols.bg });
  };
  K.wire = function (ctx, pts, cols, color, w) { ctx.save(); ctx.strokeStyle = color || cols.text; ctx.lineWidth = w || 2.2; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); ctx.restore(); };
  // رمز مجال/تيار عمودي على الصفحة: ⊙ نحو الناظر ، ⊗ بعيداً عنه
  K.perp = function (ctx, x, y, r, out, color) {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    if (out) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r * 0.3, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.beginPath(); ctx.moveTo(x - r * 0.6, y - r * 0.6); ctx.lineTo(x + r * 0.6, y + r * 0.6); ctx.moveTo(x + r * 0.6, y - r * 0.6); ctx.lineTo(x - r * 0.6, y + r * 0.6); ctx.stroke(); }
    ctx.restore();
  };
  K.fieldGrid = function (ctx, x0, y0, w, h, out, color, step) { step = step || 34; for (let x = x0 + step / 2; x < x0 + w; x += step) for (let y = y0 + step / 2; y < y0 + h; y += step) K.perp(ctx, x, y, 6, out, color); };
  // إبرة بوصلة باتجاه الزاوية a (راديان)
  K.compass = function (ctx, x, y, r, a, cols) {
    ctx.save(); ctx.fillStyle = cols.bg; ctx.strokeStyle = cols.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.moveTo(r * 0.85, 0); ctx.lineTo(0, -r * 0.2); ctx.lineTo(0, r * 0.2); ctx.fill();
    ctx.fillStyle = '#64748b'; ctx.beginPath(); ctx.moveTo(-r * 0.85, 0); ctx.lineTo(0, -r * 0.2); ctx.lineTo(0, r * 0.2); ctx.fill(); ctx.restore();
  };
})(typeof window !== 'undefined' ? window : globalThis);
