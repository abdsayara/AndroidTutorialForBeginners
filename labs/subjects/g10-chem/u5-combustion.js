/* الكيمياء — الوحدة الخامسة (5-6) حرارة الاحتراق: نشاط (5) تعيين حرارة احتراق كحول الإيثانول (ص112–113)
 * النموذج الأولي (Prototype) للمختبر ثلاثي الأبعاد.
 */
(function (root) {
  'use strict';
  const ML = root.ML; const C = ML.chem; const D = ML.pdraw; const K = ML.chemLab;
  const S = 'g10-chem', U = 5;
  const reg = (o) => ML.register(Object.assign({ subject: S, unit: U, custom: true }, o));
  const B0 = K.BENCH;
  const FUEL_OPTS = Object.keys(C.FUELS).map((f) => [f, C.FUELS[f].name + ' ' + C.sub(f)]);
  // لون إرشادي للماء يدفأ مع الحرارة (ليس خاصية فيزيائية للماء)
  const waterColor = (T) => { const f = Math.max(0, Math.min(1, (T - 20) / 40)) * 0.45; const a = [0x60, 0xa5, 0xfa], b = [0xf9, 0x73, 0x16]; return a.map((v, i) => Math.round(v + (b[i] - v) * f)).reduce((h, v) => h * 256 + v, 0); };
  const FUEL_COLOR = { C2H5OH: 0x93c5fd, CH3OH: 0xc4b5fd, C3H7OH: 0x86efac };
  const SHELF = { C2H5OH: 0.2, CH3OH: 0.45, C3H7OH: 0.7 };

  const OBJECTS = [
    { id: 'beaker', kind: 'beaker', opts: { r: 0.035, h: 0.09, title: 'كأس زجاجي (250 مل)' } },
    { id: 'cylinder', kind: 'cylinder', opts: { title: 'مخبار مدرّج' } },
    { id: 'thermo', kind: 'thermo' }, { id: 'balance', kind: 'balance' }, { id: 'tripod', kind: 'tripod' }, { id: 'burner', kind: 'burner' },
    { id: 'rod', kind: 'rod' }, { id: 'shield', kind: 'shield' },
    { id: 'b_C2H5OH', kind: 'bottle', opts: { text: 'C₂H₅OH', sub: 'الإيثانول', band: '#b91c1c', title: 'زجاجة كحول الإيثانول', name: 'bottle' } },
    { id: 'b_CH3OH', kind: 'bottle', opts: { text: 'CH₃OH', sub: 'الميثانول', band: '#7c3aed', glass: 0x1e3a8a, title: 'زجاجة الميثانول', name: 'bottle' } },
    { id: 'b_C3H7OH', kind: 'bottle', opts: { text: 'C₃H₇OH', sub: '1-بروبانول', band: '#047857', glass: 0x065f46, title: 'زجاجة 1-بروبانول', name: 'bottle' } }
  ].concat(K.commonObjects());

  function labState(st, p) {
    const H = 0.139 + p.d / 100; const tri = [0.05, B0, 0];
    const bk = st.beaker === 'stand' ? [tri[0], B0 + H + 0.006, tri[2]] : [-0.3, B0, 0.22];
    const stirring = p.stir && st.water > 0 && st.beaker === 'stand';
    const out = Object.assign(K.commonState(st), {
      tripod: { pos: tri, height: H }, shield: { pos: tri, visible: !!p.shield },
      beaker: { pos: bk, level: st.water / 288, color: waterColor(st.T), soot: Math.min(0.8, st.soot / 40) },
      cylinder: { pos: [-0.52, B0, 0.26], level: st.cyl / 250 },
      thermo: st.thermo === 'beaker' ? { pos: [bk[0] + 0.017, bk[1] + 0.004, bk[2] - 0.008], rotZ: -0.22, T: C.combReading(st, p) } : { pos: [-0.2, B0 + 0.006, -0.28], rotZ: Math.PI / 2, rotY: 0.3, T: st.Troom },
      balance: { pos: [-0.85, B0, 0.1], text: (st.burner === 'balance' ? K.g2(C.balanceReading(st)) : '0.00') + ' g' },
      burner: { pos: st.burner === 'under' ? [tri[0], B0, tri[2]] : st.burner === 'balance' ? [-0.85, B0 + 0.056, 0.085] : [0.36, B0, 0.22], lit: st.lit, fuel: st.fuelMass / 14, fuelColor: FUEL_COLOR[st.fuel], sooty: C.incomplete(p.d) },
      rod: stirring ? { pos: [bk[0] - 0.008, bk[1] + 0.003, bk[2] + 0.004], rotZ: 0.22, spin: st.lit } : { pos: [-0.06, B0 + 0.003, 0.34], rotZ: Math.PI / 2 }
    });
    Object.keys(C.FUELS).forEach((f) => { out['b_' + f] = { pos: f === st.fuel && st.bottle === 'bench' ? [0.55, B0, 0.3] : [SHELF[f], 1.4325, -0.41], visible: p.mode === 'free' || f === st.fuel }; });
    return out;
  }
  const objOf = (a, st) => (a.obj === 'bottle' ? 'b_' + st.fuel : a.obj);
  function labActions(st, p) {
    const i = C.combStep(st); const step = C.COMB_STEPS[i];
    return C.combAvailable(st, p).map((a) => ({ id: a.id, icon: a.icon, label: a.label(st, p), obj: objOf(a, st), next: p.mode === 'guided' && !!step && step.acts.indexOf(a.id) >= 0 && !(a.id === 'gloves' && st.ppe.gloves) && !((a.id === 'goggles' || a.id === 'coat') && st.ppe[a.id]) }));
  }
  function labStep(st, p) {
    const i = C.combStep(st); const L = C.COMB_STEPS; const F = C.FUELS[st.fuel];
    if (p.mode === 'guided') return { mode: K.MODE_AR.guided, n: i, total: L.length, text: i < L.length ? L[i].text : 'اكتملت التجربة! اقرأ القياسات والحسابات في لوحة النتائج.' };
    if (p.mode === 'semi') return { mode: K.MODE_AR.semi, text: '🎯 الهدف: عيّن حرارة احتراق ' + F.name + ' تجريبياً.' + (i < L.length ? ' 💡 تلميح: ' + L[i].text : ' ✅ اكتملت القياسات.') };
    return { mode: K.MODE_AR.free, text: 'رتّب خطواتك بنفسك، وجرّب الوقود والمسافة والواقي والتحريك. القياسات تعتمد على إجراءاتك، وقواعد السلامة مطبّقة دائماً.' };
  }
  function labHud(st, p) {
    return [['🌡 ميزان الحرارة', st.thermo === 'beaker' ? K.f1(C.combReading(st, p)) + ' °س' : 'خارج الماء'], ['⚖ الميزان', (st.burner === 'balance' ? K.g2(C.balanceReading(st)) : '0.00') + ' غم'], ['⏱ الزمن', Math.round(st.t) + ' ث'], ['🔥 الموقد', st.lit ? 'مشتعل' : 'مطفأ']];
  }

  reg({
    id: 'heat-of-combustion', order: 1, lesson: '5-6', lessonTitle: 'حرارة الاحتراق', page: 112,
    titleAr: 'تعيين حرارة احتراق كحول الإيثانول (مختبر ثلاثي الأبعاد)', titleEn: 'Determining the Heat of Combustion of Ethanol — 3D Lab',
    tags: 'حرارة الاحتراق إيثانول كحول موقد مسعر ميزان حرارة طارد نشاط 5 جدول 5-2 ثلاثي الأبعاد 3D مختبر',
    formula: '\\Delta H = -\\frac{q}{n} ,\\quad q = c \\times m \\times \\Delta T ,\\quad n = \\frac{\\text{ك}_1 - \\text{ك}_2}{M}',
    book: 'نشاط (5) ص112–113. معادلة الاحتراق التام: {{C₂H₅OH(l) + 3O₂(g) → 2CO₂(g) + 3H₂O(g)}}. حرارة احتراق الإيثانول في الجدول (5-2) ص111 = 1367 كيلوجول/مول، والحرارة النوعية للماء 4.18 جول/غم.°س.',
    summary: 'حرارة الاحتراق هي الحرارة الناتجة عن حرق مول واحد من المادة حرقاً تاماً (ص111). نسخّن كمية معلومة من الماء بموقد كحولي، فنحسب الحرارة التي اكتسبها الماء $q = c\\,m\\,\\Delta T$، ونقسمها على عدد مولات الكحول المحترق $n = (\\text{ك}_1 - \\text{ك}_2)/M$.',
    vars: [
      ['q', 'كمية الحرارة التي اكتسبها الماء', '\\text{جول}', 'موجبة'],
      ['c', 'الحرارة النوعية للماء = 4.18 (ص113)', '\\text{جول/غم.}^{\\circ}\\text{س}', 'ثابتة'],
      ['m', 'كتلة الماء في الكأس', '\\text{غم}', '50–200 (الكتاب: 100)'],
      ['\\Delta T', 'التغير في درجة الحرارة = د2 − د1', '^{\\circ}\\text{س}', 'الكتاب: نحو 10–12'],
      ['n', 'عدد مولات الكحول المحترق = (ك1 − ك2) ÷ الكتلة المولية', '\\text{مول}', 'موجب'],
      ['\\Delta H', 'حرارة الاحتراق (سالبة لأن التفاعل طارد)', '\\text{كيلوجول/مول}', 'الجدول (5-2)']
    ],
    assumptions: ['نسبة الحرارة الواصلة إلى الماء (حسب المسافة والواقي)، ومعدل احتراق الفتيل، والفقد الحراري إلى الهواء: ' + C.SIMPLE + '، لا يذكرها الكتاب.', 'كثافة الماء 1 غم/مل (الكتاب: 100 مل = 100 غم).', 'دقة ميزان الحرارة 0.5 °س، ودقة الميزان الإلكتروني 0.01 غم.'],
    canvasHint: 'المستوى الجزيئي: يتحرك مع اشتعال الموقد • اسحب لتدوير الجزيئات • ▶ للتقدّم خطوة في التفاعل',
    params: [
      K.modeParam(),
      { key: 'fuel', label: '\\text{الوقود}', type: 'select', value: 'C2H5OH', desc: 'الوضع الموجّه: الإيثانول كما في الكتاب', options: (p) => (p && p.mode === 'guided' ? FUEL_OPTS.slice(0, 1) : FUEL_OPTS) },
      { key: 'V', label: '\\text{حجم الماء (مل)}', min: 50, max: 200, step: 10, value: 100, desc: 'الكتاب: 100 مل' },
      { key: 'd', label: '\\text{المسافة بين اللهب والكأس (سم)}', min: 1, max: 6, step: 0.5, value: 2.5, desc: C.SIMPLE },
      { key: 'shield', label: '\\text{واقٍ من تيارات الهواء}', type: 'toggle', value: false, on: 'مستخدم', off: 'غير مستخدم' },
      { key: 'stir', label: '\\text{التحريك بالقضيب الزجاجي}', type: 'toggle', value: true, on: 'أحرّك الماء', off: 'بلا تحريك' },
      { key: 'Troom', label: '\\text{درجة حرارة المختبر}', min: 15, max: 30, step: 1, value: 22, desc: 'بالسيلسيوس (°س)' }
    ],
    resetOn: ['mode', 'fuel', 'Troom'],
    onSet(p) { if (p.mode === 'guided') p.fuel = 'C2H5OH'; },
    play: { mode: 'time', speed: 4 },
    initState: (p) => C.combInit(p),
    tick(st, p, d, dt) { C.combTick(st, p, dt); },
    mount(el, page) {
      return ML.lab3d.mount(el, page, {
        objects: OBJECTS,
        state: labState, actions: labActions, step: labStep, hud: labHud, ppe: K.ppeChips,
        act(id) {
          const was = page.st.lit;
          const r = K.act(page, C.combAct, id);
          if (page.st.lit && !page.playing) page.startPlay();
          if (was && !page.st.lit && page.playing) page.stopPlay();
          return r;
        }
      });
    },
    compute(p) { const F = C.FUELS[p.fuel] || C.FUELS.C2H5OH; return { F: F, eff: C.efficiency(p.d, p.shield), bonds: C.bondDH([[F.coefs.a, F.f], [F.coefs.b, 'O2']], [[F.coefs.c, 'CO2'], [F.coefs.d, 'H2O']]) }; },
    live(p, d) {
      const st = d.st; if (!st) return '';
      const r = C.combResults(st);
      if (r.dH !== null) return '\\Delta H = -\\frac{q}{n} = -\\frac{' + Math.round(r.q) + '\\ \\text{جول}}{' + r.n.toFixed(5) + '\\ \\text{مول}} = ' + r.dH + '\\ \\text{كيلوجول/مول}';
      if (r.q !== null) return 'q = c \\times m \\times \\Delta T = 4.18 \\times ' + st.water + ' \\times ' + r.dT + ' = ' + Math.round(r.q) + '\\ \\text{جول}';
      return 'q = c \\times m \\times \\Delta T ,\\quad n = \\frac{\\text{ك}_1 - \\text{ك}_2}{' + d.F.M + '}';
    },
    results(p, d) {
      const st = d.st || C.combInit(p); const r = C.combResults(st); const F = r.fuel;
      const T = (v) => (v === null ? '—' : K.f1(v) + ' °س'), Mx = (v) => (v === null ? '—' : K.g2(v) + ' غم');
      const out = [
        ['الوقود', F.name + ' {{' + C.sub(F.f) + '}} — الكتلة المولية ' + F.M + ' غم/مول', false],
        ['كتلة الماء في الكأس', st.water ? st.water + ' غم' : '—', false],
        ['د1: درجة حرارة الماء قبل التسخين', T(st.T1), false], ['د2: درجة حرارة الماء بعد التسخين', T(st.T2), false],
        ['التغير في درجة الحرارة (د2 − د1)', r.dT === null ? '—' : K.f1(r.dT) + ' °س', false],
        ['ك1: كتلة الموقد قبل الاستخدام', Mx(st.m1), false], ['ك2: كتلة الموقد بعد التسخين', Mx(st.m2), false],
        ['كتلة الكحول المحترق (ك1 − ك2)', r.dm === null ? '—' : K.g2(r.dm) + ' غم', false],
        ['كمية الحرارة التي اكتسبها الماء q', r.q === null ? '—' : Math.round(r.q) + ' جول', false],
        ['عدد مولات الكحول المحترق n', r.n ? r.n.toFixed(5) + ' مول' : '—', false],
        ['حرارة الاحتراق (قيمتك التجريبية)', r.dH === null ? 'أكمل القياسات' : K.neg(r.dH) + ' كيلوجول/مول', false, r.dH === null ? '' : 'pos'],
        ['حرارة الاحتراق في الجدول (5-2)', '−' + F.dH + ' كيلوجول/مول', false],
        ['نسبة الخطأ', r.err === null ? '—' : r.err + ' % (قيمتك أقل من قيمة الجدول)', false, r.err === null ? '' : r.err < 40 ? 'pos' : 'neg']
      ];
      if (st.alerts.length) out.push(['تنبيهات السلامة', st.alerts.length + (st.viol ? ' (منها ' + st.viol + ' إجراء خطر مُنع)' : ''), false, 'neg']);
      return out;
    },
    steps(p, d) {
      const st = d.st || C.combInit(p); const i = C.combStep(st); const r = C.combResults(st);
      const out = C.COMB_STEPS.map((s, k) => (k < i || s.done(st) ? '✅ ' : k === i ? '👉 ' : '⬜ ') + s.text);
      if (r.q !== null) out.push('**الحساب:** q = الحرارة النوعية × كتلة الماء × التغير في درجة الحرارة = 4.18 × ' + st.water + ' × ' + K.f1(r.dT) + ' = ' + Math.round(r.q) + ' جول = ' + (r.q / 1000).toFixed(3) + ' كيلوجول.');
      if (r.n) out.push('**عدد المولات:** n = (ك1 − ك2) ÷ ' + r.fuel.M + ' = ' + K.g2(r.dm) + ' ÷ ' + r.fuel.M + ' = ' + r.n.toFixed(5) + ' مول.');
      if (r.dH !== null) out.push('**حرارة الاحتراق:** ΔH = −q ÷ n = −' + (r.q / 1000).toFixed(3) + ' ÷ ' + r.n.toFixed(5) + ' = ' + K.neg(r.dH) + ' كيلوجول/مول، مقابل −' + r.fuel.dH + ' في الجدول (5-2).');
      return out;
    },
    drawCustom(ctx, W, H, p, d, cols) {
      const st = d.st || C.combInit(p); const F = d.F; const k = F.coefs;
      const burnedMol = st.burned / F.M;
      K.drawMol(ctx, W, H, d, cols, st, {
        key: 'comb-' + F.f, lhs: [[k.a, F.f], [k.b, 'O2']], rhs: [[k.c, 'CO2'], [k.d, 'H2O']], ph: st.mol || 0,
        title: 'المستوى الجزيئي: احتراق ' + F.name + (st.lit ? ' 🔥' : ''),
        eq: C.eqText([[k.a, F.f], [k.b, 'O2']], [[k.c, 'CO2'], [k.d, 'H2O']], [['l', 'g'], ['g', 'g']]),
        lines: [
          ['تكسير الروابط: +' + d.bonds.broken + ' كيلوجول • تكوين الروابط: −' + d.bonds.formed + ' كيلوجول (الجدول 5-1)', cols.text],
          ['التقدير من طاقة الروابط = ' + K.neg(d.bonds.dH) + ' كيلوجول، والقيمة المقيسة في الجدول (5-2) = −' + (F.dH * k.a) + ' كيلوجول', cols.muted],
          [burnedMol > 0 ? 'احترق ' + K.g2(st.burned) + ' غم = ' + burnedMol.toFixed(5) + ' مول ≈ ' + K.sci(burnedMol * C.NA) + ' جزيء' : 'أشعل الموقد في المختبر لترى التفاعل يحدث على مستوى الجزيئات', burnedMol > 0 ? cols.c4 : cols.muted]
        ]
      });
    },
    onPointer: K.molPointer,
    graphModes: ['درجة الحرارة – الزمن', 'المقارنة بالجدول (5-2)'],
    graph(p, d, gi) {
      const st = d.st || C.combInit(p); const r = C.combResults(st);
      if (gi === 1) {
        const top = Math.max(1500, r.fuel.dH * 1.15);
        return { view: { xmin: 0, xmax: 4, ymin: 0, ymax: top }, xLabel: '', yLabel: '|ΔH| (kJ/mol)', caption: 'العمود الأزرق: قيمتك التجريبية، والأخضر: قيمة الجدول (5-2). قيمتك أقل بسبب الفقد الحراري (سؤال 1 ص113).',
          draw(G) { const c = G.colors(); const bar = (x, v, col, lab) => { G.polygon([[x, 0], [x + 1, 0], [x + 1, v], [x, v]], { color: col, fill: col, fillAlpha: 0.55 }); G.text(x + 0.5, v, lab, { color: col, dy: -12, align: 'center', bold: true }); };
            if (r.dH !== null) bar(0.7, Math.abs(r.dH), c.c1, 'تجربتك ' + Math.abs(r.dH)); else G.text(1.2, top * 0.5, 'أكمل التجربة', { color: c.muted, align: 'center' });
            bar(2.3, r.fuel.dH, c.c3, 'الجدول ' + r.fuel.dH); } };
      }
      const h = st.hist.length ? st.hist : [[0, C.combReading(st, p)]];
      const tmax = Math.max(60, Math.ceil((h[h.length - 1][0] + 10) / 20) * 20);
      const Tmax = Math.max(st.Troom + 16, ...h.map((q) => q[1] + 2));
      return { view: { xmin: 0, xmax: tmax, ymin: Math.floor(st.Troom - 3), ymax: Math.ceil(Tmax) }, xLabel: 't (s)', yLabel: 'T (°C)', caption: 'قراءة ميزان الحرارة مع الزمن. ' + (st.T1 !== null ? 'الخط المتقطع: د1، والمنطقة الخضراء: ارتفاع 10–12 °س الذي يقترحه الكتاب.' : 'سجّل د1 ثم أشعل الموقد.'),
        draw(G) { const c = G.colors(); if (st.T1 !== null) { G.hline(st.T1, { color: c.muted, dash: [6, 4] }); G.polygon([[0, st.T1 + 10], [tmax, st.T1 + 10], [tmax, st.T1 + 12], [0, st.T1 + 12]], { color: c.c3, fill: c.c3, fillAlpha: 0.15, width: 0.5 }); } D.series(G, h, c.c2, 3); } };
    },
    explain(a, b, da, db) {
      const o = [];
      if (a.d !== b.d) o.push('غيّرت المسافة بين اللهب والكأس إلى ' + b.d + ' سم: نسبة الحرارة الواصلة إلى الماء صارت نحو ' + Math.round(db.eff * 100) + ' % (' + C.SIMPLE + ').' + (C.incomplete(b.d) ? ' اللهب يلامس الكأس: احتراق غير تام وسخام.' : b.d > 4 ? ' المسافة كبيرة: تضيع حرارة أكثر في الهواء.' : ''));
      if (a.shield !== b.shield) o.push(b.shield ? 'وضعت واقياً حول اللهب: يقل الفقد الحراري بتيارات الهواء، فتقترب النتيجة من قيمة الجدول.' : 'أزلت الواقي: تيارات الهواء تحمل جزءاً من حرارة اللهب بعيداً عن الكأس.');
      if (a.stir !== b.stir) o.push(b.stir ? 'التحريك يجعل درجة حرارة الماء متجانسة فتكون قراءة ميزان الحرارة صحيحة.' : 'بلا تحريك: الماء الساخن يبقى في الأعلى، فيقرأ ميزان الحرارة قيمة أقل من الحقيقة.');
      if (a.V !== b.V) o.push('حجم الماء الذي ستقيسه بالمخبار: ' + b.V + ' مل (كتلته ' + b.V + ' غم). كمية ماء أكبر تحتاج حرارة أكثر للارتفاع نفسه (q = c m ΔT).');
      if (a.mode !== b.mode) o.push('تغيّر وضع العمل إلى «' + K.MODE_AR[b.mode] + '» وبدأت التجربة من جديد.');
      if (a.fuel !== b.fuel) o.push('اخترت ' + db.F.name + ': حرارة احتراقه في الجدول (5-2) = ' + db.F.dH + ' كيلوجول/مول، وكتلته المولية ' + db.F.M + ' غم/مول.');
      return o;
    },
    learn: [
      '**حرارة الاحتراق:** الحرارة الناتجة عن حرق مول واحد من المادة حرقاً تاماً، وتُقاس بالكيلوجول/مول (ص111). **القيمة الحرارية:** الحرارة الناتجة عن حرق غرام واحد حرقاً تاماً (ص112).',
      '**فكرة التجربة (نشاط 5 ص112):** الحرارة الناتجة عن احتراق الكحول تنتقل إلى الماء في الكأس، فنحسبها من العلاقة: الحرارة النوعية × كتلة الماء × التغير في درجة الحرارة، ثم نقسمها على عدد مولات الكحول المحترق (ك1 − ك2)/46.',
      '**المعادلة الحرارية:** {{C₂H₅OH(l) + 3O₂(g) → 2CO₂(g) + 3H₂O(g)}} + 1367 كيلوجول (أسئلة الوحدة ص117).',
      '**على المستوى الجزيئي:** تتكسر روابط C–H و C–C و C–O و O–H في الإيثانول وروابط O=O في الأكسجين (تمتص طاقة)، ثم تتكوّن روابط C=O و O–H في النواتج (تطلق طاقة أكبر)، فيكون التفاعل طارداً (ص106–109).',
      '**الأوضاع:** «موجّه» خطوة بخطوة كما في الكتاب، و«شبه موجّه» يعطيك الهدف وتلميحاً، و«حر» تختار فيه الوقود والترتيب بنفسك.',
      '**السلامة:** ارتدِ النظارات والمعطف، وأبعد زجاجة الكحول عن اللهب، ولا تملأ الموقد وهو مشتعل، وأطفئه بالغطاء لا بالنفخ. — ' + C.GENERAL
    ],
    challenges: [
      { q: 'نفّذ التجربة كاملة في الوضع الموجّه حتى تحسب حرارة احتراق الإيثانول.', hint: 'اتبع السهم الأخضر في المختبر أو الزر المضيء في شريط الإجراءات: الوقاية ← الماء ← د1 ← الحامل ← الكحول ← ك1 ← الإشعال ← د2 ← ك2.', init: { mode: 'guided', fuel: 'C2H5OH' }, check: (p, d) => !!d.st && C.combResults(d.st).dH !== null, why: (p, d) => 'حرارة الاحتراق التجريبية = ' + K.neg(C.combResults(d.st).dH) + ' كيلوجول/مول.' },
      { q: 'اجعل التغير في درجة الحرارة بين 10 و 12 °س كما يقترح الكتاب، ثم سجّل د2.', hint: 'راقب قراءة ميزان الحرارة في المختبر (أو الرسم البياني)، وأطفئ الموقد عندما يصل الارتفاع إلى نحو 11 °س.', init: { mode: 'semi' }, check: (p, d) => { if (!d.st) return false; const r = C.combResults(d.st); return r.dT !== null && r.dT >= 10 && r.dT <= 12; }, why: () => 'ارتفاع مناسب: كبير بما يكفي لتقليل أثر خطأ القراءة، وصغير بما يكفي لتقليل الفقد الحراري.' },
      { q: 'حسّن إجراءك حتى تقل نسبة الخطأ عن 40 %.', hint: 'استخدم الواقي من تيارات الهواء، واجعل المسافة بين 2 و 3 سم، وحرّك الماء.', init: { mode: 'semi', shield: false, d: 5 }, check: (p, d) => { if (!d.st) return false; const r = C.combResults(d.st); return r.err !== null && r.err < 40; }, why: (p, d) => 'نسبة الخطأ ' + C.combResults(d.st).err + ' %: قلّلت الفقد الحراري، لكن جزءاً من الحرارة يضيع دائماً (لهذا قيمتك أقل من الجدول).' },
      { q: 'في المختبر الحر: عيّن حرارة احتراق 1-بروبانول وقارنها بقيمة الجدول (5-2).', hint: 'اختر 1-بروبانول من «الوقود»، ونفّذ القياسات نفسها. الكتلة المولية 60 غم/مول.', init: { mode: 'free', fuel: 'C3H7OH' }, check: (p, d) => p.fuel === 'C3H7OH' && !!d.st && C.combResults(d.st).dH !== null, why: () => 'حرارة احتراق 1-بروبانول أكبر من الإيثانول (2021 مقابل 1367) لأن في جزيئه روابط أكثر (سؤال 7 ص118).' }
    ],
    tutor: [
      { q: 'ماذا أفعل الآن؟', k: ['ماذا افعل', 'الخطوه', 'التاليه', 'الان', 'ابدا', 'كيف ابدا'], a: (p, d) => { const st = d.st; const i = C.combStep(st); return i < C.COMB_STEPS.length ? '👉 **الخطوة ' + (i + 1) + ':** ' + C.COMB_STEPS[i].text + '\n💡 ابحث في المختبر عن الأداة المشار إليها بالسهم الأخضر، أو استخدم زر الإجراء المضيء.' : 'اكتملت القياسات! افتح لوحة النتائج وقارن قيمتك بالجدول (5-2).'; } },
      { q: 'هل قيمتي أكبر أم أقل من قيمة الجدول؟ ولماذا؟', k: ['اكبر', 'اقل', 'الجدول', 'لماذا قيمتي', 'الحقيقيه', 'اختلاف'], a: (p, d) => { const r = C.combResults(d.st); return C.tutor('هل تصل كل الحرارة الناتجة عن اللهب إلى الماء؟ إلى أين يذهب الباقي؟', (r.dH !== null ? 'قيمتك ' + K.neg(r.dH) + ' كيلوجول/مول، وهي أقل من قيمة الجدول (−' + r.fuel.dH + ')' : 'تكون القيمة التجريبية أقل من قيمة الجدول') + ' لأن جزءاً من الحرارة يُفقد إلى الهواء والكأس والحامل، وقد لا يكون الاحتراق تاماً (سؤال 1 ص113).'); } },
      { q: 'اكتب معادلة احتراق الإيثانول', k: ['معادله', 'المعادله', 'اكتب', 'نواتج', 'موزونه'], a: () => C.tutor('ما نواتج الاحتراق التام لمركب يحوي الكربون والهيدروجين والأكسجين؟ وكم ذرة كربون في جزيء الإيثانول؟', '{{C₂H₅OH(l) + 3O₂(g) → 2CO₂(g) + 3H₂O(g)}} + 1367 كيلوجول (ص117). ذرتا كربون تعطيان 2CO₂، وست ذرات هيدروجين تعطي 3H₂O، والأكسجين في الطرفين 7 ذرات.') },
      { q: 'ما مصادر الخطأ المحتملة؟', k: ['مصادر الخطا', 'خطا', 'اخطاء', 'دقه', 'سبب الفرق'], a: (p, d) => { const e = C.combErrors(d.st, p); return C.tutor('فكّر في كل مكان يمكن أن تذهب إليه الحرارة غير الماء، وفي دقة كل قراءة سجّلتها.', '**من إجراءاتك:** ' + (e.mine.length ? e.mine.join(' ') : 'لا توجد أخطاء إجرائية واضحة حتى الآن.') + '\n**مصادر عامة (سؤال 3 ص113):** ' + e.general.join(' ')); } },
      { q: 'كيف أحسب حرارة الاحتراق؟', k: ['احسب', 'حساب', 'كيف', 'قانون', 'q'], a: (p, d) => { const r = C.combResults(d.st); return C.tutor('ما الذي اكتسب الحرارة؟ وكم مولاً من الكحول احترق؟', '1) q = 4.18 × كتلة الماء × ΔT' + (r.q !== null ? ' = ' + Math.round(r.q) + ' جول' : '') + '\n2) n = (ك1 − ك2) ÷ ' + r.fuel.M + (r.n ? ' = ' + r.n.toFixed(5) + ' مول' : '') + '\n3) ΔH = −q ÷ n' + (r.dH !== null ? ' = ' + K.neg(r.dH) + ' كيلوجول/مول' : '') + ' (الإشارة سالبة لأن التفاعل طارد).'); } },
      { q: 'لماذا يجب ارتداء النظارات وإبعاد زجاجة الكحول؟', k: ['نظارات', 'سلامه', 'خطر', 'زجاجه', 'معطف', 'قفاز', 'وقايه'], a: () => C.tutor('ما خاصية الكحول التي تجعل وجوده قرب اللهب خطراً؟', 'الكحول سريع الاشتعال، وبخاره قد يشتعل إذا اقترب من اللهب، فتبقى الزجاجة على الرف. النظارات والمعطف تحمي العين والجلد من الرذاذ والحروق. لا تملأ الموقد وهو مشتعل، وأطفئه بالغطاء. — ' + C.GENERAL) },
      { q: 'ما الفرق بين حرارة الاحتراق والقيمة الحرارية؟', k: ['القيمه الحراريه', 'فرق', 'غرام', 'مول'], a: (p, d) => C.tutor('هل نقيس الحرارة لكل مول أم لكل غرام؟', 'حرارة الاحتراق لكل **مول** (كيلوجول/مول)، والقيمة الحرارية لكل **غرام** (كيلوجول/غم) = حرارة الاحتراق ÷ الكتلة المولية (ص112). للإيثانول: 1367 ÷ 46 ≈ ' + (1367 / 46).toFixed(1) + ' كيلوجول/غم.') }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
