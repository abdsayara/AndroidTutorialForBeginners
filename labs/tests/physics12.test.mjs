// اختبارات مختبر فيزياء الصف الثاني عشر — التشغيل: node --test tests/
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
const ML = ctx.ML, Q = ML.phys12;
const SIMS = ML.sims.filter((s) => s.subject === 'g12-physics');
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
  const d = s.compute(p); d.st = s.initState ? s.initState(p) : undefined; d.hits = [];
  if (s.tick) for (let i = 0; i < 20; i++) s.tick(d.st, p, d, 0.05);
  const all = JSON.stringify(s.results(p, d)) + (s.live ? s.live(p, d) : '') + JSON.stringify(s.steps(p, d)) + s.tutor.map((t) => t.a(p, d)).join();
  assert.ok(!/NaN|undefined|Infinity|\[object/.test(all), label + ' → ' + (all.match(/.{0,60}(NaN|undefined|Infinity|\[object).{0,20}/) || [''])[0]);
  for (const [W, H] of [[900, 540], [360, 460]]) s.drawCustom(stubCtx(), W, H, p, d, COLORS);
  (s.graphModes || [0]).forEach((_, i) => { const g = s.graph(p, d, i); assert.ok(Number.isFinite(g.view.xmin + g.view.xmax + g.view.ymin + g.view.ymax) && g.view.xmax > g.view.xmin && g.view.ymax > g.view.ymin, label + ' graph ' + i + ' ' + JSON.stringify(g.view)); g.draw(G); });
}

test('الصف الثاني عشر العلمي مسجّل بمادة الفيزياء وفصول الكتاب الثمانية', () => {
  const g = ML.grades.find((x) => x.id === 'g12'); assert.ok(g); assert.deepEqual(J(g.subjects), ['g12-physics']);
  const subj = ML.subjects['g12-physics']; assert.equal(subj.slug, 'physics'); assert.equal(subj.units.length, 8);
  assert.deepEqual(J(subj.units.map((u) => u.pages)), ['4–14', '15–32', '33–54', '57–71', '72–93', '96–109', '110–122', '123–143']);
  assert.ok(ML.isLatinBook({ subject: 'g12-physics' }));
});

test('كل فصل فيه محاكيات، وكل محاكاة: صفحة داخل فصلها، فرضيات، رسم بياني، تعلّم، تحديات، مساعد', () => {
  const ids = new Set();
  for (let u = 1; u <= 8; u++) assert.ok(SIMS.filter((s) => s.unit === u).length >= 3, 'unit ' + u);
  for (const s of SIMS) {
    assert.ok(!ids.has(s.id), 'duplicate ' + s.id); ids.add(s.id);
    const [a, b] = ML.subjects['g12-physics'].units[s.unit - 1].pages.split('–').map(Number);
    assert.ok(Number.isInteger(s.page) && s.page >= a && s.page <= b, s.id + ' page ' + s.page);
    assert.ok(s.titleAr && s.titleEn && s.lesson && s.lessonTitle && s.book && s.summary && s.formula, s.id + ' meta');
    assert.ok((s.assumptions || []).length >= 1 && typeof s.graph === 'function', s.id + ' assumptions/graph');
    assert.ok((s.learn || []).length >= 2 && (s.challenges || []).length >= 2 && (s.tutor || []).length >= 3, s.id + ' learn/challenges/tutor');
    assert.ok(s.vars.length >= 3 && s.vars.every((v) => v.length === 4), s.id + ' vars');
  }
  assert.ok(SIMS.length >= 30, 'count ' + SIMS.length);
});

test('كل متغير عند أدنى قيمة وأعلاها ومنتصفها، وكل خيار: لا NaN ولا أخطاء في الرسم', () => {
  for (const s of SIMS) {
    const base = defaults(s);
    exercise(s, base, s.id + ' default');
    for (const q of s.params) {
      const vals = q.type === 'select' ? q.options.map((o) => o[0]) : q.type === 'toggle' ? [true, false] : [q.min, q.max, q.min + Math.round((q.max - q.min) / 2 / q.step) * q.step];
      for (const v of vals) exercise(s, Object.assign({}, base, { [q.key]: v }), s.id + ' ' + q.key + '=' + v);
    }
  }
});

// حل كل تحدٍّ بقيم الكتاب: [المحاكاة، رقم التحدي، القيم]
const SOLVE = [
  ['momentum', 0, { m: 1000, v: 20 }], ['momentum', 1, { by: 'K', m: 2, K: 16 }],
  ['impulse', 0, { F2: 30 }], ['impulse', 1, { mode: 'car', m: 1200, vi: 20, vf: 8, dt: 6 }],
  ['momentum-conservation', 0, { m1: 6, v1: 10, m2: 100 }], ['momentum-conservation', 1, { m2: 60 }],
  ['collision-types', 0, { ball: 'clay' }], ['collision-types', 1, { ball: 'rubber' }],
  ['collision-1d', 0, { type: 'elastic', m1: 4, m2: 2, u1: 2, u2: -2 }], ['collision-1d', 1, { type: 'inelastic', m1: 2, m2: 3, u1: -6, u2: 4, e: 0.75 }], ['collision-1d', 2, { type: 'perfect', m1: 2, m2: 2, u1: 2, u2: -2 }],
  ['ballistic-pendulum', 0, { m: 0.03, M: 4.97, h: 0.08 }], ['ballistic-pendulum', 1, { h: 0.3 }],
  ['collision-2d', 0, { v2: 18.6 }], ['collision-2d', 1, { m2: 1000 }],
  ['centripetal', 0, { cut: true }], ['centripetal', 1, { v: 2 }],
  ['torque', 0, { th: 180 }], ['torque', 1, { r: 1, F: 8 }],
  ['moment-of-inertia', 0, { x: 2 }], ['moment-of-inertia', 1, { x: -0.5 }], ['moment-of-inertia', 2, { shape: 'ringPerp' }],
  ['rotational-dynamics', 0, { F1: 5, F2: 7, r: 0.3, I: 0.2, T: 2 }], ['rotational-dynamics', 1, { I: 0.4 }],
  ['angular-momentum', 0, { I1: 1.33, f1: 1.9, I2: 0.48 }], ['angular-momentum', 1, { I2: 0.6 }],
  ['current-charge', 0, { I: 0.22, t: 4.5 }], ['current-charge', 1, { I: 2, t: 2 }],
  ['drift-velocity', 0, { r: 10, I: 200 }], ['drift-velocity', 1, { mat: 'cu', r: 0.9, I: 1.3 }],
  ['resistivity-ohm', 0, { mat: 'cu5', L: 100, A: 1, I: 20 }], ['resistivity-ohm', 1, { mat: 'ag' }],
  ['electric-power', 0, { V: 12, R: 545, t: 65 }], ['electric-power', 1, { mode: 'lamps', P1: 5, P2: 10 }],
  ['resistor-combos', 0, { mode: 'ex8', R3: 4, R4: 10 }], ['resistor-combos', 1, { mode: 'parallel' }],
  ['simple-circuit', 0, { R2: 48 }], ['simple-circuit', 1, { Rs: 1, R2: 48 }],
  ['potential-loop', 0, { e2: 9 }], ['potential-loop', 1, { e2: 12 }],
  ['terminal-voltage', 0, { e: 25, r: 0.2, I: 8 }], ['terminal-voltage', 1, { mode: 'ch' }],
  ['wheatstone', 0, { mode: 'ohm', V: 18, I: 1.2 }], ['wheatstone', 1, { R1: 5 }],
  ['kirchhoff', 0, { e1: 0, R1: 30, e2: 40, R2: 30, e3: 20, R3: 10 }], ['kirchhoff', 1, { e1: 33, R1: 6, e2: 0, R2: 4, e3: 11, R3: 2 }],
  ['straight-wire', 0, { I: 25, r: 10 }], ['straight-wire', 1, { I: -10 }],
  ['circular-coil', 0, { N: 250, R: 3.14, I: 2 }], ['circular-coil', 1, { I2: -1.43 }],
  ['ampere-law', 0, { I1: 20, I2: -6, I3: 12, I4: -9, I5: 18, r: 10 }], ['ampere-law', 1, { I4: -18 }],
  ['solenoid', 0, { N: 2000, L: 60, I: 3 }], ['solenoid', 1, { N: 10, L: 55, I: 1.4 }],
  ['force-on-charge', 0, { qc: 8.4, th: 30 }], ['force-on-charge', 1, { th: 180 }],
  ['charge-circle', 0, { qe: 2, v: 10 }], ['charge-circle', 1, { v: 20 }],
  ['cyclotron', 0, { B: 0.628, f: 4, R: 3 }], ['cyclotron', 1, { R: 6 }],
  ['force-on-wire', 0, { I: 5, B: 0.0932 }], ['force-on-wire', 1, { dir: 'px' }],
  ['parallel-wires', 0, { mode: 'three', Ib: -3 }], ['parallel-wires', 1, { I2: -5 }],
  ['velocity-selector', 0, { v: 250 }], ['velocity-selector', 1, { B: 8, v: 125 }],
  ['faraday-law', 0, { B1: 0.5 }], ['faraday-law', 1, { N: 500, A: 200 }],
  ['motional-emf', 0, { L: 0.4, B: 0.3, v: 3, R: 5 }], ['motional-emf', 1, { v: 6 }],
  ['lenz-law', 0, { pole: 'N', mot: 'in' }], ['lenz-law', 1, { mot: 'out' }],
  ['self-induction', 0, { N: 300, len: 0.25, A: 4, r: -50 }], ['self-induction', 1, { N: 600 }],
  ['rl-circuit', 0, { R: 0.35, Lm: 53 }], ['rl-circuit', 1, { Lm: 30 }],
  ['ac-generator', 0, { N: 50, w: 20 }], ['ac-generator', 1, { w: 50 }]
];

test('التحديات غير محلولة عند بدايتها، وقابلة للحل بقيم الكتاب ضمن مدى المتغيرات وخطواتها', () => {
  for (const s of SIMS) s.challenges.forEach((c, i) => {
    const p = Object.assign(defaults(s), c.init || {}); const d = s.compute(p); if (s.initState) d.st = s.initState(p);
    assert.ok(!c.check(p, d), s.id + ' #' + i + ' solved at init');
    const sol = SOLVE.find((x) => x[0] === s.id && x[1] === i); assert.ok(sol, 'no solution for ' + s.id + ' #' + i);
    const p2 = Object.assign({}, p, sol[2]);
    for (const q of s.params) { const v = p2[q.key]; if (q.type === 'select') assert.ok(q.options.some((o) => o[0] === v), s.id + ' option ' + q.key); else if (q.type !== 'toggle') { assert.ok(v >= q.min - 1e-9 && v <= q.max + 1e-9, s.id + ' range ' + q.key + '=' + v); near(Math.round((v - q.min) / q.step) * q.step + q.min, v, 1e-9, s.id + ' step ' + q.key); } }
    assert.ok(c.check(p2, s.compute(p2)), s.id + ' #' + i + ' not solvable with ' + JSON.stringify(sol[2]));
  });
});

test('أمثلة الوحدة الأولى: الزخم والتصادمات والدوران', () => {
  near(Q.recoil(6, 100, 10), -0.6, 1e-9, 'ex3 recoil');
  const e = Q.elastic1D(4, 2, 2, -2); near(e.v1, -2 / 3); near(e.v2, 10 / 3);
  near(calc('ballistic-pendulum', { m: 0.03, M: 4.97, h: 0.08 }).v, 210, 0.01, 'ballistic ≈ 210 m/s');
  const rd = calc('rotational-dynamics', { F1: 5, F2: 7, r: 0.3, I: 0.2, T: 2 }); near(rd.al, 18, 1e-9, 'α');
  near(Q.torque(0.3, 7, 90) + Q.torque(0.3, 5, 90), 3.6, 1e-9, 'τ');
});

test('أمثلة الفصلين 4 و5: التيار والمقاومة والدارات', () => {
  const c = calc('current-charge', { I: 0.22, t: 4.5 }); near(c.Q, 0.99); near(c.N, 6.1875e18, 1e-9);
  near(calc('drift-velocity', { r: 10, I: 200 }).vd, 4.68e-5, 0.01, 'vd ex2');
  const r = calc('resistivity-ohm', { mat: 'cu5', L: 100, A: 1, I: 20 }); near(r.R, 1.72); near(r.V, 34.4); near(r.E, 0.344);
  near(calc('electric-power', { V: 12, R: 545, t: 65 }).E, 17.18, 1e-3, 'ex6');
  near(calc('resistor-combos', { mode: 'ex8', R1: 3, R2: 6, R3: 4, R4: 10 }).Req, 16, 1e-12, 'ex8');
  const sc = calc('simple-circuit', { e: 12, r: 0, Rs: 3, R1: 4, R2: 48, R3: 16 }); near(sc.I, 2); near(sc.I1, 1.5); near(sc.I2, 1 / 8); near(sc.I3, 3 / 8); near(sc.Pin, sc.Pout);
  const pl = calc('potential-loop', { e1: 12, e2: 9, Ra: 10, Rb: 11, Rc: 3 }); near(pl.I, 0.125); assert.deepEqual(J(pl.dV.map((x) => +x[1].toFixed(4))), [-1.25, -9, -1.375, 12, -0.375]); near(pl.sum, 0);
  near(calc('terminal-voltage', { mode: 'dis', e: 25, r: 0.2, I: 8 }).V, 23.4); near(calc('terminal-voltage', { mode: 'ch', e: 25, r: 0.2, I: 8 }).V, 26.6);
  const wb = calc('wheatstone', { R1: 5, R2: 15, R3: 20, R4: 60, e: 12, r: 1.25 }); near(wb.Ig, 0, 1e-12); near(wb.I, 0.6);
  // مثال (10) و(11) بقانوني كيرتشوف (حل النظام بطريقة غاوس)
  const k10 = Q.solve([[1, -1, -1], [30, 0, 10], [30, 30, 0]], [0, 20, 40]); near(k10[0], 2 / 3); near(k10[1], 2 / 3); near(k10[2], 0, 1e-12);
  const k11 = Q.solve([[1, -1, -1], [0, -2, 4], [6, 0, 4]], [0, 11, 33]); near(k11[0], 3.5); near(k11[1], 0.5); near(k11[2], 3);
  const s10 = calc('kirchhoff', { e1: 0, R1: 30, e2: 40, R2: 30, e3: 20, R3: 10 }); near(s10.I[0], -2 / 3); near(s10.I[1], 2 / 3); near(s10.I[2], 0, 1e-12);
  const s11 = calc('kirchhoff', { e1: 33, R1: 6, e2: 0, R2: 4, e3: 11, R3: 2 }); near(s11.I[0], 3.5); near(s11.I[1], -3); near(s11.I[2], -0.5); near(s11.Pin, 115.5); near(s11.Pout, 115.5);
});

test('أمثلة الوحدة الثالثة: المجال والقوة المغناطيسية والحث', () => {
  near(calc('straight-wire', { I: 25, r: 10 }).B, 5e-5); near(calc('circular-coil', { N: 250, R: 3.14, I: 2 }).B, 1e-2, 1e-3);
  near(calc('ampere-law', { I1: 20, I2: -6, I3: 12, I4: -9, I5: 18, r: 10 }).B, 7e-5); near(calc('solenoid', { N: 2000, L: 60, I: 3 }).B, 4 * Math.PI * 1e-3);
  near(calc('solenoid', { N: 10, L: 55, I: 1.4 }).B, 3.2e-5, 0.01);
  [[30, 1.26e-4], [90, 2.52e-4], [180, 0], [150, 1.26e-4]].forEach(([th, F]) => near(calc('force-on-charge', { qc: 8.4, v: 100, B: 0.3, th: th }).F, F, 1e-9, 'ex1 ' + th));
  near(Q.Fcharge(Q.e, 1e6, Q.Bwire(10, 0.01), 90), 3.2e-17, 1e-9, 'ex2 electron');
  const cc = calc('charge-circle', { qe: 2, m: 4, v: 10, B: 0.1 }); near(cc.F, 3.2e-13); near(cc.r, 0.125); near(cc.f, 1.27e7, 0.01); near(cc.T, 7.87e-8, 0.01);
  const cy = calc('cyclotron', { qe: 1, B: 0.628, f: 4, R: 3 }); near(cy.m, 4e-24, 0.01); near(cy.v, 7.5e4, 0.01);
  near(calc('force-on-wire', { dir: 'mx', I: 5, B: 0.0932, lam: 46.6, th: 90 }).net, 0, 1e-9);
  const pw = calc('parallel-wires', { mode: 'three', Ia: 4, Ib: -3, Ic: 4 }); near(pw.fab, 4e-5); near(pw.fcb, 3e-5); near(pw.F, 5e-5); near(pw.ang, 53.13, 1e-3); assert.ok(pw.Fx < 0 && pw.Fy < 0, '−x و −y كما في الكتاب');
  near(calc('velocity-selector', { E: 0.1, B: 4 }).v0, 250);
  const me = calc('motional-emf', { L: 0.4, B: 0.3, v: 3, R: 5 }); near(me.e, 0.36); near(me.I, 0.072); near(me.F, 0.00864);
  const si = calc('self-induction', { N: 300, len: 0.25, A: 4, r: -50 }); near(si.Lin, 1.81e-4, 0.001); near(si.e, 9.05e-3, 0.001);
  const rl = calc('rl-circuit', { e: 12, R: 0.35, Lm: 53 }); near(rl.If, 34.3, 0.001); near(rl.E, 31.16, 0.001);
  near(calc('ac-generator', { N: 100, B: 0.2, A: 2000, w: 50 }).em, 200);
  const g3 = calc('ac-generator', { N: 50, B: 0.2, A: 2000, w: 20 }); near(g3.em, g3.ref); near(g3.T, 2 * Math.PI / 20);
});

test('دارة RL: الحل العددي يقترب من القيمة النهائية ε/ΣR', () => {
  const s = sim('rl-circuit'); const p = defaults(s); const st = s.initState(p);
  for (let i = 0; i < 800; i++) s.tick(st, p, null, 0.01);
  near(st.I, p.e / p.R, 1e-3, 'I final');
  p.sw = false; for (let i = 0; i < 400; i++) s.tick(st, p, null, 0.01); assert.ok(st.I < 0.01 * p.e / p.R, 'decay');
});
