/* رياضيات التاسع — الوحدة الثالثة: الهندسة والقياس (ص 64–83) */
(function (root) {
  'use strict';
  const ML = root.ML; const M = ML.math; const G = ML.m9;
  const U = 3;
  const pt = (x, y) => '(' + M.fmt(x) + ' ، ' + M.fmt(y) + ')';
  const dist = (a, b, c, d) => Math.hypot(c - a, d - b);
  // جذر بأبسط صورة لعدد صحيح غير سالب
  const rootTeX = (n) => { if (!M.isInt(n)) return M.fmt(Math.sqrt(n), 3); const s = G.simplifyRoot(Math.round(n)); return G.rootTeX(s[0], s[1]); };
  const near = (a, b) => Math.abs(a - b) < 1e-9;
  // كسر بصيغة TeX لـ ن ÷ م بأبسط صورة
  const frac = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = M.gcd(Math.round(n * 2), Math.round(d * 2)) || 1; const N = Math.round(n * 2) / g, D = Math.round(d * 2) / g; return D === 1 ? String(N) : (N < 0 ? '-' : '') + '\\frac{' + Math.abs(N) + '}{' + D + '}'; };
  G.frac = frac;
  const drag = (kx, ky, lim) => (x, y, set) => { set(kx, M.clamp(Math.round(x), -lim, lim)); set(ky, M.clamp(Math.round(y), -lim, lim)); };

  /* ======================= 3-1 المسافة بين نقطتين ======================= */
  function classify(a, b, c) {
    const s = [a, b, c].sort((x, y) => x - y);
    if (near(s[0] + s[1], s[2])) return { k: 'line', t: 'النقاط على استقامة واحدة (لا يتكوّن مثلث)' };
    const sq = s.map((x) => x * x); const right = Math.abs(sq[0] + sq[1] - sq[2]) < 1e-6;
    const iso = near(s[0], s[1]) || near(s[1], s[2]); const eq = near(s[0], s[2]);
    return { k: eq ? 'eq' : right && iso ? 'riso' : right ? 'right' : iso ? 'iso' : 'sc', t: eq ? 'متساوي الأضلاع' : right && iso ? 'قائم الزاوية ومتساوي الساقين' : right ? 'قائم الزاوية' : iso ? 'متساوي الساقين' : 'مختلف الأضلاع' };
  }
  G.classifyTri = classify;
  G.reg({
    id: 'distance', unit: U, order: 1, lesson: '3-1', lessonTitle: 'المسافة بين نقطتين', page: 66,
    titleAr: 'المسافة بين نقطتين ونوع المثلث', titleEn: 'Distance Between Two Points', tags: 'مسافه بعد نقطتين فيثاغورس مثلث قائم متساوي الساقين استقامه واحده الاقصى',
    formula: 'AB = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}',
    book: 'أب = √((س₂ – س₁)² + (ص₂ – ص₁)²)',
    summary: 'المسافة بين نقطتين هي وتر مثلث قائم ضلعاه التغير الأفقي $\\Delta x$ والتغير العمودي $\\Delta y$؛ فبنظرية فيثاغورس $AB = \\sqrt{(\\Delta x)^2 + (\\Delta y)^2}$. وبحساب أطوال أضلاع مثلث نعرف نوعه، أو أن النقاط على استقامة واحدة.',
    vars: [['A(x_1, y_1)', 'النقطة الأولى', 'إحداثيات صحيحة من $-8$ إلى $8$'], ['B(x_2, y_2)', 'النقطة الثانية', ''], ['C(x_3, y_3)', 'النقطة الثالثة (عند إظهار المثلث)', '']],
    params: [
      { key: 'x1', label: 'x_1', min: -8, max: 8, step: 1, value: -2, int: true }, { key: 'y1', label: 'y_1', min: -8, max: 8, step: 1, value: -2, int: true },
      { key: 'x2', label: 'x_2', min: -8, max: 8, step: 1, value: 2, int: true }, { key: 'y2', label: 'y_2', min: -8, max: 8, step: 1, value: 1, int: true },
      { key: 'tri', label: 'C', type: 'toggle', value: false, on: 'أظهر النقطة الثالثة جـ والمثلث', off: 'نقطتان فقط' },
      { key: 'x3', label: 'x_3', min: -8, max: 8, step: 1, value: 6, int: true }, { key: 'y3', label: 'y_3', min: -8, max: 8, step: 1, value: 4, int: true }
    ],
    plot: { view: { xmin: -9, xmax: 9, ymin: -9, ymax: 9 } },
    compute(p) {
      const dx = p.x2 - p.x1, dy = p.y2 - p.y1; const sq = dx * dx + dy * dy;
      const r = { dx: dx, dy: dy, sq: sq, d: Math.sqrt(sq) };
      if (p.tri) { r.bc = dist(p.x2, p.y2, p.x3, p.y3); r.ac = dist(p.x1, p.y1, p.x3, p.y3); r.cls = classify(r.d, r.bc, r.ac); }
      return r;
    },
    draw(P, p, d) {
      const c = P.colors();
      if (p.tri) P.polygon([[p.x1, p.y1], [p.x2, p.y2], [p.x3, p.y3]], { color: c.c5, fill: c.c5, alpha: 0.12, width: 2 });
      P.segment(p.x1, p.y1, p.x2, p.y1, { color: c.c3, width: 2.5, dash: [6, 4] });
      P.segment(p.x2, p.y1, p.x2, p.y2, { color: c.c4, width: 2.5, dash: [6, 4] });
      P.segment(p.x1, p.y1, p.x2, p.y2, { color: c.c1, width: 3.5 });
      if (d.dx) P.text((p.x1 + p.x2) / 2, p.y1, 'Δس = ' + d.dx, { color: c.c3, dy: d.dy >= 0 ? 14 : -14, align: 'center', rtl: true, bold: true });
      if (d.dy) P.text(p.x2, (p.y1 + p.y2) / 2, 'Δص = ' + d.dy, { color: c.c4, dx: 8, rtl: true, bold: true });
      P.point(p.x1, p.y1, { color: c.c2, r: 6, label: 'أ' + pt(p.x1, p.y1) });
      P.point(p.x2, p.y2, { color: c.c2, r: 6, label: 'ب' + pt(p.x2, p.y2) });
      if (p.tri) P.point(p.x3, p.y3, { color: c.c5, r: 6, label: 'جـ' + pt(p.x3, p.y3) });
    },
    handles(p, d, set) {
      const h = [{ x: p.x1, y: p.y1, onDrag: (x, y) => drag('x1', 'y1', 8)(x, y, set) }, { x: p.x2, y: p.y2, onDrag: (x, y) => drag('x2', 'y2', 8)(x, y, set) }];
      if (p.tri) h.push({ x: p.x3, y: p.y3, onDrag: (x, y) => drag('x3', 'y3', 8)(x, y, set) });
      return h;
    },
    live(p, d) { return 'AB = \\sqrt{(' + d.dx + ')^2 + (' + d.dy + ')^2} = \\sqrt{' + d.sq + '} = ' + rootTeX(d.sq); },
    results(p, d) {
      const r = [['أب', rootTeX(d.sq)], ['القيمة التقريبية', M.fmt(d.d, 3) + ' وحدة', false], ['Δس ، Δص', d.dx + ' ، ' + d.dy, false]];
      if (p.tri) r.push(['بجـ', rootTeX(Math.round(d.bc * d.bc))], ['أجـ', rootTeX(Math.round(d.ac * d.ac))], ['نوع المثلث', d.cls.t, false, d.cls.k === 'line' ? 'neg' : 'pos']);
      return r;
    },
    steps(p, d) {
      const s = ['$\\Delta x = ' + p.x2 + ' - (' + p.x1 + ') = ' + d.dx + '$ و $\\Delta y = ' + p.y2 + ' - (' + p.y1 + ') = ' + d.dy + '$.', 'بنظرية فيثاغورس: $AB^2 = ' + (d.dx * d.dx) + ' + ' + (d.dy * d.dy) + ' = ' + d.sq + '$، ومنه $AB = ' + rootTeX(d.sq) + '$.'];
      if (p.tri) s.push(d.cls.k === 'line' ? 'مجموع أصغر طولين يساوي الطول الأكبر، فالنقاط على استقامة واحدة.' : 'نقارن مربعات الأطوال ونقارن الأطوال فيما بينها ← المثلث ' + d.cls.t + '.');
      return s;
    },
    explain(a, b, da, db) { if (b.tri && db.cls && (!da || !da.cls || da.cls.k !== db.cls.k)) return ['أصبح نوع الشكل: ' + db.cls.t + '.']; return da && !near(da.d, db.d) ? ['تغيّرت المسافة إلى ' + M.fmt(db.d, 3) + ' وحدة.'] : []; },
    learn: [
      '**نشاط 1 ص 66:** للانتقال من مئذنة باب الأسباط إلى مئذنة باب السلسلة في المسجد الأقصى، المسلك المستقيم أقصر من المرور بمئذنة باب الغوانمة.',
      '**نشاط 2 ص 66:** أ(0، 0) ، ب(4، 0) ، جـ(4، 3): أب = 4 ، بجـ = 3 ، ومن فيثاغورس أجـ = 5.',
      '**أتعلم ص 67:** $AB = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$.',
      '**نشاط 4 ص 67:** م(-2، -2) ، ن(2، 1) ، ل(6، 4): م ن = 5 ، ن ل = 5 ، م ل = 10، فالنقاط على استقامة واحدة.',
      '**نشاط 5 ص 67:** ك(0، 4) ، ل(2، 2) ، م(0، 0): ك ل = ل م = $\\sqrt{8}$ و ك م = 4، فالمثلث قائم الزاوية ومتساوي الساقين.',
      '**نشاط 6 ص 68:** إذا كانت المسافة بين م(أ، 7) و ن(-2، 3) تساوي 5 فإن أ = 1 أو أ = -5.'
    ],
    challenges: [
      { q: 'جد المسافة بين م(-2، -2) و ن(2، 1) (نشاط 4).', hint: 'Δس = 4 و Δص = 3.', init: { x1: 0, y1: 0, x2: 1, y2: 1, tri: false }, check: (p) => p.x1 === -2 && p.y1 === -2 && p.x2 === 2 && p.y2 === 1, why: () => '$\\sqrt{16 + 9} = 5$ وحدات.' },
      { q: 'بيّن أن م(-2، -2) و ن(2، 1) و ل(6، 4) على استقامة واحدة.', hint: 'أظهر النقطة الثالثة.', init: { x1: -2, y1: -2, x2: 2, y2: 1, tri: false, x3: 0, y3: 4 }, check: (p, d) => p.tri && d.cls && d.cls.k === 'line' },
      { q: 'كوّن مثلثاً قائم الزاوية ومتساوي الساقين (نشاط 5).', hint: 'ك(0، 4) ، ل(2، 2) ، م(0، 0).', init: { x1: 1, y1: 1, x2: 3, y2: 1, tri: true, x3: 2, y3: 5 }, check: (p, d) => p.tri && d.cls && d.cls.k === 'riso' }
    ],
    tutor: [
      { q: 'لماذا لا تهم إشارة Δس؟', k: ['اشاره', 'سالب', 'ترتيب'], a: () => 'لأننا نربّعها: $(-4)^2 = 4^2$؛ لذلك أب = ب أ.' },
      { q: 'كيف أعرف أن ثلاث نقاط على استقامة واحدة؟', k: ['استقامه', 'واحده'], a: () => 'إذا كان مجموع أصغر مسافتين يساوي المسافة الكبرى، كما في نشاط 4 ص 67: 5 + 5 = 10.' },
      { q: 'ما المسافة الآن؟', k: ['المسافه', 'الان'], a: (p, d) => 'أب $= ' + rootTeX(d.sq) + ' \\approx ' + M.fmt(d.d, 3) + '$.' }
    ]
  });

  /* ======================= 3-2 إحداثيا نقطة المنتصف ======================= */
  G.reg({
    id: 'midpoint', unit: U, order: 2, lesson: '3-2', lessonTitle: 'إحداثيّات نقطة منتصف القطعة المستقيمة', page: 69,
    titleAr: 'نقطة منتصف القطعة المستقيمة', titleEn: 'Midpoint of a Line Segment', tags: 'منتصف قطعه مستقيمه احداثيات ملعب متوازي اضلاع قطران',
    formula: 'M = \\left(\\frac{x_1 + x_2}{2},\\ \\frac{y_1 + y_2}{2}\\right)',
    book: 'إحداثيا منتصف أب = ((س₁ + س₂) ÷ ٢ ، (ص₁ + ص₂) ÷ ٢)',
    summary: 'إحداثيا نقطة المنتصف هما الوسط الحسابي للإحداثيين السينيين والوسط الحسابي للإحداثيين الصاديين. وإذا عرفنا طرفاً والمنتصف نجد الطرف الآخر: $x_2 = 2x_m - x_1$.',
    vars: [['A(x_1, y_1)', 'الطرف الأول', ''], ['B(x_2, y_2)', 'الطرف الثاني (أو المنتصف في وضع «إيجاد الطرف»)', ''], ['M', 'نقطة المنتصف', '']],
    params: [
      { key: 'mode', label: '\\text{المطلوب}', type: 'select', value: 'mid', options: [['mid', 'إيجاد المنتصف'], ['end', 'إيجاد الطرف الآخر من الطرف والمنتصف']] },
      { key: 'x1', label: 'x_1', min: -8, max: 8, step: 1, value: -1, int: true }, { key: 'y1', label: 'y_1', min: -8, max: 8, step: 1, value: 4, int: true },
      { key: 'x2', label: 'x_2', min: -8, max: 8, step: 1, value: 5, int: true }, { key: 'y2', label: 'y_2', min: -8, max: 8, step: 1, value: 2, int: true }
    ],
    plot: { view: { xmin: -9, xmax: 9, ymin: -9, ymax: 9 } },
    compute(p) {
      if (p.mode === 'end') return { A: [p.x1, p.y1], M: [p.x2, p.y2], B: [2 * p.x2 - p.x1, 2 * p.y2 - p.y1] };
      return { A: [p.x1, p.y1], B: [p.x2, p.y2], M: [(p.x1 + p.x2) / 2, (p.y1 + p.y2) / 2] };
    },
    draw(P, p, d) {
      const c = P.colors();
      P.segment(d.A[0], d.A[1], d.B[0], d.B[1], { color: c.c1, width: 3.5 });
      P.segment(d.A[0], d.A[1], d.M[0], d.A[1], { color: c.c3, width: 1.5, dash: [5, 4] }); P.segment(d.M[0], d.A[1], d.M[0], d.M[1], { color: c.c3, width: 1.5, dash: [5, 4] });
      P.point(d.A[0], d.A[1], { color: c.c2, r: 6, label: 'أ' + pt(d.A[0], d.A[1]) });
      P.point(d.B[0], d.B[1], { color: p.mode === 'end' ? c.c5 : c.c2, r: 6, label: 'ب' + pt(d.B[0], d.B[1]) });
      P.point(d.M[0], d.M[1], { color: p.mode === 'end' ? c.c2 : c.c5, r: 7, label: 'م' + pt(d.M[0], d.M[1]) });
    },
    handles(p, d, set) { return [{ x: p.x1, y: p.y1, onDrag: (x, y) => drag('x1', 'y1', 8)(x, y, set) }, { x: p.x2, y: p.y2, onDrag: (x, y) => drag('x2', 'y2', 8)(x, y, set) }]; },
    live(p, d) { return p.mode === 'end' ? 'B = (2 \\times ' + p.x2 + ' - (' + p.x1 + '),\\ 2 \\times ' + p.y2 + ' - (' + p.y1 + ')) = (' + d.B[0] + ', ' + d.B[1] + ')' : 'M = \\left(\\frac{' + p.x1 + ' + ' + p.x2 + '}{2},\\ \\frac{' + p.y1 + ' + ' + p.y2 + '}{2}\\right) = (' + M.fmt(d.M[0]) + ', ' + M.fmt(d.M[1]) + ')'; },
    results(p, d) { return [['أ', pt(d.A[0], d.A[1]), false], ['ب', pt(d.B[0], d.B[1]), false, p.mode === 'end' ? 'pos' : ''], ['المنتصف م', pt(d.M[0], d.M[1]), false, p.mode === 'mid' ? 'pos' : ''], ['أم = م ب', M.fmt(dist(d.A[0], d.A[1], d.M[0], d.M[1]), 3) + ' وحدة', false]]; },
    steps(p, d) {
      return p.mode === 'end' ? ['المنتصف (س، ص) = ((س₁ + س₂) ÷ 2 ، (ص₁ + ص₂) ÷ 2).', 'من الإحداثي السيني: $' + p.x2 + ' = \\frac{' + p.x1 + ' + x_2}{2}$ ومنه $x_2 = ' + d.B[0] + '$.', 'ومن الصادي: $y_2 = ' + d.B[1] + '$.']
        : ['نجمع الإحداثيين السينيين ونقسم على 2: $' + M.fmt(d.M[0]) + '$.', 'ونجمع الصاديين ونقسم على 2: $' + M.fmt(d.M[1]) + '$.'];
    },
    explain(a, b) { return a.mode !== b.mode ? [b.mode === 'end' ? 'النقطة الثانية الآن هي المنتصف المعلوم، ونحسب الطرف ب.' : 'نحسب المنتصف من الطرفين.'] : []; },
    learn: [
      '**نشاط 1 ص 69:** تحديد منتصف الملعب.',
      '**نشاط 2 ص 69:** أ(-1، 4) و ب(5، 2): المنتصف جـ(2، 3) لأن $2 = \\frac{-1 + 5}{2}$ و $3 = \\frac{4 + 2}{2}$.',
      '**نشاط 3 ص 69:** أ(9، 3) و ب(5، 1): المنتصف (7، 2).',
      '**نشاط 4 ص 70:** ب(6، -4) منتصف أ(5، -3) و جـ، فإن جـ(7، -5).',
      '**نشاط 5 ص 70:** متوازي الأضلاع أ(3، 2) ، ب(4، -5) ، جـ(0، -3): قطراه ينصّف كل منهما الآخر، فنقطة التقاطع منتصف أجـ (1.5، -0.5)، و د(-1، 4).'
    ],
    challenges: [
      { q: 'جد المنتصف لـ أ(9، 3) و ب(5، 1) (نشاط 3).', hint: 'غيّر الإحداثيات.', init: { mode: 'mid', x1: 0, y1: 0, x2: 2, y2: 2 }, check: (p) => p.mode === 'mid' && p.x1 + p.x2 === 14 && p.y1 + p.y2 === 4 && [p.x1, p.x2].includes(5), why: () => '(7، 2).' },
      { q: 'ب(6، -4) منتصف أجـ و أ(5، -3). جد جـ (نشاط 4).', hint: 'اختر «إيجاد الطرف الآخر» وضع المنتصف (6، -4).', init: { mode: 'mid', x1: 0, y1: 0, x2: 1, y2: 1 }, check: (p, d) => p.mode === 'end' && p.x1 === 5 && p.y1 === -3 && p.x2 === 6 && p.y2 === -4, why: () => 'جـ(7، -5).' },
      { q: 'جد نقطة تقاطع قطري متوازي الأضلاع في نشاط 5: منتصف أ(3، 2) و جـ(0، -3).', hint: 'اختر «إيجاد المنتصف» وضع النقطتين.', init: { mode: 'mid', x1: 3, y1: 2, x2: 0, y2: -2 }, check: (p) => p.mode === 'mid' && p.x1 === 3 && p.y1 === 2 && p.x2 === 0 && p.y2 === -3, why: () => 'م(1.5، -0.5)، وهو منتصف ب د أيضاً، فإن د = (2 × 1.5 − 4 ، 2 × (-0.5) + 5) = (-1، 4).' }
    ],
    tutor: [
      { q: 'لماذا نقسم على ٢؟', k: ['نقسم', '2', 'لماذا'], a: () => 'لأن المنتصف يقع في منتصف المسافة: إحداثيه هو الوسط الحسابي لإحداثيي الطرفين.' },
      { q: 'كيف أجد الطرف إذا عرفت المنتصف؟', k: ['الطرف', 'المنتصف'], a: () => '$x_2 = 2x_m - x_1$ و $y_2 = 2y_m - y_1$.' }
    ]
  });

  /* ======================= 3-3 ميل الخط المستقيم ======================= */
  G.reg({
    id: 'slope', unit: U, order: 3, lesson: '3-3', lessonTitle: 'ميل الخط المستقيم', page: 72,
    titleAr: 'ميل الخط المستقيم وزاوية ميله', titleEn: 'Slope of a Line', tags: 'ميل انحدار سطح مائل منحدر ظل زاويه افقي عمودي غير معرف شمعه',
    formula: 'm = \\frac{\\Delta y}{\\Delta x} = \\frac{y_2 - y_1}{x_2 - x_1} = \\tan\\theta,\\quad x_1 \\ne x_2',
    book: 'م = التغير العمودي ÷ التغير الأفقي = (ص₂ – ص₁) ÷ (س₂ – س₁) = ظا هـ ، حيث س₁ ≠ س₂',
    summary: 'الميل يقيس شدة انحدار الخط: التغير العمودي مقسوماً على التغير الأفقي. ويساوي ظل الزاوية التي يصنعها الخط مع محور السينات الموجب. ميل الخط الأفقي صفر، وميل الخط العمودي غير معرّف.',
    vars: [['A(x_1, y_1)', 'نقطة على الخط', ''], ['B(x_2, y_2)', 'نقطة ثانية', ''], ['m', 'الميل', 'عدد حقيقي أو غير معرّف'], ['\\theta', 'زاوية الميل', 'مع محور السينات الموجب']],
    params: [
      { key: 'x1', label: 'x_1', min: -8, max: 8, step: 1, value: 0, int: true }, { key: 'y1', label: 'y_1', min: -8, max: 8, step: 1, value: -2, int: true },
      { key: 'x2', label: 'x_2', min: -8, max: 8, step: 1, value: 3, int: true }, { key: 'y2', label: 'y_2', min: -8, max: 8, step: 1, value: 5, int: true }
    ],
    plot: { view: { xmin: -9, xmax: 9, ymin: -9, ymax: 9 } },
    compute(p) {
      const dx = p.x2 - p.x1, dy = p.y2 - p.y1;
      if (!dx && !dy) return { same: true, dx: 0, dy: 0 };
      if (!dx) return { vert: true, dx: 0, dy: dy };
      const m = dy / dx + 0; let th = M.rad2deg(Math.atan(m)); if (th < 0) th += 180;
      return { dx: dx, dy: dy, m: m, th: th, c: p.y1 - m * p.x1 };
    },
    draw(P, p, d) {
      const c = P.colors();
      if (d.same) { P.point(p.x1, p.y1, { color: c.c2, r: 7 }); return; }
      if (d.vert) P.vline(p.x1, { color: c.c2, width: 3 });
      else {
        P.fn((x) => d.m * x + d.c, { color: c.c1, width: 3 });
        P.segment(p.x1, p.y1, p.x2, p.y1, { color: c.c3, width: 2.5, dash: [6, 4] }); P.segment(p.x2, p.y1, p.x2, p.y2, { color: c.c4, width: 2.5, dash: [6, 4] });
        P.text((p.x1 + p.x2) / 2, p.y1, 'Δس = ' + d.dx, { color: c.c3, dy: d.dy >= 0 ? 14 : -14, align: 'center', rtl: true, bold: true });
        if (d.dy) P.text(p.x2, (p.y1 + p.y2) / 2, 'Δص = ' + d.dy, { color: c.c4, dx: 8, rtl: true, bold: true });
        if (d.m) { const x0 = -d.c / d.m; if (Math.abs(x0) < 9) P.angleArc(x0, 0, 26, 0, M.deg2rad(d.th), { color: c.c5, width: 2 }); }
      }
      P.point(p.x1, p.y1, { color: c.c2, r: 6, label: 'أ' + pt(p.x1, p.y1) });
      P.point(p.x2, p.y2, { color: c.c2, r: 6, label: 'ب' + pt(p.x2, p.y2) });
    },
    handles(p, d, set) { return [{ x: p.x1, y: p.y1, onDrag: (x, y) => drag('x1', 'y1', 8)(x, y, set) }, { x: p.x2, y: p.y2, onDrag: (x, y) => drag('x2', 'y2', 8)(x, y, set) }]; },
    live(p, d) { return d.same ? '\\text{النقطتان متطابقتان}' : d.vert ? 'm = \\frac{' + d.dy + '}{0}\\ \\text{غير معرّف}' : 'm = \\frac{' + p.y2 + ' - (' + p.y1 + ')}{' + p.x2 + ' - (' + p.x1 + ')} = ' + frac(d.dy, d.dx); },
    results(p, d) {
      if (d.same) return [['الميل', 'اختر نقطتين مختلفتين', false, 'neg'], ['أ = ب', pt(p.x1, p.y1), false]];
      if (d.vert) return [['الميل', 'غير معرّف (Δس = 0)', false, 'neg'], ['الخط', 'يوازي محور الصادات: س = ' + p.x1, false]];
      const eq = 'y = ' + (d.m === 0 ? '' : (frac(d.dy, d.dx) === '1' ? '' : frac(d.dy, d.dx) === '-1' ? '-' : frac(d.dy, d.dx)) + 'x') + (d.c === 0 ? (d.m === 0 ? '0' : '') : (d.m === 0 ? M.texFrac(d.c) : (d.c < 0 ? ' - ' + M.texFrac(-d.c) : ' + ' + M.texFrac(d.c))));
      return [['الميل م', frac(d.dy, d.dx)], ['الميل عشرياً', M.fmt(d.m, 3), false], ['زاوية الميل هـ', M.fmt(d.th, 2) + '°', false], ['ظا هـ', M.fmt(Math.tan(M.deg2rad(d.th)), 3), false], ['وصف الخط', d.m > 0 ? 'صاعد من اليسار إلى اليمين' : d.m < 0 ? 'هابط من اليسار إلى اليمين' : 'أفقي يوازي محور السينات', false], ['معادلة الخط أب', eq]];
    },
    steps(p, d) {
      if (d.same) return ['النقطتان متطابقتان، فلا يتحدد خط واحد.'];
      if (d.vert) return ['$x_2 - x_1 = 0$، والقسمة على صفر غير معرّفة: الميل غير معرّف والخط عمودي.'];
      return ['التغير العمودي $\\Delta y = ' + d.dy + '$، والتغير الأفقي $\\Delta x = ' + d.dx + '$.', '$m = \\frac{' + d.dy + '}{' + d.dx + '} = ' + frac(d.dy, d.dx) + '$.', 'زاوية الميل: $\\tan\\theta = ' + M.fmt(d.m, 3) + '$ ومنه $\\theta \\approx ' + M.fmt(d.th, 1) + '^{\\circ}$.'];
    },
    explain(a, b, da, db) { if (db.vert && !(da && da.vert)) return ['أصبح الخط عمودياً: Δس = 0 فالميل غير معرّف.']; if (da && db.m !== undefined && da.m !== undefined && Math.sign(da.m) !== Math.sign(db.m)) return [db.m > 0 ? 'الميل موجب: الخط صاعد.' : db.m < 0 ? 'الميل سالب: الخط هابط.' : 'الميل صفر: الخط أفقي.']; return []; },
    learn: [
      '**نشاط 1 ص 72:** السطوح المائلة لذوي الإعاقة: ارتفاع متر واحد لكل 12 متراً أفقياً، فالميل $\\frac{1}{12}$. والسطح الذي ميله $\\frac{1}{12}$ أكثر انحداراً من الذي ميله $\\frac{1}{15}$.',
      '**تعريف ص 73:** $m = \\frac{y_2 - y_1}{x_2 - x_1}$ حيث $x_1 \\ne x_2$. نشاط 2: ميل المار بـ (3، 5) و (0، -2) يساوي $\\frac{7}{3}$.',
      '**أتعلم ص 74:** ميل الخط المستقيم = ظا هـ؛ نشاط 4: الخط الذي يصنع زاوية 60° ميله ظا 60° = $\\sqrt{3}$.',
      '**ص 75:** ميل الخط الموازي لمحور السينات صفر (نشاط 5: أ(2، 1) ، ب(-1، 1))، وميل الموازي لمحور الصادات غير معرّف (نشاط 6: ل(2، 1) ، ر(2، 3)).',
      '**تمرين 4 ص 76:** منحنى ارتفاع الشمعة مع زمن اشتعالها خط ميله سالب: الارتفاع يتناقص بانتظام.'
    ],
    challenges: [
      { q: 'جد ميل الخط المار بـ (3، 5) و (0، -2) (نشاط 2).', hint: 'ضع أ(0، -2) و ب(3، 5).', init: { x1: 0, y1: 0, x2: 1, y2: 1 }, check: (p, d) => !d.vert && !d.same && M.near(d.m, 7 / 3) && [p.x1, p.x2].includes(3) && [p.y1, p.y2].includes(5), why: () => '$m = \\frac{7}{3}$.' },
      { q: 'اجعل الخط يوازي محور السينات (نشاط 5).', hint: 'ص₁ = ص₂.', init: { x1: 0, y1: 0, x2: 2, y2: 3 }, check: (p, d) => !d.vert && !d.same && d.m === 0 },
      { q: 'اجعل الميل غير معرّف (نشاط 6).', hint: 'س₁ = س₂.', init: { x1: 0, y1: 0, x2: 2, y2: 3 }, check: (p, d) => !!d.vert },
      { q: 'اجعل زاوية الميل 45°.', hint: 'Δص = Δس.', init: { x1: 0, y1: 0, x2: 2, y2: 3 }, check: (p, d) => d.m !== undefined && M.near(d.m, 1) }
    ],
    tutor: [
      { q: 'لماذا يكون ميل الخط العمودي غير معرّف؟', k: ['عمودي', 'غير معرف'], a: () => 'لأن التغير الأفقي صفر، والقسمة على صفر غير معرّفة.' },
      { q: 'ما علاقة الميل بظل الزاوية؟', k: ['ظل', 'ظا', 'زاويه'], a: () => 'في المثلث القائم الذي ضلعاه Δس و Δص: ظا هـ = المقابل ÷ المجاور = Δص ÷ Δس = الميل.' },
      { q: 'ما الميل الآن؟', k: ['الميل', 'الان'], a: (p, d) => (d.vert ? 'غير معرّف.' : d.same ? 'اختر نقطتين مختلفتين.' : '$m = ' + frac(d.dy, d.dx) + '$.') }
    ]
  });

  /* ======================= 3-4 معادلة الخط المستقيم ======================= */
  const lineTeX = (m, c) => { const mt = m === 0 ? '' : m === 1 ? 'x' : m === -1 ? '-x' : M.texFrac(m) + 'x'; if (!mt) return M.texFrac(c); return mt + (c === 0 ? '' : c < 0 ? ' - ' + M.texFrac(-c) : ' + ' + M.texFrac(c)); };
  G.lineTeX = lineTeX;
  G.reg({
    id: 'line-equation', unit: U, order: 4, lesson: '3-4', lessonTitle: 'معادلة الخط المستقيم', page: 77,
    titleAr: 'معادلة الخط المستقيم والتوازي والتعامد', titleEn: 'Equation of a Line, Parallel & Perpendicular', tags: 'معادله خط مستقيم ميل مقطع صادي سيني توازي تعامد نبته فاصولياء جري',
    formula: 'y = mx + c,\\qquad y - y_1 = m(x - x_1),\\qquad m_1 = m_2\\ (\\parallel),\\quad m_1 \\times m_2 = -1\\ (\\perp)',
    book: 'ص = م س + جـ ؛ ص – ص₁ = م (س – س₁) ؛ يتوازى خطان إذا تساوى ميلاهما، ويتعامدان إذا كان م₁ × م₂ = –١',
    summary: 'معادلة الخط الذي ميله $m$ ومقطعه الصادي $c$ هي $y = mx + c$. الخطوط المتوازية لها الميل نفسه، والخطان المتعامدان حاصل ضرب ميليهما $-1$.',
    vars: [['m', 'الميل', 'من $-4$ إلى $4$'], ['c', 'المقطع الصادي', 'من $-6$ إلى $6$'], ['(x_1, y_1)', 'نقطة يمر بها الخط الثاني', '']],
    params: [
      { key: 'm', label: 'm', min: -4, max: 4, step: 0.5, value: 2 },
      { key: 'c', label: 'c', min: -6, max: 6, step: 0.5, value: 3 },
      { key: 'rel', label: '\\text{الخط الثاني}', type: 'select', value: 'none', options: [['none', 'لا يوجد'], ['par', 'موازٍ يمر بالنقطة'], ['perp', 'عمودي يمر بالنقطة']] },
      { key: 'px', label: 'x_1', min: -6, max: 6, step: 1, value: 0, int: true }, { key: 'py', label: 'y_1', min: -6, max: 6, step: 1, value: -1, int: true }
    ],
    plot: { view: { xmin: -8, xmax: 8, ymin: -8, ymax: 8 } },
    compute(p) {
      const xint = p.m ? -p.c / p.m : null; const r = { xint: xint };
      if (p.rel === 'par') r.m2 = p.m; else if (p.rel === 'perp') r.m2 = p.m ? -1 / p.m : null;
      if (p.rel !== 'none') { r.vert2 = r.m2 === null; if (!r.vert2) r.c2 = p.py - r.m2 * p.px; }
      return r;
    },
    draw(P, p, d) {
      const c = P.colors();
      P.fn((x) => p.m * x + p.c, { color: c.c1, width: 3 });
      P.point(0, p.c, { color: c.c4, r: 6, label: 'جـ = ' + M.fmt(p.c) });
      if (d.xint !== null) P.point(d.xint, 0, { color: c.c3, r: 5 });
      if (p.rel !== 'none') {
        if (d.vert2) P.vline(p.px, { color: c.c5, width: 3 }); else P.fn((x) => d.m2 * x + d.c2, { color: c.c5, width: 3 });
        P.point(p.px, p.py, { color: c.c2, r: 6, label: pt(p.px, p.py) });
      }
    },
    handles(p, d, set) { const h = [{ x: 0, y: p.c, onDrag: (x, y) => set('c', M.clamp(Math.round(y * 2) / 2, -6, 6)) }]; if (p.rel !== 'none') h.push({ x: p.px, y: p.py, onDrag: (x, y) => drag('px', 'py', 6)(x, y, set) }); return h; },
    live(p, d) { return 'y = ' + lineTeX(p.m, p.c) + (p.rel === 'none' ? '' : ',\\quad ' + (d.vert2 ? 'x = ' + p.px : 'y = ' + lineTeX(M.round(d.m2, 6), M.round(d.c2, 6)))); },
    results(p, d) {
      const r = [['المعادلة', 'y = ' + lineTeX(p.m, p.c)], ['الميل', M.texFrac(p.m)], ['المقطع الصادي', M.texFrac(p.c)], ['المقطع السيني', d.xint === null ? '\\text{لا يوجد (خط أفقي)}' : M.texFrac(M.round(d.xint, 6))]];
      if (p.rel !== 'none') {
        r.push(['معادلة الخط الثاني', d.vert2 ? 'x = ' + p.px : 'y = ' + lineTeX(M.round(d.m2, 6), M.round(d.c2, 6))]);
        r.push([p.rel === 'par' ? 'التوازي' : 'التعامد', p.rel === 'par' ? 'م₁ = م₂ = ' + M.fmt(p.m) : d.vert2 ? 'الخط الأول أفقي، فالعمودي عليه يوازي محور الصادات' : 'م₁ × م₂ = ' + M.fmt(p.m) + ' × ' + M.fmt(d.m2, 4) + ' = -1', false, 'pos']);
      }
      return r;
    },
    steps(p, d) {
      const s = ['الميل $m = ' + M.texFrac(p.m) + '$ والمقطع الصادي $c = ' + M.texFrac(p.c) + '$ ← $y = ' + lineTeX(p.m, p.c) + '$.'];
      if (p.rel !== 'none' && !d.vert2) s.push('الخط الثاني ميله $' + M.texFrac(M.round(d.m2, 6)) + '$ ويمر بـ ' + pt(p.px, p.py) + ': $y - (' + p.py + ') = ' + M.texFrac(M.round(d.m2, 6)) + '(x - (' + p.px + '))$.', 'ومنه $y = ' + lineTeX(M.round(d.m2, 6), M.round(d.c2, 6)) + '$.');
      return s;
    },
    explain(a, b, da, db) { if (a.m !== b.m) return ['تغيّر الميل فدار الخط حول نقطة المقطع الصادي.']; if (a.c !== b.c) return ['تغيّر المقطع الصادي فانسحب الخط رأسياً موازياً لنفسه.']; if (a.rel !== b.rel) return [b.rel === 'par' ? 'الخطان المتوازيان لهما الميل نفسه.' : b.rel === 'perp' ? 'الخطان المتعامدان: حاصل ضرب ميليهما -1.' : '']; return []; },
    learn: [
      '**نشاط 1 ص 77:** نبتة فاصولياء طولها 3 سم وتنمو 2 سم يومياً: $y = 2x + 3$؛ في نهاية اليوم الخامس طولها 13 سم، وفي الحادي عشر 25 سم.',
      '**تعريف ص 77:** معادلة الخط الذي ميله $m$ ومقطعه الصادي $c$: $y = mx + c$.',
      '**مثال 1 ص 78:** الميل $\\frac{3}{4}$ والمقطع $-2$: $y = \\frac{3}{4}x - 2$.',
      '**تعريف ص 79:** الخط الذي ميله $m$ ويمر بـ $(x_1, y_1)$: $y = m(x - x_1) + y_1$. نشاط 4: الميل 4 والنقطة (2، 3): $y = 4x - 5$.',
      '**نشاط 7 ص 80:** مسارا يزن ومهند $y = 2x - 1$ و $y = 2x + 3$ متوازيان. **نشاط 8:** ميلا الخطين المتعامدين $\\frac{1}{2}$ و $-2$.'
    ],
    challenges: [
      { q: 'مثّل معادلة نمو النبتة $y = 2x + 3$ (نشاط 1).', hint: '$m = 2$ ، $c = 3$.', init: { m: 1, c: 0, rel: 'none' }, check: (p) => p.m === 2 && p.c === 3 },
      { q: 'ارسم مسار مهند الموازي لمسار يزن $y = 2x - 1$ ويمر بـ (0، 3) (نشاط 7).', hint: 'الخط الأول $m = 2$ ، $c = -1$، والثاني موازٍ يمر بـ (0، 3).', init: { m: 1, c: 0, rel: 'none', px: 1, py: 1 }, check: (p, d) => p.m === 2 && p.c === -1 && p.rel === 'par' && p.px === 0 && p.py === 3 },
      { q: 'ارسم خطاً عمودياً على $y = \\frac{1}{2}x - \\frac{1}{2}$ يمر بـ (1، 0) (نشاط 8).', hint: '$m = 0.5$ ، $c = -0.5$ ، ثم «عمودي» و (1، 0).', init: { m: 1, c: 0, rel: 'none', px: 0, py: 0 }, check: (p, d) => p.m === 0.5 && p.c === -0.5 && p.rel === 'perp' && p.px === 1 && p.py === 0, why: () => 'ميل العمودي $-2$ ومعادلته $y = -2x + 2$.' }
    ],
    tutor: [
      { q: 'ما المقطع الصادي؟', k: ['المقطع', 'الصادي'], a: (p) => 'الإحداثي الصادي لنقطة تقاطع الخط مع محور الصادات؛ هنا $c = ' + M.fmt(p.c) + '$ أي النقطة (0، ' + M.fmt(p.c) + ').' },
      { q: 'كيف أعرف أن خطين متعامدان؟', k: ['متعامد', 'عمودي'], a: () => 'إذا كان حاصل ضرب ميليهما $-1$، مثل $\\frac{1}{2} \\times (-2) = -1$.' },
      { q: 'ما معادلة الخط الموازي لمحور السينات ويمر بـ (-٣ ، ٤)؟', k: ['موازي', 'محور السينات'], a: () => 'ميله صفر، فمعادلته $y = 4$ (أفكر وأناقش ص 79).' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
