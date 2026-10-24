// اختبارات رياضيات الصف الأول (الجزء الأول كاملاً: الوحدات الست) — التشغيل: node --test tests/
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
  'subjects/g4-math/common.js', 'subjects/g1-math/common.js', 'subjects/g1-math/u1-numbers.js', 'subjects/g1-math/u2-compare.js', 'subjects/g1-math/u3-addition.js', 'subjects/g1-math/u4-subtraction.js', 'subjects/g1-math/u5-teens.js', 'subjects/g1-math/u6-measure.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
}
const ML = ctx.ML, G = ML.m1;
const SIMS = ML.sims.filter((s) => s.subject === 'g1-math');
const sim = (id) => SIMS.find((s) => s.id === id);
const defaults = (s) => Object.fromEntries(s.params.map((q) => [q.key, q.value]));
const run = (id, over, st) => { const s = sim(id); const p = Object.assign(defaults(s), over || {}); if (s.onSet) for (const k of Object.keys(over || {})) s.onSet(p, k); Object.assign(p, over || {}); const d = s.compute(p); d.st = st || (s.initState ? s.initState(p) : null); return { s, p, d }; };
const J = (x) => JSON.parse(JSON.stringify(x));

test('الصف الأول: مادة الرياضيات بوحداتها الست', () => {
  assert.equal(ML.grades[0].id, 'g1');
  assert.deepEqual(J(ML.grades[0].subjects), ['g1-math']);
  const u = ML.subjects['g1-math'].units;
  assert.deepEqual(J(u.map((x) => x.n)), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(J(u.map((x) => x.pages)), ['2–30', '31–55', '56–72', '73–86', '87–102', '103–111']);
  assert.equal(ML.unitOf(sim('clock-hours')).n, 6);
  assert.ok(ML.unitName('g1-math', 4).includes('الطرح'));
  assert.equal(ML.simHref(sim('ordinal')), '#/g1/math/sim/ordinal');
  assert.equal(ML.unitOf(sim('order-stairs')).n, 2);
  assert.ok(ML.unitName('g1-math', 2).includes('مقارنة الأعداد'));
});

test('21 محاكاة، لكل منها مصدر وصفحة وتعلّم وتحديات ومساعد', () => {
  assert.equal(SIMS.length, 21);
  for (const s of SIMS) {
    assert.ok(s.page >= 2 && s.page <= 111, s.id + ' page');
    assert.ok([1, 2, 3, 4, 5, 6].includes(s.unit) && s.lesson && s.titleAr && s.titleEn && s.book && s.summary, s.id + ' meta');
    assert.ok(s.challenges.length >= 3 && s.tutor.length >= 2 && s.learn.length >= 2, s.id + ' content');
    const { p, d } = run(s.id);
    const res = s.results(p, d); assert.ok(Array.isArray(res) && res.length >= 2, s.id + ' results');
    for (const r of res) { assert.ok(!/NaN|undefined|\[object/.test(String(r[1])), s.id + ' result ' + r[1]); assert.ok(!/[_\\]/.test(r[0]), s.id + ' label ' + r[0]); }
    for (const x of s.steps(p, d)) assert.ok(!/NaN|undefined/.test(x), s.id + ' step ' + x);
    assert.ok(!/NaN|undefined/.test(s.live(p, d)), s.id + ' live');
    for (const t of s.tutor) assert.ok(typeof t.a(p, d) === 'string' && !/NaN|undefined/.test(t.a(p, d)), s.id + ' tutor');
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
  'number-intro': [[{ ex: '3-1' }, { counted: [0, 1, 2] }], [{ ex: '8-0' }, { counted: [0, 1, 2, 3, 4, 5, 6, 7] }], { ex: '6-0', plus: true }],
  'count-match': [[{ ex: 'p11e' }, { pick: 3, marks: [] }], [{ ex: 'p27a' }, { pick: 9, marks: [] }], null],
  'complete-drawing': [[{ ex: 'p28a' }, { add: 5 }], [{ ex: 'p28c' }, { add: 5 }], [{ ex: 'p18c' }, { add: 2 }]],
  'split-groups': [{ k: 5 }, { ex: 'ba8', k: 4 }, { ex: 'tr7', k: 5 }],
  'number-line-9': [[{ mode: 'miss' }, { vals: { 2: 2, 4: 4, 5: 5, 7: 7, 8: 8 }, city: null }], [{ mode: 'temp' }, { vals: {}, city: 3 }], [{ mode: 'seq' }, { vals: { 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8 }, city: null }]],
  'compare-groups': [[{}, { pick: 'gt' }], [{ ex: 'rabbits' }, { pick: 'lt' }], [{ mode: 'nums', nx: 'n10' }, { pick: 'lt' }]],
  'order-stairs': [[{}, { seq: [2, 5, 8, 9] }], [{ ex: 'd3' }, { seq: [7, 5, 4, 1] }], [{ ex: 'r38' }, { seq: [3, 4, 5, 6, 7, 8] }]],
  'next-previous': [[{}, { pick: 8 }], [{ ex: 'v9' }, { pick: 8 }], [{ ex: 'r3' }, { pick: 2 }]],
  ordinal: [[{}, { pick: 1 }], [{ ex: 'duck' }, { pick: 3 }], [{ ex: 'kite5' }, { pick: 4 }]],
  zero: [[{ ex: 'f0' }, { taken: 0, pick: 0 }], [{ ex: 'f3' }, { taken: 3, pick: 0 }], [{ ex: 'tc' }, { taken: 0, pick: 4 }]],
  'number-bonds': [[{ n: '5' }, { k: 0, found: [5, 4, 3, 2, 1, 0], pick: null }], [{ n: '4' }, { k: 2, found: [2], pick: null }], [{ mode: 'tree', tr: 't3' }, { k: 0, found: [], pick: 6 }]],
  'add-within-9': [[{ ex: 'cake' }, { joined: true, pick: 7, sign: null }], [{ ex: 'bal' }, { joined: false, pick: 4, sign: null }], [{ mode: 'cmp', cx: 'c2' }, { joined: false, pick: null, sign: 'gt' }]],
  'subtract-within-9': [[{ ex: 'straw' }, { crossed: [0, 1, 2], pick: 4 }], [{ ex: 'hen' }, { crossed: [0, 1, 2], pick: 3 }], [{ ex: 'lubna' }, { crossed: [], pick: 0 }]],
  'fact-family': [[{ ex: 'f1' }, { gone: null, swap: false, seen: ['A', 'C', 'D'], sel: 0, vals: {} }], [{ mode: 'code', pz: 'q' }, { gone: null, swap: false, seen: [], sel: 0, vals: { 0: 0, 1: 7, 2: 9, 3: 1, 4: 3 } }], [{ mode: 'code', pz: 'n' }, { gone: null, swap: false, seen: [], sel: 0, vals: { 0: 5, 1: 0, 2: 4, 3: 7, 4: 3 } }]],
  'make-ten': [[{ dr: 'c3' }, { k: 0, found: [], sel: [], add: 7 }], [{ mode: 'cards' }, { k: 0, found: [], sel: [0, 1, 2, 4, 5, 7], add: 0 }], [{ mode: 'sticks' }, { k: 5, found: [5], sel: [], add: 0 }]],
  'tens-ones': [[{ ex: 'n13' }, { t: 1, o: 3 }], [{ ex: 'n20' }, { t: 2, o: 0 }], [{ ex: 't10' }, { t: 1, o: 0 }]],
  'number-line-20': [[{ mode: 'loc', who: 'rabbit' }, { sel: 0, vals: {}, pick: 9 }], [{ ex: 'p98' }, { sel: 0, vals: { 0: 4, 1: 5, 2: 13, 3: 14, 4: 19, 5: 20 }, pick: null }], [{ ex: 'p100' }, { sel: 0, vals: { 0: 5, 1: 10, 2: 13, 3: 19 }, pick: null }]],
  'count-compare-20': [[{ q: 'q1' }, { sign: 'lt', bar: null, tapped: [], cart: [] }], [{ mode: 'shapes' }, { sign: null, bar: null, tapped: [...Array(20).keys()], cart: [] }], [{ mode: 'shop' }, { sign: null, bar: null, tapped: [], cart: [1, 3] }]],
  length: [[{ q: 'tall' }, { pick: 'samir', n: 0 }], [{ q: 'short' }, { pick: 2, n: 0 }], [{ q: 'clip' }, { pick: null, n: 3 }]],
  'week-days': [[{ wq: 'prevWed' }, { pick: 3, sel: 1, vals: {}, cells: [] }], [{ mode: 'train' }, { pick: null, sel: 1, vals: { 1: 1, 2: 2, 4: 4, 5: 5 }, cells: [] }], [{ mode: 'table', tq: 'math' }, { pick: null, sel: 1, vals: {}, cells: [0, 1, 7, 15, 18, 24] }]],
  'clock-hours': [[{ rd: 'r1' }, { pick: 3, hour: null }], [{ mode: 'set', sd: 'wake' }, { pick: null, hour: 6 }], [{ mode: 'set', sd: 'a12' }, { pick: null, hour: 1 }]]
};
test('التحديات قابلة للحل وغير محلولة في حالتها الابتدائية', () => {
  for (const s of SIMS) {
    const sol = SOLVE[s.id]; assert.ok(sol && sol.length === s.challenges.length, s.id + ' has solutions for all challenges');
    s.challenges.forEach((ch, i) => {
      const init = run(s.id, ch.init); assert.ok(!ch.check(init.p, init.d), `${s.id} #${i + 1} solved at init`);
      let x = sol[i];
      if (x === null) { const r0 = run(s.id, Object.assign({}, ch.init, { mode: 'mark', set: 'm2' })); x = [{ mode: 'mark', set: 'm2' }, { pick: null, marks: J(r0.d.good) }]; }
      const over = Array.isArray(x) ? x[0] : x; const st = Array.isArray(x) && x[1] ? x[1] : null;
      const r = run(s.id, Object.assign({}, ch.init, over), st); assert.ok(ch.check(r.p, r.d), `${s.id} #${i + 1} not solved by ${JSON.stringify(x)}`);
    });
  }
});

test('الوحدة الأولى: قيم الكتاب', () => {
  assert.equal(G.WORD[7], 'سبعة'); assert.equal(G.ORD_M[9], 'التاسع'); assert.equal(G.ORD_F[3], 'الثالثة');
  // تقسيمات الكتاب: مجموع العددين هو عدد المجموعة
  const sp = (ex, k) => { const d = run('split-groups', { ex, k }).d; return [d.n, d.a, d.b, d.hit]; };
  assert.deepEqual(J(sp('o9', 5)), [9, 5, 4, true]); assert.deepEqual(J(sp('o9', 4)), [9, 4, 5, true]); assert.deepEqual(J(sp('o9', 3)), [9, 3, 6, false]);
  assert.deepEqual(J(sp('ba8', 4)), [8, 4, 4, true]); assert.deepEqual(J(sp('tr7', 2)), [7, 2, 5, true]);
  // جدول الحرارة: الأعلى رفح ٨ والأقل رام الله ٤
  const t = run('number-line-9', { mode: 'temp' }).d; assert.deepEqual(J(t.hi), ['رفح', 8]); assert.deepEqual(J(t.lo), ['رام الله', 4]);
  assert.deepEqual(J(run('number-line-9', { mode: 'miss' }).d.missing), [2, 4, 5, 7, 8]);
  assert.equal(run('complete-drawing', { ex: 'p28c' }).d.target, 9);
  assert.equal(run('count-match', { ex: 'p11e' }).d.n, 3);
});

test('الوحدة الثانية: قيم الكتاب', () => {
  const cg = (o) => run('compare-groups', o).d;
  assert.equal(cg({ ex: 'chairs' }).k, 'gt'); assert.equal(cg({ ex: 'rabbits' }).k, 'lt');
  assert.deepEqual(J([cg({ mode: 'nums', nx: 'n10' }).a, cg({ mode: 'nums', nx: 'n10' }).b]), [6, 8]);
  assert.deepEqual(J(run('order-stairs', { ex: 'a3' }).d.sorted), [2, 5, 8, 9]);
  assert.deepEqual(J(run('order-stairs', { ex: 'd1' }).d.sorted), [9, 7, 3]);
  assert.equal(run('next-previous', { ex: 'x7' }).d.ans, 8); assert.equal(run('next-previous', { ex: 'kids' }).d.ans, 5); assert.equal(run('next-previous', { ex: 'pen' }).d.ans, 5);
  const o = run('ordinal', { ex: 't3' }); assert.equal(o.d.target, 3);
  assert.ok(o.s.results(o.p, Object.assign(o.d, { st: { pick: 2 } })).some((r) => /لبنى/.test(String(r[1])) || /الثالثة/.test(String(r[1]))));
});

test('الوحدتان الثالثة والرابعة: الجمع والطرح بقيم الكتاب', () => {
  const ad = (o) => run('add-within-9', o).d;
  assert.equal(ad({ ex: 'cake' }).s, 7); assert.equal(ad({ ex: 'bal' }).ans, 4); assert.equal(ad({ ex: 'umb' }).s, 7); assert.equal(ad({ ex: 'olive' }).s, 5); assert.equal(ad({ ex: 'carr' }).s, 2);
  assert.deepEqual(J(['c1', 'c2', 'c3', 'c4', 'c5', 'c6'].map((cx) => ad({ mode: 'cmp', cx }).k)), ['eq', 'gt', 'lt', 'gt', 'gt', 'lt']);
  const sb = (ex) => { const d = run('subtract-within-9', { ex }).d; return [d.a, d.b, d.r]; };
  assert.deepEqual(sb('glass'), [5, 3, 2]); assert.deepEqual(sb('straw'), [7, 3, 4]); assert.deepEqual(sb('hen'), [4, 3, 1]); assert.deepEqual(sb('fish'), [7, 5, 2]); assert.deepEqual(sb('eggp'), [6, 6, 0]); assert.deepEqual(sb('pen8'), [8, 0, 8]); assert.deepEqual(sb('sally'), [8, 3, 5]); assert.deepEqual(sb('bag'), [9, 6, 3]);
  const ff = run('fact-family', { ex: 'rose' }).d; assert.deepEqual([ff.w, ff.x, ff.y], [9, 6, 3]);
  // مراجعة 4 ص 85: القدس ونابلس
  const code = (pz) => { const d = run('fact-family', { mode: 'code', pz }).d; return d.ans.map((v) => '\u0627\u062f\u064a\u0633\u0628\u0646\u062d\u0644\u0631\u0642'[v]).join(''); };
  assert.equal(code('q'), 'القدس'); assert.equal(code('n'), 'نابلس');
  assert.equal(run('number-bonds', { mode: 'tree', tr: 't5' }).d.ans, 9); assert.equal(run('number-bonds', { mode: 'tree', tr: 't6' }).d.ans, 3);
  assert.equal(run('zero', { ex: 'tc' }).d.n, 4);
});

test('الوحدتان الخامسة والسادسة: الأعداد حتى ٢٠ والقياس بقيم الكتاب', () => {
  assert.deepEqual(J(run('make-ten', { mode: 'cards' }).d.good), [0, 1, 2, 4, 5, 7]);
  const tv = (ex) => { const d = run('tens-ones', { ex }).d; return [d.tt, d.to, d.p ? 0 : 0]; };
  assert.deepEqual(tv('n17').slice(0, 2), [1, 7]); assert.deepEqual(tv('n20').slice(0, 2), [2, 0]);
  assert.equal(run('tens-ones', { ex: 'n14' }).p.rep, 'blocks');
  const cc = run('count-compare-20', { mode: 'shapes' }).d.cnt; assert.deepEqual(J(cc), { g: 8, y: 6, r: 6 });
  assert.deepEqual(J(['q1', 'q2', 'q3', 'q4'].map((q) => run('count-compare-20', { q }).d.k)), ['lt', 'gt', 'lt', 'eq']);
  assert.equal(run('number-line-20', { mode: 'loc', who: 'car' }).d.ans, 4);
  assert.equal(run('length', { q: 'clip' }).d.ans, 3);
  assert.equal(run('week-days', { mode: 'table', tq: 'math' }).d.good.length, 6);
  assert.deepEqual(J(run('week-days', { mode: 'table', tq: 'arWed' }).d.good), [19, 20]);
  assert.deepEqual(J(['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'm1', 'm2', 'm3', 'm4'].map((rd) => run('clock-hours', { rd }).d.ans)), [3, 1, 10, 9, 7, 4, 2, 12, 11, 9, 7, 5]);
});
