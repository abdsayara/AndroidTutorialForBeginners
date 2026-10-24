// اختبارات رياضيات الصف الأول (الجزء الأول: الوحدتان الأولى والثانية) — التشغيل: node --test tests/
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
  'subjects/g4-math/common.js', 'subjects/g1-math/common.js', 'subjects/g1-math/u1-numbers.js', 'subjects/g1-math/u2-compare.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
}
const ML = ctx.ML, G = ML.m1;
const SIMS = ML.sims.filter((s) => s.subject === 'g1-math');
const sim = (id) => SIMS.find((s) => s.id === id);
const defaults = (s) => Object.fromEntries(s.params.map((q) => [q.key, q.value]));
const run = (id, over, st) => { const s = sim(id); const p = Object.assign(defaults(s), over || {}); if (s.onSet) for (const k of Object.keys(over || {})) s.onSet(p, k); Object.assign(p, over || {}); const d = s.compute(p); d.st = st || (s.initState ? s.initState(p) : null); return { s, p, d }; };
const J = (x) => JSON.parse(JSON.stringify(x));

test('الصف الأول: مادة الرياضيات بوحدتيها', () => {
  assert.equal(ML.grades[0].id, 'g1');
  assert.deepEqual(J(ML.grades[0].subjects), ['g1-math']);
  const u = ML.subjects['g1-math'].units;
  assert.deepEqual(J(u.map((x) => x.n)), [1, 2]);
  assert.deepEqual(J(u.map((x) => x.pages)), ['2–30', '31–55']);
  assert.equal(ML.simHref(sim('ordinal')), '#/g1/math/sim/ordinal');
  assert.equal(ML.unitOf(sim('order-stairs')).n, 2);
  assert.ok(ML.unitName('g1-math', 2).includes('مقارنة الأعداد'));
});

test('9 محاكيات، لكل منها مصدر وصفحة وتعلّم وتحديات ومساعد', () => {
  assert.equal(SIMS.length, 9);
  for (const s of SIMS) {
    assert.ok(s.page >= 2 && s.page <= 55, s.id + ' page');
    assert.ok([1, 2].includes(s.unit) && s.lesson && s.titleAr && s.titleEn && s.book && s.summary, s.id + ' meta');
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
  ordinal: [[{}, { pick: 1 }], [{ ex: 'duck' }, { pick: 3 }], [{ ex: 'kite5' }, { pick: 4 }]]
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
