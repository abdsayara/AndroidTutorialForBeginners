/* العلوم الحياتية — الوحدة الأولى، الفصل الثالث: المادة الوراثية (ص 19–28) */
(function (root) {
  'use strict';
  const ML = root.ML; const B = ML.bio; const D = ML.pdraw;
  const S = 'g10-bio'; const U = 3;
  const reg = (o) => ML.register(Object.assign({ subject: S, unit: U, custom: true }, o));
  const narrow = (W) => W < 640;
  const BC = B.BASE_COL;

  // سلم DNA أفقي: السلسلة العلوية 5′←3′ والسفلية معاكسة. يرجع مواقع القواعد (للنقر)
  function ladder(ctx, top, bot, x0, y, w, c, o) {
    o = o || {}; const n = Math.max(top.length, bot ? bot.length : 0); const step = w / Math.max(n, 1); const gap = o.gap === undefined ? 56 : o.gap; const out = [];
    const strand = (seq, yy, dir, col) => {
      ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineCap = 'round';
      for (let i = 0; i < seq.length; i++) { if (seq[i] === ' ') continue; ctx.beginPath(); ctx.moveTo(x0 + step * (i + 0.05), yy); ctx.lineTo(x0 + step * (i + 0.95), yy); ctx.stroke(); }
      for (let i = 0; i < seq.length; i++) {
        const x = x0 + step * (i + 0.5); if (seq[i] === ' ') continue;
        // سكر خماسي (خماسي الأضلاع) وفوسفات (دائرة)
        ctx.fillStyle = o.ribose ? '#fde68a' : '#fcd34d'; ctx.beginPath(); for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * Math.PI * 2 / 5; ctx.lineTo(x + Math.cos(a) * 8, yy + Math.sin(a) * 8); } ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#92400e'; ctx.lineWidth = 1; ctx.stroke();
        B.blob(ctx, x - step / 2 + 2, yy, 4, 4, '#a855f7');
        const bh = gap / 2 - 15; const by = dir > 0 ? yy + 8 : yy - 8 - bh;
        ctx.fillStyle = (o.mark && o.mark(i, dir)) || BC[seq[i]] || '#94a3b8'; D.rr(ctx, x - step * 0.3, by, step * 0.6, bh, 4); ctx.fill();
        D.txt(ctx, seq[i], x, by + bh / 2, { color: '#fff', size: Math.min(15, step * 0.45), w: '800' });
        out.push({ i: i, dir: dir, x: x - step * 0.35, y: by, w: step * 0.7, h: bh, cx: x });
      }
    };
    strand(top, y, 1, o.topCol || c.c1);
    if (bot) {
      strand(bot, y + gap, -1, o.botCol || c.c1);
      if (o.hb !== false) for (let i = 0; i < Math.min(top.length, bot.length); i++) {
        if (top[i] === ' ' || bot[i] === ' ') continue; const x = x0 + step * (i + 0.5); const nb = B.hBonds(top[i]);
        ctx.strokeStyle = c.text; ctx.lineWidth = 1.6; ctx.setLineDash([3, 2]); for (let k = 0; k < nb; k++) { const dx = (k - (nb - 1) / 2) * Math.min(7, step * 0.14); ctx.beginPath(); ctx.moveTo(x + dx, y + gap / 2 - 6); ctx.lineTo(x + dx, y + gap / 2 + 6); ctx.stroke(); } ctx.setLineDash([]);
      }
      D.txt(ctx, '′5', x0 - 8, y, { color: c.text, size: 12, w: '800', align: 'right' }); D.txt(ctx, '′3', x0 + w + 8, y, { color: c.text, size: 12, w: '800', align: 'left' });
      D.txt(ctx, '′3', x0 - 8, y + gap, { color: c.text, size: 12, w: '800', align: 'right' }); D.txt(ctx, '′5', x0 + w + 8, y + gap, { color: c.text, size: 12, w: '800', align: 'left' });
    }
    return out;
  }
  const seqParam = (val, type) => ({ key: 'seq', label: '\\text{تتابع القواعد}', type: 'text', value: val, maxLength: 14, desc: 'حروف القواعد فقط', normalize: B.normSeq, validate: (v, p) => B.validateSeq(v, (p && p.type) || type || 'DNA') });

  /* ======================= 2-2 الكروموسوم ← النيوكليوسوم ← DNA ← الجين ======================= */
  const LEVELS = ['الكروموسوم', 'تكدس الكروموسوم (الالتفاف)', 'النيوكليوسوم', 'جزيء DNA', 'الجين'];
  const LEVEL_TXT = [
    'يتركب الكروموسوم في الكائنات حقيقية النواة من DNA وبروتينات، منها بروتين الهستون.',
    'يلتف DNA مع البروتينات التفافاً شديداً؛ للنيوكليوسوم دور مهم في تكدس الكروموسوم في أثناء الانقسامات الخلوية.',
    'ترتبط بروتينات الهستون في مجموعات ثمانية مكوّنة شكل خرزات، ويلتف DNA مرتين حولها حتى يصل إلى جزيء بروتيني تاسع: هذا التجمع هو النيوكليوسوم.',
    'يتشكل جزيء DNA من سلسلتين ملتفتين بشكل لولبي، ترتبط قواعدهما النيتروجينية بروابط هيدروجينية.',
    'الجين جزء من DNA يحتوي تسلسلاً خاصاً من القواعد النيتروجينية ليمثل صفة محددة، وله موقع محدد على الكروموسوم.'
  ];
  reg({
    id: 'chromosome-zoom', order: 1, lesson: '2-2', lessonTitle: 'تركيب الكروموسوم', page: 20,
    titleAr: 'من الكروموسوم إلى الجين: تكبير متدرج', titleEn: 'Zooming from Chromosome to Nucleosome to DNA to Gene', tags: 'كروموسوم نيوكليوسوم هستون جين DNA تكدس',
    formula: '\\text{كروموسوم} \\to \\text{نيوكليوسوم} \\to \\text{DNA} \\to \\text{جين}',
    book: 'الشكل (1) ص 20: العلاقة بين الكروموسوم و DNA؛ الشكل (2) ص 20: النيوكليوسوم = 8 جزيئات هستون + جزيء بروتيني تاسع يلتف حولها DNA مرتين.',
    summary: 'المعلومات الوراثية محمولة على الكروموسومات. كبّر الكروموسوم تدريجياً لترى أنه DNA ملتف حول بروتينات الهستون (النيوكليوسومات)، وأن الجين جزء محدد من DNA.',
    vars: [['\\text{مستوى التكبير}', 'المستوى المعروض', '—', '5 مستويات'], ['\\text{الهستون}', 'عدد جزيئات الهستون في الخرزة', '\\text{جزيء}', '8 + جزيء تاسع (ص 20)'], ['\\text{عدد اللفات}', 'التفاف DNA حول الخرزة', '\\text{لفة}', '2 (ص 20)']],
    assumptions: ['الرسوم تخطيطية (نموذج مبسّط لأغراض التعليم)؛ الأعداد المذكورة (8 + 1 هستون، لفتان) من الكتاب.'],
    params: [{ key: 'lv', label: '\\text{مستوى التكبير}', type: 'stage', stages: LEVELS, value: 0 }],
    play: { mode: 'stage', key: 'lv', interval: 2.2 }, initState: () => ({ t: 0 }), tick(st, p, d, dt) { st.t += dt; },
    canvasHint: 'اضغط على أي مستوى في الشريط العلوي، أو على المربع المضيء لتكبيره.',
    compute(p) { return {}; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = narrow(W); const t = (d.st && d.st.t) || 0;
      const bw = (W - 16) / LEVELS.length;
      LEVELS.forEach((l, i) => { const x = W - 8 - (i + 1) * bw; B.card(ctx, D, x + 2, 6, bw - 4, 30, nar ? (i + 1) + '' : l.replace(/ \(.*\)/, ''), { fill: i === p.lv ? '#7c3aed' : i < p.lv ? '#ddd6fe' : '#f1f5f9', color: i === p.lv ? '#fff' : '#334155', size: nar ? 13 : 12 }); d.hits.push({ id: 'lv' + i, x: x, y: 6, w: bw, h: 30 }); });
      const cx = W / 2, cy = (H + 40) / 2, S0 = Math.min(W, H - 60) * 0.42;
      const box = (x, y, s) => { ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 3; ctx.setLineDash([6, 4]); ctx.strokeRect(x - s / 2, y - s / 2, s, s); ctx.setLineDash([]); d.hits.push({ id: 'next', x: x - s / 2, y: y - s / 2, w: s, h: s }); };
      if (p.lv === 0) {
        B.chromosome(ctx, cx, cy, S0 * 1.5, 0.5, '#7c3aed', true, 26); B.chromosome(ctx, cx, cy, S0 * 1.5, -0.5, '#7c3aed', true, 26);
        D.txt(ctx, 'كروماتيد', cx + S0 * 0.55, cy - S0 * 0.6, { color: c.text, size: 13, w: '700' }); D.txt(ctx, 'سنترومير', cx + 46, cy, { color: c.text, size: 13, w: '700', align: 'left' });
        box(cx - S0 * 0.28, cy - S0 * 0.45, S0 * 0.22);
      } else if (p.lv === 1) {
        ctx.strokeStyle = '#7c3aed'; ctx.lineWidth = 5; ctx.beginPath();
        for (let i = 0; i <= 400; i++) { const u = i / 400; const x = cx - S0 + u * 2 * S0 + Math.cos(u * 60) * S0 * 0.12, y = cy + Math.sin(u * 60) * S0 * 0.28; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
        D.txt(ctx, 'ألياف كروماتين ملتفة', cx, cy + S0 * 0.5, { color: c.text, size: 13, w: '700' }); box(cx + S0 * 0.25, cy, S0 * 0.4);
      } else if (p.lv === 2) {
        // ثلاثة نيوكليوسومات متصلة بخيط DNA
        for (let k = -1; k <= 1; k++) {
          const nx = cx + k * S0 * 0.75, ny = cy; const r = S0 * (k === 0 ? 0.24 : 0.16);
          for (let j = 0; j < 8; j++) { const a = j * Math.PI / 4 + 0.3; B.blob(ctx, nx + Math.cos(a) * r * 0.45, ny + Math.sin(a) * r * 0.45, r * 0.33, r * 0.33, j % 2 ? '#38bdf8' : '#0ea5e9', '#0369a1', 1.5); }
          ctx.strokeStyle = '#dc2626'; ctx.lineWidth = k === 0 ? 4 : 3; ctx.beginPath(); for (let i = 0; i <= 120; i++) { const a = i / 120 * Math.PI * 4 + t * (k === 0 ? 0.6 : 0); const rr = r * (0.95 + 0.06 * Math.sin(a * 2)); ctx.lineTo(nx + Math.cos(a) * rr, ny + Math.sin(a) * rr * 0.9 + (i / 120 - 0.5) * r * 0.25); } ctx.stroke();
          B.blob(ctx, nx + r * 1.05, ny + r * 0.55, r * 0.22, r * 0.22, '#facc15', '#a16207', 1.5);
          if (k < 1) { ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(nx + r * 1.1, ny + r * 0.3); ctx.quadraticCurveTo(nx + S0 * 0.4, ny + S0 * 0.25, nx + S0 * 0.75 - S0 * 0.16, ny + S0 * 0.05); ctx.stroke(); }
        }
        D.txt(ctx, '8 جزيئات هستون (خرزات)', cx, cy - S0 * 0.42, { color: '#0369a1', size: 13, w: '800' });
        D.txt(ctx, 'DNA يلتف مرتين', cx - S0 * 0.55, cy + S0 * 0.45, { color: '#dc2626', size: 13, w: '800' });
        D.txt(ctx, 'جزيء بروتيني تاسع', cx + S0 * 0.4, cy + S0 * 0.5, { color: '#a16207', size: 13, w: '800' });
        box(cx - S0 * 0.75, cy - S0 * 0.02, S0 * 0.34);
      } else {
        // لولب مزدوج مبسط
        const n = 16, x0 = cx - S0 * 1.05, w = S0 * 2.1;
        for (let i = 0; i < n; i++) {
          const u = i / (n - 1); const x = x0 + u * w; const ph = u * Math.PI * 3 + t * 0.8; const y1 = cy + Math.sin(ph) * S0 * 0.28, y2 = cy - Math.sin(ph) * S0 * 0.28;
          const bs = 'ATGCGATCCGTAGCAT'[i]; const inGene = p.lv === 4 && i >= 5 && i <= 10;
          ctx.strokeStyle = BC[bs]; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, (y1 + y2) / 2); ctx.stroke(); ctx.strokeStyle = BC[{ A: 'T', T: 'A', G: 'C', C: 'G' }[bs]]; ctx.beginPath(); ctx.moveTo(x, (y1 + y2) / 2); ctx.lineTo(x, y2); ctx.stroke();
          if (inGene) { ctx.fillStyle = 'rgba(250,204,21,.25)'; ctx.fillRect(x - w / n / 2, cy - S0 * 0.4, w / n, S0 * 0.8); }
        }
        [1, -1].forEach((sg) => { ctx.strokeStyle = sg > 0 ? '#1d4ed8' : '#0f766e'; ctx.lineWidth = 6; ctx.beginPath(); for (let i = 0; i <= 200; i++) { const u = i / 200; const ph = u * Math.PI * 3 + t * 0.8; const x = x0 + u * w, y = cy + sg * Math.sin(ph) * S0 * 0.28; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); });
        if (p.lv === 4) { D.txt(ctx, 'جين', x0 + w * 0.47, cy - S0 * 0.5, { color: '#a16207', size: 16, w: '800' }); }
        else { D.txt(ctx, 'سلسلتان ملتفتان بشكل لولبي', cx, cy + S0 * 0.52, { color: c.text, size: 13, w: '700' }); box(x0 + w * 0.47, cy, S0 * 0.5); }
      }
      B.para(ctx, D, LEVEL_TXT[p.lv], W / 2, H - 14, W - 30, { color: c.text, size: nar ? 11 : 13, bottom: true });
    },
    onPointer(type, x, y, p, st, api) {
      if (type !== 'down') return false; const h = api.hit(x, y); if (!h) return false;
      if (h.id === 'next') api.set('lv', Math.min(4, p.lv + 1)); else api.set('lv', +h.id.slice(2)); return false;
    },
    live(p) { return '\\text{' + (p.lv + 1) + '. ' + LEVELS[p.lv] + '}'; },
    results(p) { return [['المستوى', LEVELS[p.lv], false], ['الوصف (ص 20)', LEVEL_TXT[p.lv], false], ['مكونات الكروموسوم الرئيسة', 'DNA والبروتين (ص 19)', false]]; },
    steps() { return LEVELS.map((l, i) => l + ': ' + LEVEL_TXT[i]); },
    explain(a, b) { if (a.lv === b.lv) return []; return [(b.lv > a.lv ? 'كبّرت إلى ' : 'صغّرت إلى ') + '«' + LEVELS[b.lv] + '»: ' + LEVEL_TXT[b.lv]]; },
    learn: ['**اكتشاف المادة الوراثية (ص 19):** توصل العلماء (تجارب غريفث، وأفري، وهيرشي وتشيس) إلى أن العامل الوراثي يتركز في جزيء DNA.', '**تركيب الكروموسوم (ص 20):** DNA وبروتينات منها الهستون؛ ثمانية جزيئات هستون تشكل خرزة يلتف حولها DNA مرتين حتى جزيء بروتيني تاسع = نيوكليوسوم.', '**الجين (ص 23):** جزء من DNA بتسلسل خاص من القواعد يمثل صفة محددة، وله موقع محدد على الكروموسوم.'],
    challenges: [
      { q: 'كبّر حتى ترى التركيب الذي يتكون من **8 جزيئات هستون وجزيء بروتيني تاسع**.', hint: 'المستوى الثالث.', init: { lv: 0 }, check: (p) => p.lv === 2 },
      { q: 'كبّر حتى تصل إلى **الجين**.', hint: 'آخر مستوى: جزء محدد من DNA.', init: { lv: 0 }, check: (p) => p.lv === 4 }
    ],
    tutor: [
      { q: 'ما النيوكليوسوم؟', k: ['نيوكليوسوم', 'هستون'], a: () => LEVEL_TXT[2] + ' (ص 20)' },
      { q: 'ما الفرق بين الجين والكروموسوم؟', k: ['جين', 'كروموسوم', 'الفرق'], a: () => 'الكروموسوم تركيب من DNA وبروتينات، والجين جزء صغير محدد من DNA على الكروموسوم يمثل صفة محددة.' }
    ]
  });

  /* ======================= 3-2 بناء النيوكليوتيد والسلسلة المكملة ======================= */
  reg({
    id: 'nucleotide-builder', order: 2, lesson: '3-2', lessonTitle: 'الحموض النووية', page: 21,
    titleAr: 'بناء النيوكليوتيدات والسلسلة المكملة', titleEn: 'Nucleotide & Complementary Strand Builder', tags: 'نيوكليوتيد قاعدة نيتروجينية ادينين ثايمين جوانين سايتوسين يوراسيل رايبوز رابطة هيدروجينية سلسلة مكملة متعاكسة RNA DNA',
    formula: '\\text{A} - \\text{T} : 2\\ \\text{روابط هيدروجينية} \\qquad \\text{G} - \\text{C} : 3\\ \\text{روابط هيدروجينية}',
    book: 'النيوكليوتيد = سكر خماسي + مجموعة فوسفات (على ذرة الكربون 5) + قاعدة نيتروجينية (على ذرة الكربون 1) (ص 21–22)؛ DNA سلسلتان متعاكستان في الاتجاه ترتبط قواعدهما بروابط هيدروجينية (الشكل 5، ص 22).',
    summary: 'اكتب تتابع القواعد لسلسلة DNA فتُبنى السلسلة المكملة لها تلقائياً: A مع T برابطتين هيدروجينيتين، و G مع C بثلاث روابط، والسلسلتان متعاكستان (′5 ← ′3). في RNA يوجد اليوراسيل U بدل الثايمين T والسكر رايبوزي.',
    vars: [['\\text{A, T, G, C}', 'أدينين، ثايمين، جوانين، سايتوسين (DNA)', '—', 'حروف مسموحة في DNA'], ['\\text{U}', 'يوراسيل (يحل محل T في RNA)', '—', 'في RNA فقط'], ['\\text{عدد الروابط}', 'مجموع الروابط الهيدروجينية بين السلسلتين', '\\text{رابطة}', '2 لكل A–T و 3 لكل G–C']],
    assumptions: ['يعرض النموذج سلسلة RNA وحدها؛ الكتاب يصف ارتباط سلسلتين بروابط هيدروجينية لجزيء DNA.'],
    params: [
      { key: 'type', label: '\\text{الحمض النووي}', type: 'select', options: [['DNA', 'DNA (سكر رايبوزي منقوص الأكسجين)'], ['RNA', 'RNA (سكر رايبوزي)']], value: 'DNA' },
      seqParam('ATGCGTA'),
      { key: 'ans', label: '\\text{أكمل السلسلة المتممة}', type: 'text', value: '', maxLength: 14, desc: 'اكتب المتممة بنفسك (اختياري)', normalize: B.normSeq, validate: (v) => (v === '' ? null : B.validateSeq(v, 'DNA')), hidden: (p) => p.type === 'RNA' },
      { key: 'hb', label: '\\text{الروابط الهيدروجينية}', type: 'toggle', value: true, on: 'إظهار الروابط', off: 'إخفاء الروابط' }
    ],
    onSet(p, key) { if (key === 'type') p.seq = p.type === 'RNA' ? p.seq.replace(/T/g, 'U') : p.seq.replace(/U/g, 'T'); },
    randomize(p) { const bs = B.BASES[p.type]; let s = ''; const n = 5 + Math.floor(Math.random() * 6); for (let i = 0; i < n; i++) s += bs[Math.floor(Math.random() * 4)]; return { seq: s }; },
    canvasHint: 'اضغط على أي قاعدة في السلسلة العلوية لتغييرها إلى القاعدة التالية، أو اكتب التتابع في أدوات التحكم.',
    compute(p) {
      const err = B.validateSeq(p.seq, p.type); if (err) return { err: err };
      if (p.type === 'RNA') { const s = B.normSeq(p.seq); return { seq: s, rna: true, n: s.length, u: (s.match(/U/g) || []).length }; }
      const r = B.complement(p.seq, 'DNA'); const ans = B.normSeq(p.ans || '');
      const marks = ans.split('').map((ch, i) => (ch === r.comp[i] ? '✓' : '✗'));
      return Object.assign({}, r, { rev: r.comp.split('').reverse().join(''), ans: ans, ansOk: ans.length === r.comp.length && ans === r.comp, ansRight: marks.filter((m) => m === '✓').length });
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = narrow(W); if (d.err) { D.txt(ctx, d.err, W / 2, H / 2, { color: c.c2, size: 14 }); return; }
      // نيوكليوتيد مكبر
      const ix = nar ? W / 2 : W * 0.82, iy = nar ? 64 : H * 0.3; const k = nar ? 0.8 : 1.1;
      B.blob(ctx, ix - 62 * k, iy, 15 * k, 15 * k, '#a855f7'); D.txt(ctx, 'فوسفات', ix - 62 * k, iy + 26 * k, { color: c.text, size: 11, w: '700' });
      ctx.fillStyle = d.rna ? '#fde68a' : '#fcd34d'; ctx.beginPath(); for (let q = 0; q < 5; q++) { const a = -Math.PI / 2 + q * Math.PI * 2 / 5; ctx.lineTo(ix + Math.cos(a) * 22 * k, iy + Math.sin(a) * 22 * k); } ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#92400e'; ctx.stroke();
      D.txt(ctx, d.rna ? 'سكر رايبوزي' : 'سكر رايبوزي منقوص الأكسجين', ix, iy + 34 * k, { color: c.text, size: 11, w: '700' });
      ctx.strokeStyle = c.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ix - 47 * k, iy); ctx.lineTo(ix - 20 * k, iy - 6 * k); ctx.moveTo(ix + 20 * k, iy - 6 * k); ctx.lineTo(ix + 40 * k, iy - 6 * k); ctx.stroke();
      D.txt(ctx, 'C5', ix - 26 * k, iy - 18 * k, { color: c.c2, size: 10, w: '800' }); D.txt(ctx, 'C1', ix + 24 * k, iy - 18 * k, { color: c.c2, size: 10, w: '800' });
      const b0 = d.seq[0]; ctx.fillStyle = BC[b0]; D.rr(ctx, ix + 40 * k, iy - 20 * k, 30 * k, 28 * k, 5); ctx.fill(); D.txt(ctx, b0, ix + 55 * k, iy - 6 * k, { color: '#fff', size: 14, w: '800' }); D.txt(ctx, 'قاعدة نيتروجينية', ix + 55 * k, iy + 20 * k, { color: c.text, size: 11, w: '700' });
      D.txt(ctx, 'نيوكليوتيد ' + p.type, ix, iy - 42 * k, { color: c.c5, size: 13, w: '800' });
      // السلم
      const lw = nar ? W - 40 : W * 0.62, lx = nar ? 20 : 30, ly = nar ? 150 : H * 0.28;
      const hits = ladder(ctx, d.seq, d.rna ? null : d.comp, lx, ly, lw, c, { hb: p.hb, ribose: d.rna, gap: nar ? 70 : 90, botCol: '#0f766e' });
      hits.filter((h) => h.dir > 0).forEach((h) => d.hits.push({ id: 'b' + h.i, x: h.x, y: h.y, w: h.w, h: h.h }));
      D.txt(ctx, 'السلسلة المكتوبة', lx + lw / 2, ly - 18, { color: c.c1, size: 12, w: '800' });
      if (!d.rna) D.txt(ctx, 'السلسلة المكملة (متعاكسة الاتجاه)', lx + lw / 2, ly + (nar ? 70 : 90) + 22, { color: '#0f766e', size: 12, w: '800' });
      const sy = nar ? H - 70 : H * 0.78;
      B.para(ctx, D, d.rna ? 'عدد النيوكليوتيدات: ' + d.n + '  •  عدد قواعد U: ' + d.u : 'أزواج A–T: ' + d.at + ' × 2   +   أزواج G–C: ' + d.gc + ' × 3   =   ' + d.hBonds + ' رابطة هيدروجينية', W / 2, sy, W - 30, { color: c.text, size: nar ? 12 : 15, w: '800' });
    },
    onPointer(type, x, y, p, st, api) {
      if (type !== 'down') return false; const h = api.hit(x, y); if (!h) return false;
      const i = +h.id.slice(1); const bs = B.BASES[p.type]; const s = B.normSeq(p.seq); const nb = bs[(bs.indexOf(s[i]) + 1) % 4];
      api.set('seq', s.slice(0, i) + nb + s.slice(i + 1)); return false;
    },
    live(p, d) { if (d.err) return '\\text{تتابع غير صالح}'; return d.rna ? '\\text{RNA: ' + d.seq + '}' : '\\text{' + d.seq + '} \\to \\text{' + d.comp + '}'; },
    results(p, d) {
      if (d.err) return [['خطأ في الإدخال', d.err, false]];
      if (d.rna) return [['تتابع RNA', d.seq, false], ['عدد النيوكليوتيدات', '' + d.n, false], ['السكر', 'رايبوزي', false], ['القاعدة البديلة للثايمين', 'اليوراسيل U (عددها ' + d.u + ')', false]];
      return [['السلسلة المكتوبة (′5 ← ′3)', d.seq, false], ['السلسلة المكملة (′3 ← ′5)', d.comp, false], ['المكملة مقروءة من ′5', d.rev, false], ['أزواج A–T', '' + d.at, false], ['أزواج G–C', '' + d.gc, false], ['مجموع الروابط الهيدروجينية', d.at + ' \\times 2 + ' + d.gc + ' \\times 3 = ' + d.hBonds]].concat(d.ans ? [['إجابتك للسلسلة المتممة', d.ans + (d.ansOk ? ' ✅ صحيحة' : ' ❌ ' + d.ansRight + ' قواعد صحيحة من ' + d.pairs), false]] : []);
    },
    steps(p, d) { if (d.err || d.rna) return ['في RNA: السكر رايبوزي، ويوجد U بدل T (ص 21–22).']; return ['قابل كل قاعدة بمكملتها: A ↔ T و G ↔ C.', 'المكملة: ' + d.comp + ' (السلسلتان متعاكستان في الاتجاه).', 'الروابط: ' + d.at + ' × 2 + ' + d.gc + ' × 3 = ' + d.hBonds + '.']; },
    explain(a, b, da, db) {
      if (a.type !== b.type) return [b.type === 'RNA' ? 'تحولت إلى RNA: تغيّر السكر إلى رايبوزي، واستُبدل كل T بـ U لأن اليوراسيل يوجد في RNA بدلاً من الثايمين.' : 'تحولت إلى DNA: السكر رايبوزي منقوص الأكسجين، واستُبدل كل U بـ T، وظهرت السلسلة المكملة.'];
      if (a.seq !== b.seq && !db.err && !db.rna) return ['تغير التتابع فتغيرت المكملة إلى ' + db.comp + '. عدد الروابط الهيدروجينية الآن ' + db.hBonds + (da && !da.err && !da.rna ? ' (كان ' + da.hBonds + ')' : '') + '؛ كل زوج G–C يضيف 3 روابط وكل زوج A–T رابطتين.'];
      return [];
    },
    learn: ['**النيوكليوتيد (ص 21–22):** جزيء سكر خماسي + مجموعة فوسفات ترتبط بذرة الكربون رقم 5 + قاعدة نيتروجينية ترتبط بذرة الكربون رقم 1، بروابط تساهمية.', '**السكر:** رايبوزي في RNA، ورايبوزي منقوص الأكسجين في DNA.', '**القواعد:** في DNA: A و T و G و C؛ وفي RNA يوجد اليوراسيل U بدلاً من الثايمين.', '**DNA (الشكل 5):** سلسلتان ملتفتان بشكل لولبي ترتبط قواعدهما بروابط هيدروجينية، والسلسلتان متعاكستان في الاتجاه (′5 – ′3).'],
    challenges: [
      { q: 'اكتب سلسلة DNA من **4 قواعد** يكون عدد الروابط الهيدروجينية بينها وبين مكملتها **12**.', hint: 'كل زوج يجب أن يعطي 3 روابط: استعمل G و C فقط.', init: { type: 'DNA', seq: 'ATAT' }, check: (p, d) => !d.err && !d.rna && d.pairs === 4 && d.hBonds === 12 },
      { q: 'أكمل بنفسك السلسلة المتممة للتسلسل **ATTGCA** في خانة «أكمل السلسلة المتممة».', hint: 'A ↔ T و G ↔ C: المتممة TAACGT.', init: { type: 'DNA', seq: 'ATTGCA', ans: '' }, check: (p, d) => !d.err && !d.rna && d.seq === 'ATTGCA' && d.ansOk },
      { q: 'اجعل السلسلة المكملة **TACG**.', hint: 'المكملة لـ A هي T، ولـ T هي A، ولـ G هي C، ولـ C هي G.', init: { type: 'DNA', seq: 'GGGG' }, check: (p, d) => !d.err && d.comp === 'TACG' },
      { q: 'حوّل إلى **RNA** واكتب تتابعاً يحتوي **3 قواعد يوراسيل** على الأقل.', hint: 'في RNA يحل U محل T.', init: { type: 'DNA', seq: 'GCGC' }, check: (p, d) => d.rna && d.u >= 3 }
    ],
    tutor: [
      { q: 'كم رابطة هيدروجينية الآن؟', k: ['رابطه', 'روابط', 'هيدروجين'], a: (p, d) => (d.err || d.rna ? 'الروابط تُحسب بين سلسلتي DNA. اختر DNA.' : 'أزواج A–T: ' + d.at + ' × 2 = ' + d.at * 2 + '، وأزواج G–C: ' + d.gc + ' × 3 = ' + d.gc * 3 + '، المجموع ' + d.hBonds + '.') },
      { q: 'لماذا لا يُقبل الحرف U في DNA؟', k: ['u', 'يوراسيل', 'لا يقبل'], a: () => 'لأن اليوراسيل U يوجد في RNA بدلاً من الثايمين T، أما DNA فقواعده A و T و G و C فقط (ص 22).' },
      { q: 'لماذا تسمى السلسلتان متعاكستين؟', k: ['متعاكس', '5', '3'], a: () => 'لأن إحدى السلسلتين تتجه من ′5 إلى ′3 والأخرى من ′3 إلى ′5، كما في الشكل (5) ص 22.' }
    ]
  });

  /* ======================= 5-2 تضاعف DNA (شبه المحافظ) ======================= */
  const REP_ST = ['جزيء DNA الأصلي'].concat(B.REPLICATION.map((r) => r.name + ' (' + r.enzyme + ')')).concat(['النتيجة: جزيئان متماثلان (شبه محافظ)']);
  reg({
    id: 'dna-replication', order: 3, lesson: '5-2', lessonTitle: 'تضاعف جزيء الـ DNA', page: 24,
    titleAr: 'تضاعف DNA: ثلاث مراحل وتضاعف شبه محافظ', titleEn: 'DNA Replication: Three Steps, Semi-conservative', tags: 'تضاعف DNA هيليكيز بلمرة لايغيز شبه محافظ الطور S',
    formula: '\\text{فك الالتواء} \\to \\text{ارتباط القواعد في أزواج} \\to \\text{إعادة ربط السلسلة}',
    book: 'آلية تضاعف DNA في ثلاث مراحل أساسية (ص 24): فك الالتواء بإنزيم هيليكيز، ارتباط القواعد في أزواج بإنزيمات بلمرة DNA، وإعادة ربط السلسلة بإنزيم ربط DNA لايغيز. يحدث التضاعف في المرحلة S، ويدعى شبه المحافظ.',
    summary: 'يتضاعف DNA في المرحلة S من دورة الخلية. تنفصل السلسلتان، وتصبح كل منهما قالباً تُبنى عليه سلسلة جديدة مكملة، فينتج جزيئان في كل منهما سلسلة أصلية (أزرق) وسلسلة جديدة (برتقالي): تضاعف شبه محافظ.',
    vars: [['\\text{المرحلة}', 'مراحل التضاعف بحسب الكتاب', '—', '3 مراحل + البداية والنتيجة'], ['\\text{التتابع}', 'السلسلة العلوية للجزيء الأصلي', '—', 'A ، T ، G ، C فقط'], ['\\text{النيوكليوتيدات الجديدة}', '2 × عدد الأزواج', '\\text{نيوكليوتيد}', 'من الحساب']],
    assumptions: ['يبدأ فك الالتواء في الرسم من طرف الجزيء ويتقدم على طوله (يتحرك الإنزيم على طول الجزيء)؛ الرسم نموذج مبسّط لأغراض التعليم.'],
    params: [
      { key: 'st', label: '\\text{المرحلة}', type: 'stage', stages: REP_ST, value: 0 },
      seqParam('ATGCCGTA', 'DNA'),
      { key: 'err', label: '\\text{خطأ في الربط}', type: 'toggle', value: false, on: 'يحدث خطأ ثم يُصحح', off: 'دون أخطاء' }
    ],
    play: { mode: 'stage', key: 'st', interval: 2.4 }, initState: () => ({ t: 0 }), tick(st, p, d, dt) { st.t += dt; },
    randomize() { const bs = 'ATGC'; let s = ''; const n = 6 + Math.floor(Math.random() * 5); for (let i = 0; i < n; i++) s += bs[Math.floor(Math.random() * 4)]; return { seq: s }; },
    canvasHint: 'الأزرق: السلاسل الأصلية. البرتقالي: السلاسل الجديدة. اضغط «تشغيل» لمتابعة المراحل.',
    compute(p) { const err = B.validateSeq(p.seq, 'DNA'); if (err) return { err: err }; const r = B.complement(p.seq, 'DNA'); return Object.assign(r, { added: 2 * r.pairs }); },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = narrow(W); if (d.err) { D.txt(ctx, d.err, W / 2, H / 2, { color: c.c2, size: 14 }); return; }
      const OLD = '#1d4ed8', NEW = '#ea580c'; const top = d.seq, bot = d.comp; const n = top.length;
      const lw = W - 60, lx = 30; const t = (d.st && d.st.t) || 0;
      D.txt(ctx, REP_ST[p.st], W / 2, 18, { color: c.c5, size: nar ? 13 : 16, w: '800' });
      const blank = (s, upto) => s.split('').map((ch, i) => (i < upto ? ch : ' ')).join('');
      const wrongAt = p.err ? Math.min(2, n - 1) : -1;
      const fix = (s, stage) => (wrongAt >= 0 && stage === 2 && s[wrongAt] !== ' ' ? s.slice(0, wrongAt) + { A: 'G', T: 'C', G: 'A', C: 'T' }[s[wrongAt]] + s.slice(wrongAt + 1) : s);
      const markWrong = (stage) => (i) => (wrongAt === i && stage === 2 ? '#dc2626' : null);
      if (p.st === 0) { ladder(ctx, top, bot, lx, H * 0.4, lw, c, { gap: 70 }); D.txt(ctx, 'سلسلتان أصليتان مرتبطتان بروابط هيدروجينية', W / 2, H * 0.4 + 120, { color: c.text, size: 13 }); }
      else if (p.st === 1) {
        // تنفصل السلسلتان؛ الهيليكيز يتحرك
        const prog = Math.min(1, 0.25 + ((t % 2.4) / 2.4) * 0.75); const cut = Math.round(prog * n);
        ladder(ctx, top, null, lx, H * 0.25, lw, c, { topCol: OLD });
        ladder(ctx, bot, null, lx, H * 0.62, lw, c, { topCol: OLD });
        const hx = lx + lw * prog; B.blob(ctx, hx, H * 0.45, 26, 20, 'rgba(124,58,237,.85)', '#4c1d95', 2); D.txt(ctx, 'هيليكيز', hx, H * 0.45, { color: '#fff', size: 11, w: '800' });
        D.txt(ctx, 'كُسرت الروابط الهيدروجينية فانفصلت السلسلتان (' + cut + ' من ' + n + ')', W / 2, H - 18, { color: c.text, size: 13 });
      } else {
        const stage = p.st; const filled = stage === 2 ? Math.max(1, Math.round(Math.min(1, ((t % 2.4) / 2.0)) * n)) : n;
        const newTop = fix(blank(bot, filled), stage), newBot = fix(blank(top, filled), stage);
        ladder(ctx, top, newTop, lx, nar ? 60 : H * 0.12, lw, c, { topCol: OLD, botCol: NEW, gap: nar ? 56 : 70, mark: (i, dir) => (dir < 0 ? markWrong(stage)(i) : null) });
        ladder(ctx, newBot, bot, lx, nar ? H * 0.55 : H * 0.55, lw, c, { topCol: NEW, botCol: OLD, gap: nar ? 56 : 70 });
        const msg = stage === 2 ? (p.err ? 'إنزيمات بلمرة DNA تربط النيوكليوتيدات الجديدة بشكل متمم — حدث خطأ (أحمر) سيصححه نظام من الإنزيمات' : 'إنزيمات بلمرة DNA تربط النيوكليوتيدات الجديدة مع السلاسل القديمة بشكل متمم') : stage === 3 ? 'إنزيم لايغيز يربط السلسلتين، والجزيئات الناتجة متطابقة مع الأصلية' + (p.err ? ' (صُحح الخطأ)' : '') : 'كل جزيء ناتج = سلسلة أصلية (أزرق) + سلسلة جديدة (برتقالي)';
        B.para(ctx, D, msg, W / 2, H - 14, W - 30, { color: c.text, size: nar ? 11 : 13, bottom: true });
        if (stage >= 3) { D.txt(ctx, 'الجزيء الأول', W - 12, nar ? 40 : H * 0.12 - 22, { color: c.c3, size: 12, w: '800', align: 'right' }); D.txt(ctx, 'الجزيء الثاني', W - 12, H * 0.55 - 22, { color: c.c3, size: 12, w: '800', align: 'right' }); }
      }
    },
    live(p, d) { return d.err ? '\\text{تتابع غير صالح}' : '\\text{' + REP_ST[p.st].replace(/ \(.*\)/, '') + '}'; },
    results(p, d) {
      if (d.err) return [['خطأ في الإدخال', d.err, false]];
      return [['المرحلة', REP_ST[p.st], false], ['الإنزيم', p.st >= 1 && p.st <= 3 ? B.REPLICATION[p.st - 1].enzyme : '—', false], ['عدد الأزواج في الجزيء الأصلي', '' + d.pairs, false], ['النيوكليوتيدات الجديدة اللازمة', '2 \\times ' + d.pairs + ' = ' + d.added], ['في كل جزيء ناتج', 'سلسلة أصلية + سلسلة جديدة', false]];
    },
    steps() { return B.REPLICATION.map((r, i) => (i + 1) + ') ' + r.name + ' — ' + r.enzyme + ': ' + r.text); },
    explain(a, b) { if (a.st !== b.st && b.st >= 1 && b.st <= 3) return [B.REPLICATION[b.st - 1].text]; if (a.st !== b.st && b.st === 4) return ['نتج جزيئان متماثلان، في كل منهما سلسلة من الجزيء الأصلي وسلسلة جديدة؛ لذلك يدعى التضاعف **شبه المحافظ**.']; if (a.err !== b.err) return [b.err ? 'قد تحدث أخطاء في ترتيب القواعد أثناء ربطها، لكن هناك نظاماً من الإنزيمات يعمل على تصويبها (ص 24).' : 'أُلغي الخطأ.']; return []; },
    learn: ['**متى؟ (ص 24):** في المرحلة S (مرحلة بناء DNA) من دورة الخلية.', '**المرحلة الأولى — فك الالتواء:** يتحرك إنزيم هيليكيز على طول جزيء DNA اللولبي المزدوج فيفك الالتواء ويفصل السلسلتين، ثم ترتبط بروتينات خاصة بجزيء DNA.', '**المرحلة الثانية — ارتباط القواعد في أزواج:** تربط إنزيمات بلمرة DNA النيوكليوتيدات الجديدة مع السلاسل القديمة بشكل متمم.', '**المرحلة الثالثة — إعادة ربط السلسلة:** يربط إنزيم ربط DNA لايغيز السلسلتين، وتكون الجزيئات الناتجة متطابقة مع الأصلية.', '**التصحيح:** قد تحدث أخطاء في ترتيب القواعد، لكن نظاماً من الإنزيمات يصوّبها.'],
    challenges: [
      { q: 'انتقل إلى المرحلة التي يعمل فيها **إنزيم هيليكيز**.', hint: 'المرحلة الأولى: فك الالتواء.', init: { st: 4 }, check: (p) => p.st === 1 },
      { q: 'انتقل إلى المرحلة التي **تُربط فيها النيوكليوتيدات الجديدة** بالسلاسل القديمة.', hint: 'إنزيمات بلمرة DNA.', init: { st: 0 }, check: (p) => p.st === 2 },
      { q: 'اكتب جزيئاً أصلياً من **5 أزواج** وانتقل إلى النتيجة. كم نيوكليوتيداً جديداً استُعمل؟ (يجب أن يظهر 10)', hint: 'كل سلسلة أصلية تُبنى عليها سلسلة جديدة بطولها.', init: { st: 0, seq: 'ATGC' }, check: (p, d) => !d.err && d.pairs === 5 && p.st === 4 }
    ],
    tutor: [
      { q: 'لماذا يسمى التضاعف شبه محافظ؟', k: ['شبه', 'محافظ'], a: () => 'لأن كل جزيء ناتج يحتفظ بإحدى سلسلتي الجزيء الأصلي (محفوظة) ويضاف إليها سلسلة جديدة.' },
      { q: 'ماذا يحدث لو لم يعمل إنزيم هيليكيز؟', k: ['لو لم', 'هيليكيز', 'لم يعمل'], a: () => 'إنزيم هيليكيز يفك التواء جزيء DNA ويفصل السلسلتين (المرحلة الأولى، ص 24). إن لم يعمل تبقى السلسلتان مرتبطتين، فلا تجد إنزيمات بلمرة DNA سلسلة مفردة تربط عليها النيوكليوتيدات الجديدة، فلا يتضاعف DNA.' },
      { q: 'ما وظيفة كل إنزيم؟', k: ['انزيم', 'هيليكيز', 'لايغيز', 'بلمره'], a: () => B.REPLICATION.map((r) => r.enzyme + ': ' + r.name).join('؛ ') + '.' },
      { q: 'متى يتضاعف DNA؟', k: ['متى', 'مرحله s', 'يتضاعف'], a: () => 'في المرحلة S من الطور البيني في دورة الخلية (ص 24، ص 36).' }
    ]
  });

  /* ======================= 6-2 الطفرات ======================= */
  const KINDS = [['delete', 'طفرة جينية: حذف قاعدة'], ['insert', 'طفرة جينية: إضافة قاعدة'], ['substitute', 'طفرة جينية: استبدال قاعدة'], ['plus', 'طفرة كروموسومية: زيادة في العدد'], ['minus', 'طفرة كروموسومية: نقصان في العدد'], ['struct', 'طفرة كروموسومية: تغيير في التركيب']];
  const chromKind = (k) => ['plus', 'minus', 'struct'].indexOf(k) >= 0;
  reg({
    id: 'mutations', order: 4, lesson: '6-2', lessonTitle: 'الطفرات', page: 25,
    titleAr: 'الطفرات: الجينية والكروموسومية', titleEn: 'Mutations: Gene and Chromosomal', tags: 'طفره جينيه كروموسوميه حذف اضافه استبدال تغير مفاجئ',
    formula: '\\text{الطفرة: تغيّر مفاجئ في المادة الوراثية}',
    book: 'الطفرة الجينية: تغير في التركيب الكيميائي للجين (حذف أو إضافة أو استبدال لواحدة أو أكثر من القواعد النيتروجينية). الطفرة الكروموسومية: تغيير في عدد الكروموسومات أو في تركيبها (ص 26).',
    summary: 'اختر نوع الطفرة وموقعها وشاهد أثرها على تتابع القواعد أو على الكروموسومات. الطفرة الجينية قد ينتج عنها بروتين مختلف يسبب ظهور صفة جديدة مرغوبة أو غير مرغوبة.',
    vars: [['\\text{نوع الطفرة}', 'جينية (حذف/إضافة/استبدال) أو كروموسومية (عدد/تركيب)', '—', '6 خيارات'], ['\\text{الموقع}', 'رقم القاعدة في التتابع', '—', '1 – طول التتابع'], ['\\text{القاعدة}', 'القاعدة المضافة أو البديلة', '—', 'A ، T ، G ، C']],
    assumptions: ['رسم الطفرة الكروموسومية نموذج مبسّط لأغراض التعليم (أربعة أزواج من الكروموسومات للتوضيح)؛ الكتاب يذكر الأنواع دون تفاصيل أشكالها.'],
    params: [
      { key: 'kind', label: '\\text{نوع الطفرة}', type: 'select', options: KINDS, value: 'substitute' },
      seqParam('ATGCCGTAA', 'DNA'),
      { key: 'pos', label: '\\text{موقع القاعدة}', min: 1, max: 14, step: 1, int: true, value: 4, hidden: (p) => chromKind(p.kind) },
      { key: 'base', label: '\\text{القاعدة الجديدة}', type: 'select', options: [['A', 'A أدينين'], ['T', 'T ثايمين'], ['G', 'G جوانين'], ['C', 'C سايتوسين']], value: 'T', hidden: (p) => p.kind === 'delete' || chromKind(p.kind) }
    ],
    compute(p) {
      if (chromKind(p.kind)) return { chrom: true };
      const err = B.validateSeq(p.seq, 'DNA'); if (err) return { err: err };
      const s = B.normSeq(p.seq); const lim = p.kind === 'insert' ? s.length + 1 : s.length; const pos = Math.min(p.pos, lim);
      if (p.kind === 'delete' && s.length < 2) return { err: 'الحذف يحتاج تتابعاً من قاعدتين على الأقل.' };
      const r = B.mutate(s, p.kind, pos - 1, p.base); return Object.assign(r, { pos: pos, posClamped: pos !== p.pos });
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = narrow(W);
      if (d.err) { D.txt(ctx, d.err, W / 2, H / 2, { color: c.c2, size: 14 }); return; }
      if (d.chrom) {
        const pairs = 4; const cols = ['#2563eb', '#059669', '#d97706', '#db2777']; const lens = [0.32, 0.26, 0.21, 0.16].map((f) => f * H);
        const draw = (y0, mode, title) => {
          D.txt(ctx, title, W / 2, y0 - 12, { color: c.text, size: 13, w: '800' });
          const gw = (W - 40) / pairs;
          for (let k = 0; k < pairs; k++) {
            const gx = 20 + gw * (k + 0.5); let copies = 2; if (mode === 'plus' && k === 2) copies = 3; if (mode === 'minus' && k === 2) copies = 1;
            for (let j = 0; j < copies; j++) {
              const x = gx + (j - (copies - 1) / 2) * 22; const L = lens[k] * 0.9; const yc = y0 + lens[0] * 0.55;
              B.chromosome(ctx, x, yc, L, 0, cols[k], true, 9);
              if (mode === 'struct' && k === 1 && j === 1) { ctx.fillStyle = c.bg; ctx.fillRect(x - 10, yc - L / 2 - 2, 20, L * 0.3); D.txt(ctx, 'حُذف مقطع', x + 26, yc - L * 0.3, { color: c.c2, size: 11, w: '800', align: 'left' }); }
            }
            if (mode !== 'normal' && ((mode !== 'struct' && k === 2) || (mode === 'struct' && k === 1))) { ctx.strokeStyle = c.c2; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.strokeRect(gx - gw * 0.42, y0 + 4, gw * 0.84, lens[0] * 1.05); ctx.setLineDash([]); }
          }
        };
        draw(34, 'normal', 'الكروموسومات الطبيعية (أزواج متماثلة)');
        draw(H * 0.52, p.kind, p.kind === 'plus' ? 'بعد الطفرة: كروموسوم زائد' : p.kind === 'minus' ? 'بعد الطفرة: نقص كروموسوم' : 'بعد الطفرة: تغيّر في تركيب كروموسوم');
        return;
      }
      const lw = Math.min(W - 60, (Math.max(d.seq.length, d.out.length)) * 54), lx = (W - lw) / 2;
      const ya = H * 0.2, yb = H * 0.56;
      D.txt(ctx, 'التتابع الأصلي', W / 2, ya - 22, { color: c.c1, size: 13, w: '800' });
      const n = Math.max(d.seq.length, d.out.length); const a = d.seq.padEnd(n, ' '), b = d.out.padEnd(n, ' ');
      ladder(ctx, a, null, lx, ya, lw, c, { gap: 90, mark: (i) => (i === d.i && p.kind !== 'insert' ? '#fbbf24' : null) });
      D.txt(ctx, 'بعد الطفرة', W / 2, yb - 22, { color: c.c2, size: 13, w: '800' });
      ladder(ctx, b, null, lx, yb, lw, c, { gap: 90, topCol: '#be123c', mark: (i) => (a[i] !== b[i] ? (i === d.i && p.kind !== 'delete' ? '#dc2626' : '#f97316') : null) });
      const step = lw / n; ctx.strokeStyle = c.c2; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(lx + step * (d.i + 0.5), ya + 42); ctx.lineTo(lx + step * (d.i + 0.5), yb - 30); ctx.stroke(); ctx.setLineDash([]);
      B.para(ctx, D, d.kind === 'substitute' ? (d.changed ? 'تغيّرت قاعدة واحدة فقط' : 'القاعدة الجديدة مثل القديمة: لا طفرة') : 'تغيّر طول التتابع (' + (d.dLen > 0 ? '+1' : '-1') + ') وانزاحت القواعد التالية: ' + d.changed + ' موقع مختلف', W / 2, H - 18, W - 30, { color: c.text, size: nar ? 11 : 14, w: '700', bottom: true });
    },
    live(p, d) { if (d.err) return '\\text{تتابع غير صالح}'; if (d.chrom) return '\\text{' + KINDS.find((k) => k[0] === p.kind)[1] + '}'; return '\\text{' + d.seq + '} \\to \\text{' + d.out + '}'; },
    results(p, d) {
      if (d.err) return [['خطأ في الإدخال', d.err, false]];
      if (d.chrom) return [['نوع الطفرة', KINDS.find((k) => k[0] === p.kind)[1], false], ['التعريف (ص 26)', 'تغيير في عدد الكروموسومات أو في تركيبها، بسبب خلل أثناء الانقسام المنصف أو المتساوي', false], ['قد تصيب', 'الكروموسومات الجنسية أو الجسمية، زيادةً أو نقصاناً', false]];
      return [['التتابع الأصلي', d.seq, false], ['بعد الطفرة', d.out, false], ['التغير في الطول', (d.dLen > 0 ? '+' : '') + d.dLen + ' قاعدة', false], ['عدد المواقع المختلفة', '' + d.changed, false], ['الأثر المحتمل (ص 26)', 'ينتج بروتين مختلف يسبب ظهور صفة جديدة، قد تكون مرغوبة أو غير مرغوبة', false]].concat(d.posClamped ? [['ملاحظة', 'عُدّل الموقع إلى ' + d.pos + ' لأن التتابع أقصر', false]] : []);
    },
    steps(p, d) { if (d.err || d.chrom) return ['الطفرة الكروموسومية تحدث بسبب خلل أثناء الانقسام المنصف أو المتساوي (ص 26).']; return ['حدد الموقع ' + d.pos + ' في التتابع ' + d.seq + '.', p.kind === 'delete' ? 'احذف القاعدة ' + d.seq[d.i] + '.' : p.kind === 'insert' ? 'أضف القاعدة ' + p.base + ' قبل الموقع ' + d.pos + '.' : 'استبدل ' + d.seq[d.i] + ' بـ ' + p.base + '.', 'الناتج: ' + d.out + '.']; },
    explain(a, b, da, db) {
      if (a.kind !== b.kind) return [chromKind(b.kind) ? 'الطفرة الكروموسومية تغيّر عدد الكروموسومات أو تركيبها، فتؤثر في عدد كبير من الجينات معاً.' : b.kind === 'substitute' ? 'الاستبدال يغيّر قاعدة واحدة ويبقى طول التتابع ثابتاً.' : 'الحذف أو الإضافة يغيّر طول التتابع، فتنزاح كل القواعد بعد موقع الطفرة.'];
      if (!db.err && !db.chrom && (a.pos !== b.pos || a.base !== b.base || a.seq !== b.seq)) return ['الناتج الآن ' + db.out + '؛ عدد المواقع المختلفة عن الأصل ' + db.changed + '.'];
      return [];
    },
    learn: ['**الطفرة (ص 25–26):** تغيّر مفاجئ في المادة الوراثية، تُعد مؤثرة إذا نتج عنها تغيّر في الصفات.', '**الطفرة الجينية:** تغير في التركيب الكيميائي للجين: حذف أو إضافة أو استبدال لواحدة أو أكثر من القواعد النيتروجينية في جزيء DNA، فينتج بروتين مختلف يسبب ظهور صفة جديدة قد تكون مرغوبة أو غير مرغوبة.', '**الطفرة الكروموسومية:** تغيير في عدد الكروموسومات أو في تركيبها، يحدث بسبب خلل أثناء الانقسام المنصف أو المتساوي، وقد يصيب الكروموسومات الجنسية أو الجسمية زيادةً أو نقصاناً.'],
    challenges: [
      { q: 'أحدث طفرة **حذف** تجعل التتابع ATGCCGTAA يصبح **ATGCGTAA**.', hint: 'احذف إحدى قاعدتي C (الموقع 4 أو 5).', init: { kind: 'substitute', seq: 'ATGCCGTAA', pos: 1 }, check: (p, d) => !d.err && !d.chrom && p.kind === 'delete' && d.out === 'ATGCGTAA' },
      { q: 'أحدث طفرة **استبدال** في الموقع 3 تجعل G تصبح A.', hint: 'نوع الطفرة: استبدال، الموقع 3، القاعدة A.', init: { kind: 'delete', seq: 'ATGCCGTAA', pos: 1, base: 'T' }, check: (p, d) => !d.err && !d.chrom && p.kind === 'substitute' && d.i === 2 && d.out[2] === 'A' && d.seq[2] === 'G' },
      { q: 'اعرض طفرة كروموسومية بـ **زيادة** في عدد الكروموسومات.', hint: 'اختر «طفرة كروموسومية: زيادة في العدد».', init: { kind: 'substitute' }, check: (p) => p.kind === 'plus' }
    ],
    tutor: [
      { q: 'ما الفرق بين الطفرة الجينية والكروموسومية؟', k: ['الفرق', 'جينيه', 'كروموسوميه'], a: () => 'الجينية تغيّر قاعدة أو أكثر داخل جين (حذف/إضافة/استبدال)، أما الكروموسومية فتغيّر عدد الكروموسومات أو تركيبها (ص 26).' },
      { q: 'لماذا يغيّر الحذف قواعد كثيرة؟', k: ['الحذف', 'كثير', 'تنزاح'], a: () => 'لأن حذف قاعدة يقصّر التتابع فتنزاح كل القواعد بعدها موقعاً واحداً، فيختلف ترتيبها كله بعد موقع الطفرة.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
