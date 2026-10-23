/* المهارات الرقمية (العاشر) — الوحدة الثانية، الدرس الثاني: المتغيرات والمعاملات والمنطق (ص 44–57) */
(function (root) {
  'use strict';
  const ML = root.ML; const PY = ML.py; const D = ML.ds10;
  const U = 2;

  /* ======================= تتبع برامج الدرس ======================= */
  const PROGS = {
    act1: { name: 'نشاط 1: ماذا يطبع البرنامج؟', page: 44, expect: '140', code: `x = 100
y = 30
x = x - y
z = x * 2
print(z)`, q: 'في السطر الثالث: هل تغيّرت قيمة x؟ ما قيمتها الجديدة؟' },
    ex1: { name: 'مثال 1: المتغير وتحديث قيمته', page: 45, expect: '15', code: `x = 0        # إنشاء متغير اسمه x بقيمة تساوي 0
x = 10       # تحديث القيمة
x = x + 5    # تحديث القيمة مرة أخرى
print(x)     # النتيجة: 15` },
    ex2: { name: 'مثال 2: الثوابت', page: 45, code: `PI = 3.14159
MAX_STUDENTS = 30
SCHOOL_NAME = "مدرسة فلسطين"` },
    trace47: { name: 'جدول تتبع التنفيذ (ص 47) ونشاط 5', page: 47, expect: '20', code: `x = 5
y = 10
x = y
total = x + y
print(total)`, q: 'ماذا تلاحظ؟ بعد x = y نُسخت قيمة y إلى x، فأصبح المجموع 20 لا 15.' },
    act6: { name: 'نشاط 6: ما الخطأ في كل سطر؟ (كما في الكتاب)', page: 48, kind: 'buggy', code: `age = "17"
total = age + 3
height = "1.75"
bmi = 70 / height ** 2
is_pass = "True"` },
    act6fix: { name: 'نشاط 6: بعد التصحيح', page: 48, kind: 'model', code: `age = 17
total = age + 3
height = 1.75
bmi = 70 / height ** 2
is_pass = True
print(total, bmi, is_pass)` },
    act7: { name: 'نشاط 7: تتبّع واملأ جدول القيم', page: 49, expect: '5 1 25', code: `x = 5
y = 2
z = x ** y
y = x // 3
print(x, y, z)` },
    months: { name: 'باقي القسمة والقسمة الصحيحة: الشهور والزوجي', page: 49, v1: { def: 29, min: 0, max: 200 }, code: `# تحويل شهور إلى سنوات وشهور
total_months = {1}
years = total_months // 12
months = total_months % 12
print(years, "سنة و", months, "شهر")
# هل الرقم زوجي؟
num = 14
if num % 2 == 0:
    print("زوجي")` },
    ex3: { name: 'مثال 3: أولويات العمليات', page: 50, expect: '14', code: `result = 4 + 2 * 5
print(result)   # النتيجة: ؟` },
    act8: { name: 'نشاط 8: احسب كل تعبير خطوة بخطوة', page: 50, expect: '13 512 7', code: `a = 2 + 3 * 4 - 1
c = 2 ** 3 ** 2
d = 17 // 3 + 17 % 3
print(a, c, d)` },
    trace51: { name: 'جدول تتبع لتعبير رياضي (ص 51)', page: 51, expect: '21', code: `result = (2 + 4) * 5 - 3 ** 2
print(result)` },
    wallet: { name: 'مثال 4: تتبّع محفظة', page: 51, expect: '110', code: `wallet = 50
wallet += 20    # استلمت
wallet -= 15    # اشتريت
wallet *= 2     # ضاعف
print(wallet)   # 110` },
    act10: { name: 'نشاط 10: الصيغة المختصرة', page: 51, kind: 'model', expect: '1444', code: `score = 50
score += 10
score *= 2
score -= 5
score //= 3
score **= 2
print(score)` },
    hello: { name: 'برنامجك الأول hello.py في VS Code', page: 52, code: `# hello.py – برنامجك
print("مرحبا بك في عالم البرمجة الاحترافي!")
name = "أحمد"
print("أهلاً", name)` },
    and: { name: 'معامل AND (و)', page: 53, v1: { def: 18, min: 0, max: 100 }, code: `age = {1}
has_membership = True
can_enter = age > 16 and has_membership
print(can_enter)` },
    or: { name: 'معامل OR (أو): خصم للطلاب أو كبار السن', page: 53, expect: 'True', code: `# خصم للطلاب او كبار السن
is_student = True
is_senior = False
has_discount = is_student or is_senior
print(has_discount)` },
    not: { name: 'معامل NOT (النفي)', page: 54, expect: 'True', code: `is_logged_in = False
needs_login = not is_logged_in
print(needs_login)` },
    act11: { name: 'نشاط 11: True أم False؟', page: 54, v1: { def: 15, min: -50, max: 50 }, code: `x = {1}
print(x > 10 and x < 20)
print(x < 10 or x > 12)
print(not x == 15)` },
    bill: { name: 'تطبيق متكامل: فاتورة مطعم مع خصم العضوية', page: 54, code: `# المتغيرات الثوابت
TAX_RATE = 0.15       # ثابت
DISCOUNT = 0.10       # ثابت
food_price = 80       # متغير
drink_price = 15
is_member = True
amount_paid = 120

# العمليات الحسابية
subtotal = food_price + drink_price
tax = subtotal * TAX_RATE
total = subtotal + tax

# تطبيق خصم العضوية (إن وجد)
if is_member:
    total = total - (total * DISCOUNT)

# حساب الباقي
change = amount_paid - total

print("المجموع النهائي:", total)
print("الباقي:", change)` },
    billno: { name: 'التطبيق المتكامل بعد تغيير is_member إلى False (سؤال 3)', page: 55, code: `TAX_RATE = 0.15
DISCOUNT = 0.10
food_price = 80
drink_price = 15
is_member = False
amount_paid = 120
subtotal = food_price + drink_price
tax = subtotal * TAX_RATE
total = subtotal + tax
if is_member:
    total = total - (total * DISCOUNT)
change = amount_paid - total
print("المجموع النهائي:", total)
print("الباقي:", change)` },
    zero: { name: 'أخطاء وقت التشغيل: القسمة على صفر (ص 55)', page: 55, kind: 'model', code: `marks = 240
count = 0
average = marks / count
print(average)` },
    q2: { name: 'أسئلة الدرس 2: ما ناتج (3 // 8) - 2 * 4 + 3 ؟', page: 57, expect: '-5', code: `print((3 // 8) - 2 * 4 + 3)` },
    unitq1: { name: 'أسئلة الوحدة (السؤال الثاني 1): تتبّع واكتب الناتج', page: 77, expect: '8 5', code: `a = 5
b = 3
a += b
b = a - b
print(a, b)` }
  };
  const tr = D.tracer({
    id: 'variables-trace', unit: U, order: 1, lesson: 'الدرس الثاني', lessonTitle: 'المتغيرات والمعاملات والمنطق', page: 44,
    titleAr: 'تتبّع برامج المتغيرات والمعاملات خطوة بخطوة', titleEn: 'Tracing Variables & Operators', tags: 'متغير ثابت اسناد جدول تتبع معاملات حسابيه and or not فاتوره محفظه نوع بيانات خطا',
    formula: '\\text{المتغير = القيمة}\\qquad x\\ \\text{+=}\\ 5 \\;\\equiv\\; x = x + 5',
    book: 'المتغير هو اسم مكان محجوز مؤقتاً في ذاكرة الحاسوب تخزّن فيه قيمة قابلة للتغيير؛ الثابت قيمة لا تتغير وتُكتب بأحرف كبيرة',
    summary: 'كل سطر إسناد يضع قيمة جديدة في «صندوق» المتغير ويمحو القديمة. تتبّع الكود يعني تنفيذه ذهنياً سطراً سطراً وتسجيل قيم المتغيرات بعد كل سطر في جدول تتبع، كما في جداول الكتاب. وهنا يُنفَّذ الكود فعلاً وتُعرض الذاكرة والمخرجات بعد كل خطوة.',
    programs: PROGS,
    learn: [
      '**قصة الدرس (ص 44):** خسرت شركة Knight Capital 440 مليون دولار في 45 دقيقة بسبب متغير واحد (POWER_FLAG) استُخدم بمعنى جديد.',
      '**المتغير (ص 45):** اسم مكان محجوز مؤقتاً في ذاكرة الحاسوب تُخزّن فيه قيمة قابلة للتغيير. **الثابت:** قيمة يُفترض عدم تغييرها وتُكتب اصطلاحاً بأحرف كبيرة مثل {{PI = 3.14159}}.',
      '**أنواع البيانات (ص 47):** {{int}} عدد صحيح، {{float}} عدد عشري، {{str}} نص بين علامتي تنصيص، {{bool}} منطقي True/False، {{list}} قائمة.',
      '**المعاملات الحسابية (ص 48):** {{+ - * /}} و {{//}} القسمة الصحيحة و {{%}} باقي القسمة و {{**}} الأس؛ {{15 / 2 = 7.5}} و {{15 // 2 = 7}} و {{15 % 2 = 1}}.',
      '**المعاملات المنطقية (ص 53–54):** {{and}} صحيح فقط إذا تحقق الشرطان، {{or}} صحيح إذا تحقق أي منهما، {{not}} يعكس القيمة.',
      '**أنواع الأخطاء (ص 55):** أخطاء بناء الجملة (Syntax)، وأخطاء وقت التشغيل (Runtime) مثل القسمة على صفر، والأخطاء المنطقية (نتيجة خاطئة دون توقف).'
    ],
    challenges: [
      { q: 'تتبّع نشاط 1 حتى نهايته: ما الذي يطبعه البرنامج؟', hint: 'اختر نشاط 1 وانتقل إلى الخطوة الأخيرة.', init: { prog: 'ex1', step: 0 }, check: (p, d) => p.prog === 'act1' && d.last, why: () => 'x = 100 - 30 = 70 ثم z = 70 × 2 = 140.' },
      { q: 'في نشاط 6 (كما في الكتاب) انتقل إلى الخطوة التي يتوقف فيها البرنامج.', hint: 'السطر الثاني: نص + عدد.', init: { prog: 'act1', step: 0 }, check: (p, d) => p.prog === 'act6' && d.errNow, why: () => '{{"17" + 3}} خطأ TypeError: لا يُجمع نص مع عدد.' },
      { q: 'في مثال الشهور اجعل عدد الشهور 30 وتتبّع حتى طباعة السنوات والشهور.', hint: 'قيمة للتجربة = 30.', init: { prog: 'months', v1: 29, step: 0 }, check: (p, d) => p.prog === 'months' && p.v1 === 30 && d.cs.out.indexOf('2 سنة و 6 شهر') >= 0 },
      { q: 'غيّر x في نشاط 11 بحيث يطبع السطر الأول False.', hint: 'جرّب x = 25.', init: { prog: 'act11', v1: 15, step: 0 }, check: (p, d) => p.prog === 'act11' && d.last && d.R.out.split('\n')[0] === 'False' }
    ],
    tutor: [
      { q: 'ما الفرق بين = و == ؟', k: ['=', '==', 'الفرق'], a: () => '{{=}} للإسناد: تضع قيمة في متغير. {{==}} للمقارنة: تسأل هل القيمتان متساويتان وتُعيد True أو False.' },
      { q: 'لماذا لا يُجمع "17" + 3 ؟', k: ['17', 'نص', 'جمع'], a: () => 'لأن "17" بين علامتي تنصيص فهو نص (str)، و3 عدد (int). نحوّل النص بـ {{int("17")}} أولاً.' }
    ]
  });
  D.reg(tr);

  /* ======================= مختبر التعابير وأولويات العمليات ======================= */
  const EX = {
    ex3: { name: 'مثال 3 (ص 50): 4 + 2 * 5', src: 'result = 4 + 2 * 5' },
    t51: { name: 'جدول تتبع (ص 51): (2 + 4) * 5 - 3 ** 2', src: 'result = (2 + 4) * 5 - 3 ** 2' },
    a8a: { name: 'نشاط 8: a = 2 + 3 * 4 - 1', src: 'a = 2 + 3 * 4 - 1' },
    a8c: { name: 'نشاط 8: c = 2 ** 3 ** 2', src: 'c = 2 ** 3 ** 2' },
    a8d: { name: 'نشاط 8: d = 17 // 3 + 17 % 3', src: 'd = 17 // 3 + 17 % 3' },
    ops: { name: 'جدول العمليات (ص 48): 15 / 2 و 15 // 2 و 15 % 2', src: '15 / 2 + 15 // 2 + 15 % 2' },
    q2: { name: 'أسئلة الدرس: (3 // 8) - 2 * 4 + 3', src: '(3 // 8) - 2 * 4 + 3' },
    quiz2: { name: 'أسئلة الوحدة: A = 1 + 3 ** 2', src: 'A = 1 + 3 ** 2' },
    l1: { name: 'نشاط 11: x > 10 and x < 20', src: 'x > 10 and x < 20', x: true },
    l2: { name: 'نشاط 11: x < 10 or x > 12', src: 'x < 10 or x > 12', x: true },
    l3: { name: 'نشاط 11: not x == 15', src: 'not x == 15', x: true },
    quiz4: { name: 'أسئلة الوحدة: True and not False', src: 'True and not False' },
    p1a: { name: 'نشاط 9: 2 + 3 * 4 (بلا أقواس)', src: '2 + 3 * 4', target: 20, group: 1 },
    p1b: { name: 'نشاط 9: (2 + 3) * 4', src: '(2 + 3) * 4', target: 20, group: 1 },
    p2a: { name: 'نشاط 9: 5 - 2 * 3 (بلا أقواس)', src: '5 - 2 * 3', target: 9, group: 2 },
    p2b: { name: 'نشاط 9: (5 - 2) * 3', src: '(5 - 2) * 3', target: 9, group: 2 },
    p3a: { name: 'نشاط 9: 2 ** 3 + 1 (بلا أقواس)', src: '2 ** 3 + 1', target: 16, group: 3 },
    p3b: { name: 'نشاط 9: 2 ** (3 + 1)', src: '2 ** (3 + 1)', target: 16, group: 3 }
  };
  const exOf = (p) => { const e = EX[p.ex]; const r = PY.exprSteps(e.src, e.x ? { x: p.x } : {}); return { e: e, r: r }; };
  D.exprOf = exOf;
  D.reg({
    id: 'expression-lab', unit: U, order: 2, lesson: 'الدرس الثاني', lessonTitle: 'المتغيرات والمعاملات والمنطق', page: 50,
    titleAr: 'أولويات العمليات خطوة بخطوة', titleEn: 'Operator Precedence Step by Step', tags: 'اولويات العمليات اقواس اس ضرب قسمه جمع طرح جدول تتبع تعبير and or not',
    formula: '(\\,)\\ \\rightarrow\\ \\ast\\ast\\ \\rightarrow\\ \\ast\\ /\\ //\\ \\%\\ \\rightarrow\\ +\\ -\\ \\rightarrow\\ \\text{المقارنة}\\ \\rightarrow\\ \\text{not}\\ \\rightarrow\\ \\text{and}\\ \\rightarrow\\ \\text{or}',
    book: 'الأولوية: 1) الأقواس أولاً دائماً 2) الأس ** 3) الضرب والقسمة * / // % (يسار ← يمين) 4) الجمع والطرح + - (يسار ← يمين)',
    summary: 'لا تُحسب العمليات من اليسار إلى اليمين دائماً: الأقواس أولاً، ثم الأس، ثم الضرب والقسمة، ثم الجمع والطرح. الأس يُحسب من اليمين ({{2 ** 3 ** 2 = 2 ** 9}}). وفي التعابير المنطقية تُحسب المقارنات قبل not ثم and ثم or.',
    vars: [['\\text{التعبير}', 'من أمثلة الكتاب وأنشطته', ''], ['x', 'قيمة المتغير في تعابير نشاط 11', 'عدد صحيح']],
    params: [
      { key: 'ex', label: '\\text{التعبير}', type: 'select', value: 't51', options: Object.keys(EX).map((k) => [k, EX[k].name]) },
      { key: 'x', label: 'x', min: -50, max: 50, step: 1, value: 15, int: true, hidden: (p) => !EX[p.ex].x }
    ],
    canvasHint: 'كل صف خطوة واحدة: العملية التي تُحسب أولاً حسب الأولوية، ثم التعبير بعد التعويض.',
    compute(p) { const o = exOf(p); return { e: o.e, steps: o.r.steps, res: o.r.result }; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = D.narrow(W);
      ctx.save(); ctx.font = '700 ' + (nar ? 15 : 19) + 'px ' + D.MONO; ctx.direction = 'ltr'; ctx.textAlign = 'center'; ctx.fillStyle = c.c1; ctx.textBaseline = 'middle'; ctx.fillText(D.fit(ctx, d.e.src + (d.e.x ? '      (x = ' + p.x + ')' : ''), W - 20), W / 2, 24); ctx.restore();
      const rows = [['الخطوة', 'العملية', 'التعبير', 'النتيجة الجزئية']].concat(d.steps.map((s, i) => [String(i + 1), s.kind, s.expr, s.value]));
      const cw = [0.12, 0.22, 0.4, 0.26].map((f) => f * (W - 20)); const rh = Math.min(38, (H - 110) / Math.max(rows.length, 4));
      rows.forEach((r, i) => {
        let xx = W - 10; const y = 50 + i * rh;
        r.forEach((t, j) => {
          xx -= cw[j]; ctx.fillStyle = i === 0 ? 'rgba(13,148,136,.85)' : i % 2 ? 'rgba(148,163,184,.10)' : 'rgba(148,163,184,.03)'; ctx.fillRect(xx + 1, y + 1, cw[j] - 2, rh - 2);
          D.txt(ctx, t, xx + cw[j] / 2, y + rh / 2, { color: i === 0 ? '#fff' : j === 3 ? c.c2 : c.text, size: nar ? 11 : 13.5, w: i === 0 || j === 3 ? '800' : '600', mono: j >= 2 && i > 0, ltr: j >= 2 });
        });
      });
      const y = Math.min(H - 26, 50 + rows.length * rh + 26);
      const ok = d.e.target === undefined || (d.res && +d.res.v === d.e.target);
      D.txt(ctx, (d.e.target !== undefined ? 'المطلوب ' + d.e.target + ' ← ' : '') + 'الناتج = ' + (d.res ? PY.repr(d.res) : '—'), W / 2, y, { color: ok ? c.c3 : c.c2, size: nar ? 15 : 18, w: '800' });
    },
    live(p, d) { return '\\text{الناتج} = ' + (d.res ? PY.repr(d.res).replace(/'/g, '') : '?'); },
    results(p, d) {
      const r = [['التعبير', '{{' + d.e.src + '}}', false], ['الناتج', '{{' + (d.res ? PY.repr(d.res) : '—') + '}}', false, 'pos'], ['نوع الناتج', '{{' + (d.res ? PY.typeName(d.res) : '—') + '}}', false], ['عدد الخطوات', String(d.steps.length), false]];
      if (d.e.target !== undefined) r.push(['نشاط 9', +d.res.v === d.e.target ? 'تحقق المطلوب (' + d.e.target + ') ✔' : 'لم يتحقق: المطلوب ' + d.e.target, false, +d.res.v === d.e.target ? 'pos' : 'neg']);
      return r;
    },
    steps(p, d) { return d.steps.map((s) => s.kind + ': {{' + s.expr + ' = ' + s.value + '}} ← يصبح التعبير {{' + s.whole + '}}'); },
    explain(a, b, da, db) { return a.ex !== b.ex ? [db.steps.length ? 'أول ما يُحسب: ' + db.steps[0].kind + ' {{' + db.steps[0].expr + '}}.' : ''] : a.x !== b.x ? ['x = ' + b.x + ' فالناتج {{' + (db.res ? PY.repr(db.res) : '') + '}}.'] : []; },
    learn: [
      '**أولويات العمليات (ص 50):** الأقواس، ثم الأس، ثم الضرب والقسمة (يسار ← يمين)، ثم الجمع والطرح (يسار ← يمين).',
      '**مثال 3 (ص 50):** {{4 + 2 * 5}} ليس 30 بل 14: الضرب أولاً {{2 * 5 = 10}} ثم {{4 + 10 = 14}}.',
      '**جدول تتبع (ص 51):** {{(2 + 4) * 5 - 3 ** 2}}: الأقواس 6، الأس 9، الضرب 30، الطرح 21.',
      '**نشاط 9 (ص 51):** أضف أقواساً ليصبح الناتج المطلوب دون تغيير الأرقام أو الرموز.',
      '**عوامل المقارنة (ص 50):** {{== != > < >= <=}} وناتجها True أو False.'
    ],
    challenges: [
      { q: 'نشاط 9: اختر الأقواس التي تجعل {{2 + 3 * 4}} يساوي 20.', hint: 'اجعل الجمع أولاً.', init: { ex: 'p1a' }, check: (p, d) => EX[p.ex].group === 1 && d.res && +d.res.v === 20 },
      { q: 'نشاط 9: اجعل {{2 ** 3 + 1}} يساوي 16.', hint: 'الأس يُحسب قبل الجمع إلا إذا وُضعت أقواس.', init: { ex: 'p3a' }, check: (p, d) => EX[p.ex].group === 3 && d.res && +d.res.v === 16 },
      { q: 'غيّر x في نشاط 11 بحيث يصبح {{x < 10 or x > 12}} False.', hint: 'x بين 10 و 12.', init: { ex: 'l2', x: 15 }, check: (p, d) => p.ex === 'l2' && d.res && d.res.v === false }
    ],
    tutor: [
      { q: 'لماذا 2 ** 3 ** 2 = 512 وليس 64؟', k: ['512', 'اس', '**'], a: () => 'الأس يُحسب من اليمين إلى اليسار: {{3 ** 2 = 9}} أولاً ثم {{2 ** 9 = 512}}.' },
      { q: 'ما الفرق بين / و // ؟', k: ['//', 'قسمه'], a: () => '{{15 / 2 = 7.5}} قسمة حقيقية ناتجها float دائماً، و {{15 // 2 = 7}} قسمة صحيحة تهمل الكسر.' }
    ]
  });

  /* ======================= قواعد التسمية وأنواع البيانات ======================= */
  const NAMES = [['score', 'score'], ['player_name', 'player_name'], ['total_', 'total_'], ['age_2024', 'age_2024'], ['1score', '1score'], ['my name', 'my name'], ['my-name', 'my-name'], ['if', 'if'], ['5name', 'نشاط 3: 5name'], ['my age', 'نشاط 3: my age'], ['for', 'نشاط 3: for'], ['student-grade', 'نشاط 3: student-grade'], ['CITY', 'نشاط 3: CITY'], ['MAX_STUDENTS', 'MAX_STUDENTS']];
  const VALS = [['17', 'age = 17'], ['1.75', 'height = 1.75'], ['"ahmad"', 'name = "ahmad"'], ['True', 'is_student = True'], ['[85, 90, 78]', 'marks = [85, 90, 78]'], ['"17"', 'age = "17" (نشاط 6)'], ['"1.75"', 'height = "1.75" (نشاط 6)'], ['"True"', 'is_pass = "True" (نشاط 6)']];
  D.reg({
    id: 'names-types', unit: U, order: 3, lesson: 'الدرس الثاني', lessonTitle: 'المتغيرات والمعاملات والمنطق', page: 46,
    titleAr: 'فاحص أسماء المتغيرات وأنواع البيانات', titleEn: 'Variable Names & Data Types', tags: 'قواعد تسميه المتغيرات كلمات محجوزه snake case انواع البيانات int float str bool list',
    formula: '\\text{int}\\quad \\text{float}\\quad \\text{str}\\quad \\text{bool}\\quad \\text{list}',
    book: 'يبدأ الاسم بحرف أو شرطة سفلية _، ولا يحتوي مسافات أو رموزاً خاصة مثل # @ $، ولا تُستخدم الكلمات المحجوزة (if, for, while…)؛ وبايثون حساسة لحالة الأحرف',
    summary: 'اكتب اسم متغير لتعرف هل هو صحيح ولماذا، أو اكتب قيمة لتعرف نوع بياناتها كما يحددها بايثون. لاحظ أن القيمة بين علامتي تنصيص نص دائماً حتى لو كانت أرقاماً.',
    vars: [['\\text{الاسم}', 'اسم متغير تكتبه', 'قواعد ص 46'], ['\\text{القيمة}', 'قيمة بايثون تكتبها', 'جدول الأنواع ص 47']],
    params: [
      { key: 'mode', label: '\\text{الفحص}', type: 'select', value: 'name', options: [['name', 'اسم متغير (ص 46)'], ['type', 'نوع البيانات (ص 47)']] },
      { key: 'pre', label: '\\text{من الكتاب}', type: 'select', value: 'n:my-name', options: NAMES.map((x) => ['n:' + x[0], 'اسم: ' + x[1]]).concat(VALS.map((x) => ['t:' + x[0], 'قيمة: ' + x[1]])) },
      { key: 'txt', label: '\\text{اكتب بنفسك}', type: 'text', value: 'my-name', maxLength: 40, desc: 'اسماً أو قيمة', normalize: (v) => String(v), validate: () => null }
    ],
    onSet(p, key) {
      if (key === 'mode') { p.pre = p.mode === 'type' ? 't:' + VALS[0][0] : 'n:' + NAMES[6][0]; p.txt = p.pre.slice(2); }
      if (key === 'pre') { p.mode = p.pre[0] === 't' ? 'type' : 'name'; p.txt = p.pre.slice(2); }
    },
    canvasHint: 'اختر مثالاً من الكتاب أو اكتب بنفسك في الخانة.',
    compute(p) { return p.mode === 'type' ? { mode: 'type', r: PY.literalType(p.txt) } : { mode: 'name', r: PY.checkName(p.txt) }; },
    drawCustom(ctx, W, H, p, d, c) {
      const ok = d.r.ok; const nar = D.narrow(W);
      ctx.save(); D.rr(ctx, W * 0.1, 40, W * 0.8, 70, 14); ctx.fillStyle = ok ? 'rgba(5,150,105,.12)' : 'rgba(220,38,38,.12)'; ctx.fill(); ctx.strokeStyle = ok ? c.c3 : c.c2; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      D.txt(ctx, (d.mode === 'name' ? p.txt + ' = …' : 'x = ' + p.txt), W / 2, 75, { color: c.text, size: nar ? 17 : 22, w: '700', mono: true, ltr: true });
      D.txt(ctx, ok ? '✔' : '✘', W * 0.1 + 26, 75, { color: ok ? c.c3 : c.c2, size: 26, w: '800' });
      if (d.mode === 'name') {
        D.txt(ctx, ok ? 'اسم صحيح' : 'اسم خاطئ', W / 2, 140, { color: ok ? c.c3 : c.c2, size: 18, w: '800' });
        D.txt(ctx, d.r.why, W / 2, 172, { color: c.text, size: nar ? 13 : 15 });
        if (!ok && d.r.fix) { D.txt(ctx, 'اقتراح:', W / 2 + 8, 204, { color: c.c1, size: nar ? 14 : 16, w: '700', align: 'left' }); D.txt(ctx, d.r.fix, W / 2, 204, { color: c.c1, size: nar ? 14 : 16, w: '700', align: 'right', mono: true, ltr: true }); }
        const rules = ['يبدأ بحرف أو _', 'بلا مسافات أو رموز # @ $ -', 'ليس كلمة محجوزة', 'Score ≠ score ≠ SCORE'];
        rules.forEach((t, i) => D.txt(ctx, '• ' + t, W / 2, 250 + i * 26, { color: c.muted, size: 13 }));
      } else {
        D.txt(ctx, ok ? 'النوع: ' + d.r.t : 'ليست قيمة صحيحة', W / 2, 140, { color: ok ? c.c3 : c.c2, size: 20, w: '800' });
        D.txt(ctx, ok ? ({ int: 'عدد صحيح: الأعمار، عدد الطلاب، السنوات', float: 'عدد عشري: القياسات، المعدلات، الأسعار', str: 'نص: الأسماء والعناوين وأي بيانات حرفية', bool: 'منطقي: True أو False لاتخاذ القرارات', list: 'قائمة: عناصر مرتبة قابلة للتعديل' })[d.r.t] || '' : d.r.why, W / 2, 172, { color: c.text, size: nar ? 13 : 15 });
        if (ok && d.r.t === 'str' && /^["'][\d.]+["']$|^["'](True|False)["']$/.test(p.txt.trim())) D.txt(ctx, 'انتبه: القيمة بين علامتي تنصيص فهي نص لا عدد ولا منطقية (نشاط 6)', W / 2, 206, { color: c.c4, size: nar ? 12 : 14, w: '700' });
      }
    },
    live(p, d) { return '\\text{' + (d.r.ok ? (d.mode === 'type' ? 'النوع ' + d.r.t : 'اسم صحيح') : 'غير صحيح') + '}'; },
    results(p, d) {
      if (d.mode === 'name') return [['الاسم', '{{' + p.txt + '}}', false], ['الحكم', d.r.ok ? 'صحيح ✔' : 'خاطئ ✘', false, d.r.ok ? 'pos' : 'neg'], ['السبب', d.r.why, false]].concat(d.r.fix ? [['التصحيح المقترح', '{{' + d.r.fix + '}}', false]] : []);
      return [['القيمة', '{{' + p.txt + '}}', false], ['النوع', d.r.ok ? '{{' + d.r.t + '}}' : '—', false, d.r.ok ? 'pos' : 'neg']].concat(d.r.ok ? [['القيمة كما يخزّنها بايثون', '{{' + d.r.v + '}}', false]] : [['السبب', d.r.why, false]]);
    },
    steps(p, d) { return d.mode === 'name' ? ['هل يبدأ بحرف أو شرطة سفلية؟', 'هل يخلو من المسافات والرموز الخاصة والشرطة -؟', 'هل هو كلمة محجوزة؟', 'الحكم: ' + (d.r.ok ? 'صحيح' : 'خاطئ — ' + d.r.why)] : ['أعداد بلا فاصلة ← int، وبفاصلة ← float.', 'بين علامتي تنصيص ← str.', 'True/False دون تنصيص ← bool، وبين قوسين [ ] ← list.']; },
    explain(a, b, da, db) { return a.txt !== b.txt ? [db.r.ok ? (db.mode === 'type' ? 'نوعها ' + db.r.t + '.' : db.r.why) : db.r.why] : []; },
    learn: [
      '**القواعد الإلزامية (ص 46):** يبدأ الاسم بحرف أو شرطة سفلية _، ولا يحتوي مسافات أو رموزاً مثل # @ $، ولا يكون كلمة محجوزة (if, for, while…).',
      '**القواعد الاختيارية:** اسم معبّر (student_name أفضل من x) بطريقة snake_case. **انتبه:** Score ≠ score ≠ SCORE.',
      '**نشاط 3 (ص 46):** صوّب: {{5name}} ، {{my age}} ، {{for}} ، {{student-grade}} ، و {{"رفح" = CITY}} (الاسم يُكتب يسار =).',
      '**جدول الأنواع (ص 47):** {{age = 17}} int ، {{height = 1.75}} float ، {{name = "ahmad"}} str ، {{is_student = True}} bool ، {{marks = [85, 90, 78]}} list.'
    ],
    challenges: [
      { q: 'صحّح الاسم {{student-grade}} من نشاط 3 واكتب اسماً صحيحاً.', hint: 'استبدل الشرطة بشرطة سفلية.', init: { mode: 'name', pre: 'n:student-grade', txt: 'student-grade' }, check: (p, d) => d.mode === 'name' && d.r.ok && /student/.test(p.txt) && /grade/.test(p.txt) },
      { q: 'اكتب قيمة نوعها float.', hint: 'عدد فيه فاصلة عشرية.', init: { mode: 'type', pre: 't:17', txt: '17' }, check: (p, d) => d.mode === 'type' && d.r.ok && d.r.t === 'float' },
      { q: 'اكتب اسم ثابت صحيحاً حسب الاصطلاح.', hint: 'أحرف كبيرة مثل MAX_VALUE.', init: { mode: 'name', pre: 'n:score', txt: 'score' }, check: (p, d) => d.mode === 'name' && d.r.ok && d.r.constant }
    ],
    tutor: [
      { q: 'لماذا يُرفض if اسماً؟', k: ['if', 'محجوزه'], a: () => 'لأنه كلمة محجوزة لها معنى في لغة بايثون (بداية جملة شرطية).' },
      { q: 'هل "17" عدد؟', k: ['17', 'نص'], a: () => 'لا؛ كل ما بين علامتي تنصيص نص (str). العدد 17 يُكتب دون تنصيص.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
