/* رياضيات الأول — الوحدة الأولى: الأعداد من (١ – ٩) (ص 2–30) */
(function (root) {
  'use strict';
  const ML = root.ML; const G = ML.m1;
  const U = 1;
  const L = (x) => G.L(x);

  /* ======================= الدروس 1–9: العدد واحد … العدد تسعة (ص 4–28) ======================= */
  // مجموعات «هيّا نردّد» في كل درس: [الشيء، العبارة]
  const GRP = {
    1: [['girl', 'بنتٌ واحدة'], ['bird', 'عصفورٌ واحد'], ['tree', 'شجرةٌ واحدة']],
    2: [['girl', 'بنتان اثنتان'], ['bird', 'عصفوران اثنان'], ['tree', 'شجرتان اثنتان']],
    3: [['bee', 'ثلاث نحلات'], ['duck', 'ثلاث بطّات'], ['ant', 'ثلاث نملات']],
    4: [['hen', 'أربع دجاجات'], ['bird', 'أربعة عصافير'], ['orange', 'أربع برتقالات']],
    5: [['bus', 'خمس حافلات'], ['girl', 'خمس بنات'], ['balloon', 'خمسة بالونات']],
    6: [['boat', 'ستة قوارب'], ['flag', 'ستة أعلام'], ['tree', 'ست شجرات']],
    7: [['sheep', 'سبعة خراف'], ['bird', 'سبعة عصافير'], ['flower', 'سبع زهرات']],
    8: [['candle', 'ثماني شمعات'], ['cup', 'ثمانية أكواب'], ['balloon', 'ثمانية بالونات']],
    9: [['girl', 'تسع بنات'], ['ball', 'تسع كرات'], ['hoop', 'تسعة أطواق']]
  };
  const PAGE = [0, 4, 6, 9, 13, 16, 19, 22, 24, 26];
  const EXN = []; for (let n = 1; n <= 9; n++) GRP[n].forEach((g, i) => EXN.push([n + '-' + i, 'الدرس ' + L(n) + ' ص ' + L(PAGE[n]) + ': ' + g[1], n, i]));
  const BAL = ['#ef4444', '#22c55e', '#eab308', '#a855f7', '#3b82f6', '#f97316', '#ec4899', '#14b8a6', '#6366f1'];
  G.reg({
    id: 'number-intro', unit: U, order: 1, lesson: '1-1 – 1-9', lessonTitle: 'العدد واحد ١ … العدد تسعة ٩', page: 4,
    titleAr: 'أتعرّف العدد وأعدّ بالنقر', titleEn: 'Meet the Numbers 1–9', tags: 'عدد واحد اثنان ثلاثه اربعه خمسه سته سبعه ثمانيه تسعه عد اصابع ردد صفقه',
    formula: '1,\\ 2,\\ 3,\\ 4,\\ 5,\\ 6,\\ 7,\\ 8,\\ 9',
    book: 'هيّا نردّد ونعدّ: لكل عدد مجموعات من الحياة، ونكتب العدد ونلوّنه ونمثّله بالأصابع',
    summary: 'لكل عدد من ١ إلى ٩ اسم ورمز. نعدّ الأشياء واحداً واحداً: كل شيء نعدّه مرة واحدة فقط، **وآخر عدد نقوله هو عدد المجموعة**. وإذا جاء شيء جديد إلى مجموعة صار عددها **العدد الذي يليه**.',
    vars: [['\\text{العدد}', 'من ١ إلى ٩', '']],
    params: [
      { key: 'ex', label: '\\text{الدرس}', type: 'select', value: '3-1', options: G.opts(EXN.map((e) => [e[0], e[1]])) },
      { key: 'plus', label: '\\text{أعبّر بلغتي}', type: 'toggle', value: false, on: 'جاء واحد جديد', off: 'المجموعة كاملة' }
    ],
    initState() { return { counted: [] }; },
    resetOn: ['ex', 'plus'],
    custom: true, canvasHint: 'انقر كل شيء في المجموعة لتعدّه: ١ ، ٢ ، ٣ … عندما تعدّ الجميع يتلوّن الرقم.',
    compute(p) {
      const e = EXN.find((x) => x[0] === p.ex) || EXN[0]; const n = e[2]; const g = GRP[n][e[3]];
      const plus = p.plus && n >= 2;
      return { n: n, kind: g[0], phrase: g[1], plus: plus, shown: n };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); d.hits = []; const counted = (d.st && d.st.counted) || []; const done = counted.length >= d.n;
      const gx = nar ? 10 : W * 0.38, gw = nar ? W - 20 : W * 0.6 - 10, gh = nar ? H * 0.5 : H * 0.72, gy = 14;
      G.box(ctx, gx, gy, gw, gh, c.grid);
      if (d.plus) {
        const L1 = G.group(ctx, d.kind, d.n - 1, gx + gw * 0.32, gy + 8, gw * 0.66, gh - 16, c, { counted: counted, hits: d.hits });
        const one = [gx + gw * 0.12, gy + gh / 2]; const sz = Math.min(L1.s, gw * 0.2);
        const k = counted.indexOf(d.n - 1);
        if (k >= 0) { ctx.fillStyle = 'rgba(250,204,21,.28)'; ctx.beginPath(); ctx.arc(one[0], one[1], sz * 0.46, 0, 7); ctx.fill(); }
        G.icon(ctx, d.kind, one[0], one[1], sz * 0.9); if (k >= 0) G.txt(ctx, k + 1, one[0], one[1] - sz * 0.42, { color: c.c2, size: Math.max(13, sz * 0.3), w: '800', halo: c.bg });
        d.hits.push({ x: one[0] - sz / 2, y: one[1] - sz / 2, w: sz, h: sz, i: d.n - 1 });
        G.arrow(ctx, one[0] + sz * 0.5, one[1] + sz * 0.6, gx + gw * 0.33, one[1] + sz * 0.6, c.c4, 2.4);
      } else {
        const L1 = G.layout(d.n, gx + 8, gy + 8, gw - 16, gh - 16, 120);
        L1.pts.forEach((pt, i) => {
          const k = counted.indexOf(i);
          if (k >= 0) { ctx.fillStyle = 'rgba(250,204,21,.28)'; ctx.beginPath(); ctx.arc(pt[0], pt[1], L1.s * 0.46, 0, 7); ctx.fill(); }
          G.icon(ctx, d.kind, pt[0], pt[1], L1.s * 0.9, d.kind === 'balloon' || d.kind === 'candle' ? BAL[i] : undefined);
          if (k >= 0) G.txt(ctx, k + 1, pt[0], pt[1] - L1.s * 0.42, { color: c.c2, size: Math.max(14, L1.s * 0.3), w: '800', halo: c.bg });
          d.hits.push({ x: pt[0] - L1.s / 2, y: pt[1] - L1.s / 2, w: L1.s, h: L1.s, i: i });
        });
      }
      // الرقم واسمه والأصابع
      const dx = nar ? W / 2 : W * 0.19, dy = nar ? gh + 70 : H * 0.3; const ds = nar ? 90 : Math.min(170, H * 0.42);
      G.bigDigit(ctx, d.n, dx, dy, ds, c, done);
      G.txt(ctx, G.WORD[d.n], nar ? W * 0.82 : dx, nar ? dy : dy + ds * 0.62, { color: c.c1, size: nar ? 18 : 22, w: '800' });
      G.hands(ctx, d.n, nar ? W * 0.2 : dx, nar ? dy + 10 : H - 60, nar ? 40 : 52, c);
      G.txt(ctx, (d.plus ? L(d.n - 1) + ' وواحد = ' + L(d.n) : d.phrase) + (done ? ' ✔' : '  (عددتَ ' + L(counted.length) + ')'), nar ? W / 2 : gx + gw / 2, gy + gh + 22, { color: done ? c.c3 : c.text, size: nar ? 15 : 18, w: '800' });
    },
    onPointer(type, x, y, p, st, api) {
      if (type !== 'down') return false; const h = api.hit(x, y); if (!h || h.i === undefined) return false;
      if (st.counted.indexOf(h.i) < 0) st.counted.push(h.i); else return false;
      api.say(['قلتَ «' + L(st.counted.length) + '».' + (st.counted.length === api.hits().length ? ' عددتَ الجميع: آخر عدد قلته هو عدد المجموعة.' : '')]); return true;
    },
    live(p, d) { return d.plus ? (d.n - 1) + ' + 1 = ' + d.n : String(d.n); },
    results(p, d) {
      const cnt = ((d.st && d.st.counted) || []).length;
      return [['العدد', L(d.n) + ' (' + G.WORD[d.n] + ')', false, 'pos'], ['نردّد', d.plus ? L(d.n - 1) + ' وجاء واحد فصار العدد ' + L(d.n) : d.phrase, false], ['عددتَ', L(cnt) + ' من ' + L(d.n), false, cnt >= d.n ? 'pos' : '']];
    },
    steps(p, d) {
      const s = ['ننظر إلى الصورة ونسمّي ما فيها.', 'نعدّ بالنقر: كل شيء مرة واحدة فقط: ' + Array.from({ length: d.n }, (x, i) => L(i + 1)).join(' ، ') + '.', 'آخر عدد قلناه ' + L(d.n) + ' ، فعدد المجموعة ' + L(d.n) + ' ويُكتب ' + L(d.n) + '.'];
      if (d.plus) s.push('كان العدد ' + L(d.n - 1) + ' وجاء واحد جديد، فصار ' + L(d.n) + ' (أُعبّر بلغتي).');
      s.push('نمثّل العدد بالأصابع: ' + (d.n <= 5 ? 'يد واحدة.' : 'يد كاملة (٥) و ' + L(d.n - 5) + ' من اليد الأخرى.'));
      return s;
    },
    explain(a, b, da, db) { return da && da.n !== db.n ? ['العدد الآن ' + L(db.n) + ' (' + G.WORD[db.n] + ').'] : []; },
    learn: [
      '**مدخل الوحدة ص 2:** قديماً كان الرعاة يضعون حجراً صغيراً في كيس مقابل كل غنمة تخرج، ويُخرجون حجراً مقابل كل غنمة تعود؛ فلو بقي حجر فهناك غنمة لم تعد.',
      '**الدرس الأول ص 4:** ولدٌ واحد، جبلٌ واحد، علمٌ واحد ؛ بنتٌ واحدة، عصفورٌ واحد، شجرةٌ واحدة.',
      '**الدرس الثالث ص 9:** ثلاث نحلات، ثلاث بطّات، ثلاث نملات.',
      '**أُعبّر بلغتي (ص 14 ، 17 ، 20 ، 23 ، 25):** ثلاث دجاجات وجاءت دجاجة فصارت أربعاً؛ وكذلك ٥ و ١ = ٦ ، ٦ و ١ = ٧ ، ٧ و ١ = ٨.',
      '**ص 18:** ألوّن العدد ٥ ، وأحافظ على نظافة يديّ وترتيب المكان.'
    ],
    challenges: [
      { q: 'عُدّ البطّات الثلاث بالنقر (الدرس الثالث).', hint: 'اختر «ثلاث بطّات» وانقر كل بطة.', init: { ex: '3-1', plus: false }, check: (p, d) => p.ex === '3-1' && d.st && d.st.counted.length === 3 },
      { q: 'اختر درس العدد ٨ وعُدّ الشمعات.', hint: 'ثماني شمعات.', init: { ex: '1-0', plus: false }, check: (p, d) => p.ex === '8-0' && d.st && d.st.counted.length === 8 },
      { q: 'أُعبّر بلغتي: كان ٥ وجاء واحد. ما العدد؟', hint: 'اختر العدد ٦ وفعّل «جاء واحد جديد».', init: { ex: '5-0', plus: false }, check: (p, d) => d.n === 6 && d.plus, why: () => '٥ و ١ = ٦.' }
    ],
    tutor: [
      { q: 'كيف أعرف عدد المجموعة؟', k: ['اعرف', 'عدد المجموعه'], a: () => 'أعدّ كل شيء مرة واحدة، وآخر عدد أقوله هو عدد المجموعة.' },
      { q: 'كيف أمثّل العدد بأصابعي؟', k: ['اصابع', 'يد'], a: (p, d) => (d.n <= 5 ? 'أرفع ' + L(d.n) + ' أصابع من يد واحدة.' : 'أرفع يداً كاملة (٥) و ' + L(d.n - 5) + ' من اليد الأخرى.') },
      { q: 'ما اسم هذا العدد؟', k: ['اسم', 'هذا'], a: (p, d) => G.WORD[d.n] + '.' }
    ]
  });

  /* ======================= أعدّ وأختار العدد / أضع إشارة (أنشطة الدروس) ======================= */
  const CNT = [
    ['p11a', 'ص 11: أقلام', 'pencil', 3], ['p11b', 'ص 11: سمكة', 'fish', 1], ['p11c', 'ص 11: دجاجتان', 'hen', 2], ['p11d', 'ص 11: برتقالة', 'orange', 1], ['p11e', 'ص 11: سيارات', 'car', 3],
    ['p11f', 'ص 11: موزتان', 'banana', 2], ['p11g', 'ص 11: نحلتان', 'bee', 2], ['p11h', 'ص 11: أولاد', 'boy', 3], ['p12a', 'ص 12: تفاحات', 'apple', 3], ['p12b', 'ص 12: كرة', 'ball', 1],
    ['p12c', 'ص 12: ببغاوات', 'bird', 3], ['p12d', 'ص 12: بالونات', 'balloon', 4], ['p15a', 'ص 15: وجه مبتسم', 'smile', 1], ['p15b', 'ص 15: دجاجات', 'hen', 4], ['p15c', 'ص 15: بطّات', 'duck', 4],
    ['p15d', 'ص 15: دببة', 'bear', 3], ['p15e', 'ص 15: فلفلة', 'pepper', 1], ['p15f', 'ص 15: نقاط', 'circle', 4], ['p17a', 'ص 17: فراولات', 'strawberry', 5], ['p21a', 'ص 21: فراولات', 'strawberry', 4],
    ['p21b', 'ص 21: دجاجات', 'hen', 6], ['p27a', 'ص 27: نملات', 'ant', 9]
  ];
  const MARK = [
    ['m1', 'ص 5: المجموعة التي فيها شيء ١', 1, [['pepper', 1], ['bird', 3], ['moon', 1], ['bear', 2]]],
    ['m2', 'ص 7: المجموعة التي فيها ٢', 2, [['bird', 1], ['bee', 2], ['duck', 3], ['sheep', 2]]],
    ['m3', 'ص 10: المجموعة التي فيها ٣', 3, [['ball', 3], ['tree', 1], ['car', 3], ['hen', 2]]],
    ['m4', 'ص 14: المجموعة التي فيها ٤', 4, [['tree', 3], ['pencil', 4], ['boy', 2], ['car', 4]]]
  ];
  G.reg({
    id: 'count-match', unit: U, order: 2, lesson: '1-1 – 1-9', lessonTitle: 'أعدّ وأكتب العدد المناسب، أصل، أضع إشارة', page: 11,
    titleAr: 'أعدّ وأختار العدد المناسب', titleEn: 'Count and Choose the Number', tags: 'اعد اكتب العدد المناسب اصل اضع اشاره مجموعه بطاقه',
    formula: '\\text{عدد العناصر} = \\text{آخر عدد نقوله}',
    book: 'أعدّ وأكتب العدد المناسب ؛ أصل بين العدد والمجموعة المناسبة ؛ أضع إشارة ✔ تحت المجموعة التي فيها العدد المطلوب',
    summary: 'نعدّ أشياء المجموعة ثم نختار **بطاقة العدد** المناسبة. وفي «أضع إشارة» نعدّ كل مجموعة ونختار المجموعات التي **عدد عناصرها** يساوي العدد المطلوب.',
    vars: [['\\text{المجموعة}', 'أشياء نعدّها', 'من ١ إلى ٩']],
    params: [
      { key: 'mode', label: '\\text{النشاط}', type: 'select', value: 'count', options: [['count', 'أعدّ وأختار العدد'], ['mark', 'أضع إشارة ✔ تحت المجموعة']] },
      { key: 'ex', label: '\\text{المجموعة}', type: 'select', value: 'p11e', options: G.opts(CNT.map((e) => [e[0], e[1]])), hidden: (p) => p.mode !== 'count' },
      { key: 'set', label: '\\text{النشاط}', type: 'select', value: 'm2', options: G.opts(MARK.map((e) => [e[0], e[1]])), hidden: (p) => p.mode !== 'mark' }
    ],
    initState() { return { pick: null, marks: [] }; },
    resetOn: ['mode', 'ex', 'set'],
    custom: true, canvasHint: 'انقر بطاقة العدد الصحيح. في «أضع إشارة» انقر كل مجموعة فيها العدد المطلوب.',
    compute(p) {
      if (p.mode === 'mark') { const m = MARK.find((x) => x[0] === p.set); return { mark: true, m: m, target: m[2], good: m[3].map((g, i) => (g[1] === m[2] ? i : -1)).filter((i) => i >= 0) }; }
      const e = CNT.find((x) => x[0] === p.ex); return { e: e, n: e[3] };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); d.hits = []; const st = d.st || { pick: null, marks: [] };
      if (d.mark) {
        const n = 4; const bw = (W - 30) / (nar ? 2 : 4), bh = nar ? (H - 70) / 2 : H * 0.62;
        G.txt(ctx, 'أضع إشارة ✔ تحت المجموعة التي فيها ' + L(d.target), W / 2, 18, { color: c.c1, size: nar ? 15 : 18, w: '800' });
        d.m[3].forEach((g, i) => {
          const col = nar ? i % 2 : i, row = nar ? Math.floor(i / 2) : 0; const x = W - 15 - (col + 1) * bw, y = 38 + row * (bh + 4);
          const on = st.marks.indexOf(i) >= 0; const ok = g[1] === d.target;
          G.box(ctx, x + 4, y, bw - 8, bh - 34, on ? (ok ? c.c3 : c.c2) : c.c6, on ? (ok ? 'rgba(5,150,105,.1)' : 'rgba(220,38,38,.08)') : null);
          if (g[0] === 'moon') { ctx.fillStyle = '#1e293b'; ctx.fillRect(x + 6, y + 2, bw - 12, bh - 38); }
          G.group(ctx, g[0], g[1], x + 8, y + 4, bw - 16, bh - 42, c, { maxS: 80 });
          ctx.strokeStyle = c.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + bw / 2, y + bh - 16, 13, 0, 7); ctx.stroke();
          if (on) G.txt(ctx, '✔', x + bw / 2, y + bh - 16, { color: ok ? c.c3 : c.c2, size: 18, w: '800' });
          d.hits.push({ x: x + 4, y: y, w: bw - 8, h: bh, i: i });
        });
        return;
      }
      const gh = H - 110; G.box(ctx, 14, 10, W - 28, gh, c.c1);
      G.group(ctx, d.e[2], d.n, 22, 16, W - 44, gh - 12, c, { maxS: 110, col: d.e[2] === 'balloon' ? '#3b82f6' : undefined });
      G.cards(ctx, [1, 2, 3, 4, 5, 6, 7, 8, 9], 10, gh + 26, W - 20, 60, c, { sel: st.pick, good: d.n, hits: d.hits });
    },
    onPointer(type, x, y, p, st, api) {
      if (type !== 'down') return false; const h = api.hit(x, y); if (!h) return false;
      if (h.v !== undefined) { st.pick = h.v; return true; }
      if (h.i !== undefined) { const k = st.marks.indexOf(h.i); if (k >= 0) st.marks.splice(k, 1); else st.marks.push(h.i); return true; }
      return false;
    },
    live(p, d) { return d.mark ? '\\text{المطلوب: } ' + d.target : String(d.n); },
    results(p, d) {
      const st = d.st || { pick: null, marks: [] };
      if (d.mark) { const right = d.good.every((i) => st.marks.indexOf(i) >= 0) && st.marks.every((i) => d.good.indexOf(i) >= 0); return [['المطلوب', L(d.target), false], ['المجموعات الصحيحة', L(d.good.length), false], ['إجابتك', st.marks.length ? (right ? 'صحيحة ✔' : 'راجع العدّ') : 'لم تختر بعد', false, right ? 'pos' : '']]; }
      return [['عدد ' + d.e[1].split(': ')[1], L(d.n), false, 'pos'], ['اخترتَ', st.pick == null ? 'لم تختر بعد' : L(st.pick) + (st.pick === d.n ? ' ✔' : ' ✘'), false, st.pick === d.n ? 'pos' : st.pick == null ? '' : 'neg']];
    },
    steps(p, d) {
      if (d.mark) return ['نعدّ عناصر كل مجموعة.', 'نضع إشارة ✔ تحت كل مجموعة عددها ' + L(d.target) + ' (' + L(d.good.length) + ' مجموعات).'];
      return ['نعدّ: ' + Array.from({ length: d.n }, (x, i) => L(i + 1)).join(' ، ') + '.', 'آخر عدد ' + L(d.n) + '، فنختار البطاقة ' + L(d.n) + '.'];
    },
    explain() { return []; },
    learn: [
      '**ص 5 و 7 و 10 و 14:** أضع إشارة ✔ في ○ تحت المجموعة التي فيها العدد المطلوب.',
      '**ص 11 و 15 و 21 و 27:** أعدّ وأكتب العدد المناسب.',
      '**ص 12 و 15 و 17:** أصل بين العدد والمجموعة المناسبة، وأصل عدد النقاط مع العدد المناسب.'
    ],
    challenges: [
      { q: 'عُدّ السيارات واختر العدد المناسب (ص 11).', hint: 'اختر مجموعة السيارات ثم البطاقة.', init: { mode: 'count', ex: 'p11e' }, check: (p, d) => !d.mark && p.ex === 'p11e' && d.st && d.st.pick === 3 },
      { q: 'عُدّ النملات (ص 27) واختر العدد.', hint: 'تسع نملات.', init: { mode: 'count', ex: 'p11e' }, check: (p, d) => !d.mark && p.ex === 'p27a' && d.st && d.st.pick === 9 },
      { q: 'ضع إشارة تحت كل مجموعة فيها ٢ (ص 7).', hint: 'مجموعتان صحيحتان.', init: { mode: 'count', ex: 'p11e', set: 'm2' }, check: (p, d) => d.mark && p.set === 'm2' && d.st && d.st.marks.length === 2 && d.good.every((i) => d.st.marks.indexOf(i) >= 0) }
    ],
    tutor: [
      { q: 'كيف أختار العدد المناسب؟', k: ['اختار', 'المناسب'], a: () => 'أعدّ الأشياء واحداً واحداً، ثم أختار البطاقة التي عليها آخر عدد قلته.' },
      { q: 'كم شيئاً في المجموعة؟', k: ['كم'], a: (p, d) => (d.mark ? 'المطلوب ' + L(d.target) + '.' : L(d.n) + '.') },
      { q: 'هل يتغير العدد إذا غيّرت ترتيب الأشياء؟', k: ['ترتيب', 'يتغير'], a: () => 'لا، عدد الأشياء لا يتغير مهما رتّبناها.' }
    ]
  });

  /* ======================= أكمل الرسم بقدر العدد (ص 10 ، 18 ، 28 ، 29) ======================= */
  const CD = [
    ['p10a', 'ص 10: ٣ دوائر (في الصف دائرتان)', 'circle', 3, 2], ['p10b', 'ص 10: ٣ دوائر (في الصف دائرة)', 'circle', 3, 1], ['p18a', 'ص 18: ٥ دوائر', 'circle', 5, 1], ['p18b', 'ص 18: ٥ مربعات', 'square', 5, 2], ['p18c', 'ص 18: ٥ قلوب', 'heart', 5, 3],
    ['p28a', 'ص 28: ٧ دوائر', 'circle', 7, 2], ['p28b', 'ص 28: ٨ مربعات', 'square', 8, 3], ['p28c', 'ص 28: ٩ مثلثات', 'triangle', 9, 4],
    ['r1', 'مراجعة ص 29: ٣ قلوب', 'heart', 3, 1], ['r2', 'مراجعة: ٥ وجوه', 'smile', 5, 3], ['r3', 'مراجعة: ٧ مربعات', 'square', 7, 4], ['r4', 'مراجعة: ٨ دوائر', 'circle', 8, 3], ['r5', 'مراجعة: ٩ مثلثات', 'triangle', 9, 4]
  ];
  G.reg({
    id: 'complete-drawing', unit: U, order: 3, lesson: '1-3 و 1-5 و 1-9 و 1-10', lessonTitle: 'أكمل الرسم بقدر العدد', page: 10,
    titleAr: 'أكمل رسم الأشكال بقدر العدد', titleEn: 'Complete the Drawing', tags: 'اكمل الرسم الاشكال بقدر العدد دوائر مربعات قلوب مثلثات',
    formula: '\\text{الموجود} + \\text{ما أضيفه} = \\text{العدد المكتوب}',
    book: 'أكمل رسم الأشكال لأحصل على العدد المكتوب',
    summary: 'في كل صف عدد مكتوب وبعض الأشكال. **نعدّ الموجود**، ثم نضيف أشكالاً واحداً واحداً ونعدّ معها حتى نصل إلى **العدد المكتوب**، فلا نزيد ولا ننقص.',
    vars: [['\\text{العدد}', 'العدد المكتوب أول الصف', '']],
    params: [{ key: 'ex', label: '\\text{الصف}', type: 'select', value: 'p28a', options: G.opts(CD.map((e) => [e[0], e[1]])) }],
    initState() { return { add: 0 }; },
    resetOn: ['ex'],
    custom: true, canvasHint: 'انقر خانة فارغة لتضيف شكلاً، وانقر شكلاً أضفته لتحذفه.',
    compute(p) { const e = CD.find((x) => x[0] === p.ex); return { e: e, shape: e[2], target: e[3], start: e[4] }; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); d.hits = []; const add = (d.st && d.st.add) || 0; const tot = d.start + add;
      const slots = 9; const sw = Math.min(90, (W - 80) / slots); const y = H * 0.45; const xr = W - 70;
      G.txt(ctx, d.target, W - 34, y, { color: c.c1, size: 40, w: '800' });
      ctx.strokeStyle = c.grid; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(20, y + sw * 0.6); ctx.lineTo(W - 20, y + sw * 0.6); ctx.stroke();
      for (let i = 0; i < slots; i++) {
        const x = xr - (i + 0.5) * sw;
        if (i < tot) G.icon(ctx, d.shape, x, y, sw * 0.85, i < d.start ? undefined : i < d.target ? '#94a3b8' : '#ef4444');
        else { ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = c.muted; ctx.strokeRect(x - sw * 0.35, y - sw * 0.35, sw * 0.7, sw * 0.7); ctx.restore(); }
        if (i < tot) G.txt(ctx, i + 1, x, y - sw * 0.55, { color: c.muted, size: 13, w: '700' });
        d.hits.push({ x: x - sw / 2, y: y - sw / 2, w: sw, h: sw, i: i });
      }
      const msg = tot === d.target ? 'أحسنت! صار العدد ' + L(d.target) + ' ✔' : tot < d.target ? 'نحتاج ' + L(d.target - tot) + ' بعد' : 'زدنا ' + L(tot - d.target) + '، احذف';
      G.txt(ctx, msg, W / 2, H * 0.78, { color: tot === d.target ? c.c3 : c.c4, size: nar ? 18 : 22, w: '800' });
    },
    onPointer(type, x, y, p, st, api) {
      if (type !== 'down') return false; const h = api.hit(x, y); if (!h) return false;
      const e = CD.find((q) => q[0] === p.ex); const tot = e[4] + st.add;
      if (h.i >= tot) st.add += 1; else if (h.i >= e[4]) st.add = Math.max(0, st.add - 1); else return false;
      return true;
    },
    live(p, d) { const add = (d.st && d.st.add) || 0; return d.start + ' + ' + add + ' = ' + (d.start + add); },
    results(p, d) { const add = (d.st && d.st.add) || 0; const tot = d.start + add; return [['العدد المكتوب', L(d.target), false], ['الموجود في الكتاب', L(d.start), false], ['أضفتَ', L(add) + ' فصار ' + L(tot), false, tot === d.target ? 'pos' : 'neg'], ['نحتاج أن نضيف', L(d.target - d.start), false]]; },
    steps(p, d) { return ['نعدّ الأشكال الموجودة: ' + L(d.start) + '.', 'نضيف ونعدّ: ' + Array.from({ length: d.target - d.start }, (x, i) => L(d.start + i + 1)).join(' ، ') + '.', 'نتوقف عند ' + L(d.target) + ' : أضفنا ' + L(d.target - d.start) + ' أشكال.']; },
    explain() { return []; },
    learn: ['**ص 10:** أكمل الرسم للحصول على ٣ دوائر.', '**ص 18:** أكمل رسم الأشكال لأحصل على العدد ٥.', '**ص 28:** أكمل رسم الأشكال بقدر العدد ٧ و ٨ و ٩.', '**مراجعة ص 29:** أكمل رسم الأشكال لأحصل على العدد المكتوب: ٣ ، ٥ ، ٧ ، ٨ ، ٩.'],
    challenges: [
      { q: 'أكمل ٧ دوائر (ص 28).', hint: 'في الصف دائرتان؛ أضف ٥.', init: { ex: 'p28a' }, check: (p, d) => p.ex === 'p28a' && d.st && d.start + d.st.add === 7 },
      { q: 'أكمل ٩ مثلثات (ص 28).', hint: 'في الصف ٤ مثلثات.', init: { ex: 'p28a' }, check: (p, d) => p.ex === 'p28c' && d.st && d.start + d.st.add === 9 },
      { q: 'أكمل ٥ قلوب (ص 18).', hint: 'في الصف ٣ قلوب.', init: { ex: 'p28a' }, check: (p, d) => p.ex === 'p18c' && d.st && d.start + d.st.add === 5 }
    ],
    tutor: [{ q: 'كم شكلاً أضيف؟', k: ['اضيف', 'كم'], a: (p, d) => 'العدد ' + L(d.target) + ' والموجود ' + L(d.start) + '، فأضيف ' + L(d.target - d.start) + '.' }, { q: 'ماذا لو زدت؟', k: ['زدت', 'زياده'], a: () => 'أحذف الشكل الزائد حتى يصبح العدد مساوياً للعدد المكتوب.' }]
  });

  /* ======================= أقسّم كل مجموعة إلى مجموعتين (ص 21 ، 23 ، 25 ، 28 ، 30) ======================= */
  const SP = [
    ['b6', 'ص 21: ٦ فراشات (٣ و ٣)', 'bee', 6, 3, 3], ['t6', 'ص 21: ٦ سلاحف (٢ و ٤)', 'frog', 6, 2, 4], ['tr7', 'ص 23: ٧ جرارات (٥ و ٢)', 'tractor', 7, 5, 2], ['d7', 'ص 23: ٧ كلاب (٤ و ٣)', 'dog', 7, 4, 3],
    ['f8', 'ص 25: ٨ أسماك (٥ و ٣)', 'fish', 8, 5, 3], ['ba8', 'ص 25: ٨ كرات (٤ و ٤)', 'ball', 8, 4, 4], ['f8b', 'ص 25: ٨ أسماك (٧ و ١)', 'fish', 8, 7, 1],
    ['c9', 'ص 28: ٩ جزرات (٨ و ١)', 'carrot', 9, 8, 1], ['s9', 'ص 28: ٩ فراولات (٧ و ٢)', 'strawberry', 9, 7, 2], ['a9', 'ص 28: ٩ تفاحات (٦ و ٣)', 'apple', 9, 6, 3], ['o9', 'ص 28: ٩ برتقالات (٥ و ٤)', 'orange', 9, 5, 4],
    ['r1', 'مراجعة ص 30: ٩ أوراق', 'tree', 9, 0, 0], ['r2', 'مراجعة: ٦ شاحنات', 'car', 6, 0, 0], ['r3', 'مراجعة: ٨ عصافير', 'bird', 8, 0, 0], ['r4', 'مراجعة: ٧ بنات', 'girl', 7, 0, 0]
  ];
  G.reg({
    id: 'split-groups', unit: U, order: 4, lesson: '1-6 – 1-10', lessonTitle: 'أقسّم كل مجموعة إلى مجموعتين حسب العددين', page: 21,
    titleAr: 'أقسّم المجموعة إلى مجموعتين', titleEn: 'Split a Group into Two', tags: 'اقسم مجموعه مجموعتين حسب العددين تكوين العدد فراشات سلاحف جرارات اسماك',
    formula: '9 = 5 + 4',
    book: 'أقسّم كل مجموعة إلى مجموعتين حسب العددين: ٦ = ٣ و ٣ ، ٧ = ٥ و ٢ ، ٨ = ٤ و ٤ ، ٩ = ٥ و ٤ …',
    summary: 'نستطيع أن نقسم المجموعة الواحدة إلى **مجموعتين** بطرق مختلفة، ويبقى مجموع العددين **هو عدد المجموعة كلها**، مثل ٨ = ٥ و ٣ = ٤ و ٤ = ٧ و ١.',
    vars: [['\\text{العدد}', 'عدد المجموعة كلها', '٦ إلى ٩']],
    params: [
      { key: 'ex', label: '\\text{المجموعة}', type: 'select', value: 'o9', options: G.opts(SP.map((e) => [e[0], e[1]])) },
      { key: 'k', label: '\\text{المجموعة الأولى}', min: 0, max: 9, step: 1, value: 0, int: true }
    ],
    onSet(p, key) { if (key === 'ex') p.k = 0; },
    custom: true, canvasHint: 'انقر شيئاً لتضع الفاصل بعده: ما على اليمين مجموعة، وما على اليسار المجموعة الأخرى.',
    compute(p) { const e = SP.find((x) => x[0] === p.ex); const n = e[3]; const k = Math.min(p.k, n); return { e: e, n: n, a: k, b: n - k, ta: e[4], tb: e[5], hit: e[4] ? ((k === e[4] && n - k === e[5]) || (k === e[5] && n - k === e[4])) : k > 0 && k < n }; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); d.hits = []; const sw = Math.min(100, (W - 60) / d.n); const y = H * 0.4; const xr = W / 2 + d.n * sw / 2 + (d.a && d.b ? 15 : 0);
      for (let i = 0; i < d.n; i++) {
        const x = xr - (i + 0.5) * sw - (i >= d.a ? 30 : 0);
        ctx.fillStyle = i < d.a ? 'rgba(37,99,235,.12)' : 'rgba(234,88,12,.12)'; ctx.fillRect(x - sw / 2 + 2, y - sw * 0.6, sw - 4, sw * 1.2);
        G.icon(ctx, d.e[2], x, y, sw * 0.85); d.hits.push({ x: x - sw / 2, y: y - sw * 0.6, w: sw, h: sw * 1.2, i: i });
      }
      if (d.a && d.b) { const xd = xr - d.a * sw - 15; ctx.strokeStyle = c.c2; ctx.lineWidth = 3; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(xd, y - sw * 0.8); ctx.lineTo(xd, y + sw * 0.8); ctx.stroke(); ctx.setLineDash([]); }
      const yb = y + sw * 0.9 + 30;
      G.box(ctx, W / 2 + 10, yb - 24, 60, 48, c.c1); G.txt(ctx, d.a, W / 2 + 40, yb, { color: c.c1, size: 28, w: '800' });
      G.box(ctx, W / 2 - 70, yb - 24, 60, 48, c.c4); G.txt(ctx, d.b, W / 2 - 40, yb, { color: c.c4, size: 28, w: '800' });
      G.txt(ctx, L(d.n) + ' = ' + L(d.a) + ' و ' + L(d.b) + (d.ta ? (d.hit ? '  ✔ كما في الكتاب' : '') : ''), W / 2, Math.min(H - 20, yb + 50), { color: d.hit ? c.c3 : c.text, size: nar ? 17 : 21, w: '800' });
    },
    onPointer(type, x, y, p, st, api) { if (type !== 'down') return false; const h = api.hit(x, y); if (!h) return false; api.set('k', h.i + 1 === p.k ? h.i : h.i + 1); return true; },
    live(p, d) { return d.n + ' = ' + d.a + ' + ' + d.b; },
    results(p, d) { return [['عدد المجموعة', L(d.n), false], ['المجموعتان', L(d.a) + ' و ' + L(d.b), false, d.hit ? 'pos' : ''], ['في الكتاب', d.ta ? L(d.ta) + ' و ' + L(d.tb) : 'أختار بنفسي', false]]; },
    steps(p, d) { return ['نعدّ المجموعة كلها: ' + L(d.n) + '.', 'نفصل ' + L(d.a) + ' في مجموعة، فيبقى ' + L(d.b) + ' في الأخرى.', 'نتحقق: ' + L(d.a) + ' و ' + L(d.b) + ' معاً ' + L(d.n) + '.']; },
    explain() { return []; },
    learn: ['**ص 21:** ٦ فراشات: ٣ و ٣ ، و ٦ سلاحف: ٢ و ٤.', '**ص 23:** ٧ جرارات: ٥ و ٢ ، و ٧ كلاب: ٤ و ٣.', '**ص 25:** ٨ = ٥ و ٣ = ٤ و ٤ = ٧ و ١.', '**ص 28:** ٩ = ٨ و ١ = ٧ و ٢ = ٦ و ٣ = ٥ و ٤.', '**مراجعة ص 30:** أقسّم عناصر كل مجموعة إلى مجموعتين وأسجّل العددين.'],
    challenges: [
      { q: 'قسّم ٩ برتقالات إلى ٥ و ٤ (ص 28).', hint: 'ضع الفاصل بعد البرتقالة الخامسة.', init: { ex: 'o9', k: 0 }, check: (p, d) => p.ex === 'o9' && d.hit },
      { q: 'قسّم ٨ كرات إلى مجموعتين متساويتين (ص 25).', hint: '٤ و ٤.', init: { ex: 'o9', k: 0 }, check: (p, d) => p.ex === 'ba8' && d.a === 4 },
      { q: 'قسّم ٧ جرارات إلى ٥ و ٢ (ص 23).', hint: 'الفاصل بعد ٥ أو بعد ٢.', init: { ex: 'o9', k: 0 }, check: (p, d) => p.ex === 'tr7' && d.hit }
    ],
    tutor: [{ q: 'هل يتغير العدد الكلي عندما أقسم؟', k: ['يتغير', 'الكلي'], a: (p, d) => 'لا؛ ' + L(d.a) + ' و ' + L(d.b) + ' معاً ' + L(d.n) + '.' }, { q: 'بكم طريقة أقسم ٩؟', k: ['طريقه', 'طرق'], a: () => '٨ و ١ ، ٧ و ٢ ، ٦ و ٣ ، ٥ و ٤ (كما في ص 28).' }]
  });

  /* ======================= خط الأعداد والعدد المفقود، وجدول الحرارة (ص 28–30) ======================= */
  const NL = { miss: { name: 'مراجعة 2 ص 29: العدد المفقود تحت الحيوانات', given: [1, 3, 6, 9] }, seq: { name: 'ص 28: أكتب الأعداد ١ – ٩', given: [1, 2, 9] } };
  const TEMP = [['القدس', 5], ['رام الله', 4], ['جنين', 6], ['رفح', 8]];
  const ANIM = ['bird', 'bee', 'duck', 'frog', 'bird', 'bee', 'duck'];
  G.reg({
    id: 'number-line-9', unit: U, order: 5, lesson: '1-10', lessonTitle: 'مراجعة الوحدة الأولى', page: 29,
    titleAr: 'خط الأعداد والعدد المفقود وجدول الحرارة', titleEn: 'Number Line 1–9 and Missing Numbers', tags: 'خط الاعداد العدد المفقود اكتب الاعداد درجه الحراره القدس رام الله جنين رفح اعلى اقل',
    formula: '1,\\ 2,\\ 3,\\ \\ldots,\\ 9',
    book: 'أكتب العدد المفقود الذي يقف عليه كل حيوان ؛ وفي النشرة الجوية: القدس ٥ ، رام الله ٤ ، جنين ٦ ، رفح ٨',
    summary: 'على خط الأعداد يأتي كل عدد **بعد** العدد الأصغر منه بواحد، فنجد العدد المفقود بالعدّ من العدد الذي قبله. وفي جدول الحرارة نقارن الأعداد لنعرف **الأعلى** و**الأقل**.',
    vars: [['\\text{خط الأعداد}', 'من ١ إلى ٩', '']],
    params: [{ key: 'mode', label: '\\text{النشاط}', type: 'select', value: 'miss', options: [['miss', NL.miss.name], ['seq', NL.seq.name], ['temp', 'مراجعة 4 ص 30: درجات الحرارة']] }],
    initState() { return { vals: {}, city: null }; },
    resetOn: ['mode'],
    custom: true, canvasHint: 'انقر الدائرة الفارغة مرة بعد مرة حتى يظهر العدد الصحيح. في جدول الحرارة انقر المدينة.',
    compute(p) { if (p.mode === 'temp') return { temp: true, hi: TEMP.reduce((a, b) => (b[1] > a[1] ? b : a)), lo: TEMP.reduce((a, b) => (b[1] < a[1] ? b : a)) }; const g = NL[p.mode].given; return { given: g, missing: [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((v) => g.indexOf(v) < 0) }; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); d.hits = []; const st = d.st || { vals: {}, city: null };
      if (d.temp) {
        const bw = (W - 40) / 4; const base = H - 70, top = 40;
        TEMP.forEach((t, i) => {
          const x = W - 20 - (i + 0.5) * bw; const h = (base - top) * t[1] / 9; const on = st.city === i;
          ctx.fillStyle = on ? c.c2 : '#fca5a5'; ctx.fillRect(x - 14, base - h, 28, h); ctx.strokeStyle = c.text; ctx.lineWidth = 2; ctx.strokeRect(x - 14, top, 28, base - top); ctx.beginPath(); ctx.arc(x, base + 12, 18, 0, 7); ctx.fillStyle = on ? c.c2 : '#fca5a5'; ctx.fill(); ctx.stroke();
          G.txt(ctx, t[1], x, top - 16, { color: c.text, size: 22, w: '800' }); G.txt(ctx, t[0], x, base + 44, { color: c.text, size: nar ? 13 : 16, w: '800' });
          d.hits.push({ x: x - bw / 2, y: top - 30, w: bw, h: base - top + 90, i: i });
        });
        return;
      }
      const x0 = 30, x1 = W - 30; const y = H * 0.55; const X = (v) => x1 - (v - 1) * (x1 - x0) / 8; const R = Math.min(22, (x1 - x0) / 8 * 0.44); // الكتاب: ١ يميناً
      ctx.strokeStyle = c.c6; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 - 10, y); ctx.lineTo(x1 + 10, y); ctx.stroke();
      let ai = 0;
      for (let v = 1; v <= 9; v++) {
        const x = X(v); const giv = d.given.indexOf(v) >= 0; const val = giv ? v : st.vals[v]; const ok = val === v;
        ctx.strokeStyle = c.c6; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y + 36, R, 0, 7); ctx.fillStyle = giv ? 'transparent' : ok ? 'rgba(5,150,105,.15)' : 'rgba(148,163,184,.12)'; ctx.fill(); ctx.stroke();
        if (val) G.txt(ctx, val, x, y + 36, { color: giv ? c.text : ok ? c.c3 : c.c2, size: Math.round(R * 1.1), w: '800' });
        if (!giv) { if (p.mode === 'miss') G.icon(ctx, ANIM[ai++ % ANIM.length], x, y - 34, Math.min(52, R * 2.4)); d.hits.push({ x: x - R - 3, y: y + 10, w: 2 * R + 6, h: 52, v: v }); }
      }
      const done = d.missing.every((v) => st.vals[v] === v);
      G.txt(ctx, done ? 'أحسنت! ١ ، ٢ ، ٣ ، ٤ ، ٥ ، ٦ ، ٧ ، ٨ ، ٩ ✔' : 'انقر كل دائرة فارغة', W / 2, H - 30, { color: done ? c.c3 : c.muted, size: nar ? 15 : 18, w: '800' });
    },
    onPointer(type, x, y, p, st, api) {
      if (type !== 'down') return false; const h = api.hit(x, y); if (!h) return false;
      if (h.i !== undefined) { st.city = h.i; return true; }
      st.vals[h.v] = ((st.vals[h.v] || 0) % 9) + 1; return true;
    },
    live(p, d) { return d.temp ? '8 > 6 > 5 > 4' : '1,\\ 2,\\ 3,\\ 4,\\ 5,\\ 6,\\ 7,\\ 8,\\ 9'; },
    results(p, d) {
      const st = d.st || { vals: {}, city: null };
      if (d.temp) return [['الأعلى', d.hi[0] + ' (' + L(d.hi[1]) + ')', false, 'pos'], ['الأقل', d.lo[0] + ' (' + L(d.lo[1]) + ')', false], ['اخترتَ', st.city == null ? '—' : TEMP[st.city][0] + ' ' + L(TEMP[st.city][1]), false]];
      const ok = d.missing.filter((v) => st.vals[v] === v).length;
      return [['الأعداد المفقودة', d.missing.map(L).join(' ، '), false], ['أكملتَ', L(ok) + ' من ' + L(d.missing.length), false, ok === d.missing.length ? 'pos' : '']];
    },
    steps(p, d) {
      if (d.temp) return ['نقرأ درجة الحرارة في كل مدينة: القدس ٥ ، رام الله ٤ ، جنين ٦ ، رفح ٨.', 'الأكبر ٨ ، فأعلى درجة حرارة في رفح.', 'الأصغر ٤ ، فأقل درجة حرارة في رام الله.'];
      return ['نعدّ على الخط من ١ : كل عدد أكبر من الذي قبله بواحد.', 'الأعداد المفقودة: ' + d.missing.map(L).join(' ، ') + '.'];
    },
    explain() { return []; },
    learn: ['**ص 28:** أكتب الأعداد ١ – ٩ وأعدّ.', '**مراجعة 2 ص 29:** أكتب العدد المفقود الذي يقف عليه كل حيوان (المعطى ١ ، ٣ ، ٦ ، ٩).', '**مراجعة 4 ص 30:** استمع سامي إلى النشرة الجوية: القدس ٥ ، رام الله ٤ ، جنين ٦ ، رفح ٨ ؛ الأعلى رفح والأقل رام الله.'],
    challenges: [
      { q: 'أكمل الأعداد المفقودة تحت الحيوانات (ص 29).', hint: 'انقر كل دائرة حتى يظهر العدد الصحيح.', init: { mode: 'miss' }, check: (p, d) => p.mode === 'miss' && d.st && d.missing.every((v) => d.st.vals[v] === v) },
      { q: 'في أي مدينة كانت درجة الحرارة أعلى؟ انقرها.', hint: 'اختر جدول الحرارة.', init: { mode: 'miss' }, check: (p, d) => d.temp && d.st && d.st.city === 3, why: () => 'رفح ٨.' },
      { q: 'اكتب الأعداد من ٣ إلى ٨ (ص 28).', hint: 'اختر «أكتب الأعداد ١ – ٩».', init: { mode: 'miss' }, check: (p, d) => p.mode === 'seq' && d.st && d.missing.every((v) => d.st.vals[v] === v) }
    ],
    tutor: [{ q: 'كيف أجد العدد المفقود؟', k: ['المفقود'], a: () => 'أنظر إلى العدد الذي قبله وأعدّ واحداً بعده.' }, { q: 'أي مدينة أبرد؟', k: ['ابرد', 'اقل'], a: () => 'رام الله (٤).' }]
  });
})(typeof window !== 'undefined' ? window : globalThis);
