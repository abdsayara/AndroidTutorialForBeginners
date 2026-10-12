/* العلوم الحياتية — الوحدة الثانية، الفصل الثاني: الانقسام المنصف وتكوين الغاميتات (ص 43–52) */
(function (root) {
  'use strict';
  const ML = root.ML; const B = ML.bio; const D = ML.pdraw;
  const S = 'g10-bio'; const U = 5;
  const reg = (o) => ML.register(Object.assign({ subject: S, unit: U, custom: true }, o));
  const narrow = (W) => W < 640;
  const MOM = '#dc2626', DAD = '#2563eb';
  const n2Of = (p) => { const x = ML.parseNum(p.n2); return B.validate2n(x) || x > 60 ? null : x; };

  // كروموسوم بكروماتيدات (كل كروماتيد قائمة ألوان لمقاطعه من الأعلى إلى الأسفل)
  function chrom(ctx, x, y, L, chromatids, w) {
    const k = chromatids.length; ctx.lineCap = 'round';
    chromatids.forEach((segs, i) => {
      const dx = k === 1 ? 0 : (i - 0.5) * (w + 1.5); const n = segs.length;
      segs.forEach((col, j) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x + dx, y - L / 2 + L * j / n); ctx.lineTo(x + dx, y - L / 2 + L * (j + 1) / n); ctx.stroke(); });
    });
    if (k === 2) { ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(x, y, Math.max(2, w * 0.55), 0, 7); ctx.fill(); }
  }
  // كروماتيدات زوج متناظر بعد العبور (nx عمليات عبور بين الكروماتيدين غير الشقيقين A2 و B1)
  function tetrad(nx) {
    const segs = nx + 1; const A1 = [], A2 = [], B1 = [], B2 = [];
    for (let j = 0; j < segs; j++) { A1.push(MOM); B2.push(DAD); A2.push(j % 2 ? DAD : MOM); B1.push(j % 2 ? MOM : DAD); }
    return { A: [A1, A2], B: [B1, B2] };
  }

  /* ======================= 2-1 مراحل الانقسام المنصف + العبور ======================= */
  reg({
    id: 'meiosis', order: 1, lesson: '2-1 / 3-1', lessonTitle: 'مراحل الانقسام المنصف وظاهرة العبور', page: 44,
    titleAr: 'الانقسام المنصف: المرحلتان الأولى والثانية وظاهرة العبور', titleEn: 'Meiosis I & II with Crossing-over', tags: 'انقسام منصف اختزالي رباعي tetrad عبور كيازما تمهيدي اول استوائي انفصالي نهائي كروموسومات متناظرة',
    formula: '\\text{2n} \\to \\text{n} + \\text{n} \\to \\text{n} + \\text{n} + \\text{n} + \\text{n}',
    book: 'المرحلة الأولى (ص 44–45): التمهيدي الأول (الرباعيات والعبور)، الاستوائي الأول، الانفصالي الأول (تتباعد الكروموسومات المتناظرة)، النهائي الأول (خليتان في كل منهما نصف العدد). المرحلة الثانية (ص 46) تشبه الانقسام المتساوي. العبور (ص 47): بين الكروماتيدات غير الشقيقة في منطقة الكيازما، من عملية عبور واحدة إلى ثلاث على الكروموسوم الواحد.',
    summary: 'يحدث الانقسام المنصف في الخلايا الجنسية: خلية (2n) تنقسم مرتين لتعطي أربع خلايا في كل منها (n). في الدور التمهيدي الأول تشكل الكروموسومات المتناظرة رباعيات ويحدث العبور فتنتج كروموسومات بتراكيب جديدة.',
    vars: [['\\text{2n}', 'العدد الكروموسومي في الخلية الأم', '\\text{كروموسوم}', 'زوجي موجب (حتى 60 للعرض)'], ['\\text{n}', 'العدد في كل خلية ناتجة = 2n ÷ 2', '\\text{كروموسوم}', 'من الحساب'], ['\\text{عدد عمليات العبور}', 'على الكروموسوم الواحد (ص 47)', '\\text{عملية}', '0 – 3']],
    assumptions: ['الأحمر: كروموسومات من الأم، والأزرق: من الأب (كما في الشكل 6). الأطوال تميّز الأزواج؛ الرسم نموذج مبسّط لأغراض التعليم.', 'يُرسم العبور بين الكروماتيدين غير الشقيقين الداخليين في كل رباعي.'],
    params: [
      { key: 's', label: '\\text{الدور}', type: 'stage', stages: B.MEIOSIS, value: 0 },
      Object.assign({}, B.n2Param(4)),
      { key: 'nx', label: '\\text{عمليات العبور لكل زوج}', min: 0, max: 3, step: 1, int: true, value: 1, desc: '0 = دون عبور' }
    ],
    play: { mode: 'stage', key: 's', interval: 2.2 }, initState: () => ({ t: 0 }), tick(st, p, d, dt) { st.t += dt; },
    randomize() { const v = [4, 6, 8]; return { n2: String(v[Math.floor(Math.random() * v.length)]), nx: Math.floor(Math.random() * 4), s: Math.floor(Math.random() * 9) }; },
    canvasHint: 'الأحمر من الأم والأزرق من الأب. غيّر عدد عمليات العبور ولاحظ تراكيب الكروموسومات في الخلايا الأربع الناتجة.',
    compute(p) {
      const n2 = n2Of(p); if (!n2) return { err: B.validate2n(ML.parseNum(p.n2)) || 'للعرض الواضح اختر عدداً حتى 60.' };
      const n = n2 / 2; const cnt = B.meiosisCounts(n2)[p.s];
      return { n2: n2, n: n, cnt: cnt, tet: tetrad(p.nx), crossTotal: p.nx * n, kinds: p.nx > 0 ? 4 : 2 };
    },
    drawCustom(ctx, W, H, p, d, c) {
      if (d.err) { B.para(ctx, D, d.err, W / 2, H / 2, W - 40, { color: c.c2, size: 14 }); return; }
      const nar = narrow(W); const s = p.s; const n = d.n; const T = d.tet;
      const top = 34, bot = H - 30; const cy = (top + bot) / 2; const Lmax = Math.min(54, (bot - top) / (n + 1) * 1.6, 380 / Math.sqrt(n * 4));
      const Lk = (k) => Lmax * (1 - 0.45 * k / Math.max(1, n - 1));
      const w = Math.max(2.5, Math.min(6, Lmax * 0.13));
      D.txt(ctx, (s + 1) + '. ' + B.MEIOSIS[s], W / 2, 16, { color: c.c5, size: nar ? 13 : 16, w: '800' });
      const cell = (x, y, rx, ry) => { B.blob(ctx, x, y, rx, ry, 'rgba(254,226,226,.85)', '#b91c1c', 2.5); };
      const poles = (x, y, rx) => { [-1, 1].forEach((sg) => { ctx.fillStyle = '#111827'; ctx.fillRect(x + sg * rx * 0.85 - 5, y - 2, 10, 4); ctx.fillRect(x + sg * rx * 0.85 - 2, y - 5, 4, 10); }); };
      const fibres = (x, y, rx, pts) => { ctx.strokeStyle = 'rgba(100,116,139,.45)'; ctx.lineWidth = 1; pts.forEach((q) => { [-1, 1].forEach((sg) => { ctx.beginPath(); ctx.moveTo(x + sg * rx * 0.85, y); ctx.lineTo(q[0], q[1]); ctx.stroke(); }); }); };
      const RX = Math.min(W * 0.44, 340), RY = (bot - top) / 2;
      if (s <= 3) {
        cell(W / 2, cy, RX, RY);
        if (s === 0) { B.blob(ctx, W / 2, cy, RY * 0.6, RY * 0.6, 'rgba(196,181,253,.5)', '#6d28d9', 2.5); for (let k = 0; k < n; k++) [MOM, DAD].forEach((col, j) => { ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.beginPath(); let x = W / 2 + Math.cos(k * 2.4 + j) * RY * 0.3, y = cy + Math.sin(k * 2.4 + j) * RY * 0.3; ctx.moveTo(x, y); for (let i = 0; i < 6; i++) { x += Math.cos(k + j + i * 1.7) * 8; y += Math.sin(k * 1.3 + i + j) * 8; ctx.lineTo(x, y); } ctx.stroke(); }); D.txt(ctx, 'يتضاعف DNA في الطور البيني', W / 2, bot - 8, { color: c.text, size: 12 }); return; }
        if (s === 1) {
          ctx.setLineDash([6, 6]); B.blob(ctx, W / 2, cy, RY * 0.75, RY * 0.75, null, '#6d28d9', 2); ctx.setLineDash([]); poles(W / 2, cy, RX);
          for (let k = 0; k < n; k++) { const a = k * 2.399, r = RY * 0.5 * Math.sqrt((k + 0.5) / n); const x = W / 2 + Math.cos(a) * r, y = cy + Math.sin(a) * r; chrom(ctx, x - w * 1.6, y, Lk(k), T.A, w); chrom(ctx, x + w * 1.6, y, Lk(k), T.B, w); if (p.nx) for (let q = 1; q <= p.nx; q++) { const yy = y - Lk(k) / 2 + Lk(k) * q / (p.nx + 1); ctx.strokeStyle = '#facc15'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - 4, yy - 4); ctx.lineTo(x + 4, yy + 4); ctx.moveTo(x + 4, yy - 4); ctx.lineTo(x - 4, yy + 4); ctx.stroke(); } }
          D.txt(ctx, p.nx ? 'رباعيات + عبور في منطقة الكيازما (×)' : 'رباعيات دون عبور', W / 2, bot - 8, { color: c.text, size: 12, w: '700' });
          return;
        }
        const gap = Math.min((2 * RY - 30) / n, Lmax * 1.15); const pts = [];
        for (let k = 0; k < n; k++) {
          const y = cy - (n - 1) * gap / 2 + k * gap; const f = s === 2 ? 0.06 : 0.12 + 0.5 * Math.min(1, ((d.st && d.st.t) || 0) % 2.2 / 1.8);
          const xa = W / 2 - RX * f - w * 1.6, xb = W / 2 + RX * f + w * 1.6; pts.push([xa, y], [xb, y]);
          chrom(ctx, xa, y, Lk(k), T.A, w); chrom(ctx, xb, y, Lk(k), T.B, w);
        }
        fibres(W / 2, cy, RX, pts); poles(W / 2, cy, RX);
        if (s === 2) { ctx.strokeStyle = c.c2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(W / 2, cy - RY); ctx.lineTo(W / 2, cy + RY); ctx.stroke(); ctx.setLineDash([]); D.txt(ctx, 'أزواج الكروموسومات المتناظرة على خط الاستواء', W / 2, bot - 8, { color: c.text, size: 12, w: '700' }); }
        else D.txt(ctx, 'تتباعد الكروموسومات المتناظرة (يبقى كل كروموسوم بكروماتيديه)', W / 2, bot - 8, { color: c.text, size: 12, w: '700' });
        return;
      }
      // المرحلة الثانية: خليتان (A و B)، ثم أربع خلايا
      const groups = [T.A, T.B];
      if (s <= 7) {
        const rx = W * 0.22, ry = RY * 0.85;
        groups.forEach((G, gi) => {
          const x = W * (gi ? 0.73 : 0.27); cell(x, cy, rx, ry);
          const gap = Math.min((2 * ry - 24) / n, Lmax * 1.1);
          for (let k = 0; k < n; k++) {
            const y = cy - (n - 1) * gap / 2 + k * gap;
            if (s === 4) { const a = k * 2.399, r = ry * 0.45 * Math.sqrt((k + 0.5) / n); chrom(ctx, x + Math.cos(a) * r, cy + Math.sin(a) * r, Lk(k), G, w); }
            else if (s === 5) { const a = k * 2.399 + 1, r = ry * 0.5 * Math.sqrt((k + 0.5) / n); chrom(ctx, x + Math.cos(a) * r, cy + Math.sin(a) * r, Lk(k), G, w); }
            else if (s === 6) chrom(ctx, x, y, Lk(k), G, w);
            else { const f = 0.2 + 0.4 * Math.min(1, ((d.st && d.st.t) || 0) % 2.2 / 1.8); chrom(ctx, x - rx * f, y, Lk(k), [G[0]], w); chrom(ctx, x + rx * f, y, Lk(k), [G[1]], w); }
          }
          if (s >= 5) poles(x, cy, rx);
          if (s === 4) B.blob(ctx, x, cy, ry * 0.62, ry * 0.62, null, '#6d28d9', 2);
        });
        const msg = s === 4 ? 'خليتان، في كل منهما ' + n + ' كروموسوماً متضاعفاً (نصف العدد)' : s === 5 ? 'تبدأ المرحلة الثانية في الخليتين (لا يحدث عبور)' : s === 6 ? 'تصطف الكروموسومات فرادى على خط الاستواء في كل خلية' : 'تنفصل الكروماتيدات الشقيقة نحو القطبين';
        D.txt(ctx, msg, W / 2, bot - 8, { color: c.text, size: nar ? 11 : 12, w: '700' });
        return;
      }
      // أربع خلايا (n)
      const cols4 = nar ? 2 : 4; const cw = W / cols4; const rows = nar ? 2 : 1; const ch = (bot - top) / rows;
      [[0, 0], [0, 1], [1, 0], [1, 1]].forEach((gk, i) => {
        const col = i % cols4, row = Math.floor(i / cols4); const x = cw * (col + 0.5), y = top + ch * (row + 0.5);
        const rx = cw * 0.42, ry = Math.min(ch * 0.42, rx * 1.15, Lmax * n * 0.9 + 40); cell(x, y, rx, ry);
        const gap = Math.min((2 * ry - 20) / n, Lmax);
        for (let k = 0; k < n; k++) chrom(ctx, x + (k % 2 ? 6 : -6), y - (n - 1) * gap / 2 + k * gap, Lk(k) * 0.8, [groups[gk[0]][gk[1]]], w);
        const mixed = groups[gk[0]][gk[1]].some((cc) => cc !== groups[gk[0]][gk[1]][0]);
        D.txt(ctx, 'n = ' + n + (mixed ? ' (تركيب جديد)' : ''), x, y + ry + 2, { color: mixed ? '#a16207' : c.text, size: 11, w: '800' });
      });
    },
    live(p, d) { return d.err ? '\\text{إدخال غير صالح}' : '\\text{2n} = ' + d.n2 + ' \\to \\text{n} = ' + d.n; },
    results(p, d) {
      if (d.err) return [['خطأ في الإدخال', d.err, false]];
      return [['الدور', B.MEIOSIS[p.s], false], ['عدد الخلايا', '' + d.cnt.cells, false], ['الكروموسومات في كل خلية', '' + d.cnt.chrom, false], ['الكروماتيدات في كل خلية', '' + d.cnt.chromatids, false], ['الحالة', d.cnt.ploidy, false],
        ['عدد الرباعيات في التمهيدي الأول', '' + d.n, false], ['مجموع عمليات العبور (عداد)', p.nx + ' \\times ' + d.n + ' = ' + d.crossTotal], ['أنواع الخلايا الناتجة من هذه الخلية', d.kinds + (p.nx ? ' (العبور أنتج تراكيب جديدة)' : ' (دون عبور)'), false]];
    },
    steps(p, d) { if (d.err) return []; return ['المرحلة الأولى: ' + d.n2 + ' ← خليتان في كل منهما ' + d.n + ' (هنا يُختزل العدد؛ لذلك سُمي منصفاً).', 'المرحلة الثانية: كل خلية ' + d.n + ' ← خليتان في كل منهما ' + d.n + ' (تشبه الانقسام المتساوي).', 'الناتج: 4 خلايا، في كل منها n = ' + d.n + '.']; },
    explain(a, b, da, db) {
      if (db.err) return [];
      if (a.nx !== b.nx) return [b.nx ? 'حدثت ' + b.nx + ' عملية عبور في كل رباعي: تتبادل الكروماتيدات غير الشقيقة قطعاً كروموسومية في منطقة الكيازما، فتنتج كروموسومات ذات تراكيب جديدة (انظر الخلايا الأربع).' : 'دون عبور: الخلايا الأربع الناتجة نوعان فقط (من الأم أو من الأب لكل زوج).'];
      if (a.n2 !== b.n2) return ['أصبح 2n = ' + db.n2 + '، فعدد الرباعيات ' + db.n + '، وكل خلية ناتجة تحتوي n = ' + db.n + '.'];
      if (a.s !== b.s && b.s === 4) return ['انتهت المرحلة الأولى: خليتان في كل منهما نصف عدد الكروموسومات المتضاعفة، وهذا سبب تسمية الانقسام بالمنصف.'];
      return [];
    },
    learn: ['**أين؟ (ص 43):** يحدث الانقسام المنصف في الخلايا الجنسية لتكوين الغاميتات.', '**التمهيدي الأول (ص 44–45):** تجتمع الكروموسومات المتناظرة في أزواج، وكل كروموسوم كروماتيدان، فيتكون الرباعي (tetrad) ويحدث العبور.', '**الاستوائي الأول:** تنتظم أزواج الكروموسومات المتناظرة على خط الاستواء. **الانفصالي الأول:** تتباعد الكروموسومات المتناظرة. **النهائي الأول:** خليتان في كل منهما نصف عدد الكروموسومات المتضاعفة.', '**المرحلة الثانية (ص 46):** تشبه الانقسام المتساوي: التمهيدي الثاني، الاستوائي الثاني، الانفصالي الثاني، النهائي الثاني، ثم انقسام السيتوبلازم.', '**العبور (ص 47):** خلال التمهيدي الأول تتقاطع أجزاء من الكروماتيدات غير الشقيقة في منطقة الكيازما وتتبادل قطعاً، وقد يحدث على الكروموسوم الواحد من عملية عبور واحدة إلى ثلاث.'],
    challenges: [
      { q: 'س1 (ص 51): خلية جنسية عدد كروموسوماتها **36** انقسمت انقساماً منصفاً. أدخل العدد وانتقل إلى نهاية الانقسام.', hint: '2n = 36 ← n = 18.', init: { n2: '4', s: 0 }, check: (p, d) => !d.err && d.n2 === 36 && p.s === 8, why: () => 'كل خلية ناتجة تحتوي 18 كروموسوماً.' },
      { q: 'انتقل إلى الدور الذي **تحدث فيه عملية العبور**، واجعل عدد عمليات العبور 2.', hint: 'التمهيدي الأول.', init: { s: 0, nx: 0 }, check: (p) => p.s === 1 && p.nx === 2 },
      { q: 'اجعل الخلايا الأربع الناتجة **نوعين فقط** (لا تراكيب جديدة).', hint: 'ألغِ العبور.', init: { s: 8, nx: 1 }, check: (p, d) => !d.err && p.nx === 0 && p.s === 8 }
    ],
    tutor: [
      { q: 'لماذا سمي الانقسام منصفاً؟', k: ['سمي', 'منصف', 'لماذا'], a: () => 'لأن الخليتين الناتجتين من المرحلة الأولى تحتوي كل منهما نصف عدد الكروموسومات المتضاعفة في الخلية الأصلية (ص 45).' },
      { q: 'لماذا لا يحدث العبور في التمهيدي الثاني؟', k: ['التمهيدي الثاني', 'لا يحدث', 'عبور'], a: () => 'لأن الكروموسومات المتناظرة انفصلت في المرحلة الأولى، فلا تتشكل رباعيات في التمهيدي الثاني، والعبور يحتاج الرباعيات.' },
      { q: 'اشرح الفرق بين الانقسام المتساوي والمنصف بطريقة أبسط', k: ['ابسط', 'الفرق', 'متساوي', 'منصف'], a: () => 'تخيّل خلية فيها 4 كروموسومات: الانقسام المتساوي ينسخها مرة ويقسمها مرة، فيعطي خليتين في كل منهما 4 (مثل الأم) — للنمو وإصلاح الخلايا. الانقسام المنصف ينسخها مرة ويقسمها مرتين، فيعطي أربع خلايا في كل منها 2 (النصف) — لتكوين الغاميتات، ثم الإخصاب 2 + 2 يعيد العدد 4.' },
      { q: 'كم عملية عبور الآن؟', k: ['كم', 'عداد', 'عمليه'], a: (p, d) => (d.err ? d.err : p.nx + ' عملية لكل زوج × ' + d.n + ' أزواج = ' + d.crossTotal + ' عملية.') }
    ]
  });

  /* ======================= المقارنة: الانقسام المتساوي والمنصف ======================= */
  const CMP_ST = ['الخلية الأم (2n)', 'بعد تضاعف DNA', 'بعد الانقسام الأول', 'النتيجة النهائية'];
  const CMP_ROWS = [
    ['أين يحدث؟', 'الخلايا الجسمية (ص 37)', 'الخلايا الجنسية (ص 43)'],
    ['عدد مرات الانقسام', 'مرة واحدة', 'مرحلتان (الأولى والثانية)'],
    ['عدد الخلايا الناتجة', '2', '4'],
    ['عدد الكروموسومات في الناتجة', '2n (مثل الخلية الأم)', 'n (نصف العدد)'],
    ['العبور', 'لا يحدث', 'يحدث في التمهيدي الأول'],
    ['الأهمية', 'زيادة عدد الخلايا دون تغيير المادة الوراثية؛ النمو والإصلاح والتكاثر في وحيدات الخلية', 'ثبات العدد الكروموسومي للنوع، وتكوين الغاميتات، والتنوع']
  ];
  reg({
    id: 'mitosis-vs-meiosis', order: 2, lesson: '1-1 / 5-1', lessonTitle: 'الانقسام المنصف وأهميته', page: 50,
    titleAr: 'جنباً إلى جنب: الانقسام المتساوي والانقسام المنصف', titleEn: 'Side by Side: Mitosis vs Meiosis', tags: 'مقارنه انقسام متساوي منصف عدد الخلايا الكروموسومات ثبات العدد',
    formula: '\\text{المتساوي}: \\text{2n} \\to 2 \\times \\text{2n} \\qquad \\text{المنصف}: \\text{2n} \\to 4 \\times \\text{n}',
    book: 'الانقسام المتساوي ينتج خلايا تحمل المعلومات الوراثية نفسها (س2 ص 41)؛ الانقسام المنصف: أهميته في محافظة النوع الواحد على ثبات العدد الكروموسومي له (ص 50، الشكل 9).',
    summary: 'قارن في كل خطوة بين الانقسامين: المتساوي يعطي خليتين متماثلتين (2n)، والمنصف يعطي أربع خلايا (n) بعد مرحلتين. ثم الإخصاب (n + n) يعيد العدد 2n.',
    vars: [['\\text{2n}', 'العدد الكروموسومي في الخلية الأم', '\\text{كروموسوم}', 'زوجي موجب'], ['\\text{الخطوة}', 'نقاط المقارنة', '—', '4 خطوات']],
    assumptions: ['الدوائر تمثل الخلايا، والأرقام داخلها عدد الكروموسومات؛ الرسم نموذج مبسّط لأغراض التعليم.'],
    params: [{ key: 'k', label: '\\text{الخطوة}', type: 'stage', stages: CMP_ST, value: 0 }, Object.assign({}, B.n2Param(46))],
    play: { mode: 'stage', key: 'k', interval: 2 },
    randomize() { const v = [4, 8, 12, 36, 46]; return { n2: String(v[Math.floor(Math.random() * v.length)]) }; },
    compute(p) {
      const n2 = n2Of(p); if (!n2) return { err: B.validate2n(ML.parseNum(p.n2)) || 'للعرض الواضح اختر عدداً حتى 60.' };
      const n = n2 / 2; const mi = [[n2], [n2], [n2, n2], [n2, n2]][p.k]; const me = [[n2], [n2], [n, n], [n, n, n, n]][p.k];
      return { n2: n2, n: n, mi: mi, me: me };
    },
    drawCustom(ctx, W, H, p, d, c) {
      if (d.err) { B.para(ctx, D, d.err, W / 2, H / 2, W - 40, { color: c.c2, size: 14 }); return; }
      const nar = narrow(W); const ph = nar ? H * 0.42 : H * 0.5;
      const panel = (x0, w, title, cells, col) => {
        D.txt(ctx, title, x0 + w / 2, 18, { color: col, size: nar ? 13 : 15, w: '800' });
        const k = cells.length; const r = Math.min(w / (k * 2.6), ph * 0.28);
        cells.forEach((v, i) => { const x = x0 + w * (i + 0.5) / k, y = ph * 0.55; B.blob(ctx, x, y, r, r, col === '#059669' ? 'rgba(167,243,208,.8)' : 'rgba(221,214,254,.85)', col, 3); D.txt(ctx, (v === d.n2 ? '2n' : 'n') + ' = ' + v, x, y, { color: '#111827', size: Math.max(10, Math.min(15, r * 0.4)), w: '800' }); if (p.k === 1) D.txt(ctx, 'متضاعفة', x, y + r * 0.45, { color: '#334155', size: 10 }); });
      };
      panel(W / 2 + 6, W / 2 - 12, 'الانقسام المتساوي', d.mi, '#059669');
      panel(6, W / 2 - 12, 'الانقسام المنصف', d.me, '#7c3aed');
      ctx.strokeStyle = c.grid; ctx.beginPath(); ctx.moveTo(W / 2, 30); ctx.lineTo(W / 2, ph); ctx.stroke();
      // جدول
      const ty = ph + 6, rh = (H - ty - 6) / (CMP_ROWS.length + 1); const cw = [0.24, 0.38, 0.38].map((f) => f * (W - 12));
      [['وجه المقارنة', 'الانقسام المتساوي', 'الانقسام المنصف']].concat(CMP_ROWS).forEach((r, i) => { const y = ty + i * rh; ctx.fillStyle = i === 0 ? 'rgba(124,58,237,.15)' : i % 2 ? 'rgba(148,163,184,.12)' : 'rgba(148,163,184,.04)'; ctx.fillRect(6, y, W - 12, rh - 1); let xx = W - 6; r.forEach((cell, j) => { B.para(ctx, D, cell, xx - cw[j] / 2, y + rh / 2 - (cell.length > 40 && nar ? 6 : 0), cw[j] - 8, { color: c.text, size: nar ? 9 : 11.5, w: i === 0 || j === 0 ? '800' : '500' }); xx -= cw[j]; }); });
    },
    live(p, d) { return d.err ? '\\text{إدخال غير صالح}' : '\\text{المتساوي}: ' + d.mi.length + ' \\times ' + d.mi[0] + ' \\qquad \\text{المنصف}: ' + d.me.length + ' \\times ' + d.me[0]; },
    results(p, d) { if (d.err) return [['خطأ في الإدخال', d.err, false]]; return [['الخطوة', CMP_ST[p.k], false], ['المتساوي: الخلايا × الكروموسومات', d.mi.length + ' \\times ' + d.mi[0]], ['المنصف: الخلايا × الكروموسومات', d.me.length + ' \\times ' + d.me[0]], ['بعد الإخصاب (n + n)', d.n + ' + ' + d.n + ' = ' + d.n2]]; },
    steps(p, d) { if (d.err) return []; return ['المتساوي: ' + d.n2 + ' ← ' + d.n2 + ' و ' + d.n2 + '.', 'المنصف: ' + d.n2 + ' ← ' + d.n + ' و ' + d.n + ' ← أربع خلايا في كل منها ' + d.n + '.', 'الإخصاب: غاميت ذكري (' + d.n + ') + غاميت أنثوي (' + d.n + ') = بويضة مخصبة (' + d.n2 + ') — العلاقة التكاملية (الشكل 9).']; },
    explain(a, b, da, db) { if (db.err) return []; if (a.k !== b.k) return [b.k === 2 ? 'بعد الانقسام الأول: المتساوي أعطى خليتين 2n، أما المنصف فأعطى خليتين في كل منهما n (اختزل العدد).' : b.k === 3 ? 'النتيجة: المتساوي ← خليتان 2n، المنصف ← أربع خلايا n.' : 'قبل الانقسام يتضاعف DNA في الحالتين.']; if (a.n2 !== b.n2) return ['مع 2n = ' + db.n2 + ': المنصف يعطي ' + db.n + ' في كل غاميت، والإخصاب يعيد ' + db.n2 + '.']; return []; },
    learn: CMP_ROWS.map((r) => '**' + r[0] + ':** المتساوي — ' + r[1] + '؛ المنصف — ' + r[2] + '.').concat(['**الشكل (9) ص 50:** العلاقة التكاملية بين الانقسام المنصف والإخصاب تحافظ على ثبات العدد الكروموسومي للنوع.']),
    challenges: [
      { q: 'سؤال الكتاب: الخلايا الجسمية في الإنسان فيها **46** كروموسوماً. اعرض النتيجة النهائية للانقسامين.', hint: '2n = 46 والخطوة الأخيرة.', init: { n2: '8', k: 0 }, check: (p, d) => !d.err && d.n2 === 46 && p.k === 3, why: () => 'المتساوي: خليتان × 46؛ المنصف: 4 خلايا × 23.' },
      { q: 'انتقل إلى الخطوة التي **يُختزل فيها** عدد الكروموسومات في الانقسام المنصف لأول مرة.', hint: 'بعد المرحلة الأولى.', init: { k: 0, n2: '46' }, check: (p) => p.k === 2 }
    ],
    tutor: [
      { q: 'لماذا نحتاج الانقسام المنصف؟', k: ['لماذا', 'نحتاج', 'اهميه'], a: () => 'تتجلى أهمية الانقسام المنصف في محافظة النوع الواحد على ثبات العدد الكروموسومي له: الغاميتات n، والإخصاب n + n = 2n (ص 50).' }
    ]
  });

  /* ======================= 4-1 تكوين الغاميتات ======================= */
  reg({
    id: 'gametogenesis', order: 3, lesson: '4-1', lessonTitle: 'تكوين الغاميتات عند الإنسان', page: 47,
    titleAr: 'تكوين الحيوانات المنوية والبويضات', titleEn: 'Gametogenesis: Spermatogenesis & Oogenesis', tags: 'غاميتات حيوانات منويه بويضه خلايا منويه اوليه ثانويه طلائع منويه جسم قطبي حويصله غراف',
    formula: '\\text{خلية أولية (2n)} \\to \\text{انقسام منصف} \\to \\text{غاميتات (n)}',
    book: 'الشكل (7) ص 48: مراحل تكوين الغاميتات الذكرية؛ الشكل (8) ص 49: مراحل تكوين البويضات. تحتاج عملية تكوين الحيوانات المنوية سبعة أسابيع (ص 47).',
    summary: 'تتكون الغاميتات بسلسلة من العمليات: انقسام متساوٍ ثم نمو ثم انقسام منصف ثم نضج وتمايز. من كل خلية منوية أولية تنتج 4 حيوانات منوية، أما الخلية البيضية الأولية فتعطي بويضة واحدة وأجساماً قطبية.',
    vars: [['\\text{2n / n}', 'عدد الكروموسومات في الخلية', '\\text{كروموسوم}', '2n = 46 ، n = 23 في الإنسان'], ['\\text{المرحلة}', 'مراحل التكوين بحسب الشكلين (7) و (8)', '—', '7 مراحل']],
    assumptions: ['الرسم الشجري تخطيطي (نموذج مبسّط لأغراض التعليم)؛ أسماء المراحل والعمليات من الشكلين (7) و (8).'],
    params: [
      { key: 'sex', label: '\\text{نوع الغاميتات}', type: 'select', options: [['m', 'الحيوانات المنوية (الذكر)'], ['f', 'البويضات (الأنثى)']], value: 'm' },
      { key: 'i', label: '\\text{المرحلة}', type: 'stage', stages: (p) => (p.sex === 'f' ? B.EGG : B.SPERM).map((x) => x.cell), value: 0 }
    ],
    onSet(p, key) { if (key === 'sex') p.i = 0; },
    play: { mode: 'stage', key: 'i', interval: 1.8 }, initState: () => ({ part: null }),
    randomize(p) { return { i: Math.floor(Math.random() * 7) }; },
    canvasHint: 'تتبع الخلايا من الأعلى إلى الأسفل. في المرحلة الأخيرة اضغط على أجزاء الحيوان المنوي.',
    compute(p) { const L = p.sex === 'm' ? B.SPERM : B.EGG; return { L: L, cur: L[p.i] }; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = narrow(W); const L = d.L; const male = p.sex === 'm'; const rows = L.length; const rh = (H - 30) / rows; const cx = nar ? W * 0.62 : W * 0.55;
      // عدد الخلايا في كل مستوى (من خلية واحدة)
      const countM = [1, 1, 1, 1, 2, 4, 4]; const countF = [1, 1, 1, 1, 1, 1, 1];
      for (let r = 0; r < rows; r++) {
        const y = 20 + rh * (r + 0.5); const on = r === p.i; const past = r < p.i; const k = male ? countM[r] : countF[r];
        ctx.globalAlpha = r <= p.i ? 1 : 0.25;
        const rr = Math.min(rh * 0.36, 20) * (male && r === 3 ? 1.2 : !male && r >= 2 && r <= 5 ? 1.35 : 1);
        for (let j = 0; j < k; j++) {
          const x = cx + (j - (k - 1) / 2) * rr * 2.6;
          if (male && r === 6) { ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); for (let q = 0; q < 12; q++) ctx.lineTo(x + Math.sin(q) * 3, y + q * 2); ctx.stroke(); B.blob(ctx, x, y - 3, rr * 0.35, rr * 0.5, '#93c5fd', '#1d4ed8', 1.5); }
          else B.blob(ctx, x, y, rr, rr, male ? 'rgba(191,219,254,.9)' : 'rgba(251,207,232,.9)', on ? '#d97706' : male ? '#1d4ed8' : '#be185d', on ? 3.5 : 2);
          if (L[r].ploidy && !(male && r === 6)) D.txt(ctx, L[r].ploidy, x, y, { color: '#111827', size: 11, w: '800' });
        }
        if (!male && (r === 3 || r === 5)) { const x = cx + rr * 2.2; B.blob(ctx, x, y + rr * 0.4, rr * 0.35, rr * 0.35, 'rgba(251,207,232,.9)', '#be185d', 1.5); D.txt(ctx, r === 3 ? 'جسم قطبي أول' : 'جسم قطبي ثانٍ', x + rr * 0.6, y + rr * 0.4, { color: c.text, size: 10, align: 'left' }); }
        D.txt(ctx, L[r].cell, nar ? cx - 64 : cx - 120, y, { color: on ? '#d97706' : c.text, size: nar ? 10.5 : 13, w: on ? '800' : '600', align: 'right' });
        if (r > 0 && L[r].via) D.txt(ctx, '↓ ' + L[r].via, cx + (nar ? 50 : 110), y - rh / 2, { color: c.c5, size: nar ? 9.5 : 11, w: '700', align: 'left' });
        ctx.globalAlpha = 1;
      }
      if (!male) { D.txt(ctx, 'المرحلة الجنينية', 14, 20 + rh * 1.5, { color: '#be185d', size: 11, w: '800', align: 'left' }); D.txt(ctx, 'بعد البلوغ', 14, 20 + rh * 3.5, { color: '#be185d', size: 11, w: '800', align: 'left' }); }
      // تركيب الحيوان المنوي
      if (male && p.i === 6 && !nar) {
        const x0 = W * 0.06, y0 = H * 0.18; const parts = [['head', 'الرأس', 0, 36], ['neck', 'العنق', 36, 10], ['mid', 'القطعة الوسطى', 46, 40], ['tail', 'الذيل', 86, 120]];
        parts.forEach((q) => { const sel = d.st && d.st.part === q[0]; ctx.fillStyle = sel ? '#fbbf24' : ['#93c5fd', '#64748b', '#f97316', '#1d4ed8'][parts.indexOf(q)]; if (q[0] === 'head') B.blob(ctx, x0 + 18, y0 + 18, 16, 20, ctx.fillStyle, '#1e3a8a', 2); else if (q[0] === 'tail') { ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= 30; i++) ctx.lineTo(x0 + 18 + Math.sin(i * 0.5) * 6, y0 + q[2] + i * 4); ctx.stroke(); } else ctx.fillRect(x0 + 12, y0 + q[2], 12, q[3]); d.hits.push({ id: q[0], x: x0 - 4, y: y0 + q[2], w: 50, h: q[3] }); D.txt(ctx, q[1], x0 + 40, y0 + q[2] + Math.min(q[3], 30) / 2, { color: sel ? '#d97706' : c.text, size: 11, w: '700', align: 'left' }); });
      }
    },
    onPointer(type, x, y, p, st, api) { if (type !== 'down') return false; const h = api.hit(x, y); if (!h) return false; const T = { head: 'الرأس: قمعي الشكل، يحتوي على النواة، ويفرز إنزيمات تساعد الحيوان المنوي في اختراق الخلية البيضية الثانوية.', neck: 'العنق: منطقة وصل بين الرأس والقطعة الوسطى.', mid: 'القطعة الوسطى: تحتوي على عدد كبير من المايتوكندريا (لإنتاج الطاقة اللازمة للحركة).', tail: 'الذيل: يساعده في الحركة.' }; st.part = h.id; api.say(['**' + T[h.id] + '** (ص 49)']); return true; },
    live(p, d) { return '\\text{' + d.cur.cell + (d.cur.ploidy ? ' (' + d.cur.ploidy + ')' : '') + '}'; },
    results(p, d) {
      const male = p.sex === 'm';
      return [['المرحلة', d.cur.cell, false], ['العملية التي أنتجتها', d.cur.via || '—', false], ['عدد الكروموسومات', d.cur.ploidy === '2n' ? '2n = 46 في الإنسان' : d.cur.ploidy === 'n' ? 'n = 23 في الإنسان' : '—', false],
        ['الناتج من خلية أولية واحدة', male ? '4 حيوانات منوية' : 'بويضة واحدة + أجسام قطبية', false], ['أين؟', male ? 'في الخصية' : 'في المبيض (الجريبات)', false], ['المدة / التوقيت', male ? 'سبعة أسابيع تقريباً لتكوين حيوان منوي ناضج' : (d.cur.when || 'تبدأ في المرحلة الجنينية وتستمر إلى ما بعد البلوغ'), false]];
    },
    steps(p, d) { return d.L.slice(1).map((x, i) => (i + 1) + ') ' + x.via + ' ← ' + x.cell + (x.ploidy ? ' (' + x.ploidy + ')' : '')); },
    explain(a, b, da, db) { if (a.sex !== b.sex) return [b.sex === 'm' ? 'تكوين الحيوانات المنوية في الخصية: من كل خلية منوية أولية تنتج أربعة حيوانات منوية.' : 'تكوين البويضات في المبيض: تبدأ في المرحلة الجنينية، وتكتمل بعد البلوغ، وتنتج بويضة واحدة وأجساماً قطبية.']; if (a.i !== b.i) return ['«' + db.cur.cell + '»' + (db.cur.via ? ' تنتج بعملية: ' + db.cur.via + '.' : '.') + (db.cur.ploidy ? ' عدد الكروموسومات ' + db.cur.ploidy + '.' : '')]; return []; },
    learn: ['**تكوين الحيوانات المنوية (ص 47–48):** في الخصية، تحت سيطرة هرمونات الغدة النخامية، وتحتاج سبعة أسابيع: خلايا جذعية ← خلايا منوية أم (2n) ← خلايا تناسلية أولية (2n) ← خلايا منوية أولية (2n) ← خلايا منوية ثانوية (n) ← طلائع منوية (n) ← حيوانات منوية (n).', '**تركيب الحيوان المنوي (ص 49):** الرأس، العنق، القطعة الوسطى (مايتوكندريا كثيرة)، الذيل.', '**تكوين البويضات (ص 49):** يحتوي المبيض جريبات تكونت في المرحلة الجنينية، وتستمر إلى ما بعد البلوغ؛ تنتج الخلية البيضية الثانوية والجسم القطبي الأول بالمرحلة الأولى من الانقسام المنصف.'],
    challenges: [
      { q: 'س (ص 48): ماذا تُدعى الخلايا الناتجة عن **المرحلة الأولى من الانقسام المنصف** في الذكر؟ انتقل إليها.', hint: 'عددها n.', init: { sex: 'm', i: 0 }, check: (p) => p.sex === 'm' && p.i === 4 },
      { q: 'في تكوين البويضات، انتقل إلى المرحلة التي ينتج فيها **الجسم القطبي الأول**.', hint: 'بعد البلوغ، بالمرحلة الأولى من الانقسام المنصف.', init: { sex: 'm', i: 0 }, check: (p) => p.sex === 'f' && p.i === 3 },
      { q: 'اضغط على جزء الحيوان المنوي الذي **يحتوي عدداً كبيراً من المايتوكندريا**.', hint: 'انتقل إلى آخر مرحلة في تكوين الحيوانات المنوية (على شاشة واسعة).', init: { sex: 'f', i: 0 }, check: (p, d) => p.sex === 'm' && p.i === 6 && d.st && d.st.part === 'mid' }
    ],
    tutor: [
      { q: 'كم حيواناً منوياً ينتج من خلية أولية واحدة؟', k: ['كم', 'منوي', 'واحده'], a: () => 'أربعة حيوانات منوية (n) من كل خلية منوية أولية (2n) بعد مرحلتي الانقسام المنصف (الشكل 7).' },
      { q: 'ما الفرق بين تكوين البويضات والحيوانات المنوية؟', k: ['الفرق', 'بويضه', 'بويضات'], a: () => 'الحيوانات المنوية: في الخصية، 4 من كل خلية أولية، نحو سبعة أسابيع. البويضات: في المبيض، تبدأ في المرحلة الجنينية وتكتمل بعد البلوغ، وتنتج بويضة واحدة مع أجسام قطبية.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
