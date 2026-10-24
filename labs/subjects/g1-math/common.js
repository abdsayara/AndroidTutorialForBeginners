/* رياضيات الأول (الجزء الأول) — أدوات مشتركة: رسوم أشياء الكتاب، صفوف العدّ بالنقر، أصابع اليد، كلمات الأعداد والأعداد الترتيبية */
(function (root) {
  'use strict';
  const ML = root.ML; const G4 = ML.m4;
  const G = ML.m1 = {};
  G.S = 'g1-math';
  G.SIMPLE = 'نموذج مبسّط لأغراض التعليم';
  G.reg = (o) => ML.register(Object.assign({ subject: G.S }, o));
  G.narrow = (W) => W < 560;
  G.txt = G4.txt; G.arrow = G4.arrow; G.box = G4.box; G.opts = G4.opts; G.L = G4.L;
  G.sign = (k) => (k > 0 ? '>' : k < 0 ? '<' : '=');

  G.WORD = ['صفر', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
  G.ORD_M = ['', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع'];
  G.ORD_F = ['', 'الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة', 'الثامنة', 'التاسعة'];

  /* ---------- رسوم بسيطة لأشياء الكتاب (مركز cx,cy وحجم s) ---------- */
  const circ = (ctx, x, y, r, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); };
  const ell = (ctx, x, y, rx, ry, col, rot) => { ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, 7); ctx.fill(); };
  const poly = (ctx, pts, col) => { ctx.fillStyle = col; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fill(); };
  const rect = (ctx, x, y, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(x, y, w, h); };
  const person = (ctx, x, y, s, shirt, hair, skirt) => {
    circ(ctx, x, y - s * 0.28, s * 0.16, '#f6c9a0'); ell(ctx, x, y - s * 0.38, s * 0.17, s * 0.08, hair);
    poly(ctx, skirt ? [[x - s * 0.12, y - s * 0.1], [x + s * 0.12, y - s * 0.1], [x + s * 0.22, y + s * 0.2], [x - s * 0.22, y + s * 0.2]] : [[x - s * 0.14, y - s * 0.1], [x + s * 0.14, y - s * 0.1], [x + s * 0.14, y + s * 0.15], [x - s * 0.14, y + s * 0.15]], shirt);
    rect(ctx, x - s * 0.1, y + s * 0.15, s * 0.07, s * 0.28, '#334155'); rect(ctx, x + s * 0.03, y + s * 0.15, s * 0.07, s * 0.28, '#334155');
  };
  const ICONS = {
    boy: (c, x, y, s) => person(c, x, y, s, '#f97316', '#1e3a8a'),
    girl: (c, x, y, s) => person(c, x, y, s, '#ec4899', '#7c2d12', true),
    bird: (c, x, y, s) => { ell(c, x, y, s * 0.3, s * 0.2, '#60a5fa'); circ(c, x + s * 0.24, y - s * 0.14, s * 0.13, '#93c5fd'); poly(c, [[x + s * 0.35, y - s * 0.14], [x + s * 0.48, y - s * 0.1], [x + s * 0.35, y - s * 0.06]], '#f59e0b'); poly(c, [[x - s * 0.05, y - s * 0.05], [x - s * 0.3, y - s * 0.35], [x + s * 0.1, y - s * 0.1]], '#3b82f6'); circ(c, x + s * 0.27, y - s * 0.17, s * 0.03, '#111'); },
    tree: (c, x, y, s) => { rect(c, x - s * 0.06, y, s * 0.12, s * 0.42, '#92400e'); circ(c, x, y - s * 0.12, s * 0.3, '#16a34a'); circ(c, x - s * 0.2, y + s * 0.02, s * 0.18, '#22c55e'); circ(c, x + s * 0.2, y + s * 0.02, s * 0.18, '#22c55e'); },
    bee: (c, x, y, s) => { ell(c, x - s * 0.08, y - s * 0.22, s * 0.14, s * 0.1, '#bae6fd'); ell(c, x + s * 0.1, y - s * 0.22, s * 0.14, s * 0.1, '#bae6fd'); ell(c, x, y, s * 0.3, s * 0.2, '#facc15'); rect(c, x - s * 0.08, y - s * 0.19, s * 0.07, s * 0.38, '#111'); rect(c, x + s * 0.08, y - s * 0.19, s * 0.07, s * 0.38, '#111'); circ(c, x + s * 0.32, y, s * 0.1, '#111'); },
    ant: (c, x, y, s) => { circ(c, x - s * 0.25, y, s * 0.12, '#1e3a8a'); ell(c, x, y, s * 0.13, s * 0.1, '#1e40af'); ell(c, x + s * 0.27, y, s * 0.18, s * 0.13, '#1e3a8a'); c.strokeStyle = '#1e3a8a'; c.lineWidth = 2; for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(x + i * s * 0.08, y); c.lineTo(x + i * s * 0.16, y + s * 0.28); c.stroke(); } },
    duck: (c, x, y, s) => { ell(c, x, y + s * 0.08, s * 0.32, s * 0.2, '#fde68a'); circ(c, x + s * 0.2, y - s * 0.16, s * 0.15, '#16a34a'); poly(c, [[x + s * 0.32, y - s * 0.16], [x + s * 0.48, y - s * 0.12], [x + s * 0.32, y - s * 0.08]], '#f97316'); circ(c, x + s * 0.24, y - s * 0.2, s * 0.03, '#111'); },
    hen: (c, x, y, s) => { ell(c, x, y + s * 0.05, s * 0.28, s * 0.24, '#fbbf24'); circ(c, x + s * 0.22, y - s * 0.2, s * 0.13, '#fbbf24'); poly(c, [[x + s * 0.18, y - s * 0.32], [x + s * 0.24, y - s * 0.42], [x + s * 0.3, y - s * 0.32]], '#dc2626'); poly(c, [[x + s * 0.33, y - s * 0.2], [x + s * 0.45, y - s * 0.17], [x + s * 0.33, y - s * 0.13]], '#f97316'); poly(c, [[x - s * 0.25, y - s * 0.05], [x - s * 0.42, y - s * 0.25], [x - s * 0.3, y + s * 0.1]], '#b45309'); },
    sheep: (c, x, y, s) => { for (let i = -1; i <= 1; i++) circ(c, x + i * s * 0.15, y - s * 0.02, s * 0.18, '#f1f5f9'); circ(c, x, y + s * 0.08, s * 0.2, '#e2e8f0'); ell(c, x + s * 0.32, y - s * 0.05, s * 0.12, s * 0.1, '#f9a8d4'); rect(c, x - s * 0.2, y + s * 0.2, s * 0.05, s * 0.2, '#334155'); rect(c, x + s * 0.15, y + s * 0.2, s * 0.05, s * 0.2, '#334155'); c.strokeStyle = '#94a3b8'; c.lineWidth = 1; c.beginPath(); c.arc(x, y, s * 0.32, 0, 7); c.stroke(); },
    fish: (c, x, y, s) => { ell(c, x, y, s * 0.32, s * 0.18, '#38bdf8'); poly(c, [[x - s * 0.28, y], [x - s * 0.48, y - s * 0.18], [x - s * 0.48, y + s * 0.18]], '#f472b6'); circ(c, x + s * 0.2, y - s * 0.04, s * 0.04, '#111'); },
    rabbit: (c, x, y, s) => { ell(c, x - s * 0.06, y - s * 0.38, s * 0.06, s * 0.18, '#e7e5e4'); ell(c, x + s * 0.08, y - s * 0.38, s * 0.06, s * 0.18, '#e7e5e4'); circ(c, x, y - s * 0.12, s * 0.17, '#f5f5f4'); ell(c, x, y + s * 0.2, s * 0.24, s * 0.2, '#e7e5e4'); circ(c, x + s * 0.06, y - s * 0.15, s * 0.03, '#111'); },
    orange: (c, x, y, s) => { circ(c, x, y, s * 0.32, '#f97316'); ell(c, x + s * 0.08, y - s * 0.32, s * 0.1, s * 0.05, '#16a34a', -0.5); },
    apple: (c, x, y, s) => { circ(c, x - s * 0.12, y, s * 0.24, '#dc2626'); circ(c, x + s * 0.12, y, s * 0.24, '#dc2626'); rect(c, x - s * 0.02, y - s * 0.38, s * 0.04, s * 0.16, '#78350f'); ell(c, x + s * 0.1, y - s * 0.32, s * 0.1, s * 0.05, '#16a34a', -0.4); },
    carrot: (c, x, y, s) => { poly(c, [[x - s * 0.12, y - s * 0.22], [x + s * 0.12, y - s * 0.22], [x, y + s * 0.42]], '#f97316'); poly(c, [[x, y - s * 0.22], [x - s * 0.15, y - s * 0.45], [x + s * 0.02, y - s * 0.3], [x + s * 0.15, y - s * 0.45]], '#16a34a'); },
    strawberry: (c, x, y, s) => { poly(c, [[x - s * 0.26, y - s * 0.15], [x + s * 0.26, y - s * 0.15], [x, y + s * 0.35]], '#e11d48'); circ(c, x - s * 0.13, y - s * 0.12, s * 0.14, '#e11d48'); circ(c, x + s * 0.13, y - s * 0.12, s * 0.14, '#e11d48'); poly(c, [[x - s * 0.18, y - s * 0.24], [x, y - s * 0.36], [x + s * 0.18, y - s * 0.24], [x, y - s * 0.18]], '#16a34a'); },
    ball: (c, x, y, s) => { circ(c, x, y, s * 0.32, '#f8fafc'); c.strokeStyle = '#111'; c.lineWidth = 1.5; c.beginPath(); c.arc(x, y, s * 0.32, 0, 7); c.stroke(); poly(c, [[x, y - s * 0.12], [x + s * 0.11, y - s * 0.04], [x + s * 0.07, y + s * 0.1], [x - s * 0.07, y + s * 0.1], [x - s * 0.11, y - s * 0.04]], '#111'); },
    balloon: (c, x, y, s, col) => { ell(c, x, y - s * 0.1, s * 0.22, s * 0.28, col || '#ef4444'); c.strokeStyle = '#64748b'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y + s * 0.18); c.quadraticCurveTo(x - s * 0.1, y + s * 0.3, x, y + s * 0.45); c.stroke(); },
    flag: (c, x, y, s) => { rect(c, x - s * 0.3, y - s * 0.4, s * 0.04, s * 0.8, '#475569'); rect(c, x - s * 0.26, y - s * 0.4, s * 0.56, s * 0.12, '#111'); rect(c, x - s * 0.26, y - s * 0.28, s * 0.56, s * 0.12, '#f8fafc'); rect(c, x - s * 0.26, y - s * 0.16, s * 0.56, s * 0.12, '#16a34a'); poly(c, [[x - s * 0.26, y - s * 0.4], [x - s * 0.04, y - s * 0.22], [x - s * 0.26, y - s * 0.04]], '#dc2626'); },
    bus: (c, x, y, s) => { rect(c, x - s * 0.42, y - s * 0.22, s * 0.84, s * 0.4, '#f59e0b'); for (let i = 0; i < 3; i++) rect(c, x - s * 0.36 + i * s * 0.26, y - s * 0.16, s * 0.2, s * 0.14, '#bae6fd'); circ(c, x - s * 0.24, y + s * 0.2, s * 0.08, '#111'); circ(c, x + s * 0.24, y + s * 0.2, s * 0.08, '#111'); },
    boat: (c, x, y, s) => { poly(c, [[x - s * 0.36, y + s * 0.1], [x + s * 0.36, y + s * 0.1], [x + s * 0.24, y + s * 0.28], [x - s * 0.24, y + s * 0.28]], '#dc2626'); poly(c, [[x, y - s * 0.4], [x, y + s * 0.06], [x + s * 0.3, y + s * 0.06]], '#facc15'); poly(c, [[x - s * 0.04, y - s * 0.3], [x - s * 0.04, y + s * 0.06], [x - s * 0.26, y + s * 0.06]], '#fde047'); },
    candle: (c, x, y, s, col) => { rect(c, x - s * 0.07, y - s * 0.2, s * 0.14, s * 0.6, col || '#818cf8'); ell(c, x, y - s * 0.3, s * 0.06, s * 0.11, '#f59e0b'); },
    cup: (c, x, y, s) => { poly(c, [[x - s * 0.25, y - s * 0.25], [x + s * 0.25, y - s * 0.25], [x + s * 0.18, y + s * 0.3], [x - s * 0.18, y + s * 0.3]], '#ea580c'); ell(c, x, y - s * 0.25, s * 0.25, s * 0.07, '#7c2d12'); },
    flower: (c, x, y, s) => { for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; circ(c, x + Math.cos(a) * s * 0.17, y + Math.sin(a) * s * 0.17, s * 0.13, '#f472b6'); } circ(c, x, y, s * 0.1, '#facc15'); },
    hoop: (c, x, y, s) => { c.strokeStyle = '#3b82f6'; c.lineWidth = Math.max(2, s * 0.06); c.beginPath(); c.ellipse(x, y, s * 0.38, s * 0.12, 0, 0, 7); c.stroke(); },
    car: (c, x, y, s) => { rect(c, x - s * 0.38, y - s * 0.05, s * 0.76, s * 0.22, '#84cc16'); poly(c, [[x - s * 0.22, y - s * 0.05], [x - s * 0.12, y - s * 0.25], [x + s * 0.14, y - s * 0.25], [x + s * 0.24, y - s * 0.05]], '#a3e635'); circ(c, x - s * 0.22, y + s * 0.19, s * 0.08, '#111'); circ(c, x + s * 0.22, y + s * 0.19, s * 0.08, '#111'); },
    banana: (c, x, y, s) => { c.strokeStyle = '#facc15'; c.lineWidth = s * 0.14; c.lineCap = 'round'; c.beginPath(); c.arc(x, y - s * 0.2, s * 0.32, 0.3, Math.PI - 0.3); c.stroke(); c.lineCap = 'butt'; },
    house: (c, x, y, s) => { rect(c, x - s * 0.26, y - s * 0.05, s * 0.52, s * 0.36, '#f97316'); poly(c, [[x - s * 0.34, y - s * 0.03], [x, y - s * 0.36], [x + s * 0.34, y - s * 0.03]], '#ea580c'); rect(c, x - s * 0.06, y + s * 0.1, s * 0.12, s * 0.21, '#fff'); },
    chair: (c, x, y, s) => { rect(c, x - s * 0.22, y - s * 0.38, s * 0.07, s * 0.76, '#a16207'); rect(c, x - s * 0.22, y, s * 0.44, s * 0.08, '#ca8a04'); rect(c, x + s * 0.15, y, s * 0.07, s * 0.38, '#a16207'); },
    tractor: (c, x, y, s) => { rect(c, x - s * 0.3, y - s * 0.12, s * 0.5, s * 0.22, '#dc2626'); rect(c, x - s * 0.05, y - s * 0.32, s * 0.22, s * 0.22, '#ef4444'); circ(c, x - s * 0.2, y + s * 0.17, s * 0.15, '#111'); circ(c, x + s * 0.22, y + s * 0.2, s * 0.1, '#111'); },
    dog: (c, x, y, s) => { ell(c, x, y + s * 0.05, s * 0.28, s * 0.16, '#d6a76c'); circ(c, x + s * 0.26, y - s * 0.14, s * 0.14, '#d6a76c'); ell(c, x + s * 0.18, y - s * 0.14, s * 0.06, s * 0.13, '#92400e'); for (const dx of [-0.2, -0.08, 0.08, 0.2]) rect(c, x + dx * s, y + s * 0.15, s * 0.05, s * 0.2, '#92400e'); },
    pencil: (c, x, y, s) => { c.save(); c.translate(x, y); c.rotate(-0.8); rect(c, -s * 0.06, -s * 0.36, s * 0.12, s * 0.58, '#facc15'); poly(c, [[-s * 0.06, s * 0.22], [s * 0.06, s * 0.22], [0, s * 0.38]], '#f5d0a9'); c.restore(); },
    kite: (c, x, y, s, col) => { poly(c, [[x, y - s * 0.38], [x + s * 0.24, y - s * 0.05], [x, y + s * 0.3], [x - s * 0.24, y - s * 0.05]], col || '#ef4444'); },
    frog: (c, x, y, s) => { ell(c, x, y, s * 0.3, s * 0.22, '#22c55e'); circ(c, x - s * 0.13, y - s * 0.2, s * 0.09, '#22c55e'); circ(c, x + s * 0.13, y - s * 0.2, s * 0.09, '#22c55e'); circ(c, x - s * 0.13, y - s * 0.21, s * 0.04, '#111'); circ(c, x + s * 0.13, y - s * 0.21, s * 0.04, '#111'); },
    heart: (c, x, y, s, col) => { col = col || '#e11d48'; circ(c, x - s * 0.13, y - s * 0.08, s * 0.16, col); circ(c, x + s * 0.13, y - s * 0.08, s * 0.16, col); poly(c, [[x - s * 0.28, y - s * 0.02], [x + s * 0.28, y - s * 0.02], [x, y + s * 0.32]], col); },
    star: (c, x, y, s, col) => { const p = []; for (let i = 0; i < 10; i++) { const r = i % 2 ? s * 0.15 : s * 0.36, a = -Math.PI / 2 + i * Math.PI / 5; p.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } poly(c, p, col || '#f59e0b'); },
    circle: (c, x, y, s, col) => circ(c, x, y, s * 0.3, col || '#0ea5e9'),
    square: (c, x, y, s, col) => rect(c, x - s * 0.27, y - s * 0.27, s * 0.54, s * 0.54, col || '#16a34a'),
    triangle: (c, x, y, s, col) => poly(c, [[x, y - s * 0.3], [x + s * 0.34, y + s * 0.26], [x - s * 0.34, y + s * 0.26]], col || '#db2777'),
    pepper: (c, x, y, s) => { ell(c, x - s * 0.1, y + s * 0.05, s * 0.18, s * 0.28, '#dc2626'); ell(c, x + s * 0.1, y + s * 0.05, s * 0.18, s * 0.28, '#b91c1c'); rect(c, x - s * 0.03, y - s * 0.38, s * 0.06, s * 0.16, '#16a34a'); },
    moon: (c, x, y, s) => { circ(c, x, y, s * 0.32, '#fde68a'); circ(c, x + s * 0.14, y - s * 0.06, s * 0.28, '#1e293b'); },
    bear: (c, x, y, s) => { circ(c, x - s * 0.18, y - s * 0.26, s * 0.09, '#b45309'); circ(c, x + s * 0.18, y - s * 0.26, s * 0.09, '#b45309'); circ(c, x, y - s * 0.12, s * 0.2, '#d97706'); ell(c, x, y + s * 0.22, s * 0.24, s * 0.18, '#d97706'); circ(c, x, y - s * 0.06, s * 0.07, '#fde68a'); },
    smile: (c, x, y, s) => { circ(c, x, y, s * 0.32, '#facc15'); circ(c, x - s * 0.1, y - s * 0.08, s * 0.04, '#111'); circ(c, x + s * 0.1, y - s * 0.08, s * 0.04, '#111'); c.strokeStyle = '#111'; c.lineWidth = 2; c.beginPath(); c.arc(x, y + s * 0.02, s * 0.15, 0.3, Math.PI - 0.3); c.stroke(); }
  };
  G.ICONS = ICONS;
  G.icon = (ctx, kind, x, y, s, col) => { ctx.save(); (ICONS[kind] || ICONS.circle)(ctx, x, y, s, col); ctx.restore(); };

  // صف/شبكة من n أشياء داخل مستطيل؛ يُرجع مواقعها ويضيف مناطق النقر
  G.layout = function (n, x, y, w, h, maxS) {
    let best = null;
    for (let cols = 1; cols <= Math.max(1, n); cols++) { const rows = Math.ceil(n / cols); const s = Math.min(w / cols, h / rows, maxS || 90); if (!best || s > best.s) best = { cols: cols, rows: rows, s: s }; }
    const pts = []; const gw = best.cols * best.s, gh = best.rows * best.s;
    for (let i = 0; i < n; i++) { const r = Math.floor(i / best.cols), cI = i % best.cols; const inRow = r === best.rows - 1 ? n - r * best.cols : best.cols; const off = (best.cols - inRow) * best.s / 2; pts.push([x + w / 2 + gw / 2 - off - (cI + 0.5) * best.s, y + h / 2 - gh / 2 + (r + 0.5) * best.s]); }
    return { pts: pts, s: best.s };
  };
  // رسم مجموعة مع أرقام العدّ فوق ما نُقر (المرتب من اليمين كما يعدّ الطفل في الكتاب)
  G.group = function (ctx, kind, n, x, y, w, h, c, o) {
    o = o || {}; const L = G.layout(n, x, y, w, h, o.maxS);
    L.pts.forEach((p, i) => {
      const k = o.counted ? o.counted.indexOf(i) : -1;
      if (k >= 0) { ctx.save(); ctx.fillStyle = 'rgba(250,204,21,.28)'; ctx.beginPath(); ctx.arc(p[0], p[1], L.s * 0.46, 0, 7); ctx.fill(); ctx.restore(); }
      G.icon(ctx, kind, p[0], p[1], L.s * 0.9, o.col);
      if (k >= 0) G.txt(ctx, k + 1, p[0], p[1] - L.s * 0.42, { color: c.c2, size: Math.max(13, L.s * 0.3), w: '800', halo: c.bg });
      if (o.hits) o.hits.push({ x: p[0] - L.s / 2, y: p[1] - L.s / 2, w: L.s, h: L.s, i: i, tag: o.tag });
    });
    return L;
  };
  // أصابع يد (أو يدين) بعدد n
  G.hands = function (ctx, n, x, y, s, c) {
    const one = (cx, k) => {
      ctx.save(); ctx.fillStyle = '#fcd9b6'; ctx.strokeStyle = '#b45309'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx - s * 0.32, y - s * 0.05, s * 0.64, s * 0.5, s * 0.12) : ctx.rect(cx - s * 0.32, y - s * 0.05, s * 0.64, s * 0.5); ctx.fill(); ctx.stroke();
      for (let f = 0; f < 5; f++) {
        const up = f < k; const fx = cx + s * 0.24 - f * s * 0.12; const fh = up ? s * (f === 4 ? 0.3 : 0.45) : s * 0.12;
        ctx.beginPath(); ctx.rect(fx - s * 0.05, y - fh, s * 0.1, fh); ctx.fill(); ctx.stroke();
      }
      ctx.restore();
    };
    if (n <= 5) one(x, n); else { one(x + s * 0.4, 5); one(x - s * 0.4, n - 5); }
  };
  // بطاقات أرقام للاختيار (١–٩)
  G.cards = function (ctx, nums, x, y, w, h, c, o) {
    o = o || {}; const n = nums.length; const cw = Math.min(64, w / n - 6);
    nums.forEach((v, i) => {
      const cx = x + w / 2 + (n / 2 - i - 0.5) * (cw + 6); const on = o.sel === v; const good = o.good === v;
      G.box(ctx, cx - cw / 2, y, cw, h, on ? (good ? c.c3 : c.c2) : c.c1, on ? (good ? 'rgba(5,150,105,.18)' : 'rgba(220,38,38,.12)') : 'rgba(37,99,235,.06)');
      G.txt(ctx, v, cx, y + h / 2, { color: on ? (good ? c.c3 : c.c2) : c.text, size: Math.min(30, h * 0.6), w: '800' });
      if (o.hits) o.hits.push({ x: cx - cw / 2, y: y, w: cw, h: h, v: v, tag: o.tag || 'card' });
    });
  };
  // رقم كبير مفرّغ يمتلئ عند اكتمال العدّ (كصفحة «ألوّن»)
  G.bigDigit = function (ctx, n, x, y, size, c, filled) {
    ctx.save(); ctx.font = '800 ' + size + 'px system-ui, Tajawal, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const t = G.L(n); ctx.lineWidth = 3; ctx.strokeStyle = c.text; if (filled) { ctx.fillStyle = c.c1; ctx.fillText(t, x, y); } ctx.strokeText(t, x, y); ctx.restore();
  };
})(typeof window !== 'undefined' ? window : globalThis);
