/* رياضيات الرابع (الجزء الأول) — أدوات مشتركة: الكسور والأعداد الكسرية، رسم الكسور على Canvas، خيارات القوائم */
(function (root) {
  'use strict';
  const ML = root.ML; const M = ML.math; const G9 = ML.m9;
  const G = ML.m4 = {};
  G.S = 'g4-math';
  G.SIMPLE = 'نموذج مبسّط لأغراض التعليم';
  G.SOL = 'نموذج حل مقترح لأغراض التعليم';
  G.reg = (o) => ML.register(Object.assign({ subject: G.S }, o));
  G.narrow = (W) => W < 560;
  G.txt = G9.txt; G.arrow = G9.arrow; G.opts = G9.opts;
  G.L = (s) => (ML.loc ? ML.loc(String(s)) : String(s));

  /* ---------- حساب الكسور ---------- */
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; };
  const lcm = (a, b) => a / gcd(a, b) * b;
  G.gcd = gcd; G.lcm = lcm;
  // أبسط صورة
  G.simp = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };
  // المقارنة: −1 أو 0 أو 1
  G.cmp = (a, b) => Math.sign(a[0] * b[1] - b[0] * a[1]);
  G.sign = (k) => (k > 0 ? '>' : k < 0 ? '<' : '=');
  // عدد كسري ← كسر غير حقيقي، والعكس (القسمة الطويلة)
  G.toImproper = (w, n, d) => [w * d + n, d];
  G.toMixed = (n, d) => [Math.floor(n / d), n % d, d];
  // توحيد المقامات بطريقة الكتاب: إن كان أحد المقامين مضاعفاً للآخر نضرب الأصغر فقط، وإلا نضرب كلاً منهما في مقام الآخر
  G.common = (a, b) => {
    const D = b[1] % a[1] === 0 ? b[1] : a[1] % b[1] === 0 ? a[1] : a[1] * b[1];
    return { D: D, ka: D / a[1], kb: D / b[1], a: [a[0] * D / a[1], D], b: [b[0] * D / b[1], D] };
  };

  /* ---------- صيغ TeX ---------- */
  G.fr = (n, d) => '\\dfrac{' + n + '}{' + d + '}';
  G.mix = (w, n, d) => (n === 0 ? String(w) : (w ? w : '') + '\\dfrac{' + n + '}{' + d + '}');
  // كسر بأبسط صورة، وعدد كسري إن كان غير حقيقي
  G.nice = (n, d) => {
    const s = G.simp(n, d); if (s[1] === 1) return String(s[0]);
    return s[0] > s[1] ? G.mix(Math.floor(s[0] / s[1]), s[0] % s[1], s[1]) : G.fr(s[0], s[1]);
  };
  // نص بسيط للقوائم: «٢ ١/٤»
  G.mixTxt = (w, n, d) => (n === 0 ? String(w) : (w ? w + ' ' : '') + n + '/' + d);

  /* ---------- الرسم ---------- */
  // كسر عمودي على Canvas (البسط فوق الخط والمقام تحته)، يُرجع عرضه
  G.frac = function (ctx, n, d, x, y, o) {
    o = o || {}; const fs = o.size || 16;
    ctx.save(); ctx.font = (o.w || '800') + ' ' + fs + 'px system-ui, Tajawal, sans-serif';
    const w = Math.max(ctx.measureText(G.L(n)).width, ctx.measureText(G.L(d)).width) + 6; ctx.restore();
    G.txt(ctx, n, x, y - fs * 0.62, { color: o.color, size: fs, w: o.w || '800', halo: o.halo });
    G.txt(ctx, d, x, y + fs * 0.66, { color: o.color, size: fs, w: o.w || '800', halo: o.halo });
    ctx.save(); ctx.strokeStyle = o.color; ctx.lineWidth = Math.max(1.5, fs / 10); ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x + w / 2, y); ctx.stroke(); ctx.restore();
    return w;
  };
  // عدد كسري بترتيب الكتاب: العدد الصحيح يمين الكسر
  G.mixed = function (ctx, w, n, d, x, y, o) {
    o = o || {}; const fs = o.size || 16;
    if (!n) { G.txt(ctx, w, x, y, { color: o.color, size: fs * 1.15, w: '800', halo: o.halo }); return; }
    if (!w) { G.frac(ctx, n, d, x, y, o); return; }
    G.txt(ctx, w, x + fs * 0.62, y, { color: o.color, size: fs * 1.15, w: '800', halo: o.halo });
    G.frac(ctx, n, d, x - fs * 0.45, y, o);
  };
  // شريط كسر: d أجزاء متساوية، n منها مظللة (من اليمين كما في رسوم الكتاب)
  G.bar = function (ctx, x, y, w, h, n, d, col, c, o) {
    o = o || {}; const pw = w / d;
    for (let i = 0; i < d; i++) {
      const px = o.ltr ? x + i * pw : x + w - (i + 1) * pw; const on = i < n;
      ctx.fillStyle = on ? col : 'transparent'; if (on) { ctx.globalAlpha = o.alpha || 0.85; ctx.fillRect(px, y, pw, h); ctx.globalAlpha = 1; }
      ctx.strokeStyle = c.text; ctx.lineWidth = 1.4; ctx.strokeRect(px, y, pw, h);
    }
  };
  // دائرة مقسمة إلى d قطاعات، n منها مظللة
  G.pie = function (ctx, cx, cy, r, n, d, col, c) {
    for (let i = 0; i < d; i++) {
      const a0 = -Math.PI / 2 + i * 2 * Math.PI / d, a1 = a0 + 2 * Math.PI / d;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a0, a1); ctx.closePath();
      if (i < n) { ctx.fillStyle = col; ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1; }
      ctx.strokeStyle = c.text; ctx.lineWidth = 1.4; ctx.stroke();
    }
    if (d === 1) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.strokeStyle = c.text; ctx.stroke(); }
  };
  // صندوق إطار مستدير
  G.box = function (ctx, x, y, w, h, col, fill) {
    ctx.save(); ctx.beginPath(); const r = 8;
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (col) { ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.stroke(); }
    ctx.restore();
  };
})(typeof window !== 'undefined' ? window : globalThis);
