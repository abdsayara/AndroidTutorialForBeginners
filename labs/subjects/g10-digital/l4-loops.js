/* المهارات الرقمية (العاشر) — الوحدة الثانية، الدرس الرابع: قوة التكرار (ص 67–75) وأسئلة الوحدة (ص 76–77) */
(function (root) {
  'use strict';
  const ML = root.ML; const PY = ML.py; const D = ML.ds10;
  const U = 4;
  const PROGS = {
    act1a: { name: 'نشاط 1: الكود أ — بدون حلقة', page: 67, code: `print("مرحباً أحمد")
print("مرحباً سارة")
print("مرحباً خالد")
# سطراً إضافياً لبقية الطلاب 47 ...` },
    act1b: { name: 'نشاط 1: الكود ب — بحلقة', page: 67, code: `طلاب = ["أحمد", "سارة", "خالد", "ليلى", "محمود"]
# 50 اسماً
for طالب in طلاب:
    print("مرحباً", طالب)`, q: 'في كل «جولة» يتغير اسم الطالب، وتبقى جملة الطباعة ثابتة.' },
    case1: { name: 'الحالة 1: التكرار على قائمة (List)', page: 68, expect: 'مرحباً أحمد\nمرحباً سارة\nمرحباً ليلى\nمرحباً خالد', code: `friends = ["أحمد", "سارة", "ليلى", "خالد"]
for friend in friends:
    print("مرحباً", friend)` },
    case2: { name: 'الحالة 2: التكرار باستخدام range()', page: 68, expect: '0\n1\n2\n3\n4\n1\n2\n3\n4\n5\n2\n4\n6\n8\n10', code: `# من 0 إلى 4
for i in range(5):
    print(i)     # range(5) تُولّد الأرقام: 0, 1, 2, 3, 4
# من 1 إلى 5
for i in range(1, 6):
    print(i)     # تبدأ من 1 وتنتهي قبل 6
# الأرقام الزوجية من 2 الى 10
for i in range(2, 11, 2):
    print(i)` },
    act2: { name: 'نشاط 2: تصنيف قائمة علامات', page: 68, kind: 'model', code: `marks = [85, 92, 67, 78, 95, 55, 88, 73]
for mark in marks:
    if mark >= 90:
        print(mark, "ممتاز")
    elif mark >= 75:
        print(mark, "جيد")
    elif mark >= 50:
        print(mark, "مقبول")
    else:
        print(mark, "راسب")` },
    act3: { name: 'نشاط 3: ما ناتج التنفيذ لكل حلقة؟', page: 69, expect: '3\n7\n11\n10\n7\n4\n1\n0\n25\n50\n75', code: `for i in range(3, 15, 4):
    print(i)
for i in range(10, 0, -3):
    print(i)
for i in range(0, 100, 25):
    print(i)` },
    counter: { name: 'حلقة while — العداد', page: 69, v1: { def: 5, min: 0, max: 15 }, code: `counter = 1
while counter <= {1}:
    print("العد:", counter)
    counter += 1    # مهم جداً، وإلا لتكررت إلى الأبد
print("انتهت الحلقة")` },
    forever: { name: 'إضاءة: نسيان تحديث المتغير داخل while', page: 69, kind: 'model', code: `counter = 1
while counter <= 5:
    print("العد:", counter)
print("انتهت الحلقة")`, q: 'إذا نسيت تحديث المتغير داخل while ستصبح الحلقة لانهائية.' },
    password: { name: 'مثال 1: إدخال كلمة مرور (مع جدول التتبع)', page: 70, inputs: 'abc|python123', code: `password = ""
correct_password = "python123"

while password != correct_password:
    password = input("ادخل كلمة المرور: ")
    if password != correct_password:
        print("خطأ حاول مرة أخرى")

print("مرحبا بك!")`, q: 'الفكرة الأساسية: الحلقة لا تتوقف عند لحظة الإدخال الصحيح، بل تكمل جولتها ثم تعود لفحص الشرط.' },
    sum: { name: 'جدول تتبع الحلقة: مجموع 1 إلى 5', page: 71, expect: '15', v1: { def: 6, min: 1, max: 30 }, code: `total = 0
for i in range(1, {1}):
    total += i
print(total)` },
    nest12: { name: 'التكرار المتداخل: 3 × 4 = 12 مرة', page: 71, code: `for i in range(3):          # الخارجية
    for j in range(4):      # الداخلية
        print(i, j)         # !تنفذ 12 مرة` },
    ex2: { name: 'مثال 2: آلية تنفيذ الحلقتين المتداخلتين', page: 71, expect: '1 1\n1 2\n2 1\n2 2\n3 1\n3 2', code: `for i in range(1, 4):
    for j in range(1, 3):
        print(i, j)`, q: 'دورة الداخلية (j) تكمل دوراتها قبل أن تتقدم i خطوة واحدة.' },
    code1: { name: 'نشاط 4 — كود 1: جدول الضرب', page: 72, code: `for i in range(1, 6):
    for j in range(1, 6):
        print(i * j, end="\\t")
    print()` },
    code2: { name: 'نشاط 4 — كود 2: مثلث النجوم', page: 72, code: `for i in range(1, 6):
    for j in range(i):
        print("*", end="")
    print()` },
    code3: { name: 'نشاط 4 — كود 3: المثلث المقلوب', page: 72, code: `for i in range(1, 5):
    for j in range(i, 0, -1):
        print("*", end="")
    print()` },
    q4: { name: 'أسئلة الدرس 4: for i in range(10, 0, -1)', page: 75, expect: '10\n9\n8\n7\n6\n5\n4\n3\n2\n1', code: `for i in range(10, 0, -1):
    print(i)` },
    q5: { name: 'أسئلة الدرس 5: نسق 1، 12، 123…', page: 75, kind: 'model', expect: '1\n12\n123\n1234\n12345', code: `for i in range(1, 6):
    for j in range(1, i + 1):
        print(j, end="")
    print()` },
    unitq3: { name: 'أسئلة الوحدة (السؤال الثاني 3): مجموع الزوجية', page: 77, expect: '6', code: `total = 0
for i in range(1, 6):
    if i % 2 == 0:
        total += i
print(total)` },
    odd50: { name: 'أسئلة الوحدة (السؤال الثالث 3): مجموع الفردية من 1 إلى 50', page: 77, kind: 'model', expect: '625', code: `total = 0
for i in range(1, 51, 2):
    total += i
print(total)` }
  };
  const tr = D.tracer({
    id: 'loops-trace', unit: U, order: 1, lesson: 'الدرس الرابع', lessonTitle: 'قوة التكرار: الحلقات التكرارية والتكرار المتداخل', page: 67,
    titleAr: 'تتبّع الحلقات: for و range و while والتكرار المتداخل', titleEn: 'Tracing Loops', tags: 'حلقه تكرار for while range قائمه تكرار متداخل كلمه مرور جدول الضرب نجوم',
    formula: '\\text{for متغير in مجموعة:}\\quad \\text{while الشرط:}\\quad \\text{range}(a, b, s)',
    book: 'for عندما نعرف عدد التكرارات أو نمر على مجموعة؛ while تستمر ما دام الشرط صحيحاً؛ range(a, b, s) من a إلى b – 1 بخطوة s',
    summary: 'الحلقة تكرر تعليمات: for لعدد معروف من المرات أو للمرور على عناصر قائمة، و while ما دام شرطها صحيحاً (ويجب تحديث متغيرها وإلا صارت لانهائية). في التكرار المتداخل تكمل الحلقة الداخلية كل دوراتها في كل دورة من الخارجية، فعدد مرات التنفيذ = دورات الخارجية × دورات الداخلية.',
    programs: PROGS,
    learn: [
      '**قصة الدرس (ص 67):** فيروس Slammer عام 2003 أصاب 75,000 حاسوب في 10 دقائق لأن «سلاحه» حلقة لا تتوقف.',
      '**range() (ص 68):** {{range(5)}} ← 0,1,2,3,4 ؛ {{range(2, 6)}} ← 2,3,4,5 ؛ {{range(1, 10, 2)}} ← 1,3,5,7,9. القيمة النهائية غير مشمولة.',
      '**while خطوة بخطوة (ص 69):** يفحص بايثون الشرط؛ إذا كان صحيحاً ينفّذ الأوامر ثم يعود للفحص، وإذا كان خاطئاً يخرج ويكمل ما بعده.',
      '**متى for ومتى while؟ (ص 70):** for عندما تعرف عدد التكرارات أو تمر على قائمة؛ while عندما لا تعرف العدد وتنتظر حدوث شيء (مثل إدخال صحيح).',
      '**قواعد التداخل (ص 72):** متغيرات عداد مختلفة (i و j)، والداخلية بمسافة أعمق، و {{print()}} الفارغة سطر جديد، و {{end=""}} يمنع الانتقال لسطر جديد.'
    ],
    challenges: [
      { q: 'في مثال كلمة المرور أخطئ مرتين قبل الإدخال الصحيح، وتتبّع حتى «مرحبا بك!».', hint: 'قيم الإدخال مثل: abc|123|python123.', init: { prog: 'password', inp: 'abc|python123', step: 0 }, check: (p, d) => p.prog === 'password' && d.last && !d.R.error && (d.R.out.match(/خطأ حاول/g) || []).length === 2 },
      { q: 'غيّر حد العداد في حلقة while بحيث لا تُنفَّذ أي دورة.', hint: 'اجعل الحد أصغر من 1.', init: { prog: 'counter', v1: 5, step: 0 }, check: (p, d) => p.prog === 'counter' && D.countSteps(d.R, 'loop', true) === 0 },
      { q: 'جدول تتبع الحلقة: اجعل المجموع 55 (مجموع 1 إلى 10).', hint: 'range(1, 11).', init: { prog: 'sum', v1: 6, step: 0 }, check: (p, d) => p.prog === 'sum' && d.R.out.trim() === '55' },
      { q: 'تتبّع مثال 2 حتى يطبع «2 1» (i = 2 و j = 1).', hint: 'انتقل بالخطوات حتى تتقدم i إلى 2.', init: { prog: 'ex2', step: 0 }, check: (p, d) => p.prog === 'ex2' && /\n2 1\n$/.test(d.cs.out) }
    ],
    tutor: [
      { q: 'لماذا لا تشمل range(1, 6) الرقم 6؟', k: ['range', '6', 'تشمل'], a: () => 'لأن range(a, b) تبدأ من a وتنتهي قبل b: من 1 إلى 5.' },
      { q: 'كم مرة يُنفَّذ print في حلقتين متداخلتين؟', k: ['متداخل', 'كم مره'], a: () => 'دورات الخارجية × دورات الداخلية؛ مثلاً range(4) و range(3) ← 12 مرة.' }
    ]
  });
  D.reg(tr);

  /* ======================= أسئلة الوحدة: اختيار من متعدد مع التحقق بالتنفيذ ======================= */
  const QS = [
    { q: 'ما هي الأجزاء الثلاثة الأساسية لأي برنامج؟', o: ['البداية، الوسط، النهاية', 'المدخلات، العمليات، المخرجات', 'الاسم، العمر، العنوان', 'المتغير، الثابت، الدالة'], a: 1, why: 'أي خوارزمية تتكوّن من مدخلات وعمليات ومخرجات (ص 39).' },
    { q: 'ما ناتج A = 1 + 3 ** 2 ؟', o: ['7', '9', '8', '10'], a: 3, code: 'A = 1 + 3 ** 2\nprint(A)' },
    { q: 'أيٌّ من الآتي يُعد اسماً خاطئاً لمتغير؟', o: ['student_1', 'my_score', '2student', 'total_'], a: 2, why: 'لا يجوز أن يبدأ الاسم برقم (ص 46).' },
    { q: 'ما ناتج: True and not False ؟', o: ['True', 'False', 'None', 'خطأ'], a: 0, code: 'print(True and not False)' },
    { q: 'ما الذي لا بد من كتابته بعد شرط if ؟', o: ['فاصلة (،)', 'نقطتان رأسيتان (:)', 'نقطة (.)', 'قوس )'], a: 1, code: 'x = 5\nif x > 3\n    print(x)', why: 'دون النقطتين يحدث خطأ بناء جملة.' },
    { q: 'كم مرة تُنفَّذ حلقة for i in range(5)؟', o: ['4', '5', '6', 'غير محدد'], a: 1, code: 'for i in range(5):\n    print(i)' },
    { q: 'أي الآتية يُنشئ حلقة لانهائية؟', o: ['for i in range(100):', 'while True:', 'while False:', 'for i in range(0):'], a: 1, code: 'while True:\n    x = 1', why: 'شرط while True لا يصبح False أبداً.' },
    { q: 'كم مرة يُنفَّذ الأمر print() في الكود الآتي؟ for i in range(3) و داخلها for j in range(2)', o: ['5', '6', '3', '2'], a: 1, code: 'for i in range(3):\n    for j in range(2):\n        print(i, j)' },
    { q: 'ما الفرق بين / و // ؟', o: ['لا فرق بينهما', '/ قسمة حقيقية، // قسمة صحيحة', '// قسمة حقيقية، / قسمة صحيحة', 'كلاهما غير صحيح'], a: 1, code: 'print(15 / 2, 15 // 2)' }
  ];
  const LET = ['أ', 'ب', 'ج', 'د'];
  D.QS = QS;
  D.reg({
    id: 'unit-quiz', unit: 5, order: 1, lesson: 'أسئلة الوحدة', lessonTitle: 'أسئلة الوحدة: السؤال الأول', page: 76,
    titleAr: 'أسئلة الوحدة: اختر الإجابة وتحقق منها بالتنفيذ', titleEn: 'Unit Questions with Live Checking', tags: 'اسئله الوحده اختيار من متعدد مراجعه',
    formula: '\\text{اختر الإجابة ثم شغّل الكود للتحقق}',
    book: 'السؤال الأول (ص 76): ضع دائرة حول رمز الإجابة الصحيحة',
    summary: 'أجب عن أسئلة الاختيار من متعدد في الكتاب. عندما يكون السؤال عن كود، يُنفَّذ الكود فعلاً وتظهر مخرجاته لتتحقق من إجابتك بنفسك.',
    vars: [['\\text{السؤال}', 'رقم السؤال في الكتاب', '1 – 9'], ['\\text{إجابتك}', 'رمز الخيار', 'أ ب ج د']],
    params: [
      { key: 'q', label: '\\text{السؤال}', type: 'select', value: 1, options: QS.map((x, i) => [i + 1, (i + 1) + '. ' + x.q.slice(0, 48)]) },
      { key: 'ans', label: '\\text{إجابتك}', type: 'select', value: -1, options: [[-1, 'لم أجب بعد']].concat(LET.map((l, i) => [i, l])) }
    ],
    onSet(p, key) { if (key === 'q') p.ans = -1; },
    canvasHint: 'اختر الإجابة من القائمة؛ الكود أسفل السؤال يُنفَّذ للتحقق.',
    compute(p) { const Q = QS[(+p.q || 1) - 1]; const R = Q.code ? PY.run(Q.code, []) : null; return { Q: Q, R: R, ans: +p.ans, ok: +p.ans === Q.a }; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = D.narrow(W); const Q = d.Q;
      D.txt(ctx, p.q + '. ' + Q.q, W - 14, 22, { color: c.text, size: nar ? 13 : 16, w: '800', align: 'right' });
      Q.o.forEach((o, i) => {
        const y = 52 + i * 38; const chosen = d.ans === i; const show = d.ans >= 0; const correct = i === Q.a;
        ctx.save(); D.rr(ctx, 14, y, W - 28, 32, 8); ctx.fillStyle = show && correct ? 'rgba(5,150,105,.16)' : chosen ? 'rgba(220,38,38,.14)' : 'rgba(148,163,184,.08)'; ctx.fill(); ctx.strokeStyle = chosen ? (correct ? c.c3 : c.c2) : c.grid; ctx.lineWidth = chosen ? 2 : 1; ctx.stroke(); ctx.restore();
        D.txt(ctx, LET[i] + ')', W - 30, y + 16, { color: c.c1, size: 14, w: '800' });
        D.txt(ctx, o, W - 50, y + 16, { color: c.text, size: nar ? 12.5 : 14, align: 'right', mono: /[a-z(]/i.test(o) && !/[؀-ۿ]/.test(o) });
        if (show && correct) D.txt(ctx, '✔', 34, y + 16, { color: c.c3, size: 18, w: '800' });
      });
      if (Q.code) {
        const y0 = 52 + 4 * 38 + 10; const ch = Math.max(60, (H - y0 - 10) * 0.55);
        D.codePanel(ctx, 14, y0, W - 28, ch, Q.code, 0, c);
        D.outPanel(ctx, 14, y0 + ch + 6, W - 28, H - y0 - ch - 14, d.ans >= 0 ? d.R.out : '(اختر إجابة لترى المخرجات)', c, !!d.R.error);
      }
    },
    live(p, d) { return '\\text{' + (d.ans < 0 ? 'اختر إجابة' : d.ok ? 'إجابة صحيحة' : 'إجابة غير صحيحة') + '}'; },
    results(p, d) {
      const r = [['السؤال', d.Q.q, false], ['إجابتك', d.ans < 0 ? '—' : LET[d.ans] + ') ' + d.Q.o[d.ans], false, d.ans < 0 ? '' : d.ok ? 'pos' : 'neg']];
      if (d.ans >= 0) { r.push(['الإجابة الصحيحة', LET[d.Q.a] + ') ' + d.Q.o[d.Q.a], false, 'pos']); if (d.Q.why) r.push(['التعليل', d.Q.why, false]); if (d.R) r.push(['مخرجات التنفيذ', '{{' + d.R.out.replace(/\n$/, '').split('\n').slice(0, 6).join(' ⏎ ') + '}}', false]); }
      return r;
    },
    steps(p, d) { return d.ans < 0 ? ['اقرأ السؤال وفكّر قبل التنفيذ.'] : ['إجابتك: ' + LET[d.ans] + '، والصحيحة: ' + LET[d.Q.a] + '.'].concat(d.Q.why ? [d.Q.why] : []); },
    explain(a, b, da, db) { return a.ans !== b.ans && db.ans >= 0 ? [db.ok ? 'أحسنت! ' + (db.Q.why || '') : 'راجع: الإجابة الصحيحة ' + LET[db.Q.a] + '. ' + (db.Q.why || '')] : []; },
    learn: ['**أسئلة الوحدة (ص 76–77):** اختيار من متعدد، ثم تتبع الأكواد (موجودة في محاكيات التتبع لكل درس)، ثم أسئلة مقالية.', 'السؤال الثالث 3 (ص 77): برنامج مجموع الأعداد الفردية من 1 إلى 50 موجود في «تتبّع الحلقات».'],
    challenges: [
      { q: 'أجب عن السؤال 2 إجابة صحيحة.', hint: 'الأس قبل الجمع.', init: { q: 2, ans: -1 }, check: (p, d) => +p.q === 2 && d.ok },
      { q: 'أجب عن السؤال 8 إجابة صحيحة.', hint: '3 × 2.', init: { q: 8, ans: -1 }, check: (p, d) => +p.q === 8 && d.ok }
    ],
    tutor: [{ q: 'كيف أتحقق من إجابتي؟', k: ['اتحقق', 'تحقق'], a: () => 'اختر إجابة؛ يُنفَّذ الكود المرافق للسؤال وتظهر مخرجاته الفعلية.' }, { q: 'لماذا range(5) خمس مرات؟', k: ['range', '5'], a: () => 'لأنها تولّد 0، 1، 2، 3، 4 (خمس قيم).' }]
  });
})(typeof window !== 'undefined' ? window : globalThis);
