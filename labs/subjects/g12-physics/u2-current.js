/* فيزياء الثاني عشر — الوحدة الثانية، الفصل 4: التيار الكهربائي والمقاومة (ص57–71) */
(function (root) {
  'use strict';
  const ML = root.ML; const D = ML.pdraw; const Q = ML.phys12; const K = ML.p12;
  const n = K.n, q = K.q, sct = ML.phys.sct;

  // سلك أفقي بمقطع عرضي في منتصفه، وإلكترونات تتحرك عكس التيار الاصطلاحي
  function wireView(ctx, W, H, p, cols, t, speed, label, rad) {
    const y = H * 0.5, h = rad || 46, x0 = 30, x1 = W - 30;
    ctx.fillStyle = cols.grid; ctx.globalAlpha = 0.5; D.rr(ctx, x0, y - h, x1 - x0, 2 * h, h * 0.4); ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = cols.muted; ctx.lineWidth = 1.5; D.rr(ctx, x0, y - h, x1 - x0, 2 * h, h * 0.4); ctx.stroke();
    ctx.strokeStyle = cols.c2; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(W / 2, y, h * 0.35, h, 0, 0, Math.PI * 2); ctx.stroke();
    D.txt(ctx, label || 'A', W / 2, y - h - 14, { color: cols.c2, size: 13, w: '700' });
    const N = 26; ctx.fillStyle = cols.c1;
    for (let i = 0; i < N; i++) {
      const L = x1 - x0 - 20; let x = x1 - 10 - (((i * 37) % L) + speed * t) % L; if (x < x0 + 10) x += L;
      const yy = y + (((i * 53) % 17) / 16 - 0.5) * 1.6 * h * 0.8 + Math.sin(t * 3 + i) * 3;
      ctx.beginPath(); ctx.arc(x, yy, 4.5, 0, Math.PI * 2); ctx.fill();
    }
    D.arrow(ctx, W * 0.62, y + h + 26, W * 0.82, y + h + 26, cols.c2, 3); D.txt(ctx, 'I', W * 0.72, y + h + 42, { color: cols.c2, size: 13, w: '700' });
    D.arrow(ctx, W * 0.38, y + h + 26, W * 0.18, y + h + 26, cols.c1, 2); D.txt(ctx, 'e⁻', W * 0.28, y + h + 42, { color: cols.c1, size: 13, w: '700' });
  }

  /* ======================= 1-4 التيار الكهربائي ص58–59 ======================= */
  K.reg({
    id: 'current-charge', unit: 4, order: 1, lesson: '1-4', lessonTitle: 'التيار الكهربائي', page: 59,
    titleAr: 'شدة التيار: الشحنة العابرة لمقطع السلك', titleEn: 'Electric Current and Charge', tags: 'تيار شحنة زمن الكترونات عدد امبير كولوم مقطع راديو مثال 1 نشاط 1-4',
    formula: 'I = \\frac{\\Delta Q}{\\Delta t} ,\\qquad N_e = \\frac{\\Delta Q}{q_e}',
    book: 'القانون (4-1) ص59 ونشاط (1-4) إضاءة مصباح. مثال (1) ص59: تيار جهاز راديو 0.22 A خلال 4.5 s ⇒ ΔQ = 0.99 C و Nₑ = 6.2 × 10¹⁸ إلكترون.',
    summary: 'شدة التيار هي معدل تدفق الشحنة عبر مقطع الموصل بالنسبة للزمن، وتقاس بالأمبير (C/s). اتجاه التيار الاصطلاحي هو اتجاه حركة الشحنات الموجبة، أي عكس اتجاه حركة الإلكترونات في السلك.',
    vars: [['I', 'شدة التيار', '\\mathrm{A}', '0.01 – 5'], ['\\Delta t', 'الزمن', '\\mathrm{s}', '0.5 – 10'], ['\\Delta Q', 'الشحنة العابرة', '\\mathrm{C}', '—'], ['N_e', 'عدد الإلكترونات', '—', 'q_e = 1.6 \\times 10^{-19}\\ \\mathrm{C}']],
    assumptions: ['التيار ثابت خلال الفترة الزمنية.', 'سرعة الإلكترونات في الرسم مكبَّرة للتوضيح فقط.'],
    params: [
      { key: 'I', label: 'I\\ (\\mathrm{A})', min: 0.01, max: 5, step: 0.01, value: 0.5 },
      { key: 't', label: '\\Delta t\\ (\\mathrm{s})', min: 0.5, max: 10, step: 0.5, value: 2 }
    ],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0 }),
    tick(st, p, d, dt) { st.t = Math.min(p.t, st.t + dt); },
    isDone: (st, p) => st.t >= p.t,
    compute(p) { const Qc = p.I * p.t; return { Q: Qc, N: Qc / Q.e }; },
    live(p, d) { return '\\Delta Q = I\\,\\Delta t = ' + p.I + ' \\times ' + p.t + ' = ' + q(d.Q, 'C') + ' ,\\quad N_e = \\frac{' + n(d.Q) + '}{1.6 \\times 10^{-19}} = ' + q(d.N, '', 3); },
    results(p, d) { return [['الشحنة العابرة ΔQ', q(d.Q, 'C'), true, 'pos'], ['عدد الإلكترونات Nₑ', q(d.N, '', 3)], ['اتجاه التيار الاصطلاحي', 'عكس اتجاه حركة الإلكترونات', false]]; },
    steps(p, d) { return ['ΔQ = I Δt = ' + p.I + ' × ' + p.t + ' = ' + n(d.Q) + ' C.', 'Nₑ = ΔQ / qₑ = ' + n(d.Q) + ' ÷ (1.6×10⁻¹⁹) = ' + sct(d.N, 3) + ' إلكترون.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const st = d.st || { t: 0 }; wireView(ctx, W, H, p, cols, st.t, 20 + p.I * 30, 'A');
      const Qn = p.I * st.t; D.txt(ctx, 't = ' + st.t.toFixed(1) + ' s   ΔQ = ' + n(Qn) + ' C   Nₑ = ' + sct(Qn / Q.e, 3), W / 2, H * 0.12, { color: cols.text, size: K.narrow(W) ? 12 : 15, w: '700' });
    },
    graph(p, d) { return { view: { xmin: 0, xmax: 10, ymin: 0, ymax: Math.max(1, d.Q * 1.3, p.I * 10 * 0.3) }, xLabel: 't (s)', yLabel: 'Q (C)', caption: 'ميل منحنى الشحنة–الزمن يساوي شدة التيار ' + p.I + ' A.', draw(G) { const c = G.colors(); G.fn((t) => p.I * t, { color: c.c1, width: 3, domain: [0, 10] }); G.point(p.t, d.Q, { color: c.c2 }); } }; },
    explain(a, b, da, db) { const o = []; if (a.I !== b.I) o.push('زيادة شدة التيار تعني عبور شحنة أكبر في الثانية الواحدة.'); if (a.t !== b.t) o.push('الشحنة العابرة تتناسب طردياً مع الزمن عند ثبوت التيار.'); return o; },
    learn: ['**شدة التيار (4-1) ص59:** I = ΔQ/Δt، وحدتها C/s وتسمى أمبير (A)، وتقاس بالأميتر.', '**التيار الاصطلاحي:** اتجاه حركة الشحنات الموجبة من الجهد المرتفع إلى المنخفض، أي من القطب الموجب للبطارية إلى السالب عبر السلك.', '**عدد الإلكترونات:** Nₑ = ΔQ/qₑ حيث qₑ = 1.6×10⁻¹⁹ C.'],
    challenges: [
      { q: 'مثال (1): تيار جهاز راديو 0.22 A. كم إلكتروناً يمر خلال 4.5 s؟', hint: 'I = 0.22 و Δt = 4.5.', init: { I: 0.5, t: 2 }, check: (p) => Math.abs(p.I - 0.22) < 1e-9 && p.t === 4.5, why: () => 'ΔQ = 0.99 C و Nₑ ≈ 6.2×10¹⁸ إلكترون.' },
      { q: 'أسئلة الفصل: ما عدد الإلكترونات التي تعبر مقطع موصل يمر به تيار 2 A خلال ثانيتين؟', hint: 'اضبط I = 2 و Δt = 2.', init: { I: 0.5, t: 2 }, check: (p) => p.I === 2 && p.t === 2, why: () => 'ΔQ = 4 C ⇒ Nₑ = 2.5×10¹⁹ إلكترون.' }
    ],
    tutor: [
      { q: 'ما اتجاه التيار الاصطلاحي؟', k: ['اتجاه', 'اصطلاحي'], a: () => K.tutor('ما نوع الشحنات التي اتُّفق على اتجاه حركتها؟', 'اتجاه حركة الشحنات الموجبة، عكس حركة الإلكترونات.') },
      { q: 'كيف أحسب عدد الإلكترونات؟', k: ['عدد', 'الكترون'], a: (p, d) => K.tutor('احسب الشحنة أولاً ثم اقسم على شحنة الإلكترون.', 'Nₑ = ΔQ/qₑ = ' + sct(d.N, 3) + '.') },
      { q: 'ما وحدة شدة التيار؟', k: ['وحده', 'امبير'], a: () => K.tutor('التيار شحنة مقسومة على زمن.', 'الأمبير A = C/s.') }
    ]
  });

  /* ======================= السرعة الانسياقية وكثافة التيار ص60–63 ======================= */
  const DENS = { al: ['ألمنيوم', 6.0e28], cu: ['نحاس', 8.5e28], fe: ['حديد', 8.5e28], au: ['ذهب', 5.9e28], ag: ['فضة', 5.8e28] };
  K.reg({
    id: 'drift-velocity', unit: 4, order: 2, lesson: '1-4', lessonTitle: 'السرعة الانسياقية وكثافة التيار', page: 61,
    titleAr: 'السرعة الانسياقية للإلكترونات وكثافة التيار', titleEn: 'Drift Velocity and Current Density', tags: 'سرعة انسياقية كثافة تيار الكترونات حرة كثافة حجمية نحاس المنيوم مقطع مثال 2 مثال 3 مثال 4 نشاط 3-4',
    formula: 'I = n_e A v_d q_e ,\\qquad J = \\frac{I}{A} = n_e v_d q_e',
    book: 'القانون (4-2) ص61 وجدول الكثافة الحجمية للإلكترونات الحرة، والقانونان (4-4) و(4-5) ص63. مثال (2) ص61: نحاس نصف قطره 1 cm وتيار 200 A ⇒ v_d ≈ 0.46 × 10⁻⁴ m/s. مثال (3) ص63: ألمنيوم قطره 2.5 mm ونحاس قطره 1.8 mm بتيار 1.3 A.',
    summary: 'الإلكترونات الحرة تتحرك عشوائياً بسرعة كبيرة (نحو 10⁶ m/s)، وعند وجود مجال كهربائي تنساق بمتوسط سرعة صغيرة جداً هي السرعة الانسياقية. كثافة التيار هي التيار لكل وحدة مساحة، فتزداد في الجزء الأضيق من الموصل.',
    vars: [['I', 'شدة التيار', '\\mathrm{A}', '0.1 – 300'], ['r', 'نصف قطر السلك', '\\mathrm{mm}', '0.1 – 15'], ['n_e', 'الكثافة الحجمية للإلكترونات الحرة', '\\mathrm{e/m^3}', '\\text{من جدول ص61}'], ['v_d', 'السرعة الانسياقية', '\\mathrm{m/s}', '—']],
    assumptions: ['السلك منتظم المقطع.', 'حركة الإلكترونات في الرسم مكبَّرة كثيراً للتوضيح: ' + Q.SIMPLE + '.'],
    params: [
      { key: 'mat', label: '\\text{المادة}', type: 'select', value: 'cu', options: Object.keys(DENS).map((k) => [k, DENS[k][0] + ' (' + DENS[k][1] / 1e28 + '×10²⁸)']) },
      { key: 'r', label: 'r\\ (\\mathrm{mm})', min: 0.1, max: 15, step: 0.05, value: 2 },
      { key: 'I', label: 'I\\ (\\mathrm{A})', min: 0.1, max: 300, step: 0.1, value: 10 }
    ],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0 }),
    tick(st, p, d, dt) { st.t += dt; },
    compute(p) { const ne = DENS[p.mat][1], A = Math.PI * Math.pow(p.r * 1e-3, 2); const vd = p.I / (ne * A * Q.e); return { ne: ne, A: A, vd: vd, J: p.I / A }; },
    live(p, d) { return 'v_d = \\frac{I}{n_e A q_e} = \\frac{' + p.I + '}{' + ML.phys.sci(d.ne, 3) + ' \\times ' + ML.phys.sci(d.A, 3) + ' \\times 1.6 \\times 10^{-19}} = ' + q(d.vd, 'm/s', 3); },
    results(p, d) { return [['مساحة المقطع A = πr²', q(d.A, 'm^2', 3)], ['السرعة الانسياقية v_d', q(d.vd, 'm/s', 3), true, 'pos'], ['كثافة التيار J', q(d.J, 'A/m^2', 3)], ['الزمن لقطع 1 m انسياقاً', q(1 / d.vd, 's', 3)]]; },
    steps(p, d) { return ['A = π r² = π × (' + p.r + '×10⁻³)² = ' + sct(d.A, 3) + ' m².', 'v_d = I / (nₑ A qₑ) = ' + sct(d.vd, 3) + ' m/s.', 'J = I / A = ' + sct(d.J, 3) + ' A/m².']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const st = d.st || { t: 0 }; const rad = Math.max(14, Math.min(H * 0.3, 14 + p.r * 5));
      wireView(ctx, W, H, p, cols, st.t, 8 + Math.min(120, Math.log10(1 + d.vd * 1e6) * 25), 'A = πr²', rad);
      D.txt(ctx, DENS[p.mat][0] + ': v_d = ' + sct(d.vd, 3) + ' m/s', W / 2, H * 0.1, { color: cols.text, size: K.narrow(W) ? 13 : 15, w: '700' });
    },
    graph(p, d, gi) {
      if (gi === 1) { const rm = 15; return { view: { xmin: 0, xmax: rm, ymin: 0, ymax: Math.max(d.J * 1.5, p.I / (Math.PI * 1e-6) * 0.05) }, xLabel: 'r (mm)', yLabel: 'J (A/m²)', caption: 'كثافة التيار تقل بزيادة مساحة المقطع عند ثبوت التيار.', draw(G) { const c = G.colors(); G.fn((r) => p.I / (Math.PI * r * r * 1e-6), { color: c.c5, width: 3, domain: [0.3, rm] }); G.point(p.r, d.J, { color: c.c2 }); } }; }
      const k = d.vd / p.I; return { view: { xmin: 0, xmax: 300, ymin: 0, ymax: k * 300 * 1.1 }, xLabel: 'I (A)', yLabel: 'v_d (m/s)', caption: 'السرعة الانسياقية تتناسب طردياً مع شدة التيار.', draw(G) { const c = G.colors(); G.fn((I) => k * I, { color: c.c1, width: 3, domain: [0, 300] }); G.point(p.I, d.vd, { color: c.c2 }); } };
    },
    graphModes: ['v_d – I', 'J – r'],
    explain(a, b, da, db) { const o = []; if (a.r !== b.r) o.push('تصغير المقطع يزيد السرعة الانسياقية وكثافة التيار للتيار نفسه.'); if (a.mat !== b.mat) o.push('الفلز الأقل كثافة إلكترونات حرة يحتاج سرعة انسياقية أكبر لنقل التيار نفسه.'); return o; },
    learn: ['**السرعة الانسياقية ص60:** متوسط سرعة الشحنات الحرة التي تشكل التيار، وهي صغيرة جداً (جزء من المليمتر في الثانية).', '**(4-2):** I = nₑ A v_d qₑ.', '**كثافة التيار (4-4) و(4-5) ص63:** J = I/A = nₑ v_d qₑ وتقاس بوحدة A/m².', 'المصباح يضيء فوراً لأن المجال الكهربائي ينتشر في السلك بسرعة قريبة من سرعة الضوء، فتبدأ الإلكترونات كلها بالانسياق معاً.'],
    challenges: [
      { q: 'مثال (2): سلك نحاس نصف قطره 1 cm يمر فيه 200 A. أوجد السرعة الانسياقية.', hint: 'r = 10 mm و I = 200 A.', init: { mat: 'cu', r: 2, I: 10 }, check: (p) => p.mat === 'cu' && Math.abs(p.r - 10) < 1e-9 && Math.abs(p.I - 200) < 1e-9, why: (p, d) => 'v_d = ' + sct(d.vd, 3) + ' m/s ≈ 0.46×10⁻⁴ m/s.' },
      { q: 'مثال (3): أوجد كثافة التيار في سلك النحاس الذي قطره 1.8 mm ويمر فيه 1.3 A.', hint: 'نصف القطر = نصف القطر الكلي: 0.9 mm.', init: { mat: 'al', r: 2, I: 10 }, check: (p) => p.mat === 'cu' && Math.abs(p.r - 0.9) < 1e-9 && Math.abs(p.I - 1.3) < 1e-9, why: (p, d) => 'J = ' + sct(d.J, 3) + ' A/m² ≈ 5.1×10⁵ A/m².' }
    ],
    tutor: [
      { q: 'لماذا يضيء المصباح فوراً رغم صغر السرعة الانسياقية؟', k: ['يضيء', 'فورا', 'سريع'], a: () => K.tutor('هل ينتظر المصباح وصول إلكترون من البطارية؟', 'المجال الكهربائي ينتشر في السلك بسرعة كبيرة جداً، فتنساق الإلكترونات الموجودة في كل أجزاء السلك معاً.') },
      { q: 'لماذا السرعة الانسياقية صغيرة؟', k: ['صغيره', 'انسياقيه'], a: () => K.tutor('ماذا يحدث للإلكترون عندما يصطدم بذرات الفلز؟', 'التصادمات المتكررة مع ذرات الفلز تجعل متوسط حركة الإلكترونات باتجاه السلك صغيراً جداً.') },
      { q: 'ما الفرق بين التيار وكثافة التيار؟', k: ['كثافه', 'فرق'], a: () => K.tutor('أيهما يتغير عند تضييق مقطع السلك؟', 'التيار ثابت على طول السلك، أما J = I/A فتزداد في المقطع الأضيق.') }
    ]
  });

  /* ======================= 2-4 المقاومة وقانون أوم ص62–65 ======================= */
  const RHO = { al: ['ألمنيوم', 2.8e-8], cu: ['نحاس', 1.7e-8], cu5: ['نحاس (مثال 5)', 1.72e-8], au: ['ذهب', 2.4e-8], fe: ['حديد', 9.7e-8], ag: ['فضة', 1.6e-8], w: ['تنجستون', 5.6e-8], ni: ['نيكروم', 1.5e-6], c: ['كربون', 3.5e-5] };
  K.reg({
    id: 'resistivity-ohm', unit: 4, order: 3, lesson: '2-4', lessonTitle: 'المقاومة الكهربائية وقانون أوم', page: 64,
    titleAr: 'المقاومة والمقاومية وقانون أوم', titleEn: 'Resistance, Resistivity and Ohm’s Law', tags: 'مقاومة مقاومية موصلية قانون اوم مجال كهربائي كثافة تيار اومية لا اومية سلك نحاس جدول مثال 5 نشاط 2-4',
    formula: 'R = \\rho\\frac{L}{A} ,\\quad V = RI ,\\quad J = \\sigma E ,\\quad \\sigma = \\frac{1}{\\rho}',
    book: 'نشاط (2-4) والقانون (4-3) ص62، والقانون (4-6) وجدول المقاومية والشكل (3-4) ص64. مثال (5) ص65: سلك نحاس طوله 100 m ومقطعه 1 mm² يحمل 20 A ومقاوميته 1.72 × 10⁻⁸ Ω.m ⇒ E = 0.344 V/m و V = 34.4 V و R = 1.72 Ω.',
    summary: 'مقاومة الموصل تتناسب طردياً مع طوله وعكسياً مع مساحة مقطعه، وتعتمد على نوع مادته (المقاومية ρ). في الموصل الأومي يتناسب التيار طردياً مع فرق الجهد عند ثبوت درجة الحرارة، وصيغة أخرى لقانون أوم هي J = σE.',
    vars: [['\\rho', 'مقاومية المادة', '\\Omega\\,\\mathrm{m}', '\\text{جدول ص64}'], ['L', 'طول السلك', '\\mathrm{m}', '1 – 200'], ['A', 'مساحة المقطع', '\\mathrm{mm^2}', '0.1 – 10'], ['I', 'شدة التيار', '\\mathrm{A}', '0.5 – 30']],
    assumptions: ['درجة حرارة السلك ثابتة.', 'منحنى المقاومة اللاأومية في الرسم البياني شكل توضيحي كما في الشكل (3-4): ' + Q.SIMPLE + '.'],
    params: [
      { key: 'mat', label: '\\text{المادة}', type: 'select', value: 'cu', options: Object.keys(RHO).map((k) => [k, RHO[k][0]]) },
      { key: 'L', label: 'L\\ (\\mathrm{m})', min: 1, max: 200, step: 1, value: 50 },
      { key: 'A', label: 'A\\ (\\mathrm{mm^2})', min: 0.1, max: 10, step: 0.1, value: 2 },
      { key: 'I', label: 'I\\ (\\mathrm{A})', min: 0.5, max: 30, step: 0.5, value: 5 }
    ],
    compute(p) { const rho = RHO[p.mat][1], A = p.A * 1e-6; const R = Q.resistance(rho, p.L, A); const V = p.I * R; return { rho: rho, R: R, V: V, E: V / p.L, J: p.I / A, sig: 1 / rho }; },
    live(p, d) { return 'R = \\rho\\frac{L}{A} = ' + ML.phys.sci(d.rho, 3) + ' \\times \\frac{' + p.L + '}{' + p.A + ' \\times 10^{-6}} = ' + q(d.R, '\\Omega', 3) + ' ,\\quad V = IR = ' + q(d.V, 'V', 3); },
    results(p, d) { return [['المقاومة R', q(d.R, '\\Omega', 3), true, 'pos'], ['فرق الجهد V = IR', q(d.V, 'V', 3)], ['المجال الكهربائي E = ρJ', q(d.E, 'V/m', 3)], ['كثافة التيار J', q(d.J, 'A/m^2', 3)], ['الموصلية σ = 1/ρ', q(d.sig, '(\\Omega\\,m)^{-1}', 3)]]; },
    steps(p, d) { return ['R = ρ L / A = ' + sct(d.rho, 3) + ' × ' + p.L + ' ÷ (' + p.A + '×10⁻⁶) = ' + n(d.R) + ' Ω.', 'V = I R = ' + p.I + ' × ' + n(d.R) + ' = ' + n(d.V) + ' V.', 'E = V / L = ' + n(d.V) + ' ÷ ' + p.L + ' = ' + n(d.E) + ' V/m (ويساوي ρJ).']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const nr = K.narrow(W); const y = H * 0.5; const len = (W - 80) * (0.25 + 0.75 * p.L / 200), th = 6 + p.A * 5; const x0 = (W - len) / 2;
      ctx.fillStyle = p.mat === 'c' ? '#334155' : p.mat === 'cu' || p.mat === 'cu5' ? '#c2410c' : p.mat === 'au' ? '#ca8a04' : '#94a3b8';
      D.rr(ctx, x0, y - th / 2, len, th, th / 2); ctx.fill();
      K.wire(ctx, [[x0, y], [x0, y - 70], [W / 2 - 10, y - 70]], cols); K.wire(ctx, [[x0 + len, y], [x0 + len, y - 70], [W / 2 + 10, y - 70]], cols); K.battery(ctx, W / 2, y - 70, true, '', cols);
      D.txt(ctx, 'L = ' + p.L + ' m', W / 2, y + th / 2 + 18, { color: cols.text, size: 13, w: '700' });
      D.txt(ctx, 'A = ' + p.A + ' mm²', x0 - 4, y + th / 2 + 36, { color: cols.muted, size: 12, align: 'left' });
      D.txt(ctx, 'V = ' + n(d.V) + ' V', W / 2, y - 96, { color: cols.c2, size: 13, w: '700' });
      D.arrow(ctx, W / 2 - 50, y + th / 2 + 58, W / 2 + 50, y + th / 2 + 58, cols.c5, 2.5); D.txt(ctx, 'E = ' + n(d.E) + ' V/m', W / 2, y + th / 2 + 76, { color: cols.c5, size: 12, w: '700' });
      D.txt(ctx, RHO[p.mat][0] + ': R = ' + n(d.R) + ' Ω', W / 2, H * 0.1, { color: cols.text, size: nr ? 13 : 15, w: '700' });
    },
    graph(p, d, gi) {
      if (gi === 1) return { view: { xmin: -1, xmax: 1, ymin: -0.3, ymax: 1.2 }, xLabel: 'V', yLabel: 'I', caption: 'الشكل (3-4): الموصل الأومي خط مستقيم، واللاأومي (مثل الثنائي) منحنى (' + Q.SIMPLE + ').', draw(G) { const c = G.colors(); G.fn((V) => V, { color: c.c1, width: 3, domain: [-0.3, 1] }); G.fn((V) => (V <= 0 ? 0 : V * V * 1.1), { color: c.c2, width: 3, domain: [-1, 1] }); G.text(0.8, 0.8, 'أومية', { color: c.c1, dy: -14, bold: true }); G.text(0.9, 0.89, 'لا أومية', { color: c.c2, dy: 16, bold: true }); } };
      const Vm = 30 * d.R; return { view: { xmin: 0, xmax: Vm * 1.05, ymin: 0, ymax: 33 }, xLabel: 'V (V)', yLabel: 'I (A)', caption: 'منحنى أومي: الميل = 1/R.', draw(G) { const c = G.colors(); G.fn((V) => V / d.R, { color: c.c1, width: 3, domain: [0, Vm] }); G.point(d.V, p.I, { color: c.c2 }); } };
    },
    graphModes: ['I – V للسلك', 'أومية ولا أومية'],
    explain(a, b, da, db) { const o = []; if (a.L !== b.L) o.push('مضاعفة الطول تضاعف المقاومة.'); if (a.A !== b.A) o.push('زيادة مساحة المقطع تقلل المقاومة.'); if (a.mat !== b.mat) o.push('المقاومية خاصية للمادة: الفضة أقلها في الجدول والكربون أكبرها.'); return o; },
    learn: ['**قانون أوم (4-3) ص62:** V = RI عند ثبوت درجة الحرارة، والمقاومة تقاس بالأوم Ω = V/A.', '**المقاومية:** R = ρL/A، والمقاومية هي مقاومة موصل طوله 1 m ومساحة مقطعه 1 m².', '**(4-6) ص64:** J = σE حيث σ = 1/ρ الموصلية.', '**الموصلات الأومية** نسبتها V/I ثابتة، أما **اللاأومية** (المصباح، الثنائي، المقاومات الحرارية والضوئية) فتتغير مقاومتها.'],
    challenges: [
      { q: 'مثال (5): سلك نحاس طوله 100 m ومقطعه 1 mm² يحمل 20 A (ρ = 1.72×10⁻⁸ Ω.m). أوجد E و V و R.', hint: 'اختر «نحاس (مثال 5)».', init: { mat: 'cu', L: 50, A: 2, I: 5 }, check: (p) => p.mat === 'cu5' && p.L === 100 && Math.abs(p.A - 1) < 1e-9 && p.I === 20, why: () => 'E = 0.344 V/m ، V = 34.4 V ، R = 1.72 Ω.' },
      { q: 'بسلك طوله 50 m ومقطعه 2 mm²، اختر المادة التي تعطي أقل مقاومة.', hint: 'ابحث في جدول المقاومية عن أصغر ρ.', init: { mat: 'fe', L: 50, A: 2 }, check: (p) => p.mat === 'ag' && p.L === 50 && Math.abs(p.A - 2) < 1e-9, why: () => 'الفضة ρ = 1.6×10⁻⁸ Ω.m أقل مقاومية في الجدول.' }
    ],
    tutor: [
      { q: 'ما العوامل التي تعتمد عليها مقاومة موصل؟', k: ['عوامل', 'تعتمد'], a: () => K.tutor('ماذا يحدث للمقاومة إذا ضاعفت الطول؟ أو المقطع؟', 'الطول (طردياً) ومساحة المقطع (عكسياً) ونوع المادة (ρ) ودرجة الحرارة.') },
      { q: 'ما الفرق بين المقاومة الأومية واللاأومية؟', k: ['اوميه', 'لا اوميه'], a: () => K.tutor('هل تبقى V/I ثابتة عند تغيير الجهد؟', 'الأومية: V/I ثابتة (خط مستقيم)، واللاأومية: تتغير مثل المصباح والثنائي.') },
      { q: 'كيف أحسب المجال الكهربائي داخل السلك؟', k: ['مجال'], a: (p, d) => K.tutor('ما العلاقة بين V و L؟', 'E = V/L = ρJ = ' + n(d.E) + ' V/m.') }
    ]
  });

  /* ======================= القدرة الكهربائية ص66–67 ======================= */
  K.reg({
    id: 'electric-power', unit: 4, order: 4, lesson: '2-4', lessonTitle: 'الأثر الحراري للتيار الكهربائي', page: 67,
    titleAr: 'القدرة الكهربائية والطاقة الحرارية', titleEn: 'Electric Power and Joule Heating', tags: 'قدرة طاقة حرارية جول واط كيلو واط ساعة مصباح مقاومة مثال 6 مثال 7',
    formula: 'P = IV = I^2 R = \\frac{V^2}{R} ,\\qquad E_{th} = P\\,t',
    book: 'القانون (4-8) وقانون جول ص66. مثال (6) ص67: مقاومة 545 Ω على 12 V لمدة 65 s ⇒ P = 0.26 W و E = 17 J. مثال (7) ص67: مصباح 5 W ثم 10 W على فرق الجهد نفسه.',
    summary: 'الشغل الذي يبذله المجال في نقل الشحنات عبر المقاومة يتحول إلى حرارة (أو ضوء). معدل ذلك هو القدرة الكهربائية P = IV، ومنها P = I²R (قانون جول) و P = V²/R.',
    vars: [['V', 'فرق الجهد', '\\mathrm{V}', '1 – 240'], ['R', 'المقاومة', '\\Omega', '1 – 1000'], ['t', 'الزمن', '\\mathrm{s}', '1 – 120'], ['P', 'القدرة', '\\mathrm{W}', '—']],
    assumptions: ['المقاومة ثابتة لا تتغير بالحرارة.'],
    params: [
      { key: 'mode', label: '\\text{الحالة}', type: 'select', value: 'res', options: [['res', 'مثال (6): مقاومة'], ['lamps', 'مثال (7): مصباحان']] },
      { key: 'V', label: 'V\\ (\\mathrm{V})', min: 1, max: 240, step: 1, value: 24 },
      { key: 'R', label: 'R\\ (\\Omega)', min: 1, max: 1000, step: 1, value: 100, hidden: (p) => p.mode !== 'res' },
      { key: 't', label: 't\\ (\\mathrm{s})', min: 1, max: 120, step: 1, value: 30, hidden: (p) => p.mode !== 'res' },
      { key: 'P1', label: 'P_1\\ (\\mathrm{W})', min: 1, max: 200, step: 1, value: 5, hidden: (p) => p.mode !== 'lamps' },
      { key: 'P2', label: 'P_2\\ (\\mathrm{W})', min: 1, max: 200, step: 1, value: 5, hidden: (p) => p.mode !== 'lamps' }
    ],
    compute(p) {
      if (p.mode === 'lamps') return { I1: p.P1 / p.V, I2: p.P2 / p.V, R1: p.V * p.V / p.P1, R2: p.V * p.V / p.P2 };
      const P = p.V * p.V / p.R; return { P: P, I: p.V / p.R, E: P * p.t };
    },
    live(p, d) { return p.mode === 'lamps' ? 'I = \\frac{P}{V} ,\\quad R = \\frac{V^2}{P} \\Rightarrow \\frac{I_2}{I_1} = ' + n(d.I2 / d.I1) + ' ,\\quad \\frac{R_1}{R_2} = ' + n(d.R1 / d.R2) : 'P = \\frac{V^2}{R} = \\frac{' + p.V + '^2}{' + p.R + '} = ' + q(d.P, 'W', 3) + ' ,\\quad E_{th} = Pt = ' + q(d.E, 'J', 3); },
    results(p, d) {
      if (p.mode === 'lamps') return [['تيار المصباح الأول', q(d.I1, 'A', 3)], ['تيار المصباح الثاني', q(d.I2, 'A', 3)], ['مقاومة الأول', q(d.R1, '\\Omega', 3)], ['مقاومة الثاني', q(d.R2, '\\Omega', 3)], ['الخلاصة', p.P1 === p.P2 ? 'متساويان' : (p.P2 > p.P1 ? 'الثاني: تيار أكبر ومقاومة أصغر' : 'الأول: تيار أكبر ومقاومة أصغر'), false, 'pos']];
      return [['القدرة P', q(d.P, 'W', 3), true, 'pos'], ['التيار I = V/R', q(d.I, 'A', 3)], ['الطاقة الحرارية Eₜₕ', q(d.E, 'J', 3)]];
    },
    steps(p, d) { return p.mode === 'lamps' ? ['P = IV ⇒ I₂/I₁ = P₂/P₁ = ' + n(p.P2 / p.P1) + '.', 'P = V²/R ⇒ R₁/R₂ = P₂/P₁ = ' + n(p.P2 / p.P1) + '.'] : ['P = V²/R = ' + p.V + '² ÷ ' + p.R + ' = ' + n(d.P) + ' W.', 'Eₜₕ = P t = ' + n(d.P) + ' × ' + p.t + ' = ' + n(d.E) + ' J.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const nr = K.narrow(W); const cx = W / 2, y0 = H * 0.25, y1 = H * 0.78;
      const items = p.mode === 'lamps' ? [[p.P1, 'P₁ = ' + p.P1 + ' W'], [p.P2, 'P₂ = ' + p.P2 + ' W']] : [[d.P, 'R = ' + p.R + ' Ω']];
      items.forEach(([P, lab], i) => {
        const x = items.length === 1 ? cx : W * (0.3 + 0.4 * i); const glow = Math.min(1, P / (p.mode === 'lamps' ? 200 : 50));
        K.wire(ctx, [[x, y0], [x, y1]], cols);
        if (p.mode === 'lamps') { ctx.fillStyle = 'rgba(250,204,21,' + (0.15 + 0.8 * glow) + ')'; ctx.beginPath(); ctx.arc(x, (y0 + y1) / 2, 30 + 20 * glow, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = cols.text; ctx.beginPath(); ctx.arc(x, (y0 + y1) / 2, 26, 0, Math.PI * 2); ctx.stroke(); }
        else { ctx.fillStyle = 'rgba(239,68,68,' + (0.1 + 0.6 * glow) + ')'; ctx.beginPath(); ctx.arc(x, (y0 + y1) / 2, 50, 0, Math.PI * 2); ctx.fill(); K.resistor(ctx, x, (y0 + y1) / 2 - 40, x, (y0 + y1) / 2 + 40, '', cols); }
        D.txt(ctx, lab, x, y1 + 20, { color: cols.text, size: 13, w: '700' });
      });
      K.wire(ctx, [[items.length === 1 ? cx : W * 0.3, y0], [items.length === 1 ? cx + 120 : W * 0.7, y0]], cols); K.wire(ctx, [[items.length === 1 ? cx : W * 0.3, y1], [items.length === 1 ? cx + 120 : W * 0.7, y1]], cols);
      D.txt(ctx, 'V = ' + p.V + ' V', W / 2, H * 0.1, { color: cols.c2, size: nr ? 13 : 15, w: '700' });
    },
    graph(p, d) {
      if (p.mode === 'lamps') { const v = [d.I1, d.I2]; return { view: K.barView(v), xLabel: '', yLabel: 'I (A)', caption: 'المصباح ذو القدرة الأكبر يسحب تياراً أكبر على الجهد نفسه.', draw(G) { const c = G.colors(); K.bars(G, [['I₁', d.I1, c.c1], ['I₂', d.I2, c.c2]]); } }; }
      const Im = 240 / p.R; return { view: { xmin: 0, xmax: Im, ymin: 0, ymax: Im * Im * p.R * 1.1 }, xLabel: 'I (A)', yLabel: 'P (W)', caption: 'قانون جول: P = I²R، القدرة تتناسب مع مربع التيار.', draw(G) { const c = G.colors(); G.fn((I) => I * I * p.R, { color: c.c2, width: 3, domain: [0, Im] }); G.point(d.I, d.P, { color: c.c1 }); } };
    },
    explain(a, b, da, db) { const o = []; if (a.V !== b.V && b.mode === 'res') o.push('مضاعفة فرق الجهد على المقاومة نفسها تضاعف القدرة أربع مرات.'); if (a.R !== b.R) o.push('على جهد ثابت: المقاومة الأكبر تستهلك قدرة أقل.'); return o; },
    learn: ['**القدرة (4-8) ص66:** P = QV/t = IV = I²R = V²/R وتقاس بالواط W = J/s.', '**قانون جول:** معدل الحرارة المتولدة في مقاومة ثابتة يتناسب طردياً مع مربع التيار.', '**الطاقة:** Eₜₕ = P t، وبالكيلوواط ساعة = القدرة (kW) × الزمن (h).'],
    challenges: [
      { q: 'مثال (6): مقاومة 545 Ω على فرق جهد 12 V. ما الطاقة المستنفدة خلال 65 s؟', hint: 'R = 545 و V = 12 و t = 65.', init: { mode: 'res', V: 24, R: 100, t: 30 }, check: (p) => p.mode === 'res' && p.V === 12 && p.R === 545 && p.t === 65, why: () => 'P = 0.26 W و Eₜₕ ≈ 17 J.' },
      { q: 'مثال (7): مصباح 5 W ثم مصباح 10 W على الجهد نفسه. أيهما تياره أكبر؟', hint: 'اختر «مصباحان» واضبط P₂ = 10.', init: { mode: 'res' }, check: (p) => p.mode === 'lamps' && p.P1 === 5 && p.P2 === 10, why: () => 'I₂ = 2I₁ و R₁ = 2R₂.' }
    ],
    tutor: [
      { q: 'أي المصباحين مقاومته أكبر؟', k: ['مقاومته', 'مصباح'], a: () => K.tutor('استخدم P = V²/R مع ثبوت V.', 'المصباح ذو القدرة الأقل مقاومته أكبر.') },
      { q: 'ما قانون جول؟', k: ['جول'], a: () => K.tutor('كيف تتغير الحرارة إذا تضاعف التيار؟', 'P = I²R: معدل الحرارة يتناسب مع مربع التيار.') },
      { q: 'كيف أحسب الطاقة المستهلكة؟', k: ['طاقه', 'مستهلكه'], a: () => K.tutor('اضرب القدرة في الزمن.', 'Eₜₕ = P t.') }
    ]
  });

  /* ======================= توصيل المقاومات ص68–69 ======================= */
  K.reg({
    id: 'resistor-combos', unit: 4, order: 5, lesson: '—', lessonTitle: 'طرق توصيل المقاومات', page: 68,
    titleAr: 'توصيل المقاومات على التوالي والتوازي', titleEn: 'Series and Parallel Resistors', tags: 'توالي توازي مقاومة مكافئة تيار جهد ملتيميتر نشاط 4-4 مثال 8',
    formula: 'R_{eq} = R_1 + R_2 + R_3 ,\\qquad \\frac{1}{R_{eq}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}',
    book: 'نشاط (4-4) ص68: ثلاث مقاومات مع بطارية وملتيميتر على التوالي ثم على التوازي. مثال (8) ص69: 3 Ω و6 Ω على التوازي (2 Ω)، ثم مع 4 Ω و10 Ω على التوالي ⇒ 16 Ω.',
    summary: 'على التوالي: التيار نفسه في كل المقاومات ويتوزع الجهد عليها، والمكافئة مجموعها. على التوازي: الجهد نفسه على كل مقاومة ويتوزع التيار، ومقلوب المكافئة مجموع المقلوبات. القدرة الكلية تساوي مجموع قدرات المقاومات.',
    vars: [['R_1, R_2, R_3', 'المقاومات', '\\Omega', '1 – 60'], ['V', 'جهد البطارية', '\\mathrm{V}', '1 – 24'], ['R_{eq}', 'المقاومة المكافئة', '\\Omega', '—'], ['I', 'التيار الكلي', '\\mathrm{A}', '—']],
    assumptions: ['البطارية مثالية (مقاومتها الداخلية مهملة).', 'أسلاك التوصيل بلا مقاومة.'],
    params: [
      { key: 'mode', label: '\\text{التوصيل}', type: 'select', value: 'series', options: [['series', 'توالٍ'], ['parallel', 'توازٍ'], ['ex8', 'مثال (8)']] },
      { key: 'V', label: 'V\\ (\\mathrm{V})', min: 1, max: 24, step: 1, value: 12 },
      { key: 'R1', label: 'R_1\\ (\\Omega)', min: 1, max: 60, step: 1, value: 3 },
      { key: 'R2', label: 'R_2\\ (\\Omega)', min: 1, max: 60, step: 1, value: 6 },
      { key: 'R3', label: 'R_3\\ (\\Omega)', min: 1, max: 60, step: 1, value: 2 },
      { key: 'R4', label: 'R_4\\ (\\Omega)', min: 1, max: 60, step: 1, value: 1, hidden: (p) => p.mode !== 'ex8' }
    ],
    compute(p) {
      let Req, br;
      if (p.mode === 'series') { Req = p.R1 + p.R2 + p.R3; const I = p.V / Req; br = [p.R1, p.R2, p.R3].map((R) => ({ R: R, I: I, V: I * R })); }
      else if (p.mode === 'parallel') { Req = Q.parallel([p.R1, p.R2, p.R3]); br = [p.R1, p.R2, p.R3].map((R) => ({ R: R, I: p.V / R, V: p.V })); }
      else { const Rp = Q.parallel([p.R1, p.R2]); Req = Rp + p.R3 + p.R4; const I = p.V / Req; br = [{ R: p.R1, I: I * Rp / p.R1, V: I * Rp }, { R: p.R2, I: I * Rp / p.R2, V: I * Rp }].concat([p.R3, p.R4].map((R) => ({ R: R, I: I, V: I * R }))); br.Rp = Rp; }
      const I = p.V / Req; return { Req: Req, I: I, br: br, P: br.reduce((s, b) => s + b.I * b.V, 0), Rp: br.Rp };
    },
    live(p, d) { return p.mode === 'series' ? 'R_{eq} = ' + p.R1 + ' + ' + p.R2 + ' + ' + p.R3 + ' = ' + q(d.Req, '\\Omega') : p.mode === 'parallel' ? '\\frac{1}{R_{eq}} = \\frac{1}{' + p.R1 + '} + \\frac{1}{' + p.R2 + '} + \\frac{1}{' + p.R3 + '} \\Rightarrow R_{eq} = ' + q(d.Req, '\\Omega', 4) : 'R_{eq} = (' + p.R1 + ' \\parallel ' + p.R2 + ') + ' + p.R3 + ' + ' + p.R4 + ' = ' + n(d.Rp) + ' + ' + (p.R3 + p.R4) + ' = ' + q(d.Req, '\\Omega', 4); },
    results(p, d) { return [['المقاومة المكافئة', q(d.Req, '\\Omega', 4), true, 'pos'], ['التيار الكلي I = V/Rₑq', q(d.I, 'A', 4)]].concat(d.br.slice(0, 3).map((b, i) => ['R' + (i + 1) + ': التيار والجهد', ML.phys.sci(b.I, 3) + '\\ \\mathrm{A} ,\\ ' + ML.phys.sci(b.V, 3) + '\\ \\mathrm{V}'])).concat([['القدرة الكلية = مجموع القدرات', q(d.P, 'W', 4)]]); },
    steps(p, d) {
      if (p.mode === 'series') return ['Rₑq = R₁ + R₂ + R₃ = ' + n(d.Req) + ' Ω.', 'I = V / Rₑq = ' + n(d.I) + ' A في كل مقاومة.', 'الجهد يتوزع: ' + d.br.map((b) => n(b.V)).join(' + ') + ' = ' + p.V + ' V.'];
      if (p.mode === 'parallel') return ['1/Rₑq = 1/' + p.R1 + ' + 1/' + p.R2 + ' + 1/' + p.R3 + ' ⇒ Rₑq = ' + n(d.Req) + ' Ω.', 'الجهد ' + p.V + ' V على كل مقاومة.', 'التيار يتوزع: ' + d.br.map((b) => n(b.I)).join(' + ') + ' = ' + n(d.I) + ' A.'];
      return ['(' + p.R1 + ' Ω ∥ ' + p.R2 + ' Ω) = ' + n(d.Rp) + ' Ω.', 'Rₑq = ' + n(d.Rp) + ' + ' + p.R3 + ' + ' + p.R4 + ' = ' + n(d.Req) + ' Ω.'];
    },
    drawCustom(ctx, W, H, p, d, cols) {
      const nr = K.narrow(W); const xL = W * 0.12, xR = W * 0.88, yT = H * 0.3, yB = H * 0.82;
      K.wire(ctx, [[xL, yT], [xL, yB], [W / 2 - 10, yB]], cols); K.wire(ctx, [[W / 2 + 10, yB], [xR, yB], [xR, yT]], cols); K.battery(ctx, W / 2, yB, true, p.V + ' V', cols);
      const lab = (b, i) => 'R' + (i + 1) + '=' + b.R + 'Ω ' + n(b.I, 2) + 'A';
      if (p.mode === 'series') { const seg = (xR - xL) / 3; d.br.forEach((b, i) => K.resistor(ctx, xL + seg * i, yT, xL + seg * (i + 1), yT, lab(b, i), cols, [cols.c1, cols.c2, cols.c3][i])); }
      else if (p.mode === 'parallel') { const x0 = xL + (xR - xL) * 0.25, x1 = xL + (xR - xL) * 0.75; K.wire(ctx, [[xL, yT], [x0, yT]], cols); K.wire(ctx, [[x1, yT], [xR, yT]], cols); d.br.forEach((b, i) => { const y = yT - 60 + 60 * i; K.wire(ctx, [[x0, yT - 60], [x0, yT + 60]], cols); K.wire(ctx, [[x1, yT - 60], [x1, yT + 60]], cols); K.resistor(ctx, x0, y, x1, y, lab(b, i), cols, [cols.c1, cols.c2, cols.c3][i]); }); }
      else { const seg = (xR - xL) / 3; const x0 = xL, x1 = xL + seg; K.wire(ctx, [[x0, yT - 35], [x0, yT + 35]], cols); K.wire(ctx, [[x1, yT - 35], [x1, yT + 35]], cols); K.resistor(ctx, x0, yT - 35, x1, yT - 35, p.R1 + 'Ω', cols, cols.c1); K.resistor(ctx, x0, yT + 35, x1, yT + 35, p.R2 + 'Ω', cols, cols.c2); [p.R3, p.R4].forEach((R, i) => K.resistor(ctx, xL + seg * (i + 1), yT, xL + seg * (i + 2), yT, R + 'Ω', cols, cols.c3)); D.txt(ctx, 'A', xL - 12, yT, { color: cols.text, size: 13, w: '700' }); D.txt(ctx, 'B', xR + 12, yT, { color: cols.text, size: 13, w: '700' }); }
      D.txt(ctx, 'Rₑq = ' + n(d.Req) + ' Ω   I = ' + n(d.I) + ' A', W / 2, H * 0.08, { color: cols.text, size: nr ? 13 : 15, w: '700' });
    },
    graph(p, d) { const items = d.br.slice(0, p.mode === 'ex8' ? 4 : 3).map((b, i) => ['R' + (i + 1), b.V, '']); return { view: K.barView(items.map((x) => x[1])), xLabel: '', yLabel: 'V (V)', caption: p.mode === 'parallel' ? 'التوازي: الجهد نفسه على كل مقاومة.' : 'التوالي: الجهد يتوزع بنسبة المقاومات.', draw(G) { const c = G.colors(); K.bars(G, items.map((x, i) => [x[0], x[1], [c.c1, c.c2, c.c3, c.c4, c.c5][i]])); } }; },
    explain(a, b, da, db) { const o = []; if (a.mode !== b.mode) o.push(b.mode === 'parallel' ? 'التوازي يجعل المكافئة أصغر من أصغر مقاومة.' : b.mode === 'series' ? 'التوالي يجعل المكافئة أكبر من أكبر مقاومة.' : 'مثال (8): نبسّط التوازي أولاً ثم نجمع على التوالي.'); return o; },
    learn: ['**التوالي (نشاط 4-4):** Rₑq = R₁ + R₂ + R₃، التيار متساوٍ في المقاومات، ومجموع فروق الجهد يساوي جهد البطارية.', '**التوازي:** 1/Rₑq = 1/R₁ + 1/R₂ + 1/R₃، الجهد متساوٍ، ومجموع التيارات يساوي التيار الكلي.', '**القدرة الكلية** في الحالتين = مجموع القدرات المستهلكة في كل مقاومة.'],
    challenges: [
      { q: 'مثال (8): 3 Ω و6 Ω على التوازي ثم 4 Ω و10 Ω على التوالي. أوجد المكافئة بين A و B.', hint: 'اختر «مثال (8)» واضبط R₃ = 4 و R₄ = 10.', init: { mode: 'series', R1: 3, R2: 6, R3: 2, R4: 1 }, check: (p) => p.mode === 'ex8' && ((p.R1 === 3 && p.R2 === 6) || (p.R1 === 6 && p.R2 === 3)) && [p.R3, p.R4].sort((a, b) => a - b).join() === '4,10', why: () => '(3 ∥ 6) = 2 Ω ثم 2 + 4 + 10 = 16 Ω.' },
      { q: 'أسئلة الفصل: بثلاث مقاومات 12 Ω اجعل المكافئة 4 Ω.', hint: 'كلها على التوازي.', init: { mode: 'series', R1: 12, R2: 12, R3: 12 }, check: (p) => p.mode === 'parallel' && p.R1 === 12 && p.R2 === 12 && p.R3 === 12, why: () => '12/3 = 4 Ω.' }
    ],
    tutor: [
      { q: 'لماذا تقل المقاومة المكافئة عند التوصيل على التوازي؟', k: ['توازي', 'تقل'], a: () => K.tutor('هل يزيد عدد المسارات المتاحة للتيار؟', 'كل فرع جديد مسار إضافي للتيار، فيزداد التيار الكلي وتقل المكافئة.') },
      { q: 'ماذا يحدث للتيار في التوالي؟', k: ['توالي', 'تيار'], a: () => K.tutor('هل يوجد تفرع للتيار؟', 'التيار نفسه في كل المقاومات.') },
      { q: 'كيف أحل مثال (8)؟', k: ['مثال', '8'], a: () => K.tutor('ابدأ بالمقاومتين على التوازي.', '3 ∥ 6 = 2 Ω ثم 2 + 4 + 10 = 16 Ω.') }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
