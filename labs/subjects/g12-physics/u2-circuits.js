/* فيزياء الثاني عشر — الوحدة الثانية، الفصل 5: دارات التيار المستمر (ص72–93) */
(function (root) {
  'use strict';
  const ML = root.ML; const D = ML.pdraw; const Q = ML.phys12; const K = ML.p12;
  const n = K.n, q = K.q;
  const lbl = (ctx, t, x, y, color, cols, size) => D.txt(ctx, t, x, y, { color: color || cols.text, size: size || 12, w: '700', halo: cols.bg });

  /* ======================= 2-5 معادلة الدارة البسيطة ص73–75 ======================= */
  K.reg({
    id: 'simple-circuit', unit: 5, order: 1, lesson: '2-5', lessonTitle: 'معادلة الدارة الكهربائية البسيطة', page: 74,
    titleAr: 'معادلة الدارة الكهربائية البسيطة وتوزيع التيار', titleEn: 'Simple Circuit Equation', tags: 'دارة بسيطة قوة دافعة مقاومة داخلية توازي توالي تيار مثال 1 قدرة داخلة مستنفدة',
    formula: 'I = \\frac{\\sum \\varepsilon}{\\sum R} ,\\qquad \\varepsilon I = I^2 r + I^2 R',
    book: 'القوانين (5-1) و(5-2) و(5-3) ص73–74. مثال (1) ص74–75: بطارية 12 V مع 3 Ω على التوالي ومجموعة (4 و48 و16 Ω) على التوازي ⇒ I = 2 A ، I₁ = 1.5 A ، I₂ = 1/8 A ، I₃ = 3/8 A.',
    summary: 'القدرة التي تعطيها البطارية εI تُستنفد حرارةً في المقاومة الداخلية والمقاومات الخارجية، ومن حفظ الطاقة نحصل على معادلة الدارة البسيطة I = Σε/ΣR. يتوزع التيار في المقاومات المتوازية عكسياً مع مقاوماتها.',
    vars: [['\\varepsilon', 'القوة الدافعة للبطارية', '\\mathrm{V}', '1 – 24'], ['r', 'المقاومة الداخلية', '\\Omega', '0 – 2'], ['R_s', 'المقاومة على التوالي', '\\Omega', '1 – 20'], ['R_1, R_2, R_3', 'المقاومات المتوازية', '\\Omega', '1 – 60']],
    assumptions: ['أسلاك التوصيل بلا مقاومة.'],
    params: [
      { key: 'e', label: '\\varepsilon\\ (\\mathrm{V})', min: 1, max: 24, step: 1, value: 12 },
      { key: 'r', label: 'r\\ (\\Omega)', min: 0, max: 2, step: 0.1, value: 0 },
      { key: 'Rs', label: 'R_s\\ (\\Omega)', min: 1, max: 20, step: 1, value: 3 },
      { key: 'R1', label: 'R_1\\ (\\Omega)', min: 1, max: 60, step: 1, value: 4 },
      { key: 'R2', label: 'R_2\\ (\\Omega)', min: 1, max: 60, step: 1, value: 24 },
      { key: 'R3', label: 'R_3\\ (\\Omega)', min: 1, max: 60, step: 1, value: 16 }
    ],
    compute(p) {
      const Rp = Q.parallel([p.R1, p.R2, p.R3]); const SR = p.r + p.Rs + Rp; const I = Q.loopCurrent(p.e, SR); const Vp = I * Rp;
      return { Rp: Rp, SR: SR, I: I, Vp: Vp, I1: Vp / p.R1, I2: Vp / p.R2, I3: Vp / p.R3, Pin: p.e * I, Pout: I * I * SR };
    },
    live(p, d) { return 'I = \\frac{\\sum\\varepsilon}{\\sum R} = \\frac{' + p.e + '}{' + p.r + ' + ' + p.Rs + ' + ' + n(d.Rp) + '} = ' + q(d.I, 'A', 4); },
    results(p, d) { return [['مكافئة التوازي', q(d.Rp, '\\Omega', 4)], ['التيار الكلي I', q(d.I, 'A', 4), true, 'pos'], ['I₁ ، I₂ ، I₃', ML.phys.sci(d.I1, 4) + ' ,\\ ' + ML.phys.sci(d.I2, 4) + ' ,\\ ' + ML.phys.sci(d.I3, 4) + '\\ \\mathrm{A}'], ['القدرة الداخلة εI', q(d.Pin, 'W', 4)], ['القدرة المستنفدة I²ΣR', q(d.Pout, 'W', 4)]]; },
    steps(p, d) { return ['1/R = 1/' + p.R1 + ' + 1/' + p.R2 + ' + 1/' + p.R3 + ' ⇒ R = ' + n(d.Rp) + ' Ω.', 'ΣR = ' + p.r + ' + ' + p.Rs + ' + ' + n(d.Rp) + ' = ' + n(d.SR) + ' Ω.', 'I = Σε/ΣR = ' + p.e + ' ÷ ' + n(d.SR) + ' = ' + n(d.I) + ' A.', 'جهد التوازي = ' + n(d.Vp) + ' V ⇒ I₁ = ' + n(d.I1) + ' ، I₂ = ' + n(d.I2) + ' ، I₃ = ' + n(d.I3) + ' A.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const xL = W * 0.1, xR = W * 0.9, yT = H * 0.38, yB = H * 0.85; const xm = xL + (xR - xL) * 0.4;
      K.wire(ctx, [[xL, yT], [xL, yB], [W / 2 - 10, yB]], cols); K.wire(ctx, [[W / 2 + 10, yB], [xR, yB], [xR, yT]], cols); K.battery(ctx, W / 2, yB, true, 'ε = ' + p.e + ' V, r = ' + p.r + ' Ω', cols);
      K.resistor(ctx, xL, yT, xm, yT, 'Rs = ' + p.Rs + ' Ω', cols, cols.c4);
      const x0 = xm, x1 = xR; K.wire(ctx, [[x0, yT - 75], [x0, yT + 75]], cols); K.wire(ctx, [[x1, yT - 75], [x1, yT + 75]], cols);
      [[p.R1, d.I1, cols.c1], [p.R2, d.I2, cols.c2], [p.R3, d.I3, cols.c3]].forEach(([R, I, c], i) => K.resistor(ctx, x0 + 12, yT - 75 + 75 * i, x1 - 12, yT - 75 + 75 * i, R + ' Ω : ' + n(I, 3) + ' A', cols, c));
      [[x0, x0 + 12], [x1 - 12, x1]].forEach(([a, b]) => [0, 1, 2].forEach((i) => K.wire(ctx, [[a, yT - 75 + 75 * i], [b, yT - 75 + 75 * i]], cols)));
      D.arrow(ctx, xL - 14, yB - 30, xL - 14, yT + 30, cols.c2, 2.5); lbl(ctx, 'I = ' + n(d.I, 3) + ' A', W / 2, H * 0.07, cols.text, cols, K.narrow(W) ? 13 : 15);
    },
    graph(p, d) { const v = [d.I, d.I1, d.I2, d.I3]; return { view: K.barView(v), xLabel: '', yLabel: 'I (A)', caption: 'التيار الكلي يساوي مجموع تيارات الفروع المتوازية، والفرع ذو المقاومة الأصغر يأخذ تياراً أكبر.', draw(G) { const c = G.colors(); K.bars(G, [['I', d.I, c.c4], ['I₁', d.I1, c.c1], ['I₂', d.I2, c.c2], ['I₃', d.I3, c.c3]]); } }; },
    explain(a, b, da, db) { const o = []; if (a.r !== b.r) o.push('زيادة المقاومة الداخلية تقلل التيار وتستنفد جزءاً أكبر من قدرة البطارية داخلها.'); if (a.e !== b.e) o.push('التيار يتناسب طردياً مع القوة الدافعة عند ثبوت المقاومات.'); return o; },
    learn: ['**القوة الدافعة (5-1) ص73:** ε = ΔW/ΔQ، الشغل الذي تبذله البطارية لنقل وحدة الشحنات الموجبة داخلها، وتقاس بالفولت.', '**(5-2):** القدرة التي تعطيها البطارية P = εI.', '**(5-3) ص74:** من حفظ الطاقة εI = I²r + I²R ⇒ I = Σε/ΣR؛ البطارية المعاكسة لاتجاه التيار تُطرح قوتها الدافعة.'],
    challenges: [
      { q: 'مثال (1): بطارية 12 V (r = 0) مع 3 Ω، ثم 4 و48 و16 Ω على التوازي. أوجد تيار كل مقاومة.', hint: 'اضبط R₂ = 48.', init: { e: 12, r: 0, Rs: 3, R1: 4, R2: 24, R3: 16 }, check: (p) => p.e === 12 && p.r === 0 && p.Rs === 3 && p.R1 === 4 && p.R2 === 48 && p.R3 === 16, why: () => 'I = 2 A ، I₁ = 1.5 A ، I₂ = 1/8 A ، I₃ = 3/8 A.' },
      { q: 'بالبطارية 12 V اجعل التيار الكلي 3 A تماماً.', hint: 'ΣR يجب أن تساوي 4 Ω.', init: { e: 12, r: 0, Rs: 3, R1: 4, R2: 24, R3: 16 }, check: (p, d) => p.e === 12 && Math.abs(d.I - 3) < 1e-9, why: () => 'ΣR = 12/3 = 4 Ω، مثلاً Rs = 1 مع توازٍ مكافئته 3 Ω.' }
    ],
    tutor: [
      { q: 'لماذا القدرة الداخلة تساوي المستنفدة؟', k: ['قدره', 'داخله', 'مستنفده'], a: () => K.tutor('ما المبدأ الذي يحكم تحولات الطاقة؟', 'حفظ الطاقة: ما تعطيه البطارية يتحول حرارةً في المقاومات.') },
      { q: 'كيف يتوزع التيار في التوازي؟', k: ['يتوزع', 'توازي'], a: () => K.tutor('ما الكمية المتساوية في الفروع المتوازية؟', 'الجهد متساوٍ، فالتيار I = V/R أكبر في المقاومة الأصغر.') },
      { q: 'ما المقاومة الداخلية؟', k: ['داخليه'], a: () => K.tutor('هل البطارية نفسها موصل مثالي؟', 'مقاومة مواد البطارية التي تستنفد جزءاً من طاقتها حرارةً.') }
    ]
  });

  /* ======================= 3-5 فرق الجهد بين نقطتين ص76–78 ======================= */
  K.reg({
    id: 'potential-loop', unit: 5, order: 2, lesson: '3-5', lessonTitle: 'فرق الجهد بين نقطتين في دارة كهربائية', page: 77,
    titleAr: 'تغيرات الجهد عبر حلقة مغلقة', titleEn: 'Potential Changes Around a Loop', tags: 'فرق جهد نقطتين تغير الجهد حلقة مسار مغلق بطاريتان متعاكستان مثال 3 مثال 4 مثال 6 قانون 5-4',
    formula: 'V_a + \\sum \\Delta V_{ab} = V_b ,\\qquad \\Delta V = \\mp IR ,\\ \\pm\\varepsilon',
    book: 'القانون (5-4) وقواعد الإشارات ص76–77. مثال (3) ص77: بطاريتان 12 V و9 V متعاكستان ومقاومات 10 و(5+6) و3 Ω ⇒ I = 0.125 A ، وتغيرات الجهد −1.25 ، −9 ، −1.375 ، +12 ، −0.375 V ومجموعها صفر.',
    summary: 'عند العبور في مقاومة باتجاه التيار يقل الجهد بمقدار IR، وبعكسه يزداد. وعند العبور في بطارية من السالب إلى الموجب يزداد الجهد بمقدار ε. مجموع التغيرات عبر مسار مغلق يساوي صفراً.',
    vars: [['\\varepsilon_1', 'البطارية بين d و w', '\\mathrm{V}', '1 – 24'], ['\\varepsilon_2', 'البطارية بين b و h (معاكسة)', '\\mathrm{V}', '0 – 24'], ['R_{ab}, R_{hd}, R_{wa}', 'المقاومات', '\\Omega', '1 – 20'], ['I', 'التيار', '\\mathrm{A}', '—']],
    assumptions: ['المقاومات الداخلية للبطاريات مضمّنة في مقاومات الفروع.', 'نبدأ المسار من النقطة a ونعدّ جهدها صفراً.'],
    params: [
      { key: 'e1', label: '\\varepsilon_1\\ (\\mathrm{V})', min: 1, max: 24, step: 1, value: 12 },
      { key: 'e2', label: '\\varepsilon_2\\ (\\mathrm{V})', min: 0, max: 24, step: 1, value: 6 },
      { key: 'Ra', label: 'R_{ab}\\ (\\Omega)', min: 1, max: 20, step: 1, value: 10 },
      { key: 'Rb', label: 'R_{hd}\\ (\\Omega)', min: 1, max: 20, step: 1, value: 11 },
      { key: 'Rc', label: 'R_{wa}\\ (\\Omega)', min: 1, max: 20, step: 1, value: 3 }
    ],
    compute(p) {
      const SR = p.Ra + p.Rb + p.Rc; const I = (p.e1 - p.e2) / SR;
      const dV = [['a→b', -I * p.Ra], ['b→h', -p.e2], ['h→d', -I * p.Rb], ['d→w', p.e1], ['w→a', -I * p.Rc]];
      let v = 0; const pts = [['a', 0]]; dV.forEach(([lab, x]) => { v += x; pts.push([lab.slice(-1), v]); });
      return { SR: SR, I: I, dV: dV, pts: pts, sum: dV.reduce((s, x) => s + x[1], 0) };
    },
    live(p, d) { return 'I = \\frac{' + p.e1 + ' - ' + p.e2 + '}{' + d.SR + '} = ' + q(d.I, 'A', 4) + ' ,\\quad \\sum\\Delta V = ' + n(Math.abs(d.sum) < 1e-12 ? 0 : d.sum); },
    results(p, d) { return [['التيار I', q(d.I, 'A', 4), true, 'pos']].concat(d.dV.map(([lab, x]) => ['ΔV ' + lab, q(x, 'V', 4)])).concat([['المجموع عبر المسار المغلق', '0\\ \\mathrm{V}', true, 'pos']]); },
    steps(p, d) { return ['ΣR = ' + p.Ra + ' + ' + p.Rb + ' + ' + p.Rc + ' = ' + d.SR + ' Ω.', 'I = (ε₁ − ε₂)/ΣR = (' + p.e1 + ' − ' + p.e2 + ') ÷ ' + d.SR + ' = ' + n(d.I, 4) + ' A' + (d.I < 0 ? ' (السالب: التيار عكس الاتجاه المفترض).' : '.'), 'ΣΔV = ' + d.dV.map((x) => n(x[1], 4)).join(' + ') + ' = 0.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const xL = W * 0.14, xR = W * 0.86, yT = H * 0.22, yB = H * 0.8, yM = (yT + yB) / 2;
      K.resistor(ctx, xL, yT, xR, yT, 'R = ' + p.Ra + ' Ω', cols, cols.c1);
      K.wire(ctx, [[xR, yT], [xR, yM - 14]], cols); K.battery(ctx, xR, yM - 4, false, 'ε₂ = ' + p.e2 + ' V', cols); K.wire(ctx, [[xR, yM + 6], [xR, yB]], cols);
      K.resistor(ctx, xR, yB, xL, yB, 'R = ' + p.Rb + ' Ω', cols, cols.c1);
      K.wire(ctx, [[xL, yB], [xL, yB - 50]], cols); ctx.save(); ctx.translate(xL, yB - 60); ctx.rotate(Math.PI); K.battery(ctx, 0, 0, false, '', cols); ctx.restore(); lbl(ctx, 'ε₁ = ' + p.e1 + ' V', xL + 46, yB - 60, cols.c2, cols);
      K.wire(ctx, [[xL, yB - 70], [xL, yM]], cols); K.resistor(ctx, xL, yM, xL, yT, p.Rc + ' Ω', cols, cols.c1);
      [['a', xL, yT], ['b', xR, yT], ['h', xR, yB], ['d', xL, yB], ['w', xL, yM]].forEach(([t, x, y]) => { ctx.fillStyle = cols.text; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); lbl(ctx, t, x + (x < W / 2 ? -14 : 14), y - 12, cols.c5, cols, 14); });
      const cw = d.I >= 0; D.arrow(ctx, W / 2 + (cw ? -30 : 30), yT - 22, W / 2 + (cw ? 30 : -30), yT - 22, cols.c2, 3); lbl(ctx, 'I = ' + n(Math.abs(d.I), 4) + ' A', W / 2, yT - 40, cols.c2, cols, 13);
      D.txt(ctx, 'ΣΔV = 0', W / 2, yM, { color: cols.c3, size: 16, w: '700' });
    },
    graph(p, d) { const vs = d.pts.map((x) => x[1]); const lo = Math.min(...vs), hi = Math.max(...vs); return { view: { xmin: -0.3, xmax: 5.3, ymin: lo - 2, ymax: hi + 2 }, xLabel: 'a → b → h → d → w → a', yLabel: 'V (V)', caption: 'الجهد عند كل نقطة بدءاً من Vₐ = 0: يعود المسار إلى الصفر (القانون الثاني لكيرتشوف).', draw(G) { const c = G.colors(); for (let i = 0; i < 5; i++) G.segment(i, vs[i], i + 1, vs[i + 1], { color: c.c1, width: 3 }); d.pts.forEach(([t, v], i) => { G.point(i, v, { color: c.c2 }); G.text(i, v, t, { color: c.c5, dy: -12, align: 'center', bold: true }); }); G.hline(0, { color: c.muted, dash: [5, 4] }); } }; },
    explain(a, b, da, db) { const o = []; if (a.e2 !== b.e2) o.push('البطارية المعاكسة تُطرح من القوة الدافعة الكلية، فيتغير التيار.'); return o; },
    learn: ['**(5-4) ص76:** Vₐ + ΣΔV_ab = V_b، ونحسب ΔV في اتجاه الحركة.', '**الإشارات ص76–77:** مقاومة مع التيار −IR، وعكسه +IR؛ بطارية من − إلى + : +ε، ومن + إلى − : −ε.', 'عند الرجوع إلى نقطة البداية مجموع التغيرات صفر، وهذا هو القانون الثاني لكيرتشوف (حفظ الطاقة).'],
    challenges: [
      { q: 'مثال (3): أعد قيم الكتاب (12 V و9 V ومقاومات 10 و11 و3 Ω) وأوجد التيار وتغيرات الجهد.', hint: 'اضبط ε₂ = 9.', init: { e1: 12, e2: 6, Ra: 10, Rb: 11, Rc: 3 }, check: (p) => p.e1 === 12 && p.e2 === 9 && p.Ra === 10 && p.Rb === 11 && p.Rc === 3, why: () => 'I = 0.125 A، والتغيرات −1.25 ، −9 ، −1.375 ، +12 ، −0.375 V ومجموعها صفر.' },
      { q: 'اجعل التيار في الحلقة صفراً.', hint: 'متى تلغي البطاريتان بعضهما؟', init: { e1: 12, e2: 6 }, check: (p, d) => Math.abs(d.I) < 1e-12, why: () => 'ε₁ = ε₂ فتكون Σε = 0.' }
    ],
    tutor: [
      { q: 'ما إشارة التغير في الجهد عبر المقاومة؟', k: ['اشاره', 'مقاومه'], a: () => K.tutor('هل تعبر المقاومة مع اتجاه التيار أم عكسه؟', 'مع التيار −IR (من الجهد العالي إلى المنخفض)، وعكسه +IR.') },
      { q: 'لماذا مجموع التغيرات في الجهد صفر؟', k: ['مجموع', 'صفر'], a: () => K.tutor('ماذا يحدث عند العودة إلى نقطة البداية نفسها؟', 'النقطة نفسها لها جهد واحد، فمجموع التغيرات صفر (حفظ الطاقة).') },
      { q: 'ماذا يعني التيار السالب؟', k: ['سالب'], a: () => K.tutor('ما الاتجاه الذي افترضته للتيار؟', 'الاتجاه الحقيقي عكس الاتجاه المفترض.') }
    ]
  });

  /* ======================= 4-5 فرق الجهد بين قطبي مصدر ص80–81 ======================= */
  K.reg({
    id: 'terminal-voltage', unit: 5, order: 3, lesson: '4-5', lessonTitle: 'فرق الجهد بين قطبي مصدر كهربائي', page: 81,
    titleAr: 'فرق الجهد بين قطبي البطارية: تفريغ وشحن', titleEn: 'Terminal Voltage of a Battery', tags: 'فرق جهد قطبي بطارية مقاومة داخلية هبوط الجهد شحن تفريغ قوة دافعة مثال 7',
    formula: 'V_{ab} = \\varepsilon - Ir \\ (\\text{تفريغ}) ,\\qquad V_{ab} = \\varepsilon + Ir \\ (\\text{شحن})',
    book: 'ص80–81: البطارية مصدر قوة دافعة على التوالي مع مقاومة داخلية. مثال (7) ص81: بطارية ε = 25 V و r = 0.2 Ω ⇒ 23.4 V عندما تعطي 8 A ، و26.6 V عندما تُشحن بـ 8 A.',
    summary: 'عند التفريغ يكون فرق الجهد بين قطبي البطارية أقل من قوتها الدافعة بمقدار الهبوط في الجهد Ir. وعند الشحن يكون أكبر منها. وعندما يقترب التيار من الصفر (دارة مفتوحة أو فولتميتر) يساوي فرق الجهد القوة الدافعة.',
    vars: [['\\varepsilon', 'القوة الدافعة', '\\mathrm{V}', '1 – 30'], ['r', 'المقاومة الداخلية', '\\Omega', '0 – 2'], ['I', 'التيار', '\\mathrm{A}', '0 – 20'], ['V_{ab}', 'فرق الجهد بين القطبين', '\\mathrm{V}', '—']],
    assumptions: ['المقاومة الداخلية ثابتة.'],
    params: [
      { key: 'mode', label: '\\text{الحالة}', type: 'select', value: 'dis', options: [['dis', 'تفريغ (تعطي تياراً)'], ['ch', 'شحن']] },
      { key: 'e', label: '\\varepsilon\\ (\\mathrm{V})', min: 1, max: 30, step: 0.5, value: 12 },
      { key: 'r', label: 'r\\ (\\Omega)', min: 0, max: 2, step: 0.1, value: 0.5 },
      { key: 'I', label: 'I\\ (\\mathrm{A})', min: 0, max: 20, step: 0.5, value: 4 }
    ],
    compute(p) { const drop = p.I * p.r; return { drop: drop, V: p.mode === 'dis' ? p.e - drop : p.e + drop, Pr: p.I * p.I * p.r }; },
    live(p, d) { return 'V_{ab} = ' + p.e + (p.mode === 'dis' ? ' - ' : ' + ') + p.I + ' \\times ' + p.r + ' = ' + q(d.V, 'V', 4); },
    results(p, d) { return [['فرق الجهد بين القطبين', q(d.V, 'V', 4), true, 'pos'], ['الهبوط في الجهد Ir', q(d.drop, 'V', 4)], ['القدرة المستنفدة في r', q(d.Pr, 'W', 4)], ['المقارنة مع ε', p.I === 0 || p.r === 0 ? 'V = ε' : p.mode === 'dis' ? 'V < ε' : 'V > ε', false]]; },
    steps(p, d) { return [p.mode === 'dis' ? 'التفريغ: التيار باتجاه سهم القوة الدافعة ⇒ V = ε − Ir.' : 'الشحن: التيار بعكس سهم القوة الدافعة ⇒ V = ε + Ir.', 'Ir = ' + p.I + ' × ' + p.r + ' = ' + n(d.drop) + ' V.', 'V = ' + n(d.V) + ' V.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const cx = W / 2, y = H * 0.48, bw = Math.min(W * 0.7, 360);
      ctx.strokeStyle = cols.muted; ctx.setLineDash([6, 5]); ctx.lineWidth = 1.5; D.rr(ctx, cx - bw / 2, y - 45, bw, 90, 12); ctx.stroke(); ctx.setLineDash([]);
      K.wire(ctx, [[cx - bw / 2 - 30, y], [cx - bw / 4 - 8, y]], cols); K.battery(ctx, cx - bw / 4, y, true, 'ε = ' + p.e + ' V', cols); K.wire(ctx, [[cx - bw / 4 + 8, y], [cx + 10, y]], cols);
      K.resistor(ctx, cx + 10, y, cx + bw / 2 + 30, y, 'r = ' + p.r + ' Ω', cols, cols.c4);
      lbl(ctx, 'b', cx - bw / 2 - 40, y, cols.c5, cols, 15); lbl(ctx, 'a', cx + bw / 2 + 40, y, cols.c5, cols, 15);
      const dir = p.mode === 'dis' ? 1 : -1; D.arrow(ctx, cx - 40 * dir, y + 70, cx + 40 * dir, y + 70, cols.c2, 3); lbl(ctx, 'I = ' + p.I + ' A ' + (p.mode === 'dis' ? '(تفريغ)' : '(شحن)'), cx, y + 90, cols.c2, cols, 13);
      D.txt(ctx, 'V_ab = ' + n(d.V) + ' V', cx, H * 0.12, { color: cols.text, size: K.narrow(W) ? 14 : 17, w: '700' });
    },
    graph(p, d) { const Im = 20; return { view: { xmin: 0, xmax: Im, ymin: Math.max(0, p.e - Im * p.r - 2), ymax: p.e + Im * p.r + 2 }, xLabel: 'I (A)', yLabel: 'V_ab (V)', caption: 'تفريغ: V = ε − Ir (ميل سالب يساوي r)، وشحن: V = ε + Ir. عند I = 0 يكون V = ε.', draw(G) { const c = G.colors(); G.fn((I) => p.e - I * p.r, { color: c.c1, width: p.mode === 'dis' ? 3 : 1.5, domain: [0, Im] }); G.fn((I) => p.e + I * p.r, { color: c.c2, width: p.mode === 'ch' ? 3 : 1.5, domain: [0, Im] }); G.hline(p.e, { color: c.muted, dash: [5, 4] }); G.point(p.I, d.V, { color: c.c5 }); } }; },
    explain(a, b, da, db) { const o = []; if (a.mode !== b.mode) o.push(b.mode === 'ch' ? 'عند الشحن يزيد فرق الجهد بين القطبين على القوة الدافعة.' : 'عند التفريغ يقل فرق الجهد عن القوة الدافعة.'); if (a.I !== b.I && b.I === 0) o.push('دون تيار: فرق الجهد يساوي القوة الدافعة (دارة مفتوحة).'); return o; },
    learn: ['**تفريغ ص80:** Vₐb = ε − Ir، والمقدار Ir يسمى الهبوط في الجهد.', '**شحن ص81:** Vₐb = ε + Ir.', 'القوة الدافعة لأي مصدر هي فرق الجهد بين طرفيه عندما تكون الدارة مفتوحة (I = 0).'],
    challenges: [
      { q: 'مثال (7-A): بطارية 25 V و r = 0.2 Ω تعطي 8 A. ما فرق الجهد بين قطبيها؟', hint: 'تفريغ، ε = 25 ، r = 0.2 ، I = 8.', init: { mode: 'dis', e: 12, r: 0.5, I: 4 }, check: (p) => p.mode === 'dis' && p.e === 25 && Math.abs(p.r - 0.2) < 1e-9 && p.I === 8, why: () => '25 − 1.6 = 23.4 V.' },
      { q: 'مثال (7-B): البطارية نفسها تُشحن بتيار 8 A.', hint: 'اختر «شحن».', init: { mode: 'dis', e: 25, r: 0.2, I: 8 }, check: (p) => p.mode === 'ch' && p.e === 25 && Math.abs(p.r - 0.2) < 1e-9 && p.I === 8, why: () => '25 + 1.6 = 26.6 V.' }
    ],
    tutor: [
      { q: 'لماذا يقل فرق الجهد عن القوة الدافعة عند التفريغ؟', k: ['يقل', 'تفريغ'], a: () => K.tutor('أين يُستنفد جزء من طاقة البطارية؟', 'جزء من القوة الدافعة يستنفد حرارةً في المقاومة الداخلية (Ir).') },
      { q: 'متى يساوي فرق الجهد القوة الدافعة؟', k: ['يساوي', 'متى'], a: () => K.tutor('ماذا يحدث للهبوط Ir إذا كان I = 0؟', 'عندما لا يمر تيار (دارة مفتوحة أو فولتميتر مثالي).') },
      { q: 'ما الهبوط في الجهد؟', k: ['هبوط'], a: (p, d) => K.tutor('اضرب التيار في المقاومة الداخلية.', 'Ir = ' + n(d.drop) + ' V.') }
    ]
  });

  /* ======================= 5-5 قياس مقاومة مجهولة ص81–83 ======================= */
  const RG = 50; // مقاومة الجلفانوميتر غير مذكورة في الكتاب
  function bridge(p) {
    const A = [[1 / p.r + 1 / p.R1 + 1 / p.R2, -1 / p.R1, -1 / p.R2], [-1 / p.R1, 1 / p.R1 + 1 / p.R3 + 1 / RG, -1 / RG], [-1 / p.R2, -1 / RG, 1 / p.R2 + 1 / p.R4 + 1 / RG]];
    const [Va, Vc, Ve] = Q.solve(A, [p.e / p.r, 0, 0]); return { Va: Va, Vc: Vc, Ve: Ve, Ig: (Vc - Ve) / RG, I: (p.e - Va) / p.r };
  }
  K.reg({
    id: 'wheatstone', unit: 5, order: 4, lesson: '5-5', lessonTitle: 'قياس مقاومة مجهولة', page: 82,
    titleAr: 'قياس مقاومة مجهولة: قانون أوم وقنطرة ويتستون', titleEn: 'Measuring Resistance: Ohm Method and Wheatstone Bridge', tags: 'مقاومة مجهولة قنطرة ويتستون جلفانوميتر اتزان اميتر فولتميتر قانون اوم مثال 8 مثال 9',
    formula: 'R = \\frac{V}{I} ,\\qquad \\frac{R_1}{R_2} = \\frac{R_3}{R_4}\\ (\\text{اتزان القنطرة})',
    book: 'القانون (5-5) ومثال (8) ص81–82: قراءة الفولتميتر 18 V والأميتر 1.2 A ⇒ R = 15 Ω. قنطرة ويتستون ص82، ومثال (9) ص83: R₂ = 15 ، R₃ = 20 ، R₄ = 60 Ω ⇒ R₁ = 5 Ω عند الاتزان، وتيار البطارية 0.6 A.',
    summary: 'يمكن إيجاد مقاومة مجهولة بقياس فرق الجهد والتيار (قانون أوم)، لكن الفولتميتر يمرر جزءاً صغيراً من التيار. قنطرة ويتستون أدق: نغيّر المقاومة حتى تنعدم قراءة الجلفانوميتر، فيتساوى جهدا نقطتي التوصيل.',
    vars: [['R_1', 'المقاومة المتغيرة/المجهولة', '\\Omega', '0.5 – 30'], ['R_2, R_3, R_4', 'مقاومات معلومة', '\\Omega', '1 – 100'], ['\\varepsilon, r', 'البطارية ومقاومتها', '\\mathrm{V},\\ \\Omega', '12 ، 1.25'], ['I_g', 'تيار الجلفانوميتر', '\\mathrm{A}', '—']],
    assumptions: ['مقاومة الجلفانوميتر 50 Ω (غير مذكورة في الكتاب): ' + Q.SIMPLE + '.', 'في مثال (9) تساوي المقاومة الإضافية مع البطارية 1.25 Ω (من الحل: ΣR = 1.25 + 18.75).'],
    params: [
      { key: 'mode', label: '\\text{الطريقة}', type: 'select', value: 'bridge', options: [['bridge', 'قنطرة ويتستون'], ['ohm', 'قانون أوم (أميتر وفولتميتر)']] },
      { key: 'R1', label: 'R_1\\ (\\Omega)', min: 0.5, max: 30, step: 0.5, value: 10, hidden: (p) => p.mode !== 'bridge' },
      { key: 'R2', label: 'R_2\\ (\\Omega)', min: 1, max: 100, step: 1, value: 15, hidden: (p) => p.mode !== 'bridge' },
      { key: 'R3', label: 'R_3\\ (\\Omega)', min: 1, max: 100, step: 1, value: 20, hidden: (p) => p.mode !== 'bridge' },
      { key: 'R4', label: 'R_4\\ (\\Omega)', min: 1, max: 100, step: 1, value: 60, hidden: (p) => p.mode !== 'bridge' },
      { key: 'e', label: '\\varepsilon\\ (\\mathrm{V})', min: 1, max: 24, step: 1, value: 12, hidden: (p) => p.mode !== 'bridge' },
      { key: 'r', label: 'r\\ (\\Omega)', min: 0.25, max: 5, step: 0.25, value: 1.25, hidden: (p) => p.mode !== 'bridge' },
      { key: 'V', label: 'V\\ (\\mathrm{V})', min: 1, max: 30, step: 0.5, value: 6, hidden: (p) => p.mode !== 'ohm' },
      { key: 'I', label: 'I\\ (\\mathrm{A})', min: 0.1, max: 5, step: 0.1, value: 1, hidden: (p) => p.mode !== 'ohm' }
    ],
    compute(p) { if (p.mode === 'ohm') return { R: p.V / p.I }; const b = bridge(p); b.bal = Math.abs(p.R1 * p.R4 - p.R2 * p.R3) < 1e-9; b.Rx = p.R2 * p.R3 / p.R4; return b; },
    live(p, d) { return p.mode === 'ohm' ? 'R = \\frac{V}{I} = \\frac{' + p.V + '}{' + p.I + '} = ' + q(d.R, '\\Omega', 4) : '\\frac{R_1}{R_2} = \\frac{' + p.R1 + '}{' + p.R2 + '} ,\\quad \\frac{R_3}{R_4} = \\frac{' + p.R3 + '}{' + p.R4 + '} \\Rightarrow I_g = ' + q(d.Ig, 'A', 3); },
    results(p, d) {
      if (p.mode === 'ohm') return [['المقاومة المحسوبة', q(d.R, '\\Omega', 4), true, 'pos'], ['ملاحظة', 'القيمة العملية أقل قليلاً من الحقيقية لأن الفولتميتر يمرر جزءاً من التيار', false]];
      return [['تيار الجلفانوميتر Ig', q(d.Ig, 'A', 3), true, d.bal ? 'pos' : ''], ['حالة القنطرة', d.bal ? 'متزنة' : 'غير متزنة', false, d.bal ? 'pos' : ''], ['R₁ اللازمة للاتزان', q(d.Rx, '\\Omega', 4)], ['تيار البطارية', q(d.I, 'A', 4)]];
    },
    steps(p, d) { return p.mode === 'ohm' ? ['R = V/I = ' + p.V + ' ÷ ' + p.I + ' = ' + n(d.R) + ' Ω.'] : ['شرط الاتزان: R₁/R₂ = R₃/R₄ ⇒ R₁ = R₂R₃/R₄ = ' + p.R2 + '×' + p.R3 + '÷' + p.R4 + ' = ' + n(d.Rx) + ' Ω.', d.bal ? 'متزنة: (R₁ + R₃) ∥ (R₂ + R₄) = ' + n(Q.parallel([p.R1 + p.R3, p.R2 + p.R4])) + ' Ω ، ΣR = ' + n(Q.parallel([p.R1 + p.R3, p.R2 + p.R4]) + p.r) + ' Ω ⇒ I = ' + n(d.I) + ' A.' : 'Ig ≠ 0: غيّر R₁ حتى تنعدم قراءة الجلفانوميتر.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const nr = K.narrow(W);
      if (p.mode === 'ohm') {
        const x0 = W * 0.2, x1 = W * 0.8, y0 = H * 0.35, y1 = H * 0.75;
        K.resistor(ctx, x0, y0, x1, y0, 'R', cols, cols.c1); K.wire(ctx, [[x0, y0], [x0, y1], [W / 2 - 10, y1]], cols); K.wire(ctx, [[W / 2 + 10, y1], [x1, y1], [x1, y0]], cols); K.battery(ctx, W / 2, y1, true, '', cols);
        [['A', x0, (y0 + y1) / 2, p.I + ' A'], ['V', W / 2, y0 - 55, p.V + ' V']].forEach(([t, x, y, v]) => { ctx.fillStyle = cols.bg; ctx.strokeStyle = cols.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); D.txt(ctx, t, x, y, { color: cols.text, size: 14, w: '700' }); lbl(ctx, v, x + (t === 'A' ? 50 : 0), y + (t === 'A' ? 0 : -28), cols.c2, cols, 13); });
        K.wire(ctx, [[W / 2 - 18, y0 - 55], [x0 + 20, y0 - 55], [x0 + 20, y0]], cols); K.wire(ctx, [[W / 2 + 18, y0 - 55], [x1 - 20, y0 - 55], [x1 - 20, y0]], cols);
        D.txt(ctx, 'R = V/I = ' + n(d.R) + ' Ω', W / 2, H * 0.9, { color: cols.text, size: nr ? 14 : 16, w: '700' });
        return;
      }
      const cx = W / 2, ya = H * 0.14, yb = H * 0.74, ym = (ya + yb) / 2, dx = Math.min(W * 0.3, 170);
      const A = [cx, ya], B = [cx, yb], C = [cx - dx, ym], E = [cx + dx, ym];
      K.resistor(ctx, A[0], A[1], C[0], C[1], 'R₁ = ' + p.R1, cols, cols.c2); K.resistor(ctx, C[0], C[1], B[0], B[1], 'R₃ = ' + p.R3, cols); K.resistor(ctx, A[0], A[1], E[0], E[1], 'R₂ = ' + p.R2, cols); K.resistor(ctx, E[0], E[1], B[0], B[1], 'R₄ = ' + p.R4, cols);
      K.wire(ctx, [C, [cx - 24, ym]], cols); K.wire(ctx, [[cx + 24, ym], E], cols);
      ctx.fillStyle = cols.bg; ctx.strokeStyle = cols.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, ym, 24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      const ang = Math.max(-1, Math.min(1, d.Ig / 0.02)) * 1.1; ctx.strokeStyle = d.bal ? cols.c3 : cols.c2; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx, ym + 14); ctx.lineTo(cx + Math.sin(ang) * 20, ym + 14 - Math.cos(ang) * 20); ctx.stroke(); D.txt(ctx, 'G', cx, ym + 34 + 6, { color: cols.text, size: 12, w: '700' });
      K.wire(ctx, [B, [cx, yb + 40], [cx - dx - 40, yb + 40], [cx - dx - 40, ya], A], cols); K.battery(ctx, cx - dx - 40, (ya + yb) / 2 + 60, false, p.e + ' V', cols);
      [['a', A], ['b', B], ['c', C], ['e', E]].forEach(([t, P]) => lbl(ctx, t, P[0] + (t === 'c' ? -14 : t === 'e' ? 14 : 14), P[1] + (t === 'a' ? -8 : t === 'b' ? 10 : 0), cols.c5, cols, 13));
      D.txt(ctx, d.bal ? 'متزنة: Ig = 0' : 'Ig = ' + ML.phys.sct(d.Ig, 3) + ' A', cx, H * 0.94, { color: d.bal ? cols.c3 : cols.c2, size: nr ? 13 : 15, w: '700' });
    },
    graph(p, d) {
      if (p.mode === 'ohm') return { view: { xmin: 0, xmax: 5, ymin: 0, ymax: Math.max(30, d.R * 5) * 1.05 }, xLabel: 'I (A)', yLabel: 'V (V)', caption: 'ميل منحنى V–I يساوي المقاومة.', draw(G) { const c = G.colors(); G.fn((I) => d.R * I, { color: c.c1, width: 3, domain: [0, 5] }); G.point(p.I, p.V, { color: c.c2 }); } };
      const f = (R1) => bridge(Object.assign({}, p, { R1: R1 })).Ig; let mx = 1e-6; for (let R = 0.5; R <= 30; R += 0.5) mx = Math.max(mx, Math.abs(f(R)));
      return { view: { xmin: 0, xmax: 30, ymin: -mx * 1.15, ymax: mx * 1.15 }, xLabel: 'R₁ (Ω)', yLabel: 'I_g (A)', caption: 'تيار الجلفانوميتر ينعدم عند R₁ = R₂R₃/R₄ = ' + n(d.Rx) + ' Ω.', draw(G) { const c = G.colors(); G.fn(f, { color: c.c1, width: 3, domain: [0.5, 30] }); G.hline(0, { color: c.muted }); G.point(p.R1, d.Ig, { color: c.c2 }); } };
    },
    explain(a, b, da, db) { const o = []; if (a.R1 !== b.R1 && db.bal) o.push('انعدمت قراءة الجلفانوميتر: القنطرة متزنة.'); return o; },
    learn: ['**قانون أوم (5-5) ص81:** R = V/I؛ الخطأ يقل باستخدام فولتميتر مقاومته كبيرة جداً.', '**قنطرة ويتستون ص82:** عند الاتزان Ig = 0 فيتساوى جهد النقطتين c و e، ومنه R₁/R₂ = R₃/R₄.'],
    challenges: [
      { q: 'مثال (8): قراءة الفولتميتر 18 V والأميتر 1.2 A. ما المقاومة المجهولة؟', hint: 'اختر «قانون أوم».', init: { mode: 'bridge' }, check: (p) => p.mode === 'ohm' && p.V === 18 && Math.abs(p.I - 1.2) < 1e-9, why: () => 'R = 18/1.2 = 15 Ω.' },
      { q: 'مثال (9): R₂ = 15 و R₃ = 20 و R₄ = 60 Ω. غيّر R₁ حتى تتزن القنطرة.', hint: 'R₁ = R₂R₃/R₄.', init: { mode: 'bridge', R1: 10, R2: 15, R3: 20, R4: 60, e: 12, r: 1.25 }, check: (p, d) => p.mode === 'bridge' && p.R2 === 15 && p.R3 === 20 && p.R4 === 60 && d.bal, why: () => 'R₁ = 5 Ω، وتيار البطارية 12/20 = 0.6 A.' }
    ],
    tutor: [
      { q: 'متى تكون القنطرة متزنة؟', k: ['متزنه', 'اتزان'], a: () => K.tutor('ماذا يقرأ الجلفانوميتر عند الاتزان؟', 'عندما تنعدم قراءة الجلفانوميتر: R₁/R₂ = R₃/R₄.') },
      { q: 'هل R المحسوبة بقانون أوم أكبر أم أقل من الحقيقية؟', k: ['اكبر', 'اقل', 'حقيقيه'], a: () => K.tutor('هل كل تيار الأميتر يمر في المقاومة؟', 'أقل، لأن الأميتر يقيس تيار المقاومة مع التيار الصغير المار في الفولتميتر.') },
      { q: 'لماذا القنطرة أدق من قانون أوم؟', k: ['ادق'], a: () => K.tutor('هل نحتاج قراءة تيار دقيقة في القنطرة؟', 'نعتمد على انعدام القراءة فقط، دون تأثير مقاومة أجهزة القياس.') }
    ]
  });

  /* ======================= 6-5 قانونا كيرتشوف ص83–87 ======================= */
  // ثلاثة فروع متوازية بين عقدتين (علوية وسفلية)، في كل فرع بطارية ε (موجبة: تدفع التيار نحو الأعلى) ومقاومة R
  K.reg({
    id: 'kirchhoff', unit: 5, order: 5, lesson: '6-5', lessonTitle: 'قانونا كيرتشوف', page: 85,
    titleAr: 'قانونا كيرتشوف: دارة بحلقتين', titleEn: 'Kirchhoff’s Rules', tags: 'كيرتشوف نقطة تفرع حلقة مسار مغلق حفظ الشحنة حفظ الطاقة بطاريات مثال 10 مثال 11 نشاط 1-5 نشاط 2-5',
    formula: '\\sum I_{\\text{داخلة}} = \\sum I_{\\text{خارجة}} ,\\qquad \\sum_{\\text{حلقة}} \\Delta V = 0',
    book: 'القانونان (5-6) و(5-7) ونشاطا (1-5) و(2-5) ص84. مثال (10) ص85–86: I = 2/3 A ، I₁ = 2/3 A ، I₂ = 0. مثال (11) ص87: I₂ = 3 A ، I₁ = 0.5 A ، I = 3.5 A، والقدرة الداخلة = المستنفدة = 115.5 W.',
    summary: 'القانون الأول (حفظ الشحنة): مجموع التيارات الداخلة إلى نقطة تفرع يساوي مجموع الخارجة منها. القانون الثاني (حفظ الطاقة): مجموع تغيرات الجهد عبر أي حلقة مغلقة يساوي صفراً. نفرض اتجاهات للتيارات، ونكتب معادلات بعددها ثم نحلها.',
    vars: [['\\varepsilon_1, \\varepsilon_2, \\varepsilon_3', 'بطاريات الفروع (الموجب نحو الأعلى)', '\\mathrm{V}', '−50 – 50'], ['R_1, R_2, R_3', 'مقاومات الفروع', '\\Omega', '1 – 50'], ['V', 'فرق الجهد بين نقطتي التفرع', '\\mathrm{V}', '—'], ['I_k', 'تيار كل فرع (الموجب نحو الأعلى)', '\\mathrm{A}', '—']],
    assumptions: ['كل فرع بطارية ومقاومة على التوالي (تشمل المقاومة الداخلية).', 'التيار السالب يعني أن الاتجاه الحقيقي عكس الاتجاه المفترض.'],
    params: [
      { key: 'e1', label: '\\varepsilon_1\\ (\\mathrm{V})', min: -50, max: 50, step: 1, value: 10 },
      { key: 'R1', label: 'R_1\\ (\\Omega)', min: 1, max: 50, step: 1, value: 5 },
      { key: 'e2', label: '\\varepsilon_2\\ (\\mathrm{V})', min: -50, max: 50, step: 1, value: 0 },
      { key: 'R2', label: 'R_2\\ (\\Omega)', min: 1, max: 50, step: 1, value: 10 },
      { key: 'e3', label: '\\varepsilon_3\\ (\\mathrm{V})', min: -50, max: 50, step: 1, value: 5 },
      { key: 'R3', label: 'R_3\\ (\\Omega)', min: 1, max: 50, step: 1, value: 5 }
    ],
    compute(p) {
      const br = [[p.e1, p.R1], [p.e2, p.R2], [p.e3, p.R3]];
      const V = br.reduce((s, [e, R]) => s + e / R, 0) / br.reduce((s, [, R]) => s + 1 / R, 0);
      const I = br.map(([e, R]) => (e - V) / R);
      const Pin = br.reduce((s, [e], k) => s + Math.max(0, e * I[k]), 0); const Pout = br.reduce((s, [e, R], k) => s + I[k] * I[k] * R + Math.max(0, -e * I[k]), 0);
      return { V: V, I: I, Pin: Pin, Pout: Pout, sumI: I[0] + I[1] + I[2] };
    },
    live(p, d) { return 'I_1 + I_2 + I_3 = ' + n(Math.abs(d.sumI) < 1e-12 ? 0 : d.sumI) + ' ,\\quad V = ' + q(d.V, 'V', 4); },
    results(p, d) { return d.I.map((I, k) => ['تيار الفرع ' + (k + 1), q(I, 'A', 4) + (Math.abs(I) < 1e-12 ? '' : I > 0 ? '\\ \\uparrow' : '\\ \\downarrow'), true, k === 0 ? 'pos' : '']).concat([['فرق الجهد بين نقطتي التفرع', q(d.V, 'V', 4)], ['القدرة الداخلة', q(d.Pin, 'W', 4)], ['القدرة المستنفدة', q(d.Pout, 'W', 4)]]); },
    steps(p, d) {
      return ['نقطة التفرع العلوية (5-6): I₁ + I₂ + I₃ = 0 (بعضها سالب أي خارج).', 'الحلقة 1 (الفرعان 1 و2) بالقانون (5-7): ε₁ − I₁R₁ − ε₂ + I₂R₂ = 0 ⇒ ' + p.e1 + ' − ' + p.R1 + 'I₁ − (' + p.e2 + ') + ' + p.R2 + 'I₂ = 0.', 'الحلقة 2 (الفرعان 2 و3): ε₂ − I₂R₂ − ε₃ + I₃R₃ = 0.', 'الحل: I₁ = ' + n(d.I[0], 4) + ' ، I₂ = ' + n(d.I[1], 4) + ' ، I₃ = ' + n(d.I[2], 4) + ' A.', 'تحقق: القدرة الداخلة ' + n(d.Pin, 4) + ' W = المستنفدة ' + n(d.Pout, 4) + ' W.'];
    },
    drawCustom(ctx, W, H, p, d, cols) {
      const yT = H * 0.16, yB = H * 0.86, xs = [W * 0.18, W * 0.5, W * 0.82];
      K.wire(ctx, [[xs[0], yT], [xs[2], yT]], cols); K.wire(ctx, [[xs[0], yB], [xs[2], yB]], cols);
      [[p.e1, p.R1], [p.e2, p.R2], [p.e3, p.R3]].forEach(([e, R], k) => {
        const x = xs[k], yBat = yT + (yB - yT) * 0.7, yR0 = yT + (yB - yT) * 0.12, yR1 = yT + (yB - yT) * 0.48;
        K.wire(ctx, [[x, yT], [x, yR0]], cols); K.resistor(ctx, x, yR0, x, yR1, R + ' Ω', cols, [cols.c1, cols.c2, cols.c3][k]);
        if (e !== 0) { K.wire(ctx, [[x, yR1], [x, yBat - 6]], cols); ctx.save(); ctx.translate(x, yBat); if (e < 0) ctx.rotate(Math.PI); K.battery(ctx, 0, 0, false, '', cols); ctx.restore(); lbl(ctx, Math.abs(e) + ' V', x + 34, yBat, cols.c4, cols); K.wire(ctx, [[x, yBat + 6], [x, yB]], cols); }
        else K.wire(ctx, [[x, yR1], [x, yB]], cols);
        const I = d.I[k]; if (Math.abs(I) > 1e-9) { const up = I > 0; D.arrow(ctx, x - 22, up ? yR1 + 26 : yR1 - 4, x - 22, up ? yR1 - 4 : yR1 + 26, cols.c2, 2.5); }
        lbl(ctx, 'I' + (k + 1) + ' = ' + n(Math.abs(I), 3) + ' A', x - 26, yR1 + 48, cols.c2, cols);
      });
      [xs[0], xs[1], xs[2]].forEach((x) => { ctx.fillStyle = cols.text; [yT, yB].forEach((y) => { if (x === xs[1]) { ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill(); } }); });
      lbl(ctx, 'V = ' + n(d.V, 3) + ' V', W / 2, yT - 18, cols.text, cols, K.narrow(W) ? 12 : 14);
    },
    graph(p, d) { return { view: K.barView(d.I), xLabel: '', yLabel: 'I (A)', caption: 'تيارات الفروع (الموجب نحو الأعلى): مجموعها صفر عند نقطة التفرع.', draw(G) { const c = G.colors(); K.bars(G, [['I₁', d.I[0], c.c1], ['I₂', d.I[1], c.c2], ['I₃', d.I[2], c.c3]]); G.hline(0, { color: c.muted }); } }; },
    explain(a, b, da, db) { const o = []; if (db.I.some((I, k) => Math.sign(I) !== Math.sign(da.I[k]) && Math.abs(I) > 1e-9)) o.push('انعكس اتجاه التيار في أحد الفروع: البطارية فيه أصبحت تُشحن.'); return o; },
    learn: ['**القانون الأول (5-6) ص84:** ΣI داخلة = ΣI خارجة (حفظ الشحنة)، ويتحقق في نشاط (1-5) بالأميترات.', '**القانون الثاني (5-7) ص84:** Σ ΔV عبر حلقة مغلقة = 0 (حفظ الطاقة)، ويتحقق في نشاط (2-5).', '**خطوات الحل ص85:** افترض اتجاهات التيارات، طبّق القانون الأول عند نقطة تفرع، ثم الثاني على حلقات بعدد المجاهيل المتبقية، ثم حلّ المعادلات.'],
    challenges: [
      { q: 'مثال (10): فرع فيه 30 Ω فقط، وفرع فيه بطارية 40 V مع 30 Ω، وفرع فيه بطارية 20 V مع 10 Ω. أوجد التيارات.', hint: 'ε₁ = 0 ، R₁ = 30 ؛ ε₂ = 40 ، R₂ = 30 ؛ ε₃ = 20 ، R₃ = 10.', init: { e1: 10, R1: 5, e2: 0, R2: 10, e3: 5, R3: 5 }, check: (p) => p.e1 === 0 && p.R1 === 30 && p.e2 === 40 && p.R2 === 30 && p.e3 === 20 && p.R3 === 10, why: () => 'I = 2/3 A في فرع 30 Ω ، I₁ = 2/3 A في فرع 40 V ، I₂ = 0 في فرع 20 V.' },
      { q: 'مثال (11): بطارية 33 V مع 6 Ω، وفرع 4 Ω، وبطارية 11 V مع 2 Ω. تحقق من حفظ الطاقة.', hint: 'ε₁ = 33 ، R₁ = 6 ؛ ε₂ = 0 ، R₂ = 4 ؛ ε₃ = 11 ، R₃ = 2.', init: { e1: 10, R1: 5, e2: 0, R2: 10, e3: 5, R3: 5 }, check: (p) => p.e1 === 33 && p.R1 === 6 && p.e2 === 0 && p.R2 === 4 && p.e3 === 11 && p.R3 === 2, why: () => 'I = 3.5 A ، I₂ = 3 A ، I₁ = 0.5 A (البطارية 11 V تُشحن)، والقدرة 115.5 W.' }
    ],
    tutor: [
      { q: 'على أي مبدأ يقوم القانون الأول لكيرتشوف؟', k: ['الاول', 'مبدا'], a: () => K.tutor('هل يمكن أن تتجمع الشحنات عند نقطة التفرع؟', 'حفظ الشحنة الكهربائية.') },
      { q: 'على أي مبدأ يقوم القانون الثاني؟', k: ['الثاني'], a: () => K.tutor('ماذا يحدث لطاقة الشحنة بعد دورة كاملة؟', 'حفظ الطاقة: مجموع تغيرات الجهد في حلقة مغلقة صفر.') },
      { q: 'ماذا يعني أن يخرج التيار سالباً؟', k: ['سالب'], a: () => K.tutor('هل الاتجاه المفترض إجباري؟', 'الاتجاه الحقيقي عكس الاتجاه المفترض، والمقدار صحيح.') }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
