/* رياضيات الأول — الوحدة الثالثة: الجمع ضمن العدد ٩ (ص 56–72) */
(function (root) {
  'use strict';
  const ML = root.ML; const G = ML.m1;
  const U = 3;
  const L = (x) => G.L(x);
  const D09 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const kind = (k) => k.split(':')[0]; const kcol = (k) => k.split(':')[1];

  /* ======================= الدرس 1: العدد صفر (ص 58–60) ======================= */
  // [المفتاح، الاسم، الشيء، العدد، الوعاء]
  const ZR = [
    ['f3', 'ص 58: الحوض الأول — الأسماك', 'fish', 3, 'tank'], ['f0', 'ص 58: الحوض الثاني — الأسماك', 'fish', 0, 'tank'],
    ['a0', 'ص 58: سلة التفاح الثانية', 'apple', 0, 'basket'], ['b0', 'ص 58: سلة الموز الأولى', 'banana', 0, 'basket'],
    ['c1', 'ص 59: القفص الأول — العصافير', 'bird', 1, 'cage'], ['c0', 'ص 59: القفص الثاني — العصافير', 'bird', 0, 'cage'],
    ['o0', 'ص 59: سلة البرتقال الأولى', 'orange', 0, 'basket'], ['k0', 'ص 59: الصورة الثانية — الأطفال', 'boy', 0, 'road'],
    ['ta', 'نشاط 3 ص 59: الصحن الأول', 'tomato', 0, 'plate'], ['tb', 'نشاط 3: الصحن الثاني', 'tomato', 3, 'plate'], ['tc', 'نشاط 3: الصحن الثالث', 'tomato', 4, 'plate'],
    ['td', 'نشاط 3: الصحن الرابع', 'tomato', 1, 'plate'], ['te', 'نشاط 3: الصحن الخامس', 'tomato', 5, 'plate']
  ];
  const vessel = function (ctx, type, x, y, w, h, c) {
    ctx.save(); ctx.lineWidth = 3;
    if (type === 'tank') { ctx.fillStyle = 'rgba(125,211,252,.35)'; ctx.strokeStyle = '#0284c7'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, 7); ctx.fill(); ctx.stroke(); }
    else if (type === 'basket') { ctx.fillStyle = 'rgba(161,98,7,.18)'; ctx.strokeStyle = '#a16207'; ctx.beginPath(); ctx.moveTo(x, y + h * 0.2); ctx.lineTo(x + w, y + h * 0.2); ctx.lineTo(x + w * 0.85, y + h); ctx.lineTo(x + w * 0.15, y + h); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    else if (type === 'cage') { ctx.strokeStyle = '#64748b'; ctx.beginPath(); ctx.arc(x + w / 2, y + h * 0.3, w / 2, Math.PI, 0); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath(); ctx.stroke(); for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(x + i * w / 6, y + h * 0.05); ctx.lineTo(x + i * w / 6, y + h); ctx.stroke(); } }
    else if (type === 'plate') { ctx.fillStyle = 'rgba(71,85,105,.25)'; ctx.strokeStyle = '#475569'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h * 0.75, w / 2, h * 0.22, 0, 0, 7); ctx.fill(); ctx.stroke(); }
    else { ctx.fillStyle = 'rgba(34,197,94,.18)'; ctx.strokeStyle = '#16a34a'; ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h); }
    ctx.restore();
  };
  G.reg({
    id: 'zero', unit: U, order: 1, lesson: '3-1', lessonTitle: 'العدد صفر (٠)', page: 58,
    titleAr: 'العدد صفر', titleEn: 'The Number Zero', tags: 'العدد صفر فارغ مغلف حبات الفاصولياء الحوض السله القفص الطماطم لا يوجد',
    formula: '3 - 3 = 0',
    book: 'عدد حبات الفاصولياء في المغلف الفارغ يساوي صفراً، ويكتب بالرموز (٠)',
    summary: 'إذا **لم يوجد** في المجموعة أي شيء فعددها **صفر**، ويُكتب **٠**. ننقر الأشياء لنخرجها واحداً واحداً، فيقلّ العدد حتى يصبح صفراً.',
    vars: [['0', 'صفر: لا يوجد شيء', '']],
    params: [{ key: 'ex', label: '\\text{الصورة}', type: 'select', value: 'f3', options: G.opts(ZR.map((e) => [e[0], e[1]])) }],
    initState() { return { taken: 0, pick: null }; },
    resetOn: ['ex'],
    custom: true, canvasHint: 'انقر أي شيء لتُخرجه من الوعاء، ثم اختر بطاقة العدد الذي بقي.',
    compute(p) { const e = ZR.find((x) => x[0] === p.ex); return { e: e, n: e[3], kind: e[2], type: e[4] }; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); d.hits = []; const st = d.st || { taken: 0, pick: null }; const now = d.n - st.taken;
      const vw = Math.min(W - 40, 360), vh = Math.min(H - 150, 230); const vx = W / 2 - vw / 2, vy = 16;
      vessel(ctx, d.type, vx, vy, vw, vh, c);
      if (now > 0) G.group(ctx, d.kind, now, vx + vw * 0.15, vy + vh * 0.22, vw * 0.7, vh * 0.6, c, { hits: d.hits, maxS: 70, tag: 'obj' });
      else G.txt(ctx, 'لا يوجد شيء', W / 2, vy + vh / 2, { color: c.muted, size: nar ? 16 : 20, w: '800' });
      // ما أُخرج يظهر صغيراً خارج الوعاء
      for (let i = 0; i < st.taken; i++) G.icon(ctx, d.kind, vx - 4 - (i % 2) * 26, vy + 20 + Math.floor(i / 2) * 28, 26);
      const ok = st.pick === now;
      G.txt(ctx, st.pick == null ? 'كم شيئاً في ' + (d.type === 'road' ? 'الصورة' : 'الوعاء') + ' الآن؟' : L(st.pick) + (ok ? (now === 0 ? '  ✔ صفر' : '  ✔') : '  ✘'), W / 2, vy + vh + 22, { color: st.pick == null ? c.text : ok ? c.c3 : c.c2, size: nar ? 16 : 20, w: '800' });
      G.cards(ctx, D09, 8, H - 62, W - 16, 52, c, { sel: st.pick, good: now, hits: d.hits });
    },
    onPointer(type, x, y, p, st, api) {
      if (type !== 'down') return false; const h = api.hit(x, y); if (!h) return false;
      if (h.tag === 'obj') { st.taken++; st.pick = null; return true; }
      if (h.v != null) { st.pick = h.v; return true; }
      return false;
    },
    live(p, d) { const st = d.st || { taken: 0, pick: null }; const now = d.n - st.taken; return d.n + ' - ' + st.taken + ' = ' + (st.pick === now ? now : '?'); },
    results(p, d) {
      const st = d.st || { taken: 0, pick: null }; const now = d.n - st.taken;
      return [['في الكتاب', L(d.n) + (d.n === 0 ? ' (صفر)' : ''), false], ['أخرجتَ', L(st.taken), false], ['بقي الآن', L(now) + (now === 0 ? ' (صفر)' : ''), false, now === 0 ? 'pos' : ''],
        ['اخترتَ', st.pick == null ? 'لم تختر بعد' : L(st.pick) + (st.pick === now ? ' ✔' : ' ✘'), false, st.pick == null ? '' : st.pick === now ? 'pos' : 'neg']];
    },
    steps(p, d) { return ['أعدّ الأشياء في الصورة: ' + (d.n ? L(d.n) + '.' : 'لا يوجد شيء.'), 'كلما أخرجتُ شيئاً يقلّ العدد واحداً.', 'إذا لم يبقَ شيء فالعدد صفر، ويُكتب ٠.']; },
    explain() { return []; },
    learn: ['**نشاط 1 ص 58:** أفتح مغلفي، وأعدّ حبّات الفاصولياء التي فيه، وأقرأ عددها.', '**أتعلّم:** عدد حبات الفاصولياء في المغلف الفارغ يساوي صفراً، ويُكتب بالرموز (٠).', '**ص 58–59:** حوض فيه ٣ أسماك وحوض فارغ، قفص فيه عصفور واحد وقفص فارغ، وسلال فارغة.', '**نشاط 3 ص 59:** أعدّ الطماطم في الصحون: ٠ ، ٣ ، ٤ ، ١ ، ٥.', '**نشاط 4 ص 60:** أكمل رسم الأشكال بما يناسب العدد (نجمة ← ٣ ، مثلثان ← ٤ ، ٣ دوائر ← ٥ …).'],
    challenges: [
      { q: 'كم سمكة في الحوض الثاني (ص 58)؟', hint: 'الحوض فارغ.', init: { ex: 'f3' }, check: (p, d) => p.ex === 'f0' && d.st && d.st.pick === 0 },
      { q: 'أخرج الأسماك الثلاث من الحوض الأول حتى يصبح العدد صفراً، ثم اختر ٠.', hint: 'انقر كل سمكة.', init: { ex: 'f0' }, check: (p, d) => p.ex === 'f3' && d.st && d.st.taken === 3 && d.st.pick === 0 },
      { q: 'كم حبة طماطم في الصحن الثالث (نشاط 3 ص 59)؟', hint: 'عُدّها واحدة واحدة.', init: { ex: 'f3' }, check: (p, d) => p.ex === 'tc' && d.st && d.st.taken === 0 && d.st.pick === 4 }
    ],
    tutor: [{ q: 'متى يكون العدد صفراً؟', k: ['صفر', 'متى'], a: () => 'عندما لا يوجد أي شيء في المجموعة.' }, { q: 'كيف أكتب الصفر؟', k: ['اكتب', 'الصفر'], a: () => 'هكذا: ٠' }, { q: 'كم بقي؟', k: ['بقي', 'كم'], a: (p, d) => L(d.n - (d.st ? d.st.taken : 0)) + '.' }]
  });

  /* ======================= الدرسان 2–3: مكوّنات الأعداد (ص 61–66) ======================= */
  const NB = { 3: ['circle', 'ص 61: مكوّنات العدد ٣'], 4: ['circle', 'ص 62: مكوّنات العدد ٤'], 5: ['square', 'ص 63: مكوّنات العدد ٥'], 6: ['tulip', 'ص 64: الأزهار — العدد ٦'], 7: ['cube', 'ص 64: المكعبات — العدد ٧'], 8: ['circle', 'ص 65: الكرات — العدد ٨'], 9: ['pear', 'ص 66: الإجاص — العدد ٩'] };
  // أشجار الكتاب: [المفتاح، الاسم، الكل، الجزء الأول، الجزء الثاني] والمجهول null
  const TR = [['t1', 'ص 63: ٤ = ٣ و ؟', 4, 3, null], ['t2', 'ص 63: ٣ = ٣ و ؟', 3, 3, null], ['t3', 'ص 66: ٨ = ٢ و ؟', 8, 2, null], ['t4', 'ص 66: ٩ = ٣ و ؟', 9, 3, null], ['t5', 'ص 66: ؟ = ٨ و ١', null, 8, 1], ['t6', 'ص 66: ٨ = ٥ و ؟', 8, 5, null]];
  G.reg({
    id: 'number-bonds', unit: U, order: 2, lesson: '3-2 – 3-3', lessonTitle: 'مكوّنات الأعداد (أولاً وثانياً)', page: 61,
    titleAr: 'مكوّنات العدد', titleEn: 'Number Bonds', tags: 'مكونات العدد مكونين متساويين متتاليين شجره ازهار مكعبات اجاص كرات بلونين',
    formula: '5 = 3 + 2',
    book: 'أكمل مكوّنات العدد ٣: ٢ و ١ ؛ أكتب مكوّنات العدد ٥: ٥ = ٥ و ٠ … ؛ مكونين متساويين ومكونين متتاليين',
    summary: 'كل عدد يمكن أن **نفكّه إلى مكوّنين** بطرق مختلفة: ٥ = ٥ و ٠ = ٤ و ١ = ٣ و ٢ … ونستطيع أن نجد **مكوّنين متساويين** (٤ = ٢ و ٢) أو **متتاليين** (٧ = ٣ و ٤).',
    vars: [['\\text{المكوّنان}', 'عددان مجموعهما العدد', '']],
    params: [
      { key: 'mode', label: '\\text{النشاط}', type: 'select', value: 'build', options: [['build', 'ألوّن بلونين وأكتب المكوّنين'], ['tree', 'أكتب العدد المناسب في الشجرة']] },
      { key: 'n', label: '\\text{العدد}', type: 'select', value: '5', options: G.opts(Object.keys(NB).map((k) => [k, NB[k][1]])), hidden: (p) => p.mode !== 'build' },
      { key: 'tr', label: '\\text{الشجرة}', type: 'select', value: 't1', options: G.opts(TR.map((e) => [e[0], e[1]])), hidden: (p) => p.mode !== 'tree' }
    ],
    initState() { return { k: 0, found: [], pick: null }; },
    resetOn: ['mode', 'n', 'tr'],
    custom: true, canvasHint: 'انقر الأشياء: ما على اليمين حتى ما نقرته يأخذ لوناً، والباقي لوناً آخر. في الشجرة اختر البطاقة المناسبة.',
    compute(p) {
      if (p.mode === 'tree') { const e = TR.find((x) => x[0] === p.tr); const w = e[2] != null ? e[2] : e[3] + e[4]; const a = e[3], b = e[4] != null ? e[4] : w - a; return { tree: true, e: e, w: w, a: a, b: b, miss: e[2] == null ? 'w' : 'b', ans: e[2] == null ? w : b }; }
      const n = Number(p.n); return { n: n, kind: NB[n][0], all: n + 1 };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); d.hits = []; const st = d.st || { k: 0, found: [], pick: null };
      if (d.tree) {
        const cx = W / 2, top = 30, r = 34; const ok = st.pick === d.ans;
        const show = (v, miss) => (miss ? (st.pick == null ? '؟' : L(st.pick)) : L(v));
        ctx.strokeStyle = c.c6; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - 10, top + r); ctx.quadraticCurveTo(cx - 70, top + r + 10, cx - 80, top + r + 50); ctx.moveTo(cx + 10, top + r); ctx.quadraticCurveTo(cx + 70, top + r + 10, cx + 80, top + r + 50); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, top, r, 0, 7); ctx.fillStyle = 'rgba(219,39,119,.1)'; ctx.fill(); ctx.strokeStyle = '#db2777'; ctx.stroke();
        G.txt(ctx, show(d.w, d.miss === 'w'), cx, top, { color: d.miss === 'w' ? (st.pick == null ? c.muted : ok ? c.c3 : c.c2) : c.text, size: 30, w: '800' });
        [[cx + 80, d.a, false], [cx - 80, d.b, d.miss === 'b']].forEach((q) => { G.box(ctx, q[0] - 36, top + r + 50, 72, 56, c.c1); G.txt(ctx, show(q[1], q[2]), q[0], top + r + 78, { color: q[2] ? (st.pick == null ? c.muted : ok ? c.c3 : c.c2) : c.text, size: 30, w: '800' }); });
        // نموذج بالأشياء: الجزء الأول ثم الثاني
        const y2 = top + r + 130; const n = d.a + (st.pick != null && d.miss === 'b' ? st.pick : d.b);
        if (n > 0 && n <= 20) { const sw = Math.min(40, (W - 40) / n); for (let i = 0; i < n; i++) G.icon(ctx, 'circle', W / 2 + n * sw / 2 - (i + 0.5) * sw, y2, sw * 0.9, i < d.a ? '#db2777' : '#0ea5e9'); }
        G.txt(ctx, st.pick == null ? 'اختر العدد المناسب' : (ok ? '✔ ' : '✘ ') + L(d.miss === 'w' ? st.pick : d.w) + ' = ' + L(d.a) + ' و ' + L(d.miss === 'b' ? st.pick : d.b), W / 2, y2 + 40, { color: st.pick == null ? c.muted : ok ? c.c3 : c.c2, size: nar ? 17 : 21, w: '800' });
        G.cards(ctx, D09, 8, H - 62, W - 16, 52, c, { sel: st.pick, good: d.ans, hits: d.hits });
        return;
      }
      const n = d.n; const sw = Math.min(84, (W - 30) / n); const y = 70; const xr = W / 2 + n * sw / 2;
      for (let i = 0; i < n; i++) {
        const x = xr - (i + 0.5) * sw; const first = i < st.k;
        ctx.fillStyle = first ? 'rgba(219,39,119,.2)' : 'rgba(14,165,233,.18)'; ctx.fillRect(x - sw / 2 + 2, y - sw * 0.55, sw - 4, sw * 1.1);
        ctx.strokeStyle = first ? '#db2777' : '#0ea5e9'; ctx.lineWidth = 2; ctx.strokeRect(x - sw / 2 + 2, y - sw * 0.55, sw - 4, sw * 1.1);
        G.icon(ctx, d.kind, x, y, sw * 0.8, d.kind === 'circle' ? (first ? '#db2777' : '#0ea5e9') : undefined);
        d.hits.push({ x: x - sw / 2, y: y - sw * 0.55, w: sw, h: sw * 1.1, i: i });
      }
      G.txt(ctx, L(n) + ' = ' + L(st.k) + ' و ' + L(n - st.k), W / 2, y + sw * 0.55 + 30, { color: c.text, size: nar ? 22 : 28, w: '800' });
      // قائمة المكوّنات كلها كما في جدول الكتاب (من ن و ٠ إلى ٠ و ن)
      const rows = n + 1; const cols = nar ? 2 : Math.min(5, rows); const cw = (W - 20) / cols; const y0 = y + sw * 0.55 + 66; const rh = Math.min(34, (H - y0 - 10) / Math.ceil(rows / cols));
      for (let a = n, j = 0; a >= 0; a--, j++) {
        const cx = W - 10 - (j % cols + 0.5) * cw, cy = y0 + Math.floor(j / cols) * rh; const got = st.found.indexOf(a) >= 0;
        G.txt(ctx, got ? L(n) + ' = ' + L(a) + ' و ' + L(n - a) : L(n) + ' = ؟ و ؟', cx, cy, { color: got ? c.c3 : c.muted, size: nar ? 14 : 17, w: '800' });
      }
    },
    onPointer(type, x, y, p, st, api) {
      if (type !== 'down') return false; const h = api.hit(x, y); if (!h) return false;
      if (h.v != null) { st.pick = h.v; return true; }
      if (h.i != null) { st.k = h.i + 1 === st.k ? h.i : h.i + 1; if (st.found.indexOf(st.k) < 0) st.found.push(st.k); return true; }
      return false;
    },
    live(p, d) { if (d.tree) { const ok = d.st && d.st.pick === d.ans; return (d.miss === 'w' && !ok ? '?' : d.w) + ' = ' + d.a + ' + ' + (d.miss === 'b' && !ok ? '?' : d.b); } const k = d.st ? d.st.k : 0; return d.n + ' = ' + k + ' + ' + (d.n - k); },
    results(p, d) {
      const st = d.st || { k: 0, found: [], pick: null };
      if (d.tree) return [['الشجرة', L(d.w) + ' = ' + L(d.a) + ' و ' + L(d.b), false], ['المطلوب', d.miss === 'w' ? 'العدد الكلي' : 'المكوّن الثاني', false], ['اخترتَ', st.pick == null ? 'لم تختر بعد' : L(st.pick) + (st.pick === d.ans ? ' ✔' : ' ✘'), false, st.pick == null ? '' : st.pick === d.ans ? 'pos' : 'neg']];
      const eq = d.n % 2 === 0 ? L(d.n / 2) + ' و ' + L(d.n / 2) : 'لا يوجد';
      return [['العدد', L(d.n), false], ['المكوّنان الآن', L(st.k) + ' و ' + L(d.n - st.k), false, 'pos'], ['وجدتَ', L(st.found.length) + ' من ' + L(d.all) + ' طرق', false, st.found.length === d.all ? 'pos' : ''],
        ['مكوّنان متساويان', eq, false], ['مكوّنان متتاليان', d.n % 2 ? L((d.n - 1) / 2) + ' و ' + L((d.n + 1) / 2) : 'لا يوجد', false]];
    },
    steps(p, d) {
      if (d.tree) return ['الكل في الدائرة، والمكوّنان في المربعين.', d.miss === 'w' ? 'نجمع المكوّنين: ' + L(d.a) + ' و ' + L(d.b) + ' معاً ' + L(d.w) + '.' : 'نعدّ من ' + L(d.a) + ' حتى ' + L(d.w) + ': المكوّن الآخر ' + L(d.b) + '.'];
      return ['نلوّن بعض الأشياء بلون والباقي بلون آخر.', 'نعدّ كل لون، فنحصل على مكوّنين للعدد ' + L(d.n) + '.', 'نغيّر الألوان لنجد كل المكوّنات: ' + L(d.all) + ' طرق.'];
    },
    explain() { return []; },
    learn: ['**ص 61:** يتحدّث الجد مع أحفاده: عدد الأشخاص = عدد الذكور و عدد الإناث.', '**نشاط 2 ص 61:** مكوّنات العدد ٣: ٢ و ١ …', '**ص 63:** ٥ = ٥ و ٠ ، ٥ = ٤ و ١ ، ٥ = ٣ و ٢ ، ٥ = ٢ و ٣ ، ٥ = ١ و ٤ ، ٥ = ٠ و ٥.', '**نشاط 7 ص 63:** مكوّنان متساويان للعددين ٤ و ٢ ، ومكوّنان متتاليان للعددين ٣ و ٥.', '**نشاط 4 ص 65:** ألوّن الكرات بلونين وأكتب مكوّنات العدد ٨: ٨ و ٠ = ٨ ، ٧ و ١ = ٨ …', '**نشاط 7 ص 66:** مكوّنان متساويان للعددين ٦ و ٨ ، ومتتاليان للعددين ٧ و ٩.'],
    challenges: [
      { q: 'اكتب مكوّنات العدد ٥ جميعها (ص 63).', hint: 'غيّر الألوان حتى تجد ٦ طرق، ومنها ٥ و ٠.', init: { mode: 'build', n: '3' }, check: (p, d) => !d.tree && d.n === 5 && d.st && [0, 1, 2, 3, 4, 5].every((k) => d.st.found.indexOf(k) >= 0) },
      { q: 'اكتب مكوّنين متساويين للعدد ٤ (نشاط 7 ص 63).', hint: 'كل لون فيه العدد نفسه.', init: { mode: 'build', n: '3' }, check: (p, d) => !d.tree && d.n === 4 && d.st && d.st.k === 2 },
      { q: 'أكمل الشجرة: ٨ = ٢ و ؟ (ص 66).', hint: 'اختر «أكتب العدد المناسب في الشجرة».', init: { mode: 'build', tr: 't1' }, check: (p, d) => d.tree && p.tr === 't3' && d.st && d.st.pick === 6 }
    ],
    tutor: [{ q: 'ما مكوّنات العدد؟', k: ['مكونات', 'ما'], a: () => 'عددان إذا جمعناهما معاً حصلنا على العدد.' }, { q: 'ما المكونان المتتاليان؟', k: ['متتاليين', 'متتاليان'], a: () => 'عددان أحدهما بعد الآخر مباشرة، مثل ٣ و ٤ للعدد ٧.' }, { q: 'كم طريقة؟', k: ['طريقه', 'كم'], a: (p, d) => (d.tree ? 'في الشجرة جواب واحد: ' + L(d.ans) + '.' : 'للعدد ' + L(d.n) + ' عدد ' + L(d.all) + ' طرق.') }]
  });

  /* ======================= الدرس 4: الجمع ضمن العدد ٩ (ص 67–72) ======================= */
  // [المفتاح، الاسم، شيء أ، أ، شيء ب، ب، المجهول: s ناتج الجمع أو b المجموع]
  const AD = [
    ['cake', 'نشاط 1 ص 67: شمعات كعكة ميس', 'candle:#3b82f6', 3, 'candle:#ef4444', 4, 's'], ['pen', 'نشاط 2 ص 67: قلمان و ٣ أقلام', 'pencil', 2, 'pencil', 3, 's'], ['duck', 'نشاط 3 ص 67: البطّات', 'duck', 4, 'duck', 2, 's'],
    ['ball', 'ص 68: الكرات', 'ball', 2, 'ball', 2, 's'], ['pear', 'ص 68: الإجاص', 'pear', 4, 'pear', 2, 's'], ['fish', 'ص 68: الأسماك', 'fish', 2, 'fish', 3, 's'], ['egg', 'ص 68: الباذنجان', 'eggplant', 6, 'eggplant', 3, 's'],
    ['orng', 'ص 68: البرتقال', 'orange', 3, 'orange', 4, 's'], ['carr', 'ص 68: الجزر (٠ + ٢)', 'carrot', 0, 'carrot', 2, 's'], ['car', 'ص 68: السيارات', 'car', 4, 'car', 4, 's'], ['strw', 'ص 68: الفراولة', 'strawberry', 5, 'strawberry', 2, 's'],
    ['v1', 'نشاط 5 ص 69: الأقلام (عمودياً)', 'pencil', 5, 'pencil', 2, 's'], ['v2', 'نشاط 5: الأسماك', 'fish', 4, 'fish', 2, 's'], ['v3', 'نشاط 5: التفاح', 'apple', 5, 'apple', 3, 's'], ['v4', 'نشاط 5: الكرات', 'ball', 5, 'ball', 4, 's'],
    ['v5', 'نشاط 5: الشمعات', 'candle:#ef4444', 3, 'candle:#ef4444', 4, 's'], ['v6', 'نشاط 5: الأقلام (٣ + ٠)', 'pencil', 3, 'pencil', 0, 's'], ['rab', 'ص 70: الأرانب ٣ + ؟ = ٤', 'rabbit', 3, 'rabbit', 1, 'b'], ['dots', 'ص 70: الدوائر', 'circle:#16a34a', 6, 'circle:#16a34a', 2, 's'],
    ['bal', 'نشاط 9 ص 71: بالونات محمد', 'balloon:#a855f7', 5, 'balloon:#f59e0b', 4, 'b'], ['umb', 'نشاط 10 ص 71: المظلّات', 'umbrella', 4, 'umbrella', 3, 's'], ['olive', 'مراجعة 4 ص 72: سلال الزيتون', 'basket', 3, 'basket', 2, 's']
  ];
  const STORY = { cake: 'أحضر والد ميس كعكة لعيد ميلادها: كم عمر ميس؟', bal: 'مع محمد ٥ بالونات ويلزمه ٩: كم بالوناً يحتاج؟', umb: 'باع صاحب المحل ٤ مظلّات صباحاً و ٣ مساءً: كم مظلّة باع؟', olive: 'ملأت سوسن ٣ سلال وسلمى سلّتين: كم سلة معاً؟', pen: 'قلمان و ٣ أقلام يساوي … أقلام.' };
  // نشاط 6 ص 70: [المفتاح، الاسم، أ، ب، جـ، د] (أ + ب ○ جـ + د)
  const CM = [['c1', 'نشاط 6 ص 70: ٣ + ٤ ○ ٧', 3, 4, 7, 0], ['c2', '٥ + ٣ ○ ٦', 5, 3, 6, 0], ['c3', '٢ + ٦ ○ ٩', 2, 6, 9, 0], ['c4', '٢ + ٣ ○ ٣ + ١', 2, 3, 3, 1], ['c5', '٥ + ٤ ○ ٢ + ٤', 5, 4, 2, 4], ['c6', '٦ + ١ ○ ٣ + ٦', 6, 1, 3, 6]];
  const cmTxt = (e) => [L(e[2]) + ' + ' + L(e[3]), e[5] ? L(e[4]) + ' + ' + L(e[5]) : L(e[4])];
  G.reg({
    id: 'add-within-9', unit: U, order: 3, lesson: '3-4 – 3-5', lessonTitle: 'الجمع ضمن العدد ٩ والمراجعة', page: 67,
    titleAr: 'الجمع ضمن العدد ٩', titleEn: 'Addition within 9', tags: 'الجمع زائد يساوي ناتج الجمع المجموع اليه المجموع شمعات ميس بالونات محمد مظلات عمودي افقي',
    formula: '4 + 2 = 6',
    book: '٢ + ٣ = ٥ وتقرأ ٣ زائد ٢ يساوي ٥ ؛ المجموع إليه + المجموع = ناتج الجمع',
    summary: 'نجمع مجموعتين بأن **نضمّهما** معاً ونعدّ الكل. نكتب **٤ + ٢ = ٦**: ٤ **المجموع إليه**، و ٢ **المجموع**، و ٦ **ناتج الجمع**. ونكتب الجمع **أفقياً** أو **عمودياً**.',
    vars: [['+', 'زائد', ''], ['=', 'يساوي', '']],
    params: [
      { key: 'mode', label: '\\text{النشاط}', type: 'select', value: 'add', options: [['add', 'أجمع المجموعتين'], ['cmp', 'أضع الإشارة (نشاط 6 ص 70)']] },
      { key: 'ex', label: '\\text{المسألة}', type: 'select', value: 'cake', options: G.opts(AD.map((e) => [e[0], e[1]])), hidden: (p) => p.mode !== 'add' },
      { key: 'vert', label: '\\text{عمودياً}', type: 'toggle', value: false, hidden: (p) => p.mode !== 'add' },
      { key: 'cx', label: '\\text{المقارنة}', type: 'select', value: 'c1', options: G.opts(CM.map((e) => [e[0], e[1]])), hidden: (p) => p.mode !== 'cmp' }
    ],
    onSet(p, key) { if (key === 'ex') p.vert = /^v/.test(p.ex); },
    initState() { return { joined: false, pick: null, sign: null }; },
    resetOn: ['mode', 'ex', 'cx'],
    custom: true, canvasHint: 'انقر المجموعتين لتضمّهما وتعدّ الكل، ثم اختر بطاقة ناتج الجمع.',
    compute(p) {
      if (p.mode === 'cmp') { const e = CM.find((x) => x[0] === p.cx); const l = e[2] + e[3], r = e[4] + e[5]; return { cmp: true, e: e, l: l, r: r, k: G.kOf(l, r) }; }
      const e = AD.find((x) => x[0] === p.ex); const a = e[3], b = e[5], s = a + b; return { e: e, a: a, b: b, s: s, miss: e[6], ans: e[6] === 'b' ? b : s, story: STORY[e[0]] || '' };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); d.hits = []; const st = d.st || { joined: false, pick: null, sign: null };
      if (d.cmp) {
        const t = cmTxt(d.e); const y = H * 0.32;
        G.txt(ctx, t[0], W * 0.74, y, { color: c.c1, size: nar ? 32 : 46, w: '800' }); G.txt(ctx, t[1], W * 0.26, y, { color: c.c5, size: nar ? 32 : 46, w: '800' });
        ctx.strokeStyle = c.c6; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(W / 2, y, 30, 0, 7); ctx.stroke();
        if (st.sign) G.txt(ctx, G.sign(G.KEY[st.sign]), W / 2, y, { color: st.sign === d.k ? c.c3 : c.c2, size: 34, w: '800' });
        if (st.sign === d.k) { G.txt(ctx, L(d.l), W * 0.74, y + 50, { color: c.c3, size: 18, w: '700' }); G.txt(ctx, L(d.r), W * 0.26, y + 50, { color: c.c3, size: 18, w: '700' }); }
        G.signBtns(ctx, W, H - 80, st.sign, d.k, c, d.hits);
        return;
      }
      const showB = d.miss !== 'b' || st.pick === d.b; const ok = st.pick === d.ans;
      const gH = Math.min(150, H * 0.34); const top = 8;
      const drawG = (k, n, x, y, w, h, tag) => { G.box(ctx, x, y, w, h, tag === 'A' ? c.c1 : c.c5, st.joined ? 'rgba(5,150,105,.06)' : null); if (n > 0) G.group(ctx, kind(k), n, x + 4, y + 4, w - 8, h - 8, c, { maxS: 60, col: kcol(k) }); d.hits.push({ x: x, y: y, w: w, h: h, tag: 'grp' }); };
      if (st.joined && showB) {
        // المجموعتان معاً مع أرقام العدّ
        const n = d.a + d.b; const x = 10, w = W - 20; G.box(ctx, x, top, w, gH, c.c3, 'rgba(5,150,105,.06)'); d.hits.push({ x: x, y: top, w: w, h: gH, tag: 'grp' });
        const Lp = G.layout(n, x + 4, top + 4, w - 8, gH - 8, 60);
        Lp.pts.forEach((pt, i) => { const kk = i < d.a ? d.e[2] : d.e[4]; G.icon(ctx, kind(kk), pt[0], pt[1], Lp.s * 0.85, kcol(kk)); G.txt(ctx, i + 1, pt[0], pt[1] - Lp.s * 0.42, { color: c.c2, size: Math.max(12, Lp.s * 0.28), w: '800', halo: c.bg }); });
      } else if (p.vert) {
        drawG(d.e[2], d.a, W * 0.3, top, W * 0.66, gH * 0.48, 'A');
        if (showB) drawG(d.e[4], d.b, W * 0.3, top + gH * 0.52, W * 0.66, gH * 0.48, 'B'); else { G.box(ctx, W * 0.3, top + gH * 0.52, W * 0.66, gH * 0.48, c.c5); G.txt(ctx, '؟', W * 0.63, top + gH * 0.76, { color: c.muted, size: 30, w: '800' }); }
      } else {
        const gw = (W - 50) / 2;
        drawG(d.e[2], d.a, W / 2 + 15, top, gw, gH, 'A');
        if (showB) drawG(d.e[4], d.b, 10, top, gw, gH, 'B'); else { G.box(ctx, 10, top, gw, gH, c.c5); G.txt(ctx, '؟', 10 + gw / 2, top + gH / 2, { color: c.muted, size: 34, w: '800' }); }
        G.txt(ctx, '+', W / 2, top + gH / 2, { color: c.text, size: 30, w: '800' });
      }
      // الجملة: أفقياً كما في الكتاب (المجموع إليه يميناً) أو عمودياً
      const ansTxt = st.pick == null ? '؟' : L(st.pick); const ansCol = st.pick == null ? c.muted : ok ? c.c3 : c.c2;
      const bTxt = d.miss === 'b' ? ansTxt : L(d.b), sTxt = d.miss === 'b' ? L(d.s) : ansTxt;
      const ey = top + gH + 46;
      if (p.vert && !st.joined) {
        const x = W * 0.14; G.txt(ctx, L(d.a), x, top + 24, { color: c.text, size: 30, w: '800' }); G.txt(ctx, bTxt, x, top + 62, { color: d.miss === 'b' ? ansCol : c.text, size: 30, w: '800' }); G.txt(ctx, '+', x + 34, top + 62, { color: c.text, size: 26, w: '800' });
        ctx.strokeStyle = c.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 30, top + 84); ctx.lineTo(x + 46, top + 84); ctx.stroke();
        G.txt(ctx, sTxt, x, top + 110, { color: d.miss === 'b' ? c.text : ansCol, size: 30, w: '800' });
      } else {
        const step = Math.min(64, W / 6.5); const xs = [W / 2 + 2 * step, W / 2 + step, W / 2, W / 2 - step, W / 2 - 2 * step];
        [[L(d.a), c.text], ['+', c.text], [bTxt, d.miss === 'b' ? ansCol : c.text], ['=', c.text], [sTxt, d.miss === 'b' ? c.text : ansCol]].forEach((q, i) => { if (i % 2 === 0) G.box(ctx, xs[i] - step * 0.4, ey - 24, step * 0.8, 48, c.c1); G.txt(ctx, q[0], xs[i], ey, { color: q[1], size: 28, w: '800' }); });
        if (!nar) { G.txt(ctx, 'المجموع إليه', xs[0], ey + 38, { color: c.muted, size: 12, w: '700' }); G.txt(ctx, 'المجموع', xs[2], ey + 38, { color: c.muted, size: 12, w: '700' }); G.txt(ctx, 'ناتج الجمع', xs[4], ey + 38, { color: c.muted, size: 12, w: '700' }); }
      }
      if (d.story) G.txt(ctx, d.story, W / 2, H - 82, { color: c.muted, size: nar ? 12 : 15, w: '700' });
      G.cards(ctx, D09, 8, H - 60, W - 16, 50, c, { sel: st.pick, good: d.ans, hits: d.hits });
    },
    onPointer(type, x, y, p, st, api) {
      if (type !== 'down') return false; const h = api.hit(x, y); if (!h) return false;
      if (h.k) { st.sign = h.k; return true; }
      if (h.v != null) { st.pick = h.v; return true; }
      if (h.tag === 'grp') { st.joined = !st.joined; return true; }
      return false;
    },
    live(p, d) {
      // الجواب لا يظهر في الصيغة قبل أن يجيب الطفل
      const st = d.st || {};
      if (d.cmp) return d.e[2] + ' + ' + d.e[3] + ' ' + (st.sign === d.k ? G.sign(G.KEY[d.k]) : '?') + ' ' + (d.e[5] ? d.e[4] + ' + ' + d.e[5] : d.e[4]);
      const ok = st.pick === d.ans; return d.a + ' + ' + (d.miss === 'b' && !ok ? '?' : d.b) + ' = ' + (d.miss === 's' && !ok ? '?' : d.s);
    },
    results(p, d) {
      const st = d.st || { joined: false, pick: null, sign: null };
      if (d.cmp) { const t = cmTxt(d.e); return [['الطرف الأول', t[0] + ' = ' + L(d.l), false], ['الطرف الثاني', t[1] + (d.e[5] ? ' = ' + L(d.r) : ''), false], ['الإشارة الصحيحة', G.SNAME[d.k], false, 'pos'], ['اخترتَ', st.sign ? G.SNAME[st.sign] + (st.sign === d.k ? ' ✔' : ' ✘') : 'لم تختر بعد', false, st.sign ? (st.sign === d.k ? 'pos' : 'neg') : '']]; }
      return [['المجموع إليه', L(d.a), false], ['المجموع', L(d.b), false], ['ناتج الجمع', L(d.s), false, 'pos'], ['اخترتَ', st.pick == null ? 'لم تختر بعد' : L(st.pick) + (st.pick === d.ans ? ' ✔' : ' ✘'), false, st.pick == null ? '' : st.pick === d.ans ? 'pos' : 'neg']];
    },
    steps(p, d) {
      if (d.cmp) { const t = cmTxt(d.e); return ['نجد ناتج كل طرف: ' + t[0] + ' = ' + L(d.l) + (d.e[5] ? ' ، ' + t[1] + ' = ' + L(d.r) : '') + '.', 'نقارن: ' + L(d.l) + ' ' + G.SNAME[d.k] + ' ' + L(d.r) + '.']; }
      if (d.miss === 'b') return ['معنا ' + L(d.a) + ' ونريد ' + L(d.s) + '.', 'نعدّ من ' + L(d.a) + ' حتى ' + L(d.s) + ': نحتاج ' + L(d.b) + '.', L(d.a) + ' + ' + L(d.b) + ' = ' + L(d.s) + '.'];
      return ['نعدّ المجموعة الأولى: ' + L(d.a) + ' ، والثانية: ' + L(d.b) + '.', 'نضمّ المجموعتين ونعدّ الكل: ' + L(d.s) + '.', 'نكتب: ' + L(d.a) + ' + ' + L(d.b) + ' = ' + L(d.s) + '.'];
    },
    explain() { return []; },
    learn: ['**نشاط 1 ص 67:** عدد الشمعات الحمراء ٤ والزرقاء ٣ ، فعددها كلها ٧ ، وعمر ميس ٧ سنوات.', '**نشاط 2:** قلمان و ٣ أقلام يساوي ٥ أقلام، وتُكتب ٢ + ٣ = ٥ وتُقرأ ٣ زائد ٢ يساوي ٥.', '**نشاط 3:** ٤ + ٢ = ٦: المجموع إليه + المجموع = ناتج الجمع.', '**نشاط 4 ص 69:** ٥ + ٢ ، ٣ + ٣ ، ٣ + ٤ ، ٢ + ٣ ، ٦ + ٢ ، ١ + ٥ ، ٣ + ٦ ، ٧ + ٠ ، ٥ + ٤.', '**نشاط 9 ص 71:** مع محمد ٥ بالونات ويلزمه ٩: يحتاج ٤ بالونات.', '**نشاط 10 ص 71:** ٤ مظلّات صباحاً و ٣ مساءً: ٧ مظلّات.'],
    challenges: [
      { q: 'كم عمر ميس؟ اجمع الشمعات (ص 67).', hint: 'الزرقاء ٣ والحمراء ٤.', init: { mode: 'add', ex: 'pen' }, check: (p, d) => !d.cmp && p.ex === 'cake' && d.st && d.st.pick === 7 },
      { q: 'كم بالوناً يحتاج محمد (نشاط 9 ص 71)؟', hint: 'عُدّ من ٥ إلى ٩.', init: { mode: 'add', ex: 'cake' }, check: (p, d) => !d.cmp && p.ex === 'bal' && d.st && d.st.pick === 4, why: () => '٥ + ٤ = ٩.' },
      { q: 'ضع الإشارة: ٥ + ٣ ○ ٦ (نشاط 6 ص 70).', hint: 'اختر «أضع الإشارة».', init: { mode: 'add', cx: 'c1' }, check: (p, d) => d.cmp && p.cx === 'c2' && d.st && d.st.sign === 'gt' }
    ],
    tutor: [{ q: 'ما المجموع إليه؟', k: ['المجموع اليه'], a: () => 'العدد الأول في جملة الجمع.' }, { q: 'كيف أجمع؟', k: ['اجمع', 'كيف'], a: () => 'أضمّ المجموعتين وأعدّ الكل، أو أبدأ من العدد الأول وأعدّ بعده.' }, { q: 'ما الجواب؟', k: ['الجواب'], a: (p, d) => (d.cmp ? G.SNAME[d.k] + '.' : L(d.ans) + '.') }]
  });
})(typeof window !== 'undefined' ? window : globalThis);
