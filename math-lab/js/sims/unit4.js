/* الوحدة الرابعة: الاقترانات المثلثية (ص 99–140) */
(function (root) {
  'use strict';
  const ML = root.ML; const M = ML.math; const F = ML.fx;
  const U = 4; const PI = Math.PI;
  const QN = ['ربعية', 'الأول', 'الثاني', 'الثالث', 'الرابع'];
  const degTex = (x) => M.fmt(x) + '^{\\circ}';

  /* ======================= 4-1 الزاوية في الوضع القياسي ======================= */
  ML.register({
    id: 'standard-angle', unit: U, order: 1, lesson: '4-1', lessonTitle: 'الزاوية في الوضع القياسي', page: 101,
    titleAr: 'الزاوية في الوضع القياسي والزوايا المتكافئة', titleEn: 'Angles in Standard Position & Coterminal Angles', tags: 'زاويه موجهه وضع قياسي ربع زاويه ربعيه متكافئه',
    formula: '\\theta \\sim \\theta + 360^{\\circ}k,\\quad k \\in \\mathbb{Z}',
    book: 'هـ تكافئ هـ + 360°ك (بالقياس الستيني) ، هـ + 2πك (بالقياس الدائري)',
    summary: 'تكون الزاوية في الوضع القياسي إذا كان رأسها نقطة الأصل وضلع ابتدائها على محور السينات الموجب. تكون موجبة إذا دار ضلع الابتداء عكس عقارب الساعة، وسالبة إذا دار معها. الزوايا التي لها ضلع الانتهاء نفسه متكافئة.',
    vars: [['\\theta', 'قياس الزاوية الموجهة بالدرجات', '$\\mathbb{R}$ (هنا من $-720^\\circ$ إلى $720^\\circ$)'], ['k', 'عدد الدورات الكاملة المضافة', '$k \\in \\mathbb{Z}$']],
    params: [{ key: 'th', label: '\\theta', min: -720, max: 720, step: 1, value: 210, desc: 'بالدرجات' }],
    play: { key: 'th', speed: 60 },
    plot: { view: { xmin: -6, xmax: 6, ymin: -6, ymax: 6 }, ticks: false },
    compute(p) {
      const n = M.normDeg(p.th); const q = M.quadrant(p.th);
      const turns = Math.floor(Math.abs(p.th) / 360);
      return { n: n, q: q, turns: turns, ref: M.referenceAngle(p.th), co: [-720, -360, 360, 720].map((k) => p.th + k) };
    },
    draw(P, p, d) {
      const c = P.colors(); const R = 4.2;
      // تظليل الربع
      if (d.q) { const a0 = (d.q - 1) * PI / 2; P.angleArc(0, 0, P.pxPerUnit * 5.2, a0, a0 + PI / 2, { color: c.c4, alpha: 0, width: 0.1, fill: c.c4 }); }
      ['I', 'II', 'III', 'IV'].forEach((t, i) => { const a = PI / 4 + i * PI / 2; P.text(4.6 * Math.cos(a), 4.6 * Math.sin(a), 'الربع ' + QN[i + 1], { color: c.muted, align: 'center', rtl: true }); });
      P.segment(0, 0, R + 0.8, 0, { color: c.c3, width: 4 });
      P.text(R + 0.8, 0, 'ضلع الابتداء', { color: c.c3, dy: 14, align: 'right', rtl: true });
      // حلزون الدوران
      const t = M.deg2rad(p.th);
      const sp = (u) => { const a = t * u; const rr = 0.5 + 0.25 * Math.abs(a) / (2 * PI); return [rr * Math.cos(a), rr * Math.sin(a)]; };
      P.parametric((u) => sp(u)[0], (u) => sp(u)[1], 0, 1, { color: p.th >= 0 ? c.c1 : c.c2, width: 2.5 }, 240);
      if (Math.abs(p.th) > 8) { const q0 = sp(0.97), q1 = sp(1); P.arrow(q0[0], q0[1], q1[0], q1[1], { color: p.th >= 0 ? c.c1 : c.c2, width: 2.5 }); }
      P.segment(0, 0, (R + 0.8) * Math.cos(t), (R + 0.8) * Math.sin(t), { color: c.c5, width: 4 });
      P.point((R + 0.8) * Math.cos(t), (R + 0.8) * Math.sin(t), { color: c.c5, label: 'ضلع الانتهاء' });
      P.point(0, 0, { color: c.axis, r: 4 });
      P.text(0, -5.4, 'θ = ' + p.th + '° ' + (p.th >= 0 ? '(موجبة: عكس عقارب الساعة)' : '(سالبة: مع عقارب الساعة)'), { align: 'center', rtl: true, bold: true, color: p.th >= 0 ? c.c1 : c.c2 });
    },
    live(p) { return '\\theta = ' + degTex(p.th) + ' = ' + M.radTeX(p.th) + '\\ \\text{rad}'; },
    results(p, d) {
      return [
        ['الاتجاه', p.th >= 0 ? 'موجبة (عكس عقارب الساعة)' : 'سالبة (مع عقارب الساعة)', false],
        ['يقع ضلع الانتهاء', d.q ? 'في الربع ' + QN[d.q] : 'على أحد المحاور: زاوية ربعية', false],
        ['عدد الدورات الكاملة', String(d.turns)],
        ['الزاوية المكافئة في [0°, 360°)', degTex(d.n)],
        ['زوايا مكافئة', d.co.map(degTex).join(',\\ ')],
        ['زاوية الإسناد', d.q ? degTex(d.ref) : '\\text{—}']
      ];
    },
    steps(p, d) {
      return ['$' + M.fmt(p.th) + '^\\circ = ' + M.fmt(d.n) + '^\\circ + 360^\\circ \\times (' + M.fmt((p.th - d.n) / 360) + ')$', 'إذن $' + degTex(p.th) + '$ تكافئ $' + degTex(d.n) + '$ (نفس ضلعي الابتداء والانتهاء).', d.q ? 'بما أن $' + (d.q - 1) * 90 + '^\\circ < ' + M.fmt(d.n) + '^\\circ < ' + d.q * 90 + '^\\circ$ فضلع الانتهاء في الربع ' + QN[d.q] + '.' : 'ضلع الانتهاء على محور ← زاوية ربعية.'];
    },
    explain(a, b, da, db) {
      const o = [];
      if (Math.sign(a.th) !== Math.sign(b.th) && b.th !== 0) o.push('صارت الزاوية ' + (b.th > 0 ? 'موجبة: الدوران عكس عقارب الساعة.' : 'سالبة: الدوران مع عقارب الساعة.'));
      if (da && da.q !== db.q) o.push(db.q ? 'انتقل ضلع الانتهاء إلى الربع ' + QN[db.q] + '.' : 'انطبق ضلع الانتهاء على محور: الزاوية $' + degTex(b.th) + '$ ربعية.');
      if (da && da.turns !== db.turns) o.push('أكملت الزاوية ' + db.turns + ' دورة كاملة؛ كل دورة تضيف $360^\\circ$ دون تغيير موقع ضلع الانتهاء.');
      return o;
    },
    learn: [
      '**الزاوية الموجهة (ص 101):** يتحدد اتجاهها باتجاه دوران ضلع الابتداء لينطبق على ضلع الانتهاء؛ موجبة عكس عقارب الساعة، وسالبة مع عقارب الساعة.',
      '**الوضع القياسي (ص 102):** رأس الزاوية نقطة الأصل وضلع الابتداء على محور السينات الموجب.',
      '**ص 103–104:** إذا كان $0^\\circ < \\theta < 90^\\circ$ فضلع الانتهاء في الربع الأول، وهكذا. الزاوية التي ينطبق ضلع انتهائها على أحد المحاور تسمى **ربعية** (مثل $90^\\circ, 180^\\circ, -90^\\circ$).',
      '**الزوايا المتكافئة (ص 109–110):** لهما ضلع الابتداء نفسه وضلع الانتهاء نفسه: $\\theta$ تكافئ $\\theta + 360^\\circ k$. مثال: $60^\\circ$ تكافئ $420^\\circ$ و $780^\\circ$ و $-300^\\circ$.'
    ],
    challenges: [
      { q: 'ارسم زاوية سالبة تكافئ $60^\\circ$.', hint: '$60^\\circ - 360^\\circ$.', init: { th: 0 }, check: (p) => p.th === -300 || p.th === -660 },
      { q: 'ارسم زاوية قياسها $-300^\\circ$ وحدد ربعها (نشاط 7 ص 104).', hint: 'حرك المنزلق إلى $-300$.', init: { th: 0 }, check: (p) => p.th === -300, why: () => 'تكافئ $60^\\circ$ فهي في الربع الأول.' },
      { q: 'اختر زاوية ربعية سالبة.', hint: 'مثل $-90^\\circ$ أو $-180^\\circ$.', init: { th: 45 }, check: (p) => p.th < 0 && p.th % 90 === 0 }
    ],
    tutor: [
      { q: 'لماذا تتكافأ θ و θ + 360°؟', k: ['تتكافا', 'متكافئه', '360'], a: (p) => 'لأن $360^\\circ$ دورة كاملة تعيد ضلع الانتهاء لموقعه نفسه. فـ $' + degTex(p.th) + '$ و $' + degTex(p.th + 360) + '$ لهما ضلع الانتهاء نفسه.' },
      { q: 'في أي ربع تقع الزاوية؟', k: ['ربع', 'تقع'], a: (p, d) => d.q ? 'الزاوية $' + degTex(p.th) + '$ تكافئ $' + degTex(d.n) + '$، فتقع في الربع ' + QN[d.q] + '.' : 'الزاوية ربعية: ضلع انتهائها على أحد المحورين.' }
    ]
  });

  /* ======================= 4-2 قياس الزوايا ======================= */
  ML.register({
    id: 'radian', unit: U, order: 2, lesson: '4-2', lessonTitle: 'قياس الزوايا', page: 106,
    titleAr: 'قياس الزوايا: الستيني والدائري (الراديان)', titleEn: 'Angle Measures: Degrees & Radians', tags: 'راديان ستيني دائري تحويل دقيقه ثانيه',
    formula: '\\theta_{rad} = \\theta^{\\circ} \\times \\frac{\\pi}{180^{\\circ}},\\qquad \\theta_{rad} = \\frac{\\text{arc length}}{r}',
    book: 'الدورة الكاملة 360° يقابلها 2π د ، π د يقابلها 180° ، 1د ≈ 57.3°',
    summary: 'الراديان هو زاوية مركزية يقابلها قوس طوله يساوي طول نصف القطر. لذلك قياس الزاوية بالراديان = عدد أنصاف الأقطار التي تغطي القوس، والدورة الكاملة $2\\pi$ راديان.',
    vars: [['\\theta', 'قياس الزاوية بالدرجات', '$[0^\\circ, 720^\\circ]$ هنا'], ['r', 'نصف قطر الدائرة', '$r > 0$'], ['s', 'طول القوس المقابل', '$s = \\theta_{rad} \\cdot r$']],
    params: [{ key: 'th', label: '\\theta', min: 0, max: 720, step: 0.1, value: 135, rstep: 15 }, { key: 'r', label: 'r', min: 0.5, max: 4, step: 0.1, value: 2.5 }],
    play: { key: 'th', speed: 45 },
    plot: { view: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 } },
    compute(p) {
      const rad = M.deg2rad(p.th);
      return { rad: rad, s: rad * p.r, dms: M.toDMS(p.th), radians: Math.floor(rad + 1e-9) };
    },
    draw(P, p, d) {
      const c = P.colors(); const r = p.r;
      P.circle(0, 0, r, { color: c.muted, width: 1.5 });
      P.segment(0, 0, r, 0, { color: c.c3, width: 3 });
      const t = d.rad;
      P.parametric((s) => r * Math.cos(s), (s) => r * Math.sin(s), 0, t, { color: c.c1, width: 5 }, 300);
      // علامات كل 1 راديان (طول قوس = r)
      for (let k = 1; k <= Math.floor(t + 1e-9); k++) {
        P.segment(0.85 * r * Math.cos(k), 0.85 * r * Math.sin(k), 1.15 * r * Math.cos(k), 1.15 * r * Math.sin(k), { color: c.c2, width: 2.5 });
        P.text(1.3 * r * Math.cos(k - 0.5), 1.3 * r * Math.sin(k - 0.5), k + 'r', { color: c.c2, align: 'center', size: 11 });
      }
      P.segment(0, 0, r * Math.cos(t), r * Math.sin(t), { color: c.c5, width: 3 });
      P.angleArc(0, 0, 26, 0, t, { color: c.c4, width: 2 });
      P.point(r * Math.cos(t), r * Math.sin(t), { color: c.c5, r: 5 });
      P.text(0, -r - 0.6, 'كل علامة حمراء = قوس طوله r (راديان واحد)', { align: 'center', rtl: true, color: c.c2 });
    },
    live(p, d) { return degTex(M.round(p.th, 2)) + ' = ' + M.fmt(p.th, 2) + ' \\times \\frac{\\pi}{180} = ' + M.radTeX(M.round(p.th, 6)) + ' \\approx ' + M.fmt(d.rad, 4) + '\\ \\text{rad}'; },
    results(p, d) {
      return [
        ['بالقياس الدائري', M.radTeX(M.round(p.th, 6)) + ' \\approx ' + M.tex(d.rad) + '\\ \\text{rad}'],
        ['بالدرجات والدقائق والثواني', d.dms.d + '^{\\circ}\\ ' + d.dms.m + "'\\ " + M.fmt(d.dms.s, 2) + "''"],
        ['طول القوس', 's = \\theta_{rad} \\times r = ' + M.tex(d.rad) + ' \\times ' + M.fmt(p.r) + ' = ' + M.tex(d.s)],
        ['عدد أنصاف الأقطار على القوس', M.tex(d.rad)],
        ['1 راديان', '= \\frac{180^{\\circ}}{\\pi} \\approx 57.3^{\\circ}']
      ];
    },
    steps(p, d) {
      return ['$\\pi$ راديان يقابلها $180^\\circ$.', '$\\theta_{rad} = ' + M.fmt(p.th, 2) + '^\\circ \\times \\frac{\\pi}{180^\\circ} = ' + M.radTeX(M.round(p.th, 6)) + '$', 'الجزء العشري من الدرجة × 60 = دقائق: $' + M.fmt(p.th - Math.floor(p.th), 4) + ' \\times 60 = ' + M.fmt((p.th - Math.floor(p.th)) * 60, 4) + "'$"];
    },
    explain(a, b, da, db) { if (da && da.radians !== db.radians) return ['أصبح القوس يغطي ' + db.radians + ' نصف قطر كامل؛ كل نصف قطر على القوس = راديان واحد. القياس الآن $' + M.tex(db.rad) + '$ rad.']; if (a.r !== b.r) return ['تغيّر نصف القطر لكن قياس الزاوية بالراديان **لم يتغيّر** ($' + M.tex(db.rad) + '$): القوس ونصف القطر يكبران بالنسبة نفسها، والراديان نسبة بينهما.']; return []; },
    learn: [
      '**القياس الستيني (ص 107):** الدورة $360^\\circ$، والدرجة 60 دقيقة، والدقيقة 60 ثانية. مثال: $32.6^\\circ = 32^\\circ 36\'$.',
      '**الزاوية النصف قطرية (ص 107):** زاوية مركزية يقابلها قوس طوله يساوي طول نصف قطر الدائرة، ويُرمز لها $1^R$ (راديان) — وحدة القياس الدائري.',
      '**ص 108:** محيط الدائرة $2\\pi r$، فالدورة الكاملة $360^\\circ$ يقابلها $2\\pi$ راديان، و $\\pi$ يقابلها $180^\\circ$. باستخدام $\\pi \\approx 3.14$: $1^R \\approx 57.3^\\circ$.',
      '**التحويل:** من درجات إلى دائري نضرب في $\\frac{\\pi}{180}$؛ ومن دائري إلى درجات نضرب في $\\frac{180}{\\pi}$. مثال: $\\frac{5\\pi}{6} = 150^\\circ$.',
      '**السرعة الزاوية (ص 106):** $\\omega = \\frac{v}{r}$. مثال الكتاب: $r = 0.005$ كم، $v = 30$ كم/ساعة $= 0.5$ كم/دقيقة، فـ $\\omega = 100$ راديان/دقيقة.'
    ],
    challenges: [
      { q: 'اضبط الزاوية لتساوي $\\frac{3\\pi}{4}$ راديان.', hint: '$\\frac{3}{4} \\times 180^\\circ$.', init: { th: 0 }, check: (p) => M.near(p.th, 135, 1e-6) },
      { q: 'اضبط الزاوية لتساوي $-\\frac{15\\pi}{18}$… بل مكافئها الموجب الأصغر.', hint: '$-\\frac{15\\pi}{18} = -150^\\circ$، ومكافئها $210^\\circ$.', init: { th: 0 }, check: (p) => M.near(p.th, 210, 1e-6) },
      { q: 'اجعل الزاوية $32.6^\\circ$ ولاحظ تحويلها إلى $32^\\circ 36\'$ (ص 107).', hint: 'اكتب 32.6 في خانة الإدخال.', init: { th: 0 }, check: (p) => M.near(p.th, 32.6, 1e-6) }
    ],
    tutor: [
      { q: 'لماذا لا يتغير الراديان عند تغيير نصف القطر؟', k: ['نصف القطر', 'لا يتغير', 'r'], a: (p, d) => 'لأن الراديان نسبة: $\\frac{\\text{طول القوس}}{r} = \\frac{' + M.fmt(d.s) + '}{' + M.fmt(p.r) + '} = ' + M.tex(d.rad) + '$. تكبير $r$ يكبّر القوس بالنسبة نفسها.' },
      { q: 'كيف أحول من درجات إلى راديان؟', k: ['احول', 'تحويل', 'درجات', 'راديان'], a: (p) => 'أضرب في $\\frac{\\pi}{180}$: $' + M.fmt(p.th) + ' \\times \\frac{\\pi}{180} = ' + M.radTeX(M.round(p.th, 6)) + '$.' }
    ]
  });

  /* ======================= 4-3 الاقترانات المثلثية ودائرة الوحدة ======================= */
  ML.register({
    id: 'unit-circle', unit: U, order: 3, lesson: '4-3', lessonTitle: 'الاقترانات المثلثية', page: 112,
    titleAr: 'دائرة الوحدة والاقترانات المثلثية', titleEn: 'The Unit Circle & Trigonometric Functions', tags: 'دائره الوحده جيب جيب تمام ظل زاويه اسناد sin cos tan',
    formula: '\\sin\\theta = \\frac{y}{r},\\quad \\cos\\theta = \\frac{x}{r},\\quad \\tan\\theta = \\frac{y}{x}\\ (x \\neq 0)',
    book: 'جا هـ = ص ، جتا هـ = س ، ظا هـ = ص ÷ س ، س ≠ 0 (على دائرة الوحدة) ؛ وعامةً جا هـ = ص ÷ ر ، جتا هـ = س ÷ ر',
    summary: 'إذا قطع ضلع انتهاء الزاوية $\\theta$ في الوضع القياسي دائرة الوحدة في النقطة $(x, y)$، فإن $\\cos\\theta = x$ و $\\sin\\theta = y$. على دائرة نصف قطرها $r$: النقطة $(r\\cos\\theta, r\\sin\\theta)$.',
    vars: [['\\theta', 'الزاوية في الوضع القياسي', '$\\mathbb{R}$'], ['r', 'نصف قطر الدائرة (دائرة الوحدة: $r = 1$)', '$r > 0$'], ['(x, y)', 'نقطة تقاطع ضلع الانتهاء مع الدائرة', '$-r \\le x, y \\le r$']],
    params: [{ key: 'th', label: '\\theta', min: -360, max: 720, step: 1, value: 30, desc: 'بالدرجات' }, { key: 'r', label: 'r', min: 0.5, max: 2, step: 0.1, value: 1, desc: 'نصف القطر' }, { key: 'cosw', label: '\\cos', type: 'toggle', value: true, on: 'إظهار موجة جيب التمام', off: 'إخفاء' }],
    play: { key: 'th', speed: 50 },
    plot: { view: (p) => ({ xmin: -2 * p.r - 1.5, xmax: 2 * PI + 0.6, ymin: -p.r - 0.8, ymax: p.r + 0.8 }), ticks: false },
    compute(p) {
      const T = M.trig(p.th); const ex = M.exactTrig(p.th);
      const q = M.quadrant(p.th);
      return { T: T, ex: ex, q: q, ref: M.referenceAngle(p.th), x: p.r * T.cos, y: p.r * T.sin, rad: M.deg2rad(p.th) };
    },
    draw(P, p, d) {
      const c = P.colors(); const r = p.r; const cx = -r - 1.1;
      // محاور الدائرة
      P.segment(cx - r - 0.3, 0, cx + r + 0.3, 0, { color: c.axis, width: 1.2 });
      P.segment(cx, -r - 0.3, cx, r + 0.3, { color: c.axis, width: 1.2 });
      P.circle(cx, 0, r, { color: c.muted, width: 2 });
      const t = d.rad; const px = cx + d.x, py = d.y; const tw = M.deg2rad(M.normDeg(p.th)); // موقع النقطة على الموجة خلال دورة واحدة
      P.angleArc(cx, 0, 18, 0, t, { color: c.c4, width: 2, fill: c.c4 });
      P.segment(cx, 0, px, py, { color: c.axis, width: 2.5 });
      P.segment(cx, 0, px, 0, { color: c.c3, width: 5 });
      P.segment(px, 0, px, py, { color: c.c2, width: 5 });
      P.text(cx + d.x / 2, 0, 'cos', { color: c.c3, dy: d.y >= 0 ? 12 : -12, align: 'center', bold: true });
      P.text(px, py / 2, 'sin', { color: c.c2, dx: d.x >= 0 ? 8 : -8, align: d.x >= 0 ? 'left' : 'right', bold: true });
      P.point(px, py, { color: c.c5, r: 6, label: 'P(' + M.fmt(d.x, 3) + ', ' + M.fmt(d.y, 3) + ')', dx: d.x >= 0 ? 8 : -8, align: d.x >= 0 ? 'left' : 'right', dy: d.y >= 0 ? -12 : 12 });
      // الموجات: المحور الأفقي هو θ بالراديان يبدأ من x = 0
      P.segment(0, 0, 2 * PI, 0, { color: c.axis, width: 1.2 }); P.segment(0, -r - 0.4, 0, r + 0.4, { color: c.axis, width: 1.2 });
      for (let k = 1; k <= 4; k++) { P.segment(k * PI / 2, -0.06, k * PI / 2, 0.06, { color: c.axis, width: 1 }); P.text(k * PI / 2, 0, ['π/2', 'π', '3π/2', '2π', '5π/2', '3π', '7π/2', '4π'][k - 1], { align: 'center', dy: 14, size: 11 }); }
      const lo = 0, hi = Math.abs(p.th) >= 360 ? 2 * PI : tw;
      P.fn((x) => r * Math.sin(x), { color: c.c2, width: 1.5, alpha: 0.35, domain: [0, 2 * PI] });
      P.fn((x) => r * Math.sin(x), { color: c.c2, width: 3, domain: [lo, hi] });
      if (p.cosw) { P.fn((x) => r * Math.cos(x), { color: c.c3, width: 1.5, alpha: 0.35, domain: [0, 2 * PI], dash: [5, 4] }); P.fn((x) => r * Math.cos(x), { color: c.c3, width: 3, dash: [7, 4], domain: [lo, hi] }); }
      P.segment(px, py, tw, py, { color: c.c2, dash: [3, 4], width: 1.2 });
      P.point(tw, py, { color: c.c2, r: 5 });
      if (p.cosw) P.point(tw, d.x, { color: c.c3, r: 5 });
      P.text(2 * PI, r + 0.25, 'y = ' + (r === 1 ? '' : M.fmt(r)) + 'sin θ', { color: c.c2, align: 'right', bold: true });
      if (p.cosw) P.text(2 * PI, -r - 0.3, 'y = ' + (r === 1 ? '' : M.fmt(r)) + 'cos θ', { color: c.c3, align: 'right', bold: true });
    },
    live(p, d) {
      const s = d.ex ? d.ex.sin : M.fmt(d.T.sin), co = d.ex ? d.ex.cos : M.fmt(d.T.cos);
      const tn = !d.T.tanDefined ? '\\text{غير معرّف}' : (d.ex && d.ex.tan ? d.ex.tan : M.fmt(d.T.tan));
      return '\\sin ' + degTex(p.th) + ' = ' + s + ',\\quad \\cos ' + degTex(p.th) + ' = ' + co + ',\\quad \\tan ' + degTex(p.th) + ' = ' + tn;
    },
    results(p, d) {
      return [
        ['النقطة على الدائرة', '(x, y) = (' + M.tex(d.x) + ',\\ ' + M.tex(d.y) + ')'],
        ['\\sin\\theta = \\frac{y}{r}', '\\frac{' + M.fmt(d.y, 4) + '}{' + M.fmt(p.r) + '} = ' + (d.ex ? d.ex.sin + ' \\approx ' : '') + M.tex(d.T.sin)],
        ['\\cos\\theta = \\frac{x}{r}', '\\frac{' + M.fmt(d.x, 4) + '}{' + M.fmt(p.r) + '} = ' + (d.ex ? d.ex.cos + ' \\approx ' : '') + M.tex(d.T.cos)],
        ['\\tan\\theta = \\frac{y}{x}', d.T.tanDefined ? (d.ex && d.ex.tan ? d.ex.tan + ' \\approx ' : '') + M.tex(d.T.tan) : '\\text{غير معرّف } (x = 0 \\Rightarrow \\text{قسمة على صفر})', true, d.T.tanDefined ? '' : 'neg'],
        ['الربع / زاوية الإسناد', d.q ? '\\text{الربع ' + QN[d.q] + '},\\ \\theta\' = ' + degTex(d.ref) : '\\text{زاوية ربعية}'],
        ['التحقق', '\\sin^2\\theta + \\cos^2\\theta = ' + M.tex(d.T.sin * d.T.sin + d.T.cos * d.T.cos)]
      ];
    },
    steps(p, d) {
      const s = ['$x = r\\cos\\theta = ' + M.fmt(p.r) + ' \\times ' + M.fmt(d.T.cos, 4) + ' = ' + M.fmt(d.x, 4) + '$ ، $y = r\\sin\\theta = ' + M.fmt(d.y, 4) + '$'];
      if (d.q) s.push('زاوية الإسناد: $\\theta\' = ' + degTex(d.ref) + '$؛ قيم الاقترانات لها هي القيم نفسها، والإشارة يحددها الربع ' + QN[d.q] + ': $\\sin$ ' + (d.T.sin > 0 ? 'موجب' : 'سالب') + '، $\\cos$ ' + (d.T.cos > 0 ? 'موجب' : 'سالب') + '.');
      if (!d.T.tanDefined) s.push('$x = 0$ ← $\\tan\\theta = \\frac{y}{0}$ غير معرّف.');
      return s;
    },
    explain(a, b, da, db) {
      const o = [];
      if (da && da.q !== db.q && db.q) o.push('دخلت الزاوية الربع ' + QN[db.q] + ': ' + (db.T.sin > 0 ? '$y > 0$ فالجيب موجب' : '$y < 0$ فالجيب سالب') + '، و' + (db.T.cos > 0 ? '$x > 0$ فجيب التمام موجب' : '$x < 0$ فجيب التمام سالب') + '.');
      if (da && da.T.tanDefined && !db.T.tanDefined) o.push('عند $' + degTex(b.th) + '$ تقع النقطة على محور الصادات ($x = 0$)، فالظل $\\frac{y}{x}$ قسمة على صفر: **غير معرّف**.');
      if (a.r !== b.r) o.push('غيّرت نصف القطر: طولا الضلعين تغيّرا، لكن النسب $\\frac{y}{r}$ و $\\frac{x}{r}$ ثابتة؛ فقيم $\\sin, \\cos$ لا تعتمد على $r$.');
      if (a.th !== b.th && !o.length) o.push('عندما تتحرك النقطة على الدائرة يرسم ارتفاعها $y$ منحنى الجيب، وبُعدها الأفقي $x$ منحنى جيب التمام — لهذا هما اقترانان دوريان دورتهما $2\\pi$.');
      return o;
    },
    learn: [
      '**دائرة الوحدة (ص 113):** مركزها نقطة الأصل ونصف قطرها وحدة واحدة، ومعادلتها $x^2 + y^2 = 1$.',
      '**أتعلّم (ص 113):** إذا قطع ضلع انتهاء $\\theta$ دائرة الوحدة في $B(x, y)$ فإن $\\sin\\theta = y$، $\\cos\\theta = x$، $\\tan\\theta = \\frac{y}{x}$، $x \\neq 0$. وبشكل عام $B = (\\cos\\theta, \\sin\\theta)$، ولذلك $-1 \\le \\sin\\theta \\le 1$ و $-1 \\le \\cos\\theta \\le 1$.',
      '**ص 115:** للنقطة $(x, y)$ على ضلع الانتهاء على بعد $r = \\sqrt{x^2 + y^2}$: $\\sin\\theta = \\frac{y}{r}$، $\\cos\\theta = \\frac{x}{r}$.',
      '**زاوية الإسناد (ص 116):** الزاوية الحادة بين ضلع الانتهاء ومحور السينات. قيم الاقترانات لها هي ذاتها قيم الزاوية الأصلية، والإشارة يحددها الربع.',
      '**الزوايا الخاصة (ص 117):** $\\sin 30^\\circ = \\frac{1}{2}$، $\\cos 30^\\circ = \\frac{\\sqrt3}{2}$، $\\tan 45^\\circ = 1$، $\\tan 60^\\circ = \\sqrt3$. مثال: $\\sin 120^\\circ = \\sin 60^\\circ = \\frac{\\sqrt3}{2}$.'
    ],
    challenges: [
      { q: 'أوجد زاوية في الربع الثاني جيبها $\\frac{1}{2}$.', hint: 'زاوية الإسناد $30^\\circ$ ← $180^\\circ - 30^\\circ$.', init: { th: 0 }, check: (p) => M.normDeg(p.th) === 150 },
      { q: 'اجعل الظل غير معرّف بزاوية سالبة.', hint: 'نحتاج $\\cos\\theta = 0$.', init: { th: 10 }, check: (p, d) => p.th < 0 && !d.T.tanDefined },
      { q: 'أوجد زاوية جيب تمامها $-\\frac{\\sqrt{2}}{2}$ وجيبها سالب.', hint: 'الربع الثالث، زاوية الإسناد $45^\\circ$.', init: { th: 0 }, check: (p) => M.normDeg(p.th) === 225 }
    ],
    tutor: [
      { q: 'لماذا يكون الظل غير معرّف عند 90°؟', k: ['ظل', 'غير معرف', '90', 'tan'], a: (p, d) => 'لأن $\\tan\\theta = \\frac{y}{x}$، وعند $90^\\circ$ و $270^\\circ$ تكون النقطة على محور الصادات فـ $x = 0$ والقسمة على صفر غير معرّفة. الآن $x = ' + M.tex(d.x) + '$ ' + (d.T.tanDefined ? 'فالظل $= ' + M.tex(d.T.tan) + '$.' : 'فالظل غير معرّف.') },
      { q: 'لماذا لا يتجاوز الجيب 1؟', k: ['يتجاوز', 'اكبر من 1', 'مدي'], a: () => 'لأن $\\sin\\theta = \\frac{y}{r}$ و $|y| \\le r$ دائماً على الدائرة؛ فالنسبة بين $-1$ و $1$.' },
      { q: 'ما علاقة الدائرة بموجة الجيب؟', k: ['موجه', 'الدائره', 'علاقه', 'منحني'], a: () => 'ارتفاع النقطة المتحركة على الدائرة ($y = \\sin\\theta$ لدائرة الوحدة) يُرسم مقابل الزاوية $\\theta$ على المحور الأفقي، فتنتج موجة الجيب. اضغط «تشغيل» لترى ذلك يحدث لحظياً.' },
      { q: 'ما إشارة الاقترانات في هذا الربع؟', k: ['اشاره', 'ربع'], a: (p, d) => d.q ? 'في الربع ' + QN[d.q] + ': $\\sin$ ' + (d.T.sin > 0 ? 'موجب' : 'سالب') + '، $\\cos$ ' + (d.T.cos > 0 ? 'موجب' : 'سالب') + '، $\\tan$ ' + (d.T.tan > 0 ? 'موجب' : 'سالب') + '.' : 'الزاوية ربعية؛ أحد الإحداثيين صفر.' }
    ]
  });

  /* ======================= 4-4 تمثيل الاقترانات المثلثية بيانياً ======================= */
  ML.register({
    id: 'trig-graphs', unit: U, order: 4, lesson: '4-4', lessonTitle: 'تمثيل الاقترانات المثلثية بيانياً', page: 122,
    titleAr: 'تمثيل الاقترانات المثلثية بيانياً', titleEn: 'Graphing Trigonometric Functions', tags: 'دوره سعه مدى جيب جيب تمام ظل خطوط تقارب',
    formula: 'f(x) = a\\,\\mathrm{trig}(bx + c) + d,\\quad \\text{period} = \\frac{2\\pi}{|b|},\\ \\text{amplitude} = |a|',
    book: 'ق(س) = أ جا(ب س) + جـ : الدورة = 2π ÷ |ب| ، السعة = |أ| ، المدى = [−|أ| + جـ ، |أ| + جـ]',
    summary: 'المعامل $a$ يمدّ المنحنى رأسياً (السعة $|a|$)، و $b$ يضغطه أفقياً (الدورة $\\frac{2\\pi}{|b|}$)، و $c$ يزيحه أفقياً، و $d$ يزيحه رأسياً. لاقتران الظل دورة $\\frac{\\pi}{|b|}$ وخطوط تقارب حيث $\\cos(bx + c) = 0$.',
    vars: [['a', 'يحدد السعة $|a|$ (والانعكاس إذا $a < 0$)', '$a \\neq 0$'], ['b', 'يحدد الدورة', '$b \\neq 0$'], ['c', 'إزاحة الطور (أفقية بمقدار $-\\frac{c}{b}$)', '$\\mathbb{R}$'], ['d', 'انسحاب رأسي (جـ في الكتاب)', '$\\mathbb{R}$']],
    params: [
      { key: 'fn', label: '\\mathrm{trig}', type: 'select', value: 'sin', options: [['sin', 'جا (sin)'], ['cos', 'جتا (cos)'], ['tan', 'ظا (tan)']] },
      { key: 'a', label: 'a', min: -4, max: 4, step: 0.5, value: 2, exclude: [0] },
      { key: 'b', label: 'b', min: -4, max: 4, step: 0.25, value: 1, exclude: [0] },
      { key: 'c', label: 'c', min: -6.28, max: 6.28, step: 0.01, value: 0, rstep: 0.785 },
      { key: 'd', label: 'd', min: -4, max: 4, step: 0.5, value: 0 }
    ],
    plot: { view: { xmin: -2 * PI, xmax: 2 * PI, ymin: -5, ymax: 5 }, equal: false, xPi: true },
    compute(p) {
      const base = { sin: Math.sin, cos: Math.cos, tan: Math.tan }[p.fn];
      const f = (x) => {
        const u = p.b * x + p.c;
        if (p.fn === 'tan' && Math.abs(Math.cos(u)) < 1e-12) return NaN;
        return p.a * base(u) + p.d;
      };
      const isTan = p.fn === 'tan';
      const period = (isTan ? PI : 2 * PI) / Math.abs(p.b);
      return { f: f, base: base, period: period, isTan: isTan, amp: Math.abs(p.a), max: p.d + Math.abs(p.a), min: p.d - Math.abs(p.a), shift: -p.c / p.b };
    },
    asym(p, v) {
      // b x + c = π/2 + kπ
      const out = []; const lo = Math.min(p.b * v.xmin + p.c, p.b * v.xmax + p.c), hi = Math.max(p.b * v.xmin + p.c, p.b * v.xmax + p.c);
      for (let k = Math.ceil((lo - PI / 2) / PI); k <= Math.floor((hi - PI / 2) / PI); k++) out.push((PI / 2 + k * PI - p.c) / p.b);
      return out;
    },
    draw(P, p, d) {
      const c = P.colors();
      P.fn(d.base, { color: c.muted, width: 1.8, dash: [6, 5], asymptotes: d.isTan ? this.asym({ b: 1, c: 0 }, P.view) : [] });
      if (d.isTan) { const as = this.asym(p, P.view); as.forEach((x) => P.vline(x, { color: c.c2, dash: [6, 5], width: 1.4 })); P.fn(d.f, { color: c.c1, width: 3, asymptotes: as }); }
      else {
        P.hline(d.max, { color: c.c3, dash: [4, 5], width: 1.2 }); P.hline(d.min, { color: c.c3, dash: [4, 5], width: 1.2 }); P.hline(p.d, { color: c.c5, dash: [2, 5], width: 1.2 });
        P.fn(d.f, { color: c.c1, width: 3 });
        // قوس الدورة
        const x0 = d.shift; const y = d.max + 0.5;
        P.arrow(x0 + d.period / 2, y, x0, y, { color: c.c4, width: 2 }); P.arrow(x0 + d.period / 2, y, x0 + d.period, y, { color: c.c4, width: 2 });
        P.text(x0 + d.period / 2, y, 'دورة = ' + M.fmt(d.period, 3), { color: c.c4, align: 'center', dy: -12, rtl: true, bold: true });
        P.arrow(x0, p.d, x0, d.max, { color: c.c6, width: 2 });
        P.text(x0, (p.d + d.max) / 2, 'السعة ' + M.fmt(d.amp), { color: c.c6, dx: 8, rtl: true });
      }
    },
    live(p) {
      const fnm = { sin: '\\sin', cos: '\\cos', tan: '\\tan' }[p.fn];
      const inner = M.polyTeX([p.b, p.c]);
      return 'f(x) = ' + F.coef(p.a) + fnm + '\\left(' + inner + '\\right)' + F.plus(p.d);
    },
    results(p, d) {
      const per = d.isTan ? '\\frac{\\pi}{|b|}' : '\\frac{2\\pi}{|b|}';
      const r = [['الدورة', per + ' = ' + M.tex(d.period) + (M.isInt(d.period / PI * 4) ? ' = ' + M.radTeX(M.rad2deg(d.period)) : '')]];
      if (d.isTan) {
        r.push(['السعة', '\\text{لا يوجد (المدى غير محدود)}'], ['المدى', '\\mathbb{R}'], ['خطوط التقارب', 'bx + c = \\frac{\\pi}{2} + k\\pi \\Rightarrow x = \\frac{\\pi/2 + k\\pi - (' + M.fmt(p.c) + ')}{' + M.fmt(p.b) + '}'], ['المجال', '\\mathbb{R} \\text{ ما عدا خطوط التقارب (}\\cos(bx + c) = 0\\text{)}']);
      } else {
        r.push(['السعة', '|a| = ' + M.fmt(d.amp)], ['أكبر قيمة', M.tex(d.max)], ['أصغر قيمة', M.tex(d.min)], ['المدى', '[' + M.tex(d.min) + ',\\ ' + M.tex(d.max) + ']'], ['المجال', '\\mathbb{R}']);
      }
      r.push(['الإزاحة الأفقية', '-\\frac{c}{b} = ' + M.tex(d.shift)]);
      return r;
    },
    steps(p, d) {
      const s = ['الدورة $= \\frac{' + (d.isTan ? '\\pi' : '2\\pi') + '}{|' + M.fmt(p.b) + '|} = ' + M.tex(d.period) + '$'];
      if (!d.isTan) s.push('السعة $= |' + M.fmt(p.a) + '| = ' + M.fmt(d.amp) + '$', 'المدى $= [-|a| + d,\\ |a| + d] = [' + M.tex(d.min) + ',\\ ' + M.tex(d.max) + ']$');
      if (p.a < 0) s.push('$a < 0$ ← انعكاس في محور السينات.');
      return s;
    },
    explain(a, b, da, db) {
      const o = [];
      if (a.fn !== b.fn) o.push(b.fn === 'tan' ? 'اقتران الظل $\\tan = \\frac{\\sin}{\\cos}$ غير معرّف حيث $\\cos = 0$، فتظهر خطوط تقارب رأسية ودورته $\\pi$ فقط.' : 'تغيّر الاقتران إلى ' + (b.fn === 'sin' ? 'الجيب' : 'جيب التمام') + '؛ منحنى جيب التمام هو منحنى الجيب مُزاحاً $\\frac{\\pi}{2}$ لليسار.');
      if (a.a !== b.a && b.fn !== 'tan') o.push('تغيّرت السعة إلى $|a| = ' + M.fmt(Math.abs(b.a)) + '$: المنحنى يمتد رأسياً بين $' + M.tex(db.min) + '$ و $' + M.tex(db.max) + '$' + (Math.sign(a.a) !== Math.sign(b.a) ? '، وانقلب لأن إشارة $a$ تغيّرت.' : '.'));
      if (a.b !== b.b) o.push('تغيّر $b$ إلى $' + M.fmt(b.b) + '$ فصارت الدورة $' + M.tex(db.period) + '$: كلما زادت $|b|$ تكرر المنحنى أسرع (انضغط أفقياً).');
      if (a.c !== b.c) o.push('تغيّر $c$ فانزاح المنحنى أفقياً بمقدار $-\\frac{c}{b} = ' + M.tex(db.shift) + '$.');
      if (a.d !== b.d) o.push('تغيّر $d$ فانسحب المنحنى رأسياً وصار محور الاتزان $y = ' + M.fmt(b.d) + '$.');
      return o;
    },
    learn: [
      '**نشاط 2 ص 123:** $\\sin x$ دوري دورته $2\\pi$، مجاله $\\mathbb{R}$ ومداه $[-1, 1]$. **السعة** $= \\frac{\\text{أكبر قيمة} - \\text{أصغر قيمة}}{2} = 1$.',
      '**نشاط 3 ص 124:** $\\cos x$ دوري دورته $2\\pi$ ومداه $[-1, 1]$ وسعته 1.',
      '**نشاط 4 ص 125:** مجال $\\tan x$ هو $\\mathbb{R}$ ما عدا $\\frac{\\pi}{2} + k\\pi$، ومداه $\\mathbb{R}$، ودورته $\\pi$.',
      '**أستنتج (ص 129):** للاقتران $f(x) = a\\sin(bx) + c$ أو $a\\cos(bx) + c$: الدورة $\\frac{2\\pi}{|b|}$، السعة $|a|$، المدى $[-|a| + c,\\ |a| + c]$.',
      '**مثال الكتاب:** $f(x) = 2\\cos\\frac{x}{2} - 3$: الدورة $4\\pi$، السعة 2، المدى $[-5, -1]$.'
    ],
    challenges: [
      { q: 'مثّل $f(x) = 2\\cos\\frac{x}{2} - 3$ (نشاط 8 ص 129) — دورة $4\\pi$ ومدى $[-5, -1]$.', hint: '$a = 2$، $b = 0.5$، $c = 0$، $d = -3$.', init: { fn: 'sin', a: 1, b: 1, c: 0, d: 0 }, check: (p) => p.fn === 'cos' && p.a === 2 && p.b === 0.5 && p.c === 0 && p.d === -3 },
      { q: 'اجعل دورة اقتران الجيب $\\pi$ وسعته 3.', hint: '$|b| = 2$ و $|a| = 3$.', init: { fn: 'sin', a: 1, b: 1, c: 0, d: 0 }, check: (p, d) => p.fn === 'sin' && M.near(d.period, PI) && d.amp === 3 },
      { q: 'أثبت بيانياً أن $\\sin(x + \\frac{\\pi}{2}) = \\cos x$ (سؤال 4 ص 130): مثّل $\\sin(x + \\frac{\\pi}{2})$.', hint: '$c \\approx 1.57$.', init: { fn: 'sin', a: 1, b: 1, c: 0, d: 0 }, check: (p) => p.fn === 'sin' && p.a === 1 && p.b === 1 && M.near(p.c, PI / 2, 0.006) && p.d === 0 },
      { q: 'مثّل $\\tan x + 1$ (سؤال 1 ص 130).', hint: 'الظل مع $d = 1$.', init: { fn: 'sin', a: 2, b: 1, c: 0, d: 0 }, check: (p) => p.fn === 'tan' && p.a === 1 && p.b === 1 && p.c === 0 && p.d === 1 }
    ],
    tutor: [
      { q: 'لماذا تظهر خطوط تقارب في منحنى الظل؟', k: ['تقارب', 'الظل', 'tan', 'رأسي'], a: () => 'لأن $\\tan u = \\frac{\\sin u}{\\cos u}$، وعندما $\\cos u = 0$ (أي $u = \\frac{\\pi}{2} + k\\pi$) تكون القسمة على صفر؛ قرب هذه القيم يصبح المقام صغيراً جداً فيكبر الظل بلا حدود.' },
      { q: 'كيف أحسب الدورة؟', k: ['دوره', 'احسب'], a: (p, d) => 'الدورة $= \\frac{' + (d.isTan ? '\\pi' : '2\\pi') + '}{|b|} = \\frac{' + (d.isTan ? '\\pi' : '2\\pi') + '}{' + M.fmt(Math.abs(p.b)) + '} \\approx ' + M.fmt(d.period, 4) + '$.' },
      { q: 'ما معنى السعة؟', k: ['سعه', 'amplitude'], a: (p, d) => d.isTan ? 'اقتران الظل ليس له سعة لأن مداه غير محدود.' : 'السعة نصف المسافة بين أكبر قيمة وأصغر قيمة: $\\frac{' + M.fmt(d.max) + ' - (' + M.fmt(d.min) + ')}{2} = ' + M.fmt(d.amp) + '$.' }
    ]
  });

  /* ======================= 4-5 المتطابقات المثلثية ======================= */
  const IDS = {
    pyth: { name: 'جا²هـ + جتا²هـ = 1', L: '\\sin^2\\theta + \\cos^2\\theta', R: '1', l: (t) => Math.sin(t) ** 2 + Math.cos(t) ** 2, r: () => 1, page: 132, cond: 'لكل $\\theta$' },
    sec: { name: '1 + ظا²هـ = قا²هـ', L: '1 + \\tan^2\\theta', R: '\\sec^2\\theta', l: (t) => (Math.abs(Math.cos(t)) < 1e-12 ? NaN : 1 + Math.tan(t) ** 2), r: (t) => (Math.abs(Math.cos(t)) < 1e-12 ? NaN : 1 / Math.cos(t) ** 2), page: 133, cond: '$\\cos\\theta \\neq 0$', bad: (t) => Math.abs(Math.cos(t)) < 1e-12 },
    csc: { name: '1 + ظتا²هـ = قتا²هـ', L: '1 + \\cot^2\\theta', R: '\\csc^2\\theta', l: (t) => (Math.abs(Math.sin(t)) < 1e-12 ? NaN : 1 + (Math.cos(t) / Math.sin(t)) ** 2), r: (t) => (Math.abs(Math.sin(t)) < 1e-12 ? NaN : 1 / Math.sin(t) ** 2), page: 133, cond: '$\\sin\\theta \\neq 0$', bad: (t) => Math.abs(Math.sin(t)) < 1e-12 },
    sin2: { name: 'جا2هـ = 2 جاهـ جتاهـ', L: '\\sin 2\\theta', R: '2\\sin\\theta\\cos\\theta', l: (t) => Math.sin(2 * t), r: (t) => 2 * Math.sin(t) * Math.cos(t), page: 118, cond: 'لكل $\\theta$' },
    cos2: { name: 'جتا2هـ = جتا²هـ − جا²هـ', L: '\\cos 2\\theta', R: '\\cos^2\\theta - \\sin^2\\theta', l: (t) => Math.cos(2 * t), r: (t) => Math.cos(t) ** 2 - Math.sin(t) ** 2, page: 119, cond: 'لكل $\\theta$ (وأيضاً $= 1 - 2\\sin^2\\theta = 2\\cos^2\\theta - 1$)' },
    frac: { name: 'جا²س ÷ (1 − جتاس) = 1 + جتاس', L: '\\frac{\\sin^2\\theta}{1 - \\cos\\theta}', R: '1 + \\cos\\theta', l: (t) => (Math.abs(1 - Math.cos(t)) < 1e-12 ? NaN : Math.sin(t) ** 2 / (1 - Math.cos(t))), r: (t) => 1 + Math.cos(t), page: 133, cond: '$\\cos\\theta \\neq 1$', bad: (t) => Math.abs(1 - Math.cos(t)) < 1e-12 }
  };
  ML.register({
    id: 'identities', unit: U, order: 5, lesson: '4-5', lessonTitle: 'المتطابقات والمعادلات المثلثية', page: 131,
    titleAr: 'المتطابقات المثلثية', titleEn: 'Trigonometric Identities', tags: 'متطابقه فيثاغورس ضعف الزاويه',
    formula: '\\sin^2\\theta + \\cos^2\\theta = 1',
    book: 'جا²هـ + جتا²هـ = 1 ؛ ظا²هـ + 1 = قا²هـ ؛ ظتا²هـ + 1 = قتا²هـ ؛ جا2أ = 2 جاأ جتاأ ؛ جتا2أ = جتا²أ − جا²أ',
    summary: 'المتطابقة المثلثية معادلة تحتوي اقتراناً مثلثياً وتكون صائبة لجميع قيم المتغير التي يكون فيها طرفاها معرّفين. نتحقق منها هنا بيانياً: منحنى الطرف الأيمن ينطبق تماماً على منحنى الطرف الأيسر.',
    vars: [['\\theta', 'الزاوية', 'حسب شرط المتطابقة'], ['\\text{identity}', 'المتطابقة المختارة من الكتاب', '—']],
    params: [
      { key: 'id', label: '\\text{identity}', type: 'select', value: 'pyth', options: Object.keys(IDS).map((k) => [k, IDS[k].name]) },
      { key: 'th', label: '\\theta', min: 0, max: 360, step: 1, value: 40, desc: 'بالدرجات' }
    ],
    play: { key: 'th', speed: 40 },
    plot: { view: { xmin: -0.3, xmax: 2 * PI + 0.3, ymin: -3, ymax: 5 }, equal: false, xPi: true },
    compute(p) {
      const I = IDS[p.id]; const t = M.deg2rad(p.th);
      // تصحيح الزوايا الربعية
      const T = M.trig(p.th);
      const undefinedHere = I.bad ? (p.id === 'sec' ? T.cos === 0 : p.id === 'csc' ? T.sin === 0 : T.cos === 1) : false;
      const L = undefinedHere ? NaN : I.l(t), R = undefinedHere ? NaN : I.r(t);
      return { I: I, t: t, L: L, R: R, und: undefinedHere, diff: Math.abs(L - R) };
    },
    draw(P, p, d) {
      const c = P.colors(); const I = d.I;
      const bads = [];
      if (p.id === 'sec') bads.push(PI / 2, 3 * PI / 2); if (p.id === 'csc') bads.push(0, PI, 2 * PI); if (p.id === 'frac') bads.push(0, 2 * PI);
      bads.forEach((x) => P.vline(x, { color: c.c2, dash: [5, 5], width: 1.2 }));
      P.fn(I.l, { color: c.c1, width: 6, alpha: 0.35, asymptotes: bads, domain: [0, 2 * PI] });
      P.fn(I.r, { color: c.c2, width: 2.2, dash: [8, 6], asymptotes: bads, domain: [0, 2 * PI] });
      P.vline(d.t, { color: c.c4, width: 1.5 });
      if (!d.und) { P.point(d.t, d.L, { color: c.c1, r: 6 }); P.point(d.t, d.R, { color: c.c2, r: 3.5, label: 'الطرفان = ' + M.fmt(d.L, 4) }); }
      else P.text(d.t, 4, 'غير معرّف عند هذه الزاوية', { color: c.c2, rtl: true, align: 'center', bold: true });
      P.text(2 * PI, 4.6, 'الطرف الأيسر (عريض) والطرف الأيمن (متقطع) منطبقان', { color: c.text, align: 'right', rtl: true });
    },
    live(p) { const I = IDS[p.id]; return I.L + ' = ' + I.R; },
    results(p, d) {
      return [
        ['الطرف الأيسر', d.I.L + ' = ' + M.tex(d.L)],
        ['الطرف الأيمن', d.I.R + ' = ' + M.tex(d.R)],
        ['الفرق', d.und ? '\\text{غير معرّف}' : '|\\text{L} - \\text{R}| = ' + M.tex(d.diff, 10), true, d.und ? 'neg' : 'pos'],
        ['شرط صحة المتطابقة', d.I.cond, false],
        ['المصدر', 'صفحة ' + d.I.page, false]
      ];
    },
    steps(p) {
      const s = {
        pyth: ['النقطة $(\\cos\\theta, \\sin\\theta)$ تقع على دائرة الوحدة $x^2 + y^2 = 1$.', 'بالتعويض: $\\cos^2\\theta + \\sin^2\\theta = 1$ لأي زاوية.'],
        sec: ['نقسم طرفي $\\sin^2\\theta + \\cos^2\\theta = 1$ على $\\cos^2\\theta$ (بشرط $\\cos\\theta \\neq 0$).', '$\\tan^2\\theta + 1 = \\sec^2\\theta$.'],
        csc: ['نقسم طرفي $\\sin^2\\theta + \\cos^2\\theta = 1$ على $\\sin^2\\theta$ (بشرط $\\sin\\theta \\neq 0$).', '$1 + \\cot^2\\theta = \\csc^2\\theta$.'],
        sin2: ['من نشاط 13 ص 118: $2\\sin 30^\\circ \\cos 30^\\circ = 2 \\cdot \\frac12 \\cdot \\frac{\\sqrt3}{2} = \\frac{\\sqrt3}{2} = \\sin 60^\\circ$.', 'نستنتج $\\sin 2\\theta = 2\\sin\\theta\\cos\\theta$.'],
        cos2: ['من نشاط 15 ص 119: $\\cos^2 30^\\circ - \\sin^2 30^\\circ = \\frac34 - \\frac14 = \\frac12 = \\cos 60^\\circ$.', 'وبالتعويض $\\cos^2\\theta = 1 - \\sin^2\\theta$: $\\cos 2\\theta = 1 - 2\\sin^2\\theta$.'],
        frac: ['نضرب البسط والمقام في $(1 + \\cos\\theta)$.', '$\\frac{\\sin^2\\theta(1 + \\cos\\theta)}{1 - \\cos^2\\theta} = \\frac{\\sin^2\\theta(1 + \\cos\\theta)}{\\sin^2\\theta} = 1 + \\cos\\theta$ (بشرط $\\cos\\theta \\neq 1$).']
      };
      return s[p.id];
    },
    learn: [
      '**ص 132:** النقطة $B(\\cos\\theta, \\sin\\theta)$ على دائرة الوحدة تحقق معادلتها، فينتج $\\sin^2\\theta + \\cos^2\\theta = 1$ لأي زاوية — وتُسمى متطابقة.',
      '**أتعلّم:** المتطابقة المثلثية معادلة بمتغير تحتوي اقتراناً مثلثياً وتكون صائبة لجميع قيم المتغير. ومنها $\\sin^2\\theta = 1 - \\cos^2\\theta$ و $\\cos^2\\theta = 1 - \\sin^2\\theta$.',
      '**نشاط 4 ص 133:** $\\tan^2\\theta + 1 = \\sec^2\\theta$ و $\\cot^2\\theta + 1 = \\csc^2\\theta$.',
      '**ملاحظة ص 134:** لإثبات صحة المتطابقة يمكن البدء بأحد الطرفين والوصول للآخر، أو البدء بالطرفين والوصول إلى مقدارين متساويين.'
    ],
    challenges: [
      { q: 'اختر متطابقة $1 + \\tan^2\\theta = \\sec^2\\theta$ وابحث عن زاوية لا تكون فيها معرّفة.', hint: 'حيث $\\cos\\theta = 0$.', init: { id: 'sec', th: 30 }, check: (p, d) => p.id === 'sec' && d.und },
      { q: 'تحقق من $\\sin 2\\theta = 2\\sin\\theta\\cos\\theta$ عند $\\theta = 30^\\circ$ (نشاط 13).', hint: 'اختر المتطابقة وضع $\\theta = 30$.', init: { id: 'pyth', th: 0 }, check: (p) => p.id === 'sin2' && p.th === 30, why: () => 'الطرفان $= \\frac{\\sqrt3}{2} \\approx 0.866$.' }
    ],
    tutor: [
      { q: 'لماذا تكون المتطابقة غير معرّفة عند بعض الزوايا؟', k: ['غير معرف', 'شرط', 'لماذا'], a: (p) => 'لأن بعض حدودها كسور: ' + IDS[p.id].cond + '. عند تلك الزوايا يصبح المقام صفراً والقسمة على صفر غير معرّفة، لذلك المتطابقة صحيحة لكل الزوايا **ما عداها**.' },
      { q: 'ما الفرق بين المتطابقة والمعادلة المثلثية؟', k: ['الفرق', 'معادله'], a: () => 'المتطابقة صائبة لجميع قيم المتغير (في مجالها)، أما المعادلة المثلثية فجملة مفتوحة صائبة لبعض القيم فقط — مثل $2\\sin x - 1 = 0$ صائبة عند $\\frac{\\pi}{6}$ و $\\frac{5\\pi}{6}$ فقط في $[0, 2\\pi]$.' }
    ]
  });

  /* ======================= 4-5 المعادلات المثلثية ======================= */
  function solveTrig(fn, v) {
    const out = []; const add = (x) => { if (x < -1e-9 || x > 2 * PI + 1e-9) return; x = M.clamp(x, 0, 2 * PI); if (!out.some((y) => Math.abs(y - x) < 1e-9)) out.push(x); };
    if (fn === 'sin') {
      if (Math.abs(v) > 1 + 1e-12) return [];
      const a = Math.asin(M.clamp(v, -1, 1));
      [a, PI - a, a + 2 * PI, 3 * PI - a].forEach(add);
    } else if (fn === 'cos') {
      if (Math.abs(v) > 1 + 1e-12) return [];
      const a = Math.acos(M.clamp(v, -1, 1));
      [a, 2 * PI - a].forEach(add);
    } else {
      const a = Math.atan(v);
      for (let k = -1; k <= 3; k++) add(a + k * PI);
    }
    return out.sort((x, y) => x - y);
  }
  ML.solveTrig = solveTrig;
  ML.register({
    id: 'trig-equations', unit: U, order: 6, lesson: '4-5', lessonTitle: 'المتطابقات والمعادلات المثلثية', page: 134,
    titleAr: 'حل المعادلات المثلثية', titleEn: 'Solving Trigonometric Equations', tags: 'معادله مثلثيه حل جمله مفتوحه',
    formula: 'a\\cdot\\mathrm{trig}(x) + b = 0,\\quad 0 \\le x \\le 2\\pi',
    book: 'مثال(1) ص 134: 2 جاس − 1 = صفر ، صفر ≤ س ≤ 2π ⇐ جاس = ½ ⇐ س ∈ {π/6 ، 5π/6}',
    summary: 'نعزل الاقتران المثلثي: $\\mathrm{trig}(x) = -\\frac{b}{a}$، نجد زاوية الإسناد، ثم نحدد الأرباع التي تعطي الإشارة المطلوبة. بيانياً: الحلول هي نقاط تقاطع المنحنى مع المستقيم الأفقي $y = -\\frac{b}{a}$.',
    vars: [['a', 'معامل الاقتران', '$a \\neq 0$'], ['b', 'الحد الثابت', '$\\mathbb{R}$'], ['x', 'المجهول', '$[0, 2\\pi]$']],
    params: [
      { key: 'fn', label: '\\mathrm{trig}', type: 'select', value: 'sin', options: [['sin', 'جا (sin)'], ['cos', 'جتا (cos)'], ['tan', 'ظا (tan)']] },
      { key: 'a', label: 'a', min: -4, max: 4, step: 0.5, value: 2, exclude: [0] },
      { key: 'b', label: 'b', min: -5, max: 5, step: 0.25, value: -1 }
    ],
    plot: { view: { xmin: -0.4, xmax: 2 * PI + 0.4, ymin: -2.5, ymax: 2.5 }, equal: false, xPi: true },
    compute(p) {
      const v = -p.b / p.a; const sols = solveTrig(p.fn, v);
      const f = { sin: Math.sin, cos: Math.cos, tan: (x) => (Math.abs(Math.cos(x)) < 1e-12 ? NaN : Math.tan(x)) }[p.fn];
      return { v: v, sols: sols, f: f };
    },
    draw(P, p, d) {
      const c = P.colors();
      P.xBand(0, 2 * PI, { color: c.c4, alpha: 0.06 });
      P.fn(d.f, { color: c.c1, width: 3, asymptotes: p.fn === 'tan' ? [PI / 2, 3 * PI / 2] : [] });
      if (p.fn === 'tan') [PI / 2, 3 * PI / 2].forEach((x) => P.vline(x, { color: c.c2, dash: [5, 5], width: 1.2 }));
      P.hline(d.v, { color: c.c5, width: 2, dash: [8, 5] });
      P.text(2 * PI, d.v, 'y = ' + M.fmt(d.v, 4), { color: c.c5, align: 'right', dy: -12 });
      d.sols.forEach((x) => { P.segment(x, 0, x, d.v, { color: c.c3, dash: [3, 3], width: 1.2 }); P.point(x, d.v, { color: c.c3, r: 6, label: radLabel(x), dy: d.v >= 0 ? -14 : 16 }); });
      if (!d.sols.length) P.text(PI, 2.1, 'لا يوجد حل: |' + M.fmt(d.v, 3) + '| > 1', { color: c.c2, align: 'center', bold: true });
    },
    live(p) {
      const fnm = { sin: '\\sin', cos: '\\cos', tan: '\\tan' }[p.fn];
      return F.coef(p.a) + fnm + ' x' + F.plus(p.b) + ' = 0';
    },
    results(p, d) {
      const fnm = { sin: '\\sin', cos: '\\cos', tan: '\\tan' }[p.fn];
      const r = [['بعد العزل', fnm + ' x = -\\frac{b}{a} = ' + M.texFrac(d.v)]];
      if (!d.sols.length) r.push(['مجموعة الحل', '\\varnothing\\ \\text{— لأن } -1 \\le ' + fnm + ' x \\le 1', true, 'neg']);
      else r.push(['مجموعة الحل في [0, 2π]', '\\{' + d.sols.map(radTex).join(',\\ ') + '\\}'], ['بالدرجات', '\\{' + d.sols.map((x) => degTex(M.round(M.rad2deg(x), 4))).join(',\\ ') + '\\}']);
      r.push(['عدد الحلول', String(d.sols.length)]);
      return r;
    },
    steps(p, d) {
      const fnm = { sin: '\\sin', cos: '\\cos', tan: '\\tan' }[p.fn];
      const s = ['$' + F.coef(p.a) + fnm + ' x = ' + M.fmt(-p.b) + ' \\Rightarrow ' + fnm + ' x = ' + M.texFrac(d.v) + '$'];
      if (!d.sols.length) { s.push('القيمة خارج المدى $[-1, 1]$ فلا حل.'); return s; }
      const ref = p.fn === 'sin' ? Math.asin(Math.min(1, Math.abs(d.v))) : p.fn === 'cos' ? Math.acos(Math.min(1, Math.abs(d.v))) : Math.atan(Math.abs(d.v));
      s.push('زاوية الإسناد: $' + radTex(ref) + ' = ' + degTex(M.round(M.rad2deg(ref), 4)) + '$');
      const sg = d.v > 0 ? 'موجبة' : d.v < 0 ? 'سالبة' : 'صفر';
      const quads = { sin: d.v > 0 ? 'الأول والثاني' : 'الثالث والرابع', cos: d.v > 0 ? 'الأول والرابع' : 'الثاني والثالث', tan: d.v > 0 ? 'الأول والثالث' : 'الثاني والرابع' }[p.fn];
      if (d.v !== 0 && Math.abs(Math.abs(d.v) - 1) > 1e-12) s.push('القيمة ' + sg + ' ← الزاوية في الربعين ' + quads + '.');
      s.push('مجموعة الحل: $\\{' + d.sols.map(radTex).join(',\\ ') + '\\}$');
      return s;
    },
    explain(a, b, da, db) {
      if (da && da.sols.length !== db.sols.length) return ['تغيّر عدد الحلول إلى ' + db.sols.length + ': المستقيم $y = ' + M.fmt(db.v, 4) + '$ يقطع المنحنى في ' + db.sols.length + ' نقطة ضمن $[0, 2\\pi]$' + (db.sols.length === 0 ? ' — لأن القيمة خارج مدى الاقتران.' : '.')];
      return [];
    },
    learn: [
      '**ص 134:** الجملة المفتوحة التي تحتوي اقتراناً مثلثياً وتكون صائبة لبعض القيم الحقيقية تُسمى معادلة مثلثية.',
      '**مثال (1) ص 134:** $2\\sin x - 1 = 0$ ← $\\sin x = \\frac12$ ← زاوية الإسناد $30^\\circ$؛ الجيب موجب ← الربع الأول $x = 30^\\circ$ أو الثاني $x = 150^\\circ$. مجموعة الحل $\\{\\frac{\\pi}{6}, \\frac{5\\pi}{6}\\}$.',
      '**نشاط 10 ص 135:** $\\cos^2 x + 2\\cos x - 3 = 0$ ← $(\\cos x + 3)(\\cos x - 1) = 0$؛ نرفض $\\cos x = -3$ لأنها خارج المدى، فـ $\\cos x = 1$ ← $x = 0$ أو $2\\pi$.'
    ],
    challenges: [
      { q: 'حل مثال الكتاب $2\\sin x - 1 = 0$.', hint: '$a = 2, b = -1$.', init: { fn: 'cos', a: 1, b: 0 }, check: (p) => p.fn === 'sin' && p.a === 2 && p.b === -1, why: () => 'الحل $\\{\\frac{\\pi}{6}, \\frac{5\\pi}{6}\\}$.' },
      { q: 'كوّن معادلة جيب تمام حلاها $\\frac{2\\pi}{3}$ و $\\frac{4\\pi}{3}$.', hint: '$\\cos x = -\\frac12$ ← مثلاً $2\\cos x + 1 = 0$.', init: { fn: 'sin', a: 1, b: 0 }, check: (p, d) => p.fn === 'cos' && d.sols.length === 2 && M.near(d.sols[0], 2 * PI / 3, 1e-9) && M.near(d.sols[1], 4 * PI / 3, 1e-9) },
      { q: 'اجعل للمعادلة ثلاثة حلول في $[0, 2\\pi]$.', hint: 'جرّب $\\sin x = 0$: $0, \\pi, 2\\pi$.', init: { fn: 'sin', a: 2, b: -1 }, check: (p, d) => d.sols.length === 3 }
    ],
    tutor: [
      { q: 'لماذا لا يوجد حل أحياناً؟', k: ['لا يوجد حل', 'لماذا', 'مستحيل'], a: (p, d) => p.fn === 'tan' ? 'معادلة الظل لها حل دائماً لأن مدى الظل $\\mathbb{R}$.' : 'لأن مدى $\\sin$ و $\\cos$ هو $[-1, 1]$. الآن $-\\frac{b}{a} = ' + M.fmt(d.v, 4) + '$' + (Math.abs(d.v) > 1 ? ' خارج المدى، فلا توجد زاوية تحقق المعادلة.' : ' داخل المدى، لذا يوجد حل.') },
      { q: 'كيف أعرف في أي ربع يقع الحل؟', k: ['ربع', 'اين'], a: () => 'من إشارة الطرف الأيمن: الجيب موجب في الربعين الأول والثاني، وجيب التمام موجب في الأول والرابع، والظل موجب في الأول والثالث.' }
    ]
  });
  function radTex(x) { return M.radTeX(M.round(M.rad2deg(x), 6)); }
  function radLabel(x) { const d = M.round(M.rad2deg(x), 4); const f = M.toFraction(d / 180, 360); if (!f) return M.fmt(x, 3); if (f.n === 0) return '0'; return (f.n === 1 ? '' : f.n) + 'π' + (f.d === 1 ? '' : '/' + f.d); }
})(typeof window !== 'undefined' ? window : globalThis);
