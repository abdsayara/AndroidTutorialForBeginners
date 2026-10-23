// اختبارات رياضيات التاسع (الجزء الأول) — التشغيل: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(dir, '..');
const ctx = vm.createContext({ console, performance, BigInt });
for (const f of ['core/math.js', 'core/notation.js', 'core/fx.js', 'core/plot.js', 'core/tutor.js', 'core/ui.js', 'subjects/g9-math/common.js', 'subjects/g9-math/u1-real.js', 'subjects/g9-math/u2-functions.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
}
const ML = ctx.ML, G = ML.m9;
const SIMS = ML.sims.filter((s) => s.subject === 'g9-math');
const sim = (id) => SIMS.find((s) => s.id === id);
const defaults = (s) => Object.fromEntries(s.params.map((q) => [q.key, q.value]));
const run = (id, over, st) => { const s = sim(id); const p = Object.assign(defaults(s), over || {}); if (s.onSet) for (const k of Object.keys(over || {})) s.onSet(p, k); Object.assign(p, over || {}); const d = s.compute(p); d.st = st || (s.initState ? s.initState(p) : null); return { s, p, d }; };
const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `expected ${b}, got ${a}`);
const J = (x) => JSON.parse(JSON.stringify(x));

test('الصف التاسع: مادتا الرياضيات والعلوم، ووحدتا الجزء الأول', () => {
  assert.deepEqual(J(ML.grades.find((g) => g.id === 'g9').subjects), ['g9-math', 'g9-science']);
  const u = ML.subjects['g9-math'].units; assert.equal(u.length, 2);
  assert.deepEqual(J(u.map((x) => x.pages)), ['4–29', '30–62']);
  assert.equal(ML.simHref(sim('real-sets')), '#/g9/math/sim/real-sets');
});

