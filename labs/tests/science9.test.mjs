// اختبارات مختبر علوم الصف التاسع (الجزء الأول) — التشغيل: node --test tests/
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
const ML = ctx.ML;
const SIMS = ML.sims.filter((s) => s.subject === 'g9-science');
const sim = (id) => { const s = SIMS.find((x) => x.id === id); assert.ok(s, id); return s; };
const J = (x) => JSON.parse(JSON.stringify(x));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= (tol === undefined ? 1e-9 : tol) * Math.max(1, Math.abs(b)), (msg || '') + ': ' + a + ' ≠ ' + b);
const defaults = (s) => Object.fromEntries(s.params.map((q) => [q.key, q.value]));
const calc = (id, o) => { const s = sim(id); const p = Object.assign(defaults(s), o); const d = s.compute(p); if (s.initState) d.st = s.initState(p); return d; };
function stubCtx() {
  const target = { createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }), measureText: () => ({ width: 10 }) };
  return new Proxy(target, { get: (t, k) => (k in t ? t[k] : () => {}), set: (t, k, v) => { t[k] = v; return true; } });
}
const COLORS = { bg: '#fff', grid: '#eee', grid2: '#f5f5f5', axis: '#333', text: '#444', c1: '#2563eb', c2: '#dc2626', c3: '#059669', c4: '#d97706', c5: '#7c3aed', c6: '#db2777', muted: '#94a3b8' };
const G = new Proxy({ colors: () => COLORS }, { get: (t, k) => (k in t ? t[k] : () => {}) });
function exercise(s, p, label) {
  if (s.onSet) s.onSet(p, null);
  const d = s.compute(p); d.st = s.initState ? s.initState(p) : undefined; d.hits = [];
  if (s.tick) for (let i = 0; i < 20; i++) s.tick(d.st, p, d, 0.05);
  const all = JSON.stringify(s.results(p, d)) + (s.live ? s.live(p, d) : '') + JSON.stringify(s.steps(p, d)) + s.tutor.map((t) => t.a(p, d)).join();
  assert.ok(!/NaN|undefined|Infinity|\[object/.test(all), label + ' → ' + (all.match(/.{0,60}(NaN|undefined|Infinity|\[object).{0,20}/) || [''])[0]);
  for (const [W, H] of [[900, 540], [360, 460]]) s.drawCustom(stubCtx(), W, H, p, d, COLORS);
  if (s.graph) { const g = s.graph(p, d); assert.ok(Number.isFinite(g.view.xmin + g.view.xmax + g.view.ymin + g.view.ymax) && g.view.xmax > g.view.xmin && g.view.ymax > g.view.ymin, label + ' graph view'); g.draw(G); }
}

test('الصف التاسع مسجّل بمادة العلوم وعشرة دروس في الوحدات الثلاث', () => {
  const g = ML.grades.find((x) => x.id === 'g9'); assert.ok(g); assert.deepEqual(J(g.subjects), ['g9-science']);
  const subj = ML.subjects['g9-science']; assert.equal(subj.slug, 'science'); assert.equal(subj.units.length, 10);
  assert.deepEqual(J(subj.units.map((u) => u.pages)), ['5–23', '24–34', '35–45', '46–49', '55–62', '63–76', '77–82', '83–93', '96–111', '112–122']);
  assert.ok(!ML.isLatinBook({ subject: 'g9-science' }));
  // تجارب أجهزة الجسم تُعامل معاملة الأحياء (CO₂ و HCl كما في الكتاب)، وتجارب الكهرباء بالرموز العربية
  assert.ok(ML.isBio(sim('sugar-tests'))); assert.ok(!ML.isBio(sim('ohms-law')));
  assert.equal(ML.unitName('g9-science', 2), 'الوحدة الأولى: أجهزة جسم الإنسان — الدرس: الجهاز التنفسي');
});

test('رموز الكتاب العربية في تجارب الكهرباء', () => {
  const s = sim('series-parallel');
  const a = ML.arTeX('R_{eq} = R_1 + R_2', s); assert.ok(a.includes('مك') && a.includes('م'), a);
  const o = ML.arTeX('V = I \\times R', sim('ohms-law')); ['جـ', 'ت', 'م'].forEach((x) => assert.ok(o.includes(x), o));
  const r = ML.arTeX('R = \\rho \\times \\frac{L}{A}', sim('resistance-factors')); ['ρ', 'ل', 'س'].forEach((x) => assert.ok(r.includes(x), r));
  assert.equal(ML.loc('Q = 300 C', sim('charge-time')), 'ش = ٣٠٠ كولوم');
});

test('كل درس فيه تجارب، وكل تجربة: صفحة داخل درسها، فرضيات، تعلّم، تحديات، مساعد؛ وتجارب الكهرباء لها رسم بياني', () => {
  const ids = new Set();
  for (let u = 1; u <= 10; u++) assert.ok(SIMS.filter((s) => s.unit === u).length >= 1, 'unit ' + u);
  for (const s of SIMS) {
    assert.ok(!ids.has(s.id), 'duplicate ' + s.id); ids.add(s.id);
    const [a, b] = ML.subjects['g9-science'].units[s.unit - 1].pages.split('–').map(Number);
    assert.ok(Number.isInteger(s.page) && s.page >= a && s.page <= b, s.id + ' page ' + s.page);
    assert.ok(s.titleAr && s.titleEn && s.lesson && s.lessonTitle && s.book && s.summary && s.formula, s.id + ' meta');
    assert.ok((s.assumptions || []).length >= 1, s.id + ' assumptions');
    if (!s.bio && !s.qual) assert.ok(typeof s.graph === 'function', s.id + ' graph');
    assert.ok((s.learn || []).length >= 1 && (s.challenges || []).length >= 1 && (s.tutor || []).length >= 1, s.id + ' learn/challenges/tutor');
    assert.ok(s.vars.length >= 1 && s.vars.every((v) => v.length === 4), s.id + ' vars');
  }
  assert.equal(SIMS.length, 37);
});

test('كل متغير عند أدنى قيمة وأعلاها ومنتصفها، وكل خيار وكل مرحلة: لا NaN ولا أخطاء في الرسم', () => {
  for (const s of SIMS) {
    const base = defaults(s);
    exercise(s, base, s.id + ' default');
    for (const q of s.params) {
      const vals = q.type === 'select' ? q.options.map((o) => o[0]) : q.type === 'toggle' ? [true, false] : q.type === 'stage' ? [...Array(q.max + 1).keys()] : [q.min, q.max, q.min + Math.round((q.max - q.min) / 2 / q.step) * q.step];
      for (const v of vals) exercise(s, Object.assign({}, base, { [q.key]: v }), s.id + ' ' + q.key + '=' + v);
    }
  }
  // مراحل تعتمد على خيار آخر (الكشف عن الدهون له أربع خطوات)
  for (let st = 0; st < 4; st++) exercise(sim('protein-fat-tests'), { kind: 'lip', st: st }, 'lip ' + st);
});

// حل كل تحدٍّ بقيم الكتاب: [التجربة، رقم التحدي، القيم]
const SOLVE = [
  ['sugar-tests', 0, { heat: 2 }], ['sugar-tests', 1, { lemon: true, heat: 2 }], ['sugar-tests', 2, { rg: 'lugol' }],
  ['protein-fat-tests', 0, { st: 2 }], ['protein-fat-tests', 1, { kind: 'lip', st: 3 }],
  ['vitamin-c', 0, { n: 8 }], ['vitamin-c', 1, { j: 'apple', n: 22 }],
  ['digestion-enzymes', 0, { org: 1 }], ['digestion-enzymes', 1, { org: 2 }], ['digestion-enzymes', 2, { nu: 'lactose', org: 3 }],
  ['saliva-amylase', 0, { t: 20 }],
  ['bile-emulsion', 0, { add: 'soap', s: 10 }], ['bile-emulsion', 1, { add: 'bicarb' }],
  ['airway-path', 0, { k: 2 }], ['airway-path', 1, { k: 6 }], ['airway-path', 2, { k: 3 }],
  ['lung-model', 0, { dz: 1 }], ['lung-model', 1, { view: 'body', dz: -1 }],
  ['heart-flow', 0, { k: 4 }], ['heart-flow', 1, { k: 9 }], ['heart-flow', 2, { k: 6 }],
  ['pulse-rate', 0, { r: 40 }], ['pulse-rate', 1, { j: 56 }],
  ['blood-components', 0, { rbc: 5.5, wbc: 7, plt: 300 }], ['blood-components', 1, { rbc: 4.5 }],
  ['tea-iron', 0, { s: 3 }],
  ['lymph-flow', 0, { k: 3 }], ['lymph-flow', 1, { k: 5 }],
  ['circuit-builder', 0, { sw: true, wire: true }], ['circuit-builder', 1, { sw: true, rev: true }],
  ['charge-time', 0, { I: 0.5, t: 10 }], ['charge-time', 1, { I: 2 }],
  ['meters-circuit', 0, { pa: 'd' }], ['meters-circuit', 1, { m: 'V', pv: 'both' }], ['meters-circuit', 2, { diff: true, pv: 'l2' }],
  ['electric-shock', 0, { skin: 'wet' }], ['electric-shock', 1, { V: 14 }],
  ['ohms-law', 0, { R1: 2, V: 9 }], ['ohms-law', 1, { V: 12 }], ['ohms-law', 2, { V: 6, R1: 12 }],
  ['heater-countries', 0, { c: 'ca' }],
  ['series-parallel', 0, { mode: 'parallel' }], ['series-parallel', 1, { mode: 'ex', R1: 50, R2: 100, R3: 80 }],
  ['resistance-factors', 0, { mat: 'cu', L: 200, A: 1 }], ['resistance-factors', 1, { L: 20 }], ['resistance-factors', 2, { A: 0.16 }],
  ['cell-types', 0, { c: 'lead', chg: true }], ['cell-types', 1, { c: 'lead' }],
  ['emf-internal', 0, { e: 18, r: 1, Rl: 4 }], ['emf-internal', 1, { e: 6, r: 2 }], ['emf-internal', 2, { r: 0 }],
  ['joule-heat', 0, { R: 220, t: 15 }],
  ['bulbs-power', 0, { V: 3 }], ['bulbs-power', 1, { V: 6 }],
  ['power-cost', 0, { dev: 'heater', h: 6, days: 1 }], ['power-cost', 1, { dev: 'pc', h: 2 }],
  ['house-bill', 0, { n: 8, h: 1 }], ['house-bill', 1, { cur: 76637 }],
  ['star-spectra', 0, { H: true, He: true }], ['star-spectra', 1, { H: true, Na: true, Hg: true }],
  ['light-year', 0, { ly: 4.5 }],
  ['parallax', 0, { dp: 15, eye: 'l' }], ['parallax', 1, { L: 200 }],
  ['star-colors', 0, { T: 5500 }], ['star-colors', 1, { T: 9000 }],
  ['star-magnitude', 0, { a: 'canopus', b: 'spica' }],
  ['inverse-square', 0, { d: 40 }],
  ['star-life', 0, { M: 1, st: 5 }], ['star-life', 1, { M: 2, st: 5 }], ['star-life', 2, { M: 10 }],
  ['galaxy-types', 0, { g: 'spiral' }], ['galaxy-types', 1, { g: 'elliptical' }],
  ['big-bang', 0, { s: 3 }], ['big-bang', 1, { s: 2 }],
  ['universe-expansion', 0, { k: 2 }]
];

test('التحديات غير محلولة عند بدايتها، وقابلة للحل بقيم الكتاب ضمن مدى المتغيرات وخطواتها', () => {
  for (const s of SIMS) s.challenges.forEach((c, i) => {
    const p = Object.assign(defaults(s), c.init || {}); const d = s.compute(p); if (s.initState) d.st = s.initState(p);
    assert.ok(!c.check(p, d), s.id + ' #' + i + ' solved at init');
    const sol = SOLVE.find((x) => x[0] === s.id && x[1] === i); assert.ok(sol, 'no solution for ' + s.id + ' #' + i);
    const p2 = Object.assign({}, p, sol[2]);
    for (const q of s.params) { const v = p2[q.key]; if (q.type === 'select') assert.ok(q.options.some((o) => o[0] === v), s.id + ' option ' + q.key); else if (q.type !== 'toggle') { const mx = q.type === 'stage' ? (typeof q.stages === 'function' ? q.stages(p2) : q.stages).length - 1 : q.max; assert.ok(v >= q.min - 1e-9 && v <= mx + 1e-9, s.id + ' range ' + q.key + '=' + v); near(Math.round((v - q.min) / q.step) * q.step + q.min, v, 1e-9, s.id + ' step ' + q.key); } }
    assert.ok(c.check(p2, s.compute(p2)), s.id + ' #' + i + ' not solvable with ' + JSON.stringify(sol[2]));
  });
});

test('أمثلة الكتاب المحلولة', () => {
  near(calc('charge-time', { I: 0.5, t: 10 }).Q, 300, 1e-12, 'ص 56: 300 كولوم');
  near(calc('charge-time', { I: 1, t: 1 }).N, 60 * 6.25e18, 1e-12, 'إلكترونات');
  near(calc('ohms-law', { R1: 2, V: 9 }).I1, 4.5, 1e-12, 'ص 68: 4.5 أمبير');
  near(calc('heater-countries', { c: 'ps' }).I, 12.5, 1e-12, 'مثال (1): 220 فولت و17.6 أوم');
  near(calc('heater-countries', { c: 'ca' }).I, 120 / 17.6, 1e-12, 'كندا');
  near(calc('series-parallel', { mode: 'parallel', R1: 6, R2: 6, R3: 0 }).Req, 3, 1e-12, '6 ∥ 6');
  near(calc('series-parallel', { mode: 'series', R1: 6, R2: 6, R3: 0 }).Req, 12, 1e-12, '6 + 6');
  near(calc('series-parallel', { mode: 'ex', R1: 50, R2: 100, R3: 80 }).Req, 100 / 3 + 80, 1e-12, 'مثال (1) ص 74: 113.3 أوم');
  near(calc('resistance-factors', { mat: 'cu', L: 200, A: 1 }).R, 3.36e-4, 1e-9, 'مثال ص 76');
  near(calc('resistance-factors', { mat: 'c', L: 10, A: 0.16 }).R * 4, calc('resistance-factors', { mat: 'c', L: 10, A: 0.04 }).R, 1e-12, 'أربعة أضعاف المساحة ⇒ ربع المقاومة');
  near(calc('electric-shock', { V: 220, skin: 'dry' }).I, 220 / 500000, 1e-12, 'الجلد الجاف 500000 أوم');
  const m = calc('meters-circuit', { V: 6, sw: true, diff: false }); near(m.V1 + m.V2, 6); near(m.V1, m.V2);
  assert.equal(calc('meters-circuit', { sw: false }).I, 0);
  const bl = calc('blood-components', { rbc: 5.5, wbc: 7, plt: 300 }); assert.deepEqual(J(bl.s), ['طبيعي', 'طبيعي', 'طبيعي']);
  assert.equal(calc('blood-components', { rbc: 4.9 }).s[0], 'أقل من الطبيعي');
  assert.equal(calc('pulse-rate', { r: 36 }).day, 72 * 60 * 24);
});

test('أمثلة الجزء الثاني: الأعمدة والقدرة والطاقة والنجوم', () => {
  const em = calc('emf-internal', { e: 18, r: 1, Rl: 4, sw: true }); near(em.I, 2, 1e-12, 'مثال (1) ص 80'); near(em.Rx, 8);
  near(calc('emf-internal', { e: 6, r: 2, Rl: 1, sw: true }).V, 6 - 2 * calc('emf-internal', { e: 6, r: 2, Rl: 1 }).I, 1e-12);
  const jh = calc('joule-heat', { V: 220, R: 220, t: 15 }); near(jh.E, 198000, 1e-12, 'ص 84: 198000 جول'); near(Math.round(jh.cal), 47368, 0, '47368 سعراً');
  const bp = calc('bulbs-power', { V: 12 }); near(bp.L[0].P, 2); near(bp.L[1].P, 4);
  const tv = calc('power-cost', { dev: 'tv', h: 1, days: 1 }); near(tv.I, 2); near(tv.R, 125); near(500 * 600, 300000);
  near(calc('power-cost', { dev: 'heater', h: 6, days: 1 }).kwh, 13.2, 1e-12, 'ص 88: 13.2');
  const pc = calc('power-cost', { dev: 'pc', h: 2, days: 30, price: 10 }); near(pc.kwh, 12); near(pc.cost, 120);
  const mw = calc('power-cost', { dev: 'micro', h: 1, days: 30 }); near(mw.I, 5); near(mw.R, 44); near(mw.cost, 330);
  near(calc('house-bill', { n: 8, h: 1 }).kwh, 3.92); const hb = calc('house-bill', { cur: 76637 }); assert.equal(hb.month, 178); assert.equal(hb.cost, 1780);
  near(calc('light-year', { ly: 4.5 }).km, 4.5 * 3e8 * 365 * 24 * 3600 / 1000, 1e-12, 'ألفا قنطوري');
  near(calc('star-magnitude', { a: 'canopus', b: 'spica' }).ratio, Math.pow(2.5, 1.74), 1e-12);
  near(calc('inverse-square', { d: 40 }).ratio, calc('inverse-square', { d: 20 }).ratio, 1e-12, 'المربعات ÷ ف² ثابت');
  assert.equal(calc('star-colors', { T: 5500 }).k[0], 'G'); assert.equal(calc('star-colors', { T: 30000 }).k[0], 'O'); assert.equal(calc('star-colors', { T: 3000 }).k[0], 'M');
  assert.equal(calc('star-life', { M: 1 }).end, 'قزم أبيض'); assert.equal(calc('star-life', { M: 2 }).end, 'نجم نيوتروني'); assert.equal(calc('star-life', { M: 3.5 }).end, 'ثقب أسود');
  assert.deepEqual(J(calc('universe-expansion', { k: 2 }).dist), [4, 10, 16]);
});
