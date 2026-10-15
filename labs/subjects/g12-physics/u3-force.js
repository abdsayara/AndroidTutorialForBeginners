/* فيزياء الثاني عشر — الوحدة الثالثة، الفصل 7: القوة المغناطيسية (ص110–122) */
(function (root) {
  'use strict';
  const ML = root.ML; const D = ML.pdraw; const Q = ML.phys12; const K = ML.p12;
  const n = K.n, q = K.qT, sct = K.sctT, sci = K.sciT;
  const lbl = (ctx, t, x, y, color, cols, size) => D.txt(ctx, t, x, y, { color: color || cols.text, size: size || 12, w: '700', halo: cols.bg });
  const rad = (deg) => deg * Math.PI / 180;

  /* ======================= 1-7 القوة على شحنة متحركة ص111–112 ======================= */
  K.reg({
    id: 'force-on-charge', unit: 7, order: 1, lesson: '1-7', lessonTitle: 'القوة المغناطيسية المؤثرة في شحنة متحركة', page: 111,
    titleAr: 'القوة المغناطيسية على شحنة متحركة', titleEn: 'Magnetic Force on a Moving Charge', tags: 'قوة مغناطيسية شحنة سرعة زاوية تسلا قاعدة اليد اليمنى المفتوحة ضرب اتجاهي مثال 1 مثال 2',
    formula: 'F = q\\,v \\times B ,\\qquad F = q v B \\sin\\theta',
    book: 'القانون (7-1) وقاعدة اليد اليمنى المفتوحة ص111. مثال (1) ص112: شحنة 8.4 μC بسرعة 100 m/s في مجال 0.3 T باتجاه +x عند الزوايا 30° و90° و180° و150° ⇒ 1.26 × 10⁻⁴ ، 2.52 × 10⁻⁴ ، 0 ، 1.26 × 10⁻⁴ N. مثال (2): إلكترون قرب سلك ⇒ 3.2 × 10⁻¹⁷ N.',
    summary: 'المجال المغناطيسي لا يؤثر في الشحنة الساكنة، ويؤثر في المتحركة بقوة تتناسب مع الشحنة والمجال ومركبة السرعة العمودية على المجال. اتجاه القوة عمودي على المستوى الذي يحوي v و B (اليد اليمنى للموجبة واليسرى للسالبة).',
    vars: [['q', 'الشحنة', '\\mu\\mathrm{C}', '−10 – 10'], ['v', 'السرعة', '\\mathrm{m/s}', '0 – 1000'], ['B', 'المجال (باتجاه +x)', '\\mathrm{T}', '0 – 1'], ['\\theta', 'الزاوية بين v و B', '^\\circ', '0 – 180']],
    assumptions: ['المجال منتظم باتجاه +x، والسرعة في مستوى الصفحة.'],
    params: [
      { key: 'qc', label: 'q\\ (\\mu\\mathrm{C})', min: -10, max: 10, step: 0.1, value: 5 },
      { key: 'v', label: 'v\\ (\\mathrm{m/s})', min: 0, max: 1000, step: 10, value: 100 },
      { key: 'B', label: 'B\\ (\\mathrm{T})', min: 0, max: 1, step: 0.05, value: 0.3 },
      { key: 'th', label: '\\theta\\ (^\\circ)', min: 0, max: 180, step: 5, value: 60 }
    ],
    compute(p) { const F = Q.Fcharge(p.qc * 1e-6, p.v, p.B, p.th); return { F: Math.abs(F) < 1e-15 ? 0 : F, into: (p.qc > 0) === (Math.sin(rad(p.th)) > 0) }; },
    live(p, d) { return 'F = ' + Math.abs(p.qc) + ' \\times 10^{-6} \\times ' + p.v + ' \\times ' + p.B + ' \\times \\sin' + p.th + '^\\circ = ' + q(d.F, 'N', 3); },
    results(p, d) { return [['مقدار القوة F', q(d.F, 'N', 3), true, 'pos'], ['اتجاه القوة', d.F === 0 ? 'لا قوة' : d.into ? 'بعيداً عن الناظر ⊗' : 'نحو الناظر ⊙', false], ['مركبة السرعة العمودية على B', q(p.v * Math.sin(rad(p.th)), 'm/s', 3)]]; },
    steps(p, d) { return ['F = |q| v B sinθ = ' + Math.abs(p.qc) + '×10⁻⁶ × ' + p.v + ' × ' + p.B + ' × sin' + p.th + '° = ' + sct(d.F, 3) + ' N.', d.F === 0 ? 'السرعة موازية للمجال (أو الشحنة ساكنة) ⇒ لا قوة.' : 'الاتجاه عمودي على v و B: ' + (d.into ? 'بعيداً عن الناظر.' : 'نحو الناظر.') + (p.qc < 0 ? ' (للشحنة السالبة نستخدم اليد اليسرى).' : '')]; },
    drawCustom(ctx, W, H, p, d, cols) {
      const cx = W / 2, cy = H * 0.55; for (let j = -2; j <= 2; j++) D.arrow(ctx, 30, cy + j * H * 0.15, W - 30, cy + j * H * 0.15, cols.grid, 1.5);
      lbl(ctx, 'B →', W - 50, cy - H * 0.3 - 14, cols.muted, cols, 13);
      ctx.fillStyle = p.qc >= 0 ? cols.c2 : cols.c1; ctx.beginPath(); ctx.arc(cx, cy, 13, 0, Math.PI * 2); ctx.fill(); D.txt(ctx, p.qc >= 0 ? '+' : '−', cx, cy, { color: '#fff', size: 15, w: '700' });
      const L = 30 + p.v / 1000 * Math.min(W, H) * 0.32; K.vec(ctx, cx, cy, Math.cos(rad(p.th)) * L, -Math.sin(rad(p.th)) * L, cols.c3, 'v', cols);
      ctx.strokeStyle = cols.c5; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, 34, -rad(p.th), 0); ctx.stroke(); lbl(ctx, 'θ = ' + p.th + '°', cx + 52, cy - 18, cols.c5, cols);
      if (d.F > 0) { K.perp(ctx, cx - 60, cy - 60, 14, !d.into, cols.c4); lbl(ctx, 'F', cx - 60, cy - 86, cols.c4, cols, 14); }
      D.txt(ctx, 'F = ' + sct(d.F, 3) + ' N', W / 2, H * 0.08, { color: cols.text, size: K.narrow(W) ? 14 : 16, w: '700' });
    },
    graph(p, d) { const Fm = Math.abs(p.qc) * 1e-6 * p.v * p.B; return { view: { xmin: 0, xmax: 180, ymin: 0, ymax: Math.max(Fm, 1e-6) * 1.2 }, xLabel: 'θ (°)', yLabel: 'F (N)', caption: 'القوة عظمى عند 90° وتنعدم عند 0° و180°.', draw(G) { const c = G.colors(); G.fn((t) => Fm * Math.sin(rad(t)), { color: c.c1, width: 3, domain: [0, 180] }); G.point(p.th, d.F, { color: c.c2 }); } }; },
    explain(a, b, da, db) { const o = []; if (a.th !== b.th && (b.th === 0 || b.th === 180)) o.push('السرعة موازية للمجال: لا قوة مغناطيسية.'); if (Math.sign(a.qc) !== Math.sign(b.qc)) o.push('تغيير نوع الشحنة يعكس اتجاه القوة.'); return o; },
    learn: ['**(7-1) ص111:** F = q v × B ومقدارها qvB sinθ.', '**اتجاه القوة:** ابسط يدك اليمنى: الإبهام باتجاه v والأصابع باتجاه B، فتكون القوة عمودية على راحة اليد للخارج (اليسرى للشحنة السالبة).', '**التسلا:** مجال يؤثر بقوة 1 N في شحنة 1 C تتحرك بسرعة 1 m/s عمودياً عليه.', 'لا يؤثر المجال في بروتون ساكن ولا في نيوترون متحرك.'],
    challenges: [
      { q: 'مثال (1-a): شحنة 8.4 μC بسرعة 100 m/s في مجال 0.3 T والزاوية 30°.', hint: 'q = 8.4 ، v = 100 ، B = 0.3 ، θ = 30.', init: { qc: 5, v: 100, B: 0.3, th: 60 }, check: (p) => Math.abs(p.qc - 8.4) < 1e-9 && p.v === 100 && Math.abs(p.B - 0.3) < 1e-9 && p.th === 30, why: () => 'F = 1.26×10⁻⁴ N بعيداً عن الناظر.' },
      { q: 'مثال (1-c): اجعل الشحنة تتحرك في المجال دون أن تتأثر بقوة.', hint: 'متى يكون sinθ = 0؟', init: { qc: 8.4, v: 100, B: 0.3, th: 60 }, check: (p, d) => p.v > 0 && p.B > 0 && p.qc !== 0 && d.F === 0, why: () => 'θ = 0° أو 180°: السرعة موازية للمجال.' }
    ],
    tutor: [
      { q: 'لماذا لا تتأثر شحنة متحركة بقوة في مجال مغناطيسي أحياناً؟', k: ['لا تتاثر', 'لم يتاثر'], a: () => K.tutor('ما قيمة sinθ إذا كانت السرعة موازية للمجال؟', 'إذا تحركت موازية للمجال تكون sinθ = 0 فلا قوة.') },
      { q: 'كيف أحدد اتجاه القوة؟', k: ['اتجاه'], a: () => K.tutor('استخدم اليد اليمنى المفتوحة للشحنة الموجبة.', 'الإبهام مع v، والأصابع مع B، والقوة عمودية على الكف للخارج.') },
      { q: 'هل يؤثر المجال في نيوترون متحرك؟', k: ['نيوترون'], a: () => K.tutor('ما شحنة النيوترون؟', 'لا، لأنه متعادل (q = 0).') }
    ]
  });

  /* ======================= 2-7 حركة جسيم مشحون في مجال منتظم ص112–114 ======================= */
  K.reg({
    id: 'charge-circle', unit: 7, order: 2, lesson: '2-7', lessonTitle: 'حركة جسيم مشحون في مجال مغناطيسي منتظم', page: 113,
    titleAr: 'المسار الدائري لجسيم مشحون في مجال مغناطيسي', titleEn: 'Circular Motion of a Charge in a Magnetic Field', tags: 'مسار دائري نصف قطر زمن دوري تردد تردد زاوي جسيم مشحون مجال منتظم مثال 3',
    formula: 'r = \\frac{mv}{qB} ,\\quad T = \\frac{2\\pi m}{qB} ,\\quad f = \\frac{qB}{2\\pi m} ,\\quad \\omega = \\frac{qB}{m}',
    book: 'القوانين (7-2) إلى (7-5) ص113. مثال (3) ص114: q = 3.2 × 10⁻¹⁹ C ، m = 4 × 10⁻²⁸ kg ، v = 10⁷ m/s ، B = 0.1 T ⇒ F = 3.2 × 10⁻¹³ N ، r = 0.125 m ، f = 1.27 × 10⁷ Hz ، T = 7.87 × 10⁻⁸ s.',
    summary: 'القوة المغناطيسية عمودية دائماً على السرعة، فتغير اتجاهها دون مقدارها، فيتحرك الجسيم في دائرة (القوة المغناطيسية هي القوة المركزية). نصف القطر يتناسب مع السرعة، أما الزمن الدوري فلا يعتمد على السرعة.',
    vars: [['q', 'الشحنة', '\\times 1.6 \\times 10^{-19}\\ \\mathrm{C}', '1 – 3'], ['m', 'الكتلة', '\\times 10^{-28}\\ \\mathrm{kg}', '1 – 20'], ['v', 'السرعة', '\\times 10^{6}\\ \\mathrm{m/s}', '1 – 20'], ['B', 'المجال (للداخل ⊗)', '\\mathrm{T}', '0.05 – 1']],
    assumptions: ['الجسيم يدخل عمودياً على المجال المنتظم.', 'سرعة الدوران في الرسم مبطّأة كثيراً للتوضيح.'],
    params: [
      { key: 'qe', label: 'q\\ (e)', min: 1, max: 3, step: 1, value: 1 },
      { key: 'm', label: 'm\\ (10^{-28}\\,\\mathrm{kg})', min: 1, max: 20, step: 1, value: 4 },
      { key: 'v', label: 'v\\ (10^{6}\\,\\mathrm{m/s})', min: 1, max: 20, step: 1, value: 5 },
      { key: 'B', label: 'B\\ (\\mathrm{T})', min: 0.05, max: 1, step: 0.05, value: 0.1 }
    ],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0 }),
    tick(st, p, d, dt) { st.t += dt; },
    compute(p) { const qq = p.qe * Q.e, m = p.m * 1e-28, v = p.v * 1e6; const r = Q.radius(m, v, qq, p.B), T = Q.period(m, qq, p.B); return { qq: qq, F: qq * v * p.B, r: r, T: T, f: 1 / T, w: 2 * Math.PI / T }; },
    live(p, d) { return 'r = \\frac{mv}{qB} = \\frac{' + p.m + ' \\times 10^{-28} \\times ' + p.v + ' \\times 10^{6}}{' + sci(d.qq, 3) + ' \\times ' + p.B + '} = ' + q(d.r, 'm', 3); },
    results(p, d) { return [['القوة المغناطيسية F', q(d.F, 'N', 3)], ['نصف القطر r', q(d.r, 'm', 3), true, 'pos'], ['التردد f', q(d.f, 'Hz', 3)], ['الزمن الدوري T', q(d.T, 's', 3)], ['التردد الزاوي ω', q(d.w, 'rad/s', 3)]]; },
    steps(p, d) { return ['F = qvB = ' + sct(d.F, 3) + ' N (قوة مركزية).', 'qvB = mv²/r ⇒ r = mv/(qB) = ' + n(d.r, 4) + ' m.', 'f = qB/(2πm) = ' + sct(d.f, 3) + ' Hz ، T = 1/f = ' + sct(d.T, 3) + ' s.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      K.fieldGrid(ctx, 10, 30, W - 20, H - 40, false, cols.grid, 40);
      const S = Math.min(W, H) * 0.4, R = Math.max(8, S * Math.min(1, d.r / 0.5)); const cx = W / 2, cy = H * 0.55 - R * 0; const st = d.st || { t: 0 };
      ctx.strokeStyle = cols.c1; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      const a = Math.PI / 2 - st.t * 2 * Math.PI / (1 + 3 * (d.T / 2e-7)); const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
      K.vec(ctx, x, y, -Math.sin(a) * -36, Math.cos(a) * -36, cols.c3, 'v', cols); K.vec(ctx, x, y, (cx - x) / R * 32, (cy - y) / R * 32, cols.c2, 'F', cols);
      ctx.fillStyle = cols.c2; ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill(); D.txt(ctx, '+', x, y, { color: '#fff', size: 12, w: '700' });
      lbl(ctx, 'r = ' + n(d.r, 4) + ' m' + (d.r > 0.5 ? ' (مصغّر)' : ''), cx, cy, cols.c1, cols, 13);
      D.txt(ctx, 'T = ' + sct(d.T, 3) + ' s', W / 2, H * 0.06, { color: cols.text, size: K.narrow(W) ? 14 : 16, w: '700' });
    },
    graph(p, d) { const k = d.r / p.v; return { view: { xmin: 0, xmax: 20, ymin: 0, ymax: k * 20 * 1.1 }, xLabel: 'v (10⁶ m/s)', yLabel: 'r (m)', caption: 'نصف القطر يتناسب طردياً مع السرعة، والزمن الدوري ثابت (' + sct(d.T, 3) + ' s).', draw(G) { const c = G.colors(); G.fn((v) => k * v, { color: c.c1, width: 3, domain: [0, 20] }); G.point(p.v, d.r, { color: c.c2 }); } }; },
    explain(a, b, da, db) { const o = []; if (a.v !== b.v) o.push('تغيير السرعة غيّر نصف القطر فقط؛ الزمن الدوري لا يعتمد على السرعة.'); if (a.B !== b.B) o.push('زيادة المجال تصغّر نصف القطر وتقصّر الزمن الدوري.'); return o; },
    learn: ['**(7-2) ص113:** qvB = mv²/r ⇒ r = mv/(qB).', '**(7-3) و(7-4) و(7-5):** T = 2πm/(qB) ، f = qB/(2πm) ، ω = qB/m.', '**أناقش:** القوة المغناطيسية لا تبذل شغلاً (عمودية على الحركة)، فلا تتغير الطاقة الحركية، بينما يتغير الزخم الخطي اتجاهاً.'],
    challenges: [
      { q: 'مثال (3): q = 3.2×10⁻¹⁹ C ، m = 4×10⁻²⁸ kg ، v = 10⁷ m/s ، B = 0.1 T. أوجد r و f و T.', hint: 'q = 2e ، m = 4 ، v = 10 ، B = 0.1.', init: { qe: 1, m: 4, v: 5, B: 0.1 }, check: (p) => p.qe === 2 && p.m === 4 && p.v === 10 && Math.abs(p.B - 0.1) < 1e-9, why: () => 'r = 0.125 m ، f = 1.27×10⁷ Hz ، T = 7.87×10⁻⁸ s.' },
      { q: 'من قيم مثال (3) ضاعف السرعة: هل يتغير الزمن الدوري؟ اجعل r = 0.25 m.', hint: 'v = 20 مع بقية قيم المثال.', init: { qe: 2, m: 4, v: 10, B: 0.1 }, check: (p, d) => p.qe === 2 && p.m === 4 && Math.abs(d.r - 0.25) < 1e-9, why: () => 'تضاعف r إلى 0.25 m وبقي T كما هو.' }
    ],
    tutor: [
      { q: 'هل تتغير الطاقة الحركية للجسيم؟', k: ['طاقه', 'حركيه'], a: () => K.tutor('هل تبذل قوة عمودية على الحركة شغلاً؟', 'لا، القوة المغناطيسية عمودية على السرعة فلا تبذل شغلاً.') },
      { q: 'ماذا يحدث للزمن الدوري عند مضاعفة السرعة؟', k: ['دوري', 'مضاعفه'], a: () => K.tutor('هل تظهر v في T = 2πm/(qB)؟', 'لا يتغير؛ يتضاعف نصف القطر فقط.') },
      { q: 'لماذا يتحرك الجسيم في دائرة؟', k: ['دائره', 'لماذا'], a: () => K.tutor('ما الزاوية بين القوة المغناطيسية والسرعة؟', 'القوة عمودية دائماً على السرعة، فهي قوة مركزية تغيّر الاتجاه فقط.') }
    ]
  });

  /* ======================= 3-7 السيكلترون ص114–115 ======================= */
  K.reg({
    id: 'cyclotron', unit: 7, order: 3, lesson: '3-7', lessonTitle: 'السيكلترون', page: 114,
    titleAr: 'السيكلترون: تسريع الجسيمات المشحونة', titleEn: 'The Cyclotron', tags: 'سيكلترون نصفا قرص D تردد جهد متردد تسريع نظائر مشعة مثال 4',
    formula: 'f = \\frac{qB}{2\\pi m} ,\\qquad v = \\frac{qBr}{m}',
    book: 'السيكلترون وآلية عمله ص114–115. مثال (4) ص115: نصف القطر 3 m ، q = 1.6 × 10⁻¹⁹ C ، B = 0.628 T ، تردد الجهد 4 × 10³ Hz ⇒ m = 4 × 10⁻²⁴ kg و v = 7.5 × 10⁴ m/s.',
    summary: 'يتسارع الجسيم في الفجوة بين نصفي القرص بفعل المجال الكهربائي، ويدور داخل كل نصف بفعل المجال المغناطيسي. يُضبط تردد الجهد المتردد ليساوي تردد دوران الجسيم، فيزداد نصف القطر كل نصف دورة حتى يخرج بسرعة v = qBr/m.',
    vars: [['f', 'تردد الجهد المتردد', '\\mathrm{kHz}', '1 – 10'], ['B', 'المجال المغناطيسي', '\\mathrm{T}', '0.1 – 1.5'], ['r', 'نصف قطر السيكلترون', '\\mathrm{m}', '0.5 – 6'], ['q', 'الشحنة', 'e', '1 – 3']],
    assumptions: ['عدد الدورات في الرسم قليل للتوضيح فقط.'],
    params: [
      { key: 'qe', label: 'q\\ (e)', min: 1, max: 3, step: 1, value: 1 },
      { key: 'B', label: 'B\\ (\\mathrm{T})', min: 0.1, max: 1.5, step: 0.001, value: 0.5 },
      { key: 'f', label: 'f\\ (\\mathrm{kHz})', min: 1, max: 10, step: 0.5, value: 2 },
      { key: 'R', label: 'r\\ (\\mathrm{m})', min: 0.5, max: 6, step: 0.5, value: 2 }
    ],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0 }),
    tick(st, p, d, dt) { st.t += dt; if (st.t > 8) st.t = 0; },
    compute(p) { const qq = p.qe * Q.e, f = p.f * 1e3; const m = qq * p.B / (2 * Math.PI * f); const v = qq * p.B * p.R / m; return { qq: qq, m: m, v: v, K: 0.5 * m * v * v }; },
    live(p, d) { return 'm = \\frac{qB}{2\\pi f} = \\frac{' + sci(d.qq, 3) + ' \\times ' + p.B + '}{2\\pi \\times ' + p.f * 1e3 + '} = ' + q(d.m, 'kg', 3) + ' ,\\quad v = \\frac{qBr}{m} = ' + q(d.v, 'm/s', 3); },
    results(p, d) { return [['كتلة الجسيم m', q(d.m, 'kg', 3), true, 'pos'], ['سرعة الخروج v', q(d.v, 'm/s', 3), true, 'pos'], ['الطاقة الحركية عند الخروج', q(d.K, 'J', 3)]]; },
    steps(p, d) { return ['تردد الجهد = تردد الدوران: f = qB/(2πm) ⇒ m = qB/(2πf) = ' + sct(d.m, 3) + ' kg.', 'r = mv/(qB) ⇒ v = qBr/m = ' + sct(d.v, 3) + ' m/s.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const cx = W / 2, cy = H * 0.5, S = Math.min(W * 0.4, H * 0.36); const gap = 8;
      [[-1, cols.c1], [1, cols.c4]].forEach(([s, c]) => { ctx.fillStyle = c; ctx.globalAlpha = 0.15; ctx.beginPath(); ctx.arc(cx + s * gap, cy, S, s > 0 ? -Math.PI / 2 : Math.PI / 2, s > 0 ? Math.PI / 2 : 3 * Math.PI / 2); ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.stroke(); });
      lbl(ctx, 'D', cx - S * 0.6, cy - S * 0.6, cols.c1, cols, 16); lbl(ctx, 'D', cx + S * 0.6, cy - S * 0.6, cols.c4, cols, 16);
      // مسار حلزوني: نصف دائرة في كل قرص، ويزداد نصف القطر بعد كل عبور للفجوة
      const tot = 12, st = d.st || { t: 0 }; const prog = Math.min(tot, st.t / 8 * tot * 1.1); const pts = [];
      for (let k = 0; k < tot; k++) { const rk = S * Math.sqrt((k + 1) / tot) * 0.92, s = k % 2 ? -1 : 1, ox = cx + s * gap; for (let j = 0; j <= 24; j++) { const a = Math.PI / 2 - j / 24 * Math.PI; pts.push([k + j / 24, ox + s * rk * Math.cos(a), cy - s * rk * Math.sin(a)]); } }
      ctx.strokeStyle = cols.c2; ctx.globalAlpha = 0.25; ctx.lineWidth = 1.5; ctx.beginPath(); pts.forEach((P, i) => (i ? ctx.lineTo(P[1], P[2]) : ctx.moveTo(P[1], P[2]))); ctx.stroke(); ctx.globalAlpha = 1;
      const done = pts.filter((P) => P[0] <= prog); let px = cx, py = cy;
      if (done.length) { ctx.lineWidth = 2.5; ctx.beginPath(); done.forEach((P, i) => (i ? ctx.lineTo(P[1], P[2]) : ctx.moveTo(P[1], P[2]))); ctx.stroke(); px = done[done.length - 1][1]; py = done[done.length - 1][2]; }
      ctx.fillStyle = cols.c2; ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();
      lbl(ctx, '~  f = ' + p.f + ' kHz', cx, cy + S + 18, cols.text, cols, 13);
      D.txt(ctx, 'v = ' + sct(d.v, 3) + ' m/s', W / 2, H * 0.06, { color: cols.text, size: K.narrow(W) ? 14 : 16, w: '700' });
    },
    graph(p, d) { const k = d.v / p.R; return { view: { xmin: 0, xmax: 6, ymin: 0, ymax: k * 6 * 1.1 }, xLabel: 'r (m)', yLabel: 'v (m/s)', caption: 'سرعة الخروج تتناسب مع نصف قطر السيكلترون: v = 2πf r.', draw(G) { const c = G.colors(); G.fn((r) => k * r, { color: c.c1, width: 3, domain: [0, 6] }); G.point(p.R, d.v, { color: c.c2 }); } }; },
    explain(a, b, da, db) { const o = []; if (a.R !== b.R) o.push('السيكلترون الأكبر يُخرج الجسيم بسرعة أكبر.'); return o; },
    learn: ['**مكوناته ص114:** نصفا قرص نحاسي (D) مفرغان من الهواء، في مجال مغناطيسي منتظم، ومتصلان بمصدر جهد متردد عالي التردد.', '**آلية عمله:** يتسارع الجسيم في الفجوة، ويدور نصف دورة في كل قرص، ويُضبط التردد = qB/(2πm) لتنعكس القطبية لحظة وصوله إلى الفجوة.', '**سرعة الخروج ص115:** v = qBr/m.'],
    challenges: [
      { q: 'مثال (4): سيكلترون نصف قطره 3 m ومجاله 0.628 T وتردده 4×10³ Hz يسرّع شحنة 1.6×10⁻¹⁹ C.', hint: 'q = 1e ، B = 0.628 ، f = 4 ، r = 3.', init: { qe: 1, B: 0.5, f: 2, R: 2 }, check: (p) => p.qe === 1 && Math.abs(p.B - 0.628) < 1e-9 && p.f === 4 && p.R === 3, why: () => 'm = 4×10⁻²⁴ kg و v ≈ 7.5×10⁴ m/s.' },
      { q: 'بالجسيم نفسه في مثال (4)، ضاعف سرعة الخروج.', hint: 'ضاعف نصف القطر.', init: { qe: 1, B: 0.628, f: 4, R: 3 }, check: (p) => p.qe === 1 && Math.abs(p.B - 0.628) < 1e-9 && p.f === 4 && p.R === 6, why: () => 'v ∝ r ⇒ r = 6 m.' }
    ],
    tutor: [
      { q: 'لماذا يجب أن يساوي تردد الجهد تردد دوران الجسيم؟', k: ['تردد', 'يساوي'], a: () => K.tutor('متى يجب أن تنعكس القطبية؟', 'لتنعكس القطبية لحظة وصول الجسيم إلى الفجوة فيتسارع في كل مرة.') },
      { q: 'لماذا يفرغ السيكلترون من الهواء؟', k: ['هواء', 'مفرغ'], a: () => K.tutor('ماذا يحدث لو اصطدم الجسيم بجزيئات الهواء؟', 'لتقليل تصادم الجسيمات بجزيئات الهواء.') },
      { q: 'ما استخدامات السيكلترون؟', k: ['استخدام'], a: () => K.tutor('ماذا نفعل بجسيمات سريعة جداً؟', 'قذف نوى الذرات وإنتاج النظائر المشعة للتشخيص والعلاج.') }
    ]
  });

  /* ======================= 4-7 القوة على موصل ص116–117 ======================= */
  K.reg({
    id: 'force-on-wire', unit: 7, order: 4, lesson: '4-7', lessonTitle: 'القوة المغناطيسية المؤثرة في موصل يسري فيه تيار', page: 116,
    titleAr: 'القوة المغناطيسية على سلك يحمل تياراً', titleEn: 'Magnetic Force on a Current-Carrying Wire', tags: 'قوة سلك تيار مجال طول زاوية رفع السلك وزن كثافة طولية نشاط 1-7 مثال 5',
    formula: 'F = I\\,L \\times B ,\\qquad F = I L B \\sin\\theta',
    book: 'نشاط (1-7) والقانون (7-6) ص116. مثال (5) ص117: سلك نحاس كثافته الطولية 46.6 g/m يحمل 5 A نحو −x ، أقل مجال يرفعه نحو الناظر مقداره 0.0932 T (g = 10).',
    summary: 'المجال المغناطيسي يؤثر في سلك يحمل تياراً بقوة تساوي محصلة القوى على شحناته المتحركة، وتتناسب مع التيار والمجال وطول السلك وجيب الزاوية بينهما. اتجاهها بقاعدة الكف المفتوحة، وينعكس بعكس التيار.',
    vars: [['I', 'التيار', '\\mathrm{A}', '0 – 10'], ['B', 'المجال (نحو الناظر ⊙)', '\\mathrm{T}', '0 – 0.2'], ['\\lambda', 'كتلة وحدة الطول', '\\mathrm{g/m}', '10 – 100'], ['\\theta', 'الزاوية بين السلك والمجال', '^\\circ', '0 – 90']],
    assumptions: ['طول السلك داخل المجال 1 m، و g = 10 m/s² كما في حل المثال.'],
    params: [
      { key: 'dir', label: '\\text{اتجاه التيار}', type: 'select', value: 'px', options: [['mx', 'نحو −x'], ['px', 'نحو +x']] },
      { key: 'I', label: 'I\\ (\\mathrm{A})', min: 0, max: 10, step: 0.5, value: 3 },
      { key: 'B', label: 'B\\ (\\mathrm{T})', min: 0, max: 0.2, step: 0.0001, value: 0.05 },
      { key: 'lam', label: '\\lambda\\ (\\mathrm{g/m})', min: 10, max: 100, step: 0.1, value: 46.6 },
      { key: 'th', label: '\\theta\\ (^\\circ)', min: 0, max: 90, step: 5, value: 90 }
    ],
    compute(p) { const F = Q.Fwire(p.B, p.I, 1, p.th); const Wt = p.lam * 1e-3 * K.g; const up = p.dir === 'mx'; const net = (up ? F : -F) - Wt; return { F: F, Wt: Wt, up: up, net: net, Bmin: Wt / Math.max(1e-9, p.I) }; },
    live(p, d) { return 'F = ILB\\sin\\theta = ' + p.I + ' \\times 1 \\times ' + p.B + ' \\times \\sin' + p.th + '^\\circ = ' + q(d.F, 'N', 4) + ' ,\\quad mg = ' + q(d.Wt, 'N', 4); },
    results(p, d) { const bal = Math.abs(d.net) < 1e-9; return [['القوة المغناطيسية', q(d.F, 'N', 4) + (d.F > 0 ? (d.up ? '\\ \\uparrow' : '\\ \\downarrow') : ''), true, 'pos'], ['وزن 1 m من السلك', q(d.Wt, 'N', 4)], ['حالة السلك', bal ? 'متزن: القوة المغناطيسية = الوزن' : d.net > 0 ? 'يرتفع إلى أعلى' : 'لا يرتفع', false, bal ? 'pos' : ''], ['أقل مجال لرفعه بهذا التيار', p.I > 0 ? q(d.Bmin, 'T', 4) : '\\text{يلزم تيار}']]; },
    steps(p, d) { return ['F = I L B sinθ = ' + n(d.F, 4) + ' N، اتجاهها ' + (d.up ? 'لأعلى (التيار نحو −x والمجال نحو الناظر).' : 'لأسفل.'), 'الوزن = λ L g = ' + p.lam + '×10⁻³ × 1 × 10 = ' + n(d.Wt, 4) + ' N.', 'أقل مجال: B = mg/(IL) = ' + (p.I > 0 ? n(d.Bmin, 4) : '—') + ' T.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      K.fieldGrid(ctx, 20, 40, W - 40, H - 60, true, cols.grid, 44);
      const y = H * 0.55 - Math.max(-1, Math.min(1, d.net / Math.max(d.Wt, 1e-6))) * H * 0.15; const x0 = W * 0.1, x1 = W * 0.9;
      ctx.strokeStyle = '#c2410c'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      if (p.I > 0) D.arrow(ctx, W / 2 + (d.up ? 40 : -40), y + 18, W / 2 + (d.up ? -40 : 40), y + 18, cols.c2, 2.5); lbl(ctx, 'I = ' + p.I + ' A', W / 2, y + 36, cols.c2, cols);
      if (d.F > 0) K.vec(ctx, W * 0.35, y, 0, (d.up ? -1 : 1) * Math.min(H * 0.3, 20 + 60 * d.F / Math.max(d.Wt, 1e-6)), cols.c3, 'F', cols);
      K.vec(ctx, W * 0.65, y, 0, 60, cols.c4, 'mg', cols);
      D.txt(ctx, Math.abs(d.net) < 1e-9 ? 'متزن' : d.net > 0 ? 'يرتفع' : 'لا يرتفع', W / 2, H * 0.08, { color: cols.text, size: K.narrow(W) ? 14 : 16, w: '700' });
    },
    graph(p, d) { const Fm = 10 * p.B * Math.sin(rad(p.th)); return { view: { xmin: 0, xmax: 10, ymin: 0, ymax: Math.max(Fm, d.Wt) * 1.25 }, xLabel: 'I (A)', yLabel: 'F (N)', caption: 'القوة المغناطيسية تتناسب مع التيار؛ يتزن السلك عند تقاطعها مع خط الوزن.', draw(G) { const c = G.colors(); G.fn((I) => I * p.B * Math.sin(rad(p.th)), { color: c.c1, width: 3, domain: [0, 10] }); G.hline(d.Wt, { color: c.c4, dash: [6, 4] }); G.point(p.I, d.F, { color: c.c2 }); } }; },
    explain(a, b, da, db) { const o = []; if (a.dir !== b.dir) o.push('عكس التيار يعكس اتجاه القوة المغناطيسية (نشاط 1-7).'); if (a.th !== b.th && b.th === 0) o.push('السلك موازٍ للمجال: لا قوة.'); return o; },
    learn: ['**نشاط (1-7):** يتحرك الموصل عند غلق الدارة، وينعكس اتجاه حركته بعكس أقطاب البطارية.', '**(7-6) ص116:** F = I L × B ومقدارها ILB sinθ.', '**قاعدة الكف المفتوحة:** الأصابع باتجاه B والإبهام باتجاه التيار، فتكون القوة عمودية على الكف للخارج.'],
    challenges: [
      { q: 'مثال (5): سلك 46.6 g/m يحمل 5 A نحو −x. اضبط أقل مجال يرفعه (يتزن).', hint: 'B = mg/(IL) = 0.0932 T.', init: { dir: 'mx', I: 3, B: 0.05, lam: 46.6, th: 90 }, check: (p, d) => p.dir === 'mx' && p.I === 5 && Math.abs(p.lam - 46.6) < 1e-9 && p.th === 90 && Math.abs(d.net) < 1e-6, why: () => 'B = 0.466 ÷ 5 = 0.0932 T نحو الناظر.' },
      { q: 'نشاط (1-7): اعكس التيار في سلك مرفوع واجعل القوة المغناطيسية لأسفل.', hint: 'غيّر اتجاه التيار.', init: { dir: 'mx', I: 5, B: 0.1 }, check: (p, d) => p.dir === 'px' && d.F > 0, why: () => 'انعكست القوة مع انعكاس التيار.' }
    ],
    tutor: [
      { q: 'كيف أحدد اتجاه القوة على السلك؟', k: ['اتجاه'], a: () => K.tutor('استخدم الكف المفتوحة لليد اليمنى.', 'الأصابع مع B ، والإبهام مع التيار، والقوة عمودية على الكف للخارج.') },
      { q: 'متى لا يتأثر السلك بقوة؟', k: ['لا يتاثر', 'متى'], a: () => K.tutor('ما قيمة sinθ إذا كان السلك موازياً للمجال؟', 'عندما يكون السلك موازياً للمجال (θ = 0).') },
      { q: 'كيف أحسب أقل مجال لرفع السلك؟', k: ['اقل', 'رفع'], a: (p, d) => K.tutor('ساوِ القوة المغناطيسية بالوزن.', 'ILB = mg ⇒ B = ' + n(d.Bmin, 4) + ' T.') }
    ]
  });

  /* ======================= 5-7 القوة بين سلكين متوازيين ص117–118 ======================= */
  K.reg({
    id: 'parallel-wires', unit: 7, order: 5, lesson: '5-7', lessonTitle: 'القوة المتبادلة بين سلكين متوازيين', page: 117,
    titleAr: 'القوة المتبادلة بين سلكين متوازيين', titleEn: 'Force Between Parallel Currents', tags: 'سلكان متوازيان تجاذب تنافر قوة لكل وحدة طول امبير ثلاثة اسلاك مثال 6',
    formula: '\\frac{F}{L} = \\frac{\\mu_0 I_1 I_2}{2\\pi r}',
    book: 'القانون (7-7) والشكل (10-7) ص117–118. مثال (6) ص118: a (4 A ⊙) فوق b (3 A ⊗) بمسافة 6 cm ، و c (4 A ⊙) على يمين b بمسافة 8 cm ⇒ F_ab = 4 × 10⁻⁵ N/m (−y) ، F_cb = 3 × 10⁻⁵ N/m (−x) ، F_net = 5 × 10⁻⁵ N/m.',
    summary: 'كل سلك يقع في المجال المغناطيسي للآخر فتنشأ قوة متبادلة متساوية مقداراً ومتعاكسة اتجاهاً. التياران بالاتجاه نفسه يتجاذبان، والمتعاكسان يتنافران.',
    vars: [['I_1, I_2', 'التياران (الإشارة = الاتجاه)', '\\mathrm{A}', '−20 – 20'], ['r', 'المسافة بين السلكين', '\\mathrm{cm}', '1 – 20'], ['F/L', 'القوة لكل وحدة طول', '\\mathrm{N/m}', '—'], ['\\mu_0', 'النفاذية', '\\mathrm{T\\,m/A}', '4\\pi \\times 10^{-7}']],
    assumptions: ['السلكان طويلان جداً.'],
    params: [
      { key: 'mode', label: '\\text{الحالة}', type: 'select', value: 'two', options: [['two', 'سلكان'], ['three', 'مثال (6): ثلاثة أسلاك']] },
      { key: 'I1', label: 'I_1\\ (\\mathrm{A})', min: -20, max: 20, step: 1, value: 5, hidden: (p) => p.mode !== 'two' },
      { key: 'I2', label: 'I_2\\ (\\mathrm{A})', min: -20, max: 20, step: 1, value: 5, hidden: (p) => p.mode !== 'two' },
      { key: 'r', label: 'r\\ (\\mathrm{cm})', min: 1, max: 20, step: 1, value: 5, hidden: (p) => p.mode !== 'two' },
      { key: 'Ia', label: 'I_a\\ (\\mathrm{A})', min: -10, max: 10, step: 1, value: 4, hidden: (p) => p.mode !== 'three' },
      { key: 'Ib', label: 'I_b\\ (\\mathrm{A})', min: -10, max: 10, step: 1, value: 3, hidden: (p) => p.mode !== 'three' },
      { key: 'Ic', label: 'I_c\\ (\\mathrm{A})', min: -10, max: 10, step: 1, value: 4, hidden: (p) => p.mode !== 'three' }
    ],
    compute(p) {
      if (p.mode === 'three') {
        // الموجب ⊙ ؛ التيارات بالاتجاه نفسه تتجاذب: القوة على b نحو a (+y) أو بعيداً عنه
        const fab = Q.mu0 * p.Ia * p.Ib / (2 * Math.PI * 0.06), fcb = Q.mu0 * p.Ic * p.Ib / (2 * Math.PI * 0.08);
        const Fy = fab, Fx = fcb; return { fab: Math.abs(fab), fcb: Math.abs(fcb), Fx: Fx, Fy: Fy, F: Math.hypot(Fx, Fy), ang: Math.atan2(Math.abs(Fy), Math.abs(Fx)) * 180 / Math.PI };
      }
      const f = Q.mu0 * p.I1 * p.I2 / (2 * Math.PI * p.r / 100); return { f: Math.abs(f), attract: f > 0 };
    },
    live(p, d) { return p.mode === 'three' ? 'F_{net} = \\sqrt{F_{ab}^2 + F_{cb}^2} = \\sqrt{(' + sci(d.fab, 3) + ')^2 + (' + sci(d.fcb, 3) + ')^2} = ' + q(d.F, 'N/m', 3) : '\\frac{F}{L} = \\frac{4\\pi \\times 10^{-7} \\times ' + Math.abs(p.I1) + ' \\times ' + Math.abs(p.I2) + '}{2\\pi \\times ' + p.r / 100 + '} = ' + q(d.f, 'N/m', 3); },
    results(p, d) {
      if (p.mode === 'three') return [['F_ab', q(d.fab, 'N/m', 3) + (d.Fy === 0 ? '' : d.Fy > 0 ? '\\ (+y)' : '\\ (-y)')], ['F_cb', q(d.fcb, 'N/m', 3) + (d.Fx === 0 ? '' : d.Fx > 0 ? '\\ (+x)' : '\\ (-x)')], ['القوة المحصلة على b', q(d.F, 'N/m', 3), true, 'pos'], ['زاويتها مع المحور x', q(d.ang, '^\\circ', 3)]];
      return [['القوة لكل وحدة طول', q(d.f, 'N/m', 3), true, 'pos'], ['نوع القوة', d.f === 0 ? 'لا قوة' : d.attract ? 'تجاذب (التياران بالاتجاه نفسه)' : 'تنافر (التياران متعاكسان)', false]];
    },
    steps(p, d) { return p.mode === 'three' ? ['F_ab = μ₀IₐI_b/(2π × 0.06) = ' + sct(d.fab, 3) + ' N/m.', 'F_cb = μ₀I_cI_b/(2π × 0.08) = ' + sct(d.fcb, 3) + ' N/m.', 'F = √(F_ab² + F_cb²) = ' + sct(d.F, 3) + ' N/m ، tanθ = F_ab/F_cb ⇒ θ = ' + n(d.ang, 1) + '°.'] : ['F/L = μ₀ I₁ I₂ /(2π r) = ' + sct(d.f, 3) + ' N/m.', d.attract ? 'التياران بالاتجاه نفسه ⇒ تجاذب.' : 'التياران متعاكسان ⇒ تنافر.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const nr = K.narrow(W);
      if (p.mode === 'three') {
        const s = Math.min(W * 0.07, H * 0.075), bx = W * 0.3, by = H * 0.75; const P = { a: [bx, by - 6 * s], b: [bx, by], c: [bx + 8 * s, by] };
        ctx.strokeStyle = cols.muted; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(P.a[0], P.a[1]); ctx.lineTo(P.b[0], P.b[1]); ctx.lineTo(P.c[0], P.c[1]); ctx.lineTo(P.a[0], P.a[1]); ctx.stroke(); ctx.setLineDash([]);
        [['a', p.Ia], ['b', p.Ib], ['c', p.Ic]].forEach(([k, I]) => { if (I !== 0) K.perp(ctx, P[k][0], P[k][1], 11, I > 0, cols.text); lbl(ctx, k + ' (' + Math.abs(I) + ' A)', P[k][0] + (k === 'c' ? 0 : -36), P[k][1] + (k === 'a' ? -22 : 24), cols.c5, cols); });
        lbl(ctx, '6 cm', bx - 30, by - 3 * s, cols.muted, cols); lbl(ctx, '8 cm', bx + 4 * s, by + 18, cols.muted, cols);
        const sc = 60 / 5e-5; K.vec(ctx, bx, by, d.Fx * sc, -d.Fy * sc, cols.c2, 'F', cols, 3.5); if (d.Fx) K.vec(ctx, bx, by, d.Fx * sc, 0, cols.c4, '', cols, 2); if (d.Fy) K.vec(ctx, bx, by, 0, -d.Fy * sc, cols.c4, '', cols, 2);
        D.txt(ctx, 'F = ' + sct(d.F, 3) + ' N/m', W / 2, H * 0.07, { color: cols.text, size: nr ? 14 : 16, w: '700' }); return;
      }
      const sep = Math.min(W * 0.35, 30 + p.r * 14), x1 = W / 2 - sep / 2, x2 = W / 2 + sep / 2, y0 = H * 0.18, y1 = H * 0.88;
      [[x1, p.I1, cols.c1], [x2, p.I2, cols.c2]].forEach(([x, I, c], i) => { ctx.strokeStyle = c; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); if (I !== 0) D.arrow(ctx, x + (i ? 16 : -16), I > 0 ? y1 - 60 : y0 + 60, x + (i ? 16 : -16), I > 0 ? y0 + 60 : y1 - 60, c, 2.5); lbl(ctx, 'I' + (i + 1) + ' = ' + Math.abs(I) + ' A', x + (i ? 40 : -40), y0 - 4, c, cols); });
      if (d.f > 0) { const L = 20 + 40 * Math.min(1, d.f / 2e-3); const s = d.attract ? 1 : -1; K.vec(ctx, x1, H * 0.53, s * L, 0, cols.c3, 'F', cols); K.vec(ctx, x2, H * 0.53, -s * L, 0, cols.c3, '−F', cols); }
      D.txt(ctx, d.f === 0 ? 'لا قوة' : (d.attract ? 'تجاذب' : 'تنافر') + ': ' + sct(d.f, 3) + ' N/m', W / 2, H * 0.07, { color: cols.text, size: nr ? 14 : 16, w: '700' });
    },
    graph(p, d) {
      if (p.mode === 'three') { const v = [d.fab, d.fcb, d.F]; return { view: K.barView(v), xLabel: '', yLabel: 'F/L (N/m)', caption: 'القوتان متعامدتان، والمحصلة = √(F_ab² + F_cb²).', draw(G) { const c = G.colors(); K.bars(G, [['F_ab', d.fab, c.c1], ['F_cb', d.fcb, c.c4], ['F', d.F, c.c2]]); } }; }
      const k = Q.mu0 * Math.abs(p.I1 * p.I2) / (2 * Math.PI); return { view: { xmin: 0, xmax: 20, ymin: 0, ymax: Math.max(k / 0.02, 1e-7) * 1.05 }, xLabel: 'r (cm)', yLabel: 'F/L (N/m)', caption: 'القوة تتناسب عكسياً مع المسافة بين السلكين.', draw(G) { const c = G.colors(); G.fn((r) => k / (r / 100), { color: c.c1, width: 3, domain: [2, 20] }); G.point(p.r, d.f, { color: c.c2 }); } };
    },
    explain(a, b, da, db) { const o = []; if (Math.sign(a.I1 * a.I2) !== Math.sign(b.I1 * b.I2) && b.mode === 'two') o.push(db.attract ? 'أصبح التياران بالاتجاه نفسه: تجاذب.' : 'أصبح التياران متعاكسين: تنافر.'); return o; },
    learn: ['**(7-7) ص117:** المجال B₁ = μ₀I₁/(2πr) عند السلك الثاني يؤثر فيه بقوة F = I₂LB₁.', '**الشكل (10-7):** تياران بالاتجاه نفسه يتجاذبان، ومتعاكسان يتنافران، والقوتان متساويتان ومتعاكستان.', 'يُعرَّف الأمبير من هذه العلاقة.'],
    challenges: [
      { q: 'مثال (6): a = 4 A ⊙ ، b = 3 A ⊗ ، c = 4 A ⊙. أوجد القوة المحصلة على وحدة الطول من b.', hint: 'اختر «ثلاثة أسلاك» واجعل I_b = −3.', init: { mode: 'two', Ia: 4, Ib: 3, Ic: 4 }, check: (p) => p.mode === 'three' && p.Ia === 4 && p.Ib === -3 && p.Ic === 4, why: () => 'F_ab = 4×10⁻⁵ (−y) ، F_cb = 3×10⁻⁵ (−x) ، F = 5×10⁻⁵ N/m بزاوية 53°.' },
      { q: 'اجعل السلكين يتنافران.', hint: 'اعكس أحد التيارين.', init: { mode: 'two', I1: 5, I2: 5, r: 5 }, check: (p, d) => p.mode === 'two' && d.f > 0 && !d.attract, why: () => 'التياران المتعاكسان يتنافران.' }
    ],
    tutor: [
      { q: 'متى يتجاذب السلكان؟', k: ['يتجاذب', 'تجاذب'], a: () => K.tutor('قارن اتجاهي التيارين.', 'عندما يكون التياران بالاتجاه نفسه.') },
      { q: 'هل القوتان على السلكين متساويتان؟', k: ['متساويتان', 'متساويه'], a: () => K.tutor('تذكّر القانون الثالث لنيوتن.', 'نعم، متساويتان مقداراً ومتعاكستان اتجاهاً.') },
      { q: 'كيف يعرف الأمبير؟', k: ['امبير', 'يعرف'], a: () => K.tutor('عوّض I₁ = I₂ = 1 A و r = 1 m في القانون.', 'التيار الذي إذا مر في سلكين متوازيين المسافة بينهما 1 m أثّر كل منهما في الآخر بقوة 2×10⁻⁷ N لكل متر.') }
    ]
  });

  /* ======================= 6-7 منتقي السرعات ص119 ======================= */
  K.reg({
    id: 'velocity-selector', unit: 7, order: 6, lesson: '6-7', lessonTitle: 'قوة لورنتز ومنتقي السرعات', page: 119,
    titleAr: 'منتقي السرعات: قوة لورنتز', titleEn: 'Velocity Selector (Lorentz Force)', tags: 'قوة لورنتز منتقي السرعات مجال كهربائي مجال مغناطيسي متعامدان خط مستقيم مثال 7',
    formula: 'F_{net} = qE + q\\,v \\times B ,\\qquad v = \\frac{E}{B}',
    book: 'القانون (7-8) ومنتقي السرعات ص119. مثال (7) ص119: مجال كهربائي 0.1 N/C ومجال مغناطيسي 4 × 10⁻⁴ T ⇒ v = 250 m/s.',
    summary: 'في منطقة فيها مجال كهربائي ومجال مغناطيسي متعامدان، تتأثر الشحنة بقوة كهربائية لأسفل وقوة مغناطيسية لأعلى. الجسيمات التي سرعتها v = E/B فقط تتساوى عليها القوتان فتعبر في خط مستقيم.',
    vars: [['E', 'المجال الكهربائي', '\\mathrm{N/C}', '0.02 – 0.5'], ['B', 'المجال المغناطيسي', '\\times 10^{-4}\\ \\mathrm{T}', '1 – 10'], ['v', 'سرعة الجسيم', '\\mathrm{m/s}', '10 – 1000'], ['F_{net}', 'القوة المحصلة لكل وحدة شحنة', '\\mathrm{N/C}', '—']],
    assumptions: ['شكل المسار المنحرف في الرسم توضيحي: ' + Q.SIMPLE + '.'],
    params: [
      { key: 'E', label: 'E\\ (\\mathrm{N/C})', min: 0.02, max: 0.5, step: 0.01, value: 0.1 },
      { key: 'B', label: 'B\\ (10^{-4}\\,\\mathrm{T})', min: 1, max: 10, step: 0.5, value: 4 },
      { key: 'v', label: 'v\\ (\\mathrm{m/s})', min: 10, max: 1000, step: 5, value: 100 }
    ],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0 }),
    tick(st, p, d, dt) { st.t += dt; if (st.t > 3) st.t = 0; },
    compute(p) { const B = p.B * 1e-4; const v0 = p.E / B; const fm = p.v * B, fe = p.E; return { v0: v0, fm: fm, fe: fe, net: fm - fe }; },
    live(p, d) { return 'v = \\frac{E}{B} = \\frac{' + p.E + '}{' + p.B + ' \\times 10^{-4}} = ' + q(d.v0, 'm/s', 4); },
    results(p, d) { const st = Math.abs(d.net) < 1e-12; return [['السرعة المنتقاة E/B', q(d.v0, 'm/s', 4), true, 'pos'], ['القوة الكهربائية لكل وحدة شحنة', q(d.fe, 'N/C', 3)], ['القوة المغناطيسية لكل وحدة شحنة', q(d.fm, 'N/C', 3)], ['مسار الجسيم', st ? 'خط مستقيم' : d.net > 0 ? 'ينحرف لأعلى (v > E/B)' : 'ينحرف لأسفل (v < E/B)', false, st ? 'pos' : '']]; },
    steps(p, d) { return ['القوة الكهربائية qE لأسفل، والمغناطيسية qvB لأعلى.', 'خط مستقيم عندما qE = qvB ⇒ v = E/B = ' + n(d.v0) + ' m/s.', 'الجسيم الحالي: v = ' + p.v + ' m/s ⇒ ' + (Math.abs(d.net) < 1e-12 ? 'لا ينحرف.' : d.net > 0 ? 'ينحرف لأعلى.' : 'ينحرف لأسفل.')]; },
    drawCustom(ctx, W, H, p, d, cols) {
      const x0 = W * 0.18, x1 = W * 0.86, yT = H * 0.25, yB = H * 0.8, ym = (yT + yB) / 2;
      ctx.fillStyle = cols.c2; ctx.fillRect(x0, yT - 10, x1 - x0, 8); ctx.fillStyle = cols.c1; ctx.fillRect(x0, yB + 2, x1 - x0, 8); lbl(ctx, '+', x0 - 14, yT - 6, cols.c2, cols, 16); lbl(ctx, '−', x0 - 14, yB + 6, cols.c1, cols, 16);
      K.fieldGrid(ctx, x0, yT, x1 - x0, yB - yT, false, cols.grid, 40);
      for (let k = 0; k < 4; k++) { const x = x0 + (x1 - x0) * (k + 0.5) / 4; D.arrow(ctx, x, yT + 6, x, yT + 40, cols.muted, 1.5); } lbl(ctx, 'E', x0 + 16, yT + 24, cols.muted, cols);
      const k = Math.max(-1, Math.min(1, d.net / Math.max(d.fe, 1e-9))); const path = (s) => [x0 - 40 + s * (x1 - x0 + 80), ym - k * (yB - yT) * 0.45 * Math.pow(Math.max(0, s * (x1 - x0 + 80) - 40) / (x1 - x0), 2)];
      ctx.strokeStyle = cols.c3; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); for (let i = 0; i <= 40; i++) { const P = path(i / 40); if (i) ctx.lineTo(P[0], P[1]); else ctx.moveTo(P[0], P[1]); } ctx.stroke(); ctx.setLineDash([]);
      const st = d.st || { t: 0 }; const P = path(Math.min(1, st.t / 3)); ctx.fillStyle = cols.c2; ctx.beginPath(); ctx.arc(P[0], P[1], 8, 0, Math.PI * 2); ctx.fill(); D.txt(ctx, '+', P[0], P[1], { color: '#fff', size: 11, w: '700' });
      D.txt(ctx, 'v = ' + p.v + ' m/s   E/B = ' + n(d.v0) + ' m/s', W / 2, H * 0.08, { color: cols.text, size: K.narrow(W) ? 13 : 15, w: '700' });
    },
    graph(p, d) { const B = p.B * 1e-4; return { view: { xmin: 0, xmax: 1000, ymin: -p.E * 1.2, ymax: (1000 * B - p.E) * 1.1 + 0.01 }, xLabel: 'v (m/s)', yLabel: 'F/q (N/C)', caption: 'القوة المحصلة لكل وحدة شحنة qvB − qE تنعدم عند v = E/B.', draw(G) { const c = G.colors(); G.fn((v) => v * B - p.E, { color: c.c1, width: 3, domain: [0, 1000] }); G.hline(0, { color: c.muted }); G.point(p.v, d.net, { color: c.c2 }); } }; },
    explain(a, b, da, db) { const o = []; if (Math.abs(db.net) < 1e-12 && Math.abs(da.net) >= 1e-12) o.push('تساوت القوتان: يعبر الجسيم في خط مستقيم.'); return o; },
    learn: ['**قوة لورنتز (7-8) ص119:** F = qE + qv × B.', '**منتقي السرعات:** مجالان متعامدان؛ الجسيمات بسرعة v = E/B فقط تعبر الشريحة دون انحراف، والأسرع تنحرف باتجاه القوة المغناطيسية، والأبطأ باتجاه القوة الكهربائية.'],
    challenges: [
      { q: 'مثال (7): E = 0.1 N/C و B = 4×10⁻⁴ T. اضبط سرعة الجسيم ليعبر في خط مستقيم.', hint: 'v = E/B.', init: { E: 0.1, B: 4, v: 100 }, check: (p, d) => Math.abs(p.E - 0.1) < 1e-9 && p.B === 4 && Math.abs(d.net) < 1e-12, why: () => 'v = 0.1 ÷ 4×10⁻⁴ = 250 m/s.' },
      { q: 'ضاعف المجال المغناطيسي (E = 0.1): ما السرعة التي تعبر الآن؟', hint: 'B = 8.', init: { E: 0.1, B: 4, v: 250 }, check: (p, d) => Math.abs(p.E - 0.1) < 1e-9 && p.B === 8 && Math.abs(d.net) < 1e-12, why: () => 'v = 125 m/s.' }
    ],
    tutor: [
      { q: 'لماذا تنحرف الجسيمات الأسرع؟', k: ['اسرع', 'تنحرف'], a: () => K.tutor('أي القوتين تعتمد على السرعة؟', 'القوة المغناطيسية qvB تزداد بالسرعة فتغلب الكهربائية.') },
      { q: 'هل تعتمد السرعة المنتقاة على الشحنة؟', k: ['شحنه', 'تعتمد'], a: () => K.tutor('اختصر q من طرفي qE = qvB.', 'لا، v = E/B لا تعتمد على مقدار الشحنة أو نوعها.') },
      { q: 'ما قوة لورنتز؟', k: ['لورنتز'], a: () => K.tutor('ما القوى المؤثرة في شحنة في مجالين؟', 'محصلة القوة الكهربائية والمغناطيسية: F = qE + qv × B.') }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
