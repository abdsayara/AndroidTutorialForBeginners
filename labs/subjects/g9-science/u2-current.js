/* علوم التاسع — الوحدة الثانية، الدرس الأول: التيار الكهربائي والدارات الكهربائية (ص 55–62) */
(function (root) {
  'use strict';
  const ML = root.ML; const D = ML.pdraw; const K = ML.s9;
  const U = 5; const n = K.n, q = K.q;
  const E_PER_C = 6.25e18; // كولوم واحد يكافئ 6.25 × 10¹⁸ إلكتروناً (ص 56)

  /* ======================= نشاط (1): تركيب دارة كهربائية بسيطة ص 56 ======================= */
  const R_BULB = 6; // نموذج مبسّط
  K.reg({
    id: 'circuit-builder', unit: U, order: 1, lesson: '1-1', lessonTitle: 'التيار الكهربائي', page: 56,
    titleAr: 'تركيب دارة كهربائية بسيطة: متى يضيء المصباح؟', titleEn: 'Building a Simple Circuit',
    tags: 'دارة كهربائيه بسيطه مصباح بطاريه مفتاح اسلاك مغلقه مفتوحه تيار اصطلاحي الكتروني نشاط 1',
    formula: '\\text{دارة مغلقة: بطارية} + \\text{أسلاك} + \\text{مصباح} + \\text{مفتاح مغلق} \\Rightarrow \\text{يضيء المصباح}',
    book: 'نشاط (1) ص 56: أسلاك نحاسية وبطاريات ومفتاح ومصباح؛ اربط الأجزاء وغيّر ترتيبها وارصد الحالات التي يضيء فيها المصباح. ص 56: اصطُلح على تمثيل اتجاه التيار من القطب الموجب إلى القطب السالب خارج البطارية (التيار الاصطلاحي)، ويعاكس الاتجاه الفعلي لحركة الإلكترونات (التيار الإلكتروني).',
    summary: 'يضيء المصباح فقط عندما تكتمل الدارة: مسار مغلق من القطب الموجب للبطارية عبر الأسلاك والمصباح والمفتاح المغلق إلى القطب السالب. واتجاه توصيل المصباح لا يهم ليضيء.',
    vars: [['V', 'فرق جهد البطارية', '\\mathrm{V}', '1.5 – 9'], ['\\text{المفتاح}', 'مغلق أو مفتوح', '—', '—'], ['\\text{السلك}', 'موصول أو مقطوع', '—', '—']],
    assumptions: ['مقاومة المصباح 6 أوم والأسلاك بلا مقاومة (نموذج مبسّط لأغراض التعليم).'],
    params: [
      { key: 'V', label: 'V\\ (\\mathrm{V})', min: 1.5, max: 9, step: 1.5, value: 3 },
      { key: 'sw', label: '\\text{المفتاح مغلق}', type: 'toggle', value: false },
      { key: 'wire', label: '\\text{السلك الثاني موصول}', type: 'toggle', value: true },
      { key: 'rev', label: '\\text{عكس البطارية}', type: 'toggle', value: false },
      { key: 'show', label: '\\text{إظهار}', type: 'select', options: [['conv', 'التيار الاصطلاحي (+ إلى −)'], ['elec', 'حركة الإلكترونات (− إلى +)']], value: 'conv' }
    ],
    initState: () => ({ t: 0 }), tick(st, p, d, dt) { st.t += dt; }, isDone: () => false, play: { mode: 'time' },
    canvasHint: 'شغّل لرؤية حركة الشحنات، وغيّر المفتاح والسلك.',
    compute(p) { const closed = p.sw && p.wire; const I = closed ? p.V / R_BULB : 0; return { closed: closed, I: I, glow: Math.min(1, I / 1.2) }; },
    drawCustom(ctx, W, H, p, d, c) {
      const xL = W * 0.15, xR = W * 0.85, yT = H * 0.25, yB = H * 0.8;
      K.wire(ctx, [[W / 2 - 12, yB], [xL, yB], [xL, yT], [W * 0.4, yT]], c);
      K.switchH(ctx, W * 0.4, yT, W * 0.52, p.sw, c); K.lbl(ctx, p.sw ? 'مفتاح مغلق' : 'مفتاح مفتوح', W * 0.46, yT - 22, c.c5, c, 12);
      K.wire(ctx, [[W * 0.52, yT], [xR, yT], [xR, H * 0.44]], c);
      K.bulb(ctx, xR, H * 0.52, 16, d.glow, c, '');
      if (p.wire) K.wire(ctx, [[xR, H * 0.6], [xR, yB], [W / 2 + 12, yB]], c);
      else { K.wire(ctx, [[xR, H * 0.6], [xR, H * 0.68]], c); K.wire(ctx, [[xR, H * 0.74], [xR, yB], [W / 2 + 12, yB]], c); K.lbl(ctx, 'سلك مقطوع', xR - 50, H * 0.71, c.c2, c, 12); }
      ctx.save(); if (p.rev) { ctx.translate(W / 2, yB); ctx.rotate(Math.PI); ctx.translate(-W / 2, -yB); } K.battery(ctx, W / 2, yB, true, '', c); ctx.restore();
      K.lbl(ctx, (p.rev ? '− ' : '+ ') + 'V = ' + p.V + ' V' + (p.rev ? ' +' : ' −'), W / 2, yB + 28, c.c2, c, 12);
      if (d.closed && d.st) { const path = [[W / 2 + 12, yB], [xR, yB], [xR, yT], [xL, yT], [xL, yB], [W / 2 - 12, yB]]; const dir = (p.show === 'conv') !== p.rev ? 1 : -1; K.flow(ctx, path, d.st.t * dir, 40 + d.I * 40, 14, p.show === 'conv' ? c.c1 : c.c4); }
      K.lbl(ctx, d.closed ? 'الدارة مغلقة: يضيء المصباح' : 'الدارة مفتوحة: لا يضيء المصباح', W / 2, 20, d.closed ? c.c3 : c.c2, c, K.narrow(W) ? 13 : 15, '800');
    },
    live(p, d) { return d.closed ? 'I = \\frac{V}{R} = \\frac{' + p.V + '}{' + R_BULB + '} = ' + q(d.I, 'A', 3) : 'I = 0'; },
    results(p, d) { return [['حالة الدارة', d.closed ? 'مغلقة' : 'مفتوحة', false], ['المصباح', d.closed ? 'يضيء' : 'لا يضيء', false], ['شدة التيار', q(d.I, 'A', 3), true, d.closed ? 'pos' : ''], ['أثر عكس البطارية', 'يضيء المصباح في الاتجاهين؛ يتغير اتجاه التيار فقط', false]]; },
    steps(p, d) { return ['البطارية مصدر الطاقة، والأسلاك تنقل التيار، والمصباح يستهلك الطاقة، والمفتاح يفتح الدارة ويغلقها.', d.closed ? 'الدارة مغلقة: مسار متصل من القطب الموجب إلى السالب.' : 'الدارة مفتوحة: ' + (!p.sw ? 'المفتاح مفتوح.' : 'سلك مقطوع.'), 'التيار الاصطلاحي من الموجب إلى السالب خارج البطارية، والإلكترونات تتحرك بعكسه.']; },
    graph(p, d) { const v = [d.I]; return { view: { xmin: 0, xmax: 1, ymin: 0, ymax: 9 / R_BULB * 1.2 }, xLabel: '', yLabel: 'I (A)', caption: d.closed ? 'التيار يسري لأن الدارة مغلقة.' : 'لا يسري تيار في دارة مفتوحة.', draw(G) { const c = G.colors(); K.bars(G, [['I', d.I, c.c1]]); } }; },
    explain(a, b, da, db) { const o = []; if (da.closed !== db.closed) o.push(db.closed ? 'اكتمل المسار فسرى التيار وأضاء المصباح.' : 'انقطع المسار فتوقف التيار.'); if (a.rev !== b.rev && db.closed) o.push('عكس البطارية يعكس اتجاه التيار، والمصباح يضيء في الحالتين.'); return o; },
    learn: ['**التيار الكهربائي (ص 56):** الإلكترونات الحرة في سلك النحاس تتحرك حركة عشوائية، وعند وصل طرفي السلك ببطارية تصبح محصلة حركتها في اتجاه محدد يمثل التيار الكهربائي، الذي ينقل الطاقة الكهربائية من نقطة إلى أخرى.', '**الموصلات (ص 57):** معظم الأجهزة في بيتك تعمل بتيار أقل من 15 أمبير، بينما محطة توليد الكهرباء تنتج آلاف الأمبيرات.'],
    challenges: [
      { q: 'اجعل المصباح **يضيء**.', hint: 'أغلق المفتاح وتأكد من توصيل السلك.', init: { sw: false, wire: false }, check: (p, d) => d.closed },
      { q: 'هل ينبغي أن يمر التيار في المصباح باتجاه معين؟ اعكس البطارية والمصباح مضيء.', hint: 'أغلق الدارة ثم فعّل «عكس البطارية».', init: { sw: false, wire: true, rev: false }, check: (p, d) => d.closed && p.rev, why: () => 'يضيء المصباح في الاتجاهين.' }
    ],
    tutor: [
      { q: 'ما دور المفتاح؟', k: ['المفتاح', 'دور'], a: () => K.tutor('ماذا يحدث للمسار عندما تفتح المفتاح؟', 'يغلق الدارة فيسري التيار أو يفتحها فيتوقف.') },
      { q: 'ما الفرق بين التيار الاصطلاحي والإلكتروني؟', k: ['اصطلاحي', 'الكتروني'], a: () => K.tutor('في أي اتجاه تتحرك الإلكترونات السالبة؟', 'الاصطلاحي من الموجب إلى السالب خارج البطارية، والإلكتروني بعكسه.') }
    ]
  });

  /* ======================= مثال ص 56: كمية الشحنة = شدة التيار × الزمن ======================= */
  K.reg({
    id: 'charge-time', unit: U, order: 2, lesson: '1-1', lessonTitle: 'التيار الكهربائي وكمية الشحنة', page: 56,
    titleAr: 'كمية الشحنة المارة في الدارة: الشحنة = التيار × الزمن', titleEn: 'Charge = Current × Time',
    tags: 'كميه الشحنه كولوم امبير زمن دقائق الكترونات مثال 6.25 1.6',
    formula: 'Q = I \\times t',
    book: 'مثال ص 56: يسري تيار شدته 0.5 أمبير في دارة كهربائية تحتوي على مصباح وبطارية؛ كمية الشحنة خلال 10 دقائق = 0.5 × 10 × 60 = 300 كولوم. إضاءة ص 56: شحنة الإلكترون 1.6 × 10⁻¹⁹ كولوم، والكولوم الواحد يكافئ 6.25 × 10¹⁸ إلكتروناً.',
    summary: 'شدة التيار هي كمية الشحنة التي تمر في الدارة في الثانية الواحدة. كلما زاد التيار أو الزمن زادت الشحنة المارة. ويحوي الكولوم الواحد 6.25 × 10¹⁸ إلكتروناً.',
    vars: [['I', 'شدة التيار', '\\mathrm{A}', '0.1 – 15'], ['t', 'الزمن', '\\mathrm{min}', '1 – 60'], ['Q', 'كمية الشحنة', '\\mathrm{C}', '—']],
    assumptions: ['التيار ثابت طوال المدة.'],
    params: [
      { key: 'I', label: 'I\\ (\\mathrm{A})', min: 0.1, max: 15, step: 0.1, value: 1 },
      { key: 't', label: 't\\ (\\mathrm{min})', min: 1, max: 60, step: 1, value: 5 }
    ],
    initState: () => ({ t: 0 }), tick(st, p, d, dt) { st.t += dt; }, isDone: () => false, play: { mode: 'time' },
    compute(p) { const Q = p.I * p.t * 60; return { Q: Q, N: Q * E_PER_C }; },
    drawCustom(ctx, W, H, p, d, c) {
      const y = H * 0.45, x0 = W * 0.08, x1 = W * 0.92;
      ctx.fillStyle = 'rgba(234,179,8,.25)'; D.rr(ctx, x0, y - 22, x1 - x0, 44, 22); ctx.fill(); ctx.strokeStyle = '#a16207'; ctx.lineWidth = 2; ctx.stroke();
      K.flow(ctx, [[x0 + 10, y], [x1 - 10, y]], d.st ? d.st.t : 0, 20 + p.I * 12, 18, c.c1);
      ctx.strokeStyle = c.c5; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(W / 2, y - 34); ctx.lineTo(W / 2, y + 34); ctx.stroke(); ctx.setLineDash([]);
      K.lbl(ctx, 'مقطع السلك', W / 2, y + 48, c.c5, c, 12);
      K.lbl(ctx, 'Q = ' + n(d.Q) + ' C', W / 2, H * 0.18, c.c1, c, K.narrow(W) ? 15 : 18, '800');
      K.lbl(ctx, 'عدد الإلكترونات ≈ ' + ML.phys.sct(d.N, 3), W / 2, H * 0.8, c.text, c, 13);
    },
    live(p, d) { return 'Q = I \\times t = ' + p.I + ' \\times ' + p.t + ' \\times 60 = ' + q(d.Q, 'C', 5); },
    results(p, d) { return [['كمية الشحنة', q(d.Q, 'C', 5), true, 'pos'], ['الزمن بالثواني', q(p.t * 60, 's', 5), true], ['عدد الإلكترونات', ML.phys.sci(d.N, 3), true]]; },
    steps(p, d) { return ['الزمن = ' + p.t + ' × 60 = ' + p.t * 60 + ' ث.', 'Q = I × t = ' + p.I + ' × ' + p.t * 60 + ' = ' + n(d.Q) + ' C.', 'عدد الإلكترونات = ' + n(d.Q) + ' × 6.25 × 10¹⁸.']; },
    graph(p, d) { return { view: { xmin: 0, xmax: 60, ymin: 0, ymax: Math.max(10, p.I * 3600 * 1.1) }, xLabel: 't (دقيقة)', yLabel: 'Q (C)', caption: 'الشحنة تتناسب طردياً مع الزمن عند ثبوت التيار، والميل = I × 60.', draw(G) { const c = G.colors(); G.fn((t) => p.I * t * 60, { color: c.c1, width: 3, domain: [0, 60] }); G.point(p.t, d.Q, { color: c.c2 }); } }; },
    explain(a, b) { const o = []; if (a.I !== b.I) o.push('تيار أكبر يعني شحنة أكبر تمر في الثانية.'); if (a.t !== b.t) o.push('مضاعفة الزمن تضاعف الشحنة المارة.'); return o; },
    learn: ['**ص 56:** تقاس كمية الشحنة بوحدة الكولوم نسبة إلى العالم الفرنسي تشارلز كولوم (1736–1806م)، وشدة التيار بالأمبير نسبة إلى أندريه أمبير (1775–1836م).', '**المثال:** 0.5 أمبير مدة 10 دقائق: Q = 0.5 × 10 × 60 = 300 كولوم.'],
    challenges: [
      { q: 'مثال الكتاب: تيار 0.5 أمبير مدة 10 دقائق. أوجد كمية الشحنة.', hint: 'I = 0.5 و t = 10.', init: { I: 1, t: 5 }, check: (p) => Math.abs(p.I - 0.5) < 1e-9 && p.t === 10, why: () => '300 كولوم.' },
      { q: 'اجعل كمية الشحنة المارة 600 كولوم خلال 5 دقائق.', hint: 'I = 600 ÷ 300.', init: { I: 1, t: 5 }, check: (p, d) => p.t === 5 && Math.abs(d.Q - 600) < 1e-6, why: () => 'I = 2 أمبير.' }
    ],
    tutor: [{ q: 'كم إلكتروناً في الكولوم؟', k: ['الكترون', 'كولوم'], a: () => K.tutor('ما شحنة الإلكترون الواحد؟', '1 ÷ (1.6 × 10⁻¹⁹) = 6.25 × 10¹⁸ إلكتروناً.') }]
  });

  /* ======================= نشاط (2): قياس شدة التيار وفرق الجهد ص 58–60 ======================= */
  const RL = 6, RL2 = 12; // مقاومتا المصباحين: نموذج مبسّط
  const APOS = [['a', 'النقطة (أ)'], ['b', 'النقطة (ب)'], ['c', 'النقطة (جـ)'], ['d', 'النقطة (د)']];
  const VPOS = [['bat', 'طرفا البطارية'], ['l1', 'طرفا المصباح الأول (جـ)'], ['l2', 'طرفا المصباح الثاني (د)'], ['both', 'طرفا المصباحين معاً']];
  K.reg({
    id: 'meters-circuit', unit: U, order: 3, lesson: '1-1-1 ، 2-1-1', lessonTitle: 'قياس شدة التيار وفرق الجهد', page: 58,
    titleAr: 'قياس شدة التيار بالأميتر وفرق الجهد بالفولتميتر', titleEn: 'Measuring Current and Potential Difference',
    tags: 'اميتر فولتميتر مقياس متعدد شدة التيار فرق الجهد توالي توازي مصباحان نقاط دارة نشاط 2 جلفانوميتر',
    formula: 'I_a = I_b = I_c = I_d ,\\qquad V_{bat} = V_1 + V_2',
    book: 'نشاط (2) ص 58–60: دارة فيها بطارية ومفتاح ومصباحان متساويان؛ يُقاس التيار في النقاط (أ) و(ب) و(جـ) و(د) والدارة مفتوحة ثم مغلقة، ويقاس فرق الجهد بين طرفي كل مصباح وطرفي المصباحين معاً، ثم يستبدل أحدهما بمصباح مختلف. ص 57–58: يوصل الأميتر على التوالي، والفولتميتر على التوازي.',
    summary: 'في دارة التوالي شدة التيار متساوية في جميع النقاط، وتساوي صفراً إذا فُتحت الدارة. وفرق جهد البطارية يتوزع على المصباحين: المصباح الأكبر مقاومة يأخذ فرق جهد أكبر.',
    vars: [['V', 'فرق جهد البطارية', '\\mathrm{V}', '1.5 – 12'], ['I', 'شدة التيار (الأميتر)', '\\mathrm{A}', '—'], ['V_1, V_2', 'فرق الجهد على المصباحين', '\\mathrm{V}', '—']],
    assumptions: ['مقاومة المصباح 6 أوم، والمصباح المختلف 12 أوم، والأجهزة مثالية (نموذج مبسّط لأغراض التعليم).', 'الكتاب: لا تستخدم فرق جهد أكبر من 12 فولت.'],
    ar: { V_1: 'جـ_١', V_2: 'جـ_٢', V_bat: 'جـ_ب' },
    params: [
      { key: 'm', label: '\\text{الجهاز}', type: 'select', options: [['A', 'أميتر (شدة التيار)'], ['V', 'فولتميتر (فرق الجهد)']], value: 'A' },
      { key: 'pa', label: '\\text{موقع الأميتر}', type: 'select', options: APOS, value: 'a' },
      { key: 'pv', label: '\\text{موقع الفولتميتر}', type: 'select', options: VPOS, value: 'l1' },
      { key: 'V', label: 'V\\ (\\mathrm{V})', min: 1.5, max: 12, step: 1.5, value: 6 },
      { key: 'sw', label: '\\text{المفتاح مغلق}', type: 'toggle', value: true },
      { key: 'diff', label: '\\text{مصباح مختلف في (د)}', type: 'toggle', value: false }
    ],
    compute(p) {
      const R2 = p.diff ? RL2 : RL; const I = p.sw ? p.V / (RL + R2) : 0; const V1 = I * RL, V2 = I * R2;
      const Vr = { bat: p.V, l1: V1, l2: V2, both: V1 + V2 }[p.pv]; return { R2: R2, I: I, V1: V1, V2: V2, read: p.m === 'A' ? I : Vr };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const xL = W * 0.12, xR = W * 0.88, yT = H * 0.28, yB = H * 0.8; const xa = W * 0.36, xb = W * 0.64;
      K.wire(ctx, [[W / 2 - 12, yB], [xL, yB], [xL, yT], [xa - 16, yT]], c); K.wire(ctx, [[xa + 16, yT], [xb - 16, yT]], c); K.wire(ctx, [[xb + 16, yT], [xR, yT], [xR, yB], [W * 0.74, yB]], c);
      K.switchH(ctx, W * 0.74, yB, W * 0.62, p.sw, c); K.wire(ctx, [[W * 0.62, yB], [W / 2 + 12, yB]], c);
      K.lbl(ctx, p.sw ? 'مفتاح مغلق' : 'مفتاح مفتوح', W * 0.68, yB + 26, p.sw ? c.muted : c.c2, c, 11);
      K.battery(ctx, W / 2, yB, true, '', c); K.lbl(ctx, 'V = ' + p.V + ' V', W / 2, yB + 28, c.c2, c, 12);
      const g1 = Math.min(1, d.V1 / 6), g2 = Math.min(1, d.V2 / 6);
      K.bulb(ctx, xa, yT, 15, g1, c, 'جـ'); K.bulb(ctx, xb, yT, 15, g2, c, 'د' + (p.diff ? ' (مختلف)' : ''));
      const pts = { a: [xL, H * 0.55], b: [(xL + xa) / 2, yT], c: [W / 2, yT], d: [(xb + xR) / 2, yT] };
      Object.keys(pts).forEach((k, i) => { const [x, y] = pts[k]; ctx.fillStyle = c.text; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill(); K.lbl(ctx, '(' + ['أ', 'ب', 'جـ', 'د'][i] + ')', x + (k === 'a' ? -18 : 0), y + (k === 'a' ? 0 : 20), c.muted, c, 11); });
      if (p.m === 'A') { const [x, y] = pts[p.pa]; K.meter(ctx, x, y + (p.pa === 'a' ? 0 : -42), 15, 'A', n(d.I, 3) + ' A', c, c.c1); }
      else {
        const span = { bat: [W / 2 - 20, W / 2 + 20, yB - 50], l1: [xa - 22, xa + 22, yT - 50], l2: [xb - 22, xb + 22, yT - 50], both: [xa - 22, xb + 22, yT - 70] }[p.pv];
        ctx.strokeStyle = c.c4; ctx.lineWidth = 1.6; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(span[0], p.pv === 'bat' ? yB : yT); ctx.lineTo(span[0], span[2]); ctx.lineTo(span[1], span[2]); ctx.lineTo(span[1], p.pv === 'bat' ? yB : yT); ctx.stroke(); ctx.setLineDash([]);
        K.meter(ctx, (span[0] + span[1]) / 2, span[2], 15, 'V', n(d.read, 3) + ' V', c, c.c4);
      }
    },
    live(p, d) { return p.m === 'A' ? 'I = \\frac{V}{R_1 + R_2} = ' + q(d.I, 'A', 3) : 'V_1 + V_2 = ' + n(d.V1) + ' + ' + n(d.V2) + ' = ' + q(d.V1 + d.V2, 'V', 3); },
    results(p, d) { return [['قراءة الجهاز', p.m === 'A' ? q(d.I, 'A', 3) : q(d.read, 'V', 3), true, 'pos'], ['التيار في النقاط الأربع', q(d.I, 'A', 3), true], ['جهد المصباح الأول', q(d.V1, 'V', 3), true], ['جهد المصباح الثاني', q(d.V2, 'V', 3), true]]; },
    steps(p, d) { return ['الأميتر يوصل على التوالي وقطبه الموجب نحو القطب الموجب للبطارية.', 'التيار متساوٍ في (أ) و(ب) و(جـ) و(د) = ' + n(d.I, 3) + ' أمبير' + (p.sw ? '.' : ' لأن الدارة مفتوحة.'), 'الفولتميتر يوصل على التوازي: جهد المصباحين معاً = جهد البطارية = ' + n(d.V1 + d.V2, 3) + ' فولت.']; },
    graph(p, d) { const v = [p.V, d.V1, d.V2]; return { view: { xmin: 0, xmax: 3, ymin: 0, ymax: 13 }, xLabel: '', yLabel: 'V (V)', caption: 'جهد البطارية يتوزع على المصباحين، والمصباح الأكبر مقاومة يأخذ جهداً أكبر.', draw(G) { const c = G.colors(); K.bars(G, [['V', v[0], c.c2], ['V₁', v[1], c.c1], ['V₂', v[2], c.c4]]); } }; },
    explain(a, b, da, db) { const o = []; if (a.pa !== b.pa && b.m === 'A') o.push('قراءة الأميتر لا تتغير بتغيير موقعه: التيار نفسه في كل نقاط دارة التوالي.'); if (a.sw !== b.sw) o.push(b.sw ? 'أُغلقت الدارة فسرى التيار.' : 'فُتحت الدارة فأصبح التيار صفراً في جميع النقاط.'); if (a.diff !== b.diff) o.push('المصباح المختلف تغيّرت مقاومته فتغيّر توزيع الجهد وإضاءة المصباحين.'); return o; },
    learn: ['**فرق الجهد (ص 57):** التفاعلات الكيميائية في البطارية تولّد فرق جهد بين قطبيها، فتكتسب الشحنات طاقة تسري بها في مسار مغلق. يقاس بالفولتميتر بوحدة الفولت نسبة إلى العالم الإيطالي أليساندرو فولتا.', '**الأجهزة:** الأميتر لشدة التيار (والجلفانوميتر للتيارات الضعيفة)، والفولتميتر لفرق الجهد، ويستعاض عنهما بالمقياس المتعدد الرقمي.'],
    challenges: [
      { q: 'قارن شدة التيار في النقطتين (أ) و(د): انقل الأميتر إلى (د).', hint: 'موقع الأميتر = (د).', init: { m: 'A', pa: 'a', sw: true }, check: (p) => p.m === 'A' && p.pa === 'd' && p.sw, why: (p, d) => 'القراءة نفسها: ' + n(d.I, 3) + ' أمبير.' },
      { q: 'قس فرق الجهد بين طرفي **المصباحين معاً** وقارنه بجهد البطارية.', hint: 'الفولتميتر على المصباحين معاً.', init: { m: 'A', pv: 'l1' }, check: (p) => p.m === 'V' && p.pv === 'both' },
      { q: 'استبدل المصباح (د) بمصباح مختلف وقس فرق الجهد بين طرفيه.', hint: 'فعّل المصباح المختلف ثم الفولتميتر على (د).', init: { m: 'V', pv: 'l1', diff: false }, check: (p) => p.diff && p.m === 'V' && p.pv === 'l2' }
    ],
    tutor: [
      { q: 'لماذا يوصل الأميتر على التوالي؟', k: ['اميتر', 'التوالي'], a: () => K.tutor('هل يجب أن يمر التيار نفسه في الجهاز؟', 'ليمر فيه التيار نفسه المار في الدارة.') },
      { q: 'أي جزء يزود الطاقة وأيها يستهلكها؟', k: ['يزود', 'يستهلك', 'الطاقه'], a: () => K.tutor('من أين تكتسب الشحنات طاقتها؟', 'البطارية تزود الطاقة، والمصباحان يستهلكانها.') }
    ]
  });

  /* ======================= 3-1 الصعقة الكهربائية ص 61–62 ======================= */
  const SKIN = { dry: ['جلد جاف', 500000], wet: ['جلد مبلل', 1000] };
  const effect = (I) => (I < 0.001 ? 'ربما لن تشعر به' : I < 0.015 ? 'إحساس بالتيار' : I <= 0.02 ? 'ألم الصدمة، وقد تفقد السيطرة على بعض العضلات' : I < 0.1 ? 'خطر: قد يسبب الحرق أو تدمير القلب' : 'قد يكون مميتاً');
  K.reg({
    id: 'electric-shock', unit: U, order: 4, lesson: '3-1', lessonTitle: 'الصعقة الكهربائية', page: 61,
    titleAr: 'الصعقة الكهربائية: لماذا الماء والجلد المبلل خطر؟', titleEn: 'Electric Shock and Skin Resistance',
    tags: 'صعقه كهربائيه جلد جاف مبلل مقاومه 500000 اوم تيار مميت 0.1 امبير سلامه قانون اوم',
    formula: 'I = \\frac{V}{R}',
    book: 'ص 61: تتوقف خطورة الصعقة على فرق الجهد وشدة التيار؛ تيار 0.001 أمبير ربما لن تشعر به، وبين 0.015 و0.020 أمبير ستشعر بألم الصدمة أو تفقد السيطرة على بعض العضلات، وكمية أكبر قد تؤدي إلى الحرق أو تدمير القلب، و0.1 أمبير قد يكون مميتاً. ص 65: تقدر مقاومة جلد الإنسان الجاف بنحو 500000 أوم.',
    summary: 'التيار المار في الجسم = فرق الجهد ÷ مقاومة الجسم. مقاومة الجلد الجاف كبيرة جداً، لكنها تقل كثيراً عندما يكون الجلد مبللاً، فيزداد التيار ويصبح خطراً حتى على الجهد المنزلي.',
    vars: [['V', 'فرق الجهد', '\\mathrm{V}', '1 – 240'], ['R', 'مقاومة الجسم', '\\Omega', 'جاف 500000'], ['I', 'التيار المار في الجسم', '\\mathrm{A}', '—']],
    assumptions: ['مقاومة الجلد المبلل 1000 أوم نموذج مبسّط لأغراض التعليم؛ الكتاب يذكر الجلد الجاف فقط.', 'المجال بين 0.001 و0.015 أمبير غير مفصّل في الكتاب.'],
    params: [
      { key: 'V', label: 'V\\ (\\mathrm{V})', min: 1, max: 240, step: 1, value: 220 },
      { key: 'skin', label: '\\text{الجلد}', type: 'select', options: Object.keys(SKIN).map((k) => [k, SKIN[k][0]]), value: 'dry' }
    ],
    compute(p) { const R = SKIN[p.skin][1]; const I = p.V / R; return { R: R, I: I, eff: effect(I) }; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = K.narrow(W); const cx = W * 0.35, top = H * 0.18;
      ctx.strokeStyle = c.text; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, top + 16, 16, 0, Math.PI * 2); ctx.moveTo(cx, top + 32); ctx.lineTo(cx, top + 110); ctx.moveTo(cx, top + 50); ctx.lineTo(cx + 60, top + 36); ctx.moveTo(cx, top + 50); ctx.lineTo(cx - 40, top + 80); ctx.moveTo(cx, top + 110); ctx.lineTo(cx - 24, top + 170); ctx.moveTo(cx, top + 110); ctx.lineTo(cx + 24, top + 170); ctx.stroke();
      if (p.skin === 'wet') for (let i = 0; i < 6; i++) { ctx.fillStyle = 'rgba(56,189,248,.8)'; ctx.beginPath(); ctx.arc(cx - 30 + i * 12, top + 60 + (i % 3) * 30, 3, 0, Math.PI * 2); ctx.fill(); }
      const danger = d.I >= 0.015; const col = d.I >= 0.1 ? '#dc2626' : danger ? '#f97316' : '#16a34a';
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx + 60, top + 36); ctx.lineTo(W * 0.8, top + 36); ctx.stroke();
      K.lbl(ctx, 'سلك ' + p.V + ' V', W * 0.72, top + 18, c.c2, c, 12);
      if (d.I > 0.0005) { ctx.strokeStyle = col; ctx.lineWidth = 2 + Math.min(6, d.I * 40); ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.moveTo(cx + 58, top + 38); ctx.lineTo(cx, top + 70); ctx.lineTo(cx + 22, top + 168); ctx.stroke(); ctx.setLineDash([]); }
      K.lbl(ctx, 'I = ' + ML.phys.sct(d.I, 3) + ' A', W * 0.72, H * 0.55, col, c, nar ? 14 : 17, '800');
      B2(ctx, W * 0.72, H * 0.7, Math.min(W * 0.4, 260), d.eff, col, c);
    },
    live(p, d) { return 'I = \\frac{V}{R} = \\frac{' + p.V + '}{' + d.R + '} = ' + K.q(d.I, 'A', 3); },
    results(p, d) { return [['مقاومة الجسم', q(d.R, '\\Omega', 3), true], ['التيار المار', q(d.I, 'A', 3), true, d.I >= 0.015 ? 'neg' : 'pos'], ['الأثر (من الكتاب)', d.eff, false]]; },
    steps(p, d) { return ['I = V ÷ R = ' + p.V + ' ÷ ' + d.R + ' = ' + ML.phys.sct(d.I, 3) + ' أمبير.', 'الأثر: ' + d.eff + '.']; },
    graph(p, d) { const R = d.R; const ymax = Math.max(0.12, 240 / R * 1.1); return { view: { xmin: 0, xmax: 240, ymin: 0, ymax: ymax }, xLabel: 'V (V)', yLabel: 'I (A)', caption: 'الخطان الأفقيان: 0.015 أمبير (ألم وفقدان السيطرة على العضلات) و0.1 أمبير (قد يكون مميتاً).', draw(G) { const c = G.colors(); G.hline(0.015, { color: c.c4, dash: [5, 4] }); G.hline(0.1, { color: c.c2, dash: [5, 4] }); G.fn((v) => v / R, { color: c.c1, width: 3, domain: [0, 240] }); G.point(p.V, d.I, { color: c.c2 }); } }; },
    explain(a, b, da, db) { const o = []; if (a.skin !== b.skin) o.push(b.skin === 'wet' ? 'الماء يقلل مقاومة الجلد كثيراً فيزداد التيار المار في الجسم.' : 'الجلد الجاف مقاومته كبيرة (نحو 500000 أوم) فيقل التيار.'); if (da.eff !== db.eff) o.push('الأثر الآن: ' + db.eff + '.'); return o; },
    learn: ['**ص 61:** تغطى أسلاك الكهرباء بمادة بلاستيكية عازلة، لكن هذه الأسلاك قد تنقطع أو تحترق المادة العازلة فيجد التيار مساراً غير متوقع عبر جسم من يلمسها.', '**فكّر (الشكل 6):** سيارة علقت في الثلج وقد تقطعت خطوط الكهرباء: ماذا تنصح السائق؟', '**ابحث:** تستخدم الصعقات الكهربائية في مجال الطب لإنقاذ حياة الإنسان.'],
    challenges: [
      { q: 'على جهد البيت 220 فولت، قارن الجلد الجاف بالمبلل: اختر الحالة الخطرة.', hint: 'الجلد المبلل.', init: { V: 220, skin: 'dry' }, check: (p, d) => p.V === 220 && d.I >= 0.1 },
      { q: 'بالجلد المبلل، ما أعلى جهد يبقى معه التيار أقل من 0.015 أمبير؟', hint: 'V = I × R = 0.015 × 1000.', init: { V: 220, skin: 'wet' }, check: (p, d) => p.skin === 'wet' && p.V === 14, why: () => '14 فولت تعطي 0.014 أمبير، و15 فولت تعطي 0.015 أمبير.' }
    ],
    tutor: [{ q: 'لماذا يجب ألا نلمس الأجهزة بأيدٍ مبللة؟', k: ['مبلل', 'ماء', 'يد'], a: () => K.tutor('ماذا يفعل الماء بمقاومة الجلد؟', 'الماء يقلل المقاومة فيزداد التيار المار في الجسم وقد يكون مميتاً.') }]
  });
  // فقرة نصية على الرسم
  function B2(ctx, x, y, w, t, col, c) { ML.bio.para(ctx, D, t, x, y, w, { color: col, size: 13, w: '800' }); }
})(typeof window !== 'undefined' ? window : globalThis);
