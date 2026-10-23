/* المهارات الرقمية (العاشر) — الوحدة الثانية، الدرس الثالث: صانع القرارات | الجمل الشرطية البسيطة والمتداخلة (ص 58–66) */
(function (root) {
  'use strict';
  const ML = root.ML; const D = ML.ds10;
  const U = 3;
  const PROGS = {
    act1: { name: 'نشاط 1: أكمل الفراغات (العلامة 73)', page: 58, v1: { def: 73, min: 0, max: 100 }, code: `grade = {1}
if grade >= 90:
    print("ممتاز")
elif grade >= 70:
    print("جيد")
else:
    print("راسب")`, q: 'العلامة = 73: ما الكلمة التي ستُطبع؟ وما الكلمة إذا كانت العلامة = 95؟' },
    ex1: { name: 'أولاً: if — مثال تطبيقي 1', page: 58, v1: { def: 20, min: 0, max: 100 }, code: `age = {1}
if age >= 18:
    print("انت راشد")
    print("يمكنك التصويت")
print("هذا السطر يُطبع دائماً")`, q: 'إذا كان الشرط خطأ يُتجاوز الكود داخل if ولا يحدث شيء.' },
    act2: { name: 'نشاط 2: توصية اللباس حسب الحرارة', page: 59, kind: 'model', inputs: '12', code: `temp = float(input("درجة الحرارة: "))
if temp < 15:
    print("ارتدِ ملابس شتوية ثقيلة")` },
    ifelse: { name: 'ثانياً: if / else — بديلان', page: 59, v1: { def: 15, min: 0, max: 100 }, code: `age = {1}
if age >= 18:
    print("مسموح بالقيادة")
else:
    print("غير مسموح بالقيادة – العمر أقل من 18")` },
    act3: { name: 'نشاط 3: طريقة التعامل مع النفايات', page: 59, kind: 'model', inputs: 'بطاريات', code: `waste = input("أدخل نوع النفايات: ")
if waste == "ورق":
    print("إعادة تدوير")
elif waste == "بلاستيك":
    print("إعادة تدوير إن كان نظيفاً")
elif waste == "بقايا طعام":
    print("سماد عضوي")
elif waste == "بطاريات":
    print("نفايات خطرة")
else:
    print("اسأل البلدية أو مركز التدوير")` },
    act4: { name: 'نشاط 4: صحح الأخطاء (كما في الكتاب)', page: 59, kind: 'buggy', code: `grade = 92
if grade => 50
    print("ناجح")
    Else:
print("راسب")` },
    act4fix: { name: 'نشاط 4: بعد التصحيح', page: 59, kind: 'model', v1: { def: 92, min: 0, max: 100 }, code: `grade = {1}
if grade >= 50:
    print("ناجح")
else:
    print("راسب")` },
    elif: { name: 'ثالثاً: if / elif / else — خيارات متعددة', page: 59, v1: { def: 85, min: 0, max: 100 }, code: `grade = {1}
if grade >= 90:
    print("ممتاز — A")
elif grade >= 80:
    print("جيد جداً — B")
elif grade >= 70:
    print("جيد — C")
elif grade >= 60:
    print("مقبول — D")
else:
    print("راسب — F")` },
    trace60: { name: 'جدول تتبع لشرط متعدد (grade = 72)', page: 60, expect: 'C', v1: { def: 72, min: 0, max: 100 }, code: `grade = {1}
if grade >= 90:
    print("A")
elif grade >= 80:
    print("B")
elif grade >= 70:
    print("C")
else:
    print("F")`, q: 'تفحص بايثون الشروط من الأعلى للأسفل وتنفّذ أول شرط صحيح فقط ثم تتوقف.' },
    act5: { name: 'نشاط 5: قاموس الفصول', page: 60, kind: 'model', inputs: '3', code: `n = int(input("أدخل رقماً من 1 إلى 4: "))
if n == 1:
    print("الربيع")
elif n == 2:
    print("الصيف")
elif n == 3:
    print("الخريف")
elif n == 4:
    print("الشتاء")
else:
    print("رقم غير صالح")` },
    indent: { name: 'قاعدة المسافة البادئة: صحيح', page: 61, v1: { def: 15, min: 0, max: 30 }, code: `x = {1}
if x > 5:
    print("كبير")       # داخل الشرط (4 مسافات بادئة)
print("النهاية")        # خارج الشرط` },
    indentBad: { name: 'قاعدة المسافة البادئة: خطأ', page: 61, kind: 'buggy', code: `x = 15
if x > 5:
print("كبير")       # لا توجد مسافة بادئة` },
    act6: { name: 'نشاط 6: المسافات البادئة قبل الإصلاح', page: 61, v1: { def: 10, min: 0, max: 20 }, code: `x = {1}
if x > 5:
    print("كبير")
    print("أكبر من 5")
if x > 8:
    print("كبير جداً")
    print("انتهى")`, q: 'جرّب x = 6: هل يُطبع «انتهى»؟ لماذا؟' },
    act6fix: { name: 'نشاط 6: بعد الإصلاح', page: 61, kind: 'model', v1: { def: 10, min: 0, max: 20 }, code: `x = {1}
if x > 5:
    print("كبير")
    print("أكبر من 5")
    if x > 8:
        print("كبير جداً")
print("انتهى")` },
    input: { name: 'استقبال مدخلات من المستخدم', page: 61, inputs: 'سارة|16', code: `name = input("ما اسمك؟ ")
age = int(input("كم عمرك؟ "))    # نحول النص إلى رقم
if age >= 18:
    print("مرحباً", name, "انت راشد")
else:
    print("مرحباً", name, "انت قاصر")` },
    act7: { name: 'نشاط 7: ما الخطأ؟ (كما في الكتاب)', page: 61, kind: 'buggy', inputs: '20', code: `age = input("كم عمرك؟ ")
if age >= 18:
    print("راشد")` },
    act7fix: { name: 'نشاط 7: بعد التصحيح', page: 61, kind: 'model', inputs: '20', code: `age = int(input("كم عمرك؟ "))
if age >= 18:
    print("راشد")` },
    ex4: { name: 'مثال 4: الانضمام لفريق كرة سلة', page: 62, v1: { def: 180, min: 100, max: 230 }, v2: { def: 75, min: 30, max: 150 }, code: `height = {1}
weight = {2}

if height >= 175:
    print("الطول مناسب ، نفحص الوزن...")
    if weight >= 60 and weight <= 100:
        print("✓ تم القبول في الفريق الأول")
    else:
        print("✗ الوزن غير مناسب")
else:
    print("✗ الطول غير مناسب _ لم نفحص الوزن")` },
    tickets: { name: 'نشاط إثرائي: تسعير تذاكر مسبح', page: 62, kind: 'model', inputs: '12|y', code: `age = int(input("العمر: "))
weekend = input("عطلة نهاية الأسبوع؟ (y/n): ") == "y"
if age >= 18:
    price = 20
elif age >= 6:
    price = 10
else:
    price = 0
if weekend:
    if age >= 6:
        price += 5
print("سعر التذكرة:", price, "دينار")` },
    and1: { name: 'التداخل أم الشرط المركب؟ الطريقة 1: AND', page: 62, v1: { def: 20, min: 0, max: 100 }, code: `age = {1}
has_id = True
has_money = False
if age >= 18 and has_id and has_money:
    print("مسموح")
else:
    print("غير مسموح")` },
    nest2: { name: 'الطريقة 2: تداخل (رسالة لكل سبب رفض)', page: 63, v1: { def: 20, min: 0, max: 100 }, code: `age = {1}
has_id = True
has_money = False
if age >= 18:
    if has_id:
        if has_money:
            print("مسموح")
        else:
            print("لا توجد أموال كافية")
    else:
        print("لا توجد هوية")
else:
    print("السن غير مناسب")` },
    levels: { name: 'قاعدة المسافات في التداخل: المستويات', page: 63, code: `A = True
B = True
C = True
D = True
if A:                  # مستوى 0
    if B:              # مستوى 1 (4 مسافات)
        if C:          # مستوى 2 (8 مسافات)
            if D:      # مستوى 3 (12 مسافة)
                print("عميق جداً!")` },
    ex5: { name: 'مثال 5: نظام قبول الطلاب في الجامعة', page: 63, inputs: '85|92|y', code: `print("=== نظام قبول الطلاب في الجامعة ===")
gpa = float(input("المعدل التراكمي في آخر 3 صفوف (من 100): "))
tawjihi = float(input("معدل التوجيهي: "))
is_scientific = input("هل الفرع علمي؟ (y/n): ") == "y"

# نستخدم التداخل لرسائل متخصصة
if tawjihi >= 65:
    if gpa >= 70:
        if is_scientific:
            # استخدمنا if/elif/else من الجزء الأول
            if tawjihi >= 90:
                print("✓ قبول ممتاز — تخصص الطب")
            elif tawjihi >= 80:
                print("✓ قبول — تخصص الهندسة")
            else:
                print("✓ قبول — تخصص العلوم")
        else:
            print("✗ رفض: التخصصات العلمية تتطلب فرعاً علمياً")
    else:
        print("✗ رفض: المعدل التراكمي غير كافٍ")
else:
    print("✗ رفض: معدل التوجيهي أقل من الحد الأدنى")` },
    q4: { name: 'أسئلة الدرس 4: موجب أم سالب أم صفر؟', page: 66, inputs: '7', code: `num = int(input("أدخل رقماً: "))

if num > 0:
    print("الرقم موجب")
elif num < 0:
    print("الرقم سالب")
else:
    print("الرقم صفر")` },
    unitq2: { name: 'أسئلة الوحدة (السؤال الثاني 2): تتبّع واكتب الناتج', page: 77, expect: 'متوسط', v1: { def: 10, min: 0, max: 30 }, code: `x = {1}
if x > 5:
    if x > 15:
        print("كبير جدا")
    else:
        print("متوسط")
else:
    print("صغير")` },
    q5: { name: 'أسئلة الدرس 5: نظام تقدير طالب', page: 66, kind: 'model', inputs: '85|90|78', code: `m1 = float(input("العلامة الأولى: "))
m2 = float(input("العلامة الثانية: "))
m3 = float(input("العلامة الثالثة: "))
avg = (m1 + m2 + m3) / 3
print("المتوسط:", avg)
if avg >= 90:
    print("ممتاز")
elif avg >= 80:
    print("جيد جداً")
elif avg >= 70:
    print("جيد")
elif avg >= 50:
    print("مقبول")
else:
    print("راسب")` }
  };
  const tr = D.tracer({
    id: 'conditions-trace', unit: U, order: 1, lesson: 'الدرس الثالث', lessonTitle: 'صانع القرارات: الجمل الشرطية البسيطة والمتداخلة', page: 58,
    titleAr: 'تتبّع الجمل الشرطية: if و elif و else والتداخل', titleEn: 'Tracing Conditionals', tags: 'جمل شرطيه if elif else تداخل مسافه بادئه input int شرط مركب and قبول جامعه كره سله',
    formula: '\\text{if الشرط:}\\ \\dots\\quad \\text{elif شرط آخر:}\\ \\dots\\quad \\text{else:}\\ \\dots',
    book: 'if تنفّذ كتلة من الكود فقط إذا تحقق الشرط؛ if/else بديلان؛ if/elif/else خيارات متعددة تُفحص من الأعلى للأسفل ويُنفّذ أول شرط صحيح فقط',
    summary: 'كل شرط يُقيَّم إلى True أو False. الكتلة التابعة للشرط تُحدَّد بالمسافة البادئة (4 مسافات). في if/elif/else تُفحص الشروط بالترتيب ويُنفَّذ أول شرط صحيح ثم يُتجاوز الباقي. التداخل: جملة شرطية كاملة داخل أخرى، ويفيد عندما نريد رسالة مختلفة لكل سبب.',
    programs: PROGS,
    learn: [
      '**قصة الدرس (ص 58):** عام 1983 أبلغ نظام الإنذار السوفيتي عن إطلاق صواريخ؛ اتبع النظام تعليماته بدقة لكن الشرط لم يأخذ الواقع في الحسبان، وقرّر الضابط بيتروف تجاهله.',
      '**if (ص 58):** الفكرة: تنفَّذ كتلة من الكود فقط إذا تحقق الشرط، والكود الداخلي بمسافة بادئة 4 فراغات.',
      '**قاعدة مهمة (ص 60):** تفحص بايثون الكود من الأعلى للأسفل وتنفّذ أول شرط صحيح فقط ثم تتوقف.',
      '**استقبال المدخلات (ص 61):** {{input()}} تُعيد نصاً دائماً؛ نستخدم {{int()}} أو {{float()}} مع الأرقام.',
      '**ملاحظة (ص 63):** نستخدم الشرط المركب عندما نرغب برسالة موحدة للرفض، والتداخل عندما نحتاج رسالة مختلفة لكل سبب رفض. **تحذير:** إذا وصلت إلى 3 مستويات أو أكثر فالكود غالباً يحتاج إلى إعادة تصميم.',
      '**أخطاء شائعة (ص 64):** نسيان «:»، نسيان المسافة البادئة، = بدل ==، elseif بدل elif، ترتيب الشروط خطأ (فحص >= 70 قبل >= 90).'
    ],
    challenges: [
      { q: 'نشاط 1: اجعل العلامة 95 وتتبّع حتى الطباعة.', hint: 'قيمة للتجربة = 95.', init: { prog: 'act1', v1: 73, step: 0 }, check: (p, d) => p.prog === 'act1' && p.v1 === 95 && d.last, why: () => 'يتحقق الشرط الأول grade >= 90 فيُطبع «ممتاز» ويُتجاوز الباقي.' },
      { q: 'أسئلة الدرس 4: أدخل -3 في برنامج «موجب أم سالب أم صفر» وتتبّع حتى النهاية.', hint: 'قيم الإدخال = -3.', init: { prog: 'q4', inp: '7', step: 0 }, check: (p, d) => p.prog === 'q4' && d.last && /سالب/.test(d.R.out) },
      { q: 'مثال 4: جد طولاً ووزناً يُرفض فيهما اللاعب بسبب الوزن فقط.', hint: 'طول ≥ 175 ووزن خارج 60–100.', init: { prog: 'ex4', v1: 180, v2: 75, step: 0 }, check: (p, d) => p.prog === 'ex4' && d.last && /الوزن غير مناسب/.test(d.R.out) },
      { q: 'مثال 5: ما الرسالة إذا كان المعدل التراكمي 65 (والتوجيهي 92 علمي)؟', hint: 'قيم الإدخال: 65|92|y.', init: { prog: 'ex5', inp: '85|92|y', step: 0 }, check: (p, d) => p.prog === 'ex5' && d.last && /المعدل التراكمي غير كافٍ/.test(d.R.out) }
    ],
    tutor: [
      { q: 'لماذا لا يُطبع إلا تقدير واحد في elif؟', k: ['elif', 'واحد'], a: () => 'لأن بايثون تتوقف عند أول شرط صحيح وتتجاوز بقية elif و else.' },
      { q: 'متى أستخدم التداخل بدل and؟', k: ['تداخل', 'and', 'متى'], a: () => 'التداخل عندما تحتاج رسالة مختلفة لكل سبب (لا توجد هوية، لا توجد أموال…)، والشرط المركب and عندما تكفي رسالة رفض واحدة (ص 63).' }
    ]
  });
  D.reg(tr);
})(typeof window !== 'undefined' ? window : globalThis);
