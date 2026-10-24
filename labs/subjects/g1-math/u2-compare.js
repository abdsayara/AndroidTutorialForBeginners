/* رياضيات الأول — الوحدة الثانية: مقارنة الأعداد (١ – ٩) (ص 31–55) */
(function (root) {
  'use strict';
  const ML = root.ML; const G = ML.m1;
  const U = 2;
  const L = (x) => G.L(x);
  const KEY = { gt: 1, lt: -1, eq: 0 };
  const NAME = { gt: 'أكبر من', lt: 'أصغر من', eq: 'يساوي' };
  const kOf = (a, b) => (a > b ? 'gt' : a < b ? 'lt' : 'eq');

  /* ======================= الدرس 1: مقارنة عددين — الأكبر من، الأصغر من، المساواة (ص 33–40) ======================= */
  // [المفتاح، الاسم، شيء أ، العدد أ، شيء ب، العدد ب]
  const CG = [
    ['chairs', 'ص 33: الطلاب والكراسي', 'boy', 5, 'chair', 4], ['fish', 'ص 34: الأسماك', 'fish', 7, 'fish', 2],
    ['houses', 'ص 35: البيوت', 'house', 4, 'house', 6], ['balls', 'ص 35: الكرات', 'ball', 1, 'ball', 4], ['dots', 'ص 35: الدوائر', 'circle', 2, 'circle', 3],
    ['hens', 'ص 35: الدجاج', 'hen', 2, 'hen', 1], ['flowers', 'ص 35: الأزهار', 'flower', 6, 'flower', 4], ['stars', 'ص 35: النجوم', 'star', 6, 'star', 1], ['dogs', 'ص 35: الكلاب', 'dog', 4, 'dog', 3],
    ['rabbits', 'ص 36: الجزر والأرانب', 'carrot', 5, 'rabbit', 6], ['tractors', 'ص 37: الجرارات', 'tractor', 2, 'tractor', 4], ['chefs', 'ص 37: الطهاة', 'boy', 3, 'boy', 6],
    ['men', 'ص 38: الأولاد', 'boy', 2, 'boy', 1], ['birds', 'ص 38: العصافير', 'bird', 3, 'bird', 2],
    ['eqballs', 'ص 39: الكرات والأولاد', 'ball', 4, 'boy', 4], ['gulls', 'ص 39: النوارس', 'bird', 2, 'bird', 2], ['apples', 'ص 39: التفاح', 'apple', 3, 'apple', 3], ['carrot1', 'ص 39: الجزر', 'carrot', 1, 'carrot', 1], ['fish6', 'ص 39: الأسماك', 'fish', 6, 'fish', 6]
  ];
  const CN = [
    ['n1', 'ص 38: ١ و ٥', 1, 5], ['n2', 'ص 38: ٧ و ٨', 7, 8], ['n3', 'ص 38: ٩ و ٤', 9, 4], ['n4', 'ص 38: ٦ و ٢', 6, 2],
    ['n5', 'ص 40: ٦ و ٣', 6, 3], ['n6', 'ص 40: ٤ و ٤', 4, 4], ['n7', 'ص 40: ٥ و ٥', 5, 5], ['n8', 'ص 40: ٢ و ٣', 2, 3], ['n9', 'ص 40: ٩ و ٧', 9, 7], ['n10', 'ص 40: ٦ و ٨', 6, 8],
    ['r1', 'مراجعة ص 52: ٧ و ٨', 7, 8], ['r2', 'مراجعة: ٦ و ٢', 6, 2], ['r3', 'مراجعة: ٢ و ٢', 2, 2], ['r4', 'مراجعة: ٩ و ٥', 9, 5]
  ];
  G.reg({
    id: 'compare-groups', unit: U, order: 1, lesson: '2-1', lessonTitle: 'مقارنة عددين: الأكبر من، الأصغر من، المساواة', page: 33,
    titleAr: 'أكبر من، أصغر من، يساوي', titleEn: 'Greater Than, Less Than, Equal', tags: 'مقارنه اكبر من اصغر من يساوي اشاره طلاب كراسي اسماك جزر ارانب مطابقه واحد لواحد',
    formula: '7 > 2,\\qquad 5 < 6,\\qquad 4 = 4',
    book: 'عدد الطلاب أكبر من عدد الكراسي: ٥ > ٤ ؛ ٥ أصغر من ٦ وتُكتب ٥ < ٦ ؛ ٤ يساوي ٤ وتُكتب ٤ = ٤',
    summary: 'نقارن مجموعتين **بمطابقة** كل عنصر من الأولى بعنصر من الثانية: إذا بقي في الأولى عناصر بلا شريك فعددها **أكبر من** عدد الثانية (>)، وإذا بقي في الثانية فعدد الأولى **أصغر من** (<)، وإذا لم يبقَ شيء فالعددان **متساويان** (=). وفتحة الإشارة دائماً نحو العدد الأكبر.',
    vars: [['>', 'أكبر من', ''], ['<', 'أصغر من', ''], ['=', 'يساوي', '']],
    params: [
      { key: 'mode', label: '\\text{النشاط}', type: 'select', value: 'groups', options: [['groups', 'أعدّ وأقارن المجموعتين'], ['nums', 'أضع الإشارة بين عددين']] },
      { key: 'ex', label: '\\text{المجموعتان}', type: 'select', value: 'chairs', options: G.opts(CG.map((e) => [e[0], e[1]])), hidden: (p) => p.mode !== 'groups' },
      { key: 'nx', label: '\\text{العددان}', type: 'select', value: 'n1', options: G.opts(CN.map((e) => [e[0], e[1]])), hidden: (p) => p.mode !== 'nums' }
    ],
    initState() { return { pick: null }; },
    resetOn: ['mode', 'ex', 'nx'],
    custom: true, canvasHint: 'الخطوط تطابق كل عنصر بعنصر؛ العناصر الملوّنة بالأحمر بلا شريك. اختر الإشارة الصحيحة من الأزرار.',
    compute(p) {
      if (p.mode === 'nums') { const e = CN.find((x) => x[0] === p.nx); return { nums: true, a: e[2], b: e[3], k: kOf(e[2], e[3]) }; }
      const e = CG.find((x) => x[0] === p.ex); return { e: e, a: e[3], b: e[5], k: kOf(e[3], e[5]) };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); d.hits = []; const st = d.st || { pick: null }; const by = H - 82;
      if (!d.nums) {
        const n = Math.max(d.a, d.b); const sw = Math.min(90, (W - 40) / n); const xr = W / 2 + n * sw / 2; const y1 = by * 0.28, y2 = by * 0.74;
        for (let i = 0; i < n; i++) {
          const x = xr - (i + 0.5) * sw;
          if (i < d.a && i < d.b) { ctx.strokeStyle = c.c3; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y1 + sw * 0.4); ctx.lineTo(x, y2 - sw * 0.4); ctx.stroke(); }
          [[i < d.a, y1, d.e[2]], [i < d.b, y2, d.e[4]]].forEach((r) => { if (!r[0]) return; if ((r[1] === y1 && i >= d.b) || (r[1] === y2 && i >= d.a)) { ctx.fillStyle = 'rgba(220,38,38,.15)'; ctx.beginPath(); ctx.arc(x, r[1], sw * 0.48, 0, 7); ctx.fill(); } G.icon(ctx, r[2], x, r[1], sw * 0.85); });
        }
        G.box(ctx, W - 58, y1 - 22, 44, 44, c.c1); G.txt(ctx, d.a, W - 36, y1, { color: c.c1, size: 24, w: '800' });
        G.box(ctx, W - 58, y2 - 22, 44, 44, c.c5); G.txt(ctx, d.b, W - 36, y2, { color: c.c5, size: 24, w: '800' });
      } else {
        G.txt(ctx, d.a, W * 0.7, by * 0.45, { color: c.c1, size: 90, w: '800' }); G.txt(ctx, d.b, W * 0.3, by * 0.45, { color: c.c5, size: 90, w: '800' });
        ctx.strokeStyle = c.c6; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(W / 2, by * 0.45, 44, 0, 7); ctx.stroke();
      }
      // جملة المقارنة: العدد الأول يميناً كما يُقرأ في الكتاب
      const pk = st.pick; const sent = pk ? L(d.a) + '  ' + G.sign(KEY[pk]) + '  ' + L(d.b) : L(d.a) + '  ؟  ' + L(d.b);
      G.txt(ctx, sent, d.nums ? W / 2 : W / 2, d.nums ? by * 0.45 : by * 0.5, { color: pk ? (pk === d.k ? c.c3 : c.c2) : c.muted, size: d.nums ? 40 : 30, w: '800', halo: c.bg });
      // أزرار الإشارات (تُرسم كما تبدو بين عددين في سطر عربي)
      const bw = Math.min(120, (W - 40) / 3); ['gt', 'lt', 'eq'].forEach((k, i) => {
        const x = W / 2 + (1 - i) * (bw + 10) - bw / 2; const on = pk === k; const good = k === d.k;
        G.box(ctx, x, by, bw, 64, on ? (good ? c.c3 : c.c2) : c.c1, on ? (good ? 'rgba(5,150,105,.15)' : 'rgba(220,38,38,.1)') : 'rgba(37,99,235,.05)');
        G.txt(ctx, L(3) + ' ' + G.sign(KEY[k]) + ' ' + L(k === 'gt' ? 1 : k === 'lt' ? 5 : 3), x + bw / 2, by + 22, { color: c.text, size: 20, w: '800' });
        G.txt(ctx, NAME[k], x + bw / 2, by + 48, { color: c.muted, size: 13, w: '700' });
        d.hits.push({ x: x, y: by, w: bw, h: 64, k: k });
      });
    },
    onPointer(type, x, y, p, st, api) { if (type !== 'down') return false; const h = api.hit(x, y); if (!h || !h.k) return false; st.pick = h.k; return true; },
    live(p, d) { return d.a + ' ' + G.sign(KEY[d.k]) + ' ' + d.b; },
    results(p, d) {
      const st = d.st || { pick: null };
      return [['العددان', L(d.a) + ' و ' + L(d.b), false], ['المقارنة', L(d.a) + ' ' + NAME[d.k] + ' ' + L(d.b), false, 'pos'], ['بالرموز', L(d.a) + ' ' + G.sign(KEY[d.k]) + ' ' + L(d.b), false],
        ['اخترتَ', st.pick ? NAME[st.pick] + (st.pick === d.k ? ' ✔' : ' ✘') : 'لم تختر بعد', false, st.pick ? (st.pick === d.k ? 'pos' : 'neg') : '']];
    },
    steps(p, d) {
      const s = d.nums ? ['نقارن العددين ' + L(d.a) + ' و ' + L(d.b) + '.'] : ['نعدّ المجموعة الأولى: ' + L(d.a) + ' ، والثانية: ' + L(d.b) + '.', 'نطابق كل عنصر بعنصر' + (d.a === d.b ? ' فلا يبقى شيء.' : '، فيبقى ' + L(Math.abs(d.a - d.b)) + ' بلا شريك في ' + (d.a > d.b ? 'الأولى.' : 'الثانية.'))];
      s.push(L(d.a) + ' ' + NAME[d.k] + ' ' + L(d.b) + ' ، وتُكتب ' + L(d.a) + ' ' + G.sign(KEY[d.k]) + ' ' + L(d.b) + '.');
      return s;
    },
    explain() { return []; },
    learn: [
      '**ص 33:** عدد الطلاب ٥ وعدد الكراسي ٤ ، فعدد الطلاب أكبر من عدد الكراسي.',
      '**ص 34:** ٧ أسماك أكبر من سمكتين: ٧ > ٢ ، وأكتب إشارة > .',
      '**ص 36:** عدد الجزرات ٥ أصغر من عدد الأرانب ٦: ٥ < ٦.',
      '**ص 39:** عدد الكرات ٤ يساوي عدد الأولاد ٤: ٤ = ٤.',
      '**نشاط 3 ص 40:** ٦ > ٣ ، ٤ = ٤ ، ٥ = ٥ ، ٢ < ٣ ، ٩ > ٧ ، ٦ < ٨.'
    ],
    challenges: [
      { q: 'قارن الطلاب بالكراسي واختر الإشارة (ص 33).', hint: 'الطلاب ٥ والكراسي ٤.', init: { mode: 'groups', ex: 'chairs' }, check: (p, d) => p.ex === 'chairs' && !d.nums && d.st && d.st.pick === 'gt' },
      { q: 'قارن الجزر بالأرانب (ص 36).', hint: '٥ جزرات و ٦ أرانب.', init: { mode: 'groups', ex: 'chairs' }, check: (p, d) => p.ex === 'rabbits' && !d.nums && d.st && d.st.pick === 'lt' },
      { q: 'ضع الإشارة بين ٦ و ٨ (ص 40).', hint: 'اختر «أضع الإشارة بين عددين».', init: { mode: 'groups', ex: 'chairs', nx: 'n1' }, check: (p, d) => d.nums && p.nx === 'n10' && d.st && d.st.pick === 'lt' }
    ],
    tutor: [
      { q: 'كيف أعرف أي المجموعتين أكبر؟', k: ['اعرف', 'اكبر'], a: () => 'أطابق كل عنصر بعنصر؛ المجموعة التي يبقى فيها عناصر بلا شريك هي الأكبر.' },
      { q: 'إلى أين تتجه فتحة الإشارة؟', k: ['فتحه', 'اشاره'], a: () => 'فتحة الإشارة دائماً نحو العدد الأكبر.' },
      { q: 'ما المقارنة الآن؟', k: ['المقارنه', 'الان'], a: (p, d) => L(d.a) + ' ' + NAME[d.k] + ' ' + L(d.b) + '.' }
    ]
  });

  /* ======================= الدرسان 2–3: الترتيب التصاعدي والتنازلي (ص 41–44) ======================= */
  const OS = [
    ['all', 'نشاط 2 ص 41: من ١ إلى ٩', 'asc', [5, 2, 8, 1, 9, 4, 7, 3, 6]], ['r38', 'نشاط 3 ص 42: من ٣ إلى ٨', 'asc', [6, 3, 8, 5, 4, 7]], ['r49', 'نشاط 3: من ٤ إلى ٩', 'asc', [7, 9, 4, 6, 8, 5]],
    ['a1', 'نشاط 4 ص 42 (أ): ٤ ، ٧ ، ٢', 'asc', [4, 7, 2]], ['a2', 'نشاط 4 (ب): ٩ ، ٥ ، ٦', 'asc', [9, 5, 6]], ['a3', 'نشاط 4 (جـ): ٨ ، ٥ ، ٩ ، ٢', 'asc', [8, 5, 9, 2]],
    ['dall', 'نشاط 2 ص 43: من ٩ إلى ١', 'desc', [5, 2, 8, 1, 9, 4, 7, 3, 6]], ['d94', 'نشاط 3 ص 44: من ٩ إلى ٤', 'desc', [6, 9, 4, 8, 5, 7]], ['d61', 'نشاط 3: من ٦ إلى ١', 'desc', [3, 6, 1, 5, 2, 4]],
    ['d1', 'نشاط 4 ص 44 (أ): ٧ ، ٩ ، ٣', 'desc', [7, 9, 3]], ['d2', 'نشاط 4 (ب): ٦ ، ٣ ، ٩', 'desc', [6, 3, 9]], ['d3', 'نشاط 4 (جـ): ٥ ، ٧ ، ١ ، ٤', 'desc', [5, 7, 1, 4]],
    ['ra1', 'مراجعة 5 ص 54: ٥ ، ١ ، ٣', 'asc', [5, 1, 3]], ['ra2', 'مراجعة 5: ٦ ، ٢ ، ٤', 'asc', [6, 2, 4]], ['ra3', 'مراجعة 5: ٧ ، ٢ ، ٣ ، ٥', 'asc', [7, 2, 3, 5]],
    ['rd1', 'مراجعة 6 ص 54: ٧ ، ٢ ، ٩', 'desc', [7, 2, 9]], ['rd2', 'مراجعة 6: ٨ ، ٣ ، ٧', 'desc', [8, 3, 7]], ['rd3', 'مراجعة 6: ٧ ، ٩ ، ١ ، ٣', 'desc', [7, 9, 1, 3]]
  ];
  const STEP_COL = ['#7dd3fc', '#f472b6', '#d6d3d1', '#fb923c', '#ef4444', '#60a5fa', '#ec4899', '#a8a29e', '#f97316'];
  G.reg({
    id: 'order-stairs', unit: U, order: 2, lesson: '2-2 – 2-3', lessonTitle: 'الترتيب التصاعدي والترتيب التنازلي', page: 41,
    titleAr: 'الترتيب التصاعدي والتنازلي على الدرج', titleEn: 'Ordering Numbers Up and Down', tags: 'ترتيب تصاعدي تنازلي درج اصغر اكبر اعد',
    formula: '2 < 4 < 7,\\qquad 9 > 7 > 3',
    book: 'ترتيب الأعداد من الأصغر إلى الأكبر يُسمّى الترتيب التصاعدي ؛ وترتيب الأعداد من الأكبر إلى الأصغر يُسمّى الترتيب التنازلي',
    summary: '**الترتيب التصاعدي:** من الأصغر إلى الأكبر، كمن يصعد الدرج. **الترتيب التنازلي:** من الأكبر إلى الأصغر، كمن ينزل الدرج. نبحث كل مرة عن أصغر عدد (أو أكبر عدد) بقي ونضعه.',
    vars: [['\\text{تصاعدي}', 'من الأصغر إلى الأكبر', ''], ['\\text{تنازلي}', 'من الأكبر إلى الأصغر', '']],
    params: [{ key: 'ex', label: '\\text{النشاط}', type: 'select', value: 'a3', options: G.opts(OS.map((e) => [e[0], e[1]])) }],
    initState() { return { seq: [] }; },
    resetOn: ['ex'],
    custom: true, canvasHint: 'انقر البطاقات بالترتيب المطلوب فتصعد (أو تنزل) على الدرج. انقر الدرجة الأخيرة لإرجاعها.',
    compute(p) { const e = OS.find((x) => x[0] === p.ex); const sorted = e[3].slice().sort((a, b) => (e[2] === 'asc' ? a - b : b - a)); return { e: e, dir: e[2], nums: e[3], sorted: sorted }; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); d.hits = []; const seq = (d.st && d.st.seq) || []; const n = d.nums.length;
      const base = H - 110; const sw = Math.min(80, (W - 40) / n); const x0 = W / 2 - n * sw / 2;
      for (let i = 0; i < n; i++) {
        const asc = d.dir === 'asc'; const hgt = (base - 30) * (asc ? i + 1 : n - i) / n * 0.85; const x = x0 + i * sw; // الدرج يصعد نحو اليمين كما في رسم الكتاب
        const v = seq[i]; const ok = v === d.sorted[i];
        ctx.fillStyle = v != null ? STEP_COL[(v - 1) % 9] : 'rgba(148,163,184,.18)'; ctx.fillRect(x + 2, base - hgt, sw - 4, hgt);
        ctx.strokeStyle = v != null && !ok ? c.c2 : c.grid; ctx.lineWidth = v != null && !ok ? 3 : 1.5; ctx.strokeRect(x + 2, base - hgt, sw - 4, hgt);
        if (v != null) G.txt(ctx, v, x + sw / 2, base - hgt - 18, { color: ok ? c.text : c.c2, size: 26, w: '800' });
        if (i === seq.length - 1) d.hits.push({ x: x, y: base - hgt - 30, w: sw, h: hgt + 30, undo: true });
      }
      if (seq.length < n) G.icon(ctx, 'girl', x0 + (d.dir === 'asc' ? seq.length : n - 1 - seq.length) * sw + sw / 2, 30, 46);
      const left = d.nums.filter((v) => seq.indexOf(v) < 0);
      G.cards(ctx, d.nums, 10, base + 20, W - 20, 56, c, { hits: null, sel: null });
      // البطاقات المستخدمة باهتة، وغير المستخدمة قابلة للنقر
      const cw = Math.min(64, (W - 20) / n - 6);
      d.nums.forEach((v, i) => { const cx = 10 + (W - 20) / 2 + (n / 2 - i - 0.5) * (cw + 6); if (left.indexOf(v) < 0) { ctx.fillStyle = 'rgba(148,163,184,.6)'; ctx.fillRect(cx - cw / 2, base + 20, cw, 56); } else d.hits.push({ x: cx - cw / 2, y: base + 20, w: cw, h: 56, v: v }); });
      const done = seq.length === n && seq.every((v, i) => v === d.sorted[i]);
      G.txt(ctx, done ? (d.dir === 'asc' ? 'ترتيب تصاعدي صحيح ✔' : 'ترتيب تنازلي صحيح ✔') : (d.dir === 'asc' ? 'من الأصغر إلى الأكبر' : 'من الأكبر إلى الأصغر'), W / 2, H - 14, { color: done ? c.c3 : c.c5, size: nar ? 14 : 17, w: '800' });
    },
    onPointer(type, x, y, p, st, api) {
      if (type !== 'down') return false; const h = api.hit(x, y); if (!h) return false;
      if (h.undo) { st.seq.pop(); return true; }
      if (h.v != null && st.seq.indexOf(h.v) < 0) { st.seq.push(h.v); return true; }
      return false;
    },
    live(p, d) { return d.sorted.join(d.dir === 'asc' ? ' < ' : ' > '); },
    results(p, d) {
      const seq = (d.st && d.st.seq) || []; const done = seq.length === d.nums.length && seq.every((v, i) => v === d.sorted[i]);
      return [['الأعداد', d.nums.map(L).join(' ، '), false], [d.dir === 'asc' ? 'الترتيب التصاعدي' : 'الترتيب التنازلي', d.sorted.map(L).join(' ، '), false, 'pos'], ['ترتيبك', seq.length ? seq.map(L).join(' ، ') + (done ? ' ✔' : '') : '—', false, done ? 'pos' : '']];
    },
    steps(p, d) { return [d.dir === 'asc' ? 'نبدأ بأصغر عدد: ' + L(d.sorted[0]) + '.' : 'نبدأ بأكبر عدد: ' + L(d.sorted[0]) + '.', 'ثم ' + (d.dir === 'asc' ? 'الأصغر' : 'الأكبر') + ' مما بقي، وهكذا: ' + d.sorted.map(L).join(' ، ') + '.']; },
    explain() { return []; },
    learn: ['**نشاط 1 ص 41:** الطفلة تصعد الدرج من ١ إلى ٩.', '**أتعلم ص 41:** ترتيب الأعداد من الأصغر إلى الأكبر يُسمّى الترتيب التصاعدي.', '**أتعلم ص 43:** ترتيب الأعداد من الأكبر إلى الأصغر يُسمّى الترتيب التنازلي.', '**نشاطا 5 و 6 ص 44:** أكتب عدداً مناسباً ليصبح الترتيب تنازلياً (٩ ، ؟ ، ٤) أو تصاعدياً (٤ ، ؟ ، ٧).'],
    challenges: [
      { q: 'رتّب ٨ ، ٥ ، ٩ ، ٢ تصاعدياً (نشاط 4 جـ).', hint: 'ابدأ بأصغر عدد.', init: { ex: 'a3' }, check: (p, d) => p.ex === 'a3' && d.st && d.st.seq.join() === '2,5,8,9' },
      { q: 'رتّب ٥ ، ٧ ، ١ ، ٤ تنازلياً (ص 44).', hint: 'ابدأ بأكبر عدد.', init: { ex: 'a3' }, check: (p, d) => p.ex === 'd3' && d.st && d.st.seq.join() === '7,5,4,1' },
      { q: 'عُدّ تصاعدياً من ٣ إلى ٨ (ص 42).', hint: 'اختر النشاط ٣.', init: { ex: 'a3' }, check: (p, d) => p.ex === 'r38' && d.st && d.st.seq.join() === '3,4,5,6,7,8' }
    ],
    tutor: [{ q: 'ما الترتيب التصاعدي؟', k: ['تصاعدي'], a: () => 'ترتيب الأعداد من الأصغر إلى الأكبر.' }, { q: 'ما الترتيب التنازلي؟', k: ['تنازلي'], a: () => 'ترتيب الأعداد من الأكبر إلى الأصغر.' }, { q: 'بأي عدد أبدأ؟', k: ['ابدا'], a: (p, d) => 'بالعدد ' + L(d.sorted[0]) + '.' }]
  });

  /* ======================= الدرسان 4–5: العدد التالي والعدد السابق (ص 45–49) ======================= */
  const NP = [
    ['pen', 'نشاط 3 ص 46: معي ٤ أقلام، أنا معي ٥', 'next', 4, null], ['x3', 'نشاط 5 ص 47: التالي لـ ٣ (٤ ، ٥ ، ٦)', 'next', 3, [4, 5, 6]], ['x7', 'نشاط 5: التالي لـ ٧ (٦ ، ٩ ، ٨)', 'next', 7, [6, 9, 8]],
    ['x6', 'نشاط 5: التالي لـ ٦ (٨ ، ٧ ، ٥)', 'next', 6, [8, 7, 5]], ['x8', 'نشاط 5: التالي لـ ٨ (٨ ، ٧ ، ٩)', 'next', 8, [8, 7, 9]], ['x5', 'نشاط 6 ص 47: التالي لـ ٥', 'next', 5, null],
    ['kids', 'نشاط 1 ص 48: ٥ أطفال صاروا ٦', 'prev', 6, null], ['v6', 'نشاط 5 ص 49: السابق لـ ٦ (٤ ، ٥ ، ٧)', 'prev', 6, [4, 5, 7]], ['v7', 'نشاط 5: السابق لـ ٧ (٦ ، ٥ ، ٤)', 'prev', 7, [6, 5, 4]],
    ['v9', 'نشاط 5: السابق لـ ٩ (٦ ، ٧ ، ٨)', 'prev', 9, [6, 7, 8]], ['v8', 'نشاط 5: السابق لـ ٨ (٨ ، ٧ ، ٦)', 'prev', 8, [8, 7, 6]], ['r8', 'مراجعة 8 ص 55: التالي لـ ٨', 'next', 8, null], ['r3', 'مراجعة 8: السابق لـ ٣', 'prev', 3, null]
  ];
  G.reg({
    id: 'next-previous', unit: U, order: 3, lesson: '2-4 – 2-5', lessonTitle: 'العدد التالي والعدد السابق', page: 45,
    titleAr: 'العدد التالي والعدد السابق', titleEn: 'The Next and the Previous Number', tags: 'العدد التالي السابق اكبر بواحد اصغر بواحد ضفدع دومينو خط الاعداد',
    formula: '\\text{التالي} = n + 1,\\qquad \\text{السابق} = n - 1',
    book: 'العدد التالي: هو العدد الأكبر بواحد ؛ العدد السابق أصغر بواحد: العدد ٥ يُسمّى العدد السابق للعدد ٦',
    summary: '**العدد التالي** لعدد هو العدد الأكبر منه **بواحد** (نقفز خطوة إلى الأمام على خط الأعداد). **العدد السابق** هو العدد الأصغر منه **بواحد** (نرجع خطوة).',
    vars: [['n', 'العدد المعطى', 'من ١ إلى ٩']],
    ar: { n: 'العدد' },
    params: [{ key: 'ex', label: '\\text{النشاط}', type: 'select', value: 'x7', options: G.opts(NP.map((e) => [e[0], e[1]])) }],
    initState() { return { pick: null }; },
    resetOn: ['ex'],
    custom: true, canvasHint: 'الضفدع يقف على العدد المعطى. انقر العدد الذي يقفز إليه الضفدع (أو يرجع إليه).',
    compute(p) { const e = NP.find((x) => x[0] === p.ex); const ans = e[2] === 'next' ? e[3] + 1 : e[3] - 1; return { e: e, mode: e[2], n: e[3], ans: ans, choices: e[4] || [1, 2, 3, 4, 5, 6, 7, 8, 9] }; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); d.hits = []; const st = d.st || { pick: null }; const ok = st.pick === d.ans;
      // مجموعتا الأشياء: المعطى ثم بعد الإضافة أو الحذف
      const kind = d.e[0] === 'pen' ? 'pencil' : d.e[0] === 'kids' ? 'boy' : 'circle';
      G.box(ctx, W * 0.52, 10, W * 0.46, H * 0.36, c.c1); G.group(ctx, kind, d.n, W * 0.52 + 6, 14, W * 0.46 - 12, H * 0.36 - 30, c, { maxS: 60 });
      G.txt(ctx, L(d.n), W * 0.75, H * 0.36 - 4, { color: c.c1, size: 18, w: '800' });
      G.box(ctx, W * 0.02, 10, W * 0.46, H * 0.36, ok ? c.c3 : c.grid);
      if (st.pick != null) { G.group(ctx, kind, d.ans, W * 0.02 + 6, 14, W * 0.46 - 12, H * 0.36 - 30, c, { maxS: 60 }); G.txt(ctx, L(d.ans), W * 0.25, H * 0.36 - 4, { color: c.c3, size: 18, w: '800' }); }
      else G.txt(ctx, '؟', W * 0.25, H * 0.2, { color: c.muted, size: 40, w: '800' });
      // خط الأعداد والضفدع
      const x0 = 30, x1 = W - 30, y = H * 0.62; const X = (v) => x1 - (v - 1) * (x1 - x0) / 8;
      ctx.strokeStyle = c.c6; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 - 12, y); ctx.lineTo(x1 + 12, y); ctx.stroke();
      for (let v = 1; v <= 9; v++) { ctx.fillStyle = c.c6; ctx.fillRect(X(v) - 1.5, y - 8, 3, 16); G.txt(ctx, v, X(v), y + 24, { color: v === d.n ? c.c1 : c.text, size: 20, w: '800' }); }
      G.icon(ctx, 'frog', X(d.n), y - 24, 44);
      if (st.pick != null) { const t = X(st.pick); ctx.strokeStyle = ok ? c.c3 : c.c2; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(X(d.n), y - 34); ctx.quadraticCurveTo((X(d.n) + t) / 2, y - 80, t, y - 34); ctx.stroke(); G.arrow(ctx, t + (t > X(d.n) ? -4 : 4), y - 44, t, y - 34, ok ? c.c3 : c.c2, 2.5); }
      G.cards(ctx, d.choices, 10, H - 78, W - 20, 56, c, { sel: st.pick, good: d.ans, hits: d.hits });
    },
    onPointer(type, x, y, p, st, api) { if (type !== 'down') return false; const h = api.hit(x, y); if (!h || h.v == null) return false; st.pick = h.v; return true; },
    live(p, d) { return d.mode === 'next' ? d.n + ' + 1 = ' + d.ans : d.n + ' - 1 = ' + d.ans; },
    results(p, d) { const st = d.st || { pick: null }; return [['العدد', L(d.n), false], [d.mode === 'next' ? 'العدد التالي' : 'العدد السابق', L(d.ans), false, 'pos'], ['اخترتَ', st.pick == null ? 'لم تختر بعد' : L(st.pick) + (st.pick === d.ans ? ' ✔' : ' ✘'), false, st.pick == null ? '' : st.pick === d.ans ? 'pos' : 'neg']]; },
    steps(p, d) { return d.mode === 'next' ? ['العدد التالي أكبر بواحد.', 'نقفز خطوة واحدة إلى الأمام من ' + L(d.n) + ' فنصل إلى ' + L(d.ans) + '.'] : ['العدد السابق أصغر بواحد.', 'نرجع خطوة واحدة من ' + L(d.n) + ' فنصل إلى ' + L(d.ans) + '.']; },
    explain() { return []; },
    learn: ['**نشاط 1 ص 45:** الضفدع يقفز ليصل إلى اليابسة؛ نكتب العدد التالي بعد ١ ، ٣ ، ٥ ، ٧.', '**نشاط 3 ص 46:** «معي ٤ أقلام» — «أنا معي ٥ أقلام، أنا العدد التالي». للمعلم: العدد التالي هو العدد الأكبر بواحد.', '**نشاط 1 ص 48:** ٥ أطفال يلعبون فجاء طفل فصاروا ٦: العدد ٥ يُسمّى العدد السابق للعدد ٦ ، وهو أصغر منه بواحد.'],
    challenges: [
      { q: 'اختر العدد التالي للعدد ٧ (ص 47).', hint: 'أكبر بواحد.', init: { ex: 'x7' }, check: (p, d) => p.ex === 'x7' && d.st && d.st.pick === 8 },
      { q: 'اختر العدد السابق للعدد ٩ (ص 49).', hint: 'أصغر بواحد.', init: { ex: 'x7' }, check: (p, d) => p.ex === 'v9' && d.st && d.st.pick === 8 },
      { q: 'ما العدد السابق للعدد ٣ (مراجعة ص 55)؟', hint: 'نرجع خطوة.', init: { ex: 'x7' }, check: (p, d) => p.ex === 'r3' && d.st && d.st.pick === 2 }
    ],
    tutor: [{ q: 'ما العدد التالي؟', k: ['التالي'], a: () => 'العدد الأكبر بواحد.' }, { q: 'ما العدد السابق؟', k: ['السابق'], a: () => 'العدد الأصغر بواحد.' }, { q: 'ما الجواب الآن؟', k: ['الجواب', 'الان'], a: (p, d) => L(d.ans) + '.' }]
  });

  /* ======================= الدرس 6: العدد الترتيبي (ص 50–55) ======================= */
  const TRAIN = ['ريم', 'بلال', 'لبنى', 'باسم', 'محمد', 'سامي', 'رامي', 'ميس', 'أحمد'];
  const FEM = { 'ريم': 1, 'لبنى': 1, 'ميس': 1 };
  const KITES = [['الحمراء', '#ef4444'], ['الخضراء', '#22c55e'], ['البرتقالية', '#f97316'], ['السوداء', '#111827'], ['الزرقاء', '#3b82f6']];
  const OQ = [
    ['bus', 'ص 50: الطلاب أمام الحافلة — أعدّ ترتيبياً', 'bus', 0], ['duck', 'نشاط 3 ص 51: البطة الرابعة', 'duck', 4], ['rabbit', 'نشاط 3: الأرنب الثاني', 'rabbit', 2], ['kid', 'نشاط 3: الطفل الخامس', 'kid', 5], ['bird', 'نشاط 3: العصفور الثالث', 'bird', 3],
    ['kite1', 'نشاط 4 ص 51: الطائرة الورقية الأولى', 'kite', 1], ['kite5', 'نشاط 4: الطائرة الأخيرة', 'kite', 5], ['kite3', 'نشاط 4: ترتيب البرتقالية', 'kite', 3],
    ['t2', 'مراجعة 4 ص 53: من الراكب الثاني؟', 'train', 2], ['t3', 'مراجعة 4: لبنى هي الراكبة…', 'train', 3], ['t7', 'مراجعة 4: الراكب السابع', 'train', 7], ['t5', 'مراجعة 4: الراكب الخامس', 'train', 5], ['t4', 'مراجعة 4: الراكب بين الثالث والخامس', 'train', 4]
  ];
  const SCN = { bus: ['boy', 9], duck: ['duck', 9], rabbit: ['rabbit', 6], kid: ['boy', 5], bird: ['bird', 5], kite: ['kite', 5], train: ['train', 9] };
  G.reg({
    id: 'ordinal', unit: U, order: 4, lesson: '2-6 – 2-7', lessonTitle: 'العدد الترتيبي والمراجعة', page: 50,
    titleAr: 'العدد الترتيبي: الأول … التاسع', titleEn: 'Ordinal Numbers', tags: 'عدد ترتيبي الاول الثاني الثالث الرابع الخامس السادس السابع الثامن التاسع حافله قطار طائرات ورقيه',
    formula: '1 \\to \\text{الأول},\\quad 2 \\to \\text{الثاني},\\quad \\ldots,\\quad 9 \\to \\text{التاسع}',
    book: 'أعدّ ترتيبياً: الأول، الثاني، الثالث، الرابع، الخامس، السادس، السابع، الثامن، التاسع',
    summary: 'العدد **الترتيبي** يبيّن **مكان** الشيء في صف مرتّب: الأول، الثاني، الثالث… التاسع. نبدأ العدّ من **أول الصف** دائماً. ونقول للمؤنث: الأولى، الثانية، الثالثة…',
    vars: [['\\text{الترتيب}', 'مكان العنصر في الصف', 'من الأول إلى التاسع']],
    params: [{ key: 'ex', label: '\\text{السؤال}', type: 'select', value: 't2', options: G.opts(OQ.map((e) => [e[0], e[1]])) }],
    initState() { return { pick: null }; },
    resetOn: ['ex'],
    custom: true, canvasHint: 'انقر أي عنصر لترى ترتيبه. ابدأ العدّ من أول الصف (عند السهم).',
    compute(p) { const e = OQ.find((x) => x[0] === p.ex); const sc = SCN[e[2]]; return { e: e, scene: e[2], kind: sc[0], n: sc[1], target: e[3] }; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); d.hits = []; const st = d.st || { pick: null };
      const mark = (x, y, s, i) => { const on = st.pick === i; const ok = on && (d.target === 0 || i + 1 === d.target); if (on) { ctx.strokeStyle = ok ? c.c3 : c.c2; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, s * 0.55, 0, 7); ctx.stroke(); } };
      if (d.scene === 'kite') {
        const s = Math.min(70, (H - 40) / 5);
        KITES.forEach((k, i) => { const x = W / 2 + (2 - i) * s * 0.5, y = 30 + i * s; G.icon(ctx, 'kite', x, y, s * 0.9, k[1]); ctx.strokeStyle = c.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y + s * 0.3); ctx.lineTo(W * 0.2, H - 30); ctx.stroke(); G.txt(ctx, G.ORD_F[i + 1], x + s * 0.9, y, { color: st.pick === i ? c.c3 : c.muted, size: 13, w: '700' }); mark(x, y, s, i); d.hits.push({ x: x - s / 2, y: y - s / 2, w: s, h: s, i: i }); });
        G.icon(ctx, 'girl', W * 0.2, H - 30, 60);
        return;
      }
      if (d.scene === 'train') {
        const n = 9; const x0 = nar ? 44 : 70; const sw = Math.min(84, (W - x0 - 20) / n); const y = H * 0.48;
        G.icon(ctx, 'bus', x0 / 2, y, x0 - 4); G.txt(ctx, 'السائق', x0 / 2, y - x0 * 0.7, { color: c.muted, size: 12, w: '700' });
        TRAIN.forEach((nm, i) => { const x = x0 + (i + 0.5) * sw; ctx.fillStyle = ['#22c55e', '#ef4444', '#f97316', '#3b82f6', '#a855f7', '#14b8a6', '#eab308', '#ec4899', '#64748b'][i]; ctx.fillRect(x - sw * 0.42, y - 4, sw * 0.84, sw * 0.5); G.icon(ctx, FEM[nm] ? 'girl' : 'boy', x, y - sw * 0.25, sw * 0.8); G.txt(ctx, nm, x, y - sw * 0.85, { color: c.text, size: nar ? 10 : 13, w: '800' }); mark(x, y - sw * 0.2, sw, i); d.hits.push({ x: x - sw / 2, y: y - sw, w: sw, h: sw * 1.6, i: i }); });
      } else {
        const sw = Math.min(90, (W - 40) / d.n); const y = H * 0.45; const xr = W / 2 + d.n * sw / 2; // أول الصف يميناً كما في الكتاب
        G.arrow(ctx, xr + 20, y - sw * 0.9, xr - 8, y - sw * 0.9, c.c4, 2.4); G.txt(ctx, d.n === 9 && d.scene === 'bus' ? 'الحافلة' : 'الأول', xr + 8, y - sw * 1.15, { color: c.c4, size: 12, w: '800' });
        for (let i = 0; i < d.n; i++) { const x = xr - (i + 0.5) * sw; G.icon(ctx, d.kind, x, y, sw * 0.85); if (d.scene === 'bus' || st.pick === i) G.txt(ctx, G.ORD_M[i + 1], x, y + sw * 0.62, { color: st.pick === i ? c.c3 : c.muted, size: nar ? 10 : 13, w: '800' }); mark(x, y, sw, i); d.hits.push({ x: x - sw / 2, y: y - sw / 2, w: sw, h: sw, i: i }); }
      }
      if (st.pick != null) { const nm = d.scene === 'train' ? TRAIN[st.pick] : null; const ord = nm && FEM[nm] ? G.ORD_F[st.pick + 1] : G.ORD_M[st.pick + 1]; G.txt(ctx, (nm ? nm + ' ' + (FEM[nm] ? 'هي الراكبة ' : 'هو الراكب ') : 'الترتيب: ') + ord, W / 2, H - 30, { color: d.target === 0 || st.pick + 1 === d.target ? c.c3 : c.c2, size: nar ? 16 : 20, w: '800' }); }
    },
    onPointer(type, x, y, p, st, api) { if (type !== 'down') return false; const h = api.hit(x, y); if (!h || h.i == null) return false; st.pick = h.i; return true; },
    live(p, d) { return d.target ? d.target + ' \\to \\text{' + G.ORD_M[d.target] + '}' : '1 \\to 9'; },
    results(p, d) {
      const st = d.st || { pick: null }; const r = [];
      if (d.scene === 'train' && d.target) r.push(['الجواب', TRAIN[d.target - 1] + ' (' + (FEM[TRAIN[d.target - 1]] ? G.ORD_F[d.target] : G.ORD_M[d.target]) + ')', false, 'pos']);
      else if (d.scene === 'kite') r.push(['الطائرة ' + G.ORD_F[d.target], KITES[d.target - 1][0], false, 'pos']);
      else if (d.target) r.push(['المطلوب', G.ORD_M[d.target], false, 'pos']);
      else r.push(['العدّ الترتيبي', G.ORD_M.slice(1).join('، '), false]);
      r.push(['اخترتَ', st.pick == null ? 'لم تختر بعد' : G.ORD_M[st.pick + 1] + (d.target && st.pick + 1 === d.target ? ' ✔' : d.target ? ' ✘' : ''), false, st.pick == null || !d.target ? '' : st.pick + 1 === d.target ? 'pos' : 'neg']);
      return r;
    },
    steps(p, d) { return ['نبدأ العدّ من أول الصف: الأول، الثاني، الثالث…', d.target ? 'نتوقف عند ' + G.ORD_M[d.target] + ' (العدد ' + L(d.target) + ').' : 'آخر الطلاب هو التاسع.']; },
    explain() { return []; },
    learn: ['**نشاط 1 ص 50:** وصلت الحافلة فخرج ٩ طلاب ووقفوا بترتيب: الأول … التاسع.', '**نشاط 4 ص 51:** الطائرة الورقية العليا هي الأولى.', '**مراجعة 4 ص 53 (قطار الألعاب):** ريم الراكبة الأولى، بلال الثاني، لبنى الثالثة، باسم الرابع، محمد الخامس، سامي السادس، رامي السابع، ميس الثامنة، أحمد التاسع.', '**مراجعة 9 ص 55:** يدخل الطفل المدرسة وعمره ٦ سنوات: ٦ سنوات ← الأول، ٧ ← الثاني، ٨ ← الثالث، ٩ ← الرابع.', '**مراجعة 8 ص 55:** عدد حروف كلمة «دورا» ٤.'],
    challenges: [
      { q: 'من الراكب الثاني في القطار؟ انقره.', hint: 'ابدأ العدّ من جهة السائق.', init: { ex: 't2' }, check: (p, d) => p.ex === 't2' && d.st && d.st.pick === 1, why: () => 'بلال.' },
      { q: 'انقر البطة الرابعة (ص 51).', hint: 'ابدأ من أول الصف.', init: { ex: 't2' }, check: (p, d) => p.ex === 'duck' && d.st && d.st.pick === 3 },
      { q: 'انقر الطائرة الورقية الأخيرة (ص 51).', hint: 'الأخيرة هي الخامسة.', init: { ex: 't2' }, check: (p, d) => p.ex === 'kite5' && d.st && d.st.pick === 4, why: () => 'الزرقاء.' }
    ],
    tutor: [{ q: 'من أين أبدأ العدّ الترتيبي؟', k: ['ابدا'], a: () => 'من أول الصف دائماً.' }, { q: 'كيف أقول الترتيب للبنت؟', k: ['للبنت', 'مؤنث'], a: () => 'الأولى، الثانية، الثالثة… مثل «لبنى هي الراكبة الثالثة».' }, { q: 'ما المطلوب؟', k: ['المطلوب'], a: (p, d) => (d.target ? G.ORD_M[d.target] + '.' : 'نعدّ من الأول إلى التاسع.') }]
  });
})(typeof window !== 'undefined' ? window : globalThis);
