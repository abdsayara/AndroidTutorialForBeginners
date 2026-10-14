/* الكيمياء — أدوات رسم ثنائية الأبعاد مشتركة لمحاكيات الكتاب (كأس، أنبوب اختبار، لهب، ورق كاشف، ميزان حرارة، ميزان) */
(function (root) {
  'use strict';
  const ML = root.ML; const D = ML.pdraw;
  const R = ML.chemDraw = {};
  R.GLASS = 'rgba(148,163,184,.9)';
  // كأس: (cx, by) منتصف القاع
  R.beaker = function (ctx, cx, by, w, h, o) {
    o = o || {}; const x = cx - w / 2, y = by - h;
    if (o.level > 0) {
      const lh = h * Math.min(1, o.level) * 0.92;
      ctx.fillStyle = o.color || 'rgba(96,165,250,.45)'; ctx.fillRect(x + 3, by - lh, w - 6, lh - 2);
      ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + 4, by - lh); ctx.lineTo(x + w - 4, by - lh); ctx.stroke();
      if (o.bubbles) R.bubbles(ctx, x + 6, by - lh + 4, w - 12, lh - 8, o.bubbles, o.t || 0);
    }
    if (o.solid) { ctx.fillStyle = o.solid.color; const sh = o.solid.h || 6; ctx.beginPath(); ctx.ellipse(cx, by - sh / 2 - 3, (w - 10) / 2 * (o.solid.w || 0.7), sh / 2 + 1, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = o.stroke || R.GLASS; ctx.lineWidth = 2.5; ctx.beginPath();
    ctx.moveTo(x - 4, y); ctx.lineTo(x, y + 4); ctx.lineTo(x, by - 4); ctx.quadraticCurveTo(x, by, x + 4, by); ctx.lineTo(x + w - 4, by); ctx.quadraticCurveTo(x + w, by, x + w, by - 4); ctx.lineTo(x + w, y + 4); ctx.lineTo(x + w + 4, y); ctx.stroke();
    for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(x + 4, by - h * i / 4); ctx.lineTo(x + 12, by - h * i / 4); ctx.lineWidth = 1; ctx.stroke(); }
    if (o.label) D.txt(ctx, o.label, cx, by + 14, { color: o.labelColor || '#475569', size: 12, w: '700' });
  };
  // أنبوب اختبار بقاع مستدير
  R.tube = function (ctx, cx, by, w, h, o) {
    o = o || {}; const x = cx - w / 2, y = by - h, r = w / 2;
    ctx.save(); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, by - r); ctx.arc(cx, by - r, r, Math.PI, 0, true); ctx.lineTo(x + w, y); ctx.closePath(); ctx.clip();
    if (o.level > 0) { const lh = h * Math.min(1, o.level); ctx.fillStyle = o.color || 'rgba(96,165,250,.45)'; ctx.fillRect(x, by - lh, w, lh); if (o.bubbles) R.bubbles(ctx, x + 2, by - lh + 2, w - 4, lh - 6, o.bubbles, o.t || 0); }
    if (o.layer) { ctx.fillStyle = o.layer.color; ctx.fillRect(x, by - h * o.layer.top, w, h * (o.layer.top - o.layer.bottom)); }
    if (o.solid) { ctx.fillStyle = o.solid.color; ctx.fillRect(x, by - (o.solid.h || 8), w, o.solid.h || 8); }
    ctx.restore();
    ctx.strokeStyle = R.GLASS; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x - 2, y); ctx.lineTo(x, y + 2); ctx.lineTo(x, by - r); ctx.arc(cx, by - r, r, Math.PI, 0, true); ctx.lineTo(x + w, y + 2); ctx.lineTo(x + w + 2, y); ctx.stroke();
    if (o.label) D.txt(ctx, o.label, cx, by + 14, { color: o.labelColor || '#475569', size: 11.5, w: '700' });
  };
  // فقاعات تتحرك للأعلى مع الزمن t
  R.bubbles = function (ctx, x, y, w, h, n, t) {
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1;
    for (let i = 0; i < n; i++) { const ph = ((t * 0.6 + i * 0.37) % 1 + 1) % 1; const bx = x + ((i * 53.7) % 1000) / 1000 * w; const r = 1.6 + (i % 3); const yy = y + h - ph * h; ctx.beginPath(); ctx.arc(bx, yy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    ctx.restore();
  };
  // لهب بنسن
  R.flame = function (ctx, cx, by, s, on) {
    ctx.fillStyle = '#475569'; ctx.fillRect(cx - s * 0.18, by - s * 0.9, s * 0.36, s * 0.9); ctx.fillRect(cx - s * 0.5, by - s * 0.1, s, s * 0.1);
    if (!on) return;
    const top = by - s * 0.9; ctx.save();
    ctx.fillStyle = 'rgba(96,165,250,.75)'; ctx.beginPath(); ctx.moveTo(cx - s * 0.2, top); ctx.quadraticCurveTo(cx, top - s * 1.2, cx + s * 0.2, top); ctx.fill();
    ctx.fillStyle = 'rgba(251,146,60,.55)'; ctx.beginPath(); ctx.moveTo(cx - s * 0.12, top); ctx.quadraticCurveTo(cx, top - s * 0.7, cx + s * 0.12, top); ctx.fill(); ctx.restore();
  };
  // ورقة كاشف (دوّار الشمس / pH)
  R.paper = function (ctx, x, y, w, h, color, label) {
    ctx.fillStyle = color; ctx.fillRect(x, y, w, h); ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h);
    if (label) D.txt(ctx, label, x + w / 2, y + h + 12, { color: '#475569', size: 11, w: '600' });
  };
  R.LITMUS = { red: '#ef4444', blue: '#3b82f6' };
  // ميزان حرارة رأسي
  R.thermo = function (ctx, x, y, h, T, Tmin, Tmax, cols) {
    const f = Math.max(0, Math.min(1, (T - Tmin) / (Tmax - Tmin)));
    ctx.fillStyle = 'rgba(241,245,249,.95)'; D.rr(ctx, x - 7, y, 14, h, 7); ctx.fill(); ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#dc2626'; ctx.fillRect(x - 3, y + 6 + (h - 18) * (1 - f), 6, (h - 18) * f + 6); ctx.beginPath(); ctx.arc(x, y + h, 9, 0, Math.PI * 2); ctx.fill();
    D.txt(ctx, (Math.round(T * 10) / 10) + ' °س', x, y - 12, { color: cols.text, size: 12.5, w: '700' });
  };
  // شاشة ميزان إلكتروني
  R.balance = function (ctx, cx, by, w, text) {
    ctx.fillStyle = '#334155'; D.rr(ctx, cx - w / 2, by - 26, w, 26, 6); ctx.fill();
    ctx.fillStyle = '#94a3b8'; ctx.fillRect(cx - w * 0.35, by - 32, w * 0.7, 6);
    ctx.fillStyle = '#0f2e1a'; ctx.fillRect(cx - w * 0.3, by - 20, w * 0.6, 15);
    ctx.save(); ctx.fillStyle = '#86efac'; ctx.font = '700 12px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'ltr'; ctx.fillText(text, cx, by - 12); ctx.restore();
  };
  // جدول بسيط: rows = [[cells...]], أعمدة بعرض متساوٍ (من اليمين لليسار)
  R.table = function (ctx, x, y, w, rowH, rows, cols, o) {
    o = o || {}; const n = rows[0].length; const cw = w / n;
    rows.forEach((r, i) => {
      if (i === 0 || o.hl === i) { ctx.fillStyle = i === 0 ? 'rgba(148,163,184,.2)' : 'rgba(5,150,105,.15)'; ctx.fillRect(x, y + i * rowH, w, rowH); }
      r.forEach((c, j) => D.txt(ctx, String(c), x + w - cw * (j + 0.5), y + i * rowH + rowH / 2, { color: (o.colColor && o.colColor(i, j)) || cols.text, size: o.size || 12, w: i === 0 ? '700' : '600' }));
      ctx.strokeStyle = cols.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y + (i + 1) * rowH); ctx.lineTo(x + w, y + (i + 1) * rowH); ctx.stroke();
    });
  };
  R.narrow = (W) => W < 560;
})(typeof window !== 'undefined' ? window : globalThis);
