/* الوحدة السادسة: طرق العد ونظرية ذات الحدين (ص 176–193) */
(function (root) {
  'use strict';
  const ML = root.ML; const M = ML.math;
  const U = 6;
  const LET = 'ABCDEFGHIJ'.split('');
  const big = M.big;

  function text(ctx, s, x, y, o) {
    o = o || {}; ctx.save(); ctx.font = (o.w || '600') + ' ' + (o.size || 14) + 'px system-ui, Tajawal, sans-serif';
    ctx.fillStyle = o.color; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.direction = o.rtl ? 'rtl' : 'ltr'; ctx.fillText(o.rtl ? ML.bidi(s) : s, x, y); ctx.restore();
  }
  function chip(ctx, s, x, y, w, h, fill, col) {
    ctx.save(); ctx.fillStyle = fill; ctx.globalAlpha = 0.16; roundRect(ctx, x, y, w, h, 6); ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = fill; ctx.lineWidth = 1.2; roundRect(ctx, x, y, w, h, 6); ctx.stroke(); ctx.restore();
    text(ctx, s, x + w / 2, y + h / 2, { color: col, size: Math.min(14, h * 0.5), w: '600' });
  }
  function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  // ترتيبات r من n
  function perms(n, r, limit) {
    const out = []; const used = new Array(n).fill(false); const cur = [];
    (function rec() { if (out.length >= limit) return; if (cur.length === r) { out.push(cur.map((i) => LET[i]).join('')); return; } for (let i = 0; i < n; i++) { if (used[i]) continue; used[i] = true; cur.push(i); rec(); cur.pop(); used[i] = false; if (out.length >= limit) return; } })();
    return out;
  }
  function combs(n, r, limit) {
    const out = []; const cur = [];
    (function rec(s) { if (out.length >= limit) return; if (cur.length === r) { out.push('{' + cur.map((i) => LET[i]).join(',') + '}'); return; } for (let i = s; i < n; i++) { cur.push(i); rec(i + 1); cur.pop(); if (out.length >= limit) return; } })(0);
    return out;
  }
  ML.perms = perms; ML.combs = combs;
  function grid(ctx, W, H, items, top, cols, col) {
    const n = items.length; if (!n) return;
    const per = Math.max(1, Math.min(n, Math.floor((W - 20) / 74)));
    const w = Math.min(90, (W - 20) / per - 6), h = 26; let rows = Math.ceil(n / per);
    const maxRows = Math.floor((H - top - 10) / (h + 6));
    const shown = Math.min(n, maxRows * per); rows = Math.ceil(shown / per);
    for (let k = 0; k < shown; k++) { const r = Math.floor(k / per), c = k % per; chip(ctx, items[k], 10 + c * (w + 6) + (W - 20 - per * (w + 6)) / 2, top + r * (h + 6), w, h, col, cols.text); }
    return shown;
  }

  /* ======================= 6-1 مبدأ العد والمضروب ======================= */
  ML.register({
    id: 'counting', unit: U, order: 1, lesson: '6-1', lessonTitle: 'مبدأ العد', page: 178,
    titleAr: 'مبدأ العد الأساسي والمضروب', titleEn: 'Fundamental Counting Principle & Factorial', tags: 'مبدا العد مضروب شجره',
    formula: 'N = n_1 \\times n_2 \\times \\dots \\times n_k,\\qquad n! = n(n-1)(n-2)\\cdots 2 \\cdot 1,\\ 0! = 1',
    book: 'عدد الطرق الكلية = م1 × م2 × … × مك ؛ ن! = ن(ن−1)(ن−2)…×3×2×1',
    summary: 'إذا تمت عملية على $k$ من الخطوات، الأولى بـ $n_1$ طريقة والثانية بـ $n_2$ طريقة وهكذا، فعدد الطرق الكلية حاصل ضربها. مضروب العدد $n!$ هو حاصل ضرب الأعداد الصحيحة من $n$ إلى $1$.',
    vars: [['k', 'عدد الخطوات (المراحل)', '$1 \\le k \\le 4$ هنا'], ['n_i', 'عدد طرق إجراء الخطوة $i$', 'عدد صحيح موجب'], ['n', 'عدد لحساب مضروبه', '$n \\in \\{0, 1, 2, \\dots\\}$']],
    params: [
      { key: 'k', label: 'k', min: 1, max: 4, step: 1, value: 2, int: true },
      { key: 'n1', label: 'n_1', min: 1, max: 5, step: 1, value: 3, int: true }, { key: 'n2', label: 'n_2', min: 1, max: 5, step: 1, value: 2, int: true, hidden: (p) => p.k < 2 },
      { key: 'n3', label: 'n_3', min: 1, max: 5, step: 1, value: 2, int: true, hidden: (p) => p.k < 3 }, { key: 'n4', label: 'n_4', min: 1, max: 5, step: 1, value: 2, int: true, hidden: (p) => p.k < 4 },
      { key: 'f', label: 'n!', min: 0, max: 25, step: 1, value: 5, int: true, desc: 'حاسبة المضروب' }
    ],
    custom: true, canvasHint: 'المخطط الشجري: كل مسار من الجذر إلى ورقة طريقة واحدة مختلفة.',
    compute(p) {
      const ns = [p.n1, p.n2, p.n3, p.n4].slice(0, p.k);
      return { ns: ns, N: ns.reduce((a, b) => a * b, 1), fact: M.factBig(p.f) };
    },
    drawCustom(ctx, W, H, p, d, c) {
      if (d.N > 120) { text(ctx, 'عدد الطرق = ' + d.ns.join(' × ') + ' = ' + d.N + ' (كبير لعرض الشجرة كاملة)', W / 2, H / 2, { color: c.text, rtl: true, size: 16 }); return; }
      const levels = d.ns.length; const colW = (W - 90) / levels;
      const cols = [c.c1, c.c3, c.c4, c.c5];
      const leafH = Math.min(26, (H - 34) / d.N); const top = 26 + (H - 26 - leafH * d.N) / 2;
      const X = (l) => 24 + l * colW; let leaf = 0;
      function rec(level, path) {
        if (level === levels) { const y = top + leaf * leafH + leafH / 2; leaf++; text(ctx, path.join('-'), W - 8, y, { color: c.text, align: 'right', size: Math.max(8, Math.min(12, leafH * 0.7)) }); return y; }
        const ys = []; for (let i = 0; i < d.ns[level]; i++) ys.push(rec(level + 1, path.concat(String(i + 1))));
        const y = (ys[0] + ys[ys.length - 1]) / 2;
        ys.forEach((cy) => { ctx.strokeStyle = cols[level]; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(level), y); ctx.lineTo(X(level + 1), cy); ctx.stroke(); ctx.fillStyle = cols[level]; ctx.beginPath(); ctx.arc(X(level + 1), cy, 3.5, 0, 7); ctx.fill(); });
        return y;
      }
      const rootY = rec(0, []);
      ctx.fillStyle = c.axis; ctx.beginPath(); ctx.arc(X(0), rootY, 5, 0, 7); ctx.fill();
      for (let l = 0; l < levels; l++) text(ctx, 'الخطوة ' + ['الأولى', 'الثانية', 'الثالثة', 'الرابعة'][l] + ' — ' + d.ns[l] + ' طرق', 24 + (l + 0.5) * colW, 12, { color: cols[l], rtl: true, size: 12 });
    },
    live(p, d) { return 'N = ' + d.ns.join(' \\times ') + ' = ' + d.N + ',\\qquad ' + p.f + '! = ' + big(d.fact); },
    results(p, d) {
      const prod = p.f === 0 ? '1\\ (\\text{تعريفاً})' : Array.from({ length: Math.min(p.f, 8) }, (_, i) => p.f - i).join(' \\times ') + (p.f > 8 ? ' \\times \\cdots \\times 1' : '');
      return [['عدد الطرق الكلية', d.ns.join(' \\times ') + ' = ' + d.N], [p.f + '!', prod + ' = ' + big(d.fact)]];
    },
    steps(p, d) { return ['الخطوة الأولى بـ $' + d.ns[0] + '$ طرق' + d.ns.slice(1).map((n, i) => '، والخطوة ' + (i + 2) + ' بـ $' + n + '$ طرق').join('') + '.', 'لكل طريقة في خطوة توجد كل طرق الخطوة التالية، لذلك نضرب: $' + d.ns.join(' \\times ') + ' = ' + d.N + '$.']; },
    learn: [
      '**نشاط 1 ص 178:** السفر من الخليل إلى القدس بـ 3 وسائل، ومن القدس إلى رام الله بوسيلتين: عدد الطرق $3 \\times 2 = 6$.',
      '**مبدأ العد الأساسي (ص 179):** إذا أمكن إجراء عملية على $k$ خطوات تتم الأولى بـ $n_1$ طريقة والثانية بـ $n_2$ … فإن عدد الطرق الكلية $n_1 \\times n_2 \\times \\cdots \\times n_k$.',
      '**مثال:** تكوين مجلس إدارة (رئيس، نائب، أمين صندوق) من 5 مرشحين: $5 \\times 4 \\times 3 = 60$ طريقة.',
      '**مضروب العدد (ص 180):** $n! = n(n-1)(n-2)\\cdots \\times 3 \\times 2 \\times 1$، ويُعرّف $0! = 1$. مثال: $5! = 120$ طريقة لجلوس 5 أشخاص في صف.'
    ],
    challenges: [
      { q: 'مثّل مسألة السفر: الخليل ← القدس (3 وسائل) ← رام الله (وسيلتان).', hint: '$k = 2$، $n_1 = 3$، $n_2 = 2$.', init: { k: 1, n1: 1, n2: 1 }, check: (p) => p.k === 2 && p.n1 === 3 && p.n2 === 2, why: () => '$3 \\times 2 = 6$ طرق.' },
      { q: 'عدد الأعداد المكوّنة من منزلتين من الأرقام $\\{3, 5, 6, 8\\}$ مع السماح بالتكرار (ص 179).', hint: 'منزلتان، كل منهما 4 طرق.', init: { k: 1, n1: 1 }, check: (p, d) => p.k === 2 && p.n1 === 4 && p.n2 === 4, why: () => '$4 \\times 4 = 16$.' },
      { q: 'جد $n$ إذا كان $n! = 5040$ (تمرين 7 ص 181).', hint: 'جرّب قيم المضروب.', init: { f: 0 }, check: (p) => p.f === 7 }
    ],
    tutor: [
      { q: 'لماذا نضرب ولا نجمع؟', k: ['نضرب', 'نجمع', 'لماذا'], a: (p, d) => 'لأن كل طريقة من الخطوة الأولى تقترن بكل طرق الخطوة الثانية؛ في الشجرة كل فرع يتفرع إلى ' + (d.ns[1] || 1) + ' فروع، فيتضاعف العدد: $' + d.ns.join(' \\times ') + ' = ' + d.N + '$.' },
      { q: 'لماذا 0! = 1؟', k: ['0!', 'صفر مضروب', 'صفر'], a: () => 'تعريفاً، ليتسق قانون التباديل: عدد طرق ترتيب $n$ عناصر جميعها $\\frac{n!}{(n-n)!} = \\frac{n!}{0!}$ يجب أن يساوي $n!$، لذلك $0! = 1$.' }
    ]
  });

  /* ======================= 6-2 التباديل ======================= */
  ML.register({
    id: 'permutations', unit: U, order: 2, lesson: '6-2', lessonTitle: 'التباديل', page: 182,
    titleAr: 'التباديل', titleEn: 'Permutations', tags: 'تباديل ترتيب ل(ن،ر)',
    formula: 'P(n, r) = \\frac{n!}{(n - r)!} = n(n-1)\\cdots(n - r + 1)',
    book: 'ل(ن ، ر) = ن! ÷ (ن − ر)! ؛ ل(ن ، ن) = ن!',
    summary: 'التبديلة ترتيب لعناصر مختارة؛ **الترتيب مهم**. عدد تباديل $r$ عنصراً من $n$ عنصراً دون تكرار هو $P(n, r) = \\frac{n!}{(n-r)!}$.',
    vars: [['n', 'عدد العناصر المتاحة', 'عدد صحيح موجب'], ['r', 'عدد العناصر المرتبة', '$0 \\le r \\le n$']],
    params: [{ key: 'n', label: 'n', min: 1, max: 10, step: 1, value: 5, int: true }, { key: 'r', label: 'r', min: 0, max: 10, step: 1, value: 2, int: true }],
    onSet(p) { if (p.r > p.n) p.r = p.n; },
    custom: true, canvasHint: 'الخانات العلوية: عدد الخيارات لكل موقع. تحتها قائمة بالترتيبات الممكنة (الأحرف تمثل العناصر).',
    compute(p) { return { P: M.nPrBig(p.n, p.r), list: perms(p.n, p.r, 240) }; },
    drawCustom(ctx, W, H, p, d, c) {
      const r = p.r; const bw = Math.min(70, (W - 40) / Math.max(1, r) - 30);
      let x = (W - (r * (bw + 30) - 30)) / 2;
      for (let i = 0; i < r; i++) {
        chip(ctx, String(p.n - i), x, 18, bw, 44, c.c1, c.text);
        text(ctx, 'موقع ' + (i + 1), x + bw / 2, 74, { color: c.muted, size: 11, rtl: true });
        if (i < r - 1) text(ctx, '×', x + bw + 15, 40, { color: c.axis, size: 20 });
        x += bw + 30;
      }
      if (r === 0) text(ctx, 'r = 0: ترتيب واحد فقط (الترتيب الفارغ)', W / 2, 40, { color: c.text, rtl: true });
      const shown = grid(ctx, W, H, d.list, 96, c, c.c5);
      if (shown < Number(d.P)) text(ctx, 'معروض ' + shown + ' من ' + big(d.P) + ' ترتيب', W / 2, H - 10, { color: c.c2, rtl: true, size: 12 });
    },
    live(p, d) { return 'P(' + p.n + ', ' + p.r + ') = \\frac{' + p.n + '!}{' + (p.n - p.r) + '!} = ' + (p.r ? Array.from({ length: p.r }, (_, i) => p.n - i).join(' \\times ') : '1') + ' = ' + big(d.P); },
    results(p, d) { return [['عدد التباديل', 'P(' + p.n + ',' + p.r + ') = ' + big(d.P)], ['P(n, n) = n!', 'P(' + p.n + ',' + p.n + ') = ' + big(M.nPrBig(p.n, p.n))], ['الترتيب مهم', 'AB و BA ترتيبان مختلفان', false]]; },
    steps(p, d) { return ['للموقع الأول $' + p.n + '$ خيارات، للثاني $' + (p.n - 1) + '$ (لا تكرار)… حتى الموقع $' + p.r + '$.', 'بمبدأ العد: $' + (p.r ? Array.from({ length: p.r }, (_, i) => p.n - i).join(' \\times ') : '1') + ' = ' + big(d.P) + '$', 'وهذا يساوي $\\frac{' + p.n + '!}{(' + p.n + ' - ' + p.r + ')!}$.']; },
    learn: [
      '**ص 182:** عدد الطرق المختلفة لوقوف فريق في صف لأخذ صورة هو عدد الترتيبات المختلفة للاعبين، ويسمى التباديل.',
      '**تعريف:** عدد تباديل $n$ من العناصر مأخوذة جميعاً في كل مرة هو $n!$، ويُرمز له $P(n, n)$.',
      '**التباديل الرائية:** $P(n, r) = \\frac{n!}{(n - r)!}$. مثال: الأعداد المكونة من منزلتين من $\\{1, 3, 5, 7, 9\\}$ دون تكرار: $5 \\times 4 = 20$.'
    ],
    challenges: [
      { q: 'كم عدداً من منزلتين يمكن تكوينه من $\\{1, 3, 5, 7, 9\\}$ دون تكرار؟', hint: '$n = 5, r = 2$.', init: { n: 3, r: 1 }, check: (p) => p.n === 5 && p.r === 2, why: () => '$P(5, 2) = 20$.' },
      { q: 'بكم طريقة يقف 5 لاعبين في صف لأخذ صورة؟', hint: '$P(5, 5) = 5!$.', init: { n: 3, r: 1 }, check: (p) => p.n === 5 && p.r === 5, why: () => '$120$ طريقة.' }
    ],
    tutor: [
      { q: 'ما الفرق بين التباديل والتوافيق؟', k: ['الفرق', 'التوافيق'], a: () => 'في التباديل **الترتيب مهم** (AB ≠ BA)، وفي التوافيق نختار مجموعة فقط والترتيب غير مهم ({A,B} = {B,A}). لذلك $C(n, r) = \\frac{P(n, r)}{r!}$.' },
      { q: 'لماذا يقل عدد الخيارات في كل موقع؟', k: ['يقل', 'خيارات'], a: (p) => 'لأن العنصر المستخدم لا يتكرر؛ بعد اختيار عنصر للموقع الأول يبقى $' + (p.n - 1) + '$ للموقع الثاني، وهكذا.' }
    ]
  });

  /* ======================= 6-3 التوافيق ======================= */
  ML.register({
    id: 'combinations', unit: U, order: 3, lesson: '6-3', lessonTitle: 'التوافيق', page: 185,
    titleAr: 'التوافيق', titleEn: 'Combinations', tags: 'توافيق اختيار مجموعات لجنه',
    formula: '\\binom{n}{r} = \\frac{n!}{r!\\,(n - r)!},\\quad 0 \\le r \\le n',
    book: '(ن ر) = ن! ÷ (ر! (ن − ر)!) ؛ (ن 0) = 1 ، (ن ن) = 1 ، (ن ر) = (ن ن−ر)',
    summary: 'التوفيقة اختيار مجموعة جزئية من $r$ عنصراً من $n$ عنصراً؛ **الترتيب غير مهم**. كل توفيقة تقابل $r!$ تبديلة، لذا $\\binom{n}{r} = \\frac{P(n, r)}{r!}$.',
    vars: [['n', 'عدد عناصر المجموعة', 'عدد صحيح موجب'], ['r', 'عدد العناصر المختارة', '$0 \\le r \\le n$']],
    params: [{ key: 'n', label: 'n', min: 1, max: 12, step: 1, value: 5, int: true }, { key: 'r', label: 'r', min: 0, max: 12, step: 1, value: 3, int: true }],
    onSet(p) { if (p.r > p.n) p.r = p.n; },
    custom: true, canvasHint: 'كل بطاقة مجموعة مختلفة؛ إعادة ترتيب عناصرها لا تعطي مجموعة جديدة.',
    compute(p) { return { C: M.nCrBig(p.n, p.r), P: M.nPrBig(p.n, p.r), rf: M.factBig(p.r), list: combs(p.n, p.r, 300) }; },
    drawCustom(ctx, W, H, p, d, c) {
      text(ctx, 'المجموعة: {' + LET.slice(0, Math.min(p.n, 10)).join(', ') + (p.n > 10 ? ', …' : '') + '}  —  نختار ' + p.r, W / 2, 20, { color: c.text, rtl: true });
      const shown = grid(ctx, W, H, d.list, 44, c, c.c3);
      if (shown < Number(d.C)) text(ctx, 'معروض ' + shown + ' من ' + big(d.C) + ' مجموعة', W / 2, H - 10, { color: c.c2, rtl: true, size: 12 });
    },
    live(p, d) { return '\\binom{' + p.n + '}{' + p.r + '} = \\frac{' + p.n + '!}{' + p.r + '!\\,' + (p.n - p.r) + '!} = ' + big(d.C); },
    results(p, d) {
      return [['عدد التوافيق', '\\binom{' + p.n + '}{' + p.r + '} = ' + big(d.C)], ['العلاقة مع التباديل', '\\frac{P(' + p.n + ',' + p.r + ')}{' + p.r + '!} = \\frac{' + big(d.P) + '}{' + big(d.rf) + '} = ' + big(d.C)], ['التماثل', '\\binom{' + p.n + '}{' + p.r + '} = \\binom{' + p.n + '}{' + (p.n - p.r) + '} = ' + big(M.nCrBig(p.n, p.n - p.r))]];
    },
    steps(p, d) { return ['$\\binom{' + p.n + '}{' + p.r + '} = \\frac{' + p.n + '!}{' + p.r + '! \\times ' + (p.n - p.r) + '!}$', 'كل مجموعة من $' + p.r + '$ عناصر يمكن ترتيبها بـ $' + p.r + '! = ' + big(d.rf) + '$ طريقة، فنقسم عدد التباديل عليه: $\\frac{' + big(d.P) + '}{' + big(d.rf) + '} = ' + big(d.C) + '$']; },
    learn: [
      '**نشاط 1 ص 185:** خمسة أصدقاء يختارون ثلاثة منهم لإعداد الطعام. المجموعة {محمد، يزن، خالد} هي نفسها {يزن، خالد، محمد} — الترتيب غير مهم.',
      '**تعريف:** عدد التوافيق الرائية لمجموعة فيها $n$ عنصراً: $\\binom{n}{r} = \\frac{n!}{r!(n-r)!}$، $r \\le n$.',
      '**مثال:** معرض فيه 6 أنواع سيارات، يختار 4 للعرض: $\\binom{6}{4} = \\frac{6 \\times 5}{2} = 15$.',
      '**قواعد (ص 186):** $\\binom{n}{0} = 1$، $\\binom{n}{n} = 1$، $\\binom{n}{r} = \\binom{n}{n - r}$.'
    ],
    challenges: [
      { q: 'بكم طريقة يختار صاحب المعرض 4 سيارات من 6 أنواع؟', hint: '$n = 6, r = 4$.', init: { n: 3, r: 1 }, check: (p) => p.n === 6 && p.r === 4, why: () => '$15$ طريقة.' },
      { q: 'فريق كرة سلة (5 لاعبين) من بين 8 لاعبين (تمرين 3 ص 187).', hint: '$\\binom{8}{5}$.', init: { n: 3, r: 1 }, check: (p) => p.n === 8 && p.r === 5, why: () => '$\\binom{8}{5} = 56$.' }
    ],
    tutor: [
      { q: 'لماذا نقسم على r!؟', k: ['نقسم', 'r!', 'لماذا'], a: (p, d) => 'لأن كل مجموعة من $' + p.r + '$ عناصر تظهر في التباديل $' + big(d.rf) + '$ مرة (بكل ترتيباتها)، والتوافيق تعدّها مرة واحدة فقط.' },
      { q: 'لماذا C(n,r) = C(n,n−r)؟', k: ['تماثل', 'n-r', 'متساويه'], a: (p) => 'اختيار $' + p.r + '$ عناصر لنأخذها يحدد تلقائياً $' + (p.n - p.r) + '$ عناصر نتركها؛ فعدد الطرق متساوٍ.' }
    ]
  });

  /* ======================= 6-4 نظرية ذات الحدين ======================= */
  ML.register({
    id: 'binomial', unit: U, order: 4, lesson: '6-4', lessonTitle: 'نظرية ذات الحدين', page: 188,
    titleAr: 'نظرية ذات الحدين', titleEn: 'The Binomial Theorem', tags: 'ذات الحدين مفكوك باسكال حد عام',
    formula: '(a + b)^n = \\sum_{r=0}^{n} \\binom{n}{r} a^{n-r} b^{r},\\qquad T_{r+1} = \\binom{n}{r} a^{n-r} b^{r}',
    book: '(أ + ب)ن = Σ (ن ر) أ^(ن−ر) ب^ر ، ر = 0 … ن',
    summary: 'بدلاً من ضرب $(a + b)$ في نفسه $n$ مرة، نستخدم معاملات التوافيق $\\binom{n}{r}$ (صفوف مثلث باسكال). في المفكوك $n + 1$ حداً، وأس $a$ يتناقص بينما أس $b$ يتزايد ومجموع الأسين دائماً $n$.',
    vars: [['n', 'أس ذي الحدين', 'عدد صحيح $\\ge 0$'], ['a, b', 'قيمتان عدديتان للتحقق من المفكوك', '$\\mathbb{R}$'], ['r', 'رتبة الحد العام $T_{r+1}$', '$0 \\le r \\le n$']],
    params: [
      { key: 'n', label: 'n', min: 0, max: 10, step: 1, value: 4, int: true },
      { key: 'r', label: 'r', min: 0, max: 10, step: 1, value: 2, int: true },
      { key: 'a', label: 'a', min: -3, max: 3, step: 0.5, value: 2 },
      { key: 'b', label: 'b', min: -3, max: 3, step: 0.5, value: 1 }
    ],
    onSet(p) { if (p.r > p.n) p.r = p.n; },
    custom: true, canvasHint: 'مثلث باسكال: كل عدد = مجموع العددين فوقه. الصف المظلل يعطي معاملات المفكوك.',
    compute(p) {
      const coef = Array.from({ length: p.n + 1 }, (_, r) => Number(M.nCrBig(p.n, r)));
      const terms = coef.map((c, r) => c * Math.pow(p.a, p.n - r) * Math.pow(p.b, r));
      return { coef: coef, terms: terms, sum: terms.reduce((s, t) => s + t, 0), direct: Math.pow(p.a + p.b, p.n) };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const rows = Math.max(p.n + 1, 6); const rh = Math.min(34, (H - 20) / rows); const cw = Math.min(56, (W - 20) / (rows + 1));
      for (let i = 0; i < rows; i++) {
        for (let k = 0; k <= i; k++) {
          const x = W / 2 + (k - i / 2) * cw, y = 18 + i * rh;
          const on = i === p.n; const hi = on && k === p.r;
          if (on) { ctx.save(); ctx.fillStyle = hi ? c.c2 : c.c1; ctx.globalAlpha = 0.2; ctx.beginPath(); ctx.arc(x, y, Math.min(cw, rh) * 0.48, 0, 7); ctx.fill(); ctx.restore(); }
          text(ctx, String(M.nCrBig(i, k)), x, y, { color: hi ? c.c2 : on ? c.c1 : c.muted, size: Math.min(15, cw * 0.32), w: on ? '700' : '500' });
        }
      }
    },
    live(p, d) {
      const t = d.coef.map((c, r) => {
        const ea = p.n - r, eb = r;
        const s = (c === 1 && (ea || eb) ? '' : c) + (ea ? 'a' + (ea > 1 ? '^{' + ea + '}' : '') : '') + (eb ? 'b' + (eb > 1 ? '^{' + eb + '}' : '') : '');
        return s;
      });
      return '(a + b)^{' + p.n + '} = ' + t.join(' + ');
    },
    results(p, d) {
      return [
        ['عدد الحدود', 'n + 1 = ' + (p.n + 1)],
        ['المعاملات', d.coef.join(',\\ ')],
        ['الحد العام T_{' + (p.r + 1) + '}', '\\binom{' + p.n + '}{' + p.r + '}a^{' + (p.n - p.r) + '}b^{' + p.r + '} = ' + d.coef[p.r] + ' \\cdot (' + M.fmt(p.a) + ')^{' + (p.n - p.r) + '}(' + M.fmt(p.b) + ')^{' + p.r + '} = ' + M.tex(d.terms[p.r])],
        ['مجموع الحدود', M.tex(d.sum)],
        ['(a + b)^n مباشرة', '(' + M.fmt(p.a + p.b) + ')^{' + p.n + '} = ' + M.tex(d.direct), true, M.near(d.sum, d.direct, 1e-9 * Math.max(1, Math.abs(d.direct))) ? 'pos' : 'neg'],
        ['مجموع المعاملات', '2^{' + p.n + '} = ' + Math.pow(2, p.n)]
      ];
    },
    steps(p, d) { return ['المعاملات هي $\\binom{' + p.n + '}{0}, \\binom{' + p.n + '}{1}, \\dots, \\binom{' + p.n + '}{' + p.n + '}$ = الصف $' + p.n + '$ من مثلث باسكال.', 'أس $a$ يبدأ بـ $' + p.n + '$ ويتناقص، وأس $b$ يبدأ بـ $0$ ويتزايد.', 'تحقق عددي: مجموع الحدود $' + M.tex(d.sum) + '$ يساوي $(' + M.fmt(p.a) + ' + ' + M.fmt(p.b) + ')^{' + p.n + '} = ' + M.tex(d.direct) + '$.']; },
    learn: [
      '**ص 188:** نستطيع إيجاد $(a + b)^2, (a + b)^3, (a + b)^4$ بقانون التوزيع، لكن $(a + b)^{15}$ طويل وشاق؛ لذا نستخدم نظرية ذات الحدين.',
      '**النظرية:** $(a + b)^n = \\binom{n}{0}a^n + \\binom{n}{1}a^{n-1}b + \\dots + \\binom{n}{n}b^n$.',
      'ملاحظة: النسخة المرفقة من الكتاب تنتهي عند الصفحة 188 (بداية الدرس)؛ صيغة النظرية أعلاه هي الصيغة القياسية المبنية على التوافيق من الدرس 6-3.'
    ],
    challenges: [
      { q: 'اعرض مفكوك $(a + b)^5$ واجعل الحد المظلل هو الحد الرابع.', hint: 'الحد الرابع $T_4$ أي $r = 3$.', init: { n: 2, r: 0 }, check: (p) => p.n === 5 && p.r === 3, why: () => '$T_4 = \\binom{5}{3}a^2b^3 = 10a^2b^3$.' },
      { q: 'اجعل مجموع الحدود صفراً.', hint: 'اجعل $a + b = 0$ مع $n \\ge 1$.', init: { n: 3, a: 2, b: 1 }, check: (p, d) => p.n >= 1 && M.near(d.direct, 0) }
    ],
    tutor: [
      { q: 'من أين تأتي المعاملات؟', k: ['المعاملات', 'من اين', 'باسكال'], a: (p, d) => 'من التوافيق: معامل الحد الذي فيه $b^r$ هو $\\binom{n}{r}$ = عدد طرق اختيار $b$ من $r$ قوساً من الأقواس الـ $n$. للصف الحالي: $' + d.coef.join(', ') + '$.' },
      { q: 'كم عدد الحدود؟', k: ['عدد الحدود', 'كم'], a: (p) => 'عدد الحدود $n + 1 = ' + (p.n + 1) + '$.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
