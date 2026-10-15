/* فيزياء الثاني عشر — الوحدة الثالثة، الفصل 6: المجال المغناطيسي (ص96–109) */
(function (root) {
  'use strict';
  const ML = root.ML; const D = ML.pdraw; const Q = ML.phys12; const K = ML.p12;
  const n = K.n, q = K.q, sct = ML.phys.sct;
  const lbl = (ctx, t, x, y, color, cols, size) => D.txt(ctx, t, x, y, { color: color || cols.text, size: size || 12, w: '700', halo: cols.bg });
  // سهم دائري صغير على دائرة نصف قطرها R عند الزاوية a ، ccw = عكس عقارب الساعة كما يراها الناظر
  function circArrow(ctx, cx, cy, R, a, ccw, color) { const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a); const tx = ccw ? Math.sin(a) : -Math.sin(a), ty = ccw ? -Math.cos(a) : Math.cos(a); D.arrow(ctx, x - tx * 8, y - ty * 8, x + tx * 8, y + ty * 8, color, 2); }

  /* ======================= 2-6 و3-6 تجربة أورستد ومجال سلك مستقيم ص98–100 ======================= */
  K.reg({
    id: 'straight-wire', unit: 6, order: 1, lesson: '3-6', lessonTitle: 'المجال المغناطيسي لسلك طويل مستقيم', page: 99,
    titleAr: 'تجربة أورستد: مجال سلك مستقيم طويل', titleEn: 'Oersted’s Experiment: Field of a Long Straight Wire', tags: 'اورستد بوصلة سلك مستقيم مجال مغناطيسي قاعدة اليد اليمنى بيو سافار تسلا نشاط 1-6 مثال 1',
    formula: 'B = \\frac{\\mu_0 I}{2\\pi r} ,\\qquad \\mu_0 = 4\\pi \\times 10^{-7}\\ \\mathrm{T\\,m/A}',
    book: 'نشاط (1-6) تجربة أورستد ص98، وقانون بيو وسافار (6-1)، والقانون (6-2) وقاعدة اليد اليمنى ص99. مثال (1) ص100: سلك يحمل 25 A ، والنقطة على بعد 10 cm ⇒ B = 5 × 10⁻⁵ T.',
    summary: 'مرور تيار في سلك يولد حوله مجالاً مغناطيسياً خطوطه دوائر متحدة المركز حول السلك، فتنحرف إبرة البوصلة القريبة. اتجاه المجال بقاعدة اليد اليمنى، ومقداره يتناسب طردياً مع التيار وعكسياً مع البعد عن السلك.',
    vars: [['I', 'شدة التيار (الموجب: نحو الناظر ⊙)', '\\mathrm{A}', '−30 – 30'], ['r', 'بعد النقطة عن السلك', '\\mathrm{cm}', '1 – 50'], ['B', 'شدة المجال المغناطيسي', '\\mathrm{T}', '—'], ['\\mu_0', 'النفاذية المغناطيسية للفراغ', '\\mathrm{T\\,m/A}', '4\\pi \\times 10^{-7}']],
    assumptions: ['السلك طويل جداً مقارنة ببعد النقطة عنه.', 'إهمال المجال المغناطيسي الأرضي في اتجاه إبر البوصلات: ' + Q.SIMPLE + '.'],
    params: [
      { key: 'I', label: 'I\\ (\\mathrm{A})', min: -30, max: 30, step: 1, value: 10 },
      { key: 'r', label: 'r\\ (\\mathrm{cm})', min: 1, max: 50, step: 1, value: 5 }
    ],
    compute(p) { return { B: p.I === 0 ? 0 : Q.Bwire(Math.abs(p.I), p.r / 100) }; },
    live(p, d) { return 'B = \\frac{4\\pi \\times 10^{-7} \\times ' + Math.abs(p.I) + '}{2\\pi \\times ' + p.r / 100 + '} = ' + q(d.B, 'T', 3); },
    results(p, d) { return [['شدة المجال B', q(d.B, 'T', 3), true, 'pos'], ['اتجاه التيار', p.I > 0 ? 'نحو الناظر ⊙' : p.I < 0 ? 'بعيداً عن الناظر ⊗' : 'لا تيار', false], ['اتجاه خطوط المجال', p.I > 0 ? 'عكس عقارب الساعة' : p.I < 0 ? 'مع عقارب الساعة' : 'لا مجال (تتجه البوصلة شمالاً)', false]]; },
    steps(p, d) { return ['B = μ₀ I / (2π r) = 4π×10⁻⁷ × ' + Math.abs(p.I) + ' ÷ (2π × ' + p.r / 100 + ') = ' + sct(d.B, 3) + ' T.', 'بقاعدة اليد اليمنى: الإبهام باتجاه التيار، وانحناء الأصابع باتجاه خطوط المجال.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const cx = W / 2, cy = H * 0.52, S = Math.min(W, H) * 0.42; const ccw = p.I > 0;
      if (p.I !== 0) for (let k = 1; k <= 4; k++) { const R = S * k / 4.2; ctx.strokeStyle = cols.c1; ctx.globalAlpha = 0.25 + 0.6 * Math.min(1, Math.abs(p.I) / 30) / k; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; circArrow(ctx, cx, cy, R, -Math.PI / 2 + k * 0.6, ccw, cols.c1); }
      ctx.fillStyle = '#b45309'; ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.fill(); if (p.I !== 0) K.perp(ctx, cx, cy, 10, p.I > 0, '#fff');
      for (let j = 0; j < 8; j++) { const a = j * Math.PI / 4, R = S * 0.62; const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a); const ang = p.I === 0 ? -Math.PI / 2 : Math.atan2(ccw ? -Math.cos(a) : Math.cos(a), ccw ? Math.sin(a) : -Math.sin(a)); K.compass(ctx, x, y, 13, ang, cols); }
      const rp = Math.min(S, 18 + p.r / 50 * (S - 18)); ctx.fillStyle = cols.c2; ctx.beginPath(); ctx.arc(cx + rp, cy, 5, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = cols.c2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + rp, cy); ctx.stroke(); ctx.setLineDash([]);
      if (p.I !== 0) D.arrow(ctx, cx + rp, cy, cx + rp, cy + (ccw ? -34 : 34), cols.c2, 3);
      lbl(ctx, 'r = ' + p.r + ' cm', cx + rp / 2, cy + 16, cols.c2, cols);
      D.txt(ctx, 'B = ' + sct(d.B, 3) + ' T', W / 2, H * 0.07, { color: cols.text, size: K.narrow(W) ? 14 : 16, w: '700' });
    },
    graph(p, d) { const k = Q.mu0 * Math.max(1, Math.abs(p.I)) / (2 * Math.PI); return { view: { xmin: 0, xmax: 50, ymin: 0, ymax: Q.mu0 * 30 / (2 * Math.PI * 0.02) }, xLabel: 'r (cm)', yLabel: 'B (T)', caption: 'B تتناسب عكسياً مع البعد عن السلك.', draw(G) { const c = G.colors(); G.fn((r) => k / (r / 100), { color: c.c1, width: 3, domain: [1.5, 50] }); G.point(p.r, d.B, { color: c.c2 }); } }; },
    explain(a, b, da, db) { const o = []; if (Math.sign(a.I) !== Math.sign(b.I)) o.push(b.I === 0 ? 'بانقطاع التيار يزول المجال فتعود إبر البوصلات إلى اتجاهها الأصلي.' : 'انعكاس التيار يعكس اتجاه انحراف إبر البوصلات.'); if (a.r !== b.r) o.push('مضاعفة البعد تنصّف شدة المجال.'); return o; },
    learn: ['**تجربة أورستد (نشاط 1-6):** تنحرف إبرة البوصلة عند مرور تيار في سلك قريب منها، وينعكس انحرافها بعكس التيار.', '**بيو وسافار (6-1) ص99:** المجال يتناسب طردياً مع التيار و sinθ، وعكسياً مع مربع البعد.', '**(6-2) ص99:** B = μ₀I/(2πr)، وخطوط المجال دوائر متحدة المركز حول السلك.', 'الرمز ⊙ تيار نحو الناظر، و⊗ بعيداً عنه.'],
    challenges: [
      { q: 'مثال (1): سلك يحمل 25 A. أوجد B عند نقطة تبعد 10 cm.', hint: 'I = 25 و r = 10.', init: { I: 10, r: 5 }, check: (p) => Math.abs(p.I) === 25 && p.r === 10, why: () => 'B = 5×10⁻⁵ T.' },
      { q: 'نشاط (1-6): اعكس اتجاه التيار ولاحظ إبر البوصلات.', hint: 'اجعل I سالباً.', init: { I: 10 }, check: (p) => p.I < 0, why: () => 'تنعكس اتجاهات خطوط المجال وإبر البوصلات.' }
    ],
    tutor: [
      { q: 'كيف أحدد اتجاه المجال حول السلك؟', k: ['اتجاه', 'يمنى'], a: () => K.tutor('أمسك السلك بيدك اليمنى بحيث يشير الإبهام إلى اتجاه التيار.', 'انحناء الأصابع يشير إلى اتجاه خطوط المجال.') },
      { q: 'ماذا يحدث للمجال إذا ابتعدت عن السلك؟', k: ['ابتعد', 'بعد'], a: () => K.tutor('ما العلاقة بين B و r في القانون (6-2)؟', 'يقل عكسياً مع البعد: B ∝ 1/r.') },
      { q: 'ما وحدة شدة المجال المغناطيسي؟', k: ['وحده', 'تسلا'], a: () => K.tutor('اسم الوحدة على اسم عالم.', 'التسلا T.') }
    ]
  });

  /* ======================= 4-6 مجال ملف دائري ص100–103 ======================= */
  K.reg({
    id: 'circular-coil', unit: 6, order: 2, lesson: '4-6', lessonTitle: 'المجال المغناطيسي لملف دائري', page: 101,
    titleAr: 'المجال في مركز ملف دائري', titleEn: 'Field at the Center of a Circular Coil', tags: 'ملف دائري حلقة مركز لفات نصف قطر ملفان متحدا المركز نشاط 2-6 مثال 2 مثال 3',
    formula: 'B = \\frac{\\mu_0 I N}{2R}',
    book: 'نشاط (2-6) تخطيط مجال ملف دائري، والقانون (6-3) ص101. مثال (2) ص102: 250 لفة نصف قطرها 3.14 cm وتيار 2 A مع عقارب الساعة ⇒ B = 1 × 10⁻² T للداخل. مثال (3) ص102–103: ملفان متحدا المركز 100 لفة، R₁ = 7 cm و I₁ = 5 A ، و R₂ = 2 cm.',
    summary: 'خطوط المجال في مركز الملف الدائري مستقيمة تقريباً وعمودية على مستواه، ومقداره يتناسب طردياً مع عدد اللفات والتيار وعكسياً مع نصف القطر. التيار مع عقارب الساعة يعطي مجالاً للداخل (⊗).',
    vars: [['N', 'عدد اللفات', '—', '1 – 500'], ['R', 'نصف قطر الملف', '\\mathrm{cm}', '1 – 20'], ['I', 'التيار (الموجب: مع عقارب الساعة)', '\\mathrm{A}', '−10 – 10'], ['B', 'المجال في المركز', '\\mathrm{T}', '—']],
    assumptions: ['اللفات متراصة لها نصف القطر نفسه.'],
    params: [
      { key: 'mode', label: '\\text{الحالة}', type: 'select', value: 'one', options: [['one', 'ملف واحد'], ['two', 'مثال (3): ملفان متحدا المركز']] },
      { key: 'N', label: 'N', min: 1, max: 500, step: 1, value: 100, hidden: (p) => p.mode !== 'one' },
      { key: 'R', label: 'R\\ (\\mathrm{cm})', min: 1, max: 20, step: 0.01, value: 5, hidden: (p) => p.mode !== 'one' },
      { key: 'I', label: 'I\\ (\\mathrm{A})', min: -10, max: 10, step: 0.1, value: 2, hidden: (p) => p.mode !== 'one' },
      { key: 'I2', label: 'I_2\\ (\\mathrm{A})', min: -5, max: 5, step: 0.01, value: 0.5, hidden: (p) => p.mode !== 'two' }
    ],
    compute(p) {
      if (p.mode === 'two') { const B1 = Q.Bloop(100, 5, 0.07), B2 = Q.Bloop(100, p.I2, 0.02); return { B1: B1, B2: B2, B: B1 + B2 }; }
      return { B: Q.Bloop(p.N, p.I, p.R / 100) };
    },
    live(p, d) { return p.mode === 'two' ? 'B = B_1 + B_2 = ' + ML.phys.sci(d.B1, 3) + ' + (' + ML.phys.sci(d.B2, 3) + ') = ' + q(d.B, 'T', 3) : 'B = \\frac{4\\pi \\times 10^{-7} \\times ' + p.I + ' \\times ' + p.N + '}{2 \\times ' + p.R / 100 + '} = ' + q(d.B, 'T', 3); },
    results(p, d) { const dir = Math.abs(d.B) < 1e-12 ? 'صفر' : d.B > 0 ? 'للداخل ⊗' : 'للخارج ⊙'; return (p.mode === 'two' ? [['مجال الملف الأول B₁', q(d.B1, 'T', 3)], ['مجال الملف الثاني B₂', q(d.B2, 'T', 3)]] : []).concat([['المجال المحصل في المركز', q(Math.abs(d.B), 'T', 3), true, 'pos'], ['اتجاهه', dir, false]]); },
    steps(p, d) { return p.mode === 'two' ? ['B₁ = μ₀ × 5 × 100 / (2 × 0.07) = ' + sct(d.B1, 3) + ' T للداخل.', 'B₂ = μ₀ × I₂ × 100 / (2 × 0.02) = ' + sct(d.B2, 3) + ' T.', 'B = B₁ + B₂ = ' + sct(d.B, 3) + ' T.'] : ['B = μ₀ I N / (2R) = ' + sct(d.B, 3) + ' T.', 'التيار ' + (p.I >= 0 ? 'مع' : 'عكس') + ' عقارب الساعة ⇒ المجال ' + (p.I >= 0 ? 'للداخل.' : 'للخارج.')]; },
    drawCustom(ctx, W, H, p, d, cols) {
      const cx = W / 2, cy = H * 0.53, S = Math.min(W, H) * 0.38;
      const rings = p.mode === 'two' ? [[S, 5, cols.c1, 'R₁ = 7 cm, 5 A'], [S * 2 / 7 + 10, p.I2, cols.c2, 'R₂ = 2 cm']] : [[Math.max(20, S * p.R / 20), p.I, cols.c1, 'R = ' + p.R + ' cm']];
      rings.forEach(([R, I, c, t]) => { ctx.strokeStyle = c; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke(); if (I !== 0) [0, 1, 2, 3].forEach((k) => circArrow(ctx, cx, cy, R, k * Math.PI / 2 + 0.4, I < 0, c)); lbl(ctx, t, cx, cy - R - 14, c, cols); });
      if (Math.abs(d.B) > 1e-12) { const s = Math.min(18, 6 + 12 * Math.abs(d.B) / 0.02); K.perp(ctx, cx, cy, s, d.B < 0, cols.c5); }
      D.txt(ctx, 'B = ' + sct(Math.abs(d.B), 3) + ' T', W / 2, H * 0.07, { color: cols.text, size: K.narrow(W) ? 14 : 16, w: '700' });
    },
    graph(p, d) {
      if (p.mode === 'two') return { view: { xmin: -5, xmax: 5, ymin: -0.012, ymax: 0.012 }, xLabel: 'I₂ (A)', yLabel: 'B (T)', caption: 'المجال المحصل خطي في I₂ وينعدم عند I₂ ≈ −1.43 A (عكس عقارب الساعة).', draw(G) { const c = G.colors(); G.fn((I) => Q.Bloop(100, 5, 0.07) + Q.Bloop(100, I, 0.02), { color: c.c1, width: 3, domain: [-5, 5] }); G.hline(0, { color: c.muted }); G.point(p.I2, d.B, { color: c.c2 }); } };
      return { view: { xmin: 1, xmax: 20, ymin: 0, ymax: Math.abs(Q.Bloop(p.N, p.I || 1, 0.01)) * 1.05 }, xLabel: 'R (cm)', yLabel: 'B (T)', caption: 'B تتناسب عكسياً مع نصف قطر الملف.', draw(G) { const c = G.colors(); G.fn((R) => Math.abs(Q.Bloop(p.N, p.I || 1, R / 100)), { color: c.c1, width: 3, domain: [1, 20] }); G.point(p.R, Math.abs(d.B), { color: c.c2 }); } };
    },
    explain(a, b, da, db) { const o = []; if (a.N !== b.N) o.push('زيادة عدد اللفات تزيد المجال في المركز بالنسبة نفسها.'); if (a.R !== b.R) o.push('الملف الأصغر يعطي مجالاً أقوى في مركزه.'); return o; },
    learn: ['**نشاط (2-6):** انحناء خطوط المجال يقل بالاقتراب من المركز حتى تصبح مستقيمة.', '**قاعدة اليد اليمنى للملف:** الإبهام باتجاه التيار في الملف، وانحناء الأصابع يعطي اتجاه المجال في المركز.', '**(6-3) ص101:** B = μ₀IN/(2R).'],
    challenges: [
      { q: 'مثال (2): ملف 250 لفة نصف قطره 3.14 cm ، والتيار 2 A مع عقارب الساعة.', hint: 'N = 250 ، R = 3.14 ، I = 2.', init: { mode: 'one', N: 100, R: 5, I: 2 }, check: (p) => p.mode === 'one' && p.N === 250 && Math.abs(p.R - 3.14) < 1e-9 && Math.abs(p.I - 2) < 1e-9, why: () => 'B = 1×10⁻² T للداخل.' },
      { q: 'مثال (3-C): اجعل المجال المحصل في المركز المشترك صفراً تقريباً.', hint: 'B₂ = B₁ مقداراً وتعاكسه: I₂ سالب.', init: { mode: 'two', I2: 0.5 }, check: (p, d) => p.mode === 'two' && Math.abs(d.B) < 0.01 * d.B1, why: () => 'I₂ ≈ 1.43 A عكس عقارب الساعة.' }
    ],
    tutor: [
      { q: 'كيف أحدد اتجاه المجال في مركز الملف؟', k: ['اتجاه', 'مركز'], a: () => K.tutor('استخدم اليد اليمنى مع اتجاه التيار في الملف.', 'التيار مع عقارب الساعة ⇒ المجال للداخل، وعكسها ⇒ للخارج.') },
      { q: 'لماذا تصبح خطوط المجال مستقيمة قرب المركز؟', k: ['مستقيمه'], a: () => K.tutor('ماذا يحدث لمجالات أجزاء الملف عند المركز؟', 'تتجمع مجالات كل أجزاء الملف في الاتجاه نفسه فيكون المجال منتظماً تقريباً.') },
      { q: 'كيف ينعدم المجال بملفين؟', k: ['ينعدم', 'صفر'], a: () => K.tutor('ما شرط تساوي المجالين وتعاكسهما؟', 'تياران متعاكسان بحيث B₁ = B₂ مقداراً.') }
    ]
  });

  /* ======================= 5-6 قانون أمبير ص103–104 ======================= */
  K.reg({
    id: 'ampere-law', unit: 6, order: 3, lesson: '5-6', lessonTitle: 'قانون أمبير', page: 104,
    titleAr: 'قانون أمبير: مجال حول كيبل من خمسة أسلاك', titleEn: 'Ampère’s Law', tags: 'قانون امبير مسار مغلق مجموع جبري تيارات كيبل اسلاك مثال 4',
    formula: '\\sum B\\,\\Delta L = \\mu_0 \\sum I \\;\\Rightarrow\\; B \\times 2\\pi r = \\mu_0 \\sum I',
    book: 'القانون (6-4) ص103 وتطبيقه على سلك مستقيم ص104. مثال (4) ص104: خمسة أسلاك في كيبل تيارتها 20 ، −6 ، 12 ، −9 ، 18 A ⇒ ΣI = 35 A ، و B = 7 × 10⁻⁵ T على بعد 10 cm.',
    summary: 'لأي مسار مغلق، مجموع حاصل ضرب المجال في أجزاء المسار يساوي μ₀ مضروباً في المجموع الجبري للتيارات التي تخترق المسار. للمسار الدائري حول الكيبل يكون B ثابتاً على المسار، فنحسب B من مجموع التيارات.',
    vars: [['I_1 … I_5', 'تيارات الأسلاك (الموجب ⊙)', '\\mathrm{A}', '−30 – 30'], ['r', 'نصف قطر المسار', '\\mathrm{cm}', '1 – 30'], ['\\sum I', 'المجموع الجبري', '\\mathrm{A}', '—'], ['B', 'المجال على المسار', '\\mathrm{T}', '—']],
    assumptions: ['الكيبل رفيع جداً والمسار دائري حوله، فيكون B ثابتاً على المسار.'],
    params: [1, 2, 3, 4, 5].map((k) => ({ key: 'I' + k, label: 'I_' + k + '\\ (\\mathrm{A})', min: -30, max: 30, step: 1, value: [10, -5, 8, 0, 5][k - 1] })).concat([{ key: 'r', label: 'r\\ (\\mathrm{cm})', min: 1, max: 30, step: 1, value: 5 }]),
    compute(p) { const S = p.I1 + p.I2 + p.I3 + p.I4 + p.I5; return { S: S, B: S === 0 ? 0 : Q.Bwire(Math.abs(S), p.r / 100) }; },
    live(p, d) { return 'B = \\frac{\\mu_0 \\sum I}{2\\pi r} = \\frac{4\\pi \\times 10^{-7} \\times ' + d.S + '}{2\\pi \\times ' + p.r / 100 + '} = ' + q(d.B, 'T', 3); },
    results(p, d) { return [['المجموع الجبري للتيارات', q(d.S, 'A'), true], ['شدة المجال على المسار', q(d.B, 'T', 3), true, 'pos'], ['اتجاه المجال', d.S > 0 ? 'عكس عقارب الساعة' : d.S < 0 ? 'مع عقارب الساعة' : 'لا مجال محصل', false]]; },
    steps(p, d) { return ['ΣI = ' + [p.I1, p.I2, p.I3, p.I4, p.I5].map((x) => '(' + x + ')').join(' + ') + ' = ' + d.S + ' A.', 'B × 2πr = μ₀ ΣI ⇒ B = ' + sct(d.B, 3) + ' T.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const cx = W / 2, cy = H * 0.53, S = Math.min(W, H) * 0.4; const R = 20 + (S - 20) * p.r / 30;
      ctx.strokeStyle = cols.c5; ctx.setLineDash([6, 5]); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      if (d.S !== 0) [0, 1, 2, 3, 4, 5].forEach((k) => circArrow(ctx, cx, cy, R, k * Math.PI / 3, d.S > 0, cols.c5));
      ctx.fillStyle = cols.grid; ctx.beginPath(); ctx.arc(cx, cy, 17, 0, Math.PI * 2); ctx.fill();
      [p.I1, p.I2, p.I3, p.I4, p.I5].forEach((I, k) => { const a = k * 2 * Math.PI / 5 - Math.PI / 2; const x = cx + 9 * Math.cos(a), y = cy + 9 * Math.sin(a); if (I !== 0) K.perp(ctx, x, y, 5, I > 0, I > 0 ? cols.c2 : cols.c1); else { ctx.fillStyle = cols.muted; ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill(); } });
      lbl(ctx, 'r = ' + p.r + ' cm', cx + R * 0.7, cy + R * 0.7 + 14, cols.c5, cols);
      D.txt(ctx, 'ΣI = ' + d.S + ' A   B = ' + sct(d.B, 3) + ' T', W / 2, H * 0.07, { color: cols.text, size: K.narrow(W) ? 13 : 16, w: '700' });
    },
    graph(p, d) { const v = [p.I1, p.I2, p.I3, p.I4, p.I5, d.S]; return { view: K.barView(v), xLabel: '', yLabel: 'I (A)', caption: 'التيارات (الموجب ⊙) ومجموعها الجبري ΣI الذي يحدد المجال.', draw(G) { const c = G.colors(); K.bars(G, v.map((x, i) => [i < 5 ? 'I' + (i + 1) : 'ΣI', x, i < 5 ? (x >= 0 ? c.c2 : c.c1) : c.c5])); G.hline(0, { color: c.muted }); } }; },
    explain(a, b, da, db) { const o = []; if (da.S !== db.S && db.S === 0) o.push('المجموع الجبري صفر: لا مجال محصل على المسار رغم وجود تيارات.'); return o; },
    learn: ['**قانون أمبير (6-4) ص103:** ΣB·ΔL = μ₀ ΣI، حيث ΣI المجموع الجبري للتيارات المخترقة للمسار المغلق.', 'يُستخدم مع الموصلات ذات التماثل الهندسي، فنختار مساراً يكون فيه B ثابتاً ومماسياً.', 'تطبيقه على سلك مستقيم يعطي B = μ₀I/(2πr) نفسها.'],
    challenges: [
      { q: 'مثال (4): كيبل تيارات أسلاكه 20 ، −6 ، 12 ، −9 ، 18 A. أوجد B على بعد 10 cm.', hint: 'المجموع الجبري 35 A.', init: { I1: 10, I2: -5, I3: 8, I4: 0, I5: 5, r: 5 }, check: (p) => [p.I1, p.I2, p.I3, p.I4, p.I5].sort((a, b) => a - b).join() === '-9,-6,12,18,20' && p.r === 10, why: () => 'ΣI = 35 A ⇒ B = 7×10⁻⁵ T.' },
      { q: 'اجعل المجال على المسار صفراً مع بقاء تيار في كل سلك.', hint: 'المجموع الجبري صفر.', init: { I1: 10, I2: -5, I3: 8, I4: 2, I5: 5 }, check: (p, d) => d.S === 0 && [p.I1, p.I2, p.I3, p.I4, p.I5].every((x) => x !== 0), why: () => 'ΣI = 0 ⇒ B = 0 على المسار.' }
    ],
    tutor: [
      { q: 'ما المقصود بالمجموع الجبري للتيارات؟', k: ['جبري', 'مجموع'], a: () => K.tutor('هل لاتجاه التيار أثر في الإشارة؟', 'نجمع التيارات مع إشاراتها: نحو الناظر موجب، وبعيداً عنه سالب.') },
      { q: 'لماذا نختار مساراً دائرياً؟', k: ['مسار', 'دائري'], a: () => K.tutor('ما شكل خطوط المجال حول السلك؟', 'لأن B ثابت المقدار ومماسي على الدائرة، فيصبح المجموع B × 2πr.') },
      { q: 'متى يستخدم قانون أمبير؟', k: ['متى', 'يستخدم'], a: () => K.tutor('هل يسهل تطبيقه على أي شكل؟', 'مع الموصلات ذات التماثل الهندسي كالسلك المستقيم والملف الحلزوني.') }
    ]
  });

  /* ======================= 6-6 الملف الحلزوني ص105–106 ======================= */
  K.reg({
    id: 'solenoid', unit: 6, order: 4, lesson: '6-6', lessonTitle: 'المجال المغناطيسي لملف حلزوني', page: 105,
    titleAr: 'المجال داخل ملف حلزوني', titleEn: 'Magnetic Field of a Solenoid', tags: 'ملف حلزوني لفات طول مجال منتظم مغناطيس مستقيم n عدد اللفات لوحدة الطول مثال 5 مثال 6',
    formula: 'B = \\frac{\\mu_0 I N}{L} = \\mu_0 n I ,\\qquad n = \\frac{N}{L}',
    book: 'الشكلان (11-6) و(12-6) والقانون (6-5) ص105–106. مثال (5) ص106: 2000 لفة وطول 60 cm وتيار 3 A ⇒ B = 4π × 10⁻³ T. مثال (6) ص106: سلك 440 cm على ملف قطره 14 cm وطوله 55 cm ⇒ N = 10 ، و I = 1.4 A ⇒ B = 3.2 × 10⁻⁵ T.',
    summary: 'خطوط المجال داخل الملف الحلزوني متوازية على امتداد محوره فيكون المجال منتظماً تقريباً، وخارجه ضعيف، ويشبه نمطه نمط المغناطيس المستقيم. المجال داخله يتناسب مع عدد اللفات لوحدة الطول ومع التيار.',
    vars: [['N', 'عدد اللفات', '—', '10 – 3000'], ['L', 'طول الملف', '\\mathrm{cm}', '5 – 100'], ['I', 'شدة التيار', '\\mathrm{A}', '0.1 – 10'], ['B', 'المجال داخل الملف', '\\mathrm{T}', '—']],
    assumptions: ['طول الملف أكبر بكثير من نصف قطره واللفات متراصة.'],
    params: [
      { key: 'N', label: 'N', min: 10, max: 3000, step: 10, value: 500 },
      { key: 'L', label: 'L\\ (\\mathrm{cm})', min: 5, max: 100, step: 1, value: 40 },
      { key: 'I', label: 'I\\ (\\mathrm{A})', min: 0.1, max: 10, step: 0.1, value: 2 }
    ],
    compute(p) { return { n: p.N / (p.L / 100), B: Q.Bsolenoid(p.N, p.L / 100, p.I) }; },
    live(p, d) { return 'B = \\frac{4\\pi \\times 10^{-7} \\times ' + p.I + ' \\times ' + p.N + '}{' + p.L / 100 + '} = ' + q(d.B, 'T', 3); },
    results(p, d) { return [['عدد اللفات لوحدة الطول n', q(d.n, 'turn/m', 4)], ['المجال داخل الملف B', q(d.B, 'T', 3), true, 'pos'], ['المجال خارج الملف', 'صغير جداً مقارنة بداخله', false]]; },
    steps(p, d) { return ['n = N/L = ' + p.N + ' ÷ ' + p.L / 100 + ' = ' + n(d.n) + ' لفة/m.', 'B = μ₀ n I = 4π×10⁻⁷ × ' + n(d.n) + ' × ' + p.I + ' = ' + sct(d.B, 3) + ' T.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const cy = H * 0.5, len = (W - 120) * (0.3 + 0.7 * p.L / 100), x0 = (W - len) / 2, h = Math.min(H * 0.2, 60); const turns = Math.max(4, Math.min(40, Math.round(p.N / 25)));
      for (let k = 0; k < turns; k++) { const x = x0 + len * (k + 0.5) / turns; ctx.strokeStyle = '#b45309'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(x, cy, 6, h, 0, 0, Math.PI * 2); ctx.stroke(); }
      const nl = Math.min(5, 1 + Math.round(d.B / 0.004)); for (let j = 0; j < nl; j++) { const y = cy + (j - (nl - 1) / 2) * (h * 1.4 / Math.max(1, nl)); D.arrow(ctx, x0 - 20, y, x0 + len + 20, y, cols.c1, 2); }
      lbl(ctx, 'N', x0 + len + 40, cy, cols.c2, cols, 15); lbl(ctx, 'S', x0 - 40, cy, cols.c1, cols, 15);
      lbl(ctx, 'L = ' + p.L + ' cm', W / 2, cy + h + 22, cols.text, cols, 13);
      D.txt(ctx, 'B = ' + sct(d.B, 3) + ' T', W / 2, H * 0.08, { color: cols.text, size: K.narrow(W) ? 14 : 16, w: '700' });
    },
    graph(p, d) { return { view: { xmin: 0, xmax: 10, ymin: 0, ymax: Q.Bsolenoid(p.N, p.L / 100, 10) * 1.05 }, xLabel: 'I (A)', yLabel: 'B (T)', caption: 'المجال داخل الملف يتناسب طردياً مع التيار، والميل = μ₀n.', draw(G) { const c = G.colors(); G.fn((I) => Q.Bsolenoid(p.N, p.L / 100, I), { color: c.c1, width: 3, domain: [0, 10] }); G.point(p.I, d.B, { color: c.c2 }); } }; },
    explain(a, b, da, db) { const o = []; if (a.N !== b.N) o.push('زيادة عدد اللفات مع ثبوت الطول تزيد المجال داخل الملف.'); if (a.L !== b.L) o.push('إطالة الملف بعدد اللفات نفسه تقلل n فيقل المجال.'); return o; },
    learn: ['**أناقش ص105:** المجال داخل الملف منتظم تقريباً (خطوط متوازية)، وخارجه صغير، ونمطه يشبه المغناطيس المستقيم.', '**(6-5) ص106:** B = μ₀IN/L = μ₀nI، من تطبيق قانون أمبير على مسار مستطيل.', 'يستخدم المجال المنتظم القوي في التصوير بالرنين المغناطيسي.'],
    challenges: [
      { q: 'مثال (5): ملف 2000 لفة وطوله 60 cm يحمل 3 A. احسب B داخله.', hint: 'N = 2000 ، L = 60 ، I = 3.', init: { N: 500, L: 40, I: 2 }, check: (p) => p.N === 2000 && p.L === 60 && Math.abs(p.I - 3) < 1e-9, why: () => 'B = 4π×10⁻³ ≈ 1.26×10⁻² T.' },
      { q: 'مثال (6): سلك 440 cm لُفّ على ملف قطره 14 cm وطوله 55 cm ، والتيار 1.4 A.', hint: 'N = 440 ÷ (π × 14) = 10.', init: { N: 500, L: 40, I: 2 }, check: (p) => p.N === 10 && p.L === 55 && Math.abs(p.I - 1.4) < 1e-9, why: () => 'B ≈ 3.2×10⁻⁵ T.' }
    ],
    tutor: [
      { q: 'لماذا المجال خارج الملف الحلزوني صغير؟', k: ['خارج', 'صغير'], a: () => K.tutor('أين تتجمع خطوط المجال؟', 'الخطوط تتجمع داخل الملف متوازية، وتنتشر خارجه في حيز واسع فيضعف المجال.') },
      { q: 'ماذا يحدث للمجال إذا أنقص عدد اللفات إلى الربع؟', k: ['ربع', 'انقص'], a: () => K.tutor('ما العلاقة بين B و N عند ثبوت L؟', 'يصبح المجال ربع قيمته: 0.25B.') },
      { q: 'بماذا يشبه الملف الحلزوني؟', k: ['يشبه'], a: () => K.tutor('قارن نمط خطوطه بنمط مغناطيس.', 'يشبه المغناطيس المستقيم بقطبين شمالي وجنوبي.') }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
