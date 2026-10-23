// اختبارات المهارات الرقمية (العاشر) — التشغيل: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(dir, '..');
const ctx = vm.createContext({ console, performance, BigInt });
for (const f of ['core/math.js', 'core/notation.js', 'core/fx.js', 'core/plot.js', 'core/tutor.js', 'core/ui.js', 'subjects/g10-digital/pyrun.js', 'subjects/g10-digital/common.js', 'subjects/g10-digital/l1-algorithms.js', 'subjects/g10-digital/l2-variables.js', 'subjects/g10-digital/l3-conditions.js', 'subjects/g10-digital/l4-loops.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
}
const ML = ctx.ML, PY = ML.py, D = ML.ds10;
const SIMS = ML.sims.filter((s) => s.subject === 'g10-digital');
const sim = (id) => SIMS.find((s) => s.id === id);
const defaults = (s) => Object.fromEntries(s.params.map((q) => [q.key, q.value]));
const run = (id, over) => { const s = sim(id); const p = Object.assign(defaults(s), over || {}); if (s.onSet) { for (const k of Object.keys(over || {})) s.onSet(p, k); s.onSet(p, null); } Object.assign(p, over || {}); return { s, p, d: s.compute(p) }; };
const J = (x) => JSON.parse(JSON.stringify(x));
const TRACERS = ['variables-trace', 'conditions-trace', 'loops-trace'];

test('المادة مسجّلة في الصف العاشر بخمسة أقسام، وكتابها لاتيني الرموز', () => {
  assert.ok(J(ML.grades.find((g) => g.id === 'g10').subjects).includes('g10-digital'));
  const u = ML.subjects['g10-digital'].units; assert.equal(u.length, 5);
  assert.deepEqual(J(u.map((x) => x.pages)), ['38–43', '44–57', '58–66', '67–75', '76–77']);
  assert.ok(ML.isLatinBook({ subject: 'g10-digital' }));
  assert.equal(SIMS.length, 7);
  for (const s of SIMS) {
    assert.ok(s.page >= 38 && s.page <= 77 && s.titleAr && s.titleEn && s.book && s.summary, s.id);
    assert.ok(s.challenges.length >= 2 && s.tutor.length >= 2 && s.learn.length >= 2, s.id + ' content');
    const { p, d } = run(s.id); const res = s.results(p, d); assert.ok(res.length >= 2);
    for (const r of res) assert.ok(!/NaN|undefined|\[object/.test(String(r[1])), s.id + ' ' + r[1]);
  }
});

// تشغيل الكود في CPython الحقيقي مع صدى المدخلات كما يظهر في المحاكاة
function cpython(code, inputs) {
  const pre = 'import builtins\n_in = builtins.input\ndef input(p=""):\n    v = _in(p)\n    print(v)\n    return v\n';
  const r = spawnSync('python3', ['-I', '-c', pre + code], { input: inputs.join('\n') + (inputs.length ? '\n' : ''), encoding: 'utf8', timeout: 5000 });
  const err = (r.stderr || '').trim().split('\n').pop() || '';
  return { out: r.stdout, err: err ? err.split(':')[0] : null, timeout: !!r.error };
}
test('كل برامج الكتاب في محاكيات التتبع: المخرجات ونوع الخطأ مطابقة لـ CPython', () => {
  let n = 0;
  for (const id of TRACERS) {
    const s = sim(id); const progs = s.params.find((q) => q.key === 'prog').options.map((o) => o[0]);
    for (const k of progs) {
      const { p, d } = run(id, { prog: k });
      const code = D.codeOf[id](p); const inputs = (p.inp && d.g.inputs !== undefined ? p.inp.split('|').map((x) => x.trim()) : []);
      assert.ok(d.n >= 1, id + '/' + k + ' has steps');
      if (d.R.error && d.R.error.kind === 'Limit') { assert.ok(/while/.test(code), k + ' infinite loop only for while'); continue; }
      const py = cpython(code, inputs); n++;
      if (d.R.error) {
        assert.equal(d.R.error.kind, py.err, id + '/' + k + ' error kind');
        const ok = d.R.out.split(/Traceback|  File "main.py"/)[0]; assert.ok(py.out.startsWith(ok), id + '/' + k + ' output before error');
      } else {
        assert.equal(py.err, null, id + '/' + k + ' python error ' + py.err);
        assert.equal(d.R.out, py.out, id + '/' + k + ' output');
      }
      if (d.g.expect !== undefined) assert.equal(d.R.out.replace(/\n$/, ''), d.g.expect, id + '/' + k + ' book value');
    }
  }
  assert.ok(n >= 60, 'programs compared: ' + n);
});

test('برامج بقيم مختلفة (المنزلق والمدخلات) تطابق CPython', () => {
  const cases = [['conditions-trace', { prog: 'act1', v1: 95 }], ['conditions-trace', { prog: 'elif', v1: 59 }], ['conditions-trace', { prog: 'ex4', v1: 180, v2: 120 }], ['conditions-trace', { prog: 'ex4', v1: 170 }], ['conditions-trace', { prog: 'ex5', inp: '65|92|y' }], ['conditions-trace', { prog: 'ex5', inp: '85|60|y' }], ['conditions-trace', { prog: 'ex5', inp: '85|85|n' }], ['conditions-trace', { prog: 'tickets', inp: '4|y' }], ['conditions-trace', { prog: 'q4', inp: '-50' }], ['conditions-trace', { prog: 'act6', v1: 6 }], ['conditions-trace', { prog: 'input', inp: 'أحمد|30' }], ['loops-trace', { prog: 'password', inp: 'a|b|c|python123' }], ['loops-trace', { prog: 'counter', v1: 0 }], ['loops-trace', { prog: 'sum', v1: 11 }], ['variables-trace', { prog: 'months', v1: 150 }], ['variables-trace', { prog: 'act11', v1: 11 }], ['variables-trace', { prog: 'and', v1: 15 }]];
  for (const [id, over] of cases) {
    const { p, d } = run(id, over); const code = D.codeOf[id](p); const inputs = d.g.inputs !== undefined ? p.inp.split('|').map((x) => x.trim()) : [];
    const py = cpython(code, inputs); assert.equal(py.err, null, JSON.stringify(over)); assert.equal(d.R.out, py.out, JSON.stringify(over));
  }
  assert.equal(run('loops-trace', { prog: 'sum', v1: 11 }).d.R.out.trim(), '55');
});

test('قيم الكتاب: جداول التتبع والأخطاء', () => {
  // جدول تتبع ص 47
  let R = run('variables-trace', { prog: 'trace47' }).d.R; assert.deepEqual(J(R.steps[2].vars), [['x', 'int', '10'], ['y', 'int', '10']]); assert.equal(R.out, '20\n');
  // التطبيق المتكامل ص 54: subtotal و tax عند السطرين 8 و 9
  R = run('variables-trace', { prog: 'bill' }).d.R; const v = Object.fromEntries(R.steps[R.steps.length - 1].vars.map((x) => [x[0], x[2]]));
  assert.equal(v.subtotal, '95'); assert.equal(v.tax, '14.25');
  R = run('variables-trace', { prog: 'billno' }).d.R; assert.ok(/109.25/.test(R.out));
  // جدول تتبع لشرط متعدد ص 60: ثلاث مقارنات ثم طباعة C
  R = run('conditions-trace', { prog: 'trace60' }).d.R; assert.deepEqual(J(R.steps.filter((s) => s.kind === 'cond').map((s) => s.cond)), [false, false, true]);
  // جدول تتبع كلمة المرور ص 70: الشرط يُفحص 3 مرات (True، True، False)
  R = run('loops-trace', { prog: 'password' }).d.R; assert.deepEqual(J(R.steps.filter((s) => s.kind === 'loop').map((s) => s.cond)), [true, true, false]);
  // جدول تتبع الحلقة ص 71: total بعد كل دورة
  R = run('loops-trace', { prog: 'sum' }).d.R; assert.deepEqual(J(R.steps.filter((s) => s.changed && s.changed[0] === 'total').map((s) => s.vars.find((x) => x[0] === 'total')[2])), ['0', '1', '3', '6', '10', '15']);
  // التكرار المتداخل 12 مرة
  assert.equal(run('loops-trace', { prog: 'nest12' }).d.R.out.trim().split('\n').length, 12);
  // الأخطاء المقصودة
  assert.equal(run('variables-trace', { prog: 'act6' }).d.R.error.kind, 'TypeError');
  assert.equal(run('conditions-trace', { prog: 'act4' }).d.R.error.kind, 'SyntaxError');
  assert.equal(run('conditions-trace', { prog: 'indentBad' }).d.R.error.kind, 'IndentationError');
  assert.equal(run('conditions-trace', { prog: 'act7' }).d.R.error.kind, 'TypeError');
  assert.equal(run('variables-trace', { prog: 'zero' }).d.R.error.kind, 'ZeroDivisionError');
  assert.equal(run('loops-trace', { prog: 'forever' }).d.R.error.kind, 'Limit');
});

test('أولويات العمليات: خطوات جدول الكتاب ونشاط 9', () => {
  const st = (ex, x) => { const d = run('expression-lab', { ex, x }).d; return { steps: J(d.steps.map((s) => s.kind + ':' + s.expr + '=' + s.value)), res: PY.repr(d.res) }; };
  assert.deepEqual(st('t51').steps, ['الأقواس:2 + 4=6', 'الأس:3 ** 2=9', 'الضرب:6 * 5=30', 'الطرح:30 - 9=21']);
  assert.equal(st('ex3').res, '14'); assert.equal(st('a8a').res, '13'); assert.equal(st('a8c').res, '512'); assert.equal(st('a8d').res, '7'); assert.equal(st('q2').res, '-5'); assert.equal(st('quiz2').res, '10');
  assert.equal(st('l1', 15).res, 'True'); assert.equal(st('l2', 15).res, 'True'); assert.equal(st('l3', 15).res, 'False'); assert.equal(st('quiz4').res, 'True');
  assert.equal(st('p1b').res, '20'); assert.equal(st('p2b').res, '9'); assert.equal(st('p3b').res, '16'); assert.equal(st('ops').res, '15.5');
  // التعابير مطابقة لبايثون
  for (const k of ['ex3', 't51', 'a8a', 'a8c', 'a8d', 'q2', 'quiz2', 'p1a', 'p2a', 'p3a', 'ops']) {
    const d = run('expression-lab', { ex: k }).d; const src = d.e.src.replace(/^\w+ = /, '');
    const py = spawnSync('python3', ['-I', '-c', 'print(repr(' + src + '))'], { encoding: 'utf8' }).stdout.trim(); assert.equal(PY.repr(d.res), py, k);
  }
});

test('قواعد التسمية وأنواع البيانات (ص 46–47)', () => {
  const ok = (n) => PY.checkName(n).ok;
  for (const n of ['score', 'player_name', 'total_', 'age_2024', 'MAX_STUDENTS']) assert.ok(ok(n), n);
  for (const n of ['1score', 'my name', 'my-name', 'if', '5name', 'for', 'student-grade']) assert.ok(!ok(n), n);
  assert.equal(PY.checkName('my-name').fix, 'my_name'); assert.ok(PY.checkName('MAX_VALUE').constant);
  const t = (v) => PY.literalType(v).t;
  assert.equal(t('17'), 'int'); assert.equal(t('1.75'), 'float'); assert.equal(t('"ahmad"'), 'str'); assert.equal(t('True'), 'bool'); assert.equal(t('[85, 90, 78]'), 'list'); assert.equal(t('"17"'), 'str');
  const d = run('names-types', { pre: 't:1.75' }).d; assert.equal(d.mode, 'type'); assert.equal(d.r.t, 'float');
});

test('المخطط الانسيابي: المسارات والنواتج', () => {
  const out = (alg, over) => run('algorithm-flowchart', Object.assign({ alg }, over)).d.r.outs.join('|');
  assert.equal(out('avg', { a1: 80, a2: 75, a3: 90 }), 'Average = 81.667');
  assert.equal(out('bill', { a1: 200, a2: 20 }), 'الخصم = 40  ،  السعر النهائي = 160');
  assert.equal(out('c2f', { a1: 100 }), 'F = 212');
  assert.equal(out('pass', { a1: 50 }), 'ناجح'); assert.equal(out('pass', { a1: 49 }), 'راسب');
  assert.equal(out('temp', { a1: 39 }), 'مرتفعة'); assert.equal(out('temp', { a1: 38 }), 'طبيعية'); assert.equal(out('temp', { a1: 35 }), 'منخفضة');
  assert.equal(out('phone', { txt: '0599123456' }), 'رقم صالح'); assert.ok(/لا يبدأ/.test(out('phone', { txt: '0521234567' }))); assert.ok(/الطول/.test(out('phone', { txt: '05612' })));
  assert.equal(out('age', { a1: 2010, a2: 2026 }), 'العمر = 16 سنة');
  assert.ok(/يحق له الحصول/.test(out('license', { a1: 18, a2: 1 }))); assert.ok(/العمر/.test(out('license', { a1: 17, a2: 1 })));
});

test('أسئلة الوحدة: الإجابات الصحيحة مطابقة لتنفيذ الكود', () => {
  const ans = [1, 3, 2, 0, 1, 1, 1, 1, 1];
  D.QS.forEach((Q, i) => assert.equal(Q.a, ans[i], 'Q' + (i + 1)));
  assert.equal(PY.run(D.QS[1].code, []).out.trim(), '10');
  assert.equal(PY.run(D.QS[7].code, []).out.trim().split('\n').length, 6);
  assert.equal(PY.run(D.QS[5].code, []).out.trim().split('\n').length, 5);
  assert.equal(PY.run(D.QS[6].code, []).error.kind, 'Limit');
});

test('التحديات قابلة للحل وغير محلولة في حالتها الابتدائية', () => {
  const lastStep = (id, over) => { const r = run(id, over); return Object.assign({}, over, { step: (r.d.n || r.d.r.path.length) - 1 }); };
  const SOL = {
    'variables-trace': [lastStep('variables-trace', { prog: 'act1' }), { prog: 'act6', step: 1 }, lastStep('variables-trace', { prog: 'months', v1: 30 }), lastStep('variables-trace', { prog: 'act11', v1: 25 })],
    'conditions-trace': [lastStep('conditions-trace', { prog: 'act1', v1: 95 }), lastStep('conditions-trace', { prog: 'q4', inp: '-3' }), lastStep('conditions-trace', { prog: 'ex4', v1: 180, v2: 120 }), lastStep('conditions-trace', { prog: 'ex5', inp: '65|92|y' })],
    'loops-trace': [lastStep('loops-trace', { prog: 'password', inp: 'abc|123|python123' }), { prog: 'counter', v1: 0 }, { prog: 'sum', v1: 11 }, { prog: 'ex2', step: 8 }],
    'expression-lab': [{ ex: 'p1b' }, { ex: 'p3b' }, { ex: 'l2', x: 11 }],
    'names-types': [{ mode: 'name', pre: 'n:student-grade', txt: 'student_grade' }, { mode: 'type', pre: 't:17', txt: '2.5' }, { mode: 'name', pre: 'n:score', txt: 'MAX_VALUE' }],
    'algorithm-flowchart': [lastStep('algorithm-flowchart', { alg: 'pass', a1: 40 }), lastStep('algorithm-flowchart', { alg: 'temp', a1: 37 }), lastStep('algorithm-flowchart', { alg: 'phone', txt: '05612345' }), lastStep('algorithm-flowchart', { alg: 'bill', a1: 200, a2: 20 })],
    'unit-quiz': [{ q: 2, ans: 3 }, { q: 8, ans: 1 }]
  };
  for (const s of SIMS) {
    const sol = SOL[s.id]; assert.ok(sol && sol.length === s.challenges.length, s.id + ' solutions');
    s.challenges.forEach((ch, i) => {
      const a = run(s.id, ch.init); assert.ok(!ch.check(a.p, a.d), s.id + ' #' + (i + 1) + ' solved at init');
      const b = run(s.id, Object.assign({}, ch.init, sol[i])); assert.ok(ch.check(b.p, b.d), s.id + ' #' + (i + 1) + ' not solved by ' + JSON.stringify(sol[i]));
    });
  }
});
