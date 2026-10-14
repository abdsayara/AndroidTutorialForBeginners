/* الكيمياء — الوحدة الخامسة: طاقة الرابطة (5-3 ، 5-4 ص106–110) ومحاكي التفاعل ووزن المعادلات (ص43 ، ص113) */
(function (root) {
  'use strict';
  const ML = root.ML; const C = ML.chem; const D = ML.pdraw; const K = ML.chemLab;
  const S = 'g10-chem', U = 5;
  const reg = (o) => ML.register(Object.assign({ subject: S, unit: U, custom: true }, o));
  const RX = C.BOND_REACTIONS;
  const PH = [0.05, 0.33, 0.58, 0.8, 0.95];
  const STAGES = ['المتفاعلات (روابط سليمة)', 'كسر الروابط: تمتص طاقة', 'ذرات منفصلة: إعادة الترتيب', 'تكوين روابط جديدة: تطلق طاقة', 'النواتج'];
  const bondList = (o) => Object.keys(o).map((k) => o[k] + ' × (' + k + ') = ' + o[k] + ' × ' + C.BOND[k] + ' = ' + o[k] * C.BOND[k]);
  const eqOf = (r) => C.eqText(r.lhs, r.rhs, r.st);

  /* ======================= طاقة الرابطة وحساب حرارة التفاعل ======================= */
  reg({
    id: 'bond-energy', order: 3, lesson: '5-4', lessonTitle: 'حساب حرارة التفاعل باستخدام طاقة الروابط', page: 108,
    titleAr: 'طاقة الرابطة: كسر الروابط وتكوينها على المستوى الجزيئي', titleEn: 'Bond Energies: Breaking and Forming Bonds at the Molecular Level',
    tags: 'طاقة الرابطة كسر تكوين روابط حرارة التفاعل جدول 5-1 ميثان فلوريد الهيدروجين طارد ماص جزيئات ثلاثية الأبعاد',
    formula: '\\Delta H = \\sum E_{\\text{الروابط المتكسّرة}} - \\sum E_{\\text{الروابط المتكوّنة}}',
    book: 'الجدول (5-1) ص107: طاقات الروابط (كيلوجول/مول). مثال (1) ص108: {{2HF(g) → H₂(g) + F₂(g)}}، ΔH = +536 كيلوجول (ماص). مثال (2) ص109: {{CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(g)}}، ΔH = −656 كيلوجول (طارد).',
    summary: 'طاقة الرابطة هي الطاقة اللازمة لكسر رابطة في مول من الجزيئات في الحالة الغازية (ص107). كسر الروابط يمتص طاقة، وتكوين الروابط يطلق الطاقة نفسها؛ فإذا كانت طاقة الروابط المتكوّنة أكبر كان التفاعل طارداً.',
    vars: [['E', 'طاقة الرابطة من الجدول (5-1)', '\\text{كيلوجول/مول}', '158 (F–F) إلى 941 (N≡N)'], ['\\Delta H', 'حرارة التفاعل = مجموع المتكسّرة − مجموع المتكوّنة', '\\text{كيلوجول}', 'سالبة: طارد • موجبة: ماص']],
    assumptions: ['الجزيئات معروضة بنماذج الكرات والعصي ثلاثية الأبعاد بزوايا وأطوال تقريبية: ' + C.SIMPLE + '.', 'تُرسم ذرات المتفاعلات وهي تنتقل إلى النواتج؛ عدد الذرات من كل عنصر محفوظ.'],
    canvasHint: 'اسحب لتدوير الجزيئات • ▶ للمرحلة التالية • الأحمر: روابط تتكسّر، والأخضر: روابط تتكوّن',
    params: [
      { key: 'rx', label: '\\text{التفاعل}', type: 'select', value: 'CH4', options: Object.keys(RX).map((k) => [k, RX[k].name]) },
      { key: 'ph', label: '\\text{مرحلة التفاعل}', type: 'stage', value: 0, stages: STAGES }
    ],
    play: { mode: 'stage', key: 'ph', interval: 1.8 },
    initState: () => ({ yaw: 0.5, pitch: 0.3, mol: 0 }),
    compute(p) { const r = RX[p.rx] || RX.CH4; return Object.assign({ r: r }, C.bondDH(r.lhs, r.rhs)); },
    live(p, d) { return '\\Delta H = ' + d.broken + ' - ' + d.formed + ' = ' + d.dH + '\\ \\text{كيلوجول}'; },
    results(p, d) {
      const out = [['المعادلة', '{{' + eqOf(d.r) + '}}', false]];
      out.push(['الروابط المتكسّرة (تمتص طاقة)', bondList(d.brokenList).join(' ، ') + ' ← المجموع ' + d.broken + ' كيلوجول', false]);
      out.push(['الروابط المتكوّنة (تطلق طاقة)', bondList(d.formedList).join(' ، ') + ' ← المجموع ' + d.formed + ' كيلوجول', false]);
      out.push(['حرارة التفاعل', K.neg(d.dH) + ' كيلوجول', false, d.dH < 0 ? 'pos' : 'neg']);
      out.push(['نوع التفاعل', d.dH < 0 ? 'طارد للطاقة (الروابط المتكوّنة أقوى)' : 'ماص للطاقة (الروابط المتكسّرة أقوى)', false]);
      if (d.r.book !== undefined) out.push(['المقارنة مع الكتاب', (d.dH === d.r.book ? '✓ يطابق ' : '✗ يختلف عن ') + 'مثال الكتاب ص' + d.r.page + ' (' + K.neg(d.r.book) + ' كيلوجول)', false, d.dH === d.r.book ? 'pos' : 'neg']);
      return out;
    },
    steps(p, d) { return ['اكتب المعادلة الموزونة وحدّد الروابط في كل جزيء (الصيغة البنائية).', 'الروابط المتكسّرة: ' + bondList(d.brokenList).join(' + ') + ' = ' + d.broken + ' كيلوجول.', 'الروابط المتكوّنة: ' + bondList(d.formedList).join(' + ') + ' = ' + d.formed + ' كيلوجول.', 'ΔH = ' + d.broken + ' − ' + d.formed + ' = ' + K.neg(d.dH) + ' كيلوجول ← ' + (d.dH < 0 ? 'طارد' : 'ماص') + '.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const st = d.st || { yaw: 0.5, pitch: 0.3 }; const r = d.r; const narrow = W < 560;
      const Hm = H * 0.62;
      K.drawMol(ctx, W, Hm, d, cols, st, { key: 'bond-' + p.rx, lhs: r.lhs, rhs: r.rhs, ph: PH[p.ph], title: 'المستوى الجزيئي: ' + r.name, eq: eqOf(r), lines: [], molH: Hm - 120 });
      // مخطط الطاقة: المتفاعلات ← ذرات منفصلة ← النواتج
      const y0 = Hm + 8, y1 = H - 14, x0 = 40, x1 = W - 20;
      const maxE = d.broken; const sc = (y1 - y0 - 22) / Math.max(maxE, 1);
      const yR = y1 - Math.max(0, -d.dH) * sc - 6, yA = yR - d.broken * sc, yP = yR - d.dH * sc;
      const xs = [x0, x0 + (x1 - x0) * 0.36, x0 + (x1 - x0) * 0.72];
      const lv = (x, y, col, lab, on) => { ctx.save(); ctx.globalAlpha = on ? 1 : 0.35; ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (x1 - x0) * 0.24, y); ctx.stroke(); ctx.restore(); D.txt(ctx, lab, x + (x1 - x0) * 0.12, y - 10, { color: col, size: narrow ? 10.5 : 12, w: '700', halo: cols.bg }); };
      lv(xs[0], yR, cols.c1, 'المتفاعلات', true); lv(xs[1], yA, cols.c5, 'ذرات منفصلة', p.ph >= 1); lv(xs[2], yP, cols.c3, 'النواتج', p.ph >= 3);
      if (p.ph >= 1) { D.arrow(ctx, xs[0] + (x1 - x0) * 0.24, yR, xs[1], yA + 2, cols.c2, 2.5); D.txt(ctx, '+' + d.broken, (xs[0] + xs[1]) / 2 + (x1 - x0) * 0.12, (yR + yA) / 2, { color: cols.c2, size: 12, w: '700', halo: cols.bg }); }
      if (p.ph >= 3) { D.arrow(ctx, xs[1] + (x1 - x0) * 0.24, yA, xs[2], yP - 2, cols.c3, 2.5); D.txt(ctx, '−' + d.formed, (xs[1] + xs[2]) / 2 + (x1 - x0) * 0.12, (yA + yP) / 2, { color: cols.c3, size: 12, w: '700', halo: cols.bg }); }
      if (p.ph >= 4) D.txt(ctx, 'حرارة التفاعل = ' + K.neg(d.dH) + ' كيلوجول', W / 2, y1, { color: cols.text, size: 12.5, w: '700', halo: cols.bg });
    },
    onPointer(type, x, y, p, st, api) {
      if (type === 'down') { const h = api.hit(x, y); if (h && h.id === 'mol:step') { api.set('ph', (p.ph + 1) % STAGES.length); return false; } st._drag = [x, y]; return false; }
      return K.molPointer(type, x, y, p, st, api);
    },
    explain(a, b, da, db) {
      const o = [];
      if (a.rx !== b.rx) o.push('اخترت: ' + db.r.name + '. الروابط المتكسّرة ' + db.broken + ' كيلوجول، والمتكوّنة ' + db.formed + ' كيلوجول، فحرارة التفاعل ' + K.neg(db.dH) + ' كيلوجول (' + (db.dH < 0 ? 'طارد' : 'ماص') + ').');
      if (a.ph !== b.ph) o.push(['المتفاعلات بروابطها السليمة.', 'تتكسّر كل روابط المتفاعلات (الأحمر): يُمتص ' + db.broken + ' كيلوجول.', 'الذرات منفصلة وتعيد ترتيبها؛ عدد ذرات كل عنصر لا يتغير.', 'تتكوّن روابط النواتج (الأخضر): يُطلق ' + db.formed + ' كيلوجول.', 'النواتج. الفرق بين الطاقتين = ' + K.neg(db.dH) + ' كيلوجول.'][b.ph]);
      return o;
    },
    learn: [
      '**طاقة الرابطة:** الطاقة اللازمة لكسر رابطة كيميائية في مول واحد من الجزيئات في الحالة الغازية، ووحدتها كيلوجول/مول. مثال: {{H–H(g) + 436 kJ → H·(g) + H·(g)}} (ص107).',
      '**حساب حرارة التفاعل (ص108):** ΔH = مجموع طاقة الروابط المتكسّرة − مجموع طاقة الروابط المتكوّنة.',
      '**مثال (1):** في {{2HF → H₂ + F₂}}: المتكسّرة 2 × 565 = 1130، والمتكوّنة 436 + 158 = 594، فـ ΔH = +536 كيلوجول (ماص).',
      '**مثال (2):** في احتراق الميثان: المتكسّرة 4 × 413 + 2 × 498 = 2648، والمتكوّنة 4 × 464 + 2 × 724 = 3304، فـ ΔH = −656 كيلوجول (طارد).'
    ],
    challenges: [
      { q: 'اختر من تفاعلات الكتاب تفاعلاً ماصاً للطاقة.', hint: 'ابحث عن تفاعل تكون فيه الروابط المتكسّرة أقوى من المتكوّنة (مثال 1 ص108).', init: { rx: 'CH4', ph: 0 }, check: (p, d) => d.dH > 0, why: (p, d) => 'تفاعل ماص: ΔH = +' + d.dH + ' كيلوجول.' },
      { q: 'في احتراق الميثان، انتقل إلى المرحلة التي تُطلَق فيها الطاقة.', hint: 'الطاقة تُطلق عند تكوين الروابط الجديدة.', init: { rx: 'CH4', ph: 0 }, check: (p) => p.rx === 'CH4' && p.ph === 3, why: () => 'تكوين روابط C=O و O–H يطلق 3304 كيلوجول.' },
      { q: 'أي التفاعلات المعروضة يطلق أكبر طاقة حسب طاقات الروابط؟', hint: 'قارن حرارة التفاعل لكل تفاعل في القائمة.', init: { rx: 'HF', ph: 0 }, check: (p) => p.rx === 'C2H5OH', why: (p, d) => 'احتراق الإيثانول: ' + K.neg(d.dH) + ' كيلوجول.' }
    ],
    tutor: [
      { q: 'لماذا يمتص كسر الروابط طاقة؟', k: ['كسر', 'يمتص', 'لماذا'], a: () => C.tutor('هل تنفصل الذرات المترابطة وحدها، أم تحتاج إلى من يفصلها؟', 'الذرات مترابطة بقوى تجاذب، وفصلها يحتاج إلى طاقة؛ والطاقة اللازمة لكسر رابطة في مول من الجزيئات هي طاقة الرابطة (ص107).') },
      { q: 'كيف أحسب حرارة التفاعل من طاقة الروابط؟', k: ['احسب', 'حساب', 'حراره التفاعل', 'كيف'], a: (p, d) => C.tutor('ما الروابط التي تتكسّر في المتفاعلات؟ وما الروابط التي تتكوّن في النواتج؟', 'المتكسّرة: ' + bondList(d.brokenList).join(' + ') + ' = ' + d.broken + '\nالمتكوّنة: ' + bondList(d.formedList).join(' + ') + ' = ' + d.formed + '\nΔH = ' + d.broken + ' − ' + d.formed + ' = ' + K.neg(d.dH) + ' كيلوجول.') },
      { q: 'لماذا التفاعل طارد أو ماص؟', k: ['طارد', 'ماص', 'نوع'], a: (p, d) => C.tutor('أيّهما أكبر: طاقة الروابط المتكسّرة أم المتكوّنة؟', d.dH < 0 ? 'الطاقة المنطلقة من تكوين الروابط (' + d.formed + ') أكبر من الممتصة لكسرها (' + d.broken + ')، فالتفاعل طارد.' : 'الطاقة الممتصة لكسر الروابط (' + d.broken + ') أكبر من المنطلقة (' + d.formed + ')، فالتفاعل ماص.') }
    ]
  });

  /* ======================= محاكي التفاعل: وزن المعادلة ======================= */
  const BAL = {
    C2H5OH: { name: 'احتراق الإيثانول (نشاط 5 ص113)', L: ['C2H5OH', 'O2'], R: ['CO2', 'H2O'], st: [['l', 'g'], ['g', 'g']], ans: [1, 3, 2, 3] },
    CH4: { name: 'احتراق الميثان (ص83 ، ص109)', L: ['CH4', 'O2'], R: ['CO2', 'H2O'], st: [['g', 'g'], ['g', 'g']], ans: [1, 2, 1, 2] },
    C3H8: { name: 'احتراق البروبان — غاز الطبخ (ص84)', L: ['C3H8', 'O2'], R: ['CO2', 'H2O'], st: [['g', 'g'], ['g', 'g']], ans: [1, 5, 3, 4] },
    H2O: { name: 'تكوين الماء (نشاط 9 ص43)', L: ['H2', 'O2'], R: ['H2O'], st: [['g', 'g'], ['g']], ans: [2, 1, 2] },
    NH3: { name: 'تحضير الأمونيا (ص44)', L: ['N2', 'H2'], R: ['NH3'], st: [['g', 'g'], ['g']], ans: [1, 3, 2] },
    Zn: { name: 'الخارصين مع حمض الهيدروكلوريك (نشاط 2 ص103)', L: ['Zn', 'HCl'], R: ['ZnCl2', 'H2'], st: [['s', 'aq'], ['aq', 'g']], ans: [1, 2, 1, 1] },
    Ca: { name: 'الكالسيوم مع الماء (نشاط 6 ص11)', L: ['Ca', 'H2O'], R: ['Ca(OH)2', 'H2'], st: [['s', 'l'], ['aq', 'g']], ans: [1, 2, 1, 1] }
  };
  const sides = (p) => { const r = BAL[p.rx] || BAL.C2H5OH; const k = [p.a, p.b, p.c, p.d]; return { r: r, lhs: r.L.map((f, i) => [k[i], f]), rhs: r.R.map((f, i) => [k[2 + i], f]) }; };
  // تجميع ذرات جزيء ليس له نموذج: ذرة مركزية وحولها البقية (للعرض فقط)
  function cluster(f) {
    if (C.MOL[f]) return C.molecule(f);
    const at = C.parse(f); const els = Object.keys(at); const list = []; els.forEach((e) => { for (let i = 0; i < at[e]; i++) list.push(e); });
    const atoms = [{ el: list[0], p: [0, 0, 0] }]; const bonds = [];
    list.slice(1).forEach((e, i, a) => { const t = i * 2 * Math.PI / a.length; atoms.push({ el: e, p: [Math.cos(t) * 1.3, Math.sin(t) * 1.3, 0] }); bonds.push([0, atoms.length - 1, 1]); });
    return { atoms: atoms, bonds: bonds, size: 1.8 };
  }
  reg({
    id: 'balance-equation', order: 4, lesson: '5-6', lessonTitle: 'حرارة الاحتراق — كتابة المعادلة', page: 113,
    titleAr: 'محاكي التفاعل: وزن المعادلة الكيميائية وحفظ الذرات', titleEn: 'Reaction Simulator: Balancing Chemical Equations',
    tags: 'وزن المعادلة موزونة معاملات حفظ الكتلة احتراق إيثانول ميثان بروبان أمونيا خارصين كالسيوم محاكي التفاعل',
    formula: '\\text{عدد ذرات كل عنصر في المتفاعلات} = \\text{عدد ذراته في النواتج}',
    book: 'سؤال 2 ص113: اكتب معادلة كيميائية تعبر عن حرارة احتراق الإيثانول. ونشاط (9) ص43: المعادلة الموزونة تحقق قانون حفظ الكتلة {{2H₂ + O₂ → 2H₂O}} (36 = 36).',
    summary: 'في التفاعل الكيميائي يتغير ترتيب الذرات فقط، فيبقى عدد ذرات كل عنصر ثابتاً وتبقى الكتلة محفوظة (قانون حفظ الكتلة ص31). نزن المعادلة بتغيير المعاملات أمام الصيغ لا بتغيير الصيغ نفسها.',
    vars: [['a, b', 'معاملا المادتين المتفاعلتين', '\\text{مول}', 'أعداد صحيحة 1–10'], ['c, d', 'معاملا الناتجين', '\\text{مول}', 'أعداد صحيحة 1–10']],
    assumptions: ['الكتل الذرية المقرّبة كما يستعملها الكتاب (H = 1 ، C = 12 ، O = 16 …)، وZn و Ca من الجدول الدوري ص123.', 'الجزيئات التي ليس لها نموذج هندسي تُعرض كتجمع ذرات: ' + C.SIMPLE + '.'],
    canvasHint: 'غيّر المعاملات من أدوات التحكم حتى يتساوى عدد الذرات وتتزن الكفتان',
    params: [
      { key: 'rx', label: '\\text{التفاعل}', type: 'select', value: 'C2H5OH', options: Object.keys(BAL).map((k) => [k, BAL[k].name]) },
      { key: 'a', label: '\\text{معامل المادة المتفاعلة الأولى}', min: 1, max: 10, step: 1, value: 1, int: true },
      { key: 'b', label: '\\text{معامل المادة المتفاعلة الثانية}', min: 1, max: 10, step: 1, value: 1, int: true },
      { key: 'c', label: '\\text{معامل الناتج الأول}', min: 1, max: 10, step: 1, value: 1, int: true },
      { key: 'd', label: '\\text{معامل الناتج الثاني}', min: 1, max: 10, step: 1, value: 1, int: true, hidden: (p) => (BAL[p.rx] || BAL.C2H5OH).R.length < 2 }
    ],
    compute(p) {
      const s = sides(p); const chk = C.balanceCheck(s.lhs, s.rhs);
      const mass = (side) => side.reduce((t, [k, f]) => t + k * C.molarMass(f), 0);
      return Object.assign(s, { chk: chk, mL: Math.round(mass(s.lhs) * 100) / 100, mR: Math.round(mass(s.rhs) * 100) / 100, eq: C.eqText(s.lhs, s.rhs, s.r.st) });
    },
    results(p, d) {
      const out = [['المعادلة', '{{' + d.eq + '}}', false]];
      d.chk.rows.forEach((r) => out.push(['ذرات ' + (C.NAMES[r.el] || r.el) + ' (' + r.el + ')', 'المتفاعلات ' + r.left + ' • النواتج ' + r.right + (r.ok ? ' ✓' : ' ✗'), false, r.ok ? 'pos' : 'neg']));
      out.push(['كتلة المتفاعلات : كتلة النواتج', d.mL + ' غم : ' + d.mR + ' غم', false, d.mL === d.mR ? 'pos' : 'neg']);
      out.push(['الحالة', d.chk.ok ? (d.chk.lowest ? 'المعادلة موزونة بأصغر أعداد صحيحة ✓' : 'موزونة، لكن يمكن قسمة المعاملات على عدد مشترك') : 'غير موزونة — عدّل المعاملات', false, d.chk.ok && d.chk.lowest ? 'pos' : 'neg']);
      return out;
    },
    steps(p, d) { return ['اكتب صيغ المتفاعلات والنواتج صحيحة، ولا تغيّرها أثناء الوزن.', 'ابدأ بعنصر يظهر في مادة واحدة في كل طرف (مثل C ثم H)، واترك الأكسجين أو الهيدروجين الحر للنهاية.', 'عدّ ذرات كل عنصر في الطرفين: ' + d.chk.rows.map((r) => r.el + ': ' + r.left + ' / ' + r.right).join(' ، ') + '.', d.chk.ok ? 'المعادلة موزونة، والكتلة محفوظة: ' + d.mL + ' = ' + d.mR + ' غم.' : 'عدّل معاملاً واحداً في كل مرة وأعد العدّ.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const narrow = W < 560;
      // المعادلة
      ctx.save(); ctx.direction = 'ltr'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = d.chk.ok ? cols.c3 : cols.text; let fs = narrow ? 15 : 20; ctx.font = '700 ' + fs + 'px system-ui, sans-serif'; while (fs > 9 && ctx.measureText(d.eq).width > W - 20) { fs -= 0.5; ctx.font = '700 ' + fs + 'px system-ui, sans-serif'; } ctx.fillText(d.eq, W / 2, 22); ctx.restore();
      // الجزيئات بعدد المعاملات
      const groups = d.lhs.map((x) => ['L', x]).concat(d.rhs.map((x) => ['R', x]));
      const topY = 44, hM = H * 0.42; const gw = (W - 30) / groups.length;
      groups.forEach(([side, [k, f]], gi) => {
        const m = cluster(f); const cx = 15 + gw * (gi + 0.5); const per = Math.min(k, 10); const colsN = per > 4 ? 2 : 1; const rows = Math.ceil(per / colsN);
        const s = Math.min(gw / (colsN * (2 * m.size + 0.6)), (hM - 26) / (rows * (2 * m.size + 0.4)), 18);
        for (let i = 0; i < per; i++) { const c = i % colsN, r = Math.floor(i / colsN); const x = cx + (c - (colsN - 1) / 2) * s * (2 * m.size + 0.6), y = topY + 14 + (r + 0.5) * (hM - 20) / rows;
          C.drawBallStick(ctx, { atoms: m.atoms, bonds: m.bonds.map((b) => ({ i: b[0], j: b[1], o: b[2], a: 1, kind: 'old' })) }, { yaw: 0.4 + i * 0.3, pitch: 0.25, cx: x, cy: y, s: s, fov: 30, colors: { bond: '#94a3b8' } }); }
        D.txt(ctx, k + ' ' + C.sub(f), cx, topY + hM + 4, { color: side === 'L' ? cols.c1 : cols.c3, size: 12.5, w: '700' });
      });
      // عدّاد الذرات لكل عنصر
      const rows = d.chk.rows; const y0 = topY + hM + 26, rowH = Math.min(26, (H - y0 - 80) / Math.max(1, rows.length));
      const maxN = Math.max(1, ...rows.map((r) => Math.max(r.left, r.right)));
      const bw = (W - 140) / 2;
      rows.forEach((r, i) => {
        const y = y0 + i * rowH; const cx = W / 2;
        ctx.fillStyle = cols.c1; ctx.fillRect(cx - 20 - bw * r.left / maxN, y, bw * r.left / maxN, rowH - 8);
        ctx.fillStyle = cols.c3; ctx.fillRect(cx + 20, y, bw * r.right / maxN, rowH - 8);
        D.txt(ctx, r.el, cx, y + (rowH - 8) / 2, { color: r.ok ? cols.c3 : cols.c2, size: 13, w: '700' });
        D.txt(ctx, String(r.left), cx - 26 - bw * r.left / maxN, y + (rowH - 8) / 2, { color: cols.text, size: 12, align: 'right' });
        D.txt(ctx, String(r.right), cx + 26 + bw * r.right / maxN, y + (rowH - 8) / 2, { color: cols.text, size: 12, align: 'left' });
      });
      // ميزان ذو كفتين: حفظ الكتلة
      const by = H - 30, bx = W / 2; const diff = d.mR - d.mL; const ang = Math.max(-0.25, Math.min(0.25, diff / Math.max(d.mL, d.mR) * 0.6));
      ctx.save(); ctx.strokeStyle = cols.axis; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx, by + 18); ctx.lineTo(bx, by - 18); ctx.stroke();
      ctx.translate(bx, by - 18); ctx.rotate(-ang); ctx.beginPath(); ctx.moveTo(-90, 0); ctx.lineTo(90, 0); ctx.stroke();
      [[-90, cols.c1, d.mL], [90, cols.c3, d.mR]].forEach(([x, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, 8, 26, 6, 0, 0, Math.PI * 2); ctx.fill(); });
      ctx.restore();
      D.txt(ctx, d.mL + ' غم', bx - 150, by - 10, { color: cols.c1, size: 12, w: '700' }); D.txt(ctx, d.mR + ' غم', bx + 150, by - 10, { color: cols.c3, size: 12, w: '700' });
      D.txt(ctx, d.chk.ok ? 'الكفتان متزنتان: الكتلة محفوظة' : 'الكتلة غير متساوية: المعادلة غير موزونة', bx, by + 26 > H - 6 ? H - 6 : by + 26, { color: d.chk.ok ? cols.c3 : cols.c2, size: 12, w: '700' });
    },
    explain(a, b, da, db) {
      const o = [];
      if (a.rx !== b.rx) o.push('تفاعل جديد: ' + db.r.name + '. ابدأ بعدّ ذرات كل عنصر في الطرفين.');
      ['a', 'b', 'c', 'd'].forEach((k) => { if (a[k] !== b[k] && a.rx === b.rx) o.push('غيّرت المعامل إلى ' + b[k] + ': تضاعف عدد الجزيئات، فتغير عدد ذرات كل عنصر فيها بالنسبة نفسها.'); });
      if (db.chk.ok && !da.chk.ok) o.push('✅ الآن عدد ذرات كل عنصر متساوٍ في الطرفين، وكتلة المتفاعلات = كتلة النواتج = ' + db.mL + ' غم.');
      return o;
    },
    learn: [
      '**قانون حفظ الكتلة (ص31):** مجموع كتل المواد المتفاعلة يساوي مجموع كتل المواد الناتجة، لأن الذرات لا تفنى ولا تُستحدث في التفاعل الكيميائي.',
      '**وزن المعادلة:** نغيّر المعاملات أمام الصيغ (عدد الجزيئات أو المولات)، ولا نغيّر الأرقام الصغيرة داخل الصيغة.',
      '**احتراق الإيثانول:** {{C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O}}: ذرتا C ← 2CO₂، و 6 ذرات H ← 3H₂O، ثم الأكسجين: 4 + 3 = 7 = 1 + 2 × 3.'
    ],
    challenges: [
      { q: 'زِن معادلة احتراق الإيثانول بأصغر أعداد صحيحة.', hint: 'ابدأ بالكربون (2CO₂) ثم الهيدروجين (3H₂O)، ثم احسب الأكسجين في النواتج.', init: { rx: 'C2H5OH', a: 1, b: 1, c: 1, d: 1 }, check: (p, d) => p.rx === 'C2H5OH' && d.chk.ok && d.chk.lowest, why: () => 'C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O' },
      { q: 'زِن معادلة تحضير الأمونيا.', hint: 'كم ذرة نيتروجين في N₂؟ إذن كم جزيء NH₃ ينتج؟', init: { rx: 'NH3', a: 1, b: 1, c: 1, d: 1 }, check: (p, d) => p.rx === 'NH3' && d.chk.ok && d.chk.lowest, why: () => 'N₂ + 3H₂ → 2NH₃ (ص44)' },
      { q: 'زِن معادلة تفاعل الخارصين مع حمض الهيدروكلوريك.', hint: 'في ZnCl₂ ذرتا كلور، فكم جزيء HCl تحتاج؟', init: { rx: 'Zn', a: 1, b: 1, c: 1, d: 1 }, check: (p, d) => p.rx === 'Zn' && d.chk.ok && d.chk.lowest, why: () => 'Zn + 2HCl → ZnCl₂ + H₂' }
    ],
    tutor: [
      { q: 'من أين أبدأ في وزن المعادلة؟', k: ['ابدا', 'كيف ازن', 'وزن', 'موزونه'], a: (p, d) => C.tutor('أي عنصر يظهر في مادة واحدة فقط في كل طرف؟', 'ابدأ بالكربون ثم الهيدروجين، واترك الأكسجين للنهاية. الآن: ' + d.chk.rows.map((r) => r.el + ' ' + r.left + '/' + r.right).join('، ') + '.') },
      { q: 'لماذا لا أغيّر الأرقام داخل الصيغة؟', k: ['الصيغه', 'الارقام', 'لماذا لا'], a: () => C.tutor('ماذا يحدث للمادة لو غيّرت H₂O إلى H₂O₂؟', 'تغيير الرقم داخل الصيغة يغيّر المادة نفسها (H₂O ماء، و H₂O₂ مادة أخرى)؛ لذلك نغيّر المعاملات فقط.') },
      { q: 'ما علاقة الوزن بقانون حفظ الكتلة؟', k: ['حفظ الكتله', 'الكتله', 'قانون'], a: (p, d) => C.tutor('هل تتغير كتلة الذرات عندما يتغير ترتيبها؟', 'المعادلة الموزونة تحفظ عدد الذرات، فتتساوى الكتلتان: الآن ' + d.mL + ' غم مقابل ' + d.mR + ' غم (ص43).') }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
