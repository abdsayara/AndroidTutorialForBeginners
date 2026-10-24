/* رياضيات الرابع — الوحدة السادسة: البيانات (ص 109–120) */
(function (root) {
  'use strict';
  const ML = root.ML; const G = ML.m4;
  const U = 6;
  const sum = (a) => a.reduce((t, x) => t + x, 0);
  const argmax = (a) => a.indexOf(Math.max.apply(null, a)), argmin = (a) => a.indexOf(Math.min.apply(null, a));

  /* ---------- رسوم بسيطة للصور ---------- */
  function icon(ctx, kind, x, y, s, frac, c) {
    ctx.save(); ctx.beginPath(); ctx.rect(x + s * (1 - frac), y, s * frac + 0.5, s); ctx.clip(); // الجزء من اليمين عند الكسر
    const cx = x + s / 2, cy = y + s / 2;
    if (kind === 'bird') {
      ctx.fillStyle = '#c2410c'; ctx.fillRect(x + 2, y + s * 0.78, s - 4, s * 0.12);
      ctx.fillStyle = '#1d4ed8'; ctx.beginPath(); ctx.ellipse(cx, cy, s * 0.3, s * 0.18, -0.4, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + s * 0.22, cy - s * 0.15, s * 0.11, 0, 7); ctx.fill();
      ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.arc(cx + s * 0.22, cy - s * 0.06, s * 0.06, 0, 7); ctx.fill();
      ctx.fillStyle = '#1e3a8a'; ctx.beginPath(); ctx.moveTo(cx - s * 0.2, cy); ctx.lineTo(cx - s * 0.45, cy + s * 0.2); ctx.lineTo(cx - s * 0.1, cy + s * 0.1); ctx.fill();
    } else if (kind === 'hosp') {
      ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.moveTo(cx, y + 3); ctx.lineTo(x + s - 4, cy); ctx.lineTo(x + s - 4, y + s - 3); ctx.lineTo(x + 4, y + s - 3); ctx.lineTo(x + 4, cy); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillRect(cx - s * 0.05, cy - s * 0.02, s * 0.1, s * 0.34); ctx.fillRect(cx - s * 0.16, cy + s * 0.1, s * 0.32, s * 0.1);
    } else if (kind === 'dress') {
      ctx.fillStyle = '#be123c'; ctx.beginPath(); ctx.moveTo(cx - s * 0.14, y + 4); ctx.lineTo(cx + s * 0.14, y + 4); ctx.lineTo(cx + s * 0.38, y + s - 3); ctx.lineTo(cx - s * 0.38, y + s - 3); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, y + 6); ctx.lineTo(cx, y + s - 5); ctx.moveTo(cx - s * 0.3, y + s * 0.8); ctx.lineTo(cx + s * 0.3, y + s * 0.8); ctx.stroke();
    } else if (kind === 'smile') {
      ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(cx, cy, s * 0.42, 0, 7); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(cx - s * 0.14, cy - s * 0.1, s * 0.05, 0, 7); ctx.arc(cx + s * 0.14, cy - s * 0.1, s * 0.05, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy + s * 0.02, s * 0.22, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
    } else if (kind === 'note') {
      ctx.fillStyle = '#65a30d'; ctx.fillRect(x + 2, y + s * 0.22, s - 4, s * 0.56); ctx.strokeStyle = '#365314'; ctx.lineWidth = 1.2; ctx.strokeRect(x + 2, y + s * 0.22, s - 4, s * 0.56);
      ctx.fillStyle = '#ecfccb'; ctx.beginPath(); ctx.arc(cx, cy, s * 0.14, 0, 7); ctx.fill();
    } else if (kind === 'hour') {
      ctx.fillStyle = '#0ea5e9'; ctx.fillRect(x + 3, y + s * 0.2, s - 6, s * 0.6); ctx.strokeStyle = '#0c4a6e'; ctx.lineWidth = 1.4; ctx.strokeRect(x + 3, y + s * 0.2, s - 6, s * 0.6);
      ctx.beginPath(); ctx.moveTo(x + 3, y + s * 0.8); ctx.lineTo(x + s - 3, y + s * 0.2); ctx.stroke();
    }
    ctx.restore();
  }

  /* ======================= الدرس الأول: التمثيل بالصور (ص 111–120) ======================= */
  const PIC = {
    swal: { name: 'طيور السنونو في محمية وادي الباذان (نشاط 1 ص 111)', cat: ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة'], head: 'الساعة', v: [7, 9, 6, 10, 11], key: 1, icon: 'bird', unit: 'طائراً', unit1: 'طائراً واحداً', page: 111 },
    hosp: { name: 'المستشفيات الفلسطينية 2015م (نشاط 2 ص 112)', cat: ['رام الله والبيرة', 'القدس', 'غزة', 'الخليل', 'جنين'], head: 'المحافظة', v: [8, 10, 10, 7, 6], key: 1, icon: 'hosp', unit: 'مستشفى', unit1: 'مستشفى واحداً', page: 112 },
    dress: { name: 'الأثواب المطرزة (نشاط 3 ص 112)', cat: ['الخليل', 'بيت لحم', 'غزة', 'نابلس'], head: 'المحافظة', v: [9, 9, 6, 3], key: 3, icon: 'dress', unit: 'ثوباً', unit1: '٣ أثواب', page: 112 },
    smile: { name: 'طلاب مركز تنمية القدرات الرياضية (مراجعة 2 ص 118)', cat: ['الأول', 'الثاني', 'الثالث', 'الرابع'], head: 'الصف', v: [10, 15, 15, 25], key: 5, icon: 'smile', unit: 'طالباً', unit1: '٥ طلاب', page: 118 },
    money: { name: 'أوراق العملة عند حنين (مراجعة 3 ص 119)', cat: ['الفلسطينية', 'المصرية', 'السورية', 'الأردنية'], head: 'العملة', v: [8, 6, 6, 4], key: 2, icon: 'note', unit: 'ورقة', unit1: 'ورقتي عملة', page: 119 },
    quran: { name: 'ساعات حفظ أمجد للقرآن الكريم (مراجعة 4 ص 120)', cat: ['الأول', 'الثاني', 'الثالث'], head: 'اليوم', v: [2, 2.5, 3], key: 1, icon: 'hour', unit: 'ساعة', unit1: 'ساعة', page: 120 }
  };
  G.reg({
    id: 'pictograph', unit: U, order: 1, lesson: '6-1', lessonTitle: 'تنظيم البيانات في جداول', page: 111,
    titleAr: 'التمثيل بالصور ومفتاح الصورة', titleEn: 'Pictographs and the Key', tags: 'تمثيل بالصور مفتاح جدول بيانات سنونو وادي الباذان مستشفيات اثواب مطرزه عمله ساعات قران',
    formula: '\\text{العدد} = \\text{عدد الصور} \\times \\text{قيمة المفتاح}',
    book: 'المفتاح: كل صورة تمثل عدداً محدداً ؛ عدد الصور × قيمة المفتاح = العدد ، ونصف الصورة يمثل نصف قيمة المفتاح',
    summary: 'في التمثيل بالصور تمثل كل صورة عدداً يبيّنه **المفتاح**. نجد العدد بضرب عدد الصور في قيمة المفتاح، وجزء الصورة يمثل جزءاً من قيمة المفتاح. وكلما كبرت قيمة المفتاح قلّ عدد الصور اللازمة.',
    vars: [['\\text{المفتاح}', 'ما تمثله الصورة الواحدة', '١ أو ٢ أو ٣ أو ٥'], ['\\text{عدد الصور}', 'العدد ÷ قيمة المفتاح', '']],
    params: [
      { key: 'ds', label: '\\text{البيانات}', type: 'select', value: 'swal', options: Object.keys(PIC).map((k) => [k, PIC[k].name]) },
      { key: 'key', label: '\\text{المفتاح}', type: 'select', value: '1', options: G.opts([['1', 'كل صورة = ١'], ['2', 'كل صورة = ٢'], ['3', 'كل صورة = ٣'], ['5', 'كل صورة = ٥']]) },
      { key: 'num', label: '\\text{الأعداد}', type: 'toggle', value: true, on: 'أظهر عمود العدد', off: 'أخفِ الأعداد (أحسبها بنفسي)' }
    ],
    onSet(p, k) { if (k === 'ds') p.key = String(PIC[p.ds].key); },
    custom: true, canvasHint: 'غيّر المفتاح ولاحظ: العدد نفسه لكن عدد الصور يتغيّر. الصورة المقطوعة تمثل جزءاً من المفتاح.',
    compute(p) {
      const D = PIC[p.ds]; const key = +p.key; const pics = D.v.map((v) => v / key);
      return { D: D, key: key, pics: pics, tot: sum(D.v), mx: argmax(D.v), mn: argmin(D.v), bookKey: key === D.key };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); const D = d.D; const n = D.cat.length;
      const labW = nar ? 82 : 130, numW = p.num ? (nar ? 40 : 60) : 0; const top = 34, rowH = Math.min(58, (H - top - 44) / n);
      const maxPics = Math.max.apply(null, d.pics.map(Math.ceil)); const s = Math.min(rowH - 8, (W - labW - numW - 30) / Math.max(maxPics, 1));
      const xr = W - 10; // يمين الجدول
      ctx.fillStyle = 'rgba(37,99,235,.12)'; ctx.fillRect(10, 8, W - 20, top - 10);
      G.txt(ctx, D.head, xr - labW / 2, 8 + (top - 10) / 2, { color: c.text, size: nar ? 12 : 14, w: '800' });
      G.txt(ctx, 'التمثيل بالصور', (10 + numW + xr - labW) / 2, 8 + (top - 10) / 2, { color: c.text, size: nar ? 12 : 14, w: '800' });
      if (p.num) G.txt(ctx, 'العدد', 10 + numW / 2, 8 + (top - 10) / 2, { color: c.text, size: nar ? 12 : 14, w: '800' });
      for (let i = 0; i < n; i++) {
        const y = top + i * rowH; ctx.strokeStyle = c.grid; ctx.lineWidth = 1; ctx.strokeRect(10, y, W - 20, rowH);
        if (i === d.mx) { ctx.fillStyle = 'rgba(5,150,105,.08)'; ctx.fillRect(10, y, W - 20, rowH); }
        G.txt(ctx, D.cat[i], xr - labW / 2, y + rowH / 2, { color: c.text, size: nar ? 11 : 13, w: '700' });
        const full = Math.floor(d.pics[i] + 1e-9), part = d.pics[i] - full;
        for (let k = 0; k < full + (part > 1e-9 ? 1 : 0); k++) icon(ctx, D.icon, xr - labW - (k + 1) * s, y + (rowH - s) / 2, s, k < full ? 1 : part, c);
        if (p.num) G.txt(ctx, G.L(String(D.v[i]).replace('.', ',')), 10 + numW / 2, y + rowH / 2, { color: c.c1, size: nar ? 13 : 15, w: '800' });
      }
      ctx.strokeStyle = c.grid; ctx.beginPath(); ctx.moveTo(xr - labW, top); ctx.lineTo(xr - labW, top + n * rowH); if (p.num) { ctx.moveTo(10 + numW, top); ctx.lineTo(10 + numW, top + n * rowH); } ctx.stroke();
      const ky = top + n * rowH + 20; icon(ctx, D.icon, W / 2 + 70, ky - 13, 26, 1, c);
      G.txt(ctx, 'المفتاح: كل صورة تمثل ' + (d.bookKey ? D.unit1 : G.L(d.key) + ' ' + D.unit), W / 2 + 54, ky, { color: d.bookKey ? c.text : c.c4, size: nar ? 12 : 14, w: '800', align: 'right' });
    },
    live(p, d) { return '\\text{المجموع} = ' + d.D.v.map((v) => String(v)).join(' + ') + ' = ' + d.tot; },
    results(p, d) {
      const D = d.D; const L = (v) => G.L(String(v).replace('.', ','));
      return [['الأكبر', D.cat[d.mx] + ' (' + L(D.v[d.mx]) + ')', false, 'pos'], ['الأصغر', D.cat[d.mn] + ' (' + L(D.v[d.mn]) + ')', false], ['المجموع', L(d.tot) + ' ' + D.unit, false, 'pos'],
        ['عدد الصور', d.pics.map((x) => L(Math.round(x * 100) / 100)).join(' ، '), false]];
    },
    steps(p, d) {
      const D = d.D; const L = (v) => G.L(String(v).replace('.', ','));
      const s = ['المفتاح: كل صورة تمثل ' + G.L(d.key) + ' ' + (d.key === 1 ? '(واحد)' : '') + '.', 'نجد العدد في كل صف: عدد الصور × ' + G.L(d.key) + '؛ مثلاً ' + D.cat[0] + ': ' + L(Math.round(d.pics[0] * 100) / 100) + ' × ' + G.L(d.key) + ' = ' + L(D.v[0]) + '.'];
      if (d.pics.some((x) => Math.abs(x - Math.round(x)) > 1e-9)) s.push('بعض الصفوف فيها جزء صورة: جزء الصورة يمثل جزءاً من قيمة المفتاح (نصف الصورة = نصف المفتاح).');
      s.push('أكبر عدد في صف «' + D.cat[d.mx] + '»، والمجموع ' + L(d.tot) + ' ' + D.unit + '.');
      return s;
    },
    explain(a, b, da, db) { return da && a.key !== b.key && a.ds === b.ds ? ['المفتاح الآن ' + G.L(db.key) + ': البيانات لم تتغيّر، لكن عدد الصور ' + (db.key > da.key ? 'قلّ.' : 'زاد.')] : []; },
    learn: [
      '**نشاط 1 ص 111:** محمود في محمية وادي الباذان (نابلس) ٥ ساعات، وكل صورة طائر واحد: ٧ ، ٩ ، ٦ ، ١٠ ، ١١ ؛ أكبر عدد في الساعة الخامسة، والمجموع ٤٣ طائراً.',
      '**نشاط 2 ص 112:** عدد المستشفيات (إحصائية 2015م): رام الله والبيرة ٨ ، القدس ١٠ ، غزة ١٠ ، الخليل ٧ ، جنين ٦.',
      '**نشاط 3 ص 112–113:** لغزة ٦ أثواب مطرزة مثّلت بصورتين، فالمفتاح: كل صورة = ٣ أثواب؛ الخليل ٩ ، بيت لحم ٩ ، نابلس ٣.',
      '**مراجعة 2 ص 118:** كل وجه مبتسم يدل على ٥ طلاب: الأول ١٠ ، الثاني ١٥ ، الثالث ١٥ ، الرابع ٢٥.',
      '**مراجعة 3 ص 119:** الصورة تدل على ورقتي عملة: الفلسطينية ٨ ، المصرية ٦ ، السورية ٦ ، الأردنية ٤.',
      '**مراجعة 4 ص 120:** أمجد: ٢ ثم ٢ ونصف ثم ٣ ساعات، فالمجموع ٧ ساعات ونصف (نصف الصورة نصف ساعة).'
    ],
    challenges: [
      { q: 'كم طائر سنونو شاهد محمود في الساعات الخمس؟', hint: 'اجمع الأعداد في جدول نشاط 1.', init: { ds: 'hosp', key: '1', num: false }, check: (p) => p.ds === 'swal' && p.num, why: () => '٧ + ٩ + ٦ + ١٠ + ١١ = ٤٣ طائراً.' },
      { q: 'مثّل الأثواب بمفتاح الكتاب (كل صورة ٣ أثواب).', hint: 'نشاط 3 ص 112.', init: { ds: 'dress', key: '1', num: true }, check: (p) => p.ds === 'dress' && p.key === '3' },
      { q: 'اختر مفتاحاً يجعل عدد صور المستشفيات في القدس ٥ صور تماماً.', hint: '١٠ ÷ ؟ = ٥', init: { ds: 'hosp', key: '1', num: true }, check: (p) => p.ds === 'hosp' && p.key === '2' }
    ],
    tutor: [
      { q: 'ما فائدة المفتاح؟', k: ['المفتاح', 'فائده'], a: () => 'يبيّن العدد الذي تمثله الصورة الواحدة؛ فنضرب عدد الصور في قيمته لنجد العدد.' },
      { q: 'ماذا تعني نصف الصورة؟', k: ['نصف', 'جزء'], a: (p, d) => 'نصف قيمة المفتاح؛ والمفتاح الآن ' + G.L(d.key) + '.' },
      { q: 'ما المجموع؟', k: ['المجموع', 'كم'], a: (p, d) => G.L(String(d.tot).replace('.', ',')) + ' ' + d.D.unit + '.' }
    ]
  });

  /* ======================= جدول الإشارات (ص 113–118) ======================= */
  const TOWNS = [
    ['بئر السبع', 'إسدود', 'إسدود', 'بئر السبع', 'المجدل'], ['اللد', 'بئر السبع', 'اللد', 'اللد', 'بئر السبع'], ['المجدل', 'اللد', 'المجدل', 'يافا', 'بئر السبع'],
    ['بئر السبع', 'يافا', 'بئر السبع', 'المجدل', 'اللد'], ['يافا', 'المجدل', 'يافا', 'إسدود', 'بئر السبع'], ['المجدل', 'إسدود', 'بئر السبع', 'يافا', 'اللد']
  ];
  const CITY = ['القدس', 'غزة', 'الخليل', 'القدس', 'يافا', 'الخليل', 'القدس', 'غزة', 'الخليل', 'القدس', 'يافا', 'الخليل', 'القدس', 'غزة', 'الخليل', 'القدس'];
  const TAL = {
    towns: { name: 'البلدات الأصلية لطلاب الصف (مراجعة 1 ص 117)', cats: ['بئر السبع', 'المجدل', 'إسدود', 'اللد', 'يافا'], raw: [].concat.apply([], TOWNS), cols: 5 },
    city: { name: 'المدن التي ترغب الطالبات في زيارتها (نشاط 5 ص 114) — ' + G.SIMPLE + ' لترتيب الأوراق', cats: ['غزة', 'القدس', 'يافا', 'الخليل'], raw: CITY, cols: 8 }
  };
  // إشارات العدد: كل خمس إشارات حزمة (أربع خطوط وخط مائل)
  function tally(ctx, n, x, y, h, col) {
    const gap = h * 0.22, bundle = gap * 4 + h * 0.5; let xx = x;
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = Math.max(1.6, h / 12); ctx.lineCap = 'round';
    for (let b = 0; b < Math.ceil(n / 5); b++) {
      const k = Math.min(5, n - b * 5);
      for (let i = 0; i < Math.min(4, k); i++) { const lx = xx - i * gap; ctx.beginPath(); ctx.moveTo(lx, y - h / 2); ctx.lineTo(lx, y + h / 2); ctx.stroke(); }
      if (k === 5) { ctx.beginPath(); ctx.moveTo(xx + gap * 0.5, y - h * 0.3); ctx.lineTo(xx - gap * 3.5, y + h * 0.3); ctx.stroke(); }
      xx -= bundle;
    }
    ctx.restore();
  }
  G.reg({
    id: 'tally-table', unit: U, order: 2, lesson: '6-1', lessonTitle: 'تنظيم البيانات في جداول: جدول الإشارات', page: 113,
    titleAr: 'جدول الإشارات (التكرار)', titleEn: 'Tally Tables', tags: 'اشارات اشاره العدد تكرار جدول تفريغ اجابات حزمه خمسه بلدات اصليه مدن زياره',
    formula: '\\text{إشارة} = 1,\\qquad \\text{حزمة} = 5',
    book: 'الإشارة / تعني العدد واحداً، والإشارة ⧸⧸⧸⧸ (أربع إشارات يقطعها خط) تعني العدد خمسة',
    summary: 'نفرّغ البيانات في **جدول الإشارات**: نضع إشارة / لكل إجابة أمام فئتها، وكل خمس إشارات نجمعها في **حزمة** (أربع إشارات يقطعها خط)، ثم نعدّ الإشارات فنحصل على **العدد (التكرار)**. العدّ بالحزم أسهل وأسرع.',
    vars: [['/', 'إشارة واحدة', 'تعني ١'], ['\\text{حزمة}', 'أربع إشارات وخط مائل', 'تعني ٥']],
    params: [
      { key: 'mode', label: '\\text{النشاط}', type: 'select', value: 'data', options: [['data', 'أفرّغ البيانات في جدول الإشارات'], ['num', 'أكتب العدد بالإشارات']] },
      { key: 'ds', label: '\\text{البيانات}', type: 'select', value: 'towns', options: Object.keys(TAL).map((k) => [k, TAL[k].name]), hidden: (p) => p.mode !== 'data' },
      { key: 'k', label: '\\text{الإجابات المفرّغة}', min: 0, max: 30, step: 1, value: 30, int: true, hidden: (p) => p.mode !== 'data' },
      { key: 'n', label: '\\text{العدد}', min: 1, max: 30, step: 1, value: 15, int: true, hidden: (p) => p.mode !== 'num' }
    ],
    onSet(p, key) { if (key === 'ds') p.k = TAL[p.ds].raw.length; if (p.mode === 'data') p.k = Math.min(p.k, TAL[p.ds].raw.length); },
    custom: true, canvasHint: 'اضغط على أي إجابة في الجدول العلوي لتفريغ الإجابات حتى عندها، أو حرّك المنزلق. كل خمس إشارات تُجمع في حزمة.',
    compute(p) {
      if (p.mode === 'num') return { num: true, n: p.n, b: Math.floor(p.n / 5), r: p.n % 5 };
      const D = TAL[p.ds]; const k = Math.min(p.k, D.raw.length); const cnt = D.cats.map((cat) => D.raw.slice(0, k).filter((x) => x === cat).length);
      return { D: D, k: k, cnt: cnt, full: D.cats.map((cat) => D.raw.filter((x) => x === cat).length), last: k ? D.raw[k - 1] : null };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); d.hits = [];
      if (d.num) {
        const h = Math.min(60, H * 0.2); tally(ctx, d.n, W - 40, H * 0.4, h, c.c1);
        G.txt(ctx, G.L(d.b) + ' حزم × ٥ + ' + G.L(d.r) + ' = ' + G.L(d.n), W / 2, H * 0.75, { color: c.c3, size: nar ? 16 : 20, w: '800' });
        return;
      }
      const D = d.D; const rows = Math.ceil(D.raw.length / D.cols); const gh = Math.min(H * 0.46, rows * 30); const ch = gh / rows, cw = (W - 20) / D.cols;
      D.raw.forEach((x, i) => {
        const r = Math.floor(i / D.cols), col = i % D.cols; const cx = W - 10 - (col + 1) * cw, cy = 8 + r * ch;
        ctx.fillStyle = i < d.k ? (i === d.k - 1 ? 'rgba(217,119,6,.35)' : 'rgba(148,163,184,.18)') : 'rgba(37,99,235,.06)'; ctx.fillRect(cx + 1, cy + 1, cw - 2, ch - 2);
        G.txt(ctx, x, cx + cw / 2, cy + ch / 2, { color: i < d.k ? c.muted : c.text, size: Math.min(13, cw / 6), w: '700' });
        d.hits.push({ x: cx, y: cy, w: cw, h: ch, i: i });
      });
      const top = 8 + gh + 14; const rh = Math.min(34, (H - top - 6) / (D.cats.length + 1)); const c1 = nar ? 74 : 120, c3 = nar ? 46 : 70;
      [['اسم البلد', W - 10 - c1 / 2], ['الإشارات', (10 + c3 + W - 10 - c1) / 2], ['العدد', 10 + c3 / 2]].forEach((h) => G.txt(ctx, h[0], h[1], top + rh / 2, { color: c.text, size: 13, w: '800' }));
      ctx.fillStyle = 'rgba(37,99,235,.1)'; ctx.fillRect(10, top, W - 20, rh);
      D.cats.forEach((cat, i) => {
        const y = top + (i + 1) * rh; ctx.strokeStyle = c.grid; ctx.strokeRect(10, y, W - 20, rh); if (cat === d.last) { ctx.fillStyle = 'rgba(217,119,6,.15)'; ctx.fillRect(10, y, W - 20, rh); }
        G.txt(ctx, cat, W - 10 - c1 / 2, y + rh / 2, { color: c.text, size: nar ? 11 : 13, w: '700' });
        tally(ctx, d.cnt[i], W - 10 - c1 - 12, y + rh / 2, rh * 0.62, c.c1);
        G.txt(ctx, d.cnt[i], 10 + c3 / 2, y + rh / 2, { color: c.c3, size: 15, w: '800' });
      });
    },
    onPointer(type, x, y, p, st, api) { if (type !== 'down' || p.mode !== 'data') return false; const h = api.hit(x, y); if (!h) return false; api.set('k', h.i + 1); return true; },
    live(p, d) { if (d.num) return d.n + ' = 5 \\times ' + d.b + ' + ' + d.r; return '\\text{فُرّغت}\\ ' + d.k + '\\ \\text{من}\\ ' + d.D.raw.length + '\\ \\text{إجابة}'; },
    results(p, d) {
      if (d.num) return [['عدد الحزم', G.L(d.b), false, 'pos'], ['إشارات منفردة', G.L(d.r), false], ['العدد', G.L(d.n), false, 'pos']];
      const D = d.D; const mx = argmax(d.full);
      return D.cats.map((cat, i) => [cat, G.L(d.cnt[i]) + (d.k < D.raw.length ? ' (من ' + G.L(d.full[i]) + ')' : ''), false, i === mx && d.k === D.raw.length ? 'pos' : ''])
        .concat([['المجموع', G.L(sum(d.cnt)), false], ['الأكثر تكراراً', D.cats[mx] + ' (' + G.L(d.full[mx]) + ')', false, 'pos']]);
    },
    steps(p, d) {
      if (d.num) return ['كل حزمة (أربع إشارات وخط مائل) = ٥.', G.L(d.n) + ' = ' + G.L(d.b) + ' حزم و ' + G.L(d.r) + ' إشارات منفردة.'];
      return ['نقرأ الإجابات واحدة واحدة، ونضع إشارة / أمام البلد في كل مرة' + (d.last ? ' (آخر إجابة: ' + d.last + ')' : '') + '.', 'بعد الإشارة الرابعة نرسم الخامسة خطاً مائلاً يقطعها، فتصبح حزمة = ٥.', 'نعدّ الإشارات: ' + d.D.cats.map((cat, i) => cat + ' ' + G.L(d.cnt[i])).join(' ، ') + '.', 'نتحقق: مجموع الأعداد = عدد الإجابات = ' + G.L(sum(d.cnt)) + '.'];
    },
    explain(a, b, da, db) { return da && !db.num && db.last && a.k !== b.k ? ['أضفنا إشارة أمام «' + db.last + '».'] : []; },
    learn: [
      '**نشاط 4 ص 113:** الإشارة / تعني العدد واحداً، والإشارة ⧸⧸⧸⧸ تعني العدد خمسة؛ ثلاث حزم تعني ١٥ ، والعدد ٢٠ يرمز له بأربع حزم.',
      '**نشاط 5 ص 114:** المدن: غزة ٣ ، القدس ٦ ، يافا ٢ ، الخليل ٥ ؛ الأكثر رغبة القدس، والطالبات ١٦.',
      '**مراجعة 1 ص 117:** ٣٠ إجابة عن البلدات الأصلية: بئر السبع ٩ ، المجدل ٦ ، إسدود ٤ ، اللد ٦ ، يافا ٥.',
      '**مراجعة 2 ص 118:** نعبّر عن جدول التمثيل بالصور (الصفوف ١٠ ، ١٥ ، ١٥ ، ٢٥) بجدول الإشارات.'
    ],
    challenges: [
      { q: 'فرّغ كل إجابات مراجعة 1 وجد البلد الأكثر تكراراً.', hint: 'حرّك المنزلق إلى ٣٠.', init: { mode: 'data', ds: 'towns', k: 0 }, check: (p) => p.mode === 'data' && p.ds === 'towns' && p.k === 30, why: () => 'بئر السبع (٩ مرات).' },
      { q: 'اكتب العدد ٢٠ بالإشارات (نشاط 4).', hint: 'اختر «أكتب العدد بالإشارات».', init: { mode: 'num', n: 3 }, check: (p) => p.mode === 'num' && p.n === 20, why: () => 'أربع حزم.' },
      { q: 'فرّغ الإجابات حتى تصبح أول حزمة كاملة لبئر السبع.', hint: 'تابع جدول الإشارات.', init: { mode: 'data', ds: 'towns', k: 0 }, check: (p, d) => p.mode === 'data' && p.ds === 'towns' && d.cnt && d.cnt[0] === 5 }
    ],
    tutor: [
      { q: 'لماذا نجمع الإشارات في حزم؟', k: ['حزم', 'حزمه'], a: () => 'لأن العدّ بالخمسات أسرع وأقل خطأً: ثلاث حزم = ١٥ مباشرة.' },
      { q: 'كيف أتأكد أنني لم أنسَ إجابة؟', k: ['اتاكد', 'انس'], a: () => 'مجموع الأعداد في الجدول يجب أن يساوي عدد الإجابات.' },
      { q: 'ما البلد الأكثر تكراراً؟', k: ['الاكثر', 'تكرارا'], a: (p, d) => (d.num ? 'اختر وضع تفريغ البيانات.' : d.D.cats[argmax(d.full)] + '.') }
    ]
  });

  /* ======================= الدرس الثاني: تمثيل البيانات بالأعمدة (ص 115–119) ======================= */
  const BAR = {
    sport: { name: 'الرياضة المفضلة (نشاط 1 ص 115)', cats: ['كرة القدم', 'كرة السلة', 'كرة الطائرة'], v: [7, 4, 5], step: 1, max: 7, yl: 'عدد الطلاب', xl: 'الرياضة المفضلة' },
    books: { name: 'الكتب المستعارة من المكتبة (نشاط 2 ص 115)', cats: ['قصص أطفال', 'كتب علمية', 'كتب تاريخية', 'كتب دينية'], v: [5, 2, 3, 4], step: 1, max: 6, yl: 'عدد الطالبات', xl: 'أنواع الكتب' },
    tv: { name: 'برامج التلفاز المفضلة (نشاط 3 ص 116)', cats: ['دينية', 'تعليمية', 'ترفيهية'], v: [9, 6, 15], step: 3, max: 15, yl: 'عدد الطالبات', xl: 'البرامج' },
    inst: { name: 'مؤسسات رعاية ذوي الإعاقة (نشاط 4 ص 116)', cats: ['القدس', 'جنين', 'رفح'], v: [13, 9, 4], step: 2, max: 14, yl: 'عدد المؤسسات', xl: 'المحافظة' },
    money: { name: 'أوراق العملة (مراجعة 3 ص 119)', cats: ['الفلسطينية', 'السورية', 'المصرية', 'الأردنية'], v: [8, 6, 6, 4], step: 1, max: 9, yl: 'عدد أوراق العملة', xl: 'العملة' }
  };
  G.reg({
    id: 'bar-graph', unit: U, order: 3, lesson: '6-2', lessonTitle: 'تمثيل البيانات بالأعمدة', page: 115,
    titleAr: 'تمثيل البيانات بالأعمدة وقراءتها', titleEn: 'Bar Graphs', tags: 'اعمده تمثيل بيانات محور تدريج رياضه مفضله كتب مكتبه برامج تلفاز مؤسسات عمله',
    formula: '\\text{ارتفاع العمود} = \\text{العدد}',
    book: 'نمثل كل فئة بعمود ارتفاعه يساوي عددها على المحور الرأسي، ونقرأ العدد من رأس العمود',
    summary: 'في **التمثيل بالأعمدة** نرسم لكل فئة عموداً ارتفاعه يساوي عددها. نقرأ العدد بمدّ خط أفقي من رأس العمود إلى المحور الرأسي. ويمكن أن يكون تدريج المحور ١ أو ٢ أو ٣…، فنعدّ بحسبه. العمود الأطول يمثل الأكثر والأقصر يمثل الأقل.',
    vars: [['\\text{المحور الرأسي}', 'العدد', 'بتدريج ١ أو ٢ أو ٣'], ['\\text{المحور الأفقي}', 'الفئات', '']],
    params: [
      { key: 'ds', label: '\\text{البيانات}', type: 'select', value: 'sport', options: Object.keys(BAR).map((k) => [k, BAR[k].name]) },
      { key: 'mode', label: '\\text{النشاط}', type: 'select', value: 'read', options: [['read', 'أقرأ التمثيل بالأعمدة'], ['build', 'أمثّل الجدول بالأعمدة (اضغط على الشبكة)']] }
    ],
    initState(p) { return { h: BAR[p.ds || 'sport'].v.map(() => 0) }; },
    resetOn: ['ds', 'mode'],
    custom: true, canvasHint: 'في وضع التمثيل: اضغط داخل عمود الفئة عند الارتفاع المطلوب. الخط المتقطع يبيّن قراءة رأس العمود على المحور.',
    compute(p) { const D = BAR[p.ds]; return { D: D, tot: sum(D.v), mx: argmax(D.v), mn: argmin(D.v) }; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); const D = d.D; const n = D.cats.length; d.hits = [];
      const hs = p.mode === 'build' && d.st && d.st.h && d.st.h.length === n ? d.st.h : D.v;
      const x0 = nar ? 46 : 70, x1 = W - 14, y0 = H - (nar ? 46 : 54), y1 = 30; const top = Math.ceil(D.max / D.step) * D.step;
      const Y = (v) => y0 - v / top * (y0 - y1); const cw = (x1 - x0) / n;
      // الشبكة والتدريج على المحور الرأسي (يسار كما في الكتاب)
      for (let v = 0; v <= top; v += D.step) { const yy = Y(v); ctx.strokeStyle = c.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x1, yy); ctx.stroke(); G.txt(ctx, v, x0 - 14, yy, { color: c.text, size: 12, w: '700' }); }
      ctx.strokeStyle = c.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y1 - 8); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
      G.txt(ctx, D.yl, x0 + 4, y1 - 18, { color: c.muted, size: 12, w: '700', align: 'left' });
      const cols = [c.c6, c.c3, c.c2, c.c4, c.c1];
      for (let i = 0; i < n; i++) {
        const bx = x0 + i * cw + cw * 0.22, bw = cw * 0.56; const v = hs[i];
        if (v > 0) { ctx.fillStyle = cols[i % cols.length]; ctx.globalAlpha = 0.85; ctx.fillRect(bx, Y(v), bw, y0 - Y(v)); ctx.globalAlpha = 1; }
        if (p.mode === 'build' && v !== D.v[i]) { ctx.save(); ctx.strokeStyle = c.muted; ctx.setLineDash([4, 3]); ctx.strokeRect(bx, Y(D.v[i]), bw, y0 - Y(D.v[i])); ctx.restore(); }
        if (p.mode === 'read' || v > 0) { ctx.save(); ctx.strokeStyle = c.c5; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(bx, Y(v)); ctx.lineTo(x0, Y(v)); ctx.stroke(); ctx.restore(); G.txt(ctx, v, bx + bw / 2, Y(v) - 11, { color: c.text, size: 13, w: '800', halo: c.bg }); }
        G.txt(ctx, D.cats[i], x0 + (i + 0.5) * cw, y0 + 16, { color: c.text, size: nar ? 10 : 12, w: '700' });
        d.hits.push({ x: x0 + i * cw, y: y1 - 8, w: cw, h: y0 - y1 + 16, i: i, x0: x0, y0: y0, y1: y1, top: top, step: D.step });
      }
      G.txt(ctx, D.xl, (x0 + x1) / 2, H - 12, { color: c.muted, size: 12, w: '700' });
    },
    onPointer(type, x, y, p, st, api) {
      if (type !== 'down' || p.mode !== 'build') return false; const h = api.hit(x, y); if (!h) return false;
      const D = BAR[p.ds];
      let v = Math.round((h.y0 - y) / (h.y0 - h.y1) * h.top); v = Math.max(0, Math.min(h.top, v));
      if (!st.h || st.h.length !== D.v.length) st.h = D.v.map(() => 0);
      st.h[h.i] = v; api.say(['عمود «' + D.cats[h.i] + '» الآن ' + G.L(v) + (v === D.v[h.i] ? ' ✔ يطابق الجدول.' : ' — في الجدول ' + G.L(D.v[h.i]) + '.')]); return true;
    },
    live(p, d) { return '\\text{المجموع} = ' + d.D.v.join(' + ') + ' = ' + d.tot; },
    results(p, d) {
      const D = d.D; const r = [['الأكثر', D.cats[d.mx] + ' (' + G.L(D.v[d.mx]) + ')', false, 'pos'], ['الأقل', D.cats[d.mn] + ' (' + G.L(D.v[d.mn]) + ')', false], ['المجموع', G.L(d.tot), false, 'pos']];
      if (p.ds === 'books') r.push(['الدينية + التاريخية', G.L(D.v[3] + D.v[2]) + ' طالبات', false]);
      if (p.mode === 'build') { const h = (d.st && d.st.h) || []; const ok = D.v.filter((v, i) => h[i] === v).length; r.push(['أعمدة صحيحة', G.L(ok) + ' من ' + G.L(D.v.length), false, ok === D.v.length ? 'pos' : 'neg']); }
      return r;
    },
    steps(p, d) {
      const D = d.D;
      return ['تدريج المحور الرأسي ' + G.L(D.step) + (D.step > 1 ? '؛ فكل خط من خطوط التدريج يزيد ' + G.L(D.step) + '، ونقدّر ما بين الخطوط.' : '.'),
        'نقرأ رأس كل عمود: ' + D.cats.map((cat, i) => cat + ' ' + G.L(D.v[i])).join(' ، ') + '.',
        'العمود الأطول «' + D.cats[d.mx] + '» هو الأكثر، والأقصر «' + D.cats[d.mn] + '» هو الأقل.', 'المجموع = ' + G.L(d.tot) + '.'];
    },
    explain(a, b) { return a.ds !== b.ds ? ['بيانات جديدة؛ لاحظ تدريج المحور الرأسي قبل القراءة.'] : []; },
    learn: [
      '**نشاط 1 ص 115:** كرة القدم ٧ طلاب، كرة السلة ٤ ، كرة الطائرة ٥ ؛ الأقل تفضيلاً كرة السلة، وعدد طلاب الصف ١٦.',
      '**نشاط 2 ص 115:** قصص أطفال ٥ ، كتب علمية ٢ ، تاريخية ٣ ، دينية ٤ ؛ الأكثر استعارة قصص الأطفال، والدينية مع التاريخية ٧ ، والمجموع ١٤ طالبة.',
      '**نشاط 3 ص 116:** هناء: دينية ٩ ، تعليمية ٦ ، ترفيهية ١٥ (التدريج ٣).',
      '**نشاط 4 ص 116:** مؤسسات رعاية ذوي الإعاقة: القدس ١٣ ، جنين ٩ ، رفح ٤ (التدريج ٢).',
      '**مراجعة 3 ص 119:** نمثل جدول العملات بالأعمدة الرأسية: الفلسطينية ٨ ، السورية ٦ ، المصرية ٦ ، الأردنية ٤.'
    ],
    challenges: [
      { q: 'مثّل جدول برامج التلفاز بالأعمدة (نشاط 3).', hint: 'اختر البيانات ثم «أمثّل الجدول» واضغط عند ٩ و ٦ و ١٥.', init: { ds: 'sport', mode: 'read' }, check: (p, d) => p.ds === 'tv' && p.mode === 'build' && d.st && d.st.h && d.st.h.join() === '9,6,15' },
      { q: 'مثّل جدول المؤسسات بالأعمدة (نشاط 4).', hint: 'التدريج ٢ ؛ ١٣ بين ١٢ و ١٤.', init: { ds: 'sport', mode: 'read' }, check: (p, d) => p.ds === 'inst' && p.mode === 'build' && d.st && d.st.h && d.st.h.join() === '13,9,4' },
      { q: 'اعرض بيانات نشاط 2 واقرأ أكثر الكتب استعارة.', hint: 'اختر الكتب المستعارة.', init: { ds: 'sport', mode: 'build' }, check: (p) => p.ds === 'books' && p.mode === 'read', why: () => 'قصص الأطفال (٥ طالبات).' }
    ],
    tutor: [
      { q: 'كيف أقرأ العدد من العمود؟', k: ['اقرا', 'العمود'], a: () => 'أمدّ خطاً أفقياً من رأس العمود إلى المحور الرأسي وأقرأ العدد، مع الانتباه إلى التدريج.' },
      { q: 'ماذا لو كان التدريج ٢ والعدد فردياً؟', k: ['فردي', 'التدريج'], a: () => 'يقع رأس العمود في منتصف المسافة بين خطين، مثل ١٣ بين ١٢ و ١٤.' },
      { q: 'ما الفئة الأكثر؟', k: ['الاكثر', 'اكبر'], a: (p, d) => d.D.cats[d.mx] + ' (' + G.L(d.D.v[d.mx]) + ').' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
