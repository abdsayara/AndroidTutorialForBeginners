/* العلوم الحياتية — الوحدة الثالثة، الفصل الثاني: الجهازان التناسليان والتكاثر (ص 68–83)
 * رسوم تخطيطية مبسطة بمستوى الكتاب المدرسي، دون تفاصيل خارج الكتاب.
 */
(function (root) {
  'use strict';
  const ML = root.ML; const B = ML.bio; const D = ML.pdraw;
  const S = 'g10-bio'; const U = 7;
  const reg = (o) => ML.register(Object.assign({ subject: S, unit: U, custom: true }, o));
  const narrow = (W) => W < 640;

  /* ======================= 1-2 / 2-2 الجهازان التناسليان ======================= */
  const MALE = {
    testis: ['الخصيتان', 'غدتان بيضاويتان تقعان خارج الجسم في كيس الصفن؛ تحتويان مئات الأنابيب المنوية الملتوية التي يتم داخلها إنتاج الحيوانات المنوية، وخلايا بينية تفرز هرمون التستوستيرون.'],
    scrotum: ['كيس الصفن', 'يعمل على حماية الخصيتين.'],
    epid: ['البربخ', 'أنبوب واحد مشترك كثير الالتواء، يُستكمل فيه نمو ونضج الحيوانات المنوية وتخزينها فترة من الزمن.'],
    vas: ['الوعاء الناقل (الأسهر)', 'ينقل الحيوانات المنوية من البربخ، ويمتد صعوداً باتجاه تجويف البطن، وينتهي خلف المثانة البولية.'],
    vesicle: ['الحويصلة المنوية', 'من الغدد الملحقة بالجهاز التناسلي الذكري (الشكل 3).'],
    prostate: ['غدة البروستات', 'من الغدد الملحقة؛ تحيط بعنق المثانة (س5 ص 94).'],
    cowper: ['غدتا كوبر', 'من الغدد الملحقة بالجهاز التناسلي الذكري (الشكل 3).'],
    urethra: ['الإحليل (قناة البول)', 'قناة بولية تناسلية مشتركة عند الذكر.'],
    penis: ['القضيب', 'يعمل على نقل السائل المنوي.'],
    bladder: ['المثانة', 'جزء من الجهاز البولي (للتوضيح).']
  };
  const FEMALE = {
    ovary: ['المبيضان', 'غدتان صغيرتان على جانبي الرحم، تنتجان الخلية البيضية الثانوية، وتفرزان الهرمونات الجنسية مثل البروجسترون والإستروجين.'],
    tube: ['قناتا البيض (فالوب)', 'تتسع كل منهما بالقرب من المبيض لتكوّن قمعاً، وتكثر في سطحها الداخلي الأهداب التي تساعد مع انقباض الجدار في دفع البويضة باتجاه الرحم.'],
    uterus: ['الرحم', 'عضو عضلي مجوف سميك الجدار يشبه ثمرة الإجاص، طوله حوالي 7.5 سم، مبطن ببطانة الرحم التي تتهيأ شهرياً لاستقبال الجنين.'],
    lining: ['بطانة الرحم', 'تزداد سمكاً إذا حدث إخصاب، وتنسلخ وتخرج في عملية الطمث إذا لم يحدث.'],
    cervix: ['عنق الرحم', 'الجزء السفلي الضيق من الرحم، يمتد قليلاً في المهبل.'],
    vagina: ['المهبل', 'أنبوب عضلي مطاطي يتصل بالفتحة التناسلية.']
  };
  const MPATH = ['testis', 'epid', 'vas', 'urethra', 'penis'], FPATH = ['ovary', 'tube', 'uterus'];
  function maleDiagram(ctx, W, H, c, sel, hits, pathK) {
    const cx = W / 2, s = Math.min(W / 440, H / 420), Y = (v) => 30 + v * s, X = (v) => cx + v * s;
    const col = (id, base) => (sel === id ? '#fbbf24' : base);
    const reg2 = (id, x, y, w, h) => hits.push({ id: id, x: X(x), y: Y(y), w: w * s, h: h * s });
    // المثانة
    B.blob(ctx, X(0), Y(70), 70 * s, 55 * s, col('bladder', 'rgba(253,230,138,.8)'), '#a16207', 2); reg2('bladder', -50, 30, 100, 70);
    // الحويصلتان والبروستات
    [-1, 1].forEach((sg) => { B.blob(ctx, X(sg * 62), Y(125), 18 * s, 32 * s, col('vesicle', 'rgba(196,181,253,.9)'), '#6d28d9', 2); reg2('vesicle', sg * 62 - 18, 95, 36, 60); });
    B.blob(ctx, X(0), Y(150), 34 * s, 24 * s, col('prostate', 'rgba(244,114,182,.75)'), '#9d174d', 2); reg2('prostate', -34, 128, 68, 46);
    [-1, 1].forEach((sg) => { B.blob(ctx, X(sg * 20), Y(192), 8 * s, 8 * s, col('cowper', '#f472b6'), '#9d174d', 1.5); reg2('cowper', sg * 20 - 10, 182, 20, 20); });
    // الإحليل والقضيب
    ctx.strokeStyle = col('urethra', '#ca8a04'); ctx.lineWidth = 7 * s; ctx.beginPath(); ctx.moveTo(X(0), Y(120)); ctx.lineTo(X(0), Y(290)); ctx.stroke(); reg2('urethra', -8, 200, 16, 40);
    D.rr(ctx, X(-20), Y(240), 40 * s, 90 * s, 18 * s); ctx.fillStyle = col('penis', 'rgba(251,207,232,.55)'); ctx.fill(); ctx.strokeStyle = '#9d174d'; ctx.lineWidth = 2; ctx.stroke(); reg2('penis', -20, 250, 40, 80);
    ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 7 * s; ctx.beginPath(); ctx.moveTo(X(0), Y(240)); ctx.lineTo(X(0), Y(328)); ctx.stroke();
    // الخصيتان وكيس الصفن والبربخ والأسهر
    [-1, 1].forEach((sg) => {
      D.rr(ctx, X(sg * 95 - 55), Y(265), 110 * s, 120 * s, 50 * s); ctx.fillStyle = col('scrotum', 'rgba(254,215,170,.45)'); ctx.fill(); ctx.strokeStyle = '#c2410c'; ctx.lineWidth = 1.5; ctx.stroke(); reg2('scrotum', sg * 95 - 55, 360, 110, 25);
      B.blob(ctx, X(sg * 95), Y(320), 32 * s, 42 * s, col('testis', 'rgba(147,197,253,.9)'), '#1d4ed8', 2.5); reg2('testis', sg * 95 - 30, 285, 60, 75);
      ctx.strokeStyle = col('epid', '#0f766e'); ctx.lineWidth = 6 * s; ctx.beginPath(); ctx.arc(X(sg * 95 + sg * 30), Y(318), 30 * s, -Math.PI / 2, Math.PI / 2, sg < 0); ctx.stroke(); reg2('epid', sg * 95 + (sg > 0 ? 28 : -48), 285, 20, 70);
      ctx.strokeStyle = col('vas', '#0891b2'); ctx.lineWidth = 5 * s; ctx.beginPath(); ctx.moveTo(X(sg * 125), Y(290)); ctx.bezierCurveTo(X(sg * 160), Y(200), X(sg * 150), Y(60), X(sg * 90), Y(50)); ctx.bezierCurveTo(X(sg * 50), Y(50), X(sg * 70), Y(110), X(sg * 40), Y(135)); ctx.lineTo(X(sg * 8), Y(150)); ctx.stroke(); reg2('vas', sg * 160 - (sg > 0 ? 20 : 0), 120, 20, 120);
    });
    // [الجزء، x و y نقطة الجزء، الجهة، y التسمية]
    const L = [['vesicle', 70, 120, 1, 105], ['prostate', 30, 150, 1, 140], ['cowper', 26, 192, 1, 175], ['epid', 128, 300, 1, 285], ['testis', 110, 330, 1, 330], ['scrotum', 120, 375, 1, 375], ['vas', -150, 150, -1, 105], ['bladder', -40, 70, -1, 60], ['urethra', -4, 215, -1, 215], ['penis', -18, 290, -1, 300]];
    L.forEach((q) => { const lx = X(q[3] * 205), ly = Y(q[4]); ctx.strokeStyle = c.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(q[1]), Y(q[2])); ctx.lineTo(lx - q[3] * 4, ly); ctx.stroke(); D.txt(ctx, MALE[q[0]][0], lx, ly, { color: sel === q[0] ? '#d97706' : c.text, size: narrow(W) ? 10 : 12, w: '800', align: q[3] > 0 ? 'left' : 'right', halo: c.bg }); });
    if (pathK !== null && pathK !== undefined) { const P = [[95, 320], [125, 318], [140, 120], [0, 230], [0, 325]]; const q = P[Math.min(pathK, P.length - 1)]; B.blob(ctx, X(q[0]), Y(q[1]), 7, 7, '#dc2626', '#fff', 2); }
  }
  function femaleDiagram(ctx, W, H, c, sel, hits, pathK) {
    const cx = W / 2, s = Math.min(W / 460, H / 380), Y = (v) => 30 + v * s, X = (v) => cx + v * s;
    const col = (id, base) => (sel === id ? '#fbbf24' : base);
    const reg2 = (id, x, y, w, h) => hits.push({ id: id, x: X(x), y: Y(y), w: w * s, h: h * s });
    // الرحم (إجاص مقلوب)
    ctx.beginPath(); ctx.moveTo(X(-80), Y(60)); ctx.quadraticCurveTo(X(0), Y(30), X(80), Y(60)); ctx.quadraticCurveTo(X(85), Y(170), X(22), Y(220)); ctx.lineTo(X(-22), Y(220)); ctx.quadraticCurveTo(X(-85), Y(170), X(-80), Y(60)); ctx.closePath();
    ctx.fillStyle = col('uterus', 'rgba(251,113,133,.55)'); ctx.fill(); ctx.strokeStyle = '#be123c'; ctx.lineWidth = 3; ctx.stroke(); reg2('uterus', -80, 60, 30, 90);
    ctx.beginPath(); ctx.moveTo(X(-50), Y(75)); ctx.quadraticCurveTo(X(0), Y(60), X(50), Y(75)); ctx.quadraticCurveTo(X(45), Y(160), X(10), Y(200)); ctx.lineTo(X(-10), Y(200)); ctx.quadraticCurveTo(X(-45), Y(160), X(-50), Y(75)); ctx.closePath(); ctx.fillStyle = col('lining', 'rgba(254,205,211,.95)'); ctx.fill(); ctx.strokeStyle = '#e11d48'; ctx.lineWidth = 2; ctx.stroke(); reg2('lining', -30, 90, 60, 80);
    D.rr(ctx, X(-22), Y(215), 44 * s, 30 * s, 8 * s); ctx.fillStyle = col('cervix', 'rgba(244,63,94,.6)'); ctx.fill(); ctx.stroke(); reg2('cervix', -22, 215, 44, 30);
    D.rr(ctx, X(-26), Y(245), 52 * s, 100 * s, 12 * s); ctx.fillStyle = col('vagina', 'rgba(251,207,232,.7)'); ctx.fill(); ctx.strokeStyle = '#be185d'; ctx.stroke(); reg2('vagina', -26, 250, 52, 95);
    [-1, 1].forEach((sg) => {
      ctx.strokeStyle = col('tube', '#db2777'); ctx.lineWidth = 7 * s; ctx.beginPath(); ctx.moveTo(X(sg * 75), Y(62)); ctx.bezierCurveTo(X(sg * 130), Y(30), X(sg * 180), Y(40), X(sg * 200), Y(90)); ctx.stroke();
      ctx.fillStyle = col('tube', '#f472b6'); ctx.beginPath(); ctx.moveTo(X(sg * 195), Y(85)); ctx.lineTo(X(sg * 225), Y(110)); ctx.lineTo(X(sg * 180), Y(120)); ctx.closePath(); ctx.fill(); reg2('tube', sg > 0 ? 100 : -180, 30, 80, 40);
      B.blob(ctx, X(sg * 165), Y(140), 30 * s, 20 * s, col('ovary', 'rgba(196,181,253,.95)'), '#6d28d9', 2.5); reg2('ovary', sg * 165 - 30, 120, 60, 40);
      for (let k = 0; k < 3; k++) B.blob(ctx, X(sg * 155 + k * 8 * sg), Y(138 + (k % 2) * 6), 4, 4, '#fde68a', '#a16207', 1);
    });
    const L = [['ovary', 165, 160, 1, 195], ['tube', 150, 45, 1, 20], ['uterus', -60, 170, -1, 200], ['cervix', -22, 230, -1, 240], ['vagina', -26, 300, -1, 300]];
    L.forEach((q) => { const lx = X(q[3] * 120), ly = Y(q[4]); ctx.strokeStyle = c.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(q[1]), Y(q[2])); ctx.lineTo(lx - q[3] * 4, ly); ctx.stroke(); D.txt(ctx, FEMALE[q[0]][0], lx, ly, { color: sel === q[0] ? '#d97706' : c.text, size: narrow(W) ? 10 : 12, w: '800', align: q[3] > 0 ? 'left' : 'right', halo: c.bg }); });
    D.txt(ctx, FEMALE.lining[0], X(0), Y(120), { color: sel === 'lining' ? '#d97706' : '#9f1239', size: narrow(W) ? 10 : 12, w: '800', halo: c.bg });
    if (pathK !== null && pathK !== undefined) { const P = [[165, 140], [150, 45], [20, 140]]; const q = P[Math.min(pathK, P.length - 1)]; B.blob(ctx, X(q[0]), Y(q[1]), 8, 8, '#fde047', '#a16207', 2); }
  }
  reg({
    id: 'reproductive-systems', order: 1, lesson: '1-2 / 2-2', lessonTitle: 'الجهاز التناسلي الذكري والأنثوي', page: 68,
    titleAr: 'الجهازان التناسليان: الأجزاء والوظائف', titleEn: 'The Male and Female Reproductive Systems', tags: 'جهاز تناسلي ذكري انثوي خصيه بربخ اسهر بروستات مبيض قناه البيض فالوب رحم',
    formula: '\\text{الخصية} \\to \\text{البربخ} \\to \\text{الوعاء الناقل} \\to \\text{الإحليل} \\qquad \\text{المبيض} \\to \\text{قناة البيض} \\to \\text{الرحم}',
    book: 'الشكل (1) ص 68: الجهاز التناسلي الذكري؛ الشكل (3) ص 70: الغدد الملحقة؛ الشكلان (4) و (5) ص 70–71: الجهاز التناسلي الأنثوي وأجزاؤه.',
    summary: 'رسم تخطيطي مبسّط كما في الكتاب. اضغط على أي جزء لمعرفة اسمه ووظيفته، واستعمل زر المرحلة لتتبع مسار الحيوان المنوي من مكان تكونه حتى خروجه، أو مسار البويضة من المبيض إلى الرحم.',
    vars: [['\\text{الجهاز}', 'الذكري أو الأنثوي', '—', 'اختيار'], ['\\text{طول الرحم}', 'حوالي 7.5 (ص 71)', '\\text{سم}', 'من الكتاب']],
    assumptions: ['الرسوم تخطيطية مبسطة بمستوى الكتاب المدرسي (نموذج مبسّط لأغراض التعليم) وليست بمقياس رسم.'],
    params: [
      { key: 'sys', label: '\\text{الجهاز}', type: 'select', options: [['m', 'الجهاز التناسلي الذكري'], ['f', 'الجهاز التناسلي الأنثوي']], value: 'm' },
      { key: 'k', label: '\\text{تتبع المسار}', type: 'stage', stages: (p) => (p.sys === 'f' ? FPATH.map((x) => FEMALE[x][0]) : MPATH.map((x) => MALE[x][0])), value: 0 }
    ],
    onSet(p, key) { if (key === 'sys') p.k = 0; },
    initState: () => ({ sel: null }), resetOn: ['sys'],
    play: { mode: 'stage', key: 'k', interval: 1.6 },
    randomize(p) { return { sys: p.sys === 'm' ? 'f' : 'm', k: 0 }; },
    canvasHint: 'اضغط على أي جزء لمعرفة اسمه ووظيفته. النقطة الملونة تتبع المسار.',
    compute(p) { const path = p.sys === 'f' ? FPATH : MPATH; const k = Math.min(p.k, path.length - 1); const T = p.sys === 'f' ? FEMALE : MALE; return { path: path, k: k, T: T, at: T[path[k]] }; },
    drawCustom(ctx, W, H, p, d, c) {
      const sel = d.st && d.st.sel;
      if (p.sys === 'm') maleDiagram(ctx, W, H - 30, c, sel || d.path[d.k], d.hits, d.k); else femaleDiagram(ctx, W, H - 30, c, sel || d.path[d.k], d.hits, d.k);
      const shown = sel ? d.T[sel] : d.at; B.para(ctx, D, shown[0] + ': ' + shown[1], W / 2, H - 14, W - 30, { color: c.text, size: narrow(W) ? 11 : 13, w: '700', bottom: true });
    },
    onPointer(type, x, y, p, st, api) { if (type !== 'down') return false; const h = api.hit(x, y); if (!h) return false; const T = p.sys === 'f' ? FEMALE : MALE; if (!T[h.id]) return false; st.sel = h.id; api.say(['**' + T[h.id][0] + ':** ' + T[h.id][1]]); return true; },
    live(p, d) { return '\\text{' + d.at[0] + '}'; },
    results(p, d) { const sel = d.st && d.st.sel; return [['الجهاز', p.sys === 'm' ? 'الذكري' : 'الأنثوي', false], ['الموقع على المسار', d.at[0], false], ['وظيفته', d.at[1], false]].concat(sel ? [['الجزء المختار', d.T[sel][0] + ': ' + d.T[sel][1], false]] : []); },
    steps(p, d) { return d.path.map((x) => d.T[x][0]); },
    explain(a, b, da, db) { if (a.sys !== b.sys) return [b.sys === 'f' ? 'الجهاز الأنثوي: مبيضان، قناتا البيض (فالوب)، رحم، مهبل.' : 'الجهاز الذكري: خصيتان، أنابيب ناقلة، غدد ملحقة (الحويصلة المنوية، البروستات، غدتا كوبر)، القضيب.']; if (a.k !== b.k) return ['**' + db.at[0] + ':** ' + db.at[1]]; return []; },
    learn: ['**الجهاز الذكري (ص 68–70):** خصيتان وأنابيب ناقلة تصل بين الخصيتين والقضيب، ومجموعة من الغدد التناسلية الملحقة.', '**الغدد الملحقة (الشكل 3):** الحويصلة المنوية، غدة البروستات، غدتا كوبر — ولها علاقة بالسائل المنوي.', '**الجهاز الأنثوي (ص 70–72):** مبيضان، قناتا البيض (فالوب)، رحم، مهبل؛ يتم فيه إنتاج البويضة وإخصابها وتهيئة الظروف الملائمة لتكوين الجنين ونموه.', '**ملاحظة من الكتاب (ص 71):** يتوقف الجهاز التناسلي الأنثوي عن إنتاج البويضات عند فترة زمنية محدودة، بينما ينتج الذكري الحيوانات المنوية طوال الحياة تقريباً.'],
    challenges: [
      { q: 'سؤال الكتاب (ص 70): تتبع مسار الحيوان المنوي حتى يصل إلى **الوعاء الناقل (الأسهر)**.', hint: 'الخصية ← البربخ ← الوعاء الناقل.', init: { sys: 'f', k: 0 }, check: (p) => p.sys === 'm' && p.k === 2 },
      { q: 'سؤال الكتاب (ص 72): تتبع مسار البويضة من المبيض حتى تصل إلى **الرحم**.', hint: 'المبيض ← قناة البيض ← الرحم.', init: { sys: 'm', k: 0 }, check: (p) => p.sys === 'f' && p.k === 2 },
      { q: 'اضغط على الجزء الذي **يُستكمل فيه نضج الحيوانات المنوية وتخزينها**.', hint: 'أنبوب كثير الالتواء بجانب الخصية.', init: { sys: 'm', k: 0 }, check: (p, d) => p.sys === 'm' && d.st && d.st.sel === 'epid' }
    ],
    tutor: [
      { q: 'ما وظيفة البربخ؟', k: ['بربخ'], a: () => MALE.epid[1] },
      { q: 'ما الهرمونات التي يفرزها المبيضان؟', k: ['هرمون', 'مبيض', 'المبيضان'], a: () => 'البروجسترون (ضروري لحدوث واستمرار الحمل) والإستروجين (يعطي الأنثى الصفات الأنثوية الثانوية) (ص 71).' },
      { q: 'كيف تتحرك البويضة إلى الرحم؟', k: ['تتحرك', 'البويضه', 'الرحم'], a: () => 'تساعد الأهداب في قناة البيض وانقباض جدارها العضلي في دفع البويضة باتجاه الرحم (ص 71).' }
    ]
  });

  /* ======================= 3-2 البلوغ والدورة الشهرية ======================= */
  const HORM = [['FSH', '#16a34a', 'الهرمون المنشط للحويصلة (FSH)'], ['LH', '#2563eb', 'الهرمون الخاص بتكوين الجسم الأصفر (LH)'], ['estrogen', '#db2777', 'هرمون الإستروجين'], ['progesterone', '#ea580c', 'هرمون البروجسترون']];
  reg({
    id: 'menstrual-cycle', order: 2, lesson: '3-2', lessonTitle: 'البلوغ والدورة الشهرية', page: 72,
    titleAr: 'الدورة الشهرية: الهرمونات والمبيض والرحم', titleEn: 'The Menstrual Cycle: Hormones, Ovary and Uterus', tags: 'دوره شهريه طمث تبويض FSH LH استروجين بروجسترون حويصله غراف جسم اصفر بطانه الرحم بلوغ',
    formula: '\\text{FSH} \\to \\text{نمو الحويصلة} \\quad ; \\quad \\text{LH} \\to \\text{التبويض}',
    book: 'الشكل (8) ص 73: مراحل الدورة الشهرية — هرمونات الغدة النخامية، تغيرات المبيض، هرمونات المبيض، تغيرات الرحم، والأيام (1–28). FSH ينشط حويصلات غراف، و LH يحفز خروج الخلية البيضية الثانوية من حويصلة غراف (ص 73).',
    summary: 'حرّك اليوم من 1 إلى 28 لترى معاً — كما في الشكل (8) — تغيرات هرمونات الغدة النخامية، والحويصلة والجسم الأصفر في المبيض، وهرموني المبيض، وسمك بطانة الرحم. للدورة ثلاث مراحل: الطمث، مرحلة النمو، مرحلة الإفراز.',
    vars: [['\\text{اليوم}', 'يوم الدورة كما على محور الشكل (8)', '\\text{يوم}', '1 – 28'], ['\\text{FSH ، LH}', 'هرمونات الغدة النخامية', '—', 'مستويات نوعية'], ['\\text{الإستروجين ، البروجسترون}', 'هرمونات المبيض', '—', 'مستويات نوعية']],
    assumptions: ['منحنيات الهرمونات وسمك البطانة **نوعية** تحاكي أشكال الشكل (8) (نموذج مبسّط لأغراض التعليم)؛ الكتاب لا يعطي أرقاماً للمستويات، لذلك لا يظهر على المحور الرأسي أي رقم.', 'حدود المراحل والتبويض في اليوم 14 مقروءة من محور الأيام في الشكل (8).'],
    params: [
      { key: 'day', label: '\\text{اليوم}', min: 1, max: 28, step: 1, int: true, value: 1 },
      { key: 'fert', label: '\\text{حدوث إخصاب}', type: 'toggle', value: false, on: 'حدث إخصاب وحمل', off: 'لم يحدث إخصاب' }
    ],
    play: { key: 'day', speed: 3 },
    compute(p) {
      const d = p.day; const fert = p.fert && d > 14;
      return { ph: fert ? 'الحمل (لا تنسلخ البطانة)' : B.menstrualPhase(d), ov: fert && d > 20 ? 'الجسم الأصفر (لا يضمحل مع حدوث الحمل)' : B.ovaryPhase(d), fert: fert };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = narrow(W); const x0 = nar ? 12 : 120, x1 = W - 14; const X = (day) => x0 + (day - 1) / 27 * (x1 - x0);
      const bands = [[0, 0.22, 'هرمونات الغدة النخامية'], [0.24, 0.42, 'تغيرات المبيض'], [0.44, 0.66, 'هرمونات المبيض'], [0.68, 0.88, 'تغيرات الرحم']];
      const yb = (f) => 8 + f * (H - 40);
      bands.forEach((b) => { ctx.fillStyle = 'rgba(148,163,184,.08)'; ctx.fillRect(x0, yb(b[0]), x1 - x0, yb(b[1]) - yb(b[0])); if (!nar) D.txt(ctx, b[2], x0 - 6, (yb(b[0]) + yb(b[1])) / 2, { color: c.text, size: 11, w: '800', align: 'right' }); });
      const curve = (fn, colr, b, fertKeep) => { const ya = yb(b[0]) + 6, yz = yb(b[1]) - 4; ctx.strokeStyle = colr; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= 270; i++) { const day = 1 + i / 10; let v = fn(day); if (d.fert && fertKeep && day > 14) v = Math.max(v, fertKeep(day)); const y = yz - v * (yz - ya); i ? ctx.lineTo(X(day), y) : ctx.moveTo(X(day), y); } ctx.stroke(); };
      curve(B.hormone.FSH, '#16a34a', bands[0]); curve(B.hormone.LH, '#2563eb', bands[0]);
      curve(B.hormone.estrogen, '#db2777', bands[2]); curve(B.hormone.progesterone, '#ea580c', bands[2], (day) => 0.8);
      // تغيرات المبيض
      const oy = (yb(bands[1][0]) + yb(bands[1][1])) / 2;
      for (let day = 1; day <= 28; day += 3) { const x = X(day); if (day < 14) { const r = 4 + day * 0.9; B.blob(ctx, x, oy, r, r, 'rgba(252,165,165,.8)', '#b91c1c', 1.5); B.blob(ctx, x - r * 0.3, oy - r * 0.2, Math.max(2, r * 0.3), Math.max(2, r * 0.3), '#fde047'); } else if (day <= 24 || d.fert) { B.blob(ctx, x, oy, 12, 12, '#fde047', '#a16207', 1.5); } else { B.blob(ctx, x, oy, 7, 7, 'rgba(253,224,71,.4)', '#a16207', 1); } }
      ctx.fillStyle = '#7c3aed'; ctx.beginPath(); ctx.arc(X(14), oy - 16, 5, 0, 7); ctx.fill(); D.txt(ctx, 'التبويض', X(14), yb(bands[1][0]) + 8, { color: '#7c3aed', size: 11, w: '800' });
      // بطانة الرحم
      const uy = yb(bands[3][1]); ctx.fillStyle = 'rgba(244,63,94,.55)'; ctx.beginPath(); ctx.moveTo(X(1), uy); for (let i = 0; i <= 270; i++) { const day = 1 + i / 10; let t = B.endometrium(day); if (d.fert && day > 14) t = Math.max(t, Math.min(1, 0.15 + 0.85 * (day - 5) / 16)); ctx.lineTo(X(day), uy - t * (yb(bands[3][1]) - yb(bands[3][0]) - 6)); } ctx.lineTo(X(28), uy); ctx.closePath(); ctx.fill();
      // محور الأيام والمراحل
      const ay = H - 26; ctx.strokeStyle = c.text; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, ay); ctx.lineTo(x1, ay); ctx.stroke();
      for (let day = 1; day <= 28; day += nar ? 4 : 2) D.txt(ctx, String(day), X(day), ay + 10, { color: c.text, size: 10 });
      [[1, 5, 'الطمث'], [6, 14, 'مرحلة النمو'], [15, 28, 'مرحلة الإفراز']].forEach((q) => D.txt(ctx, q[2], (X(q[0]) + X(q[1])) / 2, ay - 8, { color: '#be123c', size: nar ? 10 : 12, w: '800', halo: c.bg }));
      // مؤشر اليوم
      ctx.strokeStyle = '#111827'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(X(p.day), 6); ctx.lineTo(X(p.day), ay); ctx.stroke(); ctx.setLineDash([]);
      D.txt(ctx, 'اليوم ' + p.day, X(p.day), 6, { color: '#111827', size: 12, w: '800', halo: c.bg, base: 'top' });
      // مفتاح
      HORM.forEach((h, i) => { const y = yb(i < 2 ? 0 : 0.44) + 12 + (i % 2) * 15; ctx.fillStyle = h[1]; ctx.fillRect(x1 - 12, y - 4, 12, 8); D.txt(ctx, h[0] === 'FSH' || h[0] === 'LH' ? h[0] : h[2].replace('هرمون ', ''), x1 - 16, y, { color: h[1], size: nar ? 9.5 : 11, w: '800', align: 'right', halo: c.bg }); });
    },
    live(p, d) { return '\\text{اليوم ' + p.day + ': ' + d.ph + '}'; },
    results(p, d) {
      const lvl = (fn) => { const v = fn(p.day); return v > 0.6 ? 'مرتفع' : v > 0.35 ? 'متوسط' : 'منخفض'; };
      const prog = d.fert ? 'مرتفع' : lvl(B.hormone.progesterone);
      return [['اليوم', '' + p.day, false], ['مرحلة الدورة', d.ph, false], ['تغيرات المبيض', d.ov, false], ['FSH (نوعي)', lvl(B.hormone.FSH), false], ['LH (نوعي)', lvl(B.hormone.LH), false], ['الإستروجين (نوعي)', lvl(B.hormone.estrogen), false], ['البروجسترون (نوعي)', prog, false],
        ['بطانة الرحم', p.day <= 5 && !d.fert ? 'تنسلخ وتخرج (الطمث)' : d.fert ? 'تزداد سمكاً لتوفر الحماية والتغذية للجنين' : 'تزداد سمكاً استعداداً لاستقبال الجنين', false]];
    },
    steps(p) { return ['FSH: يبدأ تأثيره على المبيض فينشط حويصلات غراف، فتنمو وتنضج الخلية البيضية الثانوية.', 'LH: يحفز خروج الخلية البيضية الثانوية من حويصلة غراف (التبويض، اليوم 14 في الشكل 8).', 'إذا لم يحدث إخصاب: يضمحل الجسم الأصفر، وتنسلخ البطانة وتخرج في عملية الطمث، وتبدأ دورة جديدة.', 'إذا حدث إخصاب: تزداد البطانة سمكاً لتوفر الحماية والتغذية للجنين؛ والبروجسترون ضروري لحدوث واستمرار الحمل.']; },
    explain(a, b, da, db) {
      if (a.fert !== b.fert) return [b.fert ? 'مع حدوث الإخصاب لا تنسلخ البطانة بل تزداد سمكاً لتوفر الحماية والتغذية للجنين، ويبقى البروجسترون مرتفعاً لأنه ضروري لحدوث واستمرار الحمل.' : 'دون إخصاب يضمحل الجسم الأصفر وتنسلخ البطانة في الطمث وتبدأ دورة جديدة (الشكل 8).'];
      if (a.day !== b.day) { if (b.day === 14) return ['اليوم 14: يحفز LH خروج الخلية البيضية الثانوية من حويصلة غراف (التبويض).']; if (b.day <= 5) return ['الطمث: تنسلخ بطانة الرحم وتخرج.']; if (b.day < 14) return ['مرحلة النمو: FSH ينشط نمو حويصلة غراف، والإستروجين يرتفع وتزداد البطانة سمكاً.']; return ['مرحلة الإفراز: الجسم الأصفر يفرز البروجسترون فتبقى البطانة سميكة.']; }
      return [];
    },
    learn: ['**البلوغ (ص 72):** في سن 12–14 سنة تنضج الأعضاء التناسلية؛ عندما يبلغ التستوستيرون الحد المناسب لدى الذكور، والإستروجين لدى الإناث.', '**الدورة الشهرية:** يحتوي المبيض حويصلات تنتج شهرياً واحدة منها خلية بيضية ثانوية بشكل متعاقب من أحد المبيضين (التبويض)، ويُعد الرحم لحدوث الحمل؛ وإن لم يحدث يخرج الطمث.', '**الهرمونات (ص 73):** FSH ينشط حويصلات غراف؛ LH يحفز خروج الخلية البيضية الثانوية من حويصلة غراف.', '**المراحل الثلاث:** الطمث، مرحلة النمو، مرحلة الإفراز (الشكل 8).'],
    challenges: [
      { q: 'س4 (ص 73): في أي يوم تخرج الخلية البيضية الثانوية من حويصلة غراف؟ ضع المؤشر عليه.', hint: 'انظر علامة «التبويض» على الشكل.', init: { day: 3, fert: false }, check: (p) => p.day === 14 },
      { q: 'ضع المؤشر في **مرحلة الإفراز** والجسم الأصفر نشط.', hint: 'بعد اليوم 14.', init: { day: 3, fert: false }, check: (p) => p.day >= 15 && p.day <= 24 },
      { q: 'س5 (ص 73): ماذا يحدث لبطانة الرحم عند **إخصاب البويضة**؟ فعّل الإخصاب وانتقل إلى اليوم 26.', hint: 'البطانة لا تنسلخ.', init: { day: 3, fert: false }, check: (p) => p.fert && p.day >= 26 }
    ],
    tutor: [
      { q: 'ما وظيفة FSH و LH؟', k: ['fsh', 'lh', 'وظيفه'], a: () => 'FSH: ينشط حويصلات غراف فتنمو وتنضج الخلية البيضية الثانوية. LH: يحفز خروجها من حويصلة غراف (ص 73).' },
      { q: 'لماذا لا توجد أرقام على المحور الرأسي؟', k: ['ارقام', 'محور', 'لماذا'], a: () => 'لأن الشكل (8) في الكتاب يعرض مستويات الهرمونات نوعياً دون أرقام؛ نحن نلتزم بالكتاب ولا نخترع قيماً.' },
      { q: 'ماذا يحدث اليوم؟', k: ['اليوم', 'الان', 'ماذا يحدث'], a: (p, d) => 'اليوم ' + p.day + ': ' + d.ph + '؛ المبيض: ' + d.ov + '.' }
    ]
  });

  /* ======================= 4-2 الإخصاب ومراحل تطور الجنين ======================= */
  const EMB = [
    ['التبويض', 'تخرج خلية بيضية ثانوية واحدة شهرياً من أحد المبيضين إلى قناة البيض.'],
    ['الإخصاب', 'يحدث عادة في الثلث الأول من قناة البيض (الأقرب إلى المبيض)؛ ينجح حيوان منوي واحد في الاختراق وتتغير نفاذية الغشاء لمنع دخول غيره، ثم تكمل الخلية البيضية الثانوية المرحلة الثانية من الانقسام المنصف وتندمج النواتان.'],
    ['البويضة المخصبة (زايغوت)', 'تحتوي العدد الكامل من الكروموسومات (46 كروموسوماً).'],
    ['انقسامات متساوية', 'تبدأ البويضة المخصبة بسلسلة من الانقسامات المتساوية (خلية ← خليتان ← 4 خلايا…).'],
    ['كتلة كروية مجوفة', 'تتحول إلى كتلة كروية مجوفة.'],
    ['الانغراس', 'تقوم بالانزراع في جدار الرحم في الأيام (6–9) من الإخصاب.'],
    ['المرحلة الأولى: حتى نهاية الأسبوع السادس', 'تتكون المشيمة التي يرتبط بها الجنين بالحبل السري، وتبدأ الثنيات القلبية بالنبض، ويحاط الجنين بالسائل الرهلي.'],
    ['المرحلة الثانية: من نهاية الأسبوع السادس إلى الأسبوع الثاني عشر', 'تنمو العضلات والأعصاب بشكل واضح، ويتميز الجنس في نهاية هذه المرحلة.'],
    ['المرحلة الثالثة: من نهاية الأسبوع الثاني عشر حتى الأسبوع الثاني والعشرين', 'تبدأ العظام بالنمو، وتشعر الأم بحركة الجنين، ويكتمل تكوين أجهزة الجسم الداخلية.'],
    ['المرحلة الرابعة: من نهاية الأسبوع الثاني والعشرين حتى الولادة', 'يكتمل نمو وتطور الأجهزة كافة، وينقلب وضع الجنين تدريجياً ويصبح الرأس متجهاً نحو الأسفل باتجاه عنق الرحم.'],
    ['الولادة — المرحلة الأولى: الاتساع والتمدد', 'تبدأ عضلات جدار الرحم بالانقباض لتحريك الجنين، فيتوسع عنق الرحم استعداداً لخروجه.'],
    ['الولادة — المرحلة الثانية: خروج الوليد', 'تدفع عضلات جدار الرحم الجنين إلى الخارج بسلسلة من الانقباضات المتتالية.'],
    ['الولادة — المرحلة الثالثة: خروج المشيمة', 'تنفصل المشيمة عن جدار الرحم بعد الولادة وتخرج (خروج الخلاص).']
  ];
  const WEEKS = [null, null, null, null, null, null, [0, 6], [6, 12], [12, 22], [22, 38], [38, 38], [38, 38], [38, 38]];
  reg({
    id: 'embryo-stages', order: 3, lesson: '4-2', lessonTitle: 'الإخصاب ومراحل تطور الجنين', page: 74,
    titleAr: 'من الإخصاب إلى الولادة: مراحل تطور الجنين', titleEn: 'From Fertilization to Birth: Embryonic Development', tags: 'اخصاب زايغوت انغراس مشيمه حبل سري سائل رهلي مراحل الجنين ولاده مخاض توائم',
    formula: '\\text{n} + \\text{n} = \\text{2n} \\ (23 + 23 = 46)',
    book: 'الإخصاب (ص 74، الشكل 9)؛ جدول (1) ص 75: مراحل تطور الجنين الأربع؛ يتطلب نمو جنين الإنسان حوالي 38 أسبوعاً (ص 74)؛ مراحل الولادة الثلاث (ص 76–77).',
    summary: 'تتبع رحلة البويضة المخصبة من قناة البيض إلى الانغراس في جدار الرحم، ثم مراحل تطور الجنين الأربع على مدى حوالي 38 أسبوعاً، ثم مراحل الولادة الثلاث.',
    vars: [['\\text{الأسبوع}', 'زمن الحمل', '\\text{أسبوع}', '0 – 38 تقريباً (ص 74)'], ['\\text{46}', 'عدد كروموسومات البويضة المخصبة', '\\text{كروموسوم}', 'من الكتاب']],
    assumptions: ['الرسوم تخطيطية مبسطة بمستوى الكتاب (نموذج مبسّط لأغراض التعليم)؛ الأسابيع وأيام الانغراس من جدول (1) والنص.'],
    params: [{ key: 'k', label: '\\text{المرحلة}', type: 'stage', stages: EMB.map((x) => x[0]), value: 0 }],
    play: { mode: 'stage', key: 'k', interval: 2.2 }, initState: () => ({ t: 0 }), tick(st, p, d, dt) { st.t += dt; },
    compute(p) { return { e: EMB[p.k], wk: WEEKS[p.k] }; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = narrow(W); const k = p.k; const t = (d.st && d.st.t) || 0;
      D.txt(ctx, (k + 1) + '. ' + d.e[0], W / 2, 16, { color: c.c5, size: nar ? 12 : 15, w: '800' });
      const cy = H * 0.46;
      if (k <= 5) {
        // مبيض ← قناة البيض ← الرحم (الشكل 9)
        const ox = W * 0.85, ux = W * 0.18; ctx.strokeStyle = '#f472b6'; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ox - 30, cy - 40); ctx.bezierCurveTo(W * 0.65, cy - 120, W * 0.45, cy - 10, ux + 70, cy); ctx.stroke();
        B.blob(ctx, ox, cy - 10, 38, 26, 'rgba(196,181,253,.95)', '#6d28d9', 2.5); D.txt(ctx, 'مبيض', ox, cy + 30, { color: c.text, size: 12, w: '800' });
        ctx.beginPath(); ctx.moveTo(ux - 70, cy - 90); ctx.quadraticCurveTo(ux, cy - 120, ux + 75, cy - 40); ctx.quadraticCurveTo(ux + 70, cy + 80, ux, cy + 110); ctx.quadraticCurveTo(ux - 70, cy + 80, ux - 70, cy - 90); ctx.fillStyle = 'rgba(251,113,133,.45)'; ctx.fill(); ctx.strokeStyle = '#be123c'; ctx.lineWidth = 3; ctx.stroke(); D.txt(ctx, 'الرحم', ux, cy + 130, { color: c.text, size: 12, w: '800' });
        D.txt(ctx, 'قناة البيض', W * 0.55, cy - 95, { color: c.text, size: 12, w: '800' });
        const P = [[ox - 30, cy - 40], [W * 0.72, cy - 85], [W * 0.62, cy - 72], [W * 0.5, cy - 45], [W * 0.38, cy - 15], [ux + 40, cy + 10]]; const q = P[k];
        if (k === 1) for (let i = 0; i < 9; i++) { const a = i * 0.7 + t * 2; const x = q[0] + Math.cos(a) * 30, y = q[1] + Math.sin(a) * 30; ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 12, y + Math.sin(a) * 12); ctx.stroke(); B.blob(ctx, x, y, 3, 3, '#1d4ed8'); }
        const nCells = [1, 1, 1, 4, 12, 16][k];
        if (k >= 4) { B.blob(ctx, q[0], q[1], 18, 18, 'rgba(254,240,138,.9)', '#a16207', 2); for (let i = 0; i < nCells; i++) { const a = i / nCells * Math.PI * 2; B.blob(ctx, q[0] + Math.cos(a) * 14, q[1] + Math.sin(a) * 14, 4, 4, '#fde047', '#a16207', 1); } }
        else if (k === 3) { [[-6, -6], [6, -6], [-6, 6], [6, 6]].forEach((o) => B.blob(ctx, q[0] + o[0], q[1] + o[1], 7, 7, '#fde047', '#a16207', 1.5)); }
        else B.blob(ctx, q[0], q[1], 13, 13, '#fde047', '#a16207', 2.5);
        if (k === 2) D.txt(ctx, '46', q[0], q[1], { color: '#713f12', size: 10, w: '800' });
      } else if (k <= 9) {
        // خط زمني بالأسابيع + رسم تخطيطي للجنين داخل الرحم
        const x0 = 20, x1 = W - 20, ty = H - 50; const X = (w) => x1 - w / 38 * (x1 - x0);
        ctx.strokeStyle = c.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, ty); ctx.lineTo(x1, ty); ctx.stroke();
        [[0, 6], [6, 12], [12, 22], [22, 38]].forEach((seg, i) => { ctx.fillStyle = i === k - 6 ? '#a855f7' : 'rgba(168,85,247,.2)'; ctx.fillRect(X(seg[1]), ty - 10, X(seg[0]) - X(seg[1]), 20); D.txt(ctx, ['الأولى', 'الثانية', 'الثالثة', 'الرابعة'][i], (X(seg[0]) + X(seg[1])) / 2, ty - 20, { color: c.text, size: 11, w: '800' }); });
        [0, 6, 12, 22, 38].forEach((w) => D.txt(ctx, w + (w === 38 ? ' (الولادة تقريباً)' : ''), X(w), ty + 20, { color: c.text, size: 10, align: w === 38 ? 'left' : 'center' }));
        D.txt(ctx, 'الأسبوع', x1, ty + 36, { color: c.muted, size: 10, align: 'right' });
        const R = Math.min(W * 0.2, H * 0.28); const cx = W / 2;
        B.blob(ctx, cx, cy - 10, R * 1.15, R, 'rgba(251,113,133,.35)', '#be123c', 3);
        B.blob(ctx, cx, cy - 10, R * 0.95, R * 0.82, 'rgba(186,230,253,.8)', '#0284c7', 1.5);
        D.rr(ctx, cx - R * 1.1, cy - R * 0.5, R * 0.3, R * 0.7, 10); ctx.fillStyle = '#be185d'; ctx.fill(); D.txt(ctx, 'المشيمة', cx - R * 0.95, cy - R * 0.62, { color: '#be185d', size: 11, w: '800' });
        const sz = [0.18, 0.32, 0.5, 0.68][k - 6] * R; const down = k === 9;
        ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx - R * 0.8, cy - 10); ctx.quadraticCurveTo(cx - R * 0.4, cy + R * 0.3, cx - sz * 0.2, cy - 10 + sz * 0.2); ctx.stroke();
        B.blob(ctx, cx, cy - 10 + (down ? sz * 0.2 : 0), sz * 0.55, sz * 0.75, '#fecdd3', '#9f1239', 2); B.blob(ctx, cx + (down ? 0 : sz * 0.1), cy - 10 + (down ? sz * 0.75 : -sz * 0.65), sz * 0.38, sz * 0.38, '#fecdd3', '#9f1239', 2);
        if (k === 6) { const beat = 1 + 0.15 * Math.sin(t * 8); B.blob(ctx, cx, cy - 10, 4 * beat, 4 * beat, '#dc2626'); }
        D.txt(ctx, 'السائل الرهلي', cx + R * 0.6, cy - R * 0.75, { color: '#0284c7', size: 11, w: '700' });
      } else {
        const R = Math.min(W * 0.2, H * 0.3); const cx = W / 2; const open = [0.3, 0.8, 0.8][k - 10];
        ctx.beginPath(); ctx.moveTo(cx - R, cy - R); ctx.quadraticCurveTo(cx, cy - R * 1.6, cx + R, cy - R); ctx.quadraticCurveTo(cx + R * 1.1, cy + R * 0.6, cx + R * 0.15 * (1 + open * 2), cy + R); ctx.lineTo(cx - R * 0.15 * (1 + open * 2), cy + R); ctx.quadraticCurveTo(cx - R * 1.1, cy + R * 0.6, cx - R, cy - R); ctx.fillStyle = 'rgba(251,113,133,.4)'; ctx.fill(); ctx.strokeStyle = '#be123c'; ctx.lineWidth = 3 + 2 * Math.abs(Math.sin(t * 3)); ctx.stroke();
        D.txt(ctx, 'عنق الرحم', cx + R * 0.6, cy + R + 14, { color: c.text, size: 11, w: '800' });
        if (k === 10) { B.blob(ctx, cx, cy - R * 0.1, R * 0.5, R * 0.65, '#fecdd3', '#9f1239', 2); B.blob(ctx, cx, cy + R * 0.55, R * 0.3, R * 0.3, '#fecdd3', '#9f1239', 2); }
        if (k === 11) { B.blob(ctx, cx, cy + R * 1.35, R * 0.3, R * 0.3, '#fecdd3', '#9f1239', 2); D.txt(ctx, 'خروج الوليد', cx - R * 0.8, cy + R * 1.35, { color: c.text, size: 11, w: '800' }); }
        if (k === 12) { D.rr(ctx, cx - R * 0.25, cy + R * 1.1, R * 0.5, R * 0.3, 8); ctx.fillStyle = '#be185d'; ctx.fill(); D.txt(ctx, 'المشيمة (الخلاص)', cx - R * 0.9, cy + R * 1.25, { color: '#be185d', size: 11, w: '800' }); }
      }
      B.para(ctx, D, d.e[1], W / 2, H - (k >= 6 && k <= 9 ? 82 : 14), W - 30, { color: c.text, size: nar ? 11 : 13, w: '600', bottom: true });
    },
    live(p, d) { return '\\text{' + d.e[0].replace(/:.*/, '') + '}'; },
    results(p, d) { return [['المرحلة', d.e[0], false], ['أهم التغيرات', d.e[1], false], ['الفترة الزمنية', d.wk ? (d.wk[0] === d.wk[1] ? 'بعد حوالي 38 أسبوعاً من الحمل' : 'من الأسبوع ' + d.wk[0] + ' إلى الأسبوع ' + d.wk[1]) : p.k === 5 ? 'الأيام (6–9) من الإخصاب' : 'الأيام الأولى بعد الإخصاب', false]]; },
    steps() { return EMB.map((e) => e[0]); },
    explain(a, b) { if (a.k === b.k) return []; return ['**' + EMB[b.k][0] + ':** ' + EMB[b.k][1]]; },
    learn: ['**الإخصاب (ص 74):** يحدث عادة في الثلث الأول من قناة البيض، وينتج بويضة مخصبة (زايغوت) فيها 46 كروموسوماً.', '**جدول (1) ص 75:** أربع مراحل لتطور الجنين على مدى حوالي 38 أسبوعاً (فترة الحمل).', '**تغذية الجنين (ص 76):** عن طريق المشيمة والحبل السري الذي يتكون من وريد رئيس لنقل الغذاء والأكسجين، وشريانين لنقل الفضلات وثاني أكسيد الكربون.', '**الولادة (ص 76–77):** الاتساع والتمدد، خروج الوليد، خروج المشيمة.', '**التوائم (ص 79):** المتطابقة من بويضة واحدة أُخصبت بحيوان منوي واحد ثم انقسمت إلى خليتين منفصلتين؛ وغير المتطابقة من خليتين بيضيتين أو أكثر أُخصبت كل منها بحيوان منوي مستقل.'],
    challenges: [
      { q: 'س3 (ص 83): في أي مرحلة تبدأ **الثنيات القلبية للجنين بالنبض**؟ انتقل إليها.', hint: 'المرحلة الأولى من مراحل تطور الجنين.', init: { k: 0 }, check: (p) => p.k === 6 },
      { q: 'س4 (ص 83): في أي مرحلة من مراحل الولادة **تنقبض عضلات الرحم ويتوسع عنقه**؟', hint: 'الاتساع والتمدد.', init: { k: 0 }, check: (p) => p.k === 10 },
      { q: 'انتقل إلى المرحلة التي **يتميز فيها الجنس** في نهايتها.', hint: 'المرحلة الثانية (حتى الأسبوع 12).', init: { k: 12 }, check: (p) => p.k === 7 }
    ],
    tutor: [
      { q: 'أين يحدث الإخصاب؟', k: ['اين', 'الاخصاب'], a: () => 'يحدث عادة في الثلث الأول من قناة البيض (الأقرب إلى المبيض) (ص 74).' },
      { q: 'كيف يتغذى الجنين؟', k: ['يتغذى', 'تغذيه', 'المشيمه'], a: () => 'من الأم بواسطة المشيمة التي يرتبط بها عن طريق الحبل السري: وريد رئيس ينقل الغذاء والأكسجين، وشريانان ينقلان الفضلات وثاني أكسيد الكربون (ص 76).' },
      { q: 'ما الفرق بين التوائم المتطابقة وغير المتطابقة؟', k: ['توائم', 'متطابقه'], a: () => 'المتطابقة: من بويضة واحدة وحيوان منوي واحد، متشابهة في الجنس والشكل والتركيب الوراثي. غير المتطابقة: من خليتين بيضيتين أو أكثر أُخصبت كل منها بحيوان منوي مستقل (ص 79).' }
    ]
  });
  /* ======================= 4-2 التوائم ======================= */
  const TWINS = {
    id: { name: 'التوائم المتطابقة', eggs: 1, split: true, joined: false, text: 'ينتج التوأم من بويضة واحدة أُخصبت بحيوان منوي واحد، ثم تنقسم البويضة المخصبة إلى خليتين منفصلتين تنمو كل منهما جنيناً مستقلاً.', same: 'متشابهة في الجنس والشكل الخارجي والتركيب الوراثي.' },
    non: { name: 'التوائم غير المتطابقة', eggs: 2, split: false, joined: false, text: 'ينتج التوأم من خليتين بيضيتين ثانويتين أو أكثر نضجت في الفترة نفسها، وأُخصبت كل منها بحيوان منوي مستقل.', same: 'قد تكون متشابهة أو مختلفة في الجنس والشكل الخارجي.' },
    sia: { name: 'التوائم السيامية', eggs: 1, split: true, joined: true, text: 'تنقسم البويضة المخصبة أحياناً إلى خليتين لا تنفصلان تماماً، وتبقيان متصلتين في موقع معين؛ نسبة إلى دولة سيام (الاسم القديم لتايلاند).', same: 'تبقيان متصلتين في موقع معين.' }
  };
  const TW_ST = ['خروج الخلية البيضية الثانوية', 'الإخصاب', 'البويضة المخصبة', 'النتيجة'];
  reg({
    id: 'twins', order: 4, lesson: '4-2', lessonTitle: 'الإخصاب ومراحل تطور الجنين (التوائم)', page: 79,
    titleAr: 'التوائم: المتطابقة وغير المتطابقة والسيامية', titleEn: 'Twins: Identical, Non-identical and Conjoined', tags: 'توائم متطابقه غير متطابقه سياميه بويضه مخصبه',
    formula: '\\text{بويضة واحدة} \\to \\text{متطابقة} \\qquad \\text{بويضتان أو أكثر} \\to \\text{غير متطابقة}',
    book: 'التوائم (ص 79–80): المتطابقة (الشكل 15)، غير المتطابقة (الشكل 16)، السيامية (الشكل 17).',
    summary: 'اختر نوع التوائم وتتبع ما يحدث من خروج الخلية البيضية الثانوية حتى النتيجة، ولاحظ لماذا تتشابه التوائم المتطابقة في التركيب الوراثي.',
    vars: [['\\text{نوع التوائم}', 'متطابقة / غير متطابقة / سيامية', '—', '3 أنواع'], ['\\text{عدد الخلايا البيضية}', 'التي تخرج', '—', '1 أو أكثر']],
    assumptions: ['الرسم تخطيطي بالخلايا فقط (نموذج مبسّط لأغراض التعليم) بحسب الأشكال 15–17.'],
    params: [{ key: 'type', label: '\\text{نوع التوائم}', type: 'select', options: Object.keys(TWINS).map((k) => [k, TWINS[k].name]), value: 'id' }, { key: 'k', label: '\\text{المرحلة}', type: 'stage', stages: TW_ST, value: 0 }],
    onSet(p, key) { if (key === 'type') p.k = 0; },
    play: { mode: 'stage', key: 'k', interval: 2 },
    randomize(p) { const o = Object.keys(TWINS).filter((k) => k !== p.type); return { type: o[Math.floor(Math.random() * o.length)], k: 3 }; },
    compute(p) { return { T: TWINS[p.type] }; },
    drawCustom(ctx, W, H, p, d, c) {
      const T = d.T; const k = p.k; const cy = H * 0.45; const r = Math.min(W, H) * 0.08;
      D.txt(ctx, T.name + ' — ' + TW_ST[k], W / 2, 18, { color: c.c5, size: narrow(W) ? 12 : 15, w: '800' });
      const xs = T.eggs === 2 ? [W * 0.33, W * 0.67] : [W / 2];
      xs.forEach((x, i) => {
        if (k === 0) B.blob(ctx, x, cy, r, r, '#fde68a', '#a16207', 2.5);
        else if (k === 1) { B.blob(ctx, x, cy, r, r, '#fde68a', '#a16207', 2.5); ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - r * 2.2, cy - r); ctx.lineTo(x - r * 1.1, cy - r * 0.4); ctx.stroke(); B.blob(ctx, x - r * 1.05, cy - r * 0.38, 5, 4, '#1d4ed8'); }
        else if (k === 2) { B.blob(ctx, x, cy, r * 1.05, r * 1.05, '#fdba74', '#c2410c', 2.5); D.txt(ctx, '2n', x, cy, { color: '#7c2d12', size: 13, w: '800' }); }
        else {
          const gap = T.split ? (T.joined ? r * 0.8 : r * 1.6) : 0; const parts = T.split ? [-1, 1] : [0];
          parts.forEach((sg) => B.blob(ctx, x + sg * gap, cy, r * 0.85, r * 0.85, sg < 0 || !T.split ? '#fecdd3' : '#fbcfe8', '#9f1239', 2.5));
          if (T.joined) { ctx.fillStyle = '#fda4af'; ctx.fillRect(x - r * 0.25, cy - r * 0.3, r * 0.5, r * 0.6); }
          if (T.eggs === 2) D.txt(ctx, 'جنين ' + (i + 1), x, cy + r * 1.4, { color: c.text, size: 12, w: '800' });
        }
      });
      if (k === 3 && T.eggs === 1) D.txt(ctx, T.joined ? 'خليتان لم تنفصلا تماماً' : 'جنينان من خليتين منفصلتين', W / 2, cy + r * 1.6, { color: c.text, size: 12, w: '800' });
      B.para(ctx, D, k === 3 ? T.text + ' ' + T.same : T.text, W / 2, H - 14, W - 30, { color: c.text, size: narrow(W) ? 11 : 13, w: '600', bottom: true });
    },
    live(p, d) { return '\\text{' + d.T.name + '}'; },
    results(p, d) { return [['النوع', d.T.name, false], ['عدد الخلايا البيضية المخصبة', '' + d.T.eggs, false], ['كيف تتكون', d.T.text, false], ['التشابه', d.T.same, false]]; },
    steps(p, d) { return [d.T.text, d.T.same]; },
    explain(a, b) { return a.type !== b.type ? ['**' + TWINS[b.type].name + ':** ' + TWINS[b.type].text] : a.k !== b.k ? [TW_ST[b.k] + '.'] : []; },
    learn: Object.keys(TWINS).map((k) => '**' + TWINS[k].name + ':** ' + TWINS[k].text + ' ' + TWINS[k].same).concat(['تخرج عادة خلية بيضية ثانوية واحدة شهرياً من أحد المبيضين (ص 79).']),
    challenges: [
      { q: 'س7 (ص 83): اعرض نتيجة التوائم التي تكون **دائماً من الجنس نفسه**.', hint: 'من بويضة واحدة وحيوان منوي واحد.', init: { type: 'non', k: 0 }, check: (p) => p.type === 'id' && p.k === 3 },
      { q: 'اعرض نوع التوائم الذي يحتاج **أكثر من خلية بيضية ثانوية** في الوقت نفسه.', hint: 'غير المتطابقة.', init: { type: 'id', k: 0 }, check: (p) => p.type === 'non' }
    ],
    tutor: [{ q: 'لماذا تكون التوائم المتطابقة من الجنس نفسه؟', k: ['متطابقه', 'نفس الجنس', 'الجنس'], a: () => 'لأنها تنتج من بويضة واحدة أُخصبت بحيوان منوي واحد، فلها التركيب الوراثي نفسه (ص 79).' }]
  });
})(typeof window !== 'undefined' ? window : globalThis);
