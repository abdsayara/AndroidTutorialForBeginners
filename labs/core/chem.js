/* الكيمياء — منطق نقي وبيانات منقولة من كتاب الكيمياء للصف العاشر (فلسطين، الطبعة الثالثة 2020م)
 * كل قيمة عددية مأخوذة من الكتاب مذكورة مع رقم صفحتها. وما لا يذكره الكتاب معلَّم بوسم «نموذج مبسّط لأغراض التعليم».
 * يحتوي هذا الملف على:
 * - الجداول
 * - محلّل الصيغ
 * - موازنة المعادلات
 * - حسابات طاقة الروابط
 * - نموذج تجربة حرارة الاحتراق (نشاط 5 ص112–113)
 * - نموذج تجربة الطارد والماص (نشاط 2 ص102–103)
 * - قواعد السلامة
 * - الهندسة الجزيئية للعرض ثلاثي الأبعاد
 */
(function (root) {
  'use strict';
  const ML = root.ML = root.ML || {};
  const C = ML.chem = {};
  C.SIMPLE = 'نموذج مبسّط لأغراض التعليم';
  C.GENERAL = 'إرشاد سلامة عام (من خارج نص النشاط)';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const r2 = (v, k) => { const f = Math.pow(10, k === undefined ? 2 : k); return Math.round(v * f) / f; };
  C.round = r2;

  /* ---------- بيانات الكتاب ---------- */
  // الجدول (5-1) ص107: طاقة الرابطة (كيلوجول/مول)
  C.BOND = {
    'H-H': 436, 'H-F': 565, 'H-Cl': 432, 'H-Br': 368, 'H-N': 389, 'H-O': 464, 'Cl-Cl': 243, 'F-F': 158, 'Br-Br': 192,
    'C=C': 607, 'N=N': 418, 'O=O': 498, 'N-N': 163, 'N-F': 272, 'C-C': 348, 'C-H': 413, 'C-N': 292, 'C-O': 358,
    'C-F': 427, 'C-Cl': 330, 'Si-H': 393, 'C≡C': 833, 'N≡N': 941, 'C=O': 724
  };
  // الجدول (5-2) ص111: حرارة الاحتراق لبعض أنواع الوقود (كيلوجول/مول) — كما طُبعت في الجدول
  C.COMBUSTION = {
    C: { name: 'الكربون', dH: 393 }, H2: { name: 'الهيدروجين', dH: 268 }, CH4: { name: 'الميثان', dH: 890 }, C2H6: { name: 'الإيثان', dH: 1560 },
    C3H8: { name: 'البروبان', dH: 2220 }, C4H10: { name: 'البيوتان', dH: 2855 }, C8H18: { name: 'الأوكتان', dH: 4560 }, CH3OH: { name: 'الميثانول', dH: 726 },
    C2H5OH: { name: 'الإيثانول', dH: 1367 }, C2H2: { name: 'الإيثاين', dH: 1298 }, C3H7OH: { name: '1-بروبانول', dH: 2021 }
  };
  C.C_WATER = 4.18;   // الحرارة النوعية للماء 4.18 جول/غم.°س (ص113)
  C.NA = 6.023e23;    // عدد أفوجادرو (ص37)
  // الكتل الذرية المقرّبة التي يستعملها الكتاب في أمثلته (H=1 ، C=12 ، O=16 ، N=14 …) والجدول الدوري ص123 لـ Zn و Ba
  C.MASS = { H: 1, C: 12, N: 14, O: 16, F: 19, Na: 23, Mg: 24, Al: 27, S: 32, Cl: 35.45, K: 39, Ca: 40, Zn: 65.39, Br: 79.9, Ba: 137.33 };
  C.NAMES = { H: 'هيدروجين', C: 'كربون', N: 'نيتروجين', O: 'أكسجين', F: 'فلور', Cl: 'كلور', Zn: 'خارصين', Ba: 'باريوم' };

  /* ---------- الصيغ ---------- */
  const SUB = '₀₁₂₃₄₅₆₇₈₉';
  // C2H5OH ← C₂H₅OH ، Ba(OH)2·8H2O ← Ba(OH)₂·8H₂O (المعامل في البداية يبقى عادياً)
  C.sub = (f) => String(f).replace(/([A-Za-z)])(\d+)/g, (m, a, n) => a + n.split('').map((d) => SUB[+d]).join(''));
  C.parse = function (f) {
    f = String(f).replace(/[₀-₉]/g, (d) => SUB.indexOf(d)).replace(/\s+/g, '');
    if (!f) throw new Error('empty formula');
    const total = {};
    f.split(/[·.*]/).forEach((part, k) => {
      let mult = 1; const m = /^(\d+)(.+)$/.exec(part);
      if (m) { mult = +m[1]; part = m[2]; }
      const stack = [{}]; let i = 0;
      while (i < part.length) {
        const ch = part[i];
        if (ch === '(') { stack.push({}); i++; continue; }
        if (ch === ')') {
          i++; let n = ''; while (/\d/.test(part[i] || '')) n += part[i++];
          if (stack.length < 2) throw new Error('formula: ' + f);
          const g = stack.pop(); const top = stack[stack.length - 1];
          for (const e in g) top[e] = (top[e] || 0) + g[e] * (n ? +n : 1);
          continue;
        }
        const em = /^([A-Z][a-z]?)(\d*)/.exec(part.slice(i));
        if (!em) throw new Error('formula: ' + f);
        const top = stack[stack.length - 1]; top[em[1]] = (top[em[1]] || 0) + (em[2] ? +em[2] : 1); i += em[0].length;
      }
      if (stack.length !== 1) throw new Error('formula: ' + f);
      for (const e in stack[0]) total[e] = (total[e] || 0) + stack[0][e] * mult;
    });
    return total;
  };
  C.molarMass = function (f) {
    const at = C.parse(f); let m = 0;
    for (const e in at) { if (C.MASS[e] === undefined) throw new Error('mass of ' + e); m += C.MASS[e] * at[e]; }
    return r2(m, 2);
  };
  // عدّ الذرات في طرف معادلة: [[معامل، صيغة] …]
  C.countSide = function (side) {
    const out = {};
    side.forEach(([k, f]) => { const at = C.parse(f); for (const e in at) out[e] = (out[e] || 0) + k * at[e]; });
    return out;
  };
  // فحص موازنة معادلة (قانون حفظ الكتلة: عدد ذرات كل عنصر متساوٍ في الطرفين)
  C.balanceCheck = function (lhs, rhs) {
    const L = C.countSide(lhs), R = C.countSide(rhs);
    const els = [...new Set(Object.keys(L).concat(Object.keys(R)))];
    const rows = els.map((e) => ({ el: e, left: L[e] || 0, right: R[e] || 0, ok: (L[e] || 0) === (R[e] || 0) }));
    const coefs = lhs.concat(rhs).map((x) => x[0]);
    const g = coefs.reduce((a, b) => gcd(a, b));
    return { ok: rows.every((r) => r.ok) && coefs.every((k) => k > 0), rows: rows, lowest: g === 1 };
  };
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = b; b = a % b; a = t; } return a; }
  C.gcd = gcd;
  // معاملات احتراق تام لمركب CxHyOz: CxHyOz + O2 → CO2 + H2O (أصغر أعداد صحيحة)
  C.combustionCoefs = function (f) {
    const at = C.parse(f); const x = at.C || 0, y = at.H || 0, z = at.O || 0;
    for (const e in at) if (!/^(C|H|O)$/.test(e)) throw new Error('not CxHyOz');
    // a CxHyOz + b O2 → c CO2 + d H2O: نضرب في 4 لتجنّب الكسور ثم نختصر على القاسم المشترك الأكبر
    const k = [4, 4 * x + y - 2 * z, 4 * x, 2 * y]; const g = k.reduce((p, q) => gcd(p, q));
    return { a: k[0] / g, b: k[1] / g, c: k[2] / g, d: k[3] / g };
  };
  C.eqText = function (lhs, rhs, states) {
    const s = (side, st) => side.map(([k, f], i) => (k === 1 ? '' : k) + C.sub(f) + (st && st[i] ? '(' + st[i] + ')' : '')).join(' + ');
    return s(lhs, states && states[0]) + ' → ' + s(rhs, states && states[1]);
  };

  /* ---------- طاقة الروابط (ص106–110) ---------- */
  // روابط كل جزيء (الصيغة البنائية)
  C.BONDS_OF = {
    H2: { 'H-H': 1 }, F2: { 'F-F': 1 }, Cl2: { 'Cl-Cl': 1 }, Br2: { 'Br-Br': 1 }, O2: { 'O=O': 1 }, N2: { 'N≡N': 1 },
    HF: { 'H-F': 1 }, HCl: { 'H-Cl': 1 }, HBr: { 'H-Br': 1 }, H2O: { 'H-O': 2 }, NH3: { 'H-N': 3 }, CO2: { 'C=O': 2 },
    CH4: { 'C-H': 4 }, C2H6: { 'C-H': 6, 'C-C': 1 }, C2H4: { 'C-H': 4, 'C=C': 1 }, CH3Cl: { 'C-H': 3, 'C-Cl': 1 },
    CH3OH: { 'C-H': 3, 'C-O': 1, 'H-O': 1 }, C2H5OH: { 'C-H': 5, 'C-C': 1, 'C-O': 1, 'H-O': 1 }, C3H7OH: { 'C-H': 7, 'C-C': 2, 'C-O': 1, 'H-O': 1 }
  };
  C.sideBonds = function (side) {
    const out = {};
    side.forEach(([k, f]) => { const b = C.BONDS_OF[f]; if (!b) throw new Error('bonds of ' + f); for (const t in b) out[t] = (out[t] || 0) + k * b[t]; });
    return out;
  };
  // ΔH = Σ طاقة الروابط المتكسّرة − Σ طاقة الروابط المتكوّنة (ص108)
  C.bondDH = function (lhs, rhs) {
    const br = C.sideBonds(lhs), fo = C.sideBonds(rhs);
    const sum = (o) => Object.keys(o).reduce((t, k) => t + o[k] * C.BOND[k], 0);
    const broken = sum(br), formed = sum(fo);
    return { broken: broken, formed: formed, dH: broken - formed, brokenList: br, formedList: fo, type: broken - formed < 0 ? 'طارد' : 'ماص' };
  };
  // تفاعلات من الكتاب لمحاكاة طاقة الروابط
  C.BOND_REACTIONS = {
    HF: { name: 'تفكك فلوريد الهيدروجين (مثال 1 ص108)', lhs: [[2, 'HF']], rhs: [[1, 'H2'], [1, 'F2']], st: [['g'], ['g', 'g']], page: 108, book: 536 },
    CH4: { name: 'احتراق الميثان (مثال 2 ص109)', lhs: [[1, 'CH4'], [2, 'O2']], rhs: [[1, 'CO2'], [2, 'H2O']], st: [['g', 'g'], ['g', 'g']], page: 109, book: -656 },
    H2Cl2: { name: 'تكوين كلوريد الهيدروجين (من الجدول 5-1)', lhs: [[1, 'H2'], [1, 'Cl2']], rhs: [[2, 'HCl']], st: [['g', 'g'], ['g']], page: 107 },
    NH3: { name: 'تحضير الأمونيا بطريقة هابر (سؤال ص110)', lhs: [[1, 'N2'], [3, 'H2']], rhs: [[2, 'NH3']], st: [['g', 'g'], ['g']], page: 110 },
    C2H5OH: { name: 'احتراق الإيثانول (نشاط 5 ص112)', lhs: [[1, 'C2H5OH'], [3, 'O2']], rhs: [[2, 'CO2'], [3, 'H2O']], st: [['g', 'g'], ['g', 'g']], page: 112 }
  };

  /* ---------- أنواع الوقود في تجربة حرارة الاحتراق ---------- */
  C.FUELS = {};
  [['C2H5OH', 'الإيثانول', 'Ethanol'], ['CH3OH', 'الميثانول', 'Methanol'], ['C3H7OH', '1-بروبانول', '1-Propanol']].forEach(([f, ar, en]) => {
    const k = C.combustionCoefs(f);
    C.FUELS[f] = { f: f, name: ar, en: en, M: C.molarMass(f), dH: C.COMBUSTION[f].dH, coefs: k, eq: C.eqText([[k.a, f], [k.b, 'O2']], [[k.c, 'CO2'], [k.d, 'H2O']]) };
  });

  /* ---------- تجربة حرارة الاحتراق (نشاط 5 ص112–113) ---------- */
  // ثوابت النموذج المبسّط (ليست من الكتاب)
  C.COMB = {
    glass: 118.40,   // كتلة زجاجة الموقد الفارغة مع الفتيل والغطاء (غم) — نموذج مبسّط
    fill: 12.00,     // كمية الكحول التي تُسكب في الموقد (غم)
    burnRate: 0.004, // معدل احتراق الكحول من الفتيل (غم/ث)
    eta0: 0.70,      // أعلى نسبة من حرارة اللهب تصل إلى الكأس مع الواقي والمسافة المثلى
    beakerC: 40,     // السعة الحرارية للكأس الزجاجي (جول/°س)
    kLoss: 0.0016,   // معدل فقد الماء للحرارة إلى الهواء (1/ث)
    tRead: 0.5,      // دقة قراءة ميزان الحرارة (°س)
    bestD: 2.5       // المسافة المثلى بين رأس اللهب وقاع الكأس (سم)
  };
  // نسبة الحرارة المنتقلة إلى الماء والكأس: تقل كلما ابتعدنا عن المسافة المثلى، وبدون واقٍ من تيارات الهواء
  C.efficiency = function (d, shield) {
    const fd = clamp(1 - 0.12 * Math.pow(d - C.COMB.bestD, 2), 0.3, 1);
    return C.COMB.eta0 * fd * (shield ? 1 : 0.72) * (C.incomplete(d) ? 0.85 : 1);
  };
  // اللهب الملامس لقاع الكأس: احتراق غير تام (سخام أسود)
  C.incomplete = (d) => d < 1.6;
  C.readT = (T) => Math.round(T / C.COMB.tRead) * C.COMB.tRead;
  C.combInit = function (p) {
    const T0 = p && Number.isFinite(p.Troom) ? p.Troom : 22;
    return {
      kind: 'comb', fuel: (p && p.fuel) || 'C2H5OH', Troom: T0, t: 0,
      ppe: { goggles: false, coat: false, gloves: false },
      cyl: 0, water: 0, T: T0, thermo: 'rack', beaker: 'bench', burner: 'bench', bottle: 'shelf',
      fuelMass: 0, filled: false, lit: false, everLit: false, burned: 0, heatIn: 0,
      T1: null, T2: null, m1: null, m2: null, T1late: false, T2lit: false, unstirred: 0, soot: 0,
      hist: [], mol: 0, events: 0, log: [], alerts: [], viol: 0, yaw: 0.5, pitch: 0.3
    };
  };
  // قراءة ميزان الحرارة (الماء غير المحرّك: طبقة سفلية أبرد عند مستودع ميزان الحرارة — نموذج مبسّط)
  C.combReading = (st, p) => (st.thermo === 'beaker' && st.water > 0 ? C.readT(st.Troom + (st.T - st.Troom) * (p.stir ? 1 : 0.88)) : C.readT(st.Troom));
  C.balanceReading = (st) => (st.burner === 'balance' ? r2(C.COMB.glass + st.fuelMass, 2) : 0);
  C.combTick = function (st, p, dt) {
    if (!(dt > 0)) return;
    st.t += dt;
    const F = C.FUELS[st.fuel];
    if (st.lit) {
      const burn = Math.min(st.fuelMass, C.COMB.burnRate * dt);
      st.fuelMass -= burn; st.burned += burn;
      if (st.burner === 'under' && st.beaker === 'stand' && st.water > 0) {
        const q = burn / F.M * F.dH * 1000 * C.efficiency(p.d, p.shield);
        st.heatIn += q; st.T += q / (st.water * C.C_WATER + C.COMB.beakerC);
        if (!p.stir) st.unstirred += dt;
        if (C.incomplete(p.d)) st.soot += dt;
      }
      st.mol = (st.mol + dt * 0.35) % 1; if (st.mol < dt * 0.35) st.events++;
      if (st.fuelMass <= 1e-6) { st.fuelMass = 0; st.lit = false; st.log.push('نفد الكحول من الموقد فانطفأ اللهب.'); }
    }
    st.T -= C.COMB.kLoss * (st.T - st.Troom) * dt;
    if (!st.hist.length || st.t - st.hist[st.hist.length - 1][0] >= 1) { st.hist.push([r2(st.t, 1), C.combReading(st, p)]); if (st.hist.length > 900) st.hist.splice(0, st.hist.length - 900); }
  };
  // خطوات النشاط بترتيب الكتاب (ص112–113)، تسبقها خطوة الوقاية
  C.COMB_STEPS = [
    { id: 'ppe', text: 'ارتدِ النظارات الواقية ومعطف المختبر قبل البدء.', acts: ['goggles', 'coat', 'gloves'], done: (st) => st.ppe.goggles && st.ppe.coat },
    { id: 'measure', text: 'قِس (100) مل من الماء بالمخبار المدرّج.', acts: ['measure'], done: (st) => st.cyl > 0 || st.water > 0 },
    { id: 'pour', text: 'اسكب الماء في الكأس الزجاجي، فكتلته (100) غم.', acts: ['pour'], done: (st) => st.water > 0 },
    { id: 'thermo', text: 'ضع ميزان الحرارة في الماء.', acts: ['thermo'], done: (st) => st.thermo === 'beaker' },
    { id: 'recT1', text: 'سجّل درجة حرارة الماء (د1).', acts: ['recT1'], done: (st) => st.T1 !== null },
    { id: 'stand', text: 'ثبّت الكأس على الحامل الثلاثي.', acts: ['stand'], done: (st) => st.beaker === 'stand' },
    { id: 'fill', text: 'ضع كمية من كحول الإيثانول في الموقد، ثم أعد الزجاجة إلى الرف بعيداً عن اللهب.', acts: ['fill', 'bottleAway'], done: (st) => st.filled && st.bottle === 'shelf' },
    { id: 'weigh1', text: 'ضع الموقد على الميزان الإلكتروني وسجّل كتلته قبل الاستخدام (ك1).', acts: ['toBalance', 'recM'], done: (st) => st.m1 !== null },
    { id: 'under', text: 'ضع الموقد تحت الكأس على الحامل.', acts: ['under'], done: (st) => st.burner === 'under' || st.everLit },
    { id: 'light', text: 'أشعل الموقد لتسخين الماء، وحرّك الماء بالقضيب الزجاجي.', acts: ['light'], done: (st) => st.everLit },
    { id: 'stop', text: 'عندما ترتفع درجة الحرارة نحو (10–12) °س أطفئ الموقد وسجّل (د2).', acts: ['extinguish', 'recT2'], done: (st) => st.T2 !== null && !st.lit },
    { id: 'weigh2', text: 'انقل الموقد إلى الميزان وسجّل كتلته بعد الاستخدام (ك2).', acts: ['toBalance', 'recM'], done: (st) => st.m2 !== null },
    { id: 'calc', text: 'احسب كمية الحرارة وعدد المولات وحرارة الاحتراق، وقارنها بالجدول (5-2).', acts: [], done: (st) => st.m2 !== null && st.T2 !== null }
  ];
  C.combStep = (st) => { const i = C.COMB_STEPS.findIndex((s) => !s.done(st)); return i < 0 ? C.COMB_STEPS.length : i; };
  // تنفيذ إجراء: { ok, msg, safety? (تحذير مع السبب), blocked? }
  C.combAct = function (st, p, id) {
    const mode = p.mode || 'guided';
    const F = C.FUELS[st.fuel];
    const R = (ok, msg, extra) => Object.assign({ ok: ok, msg: msg }, extra || {});
    const SAFE = (msg, block) => { if (block) st.viol++; st.alerts.push(msg); return R(!block, msg, { safety: true, blocked: !!block }); };
    // الوقاية متاحة دائماً
    if (id === 'goggles' || id === 'coat' || id === 'gloves') {
      if (st.ppe[id] && st.lit) return SAFE('لا تخلع أدوات الوقاية والموقد مشتعل: الكحول سريع الاشتعال وقد يتطاير رذاذ ساخن. — ' + C.GENERAL, true);
      st.ppe[id] = !st.ppe[id];
      return R(true, (st.ppe[id] ? 'ارتديت ' : 'خلعت ') + { goggles: 'النظارات الواقية', coat: 'معطف المختبر', gloves: 'القفازات' }[id] + '.');
    }
    if (mode === 'guided' && id !== 'extinguish' && id !== 'bottleAway') {
      const i = C.combStep(st); const step = C.COMB_STEPS[i];
      if (!step || step.acts.indexOf(id) < 0) return R(false, 'الوضع الموجّه: نفّذ الخطوة الحالية أولاً — ' + (step ? step.text : 'انتهت التجربة؛ اقرأ النتائج.'), { guided: true });
    }
    switch (id) {
      case 'measure':
        if (st.water > 0) return R(false, 'في الكأس ماء مسبقاً. أعد ضبط التجربة لقياس كمية جديدة.');
        if (st.cyl > 0) return R(false, 'المخبار مملوء بالفعل: ' + st.cyl + ' مل.');
        st.cyl = p.V;
        return R(true, 'قست ' + p.V + ' مل من الماء بالمخبار المدرّج (اقرأ أسفل التقعّر عند مستوى العين).' + (p.V !== 100 ? ' ملاحظة: الكتاب يستخدم (100) مل.' : ''));
      case 'pour':
        if (!(st.cyl > 0)) return R(false, 'المخبار فارغ. قِس الماء أولاً.');
        st.water += st.cyl; st.cyl = 0; st.T = st.Troom;
        return R(true, 'سكبت الماء في الكأس: كتلته ' + st.water + ' غم (كثافة الماء 1 غم/مل).');
      case 'thermo':
        if (st.thermo === 'beaker') { st.thermo = 'rack'; return R(true, 'أعدت ميزان الحرارة إلى الحامل.'); }
        if (!(st.water > 0)) return R(false, 'لا يوجد ماء في الكأس لقياس حرارته.');
        st.thermo = 'beaker'; return R(true, 'وضعت ميزان الحرارة في الماء.');
      case 'recT1':
        if (st.thermo !== 'beaker') return R(false, 'ضع ميزان الحرارة في الماء أولاً.');
        if (st.T1 !== null) return R(false, 'سجّلت د1 من قبل: ' + st.T1 + ' °س.');
        st.T1 = C.combReading(st, p); st.T1late = st.everLit;
        return R(true, 'سجّلت درجة الحرارة الابتدائية د1 = ' + st.T1 + ' °س.' + (st.T1late ? ' (سُجّلت بعد بدء التسخين — هذا خطأ في الإجراء)' : ''));
      case 'stand':
        if (st.beaker === 'stand') return R(false, 'الكأس مثبّت على الحامل.');
        st.beaker = 'stand'; return R(true, 'ثبّت الكأس على الحامل الثلاثي فوق شبكة التسخين.');
      case 'fill':
        if (st.lit) return SAFE('ممنوع: لا تسكب الكحول في موقد مشتعل! بخار الكحول سريع الاشتعال وقد تنتقل النار إلى الزجاجة. أطفئ الموقد أولاً. — ' + C.GENERAL, true);
        if (st.filled) return R(false, 'الموقد مملوء بالكحول.');
        if (st.burner === 'under') return R(false, 'املأ الموقد بعيداً عن الحامل، على سطح الطاولة.');
        st.fuelMass = C.COMB.fill; st.filled = true; st.bottle = 'bench';
        return st.ppe.gloves ? R(true, 'سكبت ' + F.name + ' في الموقد. أعد الزجاجة إلى الرف.') : Object.assign(SAFE('سكبت ' + F.name + ' في الموقد بلا قفازات: يُفضَّل لبس القفازات عند التعامل مع المواد الكيميائية. أعد الزجاجة إلى الرف. — ' + C.GENERAL, false), { ok: true });
      case 'bottleAway':
        if (st.bottle === 'shelf') return R(false, 'الزجاجة على الرف.');
        st.bottle = 'shelf'; return R(true, 'أعدت زجاجة الكحول إلى الرف بعيداً عن مصدر اللهب.');
      case 'toBalance':
        if (st.lit) return SAFE('ممنوع: لا تنقل موقداً مشتعلاً، أطفئه أولاً بوضع الغطاء. — ' + C.GENERAL, true);
        if (!st.filled) return R(false, 'ضع الكحول في الموقد أولاً.');
        if (st.burner === 'balance') return R(false, 'الموقد على الميزان.');
        st.burner = 'balance'; return R(true, 'وضعت الموقد على الميزان الإلكتروني: ' + C.balanceReading(st).toFixed(2) + ' غم.');
      case 'recM': {
        if (st.burner !== 'balance') return R(false, 'ضع الموقد على الميزان أولاً.');
        if (st.m1 === null) { st.m1 = C.balanceReading(st); return R(true, 'سجّلت كتلة الموقد قبل الاستخدام ك1 = ' + st.m1.toFixed(2) + ' غم.'); }
        if (!st.everLit) return R(false, 'سجّلت ك1 من قبل. سخّن الماء أولاً ثم سجّل ك2.');
        if (st.m2 !== null) return R(false, 'سجّلت ك2 من قبل: ' + st.m2.toFixed(2) + ' غم.');
        st.m2 = C.balanceReading(st); return R(true, 'سجّلت كتلة الموقد بعد الاستخدام ك2 = ' + st.m2.toFixed(2) + ' غم.');
      }
      case 'under':
        if (st.lit) return SAFE('ممنوع: لا تنقل موقداً مشتعلاً. — ' + C.GENERAL, true);
        if (!st.filled) return R(false, 'املأ الموقد بالكحول أولاً.');
        if (st.beaker !== 'stand') return R(false, 'ثبّت الكأس على الحامل الثلاثي أولاً.');
        if (st.burner === 'under') return R(false, 'الموقد تحت الكأس.');
        st.burner = 'under'; return R(true, 'وضعت الموقد تحت الكأس. المسافة بين رأس اللهب وقاع الكأس: ' + p.d + ' سم.');
      case 'light':
        if (st.lit) return R(false, 'الموقد مشتعل.');
        if (!st.filled || st.fuelMass <= 0) return R(false, 'الموقد فارغ.');
        if (!st.ppe.goggles || !st.ppe.coat) return SAFE('ممنوع الإشعال: ارتدِ النظارات الواقية ومعطف المختبر أولاً؛ فاللهب والكحول قد يسببان حروقاً أو إصابة للعين. — ' + C.GENERAL, true);
        if (st.bottle === 'bench') return SAFE('ممنوع الإشعال: زجاجة الكحول ما زالت قرب الموقد! الإيثانول سريع الاشتعال؛ أعدها إلى الرف أولاً. — ' + C.GENERAL, true);
        if (st.burner === 'balance') return SAFE('ممنوع: لا تشعل الموقد وهو على الميزان الإلكتروني. — ' + C.GENERAL, true);
        st.lit = true; st.everLit = true;
        return R(true, 'أشعلت الموقد.' + (st.burner !== 'under' ? ' الموقد ليس تحت الكأس — الحرارة تضيع في الهواء!' : ' راقب درجة الحرارة.') + (!p.stir ? ' تذكّر تحريك الماء.' : ''));
      case 'extinguish':
        if (!st.lit) return R(false, 'الموقد غير مشتعل.');
        st.lit = false; return R(true, 'أطفأت الموقد بوضع الغطاء على الفتيل (لا تنفخ على اللهب).');
      case 'recT2':
        if (st.thermo !== 'beaker') return R(false, 'ضع ميزان الحرارة في الماء أولاً.');
        if (!st.everLit) return R(false, 'لم تسخّن الماء بعد.');
        if (st.T2 !== null) return R(false, 'سجّلت د2 من قبل: ' + st.T2 + ' °س.');
        st.T2 = C.combReading(st, p); st.T2lit = st.lit;
        return R(true, 'سجّلت درجة الحرارة النهائية د2 = ' + st.T2 + ' °س.' + (st.lit ? ' (الموقد ما زال مشتعلاً — أطفئه.)' : ''));
      default: return R(false, 'إجراء غير معروف.');
    }
  };
  // الإجراءات المتاحة الآن (للأزرار والنقر في المشهد)
  C.COMB_ACTIONS = [
    { id: 'goggles', obj: 'goggles', label: (st) => (st.ppe.goggles ? 'اخلع النظارات' : 'ارتدِ النظارات الواقية'), icon: '🥽' },
    { id: 'coat', obj: 'coat', label: (st) => (st.ppe.coat ? 'اخلع المعطف' : 'ارتدِ معطف المختبر'), icon: '🥼' },
    { id: 'gloves', obj: 'gloves', label: (st) => (st.ppe.gloves ? 'اخلع القفازات' : 'البس القفازات'), icon: '🧤' },
    { id: 'measure', obj: 'cylinder', label: (st, p) => 'قِس ' + p.V + ' مل ماء بالمخبار', icon: '🧪', show: (st) => st.cyl === 0 && st.water === 0 },
    { id: 'pour', obj: 'cylinder', label: () => 'اسكب الماء في الكأس', icon: '🫗', show: (st) => st.cyl > 0 },
    { id: 'thermo', obj: 'thermo', label: (st) => (st.thermo === 'beaker' ? 'أخرج ميزان الحرارة' : 'ضع ميزان الحرارة في الماء'), icon: '🌡', show: (st) => st.water > 0 },
    { id: 'recT1', obj: 'thermo', label: () => 'سجّل د1', icon: '📝', show: (st) => st.T1 === null && st.thermo === 'beaker' },
    { id: 'stand', obj: 'beaker', label: () => 'ثبّت الكأس على الحامل', icon: '🔺', show: (st) => st.beaker !== 'stand' },
    { id: 'fill', obj: 'bottle', label: (st) => 'املأ الموقد بـ' + C.FUELS[st.fuel].name, icon: '🍶', show: (st) => !st.filled },
    { id: 'bottleAway', obj: 'bottle', label: () => 'أعد الزجاجة إلى الرف', icon: '↩', show: (st) => st.bottle === 'bench' },
    { id: 'toBalance', obj: 'balance', label: () => 'ضع الموقد على الميزان', icon: '⚖', show: (st) => st.filled && st.burner !== 'balance' },
    { id: 'recM', obj: 'balance', label: (st) => (st.m1 === null ? 'سجّل ك1' : 'سجّل ك2'), icon: '📝', show: (st) => st.burner === 'balance' && (st.m1 === null || (st.everLit && st.m2 === null)) },
    { id: 'under', obj: 'burner', label: () => 'ضع الموقد تحت الكأس', icon: '⬇', show: (st) => st.filled && st.burner !== 'under' && !st.lit },
    { id: 'light', obj: 'burner', label: () => 'أشعل الموقد', icon: '🔥', show: (st) => st.filled && !st.lit && st.fuelMass > 0 && st.m2 === null },
    { id: 'extinguish', obj: 'burner', label: () => 'أطفئ الموقد بالغطاء', icon: '🧯', show: (st) => st.lit },
    { id: 'recT2', obj: 'thermo', label: () => 'سجّل د2', icon: '📝', show: (st) => st.everLit && st.T2 === null && st.thermo === 'beaker' }
  ];
  C.combAvailable = (st, p) => C.COMB_ACTIONS.filter((a) => !a.show || a.show(st, p));
  // نتائج الحساب (كما في جدول الكتاب ص113)
  C.combResults = function (st) {
    const F = C.FUELS[st.fuel];
    const out = { fuel: F, table: F.dH, dT: null, q: null, dm: null, n: null, dH: null, err: null };
    if (st.T1 !== null && st.T2 !== null) { out.dT = r2(st.T2 - st.T1, 2); out.q = r2(C.C_WATER * st.water * out.dT, 1); }
    if (st.m1 !== null && st.m2 !== null) { out.dm = r2(st.m1 - st.m2, 2); out.n = out.dm > 0 ? out.dm / F.M : null; }
    if (out.q !== null && out.n) { out.dH = r2(-(out.q / 1000) / out.n, 0); out.err = r2(Math.abs(F.dH - Math.abs(out.dH)) / F.dH * 100, 1); }
    return out;
  };
  // مصادر الخطأ (سؤال 3 ص113): عامة + ناتجة عن إجراءات الطالب
  C.combErrors = function (st, p) {
    const mine = [], general = [
      'فقد جزء من الحرارة إلى الهواء المحيط بدلاً من الماء.',
      'امتصاص الكأس الزجاجي وميزان الحرارة والحامل جزءاً من الحرارة.',
      'تبخّر جزء من الكحول من الفتيل دون احتراق، فتُحسب كتلته كأنها احترقت.'
    ];
    if (st.soot > 0) mine.push('اللهب قريب جداً من قاع الكأس: احتراق غير تام (سخام أسود)، فيقل ما يُنتَج من حرارة.');
    if (p.d > 4) mine.push('المسافة بين اللهب والكأس كبيرة: جزء كبير من حرارة اللهب يضيع في الهواء.');
    if (!p.shield && st.everLit) mine.push('لم تستخدم واقياً من تيارات الهواء حول اللهب.');
    if (st.unstirred > 3) mine.push('لم تحرّك الماء: درجة الحرارة غير متجانسة، فقراءة ميزان الحرارة أقل من الحقيقة.');
    if (st.T1late) mine.push('سجّلت د1 بعد بدء التسخين، فقيمة التغير في درجة الحرارة أقل من الحقيقة.');
    if (st.T2lit) mine.push('سجّلت د2 والموقد مشتعل.');
    const res = C.combResults(st);
    if (res.dT !== null && (res.dT < 8 || res.dT > 14)) mine.push('التغير في درجة الحرارة (' + res.dT + ' °س) بعيد عن (10–12) °س التي يقترحها الكتاب: ' + (res.dT < 8 ? 'التغير الصغير يكبّر أثر خطأ القراءة (±' + C.COMB.tRead + ' °س).' : 'التسخين الطويل يزيد الفقد الحراري.'));
    if (st.water && st.water !== 100) mine.push('استخدمت ' + st.water + ' مل ماء بدلاً من (100) مل في الكتاب (يصلح الحساب ما دمت تستخدم الكتلة الصحيحة).');
    return { mine: mine, general: general };
  };

  /* ---------- تجربة الطارد والماص (نشاط 2 ص102–103) ---------- */
  // ΔH لتفاعلي النشاط ليست في الكتاب؛ القيم الآتية تقريبية للنموذج المبسّط (كيلوجول لكل مول من المتفاعل المحدِّد)
  C.EXO = {
    A: { name: 'حمض الهيدروكلوريك مع الخارصين', eq: 'Zn(s) + 2HCl(aq) → ZnCl₂(aq) + H₂(g)', dH: -154, M: C.MASS.Zn, conc: 1, tau: 9, type: 'طارد' },
    B: { name: 'هيدروكسيد الباريوم المائي مع كلوريد الأمونيوم', eq: 'Ba(OH)₂·8H₂O(s) + 2NH₄Cl(s) → BaCl₂(aq) + 2NH₃(g) + 10H₂O(l)', dH: 164, M: null, tau: 8, type: 'ماص' }
  };
  C.EXO.B.M = C.molarMass('Ba(OH)2·8H2O');
  C.M_NH4Cl = C.molarMass('NH4Cl');
  C.exoInit = function (p) {
    const T0 = p && Number.isFinite(p.Troom) ? p.Troom : 22;
    return { kind: 'exo', part: (p && p.part) || 'A', Troom: T0, t: 0, ppe: { goggles: false, coat: false, gloves: false }, hood: false,
      liquid: 0, bath: 0, solid1: 0, inBath: false, thermo: 'rack', T: T0, T1: null, T2: null, added: false, tAdd: null, xi: 0, stirT: 0,
      hist: [], mol: 0, log: [], alerts: [], viol: 0, gas: 0, yaw: 0.5, pitch: 0.3 };
  };
  C.exoXiMax = function (st, p) {
    if (st.part === 'A') { const nZn = p.mZn / C.MASS.Zn, nH = (st.liquid / 1000) * C.EXO.A.conc; return Math.min(nZn, nH / 2); }
    return Math.min(st.solid1 / C.EXO.B.M, (p.mN / C.M_NH4Cl) / 2);
  };
  C.exoTick = function (st, p, dt) {
    if (!(dt > 0)) return;
    st.t += dt;
    if (st.added) {
      const R = C.EXO[st.part]; const xm = C.exoXiMax(st, p);
      // الخليط الصلب (ب) يتفاعل بسرعة فقط مع التحريك — نموذج مبسّط
      const tau = st.part === 'B' && !p.stir ? R.tau * 5 : R.tau;
      const dx = (xm - st.xi) * (1 - Math.exp(-dt / tau)); st.xi += dx;
      const q = -dx * R.dH * 1000; // جول يكتسبها الماء
      const heatCap = st.part === 'A' ? st.liquid * C.C_WATER + 30 : st.bath * C.C_WATER + 60;
      st.T += q / heatCap; st.gas += dx; if (p.stir) st.stirT += dt;
      st.mol = (st.mol + dt * 0.4) % 1;
    }
    const cap = st.part === 'A' ? st.liquid : st.bath;
    if (cap > 0) st.T -= 0.0015 * (st.T - st.Troom) * dt;
    if (!st.hist.length || st.t - st.hist[st.hist.length - 1][0] >= 1) { st.hist.push([r2(st.t, 1), C.exoReading(st)]); if (st.hist.length > 900) st.hist.splice(0, st.hist.length - 900); }
  };
  C.exoReading = (st) => (st.thermo === 'in' ? Math.round(st.T * 10) / 10 : Math.round(st.Troom * 10) / 10);
  C.EXO_STEPS = {
    A: [
      { id: 'ppe', text: 'ارتدِ النظارات الواقية (من أدوات النشاط) ومعطف المختبر.', acts: ['goggles', 'coat', 'gloves'], done: (st) => st.ppe.goggles && st.ppe.coat },
      { id: 'pourA', text: 'ضع (20) مل من محلول حمض الهيدروكلوريك في كأس سعته (100) مل.', acts: ['pourA'], done: (st) => st.liquid > 0 },
      { id: 'thermo', text: 'ضع ميزان الحرارة في المحلول.', acts: ['thermo'], done: (st) => st.thermo === 'in' },
      { id: 'recT1', text: 'سجّل درجة الحرارة.', acts: ['recT1'], done: (st) => st.T1 !== null },
      { id: 'add', text: 'أضف (0.5) غم من مسحوق الخارصين إلى المحلول.', acts: ['add'], done: (st) => st.added },
      { id: 'wait', text: 'انتظر (30) ثانية ثم سجّل قراءة ميزان الحرارة.', acts: ['recT2'], done: (st) => st.T2 !== null }
    ],
    B: [
      { id: 'ppe', text: 'ارتدِ النظارات الواقية ومعطف المختبر، واعمل داخل خزانة الغازات.', acts: ['goggles', 'coat', 'gloves', 'hood'], done: (st) => st.ppe.goggles && st.ppe.coat && st.hood },
      { id: 'bath', text: 'ضع ماءً في الكأس الكبير سعة (500) مل ليكون حماماً مائياً.', acts: ['bath'], done: (st) => st.bath > 0 },
      { id: 'weighB', text: 'ضع حوالي (5) غم من هيدروكسيد الباريوم الصلب في كأس، وضعه داخل الحمام المائي.', acts: ['weighB'], done: (st) => st.solid1 > 0 },
      { id: 'thermo', text: 'ضع ميزان الحرارة في ماء الحمام.', acts: ['thermo'], done: (st) => st.thermo === 'in' },
      { id: 'recT1', text: 'قِس درجة حرارة الماء في الحمام.', acts: ['recT1'], done: (st) => st.T1 !== null },
      { id: 'add', text: 'أضف حوالي (2.5) غم من كلوريد الأمونيوم الصلب إلى الكأس.', acts: ['add'], done: (st) => st.added },
      { id: 'wait', text: 'حرّك المزيج جيداً بالقضيب الزجاجي (30) ثانية، ثم قِس درجة حرارة ماء الحمام.', acts: ['recT2'], done: (st) => st.T2 !== null }
    ]
  };
  C.exoStep = (st) => { const L = C.EXO_STEPS[st.part]; const i = L.findIndex((s) => !s.done(st)); return i < 0 ? L.length : i; };
  C.exoAct = function (st, p, id) {
    const R = (ok, msg, extra) => Object.assign({ ok: ok, msg: msg }, extra || {});
    const SAFE = (msg, block) => { if (block) st.viol++; st.alerts.push(msg); return R(!block, msg, { safety: true, blocked: !!block }); };
    if (id === 'goggles' || id === 'coat' || id === 'gloves') { st.ppe[id] = !st.ppe[id]; return R(true, (st.ppe[id] ? 'ارتديت ' : 'خلعت ') + { goggles: 'النظارات الواقية', coat: 'معطف المختبر', gloves: 'القفازات' }[id] + '.'); }
    if (id === 'hood') { st.hood = !st.hood; return R(true, st.hood ? 'نقلت العمل إلى داخل خزانة الغازات وشغّلت الشفّاط.' : 'أخرجت العمل من خزانة الغازات.'); }
    if ((p.mode || 'guided') === 'guided') {
      const L = C.EXO_STEPS[st.part]; const step = L[C.exoStep(st)];
      if (!step || step.acts.indexOf(id) < 0) return R(false, 'الوضع الموجّه: نفّذ الخطوة الحالية أولاً — ' + (step ? step.text : 'انتهت التجربة؛ اقرأ النتائج.'), { guided: true });
    }
    switch (id) {
      case 'pourA':
        if (st.part !== 'A') return R(false, 'هذه الخطوة للجزء (أ).');
        if (st.liquid > 0) return R(false, 'في الكأس محلول مسبقاً.');
        if (!st.ppe.goggles) return SAFE('ارتدِ النظارات الواقية قبل سكب الحمض: رذاذ الحمض يؤذي العين (النظارات الواقية من أدوات النشاط ص102).', true);
        st.liquid = p.VA; st.T = st.Troom; return R(true, 'سكبت ' + p.VA + ' مل من حمض الهيدروكلوريك المخفّف (بالمخبار المدرّج) في الكأس.');
      case 'bath':
        if (st.part !== 'B') return R(false, 'هذه الخطوة للجزء (ب).');
        if (st.bath > 0) return R(false, 'الحمام المائي جاهز.');
        st.bath = p.Vb; st.T = st.Troom; return R(true, 'وضعت ' + p.Vb + ' مل ماء في الكأس الكبير (حمام مائي).');
      case 'weighB':
        if (st.part !== 'B') return R(false, 'هذه الخطوة للجزء (ب).');
        if (!(st.bath > 0)) return R(false, 'جهّز الحمام المائي أولاً.');
        if (st.solid1 > 0) return R(false, 'هيدروكسيد الباريوم في الكأس.');
        if (!st.ppe.gloves) SAFE('هيدروكسيد الباريوم مادة كاوية وسامة: البس القفازات عند تناولها بالملعقة. — ' + C.GENERAL, false);
        st.solid1 = p.mB; st.inBath = true; return R(true, 'وزنت ' + p.mB + ' غم من Ba(OH)₂·8H₂O بالميزان الإلكتروني، ووضعت الكأس داخل الحمام المائي.');
      case 'thermo':
        if (st.thermo === 'in') { st.thermo = 'rack'; return R(true, 'أخرجت ميزان الحرارة.'); }
        if (!((st.part === 'A' ? st.liquid : st.bath) > 0)) return R(false, 'لا يوجد سائل لقياس حرارته.');
        st.thermo = 'in'; return R(true, st.part === 'A' ? 'وضعت ميزان الحرارة في المحلول.' : 'وضعت ميزان الحرارة في ماء الحمام المائي.');
      case 'recT1':
        if (st.thermo !== 'in') return R(false, 'ضع ميزان الحرارة أولاً.');
        if (st.T1 !== null) return R(false, 'سجّلت درجة الحرارة الابتدائية من قبل.');
        st.T1 = C.exoReading(st); return R(true, 'سجّلت درجة الحرارة الابتدائية: ' + st.T1 + ' °س.');
      case 'add':
        if (st.added) return R(false, 'أضفت المادة من قبل.');
        if (st.part === 'A') {
          if (!(st.liquid > 0)) return R(false, 'ضع الحمض في الكأس أولاً.');
          st.added = true; st.tAdd = st.t;
          return R(true, 'أضفت ' + p.mZn + ' غم من مسحوق الخارصين: تتصاعد فقاعات غاز الهيدروجين.' + (st.T1 === null ? ' (لم تسجّل درجة الحرارة الابتدائية!)' : ''));
        }
        if (!(st.solid1 > 0)) return R(false, 'ضع هيدروكسيد الباريوم أولاً.');
        st.added = true; st.tAdd = st.t;
        { const r = R(true, 'أضفت ' + p.mN + ' غم من كلوريد الأمونيوم.' + (st.T1 === null ? ' (لم تسجّل درجة الحرارة الابتدائية!)' : ''));
          if (!st.hood) { const s = SAFE('ينتج غاز الأمونيا (NH₃) ذو الرائحة النفّاذة المهيّجة للعين والجهاز التنفسي: نفّذ هذا الجزء داخل خزانة الغازات. — ' + C.GENERAL, false); r.msg += ' ' + s.msg; r.safety = true; }
          return r; }
      case 'recT2': {
        if (!st.added) return R(false, 'أضف المادة أولاً.');
        if (st.T2 !== null) return R(false, 'سجّلت درجة الحرارة النهائية من قبل.');
        if (st.thermo !== 'in') return R(false, 'ضع ميزان الحرارة أولاً.');
        const w = st.t - st.tAdd;
        st.T2 = C.exoReading(st); st.wait = r2(w, 0);
        return R(true, 'سجّلت درجة الحرارة بعد ' + Math.round(w) + ' ث: ' + st.T2 + ' °س.' + (w < 25 ? ' (الكتاب: انتظر 30 ثانية)' : ''));
      }
      default: return R(false, 'إجراء غير معروف.');
    }
  };
  C.EXO_ACTIONS = [
    { id: 'goggles', obj: 'goggles', label: (st) => (st.ppe.goggles ? 'اخلع النظارات' : 'ارتدِ النظارات الواقية'), icon: '🥽' },
    { id: 'coat', obj: 'coat', label: (st) => (st.ppe.coat ? 'اخلع المعطف' : 'ارتدِ معطف المختبر'), icon: '🥼' },
    { id: 'gloves', obj: 'gloves', label: (st) => (st.ppe.gloves ? 'اخلع القفازات' : 'البس القفازات'), icon: '🧤' },
    { id: 'hood', obj: 'hood', label: (st) => (st.hood ? 'اعمل خارج خزانة الغازات' : 'اعمل داخل خزانة الغازات'), icon: '🌬' },
    { id: 'pourA', obj: 'bottleHCl', label: (st, p) => 'اسكب ' + p.VA + ' مل HCl في الكأس', icon: '🫗', show: (st) => st.part === 'A' && !(st.liquid > 0) },
    { id: 'bath', obj: 'bath', label: (st, p) => 'جهّز حماماً مائياً (' + p.Vb + ' مل)', icon: '💧', show: (st) => st.part === 'B' && !(st.bath > 0) },
    { id: 'weighB', obj: 'jarBa', label: (st, p) => 'زِن ' + p.mB + ' غم Ba(OH)₂·8H₂O', icon: '⚖', show: (st) => st.part === 'B' && !(st.solid1 > 0) },
    { id: 'thermo', obj: 'thermo', label: (st) => (st.thermo === 'in' ? 'أخرج ميزان الحرارة' : 'ضع ميزان الحرارة'), icon: '🌡' },
    { id: 'recT1', obj: 'thermo', label: () => 'سجّل الحرارة الابتدائية', icon: '📝', show: (st) => st.T1 === null && st.thermo === 'in' },
    { id: 'add', obj: (st) => (st.part === 'A' ? 'jarZn' : 'jarN'), label: (st, p) => (st.part === 'A' ? 'أضف ' + p.mZn + ' غم Zn' : 'أضف ' + p.mN + ' غم NH₄Cl'), icon: '🥄', show: (st) => !st.added },
    { id: 'recT2', obj: 'thermo', label: () => 'سجّل الحرارة النهائية', icon: '📝', show: (st) => st.added && st.T2 === null }
  ];
  C.exoAvailable = (st, p) => C.EXO_ACTIONS.filter((a) => !a.show || a.show(st, p));

  /* ---------- الهندسة الجزيئية (للعرض ثلاثي الأبعاد على المستوى الجزيئي) ---------- */
  // ألوان CPK وأنصاف أقطار للعرض فقط
  C.ATOM = { H: { c: '#f8fafc', r: 0.28 }, C: { c: '#374151', r: 0.42 }, O: { c: '#ef4444', r: 0.42 }, N: { c: '#3b82f6', r: 0.41 }, F: { c: '#a3e635', r: 0.38 }, Cl: { c: '#22c55e', r: 0.5 }, Br: { c: '#b45309', r: 0.55 }, Zn: { c: '#94a3b8', r: 0.55 }, Ca: { c: '#65a30d', r: 0.6 } };
  const V = { add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], mul: (a, k) => [a[0] * k, a[1] * k, a[2] * k],
    len: (a) => Math.hypot(a[0], a[1], a[2]), norm: (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
    cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]] };
  C.V = V;
  // سلسلة ذرات ثقيلة متعرّجة (زاوية 109.5°) ثم ذرات H حول كل ذرة
  function chain(heavy, hs) {
    const atoms = [], bonds = [];
    const dx = 1.26, dy = 0.89;
    heavy.forEach((el, i) => atoms.push({ el: el, p: [i * dx, (i % 2) * dy, 0] }));
    for (let i = 1; i < heavy.length; i++) bonds.push([i - 1, i, 1]);
    heavy.forEach((el, i) => {
      const n = hs[i]; if (!n) return;
      const A = atoms[i].p; const nb = [];
      if (i > 0) nb.push(V.norm(V.sub(atoms[i - 1].p, A)));
      if (i < heavy.length - 1) nb.push(V.norm(V.sub(atoms[i + 1].p, A)));
      const L = 1.0; let dirs = [];
      if (nb.length === 0) dirs = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]].map(V.norm);
      else if (nb.length === 2) {
        const b = V.norm(V.mul(V.add(nb[0], nb[1]), -1)), nn = V.norm(V.cross(nb[0], nb[1]));
        const a = 54.75 * Math.PI / 180; dirs = [V.add(V.mul(b, Math.cos(a)), V.mul(nn, Math.sin(a))), V.add(V.mul(b, Math.cos(a)), V.mul(nn, -Math.sin(a)))];
      } else {
        const u = nb[0];
        if (n === 1) { // OH: امتداد السلسلة المتعرّجة
          const k = heavy.length; const nxt = [k * dx, (k % 2) * dy, 0]; dirs = [V.norm(V.sub(nxt, A))];
        } else {
          let ref = Math.abs(u[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]; const e1 = V.norm(V.cross(u, ref)), e2 = V.cross(u, e1);
          for (let k = 0; k < 3; k++) { const t = k * 2 * Math.PI / 3 + Math.PI / 2; dirs.push(V.norm(V.add(V.mul(u, -1 / 3), V.mul(V.add(V.mul(e1, Math.cos(t)), V.mul(e2, Math.sin(t))), 0.943)))); }
        }
      }
      for (let k = 0; k < n; k++) { atoms.push({ el: 'H', p: V.add(A, V.mul(dirs[k], L)) }); bonds.push([i, atoms.length - 1, 1]); }
    });
    return { atoms: atoms, bonds: bonds };
  }
  const di = (a, b, order, d) => ({ atoms: [{ el: a, p: [0, 0, 0] }, { el: b, p: [d || 1.2, 0, 0] }], bonds: [[0, 1, order || 1]] });
  C.MOL = {
    H2: () => di('H', 'H', 1, 0.8), F2: () => di('F', 'F', 1, 1.3), Cl2: () => di('Cl', 'Cl', 1, 1.7), Br2: () => di('Br', 'Br', 1, 1.9), O2: () => di('O', 'O', 2, 1.2), N2: () => di('N', 'N', 3, 1.1),
    HF: () => di('H', 'F', 1, 0.95), HCl: () => di('H', 'Cl', 1, 1.3), HBr: () => di('H', 'Br', 1, 1.4),
    H2O: () => ({ atoms: [{ el: 'O', p: [0, 0, 0] }, { el: 'H', p: [0.78, 0.6, 0] }, { el: 'H', p: [-0.78, 0.6, 0] }], bonds: [[0, 1, 1], [0, 2, 1]] }),
    CO2: () => ({ atoms: [{ el: 'C', p: [0, 0, 0] }, { el: 'O', p: [1.2, 0, 0] }, { el: 'O', p: [-1.2, 0, 0] }], bonds: [[0, 1, 2], [0, 2, 2]] }),
    NH3: () => ({ atoms: [{ el: 'N', p: [0, 0.25, 0] }, { el: 'H', p: [0.94, -0.1, 0] }, { el: 'H', p: [-0.47, -0.1, 0.81] }, { el: 'H', p: [-0.47, -0.1, -0.81] }], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] }),
    CH4: () => chain(['C'], [4]), C2H6: () => chain(['C', 'C'], [3, 3]),
    CH3OH: () => chain(['C', 'O'], [3, 1]), C2H5OH: () => chain(['C', 'C', 'O'], [3, 2, 1]), C3H7OH: () => chain(['C', 'C', 'C', 'O'], [3, 2, 2, 1])
  };
  C.molecule = function (f) {
    const g = C.MOL[f]; if (!g) throw new Error('no geometry for ' + f);
    const m = g(); const c = m.atoms.reduce((s, a) => V.add(s, a.p), [0, 0, 0]).map((v) => v / m.atoms.length);
    m.atoms.forEach((a) => { a.p = V.sub(a.p, c); }); m.f = f;
    m.size = Math.max(0.8, ...m.atoms.map((a) => V.len(a.p) + 0.5));
    return m;
  };
  // مشهد تفاعل: كل ذرة لها موقع في المتفاعلات وموقع في النواتج (نفس العنصر) — حفظ الذرات
  C.reactionScene = function (lhs, rhs) {
    // كل طرف شبكة من الجزيئات بحجمها الحقيقي (دون تصغير)، والطرفان متقابلان حول x = 0
    const place = (side, sign) => {
      const mols = []; side.forEach(([k, f]) => { for (let i = 0; i < k; i++) mols.push(C.molecule(f)); });
      const n = mols.length; const cols = n <= 3 ? n : Math.ceil(n / 2); const rows = Math.ceil(n / cols);
      const cw = Math.max(2.4, ...mols.map((m) => 2 * m.size + 0.3)), ch = Math.max(2.2, ...mols.map((m) => 1.6 * m.size + 0.3));
      const cx0 = sign * (cols * cw / 2 + 1.0); const atoms = [], bonds = [];
      mols.forEach((m, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        const cx = cx0 + (c - (cols - 1) / 2) * cw, cy = ((rows - 1) / 2 - r) * ch, cz = ((i % 2) - 0.5) * 0.6;
        const base = atoms.length; const rot = i * 0.9;
        m.atoms.forEach((a) => { const [x, y, z] = a.p; const xr = x * Math.cos(rot) - z * Math.sin(rot), zr = x * Math.sin(rot) + z * Math.cos(rot); atoms.push({ el: a.el, p: [cx + xr, cy + y, cz + zr], mol: i }); });
        m.bonds.forEach((b) => bonds.push([b[0] + base, b[1] + base, b[2]]));
      });
      return { atoms: atoms, bonds: bonds, mols: mols, c: [cx0, 0, 0] };
    };
    const L = place(lhs, -1), R = place(rhs, 1);
    const ext = L.atoms.concat(R.atoms).reduce((e, a) => [Math.max(e[0], Math.abs(a.p[0]) + 0.5), Math.max(e[1], Math.abs(a.p[1]) + 0.5)], [1, 1]);
    // مطابقة الذرات بالعنصر بالترتيب
    const pool = {}; R.atoms.forEach((a, j) => { (pool[a.el] = pool[a.el] || []).push(j); });
    const map = L.atoms.map((a) => { const q = pool[a.el]; if (!q || !q.length) throw new Error('unbalanced: ' + a.el); return q.shift(); });
    if (Object.values(pool).some((q) => q.length)) throw new Error('unbalanced');
    return { L: L, R: R, map: map, ext: ext };
  };
  // موقع الذرات عند طور التفاعل ph ∈ [0,1): متفاعلات ← كسر الروابط ← انتقال الذرات ← تكوين الروابط
  C.PHASES = [[0, 'جزيئات المتفاعلات قبل التفاعل'], [0.22, 'كسر الروابط (تمتص طاقة)'], [0.45, 'إعادة ترتيب الذرات'], [0.72, 'تكوين روابط جديدة (تطلق طاقة)'], [0.9, 'النواتج']];
  C.phaseName = (ph) => { let n = C.PHASES[0][1]; C.PHASES.forEach(([a, s]) => { if (ph >= a) n = s; }); return n; };
  C.sceneAt = function (S, ph) {
    const ease = (t) => t * t * (3 - 2 * t);
    const atoms = S.L.atoms.map((a, i) => {
      const b = S.R.atoms[S.map[i]];
      let p;
      if (ph < 0.22) p = a.p;
      else if (ph < 0.45) { const t = ease((ph - 0.22) / 0.23); p = V.add(a.p, V.mul(V.sub(a.p, S.L.c), 0.25 * t)); }
      else if (ph < 0.72) { const t = ease((ph - 0.45) / 0.27); const from = V.add(a.p, V.mul(V.sub(a.p, S.L.c), 0.25)); const to = V.add(b.p, V.mul(V.sub(b.p, S.R.c), 0.25)); p = V.add(from, V.mul(V.sub(to, from), t)); }
      else if (ph < 0.9) { const t = ease((ph - 0.72) / 0.18); const from = V.add(b.p, V.mul(V.sub(b.p, S.R.c), 0.25)); p = V.add(from, V.mul(V.sub(b.p, from), t)); }
      else p = b.p;
      return { el: a.el, p: p };
    });
    // الروابط: المتفاعلات تتلاشى (كسر)، النواتج تظهر (تكوين). الأرقام بحسب فهرس ذرات المتفاعلات
    const inv = []; S.map.forEach((j, i) => { inv[j] = i; });
    const bonds = [];
    if (ph < 0.45) { const a = ph < 0.22 ? 1 : 1 - (ph - 0.22) / 0.23; S.L.bonds.forEach((b) => bonds.push({ i: b[0], j: b[1], o: b[2], a: a, kind: ph >= 0.22 ? 'break' : 'old' })); }
    if (ph >= 0.72) { const a = ph >= 0.9 ? 1 : (ph - 0.72) / 0.18; S.R.bonds.forEach((b) => bonds.push({ i: inv[b[0]], j: inv[b[1]], o: b[2], a: a, kind: ph < 0.9 ? 'form' : 'new' })); }
    return { atoms: atoms, bonds: bonds };
  };
  // رسم كرات وعصي بإسقاط منظوري على Canvas ثنائي الأبعاد
  C.drawBallStick = function (ctx, frame, o) {
    const cy = Math.cos(o.yaw), sy = Math.sin(o.yaw), cp = Math.cos(o.pitch), sp = Math.sin(o.pitch);
    const pr = (p) => {
      let x = p[0] * cy + p[2] * sy, z = -p[0] * sy + p[2] * cy; let y = p[1];
      const y2 = y * cp - z * sp, z2 = y * sp + z * cp; y = y2; z = z2;
      const f = o.fov / (o.fov + z); return { x: o.cx + x * o.s * f, y: o.cy - y * o.s * f, z: z, f: f };
    };
    const P = frame.atoms.map((a) => pr(a.p));
    const items = [];
    frame.bonds.forEach((b) => { if (b.a <= 0.02) return; const A = P[b.i], B = P[b.j]; items.push({ z: (A.z + B.z) / 2 + 0.01, draw: () => {
      const col = b.kind === 'break' ? o.colors.bad : b.kind === 'form' ? o.colors.ok : o.colors.bond;
      ctx.globalAlpha = Math.max(0.05, Math.min(1, b.a)); ctx.strokeStyle = col; ctx.lineCap = 'round';
      const w = Math.max(2, 0.16 * o.s * (A.f + B.f) / 2);
      const nx = -(B.y - A.y), ny = B.x - A.x, nl = Math.hypot(nx, ny) || 1;
      for (let k = 0; k < b.o; k++) { const off = (k - (b.o - 1) / 2) * w * 1.1; ctx.lineWidth = b.o > 1 ? w * 0.7 : w; ctx.beginPath(); ctx.moveTo(A.x + nx / nl * off, A.y + ny / nl * off); ctx.lineTo(B.x + nx / nl * off, B.y + ny / nl * off); ctx.stroke(); }
      ctx.globalAlpha = 1; } }); });
    frame.atoms.forEach((a, i) => { const p = P[i]; const at = C.ATOM[a.el] || { c: '#999', r: 0.4 }; items.push({ z: p.z, draw: () => {
      const r = Math.max(2, at.r * o.s * p.f * (o.atomScale || 1));
      const g = ctx.createRadialGradient(p.x - r * 0.35, p.y - r * 0.35, r * 0.1, p.x, p.y, r);
      g.addColorStop(0, C.shade(at.c, 0.55)); g.addColorStop(0.35, at.c); g.addColorStop(1, shade(at.c, -0.45));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; ctx.stroke();
      if (o.labels && r > 9) { ctx.fillStyle = a.el === 'H' ? '#111' : '#fff'; ctx.font = '700 ' + Math.round(r * 0.9) + 'px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(a.el, p.x, p.y + 1); }
    } }); });
    items.sort((a, b) => b.z - a.z).forEach((it) => it.draw());
  };
  function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = (c) => Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k);
    return 'rgb(' + f(r) + ',' + f(g) + ',' + f(b) + ')';
  }
  C.shade = shade;

  /* ---------- المساعد: تلميح أولاً في وضع التعلّم ---------- */
  // في وضع «تعلّم» يعطي المساعد سؤالاً موجّهاً وتلميحاً دون الجواب المباشر
  C.tutor = (hint, answer) => {
    const learn = root.ML && ML.current && ML.current.mode === 'learn';
    return '💡 **سؤال موجّه:** ' + hint + (learn ? '\n\nفكّر في الإجابة أولاً. ستجد الجواب الكامل إذا سألتني مرة أخرى في وضع «تجربة».' : '\n\n✅ **الجواب:** ' + answer);
  };
})(typeof window !== 'undefined' ? window : globalThis);
