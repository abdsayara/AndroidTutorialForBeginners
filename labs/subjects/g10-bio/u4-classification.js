/* العلوم الحياتية — الوحدة الرابعة: تصنيف الكائنات الحية (ص 96–122) */
(function (root) {
  'use strict';
  const ML = root.ML; const B = ML.bio; const D = ML.pdraw;
  const S = 'g10-bio';
  const reg = (o) => ML.register(Object.assign({ subject: S, custom: true }, o));
  const narrow = (W) => W < 640;

  /* ======================= 1-1 / 3-1 التصنيف: المجالات والممالك ومستويات التصنيف ======================= */
  // الشكل (1) ص 99: مخطط تصنيف الكائنات الحية
  const SUB = {
    'مملكة الطلائعيات': ['شبيهة الحيوانات', 'شبيهة النباتات', 'شبيهة الفطريات'],
    'مملكة الفطريات': ['اللزجية', 'الاقترانية', 'الغلوميرية', 'الكيسية (الزقية)', 'الدعامية (البازيدية)'],
    'المملكة الحيوانية': ['فقاريات: الفكيات (الأسماك الغضروفية والعظمية، البرمائيات، الزواحف، الطيور، الثدييات) واللافكيات', 'لافقاريات: المساميات، الجوفمعويات، الديدان الأسطوانية، الديدان الحلقية، الديدان المفلطحة، الرخويات، الجلد شوكيات، المفصليات'],
    'المملكة النباتية': ['وعائية: بذرية (ذوات الفلقة الواحدة، ذوات الفلقتين) ولا بذرية', 'لا وعائية'],
    'مملكة البكتيريا': ['—'], 'مملكة البكتيريا القديمة': ['—']
  };
  const LADDER_ST = B.CAT.map((x) => x.level + ' (' + x.en + ')');
  reg({
    id: 'taxonomy-ladder', unit: 9, order: 1, lesson: '1-1 / 3-1', lessonTitle: 'التصنيف الحديث ومستويات التصنيف', page: 99,
    titleAr: 'سلم التصنيف: من المملكة إلى النوع', titleEn: 'The Classification Ladder: Kingdom to Species', tags: 'تصنيف مجالات ممالك مملكه قبيله صف رتبه عائله جنس نوع قط Felis',
    formula: '\\text{مملكة} \\to \\text{قبيلة} \\to \\text{صف} \\to \\text{رتبة} \\to \\text{عائلة} \\to \\text{جنس} \\to \\text{نوع}',
    book: 'الشكل (1) ص 99: مخطط تصنيف الكائنات الحية في ثلاثة مجالات وست ممالك؛ الشكل (2) ص 101: التصنيف الهرمي لقط منزلي؛ النوع هو الوحدة الأساسية في التصنيف (ص 101).',
    summary: 'رتب العلماء الكائنات الحية في مستويات هرمية: كلما نزلنا من المملكة إلى النوع قل عدد الكائنات في المجموعة وزادت الصفات المشتركة بينها. اعرض المخطط العام (الشكل 1) أو سلم تصنيف القط (الشكل 2).',
    vars: [['\\text{المستوى}', 'مستوى التصنيف', '—', '7 مستويات (الشكل 2)'], ['\\text{المجالات}', 'البكتيريا القديمة، البكتيريا، حقيقية النوى', '—', '3 مجالات و 6 ممالك']],
    assumptions: ['عدد النقاط في كل مستوى رمزي للدلالة على أن المجموعة تصغر كلما نزلنا في السلم (نموذج مبسّط لأغراض التعليم).'],
    params: [
      { key: 'view', label: '\\text{العرض}', type: 'select', options: [['ladder', 'سلم تصنيف القط (الشكل 2)'], ['tree', 'مخطط التصنيف العام (الشكل 1)']], value: 'ladder' },
      { key: 'lv', label: '\\text{مستوى التصنيف}', type: 'stage', stages: LADDER_ST, value: 0, hidden: (p) => p.view !== 'ladder' }
    ],
    initState: () => ({ king: 'المملكة الحيوانية' }), play: { mode: 'stage', key: 'lv', interval: 1.6 },
    randomize() { return { view: 'ladder', lv: Math.floor(Math.random() * 7) }; },
    canvasHint: 'في المخطط العام اضغط على أي مملكة لعرض أقسامها.',
    compute(p) { return { it: B.CAT[p.lv] }; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = narrow(W);
      if (p.view === 'ladder') {
        const n = B.CAT.length; const cx = W / 2, top = 14;
        for (let k = 0; k < n; k++) {
          const f = 1 - k / (n + 1.5); const w = (W - 20) * f, h = (H - 30) * f; const x = cx - w / 2, y = top + (H - 30) * (1 - f);
          D.rr(ctx, x, y, w, h, 14); ctx.fillStyle = k === p.lv ? 'rgba(124,58,237,.25)' : k < p.lv ? 'rgba(124,58,237,.06)' : 'rgba(148,163,184,.05)'; ctx.fill(); ctx.strokeStyle = k === p.lv ? '#7c3aed' : c.grid; ctx.lineWidth = k === p.lv ? 3 : 1.5; ctx.stroke();
          const it = B.CAT[k]; D.txt(ctx, it.level + ': ' + it.ar + ' — ' + it.la, x + w - 10, y + 14, { color: k === p.lv ? '#6d28d9' : c.text, size: nar ? 9.5 : 12, w: k === p.lv ? '800' : '600', align: 'right' });
          d.hits.push({ id: 'lv' + k, x: x, y: y, w: w, h: 26 });
        }
        // نقاط تمثل عدد الكائنات في المجموعة المختارة
        const f = 1 - p.lv / (n + 1.5); const w = (W - 20) * f, h = (H - 30) * f; const x = cx - w / 2, y = top + (H - 30) * (1 - f);
        const dots = [40, 26, 16, 10, 6, 3, 1][p.lv];
        for (let i = 0; i < dots; i++) { const a = i * 2.4, r = Math.min(w, h) * 0.33 * Math.sqrt((i + 0.5) / dots); B.blob(ctx, cx + Math.cos(a) * r, y + h * 0.55 + Math.sin(a) * r * 0.6, 6, 6, i === 0 ? '#f59e0b' : '#a78bfa'); }
        if (p.lv === 6) D.txt(ctx, 'Felis catus', cx, y + h * 0.55 + 22, { color: '#b45309', size: 15, w: '800' });
      } else {
        const st = d.st || {}; const king = st.king; const cols = B.DOMAINS.length; const dw = W / cols;
        D.txt(ctx, 'الكائنات الحية', W / 2, 16, { color: '#991b1b', size: 15, w: '800' });
        let kx = []; B.DOMAINS.forEach((dm, i) => { const x = W - dw * (i + 0.5); B.card(ctx, D, x - dw * 0.45, 34, dw * 0.9, 30, dm.name, { fill: '#bef264', color: '#365314', size: nar ? 9.5 : 12 }); dm.kingdoms.forEach((k, j) => kx.push([k, i, j, dm.kingdoms.length])); });
        const allK = kx.length; const kw = W / allK;
        kx.forEach((q, idx) => { const x = W - kw * (idx + 0.5), y = 92; const on = q[0] === king; B.card(ctx, D, x - kw * 0.46, y, kw * 0.92, 40, q[0].replace(/^(ال)?مملكة /, ''), { fill: on ? '#7c3aed' : '#e9d5ff', color: on ? '#fff' : '#581c87', size: nar ? 8.5 : 11 }); d.hits.push({ id: 'k:' + q[0], x: x - kw * 0.46, y: y, w: kw * 0.92, h: 40 }); const dx = W - dw * (q[1] + 0.5); ctx.strokeStyle = c.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(dx, 64); ctx.lineTo(x, y); ctx.stroke(); });
        if (king && SUB[king]) { D.txt(ctx, king, W / 2, 158, { color: '#6d28d9', size: 14, w: '800' }); SUB[king].forEach((sname, i) => B.para(ctx, D, '• ' + sname, W / 2, 184 + i * (nar ? 44 : 34), W - 40, { color: c.text, size: nar ? 10.5 : 13, w: '600' })); }
      }
    },
    onPointer(type, x, y, p, st, api) { if (type !== 'down') return false; const h = api.hit(x, y); if (!h) return false; if (h.id.indexOf('lv') === 0) { api.set('lv', +h.id.slice(2)); return false; } if (h.id.indexOf('k:') === 0) { st.king = h.id.slice(2); api.say(['**' + st.king + ':** ' + SUB[st.king].join('؛ ')]); return true; } return false; },
    live(p, d) { return p.view === 'ladder' ? '\\text{' + d.it.level + ': ' + d.it.ar + ' (' + d.it.la + ')}' : '\\text{3 مجالات} ,\\ \\text{6 ممالك}'; },
    results(p, d) { const st = d.st || {}; return p.view === 'ladder' ? [['المستوى', d.it.level + ' (' + d.it.en + ')', false], ['اسم المجموعة للقط', d.it.ar + ' — ' + d.it.la, false], ['الاسم العلمي للقط', 'Felis catus (الجنس + النوع)', false], ['المجال', 'حقيقية النوى', false]] : [['المجالات الثلاثة', B.DOMAINS.map((x) => x.name).join('، '), false], ['المملكة المختارة', st.king || '—', false], ['أقسامها (الشكل 1)', st.king ? SUB[st.king].join('؛ ') : '—', false]]; },
    steps() { return B.CAT.map((x) => x.level + ': ' + x.ar + ' (' + x.la + ')'); },
    explain(a, b) { if (a.view !== b.view) return [b.view === 'tree' ? 'الشكل (1): صنف العلماء الكائنات الحية في ثلاثة مجالات وست ممالك.' : 'الشكل (2): التصنيف الهرمي للقط المنزلي من المملكة إلى النوع.']; if (a.lv !== b.lv) return [(b.lv > a.lv ? 'نزلت إلى ' : 'صعدت إلى ') + B.CAT[b.lv].level + ': مجموعة ' + (b.lv > a.lv ? 'أصغر وصفاتها المشتركة أكثر.' : 'أكبر وصفاتها المشتركة أقل.')]; return []; },
    learn: ['**التصنيف الحديث (ص 98–99):** صنف العلماء الكائنات الحية في ثلاثة مجالات: البكتيريا القديمة، البكتيريا، حقيقية النوى؛ وست ممالك.', '**مستويات التصنيف (ص 100–101):** مملكة، قبيلة، صف، رتبة، عائلة، جنس، نوع.', '**النوع (ص 101):** الوحدة الأساسية في تصنيف الكائنات الحية؛ مجموعة من الأفراد المتشابهين في الطراز الشكلي والجيني، القادرين على التزاوج وإنتاج نسل خصب.', '**التصنيف الشكلي والجيني (ص 101):** الصفات الشكلية ترتبط بالتكوين الفيزيائي للكائن، والجينية بالتكوين الوراثي وتتابع القواعد في DNA.'],
    challenges: [
      { q: 'س1-2 (ص 102): ما الوحدة الأساسية في تصنيف الكائنات الحية؟ انتقل إليها في السلم.', hint: 'آخر مستوى.', init: { view: 'ladder', lv: 0 }, check: (p) => p.view === 'ladder' && p.lv === 6 },
      { q: 'انتقل إلى المستوى الذي يضم القطط والأسود وغيرها: **السنوريات**.', hint: 'العائلة (Family).', init: { view: 'ladder', lv: 0 }, check: (p) => p.view === 'ladder' && p.lv === 4 },
      { q: 'اعرض المخطط العام واضغط على المملكة التي تضم **شبيهة الحيوانات وشبيهة النباتات وشبيهة الفطريات**.', hint: 'مملكة الطلائعيات.', init: { view: 'ladder', lv: 0 }, check: (p, d) => p.view === 'tree' && d.st && d.st.king === 'مملكة الطلائعيات' }
    ],
    tutor: [
      { q: 'ما الاسم العلمي للقط؟', k: ['الاسم العلمي', 'القط'], a: () => 'من الشكل (2) ص 101: الجنس Felis والنوع catus، فالاسم العلمي Felis catus.' },
      { q: 'هل البغل نوع؟', k: ['بغل', 'نوع'], a: () => 'لا؛ البغل هجين من ذكر الحمار وأنثى الحصان، ولا يُعد نوعاً لأن النوع أفراد قادرون على التزاوج وإنتاج نسل خصب (ص 101).' },
      { q: 'لماذا فُصلت البكتيريا القديمة عن البكتيريا؟', k: ['البكتيريا القديمه', 'فصلت'], a: () => 'يعتمد التصنيف الحديث على الصفات الشكلية والجينية؛ وقد أسهم المجهر الإلكتروني في الكشف عن الفروق بين خصائصهما (أسئلة ص 100).' }
    ]
  });

  /* ======================= 2-1 بناء الاسم العلمي ======================= */
  const NAME_SORT = B.sorter({ binTop: 0.5, poolLabel: 'اسحب بطاقتين: اسم الجنس ثم اسم النوع (أو انقر البطاقة ثم الخانة)' });
  function nameCards(org) {
    const others = B.SCI_NAMES.filter((x) => x.genus !== org.genus);
    const o1 = others[0], o2 = others[1];
    return [
      { id: 'g', label: org.genus, group: 'genus' }, { id: 's', label: org.species, group: 'species' },
      { id: 'gl', label: org.genus.toLowerCase(), group: 'x' }, { id: 'ar', label: org.ar, group: 'x' },
      { id: 'o1', label: o1.genus, group: 'x' }, { id: 'o2', label: o2.species, group: 'x' }
    ];
  }
  const NAME_BINS = [{ id: 'genus', label: '1) اسم الجنس (Genus)', color: '#7c3aed', cap: 1 }, { id: 'species', label: '2) اسم النوع (Species)', color: '#0891b2', cap: 1 }];
  reg({
    id: 'sci-name', unit: 9, order: 2, lesson: '2-1', lessonTitle: 'تسمية الكائنات الحية', page: 100,
    titleAr: 'بناء الاسم العلمي: الجنس ثم النوع', titleEn: 'Building a Scientific Name: Genus + Species', tags: 'اسم علمي جنس نوع تسميه ثنائية Felis catus Plasmodium vivax',
    formula: '\\text{الاسم العلمي} = \\text{اسم الجنس} + \\text{اسم النوع}',
    book: 'تختلف الأسماء الشائعة من بلد إلى آخر؛ لذلك اعتمد العلماء اسماً علمياً خاصاً لكل كائن حي، ثابتاً لا يتغير (ص 100)؛ الجنس والنوع في الشكل (2) ص 101؛ أمثلة أسماء علمية من الكتاب: Plasmodium vivax ، Rhizopus stolonifer ، Entamoeba histolytica.',
    summary: 'اختر كائناً من الكتاب، ثم ضع في الخانة الأولى اسم الجنس وفي الثانية اسم النوع. انتبه: الاسم الشائع بالعربية ليس اسماً علمياً، واسم الجنس يبدأ بحرف كبير كما يُكتب في الكتاب.',
    vars: [['\\text{الجنس}', 'Genus — يبدأ بحرف كبير', '—', 'كلمة لاتينية'], ['\\text{النوع}', 'Species', '—', 'كلمة لاتينية']],
    assumptions: ['الأسماء العلمية المستعملة كلها واردة في الكتاب؛ والبطاقات الخاطئة مقصودة للتدريب.'],
    params: [{ key: 'org', label: '\\text{الكائن}', type: 'select', options: B.SCI_NAMES.map((x, i) => [i, x.ar + ' (ص ' + x.page + ')']), value: 0 }],
    initState: () => NAME_SORT.init(), resetOn: ['org'],
    randomize(p) { return { org: (p.org + 1 + Math.floor(Math.random() * (B.SCI_NAMES.length - 1))) % B.SCI_NAMES.length }; },
    canvasHint: 'اسحب البطاقات إلى الخانتين. البطاقة الخضراء صحيحة والحمراء خاطئة.',
    compute(p) { const org = B.SCI_NAMES[p.org]; return { org: org, items: nameCards(org) }; },
    drawCustom(ctx, W, H, p, d, c) {
      const st = d.st || NAME_SORT.init(); NAME_SORT.draw(ctx, D, W, H, c, d.items, NAME_BINS, st, d.hits);
      const g = d.items.find((it) => st.pos[it.id] === 'genus'), s = d.items.find((it) => st.pos[it.id] === 'species');
      const txt = (g ? g.label : '____') + ' ' + (s ? s.label : '____');
      ctx.save(); ctx.font = 'italic 800 22px Georgia, serif'; ctx.fillStyle = '#b45309'; ctx.textAlign = 'center'; ctx.direction = 'ltr'; ctx.fillText(txt, W / 2, H * 0.5 - 22); ctx.restore();
    },
    onPointer(type, x, y, p, st, api) { const d = B.SCI_NAMES[p.org]; return NAME_SORT.pointer(type, x, y, st, api, nameCards(d), NAME_BINS); },
    live(p, d) { return '\\text{' + d.org.genus + ' ' + d.org.species + '}'; },
    results(p, d) {
      const st = d.st || {}; const pos = st.pos || {}; const g = d.items.find((it) => pos[it.id] === 'genus'), s = d.items.find((it) => pos[it.id] === 'species');
      const msgs = g && s ? B.checkSciName(g.label, s.label) : []; const ok = g && s && g.id === 'g' && s.id === 's';
      return [['الكائن', d.org.ar, false], ['الاسم الذي بنيته', (g ? g.label : '—') + ' ' + (s ? s.label : '—'), false], ['الحكم', !g || !s ? 'أكمل الخانتين' : ok ? '✅ اسم علمي صحيح' : '❌ غير صحيح', false]].concat(g && s && !ok ? [['السبب', msgs.length ? msgs.join(' ') : g.id === 'ar' || s.id === 'ar' ? 'الاسم الشائع بالعربية ليس اسماً علمياً.' : 'اسم جنس أو نوع لكائن آخر.', false]] : []).concat([['الصفحة', 'ص ' + d.org.page, false]]);
    },
    steps(p, d) { return ['الخانة الأولى: اسم الجنس = ' + d.org.genus + '.', 'الخانة الثانية: اسم النوع = ' + d.org.species + '.', 'الاسم العلمي: ' + d.org.genus + ' ' + d.org.species + ' — ثابت لا يتغير مهما اختلفت اللغات.']; },
    explain(a, b) { if (a.org !== b.org) { const o = B.SCI_NAMES[b.org]; return ['اخترت ' + o.ar + ' (ص ' + o.page + '): اسمه العلمي يتكون من الجنس ' + o.genus + ' والنوع ' + o.species + '.']; } return []; },
    learn: ['**لماذا الاسم العلمي؟ (ص 100):** تختلف الأسماء الشائعة من بلد إلى آخر ومن لغة إلى أخرى، فاعتمد العلماء اسماً علمياً خاصاً لكل كائن، يستخدمونه على اختلاف جنسياتهم، وهو ثابت لا يتغير.', '**تركيبه (الشكل 2):** اسم الجنس ثم اسم النوع، مثل القط: Felis (الجنس) و catus (النوع).', '**أمثلة من الكتاب:** ' + B.SCI_NAMES.map((x) => x.ar + ': ' + x.genus + ' ' + x.species).join('؛ ') + '.'],
    challenges: [
      { q: 'ابنِ الاسم العلمي **للقط المنزلي** بشكل صحيح.', hint: 'Felis في خانة الجنس و catus في خانة النوع.', init: { org: 0 }, check: (p, d) => p.org === 0 && d.st && d.st.pos.g === 'genus' && d.st.pos.s === 'species' },
      { q: 'ابنِ الاسم العلمي **لمسبب الملاريا** (ص 109).', hint: 'اختر البلازموديوم: Plasmodium vivax.', init: { org: 0 }, check: (p, d) => p.org === 3 && d.st && d.st.pos.g === 'genus' && d.st.pos.s === 'species' },
      { q: 'ابنِ الاسم العلمي **لعفن الخبز** (ص 116).', hint: 'Rhizopus stolonifer.', init: { org: 0 }, check: (p, d) => p.org === 4 && d.st && d.st.pos.g === 'genus' && d.st.pos.s === 'species' }
    ],
    tutor: [
      { q: 'لماذا لا يكفي الاسم الشائع؟', k: ['الشائع', 'يكفي', 'لماذا'], a: () => 'لأن الأسماء الشائعة تختلف من بلد إلى آخر ومن لغة إلى أخرى، أما الاسم العلمي فثابت لا يتغير ويستخدمه العلماء جميعاً (ص 100).' },
      { q: 'ما الاسم العلمي لهذا الكائن؟', k: ['الاسم العلمي', 'ما اسم'], a: (p, d) => d.org.ar + ': ' + d.org.genus + ' ' + d.org.species + ' (ص ' + d.org.page + ').' }
    ]
  });

  /* ======================= 2-2 تصنيف الطلائعيات (سحب وإفلات) ======================= */
  const PRO_SORT = B.sorter({});
  const PRO_MODES = {
    groups: { bins: [{ id: 'animal', label: 'شبيهة الحيوانات (الأوليات)', color: '#dc2626' }, { id: 'plant', label: 'شبيهة النباتات (الطحالب)', color: '#16a34a' }, { id: 'fungus', label: 'شبيهة الفطريات', color: '#ca8a04' }], items: B.PROTISTS.map((x, i) => ({ id: 'p' + i, label: x.name, group: x.group })) },
    move: { bins: [{ id: 'cil', label: 'الهدبيات (الأهداب)', color: '#2563eb' }, { id: 'amo', label: 'الأميبيات (أقدام كاذبة)', color: '#9333ea' }, { id: 'fla', label: 'السوطيات (أسواط)', color: '#0891b2' }, { id: 'spo', label: 'البوغيات (لا وسائل حركة)', color: '#be123c' }],
      items: [['البراميسيوم', 'cil'], ['البالانتيديوم', 'cil'], ['الأميبا', 'amo'], ['الإنتاميبا', 'amo'], ['الجيارديا', 'fla'], ['التريكوموناس', 'fla'], ['الليشمانيا', 'fla'], ['البلازموديوم', 'spo']].map((x, i) => ({ id: 'm' + i, label: x[0], group: x[1] })) },
    algae: { bins: [{ id: 'starch', label: 'تخزن الغذاء نشا', color: '#16a34a' }, { id: 'oil', label: 'تخزن الغذاء زيوتاً', color: '#ca8a04' }, { id: 'poly', label: 'تخزن عديدة التسكر', color: '#92400e' }],
      items: [['الطحالب الخضراء', 'starch'], ['الطحالب الحمراء', 'starch'], ['الدياتومات', 'oil'], ['الطحالب البنية', 'poly']].map((x, i) => ({ id: 'a' + i, label: x[0], group: x[1] })) }
  };
  reg({
    id: 'protist-sort', unit: 10, order: 1, lesson: '2-2', lessonTitle: 'تصنيف الطلائعيات', page: 105,
    titleAr: 'صنّف الطلائعيات: اسحب وأفلت', titleEn: 'Sort the Protists (Drag & Drop)', tags: 'طلائعيات اوليات طحالب هدبيات اميبيات سوطيات بوغيات براميسيوم يوغلينا دياتومات بلازموديوم ليشمانيا',
    formula: '\\text{الطلائعيات} = \\text{شبيهة الحيوانات} + \\text{شبيهة النباتات} + \\text{شبيهة الفطريات}',
    book: 'صنف العلماء الطلائعيات في ثلاث مجموعات حسب طريقة الحصول على غذائها (ص 105)؛ قسم العلماء الأوليات إلى أربع قبائل وفق وسائل الحركة: الهدبيات، الأميبيات، السوطيات، البوغيات (ص 105)؛ قبائل الطحالب والغذاء المخزن (ص 109–110).',
    summary: 'اسحب كل كائن إلى مجموعته. اختر نوع التصنيف: المجموعات الثلاث، أو قبائل الأوليات حسب وسيلة الحركة، أو الطحالب حسب شكل الغذاء المخزن.',
    vars: [['\\text{التصنيف}', 'أساس الفرز', '—', '3 أنماط'], ['\\text{البطاقات}', 'كائنات واردة في الكتاب', '—', '4 – 10']],
    assumptions: ['كل كائن ومجموعته من نص الكتاب بالصفحة المذكورة.'],
    params: [{ key: 'mode', label: '\\text{أساس التصنيف}', type: 'select', options: [['groups', 'المجموعات الثلاث (طريقة الغذاء)'], ['move', 'قبائل الأوليات (وسيلة الحركة)'], ['algae', 'الطحالب (شكل الغذاء المخزن)']], value: 'groups' }],
    initState: () => PRO_SORT.init(), resetOn: ['mode'],
    randomize(p) { const m = ['groups', 'move', 'algae'].filter((x) => x !== p.mode); return { mode: m[Math.floor(Math.random() * m.length)] }; },
    canvasHint: 'اسحب البطاقة إلى المجموعة، أو انقرها ثم انقر المجموعة. الأخضر صحيح والأحمر خاطئ.',
    compute(p) { return { M: PRO_MODES[p.mode] }; },
    drawCustom(ctx, W, H, p, d, c) { PRO_SORT.draw(ctx, D, W, H, c, d.M.items, d.M.bins, d.st || PRO_SORT.init(), d.hits); },
    onPointer(type, x, y, p, st, api) { const M = PRO_MODES[p.mode]; return PRO_SORT.pointer(type, x, y, st, api, M.items, M.bins, (id, bin) => { const it = M.items.find((q) => q.id === id); api.say([it.group === bin ? '✅ «' + it.label + '» في المكان الصحيح.' : '❌ «' + it.label + '» ليس من هذه المجموعة؛ جرّب مرة أخرى.']); }); },
    live(p, d) { const sc = PRO_SORT.score(d.M.items, d.st || PRO_SORT.init()); return '\\text{الصحيحة } ' + sc.ok + '\\text{ من } ' + sc.n; },
    results(p, d) { const sc = PRO_SORT.score(d.M.items, d.st || PRO_SORT.init()); return [['البطاقات الموضوعة', sc.placed + ' من ' + sc.n, false], ['الصحيحة', sc.ok + ' من ' + sc.n, false], ['النتيجة', sc.done ? '✅ أحسنت! صنفت جميع البطاقات بشكل صحيح' : 'تابع', false]]; },
    steps(p) { return p.mode === 'groups' ? ['شبيهة الحيوانات (الأوليات): البراميسيوم، الأميبا، الجيارديا، الليشمانيا، البلازموديوم.', 'شبيهة النباتات (الطحالب): تحتوي الكلوروفيل، مثل اليوغلينا والدياتومات.', 'شبيهة الفطريات: الفطريات الغروية.'] : p.mode === 'move' ? ['الهدبيات: أهداب (البراميسيوم، البالانتيديوم).', 'الأميبيات: أقدام كاذبة (الأميبا، الإنتاميبا).', 'السوطيات: أسواط (الجيارديا، التريكوموناس، الليشمانيا).', 'البوغيات: تعيش متطفلة وتفتقر إلى وسائل الحركة (البلازموديوم).'] : B.ALGAE.map((a) => a.name + ': الصبغات ' + a.pig + '، الغذاء المخزن ' + a.store + '، الجدار ' + a.wall); },
    explain(a, b) { if (a.mode !== b.mode) return [b.mode === 'groups' ? 'التصنيف حسب طريقة الحصول على الغذاء: ثلاث مجموعات.' : b.mode === 'move' ? 'الأوليات أربع قبائل وفق وسائل الحركة.' : 'تصنف الطحالب حسب نوع الكلوروفيل والصبغات الثانوية، ونوع الغذاء المخزن، وتركيب الجدار الخلوي.']; return []; },
    learn: ['**خصائص الطلائعيات (ص 103):** حقيقية النوى، معظمها مجهرية، لا توجد فيها أجهزة متخصصة، وبعضها فيه فجوات منقبضة.', '**التغذية (ص 104):** ذاتية التغذية (بناء ضوئي)، غير ذاتية (البلعمة أو امتصاص الغذاء بإفراز إنزيمات محللة)، وخلطية التغذية.', '**المجموعات الثلاث (ص 105):** شبيهة الحيوانات (الأوليات)، شبيهة النباتات (الطحالب)، شبيهة الفطريات (الفطريات الغروية).', '**قبائل الأوليات:** الهدبيات (نواة كبيرة ونواة صغيرة)، الأميبيات (أقدام كاذبة)، السوطيات (أسواط)، البوغيات (متطفلة بلا وسائل حركة، ومنها البلازموديوم مسبب الملاريا).'],
    challenges: [
      { q: 'صنف جميع الطلائعيات في **المجموعات الثلاث** تصنيفاً صحيحاً.', hint: 'الطحالب تحتوي الكلوروفيل؛ الأوليات تتحرك وتتغذى كالحيوانات.', init: { mode: 'move' }, check: (p, d) => p.mode === 'groups' && PRO_SORT.score(d.M.items, d.st || {}).done },
      { q: 'صنف الأوليات في **قبائلها الأربع** حسب وسيلة الحركة.', hint: 'البلازموديوم يفتقر إلى وسائل الحركة.', init: { mode: 'groups' }, check: (p, d) => p.mode === 'move' && PRO_SORT.score(d.M.items, d.st || {}).done },
      { q: 'صنف الطحالب حسب **شكل الغذاء المخزن** (س3 ص 112).', hint: 'الخضراء والحمراء: نشا؛ الدياتومات: زيوت.', init: { mode: 'groups' }, check: (p, d) => p.mode === 'algae' && PRO_SORT.score(d.M.items, d.st || {}).done }
    ],
    tutor: [
      { q: 'كيف أعرف أن الكائن من الأوليات؟', k: ['اوليات', 'اعرف'], a: () => 'الأوليات (شبيهة الحيوانات) تمتلك بعض خصائص الحيوانات، تتواجد حرة أو متطفلة، وتقسم حسب وسيلة الحركة إلى هدبيات وأميبيات وسوطيات وبوغيات (ص 105).' },
      { q: 'ما الفرق بين الطحالب الخضراء والحمراء؟', k: ['خضراء', 'حمراء'], a: () => 'الخضراء: الكلوروفيل والكاروتين، تخزن نشا، جدارها سليلوز. الحمراء: صبغة حمراء فيكوبلين، تخزن نشا، جدارها سليلوز (ص 109–110).' }
    ]
  });

  /* ======================= 2-3 قبائل الفطريات (سحب وإفلات) ======================= */
  const FUN_SORT = B.sorter({ cardW: 210 });
  const FUN_ITEMS = [
    ['أبواغها تمتلك أسواطاً', 'chytrid'], ['تنتشر في الماء والتربة، بالتطفل أو الترمم', 'chytrid'],
    ['خيوطها الفطرية من النوع المدمج', 'zygo'], ['عفن الخبز Rhizopus stolonifer', 'zygo'],
    ['انفصلت عن الاقترانية لاختلاف وراثي في DNA', 'glom'], ['تعيش على جذور النباتات معيشة تقايضية', 'glom'],
    ['تنتج أبواغها داخل أكياس', 'asco'], ['فطر قشر البرتقال Aleuria aurantia', 'asco'],
    ['بازيديوم يشبه المضرب تعلوه أبواغ بازيدية', 'basidio'], ['فطر المشروم (الفقع)', 'basidio']
  ].map((x, i) => ({ id: 'f' + i, label: x[0], group: x[1] }));
  const FUN_BINS = B.FUNGI.map((f, i) => ({ id: f.key, label: f.name, color: B.PAL[i] }));
  reg({
    id: 'fungi-sort', unit: 11, order: 1, lesson: '2-3', lessonTitle: 'تصنيف الفطريات', page: 116,
    titleAr: 'قبائل الفطريات: طابق الصفة بالقبيلة', titleEn: 'Fungi Phyla: Match Traits (Drag & Drop)', tags: 'فطريات لزجيه اقترانيه غلوميريه زقيه كيسيه دعاميه بازيديوم عفن الخبز مشروم اشنات',
    formula: '\\text{الفطريات: لزجية ، اقترانية ، غلوميرية ، زقية ، دعامية}',
    book: 'صُنفت الفطريات في قبائل بناءً على عدد من الخصائص المشتركة (ص 116–117): اللزجية، الاقترانية، الغلوميرية، الزقية (الكيسية)، الدعامية.',
    summary: 'اسحب كل صفة أو مثال إلى قبيلة الفطريات المناسبة كما وردت في الكتاب. الفطريات حقيقية النوى، غير ذاتية التغذية، تفرز إنزيمات محللة على المواد العضوية ثم تمتصها.',
    vars: [['\\text{القبائل}', 'قبائل الفطريات في الكتاب', '—', '5 قبائل'], ['\\text{البطاقات}', 'صفات وأمثلة من نص الكتاب', '—', '10 بطاقات']],
    assumptions: ['كل صفة ومثال منقول من وصف القبيلة في الكتاب (ص 116–117).'],
    params: [{ key: 'show', label: '\\text{التلميحات}', type: 'toggle', value: false, on: 'إظهار وصف القبائل', off: 'إخفاء الوصف' }],
    initState: () => FUN_SORT.init(),
    randomize() { return { show: Math.random() < 0.5 }; },
    canvasHint: 'اسحب البطاقة إلى القبيلة، أو انقرها ثم انقر القبيلة.',
    compute() { return {}; },
    drawCustom(ctx, W, H, p, d, c) {
      const st = d.st || FUN_SORT.init(); FUN_SORT.draw(ctx, D, W, H, c, FUN_ITEMS, FUN_BINS, st, d.hits);
      if (p.show) { const bw = (W - 10 * 6) / 5; B.FUNGI.forEach((f, i) => B.para(ctx, D, f.trait, W - 10 - (i + 1) * bw - i * 10 + bw / 2, H - 40, bw - 8, { color: c.muted, size: 9.5, w: '600', bottom: true })); }
    },
    onPointer(type, x, y, p, st, api) { return FUN_SORT.pointer(type, x, y, st, api, FUN_ITEMS, FUN_BINS, (id, bin) => { const it = FUN_ITEMS.find((q) => q.id === id); const f = B.FUNGI.find((q) => q.key === it.group); api.say([it.group === bin ? '✅ «' + it.label + '» من صفات ' + f.name + '.' : '❌ ليست هذه القبيلة؛ تلميح: ' + f.trait + '.']); }); },
    live(p, d) { const sc = FUN_SORT.score(FUN_ITEMS, d.st || FUN_SORT.init()); return '\\text{الصحيحة } ' + sc.ok + '\\text{ من } ' + sc.n; },
    results(p, d) { const sc = FUN_SORT.score(FUN_ITEMS, d.st || FUN_SORT.init()); return [['البطاقات الموضوعة', sc.placed + ' من ' + sc.n, false], ['الصحيحة', sc.ok + ' من ' + sc.n, false], ['النتيجة', sc.done ? '✅ أحسنت! طابقت جميع الصفات' : 'تابع', false]]; },
    steps() { return B.FUNGI.map((f) => f.name + ': ' + f.trait + (f.ex ? ' (مثال: ' + f.ex + ')' : '')); },
    explain(a, b) { if (a.show !== b.show) return [b.show ? 'يظهر الآن تحت كل قبيلة وصفها المختصر من الكتاب.' : 'أُخفي الوصف؛ حاول من ذاكرتك.']; return []; },
    learn: ['**خصائص الفطريات (ص 113–114):** حقيقية النوى، معظمها عديدة الخلايا (المشروم) وبعضها وحيدة الخلية (الخمائر)، غير ذاتية التغذية: تفرز إنزيمات محللة على المواد العضوية ثم تمتصها.', '**تركيبها:** الخيوط الفطرية وحدة البناء، وتشكل الغزل الفطري والجسم الثمري.', '**التكاثر (ص 115–116):** لاجنسي بالتبرعم والتجزؤ والأبواغ، وجنسي في بعضها.', '**القبائل (ص 116–117):** ' + B.FUNGI.map((f) => f.name + ' — ' + f.trait).join('؛ ') + '.', '**الأشنات (ص 117):** مجتمع تقايضي بين الفطريات وشريك ضوئي البناء.'],
    challenges: [
      { q: 'طابق **جميع** الصفات والأمثلة مع قبائلها الخمس.', hint: 'فعّل «إظهار وصف القبائل» إن احتجت.', init: { show: false }, check: (p, d) => FUN_SORT.score(FUN_ITEMS, d.st || {}).done },
      { q: 'س1-3 (ص 121): في أي قبيلة يُصنف **عفن الخبز**؟ ضع بطاقته في قبيلتها.', hint: 'خيوطها من النوع المدمج.', init: { show: false }, check: (p, d) => d.st && d.st.pos.f3 === 'zygo' }
    ],
    tutor: [
      { q: 'لماذا سميت الدعامية بهذا الاسم؟', k: ['دعاميه', 'سميت'], a: () => 'لأنها تكوّن جسماً صغيراً يدعى بازيديوم يشبه المضرب تعلوه أبواغ بازيدية (ص 117).' },
      { q: 'ما الأشنات؟', k: ['اشنات'], a: () => 'مجتمع تقايضي بين الفطريات وشريك ضوئي البناء، تعيش على قمم الجبال والصخور والتربة وسيقان الأشجار؛ ومن أنواعها القشرية والورقية والثمرية (ص 117).' }
    ]
  });
  /* ======================= 1-2 التغذية في الطلائعيات: البلعمة ======================= */
  const PHAGO = ['جزيء طعام بالقرب من الخلية الطلائعية', 'الأقدام الكاذبة تحيط بجزيء الطعام (البلعمة)', 'يُبتلع الجزيء داخل فجوة غذائية', 'الليسوسوم يتحد بالفجوة الغذائية فيحلل الغذاء', 'تخرج الفضلات من فتحة إخراج الفضلات'];
  reg({
    id: 'protist-nutrition', unit: 10, order: 2, lesson: '1-2', lessonTitle: 'خصائص الطلائعيات (التغذية)', page: 104,
    titleAr: 'التغذية في الطلائعيات: البلعمة', titleEn: 'Nutrition in Protists: Phagocytosis', tags: 'بلعمه اقدام كاذبه فجوه غذائيه ليسوسوم ذاتيه التغذيه خلطيه يوغلينا',
    formula: '\\text{أقدام كاذبة} \\to \\text{فجوة غذائية} \\to \\text{ليسوسوم} \\to \\text{إخراج الفضلات}',
    book: 'التغذية في الطلائعيات (ص 104): ذاتية التغذية (بناء ضوئي)، وغير ذاتية التغذية بابتلاع كائنات حية أو مواد عضوية بعملية البلعمة (الشكل 1) أو بإفراز إنزيمات محللة، وأنواع خلطية التغذية. الليسوسوم يسهم في تحليل المواد العضوية المبتلعة (س1-8 ص 121).',
    summary: 'تتبع ابتلاع جزيء من الغذاء من محيط الخلية الطلائعية حتى تحليله وإخراج فضلاته، كما في الشكل (1).',
    vars: [['\\text{الخطوة}', 'خطوات البلعمة', '—', '5 خطوات (الشكل 1)']],
    assumptions: ['الحركة تخطيطية (نموذج مبسّط لأغراض التعليم)؛ أسماء الأجزاء من الشكل (1): جزيء طعام، أقدام كاذبة، فجوة غذائية، ليسوسوم، فتحة لإخراج الفضلات.'],
    params: [{ key: 'k', label: '\\text{الخطوة}', type: 'stage', stages: PHAGO, value: 0 }],
    play: { mode: 'stage', key: 'k', interval: 1.8 }, initState: () => ({ t: 0 }), tick(st, p, d, dt) { st.t += dt; },
    compute(p) { return { step: PHAGO[p.k] }; },
    drawCustom(ctx, W, H, p, d, c) {
      const k = p.k; const t = (d.st && d.st.t) || 0; const cx = W * 0.45, cy = H * 0.45, R = Math.min(W * 0.28, H * 0.32);
      ctx.beginPath(); for (let i = 0; i <= 80; i++) { const a = i / 80 * Math.PI * 2; let rr = R * (1 + 0.08 * Math.sin(a * 3 + t)); if (k === 1 && Math.cos(a) > 0.6) rr *= 1.35; ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.8); } ctx.closePath(); ctx.fillStyle = 'rgba(191,219,254,.75)'; ctx.fill(); ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 2.5; ctx.stroke();
      B.blob(ctx, cx - R * 0.3, cy - R * 0.1, R * 0.2, R * 0.2, '#c4b5fd', '#6d28d9', 2); D.txt(ctx, 'نواة', cx - R * 0.3, cy - R * 0.1, { color: '#4c1d95', size: 11, w: '800' });
      const fx = [cx + R * 1.5, cx + R * 1.05, cx + R * 0.5, cx + R * 0.3, cx - R * 0.95][k]; const fy = cy + (k === 4 ? R * 0.2 : 0);
      if (k >= 2 && k <= 3) B.blob(ctx, fx, fy, R * 0.2, R * 0.2, 'rgba(254,240,138,.6)', '#a16207', 2);
      B.blob(ctx, fx, fy, k === 3 ? R * 0.06 : k === 4 ? R * 0.05 : R * 0.1, k === 3 ? R * 0.06 : k === 4 ? R * 0.05 : R * 0.1, k === 4 ? '#78716c' : '#16a34a');
      if (k >= 3) { const lx = k === 3 ? fx - R * 0.18 : cx; B.blob(ctx, lx, fy + (k === 3 ? R * 0.14 : R * 0.4), R * 0.08, R * 0.08, '#a855f7', '#6b21a8', 1.5); D.txt(ctx, 'ليسوسوم', lx, fy + R * 0.32 + (k === 3 ? 0 : R * 0.25), { color: '#6b21a8', size: 11, w: '800' }); }
      if (k === 4) { ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx - R, cy + R * 0.2, 8, 0, 7); ctx.stroke(); D.txt(ctx, 'فتحة لإخراج الفضلات', cx - R - 12, cy + R * 0.45, { color: c.text, size: 11, w: '800', align: 'right' }); }
      if (k <= 1) D.txt(ctx, 'جزيء طعام', fx, fy - R * 0.2, { color: '#166534', size: 11, w: '800' });
      if (k === 1) D.txt(ctx, 'أقدام كاذبة', cx + R * 1.2, cy - R * 0.55, { color: '#1d4ed8', size: 11, w: '800' });
      if (k === 2 || k === 3) D.txt(ctx, 'فجوة غذائية', fx, fy - R * 0.3, { color: '#a16207', size: 11, w: '800' });
      D.txt(ctx, (k + 1) + '. ' + d.step, W / 2, 18, { color: c.c5, size: narrow(W) ? 12 : 15, w: '800' });
    },
    live(p, d) { return '\\text{' + (p.k + 1) + '. ' + d.step + '}'; },
    results(p, d) { return [['الخطوة', d.step, false], ['أنماط التغذية (ص 104)', 'ذاتية التغذية (بناء ضوئي)؛ غير ذاتية (البلعمة، أو امتصاص الغذاء بإفراز إنزيمات محللة)؛ خلطية التغذية حسب توفر الضوء', false], ['مثال على خلطية التغذية', 'بعض الطحالب الذهبية (ص 110)', false], ['آثار إيجابية (ص 111)', 'مبيد حيوي للقضاء على الحشرات، وفي الحساء والتوابل، وصناعة الآغار وأدوات التجميل', false]]; },
    steps() { return PHAGO.map((x, i) => (i + 1) + ') ' + x); },
    explain(a, b) { return a.k === b.k ? [] : [PHAGO[b.k] + '.']; },
    learn: ['**البلعمة (ص 104):** بعض الطلائعيات غير ذاتية التغذية تحصل على غذائها بابتلاع كائنات حية أو مواد عضوية.', '**تحليل الغذاء:** الليسوسوم (الجسم الحال) يسهم في تحليل المواد العضوية المبتلعة، فالأجسام الحالّة تقوم بالهضم داخل الخلية (ص 14).', '**أنماط أخرى:** ذاتية التغذية بالبناء الضوئي، وامتصاص الغذاء بإفراز إنزيمات محللة، وخلطية التغذية.'],
    challenges: [
      { q: 'س1-8 (ص 121): انتقل إلى الخطوة التي تعمل فيها العضية التي **تسهم في تحليل المواد العضوية المبتلعة**.', hint: 'الليسوسوم.', init: { k: 0 }, check: (p) => p.k === 3 },
      { q: 'انتقل إلى الخطوة التي **تحيط فيها الأقدام الكاذبة** بجزيء الطعام.', hint: 'الخطوة الثانية.', init: { k: 4 }, check: (p) => p.k === 1 }
    ],
    tutor: [{ q: 'ما البلعمة؟', k: ['بلعمه', 'ابتلاع'], a: () => 'عملية تحصل فيها بعض الطلائعيات على غذائها بابتلاع كائنات حية أو مواد عضوية، بواسطة الأقدام الكاذبة، ثم يحلل الليسوسوم الغذاء داخل الفجوة الغذائية (ص 104).' }]
  });

  /* ======================= 1-3 تركيب الفطر والتكاثر والأشنات ======================= */
  const FS = {
    hyphae: { name: 'أنواع الخيوط الفطرية (الشكل 2 ص 114)', st: ['الخيوط المدمجة (Aseptate hyphae)', 'الخيوط غير المدمجة (Septate hyphae)'] },
    repro: { name: 'التكاثر في الفطريات (ص 115–116)', st: ['التكاثر بالتبرعم', 'التكاثر بالتجزؤ', 'التكاثر بالأبواغ', 'التكاثر الجنسي'] },
    lichens: { name: 'الأشنات (ص 117)', st: ['أشنات قشرية', 'أشنات ورقية', 'أشنات ثمرية'] }
  };
  const FS_TXT = {
    hyphae: ['خيوط بجدار خلوي وأنوية دون حواجز فاصلة؛ وخيوط الفطريات الاقترانية من هذا النوع (ص 116).', 'خيوط بجدار خلوي تفصلها حواجز فيها ثقوب، وفيها أنوية (الشكل 2).'],
    repro: ['تتكاثر الفطريات وحيدة الخلية بالتبرعم: تنقسم النواة انقساماً متساوياً، ويتشكل انتفاخ (برعم) على سطح الخلية الأم يستمر في النمو، وقد ينفصل تدريجياً تاركاً ندبة على جدارها.', 'يشبه التكاثر بالتجزؤ التكاثر الخضري في النباتات.', 'تتكون الأبواغ على الخيوط الفطرية (الشكل 4)، مثل طبقة العفن الخضراء على الفاكهة أو الخبز.', 'معظم الفطريات تتكاثر لاجنسياً وبعضها جنسياً، ودورة حياة عفن الخبز (الشكل 5) تتضمن تكاثراً جنسياً.'],
    lichens: ['الأشنات مجتمع تقايضي بين الفطريات وشريك ضوئي البناء؛ ومن أنواعها القشرية (الشكل 6 أ).', 'ومن أنواعها الورقية (الشكل 6 ب).', 'ومن أنواعها الثمرية (الشكل 6 ج).']
  };
  reg({
    id: 'fungi-structure', unit: 11, order: 0, lesson: '1-3 / 3-3', lessonTitle: 'خصائص الفطريات والأشنات', page: 114,
    titleAr: 'تركيب الفطر وتكاثره والأشنات', titleEn: 'Fungal Structure, Reproduction and Lichens', tags: 'خيوط فطريه مدمجه غير مدمجه حواجز تبرعم تجزؤ ابواغ اشنات قشريه ورقيه ثمريه',
    formula: '\\text{الخيوط الفطرية} \\to \\text{الغزل الفطري} + \\text{الجسم الثمري}',
    book: 'الخيوط الفطرية وحدات بناء الجسم الثمري والغزل الفطري (ص 114–115، الشكلان 2 و 3)؛ التكاثر اللاجنسي والجنسي (ص 115–116)؛ الأشنات (ص 117، الشكل 6).',
    summary: 'اختر الموضوع: نوعا الخيوط الفطرية، أو طرق تكاثر الفطريات، أو أنواع الأشنات، وانتقل بين الحالات بالمرحلة.',
    vars: [['\\text{الموضوع}', 'الخيوط / التكاثر / الأشنات', '—', '3 موضوعات'], ['\\text{الحالة}', 'الحالات داخل الموضوع', '—', '2 – 4']],
    assumptions: ['الرسوم تخطيطية (نموذج مبسّط لأغراض التعليم) بحسب أشكال الكتاب.'],
    params: [
      { key: 'view', label: '\\text{الموضوع}', type: 'select', options: Object.keys(FS).map((k) => [k, FS[k].name]), value: 'hyphae' },
      { key: 'k', label: '\\text{الحالة}', type: 'stage', stages: (p) => FS[p.view || 'repro'].st, value: 0 }
    ],
    onSet(p, key) { if (key === 'view') p.k = 0; },
    play: { mode: 'stage', key: 'k', interval: 2 }, initState: () => ({ t: 0 }), tick(st, p, d, dt) { st.t += dt; },
    randomize(p) { const o = Object.keys(FS).filter((k) => k !== p.view); return { view: o[Math.floor(Math.random() * o.length)], k: 0 }; },
    compute(p) { const L = FS[p.view].st; const k = Math.min(p.k, L.length - 1); return { k: k, name: L[k], txt: FS_TXT[p.view][k] }; },
    drawCustom(ctx, W, H, p, d, c) {
      const k = d.k; const cy = H * 0.45; const t = (d.st && d.st.t) || 0;
      D.txt(ctx, d.name, W / 2, 18, { color: c.c5, size: narrow(W) ? 12 : 15, w: '800' });
      if (p.view === 'hyphae') {
        const x0 = W * 0.1, x1 = W * 0.9, h = 34; D.rr(ctx, x0, cy - h / 2, x1 - x0, h, h / 2); ctx.fillStyle = '#fde68a'; ctx.fill(); ctx.strokeStyle = '#a16207'; ctx.lineWidth = 3; ctx.stroke();
        for (let i = 0; i < 7; i++) B.blob(ctx, x0 + (i + 0.5) * (x1 - x0) / 7, cy, 6, 5, '#6d28d9');
        if (k === 1) for (let i = 1; i < 7; i++) { const x = x0 + i * (x1 - x0) / 7 - 14; ctx.strokeStyle = '#78350f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, cy - h / 2); ctx.lineTo(x, cy - 4); ctx.moveTo(x, cy + 4); ctx.lineTo(x, cy + h / 2); ctx.stroke(); }
        D.txt(ctx, 'جدار خلوي', x0 + 40, cy - h, { color: c.text, size: 12, w: '800' }); D.txt(ctx, 'نواة', x0 + (x1 - x0) / 14, cy + h, { color: '#6d28d9', size: 12, w: '800' });
        if (k === 1) { D.txt(ctx, 'حاجز', x0 + (x1 - x0) / 7 - 14, cy - h - 4, { color: '#78350f', size: 12, w: '800' }); D.txt(ctx, 'ثقب', x0 + 2 * (x1 - x0) / 7 - 14, cy + h + 4, { color: '#78350f', size: 12, w: '800' }); }
      } else if (p.view === 'repro') {
        const cx = W / 2;
        if (k === 0) { const g = Math.min(1, (t % 2) / 1.6); B.blob(ctx, cx, cy, 40, 34, '#fef3c7', '#a16207', 2.5); B.blob(ctx, cx + 40 + 16 * g, cy - 18 * g, 10 + 14 * g, 9 + 12 * g, '#fef3c7', '#a16207', 2.5); D.txt(ctx, 'برعم', cx + 60, cy - 50, { color: c.text, size: 12, w: '800' }); D.txt(ctx, 'الخلية الأم (خميرة)', cx, cy + 56, { color: c.text, size: 12, w: '800' }); }
        else if (k === 1) { [[-120, 0], [-10, 20], [110, -10]].forEach((o, i) => { ctx.strokeStyle = '#a16207'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx + o[0] - 40, cy + o[1]); ctx.lineTo(cx + o[0] + 40, cy + o[1] + (i - 1) * 10); ctx.stroke(); }); D.txt(ctx, 'أجزاء من الخيوط ينمو كل منها فطراً جديداً', cx, cy + 60, { color: c.text, size: 12, w: '800' }); }
        else if (k === 2) { for (let i = -2; i <= 2; i++) { const x = cx + i * 60; ctx.strokeStyle = '#a16207'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, cy + 60); ctx.lineTo(x, cy - 10); ctx.stroke(); B.blob(ctx, x, cy - 22, 14, 14, '#16a34a', '#14532d', 2); for (let q = 0; q < 5; q++) B.blob(ctx, x + Math.cos(q * 1.3 + t) * 22, cy - 22 + Math.sin(q * 1.3 + t) * 18 - ((t * 20 + q * 9) % 30), 3, 3, '#4ade80'); } D.txt(ctx, 'أبواغ على الخيوط الفطرية', cx, cy + 80, { color: c.text, size: 12, w: '800' }); }
        else { B.blob(ctx, cx - 50, cy, 26, 26, '#bfdbfe', '#1d4ed8', 2); B.blob(ctx, cx + 50, cy, 26, 26, '#fbcfe8', '#be185d', 2); D.txt(ctx, '+', cx, cy, { color: c.text, size: 22, w: '800' }); D.txt(ctx, 'دورة حياة عفن الخبز تتضمن تكاثراً جنسياً (الشكل 5)', cx, cy + 60, { color: c.text, size: 12, w: '800' }); }
      } else {
        const cx = W / 2; ctx.fillStyle = '#9ca3af'; D.rr(ctx, cx - 160, cy + 20, 320, 60, 18); ctx.fill(); D.txt(ctx, 'صخرة أو ساق شجرة', cx, cy + 50, { color: '#fff', size: 12, w: '800' });
        const cols = ['#f59e0b', '#84cc16', '#a3a3a3'];
        if (k === 0) { for (let i = 0; i < 9; i++) B.blob(ctx, cx - 120 + i * 30, cy + 22, 16, 6, cols[0]); }
        else if (k === 1) { for (let i = 0; i < 5; i++) { ctx.fillStyle = cols[1]; ctx.beginPath(); ctx.ellipse(cx - 100 + i * 50, cy + 8, 24, 12, (i % 2 ? 0.3 : -0.3), 0, 7); ctx.fill(); } }
        else { for (let i = 0; i < 7; i++) { const x = cx - 90 + i * 30; ctx.strokeStyle = cols[2]; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, cy + 20); ctx.quadraticCurveTo(x + 8, cy - 30, x - 4, cy - 60); ctx.stroke(); } }
      }
      B.para(ctx, D, d.txt, W / 2, H - 14, W - 30, { color: c.text, size: narrow(W) ? 11 : 13, w: '600', bottom: true });
    },
    live(p, d) { return '\\text{' + d.name.replace(/ \(.*\)/, '') + '}'; },
    results(p, d) { return [['الموضوع', FS[p.view].name, false], ['الحالة', d.name, false], ['الوصف', d.txt, false]].concat(p.view === 'lichens' ? [['أين تعيش', 'على قمم الجبال والصخور وفي التربة وعلى سيقان الأشجار؛ والصبغات تحمي الشريك ضوئي البناء من الإشعاعات القوية', false]] : p.view === 'hyphae' ? [['الخيوط الفطرية', 'وحدة التركيب الأساسية في الفطر (س1-1 ص 120)؛ تكوّن الغزل الفطري والجسم الثمري', false]] : []); },
    steps(p) { return FS[p.view].st.map((x, i) => (i + 1) + ') ' + x); },
    explain(a, b, da, db) { if (a.view !== b.view) return ['الموضوع الآن: ' + FS[b.view].name + '.']; if (a.k !== b.k) return [db.txt]; return []; },
    learn: ['**الخيوط الفطرية (ص 114):** وحدات بنائية يتكون منها الجسم الثمري والغزل الفطري في الفطريات عديدة الخلايا؛ وفي الشكل (2) نوعان: المدمجة وغير المدمجة.', '**التكاثر (ص 115–116):** لاجنسي بالتبرعم والتجزؤ والأبواغ، وجنسي في بعضها.', '**الأشنات (ص 117):** مجتمع تقايضي بين الفطريات وشريك ضوئي البناء؛ أنواعها القشرية والورقية والثمرية.'],
    challenges: [
      { q: 'س1-2 (ص 120): اعرض الخيوط الفطرية التي **لا يوجد فيها حواجز**.', hint: 'المدمجة (Aseptate).', init: { view: 'repro', k: 0 }, check: (p) => p.view === 'hyphae' && p.k === 0 },
      { q: 'س1-3 (ص 120): اعرض التكاثر الذي **ينتج انتفاخاً يشبه الأم ثم ينفصل عنها**.', hint: 'التبرعم.', init: { view: 'hyphae', k: 1 }, check: (p) => p.view === 'repro' && p.k === 0 },
      { q: 'اعرض الأشنات **الثمرية**.', hint: 'الموضوع: الأشنات، الحالة الثالثة.', init: { view: 'hyphae', k: 0 }, check: (p) => p.view === 'lichens' && p.k === 2 }
    ],
    tutor: [{ q: 'ما الفرق بين الخيوط المدمجة وغير المدمجة؟', k: ['مدمجه', 'حواجز', 'الفرق'], a: () => 'من الشكل (2) ص 114: المدمجة (Aseptate) بلا حواجز وفيها أنوية في سيتوبلازم متصل؛ غير المدمجة (Septate) تفصلها حواجز فيها ثقوب.' }]
  });
})(typeof window !== 'undefined' ? window : globalThis);
