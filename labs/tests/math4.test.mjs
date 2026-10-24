// اختبارات رياضيات الرابع (الجزء الأول كاملاً) — التشغيل: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(dir, '..');
const ctx = vm.createContext({ console, performance, BigInt });
for (const f of ['core/math.js', 'core/notation.js', 'core/fx.js', 'core/plot.js', 'core/tutor.js', 'core/ui.js', 'subjects/g9-math/common.js',
  'subjects/g4-math/common.js', 'subjects/g4-math/u1-numbers.js', 'subjects/g4-math/u2-addsub.js', 'subjects/g4-math/u3-division.js', 'subjects/g4-math/u4-fractions.js', 'subjects/g4-math/u5-geometry.js', 'subjects/g4-math/u6-data.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
}
const ML = ctx.ML, G = ML.m4;
const SIMS = ML.sims.filter((s) => s.subject === 'g4-math');
const sim = (id) => SIMS.find((s) => s.id === id);
const defaults = (s) => Object.fromEntries(s.params.map((q) => [q.key, q.value]));
const run = (id, over, st) => { const s = sim(id); const p = Object.assign(defaults(s), over || {}); if (s.onSet) for (const k of Object.keys(over || {})) s.onSet(p, k); Object.assign(p, over || {}); const d = s.compute(p); d.st = st || (s.initState ? s.initState(p) : null); return { s, p, d }; };
const J = (x) => JSON.parse(JSON.stringify(x));

test('الصف الرابع: مادة الرياضيات بوحداتها الست', () => {
  assert.equal(ML.grades[0].id, 'g4');
  assert.deepEqual(J(ML.grades.find((g) => g.id === 'g4').subjects), ['g4-math']);
  const u = ML.subjects['g4-math'].units;
  assert.deepEqual(J(u.map((x) => x.n)), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(J(u.map((x) => x.pages)), ['2–24', '25–41', '42–65', '66–89', '90–108', '109–120']);
  assert.equal(ML.simHref(sim('long-division')), '#/g4/math/sim/long-division');
  assert.equal(ML.unitOf(sim('protractor')).n, 5);
  assert.ok(ML.unitName('g4-math', 4).includes('الكسور العادية'));
});

test('19 محاكاة، لكل منها مصدر وصفحة وتعلّم وتحديات ومساعد', () => {
  assert.equal(SIMS.length, 19);
  for (const s of SIMS) {
    assert.ok(s.page >= 5 && s.page <= 120, s.id + ' page');
    assert.ok([1, 2, 3, 4, 5, 6].includes(s.unit) && s.lesson && s.titleAr && s.titleEn && s.book && s.summary, s.id + ' meta');
    assert.ok(s.challenges.length >= 2 && s.tutor.length >= 2 && s.learn.length >= 2, s.id + ' content');
    const { p, d } = run(s.id);
    const res = s.results(p, d); assert.ok(Array.isArray(res) && res.length >= 2, s.id + ' results');
    for (const r of res) { assert.ok(!/NaN|undefined|\[object/.test(String(r[1])), s.id + ' result ' + r[1]); assert.ok(!/[_\\]/.test(r[0]), s.id + ' label ' + r[0]); }
    for (const x of s.steps(p, d)) assert.ok(!/NaN|undefined/.test(x), s.id + ' step ' + x);
    assert.ok(!/NaN|undefined/.test(s.live(p, d)), s.id + ' live');
    for (const t of s.tutor) assert.ok(typeof t.a(p, d) === 'string');
    // كل خيارات القوائم (الأمثلة) تعمل دون أخطاء
    for (const q of s.params.filter((x) => x.type === 'select')) {
      const opts = typeof q.options === 'function' ? q.options() : q.options;
      for (const o of opts) {
        const r = run(s.id, { [q.key]: o[0] });
        for (const x of s.results(r.p, r.d)) assert.ok(!/NaN|undefined|\[object/.test(String(x[1])), s.id + ' ' + q.key + '=' + o[0] + ' → ' + x[1]);
        for (const x of s.steps(r.p, r.d)) assert.ok(!/NaN|undefined/.test(x), s.id + ' ' + q.key + '=' + o[0] + ' step');
        assert.ok(!/NaN|undefined/.test(s.live(r.p, r.d)), s.id + ' ' + q.key + '=' + o[0] + ' live');
      }
    }
  }
});

const SOLVE = {
  'place-value': [{ num: '999999', add1: true }, { num: '2058238' }, { pos: 4 }, { num: '150000' }],
  'compare-numbers': [{ a: '596144', b: '603722' }, { a: '1000001', b: '1000002' }, { mode: 'ord', list: 'pal', dir: 'desc' }],
  'add-sub-millions': [{ a: '4682467', b: '4232012' }, { op: 'sub' }, { a: '1000000', b: '340000' }, { c: '1745240' }],
  rounding: [{ place: '1000000' }, { num: '5122702' }, { mode: 'est', op: 'sub' }],
  'multiply-blocks': [{ n: 21 }, { n: 121 }, { mode: 'est', k: 6 }, { n: 14 }],
  'division-sharing': [{ a: 46 }, { a: 56, b: 3 }, { a: 31 }],
  'long-division': [{ op: 'div', a: 96, b: 5 }, { op: 'div', a: 74, b: 8 }, { op: 'div', a: 13, b: 4 }, { op: 'mul', a: 907, b: 8 }],
  'fraction-wall': [{ n: 4, d: 8 }, { n: 6, d: 9 }, { cmp: true, n: 1, d: 5, n2: 1, d2: 7 }],
  'equivalent-fractions': [{ k: 4 }, { mode: 'simp', n: 28, d: 49 }, { k: 3 }, { mode: 'div', k: 3 }],
  'compare-fractions': [{ n1: 3, d1: 5, n2: 2, d2: 7 }, { n2: 8 }, { n2: 5 }],
  'add-sub-fractions': [{ n1: 3, n2: 2 }, { op: 'sub', n1: 7 }, { op: 'sub' }, { op: 'assoc', n3: 4 }],
  'mixed-numbers': [{ w: 4, n: 5 }, { mode: 'toMix', N: 66 }, { mode: 'line', w: 1, n: 2 }],
  'mixed-add-sub': [{ w2: 2, n2: 3 }, { op: 'sub', n1: 0 }, { op: 'cmp', n2: 2 }],
  'parallel-perpendicular': [{ a2: 0 }, { a2: 110 }, { shape: 'tri' }],
  protractor: [{ ang: 65 }, { ang: 110 }, { guess: 150 }, { side: 'l', ang: 90 }],
  'triangle-angles': [{ mode: 'find', A: 90, B: 48 }, { A: 110, B: 30 }, { mode: 'check', A: 80, B: 39, C: 60 }, { A: 45, B: 45 }],
  pictograph: [{ ds: 'swal', num: true }, { key: '3' }, { key: '2' }],
  'tally-table': [{ k: 30 }, { n: 20 }, { k: 15 }],
  'bar-graph': [[{ ds: 'tv', mode: 'build' }, { h: [9, 6, 15] }], [{ ds: 'inst', mode: 'build' }, { h: [13, 9, 4] }], { ds: 'books', mode: 'read' }]
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

test('الوحدة الثالثة: القسمة الطويلة والضرب بقيم الكتاب', () => {
  const dv = (a, b) => { const d = run('long-division', { op: 'div', a, b }).d; return [d.q, d.rem]; };
  assert.deepEqual(dv(96, 5), [19, 1]); assert.deepEqual(dv(73, 6), [12, 1]); assert.deepEqual(dv(86, 7), [12, 2]); assert.deepEqual(dv(57, 9), [6, 3]);
  assert.deepEqual(dv(74, 8), [9, 2]); assert.deepEqual(dv(84, 4), [21, 0]); assert.deepEqual(dv(64, 7), [9, 1]); assert.deepEqual(dv(27, 4), [6, 3]); assert.deepEqual(dv(93, 4), [23, 1]);
  const steps = run('long-division', { op: 'div', a: 96, b: 5 }).d.r.steps;
  assert.deepEqual(J(steps.map((s) => [s.cur, s.q, s.prod, s.rem])), [[9, 1, 5, 4], [46, 9, 45, 1]]);
  assert.equal(run('long-division', { op: 'div', a: 64, b: 7 }).d.r.s0, 1); // نبدأ بـ ٦٤ لأن ٦ < ٧
  assert.equal(run('long-division', { op: 'mul', a: 87, b: 9 }).d.m.prod, 783);
  assert.equal(run('long-division', { op: 'mul', a: 907, b: 8 }).d.m.prod, 7256);
  const boat = run('long-division', { ex: 'boat' }); assert.ok(boat.s.results(boat.p, boat.d).some((r) => r[0] === 'عدد القوارب اللازمة' && r[1].startsWith('١٠')));
  // الخطوات = المسألة + خطوة لكل منزلة + التحقق، وتُعرض كاملة بعد تغيير المسألة
  const p = run('long-division', { ex: 'c' }).p; assert.equal(p.s, 3);
});

test('الوحدة الرابعة: الكسور بقيم الكتاب', () => {
  assert.deepEqual(J(G.simp(28, 49)), [4, 7]); assert.deepEqual(J(G.simp(16, 26)), [8, 13]); assert.deepEqual(J(G.simp(20, 30)), [2, 3]);
  assert.deepEqual(J(run('equivalent-fractions', { ex: 'a13' }).d.r), [2, 6]);
  assert.deepEqual(J(run('equivalent-fractions', { ex: 'a11b' }).d.r), [4, 7]);
  assert.ok(run('equivalent-fractions', { ex: 'p1931' }).d.simplest);
  assert.deepEqual(J(run('equivalent-fractions', { ex: 'r810' }).d.r), [80, 100]);
  assert.deepEqual(J(run('fraction-wall', { n: 1, d: 2 }).d.eq), [[1, 2], [2, 4], [3, 6], [4, 8], [5, 10]]);
  const cmp = (ex) => run('compare-fractions', { ex }).d.k;
  assert.equal(cmp('n17'), 1); assert.equal(cmp('q1'), -1); assert.equal(cmp('q2'), -1); assert.equal(cmp('q3'), 0); assert.equal(cmp('q4'), 1); assert.equal(cmp('a5a'), 1); assert.equal(cmp('a5b'), -1); assert.equal(cmp('hour'), 1);
  assert.equal(run('compare-fractions', { ex: 'a5a' }).d.u.D, 35);
  const add = (ex) => J(run('add-sub-fractions', { ex }).d.r);
  assert.deepEqual(add('a5a'), [11, 12]); assert.deepEqual(add('a5c'), [29, 35]); assert.deepEqual(add('a5d'), [51, 56]); assert.deepEqual(add('a8'), [8, 15]); assert.deepEqual(add('a6'), [6, 9]);
  assert.deepEqual(add('a8b'), [4, 7]); assert.deepEqual(add('as1'), [6, 7]); assert.deepEqual(add('nuts'), [1, 12]); assert.deepEqual(add('a11'), [1, 6]);
  assert.ok(run('add-sub-fractions', { op: 'sub', n1: 1, d1: 3, n2: 1, d2: 2 }).d.neg);
  const mx = (ex) => { const d = run('mixed-numbers', { ex }).d; return [d.w, d.n, d.d, d.N]; };
  assert.deepEqual(mx('t3'), [4, 5, 7, 33]); assert.deepEqual(mx('m66'), [8, 2, 8, 66]); assert.deepEqual(mx('m17'), [3, 2, 5, 17]); assert.deepEqual(mx('q9'), [2, 1, 4, 9]);
  const ma = (ex) => { const r = run('mixed-add-sub', { ex }).d.r; return [r.w, r.f, r.D]; };
  assert.deepEqual(ma('sam'), [8, 3, 4]); assert.deepEqual(ma('app'), [6, 1, 4]); assert.deepEqual(ma('wm'), [1, 7, 10]); assert.deepEqual(ma('r6f'), [1, 2, 3]);
  assert.deepEqual(ma('a5b'), [3, 6, 7]); assert.deepEqual(ma('fl'), [3, 5, 6]); assert.deepEqual(ma('fl4'), [0, 1, 6]); assert.deepEqual(ma('lib'), [22, 1, 2]);
  assert.equal(run('mixed-add-sub', { ex: 'kh' }).d.r.k, -1); assert.equal(run('mixed-add-sub', { ex: 'c2' }).d.r.k, 0); assert.equal(run('mixed-add-sub', { ex: 'c3' }).d.r.k, 1);
});

test('الوحدة الخامسة: المستقيمات والزوايا والمثلث', () => {
  const pp = (o) => run('parallel-perpendicular', o).d.kind;
  assert.equal(pp({ mode: 'lines', a1: 0, a2: 0, off: 2 }), 'par'); assert.equal(pp({ mode: 'lines', a1: 30, a2: 120, off: 1 }), 'perp'); assert.equal(pp({ mode: 'lines', a1: 30, a2: 70, off: 1 }), 'cross');
  const sh = (shape) => run('parallel-perpendicular', { mode: 'shapes', shape }).d.a;
  assert.equal(sh('rect').par.length, 2); assert.equal(sh('trap').par.length, 1); assert.equal(sh('tri').par.length, 0);
  const h = sh('house'); assert.deepEqual(J(h.par), [[0, 3]]); assert.equal(h.per.length, 2);
  const pr = (ang) => run('protractor', { mode: 'measure', ang }).d.type;
  assert.equal(pr(100), 'منفرجة'); assert.equal(pr(163), 'منفرجة'); assert.equal(pr(88), 'حادة'); assert.equal(pr(90), 'قائمة'); assert.equal(pr(180), 'مستقيمة');
  assert.equal(run('protractor', { ex: 'clock' }).d.a, 150);
  assert.equal(run('protractor', { mode: 'error', ang: 60 }).d.wrong, 120);
  const tri = (ex) => run('triangle-angles', { ex }).d;
  assert.equal(tri('f1').C, 60); assert.equal(tri('f2').C, 42); assert.equal(tri('lu').C, 40); assert.equal(tri('lu').type, 'حاد الزوايا');
  assert.equal(tri('s3').type, 'منفرج الزاوية'); assert.equal(tri('s2').type, 'قائم الزاوية');
  assert.ok(!tri('c1').ok); assert.equal(tri('c1').total, 200); assert.ok(tri('c2').ok); assert.ok(!tri('c3').ok); assert.ok(tri('c4').ok); assert.ok(!tri('mu').ok); assert.equal(tri('mu').total, 179);
});

test('الوحدة السادسة: البيانات بقيم الكتاب', () => {
  const pic = (ds) => run('pictograph', { ds }).d;
  assert.equal(pic('swal').tot, 43); assert.equal(pic('swal').mx, 4); assert.equal(pic('dress').key, 3); assert.deepEqual(J(pic('dress').pics), [3, 3, 2, 1]);
  assert.equal(pic('quran').tot, 7.5); assert.deepEqual(J(pic('smile').pics), [2, 3, 3, 5]); assert.deepEqual(J(pic('money').pics), [4, 3, 3, 2]);
  const t = run('tally-table', { mode: 'data', ds: 'towns' }).d; assert.deepEqual(J(t.cnt), [9, 6, 4, 6, 5]);
  assert.deepEqual(J(run('tally-table', { mode: 'data', ds: 'city' }).d.cnt), [3, 6, 2, 5]);
  { const t15 = run('tally-table', { mode: 'num', n: 15 }).d; assert.deepEqual([t15.b, t15.r], [3, 0]); }
  const bar = (ds) => run('bar-graph', { ds }).d;
  assert.equal(bar('sport').tot, 16); assert.equal(bar('books').tot, 14); assert.equal(bar('sport').mn, 1); assert.equal(bar('tv').mx, 2);
});

test('الوحدة الأولى: الأعداد الكبيرة بقيم الكتاب', () => {
  assert.equal(G.words(253758), 'مئتان وثلاثة وخمسون ألفاً وسبعمئة وثمانية وخمسون');
  assert.equal(G.words(324597168), 'ثلاثمئة وأربعة وعشرون مليوناً وخمسمئة وسبعة وتسعون ألفاً ومئة وثمانية وستون');
  assert.equal(G.words(1000000), 'مليون'); assert.equal(G.words(100000), 'مئة ألف'); assert.equal(G.words(1000000000), 'مليار');
  assert.equal(G.words(2058238), 'مليونان وثمانية وخمسون ألفاً ومئتان وثمانية وثلاثون');
  assert.equal(G.words(4250000000), 'أربعة مليارات ومئتان وخمسون مليوناً');
  const pv = (o) => run('place-value', o).d;
  assert.equal(pv({ ex: 'odo' }).v, 100000); assert.equal(pv({ ex: 'space' }).v, 1000000); assert.equal(pv({ ex: 'space' }).L, 7); assert.equal(pv({ ex: 'bil' }).v, 1000000000); assert.equal(pv({ ex: 'bil' }).L, 10);
  assert.equal(pv({ ex: 'v1' }).pv, 70); assert.equal(pv({ ex: 'v2' }).pv, 0); assert.equal(pv({ ex: 'v3' }).pv, 60000); assert.equal(pv({ ex: 'red2' }).pv, 60000); assert.equal(pv({ ex: 'red1' }).pv, 30000);
  assert.deepEqual(J(pv({ ex: 'x1' }).parts), [30000, 8000, 500, 6]); assert.equal(pv({ ex: 'sat' }).L, 10);
  assert.equal(G.digitsOnly('٢٥٣ ٧٥٨'), '253758');
  const cmp = (ex) => run('compare-numbers', { mode: 'cmp', ex }).d;
  assert.equal(cmp('stud').k, -1); assert.equal(cmp('stud').idx, 5); assert.equal(cmp('c1').byLen, true); assert.equal(cmp('c2').idx, 0); assert.equal(cmp('c4').k, 1);
  assert.equal(cmp('r3').k, -1); assert.equal(cmp('r4').k, 1);
  assert.deepEqual(J(run('compare-numbers', { mode: 'ord', list: 'pal' }).d.sorted.map((x) => x[1])), [5460000, 4750000, 1470000, 685000]);
  assert.deepEqual(J(run('compare-numbers', { mode: 'ord', list: 'asc' }).d.sorted.map((x) => x[1])), [1235680, 2369164, 4682351]);
});

test('الوحدة الثانية: الجمع والطرح والتقريب بقيم الكتاب', () => {
  const as = (ex) => run('add-sub-millions', { ex }).d.res;
  assert.equal(as('mart'), 6065); assert.equal(as('land'), 2864879); assert.equal(as('pop'), 8914479); assert.equal(as('three'), 9978979); assert.equal(as('c3'), 9564029);
  assert.equal(as('china'), 2230841); assert.equal(as('stone'), 1331111); assert.equal(as('social'), 1443207); assert.equal(as('vis1'), 153291); assert.equal(as('vis2'), 1890019);
  assert.equal(as('chk'), 71362); assert.equal(as('fridge'), 660000); assert.equal(as('miss'), 1015429); assert.equal(as('cards'), 864197); assert.equal(as('wp'), 946017);
  assert.ok(run('add-sub-millions', { op: 'sub', a: '5', b: '9' }).d.bad);
  // كل منازل الطرح تعطي الناتج نفسه
  for (const ex of ['social', 'fridge', 'cards', 'miss']) { const d = run('add-sub-millions', { ex }).d; const v = d.r.cols.reduce((t, c) => t + c.w * Math.pow(10, c.i), 0); assert.equal(v, d.res, ex); }
  const rd = (ex) => run('rounding', { ex }).d;
  assert.equal(rd('fans').R.r, 9000000); assert.equal(rd('prof').R.r, 8000000); assert.equal(rd('t1c').R.r, 2200000); assert.equal(rd('t1a').R.r, 2155000);
  assert.equal(rd('t2b').R.r, 7810000); assert.equal(rd('omar').R.r, 5123000); assert.equal(rd('gaza').R.r, 40); assert.equal(rd('r1').R.r, 5000000); assert.equal(rd('r2').R.r, 7000000);
  assert.equal(rd('e1').estv, 6000000); assert.equal(rd('e2').estv, 3000000);
});

test('الوحدة الثالثة: الضرب والقسمة بقيم الكتاب', () => {
  const mu = (ex) => run('multiply-blocks', { ex }).d;
  assert.equal(mu('caps').prod, 63); assert.equal(mu('worm').prod, 42); assert.equal(mu('worm').c1, 1); assert.equal(mu('stick').prod, 484); assert.equal(mu('don').prod, 375);
  assert.equal(mu('m6015').prod, 3005); assert.equal(mu('shoe2').prod, 3360); assert.equal(mu('sheep2').prod, 1268); assert.equal(mu('m419').prod, 369); assert.equal(mu('d169').prod, 144);
  assert.equal(mu('e1').estv, 240); assert.equal(mu('e2').estv, 300); assert.equal(mu('e3').estv, 900); assert.equal(mu('e4').estv, 9000); assert.equal(mu('e5').estv, 4000); assert.equal(mu('e6').estv, 2700);
  const ds = (ex) => { const d = run('division-sharing', { ex }).d; return [d.q, d.r]; };
  assert.deepEqual(ds('o54'), [6, 0]); assert.deepEqual(ds('bk46'), [23, 0]); assert.deepEqual(ds('l90'), [15, 0]); assert.deepEqual(ds('l68'), [17, 0]); assert.deepEqual(ds('tree'), [14, 0]);
  assert.deepEqual(ds('t5'), [6, 1]); assert.deepEqual(ds('t6'), [5, 1]); assert.deepEqual(ds('r75'), [18, 3]); assert.deepEqual(ds('fam32'), [4, 0]);
  const ld = run('long-division', { ex: 'cow' }).d; assert.equal(ld.m.prod, 972);
  assert.deepEqual([run('long-division', { ex: 'l39' }).d.q, run('long-division', { ex: 'pen' }).d.q], [13, 16]);
});
