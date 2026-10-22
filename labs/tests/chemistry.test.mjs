// اختبارات مختبر الكيمياء — التشغيل: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(dir, '..');
const ctx = vm.createContext({ console: { ...console, warn() {} }, performance, Math });
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const f of [...html.matchAll(/<script src="((?:core|subjects)[^"]+)"/g)].map((m) => m[1])) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const ML = ctx.ML, C = ML.chem;
const SIMS = ML.sims.filter((s) => s.subject === 'g10-chem');
const sim = (id) => SIMS.find((s) => s.id === id);
const J = (x) => JSON.parse(JSON.stringify(x));
const defaults = (s) => { const p = Object.fromEntries(s.params.map((q) => [q.key, q.value])); if (s.onSet) s.onSet(p, null); return p; };
function stubCtx() {
  const target = { createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }), measureText: () => ({ width: 10 }) };
  return new Proxy(target, { get: (t, k) => (k in t ? t[k] : () => {}), set: (t, k, v) => { t[k] = v; return true; } });
}
const COLORS = { bg: '#fff', grid: '#eee', grid2: '#f5f5f5', axis: '#333', text: '#444', c1: '#2563eb', c2: '#dc2626', c3: '#059669', c4: '#d97706', c5: '#7c3aed', c6: '#db2777', muted: '#94a3b8' };
function exercise(s, p, label, st) {
  if (s.onSet) s.onSet(p, null);
  const d = s.compute(p); d.st = st || (s.initState ? s.initState(p) : undefined); d.hits = [];
  const all = JSON.stringify(s.results(p, d)) + (s.live ? s.live(p, d) : '') + JSON.stringify(s.steps(p, d));
  assert.ok(!/NaN|undefined|Infinity|\[object/.test(all), label + ' → ' + (all.match(/.{0,60}(NaN|undefined|Infinity|\[object).{0,20}/) || [''])[0]);
  for (const [W, H] of [[900, 540], [360, 460]]) { d.hits = []; s.drawCustom(stubCtx(), W, H, p, d, COLORS); d.hits.forEach((h) => assert.ok([h.x, h.y, h.w, h.h].every((v) => v === undefined || Number.isFinite(v)), label + ' hit')); }
  if (s.graph) (s.graphModes || [0]).forEach((_, i) => { const g = s.graph(p, d, i); assert.ok(g.view.xmax > g.view.xmin && g.view.ymax > g.view.ymin, label + ' graph ' + i); });
  return d;
}
// تنفيذ التجربة الموجّهة كاملة كما يفعل الطالب
function runCombustion(p, stopAt) {
  const st = C.combInit(p);
  const seq = ['goggles', 'coat', 'measure', 'pour', 'thermo', 'recT1', 'stand', 'fill', 'bottleAway', 'toBalance', 'recM', 'under', 'light'];
  for (const a of seq) { const r = C.combAct(st, p, a); assert.ok(r.ok, a + ': ' + r.msg); }
  let guard = 0; while (C.combReading(st, p) - st.T1 < (stopAt || 11) && guard++ < 200000) C.combTick(st, p, 0.05);
  for (const a of ['extinguish', 'recT2', 'toBalance', 'recM']) { const r = C.combAct(st, p, a); assert.ok(r.ok, a + ': ' + r.msg); }
  return st;
}

test('مادة الكيمياء مسجلة في الصف العاشر بوحدات الكتاب الخمس', () => {
  assert.ok(ML.grades.find((g) => g.id === 'g10').subjects.includes('g10-chem'));
  const subj = ML.subjects['g10-chem'];
  assert.equal(subj.units.length, 5); assert.equal(subj.slug, 'chemistry'); assert.equal(subj.tutor, 'مساعد الكيمياء الذكي');
  assert.deepEqual(J(subj.units.map((u) => u.pages)), ['2–28', '29–49', '50–68', '69–99', '100–119']);
  assert.ok(SIMS.length >= 4);
});

test('كل تجربة: مصدر (صفحة داخل الوحدة)، تعلّم، تحديات، مساعد، ومعرّف فريد', () => {
  const ids = new Set();
  for (const s of SIMS) {
    assert.ok(!ids.has(s.id), 'duplicate ' + s.id); ids.add(s.id);
    const u = ML.subjects['g10-chem'].units[s.unit - 1]; const [a, b] = u.pages.split('–').map(Number);
    assert.ok(Number.isInteger(s.page) && s.page >= a && s.page <= b, s.id + ' page');
    assert.ok(s.titleAr && s.titleEn && s.lesson && s.lessonTitle && s.book && s.summary, s.id + ' meta');
    assert.ok((s.learn || []).length >= 3, s.id + ' learn'); assert.ok((s.challenges || []).length >= 2, s.id + ' challenges'); assert.ok((s.tutor || []).length >= 3, s.id + ' tutor');
    assert.ok(s.vars.every((v) => v.length === 4), s.id + ' vars');
  }
});

test('بيانات الكتاب: الجدول (5-1) طاقات الروابط والجدول (5-2) حرارة الاحتراق كما طُبعا', () => {
  assert.equal(Object.keys(C.BOND).length, 24);
  for (const [k, v] of [['H-H', 436], ['H-F', 565], ['F-F', 158], ['C-H', 413], ['O=O', 498], ['H-O', 464], ['C=O', 724], ['N≡N', 941], ['C≡C', 833], ['Cl-Cl', 243]]) assert.equal(C.BOND[k], v, k);
  const comb = Object.fromEntries(Object.entries(C.COMBUSTION).map(([k, v]) => [k, v.dH]));
  assert.deepEqual(J(comb), { C: 393, H2: 268, CH4: 890, C2H6: 1560, C3H8: 2220, C4H10: 2855, C8H18: 4560, CH3OH: 726, C2H5OH: 1367, C2H2: 1298, C3H7OH: 2021 });
  assert.equal(C.C_WATER, 4.18);
});

test('محلّل الصيغ والكتلة المولية (أمثلة الكتاب)', () => {
  assert.deepEqual(J(C.parse('C2H5OH')), { C: 2, H: 6, O: 1 });
  assert.deepEqual(J(C.parse('Ba(OH)2·8H2O')), { Ba: 1, O: 10, H: 18 });
  assert.deepEqual(J(C.parse('Ca(OH)₂')), { Ca: 1, O: 2, H: 2 });
  assert.equal(C.molarMass('C2H5OH'), 46);   // ص113
  assert.equal(C.molarMass('CaCO3'), 100);   // مثال (1) ص38
  assert.equal(C.molarMass('KAl(SO4)2·12H2O'), 474); // مثال (2) ص39
  assert.equal(C.molarMass('C6H12O6'), 180); // ص38
  assert.throws(() => C.parse('C2H5O)H'));
  assert.throws(() => C.molarMass('Xx2'));
  assert.equal(C.sub('C2H5OH'), 'C₂H₅OH'); assert.equal(C.sub('Ba(OH)2·8H2O'), 'Ba(OH)₂·8H₂O');
});

test('وزن المعادلات: معاملات الاحتراق وحفظ الذرات', () => {
  assert.deepEqual(J(C.combustionCoefs('C2H5OH')), { a: 1, b: 3, c: 2, d: 3 });
  assert.deepEqual(J(C.combustionCoefs('CH3OH')), { a: 2, b: 3, c: 2, d: 4 });
  assert.deepEqual(J(C.combustionCoefs('C3H7OH')), { a: 2, b: 9, c: 6, d: 8 });
  assert.deepEqual(J(C.combustionCoefs('CH4')), { a: 1, b: 2, c: 1, d: 2 });
  const ok = C.balanceCheck([[1, 'C2H5OH'], [3, 'O2']], [[2, 'CO2'], [3, 'H2O']]); assert.ok(ok.ok && ok.lowest);
  const bad = C.balanceCheck([[1, 'C2H5OH'], [1, 'O2']], [[2, 'CO2'], [3, 'H2O']]); assert.ok(!bad.ok);
  const dbl = C.balanceCheck([[2, 'C2H5OH'], [6, 'O2']], [[4, 'CO2'], [6, 'H2O']]); assert.ok(dbl.ok && !dbl.lowest);
  const s = sim('balance-equation');
  for (const [rx, ans] of [['C2H5OH', [1, 3, 2, 3]], ['CH4', [1, 2, 1, 2]], ['C3H8', [1, 5, 3, 4]], ['H2O', [2, 1, 2, 1]], ['NH3', [1, 3, 2, 1]], ['Zn', [1, 2, 1, 1]], ['Ca', [1, 2, 1, 1]]]) {
    const d = s.compute({ rx, a: ans[0], b: ans[1], c: ans[2], d: ans[3] }); assert.ok(d.chk.ok && d.chk.lowest, rx); assert.equal(d.mL, d.mR, rx + ' mass');
  }
  assert.equal(s.compute({ rx: 'H2O', a: 2, b: 1, c: 2, d: 1 }).mL, 36); // نشاط 9 ص43: 36 = 36
});

test('طاقة الروابط: مثالا الكتاب ص108–109', () => {
  const hf = C.bondDH([[2, 'HF']], [[1, 'H2'], [1, 'F2']]);
  assert.equal(hf.broken, 1130); assert.equal(hf.formed, 594); assert.equal(hf.dH, 536); assert.equal(hf.type, 'ماص');
  const ch4 = C.bondDH([[1, 'CH4'], [2, 'O2']], [[1, 'CO2'], [2, 'H2O']]);
  assert.equal(ch4.broken, 2648); assert.equal(ch4.formed, 3304); assert.equal(ch4.dH, -656); assert.equal(ch4.type, 'طارد');
  for (const k in C.BOND_REACTIONS) { const r = C.BOND_REACTIONS[k]; assert.ok(C.balanceCheck(r.lhs, r.rhs).ok, k + ' balanced'); if (r.book !== undefined) assert.equal(C.bondDH(r.lhs, r.rhs).dH, r.book, k); }
});

test('المستوى الجزيئي: كل ذرة في المتفاعلات تنتقل إلى ذرة من العنصر نفسه في النواتج', () => {
  for (const k in C.BOND_REACTIONS) {
    const r = C.BOND_REACTIONS[k]; const S = C.reactionScene(r.lhs, r.rhs);
    assert.equal(S.L.atoms.length, S.R.atoms.length, k);
    S.map.forEach((j, i) => assert.equal(S.L.atoms[i].el, S.R.atoms[j].el, k));
    assert.equal(new Set(S.map).size, S.map.length, k + ' one-to-one');
    for (const ph of [0, 0.3, 0.5, 0.8, 0.95]) { const f = C.sceneAt(S, ph); assert.ok(f.atoms.every((a) => a.p.every(Number.isFinite)), k + ' ' + ph); }
    assert.equal(C.sceneAt(S, 0).bonds.length, S.L.bonds.length); assert.equal(C.sceneAt(S, 0.95).bonds.length, S.R.bonds.length);
  }
  assert.throws(() => C.reactionScene([[1, 'CH4'], [1, 'O2']], [[1, 'CO2'], [2, 'H2O']]));
});

test('حرارة الاحتراق: الحساب المرجعي (q = c m ΔT ، n = Δm/M ، ΔH = −q/n)', () => {
  const st = C.combInit({ Troom: 20, fuel: 'C2H5OH' });
  Object.assign(st, { water: 100, T1: 20, T2: 30, m1: 130.4, m2: 130.4 - 4.18 * 100 * 10 / 1000 / 1367 * 46 });
  const r = C.combResults(st);
  assert.equal(r.q, 4180); assert.equal(r.dT, 10); assert.equal(r.dm, 0.14);
  // كفاءة 100٪ تعيد قيمة الجدول تقريباً (القراءة مقرّبة إلى 0.01 غم)
  assert.ok(Math.abs(Math.abs(r.dH) - 1367) / 1367 < 0.03, 'dH ' + r.dH);
  // سؤال الوحدة ص117: 4.6 غم إيثانول تعطي 136.7 كيلوجول
  assert.equal(Math.round(4.6 / C.FUELS.C2H5OH.M * C.FUELS.C2H5OH.dH * 10) / 10, 136.7);
});

test('حرارة الاحتراق: التجربة الموجّهة كاملة، والنتيجة أقل من الجدول وتتأثر بإجراءات الطالب', () => {
  const base = { mode: 'guided', fuel: 'C2H5OH', V: 100, d: 2.5, shield: true, stir: true, Troom: 22 };
  const good = C.combResults(runCombustion(base));
  assert.ok(good.dH < 0 && Math.abs(good.dH) < 1367, 'below table: ' + good.dH);
  assert.ok(good.err < 40, 'good technique error ' + good.err);
  const poor = C.combResults(runCombustion(Object.assign({}, base, { mode: 'semi', shield: false, d: 5.5 })));
  assert.ok(poor.err > good.err + 10, 'poor technique ' + poor.err + ' vs ' + good.err);
  const st = runCombustion(Object.assign({}, base, { mode: 'free', stir: false, d: 1 }));
  const e = C.combErrors(st, Object.assign({}, base, { stir: false, d: 1 }));
  assert.ok(e.mine.some((x) => /تحرّك/.test(x)) && e.mine.some((x) => /غير تام/.test(x)), J(e.mine).join(' | '));
  assert.equal(e.general.length, 3);
});

test('الوضع الموجّه يفرض ترتيب الكتاب، والوضع الحر يسمح بالترتيب مع تسجيل الخطأ', () => {
  const p = { mode: 'guided', fuel: 'C2H5OH', V: 100, d: 2.5, shield: false, stir: true, Troom: 22 };
  const st = C.combInit(p);
  const r = C.combAct(st, p, 'measure'); assert.ok(!r.ok && r.guided, 'PPE first');
  C.combAct(st, p, 'goggles'); C.combAct(st, p, 'coat');
  assert.ok(!C.combAct(st, p, 'stand').ok, 'stand before water is locked in guided');
  assert.ok(C.combAct(st, p, 'measure').ok);
  assert.equal(C.combStep(st), 2);
  const pf = Object.assign({}, p, { mode: 'free' }); const sf = C.combInit(pf);
  assert.ok(C.combAct(sf, pf, 'stand').ok, 'free order');
  assert.ok(!C.combAct(sf, pf, 'pour').ok, 'physical prerequisite still applies');
});

test('السلامة: الإجراءات الخطرة تُمنع مع ذكر السبب', () => {
  const p = { mode: 'free', fuel: 'C2H5OH', V: 100, d: 2.5, shield: false, stir: true, Troom: 22 };
  const st = C.combInit(p);
  C.combAct(st, p, 'measure'); C.combAct(st, p, 'pour'); C.combAct(st, p, 'stand'); C.combAct(st, p, 'fill');
  let r = C.combAct(st, p, 'light'); assert.ok(r.safety && r.blocked && /النظارات/.test(r.msg), 'no goggles');
  C.combAct(st, p, 'goggles'); C.combAct(st, p, 'coat');
  r = C.combAct(st, p, 'light'); assert.ok(r.safety && r.blocked && /الزجاجة|زجاجة/.test(r.msg), 'bottle near flame');
  C.combAct(st, p, 'bottleAway'); C.combAct(st, p, 'under');
  r = C.combAct(st, p, 'light'); assert.ok(r.ok && st.lit);
  r = C.combAct(st, p, 'fill'); assert.ok(r.blocked, 'refill while lit');
  r = C.combAct(st, p, 'toBalance'); assert.ok(r.blocked, 'move lit burner');
  r = C.combAct(st, p, 'goggles'); assert.ok(r.blocked && st.ppe.goggles, 'keep goggles while lit');
  assert.ok(st.viol >= 5);
  // الجزء (ب) من نشاط 2: تنبيه خزانة الغازات
  const pe = { mode: 'free', part: 'B', VA: 20, mZn: 0.5, Vb: 300, mB: 5, mN: 2.5, stir: true, Troom: 22 };
  const se = C.exoInit(pe); C.exoAct(se, pe, 'bath'); C.exoAct(se, pe, 'weighB'); const ra = C.exoAct(se, pe, 'add');
  assert.ok(ra.safety && /خزانة الغازات/.test(ra.msg));
});

test('الطارد والماص: الحرارة ترتفع في (أ) وتنخفض في (ب)', () => {
  for (const [part, sign] of [['A', 1], ['B', -1]]) {
    const p = { mode: 'guided', part, VA: 20, mZn: 0.5, Vb: 300, mB: 5, mN: 2.5, stir: true, Troom: 22 };
    const st = C.exoInit(p);
    const seq = part === 'A' ? ['goggles', 'coat', 'pourA', 'thermo', 'recT1', 'add'] : ['goggles', 'coat', 'hood', 'bath', 'weighB', 'thermo', 'recT1', 'add'];
    for (const a of seq) { const r = C.exoAct(st, p, a); assert.ok(r.ok, part + ' ' + a + ': ' + r.msg); }
    for (let i = 0; i < 600; i++) C.exoTick(st, p, 0.05);
    assert.ok(C.exoAct(st, p, 'recT2').ok);
    assert.equal(Math.sign(st.T2 - st.T1), sign, part + ' ' + st.T1 + '→' + st.T2);
  }
});

test('كل تجربة: كل قيمة لكل متغير (أدنى/أعلى/منتصف) بلا NaN، والرسم والمخطط يعملان', () => {
  for (const s of SIMS) {
    const p0 = defaults(s);
    exercise(s, Object.assign({}, p0), s.id + ' default');
    for (const q of s.params) {
      const vals = q.type === 'select' ? (typeof q.options === 'function' ? q.options(p0) : q.options).map((o) => o[0]) : q.type === 'toggle' ? [true, false] : q.type === 'stage' ? Array.from({ length: q.max + 1 }, (_, i) => i) : [q.min, q.max, (q.min + q.max) / 2].map((v) => (q.int ? Math.round(v) : v));
      for (const v of vals) exercise(s, Object.assign({}, p0, { [q.key]: v }), s.id + ' ' + q.key + '=' + v);
    }
  }
  // التجربة بعد اكتمالها
  const s = sim('heat-of-combustion'); const p = defaults(s); p.shield = true;
  const d = exercise(s, p, 'complete', runCombustion(p));
  assert.ok(s.results(p, d).some((r) => /كيلوجول\/مول/.test(r[1]) && /قيمتك/.test(r[0])));
});

test('التحديات: غير محلولة عند البداية، وقابلة للحل', () => {
  for (const s of SIMS) {
    for (const ch of s.challenges) {
      const p = Object.assign(defaults(s), ch.init || {}); if (s.onSet) s.onSet(p, null);
      const d = s.compute(p); d.st = s.initState ? s.initState(p) : undefined;
      assert.ok(!ch.check(p, d), s.id + ': solved at init — ' + ch.q);
    }
  }
  const comb = sim('heat-of-combustion');
  const p = Object.assign(defaults(comb), comb.challenges[0].init); const d = comb.compute(p); d.st = runCombustion(p);
  assert.ok(comb.challenges[0].check(p, d)); assert.ok(comb.challenges[1].check(p, d));
  const p3 = Object.assign(defaults(comb), { mode: 'semi', shield: true, d: 2.5 }); const d3 = comb.compute(p3); d3.st = runCombustion(p3);
  assert.ok(comb.challenges[2].check(p3, d3), 'error < 40 reachable');
  const be = sim('bond-energy'); assert.ok(be.challenges[0].check({ rx: 'HF', ph: 0 }, be.compute({ rx: 'HF', ph: 0 })));
});

test('المساعد: يعطي سؤالاً موجّهاً، ويخفي الجواب في وضع التعلّم', () => {
  const s = sim('heat-of-combustion'); const p = defaults(s); const d = s.compute(p); d.st = C.combInit(p);
  const ask = (q) => ML.tutorAnswer(s, q, { p, d, lastExplain: [] });
  ML.current = { mode: 'explore' };
  let a = ask('هل قيمتي أكبر أم أقل من قيمة الجدول؟ ولماذا؟'); assert.ok(/سؤال موجّه/.test(a) && /الجواب/.test(a) && /أقل/.test(a));
  ML.current = { mode: 'learn' };
  a = ask('هل قيمتي أكبر أم أقل من قيمة الجدول؟ ولماذا؟'); assert.ok(/سؤال موجّه/.test(a) && !/✅ \*\*الجواب/.test(a));
  ML.current = null;
  for (const t of s.tutor) assert.ok(!/NaN|undefined/.test(t.a(p, d)), t.q);
});

test('الترميز: الكيمياء تحتفظ بالأرقام الغربية والصيغ من اليسار لليمين كما في كتاب الكيمياء', () => {
  const CH = { subject: 'g10-chem' };
  ML.setNotation('ar');
  assert.equal(ML.arTeX('q = 4.18 \\times 100', CH), 'q = 4.18 \\times 100');
  assert.equal(ML.loc('C₂H₅OH و 4.18 جول', CH), 'C₂H₅OH و 4.18 جول');
  assert.equal(ML.loc('حرارة الاحتراق −1367 كيلوجول', CH), 'حرارة الاحتراق ⁦−1367⁩ كيلوجول');
});

test('محاكيات الوحدات 1–4: قيم أمثلة الكتاب', () => {
  const c = (id, p) => { const s = sim(id); const q = Object.assign(defaults(s), p); if (s.onSet) s.onSet(q, null); return s.compute(q); };
  // الوحدة 1
  assert.equal(c('rutherford', { N: 36000 }).big, 3);
  assert.equal(c('rutherford', { N: 36000, model: 'thomson' }).big, 0);
  const zs = c('sulfur-reactions', { part: 'Zn', mS: 2, mZn: 1, heat: true }); assert.equal(zs.lim, 'Zn'); assert.ok(Math.abs(zs.nS - 0.0625) < 1e-9);
  // الوحدة 2
  assert.equal(C.round(c('isotopes', { el: 'Cu', ab: 69.15 }).avg, 1), 63.5);
  const cm = c('conservation-mass', { mixed: true }); assert.equal(cm.r1, cm.r2);
  const mo = (p) => c('mole', p);
  assert.equal(mo({ sub: 'Ca', by: 'mass', m: 10 }).nn, 0.25);
  assert.equal(C.round(mo({ sub: 'H2SO4', by: 'mass', m: 9.8 }).nn, 4), 0.1);
  assert.equal(C.round(mo({ sub: 'N2', by: 'moles', n: 5 }).V, 2), 112);
  assert.equal(C.round(mo({ sub: 'H2', by: 'vol', V: 10 }).mass, 3), 0.893); // الكتاب: 0.892 (تقريب 0.446 مول)
  assert.equal(mo({ sub: 'C12H22O11', by: 'moles', n: 0.5 }).mass, 171);
  const pc = (sub) => Object.fromEntries(c('percent-composition', { sub }).parts.map((x) => [x.el, C.round(x.pct, 1)]));
  assert.equal(pc('CaO').Ca, 71.4); assert.equal(pc('Cu3(CO3)2(OH)2').Cu, 55.3);
  const st = c('stoichiometry', { rx: 'NO', given: 0, m: 17, unit: 'g' }); assert.equal(C.round(st.rows[1].m, 2), 40);
  assert.equal(C.round(c('stoichiometry', { rx: 'NH3', given: 0, m: 28, unit: 'g' }).rows[2].m, 2), 34);
  // الوحدة 3
  const hw = (p) => c('water-hardness', p);
  assert.ok(hw({ water: 'temp', drops: 10 }).need > hw({ water: 'distilled', drops: 10 }).need);
  assert.ok(hw({ water: 'temp', treat: 'boil' }).removed && !hw({ water: 'perm', treat: 'boil' }).removed && hw({ water: 'perm', treat: 'soda' }).removed);
  // الوحدة 4
  const hc = (p) => c('hydrocarbons', p);
  assert.equal(hc({ fam: 'alkane', n: 6 }).f, 'C6H14'); assert.equal(hc({ fam: 'alkane', n: 6 }).bp, 68.7);
  assert.equal(hc({ fam: 'alkane', n: 4, iso: true }).bp, -11.7); assert.equal(hc({ fam: 'alkene', n: 2 }).f, 'C2H4');
  assert.equal(hc({ fam: 'alkane', n: 4 }).state, 'غاز'); assert.equal(hc({ fam: 'alkane', n: 5 }).state, 'سائل');
  assert.equal(c('fractional-distillation', { T: 250 }).f.name, 'الكيروسين');
  assert.ok(c('alkane-alkene-test', { cmp: 'hexene', drops: 3 }).decol && !c('alkane-alkene-test', { cmp: 'hexane', drops: 3 }).decol);
  assert.equal(c('polymerization', { mono: 'ethene', n: 1000 }).M, 28000);
  // الوحدة 5: الكمّادات ص116
  assert.equal(c('cold-hot-packs', { salt: 'CaCl2', m: 40, V: 100, press: true }).T, 90);
  assert.equal(c('cold-hot-packs', { salt: 'NH4NO3', m: 30, V: 100, press: true }).T, 0);
});

test('تغطية الكتاب: محاكاة لكل وحدة من الوحدات الخمس', () => {
  for (let u = 1; u <= 5; u++) assert.ok(SIMS.filter((s) => s.unit === u).length >= 4, 'unit ' + u);
  assert.ok(SIMS.length >= 26, 'sims ' + SIMS.length);
});
