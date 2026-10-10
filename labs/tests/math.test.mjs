// اختبارات الدقة الرياضية — التشغيل: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(dir, '..');
const ctx = vm.createContext({ console, performance, BigInt });
for (const f of ['core/math.js', 'core/fx.js', 'core/plot.js', 'core/tutor.js', 'core/ui.js', 'subjects/g10-math/unit1.js', 'subjects/g10-math/unit2.js', 'subjects/g10-math/unit3.js', 'subjects/g10-math/unit4.js', 'subjects/g10-math/unit5.js', 'subjects/g10-math/unit6.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
}
const ML = ctx.ML, M = ML.math;
const sim = (id) => ML.sims.find((s) => s.id === id);
const defaults = (s) => Object.fromEntries(s.params.map((q) => [q.key, q.value]));
const run = (id, over) => { const s = sim(id); const p = Object.assign(defaults(s), over || {}); if (s.onSet) s.onSet(p, null); return { p, d: s.compute(p) }; };
const near = (a, b, tol = 1e-9, msg) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${msg || ''} expected ${b}, got ${a}`);
// المصفوفات القادمة من سياق vm لها نموذج أولي مختلف؛ نقارن بعد التحويل إلى JSON
const J = (x) => JSON.parse(JSON.stringify(x));
const deq = (a, b, m) => assert.deepEqual(J(a), J(b), m);
const ref = JSON.parse(execFileSync('python3', ['-I', path.join(dir, 'reference.py')], { encoding: 'utf8', maxBuffer: 1 << 26 }));

test('29 محاكاة مسجّلة، ولكل منها مصدر وصفحة وتحديات ومساعد', () => {
  assert.equal(ML.sims.length, 29);
  for (const s of ML.sims) {
    assert.ok(s.page >= 9 && s.page <= 193, s.id + ' page');
    assert.ok(s.unit >= 1 && s.unit <= 6 && s.lesson && s.titleAr && s.titleEn, s.id + ' meta');
    assert.ok(s.challenges.length >= 2 && s.tutor.length >= 2 && s.learn.length >= 2, s.id + ' content');
    const { p, d } = run(s.id);
    assert.ok(Array.isArray(s.results(p, d)), s.id + ' results');
  }
});

test('التربيعي: الرأس والمميز والجذور مقابل NumPy (300 حالة)', () => {
  for (const c of ref.quad) {
    const { d } = run('quadratic', { a: c.a, b: c.b, c: c.c });
    near(d.D, c.D, 1e-12, 'D'); near(d.vertex.x, c.vx, 1e-12, 'vx'); near(d.vertex.y, c.vy, 1e-12, 'vy');
    if (c.D > 0) { assert.equal(d.type, 'two'); near(d.roots[0], c.roots[0], 1e-7); near(d.roots[1], c.roots[1], 1e-7); }
    else if (c.D === 0) { assert.equal(d.type, 'one'); near(d.roots[0], c.vx, 1e-9); }
    else { assert.equal(d.type, 'complex'); near(d.im, c.im, 1e-9); assert.equal(d.roots.length, 0); }
  }
  // حالات الكتاب
  let r = run('quadratic', { a: 1, b: 3, c: -10 }).d; deq(r.roots, [-5, 2]);
  deq(r.chart.map((I) => I.sign), ['+', '-', '+']);
  r = run('quadratic', { a: 1, b: 6, c: 9 }).d; assert.equal(r.type, 'one'); assert.equal(r.roots[0], -3);
  r = run('quadratic', { a: 1, b: 0, c: 5 }).d; assert.equal(r.type, 'complex'); assert.equal(r.re, 0); near(r.im, Math.sqrt(5));
  r = run('quadratic', { a: -1, b: 0, c: 1 }).d; deq(r.chart.map((I) => I.sign), ['-', '+', '-']);
  // استقرار عددي: جذر صغير جداً
  const s = M.solveQuadratic(1, 1e8, 1); near(s.roots[1], -1e-8, 1e-9);
  assert.throws(() => M.solveQuadratic(0, 1, 1));
});

test('المتباينات التربيعية', () => {
  const sol = (a, b, c, op) => run('inequalities', { a, b, c, op }).d.sols;
  deq(sol(1, 3, -4, 'lt'), [{ a: -4, b: 1, ca: false, cb: false }]); // مثال 1 ص 48
  const s2 = sol(1, 1, -12, 'ge'); assert.equal(s2.length, 2); assert.equal(s2[0].b, -4); assert.equal(s2[0].cb, true); assert.equal(s2[1].a, 3);
  const s3 = sol(1, -6, 9, 'gt'); assert.equal(s3.length, 2); assert.equal(s3[0].b, 3); assert.equal(s3[0].cb, false); // كل x ما عدا 3
  assert.equal(sol(1, 0, 1, 'lt').length, 0); // ∅
  assert.equal(sol(1, -6, 9, 'le')[0].point, 3); // نقطة واحدة
  const all = sol(1, 0, 1, 'ge'); assert.equal(all[0].a, -Infinity); assert.equal(all[0].b, Infinity);
  assert.equal(sol(-1, 0, -1, 'gt').length, 0);
});

test('إشارة الاقتران النسبي: الأصفار، خطوط التقارب، الثقوب', () => {
  let d = run('sign', { type: 'rat', pp: 3, q: -2, s: -3 }).d; // مثال الكتاب
  deq(d.chart.map((I) => I.sign), ['-', '+', '-', '+']);
  deq(d.poles.slice().sort((a, b) => a - b), [-1, 3]);
  assert.ok(Number.isNaN(d.f(3)) && Number.isNaN(d.f(-1)));
  d = run('sign', { type: 'rat', pp: 1, q: 0, s: -1 }).d; // (x+1)/((x-1)(x+1))
  deq(d.poles, [1]); assert.equal(d.holes.length, 1); assert.equal(d.holes[0].x, -1); near(d.holes[0].y, -0.5); assert.equal(d.zeros.length, 0);
  d = run('sign', { type: 'rat', pp: -2, q: -4, s: 4 }).d; // (x-2)/(x-2)^2 = 1/(x-2)
  deq(d.poles, [2]); assert.equal(d.holes.length, 0); assert.equal(d.zeros.length, 0);
  d = run('sign', { type: 'rat', pp: 1, q: 0, s: 4 }).d; assert.equal(d.denZ.length, 0);
  d = run('sign', { type: 'lin', a: -2, b: 4 }).d; deq(d.chart.map((I) => I.sign), ['+', '-']); assert.equal(d.zeros[0], 2);
});

test('أكبر عدد صحيح: حل [ax+b] = n مقابل Fraction (150 حالة)', () => {
  near(M.floor(-3.7), -4); assert.equal(M.floor(5.22), 5); assert.equal(M.floor(-0.7), -1); assert.equal(M.floor(0.1 + 0.2 - 0.3 + 3), 3);
  for (const c of ref.floor) {
    const d = run('floor', c).d;
    near(d.sol.a, c.lo, 1e-12); near(d.sol.b, c.hi, 1e-12);
    assert.equal(d.sol.ca, c.closedLeft); assert.equal(d.sol.cb, !c.closedLeft);
    // تحقق مباشر: نقطة داخل الفترة تحقق المعادلة
    const mid = (c.lo + c.hi) / 2; assert.equal(d.f(mid), c.n);
  }
  const d = run('floor', { a: 2, b: 1, n: 7 }).d; assert.equal(d.sol.a, 3); assert.equal(d.sol.b, 3.5); near(d.step, 0.5);
});

test('القيمة المطلقة', () => {
  let d = run('absolute', { kind: 'lin', m: 1, n: -3, k: 0, neg: false }).d; deq(d.zeros, [3]); assert.equal(d.f(-2), 5);
  d = run('absolute', { kind: 'lin', m: 1, n: -3, k: 2, neg: true }).d; deq(d.zeros, [1, 5]);
  d = run('absolute', { kind: 'quad', q: -5, r: 6, k: 0, neg: false }).d; deq(d.zeros, [2, 3]); near(d.f(2.5), 0.25);
  d = run('absolute', { kind: 'lin', m: 1, n: 0, k: 1, neg: false }).d; assert.equal(d.zeros.length, 0);
});

test('الأسي واللوغاريتمي مقابل math.log', () => {
  for (const c of ref.log) near(M.logBase(c.a, c.v), c.y, 1e-12);
  assert.ok(Number.isNaN(M.logBase(2, 0)) && Number.isNaN(M.logBase(2, -3)) && Number.isNaN(M.logBase(1, 5)) && Number.isNaN(M.logBase(-2, 4)));
  let d = run('exponential', { useE: false, a: 3, h: 0, k: 2, neg: false }).d; near(d.yint, 3); assert.ok(d.incr);
  d = run('exponential', { useE: false, a: 0.5, h: 0, k: 0, neg: false }).d; assert.ok(!d.incr);
  d = run('exponential', { useE: true, h: 0, k: 3, neg: true }).d; near(d.yint, 2); near(d.f(Math.log(3)), 0, 1e-12);
  d = run('logarithmic', { useE: false, a: 2, h: 3, k: 0 }).d; near(d.xint, 4); assert.ok(Number.isNaN(d.f(3)) && Number.isNaN(d.f(2)));
  d = run('logarithmic', { useE: false, a: 2, h: 0, k: -1, v: 64 }).d; near(d.logv, 6); near(d.xint, 2);
});

test('الانسحاب والانعكاس', () => {
  let d = run('translation', { base: 'sq', h: 2, k: -4 }).d; near(d.g(-2), -4); near(d.g(0), 0); // x²+4x
  for (let x = -5; x <= 5; x += 0.5) near(d.g(x), x * x + 4 * x, 1e-12);
  d = run('translation', { base: 'sqrt', h: -4, k: 1 }).d; assert.ok(Number.isNaN(d.g(3.9))); near(d.g(4), 1);
  deq(d.tri[0], [5, 3]);
  d = run('reflection', { base: 'lin', rx: true, ry: false, k: 1 }).d; near(d.g(2), -(3 * 2 + 1) + 1);
  d = run('reflection', { base: 'lin', rx: false, ry: true, k: 0, px: -4, py: 3 }).d; near(d.g(1), -3 + 1); deq(d.Py, [4, 3]); deq(d.Px, [-4, -3]);
});

test('متعدد القاعدة', () => {
  let d = run('piecewise', { t: 1, A1: 1, B1: 0, C1: 0, A2: 0, B2: 1, C2: 1, side: 'right', x0: 1 }).d;
  assert.equal(d.f(1), 2); assert.equal(d.f(0.5), 0.25); assert.equal(d.cont, false);
  d = run('piecewise', { t: 1, A1: 1, B1: 0, C1: 0, A2: 0, B2: 1, C2: 1, side: 'left' }).d; assert.equal(d.f(1), 1);
});

test('الدائرة: الصورة العامة مقابل المرجع', () => {
  for (const c of ref.circle) { const g = M.circleFromGeneral(c.L, c.K, c.C); assert.equal(g.r2, c.r2); if (c.r) near(g.r, c.r); else assert.ok(!g.valid); }
  let d = run('circle-eq', { mode: 'gen', L: -3, K: 0, C: -16 }).d; assert.equal(d.cx, 3); assert.equal(d.cy, 0); near(d.r, 5);
  d = run('circle-eq', { mode: 'std', d: 2, h: 1, r: 3, px: 5, py: 1 }).d; assert.equal(d.C, -4); assert.equal(d.pos, 'on'); // x²-4x+y²-2y=4
  d = run('circle-eq', { mode: 'std', d: 4, h: -2, r: 6, px: 10, py: -2 }).d; assert.equal(d.pos, 'on');
  d = run('circle-eq', { mode: 'gen', L: 0, K: 0, C: 5 }).d; assert.ok(!d.valid && !d.point);
  d = run('circle-eq', { mode: 'gen', L: 2, K: 0, C: 4 }).d; assert.ok(!d.valid && d.point);
});

test('الزاوية المركزية = ضعف المحيطية (2000 حالة عشوائية)، والرباعي الدائري', () => {
  let n = 0;
  for (let i = 0; i < 2000; i++) {
    const a = Math.floor(Math.random() * 360), b = Math.floor(Math.random() * 360), c = Math.floor(Math.random() * 360);
    const { d } = run('inscribed-angles', { a, b, c });
    if (d.deg) continue; n++;
    near(d.central, 2 * d.ins, 1e-7, `a=${a} b=${b} c=${c}`);
    near(d.insD, d.ins, 1e-7, 'second inscribed');
  }
  assert.ok(n > 1900);
  for (let i = 0; i < 1000; i++) {
    const v = new Set(); while (v.size < 4) v.add(Math.floor(Math.random() * 360));
    const [a, b, c, dd] = [...v];
    const { d } = run('cyclic-quad', { a, b, c, d: dd, kD: 1 });
    near(d.s02, 180, 1e-7); near(d.s13, 180, 1e-7); near(d.extAng, d.ang[1], 1e-7);
  }
  const { d } = run('cyclic-quad', { a: 20, b: 110, c: 200, d: 300, kD: 0.7 }); assert.ok(Math.abs(d.s02 - 180) > 1);
});

test('حساب المثلثات مقابل math (كل 15°)، القيم الدقيقة، غير المعرّف', () => {
  for (const c of ref.trig) {
    const T = M.trig(c.deg); near(T.sin, c.sin, 1e-12); near(T.cos, c.cos, 1e-12);
    if (c.tan === null) assert.ok(!T.tanDefined && Number.isNaN(T.tan)); else near(T.tan, c.tan, 1e-9);
    assert.equal(M.normDeg(c.deg), c.norm);
    const ex = M.exactTrig(c.deg); if (ex && c.deg % 30 === 0) assert.ok(ex.sin && ex.cos);
  }
  assert.equal(M.exactTrig(120).sin, '\\frac{\\sqrt{3}}{2}'); assert.equal(M.exactTrig(225).cos, '-\\frac{\\sqrt{2}}{2}');
  assert.equal(M.exactTrig(270).tan, null); assert.equal(M.exactTrig(-30).sin, '-\\frac{1}{2}'); assert.equal(M.exactTrig(150).tan, '-\\frac{\\sqrt{3}}{3}');
  assert.equal(M.quadrant(-300), 1); assert.equal(M.quadrant(210), 3); assert.equal(M.quadrant(-90), 0); assert.equal(M.referenceAngle(240), 60);
  assert.equal(M.radTeX(150), '\\frac{5\\pi}{6}'); assert.equal(M.radTeX(-225), '-\\frac{5\\pi}{4}'); assert.equal(M.radTeX(180), '\\pi');
  const dms = M.toDMS(32.6); assert.equal(dms.d, 32); assert.equal(dms.m, 36); near(dms.s, 0);
});

test('المعادلات المثلثية على [0, 2π]', () => {
  const P = Math.PI; const sol = (fn, a, b) => run('trig-equations', { fn, a, b }).d.sols;
  const eq = (x, y) => { assert.equal(x.length, y.length, JSON.stringify(x)); x.forEach((v, i) => near(v, y[i], 1e-12)); };
  eq(sol('sin', 2, -1), [P / 6, 5 * P / 6]); // مثال 1 ص 134
  eq(sol('sin', 1, 0), [0, P, 2 * P]); eq(sol('cos', 1, -1), [0, 2 * P]); eq(sol('cos', 2, 1), [2 * P / 3, 4 * P / 3]);
  eq(sol('tan', 1, -1), [P / 4, 5 * P / 4]); eq(sol('tan', 1, 0), [0, P, 2 * P]); eq(sol('sin', 1, 1), [3 * P / 2]);
  eq(sol('sin', 1, -2), []); eq(sol('cos', 0.5, 1), []);
  for (let i = 0; i < 500; i++) { // كل حل يحقق المعادلة
    const fn = ['sin', 'cos', 'tan'][i % 3]; const a = [-4, -2, -1, 1, 1.5, 3][i % 6]; const b = Math.round((Math.random() * 10 - 5) * 4) / 4;
    for (const x of sol(fn, a, b)) near(a * Math[fn](x) + b, 0, 1e-9);
  }
});

test('رسوم الاقترانات المثلثية: الدورة والسعة وخطوط تقارب الظل', () => {
  let d = run('trig-graphs', { fn: 'cos', a: 2, b: 0.5, c: 0, d: -3 }).d; near(d.period, 4 * Math.PI); assert.equal(d.max, -1); assert.equal(d.min, -5);
  d = run('trig-graphs', { fn: 'tan', a: 1, b: 2, c: 0, d: 0 }).d; near(d.period, Math.PI / 2);
  const s = sim('trig-graphs'); const as = s.asym({ b: 2, c: 0 }, { xmin: -2, xmax: 2 });
  as.forEach((x) => near(Math.cos(2 * x), 0, 1e-12)); assert.equal(as.length, 2);
  for (const id of ['pyth', 'sec', 'csc', 'sin2', 'cos2', 'frac']) for (let th = 1; th < 360; th += 7) { const r = run('identities', { id, th }).d; if (!r.und) near(r.L, r.R, 1e-9, id + th); }
  assert.ok(run('identities', { id: 'sec', th: 90 }).d.und); assert.ok(run('identities', { id: 'csc', th: 180 }).d.und); assert.ok(run('identities', { id: 'frac', th: 0 }).d.und);
});

test('المصفوفات: المحدد والنظير مقابل NumPy (200)، كريمر (200)', () => {
  for (const c of ref.det) {
    assert.equal(M.det2(c.A), c.det);
    const inv = M.inv2(c.A);
    if (c.inv) { inv.forEach((r, i) => r.forEach((v, j) => near(v, c.inv[i][j], 1e-9))); const I = M.matMul(c.A, inv); near(I[0][0], 1); near(I[0][1], 0, 1e-12); near(I[1][1], 1); }
    else assert.equal(inv, null);
  }
  for (const c of ref.cramer) {
    const r = M.cramer(...c.s);
    if (c.sol) { near(r.x, c.sol[0], 1e-9); near(r.y, c.sol[1], 1e-9); } else assert.ok(!r.unique && (r.kind === 'none' || r.kind === 'infinite'));
  }
  const b = M.cramer(8, 2, 40, 5, 3, 32); assert.equal(b.D, 14); assert.equal(b.Dx, 56); assert.equal(b.Dy, 56); assert.equal(b.x, 4); assert.equal(b.y, 4);
  assert.equal(M.cramer(1, 1, 2, 2, 2, 5).kind, 'none'); assert.equal(M.cramer(1, 1, 2, 2, 2, 4).kind, 'infinite');
  assert.equal(M.det2([[1, 3], [-3, 9]]), 18); // مثال الكتاب
  assert.equal(M.matMul([[1, 2, 3]], [[1, 2, 3]]), null); // غير معرّف
  const A = [[1, 2], [3, 4]], B = [[2, 0], [1, -1]]; assert.notDeepEqual(J(M.matMul(A, B)), J(M.matMul(B, A)));
  const k = 3; assert.equal(M.det2(M.matScale(k, A)), k * k * M.det2(A));
});

test('العد: المضروب والتباديل والتوافيق مقابل math (0..20)، ذات الحدين', () => {
  for (const c of ref.comb) { assert.equal(M.nCrBig(c.n, c.r).toString(), c.C); assert.equal(M.nPrBig(c.n, c.r).toString(), c.P); assert.equal(M.factBig(c.n).toString(), c.F); }
  assert.equal(M.nPrBig(3, 5), null); assert.equal(M.factBig(-1), null);
  assert.equal(run('counting', { k: 2, n1: 3, n2: 2 }).d.N, 6);
  assert.equal(ML.perms(4, 2, 1000).length, 12); assert.equal(new Set(ML.perms(5, 3, 1000)).size, 60);
  assert.equal(ML.combs(6, 4, 1000).length, 15);
  for (let n = 0; n <= 10; n++) for (const [a, b] of [[2, 1], [-1.5, 0.5], [3, -3]]) { const d = run('binomial', { n, r: 0, a, b }).d; near(d.sum, d.direct, 1e-9); }
});

test('المنطق: جداول الصواب والتكافؤ', () => {
  const L = M.logic;
  const t = (op) => [[true, true], [true, false], [false, true], [false, false]].map(([p, q]) => L[op](p, q));
  deq(t('and'), [true, false, false, false]); deq(t('or'), [true, true, true, false]);
  deq(t('imp'), [true, false, true, true]); deq(t('iff'), [true, false, false, true]);
  const eq = { dm1: true, dm2: true, contra: true, impor: true, negimp: true, ex3: true, conv: false, andor: false };
  for (const k in eq) assert.equal(run('equivalence', { pair: k }).d.eq, eq[k], k);
  assert.equal(run('truth-tables', { op: 'and', p: true, q: false, np: false, nq: true }).d.v, true);
});

test('المساعد الذكي يجيب بقيم المحاكاة الحالية', () => {
  const s = sim('quadratic'); const { p, d } = run('quadratic', { a: 1, b: 0, c: 5 });
  const ans = ML.tutorAnswer(s, 'لماذا اختفت الجذور الحقيقية للمعادلة عندما جعلت c = 5؟', { p, d, lastExplain: [] });
  assert.match(ans, /-20/); assert.match(ans, /\\pm/);
  const u = sim('unit-circle'); const st = run('unit-circle', { th: 90 });
  assert.match(ML.tutorAnswer(u, 'لماذا يكون الظل غير معرّف عند 90°؟', { p: st.p, d: st.d, lastExplain: [] }), /غير معرّف/);
  for (const sm of ML.sims) { const r = run(sm.id); for (const q of sm.tutor) { const a = ML.tutorAnswer(sm, q.q, { p: r.p, d: r.d, lastExplain: [] }); assert.ok(a && !/NaN|undefined/.test(a), sm.id + ': ' + q.q); } }
});