test('16 محاكاة، لكل منها مصدر وصفحة وتعلّم وتحديات ومساعد', () => {
  assert.equal(SIMS.length, 16);
  for (const s of SIMS) {
    assert.ok(s.page >= 4 && s.page <= 56, s.id + ' page');
    assert.ok([1, 2].includes(s.unit) && s.lesson && s.titleAr && s.titleEn && s.book && s.summary, s.id + ' meta');
    assert.ok(s.challenges.length >= 2 && s.tutor.length >= 2 && s.learn.length >= 2, s.id + ' content');
    const { p, d } = run(s.id);
    const res = s.results(p, d); assert.ok(Array.isArray(res) && res.length >= 2, s.id + ' results');
    for (const r of res) assert.ok(!/NaN|undefined|\[object/.test(String(r[1])), s.id + ' result ' + r[1]);
    for (const x of s.steps(p, d)) assert.ok(!/NaN|undefined/.test(x), s.id + ' step ' + x);
    assert.ok(!/NaN|undefined/.test(s.live(p, d)), s.id + ' live');
    for (const t of s.tutor) assert.ok(typeof t.a(p, d) === 'string');
  }
});

// حل كل تحدٍّ بقيم الكتاب، والتأكد من أن حالته الابتدائية ليست محلولة
const SOLVE = {
  'real-sets': [{ k: 'm6' }, { k: 'mpi' }, { k: 'rep' }],
  'like-radicals': [{ a: 1, n1: 50, b: -1, n2: 2, c: 0, n3: 1, dd: 0, n4: 1 }, { a: 1, n1: 8, b: 1, n2: 18, c: -5, n3: 2, dd: 0, n4: 1 }],
  'sound-speed': [{ x: -50 }, { x: 16 }],
  'radical-ops': [{ mode: 'rat', a: 15, b: 6 }, { mode: 'conj', a: 5, c: 2, b: 3 }, { mode: 'mul', a: 250, b: 90 }],
  'absolute-value': [{ h: 7, k: 20 }, { h: 1, k: 36 }, { x: -4.5 }],
  'exponent-laws': [{ law: 'prod', a: 3, m: 2, n: 4 }, { law: 'pp', a: 3, b: 5, n: 2 }, { law: 'quot', m: 3, n: 3 }],
  'bacteria-growth': [{ t: 3 }, { t: -2 / 3 }, { t: 2 }],
  'scientific-notation': [{ ex: 'free', a: 3.8, n: 5 }, { ex: 'free', a: 1.23, n: -2 }],
  'cartesian-product': [{ pre: 'act3', op: 'BA' }, { pre: 'ex3', op: 'AB' }, { pre: 'act4', op: 'AA' }],
  relation: [{ pre: 'lamps', i: 3 }, { pre: 'ex5', i: 3 }],
  'relation-properties': [[{ rel: 'ex1a' }, { rel: 'ex1a', tog: [[6, 6]] }], [{ rel: 'ex3' }, { rel: 'ex3', tog: [[1, 3]] }], [{ rel: 'act8' }, null]],
  'function-map': [{ pre: 'act4', x: 5 }, { pre: 'fig3' }, { pre: 'ex6', x: 4 }],
  'function-types': [{ pre: 'act5' }, { pre: 'ex1' }, { pre: 'act6' }],
  'linear-function': [{ a: 2, b: 1 }, { a: 1, b: 0 }, { a: -2, b: 1, x: -1 }],
  'linear-apps': [{ ctx: 'trees', x: 12 }, { ctx: 'fridge', x: 300 }, { ctx: 'fence', x: 32 }],
  composition: [{ pre: 'money', usd: 100 }, { pre: 'sets', x: 3 }]
};
test('التحديات قابلة للحل وغير محلولة في حالتها الابتدائية', () => {
  for (const s of SIMS) {
    const sol = SOLVE[s.id]; assert.ok(sol && sol.length === s.challenges.length, s.id + ' has solutions for all challenges');
    s.challenges.forEach((ch, i) => {
      const init = run(s.id, ch.init); assert.ok(!ch.check(init.p, init.d), `${s.id} #${i + 1} solved at init`);
      const x = sol[i]; const over = Array.isArray(x) ? x[0] : x; const st = Array.isArray(x) && x[1] ? x[1] : null;
      const r = run(s.id, Object.assign({}, ch.init, over), st); assert.ok(ch.check(r.p, r.d), `${s.id} #${i + 1} not solved by ${JSON.stringify(x)}`);
    });
  }
});

test('الوحدة الأولى: قيم الكتاب', () => {
  // تصنيف نشاط 2 ص 5
  const mem = (k) => J(run('real-sets', { k }).d.mem);
  assert.deepEqual(mem('cr64'), [true, true, true, false, true]);
  assert.deepEqual(mem('mr9'), [false, true, true, false, true]);
  assert.deepEqual(mem('r2'), [false, false, false, true, true]);
  assert.deepEqual(mem('rep'), [false, false, true, false, true]);
  // √45 + 6√5 − √20 − √25 = 7√5 − 5
  let d = run('like-radicals').d; assert.equal(G.resTeX(d.res), '7\\sqrt{5} - 5'); near(d.val, 7 * Math.sqrt(5) - 5);
  d = run('like-radicals', { a: 1, n1: 50, b: -1, n2: 2, c: 0, dd: 0 }).d; assert.equal(G.resTeX(d.res), '4\\sqrt{2}');
  assert.deepEqual(J(G.simplifyRoot(72)), [6, 2]); assert.deepEqual(J(G.simplifyRoot(45)), [3, 5]);
  // سرعة الصوت
  near(run('sound-speed', { x: 37 }).d.v, 20 * Math.sqrt(310));
  // √250 × √90 = 150 ، 15/√6 = 5√6/2 ، 1/(2 − √7) ، 5/(2 − √3) = 10 + 5√3
  d = run('radical-ops').d; assert.equal(d.tex, '150');
  assert.equal(run('radical-ops', { mode: 'rat', a: 15, b: 6 }).d.tex, '\\frac{5\\sqrt{6}}{2}');
  d = run('radical-ops', { mode: 'conj', a: 1, c: 2, b: 7 }).d; assert.equal(d.tex, '\\frac{-2 - \\sqrt{7}}{3}'); near(d.val, 1 / (2 - Math.sqrt(7)));
  d = run('radical-ops', { mode: 'conj', a: 5, c: 2, b: 3 }).d; assert.equal(d.tex, '10 + 5\\sqrt{3}'); near(d.val, 10 + 5 * Math.sqrt(3));
  assert.equal(run('radical-ops', { mode: 'conj', a: 1, c: 3, b: 9 }).d.ok, false);
  // القيمة المطلقة و (س + 7)² = 20
  d = run('absolute-value', { x: -420 / 100 }).d; near(d.abs, 4.2);
  d = run('absolute-value', { h: 7, k: 20 }).d; near(d.sols[0], -7 - 2 * Math.sqrt(5)); near(d.sols[1], -7 + 2 * Math.sqrt(5));
  d = run('absolute-value', { h: 1, k: 36 }).d; assert.deepEqual(J(d.sols), [-7, 5]);
  // الأسس
  assert.equal(run('exponent-laws', { law: 'prod', a: 3, m: 2, n: 4 }).d.val, 729);
  assert.equal(run('exponent-laws', { law: 'pp', a: 3, b: 5, n: 2 }).d.val, 225);
  assert.equal(run('exponent-laws', { law: 'zero' }).d.val, 1);
  near(run('exponent-laws', { law: 'quot', a: 2, m: 1, n: 3 }).d.val, 0.25);
  // البكتيريا: بعد ساعتين 64 خلية، و 512 بعد 3 ساعات
  assert.equal(run('bacteria-growth', { t: 2 }).d.N, 64); assert.equal(run('bacteria-growth', { t: 3 }).d.n, 9);
  near(run('bacteria-growth', { t: -2 / 3 }).d.N, 0.25);
  // الصورة العلمية
  assert.equal(G.plain(3.8, 5), '380 000'); assert.equal(G.plain(1.23, -2), '0.0123'); assert.equal(G.plain(3.476, 6), '3 476 000'); assert.equal(G.plain(2.2, 10), '22 000 000 000');
  const sn = run('scientific-notation', { ex: 'diam' }); assert.equal(sn.p.a, 3.476); assert.equal(sn.p.n, 6);
});

test('الوحدة الثانية: الضرب الديكارتي والعلاقات', () => {
  let d = run('cartesian-product').d; assert.equal(d.n, 9);
  d = run('cartesian-product', { pre: 'act3', op: 'AB' }).d; assert.deepEqual(J(d.pairs), [[1, 6], [1, 8], [2, 6], [2, 8], [3, 6], [3, 8]]);
  assert.equal(run('cartesian-product', { pre: 'ex3' }).d.n, 16);
  d = run('relation', { pre: 'act5' }).d; assert.deepEqual(J(d.r.pairs), [[2, 1], [3, 2], [4, 3]]);
  d = run('relation', { pre: 'act4' }).d; assert.equal(d.r.pairs.length, 6); assert.deepEqual(J(d.dom), [2, 3, 4]);
  d = run('relation', { pre: 'ex4' }).d; assert.deepEqual(J(d.r.pairs), [[4, 1], [5, 2], [6, 3]]);
  d = run('relation', { pre: 'ex5' }).d; assert.deepEqual(J(d.r.pairs), [[1, 3], [2, 6], [3, 9]]);
  d = run('relation', { pre: 'lamps', i: 3 }).d; assert.deepEqual(J(d.hi), [5, 4.5]);
  // خواص العلاقات (نشاطات وتمارين ص 39–43)
  const an = (rel, tog) => { const p = { rel }; const e = G.effectiveRel(p, tog ? { rel, tog } : null); return G.analyzeRel(e.A, e.pairs); };
  let a = an('act2'); assert.ok(a.refl && !a.sym && a.trans);
  a = an('act3a'); assert.ok(!a.refl); assert.deepEqual(J(a.missDiag), [5]);
  assert.ok(an('act3b').refl);
  a = an('act4'); assert.ok(a.sym && !a.refl);
  assert.ok(an('act5a').sym); a = an('act5b'); assert.ok(!a.sym); assert.deepEqual(J(a.asym[0]), [5, -1]);
  a = an('act7a'); assert.ok(!a.trans); assert.ok(an('act7b').trans);
  assert.ok(an('act8').eqv); assert.ok(an('full').eqv);
  assert.ok(!an('ex1a').refl); assert.ok(an('ex1a', [[6, 6]]).refl);
  assert.ok(an('ex2a').sym); assert.ok(!an('ex3').trans); assert.ok(an('ex3', [[1, 3]]).trans);
  assert.ok(an('ex4a').eqv); assert.ok(an('ex6').trans);
  // النقر مرتين يعيد العلاقة كما كانت
  assert.ok(!an('ex1a', [[6, 6], [6, 6]]).refl);
});

test('الوحدة الثانية: الاقترانات وأنواعها والخطي والتركيب', () => {
  assert.ok(!run('function-map', { pre: 'fig1' }).d.t.ok); assert.ok(run('function-map', { pre: 'fig2' }).d.t.ok); assert.deepEqual(J(run('function-map', { pre: 'fig3' }).d.t.multi), [2]);
  let d = run('function-map', { pre: 'act3' }).d; assert.deepEqual(J(d.rng), [0, 2, 4, 6]);
  assert.equal(run('function-map', { pre: 'act4', x: -2 }).d.img[0], -3);
  assert.deepEqual(J(run('function-map', { pre: 'ex6' }).d.r.pairs), [[1, 3], [2, 4], [3, 5], [4, 8], [5, 7]]);
  assert.ok(run('function-map', { pre: 'ex1c' }).d.t.ok);
  const ty = (pre) => run('function-types', { pre }).d;
  d = ty('act1'); assert.ok(d.onto && d.one && d.bij);
  d = ty('act2'); assert.ok(d.one && !d.onto);
  assert.ok(ty('act3q').one); d = ty('act3h'); assert.ok(!d.one); assert.deepEqual(J(d.coll), [1]);
  d = ty('act4'); assert.ok(!d.one && !d.onto);
  assert.ok(ty('act5').bij);
  d = ty('act6'); assert.ok(!d.one && !d.onto);
  d = ty('ex1'); assert.ok(d.one && !d.onto); assert.deepEqual(J(d.rng), [-3, -1, 1, 3]);
  assert.ok(ty('ex3b').bij);
  // الخطي: ق(س) = 3س + 1 عند -1 ، 0 ، 1 (مثال ص 53)
  d = run('linear-function').d; assert.deepEqual(J(d.tbl), [[-1, -2], [0, 1], [1, 4]]);
  assert.equal(run('linear-function', { a: 0, b: 4 }).d.type, 'const'); assert.equal(run('linear-function', { a: 1, b: 0 }).d.type, 'id');
  assert.equal(run('linear-function', { a: 5, b: 2, x: 4 }).d.y, 22);
  assert.equal(run('linear-apps', { ctx: 'trees', x: 10 }).d.y, 250);
  assert.equal(run('linear-apps', { ctx: 'fridge', x: 300 }).d.y, 160000);
  assert.equal(run('linear-apps', { ctx: 'fence', x: 32 }).d.y, 640);
  assert.equal(run('linear-apps', { ctx: 'trees', x: 300 }).d.x, 20); // يُقيَّد بحدود الموقف
  // التركيب
  d = run('composition', { pre: 'sets', x: 2 }).d; assert.equal(d.b, 6); assert.equal(d.c, 10);
  near(run('composition', { pre: 'money', usd: 100 }).d.c, 370);
});
