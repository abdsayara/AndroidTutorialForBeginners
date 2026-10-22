/* علوم التاسع (الجزء الأول) — أدوات مشتركة: تسجيل، تنسيق، وأدوات رسم (أنابيب، مصباح، مفتاح، أميتر، فولتميتر) */
(function (root) {
  'use strict';
  const ML = root.ML; const D = ML.pdraw; const R = ML.chemDraw; const K12 = ML.p12;
  const K = ML.s9 = {};
  K.S = 'g9-science';
  K.SIMPLE = 'نموذج مبسّط لأغراض التعليم';
  // تجارب أجهزة الجسم: bio = true (الرموز اللاتينية مثل CO2 و HCl تبقى كما في الكتاب)
  K.reg = (o) => ML.register(Object.assign({ subject: K.S, custom: true }, o));
  K.bio = (o) => K.reg(Object.assign({ bio: true }, o));
  K.narrow = (W) => W < 560;
  K.n = (x, d) => { if (!Number.isFinite(x)) return '—'; const a = Math.abs(x); if (a !== 0 && (a >= 1e6 || a < 1e-3)) return ML.phys.sct(x, 3); return String(+x.toFixed(d === undefined ? 3 : d)); };
  K.q = (x, unit, sig) => ML.phys.q(x, unit, sig || 4);
  K.tutor = (hint, answer) => {
    const learn = ML.current && ML.current.mode === 'learn';
    return '💡 **سؤال موجّه:** ' + hint + (learn ? '\n\nفكّر أولاً؛ اسألني مرة أخرى في وضع «تجربة» لترى الجواب.' : '\n\n✅ **الجواب:** ' + answer);
  };
  K.lbl = (ctx, t, x, y, color, cols, size, w) => D.txt(ctx, t, x, y, { color: color || cols.text, size: size || 12, w: w || '700', halo: cols.bg });
  // مزج لونين (hex) بنسبة f من 0 إلى 1
  K.mix = function (a, b, f) {
    f = Math.max(0, Math.min(1, f)); const h = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
    const A = h(a), B = h(b); return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * f)).join(',') + ')';
  };
  // أنبوب اختبار مع ملصق رقم وراسب اختياري
  K.tube = function (ctx, cx, by, w, h, o, cols) {
    o = o || {};
    R.tube(ctx, cx, by, w, h, { level: o.level === undefined ? 0.45 : o.level, color: o.color, solid: o.ppt ? { color: o.ppt, h: o.pptH || 10 } : null, layer: o.layer, bubbles: o.bubbles, t: o.t });
    if (o.num) K.lbl(ctx, o.num, cx, by - h - 12, cols.c5, cols, 13, '800');
    if (o.label) D.txt(ctx, o.label, cx, by + 16, { color: cols.text, size: o.size || 11.5, w: '700' });
    if (o.sub) D.txt(ctx, o.sub, cx, by + 32, { color: cols.muted, size: 10.5, w: '600' });
  };
  // حمام ماء ساخن (كأس كبير بفقاعات)
  K.bath = function (ctx, x, by, w, h, hot, t) {
    R.beaker(ctx, x + w / 2, by, w, h, { level: 0.75, color: hot ? 'rgba(248,113,113,.28)' : 'rgba(96,165,250,.25)', bubbles: hot ? 10 : 0, t: t || 0 });
  };
  K.dropper = function (ctx, x, y, color) {
    ctx.save(); ctx.fillStyle = '#334155'; D.rr(ctx, x - 6, y - 34, 12, 14, 5); ctx.fill();
    ctx.strokeStyle = 'rgba(148,163,184,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 3, y - 20); ctx.lineTo(x - 2, y); ctx.lineTo(x + 2, y); ctx.lineTo(x + 3, y - 20); ctx.stroke();
    if (color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y + 6, 3.2, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  };

  /* ---------- الدارات الكهربائية ---------- */
  K.wire = K12.wire; K.resistor = K12.resistor; K.battery = K12.battery;
  // مصباح: دائرة مع فتيل، يتوهج بشدة glow من 0 إلى 1
  K.bulb = function (ctx, x, y, r, glow, cols, label) {
    ctx.save();
    if (glow > 0.02) { const g = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * (1.6 + glow * 1.6)); g.addColorStop(0, 'rgba(253,224,71,' + (0.55 + 0.4 * glow) + ')'); g.addColorStop(1, 'rgba(253,224,71,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * (1.6 + glow * 1.6), 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = glow > 0.02 ? K.mix('#fef9c3', '#fde047', glow) : cols.bg; ctx.strokeStyle = cols.text; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = glow > 0.02 ? '#b45309' : cols.muted; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(x - r * 0.7, y + r * 0.7); ctx.lineTo(x + r * 0.7, y - r * 0.7); ctx.moveTo(x - r * 0.7, y - r * 0.7); ctx.lineTo(x + r * 0.7, y + r * 0.7); ctx.stroke();
    ctx.restore();
    if (label) K.lbl(ctx, label, x, y - r - 12, cols.text, cols, 11.5);
  };
  // مفتاح بين نقطتين أفقيتين
  K.switchH = function (ctx, x1, y, x2, closed, cols) {
    ctx.save(); ctx.strokeStyle = cols.text; ctx.lineWidth = 2.2; ctx.fillStyle = cols.text;
    [x1, x2].forEach((x) => { ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill(); });
    ctx.beginPath(); ctx.moveTo(x1, y); if (closed) ctx.lineTo(x2, y); else ctx.lineTo(x1 + (x2 - x1) * 0.9, y - Math.abs(x2 - x1) * 0.45); ctx.stroke(); ctx.restore();
  };
  // جهاز قياس دائري: A (أميتر) أو V (فولتميتر) أو Ω (أوميتر)؛ يُكتب الحرف العربي في صيغة الكتاب
  const MK = { A: ['أ', 'A'], V: ['ف', 'V'], 'Ω': ['Ω', 'Ω'] };
  K.meter = function (ctx, x, y, r, kind, reading, cols, color) {
    kind = (MK[kind] || [kind, kind])[ML.isAr() ? 0 : 1];
    ctx.save(); ctx.fillStyle = cols.bg; ctx.strokeStyle = color || cols.c5; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
    D.txt(ctx, kind, x, y, { color: color || cols.c5, size: r * 0.95, w: '800' });
    if (reading !== undefined && reading !== null) K.lbl(ctx, reading, x, y + r + 13, color || cols.c5, cols, 12);
  };
  // نقاط متحركة على مسار مغلق (حركة الشحنات) ؛ pts مسار مضلع، s موضع على طوله
  K.flow = function (ctx, pts, t, speed, n, color) {
    if (speed <= 0) return; const seg = []; let L = 0;
    for (let i = 0; i < pts.length - 1; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); seg.push(l); L += l; }
    ctx.save(); ctx.fillStyle = color;
    for (let k = 0; k < n; k++) {
      let s = ((t * speed + k * L / n) % L + L) % L; let i = 0; while (i < seg.length - 1 && s > seg[i]) { s -= seg[i]; i++; }
      const f = seg[i] ? s / seg[i] : 0; const x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f;
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };
  K.bars = K12.bars; K.barView = K12.barView;
})(typeof window !== 'undefined' ? window : globalThis);
