/* الفيزياء — الوحدة الأولى، الفصل الثالث: وصف الحركة (ص 24–43) */
(function (root) {
  'use strict';
  const ML = root.ML; const M = ML.math; const P = ML.phys; const D = ML.pdraw;
  const S = 'g10-physics'; const U = 3; const q = P.q;
  const f2 = (x, n) => M.fmt(x, n === undefined ? 2 : n);

  // مضمار أفقي: يحوّل موضعاً (م) إلى بكسل ضمن نافذة [x0, x1]
  function track(ctx, W, H, c, xmin, xmax, y, label) {
    const L = 40, R = W - 30; const X = (x) => L + (x - xmin) / (xmax - xmin) * (R - L);
    ctx.strokeStyle = c.axis; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(L - 10, y); ctx.lineTo(R + 10, y); ctx.stroke();
    const st = ML.niceStep((xmax - xmin) / 8);
    for (let v = Math.ceil(xmin / st) * st; v <= xmax + 1e-9; v += st) { ctx.beginPath(); ctx.moveTo(X(v), y); ctx.lineTo(X(v), y + 6); ctx.stroke(); D.txt(ctx, String(+v.toFixed(6)), X(v), y + 16, { color: c.text, size: 11 }); }
    if (label) D.txt(ctx, label, R + 2, y + 30, { color: c.muted, size: 11, align: 'right' });
    return X;
  }
  function car(ctx, X, y, color, c) {
    ctx.save(); ctx.fillStyle = color; D.rr(ctx, X - 26, y - 30, 52, 22, 6); ctx.fill();
    ctx.fillStyle = c.bg; ctx.globalAlpha = 0.5; D.rr(ctx, X - 14, y - 27, 24, 9, 3); ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = c.axis; [-14, 14].forEach((dx) => { ctx.beginPath(); ctx.arc(X + dx, y - 6, 6, 0, 7); ctx.fill(); }); ctx.restore();
  }
  ML.pdraw.track = track; ML.pdraw.car = car;

  /* ======================= 3-1 المسافة والإزاحة ======================= */
  ML.register({
    subject: S, id: 'distance-displacement', unit: U, order: 1, lesson: '3-1', lessonTitle: 'الموضع والإزاحة والمسافة', page: 25,
    titleAr: 'المسافة والإزاحة', titleEn: 'Distance vs Displacement', tags: 'مسافه ازاحه موضع مسار دوار',
    formula: '\\text{distance} = \\sum |\\Delta x_i| ,\\qquad \\vec{d} = \\vec{x}_{f} - \\vec{x}_{i}',
    book: 'المسافة (ف) = طول المسار الحقيقي ؛ الإزاحة = المتجه الواصل بين نقطة البداية ونقطة النهاية',
    summary: 'المسافة طول المسار الحقيقي الذي يسلكه الجسم (كمية قياسية)، أما الإزاحة فالتغير في موضعه: المتجه من نقطة البداية إلى النهاية (كمية متجهة). لذلك الإزاحة لا تزيد أبداً على المسافة.',
    vars: [['d_1', 'الحركة الأولى (شرقاً)', '\\mathrm{m}', '0 – 20'], ['d_2', 'الحركة الثانية (موجب شرقاً، سالب غرباً)', '\\mathrm{m}', '−20 – 20'], ['r', 'نصف قطر الدوار (حالة المسار الدائري)', '\\mathrm{m}', '1 – 10'], ['n', 'عدد الدورات المقطوعة', '—', '0 – 2']],
    assumptions: ['الحركة في الحالة الأولى على خط مستقيم (شرق–غرب).'],
    params: [
      { key: 'mode', label: '\\text{path}', type: 'select', value: 'line', options: [['line', 'ذهاب وإياب على خط مستقيم (مثال 1)'], ['circle', 'الدوران حول دوار (مثال 2)']] },
      { key: 'd1', label: 'd_1\\ (\\mathrm{m})', min: 0, max: 20, step: 1, value: 10, hidden: (p) => p.mode !== 'line' },
      { key: 'd2', label: 'd_2\\ (\\mathrm{m})', min: -20, max: 20, step: 1, value: -7, hidden: (p) => p.mode !== 'line' },
      { key: 'r', label: 'r\\ (\\mathrm{m})', min: 1, max: 10, step: 0.5, value: 5, hidden: (p) => p.mode !== 'circle' },
      { key: 'n', label: 'n', min: 0, max: 2, step: 0.05, value: 1, hidden: (p) => p.mode !== 'circle', desc: 'عدد الدورات' },
      { key: 'prog', label: '\\text{progress}', min: 0, max: 1, step: 0.01, value: 1, desc: 'تقدم الرحلة' }
    ],
    play: { key: 'prog', speed: 0.25 },
    custom: true, canvasHint: 'اضغط «تشغيل» لترى الجسم يتحرك؛ الخط البرتقالي هو المسار (المسافة) والسهم الأحمر هو الإزاحة.',
    compute(p) {
      if (p.mode === 'line') {
        const L1 = p.d1, L2 = Math.abs(p.d2), tot = L1 + L2; const s = p.prog * tot;
        const x = s <= L1 ? s : L1 + Math.sign(p.d2) * (s - L1);
        return { dist: s, disp: x, total: tot, finalDisp: p.d1 + p.d2, x: x };
      }
      const ang = p.prog * p.n * 2 * Math.PI; const dist = p.r * ang;
      const px = p.r * Math.cos(ang - Math.PI / 2), py = p.r * Math.sin(ang - Math.PI / 2);
      const disp = Math.hypot(px - 0, py + p.r);
      return { dist: dist, disp: disp, total: 2 * Math.PI * p.r * p.n, ang: ang, pt: [px, py], finalDisp: 2 * p.r * Math.abs(Math.sin(Math.PI * p.n)) };
    },
    drawCustom(ctx, W, H, p, d, c) {
      if (p.mode === 'line') {
        const ext = Math.max(20, p.d1 + Math.max(0, p.d2)); const lo = Math.min(0, p.d1 + p.d2, -2);
        const X = track(ctx, W, H, c, lo - 1, ext + 1, H * 0.62, 'الموضع (م) — الشرق →');
        ctx.strokeStyle = c.c4; ctx.lineWidth = 6; ctx.globalAlpha = 0.6; ctx.beginPath();
        const s = d.dist, L1 = p.d1; ctx.moveTo(X(0), H * 0.45); ctx.lineTo(X(Math.min(s, L1)), H * 0.45);
        if (s > L1) { ctx.moveTo(X(L1), H * 0.40); ctx.lineTo(X(d.x), H * 0.40); }
        ctx.stroke(); ctx.globalAlpha = 1;
        if (Math.abs(d.disp) > 1e-9) D.arrow(ctx, X(0), H * 0.52, X(d.x), H * 0.52, c.c2, 3.5);
        car(ctx, X(d.x), H * 0.62, c.c1, c);
        D.txt(ctx, 'البداية', X(0), H * 0.62 + 34, { color: c.muted, size: 12 });
        D.txt(ctx, 'المسافة = ' + f2(d.dist) + ' م    الإزاحة = ' + f2(Math.abs(d.disp)) + ' م ' + (d.disp > 0 ? 'شرقاً' : d.disp < 0 ? 'غرباً' : ''), W / 2, 30, { color: c.text, size: 16, w: '700' });
      } else {
        const cx = W / 2, cy = H / 2 + 10, sc = Math.min(W, H) * 0.34 / p.r;
        ctx.strokeStyle = c.grid; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, p.r * sc, 0, 7); ctx.stroke();
        ctx.fillStyle = c.c3; ctx.globalAlpha = 0.15; ctx.beginPath(); ctx.arc(cx, cy, p.r * sc * 0.6, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
        ctx.strokeStyle = c.c4; ctx.lineWidth = 6; ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.arc(cx, cy, p.r * sc, -Math.PI / 2, -Math.PI / 2 + d.ang, false); ctx.stroke(); ctx.globalAlpha = 1;
        const sx = cx, sy = cy - p.r * sc; const ex = cx + d.pt[0] * sc, ey = cy + d.pt[1] * sc;
        if (d.disp > 1e-6) D.arrow(ctx, sx, sy, ex, ey, c.c2, 3.5);
        ctx.fillStyle = c.c1; ctx.beginPath(); ctx.arc(ex, ey, 9, 0, 7); ctx.fill();
        D.txt(ctx, 'البداية', sx, sy - 18, { color: c.muted, size: 12 });
        D.txt(ctx, 'المسافة = ' + f2(d.dist) + ' م    الإزاحة = ' + f2(d.disp) + ' م', W / 2, 26, { color: c.text, size: 16, w: '700' });
      }
    },
    graph(p, d) {
      const tot = Math.max(d.total, 1e-6);
      return {
        view: { xmin: 0, xmax: 1, ymin: p.mode === 'line' ? Math.min(0, -Math.abs(p.d2)) - 1 : 0, ymax: D.niceMax(tot, 1) }, xLabel: 'تقدم الرحلة', yLabel: 'م',
        caption: 'البرتقالي: المسافة (تتزايد دائماً). الأحمر: ' + (p.mode === 'line' ? 'الإزاحة (موجبة شرقاً، سالبة غرباً) — تتناقص عند الرجوع.' : 'مقدار الإزاحة — يعود صفراً عند إكمال الدورة.'),
        draw(G) {
          const c = G.colors();
          G.fn((u) => u * tot, { color: c.c4, width: 2.5, domain: [0, 1] });
          G.fn((u) => this_.compute(Object.assign({}, p, { prog: u })).disp, { color: c.c2, width: 2.5, domain: [0, 1] });
          G.vline(p.prog, { color: c.muted, dash: [4, 4], width: 1 });
        }
      };
    },
    live(p, d) { return '\\text{distance} = ' + f2(d.dist) + '\\ \\mathrm{m},\\quad |\\vec d| = ' + f2(Math.abs(d.disp)) + '\\ \\mathrm{m}'; },
    results(p, d) {
      const r = [['المسافة المقطوعة', q(d.dist, 'm')], ['مقدار الإزاحة', q(Math.abs(d.disp), 'm')]];
      if (p.mode === 'line') r.push(['اتجاه الإزاحة', d.disp > 0 ? 'شرقاً' : d.disp < 0 ? 'غرباً' : 'لا يوجد (الإزاحة صفر)', false]);
      r.push(['في نهاية الرحلة', 'المسافة = ' + f2(d.total) + ' م ، الإزاحة = ' + f2(Math.abs(d.finalDisp)) + ' م', false]);
      r.push(['هل الإزاحة ≤ المسافة؟', Math.abs(d.disp) <= d.dist + 1e-9 ? 'نعم دائماً' : 'خطأ', false, 'pos']);
      return r;
    },
    steps(p, d) {
      if (p.mode === 'line') return ['المسافة = المجموع الحسابي للمسافات: $' + p.d1 + ' + ' + Math.abs(p.d2) + ' = ' + d.total + '$ م.', 'الإزاحة = جمع الحركتين مع الإشارة: $' + p.d1 + ' + (' + p.d2 + ') = ' + d.finalDisp + '$ م ' + (d.finalDisp > 0 ? 'شرقاً' : d.finalDisp < 0 ? 'غرباً' : '') + '.'];
      return ['المسافة = طول القوس = $2\\pi r \\times n = 2 \\times 3.14 \\times ' + p.r + ' \\times ' + p.n + ' \\approx ' + f2(d.total) + '$ م.', 'الإزاحة = طول الوتر بين البداية والنهاية = $' + f2(d.finalDisp) + '$ م' + (Math.abs(p.n - Math.round(p.n)) < 1e-9 ? ' (صفر عند إكمال دورات كاملة لأن البداية هي النهاية).' : '.')];
    },
    explain(a, b, da, db) { if (da && Math.abs(db.dist - Math.abs(db.disp)) > 1e-6 && Math.abs(da.dist - Math.abs(da.disp)) < 1e-6) return ['بدأت الإزاحة تختلف عن المسافة: الجسم غيّر اتجاه حركته (أو انحنى مساره)، فالمسافة تستمر بالزيادة بينما الإزاحة تقيس فقط البعد المباشر عن نقطة البداية.']; return []; },
    learn: ['**تعريف (ص 26):** المسافة طول المسار الحقيقي الذي يسلكه الجسم خلال حركته، أما الإزاحة فهي التغير في موضع الجسم ويعبر عنها بالمتجه الواصل بين نقطة البداية ونقطة النهاية.', '**مثال (1) ص 27:** طفل يتحرك 10 م شرقاً ثم 7 م غرباً: المسافة 17 م والإزاحة 3 م شرقاً.', '**مثال (2) ص 27:** سائق يدور دورة كاملة حول دوار نابلس (نق = 5 م): المسافة $2\\pi r = 31.4$ م والإزاحة صفر.'],
    challenges: [
      { q: 'مثّل مثال الطفل (ص 27) وتحقق: المسافة 17 م والإزاحة 3 م شرقاً.', hint: '$d_1 = 10$، $d_2 = -7$.', init: { mode: 'line', d1: 5, d2: 5, prog: 1 }, check: (p, d) => p.mode === 'line' && p.d1 === 10 && p.d2 === -7 && p.prog === 1 },
      { q: 'اجعل الإزاحة صفراً والمسافة 31.4 م تقريباً (دورة كاملة حول دوار نصف قطره 5 م).', hint: 'المسار الدائري، $r = 5$، $n = 1$.', init: { mode: 'line', d1: 5, d2: 5, prog: 1 }, check: (p, d) => p.mode === 'circle' && p.r === 5 && p.n === 1 && p.prog === 1 },
      { q: 'اجعل المسافة 20 م والإزاحة 0.', hint: 'اذهب 10 م وارجع 10 م.', init: { mode: 'line', d1: 5, d2: 5, prog: 1 }, check: (p, d) => p.mode === 'line' && p.prog === 1 && M.near(d.dist, 20) && M.near(d.finalDisp, 0) }
    ],
    tutor: [
      { q: 'هل يمكن أن تكون الإزاحة أكبر من المسافة؟', k: ['اكبر', 'الازاحه', 'المسافه'], a: () => 'لا. الإزاحة أقصر طريق بين البداية والنهاية (خط مستقيم)، والمسافة طول المسار الفعلي؛ لذلك الإزاحة ≤ المسافة، وتتساويان فقط إذا تحرك الجسم في خط مستقيم دون أن يرجع.' },
      { q: 'لماذا الإزاحة صفر في الدورة الكاملة؟', k: ['صفر', 'دوره', 'دوار'], a: () => 'لأن نقطة النهاية هي نقطة البداية نفسها، فالمتجه الواصل بينهما طوله صفر، رغم أن المسافة $2\\pi r$.' }
    ]
  });
  const this_ = ML.sims[ML.sims.length - 1];

  /* ======================= 3-2/3-3 السرعة المتوسطة واللحظية ======================= */
  ML.register({
    subject: S, id: 'velocity', unit: U, order: 2, lesson: '3-2، 3-3', lessonTitle: 'السرعة المتوسطة والسرعة اللحظية', page: 28,
    titleAr: 'السرعة المتوسطة والسرعة اللحظية', titleEn: 'Average & Instantaneous Velocity', tags: 'سرعه متوسطه لحظيه ميل مماس قاطع',
    formula: '\\bar v = \\frac{\\Delta x}{\\Delta t},\\qquad v(t) = \\lim_{\\Delta t \\to 0} \\frac{\\Delta x}{\\Delta t} = \\text{slope of tangent}',
    book: 'ع = Δف / Δز ؛ السرعة اللحظية = ميل المماس لمنحنى (ف − ز) عند لحظة معينة',
    summary: 'السرعة المتوسطة ميل الخط القاطع بين نقطتين على منحنى (الموضع–الزمن). عندما نقرّب النقطتين حتى يؤول فرق الزمن إلى الصفر يصبح القاطع مماساً، وميله هو السرعة اللحظية.',
    vars: [['x_0', 'الموضع الابتدائي', '\\mathrm{m}', '−10 – 10'], ['v_0', 'السرعة الابتدائية', '\\mathrm{m/s}', '−5 – 10'], ['a', 'التسارع (لتوليد منحنى)', '\\mathrm{m/s^2}', '−3 – 3'], ['t_1,\\ \\Delta t', 'لحظة البداية وطول الفترة', '\\mathrm{s}', 't₁: 0 – 8 ، Δt: 0.01 – 6']],
    assumptions: ['الحركة على خط مستقيم؛ الموضع يعطى بالعلاقة $x(t) = x_0 + v_0 t + \\tfrac12 a t^2$ (معادلة الحركة بتسارع ثابت، ص 36).'],
    params: [
      { key: 'x0', label: 'x_0', min: -10, max: 10, step: 0.5, value: 0 }, { key: 'v0', label: 'v_0', min: -5, max: 10, step: 0.5, value: 1 },
      { key: 'a', label: 'a', min: -3, max: 3, step: 0.25, value: 1 }, { key: 't1', label: 't_1\\ (\\mathrm{s})', min: 0, max: 8, step: 0.1, value: 2 },
      { key: 'dt', label: '\\Delta t\\ (\\mathrm{s})', min: 0.01, max: 6, step: 0.01, value: 4, desc: 'شغّل لتقريب النقطتين' }
    ],
    play: { key: 'dt', speed: -1.2, bounce: true },
    plot: { view: { xmin: -0.5, xmax: 10.5, ymin: -10, ymax: 70 }, equal: false },
    compute(p) {
      const x = (t) => p.x0 + p.v0 * t + 0.5 * p.a * t * t;
      const t2 = p.t1 + p.dt; const vavg = (x(t2) - x(p.t1)) / p.dt; const vinst = p.v0 + p.a * p.t1;
      return { x: x, t2: t2, x1: x(p.t1), x2: x(t2), vavg: vavg, vinst: vinst };
    },
    draw(G, p, d) {
      const c = G.colors();
      G.fn(d.x, { color: c.c1, width: 3, domain: [0, 10] });
      G.lineThrough(p.t1, d.x1, d.vavg, { color: c.c4, width: 2 });
      G.lineThrough(p.t1, d.x1, d.vinst, { color: c.c2, width: 2, dash: [7, 5] });
      G.segment(p.t1, d.x1, d.t2, d.x1, { color: c.muted, dash: [3, 3], width: 1.2 }); G.segment(d.t2, d.x1, d.t2, d.x2, { color: c.muted, dash: [3, 3], width: 1.2 });
      G.text((p.t1 + d.t2) / 2, d.x1, 'Δt', { color: c.muted, dy: 12, align: 'center' }); G.text(d.t2, (d.x1 + d.x2) / 2, 'Δx', { color: c.muted, dx: 6 });
      G.point(p.t1, d.x1, { color: c.c4, label: 'A' }); G.point(d.t2, d.x2, { color: c.c4, label: 'B' });
      G.text(G.view.xmax, G.view.ymax, 'القاطع (برتقالي) = السرعة المتوسطة • المماس (أحمر) = السرعة اللحظية', { color: c.text, align: 'right', dx: -6, dy: 14, rtl: true });
      G.text(G.view.xmin, G.view.ymin, 'الزمن (ث) →    الموضع (م) ↑', { color: c.muted, dx: 40, dy: -12, rtl: true });
    },
    graph(p, d) {
      return {
        view: { xmin: 0, xmax: 6, ymin: Math.min(d.vavg, d.vinst) - 3, ymax: Math.max(d.vavg, d.vinst) + 3 }, xLabel: 'Δt (ث)', yLabel: 'السرعة (م/ث)',
        caption: 'كلما صغرت $\\Delta t$ اقتربت السرعة المتوسطة (برتقالي) من السرعة اللحظية (أحمر) عند $t_1$.',
        draw(G) { const c = G.colors(); G.fn((h) => (d.x(p.t1 + h) - d.x(p.t1)) / h, { color: c.c4, width: 2.5, domain: [0.01, 6] }); G.hline(d.vinst, { color: c.c2, dash: [6, 5], width: 2 }); G.point(p.dt, d.vavg, { color: c.c4 }); }
      };
    },
    live(p, d) { return '\\bar v = \\frac{x(t_2) - x(t_1)}{\\Delta t} = \\frac{' + f2(d.x2) + ' - ' + f2(d.x1) + '}{' + f2(p.dt) + '} = ' + f2(d.vavg, 3) + '\\ \\mathrm{m/s}'; },
    results(p, d) {
      return [['السرعة المتوسطة', q(d.vavg, 'm/s')], ['السرعة اللحظية عند t₁', q(d.vinst, 'm/s')], ['الفرق بينهما', q(Math.abs(d.vavg - d.vinst), 'm/s')], ['الاتجاه', d.vavg > 0 ? 'باتجاه الموجب (الشرق)' : d.vavg < 0 ? 'باتجاه السالب (الغرب)' : 'لا حركة صافية', false], ['تحليل الوحدات', '\\frac{\\mathrm{m}}{\\mathrm{s}} = \\mathrm{m/s}']];
    },
    steps(p, d) { return ['$x(t_1) = x(' + f2(p.t1) + ') = ' + f2(d.x1, 3) + '$ م ، $x(t_2) = x(' + f2(d.t2) + ') = ' + f2(d.x2, 3) + '$ م.', '$\\bar v = \\Delta x / \\Delta t = ' + f2(d.x2 - d.x1, 3) + ' / ' + f2(p.dt) + ' = ' + f2(d.vavg, 3) + '$ م/ث.', 'ميل المماس عند $t_1$: $v = v_0 + a t_1 = ' + f2(d.vinst, 3) + '$ م/ث.']; },
    explain(a, b, da, db) { if (a.dt !== b.dt && da) return [b.dt < a.dt ? 'قرّبت النقطة B من A: القاطع يدور نحو المماس، والسرعة المتوسطة صارت $' + f2(db.vavg, 3) + '$ أقرب إلى اللحظية $' + f2(db.vinst, 3) + '$.' : 'أبعدت النقطة B: السرعة المتوسطة تعبر عن الحركة على فترة أطول فتبتعد عن السرعة عند لحظة $t_1$.']; return []; },
    learn: ['**السرعة المتوسطة (ص 28):** المعدل الزمني للإزاحة، أو الإزاحة الكلية مقسومة على الزمن اللازم لقطعها، وتقاس بوحدة م/ث وهي كمية متجهة باتجاه الإزاحة: $\\bar v = \\Delta x / \\Delta t$.', '**مثال (3) ص 29:** نملة من $x = 5$ سم عند 3 ث إلى $x = 10$ سم عند 8 ث: السرعة المتوسطة $= 1$ سم/ث شرقاً؛ ثم إلى 8 سم عند 10 ث: $-1$ سم/ث (غرباً).', '**السرعة اللحظية (ص 29–30):** نقرّب النقطتين حتى يؤول فرق الزمن إلى الصفر، فتصبح السرعة المتوسطة مساوية للسرعة اللحظية، وهي ميل المماس لمنحنى (ف–ز).'],
    challenges: [
      { q: 'اجعل الفرق بين السرعة المتوسطة واللحظية أقل من 0.05 م/ث (مع $a \\ne 0$).', hint: 'صغّر $\\Delta t$.', init: { a: 1, dt: 4 }, check: (p, d) => p.a !== 0 && Math.abs(d.vavg - d.vinst) < 0.05 },
      { q: 'اجعل السرعة المتوسطة تساوي اللحظية تماماً مهما كانت $\\Delta t$.', hint: 'حركة بسرعة ثابتة: $a = 0$ (منحنى ف–ز خط مستقيم).', init: { a: 1, dt: 4 }, check: (p) => p.a === 0 }
    ],
    tutor: [
      { q: 'لماذا تختلف السرعة المتوسطة عن اللحظية؟', k: ['تختلف', 'لماذا', 'متوسطه', 'لحظيه'], a: (p, d) => p.a === 0 ? 'هنا لا تختلفان لأن السرعة ثابتة ($a = 0$).' : 'لأن السرعة تتغير بانتظام (تسارع $' + p.a + '$ م/ث²)؛ المتوسطة تمثل الفترة كلها $[' + f2(p.t1) + ', ' + f2(d.t2) + ']$ بينما اللحظية تمثل لحظة $t_1$ فقط.' },
      { q: 'في أي لحظة تتساوى السرعة اللحظية والمتوسطة؟', k: ['تتساوي', 'متي'], a: () => 'عندما تكون السرعة ثابتة (منحنى ف–ز مستقيم)، أو عند نقطة يكون فيها المماس موازياً للقاطع.' }
    ]
  });

  /* ======================= 3-5 وصف منحنيات الحركة ======================= */
  const CASES = { rest: 'جسم ساكن (الموضع ثابت)', uniform: 'حركة بسرعة ثابتة', accel: 'حركة بتسارع ثابت' };
  ML.register({
    subject: S, id: 'motion-graphs', unit: U, order: 3, lesson: '3-5', lessonTitle: 'وصف منحنيات الحركة', page: 32,
    titleAr: 'منحنيات الحركة: الموضع والسرعة والتسارع مع الزمن', titleEn: 'Motion Graphs: x–t, v–t, a–t', tags: 'منحنى موضع زمن سرعه تسارع ميل مساحه',
    formula: 'v = \\text{slope}(x\\text{–}t),\\quad a = \\text{slope}(v\\text{–}t),\\quad \\Delta x = \\text{area}(v\\text{–}t)',
    book: 'ميل منحنى (ف − ز) = السرعة ؛ ميل منحنى (ع − ز) = التسارع ؛ المساحة تحت منحنى (ع − ز) = الإزاحة',
    summary: 'شكل منحنى الموضع–الزمن يخبرنا بنوع الحركة: خط أفقي = سكون، خط مائل = سرعة ثابتة، منحنى متزايد الانحدار = تسارع. ميل كل منحنى هو الكمية التالية، والمساحة تحت منحنى السرعة هي الإزاحة.',
    vars: [['x_0', 'الموضع الابتدائي', '\\mathrm{m}', '0 – 10'], ['v_0', 'السرعة', '\\mathrm{m/s}', '0 – 10'], ['a', 'التسارع', '\\mathrm{m/s^2}', '0 – 4'], ['t', 'الزمن', '\\mathrm{s}', '0 – 5']],
    assumptions: ['حركة على خط مستقيم؛ القيم مأخوذة كل ثانية كما في جداول الكتاب (ص 32–34).'],
    params: [
      { key: 'kind', label: '\\text{case}', type: 'select', value: 'accel', options: Object.keys(CASES).map((k) => [k, CASES[k]]) },
      { key: 'x0', label: 'x_0', min: 0, max: 10, step: 1, value: 0 },
      { key: 'v0', label: 'v_0', min: 0, max: 10, step: 0.5, value: 0, hidden: (p) => p.kind === 'rest' },
      { key: 'a', label: 'a', min: 0, max: 4, step: 0.5, value: 2, hidden: (p) => p.kind !== 'accel' },
      { key: 't', label: 't\\ (\\mathrm{s})', min: 0, max: 5, step: 0.01, value: 0 }
    ],
    play: { key: 't', speed: 1 },
    custom: true, canvasHint: 'العربة تتحرك حسب الحالة؛ النقاط الرمادية مواضعها عند كل ثانية (مثل شريط المؤقت النقطي).',
    graphModes: ['الموضع – الزمن', 'السرعة – الزمن', 'التسارع – الزمن'],
    compute(p) {
      const v0 = p.kind === 'rest' ? 0 : p.v0, a = p.kind === 'accel' ? p.a : 0;
      const x = (t) => p.x0 + v0 * t + 0.5 * a * t * t, v = (t) => v0 + a * t;
      const table = [0, 1, 2, 3, 4, 5].map((t) => [t, x(t)]);
      return { v0: v0, a: a, x: x, v: v, xt: x(p.t), vt: v(p.t), table: table };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const xmax = Math.max(25, d.x(5)) + 2;
      const X = track(ctx, W, H, c, 0, xmax, H * 0.6, 'الموضع (م)');
      d.table.forEach((r) => { ctx.fillStyle = c.muted; ctx.beginPath(); ctx.arc(X(r[1]), H * 0.6 - 48, 3.5, 0, 7); ctx.fill(); D.txt(ctx, r[0] + 'ث', X(r[1]), H * 0.6 - 62, { color: c.muted, size: 10 }); });
      car(ctx, X(d.xt), H * 0.6, c.c1, c);
      if (d.vt > 0) D.arrow(ctx, X(d.xt), H * 0.6 - 40, X(d.xt) + Math.min(120, d.vt * 8), H * 0.6 - 40, c.c3, 3);
      // جدول القراءات مثل الكتاب
      const tw = Math.min(W - 40, 460), x0 = (W - tw) / 2, y0 = 22, cw = tw / 7;
      D.txt(ctx, 'ز (ث)', x0 + tw - cw / 2, y0, { color: c.text, size: 12 }); D.txt(ctx, 'ف (م)', x0 + tw - cw / 2, y0 + 22, { color: c.text, size: 12 });
      d.table.forEach((r, i) => { D.txt(ctx, String(r[0]), x0 + tw - cw * (i + 1.5), y0, { color: c.text, size: 12 }); D.txt(ctx, f2(r[1]), x0 + tw - cw * (i + 1.5), y0 + 22, { color: c.c1, size: 12, w: '700' }); });
      D.txt(ctx, CASES[p.kind] + ' — t = ' + f2(p.t) + ' ث', W / 2, H - 22, { color: c.text, size: 14, w: '700' });
    },
    graph(p, d, gi) {
      const c0 = (G) => G.colors();
      if (gi === 0) return { view: { xmin: 0, xmax: 5.2, ymin: 0, ymax: D.niceMax(d.x(5) + 1, 5) }, xLabel: 'ز (ث)', yLabel: 'ف (م)', caption: 'ميل منحنى الموضع–الزمن = السرعة: ' + (p.kind === 'rest' ? 'الميل صفر (ساكن).' : p.kind === 'uniform' ? 'خط مستقيم ميله ثابت = ' + d.v0 + ' م/ث.' : 'منحنى يزداد ميله لأن السرعة تزداد.'), draw(G) { const c = c0(G); G.fn(d.x, { color: c.c1, width: 3, domain: [0, 5] }); d.table.forEach((r) => G.point(r[0], r[1], { color: c.muted, r: 3.5 })); G.point(p.t, d.xt, { color: c.c2 }); if (p.kind !== 'rest') G.lineThrough(p.t, d.xt, d.vt, { color: c.c2, dash: [6, 5], width: 1.5 }); } };
      if (gi === 1) return { view: { xmin: 0, xmax: 5.2, ymin: 0, ymax: D.niceMax(d.v(5) + 1, 2) }, xLabel: 'ز (ث)', yLabel: 'ع (م/ث)', caption: 'المساحة المظللة تحت منحنى السرعة–الزمن = الإزاحة حتى الآن: $' + f2(d.xt - p.x0, 3) + '$ م.', draw(G) { const c = c0(G); G.shade(d.v, 0, p.t, { color: c.c3, alpha: 0.25 }); G.fn(d.v, { color: c.c3, width: 3, domain: [0, 5] }); G.point(p.t, d.vt, { color: c.c2 }); } };
      return { view: { xmin: 0, xmax: 5.2, ymin: -1, ymax: 5 }, xLabel: 'ز (ث)', yLabel: 'ت (م/ث²)', caption: 'التسارع ' + (d.a === 0 ? 'صفر: السرعة لا تتغير.' : 'ثابت = ' + d.a + ' م/ث²: خط أفقي.'), draw(G) { const c = c0(G); G.fn(() => d.a, { color: c.c5, width: 3, domain: [0, 5] }); G.point(p.t, d.a, { color: c.c2 }); } };
    },
    live(p, d) { return 'x(' + f2(p.t) + ') = ' + f2(d.xt, 3) + '\\ \\mathrm{m},\\quad v = ' + f2(d.vt, 3) + '\\ \\mathrm{m/s},\\quad a = ' + d.a + '\\ \\mathrm{m/s^2}'; },
    results(p, d) { return [['الموضع', q(d.xt, 'm')], ['السرعة', q(d.vt, 'm/s')], ['التسارع', q(d.a, 'm/s^2')], ['الإزاحة حتى الآن', q(d.xt - p.x0, 'm')], ['وصف الحركة', p.kind === 'rest' ? 'ساكن: السرعة والتسارع صفر' : p.kind === 'uniform' ? 'المسافات المتتالية متساوية كل ثانية (سرعة ثابتة)' : 'المسافات المتتالية تزداد كل ثانية (تسارع)', false]]; },
    steps(p, d) { const t = d.table; return ['المسافات كل ثانية: ' + t.slice(1).map((r, i) => '$' + f2(r[1] - t[i][1]) + '$').join('، ') + ' م.', p.kind === 'accel' ? 'الفرق بين كل مسافتين متتاليتين ثابت $= a \\times 1^2 = ' + d.a + '$ م ← التسارع ثابت.' : (p.kind === 'uniform' ? 'المسافات متساوية ← السرعة ثابتة والتسارع صفر.' : 'لا تغيّر في الموضع ← السرعة صفر.')]; },
    learn: ['**الحالة الأولى (ص 32):** الموضع ثابت: منحنى ف–ز خط أفقي، السرعة صفر والتسارع صفر (سيارة إسعاف متوقفة عند حاجز).', '**الحالة الثانية (ص 33):** حركة بسرعة ثابتة: المسافات تتزايد بانتظام، منحنى ف–ز خط مستقيم ميله السرعة، والتسارع صفر.', '**الحالة الثالثة (ص 34):** سيارة سباق: ف = 0، 1، 4، 9، 16 م عند ز = 0…4 ث: منحنى ف–ز منحنٍ، منحنى ع–ز خط مستقيم، ومنحنى ت–ز خط أفقي (تسارع ثابت).', '**أسئلة الفصل (ص 41):** المساحة تحت منحنى ع–ز تساوي الإزاحة.'],
    challenges: [
      { q: 'مثّل سيارة السباق في مثال (6) ص 34: ف = 0، 1، 4، 9، 16 م.', hint: 'تسارع ثابت من السكون: $x = \\tfrac12 a t^2$ ← $a = 2$.', init: { kind: 'uniform', x0: 0, v0: 1, a: 0 }, check: (p) => p.kind === 'accel' && p.x0 === 0 && p.v0 === 0 && p.a === 2 },
      { q: 'مثّل جدول الحالة الثانية ص 33: ف = 5، 10، 15، 20، 25 م عند ز = 1…5 ث.', hint: 'سرعة ثابتة 5 م/ث من الصفر.', init: { kind: 'accel', x0: 2, v0: 0, a: 2 }, check: (p) => p.kind === 'uniform' && p.x0 === 0 && p.v0 === 5 }
    ],
    tutor: [
      { q: 'ماذا يمثل ميل منحنى الموضع–الزمن؟', k: ['ميل', 'الموضع'], a: (p, d) => 'السرعة. الآن ميل المماس عند $t = ' + f2(p.t) + '$ يساوي $' + f2(d.vt, 3) + '$ م/ث.' },
      { q: 'ماذا تمثل المساحة تحت منحنى السرعة؟', k: ['المساحه', 'تحت'], a: (p, d) => 'الإزاحة. حتى الآن: $' + f2(d.xt - p.x0, 3) + '$ م.' },
      { q: 'كيف أعرف من الجدول أن الحركة متسارعة؟', k: ['الجدول', 'اعرف', 'متسارعه'], a: () => 'أحسب المسافة المقطوعة في كل ثانية؛ إذا كانت تزداد فالسرعة تزداد والجسم يتسارع، وإذا كانت متساوية فالسرعة ثابتة.' }
    ]
  });

  /* ======================= 3-4/3-6 الحركة بتسارع ثابت ======================= */
  ML.register({
    subject: S, id: 'const-accel', unit: U, order: 4, lesson: '3-4، 3-6', lessonTitle: 'التسارع والحركة بتسارع ثابت', page: 35,
    titleAr: 'معادلات الحركة بتسارع ثابت', titleEn: 'Equations of Motion (Constant Acceleration)', tags: 'تسارع ثابت معادلات الحركه سرعه ابتدائيه نهائيه',
    formula: 'v = v_0 + a t,\\qquad x = v_0 t + \\tfrac12 a t^2,\\qquad v^2 = v_0^2 + 2 a x',
    book: 'ع2 = ع1 + ت ز ؛ ف = ع1 ز + ½ ت ز² ؛ ع2² = ع1² + 2 ت ف',
    summary: 'إذا تغيرت السرعة بانتظام (تسارع ثابت) فإن معادلات الحركة الثلاث تربط السرعة الابتدائية والنهائية والتسارع والزمن والإزاحة. التسارع السالب مع سرعة موجبة يعني تباطؤاً.',
    vars: [['v_0', 'السرعة الابتدائية (ع1)', '\\mathrm{m/s}', '−10 – 30'], ['a', 'التسارع (ت)', '\\mathrm{m/s^2}', '−10 – 10'], ['t', 'الزمن (ز)', '\\mathrm{s}', '≥ 0'], ['x', 'الإزاحة (ف)', '\\mathrm{m}', 'تُحسب']],
    assumptions: ['التسارع ثابت مقداراً واتجاهاً طوال الحركة، والحركة على خط مستقيم (ص 35).'],
    params: [
      { key: 'v0', label: 'v_0', min: -10, max: 30, step: 0.5, value: 0 }, { key: 'a', label: 'a', min: -10, max: 10, step: 0.5, value: 2.5 },
      { key: 'T', label: 't_{end}\\ (\\mathrm{s})', min: 0.5, max: 10, step: 0.5, value: 2, desc: 'مدة التجربة' }
    ],
    resetOn: ['v0', 'a', 'T'],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0, series: [] }),
    tick(st, p, d, dt) { st.t = Math.min(p.T, st.t + dt); const x = P.x(p.v0, p.a, st.t), v = P.v(p.v0, p.a, st.t); D.pushSeries(st, st.t, [x, v]); },
    isDone: (st, p) => st.t >= p.T - 1e-9,
    custom: true, canvasHint: 'اضغط «تشغيل»: العربة تتحرك وفق المعادلات؛ الأسهم: الأخضر السرعة، البنفسجي التسارع.',
    graphModes: ['الإزاحة – الزمن', 'السرعة – الزمن'],
    compute(p) {
      const xEnd = P.x(p.v0, p.a, p.T), vEnd = P.v(p.v0, p.a, p.T);
      return { xEnd: xEnd, vEnd: vEnd, check: P.v2(p.v0, p.a, xEnd) };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const st = d.st || { t: 0 }; const t = st.t;
      const xs = [0, d.xEnd]; for (let i = 0; i <= 20; i++) xs.push(P.x(p.v0, p.a, p.T * i / 20));
      const lo = Math.min.apply(null, xs), hi = Math.max.apply(null, xs);
      const X = track(ctx, W, H, c, lo - 2, Math.max(hi, lo + 5) + 2, H * 0.6, 'الإزاحة (م)');
      const x = P.x(p.v0, p.a, t), v = P.v(p.v0, p.a, t);
      car(ctx, X(x), H * 0.6, c.c1, c);
      if (Math.abs(v) > 1e-6) D.arrow(ctx, X(x), H * 0.6 - 44, X(x) + M.clamp(v * 6, -140, 140), H * 0.6 - 44, c.c3, 3);
      if (p.a !== 0) D.arrow(ctx, X(x), H * 0.6 - 60, X(x) + M.clamp(p.a * 10, -120, 120), H * 0.6 - 60, c.c5, 2.5);
      D.txt(ctx, 't = ' + f2(t) + ' s    x = ' + f2(x) + ' m    v = ' + f2(v) + ' m/s', W / 2, 28, { color: c.text, size: 16, w: '700' });
      if (p.v0 * p.a < 0 && Math.abs(p.a) > 0) D.txt(ctx, 'السرعة والتسارع متعاكسان: الجسم يتباطأ ثم يعكس اتجاهه عند t = ' + f2(-p.v0 / p.a) + ' ث', W / 2, H - 24, { color: c.c4, size: 13 });
    },
    graph(p, d, gi) {
      const st = d.st || { series: [] }; const ser = st.series || [];
      const lo = Math.min(0, d.xEnd, ...ser.map((r) => r[1])), hi = Math.max(1, d.xEnd, ...ser.map((r) => r[1]));
      if (gi === 0) return { view: { xmin: 0, xmax: p.T, ymin: lo - 1, ymax: hi + 1 }, xLabel: 'ز (ث)', yLabel: 'ف (م)', caption: 'المنحنى النظري (متقطع) والقياس أثناء الحركة (متصل).', draw(G) { const c = G.colors(); G.fn((t) => P.x(p.v0, p.a, t), { color: c.muted, dash: [5, 5], width: 1.5, domain: [0, p.T] }); D.series(G, ser.map((r) => [r[0], r[1]]), c.c1, 3); } };
      const vl = Math.min(0, p.v0, d.vEnd), vh = Math.max(1, p.v0, d.vEnd);
      return { view: { xmin: 0, xmax: p.T, ymin: vl - 1, ymax: vh + 1 }, xLabel: 'ز (ث)', yLabel: 'ع (م/ث)', caption: 'خط مستقيم ميله التسارع $a = ' + p.a + '$ م/ث²؛ المساحة تحته = الإزاحة.', draw(G) { const c = G.colors(); G.fn((t) => P.v(p.v0, p.a, t), { color: c.muted, dash: [5, 5], width: 1.5, domain: [0, p.T] }); const cur = st.t || 0; G.shade((t) => P.v(p.v0, p.a, t), 0, cur, { color: c.c3, alpha: 0.2 }); D.series(G, ser.map((r) => [r[0], r[2]]), c.c3, 3); } };
    },
    live(p, d) { return 'v = ' + p.v0 + ' + (' + p.a + ')(' + p.T + ') = ' + f2(d.vEnd, 3) + ',\\quad x = ' + p.v0 + '(' + p.T + ') + \\tfrac12(' + p.a + ')(' + p.T + ')^2 = ' + f2(d.xEnd, 3); },
    results(p, d) {
      const st = d.st || { t: 0 };
      return [['السرعة النهائية v', q(d.vEnd, 'm/s')], ['الإزاحة x', q(d.xEnd, 'm')], ['تحقق: v² = v₀² + 2ax', M.fmt(d.vEnd * d.vEnd, 4) + ' = ' + M.fmt(d.check, 4), true, M.near(d.vEnd * d.vEnd, d.check, 1e-6) ? 'pos' : 'neg'], ['الزمن المنقضي في التجربة', q(st.t, 's')], ['تحليل الوحدات', '\\mathrm{\\tfrac{m}{s^2} \\cdot s = \\tfrac{m}{s}},\\ \\mathrm{\\tfrac{m}{s^2} \\cdot s^2 = m}']];
    },
    steps(p, d) { return ['$v = v_0 + at = ' + p.v0 + ' + ' + p.a + ' \\times ' + p.T + ' = ' + f2(d.vEnd, 3) + '$ م/ث.', '$x = v_0 t + \\tfrac12 a t^2 = ' + p.v0 + ' \\times ' + p.T + ' + \\tfrac12 \\times ' + p.a + ' \\times ' + p.T + '^2 = ' + f2(d.xEnd, 3) + '$ م.', '$v^2 = v_0^2 + 2ax = ' + f2(d.check, 3) + '$ ✓']; },
    explain(a, b, da, db) {
      const o = [];
      if (a.a !== b.a) o.push('غيّرت التسارع إلى $' + b.a + '$ م/ث²: ' + (b.a > 0 ? 'السرعة تزداد ' + b.a + ' م/ث كل ثانية' : b.a < 0 ? 'السرعة تقل ' + Math.abs(b.a) + ' م/ث كل ثانية' : 'السرعة ثابتة') + '، فصارت الإزاحة بعد ' + b.T + ' ث $' + f2(db.xEnd, 3) + '$ م.');
      if (a.T !== b.T) o.push('مضاعفة الزمن تضاعف حد $v_0 t$ لكنها تضرب حد $\\tfrac12 a t^2$ في أربعة؛ لذلك الإزاحة تنمو بسرعة أكبر من الزمن عندما يوجد تسارع.');
      return o;
    },
    onDone(st, p, d) { return ['انتهت التجربة بعد ' + p.T + ' ث: قطعت العربة $' + f2(d.xEnd, 3) + '$ م ووصلت سرعتها إلى $' + f2(d.vEnd, 3) + '$ م/ث — كما تتنبأ المعادلات تماماً.']; },
    learn: ['**متوسط التسارع (ص 30):** $a = \\frac{\\Delta v}{\\Delta t} = \\frac{v_2 - v_1}{t_2 - t_1}$ ويقاس بوحدة م/ث². **مثال (4):** جسم من السكون بتسارع 3 م/ث² بعد 4 ث سرعته 12 م/ث.', '**معادلات الحركة (ص 36):** (1) $v_2 = v_1 + at$، (2) $x = v_1 t + \\tfrac12 a t^2$ (من مساحة شبه المنحرف تحت منحنى ع–ز)، (3) $v_2^2 = v_1^2 + 2ax$.', '**مثال (7) ص 37:** من السكون بتسارع 2.5 م/ث² حتى 5 م/ث: الزمن 2 ث والإزاحة 5 م.', '**مثال (8) ص 37:** إزاحة 10 م خلال 2 ث بتسارع 4 م/ث²: السرعة الابتدائية 1 م/ث والنهائية 9 م/ث.'],
    challenges: [
      { q: 'مثال (7): من السكون بتسارع 2.5 م/ث²، اجعل السرعة النهائية 5 م/ث.', hint: '$t = v/a = 2$ ث.', init: { v0: 1, a: 1, T: 1 }, check: (p, d) => p.v0 === 0 && p.a === 2.5 && M.near(d.vEnd, 5), why: (p, d) => 'الإزاحة $= ' + f2(d.xEnd) + '$ م كما في الكتاب.' },
      { q: 'مثال (8): اجعل الجسم يقطع 10 م خلال 2 ث بتسارع 4 م/ث². ما سرعته الابتدائية؟', hint: '$10 = 2v_0 + \\tfrac12 \\cdot 4 \\cdot 4$.', init: { v0: 0, a: 1, T: 1 }, check: (p, d) => p.a === 4 && p.T === 2 && M.near(d.xEnd, 10), why: () => '$v_0 = 1$ م/ث والسرعة النهائية 9 م/ث.' },
      { q: 'اجعل الجسم يعود إلى نقطة البداية (الإزاحة صفر) بعد 4 ث.', hint: '$v_0 \\cdot 4 + \\tfrac12 a \\cdot 16 = 0$ ← مثلاً $v_0 = 10, a = -5$.', init: { v0: 0, a: 1, T: 1 }, check: (p, d) => p.T === 4 && M.near(d.xEnd, 0) && p.v0 !== 0 }
    ],
    tutor: [
      { q: 'ماذا يحدث لو ضاعفت الزمن؟', k: ['ضاعفت', 'الزمن', 'ضعف'], a: (p) => { const x1 = P.x(p.v0, p.a, p.T), x2 = P.x(p.v0, p.a, 2 * p.T); return 'السرعة النهائية تصبح $' + f2(P.v(p.v0, p.a, 2 * p.T), 3) + '$ م/ث، والإزاحة من $' + f2(x1, 3) + '$ إلى $' + f2(x2, 3) + '$ م' + (p.v0 === 0 ? ' — أي 4 أضعاف لأن $x \\propto t^2$ عند البدء من السكون.' : '.'); } },
      { q: 'ماذا يعني التسارع السالب؟', k: ['سالب', 'تباطؤ', 'يتباطا'], a: (p) => 'أن التسارع باتجاه السالب. إذا كانت السرعة موجبة فالجسم يتباطأ' + (p.a < 0 && p.v0 > 0 ? '، ويتوقف لحظياً بعد $' + f2(-p.v0 / p.a) + '$ ث ثم يتحرك عكسياً.' : '.') },
      { q: 'من أين جاءت المعادلة الثانية؟', k: ['المعادله الثانيه', 'اشتقاق', 'من اين'], a: () => 'من المساحة تحت منحنى (ع–ز): شبه منحرف قاعدتاه $v_1, v_2$ وارتفاعه $t$: $x = \\tfrac12 (v_1 + v_2) t$، ثم نعوض $v_2 = v_1 + at$ (ص 36).' }
    ]
  });

  /* ======================= 3-7 السقوط الحر والقذف الرأسي ======================= */
  ML.register({
    subject: S, id: 'free-fall', unit: U, order: 5, lesson: '3-7', lessonTitle: 'السقوط الحر في مجال الجاذبية الأرضية', page: 37,
    titleAr: 'السقوط الحر والمقذوف الرأسي', titleEn: 'Free Fall & Vertical Projection', tags: 'سقوط حر مقذوف راسي جاذبيه اقصى ارتفاع زمن تحليق',
    formula: 'v = v_0 - g t,\\quad y = h_0 + v_0 t - \\tfrac12 g t^2,\\quad h_{max} = h_0 + \\frac{v_0^2}{2g}',
    book: 'ع2 = ع1 + جـ ز ، ف = ع1 ز + ½ جـ ز² ، ع2² = ع1² + 2 جـ ف ، حيث جـ = −10 م/ث² (الأعلى موجب)',
    summary: 'بإهمال مقاومة الهواء يسقط الجسم تحت تأثير وزنه فقط بتسارع ثابت يساوي تسارع الجاذبية $g$ نحو الأسفل، مهما كانت كتلته. في القذف للأعلى تقل السرعة حتى تنعدم عند أقصى ارتفاع، وزمن التحليق ضعف زمن الصعود (عند العودة لنقطة القذف).',
    vars: [['v_0', 'السرعة الابتدائية (موجبة للأعلى)', '\\mathrm{m/s}', '−30 – 50'], ['h_0', 'ارتفاع نقطة البداية', '\\mathrm{m}', '0 – 2000'], ['g', 'تسارع الجاذبية', '\\mathrm{m/s^2}', '1 – 25 (الأرض 9.8، أمثلة الكتاب 10)'], ['m', 'الكتلة (لا تؤثر)', '\\mathrm{kg}', '0.1 – 100']],
    assumptions: ['**بإهمال مقاومة الهواء** (ص 37–38).', 'الاتجاه للأعلى موجب؛ لذلك تسارع الجاذبية $-g$.', 'الأرض مستوية عند $y = 0$ ويتوقف الجسم عند ملامستها.'],
    params: [
      { key: 'v0', label: 'v_0\\ (\\mathrm{m/s})', min: -30, max: 50, step: 1, value: 20 },
      { key: 'h0', label: 'h_0\\ (\\mathrm{m})', min: 0, max: 2000, step: 5, value: 0 },
      { key: 'g', label: 'g\\ (\\mathrm{m/s^2})', min: 1, max: 25, step: 0.1, value: 10, desc: 'القمر ≈ 1.6' },
      { key: 'm', label: 'm\\ (\\mathrm{kg})', min: 0.1, max: 100, step: 0.1, value: 1 }
    ],
    resetOn: ['v0', 'h0', 'g', 'm'],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0, series: [] }),
    tick(st, p, d, dt) {
      const k = P.vertical(p.v0, p.h0, p.g); const tEnd = k.tGround; const speedUp = Math.max(1, tEnd / 8);
      st.t = Math.min(tEnd, st.t + dt * speedUp); D.pushSeries(st, st.t, [k.y(st.t), k.vy(st.t)]);
    },
    isDone: (st, p) => st.t >= P.vertical(p.v0, p.h0, p.g).tGround - 1e-9,
    custom: true, canvasHint: 'الكرة تتحرك بالزمن الحقيقي (يُسرَّع العرض للارتفاعات الكبيرة). النقاط الرمادية مواضعها كل ثانية.',
    graphModes: ['الارتفاع – الزمن', 'السرعة – الزمن'],
    compute(p) { const k = P.vertical(p.v0, p.h0, p.g); return Object.assign(k, { W: P.weight(p.m, p.g) }); },
    drawCustom(ctx, W, H, p, d, c) {
      const st = d.st || { t: 0 }; const t = st.t;
      const top = d.hMax * 1.12 + 1; const y0 = H - 40, yTop = 40; const Y = (h) => y0 - h / top * (y0 - yTop);
      ctx.fillStyle = c.c3; ctx.globalAlpha = 0.25; ctx.fillRect(0, y0, W, H - y0); ctx.globalAlpha = 1;
      ctx.strokeStyle = c.axis; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(W, y0); ctx.stroke();
      // مسطرة الارتفاع
      const stp = ML.niceStep(top / 6); ctx.lineWidth = 1;
      for (let h = 0; h <= top; h += stp) { ctx.beginPath(); ctx.moveTo(40, Y(h)); ctx.lineTo(48, Y(h)); ctx.stroke(); D.txt(ctx, M.fmt(h) + ' م', 36, Y(h), { color: c.text, size: 11, align: 'right' }); }
      const bx = W * 0.55;
      if (d.hMax > p.h0 + 1e-9) { ctx.strokeStyle = c.c4; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(bx - 70, Y(d.hMax)); ctx.lineTo(bx + 70, Y(d.hMax)); ctx.stroke(); ctx.setLineDash([]); D.txt(ctx, 'أقصى ارتفاع ' + f2(d.hMax) + ' م', bx + 76, Y(d.hMax), { color: c.c4, size: 12, align: 'left' }); }
      for (let k = 1; k < d.tGround; k++) { ctx.fillStyle = c.muted; ctx.beginPath(); ctx.arc(bx - 30, Y(d.y(k)), 3, 0, 7); ctx.fill(); }
      const y = Math.max(0, d.y(t)), v = d.vy(t);
      ctx.fillStyle = c.c1; ctx.beginPath(); ctx.arc(bx, Y(y) - 10, 10, 0, 7); ctx.fill();
      if (Math.abs(v) > 0.01) D.arrow(ctx, bx + 22, Y(y) - 10, bx + 22, Y(y) - 10 - M.clamp(v * 2.5, -90, 90), c.c3, 3);
      D.arrow(ctx, bx - 22, Y(y) - 10, bx - 22, Y(y) + 22, c.c2, 2.5); D.txt(ctx, 'g', bx - 34, Y(y) + 10, { color: c.c2, size: 13, w: '700' });
      D.txt(ctx, 't = ' + f2(t) + ' s   y = ' + f2(y) + ' m   v = ' + f2(v) + ' m/s', W / 2, 20, { color: c.text, size: 15, w: '700' });
    },
    graph(p, d, gi) {
      const st = d.st || { series: [] }; const ser = st.series || []; const T = Math.max(d.tGround, 0.1);
      if (gi === 0) return { view: { xmin: 0, xmax: T, ymin: 0, ymax: d.hMax * 1.1 + 1 }, xLabel: 'ز (ث)', yLabel: 'الارتفاع (م)', caption: 'قطع مكافئ: الارتفاع دالة تربيعية في الزمن؛ قمته عند $t = v_0/g$.', draw(G) { const c = G.colors(); G.fn(d.y, { color: c.muted, dash: [5, 5], width: 1.5, domain: [0, T] }); D.series(G, ser.map((r) => [r[0], r[1]]), c.c1, 3); if (d.tTop > 0) G.point(d.tTop, d.hMax, { color: c.c4, r: 4 }); } };
      return { view: { xmin: 0, xmax: T, ymin: Math.min(d.vGround, 0) - 2, ymax: Math.max(p.v0, 0) + 2 }, xLabel: 'ز (ث)', yLabel: 'ع (م/ث)', caption: 'خط مستقيم ميله $-g = -' + p.g + '$ م/ث²؛ يقطع محور الزمن عند أقصى ارتفاع (السرعة صفر).', draw(G) { const c = G.colors(); G.fn(d.vy, { color: c.muted, dash: [5, 5], width: 1.5, domain: [0, T] }); D.series(G, ser.map((r) => [r[0], r[2]]), c.c3, 3); G.hline(0, { color: c.axis, width: 1 }); } };
    },
    live(p, d) { return 'h_{max} = ' + p.h0 + ' + \\frac{' + Math.max(0, p.v0) + '^2}{2(' + p.g + ')} = ' + f2(d.hMax, 3) + '\\ \\mathrm{m},\\quad t_{ground} = ' + f2(d.tGround, 3) + '\\ \\mathrm{s}'; },
    results(p, d) {
      return [
        ['أقصى ارتفاع', q(d.hMax, 'm')], ['زمن الوصول لأقصى ارتفاع', p.v0 > 0 ? q(d.tTop, 's') : '\\text{لا يصعد (}v_0 \\le 0\\text{)}'],
        ['زمن الوصول إلى الأرض', q(d.tGround, 's')], ['سرعة الوصول إلى الأرض', q(Math.abs(d.vGround), 'm/s') + '\\ \\text{للأسفل}'],
        ['وزن الجسم', q(d.W, 'N') + '\\ (\\text{لا يغيّر الحركة})'],
        ['تحليل الوحدات', '\\frac{(\\mathrm{m/s})^2}{\\mathrm{m/s^2}} = \\mathrm{m}']
      ];
    },
    steps(p, d) {
      const s = [];
      if (p.v0 > 0) s.push('زمن الصعود: عند أقصى ارتفاع $v = 0$: $0 = ' + p.v0 + ' - ' + p.g + 't \\Rightarrow t = ' + f2(d.tTop, 3) + '$ ث.', '$h_{max} = h_0 + \\frac{v_0^2}{2g} = ' + f2(d.hMax, 3) + '$ م.');
      s.push('الوصول للأرض: $0 = ' + p.h0 + ' + ' + p.v0 + 't - \\tfrac12(' + p.g + ')t^2 \\Rightarrow t = ' + f2(d.tGround, 3) + '$ ث.');
      s.push('$v^2 = v_0^2 + 2gh_0 \\Rightarrow |v| = ' + f2(Math.abs(d.vGround), 3) + '$ م/ث.');
      if (p.h0 === 0 && p.v0 > 0) s.push('زمن التحليق $= ' + f2(d.tGround, 3) + ' = 2 \\times ' + f2(d.tTop, 3) + '$ (ضعف زمن الصعود).');
      return s;
    },
    explain(a, b, da, db) {
      const o = [];
      if (a.m !== b.m) o.push('غيّرت الكتلة من ' + a.m + ' إلى ' + b.m + ' كغم، **لكن الحركة لم تتغير**: زمن الوصول ما زال $' + f2(db.tGround, 3) + '$ ث. بإهمال مقاومة الهواء كل الأجسام تسقط بالتسارع نفسه (نشاط 7، ص 38).');
      if (a.g !== b.g) o.push('غيّرت $g$ إلى ' + b.g + ': ' + (b.g < a.g ? 'جاذبية أضعف تعني تباطؤاً أبطأ في الصعود فيصعد أعلى ويبقى في الهواء أطول.' : 'جاذبية أقوى تعني صعوداً أقل وسقوطاً أسرع.'));
      if (a.v0 !== b.v0) o.push('مضاعفة سرعة القذف تضاعف زمن الصعود لكنها تضرب أقصى ارتفاع في 4 لأن $h \\propto v_0^2$.');
      return o;
    },
    onDone(st, p, d) { return ['وصلت الكرة إلى الأرض بعد $' + f2(d.tGround, 3) + '$ ث بسرعة $' + f2(Math.abs(d.vGround), 3) + '$ م/ث نحو الأسفل.']; },
    learn: ['**السقوط الحر (ص 37–38):** بإهمال مقاومة الهواء يسقط الجسم تحت تأثير وزنه فقط، وتزداد سرعته بتسارع ثابت يساوي تسارع الجاذبية 9.8 م/ث². **نشاط (7):** في مفرغة الهواء تصل الورقة وقطعة النقد معاً.', '**المعادلات (ص 40):** نستخدم معادلات الحركة نفسها مع $a = -10$ م/ث² (الأعلى موجب)، والسرعة الابتدائية للجسم الساقط غالباً صفر.', '**مثال (9):** صندوق يسقط من طائرة ثابتة على ارتفاع 2 كم: يصل بعد 20 ث بسرعة 200 م/ث.', '**المقذوف الرأسي (ص 40):** سرعة الجسم عند أقصى ارتفاع صفر، وزمن التحليق الكلي ضعفا زمن الوصول لأقصى ارتفاع. **مثال (10):** أقصى ارتفاع 20 م ← $v_0 = 20$ م/ث وزمن الصعود 2 ث.'],
    challenges: [
      { q: 'مثال (9): صندوق يسقط من 2000 م (بـ $g = 10$). تحقق أنه يصل بعد 20 ث بسرعة 200 م/ث.', hint: '$v_0 = 0$، $h_0 = 2000$، $g = 10$.', init: { v0: 10, h0: 0, g: 9.8 }, check: (p, d) => p.v0 === 0 && p.h0 === 2000 && p.g === 10 },
      { q: 'مثال (10): اجعل أقصى ارتفاع 20 م بالقذف من الأرض ($g = 10$).', hint: '$v_0^2 = 2gh = 400$.', init: { v0: 10, h0: 0, g: 9.8 }, check: (p, d) => p.h0 === 0 && p.g === 10 && M.near(d.hMax, 20, 1e-9), why: () => '$v_0 = 20$ م/ث وزمن الصعود 2 ث.' },
      { q: 'س8 ص 43: قُذف جسم فوصل أقصى ارتفاع 45 م. ما زمن التحليق؟ (g = 10)', hint: '$v_0 = 30$ م/ث.', init: { v0: 10, h0: 0, g: 9.8 }, check: (p, d) => p.h0 === 0 && p.g === 10 && M.near(d.hMax, 45, 1e-9), why: (p, d) => 'زمن التحليق $= ' + f2(d.tGround) + '$ ث.' },
      { q: 'سؤال ص 41: جسم كتلته 20 كغم سقط سقوطاً حراً فوصل بعد 3 ث ($g = 10$). ما ارتفاعه؟', hint: '$h = \\tfrac12 g t^2$.', init: { v0: 10, h0: 0, g: 9.8, m: 1 }, check: (p, d) => p.v0 === 0 && p.g === 10 && M.near(d.tGround, 3, 1e-9), why: () => 'الارتفاع 45 م وسرعة الوصول 30 م/ث.' }
    ],
    tutor: [
      { q: 'لماذا لا تؤثر الكتلة على زمن السقوط؟', k: ['الكتله', 'لا تؤثر', 'ثقيل', 'خفيف'], a: (p, d) => 'لأن تسارع السقوط الحر هو $g$ نفسه لكل الأجسام عند إهمال مقاومة الهواء. الجسم الأثقل يُسحب بقوة أكبر (وزنه $' + f2(d.W) + '$ N) لكن قصوره أكبر بالنسبة نفسها، فيبقى التسارع $g$. لهذا يصل بعد $' + f2(d.tGround, 3) + '$ ث مهما كانت كتلته.' },
      { q: 'ما سرعة الجسم عند أقصى ارتفاع؟', k: ['اقصى ارتفاع', 'السرعه عند', 'القمه'], a: () => 'صفر لحظياً؛ يتوقف الجسم ثم يعكس اتجاه حركته، لكن تسارعه يبقى $g$ نحو الأسفل.' },
      { q: 'ماذا لو ضاعفت سرعة القذف؟', k: ['ضاعفت', 'ضعف', 'سرعه القذف'], a: (p, d) => { const k = P.vertical(2 * p.v0, p.h0, p.g); return 'زمن الصعود يتضاعف ($' + f2(k.tTop, 3) + '$ ث) وأقصى ارتفاع يصبح $' + f2(k.hMax, 3) + '$ م بدلاً من $' + f2(d.hMax, 3) + '$ م.'; } }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
