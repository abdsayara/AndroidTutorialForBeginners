/* الفيزياء — الوحدة الأولى: الفصل الأول (الفيزياء والقياس) والفصل الثاني (المتجهات) */
(function (root) {
  'use strict';
  const ML = root.ML; const M = ML.math; const P = ML.phys;
  const S = 'g10-physics';
  const q = P.q;

  /* ---------- أدوات رسم مشتركة للفيزياء (Canvas) ---------- */
  const D = ML.pdraw = {};
  D.txt = function (ctx, s, x, y, o) {
    o = o || {}; ctx.save();
    ctx.font = (o.w || '600') + ' ' + (o.size || 13) + 'px system-ui, Tajawal, sans-serif';
    ctx.fillStyle = o.color; ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.base || 'middle';
    const ar = /[\u0600-\u06FF]/.test(s); ctx.direction = ar ? 'rtl' : 'ltr';
    if (o.halo) { ctx.lineWidth = 3.5; ctx.strokeStyle = o.halo; ctx.strokeText(ar ? ML.bidi(s) : s, x, y); }
    ctx.fillText(ar ? ML.bidi(s) : s, x, y); ctx.restore();
  };
  D.arrow = function (ctx, x1, y1, x2, y2, color, w) {
    const L = Math.hypot(x2 - x1, y2 - y1); if (L < 1) return;
    ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w || 3; ctx.lineCap = 'round';
    const a = Math.atan2(y2 - y1, x2 - x1), h = Math.min(14, L * 0.45);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - h * 0.6 * Math.cos(a), y2 - h * 0.6 * Math.sin(a)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - h * Math.cos(a - 0.38), y2 - h * Math.sin(a - 0.38)); ctx.lineTo(x2 - h * Math.cos(a + 0.38), y2 - h * Math.sin(a + 0.38)); ctx.closePath(); ctx.fill();
    ctx.restore();
  };
  D.rr = function (ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
  D.spring = function (ctx, x1, y1, x2, y2, coils, amp, color) {
    const L = Math.hypot(x2 - x1, y2 - y1), a = Math.atan2(y2 - y1, x2 - x1); const n = coils * 2;
    ctx.save(); ctx.translate(x1, y1); ctx.rotate(a); ctx.strokeStyle = color; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(0, 0);
    const lead = Math.min(14, L * 0.12); ctx.lineTo(lead, 0);
    for (let i = 1; i < n; i++) ctx.lineTo(lead + (L - 2 * lead) * i / n, (i % 2 ? -1 : 1) * amp);
    ctx.lineTo(L - lead, 0); ctx.lineTo(L, 0); ctx.stroke(); ctx.restore();
  };
  // سلسلة زمنية تُخزن للرسم البياني
  D.pushSeries = function (st, t, vals, maxN) { st.series = st.series || []; st.series.push([t].concat(vals)); if (st.series.length > (maxN || 3000)) st.series.shift(); };
  // رسم سلسلة على Plot
  D.series = function (G, pts, color, w) {
    if (!pts || pts.length < 2) return; const ctx = G.ctx; ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w || 2.5; ctx.lineJoin = 'round'; ctx.beginPath();
    pts.forEach((p, i) => { const X = G.X(p[0]), Y = G.Y(p[1]); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.stroke(); ctx.restore();
  };
  D.niceMax = (v, min) => { v = Math.max(Math.abs(v), min || 1e-9); const s = ML.niceStep(v / 4); return Math.ceil(v / s) * s; };

  /* ======================= 1-4 أدوات القياس: الورنية والميكروميتر ======================= */
  ML.register({
    subject: S, id: 'vernier', unit: 1, order: 1, lesson: '1-4', lessonTitle: 'أنظمة القياس (الورنية والميكروميتر)', page: 7,
    titleAr: 'القياس بالورنية والميكروميتر', titleEn: 'Vernier Caliper & Micrometer Readings', tags: 'ورنيه ميكروميتر قياس دقه طول',
    formula: '\\text{reading} = \\text{main scale} + n \\times \\text{least count}',
    book: 'القراءة = قراءة الذراع المدرج + قراءة المنزلقة (الورنية) ؛ القراءة = التدريج الثابت + التدريج الدائري (الميكروميتر)',
    summary: 'نقرأ أولاً التدريج الرئيسي عند صفر المنزلقة (أو حافة الأسطوانة)، ثم نضيف رقم التدريج الأكثر انطباقاً مضروباً في أصغر قيمة يقيسها الجهاز.',
    vars: [['L', 'الطول الحقيقي للجسم المقاس', '\\text{mm}', '0 – 60 ملم (الورنية)، 0 – 25 ملم (الميكروميتر)'], ['n', 'رقم التدريج المنطبق على المنزلقة/الأسطوانة', '—', 'عدد صحيح'], ['\\text{l.c.}', 'أصغر قراءة للجهاز', '\\text{mm}', '0.05 (ورنية) ، 0.01 (ميكروميتر)']],
    assumptions: ['الجهاز مُعاير: صفر المنزلقة ينطبق على صفر الذراع المدرج عند إغلاق الفكين (ص 9).', 'الورنية هنا ذات 20 قسماً (أصغر قراءة 0.05 ملم).'],
    params: [
      { key: 'tool', label: '\\text{tool}', type: 'select', value: 'vernier', options: [['vernier', 'الورنية (Vernier)'], ['micro', 'الميكروميتر (Micrometer)']] },
      { key: 'L', label: 'L\\ (\\mathrm{mm})', min: 0, max: 60, step: 0.01, value: 35.15, desc: 'سمك/قطر الجسم' }
    ],
    onSet(p) { if (p.tool === 'micro' && p.L > 25) p.L = 8.62; },
    custom: true, canvasHint: 'حرّك المنزلق لتغيير سمك الجسم؛ التدريج المنطبق مظلل باللون الأخضر.',
    compute(p) {
      const lc = p.tool === 'vernier' ? 0.05 : 0.01;
      const L = Math.min(p.L, p.tool === 'vernier' ? 60 : 25);
      const reading = Math.round(L / lc) * lc;
      if (p.tool === 'vernier') { const main = Math.floor(reading + 1e-9); const n = Math.round((reading - main) / lc); return { lc: lc, L: L, main: main, n: n, reading: M.round(main + n * lc, 4), err: L - reading }; }
      const sleeve = Math.floor(reading * 2 + 1e-9) / 2; const n = Math.round((reading - sleeve) / lc);
      return { lc: lc, L: L, main: sleeve, n: n, reading: M.round(sleeve + n * lc, 4), err: L - reading };
    },
    drawCustom(ctx, W, H, p, d, c) {
      if (p.tool === 'vernier') {
        const mm = Math.min(14, (W - 60) / 64); const x0 = 30, y = H * 0.45;
        // الذراع المدرج
        ctx.fillStyle = c.grid; ctx.fillRect(x0 - 10, y - 46, mm * 62 + 20, 46);
        ctx.strokeStyle = c.axis; ctx.lineWidth = 1;
        for (let i = 0; i <= 60; i++) { const X = x0 + i * mm; ctx.beginPath(); ctx.moveTo(X, y); ctx.lineTo(X, y - (i % 10 === 0 ? 22 : i % 5 === 0 ? 15 : 9)); ctx.stroke(); if (i % 10 === 0) D.txt(ctx, String(i / 10), X, y - 32, { color: c.text, size: 12 }); }
        D.txt(ctx, 'cm', x0 + 61 * mm, y - 32, { color: c.muted, size: 11 });
        // الجسم بين الفكين
        ctx.fillStyle = c.c4; ctx.globalAlpha = 0.35; ctx.fillRect(x0, y + 4, d.L * mm, 70); ctx.globalAlpha = 1;
        // المنزلقة: 20 قسماً تمتد على 39 ملم (1.95 ملم لكل قسم) — ورنية 0.05 ملم
        const vx = x0 + d.L * mm; const div = 1.95;
        ctx.fillStyle = c.c1; ctx.globalAlpha = 0.12; ctx.fillRect(vx - 4, y, div * 20 * mm + 8, 40); ctx.globalAlpha = 1;
        for (let k = 0; k <= 20; k++) {
          const X = vx + k * div * mm; const hit = k === d.n;
          ctx.strokeStyle = hit ? c.c3 : c.c1; ctx.lineWidth = hit ? 3 : 1.2; ctx.beginPath(); ctx.moveTo(X, y); ctx.lineTo(X, y + (k % 2 === 0 ? 16 : 10)); ctx.stroke();
          if (k % 4 === 0) D.txt(ctx, String(k * 5), X, y + 26, { color: hit ? c.c3 : c.c1, size: 10 });
        }
        if (d.n > 0) { const X = vx + d.n * div * mm; ctx.strokeStyle = c.c3; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X, y - 30); ctx.lineTo(X, y + 40); ctx.stroke(); ctx.setLineDash([]); }
        D.arrow(ctx, vx, y + 60, vx, y + 4, c.c2, 2);
        D.txt(ctx, 'صفر المنزلقة بعد ' + d.main + ' ملم', vx, y + 72, { color: c.c2, size: 12 });
        D.txt(ctx, 'القراءة = ' + d.main + ' + ' + d.n + ' × 0.05 = ' + d.reading.toFixed(2) + ' ملم', W / 2, H - 28, { color: c.text, size: 16, w: '700' });
      } else {
        const cx = W * 0.42, y = H * 0.48, mm = Math.min(16, (W * 0.5) / 26);
        // الأسطوانة الثابتة (Sleeve)
        ctx.fillStyle = c.grid; ctx.fillRect(cx - 26 * mm, y - 16, 26 * mm, 32);
        ctx.strokeStyle = c.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx - 26 * mm, y); ctx.lineTo(cx, y); ctx.stroke();
        const shown = d.main; const left = cx - shown * mm;
        for (let i = 0; i <= shown * 2 + 1e-9; i++) { const X = left + i * mm / 2; ctx.beginPath(); ctx.moveTo(X, y); ctx.lineTo(X, i % 2 === 0 ? y - 12 : y + 10); ctx.stroke(); if (i % 10 === 0) D.txt(ctx, String(i / 2), X, y - 22, { color: c.text, size: 11 }); }
        // الأسطوانة الدوارة (Thimble) — 50 قسماً كل قسم 0.01 ملم
        ctx.fillStyle = c.c1; ctx.globalAlpha = 0.15; D.rr(ctx, cx, y - 46, 70, 92, 8); ctx.fill(); ctx.globalAlpha = 1;
        const step = 8;
        for (let k = -5; k <= 5; k++) {
          const val = ((d.n + k) % 50 + 50) % 50; const Y = y + k * step;
          ctx.strokeStyle = k === 0 ? c.c3 : c.c1; ctx.lineWidth = k === 0 ? 3 : 1.2; ctx.beginPath(); ctx.moveTo(cx, Y); ctx.lineTo(cx + (val % 5 === 0 ? 22 : 12), Y); ctx.stroke();
          if (val % 5 === 0) D.txt(ctx, String(val), cx + 38, Y, { color: k === 0 ? c.c3 : c.c1, size: 11 });
        }
        D.txt(ctx, 'التدريج الثابت', cx - 13 * mm, y + 34, { color: c.muted, size: 12 });
        D.txt(ctx, 'التدريج الدائري', cx + 35, y + 62, { color: c.c1, size: 12 });
        D.txt(ctx, 'القراءة = ' + d.main.toFixed(1) + ' + ' + d.n + ' × 0.01 = ' + d.reading.toFixed(2) + ' ملم', W / 2, H - 28, { color: c.text, size: 16, w: '700' });
      }
    },
    graph(p, d) {
      const lc = d.lc, a = Math.max(0, d.L - 10 * lc), b = a + 20 * lc;
      return {
        view: { xmin: a, xmax: b, ymin: a - 2 * lc, ymax: b + 2 * lc }, xLabel: 'الطول الحقيقي (ملم)', yLabel: 'القراءة (ملم)',
        caption: 'القراءة «درجات» بعرض أصغر قراءة للجهاز (' + lc + ' ملم): أي طول بين درجتين يُقرأ بأقرب تدريج.',
        draw(G) { const c = G.colors(); G.fn((x) => Math.round(x / lc) * lc, { color: c.c1, width: 2.5 }); G.fn((x) => x, { color: c.muted, dash: [5, 5], width: 1.5 }); G.point(d.L, d.reading, { color: c.c2, label: '(' + d.L.toFixed(2) + ', ' + d.reading.toFixed(2) + ')' }); }
      };
    },
    live(p, d) { return '\\text{reading} = ' + M.fmt(d.main) + ' + ' + d.n + ' \\times ' + d.lc + ' = ' + d.reading.toFixed(2) + '\\ \\mathrm{mm}'; },
    results(p, d) {
      return [
        [p.tool === 'vernier' ? 'قراءة الذراع المدرج' : 'قراءة التدريج الثابت', q(d.main, 'mm')],
        [p.tool === 'vernier' ? 'قراءة المنزلقة' : 'قراءة التدريج الدائري', d.n + ' \\times ' + d.lc + ' = ' + q(M.round(d.n * d.lc, 4), 'mm')],
        ['القراءة النهائية', q(d.reading, 'mm') + ' = ' + q(d.reading / 10, 'cm')],
        ['أصغر قراءة (الدقة)', q(d.lc, 'mm')]
      ];
    },
    steps(p, d) {
      return p.tool === 'vernier'
        ? ['نقرأ الذراع المدرج عند صفر المنزلقة: $' + d.main + '\\ \\mathrm{mm}$.', 'نبحث عن تدريج المنزلقة الأكثر انطباقاً على تدريج الذراع: التدريج رقم $' + d.n + '$.', 'نضيف: $' + d.main + ' + ' + d.n + ' \\times 0.05 = ' + d.reading.toFixed(2) + '\\ \\mathrm{mm}$.']
        : ['نقرأ التدريج الثابت: $' + d.main.toFixed(1) + '\\ \\mathrm{mm}$ (كل قسم سفلي نصف ملم).', 'نقرأ التدريج الدائري المنطبق على الخط الأفقي: $' + d.n + '$.', 'نضيف: $' + d.main.toFixed(1) + ' + ' + d.n + ' \\times 0.01 = ' + d.reading.toFixed(2) + '\\ \\mathrm{mm}$.'];
    },
    explain(a, b, da, db) {
      if (a.tool !== b.tool) return ['انتقلت إلى ' + (b.tool === 'vernier' ? 'الورنية: دقتها 0.05 ملم وتقيس أبعاداً حتى عدة سنتيمترات.' : 'الميكروميتر: دقته 0.01 ملم، لذلك يُستخدم للأسلاك الدقيقة والأقطار الصغيرة (ص 9).')];
      if (da && db && da.main !== db.main) return ['تجاوز الصفر تدريجاً جديداً على ' + (b.tool === 'vernier' ? 'الذراع المدرج' : 'التدريج الثابت') + ' فصارت القراءة الأولى $' + db.main + '\\ \\mathrm{mm}$.'];
      if (da && db && da.n !== db.n) return ['انطبق تدريج آخر رقمه $' + db.n + '$؛ لأن أقسام المنزلقة أقصر قليلاً من أقسام الذراع، فكل حركة بمقدار ' + db.lc + ' ملم تجعل تدريجاً جديداً هو المنطبق.'];
      return [];
    },
    learn: [
      '**الورنية (ص 7):** أداة لقياس السمك وقطر الأسطوانات الداخلي والخارجي وعمق الثقوب بدقة أكبر من المسطرة. أجزاؤها: الذراع المدرج، الفك الثابت، الفك المتحرك (المنزلقة)، برغي التثبيت، وطرف قياس العمق.',
      '**خطوات القراءة (ص 8):** 1) نأخذ قراءة الذراع المدرج التي يقع عندها صفر المنزلقة. 2) نأخذ القراءة الأكثر انطباقاً بين المنزلقة والذراع. **مثال (1):** 35 ملم + 0.15 ملم = 35.15 ملم.',
      '**الميكروميتر (ص 9–10):** يقيس أبعاد الأجسام الكروية وأقطار الأسلاك الدقيقة بدقة منزلتين عشريتين بالمليمتر. نقرأ التدريج الثابت ثم نضيف قراءة التدريج الدائري. **مثال (2):** 8.5 + 0.12 = 8.62 ملم.',
      'يجب معايرة الجهاز قبل القياس: انطباق صفر المنزلقة (أو صفر التدريج الدائري) على صفر التدريج الثابت.'
    ],
    challenges: [
      { q: 'أعد قراءة مثال خالد (ص 8): اجعل قراءة الورنية $35.15$ ملم.', hint: 'اكتب 35.15 في خانة الإدخال.', init: { tool: 'vernier', L: 20 }, check: (p, d) => p.tool === 'vernier' && M.near(d.reading, 35.15, 1e-6) },
      { q: 'اجعل قراءة الميكروميتر $8.62$ ملم كما في المثال (2) ص 10.', hint: 'اختر الميكروميتر ثم L = 8.62.', init: { tool: 'vernier', L: 20 }, check: (p, d) => p.tool === 'micro' && M.near(d.reading, 8.62, 1e-6) },
      { q: 'اجعل المنزلقة تنطبق على التدريج رقم 15 (أي 0.75 ملم) فوق 12 ملم.', hint: '12 + 15 × 0.05 = 12.75.', init: { tool: 'vernier', L: 5 }, check: (p, d) => p.tool === 'vernier' && d.main === 12 && d.n === 15 }
    ],
    tutor: [
      { q: 'كيف أقرأ الورنية؟', k: ['كيف', 'اقرا', 'قراءه'], a: (p, d) => 'القراءة الأولى من الذراع المدرج عند صفر المنزلقة: $' + d.main + '$ ملم. ثم أبحث عن أكثر تدريج منطبق: رقم $' + d.n + '$، فأضيف $' + d.n + ' \\times ' + d.lc + '$. المجموع $' + d.reading.toFixed(2) + '$ ملم.' },
      { q: 'لماذا الميكروميتر أدق من الورنية؟', k: ['ادق', 'دقه', 'الميكروميتر'], a: () => 'أصغر قراءة للميكروميتر 0.01 ملم، بينما للورنية 0.05 ملم؛ أي أن الميكروميتر يميّز فروقاً أصغر بخمس مرات.' },
      { q: 'لماذا نعاير الجهاز قبل القياس؟', k: ['معايره', 'نعاير', 'صفر'], a: () => 'إذا لم ينطبق الصفران عند إغلاق الفكين فكل قراءة ستحمل خطأً ثابتاً (خطأ الصفر)؛ المعايرة تضمن أن القراءة تساوي البعد الحقيقي.' }
    ]
  });

  /* ======================= 1-5/1-6 الكميات الأساسية والمشتقة واشتقاق الوحدات ======================= */
  // الوحدات الأساسية: [kg, m, s, K, mol] أسس
  const DQ = {
    speed: { ar: 'السرعة', f: 'v = \\frac{\\Delta x}{\\Delta t}', dim: [0, 1, -1, 0, 0], unit: 'm/s', page: 12 },
    accel: { ar: 'التسارع', f: 'a = \\frac{\\Delta v}{\\Delta t}', dim: [0, 1, -2, 0, 0], unit: 'm/s^2', page: 12 },
    force: { ar: 'القوة', f: 'F = m\\,a', dim: [1, 1, -2, 0, 0], unit: 'N', page: 13 },
    density: { ar: 'الكثافة', f: '\\rho = \\frac{m}{V}', dim: [1, -3, 0, 0, 0], unit: 'kg/m^3', page: 13 },
    pressure: { ar: 'الضغط', f: 'P = \\frac{F}{A}', dim: [1, -1, -2, 0, 0], unit: 'Pa', page: 13 },
    specHeat: { ar: 'الحرارة النوعية', f: 'c = \\frac{Q}{m\\,\\Delta T}', dim: [0, 2, -2, -1, 0], unit: 'J/(kg\\cdot K)', page: 13 },
    work: { ar: 'الشغل', f: 'W = F\\,d', dim: [1, 2, -2, 0, 0], unit: 'J', page: 13 },
    kinetic: { ar: 'طاقة الحركة', f: 'E_k = \\tfrac12 m v^2', dim: [1, 2, -2, 0, 0], unit: 'J', page: 14 }
  };
  const BASE = ['kg', 'm', 's', 'K', 'mol'];
  function dimTeX(d) { const up = [], dn = []; d.forEach((e, i) => { if (e > 0) up.push(BASE[i] + (e > 1 ? '^{' + e + '}' : '')); if (e < 0) dn.push(BASE[i] + (e < -1 ? '^{' + -e + '}' : '')); }); const u = up.join('\\cdot ') || '1'; return dn.length ? '\\frac{\\mathrm{' + u + '}}{\\mathrm{' + dn.join('\\cdot ') + '}}' : '\\mathrm{' + u + '}'; }
  ML.dimTeX = dimTeX;
  const CONV = {
    len: { ar: 'الطول', base: 'm', units: [['km', 1e3], ['m', 1], ['cm', 1e-2], ['mm', 1e-3], ['\\mu m', 1e-6], ['nm', 1e-9], ['pm', 1e-12]] },
    vol: { ar: 'الحجم', base: 'm^3', units: [['m^3', 1], ['L', 1e-3], ['mL', 1e-6], ['cm^3', 1e-6]] },
    mass: { ar: 'الكتلة', base: 'kg', units: [['kg', 1], ['g', 1e-3], ['mg', 1e-6]] },
    speed: { ar: 'السرعة', base: 'm/s', units: [['m/s', 1], ['km/h', 1000 / 3600], ['cm/s', 1e-2]] },
    dens: { ar: 'الكثافة', base: 'kg/m^3', units: [['kg/m^3', 1], ['g/cm^3', 1000]] },
    time: { ar: 'الزمن', base: 's', units: [['s', 1], ['min', 60], ['h', 3600], ['day', 86400]] }
  };
  ML.CONV = CONV;
  ML.register({
    subject: S, id: 'units', unit: 1, order: 2, lesson: '1-5، 1-6', lessonTitle: 'الكميات الأساسية والمشتقة واشتقاق الوحدات', page: 11,
    titleAr: 'تحويل الوحدات واشتقاقها (تحليل الأبعاد)', titleEn: 'Unit Conversion & Dimensional Analysis', tags: 'وحدات نظام دولي بادئات اشتقاق كميات اساسيه مشتقه',
    formula: '[F] = [m][a] = \\mathrm{kg\\cdot \\frac{m}{s^2}} = \\mathrm{N}',
    book: 'وحدة الكمية المشتقة تُشتق من وحدات الكميات الأساسية: السرعة = المسافة/الزمن ← م/ث',
    summary: 'في النظام الدولي سبع كميات أساسية (الطول، الكتلة، الزمن، شدة التيار، شدة الإضاءة، كمية المادة، درجة الحرارة)؛ وكل كمية أخرى مشتقة ووحدتها تُشتق من قانونها. للتحويل نضرب في معامل التحويل (البادئة).',
    vars: [['x', 'القيمة المراد تحويلها', '—', 'عدد موجب'], ['\\text{from}\\to\\text{to}', 'الوحدة الأصلية والمطلوبة', '—', 'من الوحدات المتوافقة نفسها'], ['\\text{quantity}', 'الكمية المشتقة لتحليل أبعادها', '—', 'من أمثلة الكتاب']],
    assumptions: ['الكمية الأساسية لا تُشتق من غيرها؛ الكمية المشتقة تُعرّف بقانون (ص 11).'],
    params: [
      { key: 'kind', label: '\\text{quantity}', type: 'select', value: 'len', options: Object.keys(CONV).map((k) => [k, 'تحويل ' + CONV[k].ar]) },
      { key: 'x', label: 'x', min: 0.001, max: 1000, step: 0.001, value: 5, desc: 'القيمة' },
      { key: 'from', label: '\\text{from}', type: 'select', value: 4, options: (p) => CONV[p.kind].units.map((u, i) => [i, plainU(u[0])]) },
      { key: 'to', label: '\\text{to}', type: 'select', value: 6, options: (p) => CONV[p.kind].units.map((u, i) => [i, plainU(u[0])]) },
      { key: 'dq', label: '\\text{derived}', type: 'select', value: 'force', options: Object.keys(DQ).map((k) => [k, 'اشتقاق وحدة ' + DQ[k].ar]) }
    ],
    onSet(p, key) { if (key === 'kind') { p.from = 0; p.to = 1; } const n = CONV[p.kind].units.length; if (p.from >= n) p.from = 0; if (p.to >= n) p.to = n - 1; },
    custom: true, canvasHint: 'الشريط العلوي: موقع القيمة على سلّم القوى العشرية. الأسفل: تحليل الوحدة المشتقة إلى الوحدات الأساسية.',
    compute(p) {
      const C = CONV[p.kind]; const fu = C.units[p.from], tu = C.units[p.to];
      const factor = fu[1] / tu[1]; const y = p.x * factor;
      return { C: C, fu: fu, tu: tu, factor: factor, y: y, base: p.x * fu[1], DQ: DQ[p.dq] };
    },
    drawCustom(ctx, W, H, p, d, c) {
      // سلم القوى العشرية
      const y0 = 70, xL = 30, xR = W - 30; const lo = -12, hi = 6;
      const X = (e) => xL + (e - lo) / (hi - lo) * (xR - xL);
      ctx.strokeStyle = c.axis; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xL, y0); ctx.lineTo(xR, y0); ctx.stroke();
      for (let e = lo; e <= hi; e += 3) { ctx.beginPath(); ctx.moveTo(X(e), y0 - 6); ctx.lineTo(X(e), y0 + 6); ctx.stroke(); D.txt(ctx, '10^' + e, X(e), y0 + 18, { color: c.text, size: 11 }); }
      const e1 = Math.log10(d.base);
      if (Number.isFinite(e1)) { const XX = X(M.clamp(e1, lo, hi)); ctx.fillStyle = c.c2; ctx.beginPath(); ctx.arc(XX, y0, 7, 0, 7); ctx.fill(); D.txt(ctx, 'القيمة بالوحدة الأساسية', XX, y0 - 20, { color: c.c2, size: 12 }); }
      D.txt(ctx, M.fmt(p.x, 6) + ' ' + plainU(d.fu[0]) + '  =  ' + fmtSci(d.y) + ' ' + plainU(d.tu[0]), W / 2, 130, { color: c.c1, size: 20, w: '700' });
      // تحليل الأبعاد: أعمدة للأسس
      const dims = d.DQ.dim; const bw = Math.min(70, (W - 80) / 5), base = H - 60, sc = Math.min(28, (H - 230) / 3);
      D.txt(ctx, 'أسس الوحدات الأساسية في وحدة ' + d.DQ.ar, W / 2, 175, { color: c.text, size: 13 });
      ctx.strokeStyle = c.axis; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(30, base - 3 * sc); ctx.lineTo(W - 30, base - 3 * sc); ctx.stroke();
      dims.forEach((e, i) => {
        const x = W / 2 + (i - 2) * (bw + 12) - bw / 2; const yz = base - 3 * sc;
        ctx.fillStyle = e > 0 ? c.c3 : e < 0 ? c.c2 : c.muted; ctx.globalAlpha = 0.75; ctx.fillRect(x, e >= 0 ? yz - e * sc : yz, bw, Math.abs(e) * sc || 2); ctx.globalAlpha = 1;
        D.txt(ctx, BASE[i], x + bw / 2, base + 14, { color: c.text, size: 12 }); D.txt(ctx, (e > 0 ? '+' : '') + e, x + bw / 2, e >= 0 ? yz - e * sc - 10 : yz + Math.abs(e) * sc + 10, { color: c.text, size: 12, w: '700' });
      });
    },
    graph(p, d) {
      return {
        view: { xmin: -0.5, xmax: d.C.units.length - 0.5, ymin: -13, ymax: 4 }, xLabel: 'الوحدة', yLabel: 'log₁₀(معامل التحويل إلى ' + d.C.base.replace('^3', '³') + ')',
        caption: 'كل وحدة أصغر بعشر مرات تعني قيمة عددية أكبر بعشر مرات للكمية نفسها.',
        draw(G) { const c = G.colors(); d.C.units.forEach((u, i) => { const e = Math.log10(u[1]); G.segment(i, 0, i, e, { color: i === p.from ? c.c2 : i === p.to ? c.c3 : c.c1, width: 10 }); G.text(i, e, u[0].replace(/\\mu /, 'μ').replace('^3', '³'), { color: c.text, dy: e >= 0 ? -12 : 12, align: 'center' }); }); }
      };
    },
    live(p, d) { return M.fmt(p.x, 6) + '\\ \\mathrm{' + d.fu[0] + '} \\times \\frac{' + P.sci(d.fu[1]) + '}{' + P.sci(d.tu[1]) + '} = ' + P.sci(d.y, 5) + '\\ \\mathrm{' + d.tu[0] + '}'; },
    results(p, d) {
      return [
        ['النتيجة', P.sci(d.y, 6) + '\\ \\mathrm{' + d.tu[0] + '}'],
        ['معامل التحويل', P.sci(d.factor, 6)],
        ['القيمة بالوحدة الأساسية (SI)', P.sci(d.base, 6) + '\\ \\mathrm{' + d.C.base + '}'],
        ['قانون ' + d.DQ.ar, d.DQ.f],
        ['وحدة ' + d.DQ.ar + ' بالوحدات الأساسية', dimTeX(d.DQ.dim) + (d.DQ.unit.match(/^[A-Z]/) ? ' = \\mathrm{' + d.DQ.unit + '}' : '')]
      ];
    },
    steps(p, d) {
      return ['نحوّل إلى الوحدة الأساسية: $' + M.fmt(p.x, 6) + ' \\times ' + P.sci(d.fu[1]) + ' = ' + P.sci(d.base, 6) + '\\ \\mathrm{' + d.C.base + '}$.', 'ثم إلى الوحدة المطلوبة: $\\div ' + P.sci(d.tu[1]) + ' = ' + P.sci(d.y, 6) + '\\ \\mathrm{' + d.tu[0] + '}$.', 'اشتقاق وحدة ' + d.DQ.ar + ': نعوّض وحدات الكميات في القانون $' + d.DQ.f + '$ ← $' + dimTeX(d.DQ.dim) + '$.'];
    },
    explain(a, b, da, db) {
      if (a.dq !== b.dq) return ['وحدة ' + db.DQ.ar + ' = $' + dimTeX(db.DQ.dim) + '$؛ نحصل عليها بتعويض وحدة كل كمية في القانون $' + db.DQ.f + '$.'];
      if (a.kind !== b.kind) return ['انتقلت إلى تحويل ' + db.C.ar + '؛ لا يجوز التحويل إلا بين وحدات الكمية نفسها.'];
      if (da && db && Math.sign(Math.log10(da.factor)) !== Math.sign(Math.log10(db.factor))) return [db.factor > 1 ? 'تحوّل من وحدة كبيرة إلى صغيرة: العدد يكبر.' : 'تحوّل من وحدة صغيرة إلى كبيرة: العدد يصغر.'];
      return [];
    },
    learn: [
      '**الكميات الأساسية (ص 11–12):** لا يوجد أبسط منها: الطول (م)، الكتلة (كغم)، الزمن (ث)، شدة التيار (أمبير)، شدة الإضاءة (كاندل)، كمية المادة (مول)، درجة الحرارة (كلفن).',
      '**الكميات المشتقة:** تُشتق من الأساسية، مثل السرعة والتسارع والقوة. **مثال (3):** وحدة السرعة = م/ث. **مثال (4):** وحدة التسارع = م/ث².',
      '**البادئات (ص 7):** كيلو $10^3$، سنتي $10^{-2}$، ملي $10^{-3}$، ميكرو $10^{-6}$، نانو $10^{-9}$، بيكو $10^{-12}$.',
      '**تمرين (ص 13):** حوّل 72 كم/ساعة إلى م/ث: $72 \\times \\frac{1000}{3600} = 20$ م/ث.'
    ],
    challenges: [
      { q: 'حوّل 72 كم/ساعة إلى م/ث (س4 ص 13).', hint: 'اختر تحويل السرعة، من km/h إلى m/s، والقيمة 72.', init: { kind: 'len', x: 1, from: 0, to: 1 }, check: (p, d) => p.kind === 'speed' && p.x === 72 && d.tu[0] === 'm/s' && d.fu[0] === 'km/h', why: () => 'الناتج 20 م/ث.' },
      { q: 'حوّل 5 ميكرومتر إلى بيكومتر (س4 ص 13).', hint: 'الطول: من μm إلى pm.', init: { kind: 'len', x: 1, from: 0, to: 1 }, check: (p, d) => p.kind === 'len' && p.x === 5 && d.fu[0] === '\\mu m' && d.tu[0] === 'pm', why: () => '$5 \\times 10^6$ بيكومتر.' },
      { q: 'اختر الكمية المشتقة التي وحدتها $\\mathrm{kg/(m\\cdot s^2)}$.', hint: 'إنها القوة على المساحة.', init: { dq: 'speed' }, check: (p) => p.dq === 'pressure' }
    ],
    tutor: [
      { q: 'كيف أشتق وحدة القوة؟', k: ['اشتق', 'القوه', 'نيوتن'], a: () => 'القوة = الكتلة × التسارع، فوحدتها $\\mathrm{kg} \\times \\mathrm{m/s^2} = \\mathrm{kg\\,m/s^2}$ وتسمى نيوتن.' },
      { q: 'لماذا يكبر العدد عند التحويل لوحدة أصغر؟', k: ['يكبر', 'اصغر', 'العدد'], a: (p, d) => 'لأن الكمية نفسها تحتاج عدداً أكبر من الوحدات الصغيرة لتمثيلها. معامل التحويل الآن $' + P.sci(d.factor) + '$.' },
      { q: 'ما الفرق بين الكمية الأساسية والمشتقة؟', k: ['الفرق', 'اساسيه', 'مشتقه'], a: () => 'الأساسية لا تُعرّف بدلالة غيرها (مثل الطول والكتلة والزمن)، والمشتقة تُعرّف بقانون من الأساسية (مثل السرعة = المسافة ÷ الزمن).' }
    ]
  });
  function plainU(u) { return u.replace('\\mu ', 'μ').replace('^3', '³').replace('^2', '²'); }
  function fmtSci(x) { if (x === 0) return '0'; const a = Math.abs(x); if (a >= 1e-3 && a < 1e7) return String(+x.toPrecision(6)); const e = Math.floor(Math.log10(a)); return +(x / Math.pow(10, e)).toPrecision(5) + '×10^' + e; }

  /* ======================= 2-3 جمع المتجهات بيانياً ======================= */
  ML.register({
    subject: S, id: 'vector-graphical', unit: 2, order: 1, lesson: '2-3', lessonTitle: 'جمع المتجهات بيانياً', page: 18,
    titleAr: 'جمع المتجهات بيانياً (متوازي الأضلاع)', titleEn: 'Graphical Vector Addition (Parallelogram)', tags: 'متجه محصله متوازي الاضلاع راس ذيل',
    formula: '\\vec{R} = \\vec{A} + \\vec{B}',
    book: 'المحصلة ح = أ + ب : قطر متوازي الأضلاع الممتد من ذيل المتجهين',
    summary: 'نرسم المتجهين من نقطة الإسناد نفسها، ثم نكمل متوازي الأضلاع؛ القطر الخارج من نقطة الإسناد هو المحصلة. طوله (بمقياس الرسم) مقدار المحصلة، وزاويته مع محور السينات الموجب اتجاهها.',
    vars: [['A, \\theta_A', 'مقدار المتجه الأول واتجاهه', '\\text{unit}, ^{\\circ}', 'A ≥ 0 ، 0° – 360°'], ['B, \\theta_B', 'مقدار المتجه الثاني واتجاهه', '\\text{unit}, ^{\\circ}', 'B ≥ 0 ، 0° – 360°'], ['R, \\theta_R', 'مقدار المحصلة واتجاهها', '\\text{unit}, ^{\\circ}', 'تُحسب']],
    assumptions: ['المتجهان من النوع نفسه (لا يجوز جمع قوة مع سرعة) (ص 18).', 'الزوايا تُقاس من محور السينات الموجب (الشرق) عكس عقارب الساعة.'],
    params: [
      { key: 'A', label: 'A', min: 0, max: 10, step: 0.5, value: 3 }, { key: 'tA', label: '\\theta_A\\ (^{\\circ})', min: 0, max: 359, step: 1, value: 0 },
      { key: 'B', label: 'B', min: 0, max: 10, step: 0.5, value: 4 }, { key: 'tB', label: '\\theta_B\\ (^{\\circ})', min: 0, max: 359, step: 1, value: 90 },
      { key: 'para', label: '\\text{parallelogram}', type: 'toggle', value: true, on: 'إظهار متوازي الأضلاع', off: 'رأس بذيل فقط' }
    ],
    play: { key: 'tB', speed: 40 },
    plot: { view: { xmin: -12, xmax: 12, ymin: -12, ymax: 12 } },
    compute(p) { const r = P.vecAdd(p.A, p.tA, p.B, p.tB); const ra = p.tA * Math.PI / 180, rb = p.tB * Math.PI / 180; return Object.assign(r, { a: [p.A * Math.cos(ra), p.A * Math.sin(ra)], b: [p.B * Math.cos(rb), p.B * Math.sin(rb)], between: Math.min(Math.abs(p.tA - p.tB), 360 - Math.abs(p.tA - p.tB)) }); },
    draw(P_, p, d) {
      const c = P_.colors(); const a = d.a, b = d.b;
      if (p.para) { P_.segment(a[0], a[1], d.x, d.y, { color: c.c3, dash: [6, 5], width: 1.8 }); P_.segment(b[0], b[1], d.x, d.y, { color: c.c1, dash: [6, 5], width: 1.8 }); P_.polygon([[0, 0], a, [d.x, d.y], b], { color: 'transparent', width: 0.1, fill: c.c4, fillAlpha: 0.07 }); }
      P_.arrow(0, 0, a[0], a[1], { color: c.c1, width: 3.5 }); P_.arrow(0, 0, b[0], b[1], { color: c.c3, width: 3.5 });
      if (d.R > 0.01) P_.arrow(0, 0, d.x, d.y, { color: c.c2, width: 4 });
      P_.text(a[0], a[1], 'A', { color: c.c1, dx: 10, bold: true, size: 14 }); P_.text(b[0], b[1], 'B', { color: c.c3, dx: 10, bold: true, size: 14 });
      P_.text(d.x, d.y, 'R = ' + M.fmt(d.R, 3), { color: c.c2, dx: 10, dy: -12, bold: true, size: 14 });
      ['شرق', 'شمال', 'غرب', 'جنوب'].forEach((t, i) => { const an = i * Math.PI / 2; P_.text(11 * Math.cos(an), 11 * Math.sin(an), t, { color: c.muted, align: 'center', rtl: true }); });
    },
    handles(p, d, set) {
      const h = (kA, kT) => (x, y) => { set(kA, M.clamp(Math.round(Math.hypot(x, y) * 2) / 2, 0, 10)); set(kT, Math.round(M.normDeg(M.rad2deg(Math.atan2(y, x)))) % 360); };
      return [{ x: d.a[0], y: d.a[1], onDrag: h('A', 'tA') }, { x: d.b[0], y: d.b[1], onDrag: h('B', 'tB') }];
    },
    graph(p, d) {
      return {
        view: { xmin: 0, xmax: 180, ymin: 0, ymax: D.niceMax(p.A + p.B + 1, 2) }, xLabel: 'الزاوية بين المتجهين (°)', yLabel: 'مقدار المحصلة R',
        caption: 'المحصلة أكبر ما يمكن ($A + B$) عندما يكون المتجهان بالاتجاه نفسه (0°)، وأصغر ما يمكن ($|A - B|$) عندما يتعاكسان (180°).',
        draw(G) { const c = G.colors(); G.fn((t) => Math.sqrt(p.A * p.A + p.B * p.B + 2 * p.A * p.B * Math.cos(t * Math.PI / 180)), { color: c.c2, width: 2.5, domain: [0, 180] }); G.point(d.between, d.R, { color: c.c2, label: M.fmt(d.between, 1) + '°' }); }
      };
    },
    live(p, d) { return '\\vec R = \\vec A + \\vec B:\\quad R = ' + M.fmt(d.R, 3) + ',\\ \\theta_R = ' + (Number.isNaN(d.theta) ? '\\text{غير معرّف}' : M.fmt(d.theta, 2) + '^{\\circ}'); },
    results(p, d) {
      return [
        ['مركبتا A', '(' + M.fmt(d.a[0], 3) + ',\\ ' + M.fmt(d.a[1], 3) + ')'], ['مركبتا B', '(' + M.fmt(d.b[0], 3) + ',\\ ' + M.fmt(d.b[1], 3) + ')'],
        ['مقدار المحصلة R', M.fmt(d.R, 4)], ['اتجاه المحصلة', Number.isNaN(d.theta) ? '\\text{غير معرّف (المحصلة صفر)}' : M.fmt(d.theta, 2) + '^{\\circ}\\ \\text{من الشرق}'],
        ['الحدود', '|A - B| = ' + M.fmt(Math.abs(p.A - p.B)) + ' \\le R \\le A + B = ' + M.fmt(p.A + p.B)]
      ];
    },
    steps() { return ['نرسم $\\vec A$ من نقطة الإسناد بالزاوية المطلوبة.', 'نرسم $\\vec B$ من نقطة الإسناد نفسها.', 'نكمل متوازي الأضلاع برسم خط موازٍ لكل متجه من رأس الآخر.', 'القطر من نقطة الإسناد هو المحصلة $\\vec R$؛ نقيس طوله واتجاهه.']; },
    explain(a, b, da, db) {
      if (!da) return [];
      if (Math.abs(db.between - da.between) > 0.5) return ['تغيّرت الزاوية بين المتجهين إلى $' + M.fmt(db.between, 1) + '^{\\circ}$ فصارت المحصلة $' + M.fmt(db.R, 3) + '$. **لماذا؟** كلما اقترب المتجهان من الاتجاه نفسه «تعاونا» فكبرت المحصلة، وكلما تعاكسا «ألغى» أحدهما الآخر.'];
      return [];
    },
    learn: [
      '**الكميات القياسية والمتجهة (ص 16):** القياسية تحدد بمقدار ووحدة فقط (درجة الحرارة، الزمن)، والمتجهة تحتاج أيضاً اتجاهاً (السرعة، التسارع، القوة).',
      '**رسم المتجه (ص 16):** نحتاج نقطة إسناد، ومقداراً يمثَّل بطول القطعة بمقياس رسم مناسب، واتجاهاً جغرافياً.',
      '**جمع متجهين بيانياً (ص 18–19):** 1) نرسم $\\vec A$ من نقطة الإسناد. 2) نرسم $\\vec B$ من النقطة نفسها. 3) نكمل متوازي الأضلاع. 4) القطر من الذيل المشترك هو المحصلة. 5) نقيس طوله بالمسطرة ونضربه في مقياس الرسم. 6) نقيس زاويته بالمنقلة.',
      '**مثال (4) ص 20:** $A = 3$ وحدات شرقاً و $B = 4$ وحدات شمالاً ← المحصلة 5 وحدات.'
    ],
    challenges: [
      { q: 'أعد مثال الكتاب: 3 وحدات شرقاً + 4 وحدات شمالاً. ما المحصلة؟', hint: '$A = 3, \\theta_A = 0$، $B = 4, \\theta_B = 90$.', init: { A: 1, tA: 45, B: 1, tB: 135 }, check: (p) => p.A === 3 && p.tA === 0 && p.B === 4 && p.tB === 90, why: (p, d) => 'المحصلة $' + M.fmt(d.R) + '$ وحدات باتجاه $' + M.fmt(d.theta, 1) + '^{\\circ}$ شمال الشرق.' },
      { q: 'اجعل المحصلة صفراً بمتجهين غير صفريين.', hint: 'مقداران متساويان واتجاهان متعاكسان.', init: { A: 3, tA: 0, B: 4, tB: 90 }, check: (p, d) => p.A > 0 && p.B > 0 && d.R < 1e-9 },
      { q: 'اجعل المحصلة تساوي $A + B$ تماماً.', hint: 'المتجهان بالاتجاه نفسه.', init: { A: 3, tA: 0, B: 4, tB: 90 }, check: (p, d) => p.A > 0 && p.B > 0 && M.near(d.R, p.A + p.B, 1e-9) }
    ],
    tutor: [
      { q: 'لماذا لا تساوي المحصلة مجموع المقدارين؟', k: ['لا تساوي', 'مجموع', 'لماذا'], a: (p, d) => 'لأن المتجهين ليسا بالاتجاه نفسه؛ الزاوية بينهما $' + M.fmt(d.between, 1) + '^{\\circ}$، فجزء من كل منهما يلغي جزءاً من الآخر. المحصلة $' + M.fmt(d.R, 3) + '$ بينما $A + B = ' + M.fmt(p.A + p.B) + '$.' },
      { q: 'متى تكون المحصلة أكبر ما يمكن؟', k: ['اكبر', 'اقصى'], a: (p) => 'عندما يكون المتجهان بالاتجاه نفسه (الزاوية 0°)، فتكون $R = A + B = ' + M.fmt(p.A + p.B) + '$.' }
    ]
  });

  /* ======================= 2-4 جمع المتجهات حسابياً ======================= */
  ML.register({
    subject: S, id: 'vector-arithmetic', unit: 2, order: 2, lesson: '2-4', lessonTitle: 'جمع المتجهات حسابياً', page: 21,
    titleAr: 'جمع المتجهات حسابياً (متوازية ومتعامدة)', titleEn: 'Arithmetic Vector Addition', tags: 'متجهات متوازيه متعاكسه متعامده فيثاغورس شد الحبل',
    formula: 'R = A + B\\ (\\uparrow\\uparrow),\\quad R = |A - B|\\ (\\uparrow\\downarrow),\\quad R = \\sqrt{A^2 + B^2}\\ (\\perp)',
    book: 'متجهان بالاتجاه نفسه: ح = أ + ب ؛ متعاكسان: ح = أ − ب باتجاه الأكبر ؛ متعامدان: ح = √(أ² + ب²)',
    summary: 'إذا كان المتجهان على خط العمل نفسه نجمع أو نطرح مقداريهما؛ وإذا كانا متعامدين نستخدم نظرية فيثاغورس لإيجاد المحصلة وظل الزاوية لاتجاهها.',
    vars: [['A', 'مقدار المتجه الأول (مثلاً قوة الحصان الأول)', '\\mathrm{N}', '0 – 500'], ['B', 'مقدار المتجه الثاني', '\\mathrm{N}', '0 – 500'], ['R', 'مقدار المحصلة', '\\mathrm{N}', 'تُحسب']],
    assumptions: ['المتجهان قوتان تؤثران في الجسم نفسه (مثل جرّ الحصانين أو شد الحبل) (ص 15).'],
    params: [
      { key: 'mode', label: '\\text{case}', type: 'select', value: 'perp', options: [['same', 'بالاتجاه نفسه (جرّ حصانين)'], ['opp', 'متعاكسان (شد الحبل)'], ['perp', 'متعامدان']] },
      { key: 'A', label: 'A\\ (\\mathrm{N})', min: 0, max: 500, step: 10, value: 300 },
      { key: 'B', label: 'B\\ (\\mathrm{N})', min: 0, max: 500, step: 10, value: 400 }
    ],
    custom: true, canvasHint: 'صندوق تشده قوتان؛ السهم الأحمر هو المحصلة.',
    compute(p) {
      if (p.mode === 'same') return { R: P.vecParallel(p.A, p.B), dir: 'شرقاً' };
      if (p.mode === 'opp') { const R = P.vecAntiParallel(p.A, p.B); return { R: R, dir: R === 0 ? '—' : (p.A > p.B ? 'شرقاً (باتجاه A)' : 'غرباً (باتجاه B)') }; }
      const r = P.vecPerp(p.A, p.B); return { R: r.R, theta: r.theta, dir: (p.A === 0 && p.B === 0) ? '—' : M.fmt(r.theta, 2) + '° شمال الشرق' };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const cx = W / 2, cy = H / 2, sc = Math.min(W, H) * 0.35 / 500;
      ctx.fillStyle = c.c4; ctx.globalAlpha = 0.85; D.rr(ctx, cx - 26, cy - 26, 52, 52, 8); ctx.fill(); ctx.globalAlpha = 1;
      const A = p.A * sc, B = p.B * sc;
      D.arrow(ctx, cx + 26, cy, cx + 26 + A, cy, c.c1, 5); D.txt(ctx, 'A = ' + p.A + ' N', cx + 26 + A / 2, cy - 16, { color: c.c1 });
      if (p.mode === 'same') { D.arrow(ctx, cx + 26, cy + 14, cx + 26 + B, cy + 14, c.c3, 5); D.txt(ctx, 'B = ' + p.B + ' N', cx + 26 + B / 2, cy + 32, { color: c.c3 }); }
      else if (p.mode === 'opp') { D.arrow(ctx, cx - 26, cy, cx - 26 - B, cy, c.c3, 5); D.txt(ctx, 'B = ' + p.B + ' N', cx - 26 - B / 2, cy - 16, { color: c.c3 }); }
      else { D.arrow(ctx, cx, cy - 26, cx, cy - 26 - B, c.c3, 5); D.txt(ctx, 'B = ' + p.B + ' N', cx + 12, cy - 26 - B / 2, { color: c.c3, align: 'left' }); }
      // المحصلة
      let rx = 0, ry = 0;
      if (p.mode === 'same') rx = p.A + p.B; else if (p.mode === 'opp') rx = p.A - p.B; else { rx = p.A; ry = p.B; }
      if (d.R > 0) { D.arrow(ctx, cx, cy, cx + rx * sc, cy - ry * sc, c.c2, 4); D.txt(ctx, 'R = ' + M.fmt(d.R, 2) + ' N', cx + rx * sc * 0.6, cy - ry * sc * 0.6 + 22, { color: c.c2, w: '700', halo: c.bg }); }
      if (p.mode === 'perp' && d.R > 0) { ctx.strokeStyle = c.muted; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(cx + A, cy); ctx.lineTo(cx + A, cy - B); ctx.lineTo(cx, cy - B); ctx.stroke(); ctx.setLineDash([]); }
      D.txt(ctx, p.mode === 'opp' && d.R === 0 ? 'القوتان متساويتان ومتعاكستان: الصندوق لا يتحرك (المحصلة صفر)' : 'الصندوق يتحرك باتجاه المحصلة', W / 2, H - 24, { color: c.text, size: 14 });
    },
    graph(p, d) {
      return {
        view: { xmin: 0, xmax: 500, ymin: 0, ymax: 1000 }, xLabel: 'B (N)', yLabel: 'R (N)',
        caption: 'R مقابل B مع تثبيت A = ' + p.A + ' N: خط مستقيم في حالة الاتجاه نفسه، وشكل V في حالة التعاكس، ومنحنى في حالة التعامد.',
        draw(G) { const c = G.colors(); G.fn((b) => p.A + b, { color: c.c1, width: p.mode === 'same' ? 3 : 1.2, alpha: p.mode === 'same' ? 1 : 0.35 }); G.fn((b) => Math.abs(p.A - b), { color: c.c3, width: p.mode === 'opp' ? 3 : 1.2, alpha: p.mode === 'opp' ? 1 : 0.35 }); G.fn((b) => Math.hypot(p.A, b), { color: c.c5, width: p.mode === 'perp' ? 3 : 1.2, alpha: p.mode === 'perp' ? 1 : 0.35 }); G.point(p.B, d.R, { color: c.c2 }); }
      };
    },
    live(p, d) {
      if (p.mode === 'same') return 'R = A + B = ' + p.A + ' + ' + p.B + ' = ' + M.fmt(d.R) + '\\ \\mathrm{N}';
      if (p.mode === 'opp') return 'R = |A - B| = |' + p.A + ' - ' + p.B + '| = ' + M.fmt(d.R) + '\\ \\mathrm{N}';
      return 'R = \\sqrt{A^2 + B^2} = \\sqrt{' + p.A + '^2 + ' + p.B + '^2} = ' + M.fmt(d.R, 4) + '\\ \\mathrm{N}';
    },
    results(p, d) {
      const r = [['مقدار المحصلة', q(d.R, 'N')], ['اتجاه المحصلة', d.dir, false]];
      if (p.mode === 'perp' && (p.A || p.B)) r.push(['\\tan\\theta = B/A', p.A === 0 ? '\\text{غير معرّف} \\Rightarrow \\theta = 90^{\\circ}' : M.fmt(p.B / p.A, 4)]);
      r.push(['تحليل الوحدات', '\\mathrm{N} \\pm \\mathrm{N} = \\mathrm{N}']);
      return r;
    },
    steps(p, d) {
      if (p.mode === 'same') return ['المتجهان على خط العمل نفسه وبالاتجاه نفسه ← نجمع المقدارين.', '$R = ' + p.A + ' + ' + p.B + ' = ' + d.R + '$ N.'];
      if (p.mode === 'opp') return ['المتجهان متعاكسان ← نطرح الأصغر من الأكبر.', '$R = ' + Math.max(p.A, p.B) + ' - ' + Math.min(p.A, p.B) + ' = ' + d.R + '$ N، باتجاه المتجه الأكبر.'];
      return ['المتجهان متعامدان يكوّنان ضلعي مثلث قائم، والمحصلة وتره.', '$R = \\sqrt{' + p.A + '^2 + ' + p.B + '^2} = ' + M.fmt(d.R, 4) + '$ N.', '$\\theta = \\tan^{-1}(B/A) = ' + M.fmt(d.theta, 3) + '^{\\circ}$.'];
    },
    learn: ['**الحالات (ص 15، 21–23):** جرّ حصانين لعربة بالاتجاه نفسه (نجمع)، شد الحبل (نطرح والمحصلة باتجاه الأكبر)، ومتجهان متعامدان (فيثاغورس).', 'إذا تساوت قوتا شد الحبل فالمحصلة صفر والجسم لا يتحرك.'],
    challenges: [
      { q: 'في شد الحبل اجعل الفريق B يفوز بمحصلة 100 N.', hint: 'متعاكسان و $B - A = 100$.', init: { mode: 'same', A: 100, B: 100 }, check: (p, d) => p.mode === 'opp' && p.B - p.A === 100 },
      { q: 'قوتان متعامدتان محصلتهما 500 N، إحداهما 300 N.', hint: 'مثلث 3-4-5.', init: { mode: 'same', A: 100, B: 100 }, check: (p, d) => p.mode === 'perp' && M.near(d.R, 500, 1e-9) && (p.A === 300 || p.B === 300) }
    ],
    tutor: [
      { q: 'لماذا نستخدم فيثاغورس للمتجهين المتعامدين؟', k: ['فيثاغورس', 'متعامد'], a: () => 'لأن المتجهين المتعامدين يكوّنان ضلعي القائمة في مثلث، والمحصلة هي الوتر: $R^2 = A^2 + B^2$.' },
      { q: 'باتجاه من تكون المحصلة في شد الحبل؟', k: ['اتجاه', 'شد الحبل', 'متعاكس'], a: (p, d) => 'باتجاه القوة الأكبر: ' + d.dir + '.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
