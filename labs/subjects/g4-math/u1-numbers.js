/* رياضيات الرابع — الوحدة الأولى: الأعداد الكبيرة (ص 2–24) */
(function (root) {
  'use strict';
  const ML = root.ML; const G = ML.m4;
  const U = 1;
  const MAXD = 12;
  const numParam = (key, label, val) => ({ key: key, label: label, type: 'text', value: String(val), maxLength: 16, desc: 'عدد من ١ إلى ١٢ منزلة', normalize: G.digitsOnly, validate: G.validNum(MAXD) });
  const toN = (s) => { const v = parseInt(G.digitsOnly(s), 10); return Number.isFinite(v) ? v : 0; };
  const digitsOf = (n) => String(n).split('').reverse().map(Number); // من الآحاد

  /* ======================= الدروس 1–3: لوحة المنازل والمعداد والقيمة المنزلية (ص 5–19) ======================= */
  // [المفتاح، الاسم، العدد، المنزلة المظللة (0 = الآحاد)، إضافة ١]
  const PV = [
    ['bridge', 'نشاط 1 ص 5: المغادرون عبر جسر الكرامة ١١٦٥٦', 11656, 4], ['r1', 'نشاط 2 ص 5: ٢٣٩٥٥', 23955, 3], ['r2', 'نشاط 2: ٦٧٢٨٤', 67284, 4], ['r3', 'نشاط 2: ٩٠٣٠٨', 90308, 2], ['r4', 'نشاط 2: ٦٠٠٠١', 60001, 0],
    ['x1', 'نشاط 3 ص 6 (الصورة الموسعة): ٣٨٥٠٦', 38506, 4], ['x2', 'نشاط 3: ٢١٨٧', 2187, 3], ['x3', 'نشاط 3: ٩١٠٠', 9100, 2],
    ['coal', 'نشاط 4 ص 6: فحم يعبد ٢٥٠٠٠٠ كغم', 250000, 5], ['odo', 'نشاط 5 ص 7: عداد المسافة ٩٩٩٩٩ + ١', 99999, 5, true],
    ['read6', 'نشاط 9 ص 9: ٢٥٣٧٥٨', 253758, 5], ['t1', 'نشاط 11 ص 10: ٩٧١٥٣٢', 971532, 3], ['t2', 'نشاط 11: ٦٠٦٦٠٦', 606606, 1], ['t3', 'نشاط 12 ص 10: ٧٥٣٦٢٨', 753628, 5], ['t4', 'نشاط 12: ٦٠٨٧٥٧', 608757, 4],
    ['year', 'نشاط 13 ص 11: دقائق السنة الشمسية ٥٢٥٦٠٠', 525600, 2], ['moon', 'نشاط 13: بعد القمر ٣٨٤٤٠٣ كم', 384403, 5], ['coast', 'نشاط 13: الساحل ٢٢٤٠٠٠ م', 224000, 3],
    ['s1', 'نشاط 14 ص 11 (الصورة المختصرة): ٣٧٤٨٤٦', 374846, 4], ['s2', 'نشاط 14: ٥٠٠٩٠٧', 500907, 5], ['s3', 'نشاط 14: ٨١٦٧٣٤', 816734, 4],
    ['hajj', 'نشاط 1 ص 13: الحجاج ٢٠١٦م', 2058238, 6], ['space', 'نشاط 2 ص 13: المركبة الفضائية ٩٩٩٩٩٩ + ١', 999999, 6, true],
    ['eur', 'نشاط 5 ص 15: سكان أوروبا ٢٠١٧م', 744000000, 8], ['big', 'نشاط 5 (ب): ٣٢٤٥٩٧١٦٨', 324597168, 8], ['w1', 'نشاط 7 ص 15: ٩٦٧٣٥٣٢', 9673532, 6], ['w2', 'نشاط 7: ٨٨٠٠٠٢٠٠٩', 880002009, 8],
    ['tb', 'نشاط 8 ص 16: لوحة المنازل ٦٦٤٠٢٨٣٧٠', 664028370, 8], ['g1', 'نشاط 9 ص 16 (أ): ٨٥٣٤٦١٢', 8534612, 6],
    ['sat', 'نشاط 10 ص 17: بعد زحل عن الشمس (كم)', 1427000000, 9], ['bil', 'نشاط 10: السابق للمليار + ١', 999999999, 9, true],
    ['bud', 'نشاط 11 ص 17: ميزانية فلسطين ٢٠١٦م (دولار)', 4250000000, 9], ['ind', 'نشاط 11: سكان الهند ٢٠١٨م', 1320000000, 9],
    ['v1', 'نشاط 1 ص 18: الرقم ٧ في ٢٦٤٧٨', 26478, 1], ['v2', 'نشاط 1: الرقم ٠ في ٥٠٤١', 5041, 2], ['v3', 'نشاط 1: الرقم ٦ في ٦٨٠٤٧', 68047, 4],
    ['phone', 'نشاط 2 ص 18: مشتركو الهاتف الخلوي', 3290774, 6], ['red1', 'نشاط 3 ص 19 (أ): ٣٣٣٣٣٠', 333330, 4], ['red2', 'نشاط 3 (ب): ٢٣٦٧٥١٩', 2367519, 4], ['f1', 'نشاط 4 ص 19: ٣٧٥٨٤١٩', 3758419, 5],
    ['rv1', 'مراجعة ص 23: ٤٦٣٢٩١٧٦٤', 463291764, 8], ['rv2', 'مراجعة: ٣٦٠٠٠٠٢٢٨', 360000228, 8], ['rv3', 'مراجعة ص 23: ٤٢٥٣١٨٦٠٠٠', 4253186000, 9], ['rv4', 'مراجعة ص 24: ثمانية وسبعون ملياراً…', 78000171263, 10]
  ];
  G.reg({
    id: 'place-value', unit: U, order: 1, lesson: '1-1 – 1-3', lessonTitle: 'الأعداد الكبيرة والقيمة المنزلية', page: 5,
    titleAr: 'لوحة المنازل والمعداد: قراءة الأعداد الكبيرة وقيمها المنزلية', titleEn: 'Place Value of Large Numbers', tags: 'اعداد كبيره معداد لوحه المنازل قيمه منزليه صوره موسعه مختصره مليون مليار قراءه كلمات احاد عشرات مئات الوف ملايين',
    formula: '\\text{القيمة المنزلية} = \\text{الرقم} \\times \\text{قيمة المنزلة}',
    book: 'نجزّئ العدد كل ثلاث منازل من اليمين: الواحدات ثم الآلاف ثم الملايين ثم المليارات، ونقرأ من اليسار ؛ ٩٩٩٩٩٩ + ١ = ١٠٠٠٠٠٠ (مليون) ، و ٩٩٩٩٩٩٩٩٩ + ١ = مليار',
    summary: 'نجزّئ العدد الكبير كل **ثلاث منازل** معاً من اليمين: المنازل الثلاث الأولى **الواحدات**، ثم **الآلاف**، ثم **الملايين**، ثم **المليارات**؛ ونقرأ كل مجموعة مع اسمها من اليسار. **القيمة المنزلية** للرقم = الرقم × قيمة منزلته، و**الصورة الموسعة** مجموع القيم المنزلية لأرقام العدد.',
    vars: [['\\text{المنزلة}', 'آحاد، عشرات، مئات في كل مجموعة', ''], ['\\text{المجموعة}', 'الواحدات، الآلاف، الملايين، المليارات', 'كل منها ثلاث منازل']],
    params: [
      { key: 'ex', label: '\\text{النشاط}', type: 'select', value: 'read6', options: G.opts(PV.map((e) => [e[0], e[1]]).concat([['custom', 'عدد من اختياري']])) },
      numParam('num', '\\text{العدد}', 253758),
      { key: 'pos', label: '\\text{المنزلة المختارة}', min: 0, max: MAXD - 1, step: 1, value: 5, int: true, desc: '٠ = الآحاد' },
      { key: 'add1', label: '\\text{إضافة واحد}', type: 'toggle', value: false, on: 'أضيف ١ إلى العدد', off: 'العدد كما هو' }
    ],
    onSet(p, k) {
      if (k === 'ex' && p.ex !== 'custom') { const e = PV.find((x) => x[0] === p.ex); p.num = String(e[2]); p.pos = e[3]; p.add1 = !!e[4]; }
      else if (k === 'num') p.ex = 'custom';
    },
    custom: true, canvasHint: 'كل عمود في المعداد منزلة، وعدد الخرزات هو الرقم. اضغط على أي عمود لمعرفة قيمته المنزلية.',
    compute(p) {
      const n0 = toN(p.num); const v = n0 + (p.add1 ? 1 : 0); const dg = digitsOf(v); const L = dg.length;
      const pos = Math.min(p.pos, L - 1); const pv = dg[pos] * Math.pow(10, pos);
      const parts = dg.map((x, i) => x * Math.pow(10, i)).filter((x) => x > 0).reverse();
      let carry = 0; if (p.add1) { const d0 = digitsOf(n0); while (carry < d0.length && d0[carry] === 9) carry++; }
      return { n0: n0, v: v, dg: dg, L: L, pos: pos, pv: pv, parts: parts, carry: carry };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); d.hits = [];
      const L = Math.max(d.L, 3); const gaps = Math.floor((L - 1) / 3);
      const cw = Math.min(64, (W - 30 - gaps * 14) / L); const gap = Math.min(14, cw * 0.4);
      const tot = L * cw + gaps * gap; const xr = W / 2 + tot / 2;
      const X = (i) => xr - (i + 0.5) * cw - Math.floor(i / 3) * gap;
      const top = 26, base = H * 0.52; const bead = Math.min(cw * 0.36, (base - top - 12) / 20);
      const cols = [c.c1, c.c3, c.c4, c.c5];
      ctx.fillStyle = 'rgba(219,39,119,.18)'; ctx.fillRect(xr - tot - 6, base, tot + 12, 12);
      for (let i = 0; i < L; i++) {
        const x = X(i); const dgt = i < d.L ? d.dg[i] : 0; const on = i === d.pos;
        if (on) { ctx.fillStyle = 'rgba(217,119,6,.14)'; ctx.fillRect(x - cw / 2 + 2, top - 10, cw - 4, base - top + 70); }
        ctx.strokeStyle = c.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, base); ctx.stroke();
        for (let k = 0; k < dgt; k++) { ctx.fillStyle = cols[Math.floor(i / 3) % 4]; ctx.beginPath(); ctx.ellipse(x, base - bead * (1.05 + 2 * k), bead * 1.25, bead, 0, 0, 7); ctx.fill(); }
        if (i < d.L) G.txt(ctx, dgt, x, base + 26, { color: on ? c.c4 : c.text, size: Math.min(24, cw * 0.55), w: '800' });
        G.txt(ctx, G.UNITS3[i % 3], x, base + 50, { color: c.muted, size: Math.min(12, cw * 0.28), w: '700' });
        d.hits.push({ x: x - cw / 2, y: top - 10, w: cw, h: base - top + 70, i: i });
      }
      for (let g = 0; g * 3 < L; g++) {
        const a = X(Math.min(L - 1, g * 3 + 2)) - cw / 2 + 3, b = X(g * 3) + cw / 2 - 3; const y = base + 64;
        ctx.strokeStyle = cols[g % 4]; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(a, y - 6); ctx.lineTo(a, y); ctx.lineTo(b, y); ctx.lineTo(b, y - 6); ctx.stroke();
        G.txt(ctx, G.CLASSES[g], (a + b) / 2, y + 14, { color: cols[g % 4], size: nar ? 11 : 13, w: '800' });
      }
      const y2 = Math.min(H - 40, base + 106);
      if (p.add1) G.txt(ctx, G.sp(d.n0) + ' + ' + G.L(1) + ' = ' + G.sp(d.v), W / 2, y2, { color: c.c3, size: nar ? 15 : 19, w: '800' });
      else G.txt(ctx, G.sp(d.v), W / 2, y2, { color: c.text, size: nar ? 18 : 24, w: '800' });
      G.txt(ctx, 'الرقم ' + G.L(d.dg[d.pos]) + ' في منزلة ' + G.placeName(d.pos) + ' قيمته ' + G.sp(d.pv), W / 2, Math.min(H - 14, y2 + 30), { color: c.c4, size: nar ? 12 : 15, w: '800' });
    },
    onPointer(type, x, y, p, st, api) { if (type !== 'down') return false; const h = api.hit(x, y); if (!h) return false; api.set('pos', h.i); return true; },
    live(p, d) { return (p.add1 ? d.n0 + ' + 1 = ' : '') + d.v + (d.parts.length > 1 ? ' = ' + d.parts.join(' + ') : ''); },
    results(p, d) {
      return [['العدد', G.sp(d.v), false, 'pos'], ['بالكلمات', G.words(d.v), false, 'pos'], ['عدد المنازل', G.L(d.L) + ' منازل', false],
        ['القيمة المنزلية للرقم ' + G.L(d.dg[d.pos]), G.sp(d.pv) + ' (' + G.placeName(d.pos) + ')', false],
        ['الصورة الموسعة', d.parts.map(G.sp).join(' + '), false]];
    },
    steps(p, d) {
      const groups = []; let s = String(d.v); while (s.length) { groups.unshift(s.slice(-3)); s = s.slice(0, -3); }
      const out = ['نجزّئ العدد كل ثلاث منازل من اليمين: ' + groups.map((g, i) => G.L(g) + ' (' + G.CLASSES[groups.length - 1 - i] + ')').join(' | ') + '.',
        'نقرأ كل مجموعة مع اسمها من اليسار: ' + G.words(d.v) + '.',
        'الرقم ' + G.L(d.dg[d.pos]) + ' في منزلة ' + G.placeName(d.pos) + '، فقيمته ' + G.L(d.dg[d.pos]) + ' × ' + G.sp(Math.pow(10, d.pos)) + ' = ' + G.sp(d.pv) + '.'];
      if (p.add1) out.unshift(d.carry ? 'عند إضافة ١ تصبح كل ٩ في المنازل الأولى (' + G.L(d.carry) + ' منازل) صفراً ونحمل ١ إلى المنزلة التالية: ' + G.sp(d.n0) + ' + ١ = ' + G.sp(d.v) + '.' : 'نضيف ١ إلى منزلة الآحاد: ' + G.sp(d.v) + '.');
      return out;
    },
    explain(a, b, da, db) { return da && da.L !== db.L ? ['أصبح العدد من ' + G.L(db.L) + ' منازل' + (db.L > da.L && b.add1 ? '؛ إضافة ١ أنشأت منزلة جديدة.' : '.')] : []; },
    learn: [
      '**نشاط 1 ص 5:** عبر جسر الكرامة غادر ١١٦٥٦ مسافراً وقدم ١٢٢٥٥ ؛ نقارن بالمعداد.',
      '**نشاط 5 ص 7:** عداد المسافة ٩٩٩٩٩ + ١ = ١٠٠٠٠٠ ويُقرأ (مئة ألف)؛ وفي نشاط 7 نعدّ بزيادة ١٠٠٠٠ في كل مرة.',
      '**نشاط 9 ص 9:** نجزّئ العدد كل ٣ منازل معاً من اليمين: ٢٥٣ ٧٥٨ يُقرأ مئتان وثلاثة وخمسون ألفاً وسبعمئة وثمانية وخمسون.',
      '**نشاط 14 ص 11:** ٨٠٠٠٠٠ + ١٠٠٠٠ + ٦٠٠٠ + ٧٠٠ + ٣٠ + ٤ = ٨١٦٧٣٤.',
      '**نشاط 15 و 17 ص 11–12:** خط الأعداد من ٥١٧٠٠٠ إلى ٥٢١٠٠٠ ومن ٢٧٤٠٠٠ إلى ٢٧٨٠٠٠ بتدريج ١٠٠ ؛ نعيّن ٢٧٤٥٠٠ و ٢٧٦٥٠٠ في منتصف المسافة.',
      '**نشاط 16 ص 12:** ١٠٠٠٠٠ = ١٠٠٠٠ عشرة = ١٠٠٠ مئة = ١٠٠ ألف ؛ و ٦٧٠٠٠٠ = ٦٧٠٠٠ عشرة = ٦٧٠٠ مئة = ٦٧٠ ألفاً.',
      '**نشاطا 2–3 ص 13–14:** ٩٩٩٩٩٩ + ١ = ١٠٠٠٠٠٠ ويُقرأ (مليون)، ويتكون من ٧ منازل.',
      '**نشاط 10 ص 17:** المليار ١٠٠٠٠٠٠٠٠٠ يتكون من ١٠ منازل، والعدد السابق له ٩٩٩٩٩٩٩٩٩.',
      '**نشاط 6 ص 19:** مليون = ١٠٠٠٠٠٠ = ألف ألف ، أما ١٠٠ ألف فهي المختلفة.'
    ],
    challenges: [
      { q: 'مثّل العملية ٩٩٩٩٩٩ + ١ وجد العدد الجديد (نشاط 2 ص 13).', hint: 'ضع العدد ٩٩٩٩٩٩ وفعّل إضافة واحد.', init: { ex: 'custom', num: '99999', add1: false }, check: (p, d) => d.v === 1000000 && p.add1, why: () => 'مليون: ١٠٠٠٠٠٠ ، ويتكون من ٧ منازل.' },
      { q: 'اكتب بالرموز: مليونان وثمانية وخمسون ألفاً ومئتان وثمانية وثلاثون (الحجاج ٢٠١٦م).', hint: 'اكتب العدد في الخانة.', init: { ex: 'custom', num: '2000000', add1: false }, check: (p, d) => d.v === 2058238 && !p.add1 },
      { q: 'اختر منزلة الرقم ٦ في ٢٣٦٧٥١٩ وجد قيمته (نشاط 3 ص 19).', hint: 'اضغط على عمود الرقم ٦.', init: { ex: 'custom', num: '2367519', pos: 0, add1: false }, check: (p, d) => d.v === 2367519 && d.pos === 4, why: () => '٦٠٠٠٠ (عشرات الألوف).' },
      { q: 'اكتب عدداً زوجياً من ٦ منازل الرقم ٥ في منزلة عشرات الألوف (نشاط 5 ص 19).', hint: 'مثل ١٥٠٠٠٠.', init: { ex: 'custom', num: '123456', add1: false }, check: (p, d) => d.L === 6 && d.v % 2 === 0 && d.dg[4] === 5, why: () => G.SOL + '.' }
    ],
    tutor: [
      { q: 'كيف أقرأ عدداً كبيراً؟', k: ['اقرا', 'كبير'], a: () => 'أجزّئ العدد كل ثلاث منازل من اليمين، ثم أقرأ كل مجموعة مع اسمها (ملايين، آلاف، واحدات) من اليسار.' },
      { q: 'كيف يُقرأ العدد الحالي؟', k: ['الحالي', 'يقرا'], a: (p, d) => G.words(d.v) + '.' },
      { q: 'كم منزلة في المليون والمليار؟', k: ['مليون', 'مليار', 'منزله'], a: () => 'المليون ١٠٠٠٠٠٠ من ٧ منازل، والمليار ١٠٠٠٠٠٠٠٠٠ من ١٠ منازل.' }
    ]
  });

  /* ======================= الدرس 4: مقارنة الأعداد وترتيبها (ص 20–24) ======================= */
  const CMP = [
    ['stud', 'نشاط 1 ص 20: الطلبة الذكور ٥٩٦١٤٤ والإناث ٦٠٣٧٢٢', 596144, 603722], ['bridge', 'نشاط 1 ص 5: المغادرون والقادمون عبر الجسر', 11656, 12255],
    ['c1', 'نشاط 3 ص 21 (أ): ١١٢٥٩٤ و ١١١٤٥٩٣', 112594, 1114593], ['c2', 'نشاط 3 (ب): ٣١٣٣٧٥ و ٣١٣٣٧٦', 313375, 313376], ['c3', 'نشاط 3 (جـ): ٩٩٩٩٩٩ و ٩٩٩٩٩٩٩', 999999, 9999999], ['c4', 'نشاط 3 (د): ٨٢٣٣٥١٤٧١٤ و ٢٢٨٣٥١٤٧١٤', 8233514714, 2283514714],
    ['r1', 'مراجعة 5 ص 24 (أ): ٣١٢٦٣ و ٩٣١٤٦٩', 31263, 931469], ['r2', 'مراجعة 5 (ب): ٧٥٠٢٦٤ و ٧٦٩٩٩٩', 750264, 769999], ['r3', 'مراجعة 5 (جـ): ٥٩٦٣٢٨٤ و ٥٨٦٣٣٨٤١', 5963284, 58633841], ['r4', 'مراجعة 5 (د): ٣٤٥٠٠٦١٢ و ٣٤٥٠٠٢١٦', 34500612, 34500216]
  ];
  const LISTS = {
    asc: { name: 'نشاط 4 ص 21: رتّب تصاعدياً', items: [['', 4682351], ['', 1235680], ['', 2369164]], dir: 'asc' },
    pal: { name: 'نشاط 5 ص 22: الفلسطينيون ٢٠١٥م (تنازلياً)', items: [['الضفة الغربية وقطاع غزة', 4750000], ['داخل الأراضي المحتلة عام ١٩٤٨م', 1470000], ['في الدول العربية', 5460000], ['في الدول الأجنبية', 685000]], dir: 'desc' },
    char: { name: 'نشاط 2 ص 21: تبرعات دور الأيتام (تنازلياً)', items: [['الدار الأولى', 874215], ['الدار الثانية', 901318], ['الدار الثالثة', 1475122]], dir: 'desc' }
  };
  function compareInfo(a, b) {
    const A = String(a), B = String(b);
    if (A.length !== B.length) return { k: Math.sign(A.length - B.length), byLen: true, idx: -1 };
    for (let i = 0; i < A.length; i++) if (A[i] !== B[i]) return { k: Math.sign(+A[i] - +B[i]), byLen: false, idx: A.length - 1 - i };
    return { k: 0, byLen: false, idx: -1 };
  }
  G.reg({
    id: 'compare-numbers', unit: U, order: 2, lesson: '1-4', lessonTitle: 'مقارنة الأعداد وترتيبها', page: 20,
    titleAr: 'مقارنة الأعداد الكبيرة وترتيبها', titleEn: 'Comparing & Ordering Large Numbers', tags: 'مقارنه ترتيب تصاعدي تنازلي اكبر اصغر منازل الطلبه الذكور الاناث الفلسطينيين تبرعات',
    formula: '\\text{منازل أكثر} \\Rightarrow \\text{عدد أكبر}',
    book: 'للمقارنة بين عددين عدد منازل أحدهما أكثر من الآخر يكون العدد ذو عدد المنازل الأكثر هو الأكبر ؛ وإذا تساوى عدد المنازل نبدأ بالمقارنة من اليسار (أكبر منزلة) حتى نصل إلى أول رقم مختلف',
    summary: 'إذا اختلف **عدد المنازل** فالعدد ذو المنازل الأكثر هو الأكبر. وإذا تساوى عدد المنازل نقارن **من اليسار** (أكبر منزلة)، فإذا تساوى الرقمان ننتقل إلى المنزلة التي تليها حتى نصل إلى **أول رقم مختلف**، فالعدد الذي فيه الرقم الأكبر هو الأكبر.',
    vars: [['\\text{أ} ، \\text{ب}', 'العددان', 'حتى ١٢ منزلة']],
    params: [
      { key: 'mode', label: '\\text{النشاط}', type: 'select', value: 'cmp', options: [['cmp', 'أقارن بين عددين'], ['ord', 'أرتّب مجموعة أعداد']] },
      { key: 'ex', label: '\\text{المثال}', type: 'select', value: 'stud', options: G.opts(CMP.map((e) => [e[0], e[1]]).concat([['custom', 'عددان من اختياري']])), hidden: (p) => p.mode !== 'cmp' },
      Object.assign(numParam('a', '\\text{العدد الأول}', 596144), { hidden: (p) => p.mode !== 'cmp' }),
      Object.assign(numParam('b', '\\text{العدد الثاني}', 603722), { hidden: (p) => p.mode !== 'cmp' }),
      { key: 'list', label: '\\text{القائمة}', type: 'select', value: 'pal', options: G.opts(Object.keys(LISTS).map((k) => [k, LISTS[k].name])), hidden: (p) => p.mode !== 'ord' },
      { key: 'dir', label: '\\text{الترتيب}', type: 'select', value: 'desc', options: [['asc', 'تصاعدياً (من الأصغر)'], ['desc', 'تنازلياً (من الأكبر)']], hidden: (p) => p.mode !== 'ord' }
    ],
    onSet(p, k) {
      if (k === 'ex' && p.ex !== 'custom') { const e = CMP.find((x) => x[0] === p.ex); p.a = String(e[2]); p.b = String(e[3]); }
      else if (k === 'a' || k === 'b') p.ex = 'custom';
      if (k === 'list') p.dir = LISTS[p.list].dir;
    },
    custom: true, canvasHint: 'المنازل مصفوفة من اليمين (الآحاد). الإطار البرتقالي يبيّن أول رقم مختلف من اليسار، وهو الذي يحسم المقارنة.',
    compute(p) {
      if (p.mode === 'ord') { const L = LISTS[p.list]; const s = L.items.slice().sort((x, y) => (p.dir === 'asc' ? x[1] - y[1] : y[1] - x[1])); return { ord: true, L: L, sorted: s }; }
      const a = toN(p.a), b = toN(p.b); return Object.assign({ a: a, b: b }, compareInfo(a, b));
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W);
      if (d.ord) {
        const n = d.sorted.length; const mx = Math.max.apply(null, d.sorted.map((x) => x[1]));
        const rh = Math.min(64, (H - 60) / n); const x0 = nar ? 14 : 40, x1 = W - (nar ? 14 : 40);
        d.sorted.forEach((it, i) => {
          const y = 20 + i * rh; const w = (x1 - x0) * it[1] / mx;
          ctx.fillStyle = [c.c1, c.c3, c.c4, c.c5][i % 4]; ctx.globalAlpha = 0.22; ctx.fillRect(x1 - w, y + 4, w, rh - 10); ctx.globalAlpha = 1;
          G.txt(ctx, G.L(i + 1) + ') ' + G.sp(it[1]), x1 - 10, y + rh / 2 - (it[0] ? 8 : 0), { color: c.text, size: nar ? 15 : 19, w: '800', align: 'right' });
          if (it[0]) G.txt(ctx, it[0], x1 - 10, y + rh / 2 + 14, { color: c.muted, size: 12, w: '700', align: 'right' });
        });
        G.txt(ctx, p.dir === 'asc' ? 'تصاعدياً: من الأصغر إلى الأكبر' : 'تنازلياً: من الأكبر إلى الأصغر', W / 2, H - 16, { color: c.c5, size: 13, w: '800' });
        return;
      }
      const A = digitsOf(d.a), B = digitsOf(d.b); const L = Math.max(A.length, B.length);
      const cw = Math.min(46, (W - 40) / (L + 1)); const xr = W / 2 + L * cw / 2; const X = (i) => xr - (i + 0.5) * cw;
      const y1 = H * 0.3, y2 = H * 0.52;
      for (let i = 0; i < L; i++) {
        if (i % 3 === 0 && i) { ctx.strokeStyle = c.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(i) + cw / 2, y1 - 30); ctx.lineTo(X(i) + cw / 2, y2 + 24); ctx.stroke(); }
        G.txt(ctx, G.UNITS3[i % 3], X(i), y1 - 40, { color: c.muted, size: Math.min(11, cw * 0.28), w: '700' });
        if (i < A.length) G.txt(ctx, A[i], X(i), y1, { color: c.c1, size: Math.min(26, cw * 0.62), w: '800' });
        if (i < B.length) G.txt(ctx, B[i], X(i), y2, { color: c.c5, size: Math.min(26, cw * 0.62), w: '800' });
      }
      if (d.idx >= 0) { ctx.save(); ctx.strokeStyle = c.c4; ctx.lineWidth = 3; ctx.strokeRect(X(d.idx) - cw / 2 + 2, y1 - 22, cw - 4, y2 - y1 + 44); ctx.restore(); }
      if (d.byLen) { const lo = Math.min(A.length, B.length); ctx.save(); ctx.fillStyle = 'rgba(217,119,6,.15)'; ctx.fillRect(X(L - 1) - cw / 2, (A.length > B.length ? y1 : y2) - 20, (L - lo) * cw, 40); ctx.restore(); }
      const msg = d.byLen ? 'عدد المنازل مختلف: ' + G.L(A.length) + ' و ' + G.L(B.length) : d.k === 0 ? 'العددان متساويان' : 'أول رقم مختلف من اليسار في منزلة ' + G.placeName(d.idx);
      G.txt(ctx, msg, W / 2, H * 0.72, { color: c.c4, size: nar ? 12 : 14, w: '800' });
      G.txt(ctx, G.sp(d.a) + '  ' + G.sign(d.k) + '  ' + G.sp(d.b), W / 2, H * 0.86, { color: c.c3, size: nar ? 16 : 22, w: '800' });
    },
    live(p, d) { if (d.ord) return d.sorted.map((x) => String(x[1])).join(p.dir === 'asc' ? ' < ' : ' > '); return d.a + ' ' + G.sign(d.k) + ' ' + d.b; },
    results(p, d) {
      if (d.ord) return d.sorted.map((x, i) => [G.L(i + 1) + (x[0] ? ' — ' + x[0] : ''), G.sp(x[1]), false, i === 0 ? 'pos' : '']);
      return [['المقارنة', G.sp(d.a) + ' ' + G.sign(d.k) + ' ' + G.sp(d.b), false, 'pos'], ['عدد المنازل', G.L(String(d.a).length) + ' و ' + G.L(String(d.b).length), false],
        ['الأكبر', d.k === 0 ? 'متساويان' : G.sp(d.k > 0 ? d.a : d.b), false, 'pos']];
    },
    steps(p, d) {
      if (d.ord) return ['نقارن عدد المنازل أولاً، ثم نقارن من اليسار عند تساوي المنازل.', 'الترتيب ' + (p.dir === 'asc' ? 'التصاعدي' : 'التنازلي') + ': ' + d.sorted.map((x) => G.sp(x[1])).join(p.dir === 'asc' ? ' < ' : ' > ') + '.'];
      if (d.byLen) return ['عدد منازل الأول ' + G.L(String(d.a).length) + ' والثاني ' + G.L(String(d.b).length) + '.', 'العدد ذو المنازل الأكثر هو الأكبر: ' + G.sp(d.a) + ' ' + G.sign(d.k) + ' ' + G.sp(d.b) + '.'];
      if (d.k === 0) return ['عدد المنازل متساوٍ، وكل الأرقام متساوية، فالعددان متساويان.'];
      return ['عدد المنازل متساوٍ (' + G.L(String(d.a).length) + ').', 'نقارن من اليسار؛ أول رقم مختلف في منزلة ' + G.placeName(d.idx) + ': ' + G.L(digitsOf(d.a)[d.idx]) + ' و ' + G.L(digitsOf(d.b)[d.idx]) + '.', 'إذن ' + G.sp(d.a) + ' ' + G.sign(d.k) + ' ' + G.sp(d.b) + '.'];
    },
    explain(a, b, da, db) { return da && !db.ord && !da.ord && da.byLen !== db.byLen ? [db.byLen ? 'اختلف عدد المنازل؛ يكفي عدّها.' : 'تساوى عدد المنازل؛ نقارن من اليسار.'] : []; },
    learn: [
      '**نشاط 1 ص 20:** طلبة مدارس فلسطين ٢٠١٥/٢٠١٦م: ١١٩٩٨٦٦ ، الذكور ٥٩٦١٤٤ والإناث ٦٠٣٧٢٢ ؛ لكل منهما ٦ منازل، وفي أعلى منزلة ٥ < ٦ ، فعدد الذكور أقل من عدد الإناث.',
      '**أتذكر ص 20:** العدد ذو المنازل الأكثر هو الأكبر، وإذا تساوى عدد المنازل نبدأ المقارنة من اليسار.',
      '**نشاط 2 ص 21:** أكبر مبلغ ١٤٧٥١٢٢ ديناراً للدار الثالثة.',
      '**نشاط 5 ص 22:** الفلسطينيون ٢٠١٥م تنازلياً: الدول العربية ٥٤٦٠٠٠٠ ، الضفة الغربية وقطاع غزة ٤٧٥٠٠٠٠ ، الأراضي المحتلة عام ١٩٤٨م ١٤٧٠٠٠٠ ، الدول الأجنبية ٦٨٥٠٠٠.'
    ],
    challenges: [
      { q: 'قارن عدد الطلبة الذكور ٥٩٦١٤٤ بعدد الإناث ٦٠٣٧٢٢ (نشاط 1).', hint: 'اختر المثال أو اكتب العددين.', init: { mode: 'cmp', ex: 'custom', a: '1', b: '2' }, check: (p, d) => !d.ord && d.a === 596144 && d.b === 603722, why: () => '٥٩٦١٤٤ < ٦٠٣٧٢٢.' },
      { q: 'اكتب عددين من ٧ منازل يختلفان أول مرة في منزلة الآحاد.', hint: 'مثل ٣١٣٣٧٥ و ٣١٣٣٧٦ لكن بسبع منازل.', init: { mode: 'cmp', ex: 'custom', a: '1000000', b: '2000000' }, check: (p, d) => !d.ord && String(d.a).length === 7 && String(d.b).length === 7 && d.idx === 0 },
      { q: 'رتّب أعداد الفلسطينيين في نشاط 5 تنازلياً.', hint: 'اختر «أرتّب مجموعة أعداد».', init: { mode: 'cmp', ex: 'stud', a: '596144', b: '603722', list: 'asc', dir: 'asc' }, check: (p) => p.mode === 'ord' && p.list === 'pal' && p.dir === 'desc' }
    ],
    tutor: [
      { q: 'لماذا العدد ذو المنازل الأكثر أكبر؟', k: ['منازل', 'اكثر'], a: () => 'لأن أصغر عدد من ٧ منازل (١٠٠٠٠٠٠) أكبر من أكبر عدد من ٦ منازل (٩٩٩٩٩٩).' },
      { q: 'من أين أبدأ المقارنة؟', k: ['ابدا', 'اليسار'], a: () => 'من اليسار، أي من أكبر منزلة، حتى أصل إلى أول رقم مختلف.' },
      { q: 'أيهما أكبر الآن؟', k: ['اكبر', 'الان'], a: (p, d) => (d.ord ? 'الأول في القائمة ' + G.sp(d.sorted[0][1]) + '.' : d.k === 0 ? 'متساويان.' : G.sp(d.k > 0 ? d.a : d.b) + '.') }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
