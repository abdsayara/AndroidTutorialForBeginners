// اختبارات وضع «📖 الكتاب» (المهارات الرقمية — العاشر، الوحدة 2) — التشغيل: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(dir, '..');
const ctx = vm.createContext({ console, performance, BigInt });
for (const f of ['core/math.js', 'core/notation.js', 'core/fx.js', 'core/plot.js', 'core/tutor.js', 'core/ui.js', 'subjects/g10-digital/pyrun.js', 'subjects/g10-digital/common.js', 'subjects/g10-digital/l1-algorithms.js', 'subjects/g10-digital/l2-variables.js', 'subjects/g10-digital/l3-conditions.js', 'subjects/g10-digital/l4-loops.js', 'subjects/g10-digital/book.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
}
const ML = ctx.ML;
const B = ML.book['g10-digital'];
const sim = (id) => ML.sims.find((s) => s.subject === 'g10-digital' && s.id === id);
// كل ما يفتح المختبر في الصفحة: [الكتلة، open]
const opensOf = (pg) => pg.blocks.flatMap((b) => [b.open, b.code && b.code.open, b.predict && b.predict.open].filter(Boolean).map((o) => [b, o]));
// يحاكي applyOpen في الواجهة: يضبط القيم بالترتيب مع onSet، والخطوة الأخيرة
function apply(s, o) {
  const p = Object.fromEntries(s.params.map((q) => [q.key, q.value])); if (s.onSet) s.onSet(p, null);
  for (const k of Object.keys(o)) { if (k === 'sim' || o[k] === undefined) continue; p[k] = k === 'step' && o[k] === 'last' ? 1e6 : o[k]; if (s.onSet) s.onSet(p, k); }
  if (o.step === 'last') { const q = s.params.find((x) => x.key === 'step'); const n = (typeof q.stages === 'function' ? q.stages(p) : q.stages).length; p.step = Math.max(0, n - 1); }
  return { p, d: s.compute(p) };
}

test('صفحات الكتاب مرتبة، ولكل صفحة مختبر موجود ورقم صفحة من الوحدة', () => {
  assert.ok(B.pages.length >= 30);
  let last = 0;
  for (const pg of B.pages) {
    assert.ok(sim(pg.sim), pg.page + ': ' + pg.sim);
    assert.ok(pg.page >= 37 && pg.page <= 77, 'page ' + pg.page);
    assert.ok(pg.page > last, 'order ' + pg.page); last = pg.page;
    assert.ok(pg.title && pg.blocks.length >= 2, 'content ' + pg.page);
  }
  // كل محاكاة في الوحدة لها صفحة كتاب واحدة على الأقل
  for (const s of ML.sims.filter((x) => x.subject === 'g10-digital')) assert.ok(B.pages.some((pg) => pg.sim === s.id || opensOf(pg).some(([, o]) => o.sim === s.id)), s.id + ' has a book page');
});

test('كل «افتح في المختبر» يضبط قيماً موجودة فعلاً في أدوات تحكم المختبر', () => {
  let n = 0;
  for (const pg of B.pages) for (const [, o] of opensOf(pg)) {
    const s = sim(o.sim || pg.sim); assert.ok(s, 'sim ' + o.sim);
    for (const k of Object.keys(o)) {
      if (k === 'sim') continue;
      const q = s.params.find((x) => x.key === k); assert.ok(q, pg.page + ': ' + s.id + ' has param ' + k);
      if (k === 'step') { assert.equal(o[k], 'last'); continue; }
      if (q.type === 'select') { const opts = typeof q.options === 'function' ? q.options() : q.options; assert.ok(opts.some((x) => x[0] === o[k]), pg.page + ': ' + k + '=' + o[k]); }
      else if (!q.type) assert.ok(typeof o[k] === 'number' && o[k] >= q.min && o[k] <= q.max, pg.page + ': ' + k + ' in range');
    }
    const r = apply(s, o); assert.ok(r.d && !Number.isNaN(r.p.step), pg.page + ' compute');
    n++;
  }
  assert.ok(n >= 60, 'opens ' + n);
});

test('أسئلة «توقّع ثم اكتشف» و«سؤال تحقق»: الجواب ضمن الخيارات، والمختبر يطبع ما في الكتاب', () => {
  let outs = 0;
  for (const pg of B.pages) for (const b of pg.blocks) {
    const q = b.predict || b.check; if (!q) continue;
    assert.ok(Number.isInteger(q.a) && q.a >= 0 && q.a < q.opts.length && q.opts.length >= 2, pg.page + ': ' + q.q);
    if (b.predict) assert.ok(q.open, pg.page + ': predict opens the lab');
    if (b.predict && q.out !== undefined) {
      const s = sim(q.open.sim || pg.sim); const r = apply(s, q.open);
      assert.equal(r.d.R.out.replace(/\n$/, ''), q.out, pg.page + ': ' + q.q);
      assert.ok(r.d.last, pg.page + ': trace ends at the last step');
      outs++;
    }
  }
  assert.ok(outs >= 12, 'outputs checked ' + outs);
});

test('قيم توقّعات المخططات والتعابير كما يحسبها المختبر', () => {
  const alg = sim('algorithm-flowchart');
  const res = (o) => alg.results(apply(alg, o).p, apply(alg, o).d).map((r) => String(r[1])).join(' | ');
  assert.match(res({ alg: 'avg', a1: 80, a2: 75, a3: 90, step: 'last' }), /81\.667/);
  assert.match(res({ alg: 'bill', a1: 200, a2: 10, step: 'last' }), /180/);
  assert.match(res({ alg: 'pass', a1: 45, step: 'last' }), /راسب/);
  assert.match(res({ alg: 'temp', a1: 39, step: 'last' }), /مرتفعة/);
  const ex = sim('expression-lab'); const val = (k) => { const r = apply(ex, { ex: k }); return ex.results(r.p, r.d).map((x) => String(x[1])).join(' | '); };
  assert.match(val('ex3'), /14/); assert.match(val('a8c'), /512/); assert.match(val('p1b'), /20/); assert.match(val('t51'), /21/);
});
