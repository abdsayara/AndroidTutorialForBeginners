/* العلوم الحياتية — منطق نقي وبيانات منقولة من كتاب العلوم الحياتية للصف العاشر (فلسطين، الطبعة الثالثة 2020م)
 * كل قيمة عددية هنا مذكورة في الكتاب مع رقم صفحتها. ما لا يذكره الكتاب يُعرض نوعياً بوسم «نموذج مبسّط لأغراض التعليم».
 */
(function (root) {
  'use strict';
  const ML = root.ML = root.ML || {};
  const B = ML.bio = {};
  B.SIMPLE = 'نموذج مبسّط لأغراض التعليم';

  /* ---------- المجاهر (ص 4–9) ---------- */
  // مقدار التكبير في المجهر المركب = تكبير العدسة العينية × تكبير العدسة الشيئية (ص 7)
  B.magnification = (eye, obj) => {
    if (!(eye > 0) || !(obj > 0)) throw new RangeError('magnification');
    return eye * obj;
  };
  B.EYEPIECES = [10];               // العدسة العينية X10 (ص 9، س4)
  B.OBJECTIVES = [4, 10, 40, 100];  // الشكل (5) ص 8: 4x و 10x و 40x، و 100x عدسة زيتية
  // مقدار التمييز (الفصل): أقصر مسافة يمكن من خلالها التمييز بين نقطتين (ص 5)
  B.RESOLUTION = { light: '0.2 ميكرومتر', electron: '3×10⁻⁴ – 1×10⁻⁵ ميكرومتر' };
  // مقارنة المجاهر (ص 5–9)
  B.MICROSCOPES = {
    light: { name: 'المجهر الضوئي المركب', radiation: 'ضوئي (مصدر ضوئي)', lenses: 'عدسة عينية وعدسات شيئية', res: 'مقدار التمييز 0.2 ميكرومتر', live: 'تُفحص به عينات مثل قطرة حليب وخلايا البصل (نشاط 1)', image: 'يُرى الجسم من خلال العدسة العينية', use: 'فحص الخلايا والأنسجة بعد تحضير شريحة' },
    sem: { name: 'المجهر الإلكتروني الماسح (SEM)', radiation: 'إلكترونات بدل المصدر الضوئي', lenses: 'عدسات كهرومغناطيسية', res: 'مقدار التمييز 3×10⁻⁴ – 1×10⁻⁵ ميكرومتر', live: 'تُفحص الخلايا الميتة، ولا يتم مشاهدة العينات حية', image: 'تظهر الصورة بأبعادها الثلاثية على شاشة مفلورة', use: 'دراسة بعض جزيئات الخلية مثل DNA، وحبوب اللقاح من أجل تصنيفها' },
    tem: { name: 'المجهر الإلكتروني النافذ (TEM)', radiation: 'إلكترونات بدل المصدر الضوئي', lenses: 'عدسات كهرومغناطيسية', res: 'مقدار التمييز 3×10⁻⁴ – 1×10⁻⁵ ميكرومتر', live: 'تُفحص الخلايا الميتة', image: 'تقع صورة الجسم الملاحظ على شاشة مفلورة', use: 'الأداة الرئيسة لدراسة التركيب الدقيق للخلية' }
  };
  // الشكل (1) ص 4: سلم الأحجام بالأس العشري للمتر (log10 م). القيم التقريبية مقروءة من الشكل.
  B.SCALE = [
    { name: 'طول الإنسان', lg: 0.24 },
    { name: 'طول بعض الخلايا العصبية والعضلية', lg: -0.3 },
    { name: 'بيضة دجاجة', lg: -1.3 },
    { name: 'بيوض ضفدع', lg: -2.7 },
    { name: 'بويضة عند الإنسان', lg: -3.9 },
    { name: 'خلايا نباتية وخلايا حيوانية', lg: -4.7 },
    { name: 'نواة / بعض أنواع البكتيريا / مايتوكندريا', lg: -5.7 },
    { name: 'بكتيريا صغيرة الحجم', lg: -6.4 },
    { name: 'فيروسات', lg: -7.0 },
    { name: 'رايبوسوم', lg: -7.6 },
    { name: 'بروتين', lg: -8.2 },
    { name: 'لبيدات', lg: -8.6 },
    { name: 'جزيئات صغيرة', lg: -9.1 },
    { name: 'ذرات', lg: -9.8 }
  ];
  // مجالات الرؤية في الشكل (1): العين المجردة، المجهر الضوئي، المجهر الإلكتروني (log10 م) — قراءة تقريبية من الشكل
  B.RANGES = { eye: [-4, 1], light: [-6.7, -3], electron: [-9, -4] };
  B.lgToText = function (lg) {
    const m = Math.pow(10, lg);
    const u = [[1, 'م'], [1e-2, 'سم'], [1e-3, 'ملم'], [1e-6, 'ميكرومتر'], [1e-9, 'نانومتر']].find((x) => m >= x[0] * 0.999) || [1e-9, 'نانومتر'];
    const v = m / u[0]; return (v >= 100 ? Math.round(v) : v >= 10 ? Math.round(v * 10) / 10 : Math.round(v * 100) / 100) + ' ' + u[1];
  };
  B.seenBy = (lg) => ({ eye: lg >= B.RANGES.eye[0], light: lg >= B.RANGES.light[0] && lg <= B.RANGES.light[1], electron: lg >= B.RANGES.electron[0] && lg <= B.RANGES.electron[1] });

  /* ---------- الخلايا (ص 10–18) ---------- */
  B.CELL_THEORY = ['جميع الكائنات الحية تتكون من خلية واحدة أو أكثر.', 'الخلية هي وحدة البناء والتركيب والوظيفة في أجسام الكائنات الحية.', 'تنتج الخلايا الجديدة من خلايا سابقة لها.'];
  // جدول (1) ص 11: مقارنة بين الخلايا بدائية النوى وحقيقية النوى
  B.PRO_EU = [
    ['قطر الخلية', '1 – 5 ميكرومتر تقريباً', '10 – 100 ميكرومتر تقريباً'],
    ['النواة', 'لا توجد نواة، المادة الوراثية في السيتوبلازم دون غلاف نووي', 'توجد نواة يحيط بها غلاف نووي'],
    ['المادة الوراثية (DNA)', 'كروموسوم واحد حلقي غير مرتبط بالهستون', 'عدة كروموسومات خطية مرتبطة بالهستون'],
    ['العضيات الخلوية الغشائية', 'لا توجد', 'توجد، مثل المايتوكندريا'],
    ['الانقسام', 'انشطار ثنائي (انقسام متساوٍ)', 'انقسام متساوٍ وانقسام منصف']
  ];

  /* ---------- المادة الوراثية (ص 19–27) ---------- */
  const PAIR = { DNA: { A: 'T', T: 'A', G: 'C', C: 'G' }, RNA: { A: 'U', U: 'A', G: 'C', C: 'G' } };
  B.BASES = { DNA: ['A', 'T', 'G', 'C'], RNA: ['A', 'U', 'G', 'C'] };
  B.BASE_NAMES = { A: 'أدينين', T: 'ثايمين', G: 'جوانين', C: 'سايتوسين', U: 'يوراسيل' };
  // A–T (أو A–U) رابطتان هيدروجينيتان، G–C ثلاث روابط (ص 22)
  B.hBonds = (b) => (b === 'G' || b === 'C' ? 3 : 2);
  B.normSeq = (s) => String(s || '').toUpperCase().replace(/[\s\-–,،]/g, '');
  // يرجع رسالة خطأ أو null
  B.validateSeq = function (s, type) {
    s = B.normSeq(s); type = type || 'DNA';
    if (!s.length) return 'اكتب تتابعاً من القواعد النيتروجينية (حرف واحد على الأقل).';
    const ok = B.BASES[type];
    const bad = [...new Set(s.split('').filter((c) => ok.indexOf(c) < 0))];
    if (bad.length) {
      const hint = type === 'DNA' && bad.indexOf('U') >= 0 ? ' القاعدة U (يوراسيل) توجد في RNA بدلاً من T، ولا توجد في DNA.' : type === 'RNA' && bad.indexOf('T') >= 0 ? ' القاعدة T (ثايمين) لا توجد في RNA؛ يحل محلها U (يوراسيل).' : '';
      return 'حروف غير مسموحة في ' + type + ': ' + bad.join('، ') + '. القواعد المسموحة: ' + ok.join('، ') + '.' + hint;
    }
    return null;
  };
  // السلسلة المكملة (DNA ← DNA أو RNA ← RNA) وعدد الروابط الهيدروجينية
  B.complement = function (s, type) {
    type = type || 'DNA'; s = B.normSeq(s);
    const err = B.validateSeq(s, type); if (err) throw new Error(err);
    const comp = s.split('').map((c) => PAIR[type][c]).join('');
    const h = s.split('').reduce((t, c) => t + B.hBonds(c), 0);
    const gc = s.split('').filter((c) => c === 'G' || c === 'C').length;
    return { seq: s, comp: comp, hBonds: h, pairs: s.length, gc: gc, at: s.length - gc };
  };
  // الطفرات الجينية: حذف أو إضافة (إدخال) أو استبدال قاعدة (ص 26)
  B.mutate = function (s, kind, i, base) {
    s = B.normSeq(s); const n = s.length;
    if (!n) throw new RangeError('empty');
    i = Math.max(0, Math.min(kind === 'insert' ? n : n - 1, Math.round(i)));
    let out;
    if (kind === 'delete') { if (n < 2) throw new RangeError('too short'); out = s.slice(0, i) + s.slice(i + 1); }
    else if (kind === 'insert') out = s.slice(0, i) + base + s.slice(i);
    else if (kind === 'substitute') { if (s[i] === base) return { seq: s, out: s, changed: 0, i: i, kind: kind, dLen: 0 }; out = s.slice(0, i) + base + s.slice(i + 1); }
    else throw new RangeError('kind');
    let changed = 0; for (let k = 0; k < Math.max(n, out.length); k++) if (s[k] !== out[k]) changed++;
    return { seq: s, out: out, changed: changed, i: i, kind: kind, dLen: out.length - n };
  };
  // التضاعف شبه المحافظ (ص 24): كل جزيء ناتج = سلسلة أصلية + سلسلة جديدة
  B.REPLICATION = [
    { name: 'فك الالتواء', enzyme: 'إنزيم هيليكيز', text: 'يعمل إنزيم الهيليكيز على فك التواء جزيء DNA وكسر الروابط الهيدروجينية بين القواعد، فتنفصل السلسلتان.' },
    { name: 'ارتباط القواعد في أزواج', enzyme: 'إنزيمات بلمرة DNA', text: 'ترتبط نيوكليوتيدات حرة بالقواعد المكملة لها على كل سلسلة أصلية (A مع T، و G مع C) بمساعدة إنزيمات بلمرة DNA.' },
    { name: 'إعادة ربط السلسلة', enzyme: 'إنزيم ربط DNA (لايغيز)', text: 'يربط إنزيم ربط DNA (لايغيز) أجزاء السلسلة الجديدة، فينتج جزيئان متماثلان، في كل منهما سلسلة أصلية وأخرى جديدة (تضاعف شبه محافظ).' }
  ];

  /* ---------- دورة الخلية (ص 34–42) ---------- */
  // جدول (1) ص 36: مدة مراحل الطور البيني بالساعات
  B.CYCLE_TABLE = {
    bean: { name: 'خلية نبات فاصولياء', G1: 5, S: 7, G2: 5, M: 2 },  // M = 2 ساعة من سؤال الكتاب (ص 41)
    mouse: { name: 'خلية مولدة الألياف في فأر', G1: 9, S: 10, G2: 2, M: null },
    gut: { name: 'خلايا بطانة الأمعاء في الإنسان', G1: 6, S: 12, G2: 5, M: null }
  };
  // نسب الأطوار من الزمن المعطى (إن لم يُعطَ الانقسام يُحسب على الطور البيني فقط)
  B.cycleShares = function (key) {
    const r = B.CYCLE_TABLE[key]; if (!r) throw new RangeError('cell');
    const parts = ['G1', 'S', 'G2'].concat(r.M ? ['M'] : []);
    const total = parts.reduce((t, k) => t + r[k], 0);
    const out = { total: total, interphase: r.G1 + r.S + r.G2, hasM: !!r.M, parts: parts };
    parts.forEach((k) => { out[k] = r[k] / total * 100; });
    return out;
  };
  B.MITOSIS = ['الطور البيني (مرحلة السكون)', 'الطور التمهيدي', 'الطور الاستوائي', 'الطور الانفصالي', 'الطور النهائي', 'انقسام السيتوبلازم'];
  // التحقق من العدد الكروموسومي 2n: عدد صحيح زوجي موجب
  B.validate2n = function (v) {
    if (typeof v !== 'number' || !Number.isFinite(v)) return 'أدخل عدداً.';
    if (v <= 0) return 'العدد الكروموسومي يجب أن يكون موجباً (أكبر من صفر).';
    if (!Number.isInteger(v)) return 'عدد الكروموسومات عدد صحيح، لا يكون كسراً.';
    if (v % 2) return 'العدد 2n زوجي دائماً لأن الكروموسومات في الخلية الجسمية أزواج متماثلة (مثل 46 = 23 + 23).';
    return null;
  };
  // عدد الكروموسومات وعدد الكروماتيدات في كل خلية في كل مرحلة من مراحل الانقسام المتساوي
  B.mitosisCounts = function (n2) {
    const e = B.validate2n(n2); if (e) throw new RangeError(e);
    return [
      { cells: 1, chrom: n2, chromatids: n2 * 2, note: 'بعد الطور S: كل كروموسوم مكوّن من كروماتيدين' },
      { cells: 1, chrom: n2, chromatids: n2 * 2 },
      { cells: 1, chrom: n2, chromatids: n2 * 2 },
      { cells: 1, chrom: n2 * 2, chromatids: n2 * 2, note: 'انشطار السنترومير: كل كروماتيد أصبح كروموسوماً' },
      { cells: 1, chrom: n2 * 2, chromatids: n2 * 2, note: 'مجموعتان من الكروموسومات عند القطبين' },
      { cells: 2, chrom: n2, chromatids: n2, note: 'خليتان متماثلتان، في كل منهما 2n' }
    ];
  };
  B.MEIOSIS = [
    'الطور البيني', 'الطور التمهيدي الأول', 'الطور الاستوائي الأول', 'الطور الانفصالي الأول', 'الطور النهائي الأول وانقسام السيتوبلازم',
    'الطور التمهيدي الثاني', 'الطور الاستوائي الثاني', 'الطور الانفصالي الثاني', 'الطور النهائي الثاني وانقسام السيتوبلازم'
  ];
  B.meiosisCounts = function (n2) {
    const e = B.validate2n(n2); if (e) throw new RangeError(e);
    const n = n2 / 2;
    return [
      { cells: 1, chrom: n2, chromatids: n2 * 2, ploidy: '2n' },
      { cells: 1, chrom: n2, chromatids: n2 * 2, ploidy: '2n', tetrads: n },
      { cells: 1, chrom: n2, chromatids: n2 * 2, ploidy: '2n', tetrads: n },
      { cells: 1, chrom: n2, chromatids: n2 * 2, ploidy: '2n' },
      { cells: 2, chrom: n, chromatids: n2, ploidy: 'n' },
      { cells: 2, chrom: n, chromatids: n2, ploidy: 'n' },
      { cells: 2, chrom: n, chromatids: n2, ploidy: 'n' },
      { cells: 2, chrom: n2, chromatids: n2, ploidy: 'n', note: 'في كل خلية مجموعتان من n عند القطبين قبل انقسام السيتوبلازم' },
      { cells: 4, chrom: n, chromatids: n, ploidy: 'n' }
    ];
  };
  // عدد التراكيب الممكنة من التوزيع الحر للأزواج (دون عبور) = 2^n — يُستعمل وصفياً فقط
  B.independentCombos = (n) => Math.pow(2, n);

  /* ---------- تكوين الغاميتات (ص 47–49) ---------- */
  B.SPERM = [
    { cell: 'خلايا جذعية', ploidy: '', via: '' },
    { cell: 'خلايا منوية أم', ploidy: '2n', via: 'انقسام متساوٍ' },
    { cell: 'خلايا تناسلية أولية', ploidy: '2n', via: 'انقسام متساوٍ' },
    { cell: 'خلايا منوية أولية', ploidy: '2n', via: 'نمو' },
    { cell: 'خلايا منوية ثانوية', ploidy: 'n', via: 'المرحلة الأولى من الانقسام المنصف' },
    { cell: 'طلائع منوية', ploidy: 'n', via: 'المرحلة الثانية من الانقسام المنصف' },
    { cell: 'حيوانات منوية', ploidy: 'n', via: 'النضج والتمايز' }
  ];
  B.EGG = [
    { cell: 'خلايا جذعية', ploidy: '', via: '' },
    { cell: 'خلية بيضية أم', ploidy: '2n', via: 'انقسام متساوٍ' },
    { cell: 'خلية بيضية أولية', ploidy: '2n', via: 'انقسام متساوٍ ثم نمو', when: 'تحدث هذه المراحل في أثناء الفترة الجنينية' },
    { cell: 'خلية بيضية ثانوية + جسم قطبي أول', ploidy: 'n', via: 'المرحلة الأولى من الانقسام المنصف', when: 'بعد البلوغ' },
    { cell: 'بويضة ملقحة', ploidy: '', via: 'اختراق بحيوان منوي' },
    { cell: 'بويضة ناضجة + جسم قطبي ثانٍ', ploidy: 'n', via: 'المرحلة الثانية من الانقسام المنصف' },
    { cell: 'بويضة مخصبة', ploidy: '2n', via: 'نضج وتمايز' }
  ];

  /* ---------- الأنسجة (ص 58–66) ---------- */
  B.LEVELS = ['ذرات', 'جزيئات صغيرة', 'جزيئات كبيرة', 'عضيات', 'خلايا', 'نسيج', 'عضو', 'جهاز', 'كائن حي'];
  // جدول (1) ص 60: أنواع النسيج الطلائي ومواقعها
  B.EPITHELIA = [
    { name: 'طلائي حرشفي بسيط', where: 'يبطن التجاويف المحيطة بالرئتين والقلب', layers: 1, shape: 'squamous' },
    { name: 'طلائي حرشفي طبقي', where: 'البشرة (الجلد)', layers: 4, shape: 'squamous' },
    { name: 'طلائي مكعب طبقي', where: 'قنوات الغدد العرقية', layers: 2, shape: 'cuboidal' },
    { name: 'طلائي عمادي بسيط', where: 'يبطن المعدة', layers: 1, shape: 'columnar' },
    { name: 'طلائي عمادي طبقي كاذب', where: 'الغشاء المخاطي للقصبة الهوائية', layers: 1, shape: 'pseudo' },
    { name: 'طلائي عمادي طبقي', where: 'الغدد اللعابية', layers: 2, shape: 'columnar' }
  ];

  /* ---------- الدورة الشهرية (ص 72–73، الشكل 8) ---------- */
  // محور الأيام في الشكل (8): ١–٢٨، والتبويض في اليوم ١٤. مستويات الهرمونات في الشكل نوعية (دون أرقام).
  B.CYCLE_DAYS = 28; B.OVULATION_DAY = 14;
  B.menstrualPhase = (day) => (day <= 5 ? 'الطمث' : day < 14 ? 'مرحلة النمو' : day === 14 ? 'التبويض' : 'مرحلة الإفراز');
  B.ovaryPhase = (day) => (day < 14 ? 'تطور الحويصلة' : day === 14 ? 'التبويض (خروج الخلية البيضية الثانوية من حويصلة غراف)' : day <= 24 ? 'تطور الجسم الأصفر' : 'اضمحلال الجسم الأصفر');
  // منحنيات نوعية (٠–١) تحاكي أشكال الشكل (8) — نموذج مبسّط لأغراض التعليم
  const g = (x, m, s) => Math.exp(-((x - m) * (x - m)) / (2 * s * s));
  B.hormone = {
    FSH: (d) => 0.32 + 0.08 * g(d, 4, 3) + 0.38 * g(d, 13.6, 0.9) - 0.08 * g(d, 21, 4),
    LH: (d) => 0.22 + 0.72 * g(d, 13.8, 0.8),
    estrogen: (d) => 0.18 + 0.62 * g(d, 12.5, 2.2) + 0.32 * g(d, 21, 3),
    progesterone: (d) => 0.1 + 0.68 * g(d, 21, 3.2)
  };
  // سمك بطانة الرحم (نوعي): تنسلخ في الطمث ثم تزداد سمكاً
  B.endometrium = (d) => (d <= 5 ? 0.35 - 0.2 * (d - 1) / 4 : Math.min(1, 0.15 + 0.85 * (d - 5) / 16));

  /* ---------- الجهاز البولي (ص 85–89) ---------- */
  B.NEPHRON = ['محفظة بومان', 'الأنبوب الملتوي القريب', 'التواء هنلي', 'الأنبوب الملتوي البعيد', 'الأنبوب الجامع'];
  B.URINE_STEPS = ['الترشيح', 'إعادة الامتصاص', 'الإفراز الأنبوبي'];
  B.REABSORB = 99; // تتم إعادة امتصاص 99% من السائل الراشح؛ والباقي 1% يخرج بولاً (ص 88)
  B.NEPHRONS_PER_KIDNEY = 1.3e6; // حوالي 1.3 مليون نفرون في كل كلية (ص 87)

  /* ---------- التصنيف (ص 98–101) ---------- */
  B.DOMAINS = [
    { name: 'مجال البكتيريا القديمة', kingdoms: ['مملكة البكتيريا القديمة'] },
    { name: 'مجال البكتيريا', kingdoms: ['مملكة البكتيريا'] },
    { name: 'مجال حقيقية النوى', kingdoms: ['مملكة الطلائعيات', 'مملكة الفطريات', 'المملكة الحيوانية', 'المملكة النباتية'] }
  ];
  // الشكل (2) ص 101: التصنيف الهرمي للقط المنزلي
  B.CAT = [
    { level: 'مملكة', en: 'Kingdom', ar: 'المملكة الحيوانية', la: 'Animalia' },
    { level: 'قبيلة', en: 'Phylum', ar: 'الحبليات', la: 'Chordata' },
    { level: 'صف', en: 'Class', ar: 'الثدييات', la: 'Mammalia' },
    { level: 'رتبة', en: 'Order', ar: 'اللواحم', la: 'Carnivora' },
    { level: 'عائلة', en: 'Family', ar: 'السنوريات', la: 'Felidae' },
    { level: 'جنس', en: 'Genus', ar: 'القطط', la: 'Felis' },
    { level: 'نوع', en: 'Species', ar: 'القط', la: 'catus' }
  ];
  // أسماء علمية واردة في الكتاب (الجنس + النوع)
  B.SCI_NAMES = [
    { genus: 'Felis', species: 'catus', ar: 'القط المنزلي', page: 101 },
    { genus: 'Balantidium', species: 'coli', ar: 'البالانتيديوم', page: 106 },
    { genus: 'Entamoeba', species: 'histolytica', ar: 'الإنتاميبا', page: 107 },
    { genus: 'Plasmodium', species: 'vivax', ar: 'البلازموديوم', page: 109 },
    { genus: 'Rhizopus', species: 'stolonifer', ar: 'عفن الخبز', page: 116 },
    { genus: 'Aleuria', species: 'aurantia', ar: 'فطر قشر البرتقال', page: 117 }
  ];
  // تحقق الاسم العلمي: كلمتان (الجنس ثم النوع)
  // كما في الكتاب: الاسم العلمي = اسم الجنس ثم اسم النوع (الشكل 2 ص 101)، ويبدأ اسم الجنس بحرف كبير كما تُكتب الأسماء في الكتاب
  B.checkSciName = function (genus, species) {
    const msgs = [];
    if (!/^[A-Za-z]+$/.test(genus || '') || !/^[A-Za-z]+$/.test(species || '')) msgs.push('الاسم العلمي يتكون من كلمتين لاتينيتين: اسم الجنس ثم اسم النوع.');
    else if (genus[0] !== genus[0].toUpperCase()) msgs.push('يبدأ اسم الجنس بحرف كبير كما في الكتاب (Felis ، Plasmodium).');
    return msgs;
  };
  /* ---------- لعبة السحب والإفلات (فرز بطاقات في مجموعات) ----------
   * items: [{id, label, group}] ، bins: [{id, label, color, cap}] ؛ الحالة: st.pos[id] = binId أو null
   * تدعم السحب، أو النقر على البطاقة ثم النقر على المجموعة (للمس ولوحة المفاتيح البسيطة) */
  B.sorter = function (cfg) {
    const init = () => ({ pos: {}, drag: null, pick: null, moved: 0 });
    function layout(W, H, items, bins) {
      const nar = W < 640; const pad = 10;
      const cw0 = nar ? (W - 2 * pad - 8) / 2 : (cfg.cardW || 170), per0 = Math.max(1, Math.floor((W - 2 * pad + 8) / (cw0 + 8))), rows0 = Math.ceil(items.length / per0);
      const binTop = Math.min(H * 0.64, Math.max(H * (cfg.binTop || 0.4), 44 + rows0 * ((nar ? 32 : 34) + 8)));
      const cols = nar && bins.length > 3 ? 2 : bins.length, rows = Math.ceil(bins.length / cols); const bw = (W - pad * (cols + 1)) / cols, bh = (H - binTop - 10 - (rows - 1) * pad) / rows;
      const B2 = bins.map((b, i) => ({ id: b.id, x: W - pad - ((i % cols) + 1) * bw - (i % cols) * pad, y: binTop + Math.floor(i / cols) * (bh + pad), w: bw, h: bh, b: b }));
      const cw = nar ? (W - 2 * pad - 8) / 2 : (cfg.cardW || 170), ch = nar ? 32 : 34;
      return { bins: B2, cw: cw, ch: ch, pool: { x: pad, y: 34, w: W - 2 * pad, h: binTop - 44 } };
    }
    function place(L, items, st) {
      const out = {}; const perRow = Math.max(1, Math.floor((L.pool.w + 8) / (L.cw + 8))); let k = 0;
      items.forEach((it) => { if (st.pos[it.id]) return; const r = Math.floor(k / perRow), cI = k % perRow; out[it.id] = { x: L.pool.x + L.pool.w - (cI + 1) * (L.cw + 8) + 8, y: L.pool.y + r * (L.ch + 8) }; k++; });
      L.bins.forEach((bn) => { let j = 0; items.forEach((it) => { if (st.pos[it.id] !== bn.id) return; const cw = Math.min(L.cw, bn.w - 12); out[it.id] = { x: bn.x + (bn.w - cw) / 2, y: bn.y + 34 + j * (L.ch * 0.9 + 4), w: cw }; j++; }); });
      return out;
    }
    return {
      init: init,
      score(items, st) { let placed = 0, ok = 0; items.forEach((it) => { if (st.pos[it.id]) { placed++; if (st.pos[it.id] === it.group) ok++; } }); return { placed: placed, ok: ok, n: items.length, done: placed === items.length && ok === items.length }; },
      draw(ctx, D, W, H, c, items, bins, st, hits) {
        const L = layout(W, H, items, bins); const P = place(L, items, st);
        L.bins.forEach((bn) => { ctx.save(); D.rr(ctx, bn.x, bn.y, bn.w, bn.h, 12); ctx.fillStyle = (bn.b.color || '#2563eb') + '18'; ctx.fill(); ctx.setLineDash(st.pick ? [6, 4] : []); ctx.strokeStyle = bn.b.color || '#2563eb'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); B.para(ctx, D, bn.b.label, bn.x + bn.w / 2, bn.y + 14, bn.w - 10, { color: bn.b.color || '#2563eb', size: W < 640 ? 10 : 12, w: '800' }); hits.push({ id: 'bin:' + bn.id, x: bn.x, y: bn.y, w: bn.w, h: bn.h }); });
        D.txt(ctx, cfg.poolLabel || 'اسحب كل بطاقة إلى المجموعة المناسبة (أو انقر البطاقة ثم المجموعة)', W / 2, 16, { color: c.text, size: W < 640 ? 10.5 : 13, w: '700' });
        items.forEach((it) => {
          if (st.drag && st.drag.id === it.id) return; const q = P[it.id]; const w = q.w || L.cw; const h = q.w ? L.ch * 0.9 : L.ch;
          const placed = !!st.pos[it.id]; const ok = placed && st.pos[it.id] === it.group;
          B.card(ctx, D, q.x, q.y, w, h, it.label, { fill: st.pick === it.id ? '#fde68a' : placed ? (ok ? '#dcfce7' : '#fee2e2') : '#f1f5f9', stroke: placed ? (ok ? '#16a34a' : '#dc2626') : '#94a3b8', size: W < 640 ? 10 : 12, w: '700' });
          if (placed) D.txt(ctx, ok ? '✓' : '✗', q.x + 10, q.y + h / 2, { color: ok ? '#16a34a' : '#dc2626', size: 13, w: '800' });
          hits.push({ id: 'card:' + it.id, x: q.x, y: q.y, w: w, h: h });
        });
        if (st.drag) { const it = items.find((x) => x.id === st.drag.id); if (it) { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 10; B.card(ctx, D, st.drag.x - L.cw / 2, st.drag.y - L.ch / 2, L.cw, L.ch, it.label, { fill: '#fde68a', stroke: '#d97706', size: 12 }); ctx.restore(); } }
      },
      pointer(type, x, y, st, api, items, bins, onPlace) {
        const all = api.hits(); const find = (pre) => { for (let i = all.length - 1; i >= 0; i--) { const h = all[i]; if (h.id.indexOf(pre) === 0 && x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) return h.id.slice(pre.length); } return null; };
        if (type === 'down') { const id = find('card:'); if (id) { st.drag = { id: id, x: x, y: y, x0: x, y0: y }; return 'redraw'; } const bin = find('bin:'); if (bin && st.pick) { const cap = (bins.find((b) => b.id === bin) || {}).cap; if (cap) items.forEach((it) => { if (st.pos[it.id] === bin) st.pos[it.id] = null; }); st.pos[st.pick] = bin; const pid = st.pick; st.pick = null; if (onPlace) onPlace(pid, bin); return true; } return false; }
        if (type === 'move' && st.drag) { st.drag.x = x; st.drag.y = y; return 'redraw'; }
        if (type === 'up' && st.drag) {
          const d = st.drag; st.drag = null; const moved = Math.hypot(x - d.x0, y - d.y0);
          if (moved < 6) { st.pick = st.pick === d.id ? null : d.id; return true; }
          const bin = find('bin:'); if (bin) { const cap = (bins.find((b) => b.id === bin) || {}).cap; if (cap) items.forEach((it) => { if (st.pos[it.id] === bin && it.id !== d.id) st.pos[it.id] = null; }); st.pos[d.id] = bin; if (onPlace) onPlace(d.id, bin); } else st.pos[d.id] = null;
          st.pick = null; return true;
        }
        return false;
      }
    };
  };
  // الطلائعيات: ثلاث مجموعات حسب طريقة الحصول على الغذاء (ص 105)
  B.PROTISTS = [
    { name: 'البراميسيوم', group: 'animal', phylum: 'الهدبيات', move: 'الأهداب', page: 106 },
    { name: 'الأميبا', group: 'animal', phylum: 'الأميبيات', move: 'الأقدام الكاذبة', page: 107 },
    { name: 'الجيارديا', group: 'animal', phylum: 'السوطيات', move: 'الأسواط', page: 108 },
    { name: 'الليشمانيا', group: 'animal', phylum: 'السوطيات', move: 'الأسواط', page: 108 },
    { name: 'البلازموديوم', group: 'animal', phylum: 'البوغيات', move: 'تفتقر إلى وسائل الحركة', page: 109 },
    { name: 'اليوغلينا', group: 'plant', phylum: 'الطحالب اليوغلينية', move: 'سوط', page: 109 },
    { name: 'الدياتومات', group: 'plant', phylum: 'الدياتومات', move: '', page: 110 },
    { name: 'الكلب العملاق', group: 'plant', phylum: 'الطحالب البنية', move: '', page: 110 },
    { name: 'طحلب أحمر', group: 'plant', phylum: 'الطحالب الحمراء', move: '', page: 110 },
    { name: 'الفطريات الغروية', group: 'fungus', phylum: 'الفطريات الغروية', move: 'تتحرك على شكل كتلة مخاطية', page: 111 }
  ];
  B.PROTIST_GROUPS = { animal: 'الطلائعيات شبيهة الحيوانات (الأوليات)', plant: 'الطلائعيات شبيهة النباتات (الطحالب)', fungus: 'الطلائعيات شبيهة الفطريات' };
  // قبائل الطحالب (ص 109–110): الصبغات، الغذاء المخزن، الجدار الخلوي
  B.ALGAE = [
    { name: 'الطحالب الخضراء', pig: 'الكلوروفيل والكاروتين', store: 'نشا', wall: 'السليلوز' },
    { name: 'الطحالب اليوغلينية', pig: 'الكلوروفيل والكاروتين', store: '—', wall: '—' },
    { name: 'الدياتومات', pig: 'الكلوروفيل والكاروتين', store: 'زيوت', wall: 'أصداف مزدوجة من السيليكا' },
    { name: 'الطحالب الحمراء', pig: 'صبغة حمراء فيكوبلين', store: 'نشا', wall: 'السليلوز' },
    { name: 'الطحالب الذهبية', pig: 'الكاروتين', store: 'زيوت أو سكر', wall: 'السليلوز والسيليكا' },
    { name: 'الطحالب البنية', pig: 'الكاروتين الثانوية', store: 'عديدة التسكر', wall: '—' }
  ];
  // قبائل الفطريات (ص 116–117)
  B.FUNGI = [
    { name: 'الفطريات اللزجية', key: 'chytrid', trait: 'أبواغها تمتلك أسواطاً', ex: '' },
    { name: 'الفطريات الاقترانية', key: 'zygo', trait: 'خيوطها الفطرية من النوع المدمج', ex: 'عفن الخبز' },
    { name: 'الفطريات الغلوميرية', key: 'glom', trait: 'تعيش على جذور النباتات معيشة تقايضية', ex: '' },
    { name: 'الفطريات الزقية (الكيسية)', key: 'asco', trait: 'تنتج أبواغها داخل أكياس', ex: 'فطر قشر البرتقال، الخمائر' },
    { name: 'الفطريات الدعامية', key: 'basidio', trait: 'تكوّن بازيديوم يشبه المضرب تعلوه أبواغ بازيدية', ex: 'المشروم (الفقع)' }
  ];

  /* ---------- أدوات رسم مشتركة ---------- */
  // دائرة/شكل بيضوي مع منطقة نقر
  B.blob = function (ctx, cx, cy, rx, ry, fill, stroke, lw) { ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.stroke(); } };
  // كروموسوم (كروماتيدان أو كروماتيد واحد) بزاوية
  B.chromosome = function (ctx, x, y, len, ang, color, twin, w) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang || 0); ctx.lineCap = 'round'; ctx.strokeStyle = color; ctx.lineWidth = w || 6;
    if (twin) { ctx.beginPath(); ctx.moveTo(-3.5, -len / 2); ctx.quadraticCurveTo(-1, 0, -3.5, len / 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(3.5, -len / 2); ctx.quadraticCurveTo(1, 0, 3.5, len / 2); ctx.stroke(); ctx.fillStyle = '#334155'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, 7); ctx.fill(); }
    else { ctx.beginPath(); ctx.moveTo(0, -len / 2); ctx.lineTo(0, len / 2); ctx.stroke(); }
    ctx.restore();
  };
  // بطاقة نصية بمنطقة نقر
  B.card = function (ctx, D, x, y, w, h, text, o) {
    o = o || {}; ctx.save();
    D.rr(ctx, x, y, w, h, o.r || 10); ctx.fillStyle = o.fill || '#eef2ff'; ctx.fill();
    if (o.stroke) { ctx.lineWidth = o.lw || 2; ctx.strokeStyle = o.stroke; ctx.stroke(); }
    ctx.restore();
    // يصغر الخط أو يلتف النص على سطرين إن لم يتسع
    let size = o.size || 13; const fw = o.w || '700'; const fit = (t, sz) => { ctx.save(); ctx.font = fw + ' ' + sz + 'px system-ui, Tajawal, sans-serif'; const m = ctx.measureText(t).width; ctx.restore(); return m <= w - 20; };
    while (size > 8.5 && !fit(text, size)) size -= 0.5;
    const opt = { color: o.color || '#1e293b', size: size, w: fw };
    if (fit(text, size) || String(text).indexOf(' ') < 0) { D.txt(ctx, text, x + w / 2, y + h / 2, opt); return; }
    const words = String(text).split(' '); let best = 1, bd = 1e9; for (let i = 1; i < words.length; i++) { const dd = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length); if (dd < bd) { bd = dd; best = i; } }
    D.txt(ctx, words.slice(0, best).join(' '), x + w / 2, y + h / 2 - size * 0.6, opt); D.txt(ctx, words.slice(best).join(' '), x + w / 2, y + h / 2 + size * 0.6, opt);
  };
  // فقرة ملتفة على عدة أسطر (وسطها x) — للنصوص الطويلة على الرسم
  B.para = function (ctx, D, text, x, y, maxW, o) {
    o = o || {}; const size = o.size || 13; ctx.save(); ctx.font = (o.w || '600') + ' ' + size + 'px system-ui, Tajawal, sans-serif';
    const words = String(text).split(/\s+/); const lines = []; let cur = '';
    words.forEach((w) => { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
    if (cur) lines.push(cur); ctx.restore();
    const lh = size * 1.45; const y0 = o.bottom ? y - (lines.length - 1) * lh : y;
    lines.forEach((l, i) => D.txt(ctx, l, x, y0 + i * lh, Object.assign({}, o, { size: size })));
    return lines.length * lh;
  };
  B.PAL = ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#65a30d'];
  B.BASE_COL = { A: '#dc2626', T: '#2563eb', U: '#0891b2', G: '#059669', C: '#d97706' };
})(typeof window !== 'undefined' ? window : globalThis);
