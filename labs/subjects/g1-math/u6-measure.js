/* رياضيات الأول — الوحدة السادسة: القياس (ص 103–111) */
(function (root) {
  'use strict';
  const ML = root.ML; const G = ML.m1;
  const U = 6;
  const L = (x) => G.L(x);

  /* ======================= الدرس 1: قياس الطول (ص 105–106) ======================= */
  // أعمدة نشاط 2: [اللون، الاسم، الطول النسبي كما في الرسم]
  const BARS = [['#db2777', 'الزهري', 4], ['#facc15', 'الأصفر', 2], ['#0ea5e9', 'الأزرق', 1], ['#16a34a', 'الأخضر', 3]];
  const LQ = [
    ['tall', 'نشاط 1 ص 105: من الأطول، سمير أم سامي؟', 'pick'], ['long', 'نشاط 2: أطول الأعمدة', 'pick'], ['short', 'نشاط 2: أقصر الأعمدة', 'pick'], ['yel', 'نشاط 2: العمود الأصفر أطول من…', 'pick'],
    ['pen', 'نشاط 3: أيهما أطول، قلم الرصاص أم قلم التلوين؟', 'pick'], ['clip', 'نشاط 4: طول قلم الرصاص بعدد المشابك', 'units'], ['span', 'نشاط 6 ص 106: طول كتاب الرياضيات بالشبر', 'units']
  ];
  G.reg({
    id: 'length', unit: U, order: 1, lesson: '6-1', lessonTitle: 'قياس الطول', page: 105,
    titleAr: 'قياس الطول: أطول وأقصر', titleEn: 'Comparing and Measuring Length', tags: 'قياس الطول اطول اقصر سمير سامي اعمده قلم رصاص تلوين مشابك شبر ذراع باع قدم',
    formula: '\\text{قلم الرصاص} = 3\\ \\text{مشابك}',
    book: 'يدّعي كلٌّ من سمير وسامي أنّه أطول من الآخر … ؛ أجد طول قلم الرصاص بعدد المشابك ؛ استخدم الإنسان لقياس الطول عدة وسائل منها: الشبر، الذراع، الباع، القدم',
    summary: 'نقارن الأطوال **بالنظر** إذا وقفت الأشياء بجانب بعضها من البداية نفسها، فنقول **أطول من** و**أقصر من**. ونقيس الطول **بوحدة غير قياسية**: نكرّر المشبك أو **الشبر** دون فراغات ونعدّها.',
    vars: [['\\text{الشبر}', 'وحدة قياس من اليد', ''], ['\\text{الذراع}', 'وحدة قياس من اليد إلى المرفق', '']],
    params: [{ key: 'q', label: '\\text{السؤال}', type: 'select', value: 'tall', options: G.opts(LQ.map((e) => [e[0], e[1]])) }],
    initState() { return { pick: null, n: 0 }; },
    resetOn: ['q'],
    custom: true, canvasHint: 'انقر الجواب على الرسم. في القياس انقر لتضيف مشبكاً (أو شبراً) جديداً، وانقر آخر واحد لتحذفه.',
    compute(p) {
      const e = LQ.find((x) => x[0] === p.q);
      const ans = { tall: 'samir', long: 0, short: 2, yel: 2, pen: 'pencil', clip: 3, span: 2 }[p.q];
      return { e: e, units: e[2] === 'units', ans: ans, uname: p.q === 'clip' ? 'مشابك' : 'أشبار' };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); d.hits = []; const st = d.st || { pick: null, n: 0 }; const okp = st.pick === d.ans;
      const mark = (x, y, w, h, key) => { if (st.pick === key) { ctx.strokeStyle = okp ? c.c3 : c.c2; ctx.lineWidth = 3; ctx.strokeRect(x - 4, y - 4, w + 8, h + 8); } d.hits.push({ x: x, y: y, w: w, h: h, pk: key }); };
      const base = H - 90;
      if (p.q === 'tall') {
        [['samir', 'سمير', W * 0.62, 1.0, '#dc2626'], ['sami', 'سامي', W * 0.38, 0.72, '#16a34a']].forEach((b) => {
          const s = Math.min((base - 30) * 0.95, W * 0.34) * b[3]; const yc = base - s * 0.43; G.icon(ctx, 'boy', b[2], yc, s); ctx.fillStyle = b[4]; ctx.fillRect(b[2] - s * 0.14, yc - s * 0.1, s * 0.28, s * 0.25);
          G.txt(ctx, b[1], b[2], base + 20, { color: c.text, size: 18, w: '800' }); mark(b[2] - s * 0.3, base - s * 0.92, s * 0.6, s * 0.92, b[0]);
        });
        ctx.strokeStyle = c.grid; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(20, base + 4); ctx.lineTo(W - 20, base + 4); ctx.stroke(); ctx.setLineDash([]);
      } else if (p.q === 'long' || p.q === 'short' || p.q === 'yel') {
        const bw = Math.min(46, W / 10); const u = (base - 40) / 4.4;
        BARS.forEach((b, i) => { const x = W / 2 + (i - 1.5) * bw * 1.8 - bw / 2; const h = b[2] * u; ctx.fillStyle = b[0]; ctx.fillRect(x, base - h, bw, h); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.strokeRect(x, base - h, bw, h); mark(x, base - h, bw, h, i); });
        ctx.strokeStyle = c.text; ctx.beginPath(); ctx.moveTo(20, base); ctx.lineTo(W - 20, base); ctx.stroke();
      } else if (p.q === 'pen') {
        const x0 = W * 0.12; const lp = W * 0.66, lc = W * 0.48;
        const pencil = (y, len, col, key) => { ctx.fillStyle = col; ctx.fillRect(x0, y - 8, len - 26, 16); ctx.fillStyle = '#f5d0a9'; ctx.beginPath(); ctx.moveTo(x0 + len - 26, y - 8); ctx.lineTo(x0 + len, y); ctx.lineTo(x0 + len - 26, y + 8); ctx.fill(); ctx.fillStyle = '#f472b6'; ctx.fillRect(x0 - 12, y - 8, 12, 16); mark(x0 - 12, y - 12, len + 12, 24, key); };
        pencil(base * 0.35, lp, '#facc15', 'pencil'); pencil(base * 0.7, lc, '#60a5fa', 'crayon');
        G.txt(ctx, 'قلم الرصاص', W - 60, base * 0.35, { color: c.text, size: 15, w: '800' }); G.txt(ctx, 'قلم التلوين', W - 60, base * 0.7, { color: c.text, size: 15, w: '800' });
        ctx.strokeStyle = c.grid; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x0 - 12, 20); ctx.lineTo(x0 - 12, base); ctx.stroke(); ctx.setLineDash([]);
      } else {
        // القياس بتكرار الوحدة دون فراغات
        const clip = p.q === 'clip'; const unit = Math.min(clip ? 120 : 150, (W - 60) / (clip ? 3.6 : 2.6)); const len = d.ans * unit; const x0 = W / 2 - len / 2; const y = base * 0.38;
        if (clip) { ctx.fillStyle = '#facc15'; ctx.fillRect(x0 + 12, y - 9, len - 38, 18); ctx.fillStyle = '#f5d0a9'; ctx.beginPath(); ctx.moveTo(x0 + len - 26, y - 9); ctx.lineTo(x0 + len, y); ctx.lineTo(x0 + len - 26, y + 9); ctx.fill(); ctx.fillStyle = '#f472b6'; ctx.fillRect(x0, y - 9, 12, 18); }
        else { ctx.fillStyle = '#7c3aed'; ctx.fillRect(x0, y - 50, len, 100); G.txt(ctx, 'كتاب الرياضيات', x0 + len / 2, y, { color: '#fff', size: nar ? 15 : 20, w: '800' }); }
        const uy = clip ? y + 34 : y + 80;
        for (let i = 0; i < st.n; i++) {
          const ux = x0 + i * unit; ctx.strokeStyle = clip ? '#334155' : '#b45309'; ctx.lineWidth = clip ? 3 : 2.5;
          if (clip) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(ux + 3, uy - 10, unit - 6, 20, 10) : ctx.rect(ux + 3, uy - 10, unit - 6, 20); ctx.stroke(); ctx.beginPath(); ctx.roundRect ? ctx.roundRect(ux + 12, uy - 5, unit - 26, 10, 5) : ctx.rect(ux + 12, uy - 5, unit - 26, 10); ctx.stroke(); }
          else { ctx.fillStyle = 'rgba(252,217,182,.9)'; ctx.fillRect(ux + 2, uy - 16, unit - 4, 32); ctx.strokeRect(ux + 2, uy - 16, unit - 4, 32); G.txt(ctx, 'شبر', ux + unit / 2, uy, { color: '#7c2d12', size: 14, w: '800' }); }
        }
        d.hits.push({ x: 0, y: uy - 40, w: W, h: 80, add: true });
        const fit = st.n === d.ans;
        G.txt(ctx, L(st.n) + ' ' + d.uname + (fit ? '  ✔ الطول = ' + L(d.ans) + ' ' + d.uname : st.n > d.ans ? '  (أكثر من الطول)' : ''), W / 2, uy + 56, { color: fit ? c.c3 : c.text, size: nar ? 17 : 21, w: '800' });
        if (!clip) G.txt(ctx, G.SIMPLE + ': طول الكتاب ٢ شبر كما في مثال الجدول.', W / 2, H - 30, { color: c.muted, size: 12, w: '700' });
      }
      if (!d.units) { const qt = { tall: 'من الأطول؟ انقره.', long: 'انقر أطول الأعمدة.', short: 'انقر أقصر الأعمدة.', yel: 'العمود الأصفر أطول من أي عمود؟ انقره.', pen: 'أيهما أطول؟ انقره.' }[p.q]; G.txt(ctx, st.pick == null ? qt : okp ? 'أحسنت ✔' : 'حاول مرة أخرى ✘', W / 2, H - 40, { color: st.pick == null ? c.muted : okp ? c.c3 : c.c2, size: nar ? 16 : 20, w: '800' }); }
    },
    onPointer(type, x, y, p, st, api) {
      if (type !== 'down') return false; const h = api.hit(x, y); if (!h) return false;
      if (h.pk != null) { st.pick = h.pk; return true; }
      if (h.add) { const max = p.q === 'clip' ? 4 : 3; st.n = st.n >= max ? 0 : st.n + 1; return true; }
      return false;
    },
    live(p, d) { return d.units ? (d.st && d.st.n === d.ans ? d.ans : '?') + '\\ \\text{' + d.uname + '}' : '\\text{أطول من}'; },
    results(p, d) {
      const st = d.st || { pick: null, n: 0 };
      if (d.units) return [['الوحدة', p.q === 'clip' ? 'المشبك' : 'الشبر', false], ['الطول', L(d.ans) + ' ' + d.uname, false, 'pos'], ['وضعتَ', L(st.n) + (st.n === d.ans ? ' ✔' : ''), false, st.n === d.ans ? 'pos' : '']];
      const name = (k) => ({ samir: 'سمير', sami: 'سامي', pencil: 'قلم الرصاص', crayon: 'قلم التلوين' }[k] || (BARS[k] ? 'العمود ' + BARS[k][1] : k));
      return [['الجواب', name(d.ans), false, 'pos'], ['اخترتَ', st.pick == null ? 'لم تختر بعد' : name(st.pick) + (st.pick === d.ans ? ' ✔' : ' ✘'), false, st.pick == null ? '' : st.pick === d.ans ? 'pos' : 'neg']];
    },
    steps(p, d) { return d.units ? ['أضع الوحدة الأولى عند بداية الشيء.', 'أكرّر الوحدة دون فراغات حتى النهاية.', 'أعدّ الوحدات: ' + L(d.ans) + ' ' + d.uname + '.'] : ['أنظر إلى الأشياء وهي تبدأ من الخط نفسه.', 'الأطول ينتهي أبعد، والأقصر ينتهي أقرب.']; },
    explain() { return []; },
    learn: ['**نشاط 1 ص 105:** يدّعي كلٌّ من سمير وسامي أنّه أطول من الآخر، وقفا بجانب بعضهما: سمير أطول.', '**نشاط 4:** أجد طول قلم الرصاص بعدد المشابك: ٣ مشابك.', '**نشاط 5 ص 106:** استخدم الإنسان لقياس الطول عدة وسائل منها: الشبر، الذراع، الباع، القدم.', '**نشاط 6:** أقيس مع مجموعتي طول خمسة أشياء في غرفة الصف: كتاب الرياضيات ← شبري أو شبر طالب ← ٢.'],
    challenges: [
      { q: 'من الأطول، سمير أم سامي (ص 105)؟', hint: 'انقر الأطول.', init: { q: 'long' }, check: (p, d) => p.q === 'tall' && d.st && d.st.pick === 'samir' },
      { q: 'انقر أقصر الأعمدة (نشاط 2).', hint: 'العمود الأزرق.', init: { q: 'tall' }, check: (p, d) => p.q === 'short' && d.st && d.st.pick === 2 },
      { q: 'قِس قلم الرصاص بالمشابك (نشاط 4).', hint: 'ضع المشابك دون فراغات.', init: { q: 'tall' }, check: (p, d) => p.q === 'clip' && d.st && d.st.n === 3 }
    ],
    tutor: [{ q: 'ما الشبر؟', k: ['الشبر', 'شبر'], a: () => 'المسافة بين طرف الإبهام وطرف الخنصر واليد مفتوحة.' }, { q: 'كيف أقيس بالمشابك؟', k: ['مشابك', 'اقيس'], a: () => 'أضع المشابك متلاصقة من بداية القلم إلى نهايته وأعدّها.' }]
  });

  /* ======================= الدرس 2: قياس الزمن — أيام الأسبوع (ص 107–108) ومراجعة 3 ص 111 ======================= */
  const DAYS = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  const DCOL = ['#ef4444', '#22c55e', '#3b82f6', '#f472b6', '#38bdf8', '#db2777', '#a855f7'];
  const WQ = [['prevWed', 'ص 107 (4): اليوم السابق ليوم الأربعاء', 3], ['nextSun', '(5): اليوم التالي ليوم الأحد', 2], ['nextThu', '(6): اليوم التالي ليوم الخميس (عطلة)', 6]];
  // جدول الدروس ص 108 (الأحد – الخميس، الحصص ١ – ٦)
  const TT = [
    ['الأحد', ['رياضيات', 'رياضيات', 'عربية', 'عربية', 'إنجليزية', 'وطنية']], ['الإثنين', ['إنجليزية', 'رياضيات', 'عربية', 'عربية', 'وطنية', 'إسلامية']],
    ['الثلاثاء', ['عربية', 'عربية', 'وطنية', 'رياضيات', 'إسلامية', 'وطنية']], ['الأربعاء', ['رياضيات', 'عربية', 'عربية', 'وطنية', 'إنجليزية', '']], ['الخميس', ['رياضيات', 'عربية', 'عربية', 'إسلامية', 'وطنية', '']]
  ];
  const FULL = { 'رياضيات': 'رياضيات', 'عربية': 'اللغة العربية', 'إنجليزية': 'اللغة الإنجليزية', 'وطنية': 'تربية وطنية وحياتية', 'إسلامية': 'تربية إسلامية' };
  const SUBC = { 'رياضيات': '#fde68a', 'عربية': '#bbf7d0', 'إنجليزية': '#bfdbfe', 'وطنية': '#fecdd3', 'إسلامية': '#ddd6fe' };
  const TQ = [['math', '(5) ص 108: انقر كل حصص الرياضيات الأسبوعية', (r, k) => TT[r][1][k] === 'رياضيات'], ['arWed', '(4): حصص اللغة العربية يوم الأربعاء', (r, k) => r === 3 && TT[r][1][k] === 'عربية'], ['wed1', '(1): الحصة الأولى يوم الأربعاء', (r, k) => r === 3 && k === 0], ['wed5', '(2): الحصة الخامسة يوم الأربعاء', (r, k) => r === 3 && k === 4], ['first', '(3): أول حصة رياضيات بعد يوم السبت', (r, k) => r === 0 && k === 0]];
  const cellsOf = (f) => { const o = []; TT.forEach((row, r) => row[1].forEach((s, k) => { if (f(r, k)) o.push(r * 6 + k); })); return o; };
  G.reg({
    id: 'week-days', unit: U, order: 2, lesson: '6-2', lessonTitle: 'قياس الزمن: أيام الأسبوع وجدول الدروس', page: 107,
    titleAr: 'أيام الأسبوع وجدول الدروس', titleEn: 'Days of the Week', tags: 'ايام الاسبوع سبعه السبت الاحد الاثنين الثلاثاء الاربعاء الخميس الجمعه اليوم غدا امس جدول الدروس الحصه قطار',
    formula: '\\text{الأسبوع} = 7\\ \\text{أيام}',
    book: '«أيامُ الأسبوعِ سبعة: السبت، الأحد، الإثنين، الثلاثاء، الأربعاء، الخميس، الجمعة» ؛ هذا جدول دروس صفّي الأسبوعي',
    summary: 'الأسبوع **سبعة أيام** بالترتيب: السبت، الأحد، الإثنين، الثلاثاء، الأربعاء، الخميس، الجمعة، ثم يعود السبت. **اليوم التالي** يأتي بعده، و**اليوم السابق** قبله. ونقرأ **جدول الدروس** لنعرف حصص كل يوم.',
    vars: [['7', 'عدد أيام الأسبوع', '']],
    params: [
      { key: 'mode', label: '\\text{النشاط}', type: 'select', value: 'wheel', options: [['wheel', 'نشاط 1 ص 107: عجلة أيام الأسبوع'], ['today', 'اليوم وغداً وأمس'], ['train', 'مراجعة 3 ص 111: قطار الأيام'], ['table', 'نشاط 2 ص 108: جدول الدروس']] },
      { key: 'wq', label: '\\text{السؤال}', type: 'select', value: 'prevWed', options: G.opts(WQ.map((e) => [e[0], e[1]])), hidden: (p) => p.mode !== 'wheel' },
      { key: 'tq', label: '\\text{السؤال}', type: 'select', value: 'math', options: G.opts(TQ.map((e) => [e[0], e[1]])), hidden: (p) => p.mode !== 'table' }
    ],
    initState() { return { pick: null, sel: 1, vals: {}, cells: [] }; },
    resetOn: ['mode', 'wq', 'tq'],
    custom: true, canvasHint: 'انقر اليوم على العجلة. في القطار انقر العربة ثم اسم اليوم. في الجدول انقر الحصص المطلوبة.',
    compute(p) {
      if (p.mode === 'table') { const q = TQ.find((x) => x[0] === p.tq); return { mode: 'table', q: q, good: cellsOf(q[2]) }; }
      if (p.mode === 'train') return { mode: 'train', given: [0, 3, 6] };
      if (p.mode === 'today') return { mode: 'today' };
      const q = WQ.find((x) => x[0] === p.wq); return { mode: 'wheel', q: q, ans: q[2] };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); d.hits = []; const st = d.st || { pick: null, sel: 1, vals: {}, cells: [] };
      if (d.mode === 'wheel' || d.mode === 'today') {
        const cx = W / 2, cy = (H - 70) / 2 + 6, R = Math.min(W * 0.42, (H - 90) / 2), r0 = R * 0.38;
        DAYS.forEach((dn, i) => {
          const a1 = -Math.PI / 2 + Math.PI / 7 - i * 2 * Math.PI / 7, a0 = a1 - 2 * Math.PI / 7; const on = st.pick === i; // السبت أعلى ثم عكس عقارب الساعة كما في عجلة الكتاب
          const role = d.mode === 'today' && st.pick != null ? (i === st.pick ? 'اليوم' : i === (st.pick + 1) % 7 ? 'غداً' : i === (st.pick + 6) % 7 ? 'أمس' : '') : '';
          ctx.beginPath(); ctx.arc(cx, cy, R, a0, a1); ctx.arc(cx, cy, r0, a1, a0, true); ctx.closePath(); ctx.fillStyle = DCOL[i]; ctx.globalAlpha = on || role ? 1 : 0.75; ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
          const am = (a0 + a1) / 2; const tx = cx + Math.cos(am) * (R + r0) / 2, ty = cy + Math.sin(am) * (R + r0) / 2;
          G.txt(ctx, dn, tx, ty - (role ? 8 : 0), { color: '#fff', size: nar ? 12 : 16, w: '800', halo: 'rgba(0,0,0,.35)' }); if (role) G.txt(ctx, role, tx, ty + 12, { color: '#fff', size: nar ? 11 : 14, w: '800', halo: 'rgba(0,0,0,.35)' });
          if (on && d.mode === 'wheel') { ctx.beginPath(); ctx.arc(cx, cy, R + 4, a0, a1); ctx.strokeStyle = st.pick === d.ans ? c.c3 : c.c2; ctx.lineWidth = 6; ctx.stroke(); }
          d.hits.push({ cx: tx, cy: ty, r: (R - r0) * 0.55, day: i });
        });
        G.txt(ctx, '٧', cx, cy, { color: c.text, size: r0 * 0.9, w: '800' });
        const msg = d.mode === 'today' ? (st.pick == null ? 'انقر يوماً ليكون «اليوم»' : 'اليوم ' + DAYS[st.pick] + ' ، وغداً ' + DAYS[(st.pick + 1) % 7] + ' ، وأمس ' + DAYS[(st.pick + 6) % 7]) : (st.pick == null ? d.q[1].replace(/^[^:]*: /, '') + '؟' : DAYS[st.pick] + (st.pick === d.ans ? ' ✔' : ' ✘'));
        G.txt(ctx, msg, W / 2, H - 30, { color: d.mode === 'wheel' && st.pick != null ? (st.pick === d.ans ? c.c3 : c.c2) : c.text, size: nar ? 14 : 19, w: '800' });
        return;
      }
      if (d.mode === 'train') {
        const n = 7; const ww = Math.min(110, (W - 20) / n - 4); const y = 40;
        for (let i = 0; i < n; i++) {
          const x = W - 10 - (i + 1) * (ww + 4); const giv = d.given.indexOf(i) >= 0; const v = giv ? i : st.vals[i]; const ok = v === i; const on = st.sel === i && !giv;
          ctx.fillStyle = DCOL[i]; ctx.fillRect(x, y, ww, 10); G.box(ctx, x, y + 12, ww, 60, on ? c.c4 : c.grid, on ? 'rgba(217,119,6,.12)' : null);
          if (v != null) G.txt(ctx, DAYS[v], x + ww / 2, y + 42, { color: giv ? c.text : ok ? c.c3 : c.c2, size: nar ? 11 : 16, w: '800' });
          ctx.fillStyle = '#475569'; ctx.fillRect(x + 4, y + 74, ww - 8, 8); [0.28, 0.72].forEach((f) => { ctx.beginPath(); ctx.arc(x + ww * f, y + 90, Math.min(9, ww * 0.1), 0, 7); ctx.fill(); });
          if (!giv) d.hits.push({ x: x, y: y, w: ww, h: 72, wag: i });
        }
        const done = [1, 2, 4, 5].every((i) => st.vals[i] === i);
        G.txt(ctx, done ? 'أحسنت! أيام الأسبوع بالترتيب ✔' : 'انقر عربة فارغة ثم اسم اليوم', W / 2, y + 128, { color: done ? c.c3 : c.muted, size: nar ? 15 : 19, w: '800' });
        const cols = nar ? 4 : 7; const bw = (W - 20) / cols - 6;
        DAYS.forEach((dn, i) => { const col = i % cols, row = Math.floor(i / cols); G.btn(ctx, W - 10 - (col + 1) * (bw + 6), H - 110 + row * 50, bw, 42, dn, c, { hits: d.hits, hit: { dname: i }, size: nar ? 13 : 16 }); });
        return;
      }
      // جدول الدروس
      const hw = nar ? 56 : 80; const cw = (W - 20 - hw) / 6; const rh = Math.min(48, (H - 90) / 6); const x0 = W - 10 - hw; const y0 = 10;
      for (let k = 0; k < 6; k++) { G.txt(ctx, 'الحصة ' + L(k + 1), x0 - (k + 0.5) * cw, y0 + rh / 2, { color: c.text, size: nar ? 10 : 14, w: '800' }); }
      TT.forEach((row, r) => {
        const y = y0 + (r + 1) * rh; ctx.fillStyle = '#fed7aa'; ctx.fillRect(x0, y, hw, rh - 2); G.txt(ctx, row[0], x0 + hw / 2, y + rh / 2, { color: '#7c2d12', size: nar ? 11 : 15, w: '800' });
        row[1].forEach((s, k) => {
          const x = x0 - (k + 1) * cw; const id = r * 6 + k; const on = st.cells.indexOf(id) >= 0; const good = d.good.indexOf(id) >= 0;
          ctx.fillStyle = s ? SUBC[s] : 'rgba(148,163,184,.15)'; ctx.fillRect(x + 1, y, cw - 2, rh - 2);
          if (on) { ctx.strokeStyle = good ? c.c3 : c.c2; ctx.lineWidth = 3; ctx.strokeRect(x + 2, y + 1, cw - 4, rh - 4); }
          G.txt(ctx, s || '—', x + cw / 2, y + rh / 2, { color: '#1f2937', size: nar ? 10 : 14, w: '800' });
          if (s) d.hits.push({ x: x, y: y, w: cw, h: rh, cell: id });
        });
      });
      const allOk = d.good.every((i) => st.cells.indexOf(i) >= 0) && st.cells.every((i) => d.good.indexOf(i) >= 0);
      G.txt(ctx, allOk ? 'أحسنت ✔ ' + (p.tq === 'math' ? 'عدد حصص الرياضيات ' + L(d.good.length) : FULL[TT[Math.floor(d.good[0] / 6)][1][d.good[0] % 6]]) : 'انقر الحصص المطلوبة (' + L(st.cells.length) + ')', W / 2, y0 + 6 * rh + 30, { color: allOk ? c.c3 : c.muted, size: nar ? 14 : 18, w: '800' });
    },
    onPointer(type, x, y, p, st, api) {
      if (type !== 'down') return false; const h = api.hit(x, y); if (!h) return false;
      if (h.day != null) { st.pick = h.day; return true; }
      if (h.wag != null) { st.sel = h.wag; return true; }
      if (h.dname != null) { st.vals[st.sel] = h.dname; const nx = [1, 2, 4, 5].find((i) => st.vals[i] !== i && i !== st.sel); if (nx != null) st.sel = nx; return true; }
      if (h.cell != null) { const k = st.cells.indexOf(h.cell); if (k >= 0) st.cells.splice(k, 1); else st.cells.push(h.cell); return true; }
      return false;
    },
    live(p, d) { return d.mode === 'table' ? '\\text{جدول الدروس}' : '\\text{الأسبوع} = 7\\ \\text{أيام}'; },
    results(p, d) {
      const st = d.st || { pick: null, sel: 1, vals: {}, cells: [] };
      if (d.mode === 'table') { const ok = d.good.every((i) => st.cells.indexOf(i) >= 0) && st.cells.length === d.good.length; return [['السؤال', d.q[1].replace(/^[^:]*: /, ''), false], ['الجواب', p.tq === 'math' ? L(d.good.length) + ' حصص' : d.good.map((i) => FULL[TT[Math.floor(i / 6)][1][i % 6]] + ' (' + TT[Math.floor(i / 6)][0] + '، الحصة ' + L(i % 6 + 1) + ')').join(' ، '), false, 'pos'], ['اخترتَ', L(st.cells.length) + (ok ? ' ✔' : ''), false, ok ? 'pos' : '']]; }
      if (d.mode === 'train') { const good = [1, 2, 4, 5].filter((i) => st.vals[i] === i).length; return [['المعطى', 'السبت ، الثلاثاء ، الجمعة', false], ['الناقص', 'الأحد ، الإثنين ، الأربعاء ، الخميس', false], ['الصحيح', L(good) + ' من ٤', false, good === 4 ? 'pos' : '']]; }
      if (d.mode === 'today') return [['اليوم', st.pick == null ? 'لم تختر' : DAYS[st.pick], false], ['غداً', st.pick == null ? '—' : DAYS[(st.pick + 1) % 7], false, 'pos'], ['أمس', st.pick == null ? '—' : DAYS[(st.pick + 6) % 7], false, 'pos']];
      return [['أيام الأسبوع', '٧', false], ['الجواب', DAYS[d.ans], false, 'pos'], ['اخترتَ', st.pick == null ? 'لم تختر بعد' : DAYS[st.pick] + (st.pick === d.ans ? ' ✔' : ' ✘'), false, st.pick == null ? '' : st.pick === d.ans ? 'pos' : 'neg']];
    },
    steps(p, d) {
      if (d.mode === 'table') return ['أجد صف اليوم في الجدول.', 'أنتقل إلى عمود الحصة المطلوبة وأقرأ اسم المادة.'];
      return ['أردّد أيام الأسبوع بالترتيب: ' + DAYS.join('، ') + '.', 'اليوم التالي هو الذي بعده، والسابق هو الذي قبله.', 'بعد الجمعة يعود السبت.'];
    },
    explain() { return []; },
    learn: ['**نشاط 1 ص 107:** أيام الأسبوع سبعة: السبت، الأحد، الإثنين، الثلاثاء، الأربعاء، الخميس، الجمعة.', '**أسئلة شفوية:** اليوم السابق ليوم الأربعاء هو الثلاثاء، والتالي ليوم الأحد هو الإثنين، والتالي ليوم الخميس هو الجمعة وهو يوم عطلة.', '**نشاط 2 ص 108:** جدول دروس صفّي الأسبوعي: الحصة الأولى يوم الأربعاء رياضيات، والخامسة اللغة الإنجليزية، وعدد حصص الرياضيات الأسبوعية ٦.', '**مراجعة 3 ص 111:** أكمل أيام الأسبوع في عربات القطار.'],
    challenges: [
      { q: 'ما اليوم السابق ليوم الأربعاء؟ انقره.', hint: 'قبله مباشرة.', init: { mode: 'wheel', wq: 'nextSun' }, check: (p, d) => d.mode === 'wheel' && p.wq === 'prevWed' && d.st && d.st.pick === 3 },
      { q: 'أكمل أيام الأسبوع في القطار (مراجعة 3 ص 111).', hint: 'بعد السبت يأتي الأحد.', init: { mode: 'wheel' }, check: (p, d) => d.mode === 'train' && d.st && [1, 2, 4, 5].every((i) => d.st.vals[i] === i) },
      { q: 'انقر كل حصص الرياضيات في الجدول (ص 108). كم عددها؟', hint: 'ابحث في كل الأيام.', init: { mode: 'wheel' }, check: (p, d) => d.mode === 'table' && p.tq === 'math' && d.st && d.good.every((i) => d.st.cells.indexOf(i) >= 0) && d.st.cells.length === d.good.length, why: () => '٦ حصص.' }
    ],
    tutor: [{ q: 'كم يوماً في الأسبوع؟', k: ['كم يوم', 'الاسبوع'], a: () => 'سبعة أيام.' }, { q: 'ما يوم العطلة؟', k: ['عطله'], a: () => 'الجمعة (والسبت عطلة في كثير من المدارس).' }, { q: 'ما اليوم التالي للجمعة؟', k: ['الجمعه'], a: () => 'السبت.' }]
  });

  /* ======================= قراءة الساعة الكاملة (ص 109–111) ======================= */
  const RD = [['r1', 'نشاط 6 ص 110: الساعة الأولى', 3, '#ef4444'], ['r2', 'نشاط 6: الساعة الثانية', 1, '#22c55e'], ['r3', 'نشاط 6: الساعة الثالثة', 10, '#0e7490'], ['r4', 'نشاط 6: الساعة الرابعة', 9, '#7e22ce'],
    ['r5', 'نشاط 6: الساعة الخامسة', 7, '#f97316'], ['r6', 'نشاط 6: الساعة السادسة', 4, '#7e22ce'], ['r7', 'نشاط 6: الساعة السابعة', 2, '#f97316'], ['r8', 'نشاط 6: الساعة الثامنة', 12, '#0e7490'],
    ['m1', 'مراجعة 1 ص 111: الساعة الأولى', 11, '#22c55e'], ['m2', 'مراجعة 1: الساعة الثانية', 9, '#7e22ce'], ['m3', 'مراجعة 1: الساعة الثالثة', 7, '#f97316'], ['m4', 'مراجعة 1: الساعة الرابعة', 5, '#0e7490']];
  const ST = [['wake', 'نشاط 3 ص 109: أصحو من نومي حوالي الساعة', 6], ['eat', 'نشاط 3: أستعد للذهاب للمدرسة وأتناول الإفطار', 7], ['class', 'نشاط 3: في الثامنة صباحاً تبدأ الحصة الأولى', 8], ['rest', 'نشاط 3: الاستراحة حوالي الساعة العاشرة', 10], ['home', 'نشاط 3: أعود إلى البيت حوالي الساعة الواحدة', 1],
    ['b10', 'نشاط 4 ص 109: الساعة التي تسبق ١٠ صباحاً', 9], ['a10', 'نشاط 4: الساعة التي تلي ١٠ صباحاً', 11], ['a12', 'نشاط 4: الساعة التي تلي ١٢ ظهراً', 1], ['b12', 'نشاط 4: الساعة التي تسبق ١٢ ظهراً', 11],
    ['d7', 'نشاط 7 ص 110: أرسم عقربي الساعة ٧', 7], ['d12', 'نشاط 7: الساعة ١٢', 12], ['d4', 'نشاط 7: الساعة ٤', 4], ['e12', 'مراجعة 2 ص 111: الساعة ١٢', 12], ['e8', 'مراجعة 2: الساعة ٨', 8], ['e4', 'مراجعة 2: الساعة ٤', 4], ['e10', 'مراجعة 2: الساعة ١٠', 10]];
  const H12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  G.reg({
    id: 'clock-hours', unit: U, order: 3, lesson: '6-2 – 6-3', lessonTitle: 'قراءة الساعة الكاملة والمراجعة', page: 109,
    titleAr: 'أقرأ الساعة', titleEn: 'Telling Time to the Hour', tags: 'الساعه عقرب الساعات عقرب الدقائق راس الساعه اصحو المدرسه الاستراحه تسبق تلي',
    formula: '\\text{الساعة}\\ 8',
    book: 'أصحو من نومي حوالي الساعة السادسة … في الثامنة صباحاً أكون في صفي ؛ أقرأ الساعة في كل مما يلي ؛ أرسم عقربي الساعة لتمثيل الوقت المحدد',
    summary: 'في **رأس الساعة** يقف **العقرب الكبير** على ١٢ ، و**العقرب الصغير** يشير إلى **عدد الساعات**. فإذا كان العقرب الصغير على ٨ فالساعة **الثامنة**. والساعة التي **تسبق** ١٠ هي ٩ ، والتي **تلي** ١٠ هي ١١.',
    vars: [['\\text{العقرب الصغير}', 'يشير إلى الساعة', ''], ['\\text{العقرب الكبير}', 'على ١٢ في رأس الساعة', '']],
    params: [
      { key: 'mode', label: '\\text{النشاط}', type: 'select', value: 'read', options: [['read', 'أقرأ الساعة'], ['set', 'أرسم العقرب الصغير']] },
      { key: 'rd', label: '\\text{الساعة}', type: 'select', value: 'r1', options: G.opts(RD.map((e) => [e[0], e[1]])), hidden: (p) => p.mode !== 'read' },
      { key: 'sd', label: '\\text{الوقت}', type: 'select', value: 'wake', options: G.opts(ST.map((e) => [e[0], e[1]])), hidden: (p) => p.mode !== 'set' }
    ],
    initState() { return { pick: null, hour: null }; },
    resetOn: ['mode', 'rd', 'sd'],
    custom: true, canvasHint: 'اقرأ الساعة واختر البطاقة. في «أرسم» انقر العدد على وجه الساعة ليتّجه إليه العقرب الصغير.',
    compute(p) { if (p.mode === 'set') { const e = ST.find((x) => x[0] === p.sd); return { set: true, e: e, ans: e[2] }; } const e = RD.find((x) => x[0] === p.rd); return { e: e, ans: e[2] }; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); d.hits = []; const st = d.st || { pick: null, hour: null };
      const r = Math.min(W * 0.36, (H - 150) / 2.3); const cx = W / 2, cy = 20 + r * 1.12;
      if (d.set) {
        const hits = []; G.clock(ctx, cx, cy, r, st.hour, c, { hits: hits, ring: '#f97316', hl: st.hour }); hits.forEach((h) => d.hits.push(h));
        const ok = st.hour === d.ans;
        G.txt(ctx, d.e[1].replace(/^[^:]*: /, '') + (st.hour == null ? '' : ok ? '  ✔' : '  ✘'), W / 2, H - 40, { color: st.hour == null ? c.text : ok ? c.c3 : c.c2, size: nar ? 14 : 19, w: '800' });
        return;
      }
      G.clock(ctx, cx, cy, r, d.ans, c, { ring: d.e[3], hand: d.e[3] === '#22c55e' ? '#15803d' : d.e[3] });
      G.txt(ctx, st.pick == null ? 'كم الساعة؟' : 'الساعة ' + L(st.pick) + (st.pick === d.ans ? '  ✔' : '  ✘'), W / 2, H - 82, { color: st.pick == null ? c.text : st.pick === d.ans ? c.c3 : c.c2, size: nar ? 17 : 21, w: '800' });
      G.cards(ctx, H12, 6, H - 58, W - 12, 48, c, { sel: st.pick, good: d.ans, hits: d.hits });
    },
    onPointer(type, x, y, p, st, api) {
      if (type !== 'down') return false; const h = api.hit(x, y); if (!h) return false;
      if (h.hour != null) { st.hour = h.hour; return true; }
      if (h.v != null) { st.pick = h.v; return true; }
      return false;
    },
    live(p, d) { const st = d.st || {}; return '\\text{الساعة}\\ ' + ((d.set ? st.hour : st.pick) === d.ans ? d.ans : '?'); },
    results(p, d) {
      const st = d.st || { pick: null, hour: null }; const got = d.set ? st.hour : st.pick;
      return [['الوقت', 'الساعة ' + L(d.ans), false, 'pos'], ['العقرب الكبير', 'على ١٢', false], ['العقرب الصغير', 'على ' + L(d.ans), false], [d.set ? 'رسمتَ' : 'اخترتَ', got == null ? 'لم تختر بعد' : L(got) + (got === d.ans ? ' ✔' : ' ✘'), false, got == null ? '' : got === d.ans ? 'pos' : 'neg']];
    },
    steps(p, d) { return ['أتأكد أن العقرب الكبير على ١٢ (رأس الساعة).', 'أنظر إلى العدد الذي يشير إليه العقرب الصغير: ' + L(d.ans) + '.', 'أقرأ: الساعة ' + L(d.ans) + '.']; },
    explain() { return []; },
    learn: ['**نشاط 3 ص 109:** أصحو حوالي الساعة السادسة، وأتناول الإفطار في السابعة، وفي الثامنة تبدأ الحصة الأولى، والاستراحة حوالي العاشرة، وأعود إلى البيت حوالي الواحدة.', '**نشاط 4:** الساعة التي تسبق ١٠ صباحاً هي ٩ ، والتي تلي ١٠ هي ١١ ، والتي تلي ١٢ ظهراً هي ١ ، والتي تسبق ١٢ هي ١١.', '**نشاط 6 ص 110:** أقرأ الساعة: ٣ ، ١ ، ١٠ ، ٩ ، ٧ ، ٤ ، ٢ ، ١٢.', '**مراجعة 1 ص 111:** ١١ ، ٩ ، ٧ ، ٥.'],
    challenges: [
      { q: 'اقرأ الساعة الأولى في نشاط 6 ص 110.', hint: 'العقرب الصغير على ٣.', init: { mode: 'read', rd: 'r2' }, check: (p, d) => !d.set && p.rd === 'r1' && d.st && d.st.pick === 3 },
      { q: 'أرسم العقرب الصغير للساعة التي أصحو فيها (ص 109).', hint: 'السادسة.', init: { mode: 'read' }, check: (p, d) => d.set && p.sd === 'wake' && d.st && d.st.hour === 6 },
      { q: 'الساعة التي تلي ١٢ ظهراً (نشاط 4).', hint: 'بعد ١٢ يأتي ١.', init: { mode: 'read' }, check: (p, d) => d.set && p.sd === 'a12' && d.st && d.st.hour === 1 }
    ],
    tutor: [{ q: 'أين يقف العقرب الكبير؟', k: ['الكبير'], a: () => 'على ١٢ في رأس الساعة.' }, { q: 'ماذا يبيّن العقرب الصغير؟', k: ['الصغير'], a: () => 'عدد الساعات.' }, { q: 'كم الساعة؟', k: ['كم الساعه'], a: (p, d) => 'الساعة ' + L(d.ans) + '.' }]
  });
})(typeof window !== 'undefined' ? window : globalThis);
