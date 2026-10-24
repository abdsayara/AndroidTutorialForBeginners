/* رياضيات الأول — الوحدة الرابعة: الطرح ضمن العدد ٩ (ص 73–86) */
(function (root) {
  'use strict';
  const ML = root.ML; const G = ML.m1;
  const U = 4;
  const L = (x) => G.L(x);
  const D09 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const kind = (k) => k.split(':')[0]; const kcol = (k) => k.split(':')[1];

  /* ======================= الدرس 1: الطرح ضمن العدد ٩ (ص 75–80) ومراجعة الوحدة (ص 84–86) ======================= */
  // [المفتاح، الاسم، الشيء، المطروح منه، المطروح، المجهول: r باقي الطرح أو b المطروح]
  const SB = [
    ['glass', 'ص 75: كؤوس العصير (جميعها ناقص الفارغة)', 'cup', 5, 3, 'r'], ['candy', 'نشاط 1 ص 76: حلوى حسام', 'circle:#a855f7', 4, 1, 'r'], ['straw', 'نشاط 2 ص 76: الفراولة', 'strawberry', 7, 3, 'r'],
    ['sheep', 'نشاط 3 ص 77: الخراف', 'sheep', 6, 4, 'r'], ['ant', 'نشاط 3: النمل', 'ant', 9, 6, 'r'], ['cup8', 'نشاط 3: الأكواب', 'cup', 8, 3, 'r'], ['orng', 'نشاط 3: البرتقال', 'orange', 4, 4, 'r'], ['bird', 'نشاط 3: العصافير', 'bird', 7, 5, 'r'],
    ['hen', 'نشاط 4 ص 77: الدجاج ٤ − ؟ = ١', 'hen', 4, 3, 'b'], ['fish', 'نشاط 4: الأسماك ٧ − ؟ = ٢', 'fish', 7, 5, 'b'], ['farm', 'نشاط 4: المزارعون ٥ − ٠', 'boy', 5, 0, 'r'],
    ['cake', 'نشاط 5 ص 78: الكعك', 'cupcake', 7, 3, 'r'], ['eggp', 'نشاط 5: الباذنجان', 'eggplant', 6, 6, 'r'], ['pen8', 'نشاط 5: الأقلام ٨ − ٠', 'pencil', 8, 0, 'r'],
    ['v96', 'نشاط 9 ص 79: النقاط ٩ − ٦ (عمودياً)', 'circle:#111827', 9, 6, 'r'], ['v65', 'نشاط 9: النقاط ٦ − ٥ (عمودياً)', 'circle:#111827', 6, 5, 'r'],
    ['cubes', 'نشاط 16 ص 80: المكعبات الحمراء والصفراء', 'cube:#ef4444', 7, 3, 'r'], ['lubna', 'نشاط 17 ص 80: أقلام لبنى', 'pencil', 6, 6, 'r'],
    ['sally', 'مراجعة 8 ص 86: مشمش سالي وجميلة', 'orange', 8, 3, 'r'], ['bag', 'مراجعة 9 ص 86: ثمن الحقيبة', 'circle:#facc15', 9, 6, 'r']
  ];
  const STORY = { candy: 'أخرج حسام ٤ حبّات حلوى، وأكل منها حبة واحدة.', glass: 'عدد الكؤوس الممتلئة = عدد الكؤوس جميعها ناقص الفارغة.', cubes: 'كم يزيد عدد المكعبات الحمراء عن الصفراء؟', lubna: 'مع لبنى ٦ أقلام أعطتها جميعها لأخواتها: كم بقي معها؟', sally: 'قطفت سالي ٣ وجميلة ٨: كم قطفت جميلة زيادة؟', bag: 'معي ٦ دنانير، وثمن الحقيبة ٩: كم ديناراً أحتاج؟' };
  G.reg({
    id: 'subtract-within-9', unit: U, order: 1, lesson: '4-1 و 4-3', lessonTitle: 'الطرح ضمن العدد ٩ والمراجعة', page: 75,
    titleAr: 'الطرح ضمن العدد ٩', titleEn: 'Subtraction within 9', tags: 'الطرح ناقص باقي الطرح المطروح منه المطروح اشطب كؤوس فراوله حسام لبنى عمودي',
    formula: '5 - 3 = 2',
    book: 'عدد الكؤوس الممتلئة = عدد الكؤوس جميعها ناقص عدد الكؤوس الفارغة: ٥ − ٣ = ٢ وتُقرأ ٥ ناقص ٣ يساوي ٢ ؛ المطروح منه − المطروح = باقي الطرح',
    summary: 'في **الطرح** نبدأ بمجموعة و**نأخذ** منها بعض الأشياء (نشطبها)، ثم نعدّ ما **بقي**. نكتب **٥ − ٣ = ٢**: ٥ **المطروح منه**، و ٣ **المطروح**، و ٢ **باقي الطرح**. وإذا طرحنا صفراً بقي العدد كما هو.',
    vars: [['-', 'ناقص', '']],
    params: [
      { key: 'ex', label: '\\text{المسألة}', type: 'select', value: 'straw', options: G.opts(SB.map((e) => [e[0], e[1]])) },
      { key: 'vert', label: '\\text{عمودياً}', type: 'toggle', value: false }
    ],
    onSet(p, key) { if (key === 'ex') p.vert = /^v/.test(p.ex); },
    initState() { return { crossed: [], pick: null }; },
    resetOn: ['ex'],
    custom: true, canvasHint: 'انقر الأشياء التي نأخذها لتشطبها، ثم اختر بطاقة العدد الذي بقي.',
    compute(p) { const e = SB.find((x) => x[0] === p.ex); const a = e[3], b = e[4]; return { e: e, a: a, b: b, r: a - b, miss: e[5], ans: e[5] === 'b' ? b : a - b, story: STORY[e[0]] || '' }; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); d.hits = []; const st = d.st || { crossed: [], pick: null }; const ok = st.pick === d.ans;
      const gH = Math.min(170, H * 0.4); const top = 8; const gx = p.vert ? W * 0.3 : 10, gw = p.vert ? W * 0.68 : W - 20;
      G.box(ctx, gx, top, gw, gH, c.c1, 'rgba(250,250,240,.5)');
      if (d.a > 0) {
        const Lp = G.layout(d.a, gx + 4, top + 4, gw - 8, gH - 8, 70);
        Lp.pts.forEach((pt, i) => { const x = st.crossed.indexOf(i) >= 0; G.icon(ctx, kind(d.e[2]), pt[0], pt[1], Lp.s * 0.85, kcol(d.e[2])); if (x) G.cross(ctx, pt[0], pt[1], Lp.s * 0.8); d.hits.push({ x: pt[0] - Lp.s / 2, y: pt[1] - Lp.s / 2, w: Lp.s, h: Lp.s, i: i }); });
      }
      const nx = st.crossed.length; const left = d.a - nx;
      const ansTxt = st.pick == null ? '؟' : L(st.pick); const ansCol = st.pick == null ? c.muted : ok ? c.c3 : c.c2;
      const bTxt = d.miss === 'b' ? ansTxt : L(d.b), rTxt = d.miss === 'b' ? L(d.r) : ansTxt;
      if (p.vert) {
        const x = W * 0.14; G.txt(ctx, L(d.a), x, top + 26, { color: c.text, size: 30, w: '800' }); G.txt(ctx, bTxt, x, top + 66, { color: d.miss === 'b' ? ansCol : c.text, size: 30, w: '800' }); G.txt(ctx, '−', x + 34, top + 66, { color: c.text, size: 26, w: '800' });
        ctx.strokeStyle = c.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 30, top + 90); ctx.lineTo(x + 46, top + 90); ctx.stroke();
        G.txt(ctx, rTxt, x, top + 118, { color: d.miss === 'b' ? c.text : ansCol, size: 30, w: '800' });
      } else {
        const ey = top + gH + 40; const step = Math.min(64, W / 6.5); const xs = [W / 2 + 2 * step, W / 2 + step, W / 2, W / 2 - step, W / 2 - 2 * step];
        [[L(d.a), c.text], ['−', c.text], [bTxt, d.miss === 'b' ? ansCol : c.text], ['=', c.text], [rTxt, d.miss === 'b' ? c.text : ansCol]].forEach((q, i) => { if (i % 2 === 0) G.box(ctx, xs[i] - step * 0.4, ey - 24, step * 0.8, 48, c.c1); G.txt(ctx, q[0], xs[i], ey, { color: q[1], size: 28, w: '800' }); });
        if (!nar) { G.txt(ctx, 'المطروح منه', xs[0], ey + 38, { color: c.muted, size: 12, w: '700' }); G.txt(ctx, 'المطروح', xs[2], ey + 38, { color: c.muted, size: 12, w: '700' }); G.txt(ctx, 'باقي الطرح', xs[4], ey + 38, { color: c.muted, size: 12, w: '700' }); }
      }
      G.txt(ctx, 'شطبتَ ' + L(nx) + ' ، وبقي ' + L(left), W / 2, H - 104, { color: nx === d.b ? c.c3 : c.text, size: nar ? 15 : 18, w: '800' });
      if (d.story) G.txt(ctx, d.story, W / 2, H - 80, { color: c.muted, size: nar ? 12 : 15, w: '700' });
      G.cards(ctx, D09, 8, H - 60, W - 16, 50, c, { sel: st.pick, good: d.ans, hits: d.hits });
    },
    onPointer(type, x, y, p, st, api) {
      if (type !== 'down') return false; const h = api.hit(x, y); if (!h) return false;
      if (h.v != null) { st.pick = h.v; return true; }
      if (h.i != null) { const k = st.crossed.indexOf(h.i); if (k >= 0) st.crossed.splice(k, 1); else st.crossed.push(h.i); return true; }
      return false;
    },
    live(p, d) { const ok = d.st && d.st.pick === d.ans; return d.a + ' - ' + (d.miss === 'b' && !ok ? '?' : d.b) + ' = ' + (d.miss === 'r' && !ok ? '?' : d.r); },
    results(p, d) {
      const st = d.st || { crossed: [], pick: null };
      return [['المطروح منه', L(d.a), false], ['المطروح', L(d.b), false], ['باقي الطرح', L(d.r), false, 'pos'], ['شطبتَ', L(st.crossed.length) + (st.crossed.length === d.b ? ' ✔' : ''), false],
        ['اخترتَ', st.pick == null ? 'لم تختر بعد' : L(st.pick) + (st.pick === d.ans ? ' ✔' : ' ✘'), false, st.pick == null ? '' : st.pick === d.ans ? 'pos' : 'neg']];
    },
    steps(p, d) {
      if (d.miss === 'b') return ['معنا ' + L(d.a) + ' وبقي ' + L(d.r) + '.', 'نشطب حتى يبقى ' + L(d.r) + ': شطبنا ' + L(d.b) + '.', L(d.a) + ' − ' + L(d.b) + ' = ' + L(d.r) + '.'];
      return ['نعدّ المجموعة كلها: ' + L(d.a) + '.', d.b ? 'نشطب ' + L(d.b) + ' ونعدّ ما بقي: ' + L(d.r) + '.' : 'لا نشطب شيئاً (نطرح صفراً)، فيبقى العدد كما هو.', 'نكتب: ' + L(d.a) + ' − ' + L(d.b) + ' = ' + L(d.r) + '.'];
    },
    explain() { return []; },
    learn: ['**نشاط ص 75:** عدد الكؤوس الممتلئة = عدد الكؤوس جميعها ناقص عدد الكؤوس الفارغة: ٥ − ٣ = ٢ ، وتُقرأ ٥ ناقص ٣ يساوي ٢.', '**نشاط 1 ص 76:** ٤ − ١ = ٣: المطروح منه − المطروح = باقي الطرح.', '**نشاط 2 ص 76:** ٧ − ٣: أرفع ٣ حبات من الصحن، أو أرفع ٧ أصابع وأضمّ منها ٣ فتبقى ٤.', '**نشاط 7 ص 78:** ٥ − ٤ ، ٧ − ٣ ، ٩ − ٤ ، ٥ − ٠ ، ٦ − ٣ ، ٩ − ٧ ، ٨ − ٥ ، ٧ − ٥ ، ٧ − ١ ، ٨ − ٢ ، ٩ − ٨ ، ٥ − ٥.', '**للمعلم ص 78:** إذا طرحنا العدد صفر من أي عدد يكون ناتج الطرح العدد نفسه.', '**نشاط 17 ص 80:** مع لبنى ٦ أقلام أعطتها جميعها لأخواتها: ٦ − ٦ = ٠.'],
    challenges: [
      { q: 'اشطب ٣ حبات فراولة من ٧ واختر ما بقي (ص 76).', hint: 'انقر ٣ حبات.', init: { ex: 'glass' }, check: (p, d) => p.ex === 'straw' && d.st && d.st.crossed.length === 3 && d.st.pick === 4 },
      { q: '٤ − ؟ = ١: كم دجاجة نشطب (نشاط 4 ص 77)؟', hint: 'اشطب حتى تبقى دجاجة واحدة.', init: { ex: 'glass' }, check: (p, d) => p.ex === 'hen' && d.st && d.st.crossed.length === 3 && d.st.pick === 3 },
      { q: 'كم قلماً بقي مع لبنى (نشاط 17 ص 80)؟', hint: 'أعطت أقلامها جميعها.', init: { ex: 'glass' }, check: (p, d) => p.ex === 'lubna' && d.st && d.st.pick === 0 }
    ],
    tutor: [{ q: 'ما باقي الطرح؟', k: ['باقي'], a: () => 'العدد الذي يبقى بعد أن نأخذ المطروح من المطروح منه.' }, { q: 'ماذا يحدث إذا طرحت صفراً؟', k: ['صفر', 'صفرا'], a: () => 'يبقى العدد كما هو، مثل ٨ − ٠ = ٨.' }, { q: 'كم أشطب؟', k: ['اشطب', 'كم'], a: (p, d) => 'أشطب ' + L(d.b) + '.' }]
  });

  /* ======================= الدرس 2: العلاقة بين الجمع والطرح (ص 81–83) ومراجعة 4 ص 85 ======================= */
  // [المفتاح، الاسم، المكوّن الأول، المكوّن الثاني] والكل = مجموعهما
  const FF = [
    ['rose', 'ص 81: ورود ميسون ٩ ، أهدت ٣', 6, 3], ['rose6', 'ص 81: لو أهدت ٦ ورود', 3, 6], ['f1', 'نشاط 2 ص 82: ٣ + ٤ = ٧', 3, 4], ['f2', 'نشاط 2: ٢ + ٦ = ٨', 2, 6], ['f3', 'نشاط 2: ٤ + ٠ = ٤', 4, 0],
    ['s1', 'نشاط 3 ص 82: ٥ − ٤', 1, 4], ['s2', 'نشاط 3: ٨ − ٣', 5, 3], ['s3', 'نشاط 3: ٧ − ٠', 7, 0],
    ['n1', 'نشاط 4 ص 83: الأعداد ١ ، ٣ ، ٤', 1, 3], ['n2', 'نشاط 4: الأعداد ٢ ، ٣ ، ٥', 2, 3], ['n3', 'نشاط 4: الأعداد ٧ ، ٢ ، ٩', 7, 2],
    ['r1', 'مراجعة 2 ص 84: ٧ − ٥', 2, 5], ['r2', 'مراجعة 2: ٥ − ٤', 1, 4], ['r3', 'مراجعة 2: ٨ − ٢', 6, 2], ['r4', 'مراجعة 2: ٩ − ٤', 5, 4]
  ];
  // مراجعة 4 ص 85: كل ناتج يُستبدل بحرف فيتكوّن اسم مدينة فلسطينية
  const CODE = ['ا', 'د', 'ي', 'س', 'ب', 'ن', 'ح', 'ل', 'ر', 'ق'];
  const PZ = { q: { name: 'القدس', items: [[2, '-', 2], [8, '-', 1], [5, '+', 4], [7, '-', 6], [8, '-', 5]] }, n: { name: 'نابلس', items: [[1, '+', 4], [6, '-', 6], [6, '-', 2], [5, '+', 2], [9, '-', 6]] } };
  const val = (it) => (it[1] === '+' ? it[0] + it[2] : it[0] - it[2]);
  const itTxt = (it) => L(it[0]) + ' ' + (it[1] === '+' ? '+' : '−') + ' ' + L(it[2]);
  const SENT = (d) => ({ A: [d.x, '+', d.y, d.w], B: [d.y, '+', d.x, d.w], C: [d.w, '−', d.y, d.x], D: [d.w, '−', d.x, d.y] });
  const sTxt = (s) => L(s[0]) + ' ' + s[1] + ' ' + L(s[2]) + ' = ' + L(s[3]);
  G.reg({
    id: 'fact-family', unit: U, order: 2, lesson: '4-2 و 4-3', lessonTitle: 'العلاقة بين الجمع والطرح', page: 81,
    titleAr: 'العلاقة بين الجمع والطرح', titleEn: 'Addition and Subtraction Facts', tags: 'العلاقه بين الجمع والطرح عمليتان عكسيتان جمله الجمع جملتا الطرح ورود ميسون اسم مدينه القدس نابلس',
    formula: '9 - 3 = 6,\\quad 6 + 3 = 9',
    book: 'عمليّتا الجمع والطرح عكسيتان، وجملة الطرح تقابل كل جملة جمع، وجملتا الطرح تقابلان كل جملة جمع',
    summary: 'الجمع والطرح **عمليتان عكسيتان**: إذا كان ٦ + ٣ = ٩ فإن ٩ − ٣ = ٦ و ٩ − ٦ = ٣. من كل **جملة جمع** نكتب **جملتي طرح**. وفي مراجعة الوحدة نحلّ المسائل ونستبدل كل ناتج بحرف لنركّب اسم مدينة فلسطينية.',
    vars: [['+', 'الجمع', ''], ['-', 'الطرح', '']],
    params: [
      { key: 'mode', label: '\\text{النشاط}', type: 'select', value: 'fam', options: [['fam', 'جملة جمع وجملتا طرح'], ['code', 'مراجعة 4 ص 85: أركّب اسم مدينة']] },
      { key: 'ex', label: '\\text{الأعداد}', type: 'select', value: 'rose', options: G.opts(FF.map((e) => [e[0], e[1]])), hidden: (p) => p.mode !== 'fam' },
      { key: 'pz', label: '\\text{المدينة}', type: 'select', value: 'q', options: [['q', 'الجدول الأول'], ['n', 'الجدول الثاني']], hidden: (p) => p.mode !== 'code' }
    ],
    initState() { return { gone: null, swap: false, seen: ['A'], sel: 0, vals: {} }; },
    resetOn: ['mode', 'ex', 'pz'],
    custom: true, canvasHint: 'انقر أحد اللونين لتأخذه (طرح)، وانقر مرة أخرى لترجعه (جمع)، وانقر «أبدّل» لتغيّر ترتيب الجمع. في المدينة: انقر المسألة ثم بطاقة الناتج.',
    compute(p) {
      if (p.mode === 'code') { const z = PZ[p.pz]; return { code: true, z: z, ans: z.items.map(val) }; }
      const e = FF.find((x) => x[0] === p.ex); return { e: e, x: e[2], y: e[3], w: e[2] + e[3] };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); d.hits = []; const st = d.st || { gone: null, swap: false, seen: ['A'], sel: 0, vals: {} };
      if (d.code) {
        // جدول الحروف كما في الكتاب
        const cw = Math.min(44, (W - 20) / 10); const x0 = W / 2 + 5 * cw;
        CODE.forEach((ch, i) => { const x = x0 - (i + 0.5) * cw; G.box(ctx, x - cw / 2, 8, cw, 52, c.grid); G.txt(ctx, ch, x, 22, { color: c.c1, size: 18, w: '800' }); G.txt(ctx, i, x, 46, { color: c.text, size: 16, w: '800' }); });
        const n = d.z.items.length; const bw = Math.min(110, (W - 20) / n - 6);
        d.z.items.forEach((it, i) => {
          const x = W / 2 + (n / 2 - i - 0.5) * (bw + 6); const v = st.vals[i]; const ok = v === d.ans[i]; const on = st.sel === i;
          G.box(ctx, x - bw / 2, 80, bw, 52, on ? c.c4 : c.c1, on ? 'rgba(217,119,6,.12)' : null); G.txt(ctx, itTxt(it), x, 106, { color: c.text, size: nar ? 15 : 20, w: '800' });
          G.box(ctx, x - bw / 2 + 8, 142, bw - 16, 56, v == null ? c.grid : ok ? c.c3 : c.c2); G.txt(ctx, v == null ? '' : CODE[v], x, 170, { color: ok ? c.c3 : c.c2, size: 30, w: '800' });
          if (v != null) G.txt(ctx, v, x, 212, { color: c.muted, size: 14, w: '700' });
          d.hits.push({ x: x - bw / 2, y: 80, w: bw, h: 120, s: i });
        });
        const done = d.ans.every((v, i) => st.vals[i] === v);
        G.txt(ctx, done ? 'المدينة: ' + d.z.name + ' ✔' : 'اسم المدينة: ' + d.z.items.map((_, i) => (st.vals[i] != null ? CODE[st.vals[i]] : '؟')).join(''), W / 2, 248, { color: done ? c.c3 : c.text, size: nar ? 20 : 26, w: '800' });
        G.cards(ctx, D09, 8, H - 60, W - 16, 50, c, { sel: st.vals[st.sel], good: d.ans[st.sel], hits: d.hits });
        return;
      }
      // صف الأشياء: المكوّن الأول (وردي) ثم الثاني (أزرق)، والمأخوذ مشطوب
      const n = d.w; const sw = Math.min(70, (W - 30) / Math.max(1, n)); const y = 60; const xr = W / 2 + n * sw / 2;
      for (let i = 0; i < n; i++) {
        const part = i < d.x ? 'x' : 'y'; const x = xr - (i + 0.5) * sw;
        ctx.fillStyle = part === 'x' ? 'rgba(219,39,119,.16)' : 'rgba(14,165,233,.16)'; ctx.fillRect(x - sw / 2 + 2, y - sw * 0.6, sw - 4, sw * 1.2);
        G.icon(ctx, d.e[0].indexOf('rose') === 0 ? 'tulip' : 'circle', x, y, sw * 0.85, part === 'x' ? '#db2777' : '#0ea5e9');
        if (st.gone === part) G.cross(ctx, x, y, sw * 0.85);
        d.hits.push({ x: x - sw / 2, y: y - sw * 0.6, w: sw, h: sw * 1.2, part: part });
      }
      const cur = st.gone === 'x' ? 'D' : st.gone === 'y' ? 'C' : st.swap ? 'B' : 'A'; const S = SENT(d);
      G.txt(ctx, sTxt(S[cur]), W / 2, y + sw * 0.6 + 40, { color: cur === 'A' || cur === 'B' ? c.c1 : c.c4, size: nar ? 26 : 34, w: '800' });
      G.btn(ctx, W / 2 - 60, y + sw * 0.6 + 70, 120, 40, 'أبدّل ⇄', c, { hits: d.hits, hit: { swap: true } });
      // البطاقات الأربع: ما ظهر منها يتلوّن
      const y0 = y + sw * 0.6 + 130; const cw = nar ? (W - 30) / 2 : (W - 50) / 4;
      ['A', 'B', 'C', 'D'].forEach((k, i) => { const col = nar ? i % 2 : i; const row = nar ? Math.floor(i / 2) : 0; const x = W - 10 - (col + 1) * cw - col * 10; const yy = y0 + row * 52; const seen = st.seen.indexOf(k) >= 0; G.box(ctx, x, yy, cw, 44, seen ? (k < 'C' ? c.c1 : c.c4) : c.grid, seen ? 'rgba(5,150,105,.06)' : null); G.txt(ctx, seen ? sTxt(S[k]) : (k < 'C' ? 'جملة جمع ؟' : 'جملة طرح ؟'), x + cw / 2, yy + 22, { color: seen ? c.text : c.muted, size: nar ? 15 : 18, w: '800' }); });
    },
    onPointer(type, x, y, p, st, api) {
      if (type !== 'down') return false; const h = api.hit(x, y); if (!h) return false;
      if (h.s != null) { st.sel = h.s; return true; }
      if (h.v != null) { if (p.mode === 'code') { st.vals[st.sel] = h.v; if (st.sel < 4) st.sel++; } return true; }
      if (h.swap) { st.gone = null; st.swap = !st.swap; } else if (h.part) st.gone = st.gone === h.part ? null : h.part;
      const cur = st.gone === 'x' ? 'D' : st.gone === 'y' ? 'C' : st.swap ? 'B' : 'A'; if (st.seen.indexOf(cur) < 0) st.seen.push(cur);
      return true;
    },
    live(p, d) { if (d.code) return '\\text{' + d.z.name + '}'; return d.w + ' - ' + d.y + ' = ' + d.x + ',\\quad ' + d.x + ' + ' + d.y + ' = ' + d.w; },
    results(p, d) {
      const st = d.st || { gone: null, swap: false, seen: ['A'], sel: 0, vals: {} };
      if (d.code) { const good = d.ans.filter((v, i) => st.vals[i] === v).length; return [['المسائل', d.z.items.map(itTxt).join(' ، '), false], ['النواتج', d.ans.map(L).join(' ، '), false], ['الصحيح', L(good) + ' من ٥', false, good === 5 ? 'pos' : ''], ['المدينة', good === 5 ? d.z.name : 'أكمل الحلّ', false, good === 5 ? 'pos' : '']]; }
      const S = SENT(d);
      return [['جملة الجمع', sTxt(S.A), false], ['جملتا الطرح', sTxt(S.C) + ' ، ' + sTxt(S.D), false, 'pos'], ['ظهر لك', L(st.seen.length) + ' من ٤ جمل', false, st.seen.length === 4 ? 'pos' : '']];
    },
    steps(p, d) {
      if (d.code) return ['أحلّ كل مسألة وأكتب الناتج.', 'أستبدل كل ناتج بالحرف الذي فوقه في الجدول.', 'أقرأ الحروف بالترتيب فيظهر اسم المدينة.'];
      const S = SENT(d);
      return ['الكل ' + L(d.w) + ' والمكوّنان ' + L(d.x) + ' و ' + L(d.y) + '.', 'جملة الجمع: ' + sTxt(S.A) + ' ، وأيضاً ' + sTxt(S.B) + '.', 'إذا أخذنا ' + L(d.y) + ' بقي ' + L(d.x) + ': ' + sTxt(S.C) + '.', 'وإذا أخذنا ' + L(d.x) + ' بقي ' + L(d.y) + ': ' + sTxt(S.D) + '.'];
    },
    explain() { return []; },
    learn: ['**نشاط 1 ص 81:** زرعت ميسون ٩ ورود وأهدت لأختها ليلى ٣ ، فيتبقى لديها ٦: ٩ − ٣ = ٦ ، و ٦ + ٣ = ٩.', '**أتعلّم ص 82:** عمليّتا الجمع والطرح عكسيتان، وجملة الطرح تقابل كل جملة جمع، وجملتا الطرح تقابلان كل جملة جمع.', '**نشاط 4 ص 83:** الأعداد ١ ، ٣ ، ٤: ١ + ٣ = ٤ و ٤ − ٣ = ١.', '**نشاط 5 ص 83:** عدد إذا جمعته إلى ٥ يكون الناتج ٨ (٣) ، وعدد إذا طرحته من ٧ يكون الناتج ٣ (٤).', '**مراجعة 4 ص 85:** أعتمد الجدول وأستبدل الناتج بحرف وأركّب اسم مدينة فلسطينية.'],
    challenges: [
      { q: 'اكتب جملتي الطرح للجملة ٣ + ٤ = ٧ (نشاط 2 ص 82).', hint: 'خذ الوردي مرة والأزرق مرة.', init: { mode: 'fam', ex: 'rose' }, check: (p, d) => !d.code && p.ex === 'f1' && d.st && d.st.seen.indexOf('C') >= 0 && d.st.seen.indexOf('D') >= 0 },
      { q: 'ركّب اسم المدينة من الجدول الأول (مراجعة 4 ص 85).', hint: '٢ − ٢ = ٠ ← ا.', init: { mode: 'fam' }, check: (p, d) => d.code && p.pz === 'q' && d.st && d.ans.every((v, i) => d.st.vals[i] === v), why: () => 'القدس.' },
      { q: 'ركّب اسم المدينة من الجدول الثاني.', hint: '١ + ٤ = ٥ ← ن.', init: { mode: 'fam' }, check: (p, d) => d.code && p.pz === 'n' && d.st && d.ans.every((v, i) => d.st.vals[i] === v), why: () => 'نابلس.' }
    ],
    tutor: [{ q: 'كيف أكتب جملة طرح من جملة جمع؟', k: ['اكتب', 'جمله طرح'], a: () => 'أبدأ بالناتج، وأطرح منه أحد العددين، فيبقى العدد الآخر.' }, { q: 'لماذا هما عكسيتان؟', k: ['عكسيتان', 'لماذا'], a: () => 'لأن الطرح يرجعنا إلى ما بدأنا به قبل الجمع.' }, { q: 'ما الحرف للعدد ٣؟', k: ['حرف'], a: () => 'س (والصفر ا ، والتسعة ق).' }]
  });
})(typeof window !== 'undefined' ? window : globalThis);
