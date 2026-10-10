/* الوحدة الثانية: الاقترانات ورسومها البيانية (ص 29–78) */
(function (root) {
  'use strict';
  const ML = root.ML; const M = ML.math; const F = ML.fx;
  const U = 2;

  /* ======================= 2-1 الانسحاب ======================= */
  const BASES = {
    sq: { f: (x) => x * x, tex: (u) => '(' + u + ')^{2}', bare: 'x^{2}', name: 'س²', key: 'رأس القطع', dom: () => null },
    cube: { f: (x) => x * x * x, tex: (u) => '(' + u + ')^{3}', bare: 'x^{3}', name: 'س³', key: 'نقطة الانقلاب', dom: () => null },
    sqrt: { f: (x) => (x >= 0 ? Math.sqrt(x) : NaN), tex: (u) => '\\sqrt{' + u + '}', bare: '\\sqrt{x}', name: '√س', key: 'نقطة البداية', dom: true }
  };
  function baseTex(b, h) { const B = BASES[b]; return M.round(h, 4) === 0 ? (b === 'sqrt' ? '\\sqrt{x}' : B.bare) : B.tex(F.shift('x', h)); }
  const TRI = [[1, 2], [-1, -3], [2, -5]]; // مثلث النشاط 1 ص 31

  ML.register({
    id: 'translation', unit: U, order: 1, lesson: '2-1', lessonTitle: 'تمثيل الاقترانات باستخدام الانسحاب', page: 31,
    titleAr: 'تمثيل الاقترانات باستخدام الانسحاب', titleEn: 'Graphing Functions Using Translation', tags: 'انسحاب تحويلات هندسية اكمال المربع',
    formula: 'g(x) = f(x + h) + k',
    book: 'ل(س) = ق(س + جـ) : انسحاب لليسار جـ وحدة إذا جـ > 0 ؛ ل(س) = ق(س) + جـ : انسحاب للأعلى جـ وحدة إذا جـ > 0',
    summary: 'إضافة ثابت $k$ إلى قاعدة الاقتران تنقل المنحنى رأسياً، وإضافة ثابت $h$ إلى المتغير داخل الاقتران تنقله أفقياً (عكس إشارة $h$).',
    vars: [['f(x)', 'الاقتران الأصلي (س²، س³، √س من أمثلة الكتاب)', '$\\sqrt{x}$ معرّف عندما $x \\ge 0$'], ['h', 'مقدار الانسحاب الأفقي: لليسار إذا $h>0$، لليمين إذا $h<0$', '$h \\in \\mathbb{R}$'], ['k', 'مقدار الانسحاب الرأسي: للأعلى إذا $k>0$، للأسفل إذا $k<0$', '$k \\in \\mathbb{R}$']],
    params: [
      { key: 'base', label: 'f(x)', type: 'select', value: 'sq', options: [['sq', 'ق(س) = س²'], ['cube', 'ق(س) = س³'], ['sqrt', 'ق(س) = √س']] },
      { key: 'h', label: 'h', min: -8, max: 8, step: 0.5, value: 0, desc: 'انسحاب أفقي' },
      { key: 'k', label: 'k', min: -8, max: 8, step: 0.5, value: 0, desc: 'انسحاب رأسي' },
      { key: 'tri', label: '\\triangle ABC', type: 'toggle', value: false, on: 'إظهار المثلث', off: 'إخفاء المثلث', desc: 'انسحاب نقاط (نشاط ص 31)' }
    ],
    plot: { view: { xmin: -10, xmax: 10, ymin: -8, ymax: 10 } },
    compute(p) {
      const B = BASES[p.base];
      const g = (x) => B.f(x + p.h) + p.k;
      const key = { x: -p.h, y: p.k };
      const tri = TRI.map((v) => [v[0] - p.h, v[1] + p.k]);
      return { g: g, f: B.f, key: key, tri: tri, B: B };
    },
    draw(P, p, d) {
      const c = P.colors();
      P.fn(d.f, { color: c.muted, width: 2, dash: [6, 5] });
      P.fn(d.g, { color: c.c1, width: 3 });
      if (p.h !== 0 || p.k !== 0) P.arrow(0, 0, d.key.x, d.key.y, { color: c.c4, width: 2 });
      P.point(0, 0, { color: c.muted, r: 4 });
      P.point(d.key.x, d.key.y, { color: c.c2, label: d.B.key + ' ' + '(' + M.fmt(d.key.x) + ', ' + M.fmt(d.key.y) + ')' });
      if (p.tri) {
        P.polygon(TRI, { color: c.muted, dash: [5, 4], width: 2, fill: c.muted });
        P.polygon(d.tri, { color: c.c5, width: 2.5, fill: c.c5 });
        ['A', 'B', 'C'].forEach((n, i) => { P.point(TRI[i][0], TRI[i][1], { color: c.muted, r: 4, label: n }); P.point(d.tri[i][0], d.tri[i][1], { color: c.c5, r: 4, label: n + "'" }); });
      }
      P.text(P.view.xmax, P.view.ymax, 'f(x) — الأصل (متقطع)', { color: c.muted, align: 'right', dx: -8, dy: 14, rtl: true });
    },
    handles(p, d, set) { return [{ x: d.key.x, y: d.key.y, onDrag: (x, y) => { set('h', M.round(-Math.round(x * 2) / 2, 4)); set('k', M.round(Math.round(y * 2) / 2, 4)); } }]; },
    live(p) { return 'g(x) = ' + baseTex(p.base, p.h) + F.plus(p.k); },
    results(p, d) {
      const r = [
        ['الانسحاب الأفقي', p.h === 0 ? 'لا يوجد' : (Math.abs(p.h) + ' وحدة إلى ' + (p.h > 0 ? 'اليسار' : 'اليمين')), false],
        ['الانسحاب الرأسي', p.k === 0 ? 'لا يوجد' : (Math.abs(p.k) + ' وحدة إلى ' + (p.k > 0 ? 'الأعلى' : 'الأسفل')), false],
        [d.B.key + ' الجديدة', F.pt(d.key.x, d.key.y)],
        ['قاعدة النقطة', '(x,\\ y) \\mapsto (x ' + (p.h > 0 ? '-' : '+') + ' ' + M.fmt(Math.abs(p.h)) + ',\\ y ' + (p.k < 0 ? '-' : '+') + ' ' + M.fmt(Math.abs(p.k)) + ')']
      ];
      if (p.base === 'sqrt') r.push(['المجال', 'x \\ge ' + M.texFrac(-p.h)], ['المدى', 'y \\ge ' + M.texFrac(p.k)]);
      else if (p.base === 'sq') r.push(['المدى', 'y \\ge ' + M.texFrac(p.k)]);
      else r.push(['المجال والمدى', '\\mathbb{R}']);
      if (p.tri) r.push(['صور رؤوس المثلث', "A'" + F.pt(d.tri[0][0], d.tri[0][1]) + ',\\ B\'' + F.pt(d.tri[1][0], d.tri[1][1]) + ',\\ C\'' + F.pt(d.tri[2][0], d.tri[2][1])]);
      return r;
    },
    steps(p, d) {
      const s = ['ابدأ بمنحنى $f(x) = ' + d.B.bare + '$ (المتقطع).'];
      if (p.h !== 0) s.push('$f(x ' + (p.h > 0 ? '+' : '-') + ' ' + M.fmt(Math.abs(p.h)) + ')$: انسحاب أفقي $' + M.fmt(Math.abs(p.h)) + '$ وحدة إلى ' + (p.h > 0 ? 'اليسار' : 'اليمين') + ' (عكس الإشارة داخل القوس).');
      if (p.k !== 0) s.push('$' + (p.k > 0 ? '+' : '-') + ' ' + M.fmt(Math.abs(p.k)) + '$: انسحاب رأسي $' + M.fmt(Math.abs(p.k)) + '$ وحدة إلى ' + (p.k > 0 ? 'الأعلى' : 'الأسفل') + '.');
      s.push('كل نقطة $(x, y)$ على $f$ تنتقل إلى $(x ' + (p.h > 0 ? '-' : '+') + ' ' + M.fmt(Math.abs(p.h)) + ',\\ y ' + (p.k < 0 ? '-' : '+') + ' ' + M.fmt(Math.abs(p.k)) + ')$، فمثلاً $(0,0) \\to ' + F.pt(d.key.x, d.key.y) + '$.');
      return s;
    },
    explain(a, b) {
      const o = [];
      if (a.base !== b.base) o.push('غيّرت الاقتران الأصلي؛ الانسحاب نفسه يُطبَّق على أي منحنى بالطريقة ذاتها.');
      if (a.h !== b.h) o.push('تغيّر $h$ من $' + M.fmt(a.h) + '$ إلى $' + M.fmt(b.h) + '$ فتحرك المنحنى أفقياً $' + M.fmt(Math.abs(b.h - a.h)) + '$ وحدة إلى ' + (b.h > a.h ? 'اليسار' : 'اليمين') + '. **لماذا عكس الإشارة؟** لأن $f(x+h)$ تأخذ عند $x$ القيمة التي كانت $f$ تأخذها عند $x+h$؛ فالنقطة التي كانت عند $x=0$ صارت عند $x=-h=' + M.fmt(-b.h) + '$.');
      if (a.k !== b.k) o.push('تغيّر $k$ من $' + M.fmt(a.k) + '$ إلى $' + M.fmt(b.k) + '$: أُضيف الثابت لكل قيمة $y$، فارتفع/انخفض المنحنى كله ' + M.fmt(Math.abs(b.k - a.k)) + ' وحدة ' + (b.k > a.k ? 'للأعلى' : 'للأسفل') + ' دون تغيير شكله.');
      if (a.tri !== b.tri && b.tri) o.push('المثلث $ABC$ برؤوس من نشاط الكتاب ص 31 انسحب بالقاعدة نفسها: $(x,y) \\to (x-h,\\ y+k)$.');
      return o;
    },
    learn: [
      '**التحويلات الهندسية** حركات في المستوى (كحركة أحجار الشطرنج) — الانسحاب يحرك كل نقطة المسافة نفسها في الاتجاه نفسه، فلا يتغير شكل المنحنى ولا حجمه.',
      '**الانسحاب الرأسي (ص 32):** منحنى $l(x) = f(x) + c$ هو انسحاب لمنحنى $f(x)$ بمقدار $c$ وحدة للأعلى إذا $c>0$، وبمقدار $|c|$ وحدة للأسفل إذا $c<0$. مثال الكتاب: $l(x) = x^2 + 3$ هو $x^2$ مُزاحاً 3 وحدات للأعلى.',
      '**الانسحاب الأفقي (ص 33):** منحنى $f(x + c)$ هو انسحاب لمنحنى $f(x)$ بمقدار $c$ وحدة **لليسار** إذا $c>0$، وبمقدار $|c|$ وحدة **لليمين** إذا $c<0$. مثال الكتاب: $(x-4)^3$ هو $x^3$ مُزاحاً 4 وحدات لليمين.',
      '**إكمال المربع (نشاط 7 ص 34):** $x^2 + 4x = (x^2 + 4x + 4) - 4 = (x+2)^2 - 4$ ؛ أي انسحاب لـ $x^2$ وحدتين لليسار ثم 4 وحدات للأسفل.',
      '**قاعدة النقطة:** النقطة $(x, y)$ بعد انسحابها 3 وحدات للأعلى تصبح $(x, y+3)$، وبعد انسحابها 3 وحدات لليمين تصبح $(x+3, y)$.'
    ],
    challenges: [
      { q: 'استخدم إكمال المربع: اجعل $g(x)$ يطابق $x^2 + 4x$ (نشاط 7 ص 34).', hint: '$x^2 + 4x = (x+2)^2 - 4$ ، إذن $h = 2$ و $k = -4$.', init: { base: 'sq', h: 0, k: 0 }, check: (p) => p.base === 'sq' && p.h === 2 && p.k === -4 },
      { q: 'انقل رأس القطع $y = x^2$ إلى النقطة $(2, -3)$.', hint: 'الرأس ينتقل إلى $(-h, k)$.', init: { base: 'sq', h: 0, k: 0 }, check: (p) => p.base === 'sq' && p.h === -2 && p.k === -3 },
      { q: 'مثّل $(x-4)^3$ (من نشاط 6 ص 33).', hint: 'داخل القوس $x - 4$ يعني $h = -4$.', init: { base: 'cube', h: 0, k: 0 }, check: (p) => p.base === 'cube' && p.h === -4 && p.k === 0 },
      { q: 'مثّل $x^2 - 10x + 27$ بإكمال المربع (تمرين 3 ص 35).', hint: '$x^2 - 10x + 27 = (x-5)^2 + 2$.', init: { base: 'sq', h: 0, k: 0 }, check: (p) => p.base === 'sq' && p.h === -5 && p.k === 2 }
    ],
    tutor: [
      { q: 'لماذا يتحرك المنحنى عكس إشارة h؟', k: ['عكس', 'اشاره h', 'يسار', 'يمين', 'افقي'], a: (p) => 'في $g(x) = f(x + h)$ نحتاج $x + h = 0$ لنحصل على القيمة التي كانت عند الأصل، أي $x = -h$. لذلك عندما $h = ' + M.fmt(p.h) + '$ تنتقل النقطة المميزة إلى $x = ' + M.fmt(-p.h) + '$ — ' + (p.h > 0 ? 'لليسار' : p.h < 0 ? 'لليمين' : 'لم تتحرك') + '.' },
      { q: 'أين أصبحت النقطة المميزة؟', k: ['راس', 'نقطه', 'اين'], a: (p, d) => d.B.key + ' انتقلت من $(0,0)$ إلى $' + F.pt(d.key.x, d.key.y) + '$ لأن $(x,y) \\to (x - h, y + k)$.' },
      { q: 'ما معنى إكمال المربع هنا؟', k: ['اكمال', 'المربع'], a: () => 'نكتب $x^2 + bx$ على الصورة $(x + \\frac{b}{2})^2 - (\\frac{b}{2})^2$ فيظهر الانسحاب مباشرة: أفقي $\\frac{b}{2}$ ورأسي $-(\\frac{b}{2})^2$. مثال الكتاب: $x^2 + 4x = (x+2)^2 - 4$.' },
      { q: 'هل يتغير شكل المنحنى بالانسحاب؟', k: ['شكل', 'يتغير', 'حجم'], a: () => 'لا. الانسحاب يحرك جميع النقاط المسافة نفسها، فيبقى الشكل والحجم كما هما؛ يتغير الموقع فقط.' }
    ]
  });

  /* ======================= 2-2 الانعكاس ======================= */
  const RB = {
    lin: { f: (x) => 3 * x + 1, bare: '3x + 1', ar: 'ق(س) = 3س + 1' },
    sqrt: { f: (x) => (x >= 0 ? Math.sqrt(x) : NaN), bare: '\\sqrt{x}', ar: 'ق(س) = √س' },
    cube: { f: (x) => x * x * x - 2 * x + 1, bare: 'x^{3} - 2x + 1', ar: 'ق(س) = س³ − 2س + 1' },
    exp: { f: (x) => Math.pow(2, x), bare: '2^{x}', ar: 'ق(س) = 2^س' }
  };
  ML.register({
    id: 'reflection', unit: U, order: 2, lesson: '2-2', lessonTitle: 'تمثيل الاقترانات باستخدام الانعكاس', page: 36,
    titleAr: 'تمثيل الاقترانات باستخدام الانعكاس', titleEn: 'Graphing Functions Using Reflection', tags: 'انعكاس محور السينات الصادات',
    formula: 'g(x) = -f(x) \\quad\\text{or}\\quad g(x) = f(-x)',
    book: '−ق(س): انعكاس في محور السينات ؛ ق(−س): انعكاس في محور الصادات',
    summary: 'انعكاس النقطة $(x, y)$ في محور السينات هو $(x, -y)$، وفي محور الصادات هو $(-x, y)$. لذلك $-f(x)$ يعكس المنحنى في محور السينات، و $f(-x)$ يعكسه في محور الصادات.',
    vars: [['f(x)', 'الاقتران الأصلي (من أمثلة الكتاب)', 'حسب الاقتران'], ['k', 'انسحاب رأسي بعد الانعكاس (مثل $-f(x) + 1$)', '$k \\in \\mathbb{R}$'], ['P(x_0, y_0)', 'نقطة قابلة للسحب لرؤية انعكاسها', 'أي نقطة في المستوى']],
    params: [
      { key: 'base', label: 'f(x)', type: 'select', value: 'lin', options: [['lin', 'ق(س) = 3س + 1'], ['sqrt', 'ق(س) = √س'], ['cube', 'ق(س) = س³ − 2س + 1'], ['exp', 'ق(س) = 2^س']] },
      { key: 'rx', label: '-f(x)', type: 'toggle', value: true, on: 'انعكاس في محور السينات', off: 'بدون', desc: 'محور السينات' },
      { key: 'ry', label: 'f(-x)', type: 'toggle', value: false, on: 'انعكاس في محور الصادات', off: 'بدون', desc: 'محور الصادات' },
      { key: 'k', label: 'k', min: -6, max: 6, step: 0.5, value: 0, desc: 'انسحاب رأسي بعد الانعكاس' },
      { key: 'px', label: 'x_0', min: -8, max: 8, step: 0.5, value: -4, desc: 'النقطة P (تمرين 1 ص 39)' },
      { key: 'py', label: 'y_0', min: -8, max: 8, step: 0.5, value: 3 }
    ],
    plot: { view: { xmin: -10, xmax: 10, ymin: -10, ymax: 10 } },
    compute(p) {
      const f = RB[p.base].f; const sx = p.ry ? -1 : 1, sy = p.rx ? -1 : 1;
      const g = (x) => sy * f(sx * x) + p.k;
      return { f: f, g: g, P: [p.px, p.py], Px: [p.px, -p.py], Py: [-p.px, p.py] };
    },
    draw(P, p, d) {
      const c = P.colors();
      P.fn(d.f, { color: c.muted, width: 2, dash: [6, 5] });
      P.fn(d.g, { color: c.c1, width: 3 });
      if (p.rx) P.hline(0, { color: c.c4, width: 2.5, alpha: 0.6 });
      if (p.ry) P.vline(0, { color: c.c4, width: 2.5, alpha: 0.6 });
      P.segment(d.P[0], d.P[1], d.Px[0], d.Px[1], { color: c.c3, dash: [3, 4], width: 1.5 });
      P.segment(d.P[0], d.P[1], d.Py[0], d.Py[1], { color: c.c5, dash: [3, 4], width: 1.5 });
      P.point(d.P[0], d.P[1], { color: c.c2, label: 'P(' + M.fmt(p.px) + ', ' + M.fmt(p.py) + ')' });
      P.point(d.Px[0], d.Px[1], { color: c.c3, r: 4, label: "P'(x,-y)" });
      P.point(d.Py[0], d.Py[1], { color: c.c5, r: 4, label: "P''(-x,y)" });
    },
    handles(p, d, set) { return [{ x: p.px, y: p.py, onDrag: (x, y) => { set('px', M.clamp(Math.round(x * 2) / 2, -8, 8)); set('py', M.clamp(Math.round(y * 2) / 2, -8, 8)); } }]; },
    live(p) {
      const inner = p.ry ? RB[p.base].bare.replace(/x/g, '(-x)') : RB[p.base].bare;
      return 'g(x) = ' + (p.rx ? '-\\left(' + inner + '\\right)' : inner) + F.plus(p.k);
    },
    results(p, d) {
      return [
        ['التحويل', (p.rx ? 'انعكاس في محور السينات' : '') + (p.rx && p.ry ? ' ثم ' : '') + (p.ry ? 'انعكاس في محور الصادات' : '') + (!p.rx && !p.ry ? 'لا يوجد انعكاس' : '') + (p.k ? ' ، ثم انسحاب ' + Math.abs(p.k) + (p.k > 0 ? ' للأعلى' : ' للأسفل') : ''), false],
        ['انعكاس P في محور السينات', F.pt(d.Px[0], d.Px[1])],
        ['انعكاس P في محور الصادات', F.pt(d.Py[0], d.Py[1])],
        ['قيمة عند x = 1', 'g(1) = ' + M.tex(d.g(1))]
      ];
    },
    steps(p) {
      const s = ['ابدأ بـ $f(x) = ' + RB[p.base].bare + '$.'];
      if (p.ry) s.push('استبدل $x$ بـ $-x$: كل نقطة $(x, y) \\to (-x, y)$ — انعكاس في محور الصادات.');
      if (p.rx) s.push('اضرب القاعدة في $-1$: كل نقطة $(x, y) \\to (x, -y)$ — انعكاس في محور السينات.');
      if (p.k) s.push('أضف $' + M.fmt(p.k) + '$: انسحاب رأسي.');
      return s;
    },
    explain(a, b) {
      const o = [];
      if (a.rx !== b.rx) o.push(b.rx ? 'ضربنا كل قيمة $y$ في $-1$؛ فالنقاط فوق محور السينات صارت تحته والعكس — المحور هو مرآة الانعكاس.' : 'أُلغي الانعكاس في محور السينات.');
      if (a.ry !== b.ry) o.push(b.ry ? 'عوّضنا $-x$ مكان $x$؛ ما كان على يمين محور الصادات صار على يساره بالارتفاع نفسه.' : 'أُلغي الانعكاس في محور الصادات.');
      if (a.px !== b.px || a.py !== b.py) o.push('النقطة $P' + F.pt(b.px, b.py) + '$: صورتها في محور السينات $' + F.pt(b.px, -b.py) + '$ (تتغير إشارة $y$ فقط)، وفي محور الصادات $' + F.pt(-b.px, b.py) + '$ (تتغير إشارة $x$ فقط).');
      if (a.k !== b.k) o.push('الثابت $k$ يسحب المنحنى الناتج رأسياً ' + M.fmt(Math.abs(b.k - a.k)) + ' وحدة.');
      return o;
    },
    learn: [
      '**انعكاس النقطة** $(x, y)$ في محور السينات هو النقطة $(x, -y)$ (ص 37)، وفي محور الصادات هو $(-x, y)$ (ص 38).',
      '**أتعلّم (ص 37):** منحنى الاقتران $-f(x)$ هو انعكاس لمنحنى $f(x)$ في محور السينات. مثال الكتاب: $f(x) = 3x + 1$ و $-f(x) = -(3x + 1)$.',
      '**أتعلّم (ص 38):** منحنى الاقتران $f(-x)$ هو انعكاس لمنحنى $f(x)$ في محور الصادات. مثال: $f(-x) = 3(-x) + 1 = -3x + 1$.',
      'يمكن دمج الانعكاس مع الانسحاب، مثل $-f(x) + 1$ (تمرين 3 ص 39): انعكاس في محور السينات ثم انسحاب وحدة للأعلى.'
    ],
    challenges: [
      { q: 'أوجد صورة النقطة $(-4, 3)$ بعد انعكاسها في محور الصادات (تمرين 1 ص 39): ضع P بحيث تقع صورتها $P\'\'$ عند $(-4, 3)$.', hint: 'الانعكاس في محور الصادات يغيّر إشارة $x$: النقطة الأصلية $(4, 3)$.', init: { px: 0, py: 0 }, check: (p) => p.px === 4 && p.py === 3 },
      { q: 'مثّل $-f(x) + 1$ لاقتران $f(x) = 3x + 1$.', hint: 'فعّل الانعكاس في محور السينات فقط، و $k = 1$.', init: { base: 'lin', rx: false, ry: false, k: 0 }, check: (p) => p.base === 'lin' && p.rx && !p.ry && p.k === 1 },
      { q: 'مثّل $-f(-x)$ لاقتران $f(x)=\\sqrt{x}$ (تمرين 3 ج ص 39).', hint: 'فعّل الانعكاسين معاً.', init: { base: 'sqrt', rx: false, ry: false, k: 0 }, check: (p) => p.base === 'sqrt' && p.rx && p.ry && p.k === 0 }
    ],
    tutor: [
      { q: 'ما الفرق بين -f(x) و f(-x)؟', k: ['الفرق', 'f(-x)', '-f(x)'], a: () => '$-f(x)$ يغيّر إشارة **الناتج** $y$ ← انعكاس في محور السينات. أما $f(-x)$ فيغيّر إشارة **المدخل** $x$ ← انعكاس في محور الصادات.' },
      { q: 'أين صورة النقطة P؟', k: ['صوره', 'النقطه p', 'p'], a: (p) => 'صورة $P' + F.pt(p.px, p.py) + '$ في محور السينات $' + F.pt(p.px, -p.py) + '$، وفي محور الصادات $' + F.pt(-p.px, p.py) + '$.' },
      { q: 'متى يبقى المنحنى كما هو بعد الانعكاس في محور الصادات؟', k: ['يبقى', 'متماثل', 'نفسه'], a: () => 'عندما يكون $f(-x) = f(x)$ لكل $x$، أي المنحنى متماثل حول محور الصادات (مثل $x^2$ و $|x|$).' }
    ]
  });

  /* ======================= 2-3 إشارة الاقتران التربيعي ======================= */
  ML.register({
    id: 'quadratic', unit: U, order: 3, lesson: '2-3', lessonTitle: 'إشارة الاقتران (الاقتران التربيعي)', page: 42,
    titleAr: 'الاقتران التربيعي وإشارته', titleEn: 'Quadratic Function, Its Graph & Sign', tags: 'تربيعي قطع مكافئ رأس جذور مميز محور تماثل',
    formula: 'f(x) = ax^{2} + bx + c,\\quad a \\neq 0',
    book: 'ق(س) = أ س² + ب س + جـ ، المميز = ب² − 4 أ جـ',
    summary: 'منحنى الاقتران التربيعي قطع مكافئ: يتحدد اتجاه فتحته بإشارة $a$، ورأسه عند $x = -\\frac{b}{2a}$، وعدد أصفاره بإشارة المميّز $b^2 - 4ac$. إشارة الاقتران عكس إشارة $a$ بين الصفرين، ونفس إشارة $a$ خارجهما.',
    vars: [['a', 'معامل $x^2$: يحدد اتجاه الفتحة واتساعها', '$a \\neq 0$ (وإلا لا يكون تربيعياً)'], ['b', 'معامل $x$: يحرك الرأس ومحور التماثل', '$b \\in \\mathbb{R}$'], ['c', 'الحد الثابت = المقطع الصادي $f(0)$', '$c \\in \\mathbb{R}$'], ['\\Delta', 'المميّز $b^2 - 4ac$', '$\\Delta > 0$: صفران، $=0$: صفر واحد، $<0$: لا أصفار حقيقية']],
    params: [
      { key: 'a', label: 'a', min: -5, max: 5, step: 0.1, value: 1, exclude: [0], excludeMsg: '$a \\neq 0$ — عندما $a = 0$ يصبح الاقتران خطياً وليس تربيعياً.', rstep: 0.5 },
      { key: 'b', label: 'b', min: -10, max: 10, step: 0.1, value: 0, rstep: 1 },
      { key: 'c', label: 'c', min: -10, max: 10, step: 0.1, value: -4, rstep: 1 },
      { key: 'x0', label: 'x_0', min: -10, max: 10, step: 0.05, value: 3, desc: 'نقطة متحركة على المنحنى' },
      { key: 'sign', label: '\\pm', type: 'toggle', value: true, on: 'إظهار خط الإشارة', off: 'إخفاء خط الإشارة' }
    ],
    play: { key: 'x0', speed: 3, bounce: true },
    plot: { view: { xmin: -10, xmax: 10, ymin: -10, ymax: 10 }, equal: false },
    compute(p) {
      const s = M.solveQuadratic(p.a, p.b, p.c);
      const f = (x) => p.a * x * x + p.b * x + p.c;
      const crit = s.type === 'complex' ? [] : s.roots;
      const chart = M.signChart(f, crit);
      return Object.assign(s, { f: f, chart: chart, y0: f(p.x0), yint: p.c });
    },
    draw(P, p, d) {
      const c = P.colors();
      P.vline(d.axis, { color: c.c5, dash: [7, 6], width: 1.5 });
      P.text(d.axis, P.view.ymax, 'x = ' + M.fmt(d.axis), { color: c.c5, dy: 14, dx: 6 });
      if (d.type === 'two') { d.chart.forEach((I) => { if (I.sign === '-') P.xBand(I.from, I.to, { color: c.c2, alpha: 0.06 }); }); }
      P.fn(d.f, { color: c.c1, width: 3 });
      if (Math.abs(d.vertex.x) > 1e-9) P.point(0, d.yint, { color: c.c4, r: 4, label: '(0, ' + M.fmt(d.yint) + ')', dx: 8 });
      P.point(d.vertex.x, d.vertex.y, { color: c.c2, label: 'الرأس (' + M.fmt(d.vertex.x) + ', ' + M.fmt(d.vertex.y) + ')', dy: p.a > 0 ? 16 : -14 });
      d.roots.forEach((r) => P.point(r, 0, { color: c.c3, label: 'x = ' + M.fmt(r), dy: -14 }));
      P.point(p.x0, d.y0, { color: c.c6, r: 5, label: 'f(' + M.fmt(p.x0, 2) + ') = ' + M.fmt(d.y0, 2), dx: 8, dy: 0 });
      P.segment(p.x0, 0, p.x0, d.y0, { color: c.c6, dash: [3, 3], width: 1.2 });
      if (d.type === 'complex') P.text(d.vertex.x, d.vertex.y, 'لا يقطع محور السينات (Δ < 0)', { color: c.c2, rtl: true, dy: p.a > 0 ? 34 : -34, align: 'center', bold: true });
      if (p.sign) F.drawSignLine(P, d.chart, d.roots.map((x) => ({ x: x })));
    },
    handles(p, d, set) { return [{ x: p.x0, y: d.y0, onDrag: (x) => set('x0', M.clamp(M.round(x, 2), -10, 10)) }]; },
    live(p) { return 'f(x) = ' + M.polyTeX([p.a, p.b, p.c]); },
    results(p, d) {
      const r = [
        ['المميّز', '\\Delta = b^2 - 4ac = ' + M.tex(d.D), true, d.D < 0 ? 'neg' : d.D > 0 ? 'pos' : ''],
        ['رأس المنحنى', F.pt(d.vertex.x, d.vertex.y)],
        ['محور التماثل', 'x = ' + M.texFrac(d.axis)],
        ['المقطع الصادي', '(0,\\ ' + M.texFrac(p.c) + ')'],
        ['اتجاه الفتحة', p.a > 0 ? 'للأعلى (a > 0) — للمنحنى قيمة صغرى' : 'للأسفل (a < 0) — للمنحنى قيمة عظمى', false]
      ];
      if (d.type === 'two') r.push(['الأصفار (المقاطع السينية)', 'x_1 = ' + M.tex(d.roots[0]) + ',\\quad x_2 = ' + M.tex(d.roots[1])]);
      else if (d.type === 'one') r.push(['الأصفار', 'x = ' + M.tex(d.roots[0]) + '\\ \\text{(صفر مكرر)}']);
      else r.push(['الأصفار', 'لا يوجد حل في مجموعة الأعداد الحقيقية', false, 'neg'], ['الحلول المركبة', 'x = ' + M.tex(d.re) + ' \\pm ' + M.tex(d.im) + 'i']);
      r.push(['الإشارة', d.chart.map((I) => F.interval(I.from, I.to, false, false) + ':\\ ' + (I.sign === '+' ? '+' : '-')).join(',\\ ')]);
      r.push(['المدى', p.a > 0 ? '[' + M.texFrac(d.vertex.y) + ',\\ \\infty)' : '(-\\infty,\\ ' + M.texFrac(d.vertex.y) + ']']);
      return r;
    },
    steps(p, d) {
      const a = M.fmt(p.a), b = M.fmt(p.b), c = M.fmt(p.c);
      const s = [
        '$x_{رأس} = -\\frac{b}{2a} = -\\frac{' + b + '}{2(' + a + ')} = ' + M.tex(d.vertex.x) + '$',
        '$y_{رأس} = f(' + M.tex(d.vertex.x) + ') = ' + M.tex(d.vertex.y) + '$',
        '$\\Delta = (' + b + ')^2 - 4(' + a + ')(' + c + ') = ' + M.tex(d.D) + '$'
      ];
      if (d.type === 'two') s.push('$\\Delta > 0$ ← صفران: $x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a} = \\frac{' + M.fmt(-p.b) + ' \\pm \\sqrt{' + M.fmt(d.D) + '}}{' + M.fmt(2 * p.a) + '}$ ← $' + M.tex(d.roots[0]) + '$ و $' + M.tex(d.roots[1]) + '$', 'الإشارة بين الصفرين عكس إشارة $a$ (' + (p.a > 0 ? 'سالبة' : 'موجبة') + ')، وخارجهما نفس إشارة $a$ (' + (p.a > 0 ? 'موجبة' : 'سالبة') + ').');
      else if (d.type === 'one') s.push('$\\Delta = 0$ ← صفر واحد مكرر $x = -\\frac{b}{2a} = ' + M.tex(d.roots[0]) + '$؛ الإشارة هي إشارة $a$ إلا عند الصفر.');
      else s.push('$\\Delta < 0$ ← $\\sqrt{\\Delta}$ غير حقيقي، فلا أصفار حقيقية؛ الحلان المركبان $' + M.tex(d.re) + ' \\pm ' + M.tex(d.im) + 'i$. الإشارة دائماً هي إشارة $a$ (' + (p.a > 0 ? 'موجبة' : 'سالبة') + ').');
      return s;
    },
    explain(a, b, da, db) {
      const o = [];
      if (Math.sign(a.a) !== Math.sign(b.a)) o.push('تغيّرت إشارة $a$ من ' + (a.a > 0 ? 'موجبة' : 'سالبة') + ' إلى ' + (b.a > 0 ? 'موجبة' : 'سالبة') + '، فانقلب المنحنى ' + (b.a > 0 ? 'لتصبح فتحته للأعلى (قيمة صغرى عند الرأس)' : 'لتصبح فتحته للأسفل (قيمة عظمى عند الرأس)') + '. **جبرياً:** الحد $ax^2$ يسيطر عندما يكبر $|x|$، فإشارته تحدد اتجاه الطرفين.');
      else if (a.a !== b.a) o.push(Math.abs(b.a) > Math.abs(a.a) ? 'زادت $|a|$ من $' + M.fmt(Math.abs(a.a)) + '$ إلى $' + M.fmt(Math.abs(b.a)) + '$ فضاق المنحنى: قيم $y$ تتضاعف بسرعة أكبر لنفس $x$.' : 'قلّت $|a|$ فاتسع المنحنى: يرتفع ببطء أكبر.');
      if (a.c !== b.c && a.a === b.a && a.b === b.b) o.push('تغيّر $c$ من $' + M.fmt(a.c) + '$ إلى $' + M.fmt(b.c) + '$: المنحنى كله ' + (b.c > a.c ? 'ارتفع' : 'انخفض') + ' ' + M.fmt(Math.abs(b.c - a.c)) + ' وحدة (انسحاب رأسي)، والمقطع الصادي صار $(0, ' + M.fmt(b.c) + ')$.');
      if (a.b !== b.b) o.push('تغيّر $b$ فتحرك محور التماثل إلى $x = -\\frac{b}{2a} = ' + M.tex(db.axis) + '$، وانتقل الرأس على مسار منحنٍ.');
      if (da && da.type !== db.type) {
        const nm = { two: 'صفران حقيقيان', one: 'صفر واحد مكرر', complex: 'لا أصفار حقيقية' };
        o.push('**تغيّر عدد الأصفار:** من «' + nm[da.type] + '» إلى «' + nm[db.type] + '» لأن المميّز صار $\\Delta = ' + M.tex(db.D) + '$' + (db.type === 'complex' ? ' سالباً؛ الجذر التربيعي لعدد سالب ليس حقيقياً، لذا لا يقطع المنحنى محور السينات والحلول مركبة $' + M.tex(db.re) + ' \\pm ' + M.tex(db.im) + 'i$.' : db.type === 'one' ? ' = 0؛ الرأس يمس محور السينات.' : ' موجباً؛ المنحنى يقطع محور السينات في نقطتين.'));
      }
      if (a.x0 !== b.x0 && o.length === 0) o.push('النقطة المتحركة عند $x_0 = ' + M.fmt(b.x0) + '$: $f(x_0) = ' + M.tex(db.y0) + '$ ' + (db.y0 > 0 ? '> 0 (فوق محور السينات)' : db.y0 < 0 ? '< 0 (تحت محور السينات)' : '= 0 (صفر الاقتران)') + '.');
      return o;
    },
    learn: [
      '**الاقتران التربيعي** $f(x) = ax^2 + bx + c$ حيث $a \\neq 0$، ومنحناه قطع مكافئ.',
      '**إكمال المربع:** $ax^2 + bx + c = a\\left(x + \\frac{b}{2a}\\right)^2 + \\left(c - \\frac{b^2}{4a}\\right)$؛ فالرأس $\\left(-\\frac{b}{2a},\\ c - \\frac{b^2}{4a}\\right)$ ومحور التماثل $x = -\\frac{b}{2a}$.',
      '**الأصفار:** بحل $ax^2 + bx + c = 0$: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$. المميّز $\\Delta = b^2 - 4ac$ (ص 45) يحدد عددها.',
      '**أتعلّم (ص 43):** إشارة الاقتران التربيعي تكون **عكس إشارة معامل** $x^2$ **بين صفري الاقتران**، وما عدا ذلك فهي إشارة معامل $x^2$.',
      '**أتعلّم (ص 44):** إذا كان للاقتران صفر واحد فقط، فإشارته هي إشارة معامل $x^2$ إلا عند الصفر.',
      '**أتعلّم (ص 45):** إذا لم يقطع المنحنى محور السينات، فإشارة الاقتران هي إشارة معامل $x^2$ دائماً.',
      '**مثال الكتاب (نشاط 5 ص 43):** $f(x) = x^2 + 3x - 10 = (x+5)(x-2)$؛ الأصفار $-5, 2$، والإشارة سالبة على $(-5, 2)$ وموجبة خارجها.'
    ],
    challenges: [
      { q: 'اضبط المعاملات $a, b, c$ لتجعل رأس المنحنى عند النقطة $(2, -3)$ مع $a = 1$.', hint: 'الرأس $x = -\\frac{b}{2a} = 2$ ← $b = -4$، ثم $f(2) = 4 - 8 + c = -3$ ← $c = 1$.', init: { a: 1, b: 0, c: 0 }, check: (p, d) => M.near(p.a, 1) && M.near(d.vertex.x, 2, 1e-6) && M.near(d.vertex.y, -3, 1e-6), why: () => '$f(x) = x^2 - 4x + 1 = (x-2)^2 - 3$.' },
      { q: 'مثّل اقتران الكتاب $f(x) = x^2 + 3x - 10$ (نشاط 5 ص 43) وتحقق من أصفاره.', hint: '$a = 1, b = 3, c = -10$.', init: { a: 1, b: 0, c: 0 }, check: (p) => M.near(p.a, 1) && M.near(p.b, 3) && M.near(p.c, -10), why: () => 'الأصفار $-5$ و $2$، والإشارة سالبة بينهما.' },
      { q: 'اجعل للمعادلة صفراً واحداً مكرراً عند $x = -3$ مع $a = 1$ (مثل $x^2 + 6x + 9$ ص 44).', hint: 'المميّز يجب أن يساوي صفراً: $(x+3)^2$.', init: { a: 1, b: 0, c: 0 }, check: (p, d) => M.near(p.a, 1) && d.type === 'one' && M.near(d.roots[0], -3, 1e-6) },
      { q: 'اجعل الاقتران سالباً لجميع قيم $x$ (لا يقطع محور السينات).', hint: 'تحتاج $a < 0$ و $\\Delta < 0$.', init: { a: 1, b: 0, c: 1 }, check: (p, d) => p.a < 0 && d.type === 'complex' }
    ],
    tutor: [
      { q: 'لماذا اختفت الجذور الحقيقية للمعادلة؟', k: ['اختفت', 'الجذور', 'لا يوجد حل', 'لا تقطع', 'مركب', 'سالب'], a: (p, d) => d.type === 'complex' ? 'لأن المميّز الآن $\\Delta = b^2 - 4ac = (' + M.fmt(p.b) + ')^2 - 4(' + M.fmt(p.a) + ')(' + M.fmt(p.c) + ') = ' + M.tex(d.D) + ' < 0$. قانون الحل يحتاج $\\sqrt{\\Delta}$، والجذر التربيعي لعدد سالب ليس عدداً حقيقياً. **هندسياً:** الرأس عند $y = ' + M.tex(d.vertex.y) + '$ ' + (p.a > 0 ? 'فوق' : 'تحت') + ' محور السينات والفتحة ' + (p.a > 0 ? 'للأعلى' : 'للأسفل') + '، فلا يلتقي المنحنى بالمحور. الحلّان مركبان: $' + M.tex(d.re) + ' \\pm ' + M.tex(d.im) + 'i$.' : 'الجذور الحقيقية موجودة الآن لأن $\\Delta = ' + M.tex(d.D) + ' \\ge 0$. جرّب زيادة $c$ (عندما $a>0$) حتى يصبح $\\Delta$ سالباً وستختفي.' },
      { q: 'كيف يؤثر a على شكل المنحنى؟', k: ['a', 'يضيق', 'يتسع', 'ينقلب', 'فتحه'], a: (p) => 'إشارة $a$ تحدد اتجاه الفتحة (الآن ' + (p.a > 0 ? 'للأعلى' : 'للأسفل') + ')، وكلما زادت $|a|$ (الآن $' + M.fmt(Math.abs(p.a)) + '$) ضاق المنحنى لأن $y$ يتغير أسرع.' },
      { q: 'أين رأس المنحنى ولماذا؟', k: ['راس', 'قمه', 'قاع', 'عظمي', 'صغري'], a: (p, d) => 'الرأس عند $x = -\\frac{b}{2a} = ' + M.tex(d.vertex.x) + '$ و $y = ' + M.tex(d.vertex.y) + '$. هو منتصف المسافة بين الصفرين (إن وُجدا) لأن القطع متماثل حول $x = ' + M.tex(d.axis) + '$.' },
      { q: 'ما إشارة الاقتران الآن؟', k: ['اشاره', 'موجب', 'سالب', 'فوق', 'تحت'], a: (p, d) => 'من خط الإشارة: ' + d.chart.map((I) => 'على $' + F.interval(I.from, I.to, false, false) + '$ الإشارة ' + (I.sign === '+' ? 'موجبة' : 'سالبة')).join('، ') + '.' },
      { q: 'ماذا يفعل c؟', k: ['c', 'المقطع الصادي', 'يرفع'], a: (p) => '$c = f(0)$، أي المقطع الصادي $(0, ' + M.fmt(p.c) + ')$. تغييره وحده يسحب المنحنى رأسياً.' }
    ]
  });

  /* ======================= 2-3 إشارة الاقتران الخطي والنسبي ======================= */
  ML.register({
    id: 'sign', unit: U, order: 4, lesson: '2-3', lessonTitle: 'إشارة الاقتران', page: 40,
    titleAr: 'إشارة الاقتران الخطي والنسبي', titleEn: 'Sign of Linear & Rational Functions', tags: 'اشاره خطي نسبي بسط مقام خط الاعداد',
    formula: 'f(x) = ax + b \\qquad r(x) = \\frac{x + p}{x^{2} + qx + s}',
    book: 'ق(س) = أ س + ب ؛ ق(س) = ل(س) ÷ م(س) ، م(س) ≠ صفر',
    summary: 'إشارة الاقتران الخطي نفس إشارة معامل $x$ يمين صفره وعكسها يساره. وإشارة الاقتران النسبي ناتج قسمة إشارة البسط على إشارة المقام، والاقتران غير معرّف عند أصفار المقام.',
    vars: [['a, b', 'معاملا الاقتران الخطي', '$a \\neq 0$'], ['p', 'البسط $x + p$', '$p \\in \\mathbb{R}$'], ['q, s', 'المقام $x^2 + qx + s$', 'يُستثنى من المجال كل $x$ يجعل المقام صفراً']],
    params: [
      { key: 'type', label: '\\text{type}', type: 'select', value: 'rat', options: [['lin', 'خطي: ق(س) = أ س + ب'], ['rat', 'نسبي: (س + p) ÷ (س² + q س + s)']] },
      { key: 'a', label: 'a', min: -5, max: 5, step: 0.5, value: 2, exclude: [0], hidden: (p) => p.type !== 'lin' },
      { key: 'b', label: 'b', min: -10, max: 10, step: 0.5, value: -4, hidden: (p) => p.type !== 'lin' },
      { key: 'pp', label: 'p', min: -6, max: 6, step: 0.5, value: 3, hidden: (p) => p.type !== 'rat' },
      { key: 'q', label: 'q', min: -6, max: 6, step: 0.5, value: -2, hidden: (p) => p.type !== 'rat' },
      { key: 's', label: 's', min: -9, max: 9, step: 0.5, value: -3, hidden: (p) => p.type !== 'rat' }
    ],
    plot: { view: { xmin: -8, xmax: 8, ymin: -6, ymax: 6 }, equal: false },
    compute(p) {
      if (p.type === 'lin') {
        const f = (x) => p.a * x + p.b; const z = -p.b / p.a;
        return { f: f, zeros: [z], poles: [], holes: [], denZ: [], chart: M.signChart(f, [z]) };
      }
      const num = (x) => x + p.pp, den = (x) => x * x + p.q * x + p.s;
      const sd = M.solveQuadratic(1, p.q, p.s);
      const denZ = sd.type === 'complex' ? [] : sd.roots;
      const z = -p.pp;
      // صفر مكرر للمقام يساوي صفر البسط: (x+p)/(x+p)^2 = 1/(x+p) يبقى خط تقارب لا ثقباً
      const holes = sd.type === 'one' ? [] : denZ.filter((r) => M.near(r, z, 1e-9));
      const poles = denZ.filter((r) => !holes.some((h) => M.near(h, r, 1e-9)));
      const zeros = denZ.some((r) => M.near(r, z, 1e-9)) ? [] : [z];
      const f = (x) => { const dv = den(x); if (Math.abs(dv) < 1e-12) return NaN; return num(x) / dv; };
      // نقطة الثقب: قيمة النهاية بعد الاختصار
      const holePts = holes.map((h) => { const other = denZ.find((r) => !M.near(r, h, 1e-9)); return { x: h, y: 1 / (h - other) }; });
      return { f: f, zeros: zeros, poles: poles, holes: holePts, numZero: z, denZ: denZ, sd: sd, chart: M.signChart(f, zeros.concat(denZ)) };
    },
    draw(P, p, d) {
      const c = P.colors();
      d.poles.forEach((x) => { P.vline(x, { color: c.c2, dash: [6, 5], width: 1.6 }); P.text(x, P.view.ymax, 'x = ' + M.fmt(x) + ' (غير معرّف)', { color: c.c2, dy: 14, dx: 6 }); });
      P.fn(d.f, { color: c.c1, width: 3, asymptotes: d.poles.concat(d.holes.map((h) => h.x)) });
      d.zeros.forEach((x) => P.point(x, 0, { color: c.c3, label: 'صفر: x = ' + M.fmt(x) }));
      d.holes.forEach((h) => { if (Number.isFinite(h.y)) P.point(h.x, h.y, { color: c.c2, open: true, label: 'ثقب عند x = ' + M.fmt(h.x) }); });
      F.drawSignLine(P, d.chart, d.zeros.map((x) => ({ x: x })).concat(d.denZ.map((x) => ({ x: x, undef: true }))));
    },
    live(p) {
      if (p.type === 'lin') return 'f(x) = ' + M.polyTeX([p.a, p.b]);
      return 'r(x) = \\dfrac{' + M.polyTeX([1, p.pp]) + '}{' + M.polyTeX([1, p.q, p.s]) + '}';
    },
    results(p, d) {
      const r = [];
      if (p.type === 'lin') {
        r.push(['صفر الاقتران', 'x = -\\frac{b}{a} = ' + M.texFrac(d.zeros[0])], ['معامل x', 'a = ' + M.fmt(p.a) + (p.a > 0 ? ' > 0' : ' < 0')]);
      } else {
        r.push(['صفر البسط', 'x = ' + M.texFrac(d.numZero)]);
        r.push(['أصفار المقام', d.denZ.length ? d.denZ.map((x) => M.tex(x)).join(',\\ ') : '\\text{لا يوجد (المميّز سالب)}']);
        r.push(['المجال', d.denZ.length ? '\\mathbb{R} - \\{' + d.denZ.map((x) => M.tex(x)).join(',\\ ') + '\\}' : '\\mathbb{R}']);
        if (d.poles.length) r.push(['عند أصفار المقام', 'القسمة على صفر ⇒ الاقتران غير معرّف (خط تقارب رأسي)', false, 'neg']);
        if (d.holes.length) r.push(['ملاحظة', 'صفر البسط = صفر المقام عند x = ' + M.fmt(d.holes[0].x) + ': الاقتران غير معرّف هناك (ثقب)، ولا يكون صفراً له.', false, 'neg']);
        r.push(['الأصفار', d.zeros.length ? 'x = ' + M.texFrac(d.zeros[0]) : '\\text{لا يوجد}']);
      }
      r.push(['الإشارة', d.chart.map((I) => F.interval(I.from, I.to, false, false) + ':\\ ' + (I.sign === '+' ? '+' : '-')).join(',\\ ')]);
      return r;
    },
    steps(p, d) {
      if (p.type === 'lin') return ['صفر الاقتران: $' + M.polyTeX([p.a, p.b]) + ' = 0 \\Rightarrow x = ' + M.texFrac(d.zeros[0]) + '$', 'لكل $x > ' + M.texFrac(d.zeros[0]) + '$: الإشارة نفس إشارة معامل $x$ (' + (p.a > 0 ? 'موجبة' : 'سالبة') + ').', 'لكل $x < ' + M.texFrac(d.zeros[0]) + '$: عكس إشارة معامل $x$ (' + (p.a > 0 ? 'سالبة' : 'موجبة') + ').'];
      return ['إشارة البسط $x ' + F.plus(p.pp) + '$ (خطي): صفره $' + M.texFrac(d.numZero) + '$.', 'إشارة المقام $' + M.polyTeX([1, p.q, p.s]) + '$ (تربيعي): ' + (d.denZ.length ? 'أصفاره $' + d.denZ.map((x) => M.tex(x)).join(', ') + '$' : 'مميّزه سالب فهو موجب دائماً') + '.', 'نقسم إشارة البسط على إشارة المقام في كل فترة (موجب÷موجب = موجب، سالب÷موجب = سالب …).', 'نستثني أصفار المقام من المجال لأن القسمة على صفر غير معرّفة.'];
    },
    explain(a, b, da, db) {
      const o = [];
      if (a.type !== b.type) o.push('انتقلت إلى الاقتران ' + (b.type === 'lin' ? 'الخطي' : 'النسبي') + '.');
      if (b.type === 'rat' && da && da.poles.length !== db.poles.length) o.push('تغيّر عدد أصفار المقام إلى ' + db.denZ.length + '؛ عند كل صفر للمقام يصبح الاقتران غير معرّف ويقترب المنحنى من خط رأسي دون أن يلمسه.');
      if (b.type === 'lin' && Math.sign(a.a) !== Math.sign(b.a)) o.push('انعكست إشارة $a$ فانعكس خط الإشارة كله: ما كان موجباً صار سالباً.');
      return o;
    },
    learn: [
      '**إشارة الاقتران الثابت (ص 40):** $f(x) = c$ إشارته هي إشارة $c$ نفسها.',
      '**إشارة الاقتران الخطي (ص 41):** إشارة $f(x) = ax + b$ هي نفس إشارة معامل $x$ لكل $x$ أكبر من صفر الاقتران، وعكسها لكل $x$ أصغر منه. مثال (1) ص 42: $f(x) = 4 - 2x$، صفره $2$، موجب على $(-\\infty, 2)$ وسالب على $(2, \\infty)$.',
      '**الاقتران النسبي (ص 45):** $f(x) = \\frac{l(x)}{m(x)}$ حيث $l, m$ كثيرا حدود و $m(x) \\neq 0$. نعيّن إشارة البسط وإشارة المقام كلٌّ على خط الأعداد، ثم نعيّن إشارة الناتج.',
      'مثال الكتاب (نشاط 9 ص 45): $f(x) = \\frac{x + 3}{x^2 - 2x - 3}$ ، $x \\neq 3, -1$.',
      '**الدقة:** عند صفر للمقام لا توجد قيمة للاقتران (القسمة على صفر غير معرّفة)؛ نرسم خطاً متقطعاً رأسياً هناك (خط تقارب — إثراء بصري).'
    ],
    challenges: [
      { q: 'اجعل الاقتران الخطي $f(x) = 4 - 2x$ (مثال 1 ص 42).', hint: '$a = -2, b = 4$.', init: { type: 'lin', a: 1, b: 0 }, check: (p) => p.type === 'lin' && p.a === -2 && p.b === 4 },
      { q: 'مثّل اقتران الكتاب $\\frac{x+3}{x^2 - 2x - 3}$ وحدّد الفترات التي يكون فيها موجباً.', hint: '$p = 3, q = -2, s = -3$.', init: { type: 'rat', pp: 0, q: 0, s: 1 }, check: (p) => p.type === 'rat' && p.pp === 3 && p.q === -2 && p.s === -3, why: () => 'الإشارة موجبة على $(-3, -1)$ و $(3, \\infty)$.' },
      { q: 'اجعل المقام بلا أصفار حقيقية (الاقتران معرّف على $\\mathbb{R}$).', hint: 'اجعل مميّز المقام $q^2 - 4s < 0$.', init: { type: 'rat', pp: 1, q: 0, s: -4 }, check: (p, d) => p.type === 'rat' && d.denZ.length === 0 }
    ],
    tutor: [
      { q: 'لماذا الاقتران غير معرّف عند بعض النقاط؟', k: ['غير معرف', 'القسمه علي صفر', 'تقارب', 'مقام'], a: (p, d) => p.type === 'lin' ? 'الاقتران الخطي معرّف لجميع الأعداد الحقيقية.' : (d.denZ.length ? 'لأن المقام $' + M.polyTeX([1, p.q, p.s]) + '$ يساوي صفراً عند $x = ' + d.denZ.map((x) => M.tex(x)).join(', ') + '$، والقسمة على صفر غير معرّفة. قرب هذه القيم يصبح المقام صغيراً جداً فتكبر قيمة الكسر بلا حدود — لذلك يقترب المنحنى من الخط الرأسي ولا يقطعه.' : 'المقام الآن لا يساوي صفراً أبداً (مميّزه سالب)، لذا الاقتران معرّف على $\\mathbb{R}$.') },
      { q: 'كيف أحدد إشارة الاقتران النسبي؟', k: ['كيف', 'نسبي', 'اشاره'], a: () => 'أعيّن أصفار البسط والمقام على خط الأعداد، ثم أختار عدداً من كل فترة وأعوّضه، أو أقسم إشارة البسط على إشارة المقام فيها.' }
    ]
  });

  /* ======================= 2-4 حل المتباينات ======================= */
  const OPS = { lt: ['<', (v) => v < 0], le: ['\\le', (v) => v <= 0], gt: ['>', (v) => v > 0], ge: ['\\ge', (v) => v >= 0] };
  function solveIneq(a, b, c, op) {
    const s = M.solveQuadratic(a, b, c);
    const strict = op === 'lt' || op === 'gt';
    const wantPos = op === 'gt' || op === 'ge';
    const sols = [];
    if (s.type === 'two') {
      const [r1, r2] = s.roots;
      const outsidePos = a > 0; // خارج الجذرين إشارة a
      if (wantPos === outsidePos) { sols.push({ a: -Infinity, b: r1, ca: false, cb: !strict }, { a: r2, b: Infinity, ca: !strict, cb: false }); }
      else sols.push({ a: r1, b: r2, ca: !strict, cb: !strict });
    } else if (s.type === 'one') {
      const r = s.roots[0];
      if (wantPos === (a > 0)) { if (strict) sols.push({ a: -Infinity, b: r, ca: false, cb: false }, { a: r, b: Infinity, ca: false, cb: false }); else sols.push({ a: -Infinity, b: Infinity }); }
      else if (!strict) sols.push({ point: r });
    } else {
      if (wantPos === (a > 0)) sols.push({ a: -Infinity, b: Infinity });
    }
    return { s: s, sols: sols };
  }
  ML.solveIneq = solveIneq;
  ML.register({
    id: 'inequalities', unit: U, order: 5, lesson: '2-4', lessonTitle: 'حل المتباينات', page: 47,
    titleAr: 'حل المتباينات من الدرجة الثانية', titleEn: 'Solving Quadratic Inequalities', tags: 'متباينه فترات مجموعه الحل',
    formula: 'ax^{2} + bx + c \\;\\{<, \\le, >, \\ge\\}\\; 0',
    book: 'نحدد إشارة العبارة أ س² + ب س + جـ على خط الأعداد ثم نختار الفترات المطلوبة',
    summary: 'لحل متباينة تربيعية: ننقل جميع الحدود لطرف واحد، نحدد أصفار العبارة، ثم نعيّن إشارتها على خط الأعداد ونختار الفترات التي تحقق الرمز. الرمزان $\\le, \\ge$ يُدخلان الأصفار في الحل.',
    vars: [['a', 'معامل $x^2$', '$a \\neq 0$'], ['b, c', 'بقية المعاملات', '$\\mathbb{R}$'], ['\\square', 'رمز التباين', '$<, \\le, >, \\ge$']],
    params: [
      { key: 'a', label: 'a', min: -5, max: 5, step: 0.5, value: 1, exclude: [0] },
      { key: 'b', label: 'b', min: -10, max: 10, step: 0.5, value: 3 },
      { key: 'c', label: 'c', min: -12, max: 12, step: 0.5, value: -4 },
      { key: 'op', label: '\\square', type: 'select', value: 'lt', options: [['lt', '< 0'], ['le', '≤ 0'], ['gt', '> 0'], ['ge', '≥ 0']] }
    ],
    plot: { view: { xmin: -8, xmax: 8, ymin: -10, ymax: 10 }, equal: false },
    compute(p) {
      const r = solveIneq(p.a, p.b, p.c, p.op);
      r.f = (x) => p.a * x * x + p.b * x + p.c;
      r.chart = M.signChart(r.f, r.s.type === 'complex' ? [] : r.s.roots);
      return r;
    },
    draw(P, p, d) {
      const c = P.colors();
      d.sols.forEach((I) => { if (I.point === undefined) { P.xBand(I.a, I.b, { color: c.c3, alpha: 0.14 }); P.shade(d.f, Math.max(I.a, P.view.xmin), Math.min(I.b, P.view.xmax), { color: c.c3, alpha: 0.18 }); } });
      P.fn(d.f, { color: c.c1, width: 3 });
      const strict = p.op === 'lt' || p.op === 'gt';
      (d.s.roots || []).forEach((r) => P.point(r, 0, { color: c.c3, open: strict, label: M.fmt(r), dy: -14 }));
      // خط الأعداد مع مجموعة الحل
      const ctx = P.ctx, y = P.H - 22;
      ctx.save(); ctx.fillStyle = c.bg; ctx.globalAlpha = 0.92; ctx.fillRect(0, y - 14, P.W, 30); ctx.globalAlpha = 1;
      ctx.strokeStyle = c.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(6, y); ctx.lineTo(P.W - 6, y); ctx.stroke();
      ctx.strokeStyle = c.c3; ctx.lineWidth = 6; ctx.lineCap = 'round';
      d.sols.forEach((I) => {
        if (I.point !== undefined) { ctx.fillStyle = c.c3; ctx.beginPath(); ctx.arc(P.X(I.point), y, 6, 0, 7); ctx.fill(); return; }
        const xa = I.a === -Infinity ? 6 : P.X(I.a), xb = I.b === Infinity ? P.W - 6 : P.X(I.b);
        ctx.beginPath(); ctx.moveTo(Math.max(6, xa), y); ctx.lineTo(Math.min(P.W - 6, xb), y); ctx.stroke();
        [[I.a, I.ca], [I.b, I.cb]].forEach((e) => { if (!Number.isFinite(e[0])) return; ctx.beginPath(); ctx.arc(P.X(e[0]), y, 5.5, 0, 7); ctx.fillStyle = e[1] ? c.c3 : c.bg; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = c.c3; ctx.stroke(); ctx.lineWidth = 6; });
      });
      ctx.restore();
    },
    live(p) { return M.polyTeX([p.a, p.b, p.c]) + ' ' + OPS[p.op][0] + ' 0'; },
    results(p, d) {
      const r = [['الأصفار', d.s.type === 'complex' ? '\\text{لا أصفار حقيقية } (\\Delta = ' + M.tex(d.s.D) + ' < 0)' : d.s.roots.map((x) => M.tex(x)).join(',\\ ')]];
      r.push(['مجموعة الحل', F.union(d.sols)], ['بعلاقات الترتيب', descr(d.sols), false]);
      return r;
      function descr(sols) {
        if (!sols.length) return 'لا يوجد حل (∅)';
        return sols.map((I) => {
          if (I.point !== undefined) return 'س = ' + M.fmt(I.point);
          if (I.a === -Infinity && I.b === Infinity) return 'جميع الأعداد الحقيقية';
          if (I.a === -Infinity) return 'س ' + (I.cb ? '≤ ' : '< ') + M.fmt(I.b);
          if (I.b === Infinity) return 'س ' + (I.ca ? '≥ ' : '> ') + M.fmt(I.a);
          return M.fmt(I.a) + (I.ca ? ' ≤ ' : ' < ') + 'س' + (I.cb ? ' ≤ ' : ' < ') + M.fmt(I.b);
        }).join(' أو ');
      }
    },
    steps(p, d) {
      const s = ['نحل المعادلة المرافقة $' + M.polyTeX([p.a, p.b, p.c]) + ' = 0$: ' + (d.s.type === 'complex' ? 'لا أصفار حقيقية.' : '$x = ' + d.s.roots.map((x) => M.tex(x)).join(',\\ ') + '$.')];
      s.push('نعيّن الإشارة: ' + d.chart.map((I) => '$' + F.interval(I.from, I.to, false, false) + '$: ' + (I.sign === '+' ? 'موجبة' : 'سالبة')).join('، ') + '.');
      s.push('نختار الفترات التي إشارتها ' + (p.op === 'gt' || p.op === 'ge' ? 'موجبة' : 'سالبة') + (p.op === 'le' || p.op === 'ge' ? ' مع الأصفار (لأن الرمز يشمل المساواة)' : ' دون الأصفار') + ' ← $' + F.union(d.sols) + '$.');
      return s;
    },
    explain(a, b, da, db) {
      const o = [];
      if (a.op !== b.op) o.push('تغيّر رمز التباين إلى $' + OPS[b.op][0] + '$: ' + ((b.op === 'le' || b.op === 'ge') ? 'صار الحل يشمل الأصفار (دوائر مغلقة) لأن المساواة مسموحة.' : 'الأصفار لا تُحقق التباين التام، فهي دوائر مفتوحة.'));
      if (da && da.s.type !== db.s.type) o.push('تغيّر عدد الأصفار بسبب المميّز $\\Delta = ' + M.tex(db.s.D) + '$؛ لذلك تغيّر شكل مجموعة الحل.');
      return o;
    },
    learn: [
      '**مثال (1) ص 48:** حل $x^2 + 3x < 4$: ننقل الحدود $x^2 + 3x - 4 < 0$، ونحلل $(x - 1)(x + 4) < 0$، فالإشارة سالبة بين الصفرين: الحل $(-4, 1)$ أي $-4 < x < 1$.',
      '**أتعلّم:** يمكن كتابة مجموعة الحل على شكل فترة، أو باستخدام علاقات الترتيب $<$ أو $>$.',
      '**نشاط 5 ص 49:** $x^2 - 6x + 9 > 0$ تساوي $(x - 3)^2 > 0$، وهي صائبة لكل $x$ عدا $3$.'
    ],
    challenges: [
      { q: 'حل متباينة الكتاب $x^2 + x - 12 \\ge 0$ (نشاط 4 ص 49).', hint: '$a=1, b=1, c=-12$ والرمز $\\ge$.', init: { a: 1, b: 0, c: 0, op: 'lt' }, check: (p) => p.a === 1 && p.b === 1 && p.c === -12 && p.op === 'ge', why: () => '$(x+4)(x-3) \\ge 0$ ← $(-\\infty, -4] \\cup [3, \\infty)$.' },
      { q: 'كوّن متباينة مجموعة حلها $\\varnothing$ (لا حل).', hint: 'مثلاً $x^2 + 1 < 0$: عبارة موجبة دائماً مطلوب أن تكون سالبة.', init: { a: 1, b: 0, c: -4, op: 'lt' }, check: (p, d) => d.sols.length === 0 },
      { q: 'كوّن متباينة مجموعة حلها نقطة واحدة فقط.', hint: 'استخدم مربعاً كاملاً ورمز $\\le$ مع $a > 0$، مثل $(x-3)^2 \\le 0$.', init: { a: 1, b: 0, c: 1, op: 'lt' }, check: (p, d) => d.sols.length === 1 && d.sols[0].point !== undefined }
    ],
    tutor: [
      { q: 'لماذا لا يدخل الصفر في الحل أحياناً؟', k: ['يدخل', 'الصفر', 'مغلق', 'مفتوح'], a: (p) => (p.op === 'lt' || p.op === 'gt') ? 'لأن الرمز $' + OPS[p.op][0] + '$ تام: عند الأصفار قيمة العبارة $= 0$ وهذا لا يحقق $' + OPS[p.op][0] + ' 0$.' : 'الرمز الحالي يشمل المساواة، لذا الأصفار جزء من الحل.' },
      { q: 'ما مجموعة الحل الآن؟', k: ['مجموعه', 'الحل', 'الجواب'], a: (p, d) => 'مجموعة الحل: $' + F.union(d.sols) + '$.' }
    ]
  });

  /* ======================= 2-5 الاقترانات متعددة القاعدة ======================= */
  ML.register({
    id: 'piecewise', unit: U, order: 6, lesson: '2-5', lessonTitle: 'الاقترانات متعددة القاعدة', page: 50,
    titleAr: 'الاقترانات متعددة القاعدة', titleEn: 'Piecewise Functions', tags: 'متعدد القاعده نقطه تحول دائره مفتوحه',
    formula: 'f(x) = \\begin{cases} A_1x^2 + B_1x + C_1, & x < t \\\\ A_2x^2 + B_2x + C_2, & x \\ge t \\end{cases}',
    book: 'عند التمثيل نعوّض نقطة التحول في القاعدتين، ونضع دائرة مفتوحة عند القاعدة التي لا تنتمي إليها النقطة',
    summary: 'الاقتران متعدد القاعدة يستخدم قاعدة مختلفة في كل جزء من المجال. عند نقطة التحول $t$ نعوّض في القاعدتين: القاعدة التي تشمل $t$ دائرة مغلقة، والأخرى مفتوحة.',
    vars: [['t', 'نقطة التحول', '$\\mathbb{R}$'], ['A_i, B_i, C_i', 'معاملات القاعدة $i$', '$\\mathbb{R}$'], ['x_0', 'قيمة لحساب $f(x_0)$', '$\\mathbb{R}$']],
    params: [
      { key: 't', label: 't', min: -6, max: 6, step: 0.5, value: 1 },
      { key: 'A1', label: 'A_1', min: -3, max: 3, step: 0.5, value: 1 }, { key: 'B1', label: 'B_1', min: -5, max: 5, step: 0.5, value: 0 }, { key: 'C1', label: 'C_1', min: -8, max: 8, step: 0.5, value: 0 },
      { key: 'A2', label: 'A_2', min: -3, max: 3, step: 0.5, value: 0 }, { key: 'B2', label: 'B_2', min: -5, max: 5, step: 0.5, value: 1 }, { key: 'C2', label: 'C_2', min: -8, max: 8, step: 0.5, value: 1 },
      { key: 'side', label: 't \\in', type: 'select', value: 'right', options: [['right', 'النقطة t تتبع القاعدة الثانية (س ≥ t)'], ['left', 'النقطة t تتبع القاعدة الأولى (س ≤ t)']] },
      { key: 'x0', label: 'x_0', min: -8, max: 8, step: 0.25, value: -2 }
    ],
    play: { key: 'x0', speed: 2.5, bounce: true },
    plot: { view: { xmin: -8, xmax: 8, ymin: -6, ymax: 10 }, equal: false },
    compute(p) {
      const f1 = (x) => p.A1 * x * x + p.B1 * x + p.C1, f2 = (x) => p.A2 * x * x + p.B2 * x + p.C2;
      const R = p.side === 'right';
      const f = (x) => (x < p.t || (x === p.t && !R) ? f1(x) : f2(x));
      const L = f1(p.t), Rv = f2(p.t);
      return { f1: f1, f2: f2, f: f, L: L, R: Rv, cont: M.near(L, Rv, 1e-9), ft: R ? Rv : L, y0: f(p.x0), use: (p.x0 < p.t || (p.x0 === p.t && !R)) ? 1 : 2 };
    },
    draw(P, p, d) {
      const c = P.colors();
      P.vline(p.t, { color: c.muted, dash: [4, 5], width: 1.2 });
      P.fn(d.f1, { color: c.c1, width: 3, domain: [-1e9, p.t] });
      P.fn(d.f2, { color: c.c5, width: 3, domain: [p.t, 1e9] });
      const R = p.side === 'right';
      if (d.cont) P.point(p.t, d.ft, { color: R ? c.c5 : c.c1, r: 6 });
      else { P.point(p.t, d.L, { color: c.c1, open: R, r: 6 }); P.point(p.t, d.R, { color: c.c5, open: !R, r: 6 }); }
      P.segment(p.x0, 0, p.x0, d.y0, { color: c.c6, dash: [3, 3], width: 1.2 });
      P.point(p.x0, d.y0, { color: c.c6, label: 'f(' + M.fmt(p.x0) + ') = ' + M.fmt(d.y0) });
    },
    live(p) {
      const R = p.side === 'right';
      return 'f(x) = \\begin{cases} ' + M.polyTeX([p.A1, p.B1, p.C1]) + ', & x ' + (R ? '<' : '\\le') + ' ' + M.fmt(p.t) + ' \\\\ ' + M.polyTeX([p.A2, p.B2, p.C2]) + ', & x ' + (R ? '\\ge' : '>') + ' ' + M.fmt(p.t) + ' \\end{cases}';
    },
    results(p, d) {
      return [
        ['القاعدة الأولى عند t', 'f_1(' + M.fmt(p.t) + ') = ' + M.tex(d.L)],
        ['القاعدة الثانية عند t', 'f_2(' + M.fmt(p.t) + ') = ' + M.tex(d.R)],
        ['قيمة الاقتران عند t', 'f(' + M.fmt(p.t) + ') = ' + M.tex(d.ft)],
        ['اتصال المنحنى عند t', d.cont ? 'القطعتان تلتقيان (لا قفزة)' : 'يوجد قفزة بمقدار ' + M.fmt(Math.abs(d.R - d.L)), false, d.cont ? 'pos' : 'neg'],
        ['قيمة عند x₀', 'f(' + M.fmt(p.x0) + ') = ' + M.tex(d.y0) + '\\ \\text{(القاعدة ' + d.use + ')}']
      ];
    },
    steps(p, d) {
      return ['$x_0 = ' + M.fmt(p.x0) + '$ ' + (d.use === 1 ? 'تحقق شرط القاعدة الأولى' : 'تحقق شرط القاعدة الثانية') + '، فنعوّض فيها: $f(' + M.fmt(p.x0) + ') = ' + M.tex(d.y0) + '$.', 'نعوّض نقطة التحول $t = ' + M.fmt(p.t) + '$ في القاعدتين: $' + M.tex(d.L) + '$ و $' + M.tex(d.R) + '$.', 'الدائرة المفتوحة عند القاعدة التي لا تنتمي إليها $t$، والمغلقة عند الأخرى.'];
    },
    learn: [
      '**نشاط 1 ص 50:** أسعار تذاكر مدينة ملاهٍ تتغير حسب عدد الأفراد — العلاقة تُكتب بقواعد مختلفة لفترات مختلفة: هذا اقتران متعدد القاعدة.',
      '**ملاحظة الكتاب ص 52:** عند التمثيل البياني لاقتران متعدد القاعدة يتم تعويض نقطة التحول في القاعدتين، ونضع دائرة مفتوحة عند القاعدة التي لا تنتمي إليها النقطة.',
      'اقتران القيمة المطلقة واقتران أكبر عدد صحيح من الاقترانات متعددة القاعدة (الدرسان التاليان).'
    ],
    challenges: [
      { q: 'كوّن الاقتران $f(x) = x^2$ عندما $x < 1$ و $f(x) = x + 1$ عندما $x \\ge 1$، ثم احسب $f(1)$.', hint: '$A_1 = 1$ والباقي أصفار، و $B_2 = 1, C_2 = 1$، و $t = 1$.', init: { t: 0, A1: 0, B1: 0, C1: 0, A2: 0, B2: 0, C2: 0, side: 'right' }, check: (p) => p.t === 1 && p.A1 === 1 && p.B1 === 0 && p.C1 === 0 && p.A2 === 0 && p.B2 === 1 && p.C2 === 1 && p.side === 'right', why: () => '$f(1) = 1 + 1 = 2$ (من القاعدة الثانية).' },
      { q: 'اجعل القطعتين تلتقيان عند $t = 2$ (بلا قفزة) مع $f_1(x) = x$ و $f_2(x) = -x + C_2$.', hint: 'يلزم $2 = -2 + C_2$.', init: { t: 2, A1: 0, B1: 1, C1: 0, A2: 0, B2: -1, C2: 0 }, check: (p, d) => p.t === 2 && p.B1 === 1 && p.A1 === 0 && p.C1 === 0 && p.A2 === 0 && p.B2 === -1 && d.cont }
    ],
    tutor: [
      { q: 'أي قاعدة أستخدم لحساب f(x0)؟', k: ['اي قاعده', 'استخدم', 'احسب'], a: (p, d) => '$x_0 = ' + M.fmt(p.x0) + '$ ' + (d.use === 1 ? 'تحقق الشرط الأول' : 'تحقق الشرط الثاني') + '، لذلك $f(x_0) = ' + M.tex(d.y0) + '$.' },
      { q: 'لماذا توجد دائرة مفتوحة؟', k: ['دائره مفتوحه', 'مفتوحه', 'مغلقه'], a: (p, d) => 'نقطة التحول $t = ' + M.fmt(p.t) + '$ تنتمي لقاعدة واحدة فقط؛ القاعدة الأخرى تقترب منها دون أن تشملها، فنرسم عندها دائرة مفتوحة. ' + (d.cont ? 'هنا القيمتان متساويتان فلا قفزة.' : 'هنا القيمتان مختلفتان فتظهر قفزة.') }
    ]
  });

  /* ======================= 2-6 اقتران القيمة المطلقة ======================= */
  ML.register({
    id: 'absolute', unit: U, order: 7, lesson: '2-6', lessonTitle: 'اقتران القيمة المطلقة', page: 54,
    titleAr: 'اقتران القيمة المطلقة', titleEn: 'Absolute Value Function', tags: 'قيمه مطلقه متعدد القاعده',
    formula: 'f(x) = s\\,|\\,\\text{inner}(x)\\,| + k',
    book: 'ق(س) = |س| = س إذا س ≥ صفر ، −س إذا س < صفر',
    summary: 'القيمة المطلقة تجعل كل ناتج سالب موجباً: الجزء من المنحنى الداخلي الواقع تحت محور السينات ينعكس فوقه. لذلك يُعاد تعريفها كاقتران متعدد القاعدة حسب إشارة ما بداخلها.',
    vars: [['\\text{inner}', 'ما داخل رمز القيمة المطلقة: خطي $mx + n$ أو تربيعي $x^2 + qx + r$', '$\\mathbb{R}$'], ['s', 'إشارة أمام القيمة المطلقة ($-|x|$ انعكاس)', '$\\pm 1$'], ['k', 'انسحاب رأسي', '$\\mathbb{R}$']],
    params: [
      { key: 'kind', label: '\\text{inner}', type: 'select', value: 'lin', options: [['lin', 'خطي: m س + n'], ['quad', 'تربيعي: س² + q س + r']] },
      { key: 'm', label: 'm', min: -4, max: 4, step: 0.5, value: 1, exclude: [0], hidden: (p) => p.kind !== 'lin' },
      { key: 'n', label: 'n', min: -8, max: 8, step: 0.5, value: -3, hidden: (p) => p.kind !== 'lin' },
      { key: 'q', label: 'q', min: -8, max: 8, step: 0.5, value: -5, hidden: (p) => p.kind !== 'quad' },
      { key: 'r', label: 'r', min: -8, max: 8, step: 0.5, value: 6, hidden: (p) => p.kind !== 'quad' },
      { key: 'neg', label: 's = -1', type: 'toggle', value: false, on: 'مفعّل (−|…|)', off: 'متوقف' },
      { key: 'k', label: 'k', min: -6, max: 6, step: 0.5, value: 0 }
    ],
    plot: { view: { xmin: -8, xmax: 8, ymin: -6, ymax: 10 }, equal: false },
    compute(p) {
      const inner = p.kind === 'lin' ? (x) => p.m * x + p.n : (x) => x * x + p.q * x + p.r;
      const s = p.neg ? -1 : 1;
      const f = (x) => s * Math.abs(inner(x)) + p.k;
      let zerosIn = [];
      if (p.kind === 'lin') zerosIn = [-p.n / p.m];
      else { const q = M.solveQuadratic(1, p.q, p.r); zerosIn = q.type === 'complex' ? [] : q.roots; }
      // أصفار f نفسها
      let zeros = [];
      if (p.kind === 'lin') {
        // |m x + n| = -s k → يحتاج -s k ≥ 0
        const t = -s * p.k;
        if (t > 0) zeros = [(t - p.n) / p.m, (-t - p.n) / p.m].sort((a, b) => a - b);
        else if (t === 0) zeros = [-p.n / p.m];
      } else {
        const t = -s * p.k;
        if (t >= 0) {
          const set = [];
          [t, -t].forEach((v) => { const q = M.solveQuadratic(1, p.q, p.r - v); if (q.type !== 'complex') q.roots.forEach((r) => set.push(r)); });
          zeros = Array.from(new Set(set.map((x) => M.round(x, 9)))).sort((a, b) => a - b);
        }
      }
      let range;
      if (p.kind === 'lin') range = p.neg ? '(-\\infty,\\ ' + M.texFrac(p.k) + ']' : '[' + M.texFrac(p.k) + ',\\ \\infty)';
      else {
        const vy = p.r - p.q * p.q / 4; const lo = vy >= 0 ? vy : 0;
        range = p.neg ? '(-\\infty,\\ ' + M.texFrac(-lo + p.k) + ']' : '[' + M.texFrac(lo + p.k) + ',\\ \\infty)';
      }
      return { inner: inner, f: f, zerosIn: zerosIn, zeros: zeros, range: range, chartIn: M.signChart(inner, zerosIn) };
    },
    draw(P, p, d) {
      const c = P.colors();
      P.fn(d.inner, { color: c.muted, width: 2, dash: [6, 5] });
      if (p.kind === 'lin') P.vline(-p.n / p.m, { color: c.c5, dash: [6, 6], width: 1.2 });
      P.fn(d.f, { color: c.c1, width: 3 });
      d.zeros.forEach((x) => P.point(x, 0, { color: c.c3, r: 4, label: M.fmt(x), dy: -14 }));
      if (p.kind === 'lin') P.point(-p.n / p.m, p.k, { color: c.c2, label: 'الرأس (' + M.fmt(-p.n / p.m) + ', ' + M.fmt(p.k) + ')' });
    },
    live(p) {
      const inner = p.kind === 'lin' ? M.polyTeX([p.m, p.n]) : M.polyTeX([1, p.q, p.r]);
      return 'f(x) = ' + (p.neg ? '-' : '') + '\\left|' + inner + '\\right|' + F.plus(p.k);
    },
    results(p, d) {
      const inner = p.kind === 'lin' ? M.polyTeX([p.m, p.n]) : M.polyTeX([1, p.q, p.r]);
      const sg = p.neg ? '-' : '';
      // إعادة التعريف دون رمز القيمة المطلقة
      const pos = sg + '(' + inner + ')' + F.plus(p.k), negv = (p.neg ? '' : '-') + '(' + inner + ')' + F.plus(p.k);
      let pw;
      if (p.kind === 'lin') {
        const z = M.texFrac(-p.n / p.m);
        const posCond = p.m > 0 ? 'x \\ge ' + z : 'x \\le ' + z, negCond = p.m > 0 ? 'x < ' + z : 'x > ' + z;
        pw = 'f(x) = \\begin{cases} ' + pos + ', & ' + posCond + ' \\\\ ' + negv + ', & ' + negCond + ' \\end{cases}';
      } else {
        const posI = d.chartIn.filter((I) => I.sign === '+').map((I) => F.interval(I.from, I.to, Number.isFinite(I.from), Number.isFinite(I.to)));
        const negI = d.chartIn.filter((I) => I.sign === '-').map((I) => F.interval(I.from, I.to, false, false));
        pw = 'f(x) = \\begin{cases} ' + pos + ', & x \\in ' + (posI.join(' \\cup ') || '\\varnothing') + (negI.length ? ' \\\\ ' + negv + ', & x \\in ' + negI.join(' \\cup ') : '') + ' \\end{cases}';
      }
      const r = [['إعادة التعريف', pw], ['المجال', '\\mathbb{R}'], ['المدى', d.range], ['الأصفار', d.zeros.length ? d.zeros.map((x) => M.tex(x)).join(',\\ ') : '\\text{لا يوجد}']];
      if (p.kind === 'lin') r.push(['محور التماثل', 'x = ' + M.texFrac(-p.n / p.m)]);
      return r;
    },
    steps(p, d) {
      const inner = p.kind === 'lin' ? M.polyTeX([p.m, p.n]) : M.polyTeX([1, p.q, p.r]);
      return ['نحدد إشارة ما داخل القيمة المطلقة $' + inner + '$: ' + d.chartIn.map((I) => '$' + F.interval(I.from, I.to, false, false) + '$ (' + (I.sign === '+' ? '+' : '−') + ')').join('، ') + '.', 'حيث يكون موجباً أو صفراً: $|' + inner + '| = ' + inner + '$.', 'حيث يكون سالباً: $|' + inner + '| = -(' + inner + ')$ — أي ينعكس ذلك الجزء في محور السينات.'];
    },
    learn: [
      '**تعريف (ص 54):** الاقتران $f(x) = |x|$ يُكتب دون رمز القيمة المطلقة: $|x| = x$ إذا $x \\ge 0$، و $|x| = -x$ إذا $x < 0$. ويُعتبر من الاقترانات متعددة القاعدة.',
      '**نشاط 3 ص 55:** مجال $|x|$ هو $\\mathbb{R}$، ومداه $[0, \\infty)$، ومحور تماثله محور الصادات، وصفره $x = 0$، وليس واحداً لواحد.',
      '**نشاط 4 ص 55:** $|x - 3| = x - 3$ عندما $x \\ge 3$، و $= -x + 3$ عندما $x < 3$؛ منحناه انسحاب لـ $|x|$ ثلاث وحدات لليمين.',
      '**نشاط 6 ص 56:** $|4 - x^2|$ نبحث في إشارة $4 - x^2 = (2 - x)(2 + x)$ ونعيد التعريف على كل فترة.'
    ],
    challenges: [
      { q: 'مثّل $|x - 3|$ (نشاط 4 ص 55).', hint: 'خطي: $m = 1, n = -3$.', init: { kind: 'lin', m: 1, n: 0, k: 0, neg: false }, check: (p) => p.kind === 'lin' && p.m === 1 && p.n === -3 && p.k === 0 && !p.neg },
      { q: 'مثّل $-|x - 3| + 2$ (تمرين 3 ج ص 57).', hint: 'فعّل $s = -1$ و $k = 2$.', init: { kind: 'lin', m: 1, n: 0, k: 0, neg: false }, check: (p) => p.kind === 'lin' && p.m === 1 && p.n === -3 && p.neg && p.k === 2 },
      { q: 'مثّل $|x^2 - 5x + 6|$ (تمرين 4 ب ص 57).', hint: 'تربيعي: $q = -5, r = 6$.', init: { kind: 'quad', q: 0, r: 0, k: 0, neg: false }, check: (p) => p.kind === 'quad' && p.q === -5 && p.r === 6 && !p.neg && p.k === 0 }
    ],
    tutor: [
      { q: 'لماذا لا ينزل المنحنى تحت محور السينات؟', k: ['لا ينزل', 'تحت', 'موجب', 'سالب'], a: (p) => p.neg || p.k < 0 ? 'هنا يمكن أن ينزل لأن ' + (p.neg ? 'الإشارة السالبة تعكس المنحنى' : '') + (p.k < 0 ? ' والانسحاب $k = ' + M.fmt(p.k) + '$ يسحبه للأسفل' : '') + '.' : 'لأن القيمة المطلقة لأي عدد $\\ge 0$؛ فكل جزء سالب من المنحنى الداخلي (المتقطع) ينعكس للأعلى.' },
      { q: 'كيف أعيد تعريف الاقتران دون رمز القيمة المطلقة؟', k: ['اعيد تعريف', 'دون رمز', 'متعدد'], a: () => 'أحدد أصفار ما داخل الرمز، ثم إشارته على كل فترة: حيث موجب يبقى كما هو، وحيث سالب أضربه في $-1$. النتيجة معروضة في «النتائج».' }
    ]
  });

  /* ======================= 2-7 اقتران أكبر عدد صحيح ======================= */
  ML.register({
    id: 'floor', unit: U, order: 8, lesson: '2-7', lessonTitle: 'اقتران أكبر عدد صحيح', page: 58,
    titleAr: 'اقتران أكبر عدد صحيح', titleEn: 'Greatest Integer Function', tags: 'اكبر عدد صحيح سلمي درجه',
    formula: 'f(x) = [\\,ax + b\\,],\\qquad [x] = n \\iff n \\le x < n + 1,\\ n \\in \\mathbb{Z}',
    book: '[س] = أ ، حيث أ ≤ س < أ + 1 ، أ ∈ ص ؛ طول الدرجة = 1 ÷ |معامل س|',
    summary: 'أكبر عدد صحيح للعدد $x$ هو أكبر عدد صحيح أقل من أو يساوي $x$. منحنى $[ax + b]$ سلّمي، وطول كل درجة $\\frac{1}{|a|}$.',
    vars: [['a', 'معامل $x$ داخل الرمز', '$a \\neq 0$'], ['b', 'الثابت داخل الرمز', '$\\mathbb{R}$'], ['n', 'طرف أيمن لحل المعادلة $[ax+b] = n$', '$n \\in \\mathbb{Z}$'], ['x_0', 'قيمة لحساب $[ax_0 + b]$', '$\\mathbb{R}$']],
    params: [
      { key: 'a', label: 'a', min: -4, max: 4, step: 0.5, value: 1, exclude: [0] },
      { key: 'b', label: 'b', min: -5, max: 5, step: 0.5, value: 0 },
      { key: 'n', label: 'n', min: -10, max: 10, step: 1, value: 2, int: true },
      { key: 'x0', label: 'x_0', min: -6, max: 6, step: 0.05, value: 1.3 }
    ],
    play: { key: 'x0', speed: 1.5, bounce: true },
    plot: { view: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 } },
    compute(p) {
      const f = (x) => M.floor(p.a * x + p.b);
      // [ax+b] = n  ⇔  n ≤ ax+b < n+1
      const e1 = (p.n - p.b) / p.a, e2 = (p.n + 1 - p.b) / p.a;
      const sol = p.a > 0 ? { a: e1, b: e2, ca: true, cb: false } : { a: e2, b: e1, ca: false, cb: true };
      return { f: f, step: 1 / Math.abs(p.a), sol: sol, v0: p.a * p.x0 + p.b, y0: f(p.x0) };
    },
    draw(P, p, d) {
      const c = P.colors(); const v = P.view;
      // درجات السلم: لكل عدد صحيح k في المدى المرئي
      const lo = Math.floor(Math.min(p.a * v.xmin + p.b, p.a * v.xmax + p.b)) - 1, hi = Math.ceil(Math.max(p.a * v.xmin + p.b, p.a * v.xmax + p.b)) + 1;
      P.xBand(d.sol.a, d.sol.b, { color: c.c3, alpha: 0.12 });
      for (let k = lo; k <= hi; k++) {
        const x1 = (k - p.b) / p.a, x2 = (k + 1 - p.b) / p.a;
        const L = Math.min(x1, x2), R = Math.max(x1, x2);
        const isSol = k === p.n;
        P.segment(L, k, R, k, { color: isSol ? c.c3 : c.c1, width: isSol ? 4 : 3 });
        // a>0: مغلقة عند x1 (اليسار) مفتوحة عند x2 ؛ a<0: مغلقة عند x1 (اليمين)
        P.point(x1, k, { color: isSol ? c.c3 : c.c1, r: 4.5 });
        P.point(x2, k, { color: isSol ? c.c3 : c.c1, r: 4.5, open: true });
      }
      P.point(p.x0, d.y0, { color: c.c6, r: 6, label: '[' + M.fmt(d.v0, 2) + '] = ' + d.y0 });
      P.segment(p.x0, 0, p.x0, d.y0, { color: c.c6, dash: [3, 3], width: 1.2 });
    },
    live(p) { return 'f(x) = [\\,' + M.polyTeX([p.a, p.b]) + '\\,]'; },
    results(p, d) {
      return [
        ['طول الدرجة', '\\frac{1}{|a|} = ' + M.texFrac(d.step)],
        ['قيمة عند x₀', '[' + M.tex(d.v0) + '] = ' + d.y0],
        ['حل المعادلة', '[' + M.polyTeX([p.a, p.b]) + '] = ' + p.n + ' \\iff x \\in ' + F.interval(d.sol.a, d.sol.b, d.sol.ca, d.sol.cb)],
        ['المجال / المدى', '\\mathbb{R}\\ /\\ \\mathbb{Z}']
      ];
    },
    steps(p, d) {
      const s = ['$[' + M.polyTeX([p.a, p.b]) + '] = ' + p.n + '$ تعني: $' + p.n + ' \\le ' + M.polyTeX([p.a, p.b]) + ' < ' + (p.n + 1) + '$'];
      s.push('نطرح $' + M.fmt(p.b) + '$: $' + M.fmt(p.n - p.b) + ' \\le ' + M.polyTeX([p.a, 0]) + ' < ' + M.fmt(p.n + 1 - p.b) + '$');
      s.push('نقسم على $' + M.fmt(p.a) + '$' + (p.a < 0 ? ' (سالب: ينعكس اتجاه التباين)' : '') + ': $x \\in ' + F.interval(d.sol.a, d.sol.b, d.sol.ca, d.sol.cb) + '$');
      return s;
    },
    learn: [
      '**تعريف (ص 58):** أكبر عدد صحيح للعدد الحقيقي $x$ هو أكبر عدد صحيح أقل من أو يساوي $x$، ويُرمز له $[x]$. أمثلة: $[5.22] = 5$، $[-3.7] = -4$، $[-0.7] = -1$.',
      '**أتعلّم:** لكل $x \\in \\mathbb{R}$: $[x] = n$ حيث $n \\le x < n + 1$ و $n \\in \\mathbb{Z}$. وإذا كان $f(x) = [ax + b]$ فإن $[ax + b] = n$ حيث $n \\le ax + b < n + 1$.',
      '**مثال (1) ص 59:** $[2x + 1] = 7 \\Rightarrow 7 \\le 2x + 1 < 8 \\Rightarrow 3 \\le x < 3.5$.',
      '**ص 60:** يُسمى الاقتران «السلّمي» لشكل منحناه، وطول درجته $\\frac{1}{|\\text{معامل } x|}$.',
      '**أتعلّم ص 61:** $[-x]$ هو انعكاس لـ $[x]$ في محور الصادات.'
    ],
    challenges: [
      { q: 'حل المعادلة $[2x + 1] = 7$ (مثال 1 ص 59).', hint: '$a = 2, b = 1, n = 7$.', init: { a: 1, b: 0, n: 0 }, check: (p) => p.a === 2 && p.b === 1 && p.n === 7, why: () => '$7 \\le 2x + 1 < 8 \\Rightarrow 3 \\le x < 3.5$.' },
      { q: 'اجعل طول الدرجة $\\frac{1}{2}$ مع $[\\,-2x\\,]$… أي $a = -2$.', hint: 'طول الدرجة $1/|a|$.', init: { a: 1, b: 0 }, check: (p) => p.a === -2 && p.b === 0 },
      { q: 'حل $[3x + 1] = 4$ (تمرين 1 أ ص 62).', hint: '$a = 3, b = 1, n = 4$.', init: { a: 1, b: 0, n: 0 }, check: (p) => p.a === 3 && p.b === 1 && p.n === 4, why: () => '$4 \\le 3x + 1 < 5 \\Rightarrow 1 \\le x < \\frac{4}{3}$.' }
    ],
    tutor: [
      { q: 'لماذا [−3.7] = −4 وليس −3؟', k: ['-3.7', 'سالب', '-4', 'لماذا'], a: () => 'لأن $-3 > -3.7$، فـ $-3$ ليس أقل من أو يساوي $-3.7$. أكبر عدد صحيح لا يتجاوز $-3.7$ هو $-4$.' },
      { q: 'لماذا توجد دوائر مفتوحة؟', k: ['مفتوحه', 'دائره', 'مغلقه'], a: (p) => 'كل درجة تشمل بدايتها ($ax + b = n$) ولا تشمل نهايتها ($ax+b = n+1$) حيث تقفز القيمة. ' + (p.a > 0 ? 'لأن $a > 0$ تكون الدائرة المغلقة يسار كل درجة.' : 'لأن $a < 0$ تنعكس الصورة فتكون الدائرة المغلقة يمين كل درجة.') },
      { q: 'ما طول الدرجة؟', k: ['طول', 'الدرجه'], a: (p, d) => 'طول الدرجة $= \\frac{1}{|a|} = \\frac{1}{' + M.fmt(Math.abs(p.a)) + '} = ' + M.texFrac(d.step) + '$.' }
    ]
  });

  /* ======================= 2-8 الاقتران الأسي ======================= */
  const E = Math.E;
  ML.register({
    id: 'exponential', unit: U, order: 9, lesson: '2-8', lessonTitle: 'الاقتران الأسي', page: 63,
    titleAr: 'الاقتران الأسّي', titleEn: 'Exponential Function', tags: 'اسي نيبيري تضاعف انحلال',
    formula: 'f(x) = s\\cdot a^{\\,x - h} + k,\\quad a > 0,\\ a \\neq 1',
    book: 'ق(س) = أ^س ، أ > 0 ، أ ≠ 1 ، س ∈ ح ؛ الاقتران الأسي الطبيعي ق(س) = هـ^س ، هـ ≈ 2.71828',
    summary: 'في $a^x$: إذا $a > 1$ يتزايد المنحنى، وإذا $0 < a < 1$ يتناقص. يمر $a^x$ بالنقطة $(0, 1)$، ومداه الأعداد الموجبة؛ ويمكن تطبيق التحويلات الهندسية عليه.',
    vars: [['a', 'الأساس', '$a > 0$ و $a \\neq 1$'], ['h', 'انسحاب أفقي', '$\\mathbb{R}$'], ['k', 'انسحاب رأسي (خط التقارب $y = k$)', '$\\mathbb{R}$'], ['s', 'انعكاس في محور السينات', '$\\pm 1$']],
    params: [
      { key: 'useE', label: 'a = e', type: 'toggle', value: false, on: 'الأساس هـ (e)', off: 'أساس مخصص' },
      { key: 'a', label: 'a', min: 0.1, max: 5, step: 0.05, value: 2, exclude: [1], excludeMsg: '$a \\neq 1$ — لأن $1^x = 1$ اقتران ثابت وليس أسياً.', hidden: (p) => p.useE, rstep: 0.5 },
      { key: 'h', label: 'h', min: -5, max: 5, step: 0.5, value: 0 },
      { key: 'k', label: 'k', min: -5, max: 5, step: 0.5, value: 0 },
      { key: 'neg', label: 's = -1', type: 'toggle', value: false, on: 'مفعّل', off: 'متوقف' },
      { key: 'x0', label: 'x_0', min: -5, max: 5, step: 0.1, value: 1 }
    ],
    play: { key: 'x0', speed: 2, bounce: true },
    plot: { view: { xmin: -6, xmax: 6, ymin: -4, ymax: 10 }, equal: false },
    compute(p) {
      const a = p.useE ? E : p.a; const s = p.neg ? -1 : 1;
      const f = (x) => s * Math.pow(a, x - p.h) + p.k;
      const yint = f(0);
      const incr = (a > 1) === (s === 1);
      return { a: a, s: s, f: f, yint: yint, incr: incr, y0: f(p.x0), base: (x) => Math.pow(a, x) };
    },
    draw(P, p, d) {
      const c = P.colors();
      P.fn(d.base, { color: c.muted, width: 2, dash: [6, 5] });
      P.hline(p.k, { color: c.c2, dash: [7, 6], width: 1.6 });
      P.text(P.view.xmin, p.k, 'y = ' + M.fmt(p.k) + ' (خط تقارب)', { color: c.c2, dx: 8, dy: -10 });
      P.fn(d.f, { color: c.c1, width: 3 });
      P.point(0, d.yint, { color: c.c4, label: '(0, ' + M.fmt(d.yint, 3) + ')' });
      P.point(p.h, d.s + p.k, { color: c.c5, r: 4, label: '(' + M.fmt(p.h) + ', ' + M.fmt(d.s + p.k) + ')', dy: 14 });
      P.point(p.x0, d.y0, { color: c.c6, label: 'f(' + M.fmt(p.x0) + ') ≈ ' + M.fmt(d.y0, 3) });
    },
    live(p) {
      const base = p.useE ? 'e' : M.fmt(p.a);
      const ex = M.round(p.h, 4) === 0 ? 'x' : F.shift('x', -p.h);
      return 'f(x) = ' + (p.neg ? '-' : '') + base + '^{' + ex + '}' + F.plus(p.k);
    },
    results(p, d) {
      return [
        ['السلوك', d.incr ? 'متزايد: كلما زادت x زادت y' : 'متناقص: كلما زادت x قلّت y', false],
        ['المقطع الصادي', '(0,\\ ' + M.tex(d.yint) + ')'],
        ['المدى', p.neg ? '(-\\infty,\\ ' + M.texFrac(p.k) + ')' : '(' + M.texFrac(p.k) + ',\\ \\infty)'],
        ['خط التقارب الأفقي', 'y = ' + M.texFrac(p.k)],
        ['المقطع السيني', (() => { const t = -p.k * d.s; return t > 0 ? 'x = ' + M.tex(p.h + Math.log(t) / Math.log(d.a)) : '\\text{لا يوجد}'; })()],
        ['قيمة عند x₀', 'f(' + M.fmt(p.x0) + ') \\approx ' + M.tex(d.y0)]
      ];
    },
    steps(p, d) {
      return ['$a = ' + (p.useE ? 'e \\approx 2.71828' : M.fmt(p.a)) + '$ ' + (d.a > 1 ? '$> 1$ ← المنحنى الأساسي $a^x$ متزايد.' : '$< 1$ ← المنحنى الأساسي $a^x$ متناقص.'), '$a^x$ يمر بـ $(0, 1)$ لأن $a^0 = 1$، ومداه $(0, \\infty)$ لأن $a^x > 0$ دائماً.', 'التحويلات: انسحاب أفقي $' + M.fmt(p.h) + '$، ' + (p.neg ? 'انعكاس في محور السينات، ' : '') + 'انسحاب رأسي $' + M.fmt(p.k) + '$ ← خط التقارب $y = ' + M.fmt(p.k) + '$.'];
    },
    explain(a, b, da, db) {
      const o = [];
      if (da && (da.a > 1) !== (db.a > 1)) o.push('عبر الأساس القيمة 1: صار $a ' + (db.a > 1 ? '> 1' : '< 1') + '$ فانقلب السلوك إلى ' + (db.a > 1 ? 'التزايد' : 'التناقص') + '. **لماذا؟** ضرب عدد في أساس أكبر من 1 يكبّره، وفي أساس أقل من 1 يصغّره.');
      else if (a.a !== b.a) o.push('كلما ابتعد $a$ عن 1 أصبح التغير أسرع (المنحنى أشد انحداراً).');
      if (a.k !== b.k) o.push('تحرك خط التقارب إلى $y = ' + M.fmt(b.k) + '$ مع المنحنى؛ المنحنى يقترب منه ولا يقطعه لأن $a^x$ لا يساوي صفراً أبداً.');
      return o;
    },
    learn: [
      '**أتعلّم (ص 63):** يُسمى الاقتران أسياً إذا كان على الصورة $f(x) = a^x$، $a > 0$، $a \\neq 1$، $x \\in \\mathbb{R}$. (نشاط حبّات القمح على رقعة الشطرنج: $1, 2, 4, 8, \\dots$).',
      '**خصائص $a^x$ عندما $a > 1$ (ص 64):** المدى $\\mathbb{R}^+$، يقطع محور الصادات في $(0, 1)$، وكلما زادت $x$ تزداد $y$.',
      '**عندما $0 < a < 1$ (ص 65):** المدى $\\mathbb{R}^+$، يمر بـ $(0, 1)$، وكلما زادت $x$ تقل $y$. ومنحنى $2^x$ هو انعكاس لمنحنى $\\left(\\frac{1}{2}\\right)^x$ في محور الصادات.',
      '**ص 66:** $3^x + 2$ انسحاب لـ $3^x$ وحدتين للأعلى؛ ويمكن تطبيق جميع التحويلات الهندسية على الاقتران الأسي.',
      '**الاقتران الأسي الطبيعي:** أساسه العدد النيبيري $e \\approx 2.71828$ (عدد غير نسبي). مثال: $e^2 \\approx 7.39$.'
    ],
    challenges: [
      { q: 'مثّل $f(x) = 3^x + 2$ (نشاط 6 ص 66).', hint: '$a = 3, k = 2$.', init: { useE: false, a: 2, h: 0, k: 0, neg: false }, check: (p) => !p.useE && M.near(p.a, 3) && p.h === 0 && p.k === 2 && !p.neg },
      { q: 'مثّل $e^{x-1}$ (تمرين 3 ج ص 67).', hint: 'فعّل الأساس $e$ و $h = 1$.', init: { useE: false, a: 2, h: 0, k: 0, neg: false }, check: (p) => p.useE && p.h === 1 && p.k === 0 && !p.neg },
      { q: 'مثّل $3 - e^x$ (تمرين 3 ب ص 67).', hint: '$3 - e^x = -e^x + 3$: انعكاس ثم انسحاب.', init: { useE: false, a: 2, h: 0, k: 0, neg: false }, check: (p) => p.useE && p.neg && p.k === 3 && p.h === 0 },
      { q: 'اجعل المنحنى متناقصاً ويمر بالنقطة $(0, 1)$ دون انعكاس.', hint: 'اختر $0 < a < 1$.', init: { useE: false, a: 2, h: 0, k: 0, neg: false }, check: (p, d) => !p.neg && d.a < 1 && p.h === 0 && p.k === 0 }
    ],
    tutor: [
      { q: 'لماذا لا يقطع المنحنى خط التقارب؟', k: ['تقارب', 'يقطع', 'لا يصل', 'صفر'], a: (p) => 'لأن $a^{x} > 0$ لكل $x$ (لا توجد قوة لعدد موجب تساوي صفراً)، لذلك $' + (p.neg ? '-' : '') + 'a^{x-h} + k$ ' + (p.neg ? 'أقل' : 'أكبر') + ' من $' + M.fmt(p.k) + '$ دائماً ويقترب منه فقط.' },
      { q: 'لماذا يشترط a ≠ 1 و a > 0؟', k: ['يشترط', 'a > 0', 'a ≠ 1', 'اساس سالب'], a: () => 'إذا $a = 1$ فإن $1^x = 1$ ثابت. وإذا $a < 0$ فقيم مثل $(-3)^{1/2}$ غير حقيقية، فلا يكون الاقتران معرّفاً على كل $\\mathbb{R}$ (مثال الكتاب ص 64: $(-3)^x$ ليس أسياً).' },
      { q: 'ما الفرق بين a > 1 و 0 < a < 1؟', k: ['الفرق', 'متزايد', 'متناقص'], a: (p, d) => 'الآن $a = ' + M.fmt(d.a) + '$؛ ' + (d.a > 1 ? 'أكبر من 1 فالمنحنى الأساسي متزايد' : 'بين 0 و 1 فالمنحنى الأساسي متناقص') + '. وكلاهما يمر بـ $(0, 1)$.' }
    ]
  });

  /* ======================= 2-9 الاقتران اللوغاريتمي ======================= */
  ML.register({
    id: 'logarithmic', unit: U, order: 10, lesson: '2-9', lessonTitle: 'الاقتران اللوغاريتمي', page: 69,
    titleAr: 'الاقتران اللوغاريتمي', titleEn: 'Logarithmic Function', tags: 'لوغاريتم مجال انعكاس ص = س',
    formula: 'f(x) = \\log_{a}(x - h) + k,\\quad a > 0,\\ a \\neq 1,\\ x - h > 0',
    book: 'ق(س) = لوأ س ، أ > 0 ، أ ≠ 1 ، س > 0 ؛ منحنى لوأ س انعكاس لمنحنى أ^س في المستقيم ص = س',
    summary: 'اللوغاريتم $\\log_a x$ هو الأس الذي نرفع إليه $a$ لنحصل على $x$. مجاله $x > 0$ فقط، ومنحناه انعكاس لمنحنى $a^x$ في المستقيم $y = x$.',
    vars: [['a', 'الأساس', '$a > 0$ ، $a \\neq 1$'], ['h', 'انسحاب أفقي (خط التقارب الرأسي $x = h$)', '$\\mathbb{R}$'], ['k', 'انسحاب رأسي', '$\\mathbb{R}$'], ['v', 'عدد لحساب $\\log_a v$', '$v > 0$']],
    params: [
      { key: 'useE', label: 'a = e', type: 'toggle', value: false, on: 'لو طبيعي (ln)', off: 'أساس مخصص' },
      { key: 'a', label: 'a', min: 0.1, max: 10, step: 0.05, value: 2, exclude: [1], excludeMsg: '$a \\neq 1$ — لا يوجد أس يحوّل $1$ إلى عدد آخر.', hidden: (p) => p.useE, rstep: 0.5 },
      { key: 'h', label: 'h', min: -5, max: 5, step: 0.5, value: 0 },
      { key: 'k', label: 'k', min: -5, max: 5, step: 0.5, value: 0 },
      { key: 'inv', label: 'a^x', type: 'toggle', value: true, on: 'إظهار الأسي والمستقيم ص = س', off: 'إخفاء' },
      { key: 'v', label: 'v', min: -2, max: 100, step: 0.5, value: 8, desc: 'حاسبة لوأ v' }
    ],
    plot: { view: { xmin: -4, xmax: 10, ymin: -5, ymax: 6 } },
    compute(p) {
      const a = p.useE ? E : p.a;
      const f = (x) => M.logBase(a, x - p.h) + p.k;
      const xint = p.h + Math.pow(a, -p.k);
      return { a: a, f: f, xint: xint, logv: M.logBase(a, p.v), yint: p.h < 0 ? f(0) : NaN };
    },
    draw(P, p, d) {
      const c = P.colors();
      if (p.inv) { P.fn((x) => x, { color: c.muted, width: 1.5, dash: [3, 4] }); P.fn((x) => Math.pow(d.a, x), { color: c.c4, width: 2, dash: [6, 5] }); }
      P.vline(p.h, { color: c.c2, dash: [7, 6], width: 1.6 });
      P.text(p.h, P.view.ymax, 'x = ' + M.fmt(p.h) + ' (خط تقارب رأسي)', { color: c.c2, dx: 6, dy: 14 });
      P.fn(d.f, { color: c.c1, width: 3, domain: [p.h, 1e9], openEnds: true });
      P.point(d.xint, 0, { color: c.c3, label: '(' + M.fmt(d.xint, 3) + ', 0)', dy: 14 });
      P.point(p.h + d.a, 1 + p.k, { color: c.c5, r: 4, label: '(' + M.fmt(p.h + d.a, 3) + ', ' + M.fmt(1 + p.k) + ')' });
    },
    live(p) {
      const base = p.useE ? '\\ln' : '\\log_{' + M.fmt(p.a) + '}';
      return 'f(x) = ' + base + '\\left(' + F.shift('x', -p.h) + '\\right)' + F.plus(p.k);
    },
    results(p, d) {
      return [
        ['المجال', 'x > ' + M.texFrac(p.h) + '\\quad (' + F.interval(p.h, Infinity) + ')'],
        ['المدى', '\\mathbb{R}'],
        ['خط التقارب الرأسي', 'x = ' + M.texFrac(p.h)],
        ['المقطع السيني', '(' + M.tex(d.xint) + ',\\ 0)'],
        ['المقطع الصادي', Number.isFinite(d.yint) ? '(0,\\ ' + M.tex(d.yint) + ')' : '\\text{لا يوجد (0 خارج المجال)}'],
        ['السلوك', d.a > 1 ? 'متزايد (a > 1)' : 'متناقص (0 < a < 1)', false],
        ['الحاسبة', p.v > 0 ? (p.useE ? '\\ln' : '\\log_{' + M.fmt(p.a) + '}') + ' ' + M.fmt(p.v) + ' = ' + M.tex(d.logv) : (p.useE ? '\\ln' : '\\log') + '\\ ' + M.fmt(p.v) + '\\ \\text{غير معرّف (العدد ليس موجباً)}', true, p.v > 0 ? '' : 'neg']
      ];
    },
    steps(p, d) {
      return ['$\\log_a x = y \\iff a^y = x$.', 'المجال: ما داخل اللوغاريتم موجب: $x - ' + M.fmt(p.h) + ' > 0 \\Rightarrow x > ' + M.fmt(p.h) + '$.', 'المقطع السيني: $\\log_a(x - h) = -k \\Rightarrow x = h + a^{-k} = ' + M.tex(d.xint) + '$.'];
    },
    learn: [
      '**أتعلّم (ص 69):** الاقتران على الصورة $f(x) = \\log_a x$، حيث $a > 0$، $a \\neq 1$، $x > 0$ يسمى اقتراناً لوغاريتمياً.',
      '**ص 70:** اللوغاريتم ذو الأساس 10 يسمى العادي ويُكتب $\\log x$، وذو الأساس $e$ يسمى الطبيعي ويُكتب $\\ln x$.',
      '**جدول الكتاب:** $\\log_2 8 = 3$، $\\log_2 4 = 2$، $\\log_2 1 = 0$، $\\log_2 \\frac{1}{4} = -2$ لأن $2^{-2} = \\frac{1}{4}$.',
      '**الخصائص ($a > 1$):** المجال $\\mathbb{R}^+$، المدى $\\mathbb{R}$، يقطع محور السينات في $(1, 0)$، وكلما زادت $x$ زادت $y$. وعندما $0 < a < 1$ يتناقص.',
      '**مثال (1) ص 72:** منحنى $\\ln x$ هو انعكاس لمنحنى $e^x$ في المستقيم $y = x$.',
      '**نشاط 8 ص 73:** مجال $\\log_2(x - 3)$ هو $x > 3$.'
    ],
    challenges: [
      { q: 'احسب $\\log_2 64$ (نشاط 1 ص 69) باستخدام الحاسبة.', hint: 'اجعل $a = 2$ و $v = 64$.', init: { useE: false, a: 3, v: 1 }, check: (p) => !p.useE && M.near(p.a, 2) && p.v === 64, why: () => '$\\log_2 64 = 6$ لأن $2^6 = 64$.' },
      { q: 'مثّل $\\log_2 x - 1$ (نشاط 5 ص 71).', hint: '$a = 2, h = 0, k = -1$.', init: { useE: false, a: 3, h: 0, k: 0 }, check: (p) => !p.useE && M.near(p.a, 2) && p.h === 0 && p.k === -1 },
      { q: 'اجعل مجال الاقتران $x > 3$ (مثل $\\log_2(x - 3)$).', hint: 'حرّك $h$.', init: { h: 0 }, check: (p) => p.h === 3 }
    ],
    tutor: [
      { q: 'لماذا لا يوجد لوغاريتم لعدد سالب؟', k: ['سالب', 'صفر', 'غير معرف', 'مجال'], a: (p) => 'لأن $\\log_a x = y$ تعني $a^y = x$، و $a^y > 0$ دائماً لأي $y$؛ فلا يوجد أس يعطي صفراً أو عدداً سالباً. لذلك المجال هنا $x > ' + M.fmt(p.h) + '$.' },
      { q: 'ما العلاقة بين اللوغاريتم والأسي؟', k: ['العلاقه', 'الاسي', 'انعكاس', 'معكوس'], a: () => 'كل منهما يعكس عمل الآخر: $a^{\\log_a x} = x$. لذلك منحنى $\\log_a x$ هو انعكاس منحنى $a^x$ في المستقيم $y = x$ (فعّل إظهار الأسي لترى ذلك).' },
      { q: 'كم يساوي اللوغاريتم في الحاسبة؟', k: ['كم', 'يساوي', 'حاسبه'], a: (p, d) => p.v > 0 ? '$\\log_{' + M.fmt(d.a, 4) + '} ' + M.fmt(p.v) + ' = ' + M.tex(d.logv) + '$ لأن $' + M.fmt(d.a, 4) + '^{' + M.fmt(d.logv) + '} \\approx ' + M.fmt(p.v) + '$.' : 'العدد $' + M.fmt(p.v) + '$ ليس موجباً، فلوغاريتمه غير معرّف.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
