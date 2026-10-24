/* واجهة التطبيق: التوجيه، الصفحة الرئيسية، صفحة المحاكاة، الأوضاع، المساعد */
(function (root) {
  'use strict';
  const ML = root.ML = root.ML || {};
  const M = ML.math;
  ML.sims = ML.sims || [];
  ML.register = (s) => {
    s.subject = s.subject || 'g10-math';
    // مراحل (stage): قيمة صحيحة هي رقم المرحلة في قائمة أسماء المراحل
    (s.params || []).forEach((q) => { if (q.type === 'stage') { q.min = 0; q.max = (typeof q.stages === 'function' ? q.stages({}) : q.stages).length - 1; q.step = 1; q.int = true; } });
    ML.sims.push(s);
  };
  // اختبار النقر: آخر منطقة مرسومة تحت المؤشر (مستطيل {x,y,w,h} أو دائرة {cx,cy,r})
  ML.hitTest = function (hits, x, y) {
    for (let i = (hits || []).length - 1; i >= 0; i--) {
      const h = hits[i];
      if (h.r !== undefined ? Math.hypot(x - h.cx, y - h.cy) <= h.r : x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) return h;
    }
    return null;
  };
  const ORD = ['', 'الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة', 'الثامنة'];
  ML.ORD = ORD;

  /* ---------- الصفوف والمواد ---------- */
  ML.SITE = 'المختبر التفاعلي - المنهاج الفلسطيني';
  ML.SITE_EN = 'Interactive Lab — Palestinian Curriculum';
  ML.grades = [{ id: 'g4', name: 'الصف الرابع', en: 'Grade 4', subjects: ['g4-math'] },
    { id: 'g9', name: 'الصف التاسع', en: 'Grade 9', subjects: ['g9-math', 'g9-science'] },
    { id: 'g10', name: 'الصف العاشر', en: 'Grade 10', subjects: ['g10-math', 'g10-physics', 'g10-bio', 'g10-chem', 'g10-digital'] },
    { id: 'g12', name: 'الصف الثاني عشر العلمي', en: 'Grade 12 (Scientific)', subjects: ['g12-physics'] }];
  ML.subjects = {
    'g4-math': {
      id: 'g4-math', grade: 'g4', slug: 'math', name: 'الرياضيات', en: 'Mathematics', icon: '½',
      title: 'مختبر الرياضيات التفاعلي', titleEn: 'Interactive Mathematics Lab — Grade 4',
      book: 'كتاب الرياضيات — الصف الرابع الأساسي، الجزء الأول', bookEd: 'دولة فلسطين، الطبعة الرابعة 2020م / 1441هـ',
      lead: 'أنشطة كتاب الرياضيات للصف الرابع تجارب تلمسها بيدك: الأعداد الكبيرة بالمعداد ولوحة المنازل، والجمع والطرح ضمن الملايين والتقريب، والضرب بالمجسمات، والقسمة الطويلة، ولوحة الكسور، والكسور المتكافئة وجمعها وطرحها، والأعداد الكسرية، والمستقيمات والزوايا بالمنقلة، وزوايا المثلث، وجداول البيانات والتمثيل بالصور والأعمدة — بأعداد الكتاب وأمثلته.',
      search: 'ابحث عن درس أو مفهوم… (مثال: المليون، القيمة المنزلية، التقريب، الاستلاف، القسمة الطويلة، الكسور المتكافئة، المنقلة)',
      tutor: 'مساعد الرياضيات الذكي', tutorEn: 'AI Math Tutor', idle: 'غيّر أي أداة تحكم أو اضغط على الرسم، وسأشرح لك هنا ماذا حدث ولماذا — بلغة الكتاب.',
      units: [
        { n: 1, ar: 'الأعداد الكبيرة', en: 'Large Numbers', icon: '🔢', pages: '2–24', color: 'u1' },
        { n: 2, ar: 'جمع الأعداد ضمن الملايين وطرحها', en: 'Adding & Subtracting within Millions', icon: '±', pages: '25–41', color: 'u2' },
        { n: 3, ar: 'الضرب والقسمة (1)', en: 'Multiplication and Division (1)', icon: '÷', pages: '42–65', color: 'u3' },
        { n: 4, ar: 'الكسور العادية والأعداد الكسرية', en: 'Fractions and Mixed Numbers', icon: '½', pages: '66–89', color: 'u4' },
        { n: 5, ar: 'الهندسة والقياس (1)', en: 'Geometry and Measurement (1)', icon: '📐', pages: '90–108', color: 'u1' },
        { n: 6, ar: 'البيانات', en: 'Data', icon: '📊', pages: '109–120', color: 'u2' }
      ]
    },
    'g9-science': {
      id: 'g9-science', grade: 'g9', slug: 'science', name: 'العلوم', en: 'Science', icon: '🔬', part: 'الدرس', unitLabel: 'الوحدة',
      title: 'مختبر العلوم التفاعلي', titleEn: 'Interactive Science Lab — Grade 9',
      book: 'كتاب العلوم والحياة — الصف التاسع، الجزء الأول', bookEd: 'دولة فلسطين، المنهاج الفلسطيني',
      lead: 'نفّذ أنشطة الكتاب كأنك في المختبر: المغذيات والهضم والتنفس والقلب والدم، ثم الدارات وقانون أوم والأعمدة والقدرة الكهربائية، ثم النجوم والمجرات — بقيم الكتاب وصيغته العربية.',
      search: 'ابحث عن نشاط أو مفهوم… (مثال: بندكت، النبض، قانون أوم، القدرة، الطيف، المجرات)',
      tutor: 'مساعد العلوم الذكي', tutorEn: 'AI Science Tutor', idle: 'غيّر أي متغير أو شغّل النشاط، وسأشرح لك هنا ماذا حدث ولماذا — بما ورد في الكتاب.',
      units: [
        { n: 1, unitAr: 'الوحدة الأولى: أجهزة جسم الإنسان', ar: 'المغذيات والجهاز الهضمي', en: 'Nutrients and the Digestive System', icon: '🍎', pages: '5–23', color: 'u1' },
        { n: 2, unitAr: 'الوحدة الأولى: أجهزة جسم الإنسان', ar: 'الجهاز التنفسي', en: 'The Respiratory System', icon: '🫁', pages: '24–34', color: 'u2' },
        { n: 3, unitAr: 'الوحدة الأولى: أجهزة جسم الإنسان', ar: 'الجهاز الدوراني', en: 'The Circulatory System', icon: '❤', pages: '35–45', color: 'u3' },
        { n: 4, unitAr: 'الوحدة الأولى: أجهزة جسم الإنسان', ar: 'الجهاز الليمفي', en: 'The Lymphatic System', icon: '🛡', pages: '46–49', color: 'u4' },
        { n: 5, unitAr: 'الوحدة الثانية: الكهرباء في حياتنا', ar: 'التيار الكهربائي والدارات الكهربائية', en: 'Electric Current and Circuits', icon: '💡', pages: '55–62', color: 'u5' },
        { n: 6, unitAr: 'الوحدة الثانية: الكهرباء في حياتنا', ar: 'المقاومات الكهربائية وقانون أوم', en: "Electrical Resistors and Ohm's Law", icon: 'Ω', pages: '63–76', color: 'u6' },
        { n: 7, unitAr: 'الوحدة الثانية: الكهرباء في حياتنا', ar: 'الأعمدة الكهربائية والقوة الدافعة الكهربائية', en: 'Electric Cells and EMF', icon: '🔋', pages: '77–82', color: 'u1' },
        { n: 8, unitAr: 'الوحدة الثانية: الكهرباء في حياتنا', ar: 'القدرة والطاقة الكهربائية', en: 'Electric Power and Energy', icon: '⚡', pages: '83–93', color: 'u2' },
        { n: 9, unitAr: 'الوحدة الثالثة: مصابيح السماء', ar: 'النجوم', en: 'Stars', icon: '⭐', pages: '96–111', color: 'u3' },
        { n: 10, unitAr: 'الوحدة الثالثة: مصابيح السماء', ar: 'المجرات', en: 'Galaxies', icon: '🌌', pages: '112–122', color: 'u4' }
      ]
    },
    'g9-math': {
      id: 'g9-math', grade: 'g9', slug: 'math', name: 'الرياضيات', en: 'Mathematics', icon: '√',
      title: 'مختبر الرياضيات التفاعلي', titleEn: 'Interactive Mathematics Lab — Grade 9',
      book: 'كتاب الرياضيات — الصف التاسع الأساسي، الجزء الأول', bookEd: 'دولة فلسطين، يُدرَّس بدءاً من العام الدراسي 2017/2018م',
      lead: 'حوّل أنشطة كتاب الرياضيات إلى تجارب حيّة: غيّر الأعداد والمجموعات والنقاط والبيانات وشاهد أثرها فوراً — على خط الأعداد، وبالمخططات السهمية، وفي المستوى الديكارتي، وبالجداول والتمثيلات الإحصائية.',
      search: 'ابحث عن درس أو مفهوم… (مثال: إنطاق المقام، الاقتران النظير، الميل، الانحراف المعياري)',
      tutor: 'مساعد الرياضيات الذكي', tutorEn: 'AI Math Tutor', idle: 'غيّر أي أداة تحكم، وسأشرح لك هنا ماذا تغيّر ولماذا — بلغة الكتاب ورموزه.',
      units: [
        { n: 1, ar: 'الأعداد الحقيقية', en: 'Real Numbers', icon: '√', pages: '4–29', color: 'u1' },
        { n: 2, ar: 'العلاقات والاقترانات', en: 'Relations and Functions', icon: 'ƒ', pages: '30–63', color: 'u2' },
        { n: 3, ar: 'الهندسة والقياس', en: 'Geometry and Measurement', icon: '📐', pages: '64–83', color: 'u3' },
        { n: 4, ar: 'الإحصاء', en: 'Statistics', icon: '📊', pages: '84–104', color: 'u4' }
      ]
    },
    'g10-math': {
      id: 'g10-math', grade: 'g10', slug: 'math', name: 'الرياضيات', en: 'Mathematics', icon: '∫',
      title: 'مختبر الرياضيات التفاعلي', titleEn: 'Interactive Mathematics Simulation Lab',
      book: 'كتاب الرياضيات — الصف العاشر', bookEd: 'دولة فلسطين، الطبعة الرابعة 2026م / 1448هـ',
      lead: 'حوّل قوانين كتاب الرياضيات إلى تجارب حيّة: غيّر المعاملات وشاهد أثرها فوراً — بصرياً وجبرياً.',
      search: 'ابحث عن درس أو مفهوم… (مثال: دائرة الوحدة، كريمر، المتباينات)',
      tutor: 'مساعد الرياضيات الذكي', tutorEn: 'AI Math Tutor', idle: 'حرّك أي منزلق، وسأشرح لك هنا ماذا تغيّر في الشكل ولماذا — هندسياً وجبرياً.',
      units: [
        { n: 1, ar: 'المنطق الرياضي', en: 'Mathematical Logic', icon: '∧', pages: '7–28', color: 'u1' },
        { n: 2, ar: 'الاقترانات ورسومها البيانية', en: 'Functions and Their Graphs', icon: 'ƒ', pages: '29–78', color: 'u2' },
        { n: 3, ar: 'الهندسة: الدائرة', en: 'Geometry: The Circle', icon: '◯', pages: '79–98', color: 'u3' },
        { n: 4, ar: 'الاقترانات المثلثية', en: 'Trigonometric Functions', icon: '∿', pages: '99–140', color: 'u4' },
        { n: 5, ar: 'المصفوفات', en: 'Matrices', icon: '▦', pages: '141–175', color: 'u5' },
        { n: 6, ar: 'طرق العد ونظرية ذات الحدين', en: 'Counting & Binomial Theorem', icon: 'n!', pages: '176–193', color: 'u6' }
      ]
    },
    'g10-physics': {
      id: 'g10-physics', grade: 'g10', slug: 'physics', name: 'الفيزياء', en: 'Physics', icon: '⚛',
      title: 'مختبر الفيزياء التفاعلي', titleEn: 'Interactive Physics Simulation Lab',
      book: 'كتاب الفيزياء — الصف العاشر', bookEd: 'دولة فلسطين، الطبعة الثالثة 2020م / 1441هـ',
      lead: 'غيّر المتغيرات وشاهد التجربة تتحرك أمامك: المتغيرات ← التجربة ← النتيجة ← الرسم البياني ← التفسير.',
      search: 'ابحث عن قانون أو تجربة… (مثال: نيوتن، أرخميدس، الحرارة النوعية)',
      tutor: 'مساعد الفيزياء الذكي', tutorEn: 'AI Physics Tutor', idle: 'غيّر أي متغير أو شغّل التجربة، وسأشرح لك هنا ماذا تغيّر في النتيجة ولماذا — فيزيائياً ورياضياً.',
      units: [
        { n: 1, unitAr: 'الوحدة الأولى: الميكانيكا', ar: 'الفيزياء والقياس', en: 'Physics and Measurement', icon: '📏', pages: '4–14', color: 'u1' },
        { n: 2, unitAr: 'الوحدة الأولى: الميكانيكا', ar: 'المتجهات', en: 'Vectors', icon: '↗', pages: '15–23', color: 'u2' },
        { n: 3, unitAr: 'الوحدة الأولى: الميكانيكا', ar: 'وصف الحركة', en: 'Kinematics', icon: '➜', pages: '24–43', color: 'u3' },
        { n: 4, unitAr: 'الوحدة الأولى: الميكانيكا', ar: 'قوانين نيوتن', en: "Newton's Laws of Motion", icon: 'F', pages: '44–60', color: 'u4' },
        { n: 5, unitAr: 'الوحدة الثانية', ar: 'الموائع', en: 'Fluids', icon: '💧', pages: '61–82', color: 'u5' },
        { n: 6, unitAr: 'الوحدة الثالثة: الحرارة', ar: 'الحرارة وأثرها على المواد', en: 'Heat and its Effect on Materials', icon: '🌡', pages: '85–106', color: 'u6' },
        { n: 7, unitAr: 'الوحدة الثالثة: الحرارة', ar: 'الديناميكا الحرارية', en: 'Thermodynamics', icon: '♨', pages: '107–125', color: 'u1' },
        { n: 8, unitAr: 'الوحدة الرابعة', ar: 'الفلك', en: 'Astronomy', icon: '✦', pages: '126–151', color: 'u2' }
      ]
    },
    'g10-bio': {
      id: 'g10-bio', grade: 'g10', slug: 'biology', name: 'العلوم الحياتية', en: 'Life Sciences', icon: '🧬',
      title: 'مختبر العلوم الحياتية التفاعلي', titleEn: 'Interactive Life Sciences Simulation Lab',
      book: 'كتاب العلوم الحياتية — الصف العاشر', bookEd: 'دولة فلسطين، الطبعة الثالثة 2020م / 1441هـ',
      lead: 'شاهد ما يجري داخل الخلية والجسم: كبّر، قارن، انتقل بين المراحل، واسحب وأفلت — بمصطلحات الكتاب نفسها.',
      search: 'ابحث عن درس أو مفهوم… (مثال: المجهر، DNA، الانقسام المنصف، النفرون)',
      tutor: 'مساعد العلوم الحياتية الذكي', tutorEn: 'AI Life Sciences Tutor', idle: 'غيّر أي أداة تحكم أو انتقل إلى المرحلة التالية، وسأشرح لك هنا ماذا حدث ولماذا — بمصطلحات الكتاب.',
      units: [
        { n: 1, unitAr: 'الوحدة الأولى: الخلية - تركيب ووظائف', ar: 'المجاهر وأنواعها', en: 'Microscopes and Their Types', icon: '🔬', pages: '4–9', color: 'u1' },
        { n: 2, unitAr: 'الوحدة الأولى: الخلية - تركيب ووظائف', ar: 'الخلايا: التركيب ووظائف الأجزاء', en: 'Cells: Structure and Function', icon: '🦠', pages: '10–18', color: 'u2' },
        { n: 3, unitAr: 'الوحدة الأولى: الخلية - تركيب ووظائف', ar: 'المادة الوراثية', en: 'The Genetic Material', icon: '🧬', pages: '19–28', color: 'u3' },
        { n: 4, unitAr: 'الوحدة الثانية: دورة الخلية والانقسام الخلوي', ar: 'دورة الخلية', en: 'The Cell Cycle', icon: '🔄', pages: '34–42', color: 'u4' },
        { n: 5, unitAr: 'الوحدة الثانية: دورة الخلية والانقسام الخلوي', ar: 'الانقسام المنصف وتكوين الغاميتات', en: 'Meiosis and Gametogenesis', icon: '➗', pages: '43–52', color: 'u5' },
        { n: 6, unitAr: 'الوحدة الثالثة: أجهزة جسم الإنسان', ar: 'أنسجة جسم الإنسان', en: 'Human Body Tissues', icon: '🧫', pages: '58–67', color: 'u6' },
        { n: 7, unitAr: 'الوحدة الثالثة: أجهزة جسم الإنسان', ar: 'الجهازان التناسليان والتكاثر', en: 'Reproductive Systems and Reproduction', icon: '🫄', pages: '68–83', color: 'u1' },
        { n: 8, unitAr: 'الوحدة الثالثة: أجهزة جسم الإنسان', ar: 'الجهاز البولي', en: 'The Urinary System', icon: '🫘', pages: '84–93', color: 'u2' },
        { n: 9, unitAr: 'الوحدة الرابعة: تصنيف الكائنات الحية', ar: 'الكائنات الحية وتصنيفها', en: 'Living Organisms and Their Taxonomy', icon: '🌳', pages: '98–102', color: 'u3' },
        { n: 10, unitAr: 'الوحدة الرابعة: تصنيف الكائنات الحية', ar: 'مملكة الطلائعيات', en: 'Kingdom Protista', icon: '🦠', pages: '103–112', color: 'u4' },
        { n: 11, unitAr: 'الوحدة الرابعة: تصنيف الكائنات الحية', ar: 'مملكة الفطريات', en: 'Kingdom Fungi', icon: '🍄', pages: '113–120', color: 'u5' }
      ]
    },
    'g10-chem': {
      id: 'g10-chem', grade: 'g10', slug: 'chemistry', name: 'الكيمياء', en: 'Chemistry', icon: '⚗',
      title: 'مختبر الكيمياء التفاعلي', titleEn: 'Interactive 3D Chemistry Lab',
      book: 'كتاب الكيمياء — الصف العاشر', bookEd: 'دولة فلسطين، الطبعة الثالثة 2020م / 1441هـ',
      lead: 'ادخل المختبر ثلاثي الأبعاد: ارتدِ أدوات الوقاية، قِس وزِن وسخّن بنفسك، وشاهد التفاعل على مستوى الجزيئات والمعادلة معاً.',
      search: 'ابحث عن تجربة أو مفهوم… (مثال: حرارة الاحتراق، طارد، طاقة الرابطة)',
      tutor: 'مساعد الكيمياء الذكي', tutorEn: 'AI Chemistry Tutor', idle: 'نفّذ خطوة في المختبر أو غيّر متغيراً، وسأشرح لك هنا ماذا حدث ولماذا — بلغة الكتاب.',
      units: [
        { n: 1, ar: 'بنية الذرة والعناصر الكيميائية', en: 'Atomic Structure and Chemical Elements', icon: '⚛', pages: '2–28', color: 'u1' },
        { n: 2, ar: 'الحسابات الكيميائية', en: 'Chemical Calculations', icon: '⚖', pages: '29–49', color: 'u2' },
        { n: 3, ar: 'الماء في حياتنا', en: 'Water in Our Lives', icon: '💧', pages: '50–68', color: 'u3' },
        { n: 4, ar: 'مدخل إلى الكيمياء العضوية', en: 'Introduction to Organic Chemistry', icon: '⬡', pages: '69–99', color: 'u4' },
        { n: 5, ar: 'الطاقة في التفاعلات الكيميائية', en: 'Energy in Chemical Reactions', icon: '🔥', pages: '100–119', color: 'u5' }
      ]
    },
    'g10-digital': {
      id: 'g10-digital', grade: 'g10', slug: 'digital', name: 'المهارات الرقمية', en: 'Digital Skills', icon: '💻', part: 'الدرس', unitLabel: 'الوحدة',
      title: 'مختبر المهارات الرقمية التفاعلي', titleEn: 'Interactive Digital Skills Lab — Python',
      book: 'كتاب المهارات الرقمية — الصف العاشر', bookEd: 'دولة فلسطين، طبعة 2026م',
      lead: 'شغّل أكواد الكتاب سطراً سطراً: شاهد الذاكرة تتغير، والشروط تُفحص، والحلقات تدور، والمخرجات تظهر — بجداول تتبع مثل جداول الكتاب.',
      search: 'ابحث عن درس أو مفهوم… (مثال: جدول تتبع، elif، range، أولويات العمليات)',
      tutor: 'مساعد البرمجة الذكي', tutorEn: 'AI Programming Tutor', idle: 'انتقل خطوة في التتبع أو غيّر قيمة، وسأشرح لك هنا ماذا نفّذ الحاسوب ولماذا.',
      units: [
        { n: 1, unitAr: 'الوحدة الثانية: البرمجة بلغة بايثون', ar: 'الخوارزميات والمخطط الانسيابي', en: 'Algorithms and Flowcharts', icon: '⚙', pages: '38–43', color: 'u1' },
        { n: 2, unitAr: 'الوحدة الثانية: البرمجة بلغة بايثون', ar: 'المتغيرات والمعاملات والمنطق', en: 'Variables, Operators and Logic', icon: '🗄', pages: '44–57', color: 'u2' },
        { n: 3, unitAr: 'الوحدة الثانية: البرمجة بلغة بايثون', ar: 'صانع القرارات: الجمل الشرطية', en: 'Decisions: Conditional Statements', icon: '🔀', pages: '58–66', color: 'u3' },
        { n: 4, unitAr: 'الوحدة الثانية: البرمجة بلغة بايثون', ar: 'قوة التكرار: الحلقات التكرارية', en: 'Loops and Nested Loops', icon: '🔁', pages: '67–75', color: 'u4' },
        { n: 5, unitAr: 'الوحدة الثانية: البرمجة بلغة بايثون', ar: 'أسئلة الوحدة', en: 'Unit Questions', icon: '❓', pages: '76–77', color: 'u5' }
      ]
    },
    'g12-physics': {
      id: 'g12-physics', grade: 'g12', slug: 'physics', name: 'الفيزياء', en: 'Physics', icon: '⚛',
      title: 'مختبر الفيزياء التفاعلي', titleEn: 'Interactive Physics Simulation Lab — Grade 12',
      book: 'كتاب الفيزياء — الصف الثاني عشر العلمي', bookEd: 'دولة فلسطين، الطبعة الثانية 2020م / 1441هـ (معدّلة 2025)',
      lead: 'غيّر المتغيرات وشاهد التجربة تتحرك أمامك: المتغيرات ← التجربة ← النتيجة ← الرسم البياني ← التفسير — بقوانين الكتاب وبصيغة رموزه العربية.',
      search: 'ابحث عن قانون أو تجربة… (مثال: الزخم، التصادم، كيرشوف، فاراداي)',
      tutor: 'مساعد الفيزياء الذكي', tutorEn: 'AI Physics Tutor', idle: 'غيّر أي متغير أو شغّل التجربة، وسأشرح لك هنا ماذا تغيّر في النتيجة ولماذا — بقوانين الكتاب.',
      units: [
        { n: 1, unitAr: 'الوحدة الأولى: الميكانيكا', ar: 'الزخم الخطي والدفع', en: 'Linear Momentum and Impulse', icon: 'p', pages: '4–14', color: 'u1' },
        { n: 2, unitAr: 'الوحدة الأولى: الميكانيكا', ar: 'التصادمات', en: 'Collisions', icon: '💥', pages: '15–32', color: 'u2' },
        { n: 3, unitAr: 'الوحدة الأولى: الميكانيكا', ar: 'الحركة الدورانية', en: 'Rotational Motion', icon: '⟳', pages: '33–54', color: 'u3' },
        { n: 4, unitAr: 'الوحدة الثانية: الكهرباء المتحركة', ar: 'التيار الكهربائي والمقاومة', en: 'Electric Current and Resistance', icon: 'Ω', pages: '57–71', color: 'u4' },
        { n: 5, unitAr: 'الوحدة الثانية: الكهرباء المتحركة', ar: 'دارات التيار المستمر', en: 'Direct-Current Circuits', icon: '🔋', pages: '72–93', color: 'u5' },
        { n: 6, unitAr: 'الوحدة الثالثة: الكهرومغناطيسية', ar: 'المجال المغناطيسي', en: 'The Magnetic Field', icon: '🧲', pages: '96–109', color: 'u6' },
        { n: 7, unitAr: 'الوحدة الثالثة: الكهرومغناطيسية', ar: 'القوة المغناطيسية', en: 'The Magnetic Force', icon: 'F', pages: '110–122', color: 'u1' },
        { n: 8, unitAr: 'الوحدة الثالثة: الكهرومغناطيسية', ar: 'الحث الكهرومغناطيسي', en: 'Electromagnetic Induction', icon: '⚡', pages: '123–143', color: 'u2' }
      ]
    }
  };
  const SUBJ = (id) => ML.subjects[id || 'g10-math'];
  // الوحدات تُطلب برقمها في الكتاب (قد تبدأ من غير الأولى إذا رُفع جزء من الكتاب)
  const UNIT = (subj, n) => SUBJ(subj).units.find((u) => u.n === n);
  ML.unitOf = (sim) => UNIT(sim.subject, sim.unit);
  ML.unitName = function (a, b) {
    const subj = b === undefined ? 'g10-math' : a, n = b === undefined ? a : b;
    const u = UNIT(subj, n);
    if (u.unitAr) return u.unitAr + (u.unitAr.indexOf(':') >= 0 || u.unitAr.endsWith(u.ar) ? ' — ' + (SUBJ(subj).part || 'الفصل') + ': ' + u.ar : ': ' + u.ar);
    return 'الوحدة ' + ORD[n] + ' (' + u.ar + ')';
  };
  ML.simHref = (s) => '#/' + SUBJ(s.subject).grade + '/' + SUBJ(s.subject).slug + '/sim/' + s.id;

  /* ---------- عرض الرياضيات ---------- */
  ML.texHTML = function (tex, display) {
    try {
      if (root.katex) {
        if (ML.isAr && ML.isAr() && !(ML.isLatinBook && ML.isLatinBook())) {
          // صيغة الكتاب: رموز وأرقام عربية، والمعادلة من اليمين لليسار
          const h = root.katex.renderToString(ML.arTeX(tex), { throwOnError: false, displayMode: !!display, output: 'html', strict: 'ignore' });
          return '<span class="ar-math" role="math" aria-label="' + esc(tex) + '">' + ML.mirrorKaTeX(h) + '</span>';
        }
        return root.katex.renderToString(tex, { throwOnError: false, displayMode: !!display, output: 'html', strict: 'ignore' });
      }
    } catch (e) { /* fallthrough */ }
    return '<code dir="ltr">' + esc(tex) + '</code>';
  };
  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  // نص غني: $..$ رياضيات ، $$..$$ سطر مستقل ، {{..}} صيغة كيميائية ، **غامق** ، أسطر جديدة
  ML.rich = function (s) {
    if (s === null || s === undefined) return '';
    const parts = String(s).split(/(\$\$[^$]+\$\$|\$[^$]+\$|\{\{[^}]+\}\})/g);
    return parts.map((p) => {
      // {{...}} معادلة/صيغة كيميائية: من اليسار لليمين كما في الكتاب، بلا تعريب
      if (p.startsWith('{{') && p.endsWith('}}')) return '<bdi class="chem" dir="ltr" lang="en">' + esc(p.slice(2, -2)) + '</bdi>';
      if (p.startsWith('$$')) return '<div class="math-block" dir="ltr">' + ML.texHTML(p.slice(2, -2), true) + '</div>';
      if (p.startsWith('$') && p.length > 1) return '<span class="m" dir="ltr">' + ML.texHTML(p.slice(1, -1)) + '</span>';
      return esc(ML.loc ? ML.loc(p) : p).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    }).join('');
  };

  // تسمية فيها TeX بلا علامات $: نص عربي في البداية ثم صيغة
  function autoMath(t) { t = String(t); if (t.indexOf('$') >= 0 || !/\\[A-Za-z]|[\^_]/.test(t)) return t; const m = /^([؀-ۿ\s()،:]*)([\s\S]*)$/.exec(t); return m[1] + '$' + m[2] + '$'; }
  ML.autoMath = autoMath;
  function el(tag, attrs, html) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) { if (k === 'class') e.className = attrs[k]; else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]); }
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  ML.el = el;

  // اسم المطوّر (يظهر في الصفحة الرئيسية وكل محاكاة)

  /* ---------- السمة ---------- */
  function initTheme() {
    let t = null; try { t = localStorage.getItem('ml-theme'); } catch (e) { /* ignore */ }
    if (t) document.documentElement.setAttribute('data-theme', t);
  }
  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const nx = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nx);
    try { localStorage.setItem('ml-theme', nx); } catch (e) { /* ignore */ }
    if (ML.current) ML.current.redraw();
  }
  /* ---------- الستايل (مقترحات للمقارنة) ---------- */
  const STYLES = [['', 'الأصلي'], ['clean', 'مختبر نظيف'], ['scope', 'شاشة قياس ليلية'], ['notebook', 'دفتر الكتاب'], ['glass', 'زجاجي متدرّج']];
  function setStyle(s) {
    if (s) document.documentElement.setAttribute('data-style', s); else document.documentElement.removeAttribute('data-style');
  }
  function initStyle() {
    let s = null; try { s = localStorage.getItem('ml-style'); } catch (e) { /* ignore */ }
    const q = (location.search.match(/[?&]style=(\w+)/) || [])[1];
    if (q !== undefined) s = q === 'original' ? '' : q;
    if (s && STYLES.some((x) => x[0] === s)) setStyle(s);
  }
  function pickStyle(s) {
    setStyle(s);
    try { localStorage.setItem('ml-style', s); } catch (e) { /* ignore */ }
    if (ML.current) ML.current.redraw();
  }

  /* ---------- التوجيه ---------- */
  let lastSubject = 'g10-math';
  try { lastSubject = localStorage.getItem('ml-subject') || lastSubject; } catch (e) { /* ignore */ }
  function subjectFromSlug(grade, slug) { return Object.values(ML.subjects).find((x) => x.grade === grade && x.slug === slug); }
  // إعادة الرسم مع الحفاظ على قيم المحاكاة الحالية
  function rerender() {
    const cur = ML.current; const keep = cur ? { p: Object.assign({}, cur.p), mode: cur.mode, gIdx: cur.gIdx } : null;
    route();
    if (keep && ML.current) { Object.assign(ML.current.p, keep.p); ML.current.gIdx = keep.gIdx; ML.current.update(true); if (keep.mode !== 'explore') ML.current.setMode(keep.mode); }
  }
  ML.rerender = rerender;
  function route() {
    if (ML.current) { ML.current.destroy(); ML.current = null; }
    ML.curSim = null;
    document.documentElement.classList.toggle('notation-ar', ML.isAr());
    const h = location.hash || '';
    const app = document.getElementById('app');
    app.innerHTML = '';
    window.scrollTo(0, 0);
    let m = h.match(/^#\/(\w+)\/(\w+)\/sim\/([\w-]+)/);
    if (m) {
      const subj = subjectFromSlug(m[1], m[2]);
      const sim = subj && ML.sims.find((s) => s.id === m[3] && s.subject === subj.id);
      if (sim) { ML.current = new SimPage(app, sim); return; }
    }
    m = h.match(/^#\/sim\/([\w-]+)/); // روابط قديمة
    if (m) { const sim = ML.sims.find((s) => s.id === m[1]); if (sim) { ML.current = new SimPage(app, sim); return; } }
    m = h.match(/^#\/(\w+)\/(\w+)/);
    let subj = m && subjectFromSlug(m[1], m[2]);
    if (!subj) subj = SUBJ(ML.subjects[lastSubject] ? lastSubject : 'g10-math');
    ML.curSubject = subj.id;
    lastSubject = subj.id; try { localStorage.setItem('ml-subject', subj.id); } catch (e) { /* ignore */ }
    renderHome(app, subj);
  }

  function topbar(subj, back) {
    const bar = el('header', { class: 'topbar' });
    bar.innerHTML = (back ? '<a class="btn ghost back" href="#/' + subj.grade + '/' + subj.slug + '" aria-label="رجوع إلى الفصول">→ <span class="back-t">الفصول</span></a>' : '') +
      '<a class="brand" href="#/' + subj.grade + '/' + subj.slug + '"><span class="logo" aria-hidden="true">' + subj.icon + '</span><span><b>' + ML.SITE + '</b><small>' + subj.name + ' — ' + ML.grades.find((g) => g.id === subj.grade).name + '</small></span></a>' +
      '<button class="btn ghost notation" aria-label="تبديل الرموز بين صيغة الكتاب العربية والصيغة الدولية" title="الرموز: صيغة الكتاب العربية ↔ الدولية"><span class="' + (ML.isAr() ? 'on' : '') + '">ع</span><span class="' + (ML.isAr() ? '' : 'on') + '" lang="en">x</span></button>' +
      '<label class="style-wrap" title="ستايل الواجهة"><span class="style-ico" aria-hidden="true">🎨</span><select class="style-pick" aria-label="ستايل الواجهة">' + STYLES.map((x) => '<option value="' + x[0] + '"' + ((document.documentElement.getAttribute('data-style') || '') === x[0] ? ' selected' : '') + '>' + x[1] + '</option>').join('') + '</select></label>' +
      '<button class="btn ghost icon theme" aria-label="تبديل الوضع الليلي" title="الوضع الليلي/النهاري">🌓</button>';
    document.documentElement.setAttribute('data-subject', subj.id);
    bar.querySelector('.style-pick').addEventListener('change', (e) => pickStyle(e.target.value));
    bar.querySelector('.theme').addEventListener('click', toggleTheme);
    bar.querySelector('.notation').addEventListener('click', () => { ML.setNotation(ML.isAr() ? 'intl' : 'ar'); rerender(); });
    return bar;
  }
  // تبويبات الصفوف ثم تبويبات المواد
  function tabs(subj) {
    const nav = el('nav', { class: 'tabs', 'aria-label': 'الصفوف والمواد' });
    nav.innerHTML = '<div class="grade-tabs" role="tablist">' + ML.grades.map((g) => '<a role="tab" class="gtab' + (g.id === subj.grade ? ' on' : '') + '" href="#/' + g.id + '/' + SUBJ(g.subjects[0]).slug + '" aria-selected="' + (g.id === subj.grade) + '">' + g.name + ' <small>' + g.en + '</small></a>').join('') + '</div>' +
      '<div class="subject-tabs" role="tablist">' + ML.grades.find((g) => g.id === subj.grade).subjects.map((id) => { const x = SUBJ(id); return '<a role="tab" class="stab' + (x.id === subj.id ? ' on' : '') + '" href="#/' + x.grade + '/' + x.slug + '" aria-selected="' + (x.id === subj.id) + '"><span aria-hidden="true">' + x.icon + '</span> ' + x.name + ' <small>' + x.en + '</small></a>'; }).join('') + '</div>';
    return nav;
  }

  /* ---------- الصفحة الرئيسية ---------- */
  function renderHome(app, subj) {
    document.title = subj.title + ' | ' + ML.SITE;
    const sims = ML.sims.filter((s) => s.subject === subj.id);
    app.appendChild(topbar(subj, false));
    app.appendChild(tabs(subj));
    const hero = el('section', { class: 'hero' });
    hero.innerHTML = '<h1>' + subj.title + '</h1>' +
      '<p class="lead">' + subj.lead + '</p>' +
      '<p class="src-line">المصدر الوحيد للمحتوى: <b>' + subj.book + '</b> (' + subj.bookEd + ')</p>' +
      '<div class="search"><input type="search" placeholder="' + subj.search + '" aria-label="بحث"></div>' +
      '<div class="stats"><span><b>' + subj.units.length + '</b> ' + (subj.part === 'الدرس' ? 'دروس' : subj.id !== 'g10-math' && subj.id !== 'g9-math' && subj.id !== 'g4-math' && subj.id !== 'g10-chem' ? 'فصول' : 'وحدات') + '</span><span><b>' + sims.length + '</b> ' + (subj.id === 'g10-physics' || subj.id === 'g10-chem' || subj.id === 'g12-physics' || subj.id === 'g9-science' ? 'تجربة' : subj.id === 'g10-digital' ? 'مختبراً' : 'محاكاة') + '</span><span><b>3</b> أوضاع تعلّم</span></div>';
    app.appendChild(hero);
    const grid = el('main', { class: 'units' });
    app.appendChild(grid);
    const input = hero.querySelector('input');
    const draw = () => {
      const q = ML.normAr(input.value);
      grid.innerHTML = '';
      subj.units.forEach((u) => {
        const list = sims.filter((s) => s.unit === u.n && (!q || ML.normAr(s.titleAr + ' ' + s.titleEn + ' ' + (s.tags || '') + ' ' + u.ar).includes(q)));
        if (!list.length) return;
        const card = el('section', { class: 'unit ' + u.color });
        const kicker = u.unitAr ? u.unitAr + ' · ص ' + u.pages : 'الوحدة ' + ORD[u.n] + ' · ص ' + u.pages;
        card.innerHTML = '<div class="unit-head"><span class="unit-icon" aria-hidden="true">' + u.icon + '</span><div><small>' + kicker + '</small><h2>' + u.ar + '</h2><span class="en">' + u.en + '</span></div></div>';
        const ul = el('ul', { class: 'lessons' });
        list.forEach((s) => {
          const li = el('li');
          li.innerHTML = '<a href="' + ML.simHref(s) + '"><span class="ln">' + s.lesson + '</span><span class="lt"><b>' + s.titleAr + '</b><small>' + s.titleEn + '</small></span><span class="pg">ص ' + s.page + '</span></a>';
          ul.appendChild(li);
        });
        card.appendChild(ul); grid.appendChild(card);
      });
      if (!grid.children.length) grid.innerHTML = '<p class="empty">لا توجد نتائج مطابقة.</p>';
    };
    input.addEventListener('input', draw); draw();
    app.appendChild(el('footer', { class: 'foot' }, 'جميع القوانين والأمثلة مأخوذة من ' + subj.book + '. أي إثراء بصري خارج الكتاب مُعلَّم بوضوح.'));
  }

  /* ---------- صفحة المحاكاة ---------- */
  class SimPage {
    constructor(app, sim) {
      this.sim = sim; this.app = app; this.mode = 'explore';
      this.p = {}; sim.params.forEach((q) => { this.p[q.key] = q.value; });
      this.prev = null; this.lastExplain = []; this.playing = false; this.chIdx = 0; this.solved = false;
      this.raf = null; this.tw = null;
      this.subj = SUBJ(sim.subject);
      ML.curSim = sim; ML.curSubject = sim.subject;
      document.title = sim.titleAr + ' | ' + ML.SITE;
      this.st = sim.initState ? sim.initState(this.p) : null;
      this.build();
      this.update(true);
    }
    destroy() {
      cancelAnimationFrame(this.raf); this.playing = false;
      if (this.ro) this.ro.disconnect();
      if (this.tutorEl) this.tutorEl.remove();
      if (this.lab && this.lab.destroy) this.lab.destroy();
    }
    build() {
      const s = this.sim, app = this.app;
      const subj = this.subj;
      app.appendChild(topbar(subj, true));
      app.appendChild(tabs(subj));
      const head = el('section', { class: 'sim-head' });
      const u = ML.unitOf(s);
      head.innerHTML = '<div class="titles"><span class="badge ' + u.color + '">' + ML.unitName(s.subject, s.unit) + '</span><h1>' + s.titleAr + '</h1><p class="en" dir="ltr">' + s.titleEn + '</p></div>' +
        '<div class="source"><b>المصدر:</b> ' + subj.book + '<br><b>' + (this.subj.unitLabel || 'الفصل') + ':</b> ' + ML.unitName(s.subject, s.unit) + '<br><b>' + (this.subj.part ? 'البند' : 'الدرس') + ':</b> ' + s.lesson + ' ' + s.lessonTitle + '<br><b>الصفحة:</b> ' + s.page + '</div>' +
        '<div class="modes" role="tablist">' +
        '<button role="tab" data-m="learn">📘 تعلّم <small>Learn</small></button>' +
        '<button role="tab" data-m="explore" class="on">🧪 ' + (s.subject !== 'g10-math' && s.subject !== 'g9-math' && s.subject !== 'g4-math' ? 'تجربة' : 'استكشف') + ' <small>Experiment</small></button>' +
        '<button role="tab" data-m="challenge">🎯 تحدٍّ <small>Challenge</small></button></div>';
      app.appendChild(head);
      head.querySelectorAll('.modes button').forEach((b) => b.addEventListener('click', () => this.setMode(b.dataset.m)));
      this.modesEl = head.querySelector('.modes');

      const main = el('main', { class: 'sim-grid' });
      // لوحة الوضع (تعلّم/تحدٍّ)
      this.modePanel = el('section', { class: 'card mode-panel', hidden: '' });
      main.appendChild(this.modePanel);
      // منطقة الرسم
      const stage = el('section', { class: 'card stage' });
      stage.innerHTML = '<div class="live" dir="ltr"></div><div class="canvas-wrap"><canvas aria-label="منطقة المحاكاة البصرية"></canvas>' +
        (s.custom ? '' : '<div class="zoom"><button class="btn icon" data-z="in" aria-label="تكبير">+</button><button class="btn icon" data-z="out" aria-label="تصغير">−</button><button class="btn icon" data-z="home" aria-label="إعادة العرض">⌂</button></div>') +
        '</div><p class="hint">' + (s.custom ? (s.canvasHint || '') : 'اسحب لتحريك المستوى • العجلة/القرص للتكبير' + (s.handles ? ' • اسحب النقاط الملوّنة' : '')) + '</p>';
      if (s.assumptions && s.assumptions.length) stage.appendChild(el('div', { class: 'assume' }, '<b>افتراضات التجربة:</b> ' + s.assumptions.map((x) => ML.rich(x)).join(' • ')));
      main.appendChild(stage);
      // مختبر ثلاثي الأبعاد (اختياري): sim.mount(container, page) ← { update(), destroy() }
      if (s.mount) { this.labEl = el('section', { class: 'card lab3d' }); main.insertBefore(this.labEl, stage); main.classList.add('has-lab'); }
      if (s.graph) {
        const gc = el('section', { class: 'card graph' });
        gc.innerHTML = '<h3>الرسم البياني الحي <small>Live graph</small></h3>' + (s.graphModes ? '<div class="gmodes" role="tablist"></div>' : '') + '<div class="graph-wrap"><canvas aria-label="الرسم البياني"></canvas></div><p class="hint gcap"></p>';
        main.appendChild(gc); main.classList.add('has-graph');
        this.gCanvas = gc.querySelector('canvas'); this.gCap = gc.querySelector('.gcap');
        this.gIdx = 0;
        if (s.graphModes) {
          const gm = gc.querySelector('.gmodes');
          s.graphModes.forEach((g, i) => { const b = el('button', { type: 'button', class: i === 0 ? 'on' : '' }, g); b.addEventListener('click', () => { this.gIdx = i; gm.querySelectorAll('button').forEach((x, j) => x.classList.toggle('on', j === i)); this.redrawGraph(); }); gm.appendChild(b); });
        }
      }
      this.liveEl = stage.querySelector('.live');
      this.canvas = stage.querySelector('canvas');
      // أدوات التحكم
      const ctr = el('section', { class: 'card controls' });
      ctr.innerHTML = '<h3>أدوات التحكم <small>Controls</small></h3><div class="params"></div><div class="actions">' +
        '<button class="btn" data-a="reset">↺ إعادة ضبط</button>' +
        (s.play ? '<button class="btn primary" data-a="play">▶ تشغيل</button>' : '') +
        '<button class="btn" data-a="rand">🎲 قيم عشوائية</button></div><p class="warn" hidden></p>';
      main.appendChild(ctr);
      this.paramsEl = ctr.querySelector('.params'); this.warnEl = ctr.querySelector('.warn');
      ctr.querySelector('[data-a=reset]').addEventListener('click', () => this.reset());
      ctr.querySelector('[data-a=rand]').addEventListener('click', () => this.randomize());
      this.playBtn = ctr.querySelector('[data-a=play]');
      if (this.playBtn) this.playBtn.addEventListener('click', () => this.togglePlay());
      // النتائج
      this.resEl = el('section', { class: 'card results' }); main.appendChild(this.resEl);
      // ماذا حدث؟
      this.whyEl = el('section', { class: 'card why' }); main.appendChild(this.whyEl);
      // الخطوات
      this.stepsEl = el('section', { class: 'card steps' }); main.appendChild(this.stepsEl);
      // القانون والمتغيرات
      const law = el('section', { class: 'card law' });
      law.innerHTML = '<h3>القانون / الصيغة <small>Formula</small></h3><div class="formula" dir="ltr">' + ML.texHTML(s.formula, true) + '</div>' +
        (s.book ? '<p class="book-not"><b>بترميز الكتاب:</b> <span>' + ML.rich(s.book) + '</span></p>' : '') +
        '<p class="summary">' + ML.rich(s.summary) + '</p>' +
        (s.vars[0] && s.vars[0].length === 4
          ? '<div class="tbl"><table class="vars"><thead><tr><th>المتغير</th><th>المعنى</th><th>الوحدة (SI)</th><th>الحدود المسموحة</th></tr></thead><tbody>' +
            s.vars.map((v) => '<tr><td dir="ltr">' + ML.texHTML(v[0]) + '</td><td>' + ML.rich(v[1]) + '</td><td dir="ltr">' + ML.texHTML(v[2]) + '</td><td>' + ML.rich(v[3]) + '</td></tr>').join('') + '</tbody></table></div>'
          : '<div class="tbl"><table class="vars"><thead><tr><th>المتغير</th><th>المعنى</th><th>المجال المسموح</th></tr></thead><tbody>' +
            s.vars.map((v) => '<tr><td dir="ltr">' + ML.texHTML(v[0]) + '</td><td>' + ML.rich(v[1]) + '</td><td>' + ML.rich(v[2]) + '</td></tr>').join('') + '</tbody></table></div>') +
        (s.assumptions && s.assumptions.length ? '<p class="assume-law"><b>الافتراضات:</b> ' + s.assumptions.map((x) => ML.rich(x)).join('، ') + '</p>' : '');
      main.appendChild(law);
      app.appendChild(main);

      this.buildParams();
      // الرسم
      if (s.custom) { this.ctx = this.canvas.getContext('2d'); this.plot = null; if (s.onPointer) this.bindPointer(); }
      else {
        this.plot = new ML.Plot(this.canvas, Object.assign({}, s.plot || {}));
        this.plot.onChange = () => this.redraw();
        stage.querySelectorAll('[data-z]').forEach((b) => b.addEventListener('click', () => {
          const z = b.dataset.z; if (z === 'in') this.plot.zoom(0.7); else if (z === 'out') this.plot.zoom(1.4); else this.plot.animateView(this.homeView());
        }));
      }
      if (this.gCanvas) { this.gPlot = new ML.Plot(this.gCanvas, Object.assign({ equal: false, pan: false, zoom: false }, s.graphPlot || {})); this.gPlot.onChange = () => this.redrawGraph(); }
      this.ro = new ResizeObserver(() => this.layout());
      this.ro.observe(this.canvas.parentElement);
      if (this.gCanvas) this.ro.observe(this.gCanvas.parentElement);
      this.layout(true);
      if (this.labEl) { try { this.lab = s.mount(this.labEl, this); } catch (e) { console.error(e); } }
      this.buildTutor();
    }
    // النقر والسحب على الرسم (فأرة ولمس): sim.onPointer(type, x, y, p, st, api)
    bindPointer() {
      const cv = this.canvas; const s = this.sim;
      const pos = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      const api = { set: (k, v) => this.set(k, v), refresh: () => this.update(), hit: (x, y) => ML.hitTest(this.d && this.d.hits, x, y), hits: () => (this.d && this.d.hits) || [], say: (ex) => { this.lastExplain = ex; this.renderWhy(); }, W: () => this.cW, H: () => this.cH };
      const fire = (type, e) => {
        const [x, y] = pos(e); const r = s.onPointer(type, x, y, this.p, this.st, api);
        // 'redraw' = إعادة رسم فقط (أثناء السحب)، وأي قيمة صحيحة أخرى = تحديث كامل
        if (r === 'redraw') this.redraw(); else if (r) { if (this.d) this.d.st = this.st; this.update(); if (this.mode === 'challenge') this.checkChallenge(); }
        if (type === 'move' && !this.dragging) cv.style.cursor = api.hit(x, y) ? 'pointer' : '';
        return r;
      };
      cv.addEventListener('pointerdown', (e) => { this.dragging = true; try { cv.setPointerCapture(e.pointerId); } catch (err) { /* */ } fire('down', e); });
      cv.addEventListener('pointermove', (e) => fire('move', e));
      const up = (e) => { if (!this.dragging) return; this.dragging = false; fire('up', e); };
      cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    }
    homeView() { const v = this.sim.plot && this.sim.plot.view; return typeof v === 'function' ? v(this.p, this.d) : Object.assign({}, v || { xmin: -10, xmax: 10, ymin: -10, ymax: 10 }); }
    layout(first) {
      if (this.plot) {
        const v = first ? this.homeView() : this.plot.view;
        this.plot.resize(); this.plot.setView(v);
      } else {
        const r = this.canvas.getBoundingClientRect(); const dpr = Math.min(3, root.devicePixelRatio || 1);
        this.canvas.width = Math.round(r.width * dpr); this.canvas.height = Math.round(r.height * dpr);
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); this.cW = r.width; this.cH = r.height;
      }
      if (this.gPlot) this.gPlot.resize();
      this.redraw();
    }
    buildParams() {
      const s = this.sim; this.inputs = {};
      this.paramsEl.innerHTML = '';
      s.params.forEach((q) => {
        const row = el('div', { class: 'param', 'data-k': q.key });
        const lab = '<label><span class="pl" dir="ltr">' + ML.texHTML(q.label) + '</span>' + (q.desc ? '<small>' + q.desc + '</small>' : '') + '</label>';
        if (q.type === 'select') {
          const opts = typeof q.options === 'function' ? q.options(this.p) : q.options;
          row.innerHTML = lab + '<select>' + opts.map((o) => '<option value="' + o[0] + '">' + o[1] + '</option>').join('') + '</select>';
          const sel = row.querySelector('select'); sel.value = this.p[q.key];
          sel.addEventListener('change', () => { this.set(q.key, isNaN(+sel.value) || sel.value === '' ? sel.value : +sel.value); });
          this.inputs[q.key] = { sel: sel };
        } else if (q.type === 'stage') {
          row.classList.add('stage-param');
          row.innerHTML = lab + '<div class="stage-ctl"><button type="button" class="btn icon" data-s="prev" aria-label="المرحلة السابقة">→</button><input type="range" min="0" max="' + q.max + '" step="1" aria-label="المرحلة"><button type="button" class="btn icon" data-s="next" aria-label="المرحلة التالية">←</button></div><div class="stage-name" aria-live="polite"></div>';
          const r = row.querySelector('input');
          r.addEventListener('input', () => this.set(q.key, +r.value));
          row.querySelector('[data-s=prev]').addEventListener('click', () => this.set(q.key, Math.max(0, this.p[q.key] - 1)));
          row.querySelector('[data-s=next]').addEventListener('click', () => this.set(q.key, Math.min(this.stageMax(q), this.p[q.key] + 1)));
          this.inputs[q.key] = { stage: r, name: row.querySelector('.stage-name'), q: q };
        } else if (q.type === 'text') {
          row.innerHTML = lab + '<input type="text" class="seq" dir="ltr" lang="en" autocomplete="off" spellcheck="false" aria-label="' + esc(q.desc || q.key) + '"' + (q.maxLength ? ' maxlength="' + q.maxLength + '"' : '') + '><p class="field-err" role="alert" hidden></p>';
          const t = row.querySelector('input'), er = row.querySelector('.field-err');
          t.addEventListener('input', () => {
            const v = q.normalize ? q.normalize(t.value) : t.value;
            const msg = q.validate ? q.validate(v, this.p) : null;
            t.classList.toggle('bad', !!msg); er.hidden = !msg; if (msg) { er.innerHTML = ML.rich(msg); return; }
            this.set(q.key, v);
          });
          this.inputs[q.key] = { text: t, err: er };
        } else if (q.type === 'toggle') {
          row.innerHTML = lab + '<button class="toggle" role="switch"></button>';
          const b = row.querySelector('button');
          b.addEventListener('click', () => this.set(q.key, !this.p[q.key]));
          this.inputs[q.key] = { tog: b };
        } else {
          row.innerHTML = lab + '<div class="rng"><input type="range" min="' + q.min + '" max="' + q.max + '" step="' + q.step + '"><input type="text" inputmode="decimal" dir="ltr" aria-label="' + esc(q.desc || q.key) + '"></div>';
          const r = row.querySelector('input[type=range]'), n = row.querySelector('input[type=text]');
          r.addEventListener('input', () => this.set(q.key, this.fixParam(q, +r.value)));
          n.addEventListener('change', () => { let v = ML.parseNum(n.value); if (!Number.isFinite(v)) v = this.p[q.key]; this.set(q.key, this.fixParam(q, M.clamp(v, q.min, q.max), true)); });
          this.inputs[q.key] = { r: r, n: n };
        }
        this.paramsEl.appendChild(row);
      });
      this.syncInputs();
    }
    // آخر مرحلة (قائمة المراحل قد تتغير حسب خيارات أخرى)
    stageMax(q) { return (typeof q.stages === 'function' ? q.stages(this.p) : q.stages).length - 1; }
    // فرض قيود المجال (مثل أ ≠ 0)
    fixParam(q, v, typed) {
      this.warnEl.hidden = true;
      if (q.exclude) {
        for (const x of q.exclude) {
          if (Math.abs(v - x) < (typed ? 1e-12 : q.step / 2)) {
            const old = this.p[q.key];
            v = x + (old >= x ? q.step : -q.step);
            if (v > q.max) v = x - q.step; if (v < q.min) v = x + q.step;
            this.warnEl.hidden = false; this.warnEl.innerHTML = ML.rich(q.excludeMsg || ('القيمة $' + q.label + ' = ' + x + '$ غير مسموحة في هذا القانون.'));
          }
        }
      }
      if (q.int) v = Math.round(v);
      return M.round(v, 6);
    }
    syncInputs() {
      const s = this.sim;
      s.params.forEach((q) => {
        const inp = this.inputs[q.key]; const v = this.p[q.key];
        const row = this.paramsEl.querySelector('[data-k="' + q.key + '"]');
        if (q.hidden) row.hidden = !!q.hidden(this.p);
        if (inp.sel) {
          if (typeof q.options === 'function') { const html = q.options(this.p).map((o) => '<option value="' + o[0] + '">' + o[1] + '</option>').join(''); if (inp.sel._h !== html) { inp.sel.innerHTML = html; inp.sel._h = html; } }
          inp.sel.value = v;
        }
        else if (inp.stage) { const names = typeof inp.q.stages === 'function' ? inp.q.stages(this.p) : inp.q.stages; if (v > names.length - 1) { this.p[q.key] = names.length - 1; return this.syncInputs(); } inp.stage.max = names.length - 1; inp.stage.value = v; inp.name.innerHTML = '<b>' + (v + 1) + ' / ' + names.length + '</b> ' + ML.rich(names[v]); }
        else if (inp.text) { if (document.activeElement !== inp.text) { inp.text.value = v; inp.text.classList.remove('bad'); inp.err.hidden = true; } }
        else if (inp.tog) { inp.tog.classList.toggle('on', !!v); inp.tog.setAttribute('aria-checked', !!v); inp.tog.textContent = v ? (q.on || 'مفعّل') : (q.off || 'متوقف'); }
        else { inp.r.value = v; if (document.activeElement !== inp.n) inp.n.value = ML.fmtInput(M.round(v, 4)); }
      });
    }
    set(key, v, silent) {
      if (this.p[key] === v) return;
      if (!this.prevSnap) this.prevSnap = { p: Object.assign({}, this.p), d: this.d };
      this.p[key] = v;
      if (this.sim.onSet) this.sim.onSet(this.p, key);
      if (this.sim.resetOn && this.sim.resetOn.indexOf(key) >= 0) this.resetState();
      this.update();
      if (!silent) this.scheduleExplain();
    }
    scheduleExplain() {
      clearTimeout(this.exT);
      this.exT = setTimeout(() => {
        if (!this.prevSnap) return;
        const a = this.prevSnap; this.prevSnap = null;
        let ex = this.sim.explain ? this.sim.explain(a.p, this.p, a.d, this.d) : [];
        if (!ex || !ex.length) ex = this.genericExplain(a.p, this.p);
        if (ex.length) { this.lastExplain = ex; this.renderWhy(); }
      }, 160);
    }
    genericExplain(a, b) {
      const out = [];
      this.sim.params.forEach((q) => { if (a[q.key] !== b[q.key] && !q.type) out.push('تغيّر $' + q.label + '$ من $' + M.tex(a[q.key]) + '$ إلى $' + M.tex(b[q.key]) + '$.'); });
      return out;
    }
    update(first) {
      const s = this.sim;
      try { this.d = s.compute(this.p); } catch (e) { console.error(e); this.d = {}; }
      this.d.st = this.st;
      this.syncInputs();
      this.liveEl.innerHTML = s.live ? ML.texHTML(s.live(this.p, this.d), true) : '';
      // النتائج
      const res = s.results ? s.results(this.p, this.d) : [];
      this.resEl.innerHTML = '<h3>النتائج الرقمية <small>Results</small></h3><dl>' + res.map((r) => '<div class="r' + (r[3] ? ' ' + r[3] : '') + '"><dt>' + ML.rich(autoMath(r[0])) + '</dt><dd>' + (r[2] === false ? ML.rich(r[1]) : '<span dir="ltr">' + ML.texHTML(r[1]) + '</span>') + '</dd></div>').join('') + '</dl>';
      const st = s.steps ? s.steps(this.p, this.d) : [];
      this.stepsEl.innerHTML = '<h3>الخطوات الأساسية <small>Steps</small></h3>' + (st.length ? '<ol>' + st.map((x) => '<li>' + ML.rich(x) + '</li>').join('') + '</ol>' : '<p class="muted">—</p>');
      if (first) this.renderWhy();
      if (this.mode === 'challenge') this.checkChallenge();
      if (this.plot && s.handles) this.plot.handles = s.handles(this.p, this.d, (k, v) => this.set(k, v));
      this.redraw();
      if (this.lab && this.lab.update) this.lab.update();
    }
    renderWhy() {
      const ex = this.lastExplain.length ? this.lastExplain : [this.sim.idle || this.subj.idle];
      this.whyEl.innerHTML = '<h3>ماذا حدث؟ ولماذا؟ <small>What happened & why</small></h3><ul>' + ex.map((x) => '<li>' + ML.rich(x) + '</li>').join('') + '</ul>';
      this.whyEl.classList.remove('pulse'); void this.whyEl.offsetWidth; this.whyEl.classList.add('pulse');
    }
    redraw() {
      const s = this.sim; if (!this.d) return;
      if (this.plot) {
        const P = this.plot; P.clear(); if (P.opts.grid !== false) P.grid();
        try { s.draw(P, this.p, this.d); } catch (e) { console.error(e); }
      } else if (this.ctx) {
        const c = this.ctx; const cols = ML.Plot.prototype.colors.call({});
        this.d.hits = []; c.clearRect(0, 0, this.cW, this.cH); c.fillStyle = cols.bg; c.fillRect(0, 0, this.cW, this.cH);
        try { s.drawCustom(c, this.cW, this.cH, this.p, this.d, cols); } catch (e) { console.error(e); }
      }
      this.redrawGraph();
    }
    redrawGraph() {
      const s = this.sim; if (!this.gPlot || !this.d) return;
      const G = this.gPlot;
      try {
        const spec = s.graph(this.p, this.d, this.gIdx || 0);
        // spec: { view, xLabel, yLabel, caption, draw(G) }
        if (spec.view) G.view = Object.assign({}, spec.view);
        G.clear(); G.grid();
        const c = G.colors();
        if (spec.xLabel) G.text(G.view.xmax, G.view.ymin, spec.xLabel, { color: c.text, align: 'right', dx: -6, dy: -24, bold: true });
        if (spec.yLabel) G.text(G.view.xmin, G.view.ymax, spec.yLabel, { color: c.text, align: 'left', dx: 38, dy: 12, bold: true });
        spec.draw(G);
        if (this.gCap) this.gCap.innerHTML = ML.rich(spec.caption || '');
      } catch (e) { console.error(e); }
    }
    reset() {
      const tgt = {}; this.sim.params.forEach((q) => { tgt[q.key] = q.value; });
      this.stopPlay(); this.resetState(); this.tweenTo(tgt);
      if (this.plot) this.plot.animateView(this.homeView());
      this.lastExplain = ['أُعيدت جميع القيم إلى وضعها الابتدائي.']; this.renderWhy();
    }
    randomize() {
      const s = this.sim; let tgt;
      if (s.randomize) tgt = s.randomize(Object.assign({}, this.p));
      else {
        tgt = {};
        s.params.forEach((q) => {
          if (q.type === 'select' || q.type === 'toggle' || q.type === 'text' || q.noRandom) return;
          const lo = q.rmin !== undefined ? q.rmin : q.min, hi = q.rmax !== undefined ? q.rmax : q.max;
          const stp = q.rstep || q.step;
          let v; let guard = 0;
          do { v = lo + Math.round(Math.random() * (hi - lo) / stp) * stp; v = M.round(v, 6); guard++; } while (q.exclude && q.exclude.some((x) => Math.abs(x - v) < 1e-9) && guard < 50);
          tgt[q.key] = v;
        });
      }
      this.prevSnap = { p: Object.assign({}, this.p), d: this.d };
      this.tweenTo(tgt, () => this.scheduleExplain());
    }
    tweenTo(tgt, done) {
      const from = Object.assign({}, this.p); const t0 = performance.now(); const ms = 450;
      const q = this.sim.params.reduce((o, x) => { o[x.key] = x; return o; }, {});
      const disc = {}; // القيم غير العددية وخيارات القوائم تتغير فوراً (لا قيم وسيطة)
      Object.keys(tgt).forEach((k) => { if (typeof tgt[k] !== 'number' || typeof from[k] !== 'number' || (q[k] && q[k].type)) { disc[k] = tgt[k]; } });
      Object.assign(this.p, disc);
      cancelAnimationFrame(this.tw);
      const step = (now) => {
        const t = Math.min(1, (now - t0) / ms); const e = 1 - Math.pow(1 - t, 3);
        Object.keys(tgt).forEach((k) => {
          if (k in disc) return;
          let v = from[k] + (tgt[k] - from[k]) * e;
          // لا نمر بالقيم الممنوعة أثناء الحركة على نحو يكسر الحساب
          if (q[k] && q[k].exclude && q[k].exclude.some((x) => Math.abs(v - x) < 1e-9)) v += 1e-6;
          if (q[k] && q[k].int) v = Math.round(v);
          this.p[k] = t === 1 ? tgt[k] : v;
        });
        if (this.sim.onSet) this.sim.onSet(this.p, null);
        this.update();
        if (t < 1) this.tw = requestAnimationFrame(step); else if (done) done();
      };
      this.tw = requestAnimationFrame(step);
    }
    resetState() { if (this.sim.initState) { this.st = this.sim.initState(this.p); if (this.d) this.d.st = this.st; } }
    togglePlay() { if (this.playing) this.stopPlay(); else this.startPlay(); }
    startPlay() {
      const s = this.sim; if (!s.play) return; this.playing = true;
      this.playBtn.textContent = '⏸ إيقاف'; this.playBtn.classList.add('on');
      let last = performance.now();
      if (s.play.mode === 'stage') {
        // تشغيل المراحل تلقائياً: الانتقال إلى المرحلة التالية كل فترة
        const q = s.params.find((x) => x.key === s.play.key);
        if (this.p[q.key] >= this.stageMax(q)) this.set(q.key, 0, true);
        let acc = 0;
        const loopS = (now) => {
          if (!this.playing) return;
          const dt = Math.min(0.1, Math.max(0, (now - last) / 1000)); last = now; acc += dt;
          if (this.st && s.tick) s.tick(this.st, this.p, this.d, dt);
          if (acc >= (s.play.interval || 1.8)) {
            acc = 0;
            if (this.p[q.key] >= this.stageMax(q)) { this.stopPlay(); this.update(); return; }
            this.set(q.key, this.p[q.key] + 1);
          } else this.redraw();
          this.raf = requestAnimationFrame(loopS);
        };
        this.raf = requestAnimationFrame(loopS);
        return;
      }
      if (s.play.mode === 'time') {
        // محاكاة زمنية حقيقية: tick يحدّث الحالة؛ نعيد رسم Canvas كل إطار والنصوص ~8 مرات/ث
        if (s.isDone && s.isDone(this.st, this.p, this.d)) this.resetState();
        let lastText = 0;
        const loopT = (now) => {
          if (!this.playing) return;
          const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)) * (s.play.speed || 1); last = now;
          const sub = 8; for (let i = 0; i < sub; i++) s.tick(this.st, this.p, this.d, dt / sub);
          const done = s.isDone && s.isDone(this.st, this.p, this.d);
          if (now - lastText > 120 || done) { lastText = now; this.update(); } else this.redraw();
          if (done) { this.stopPlay(); this.update(); if (s.onDone) { const ex = s.onDone(this.st, this.p, this.d); if (ex) { this.lastExplain = ex; this.renderWhy(); } } return; }
          this.raf = requestAnimationFrame(loopT);
        };
        this.raf = requestAnimationFrame(loopT);
        return;
      }
      const loop = (now) => {
        if (!this.playing) return;
        const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
        const pl = s.play; const q = s.params.find((x) => x.key === pl.key);
        let v = this.p[pl.key] + pl.speed * dt;
        if (v > q.max) v = pl.bounce ? q.max : q.min + (v - q.max);
        if (pl.bounce && (v >= q.max || v <= q.min)) pl.speed = -pl.speed;
        this.p[pl.key] = M.round(M.clamp(v, q.min, q.max), 6);
        this.update();
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    }
    stopPlay() { this.playing = false; cancelAnimationFrame(this.raf); if (this.playBtn) { this.playBtn.textContent = '▶ تشغيل'; this.playBtn.classList.remove('on'); } }

    /* ---------- الأوضاع ---------- */
    setMode(m) {
      this.mode = m;
      this.modesEl.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.m === m));
      const mp = this.modePanel; const s = this.sim;
      if (m === 'explore') { mp.hidden = true; return; }
      mp.hidden = false;
      if (m === 'learn') {
        mp.className = 'card mode-panel learn';
        mp.innerHTML = '<h3>📘 تعلّم: ' + s.titleAr + '</h3><div class="learn-body">' + (s.learn || []).map((x) => '<p>' + ML.rich(x) + '</p>').join('') + '</div>';
      } else {
        this.chIdx = this.chIdx % s.challenges.length; this.renderChallenge(true);
      }
      mp.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    renderChallenge(init) {
      const s = this.sim; const ch = s.challenges[this.chIdx]; const mp = this.modePanel;
      this.solved = false;
      mp.className = 'card mode-panel challenge';
      mp.innerHTML = '<h3>🎯 تحدٍّ ' + (this.chIdx + 1) + ' من ' + s.challenges.length + '</h3><p class="q">' + ML.rich(ch.q) + '</p>' +
        '<div class="ch-status">عدّل القيم باستخدام أدوات التحكم حتى تصل إلى الحل الدقيق…</div>' +
        '<div class="actions"><button class="btn" data-c="hint">💡 تلميح</button><button class="btn" data-c="next">التحدي التالي ←</button></div><p class="hint-text" hidden></p>';
      mp.querySelector('[data-c=hint]').addEventListener('click', () => { const h = mp.querySelector('.hint-text'); h.hidden = false; h.innerHTML = ML.rich(ch.hint); });
      mp.querySelector('[data-c=next]').addEventListener('click', () => { this.chIdx = (this.chIdx + 1) % s.challenges.length; this.renderChallenge(true); });
      if (init && ch.init) { this.stopPlay(); this.resetState(); this.tweenTo(ch.init); }
      this.checkChallenge();
    }
    checkChallenge() {
      const ch = this.sim.challenges[this.chIdx]; if (!ch || this.modePanel.hidden) return;
      const ok = !!ch.check(this.p, this.d);
      const st = this.modePanel.querySelector('.ch-status'); if (!st) return;
      if (ok) { st.className = 'ch-status ok'; st.innerHTML = '✅ أحسنت! وصلت إلى الحل الصحيح. ' + (ch.why ? ML.rich(ch.why(this.p, this.d)) : ''); }
      else { st.className = 'ch-status'; st.textContent = 'لم تصل بعد — استمر في تعديل القيم…'; }
    }

    /* ---------- المساعد ---------- */
    buildTutor() {
      const s = this.sim;
      const wrap = el('div', { class: 'tutor' });
      wrap.innerHTML = '<button class="fab" aria-expanded="false"><span aria-hidden="true">🤖</span> ' + this.subj.tutor + '</button>' +
        '<aside class="drawer" hidden><header><b>' + this.subj.tutor + '</b><small>' + this.subj.tutorEn + ' — يجيب بحسب القيم الحالية</small><button class="btn icon x" aria-label="إغلاق">×</button></header>' +
        '<div class="msgs" aria-live="polite"></div><div class="chips"></div>' +
        '<form><input type="text" placeholder="اسأل عن المحاكاة الحالية…" aria-label="سؤالك"><button class="btn primary">إرسال</button></form></aside>';
      document.body.appendChild(wrap); this.tutorEl = wrap;
      const fab = wrap.querySelector('.fab'), dr = wrap.querySelector('.drawer'), msgs = wrap.querySelector('.msgs');
      const open = (o) => { dr.hidden = !o; fab.setAttribute('aria-expanded', o); if (o) wrap.querySelector('input').focus(); };
      fab.addEventListener('click', () => open(dr.hidden));
      wrap.querySelector('.x').addEventListener('click', () => open(false));
      const say = (who, html) => { const m = el('div', { class: 'msg ' + who }, html); msgs.appendChild(m); msgs.scrollTop = msgs.scrollHeight; };
      const ask = (q) => {
        if (!q.trim()) return;
        say('me', esc(q));
        this.d.st = this.st;
        const a = ML.tutorAnswer(s, q, { p: this.p, d: this.d, lastExplain: this.lastExplain });
        setTimeout(() => say('bot', ML.rich(a)), 120);
      };
      say('bot', ML.rich('مرحباً! أنا ' + this.subj.tutor + '، مساعدك في ' + (s.subject === 'g10-physics' || s.subject === 'g12-physics' || s.subject === 'g9-science' ? 'تجربة' : 'محاكاة') + ' **' + s.titleAr + '**. أجيبك اعتماداً على القيم التي تراها الآن على الشاشة.'));
      const chips = wrap.querySelector('.chips');
      (s.tutor || []).forEach((r) => { const c = el('button', { class: 'chip', type: 'button' }, esc(r.q)); c.addEventListener('click', () => ask(r.q)); chips.appendChild(c); });
      wrap.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); const i = wrap.querySelector('input'); ask(i.value); i.value = ''; });
    }
  }
  ML.SimPage = SimPage;

  // تعريب النصوص الظاهرة: الأرقام والرموز المفردة والوحدات (عدا الصيغ المعروضة بـ KaTeX والنصوص الإنجليزية)
  const SKIP = /^(SCRIPT|STYLE|INPUT|TEXTAREA|CODE|CANVAS)$/;
  function locNode(n) {
    if (!ML.isAr()) return;
    if (n.nodeType === 3) {
      const t = n.nodeValue; if (!/[0-9A-Za-z]/.test(t)) return;
      let e = n.parentElement;
      for (let k = 0; e && k < 12; k++, e = e.parentElement) { if (SKIP.test(e.tagName) || e.classList.contains('katex') || e.classList.contains('ar-math') || e.getAttribute('lang') === 'en' || e.classList.contains('en')) return; }
      if (/[A-Za-z]/.test(t) && !/[\u0600-\u06FF]/.test(t)) { if (/[A-Za-z]{2}/.test(t)) return; } // نص إنجليزي خالص
      const r = ML.loc(t); if (r !== t) n.nodeValue = r;
      return;
    }
    if (n.nodeType !== 1 || SKIP.test(n.tagName) || n.classList.contains('katex') || n.classList.contains('ar-math') || n.getAttribute('lang') === 'en') return;
    if (n.tagName === 'SELECT') { [...n.options].forEach((o) => { const r = ML.loc(o.textContent); if (r !== o.textContent) o.textContent = r; }); return; }
    for (let c = n.firstChild; c; c = c.nextSibling) locNode(c);
  }
  ML.locNode = locNode;

  ML.start = function () {
    document.documentElement.setAttribute('dir', 'rtl'); document.documentElement.setAttribute('lang', 'ar');
    if (root.MutationObserver) new MutationObserver((ms) => { if (!ML.isAr()) return; ms.forEach((m) => m.addedNodes.forEach(locNode)); }).observe(document.body, { childList: true, subtree: true });
    initTheme(); initStyle();
    ML.sims.sort((a, b) => (a.subject < b.subject ? -1 : a.subject > b.subject ? 1 : 0) || a.unit - b.unit || a.order - b.order);
    root.addEventListener('hashchange', route);
    route();
  };
})(typeof window !== 'undefined' ? window : globalThis);
