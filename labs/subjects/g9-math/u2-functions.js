/* رياضيات التاسع — الوحدة الثانية: العلاقات والاقترانات (ص 30–63) */
(function (root) {
  'use strict';
  const ML = root.ML; const M = ML.math; const G = ML.m9;
  const U = 2;
  const range = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };
  const byRule = (A, f) => A.map((x) => [x, f(x)]);
  const allPairs = (A, B) => { const r = []; A.forEach((x) => B.forEach((y) => r.push([x, y]))); return r; };
  const numeric = (S) => S.every((v) => typeof v === 'number');

  /* ======================= 2-1 الضرب الديكارتي ======================= */
  const CP = {
    shirts: { name: 'نشاط 1: القياسات × الألوان (القمصان)', A: [38, 40, 42], B: ['أحمر', 'أخضر', 'أصفر'], page: 32 },
    act2: { name: 'نشاط 2: أ = {2، 4، 6} ، ب = {7، 8}', A: [2, 4, 6], B: [7, 8], page: 32 },
    act3: { name: 'نشاط 3: أ = {1، 2، 3} ، ب = {6، 8}', A: [1, 2, 3], B: [6, 8], page: 33 },
    act4: { name: 'نشاط 4: أ = {2، 4، 6} ، ب = {4، 5}', A: [2, 4, 6], B: [4, 5], page: 33 },
    ex3: { name: 'تمرين 3: أ = {3، 5، 7، 9} ، ب = مضاعفات 5 بين 4 و 23', A: [3, 5, 7, 9], B: [5, 10, 15, 20], page: 34 }
  };
  const OPS = [['AB', 'أ × ب'], ['BA', 'ب × أ'], ['AA', 'أ × أ']];
  G.reg({
    id: 'cartesian-product', unit: U, order: 1, lesson: '2-1', lessonTitle: 'الضرب الديكارتي', page: 32,
    titleAr: 'الضرب الديكارتي والأزواج المرتبة', titleEn: 'Cartesian Product & Ordered Pairs', tags: 'ضرب ديكارتي ازواج مرتبه مسقط اول ثاني عدد العناصر قمصان',
    formula: 'A \\times B = \\{(x, y) : x \\in A,\\ y \\in B\\},\\qquad n(A \\times B) = n(A) \\times n(B)',
    book: 'أ × ب = {(س ، ص): س ∈ أ ، ص ∈ ب} ؛ عدد عناصر أ × ب = عدد عناصر أ × عدد عناصر ب',
    summary: 'حاصل الضرب الديكارتي للمجموعتين غير الخاليتين أ و ب هو مجموعة جميع الأزواج المرتبة التي مسقطها الأول من أ ومسقطها الثاني من ب. الترتيب مهم: $(2, 7) \\ne (7, 2)$، لذلك $A \\times B \\ne B \\times A$ عموماً.',
    vars: [['A, B', 'مجموعتان غير خاليتين', 'من أنشطة الكتاب'], ['(x, y)', 'زوج مرتب: $x$ المسقط الأول و $y$ المسقط الثاني', '$x \\in A ، y \\in B$']],
    params: [
      { key: 'pre', label: '\\text{المجموعتان}', type: 'select', value: 'shirts', options: G.opts(Object.keys(CP).map((k) => [k, CP[k].name])) },
      { key: 'op', label: '\\text{العملية}', type: 'select', value: 'AB', options: OPS }
    ],
    custom: true, canvasHint: 'الصف = المسقط الأول، والعمود = المسقط الثاني. يظهر التمثيل في المستوى الديكارتي عندما تكون العناصر أعداداً.',
    compute(p) {
      const P = CP[p.pre]; const X = p.op === 'BA' ? P.B : P.A, Y = p.op === 'AB' ? P.B : P.A;
      const pairs = allPairs(X, Y);
      return { P: P, X: X, Y: Y, pairs: pairs, n: pairs.length, num: numeric(X) && numeric(Y) };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); const side = d.num && !nar;
      const tw = side ? W * 0.55 : W - 20, th = side ? H - 30 : d.num ? H * 0.5 : H - 30;
      const cols = d.Y.length + 1, rows = d.X.length + 1; const cw = tw / cols, rh = Math.min(46, th / rows);
      const x0 = W - 10; const y0 = 16;
      const nm = { AB: ['أ', 'ب'], BA: ['ب', 'أ'], AA: ['أ', 'أ'] }[p.op];
      for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
        const x = x0 - (j + 1) * cw, y = y0 + i * rh; const head = i === 0 || j === 0;
        ctx.fillStyle = i === 0 && j === 0 ? 'rgba(37,99,235,.25)' : head ? 'rgba(37,99,235,.12)' : 'rgba(148,163,184,.08)'; ctx.fillRect(x + 1, y + 1, cw - 2, rh - 2);
        let t = '';
        if (i === 0 && j === 0) t = nm[0] + ' \\ ' + nm[1];
        else if (i === 0) t = G.n(d.Y[j - 1]); else if (j === 0) t = G.n(d.X[i - 1]);
        else t = G.pair([d.X[i - 1], d.Y[j - 1]]);
        G.txt(ctx, t, x + cw / 2, y + rh / 2, { color: head ? c.c1 : c.text, size: nar ? (cols > 4 ? 9.5 : 11) : cols > 4 ? 11 : 13, w: head ? '800' : '600' });
      }
      if (d.num) {
        const px = side ? 20 : 30, py = side ? 30 : y0 + rows * rh + 20, pw = side ? W * 0.38 : W - 60, ph = side ? H - 60 : H - py - 16;
        if (ph > 60) G.plane(ctx, px, py, pw, ph, d.pairs, c);
      }
    },
    live(p, d) { const nm = { AB: 'A \\times B', BA: 'B \\times A', AA: 'A \\times A' }[p.op]; return 'n(' + nm + ') = ' + d.X.length + ' \\times ' + d.Y.length + ' = ' + d.n; },
    results(p, d) {
      const nm = OPS.find((o) => o[0] === p.op)[1];
      return [['عدد عناصر المجموعة الأولى', String(d.X.length), false], ['عدد عناصر المجموعة الثانية', String(d.Y.length), false], ['عدد عناصر ' + nm, d.X.length + ' × ' + d.Y.length + ' = ' + d.n, false, 'pos'], [nm, G.pairs(d.pairs.slice(0, 9)) + (d.n > 9 ? ' …' : ''), false]];
    },
    steps(p, d) {
      const s = ['نأخذ كل عنصر من المجموعة الأولى مسقطاً أول، ونقرنه بكل عنصر من المجموعة الثانية.', 'عدد الأزواج $= ' + d.X.length + ' \\times ' + d.Y.length + ' = ' + d.n + '$.'];
      if (p.op === 'BA') s.push('لاحظ أن الزوج ' + G.pair([d.X[0], d.Y[0]]) + ' في ب × أ يختلف عن ' + G.pair([d.Y[0], d.X[0]]) + ' في أ × ب، فالضرب الديكارتي ليس تبديلياً.');
      return s;
    },
    explain(a, b, da, db) { return a.op !== b.op ? [b.op === 'BA' ? 'بدّلنا الترتيب: أصبحت عناصر ب مساقط أولى. عدد العناصر نفسه، لكن الأزواج مختلفة.' : b.op === 'AA' ? 'أ × أ: المسقطان كلاهما من أ، وعدد عناصرها مربع عدد عناصر أ.' : 'أ × ب: المسقط الأول من أ والثاني من ب.'] : []; },
    learn: [
      '**نشاط 1 ص 32:** يُنتج مصنع قمصاناً بالقياسات 38، 40، 42 والألوان أحمر وأخضر وأصفر؛ كل تصميم زوج مرتب مثل (38، أحمر)، وعدد التصاميم $3 \\times 3 = 9$.',
      '**تعريف 1 ص 32:** $A \\times B = \\{(x, y) : x \\in A ، y \\in B\\}$.',
      '**نشاط 3 ص 33:** إذا كانت $A = \\{1, 2, 3\\}$ و $B = \\{6, 8\\}$ فإن $A \\times B \\ne B \\times A$.',
      '**تعريف 2 ص 33:** $(x, y) = (w, l)$ إذا وفقط إذا $x = w$ و $y = l$. نشاط 5: $(x - 1, 7) = (9, y - 1)$ ومنه $x = 10$ ، $y = 8$. نشاط 6 ص 34: $(x^2, 7) = (49, y + 8)$ ومنه $x = \\pm 7$ ، $y = -1$.'
    ],
    challenges: [
      { q: 'بيّن بالجدول أن $B \\times A \\ne A \\times B$ في نشاط 3.', hint: 'اختر نشاط 3 والعملية ب × أ.', init: { pre: 'shirts', op: 'AB' }, check: (p) => p.pre === 'act3' && p.op === 'BA' },
      { q: 'اختر حاصل ضرب ديكارتي عدد عناصره 16 (تمرين 3 ص 34).', hint: '$4 \\times 4 = 16$.', init: { pre: 'act2', op: 'AB' }, check: (p, d) => d.n === 16 },
      { q: 'كم عنصراً في $A \\times A$ لنشاط 4؟', hint: 'اختر نشاط 4 و أ × أ.', init: { pre: 'act2', op: 'AB' }, check: (p) => p.pre === 'act4' && p.op === 'AA', why: () => '$3 \\times 3 = 9$ أزواج.' }
    ],
    tutor: [
      { q: 'لماذا (٢ ، ٧) ≠ (٧ ، ٢)؟', k: ['لماذا', 'ترتيب', 'زوج'], a: () => 'لأن الزوج **مرتب**: المسقط الأول في الأول مختلف (2 ≠ 7). يتساوى زوجان فقط إذا تساوى المسقطان الأولان والمسقطان الثانيان (تعريف 2 ص 33).' },
      { q: 'كيف أحسب عدد عناصر أ × ب بسرعة؟', k: ['عدد', 'عناصر', 'بسرعه'], a: (p, d) => 'نضرب عدد العناصر: $' + d.X.length + ' \\times ' + d.Y.length + ' = ' + d.n + '$.' },
      { q: 'حلّ (س – ١ ، ٧) = (٩ ، ص – ١)', k: ['حل', 'س', 'ص', 'تساوي'], a: () => 'من تساوي الزوجين: $x - 1 = 9$ إذن $x = 10$، و $7 = y - 1$ إذن $y = 8$.' }
    ]
  });

  /* ======================= 2-2 العلاقة ======================= */
  const RL = {
    lamps: { name: 'نشاط 1: المصابيح والطاقة المستهلكة', pairs: [[8, 6], [6, 5], [5, 4.5], [4, 3.25], [3, 2], [2, 1.6]], page: 35 },
    act2: { name: 'نشاط 2: ع = {(1، 2)، (3، 6)، (4، 8)، (5، 10)}', pairs: [[1, 2], [3, 6], [4, 8], [5, 10]], page: 35 },
    act4: { name: 'نشاط 4: س > ص على {1، 2، 3، 4}', A: [1, 2, 3, 4], rule: (x, y) => x > y, page: 36 },
    act5: { name: 'نشاط 5: س − ص = 1 من {2، 3، 4} إلى {0، 1، 2، 3}', A: [2, 3, 4], B: [0, 1, 2, 3], rule: (x, y) => x - y === 1, page: 37 },
    ex4: { name: 'تمرين 4: س = ص + 3 على {1، …، 6}', A: range(1, 6), rule: (x, y) => x === y + 3, page: 38 },
    ex5: { name: 'تمرين 5: المسقط الأول = ⅓ المسقط الثاني', A: [1, 2, 3], B: [2, 3, 4, 6, 9], rule: (x, y) => 3 * x === y, page: 38 }
  };
  const relOf = (k) => { const R = RL[k]; if (R.pairs) return { A: G.uniq(R.pairs.map((q) => q[0])), B: G.uniq(R.pairs.map((q) => q[1])), pairs: R.pairs }; const A = R.A, B = R.B || R.A; return { A: A, B: B, pairs: allPairs(A, B).filter((q) => R.rule(q[0], q[1])) }; };
  G.reg({
    id: 'relation', unit: U, order: 2, lesson: '2-2', lessonTitle: 'العلاقة', page: 35,
    titleAr: 'العلاقة: المجال والمدى وطرق التمثيل', titleEn: 'Relations: Domain, Range & Representations', tags: 'علاقه مجال مدى مخطط سهمي مستوى ديكارتي ازواج مرتبه مصابيح طاقه',
    formula: 'R \\subseteq A \\times B',
    book: 'العلاقة: أي مجموعة من الأزواج المرتبة ؛ كل مجموعة جزئية من أ × ب تُسمّى علاقة من أ إلى ب (ع ⊆ أ × ب)',
    ar: { R: 'ع' },
    summary: 'العلاقة مجموعة من الأزواج المرتبة. مجموعة المساقط الأولى تسمى **مجال** العلاقة، ومجموعة المساقط الثانية تسمى **مداها**. تمثَّل العلاقة بأزواج مرتبة أو بمخطط سهمي أو في المستوى الديكارتي.',
    vars: [['R', 'العلاقة (ع في الكتاب)', 'مجموعة جزئية من $A \\times B$'], ['(x, y)', 'زوج في العلاقة', 'المسقط الأول من المجال والثاني من المدى']],
    params: [
      { key: 'pre', label: '\\text{العلاقة}', type: 'select', value: 'lamps', options: G.opts(Object.keys(RL).map((k) => [k, RL[k].name])) },
      { key: 'i', label: '\\text{الزوج}', min: 1, max: 9, step: 1, value: 3, int: true, desc: 'رقم الزوج المظلل' }
    ],
    custom: true, canvasHint: 'المخطط السهمي يميناً والمستوى الديكارتي يساراً؛ الزوج المظلل باللون البنفسجي في التمثيلين.',
    compute(p) {
      const r = relOf(p.pre); const k = Math.min(p.i, r.pairs.length) - 1;
      return { r: r, hi: r.pairs[k], k: k, dom: G.uniq(r.pairs.map((q) => q[0])), rng: G.uniq(r.pairs.map((q) => q[1])) };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W);
      if (nar) { G.venn(ctx, 0, 6, W, H * 0.5, d.r.A, d.r.B, d.r.pairs, c, { hi: d.hi }); G.plane(ctx, 34, H * 0.56, W - 60, H * 0.42, d.r.pairs, c, { hi: d.hi }); }
      else { G.venn(ctx, W * 0.5, 10, W * 0.5, H - 20, d.r.A, d.r.B, d.r.pairs, c, { hi: d.hi }); G.plane(ctx, 30, 24, W * 0.44, H - 54, d.r.pairs, c, { hi: d.hi }); }
    },
    live(p, d) { return '(' + G.n(d.hi[0]) + ', ' + G.n(d.hi[1]) + ') \\in R'; },
    results(p, d) {
      return [['العلاقة', G.pairs(d.r.pairs), false], ['المجال', G.set(d.dom), false], ['المدى', G.set(d.rng), false], ['الزوج المظلل', G.pair(d.hi), false, 'pos']].concat(p.pre === 'lamps' ? [['قراءة الزوج', d.hi[0] + ' مصابيح تستهلك ' + G.n(d.hi[1]) + ' كيلو واط ساعة', false]] : []);
    },
    steps(p, d) { return ['نكتب الأزواج المرتبة التي تحقق العلاقة: ' + G.pairs(d.r.pairs) + '.', 'المجال = مجموعة المساقط الأولى = ' + G.set(d.dom) + '.', 'المدى = مجموعة المساقط الثانية = ' + G.set(d.rng) + '.']; },
    explain(a, b, da, db) { return a.pre !== b.pre ? ['علاقة جديدة فيها ' + db.r.pairs.length + ' أزواج؛ مجالها ' + G.set(db.dom) + ' ومداها ' + G.set(db.rng) + '.'] : da && da.k !== db.k ? ['الزوج ' + G.pair(db.hi) + ': سهم من ' + G.n(db.hi[0]) + ' في المجال إلى ' + G.n(db.hi[1]) + ' في المدى، ونقطة في المستوى الديكارتي.'] : []; },
    learn: [
      '**نشاط 1 ص 35:** رصدت بلدية عدد المصابيح المضاءة (س) والطاقة المستهلكة (ص) بالكيلو واط ساعة: (8، 6)، (6، 5)، (5، $4\\tfrac12$)، (4، $3\\tfrac14$)، (3، 2)، (2، $1\\tfrac{6}{10}$).',
      '**أتعلم ص 35:** العلاقة أي مجموعة من الأزواج المرتبة؛ مجموعة المساقط الأولى مجالها ومجموعة المساقط الثانية مداها.',
      '**تعريف ص 36:** أي مجموعة جزئية من $A \\times B$ تسمى علاقة من A إلى B؛ وإذا كانت $A = B$ سميت علاقة على A.',
      '**نشاطا 4 و 5 ص 36–37:** تمثيل العلاقة بمخطط سهمي وفي المستوى الديكارتي.'
    ],
    challenges: [
      { q: 'إذا كان عدد المصابيح المضاءة 5، فما الطاقة المستهلكة؟ (نشاط 1)', hint: 'اختر علاقة المصابيح وظلّل الزوج الذي مسقطه الأول 5.', init: { pre: 'act2', i: 1 }, check: (p, d) => p.pre === 'lamps' && d.hi[0] === 5, why: () => '$4\\tfrac{1}{2}$ كيلو واط ساعة.' },
      { q: 'اختر علاقة تمرين 5 وظلّل الزوج الذي مسقطه الثاني 9.', hint: 'المسقط الأول ثلث الثاني.', init: { pre: 'lamps', i: 1 }, check: (p, d) => p.pre === 'ex5' && d.hi[1] === 9 }
    ],
    tutor: [
      { q: 'ما الفرق بين المجال والمدى؟', k: ['الفرق', 'المجال', 'المدى'], a: (p, d) => 'المجال مجموعة المساقط الأولى ' + G.set(d.dom) + '، والمدى مجموعة المساقط الثانية ' + G.set(d.rng) + '.' },
      { q: 'هل كل مجموعة أزواج علاقة؟', k: ['كل', 'علاقه'], a: () => 'نعم؛ العلاقة أي مجموعة من الأزواج المرتبة، وإذا كانت جزءاً من $A \\times B$ فهي علاقة من A إلى B.' }
    ]
  });

  /* ======================= 2-3 خواص العلاقات ======================= */
  const RP = {
    act2: { name: 'نشاط 2: س ≤ ص على {15، 20، 25}', A: [15, 20, 25], rule: (x, y) => x <= y },
    act3a: { name: 'نشاط 3: ع₁ على {1، 3، 5، 7}', A: [1, 3, 5, 7], pairs: [[1, 1], [3, 3], [5, 7], [7, 7]] },
    act3b: { name: 'نشاط 3: ع₂ على {1، 3، 5، 7}', A: [1, 3, 5, 7], pairs: [[1, 1], [3, 3], [3, 5], [5, 5], [7, 7]] },
    act4: { name: 'نشاط 4: س + ص = 6 على {1، …، 5}', A: range(1, 5), rule: (x, y) => x + y === 6 },
    act5a: { name: 'نشاط 5: ع₁ على {-1، -2، 3، 5}', A: [-2, -1, 3, 5], pairs: [[-1, -1], [-1, 3], [3, -1], [-2, -2], [3, 3], [-2, 5], [5, -2], [5, 5]] },
    act5b: { name: 'نشاط 5: ع₂ على {-1، -2، 3، 5}', A: [-2, -1, 3, 5], pairs: [[-1, -1], [3, 3], [5, -1], [5, 5]] },
    act7a: { name: 'نشاط 7: س × ص = 8 على {1، 2، 3، 4، 8}', A: [1, 2, 3, 4, 8], rule: (x, y) => x * y === 8 },
    act7b: { name: 'نشاط 7: س < ص على {1، 2، 3، 4، 8}', A: [1, 2, 3, 4, 8], rule: (x, y) => x < y },
    act8: { name: 'نشاط 8: على {1، ½، ⅓، ¼}', A: [1, 1 / 2, 1 / 3, 1 / 4], pairs: [[1, 1], [1, 1 / 2], [1 / 2, 1], [1 / 2, 1 / 2], [1 / 3, 1 / 3], [1 / 4, 1 / 4]] },
    ex1a: { name: 'تمرين 1أ: على {2، 4، 6}', A: [2, 4, 6], pairs: [[2, 4], [2, 6], [2, 2], [4, 2], [4, 4]] },
    ex2a: { name: 'تمرين 2أ: على {-1، 0، 1}', A: [-1, 0, 1], pairs: [[-1, -1], [1, 0], [1, 1], [0, 1]] },
    ex3: { name: 'تمرين 3: على {1، 2، 3}', A: [1, 2, 3], pairs: [[1, 1], [1, 2], [2, 2], [2, 3], [3, 3]] },
    ex4a: { name: 'تمرين 4: ع₁ على {-2، -1، 1، 3}', A: [-2, -1, 1, 3], pairs: [[-2, -2], [-2, -1], [-1, -2], [-1, -1], [1, 1], [3, 3]] },
    ex6: { name: 'تمرين 6: ع = {(2، 4)} على {2، 4، 6}', A: [2, 4, 6], pairs: [[2, 4]] },
    full: { name: 'ملاحظة ص 42: ع = أ × أ على {1، 2، 3}', A: [1, 2, 3], rule: () => true }
  };
  const baseRel = (k) => { const R = RP[k]; return { A: R.A, pairs: R.pairs ? R.pairs : allPairs(R.A, R.A).filter((q) => R.rule(q[0], q[1])) }; };
  // الأزواج الفعلية بعد تعديلات المتعلم (نقر الخلايا)
  const effective = (p, st) => {
    const b = baseRel(p.rel); let pairs = b.pairs.slice();
    if (st && st.rel === p.rel) st.tog.forEach((q) => { pairs = G.hasPair(pairs, q) ? pairs.filter((r) => !(G.eq(r[0], q[0]) && G.eq(r[1], q[1]))) : pairs.concat([q]); });
    return { A: b.A, pairs: pairs };
  };
  function analyze(A, pairs) {
    const has = (x, y) => G.hasPair(pairs, [x, y]);
    const missDiag = A.filter((x) => !has(x, x));
    const asym = pairs.filter((q) => !has(q[1], q[0]));
    let counter = null;
    for (const q of pairs) { for (const r of pairs) { if (G.eq(q[1], r[0]) && !has(q[0], r[1])) { counter = [q, r, [q[0], r[1]]]; break; } } if (counter) break; }
    const refl = !missDiag.length, sym = !asym.length, trans = !counter;
    return { refl: refl, sym: sym, trans: trans, eqv: refl && sym && trans, missDiag: missDiag, asym: asym, counter: counter };
  }
  G.analyzeRel = analyze; G.effectiveRel = effective; G.baseRel = baseRel;
  const YN = (b) => (b ? 'نعم ✔' : 'لا ✘');
  G.reg({
    id: 'relation-properties', unit: U, order: 3, lesson: '2-3', lessonTitle: 'خواص العلاقات', page: 39,
    titleAr: 'خواص العلاقات: الانعكاس والتماثل والتعدي والتكافؤ', titleEn: 'Properties of Relations', tags: 'انعكاس تماثل تعدي تكافؤ علاقه على مجموعه مصفوفه',
    formula: '\\text{انعكاس: } (x, x) \\in R\\ \\forall x \\in A \\quad \\text{تماثل: } (x, y) \\in R \\Rightarrow (y, x) \\in R \\quad \\text{تعدٍّ: } (x, y), (y, l) \\in R \\Rightarrow (x, l) \\in R',
    book: 'انعكاس: (س ، س) ∈ ع لكل س ∈ أ ؛ تماثل: (س ، ص) ∈ ع ⇐ (ص ، س) ∈ ع ؛ تعدٍّ: (س ، ص) ، (ص ، ل) ∈ ع ⇐ (س ، ل) ∈ ع ؛ التكافؤ = انعكاس وتماثل وتعدٍّ',
    ar: { R: 'ع' },
    summary: 'العلاقة على المجموعة أ تكون **انعكاسية** إذا ارتبط كل عنصر بنفسه، و**تماثلية** إذا كان كل زوج معكوسه في العلاقة، و**متعدية** إذا ارتبط س بـ ص و ص بـ ل فإن س يرتبط بـ ل. وتكون **علاقة تكافؤ** إذا حققت الخواص الثلاث.',
    vars: [['A', 'المجموعة التي عُرّفت عليها العلاقة', 'من أنشطة الكتاب'], ['R', 'العلاقة (ع)', '$R \\subseteq A \\times A$']],
    params: [{ key: 'rel', label: 'R', type: 'select', value: 'ex1a', options: G.opts(Object.keys(RP).map((k) => [k, RP[k].name])) }],
    initState() { return { rel: null, tog: [] }; },
    resetOn: ['rel'],
    custom: true, canvasHint: 'الصف = المسقط الأول س، والعمود = المسقط الثاني ص. اضغط على أي خلية لإضافة الزوج أو حذفه. الأحمر: ما يمنع الخاصية.',
    compute(p) { const b = baseRel(p.rel); return { A: b.A, base: b.pairs }; },
    drawCustom(ctx, W, H, p, d, c) {
      const e = effective(p, d.st); const an = analyze(e.A, e.pairs); const A = e.A; const n = A.length; const nar = G.narrow(W);
      const size = Math.min((W - 60) / (n + 1), (H - 70) / (n + 1), 64); const gx = W / 2 + (n + 1) * size / 2, gy = 30;
      d.hits = [];
      G.txt(ctx, 'ص ←', gx - size * (n + 1) / 2 - 6, gy - 14, { color: c.muted, size: 12, align: 'center' });
      for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) {
        const x = gx - (j + 1) * size, y = gy + i * size;
        if (i === 0 && j === 0) { G.txt(ctx, 'س \\ ص', x + size / 2, y + size / 2, { color: c.c1, size: 12, w: '800' }); continue; }
        if (i === 0 || j === 0) { ctx.fillStyle = 'rgba(37,99,235,.12)'; ctx.fillRect(x + 1, y + 1, size - 2, size - 2); G.txt(ctx, G.n(i === 0 ? A[j - 1] : A[i - 1]), x + size / 2, y + size / 2, { color: c.c1, size: nar ? 12 : 14, w: '800' }); continue; }
        const q = [A[i - 1], A[j - 1]]; const on = G.hasPair(e.pairs, q);
        const diagMiss = i === j && !on;
        const isAsym = on && G.hasPair(an.asym, q);
        const mirrorMiss = !on && G.hasPair(an.asym, [q[1], q[0]]);
        const inCounter = an.counter && (G.eq(an.counter[0][0], q[0]) && G.eq(an.counter[0][1], q[1]) || G.eq(an.counter[1][0], q[0]) && G.eq(an.counter[1][1], q[1]));
        const counterMiss = an.counter && !on && G.eq(an.counter[2][0], q[0]) && G.eq(an.counter[2][1], q[1]);
        ctx.fillStyle = on ? (isAsym ? 'rgba(220,38,38,.35)' : inCounter ? 'rgba(217,119,6,.4)' : 'rgba(5,150,105,.35)') : i === j ? 'rgba(148,163,184,.16)' : 'rgba(148,163,184,.06)';
        ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
        if (diagMiss || mirrorMiss || counterMiss) { ctx.save(); ctx.strokeStyle = c.c2; ctx.lineWidth = 2.5; ctx.setLineDash(mirrorMiss || counterMiss ? [5, 4] : []); ctx.strokeRect(x + 4, y + 4, size - 8, size - 8); ctx.restore(); }
        if (on) { ctx.fillStyle = c.text; ctx.beginPath(); ctx.arc(x + size / 2, y + size / 2, Math.min(7, size / 7), 0, 7); ctx.fill(); }
        d.hits.push({ x: x, y: y, w: size, h: size, q: q });
      }
      const ty = gy + (n + 1) * size + 22;
      const tags = [['انعكاس', an.refl], ['تماثل', an.sym], ['تعدٍّ', an.trans], ['تكافؤ', an.eqv]];
      tags.forEach((t, k) => { const x = W / 2 + (1.5 - k) * Math.min(110, (W - 20) / 4); G.txt(ctx, t[0] + (t[1] ? ' ✔' : ' ✘'), x, Math.min(H - 12, ty), { color: t[1] ? c.c3 : c.c2, size: nar ? 12 : 14, w: '800' }); });
    },
    onPointer(type, x, y, p, st, api) {
      if (type !== 'down') return false; const h = api.hit(x, y); if (!h) return false;
      if (st.rel !== p.rel) { st.rel = p.rel; st.tog = []; }
      const k = st.tog.findIndex((q) => G.eq(q[0], h.q[0]) && G.eq(q[1], h.q[1]));
      if (k >= 0) st.tog.splice(k, 1); else st.tog.push(h.q);
      const e = effective(p, st); api.say([(G.hasPair(e.pairs, h.q) ? 'أضفت الزوج ' : 'حذفت الزوج ') + G.pair(h.q) + '. العلاقة الآن فيها ' + e.pairs.length + ' أزواج.']);
      return true;
    },
    live(p, d) { const e = effective(p, d.st); const an = analyze(e.A, e.pairs); return '\\text{' + (an.eqv ? 'علاقة تكافؤ' : 'ليست علاقة تكافؤ') + '}'; },
    results(p, d) {
      const e = effective(p, d.st); const an = analyze(e.A, e.pairs);
      return [['ع', G.pairs(e.pairs), false], ['انعكاس', YN(an.refl) + (an.refl ? '' : ' — ينقص ' + an.missDiag.map((x) => G.pair([x, x])).join(' ، ')), false, an.refl ? 'pos' : 'neg'],
        ['تماثل', YN(an.sym) + (an.sym ? '' : ' — ' + G.pair(an.asym[0]) + ' ∈ ع لكن ' + G.pair([an.asym[0][1], an.asym[0][0]]) + ' ∉ ع'), false, an.sym ? 'pos' : 'neg'],
        ['تعدٍّ', YN(an.trans) + (an.trans ? '' : ' — ' + G.pair(an.counter[0]) + ' و ' + G.pair(an.counter[1]) + ' ∈ ع لكن ' + G.pair(an.counter[2]) + ' ∉ ع'), false, an.trans ? 'pos' : 'neg'],
        ['تكافؤ', YN(an.eqv), false, an.eqv ? 'pos' : 'neg']];
    },
    steps(p, d) {
      const e = effective(p, d.st); const an = analyze(e.A, e.pairs);
      return ['**الانعكاس:** نفحص عناصر القطر (س ، س) لكل عنصر في أ ← ' + (an.refl ? 'كلها موجودة.' : 'ينقص ' + an.missDiag.map((x) => G.pair([x, x])).join(' ، ') + '.'),
        '**التماثل:** لكل زوج (س ، ص) نبحث عن (ص ، س) ← ' + (an.sym ? 'كل زوج معكوسه موجود (الجدول متناظر حول القطر).' : 'لا يوجد معكوس ' + G.pair(an.asym[0]) + '.'),
        '**التعدي:** لكل زوجين (س ، ص) و (ص ، ل) نبحث عن (س ، ل) ← ' + (an.trans ? 'محقق.' : G.pair(an.counter[2]) + ' غير موجود.'),
        '**التكافؤ:** ' + (an.eqv ? 'تحققت الخواص الثلاث فالعلاقة علاقة تكافؤ.' : 'لم تتحقق الخواص الثلاث معاً.')];
    },
    explain(a, b) { return a.rel !== b.rel ? ['علاقة جديدة؛ لاحظ القطر (الانعكاس)، والتناظر حول القطر (التماثل)، والأزواج المتسلسلة (التعدي).'] : []; },
    learn: [
      '**نشاط 1 ص 39:** فصائل الدم A و B و AB و O، والعلاقة (فصيلة المتبرّع، فصيلة المتبرَّع له): لا يمكن لحامل AB التبرع لشخص فصيلته O.',
      '**تعريف 1 ص 39:** العلاقة ع على أ انعكاسية إذا كان $(x, x) \\in R$ لكل $x \\in A$.',
      '**تعريف 2 ص 40:** ع تماثلية إذا كان $(x, y) \\in R$ يستلزم $(y, x) \\in R$.',
      '**نشاط 6 ص 41:** (أطول من) بين الطلبة: أمل 162 سم، مريم 160 سم، مها 155 سم؛ (أمل، مريم) و (مريم، مها) إذن (أمل، مها): علاقة متعدية.',
      '**تعريف 4 ص 42:** علاقة التكافؤ: انعكاس وتماثل وتعدٍّ. على $\\{1, 2, 3\\}$ أصغر علاقة تكافؤ $\\{(1,1), (2,2), (3,3)\\}$ وأكبرها $A \\times A$.'
    ],
    challenges: [
      { q: 'أضف زوجاً واحداً لعلاقة تمرين 1أ لتصبح **انعكاسية**.', hint: 'ينقصها $(6, 6)$.', init: { rel: 'ex1a' }, check: (p, d) => { const e = effective(p, d.st); return p.rel === 'ex1a' && analyze(e.A, e.pairs).refl; } },
      { q: 'اجعل علاقة تمرين 3 **متعدية** بإضافة زوج.', hint: '$(1, 2)$ و $(2, 3)$ يستلزمان $(1, 3)$.', init: { rel: 'ex3' }, check: (p, d) => { const e = effective(p, d.st); return p.rel === 'ex3' && analyze(e.A, e.pairs).trans; } },
      { q: 'اختر علاقة من الكتاب هي **علاقة تكافؤ** على مجموعة فيها 4 عناصر.', hint: 'نشاط 8 أو تمرين 4.', init: { rel: 'ex1a' }, check: (p, d) => { const e = effective(p, d.st); return e.A.length === 4 && analyze(e.A, e.pairs).eqv; } }
    ],
    tutor: [
      { q: 'كيف أعرف التماثل من الجدول؟', k: ['تماثل', 'الجدول'], a: () => 'الجدول التماثلي متناظر حول القطر: كلما وُجد (س ، ص) وُجد (ص ، س) في الخلية المقابلة.' },
      { q: 'هل العلاقة {(٢ ، ٤)} متعدية؟', k: ['متعديه', '(2 ، 4)', 'تمرين 6'], a: () => 'نعم؛ لا يوجد زوجان من الشكل (س ، ص) و (ص ، ل) لنختبرهما، فالشرط لا ينكسر أبداً.' },
      { q: 'لماذا ليست هذه العلاقة علاقة تكافؤ؟', k: ['لماذا', 'تكافؤ'], a: (p, d) => { const e = effective(p, d.st); const an = analyze(e.A, e.pairs); return an.eqv ? 'هي علاقة تكافؤ: انعكاس وتماثل وتعدٍّ.' : 'تنقصها: ' + [an.refl ? '' : 'الانعكاس', an.sym ? '' : 'التماثل', an.trans ? '' : 'التعدي'].filter(Boolean).join(' و ') + '.'; } }
    ]
  });

  /* ======================= 2-4 الاقتران ======================= */
  const FN = {
    fig1: { name: 'نشاط 2: شكل (1)', A: [1, 2, 3], B: [3, 5, 7, 8], pairs: [[1, 3], [2, 5]], page: 45 },
    fig2: { name: 'نشاط 2: شكل (2)', A: [1, 2, 3], B: [3, 5, 7, 8], pairs: [[1, 3], [2, 5], [3, 7]], page: 45 },
    fig3: { name: 'نشاط 2: شكل (3)', A: [1, 2, 3], B: [3, 5, 7, 8], pairs: [[1, 3], [2, 5], [2, 8], [3, 7]], page: 45 },
    act3: { name: 'نشاط 3: ق(س) = 2س من {0، 1، 2، 3}', A: [0, 1, 2, 3], B: range(0, 7), f: (x) => 2 * x, rule: 'f(x) = 2x', page: 45 },
    act4: { name: 'نشاط 4: ق(س) = 2س + 1 على ص', A: range(-2, 5), B: range(-2, 5).map((x) => 2 * x + 1), f: (x) => 2 * x + 1, rule: 'f(x) = 2x + 1', page: 46 },
    ex1a: { name: 'تمرين 1: المخطط الأول', A: [1, 2, 3], B: [4, 5, 6, 7], pairs: [[1, 4], [2, 5], [3, 6]], page: 47 },
    ex1c: { name: 'تمرين 1: المخطط الثالث', A: [2, 4, 6], B: [-1, 1, 3], pairs: [[2, 1], [4, 1], [6, 1]], page: 47 },
    ex6: { name: 'تمرين 6: ق(س) = 2س للزوجي و س + 2 للفردي', A: range(1, 5), B: range(2, 8), f: (x) => (x % 2 ? x + 2 : 2 * x), page: 47 }
  };
  const fnOf = (k) => { const F = FN[k]; return { A: F.A, B: F.B, pairs: F.pairs || byRule(F.A, F.f), F: F }; };
  function isFn(r) {
    const noImg = r.A.filter((x) => !r.pairs.some((q) => G.eq(q[0], x)));
    const multi = r.A.filter((x) => r.pairs.filter((q) => G.eq(q[0], x)).length > 1);
    return { ok: !noImg.length && !multi.length, noImg: noImg, multi: multi };
  }
  G.isFn = isFn;
  G.reg({
    id: 'function-map', unit: U, order: 4, lesson: '2-4', lessonTitle: 'الاقتران', page: 44,
    titleAr: 'الاقتران: المجال والمجال المقابل والمدى', titleEn: 'Functions: Domain, Codomain & Range', tags: 'اقتران علاقه مجال مقابل مدى صوره قاعده مخطط سهمي',
    formula: 'f: A \\to B,\\qquad (x, y) \\in f \\iff f(x) = y',
    book: 'الاقتران ق علاقة من أ إلى ب بحيث يرتبط كل عنصر من أ بعنصر واحد فقط من ب ؛ المدى ⊆ المجال المقابل',
    summary: 'الاقتران علاقة يرتبط فيها **كل** عنصر من المجال بعنصر **واحد فقط** من المجال المقابل. صورة العنصر س هي ق(س)، ومجموعة الصور هي المدى، وهي جزء من المجال المقابل.',
    vars: [['A', 'المجال', 'مجموعة المدخلات'], ['B', 'المجال المقابل', 'تحوي المدى'], ['f(x)', 'صورة العنصر $x$', 'عنصر واحد فقط']],
    params: [
      { key: 'pre', label: 'f', type: 'select', value: 'fig3', options: G.opts(Object.keys(FN).map((k) => [k, FN[k].name])) },
      { key: 'x', label: 'x', min: -2, max: 6, step: 1, value: 2, int: true, desc: 'عنصر من المجال' }
    ],
    custom: true, canvasHint: 'أحمر في المجال: عنصر بلا صورة أو له أكثر من صورة. البرتقالي في المجال المقابل: عناصر ليست صوراً (خارج المدى).',
    compute(p) {
      const r = fnOf(p.pre); const t = isFn(r); const rng = G.uniq(r.pairs.map((q) => q[1]));
      const img = r.pairs.filter((q) => G.eq(q[0], p.x)).map((q) => q[1]);
      return { r: r, t: t, rng: rng, img: img, inA: G.has(r.A, p.x) };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const bad = d.t.noImg.concat(d.t.multi);
      G.venn(ctx, 0, 8, W, H - 50, d.r.A, d.r.B, d.r.pairs, c, { miss: bad, idle: d.r.B.filter((y) => !G.has(d.rng, y)), pairColor: (q) => (G.has(d.t.multi, q[0]) ? c.c2 : G.eq(q[0], p.x) ? c.c5 : c.c3) });
      G.txt(ctx, d.t.ok ? 'العلاقة اقتران ✔' : 'العلاقة ليست اقتراناً ✘', W / 2, H - 22, { color: d.t.ok ? c.c3 : c.c2, size: 17, w: '800' });
    },
    live(p, d) { return d.inA ? (d.img.length === 1 ? 'f(' + p.x + ') = ' + G.n(d.img[0]) : '\\text{' + (d.img.length ? 'للعنصر ' + p.x + ' أكثر من صورة' : 'العنصر ' + p.x + ' ليست له صورة') + '}') : '\\text{العنصر ' + p.x + ' ليس في المجال}'; },
    results(p, d) {
      const r = [['هل العلاقة اقتران؟', d.t.ok ? 'نعم: كل عنصر في المجال له صورة واحدة فقط' : d.t.multi.length ? 'لا: العنصر ' + d.t.multi.map(G.n).join(' ، ') + ' له أكثر من صورة' : 'لا: العنصر ' + d.t.noImg.map(G.n).join(' ، ') + ' ليست له صورة', false, d.t.ok ? 'pos' : 'neg'],
        ['المجال', G.set(d.r.A), false], ['المجال المقابل', G.set(d.r.B), false], ['المدى', G.set(d.rng), false]];
      if (d.r.F.rule) r.push(['القاعدة', d.r.F.rule]);
      return r;
    },
    steps(p, d) { return ['نفحص كل عنصر في المجال: هل خرج منه سهم واحد بالضبط؟', d.t.ok ? 'نعم لكل العناصر ← اقتران.' : (d.t.noImg.length ? 'العنصر ' + d.t.noImg.map(G.n).join(' ، ') + ' لم يخرج منه سهم. ' : '') + (d.t.multi.length ? 'العنصر ' + d.t.multi.map(G.n).join(' ، ') + ' خرج منه أكثر من سهم.' : ''), 'المدى = مجموعة الصور = ' + G.set(d.rng) + ' ⊆ المجال المقابل.']; },
    explain(a, b, da, db) { return a.pre !== b.pre ? [db.t.ok ? 'هذه العلاقة اقتران.' : 'هذه العلاقة ليست اقتراناً.'] : da && a.x !== b.x && db.img.length === 1 ? ['صورة ' + b.x + ' هي ' + G.n(db.img[0]) + '.'] : []; },
    learn: [
      '**نشاط 1 ص 44:** في سجلات المواطنين لكل طالب تاريخ ميلاد واحد: الاسم المدخلات (المجال) وتاريخ الميلاد المخرجات.',
      '**تعريف 1 ص 44:** الاقتران ق علاقة من أ إلى ب يرتبط فيها كل عنصر من أ بعنصر واحد فقط من ب، ونكتب ق: أ ← ب؛ وإذا كان (س ، ص) ∈ ق نكتب ق(س) = ص.',
      '**نشاط 2 ص 45:** في الشكل (1) العنصر 3 ليست له صورة، وفي الشكل (3) للعنصر 2 صورتان 5 و 8؛ فكلاهما ليس اقتراناً.',
      '**نشاط 4 ص 46:** ق(س) = 2س + 1 على ص: ق(-2) = -3؛ وإذا كان ق(س) = 11 فإن 2س + 1 = 11 ومنه س = 5.',
      '**أفكر وأناقش ص 46:** هل كل علاقة اقتران؟ لا، لكن كل اقتران علاقة.'
    ],
    challenges: [
      { q: 'إذا كان ق(س) = 2س + 1، فما قيمة س التي تجعل ق(س) = 11؟ (نشاط 4)', hint: 'اختر نشاط 4 وجرّب قيم س.', init: { pre: 'fig1', x: 0 }, check: (p, d) => p.pre === 'act4' && d.img[0] === 11 },
      { q: 'اختر مخططاً **ليس** اقتراناً لأن عنصراً له صورتان.', hint: 'شكل (3).', init: { pre: 'fig2', x: 1 }, check: (p, d) => d.t.multi.length > 0 },
      { q: 'في تمرين 6، أوجد ق(4).', hint: '4 عدد زوجي ← ق(4) = 2 × 4.', init: { pre: 'fig2', x: 1 }, check: (p, d) => p.pre === 'ex6' && p.x === 4, why: () => 'ق(4) = 8 ، بينما ق(3) = 3 + 2 = 5.' }
    ],
    tutor: [
      { q: 'ما الفرق بين المدى والمجال المقابل؟', k: ['الفرق', 'المدى', 'المقابل'], a: (p, d) => 'المجال المقابل المجموعة التي تُرسل إليها الأسهم ' + G.set(d.r.B) + '، أما المدى فهو ما وصلت إليه الأسهم فعلاً ' + G.set(d.rng) + '؛ والمدى ⊆ المجال المقابل.' },
      { q: 'هل يمكن لعنصرين أن تكون لهما الصورة نفسها؟', k: ['عنصرين', 'الصوره نفسها'], a: () => 'نعم، هذا لا يمنع أن تكون العلاقة اقتراناً (مثل تمرين 1: الأعداد 2 و 4 و 6 صورتها 1). الممنوع أن يكون لعنصر واحد صورتان.' }
    ]
  });

  /* ======================= 2-5 أنواع الاقترانات ======================= */
  const FT = {
    act1: { name: 'نشاط 1: ق(س) = س² + 1 من {0، 1، 2} إلى {1، 2، 5}', A: [0, 1, 2], B: [1, 2, 5], f: (x) => x * x + 1 },
    act2: { name: 'نشاط 2: ق(س) = 3س على ط (جزء منها)', A: [0, 1, 2, 3], B: range(0, 9), f: (x) => 3 * x, part: true },
    act3q: { name: 'نشاط 3: الاقتران ق', A: [-7, -2, 0, 1], B: [1 / 2, 1, -1, 5], pairs: [[-7, 1 / 2], [-2, 1], [0, -1], [1, 5]] },
    act3h: { name: 'نشاط 3: الاقتران هـ', A: [-5, -4, -2, 1, 2], B: [-1, 0, 1, 2], pairs: [[-5, -1], [-4, 0], [-2, 1], [1, 2], [2, 1]] },
    act4: { name: 'نشاط 4: من {1، 2، 3} إلى {½، -2، 4}', A: [1, 2, 3], B: [1 / 2, -2, 4], pairs: [[1, 1 / 2], [2, -2], [3, -2]] },
    act5: { name: 'نشاط 5: من {1، 2، 3، 4} إلى {3، 4، 7، 9}', A: [1, 2, 3, 4], B: [3, 4, 7, 9], pairs: [[1, 3], [2, 4], [3, 7], [4, 9]] },
    act6: { name: 'نشاط 6: ق(س) = س² + 1 على ح (جزء منها)', A: [-3, -2, -1, 0, 1, 2, 3], B: [0, 1, 2, 5, 10], f: (x) => x * x + 1, part: true },
    ex1: { name: 'تمرين 1: ق(س) = 2س + 1 من {-2، -1، 0، 1}', A: [-2, -1, 0, 1], B: [-3, -1, 1, 3, 5, 7], f: (x) => 2 * x + 1 },
    ex3b: { name: 'تمرين 3ب: هـ = {(0، 2)، (1، 3)، (2، 4)، (3، 5)}', A: [0, 1, 2, 3], B: [2, 3, 4, 5], pairs: [[0, 2], [1, 3], [2, 4], [3, 5]] }
  };
  const ftOf = (k) => { const F = FT[k]; return { A: F.A, B: F.B, pairs: F.pairs || byRule(F.A, F.f), F: F }; };
  function fnType(r) {
    const rng = G.uniq(r.pairs.map((q) => q[1]));
    const coll = rng.filter((y) => r.pairs.filter((q) => G.eq(q[1], y)).length > 1);
    const idle = r.B.filter((y) => !G.has(rng, y));
    const one = !coll.length, onto = !idle.length;
    return { rng: rng, coll: coll, idle: idle, one: one, onto: onto, bij: one && onto };
  }
  G.fnType = fnType;
  G.reg({
    id: 'function-types', unit: U, order: 5, lesson: '2-5', lessonTitle: 'أنواع الاقترانات', page: 48,
    titleAr: 'الاقتران الشامل والواحد لواحد والتناظر', titleEn: 'Onto, One-to-One & Bijective Functions', tags: 'شامل واحد لواحد تناظر مدى مجال مقابل بطاقه هويه',
    formula: '\\text{شامل: المدى} = B \\qquad \\text{واحد لواحد: } x_1 \\ne x_2 \\Rightarrow f(x_1) \\ne f(x_2) \\qquad \\text{تناظر: شامل و واحد لواحد}',
    book: 'شامل: مداه = مجاله المقابل ؛ واحد لواحد: إذا كان س₁ ≠ س₂ فإن ق(س₁) ≠ ق(س₂) ؛ تناظر: واحد لواحد وشامل',
    summary: 'الاقتران **شامل** إذا كان كل عنصر في المجال المقابل صورةً لعنصر ما (المدى = المجال المقابل)، و**واحد لواحد** إذا لم يشترك عنصران مختلفان في الصورة نفسها، و**تناظر** إذا كان شاملاً وواحداً لواحد.',
    vars: [['f: A \\to B', 'الاقتران', 'من أنشطة الكتاب'], ['x_1, x_2', 'عنصران من المجال', '$x_1 \\ne x_2$']],
    params: [{ key: 'pre', label: 'f', type: 'select', value: 'act4', options: G.opts(Object.keys(FT).map((k) => [k, FT[k].name])) }],
    custom: true, canvasHint: 'أحمر في المجال المقابل: صورة لأكثر من عنصر (ليس واحداً لواحد). برتقالي: عنصر ليس صورة لأي عنصر (ليس شاملاً).',
    compute(p) { const r = ftOf(p.pre); return Object.assign({ r: r }, fnType(r)); },
    drawCustom(ctx, W, H, p, d, c) {
      G.venn(ctx, 0, 8, W, H - 56, d.r.A, d.r.B, d.r.pairs, c, { bad: d.coll, idle: d.idle, pairColor: (q) => (G.has(d.coll, q[1]) ? c.c2 : c.c3) });
      const t = d.bij ? 'تناظر (واحد لواحد وشامل)' : (d.one ? 'واحد لواحد' : 'ليس واحداً لواحد') + ' ، ' + (d.onto ? 'شامل' : 'ليس شاملاً');
      G.txt(ctx, t, W / 2, H - 26, { color: d.bij ? c.c3 : c.c5, size: G.narrow(W) ? 14 : 17, w: '800' });
      if (d.r.F.part) G.txt(ctx, 'نعرض جزءاً من المجموعة اللانهائية', W / 2, H - 6, { color: c.muted, size: 11 });
    },
    live(p, d) { return '\\text{' + (d.bij ? 'تناظر' : (d.one ? 'واحد لواحد' : 'ليس واحداً لواحد') + '، ' + (d.onto ? 'شامل' : 'ليس شاملاً')) + '}'; },
    results(p, d) {
      return [['المدى', G.set(d.rng), false], ['المجال المقابل', G.set(d.r.B), false],
        ['شامل؟', d.onto ? 'نعم: المدى = المجال المقابل' : 'لا: ' + d.idle.map(G.n).join(' ، ') + ' ليس صورة لأي عنصر', false, d.onto ? 'pos' : 'neg'],
        ['واحد لواحد؟', d.one ? 'نعم: لكل صورة عنصر واحد فقط' : 'لا: ' + G.n(d.coll[0]) + ' صورة لـ ' + d.r.pairs.filter((q) => G.eq(q[1], d.coll[0])).map((q) => G.n(q[0])).join(' و '), false, d.one ? 'pos' : 'neg'],
        ['تناظر؟', d.bij ? 'نعم' : 'لا', false, d.bij ? 'pos' : 'neg']];
    },
    steps(p, d) { return ['**الشمول:** نقارن المدى ' + G.set(d.rng) + ' بالمجال المقابل ' + G.set(d.r.B) + ' ← ' + (d.onto ? 'متساويان.' : 'غير متساويين.'), '**واحد لواحد:** هل وصل سهمان إلى عنصر واحد؟ ← ' + (d.one ? 'لا.' : 'نعم عند ' + G.n(d.coll[0]) + '.'), '**التناظر:** ' + (d.bij ? 'تحقق الشرطان.' : 'لم يتحقق الشرطان معاً.')]; },
    explain(a, b, da, db) { return a.pre !== b.pre ? [db.bij ? 'هذا الاقتران تناظر: كل عنصر في المجال المقابل صورة لعنصر واحد فقط.' : 'لاحظ العناصر الملوّنة: هي سبب فقدان الشمول أو خاصية واحد لواحد.'] : []; },
    learn: [
      '**نشاط تعاوني ص 48:** لكل مواطن رقم هوية واحد، ولا يوجد مواطنان لهما الرقم نفسه.',
      '**تعريف 1 ص 48:** يسمى ق: أ ← ب اقتراناً شاملاً إذا كان مداه = مجاله المقابل. نشاط 2: ق(س) = 3س على ط ليس شاملاً لأن 1 مثلاً ليس صورة لأي عدد طبيعي.',
      '**تعريف 2 ص 49:** ق واحد لواحد إذا كان كل عنصر في المدى صورة لعنصر واحد فقط؛ أي إذا كان س₁ ≠ س₂ فإن ق(س₁) ≠ ق(س₂).',
      '**تعريف 3 ص 50:** التناظر: واحد لواحد وشامل. نشاط 6: ق(س) = س² + 1 على ح ليس واحداً لواحد لأن ق(3) = ق(-3) = 10، وليس شاملاً.'
    ],
    challenges: [
      { q: 'اختر اقتراناً **تناظراً** من الكتاب.', hint: 'نشاط 1 أو نشاط 5 أو تمرين 3ب.', init: { pre: 'act4' }, check: (p, d) => d.bij },
      { q: 'اختر اقتراناً **واحداً لواحد** لكنه **ليس شاملاً**.', hint: 'نشاط 2 أو تمرين 1.', init: { pre: 'act5' }, check: (p, d) => d.one && !d.onto },
      { q: 'بيّن من نشاط 6 أن ق(3) = ق(-3).', hint: 'اختر نشاط 6.', init: { pre: 'act1' }, check: (p) => p.pre === 'act6', why: () => 'ق(3) = 9 + 1 = 10 = ق(-3)، فالاقتران ليس واحداً لواحد.' }
    ],
    tutor: [
      { q: 'كيف أعرف أن الاقتران شامل؟', k: ['شامل', 'اعرف'], a: () => 'إذا وصل سهم واحد على الأقل إلى **كل** عنصر في المجال المقابل، أي المدى = المجال المقابل.' },
      { q: 'هل ق(س) = ٢س على ص واحد لواحد؟', k: ['2س', 'ص', 'تمرين 4'], a: () => 'نعم؛ إذا كان 2س₁ = 2س₂ فإن س₁ = س₂. لكنه ليس شاملاً على ص لأن الأعداد الفردية ليست صوراً.' },
      { q: 'ما نوع الاقتران الحالي؟', k: ['نوع', 'الحالي'], a: (p, d) => (d.bij ? 'تناظر.' : (d.one ? 'واحد لواحد' : 'ليس واحداً لواحد') + ' و' + (d.onto ? 'شامل.' : 'ليس شاملاً.')) }
    ]
  });

  /* ======================= 2-6 الاقتران الخطي ======================= */
  G.reg({
    id: 'linear-function', unit: U, order: 6, lesson: '2-6', lessonTitle: 'الاقتران الخطي', page: 52,
    titleAr: 'الاقتران الخطي والمحايد والثابت', titleEn: 'Linear, Identity & Constant Functions', tags: 'اقتران خطي محايد ثابت خط مستقيم جدول قيم تمثيل بياني',
    formula: 'f(x) = ax + b,\\quad a \\ne 0',
    book: 'ق(س) = أس + ب ، حيث أ ، ب أعداد حقيقية ، أ ≠ صفر ؛ ق(س) = س اقتران محايد ؛ ق(س) = ب اقتران ثابت',
    summary: 'الاقتران الخطي على الصورة $f(x) = ax + b$ حيث $a \\ne 0$، وتمثيله في المستوى الديكارتي خط مستقيم يكفي لرسمه نقطتان. الاقتران $f(x) = x$ محايد، و $f(x) = b$ ثابت (خط أفقي) وليس خطياً حسب التعريف لأن $a = 0$.',
    vars: [['a', 'معامل $x$', 'من $-5$ إلى $5$'], ['b', 'الحد الثابت', 'من $-6$ إلى $6$'], ['x', 'قيمة نعوّضها', 'من $-5$ إلى $5$']],
    params: [
      { key: 'a', label: 'a', min: -5, max: 5, step: 0.5, value: 3 },
      { key: 'b', label: 'b', min: -6, max: 6, step: 0.5, value: 1 },
      { key: 'x', label: 'x', min: -5, max: 5, step: 1, value: 1, int: true }
    ],
    plot: { view: { xmin: -6, xmax: 6, ymin: -8, ymax: 8 } },
    compute(p) {
      const f = (x) => p.a * x + p.b;
      const type = p.a === 0 ? 'const' : p.a === 1 && p.b === 0 ? 'id' : 'lin';
      return { f: f, y: f(p.x), type: type, tbl: [-1, 0, 1].map((x) => [x, f(x)]) };
    },
    draw(P, p, d) {
      const c = P.colors();
      P.fn(d.f, { color: d.type === 'const' ? c.c4 : d.type === 'id' ? c.c5 : c.c1, width: 3 });
      d.tbl.forEach((q) => P.point(q[0], q[1], { color: c.c3, r: 5 }));
      P.segment(p.x, 0, p.x, d.y, { color: c.muted, dash: [5, 5] });
      P.point(p.x, d.y, { color: c.c2, r: 7, label: '(' + p.x + ' ، ' + M.fmt(d.y) + ')' });
    },
    handles(p, d, set) { return [{ x: 0, y: p.b, onDrag: (x, y) => set('b', M.clamp(Math.round(y * 2) / 2, -6, 6)) }, { x: 1, y: p.a + p.b, onDrag: (x, y) => set('a', M.clamp(Math.round((y - p.b) * 2) / 2, -5, 5)) }]; },
    live(p, d) { return 'f(x) = ' + lin(p.a, p.b) + ',\\quad f(' + p.x + ') = ' + M.fmt(d.y); },
    results(p, d) {
      return [['نوع الاقتران', { lin: 'اقتران خطي', id: 'اقتران محايد (حالة خاصة من الخطي)', const: 'اقتران ثابت' }[d.type], false, 'pos'],
        ['جدول القيم', d.tbl.map((q) => 'ق(' + q[0] + ') = ' + M.fmt(q[1])).join(' ، '), false], ['الصورة', 'f(' + p.x + ') = ' + M.fmt(p.a) + ' \\times ' + (p.x < 0 ? '(' + p.x + ')' : p.x) + (p.b < 0 ? ' - ' + M.fmt(-p.b) : ' + ' + M.fmt(p.b)) + ' = ' + M.fmt(d.y)], ['نقطة التقاطع مع محور الصادات', G.pair([0, p.b]), false]];
    },
    steps(p, d) { return ['نعيّن نقطتين على الأقل: ' + d.tbl.map((q) => G.pair([q[0], M.round(q[1], 3)])).join(' ، ') + '.', 'نصل بينها بخط مستقيم.', d.type === 'const' ? 'عندما $a = 0$ يصبح الخط أفقياً: اقتران ثابت.' : 'عند $x = ' + p.x + '$: $f(' + p.x + ') = ' + M.fmt(d.y) + '$.']; },
    explain(a, b, da, db) {
      if (da && da.type !== db.type) return [{ lin: 'اقتران خطي: خط مستقيم مائل.', id: 'الاقتران المحايد $f(x) = x$: كل عدد صورته نفسه.', const: 'الاقتران الثابت: كل الأعداد صورتها $' + M.fmt(b.b) + '$، والخط أفقي.' }[db.type]];
      if (a.a !== b.a) return ['تغيّر معامل $x$ فتغيّر انحدار الخط' + (b.a < 0 ? ' (يتناقص من اليسار إلى اليمين).' : '.')];
      if (a.b !== b.b) return ['تغيّر الحد الثابت فانسحب الخط رأسياً ليقطع محور الصادات عند $' + M.fmt(b.b) + '$.'];
      return [];
    },
    learn: [
      '**نشاط 1 ص 52:** تعطي البلدية 25 شجرة مقابل كل دونم: ق(س) = 25س؛ زرع محمد 10 دونمات فحصل على 250 شجرة، وزرع إلياس 12 دونماً فحصل على 300 شجرة.',
      '**تعريف 1 ص 52:** كل اقتران على الصورة ق(س) = أس + ب حيث أ ≠ صفر يسمى اقتراناً خطياً، ومجاله ح إذا لم يُعطَ.',
      '**مثال ص 53:** تمثيل ق(س) = 3س + 1 بالنقاط (-1، -2) و (0، 1) و (1، 4).',
      '**تعريف 2 ص 54:** ق(س) = س اقتران محايد. **أتعلم:** ق(س) = ب اقتران ثابت.',
      '**تمارين ص 47 و 55:** ثلاجات بسعر 600 دينار ومصاريف 20000 دينار يومياً: الربح ق(س) = 600س − 20000، وعند 300 ثلاجة الربح 160000 دينار. سياج أرض مربعة ضلعها س بتكلفة 5 دنانير للمتر: ق(س) = 20س، وعند 32 م: 640 ديناراً.'
    ],
    challenges: [
      { q: 'مثّل ق(س) = 2س + 1 (نشاط 3 ص 53).', hint: '$a = 2$ ، $b = 1$.', init: { a: 3, b: 1 }, check: (p) => p.a === 2 && p.b === 1 },
      { q: 'مثّل الاقتران المحايد.', hint: 'ق(س) = س.', init: { a: 3, b: 1 }, check: (p, d) => d.type === 'id' },
      { q: 'مثّل ق(س) = 1 − 2س واحسب ق(-1) (تمرين 3ب ص 55).', hint: '$a = -2$ ، $b = 1$ ، $x = -1$.', init: { a: 3, b: 1, x: 1 }, check: (p) => p.a === -2 && p.b === 1 && p.x === -1, why: () => 'ق(-1) = 1 + 2 = 3.' }
    ],
    tutor: [
      { q: 'لماذا يكفي تعيين نقطتين؟', k: ['نقطتين', 'لماذا'], a: () => 'لأن تمثيل الاقتران الخطي خط مستقيم، ويمر بنقطتين مختلفتين خط مستقيم واحد فقط. نعيّن نقطة ثالثة للتحقق.' },
      { q: 'هل ق(س) = ٦س² خطي؟', k: ['6س²', 'تربيع', 'خطي'], a: () => 'لا؛ ليس على الصورة أس + ب لأن فيه س² (نشاط 2 ص 52).' },
      { q: 'ما صورة س الحالية؟', k: ['صوره', 'الحاليه'], a: (p, d) => 'ق(' + p.x + ') = ' + M.fmt(d.y) + '.' }
    ]
  });
  function lin(a, b) {
    const A = a === 0 ? '' : a === 1 ? 'x' : a === -1 ? '-x' : M.fmt(a) + 'x';
    if (!A) return M.fmt(b);
    return A + (b === 0 ? '' : b < 0 ? ' - ' + M.fmt(-b) : ' + ' + M.fmt(b));
  }

  /* ======================= 2-6 تطبيقات: الربح والأشجار والسياج ======================= */
  const APP = {
    trees: { name: 'نشاط 1 ص 52: الأشجار ق(س) = 25س', a: 25, b: 0, xmax: 20, xs: 'عدد الدونمات', ys: 'عدد الأشجار', page: 52 },
    fence: { name: 'تمرين 5 ص 55: السياج ق(س) = 20س', a: 20, b: 0, xmax: 40, xs: 'طول الضلع (م)', ys: 'التكلفة (دينار)', page: 55 },
    fridge: { name: 'تمرين 7 ص 47: الربح ق(س) = 600س − 20000', a: 600, b: -20000, xmax: 400, xs: 'عدد الثلاجات', ys: 'الربح (دينار)', page: 47 }
  };
  G.reg({
    id: 'linear-apps', unit: U, order: 7, lesson: '2-6', lessonTitle: 'الاقتران الخطي (تطبيقات)', page: 52,
    titleAr: 'تطبيقات الاقتران الخطي: الأشجار والسياج والأرباح', titleEn: 'Linear Function Applications', tags: 'تطبيقات اقتران خطي ربح تكلفه سياج اشجار دونم ثلاجات',
    formula: 'f(x) = ax + b',
    book: 'ق(س) = ٢٥س (الأشجار) ، ق(س) = ٢٠س (السياج) ، ق(س) = ٦٠٠س – ٢٠٠٠٠ (أرباح المصنع)',
    summary: 'كثير من المواقف الحياتية يمثّلها اقتران خطي: كمية ثابتة لكل وحدة (المعامل) مع مبلغ ثابت (الحد الثابت). نعوّض لإيجاد الناتج، ونحل المعادلة لإيجاد المدخلات.',
    vars: [['x', 'المدخلات (دونمات، أمتار، ثلاجات)', 'عدد غير سالب'], ['f(x)', 'المخرجات (أشجار، دنانير)', 'حسب القاعدة']],
    params: [
      { key: 'ctx', label: '\\text{الموقف}', type: 'select', value: 'trees', options: G.opts(Object.keys(APP).map((k) => [k, APP[k].name])) },
      { key: 'x', label: 'x', min: 0, max: 400, step: 1, value: 12, int: true }
    ],
    onSet(p, key) { if (key === 'ctx') p.x = Math.min(p.x, APP[p.ctx].xmax); },
    custom: true, canvasHint: 'كل عمود قيمة الاقتران عند عدد صحيح؛ العمود الأحمر عند القيمة المختارة.',
    compute(p) { const A = APP[p.ctx]; const x = Math.min(p.x, A.xmax); return { A: A, x: x, y: A.a * x + A.b, zero: -A.b / A.a }; },
    drawCustom(ctx, W, H, p, d, c) {
      const A = d.A; const x0 = 54, x1 = W - 20, y0 = H - 40, y1 = 30;
      const ymin = Math.min(0, A.b), ymax = A.a * A.xmax + A.b; const X = (v) => x0 + v / A.xmax * (x1 - x0), Y = (v) => y0 - (v - ymin) / (ymax - ymin) * (y0 - y1);
      ctx.save(); ctx.strokeStyle = c.axis; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x1, Y(0)); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.stroke();
      ctx.strokeStyle = c.c1; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(0), Y(A.b)); ctx.lineTo(X(A.xmax), Y(ymax)); ctx.stroke(); ctx.restore();
      for (let k = 0; k <= 4; k++) { const v = ymin + (ymax - ymin) * k / 4; G.txt(ctx, Math.round(v), x0 - 6, Y(v), { color: c.muted, size: 10, align: 'right' }); const xv = Math.round(A.xmax * k / 4); G.txt(ctx, xv, X(xv), Y(0) + 12, { color: c.muted, size: 10 }); }
      ctx.save(); ctx.fillStyle = c.c2; ctx.globalAlpha = 0.35; ctx.fillRect(X(d.x) - 5, Math.min(Y(0), Y(d.y)), 10, Math.abs(Y(d.y) - Y(0))); ctx.restore();
      ctx.fillStyle = c.c2; ctx.beginPath(); ctx.arc(X(d.x), Y(d.y), 6, 0, 7); ctx.fill();
      G.txt(ctx, 'ق(' + d.x + ') = ' + d.y, M.clamp(X(d.x), 80, W - 80), Math.max(16, Y(d.y) - 18), { color: c.c2, size: 15, w: '800', halo: c.bg });
      G.txt(ctx, A.xs, (x0 + x1) / 2, H - 10, { color: c.text, size: 12, w: '700' });
      G.txt(ctx, A.ys, x0 + 6, 14, { color: c.text, size: 12, w: '700', align: 'left' });
    },
    live(p, d) { return 'f(' + d.x + ') = ' + d.A.a + ' \\times ' + d.x + (d.A.b ? ' - ' + (-d.A.b) : '') + ' = ' + d.y; },
    results(p, d) { return [['القاعدة', 'f(x) = ' + d.A.a + 'x' + (d.A.b ? ' - ' + (-d.A.b) : '')], [d.A.xs, String(d.x), false], [d.A.ys, String(d.y), false, d.y >= 0 ? 'pos' : 'neg']].concat(d.A.b ? [['نقطة التعادل (الربح صفر)', 'x = ' + M.fmt(d.zero, 2)]] : []); },
    steps(p, d) { return ['نعوّض $x = ' + d.x + '$ في القاعدة.', '$f(' + d.x + ') = ' + d.A.a + ' \\times ' + d.x + (d.A.b ? ' - ' + (-d.A.b) : '') + ' = ' + d.y + '$.']; },
    explain(a, b) { return a.ctx !== b.ctx ? ['موقف جديد: ' + APP[b.ctx].name + '.'] : []; },
    learn: ['**نشاط 1 ص 52:** 25 شجرة لكل دونم.', '**تمرين 5 ص 55:** محيط المربع 4س وتكلفة المتر 5 دنانير: ق(س) = 20س.', '**تمرين 7 ص 47:** ثمن الثلاجة 600 دينار والمصاريف 20000 دينار يومياً.'],
    challenges: [
      { q: 'كم شجرة يحصل عليها إلياس إذا زرع 12 دونماً؟', hint: 'الأشجار، $x = 12$.', init: { ctx: 'fence', x: 0 }, check: (p, d) => p.ctx === 'trees' && d.x === 12, why: () => '$25 \\times 12 = 300$ شجرة.' },
      { q: 'أوجد أرباح المصنع إذا أنتج 300 ثلاجة.', hint: 'الربح، $x = 300$.', init: { ctx: 'trees', x: 0 }, check: (p, d) => p.ctx === 'fridge' && d.x === 300, why: () => '$600 \\times 300 - 20000 = 160000$ دينار.' },
      { q: 'ما تكلفة سياج أرض طول ضلعها 32 م؟', hint: 'السياج، $x = 32$.', init: { ctx: 'trees', x: 0 }, check: (p, d) => p.ctx === 'fence' && d.x === 32, why: () => '$20 \\times 32 = 640$ ديناراً.' }
    ],
    tutor: [
      { q: 'متى يبدأ المصنع بالربح؟', k: ['يربح', 'متى', 'تعادل'], a: () => 'عندما $600x - 20000 > 0$ أي $x > 33.3$؛ فيربح ابتداءً من 34 ثلاجة يومياً.' },
      { q: 'لماذا قاعدة السياج ٢٠س؟', k: ['السياج', '20'], a: () => 'محيط المربع $4x$ متر، وكل متر بـ 5 دنانير: $5 \\times 4x = 20x$.' }
    ]
  });

  /* ======================= 2-7 تركيب الاقترانات ======================= */
  G.reg({
    id: 'composition', unit: U, order: 8, lesson: '2-7', lessonTitle: 'تركيب الاقترانات', page: 56,
    titleAr: 'تركيب اقترانين', titleEn: 'Composition of Functions', tags: 'تركيب اقترانات هـ بعد ق عمله دولار دينار ريال',
    formula: '(g \\circ f)(x) = g(f(x))',
    book: '(هـ ∘ ق)(س) = هـ(ق(س)) ، وتُقرأ هـ بعد ق',
    summary: 'نُكوّن من الاقترانين ق و هـ اقتراناً جديداً ك مجاله مجال ق ومداه مدى هـ: نطبّق ق أولاً ثم نطبّق هـ على الناتج. يرمز له (هـ ∘ ق) ويُقرأ «هـ بعد ق».',
    vars: [['f', 'الاقتران الأول (يُطبّق أولاً)', ''], ['g', 'الاقتران الثاني', ''], ['x', 'المدخل', 'من مجال $f$']],
    params: [
      { key: 'pre', label: '\\text{المثال}', type: 'select', value: 'sets', options: [['sets', 'نشاط 2: مخططات سهمية'], ['money', 'نشاط 1: تحويل العملات']] },
      { key: 'x', label: 'x', min: 1, max: 3, step: 1, value: 1, int: true, desc: 'عنصر من مجال ق' },
      { key: 'usd', label: '\\text{دولار}', min: 0, max: 1000, step: 10, value: 100, int: true, desc: 'المبلغ بالدولار' }
    ],
    custom: true, canvasHint: 'السهم العلوي هو الاقتران المركب ك = هـ ∘ ق: ينقل مباشرة من مجال ق إلى مدى هـ.',
    compute(p) {
      if (p.pre === 'money') { const dn = p.usd * 0.7, sr = dn * 37 / 7; return { money: true, a: p.usd, b: dn, c: sr }; }
      const f = (x) => x + 4; return { money: false, a: p.x, b: f(p.x), c: f(f(p.x)) };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = G.narrow(W); const cy = H * 0.6, ry = H * 0.28, rx = Math.min(W * 0.12, 60);
      const xs = [W * 0.82, W * 0.5, W * 0.18];
      const sets = d.money ? [['دولار'], ['دينار'], ['ريال']] : [[1, 2, 3], [5, 6, 7], [9, 10, 11]];
      const names = d.money ? ['دولار', 'دينار', 'ريال'] : ['مجال ق', 'مدى ق = مجال هـ', 'مدى هـ'];
      xs.forEach((x, i) => { ctx.save(); ctx.strokeStyle = c.c1; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, cy, rx, ry, 0, 0, 7); ctx.stroke(); ctx.restore(); G.txt(ctx, names[i], x, cy + ry + 16, { color: c.muted, size: nar ? 10.5 : 12 }); });
      const vals = [d.a, d.b, d.c].map((v) => (d.money ? M.fmt(v, 2) : v));
      if (!d.money) {
        sets.forEach((S, i) => S.forEach((v, k) => { const y = cy - ry + 30 + k * (2 * ry - 60) / 2; const on = v === [d.a, d.b, d.c][i]; G.txt(ctx, v, xs[i], y, { color: on ? c.c2 : c.text, size: on ? 17 : 14, w: '800' }); if (i < 2) G.arrow(ctx, xs[i] - 18, y, xs[i + 1] + 22, y, on ? c.c2 : c.c3, on ? 3 : 1.8); }));
      } else {
        vals.forEach((v, i) => G.txt(ctx, v, xs[i], cy, { color: c.c2, size: nar ? 15 : 19, w: '800' }));
        G.arrow(ctx, xs[0] - rx + 4, cy + 26, xs[1] + rx - 4, cy + 26, c.c3, 2.5); G.arrow(ctx, xs[1] - rx + 4, cy + 26, xs[2] + rx - 4, cy + 26, c.c3, 2.5);
      }
      G.txt(ctx, 'ق', (xs[0] + xs[1]) / 2, cy - ry - 8, { color: c.c3, size: 16, w: '800' });
      G.txt(ctx, 'هـ', (xs[1] + xs[2]) / 2, cy - ry - 8, { color: c.c3, size: 16, w: '800' });
      ctx.save(); ctx.strokeStyle = c.c5; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(xs[0], cy - ry - 4); ctx.bezierCurveTo(xs[0], cy - ry - 70, xs[2], cy - ry - 70, xs[2], cy - ry - 8); ctx.stroke(); ctx.restore();
      G.arrow(ctx, xs[2] + 2, cy - ry - 18, xs[2], cy - ry - 6, c.c5, 2.5);
      G.txt(ctx, 'ك = هـ ∘ ق', W / 2, cy - ry - 62, { color: c.c5, size: 16, w: '800', halo: c.bg });
    },
    live(p, d) { return d.money ? '(g \\circ f)(' + d.a + ') = g(' + M.fmt(d.b, 2) + ') = ' + M.fmt(d.c, 2) : '(g \\circ f)(' + d.a + ') = g(f(' + d.a + ')) = g(' + d.b + ') = ' + d.c; },
    results(p, d) {
      return d.money ? [['ق(س): من الدولار إلى الدينار', 'ق(' + d.a + ') = ' + M.fmt(d.b, 2) + ' دينار', false], ['هـ(س): من الدينار إلى الريال', 'هـ(' + M.fmt(d.b, 2) + ') = ' + M.fmt(d.c, 2) + ' ريال', false], ['(هـ ∘ ق)', d.a + ' دولار = ' + M.fmt(d.c, 2) + ' ريال', false, 'pos']]
        : [['ق(' + d.a + ')', String(d.b), false], ['هـ(ق(' + d.a + '))', String(d.c), false], ['(هـ ∘ ق)(' + d.a + ')', String(d.c), false, 'pos'], ['الاقتران المركب', G.pairs([[1, 9], [2, 10], [3, 11]]), false]];
    },
    steps(p, d) { return ['نطبّق ق أولاً: ' + (d.money ? '100 دولار = 70 ديناراً، أي ق(س) = 0.7س ← ' + M.fmt(d.b, 2) + '.' : 'ق(' + d.a + ') = ' + d.b + '.'), 'ثم نطبّق هـ على الناتج: ' + (d.money ? '70 ديناراً = 370 ريالاً ← ' + M.fmt(d.c, 2) + '.' : 'هـ(' + d.b + ') = ' + d.c + '.'), '(هـ ∘ ق)(' + d.a + ') = ' + (d.money ? M.fmt(d.c, 2) : d.c) + '.']; },
    explain(a, b, da, db) { return da && da.c !== db.c ? ['المدخل ' + (db.money ? M.fmt(db.a) : db.a) + ' يمرّ عبر ق إلى ' + M.fmt(db.b, 2) + ' ثم عبر هـ إلى ' + M.fmt(db.c, 2) + '.'] : []; },
    learn: [
      '**نشاط 1 ص 56:** تشرف سلطة النقد الفلسطينية (أُنشئت عام 1997) على سلامة العمل المصرفي؛ 100 دولار تساوي 70 ديناراً، و70 ديناراً تساوي 370 ريالاً سعودياً (أسعار 2017)، إذن 100 دولار تساوي 370 ريالاً.',
      '**نشاط 2 ص 56:** نكوّن اقتراناً جديداً ك مجاله مجال ق ومداه مدى هـ: ك = هـ ∘ ق، وبشكل عام $(g \\circ f)(x) = g(f(x))$.',
      'تكملة الدرس في محاكاة «تركيب اقترانين بالقاعدة» (ص 57–58).'
    ],
    challenges: [
      { q: 'كم ريالاً تساوي 100 دولار؟ (نشاط 1)', hint: 'اختر تحويل العملات والمبلغ 100.', init: { pre: 'sets', usd: 0 }, check: (p) => p.pre === 'money' && p.usd === 100, why: () => '100 دولار ← 70 ديناراً ← 370 ريالاً.' },
      { q: 'أوجد (هـ ∘ ق)(3) من المخطط.', hint: 'ق(3) = 7 ثم هـ(7) = 11.', init: { pre: 'money', x: 1 }, check: (p) => p.pre === 'sets' && p.x === 3 }
    ],
    tutor: [
      { q: 'هل هـ ∘ ق = ق ∘ هـ؟', k: ['ق ∘ هـ', 'تبديل'], a: () => 'ليس بالضرورة؛ الترتيب مهم: في هـ ∘ ق نطبّق ق **أولاً**.' },
      { q: 'ما مجال الاقتران المركب؟', k: ['مجال', 'المركب'], a: () => 'مجاله مجال ق (المدخلات الأولى)، ومداه جزء من مدى هـ.' }
    ]
  });
  /* ======================= 2-7 تركيب الاقترانات بالقاعدة ======================= */
  const CR = {
    ex: { name: 'مثال ص 57: ق(س) = 2س + 1 ، هـ(س) = 4س − 3', f: (x) => 2 * x + 1, g: (x) => 4 * x - 3, ft: '2x + 1', gt: '4x - 3', gf: '8x + 1', fg: '8x - 5' },
    act3: { name: 'نشاط 3: ق(س) = 3 + 2س ، هـ(س) = 5س − 1', f: (x) => 3 + 2 * x, g: (x) => 5 * x - 1, ft: '3 + 2x', gt: '5x - 1', gf: '14 + 10x', fg: '1 + 10x' },
    act4: { name: 'نشاط 4: ق(س) = س² ، هـ(س) = 3س − 1', f: (x) => x * x, g: (x) => 3 * x - 1, ft: 'x^2', gt: '3x - 1', gf: '3x^2 - 1', fg: '(3x - 1)^2' },
    ex4a: { name: 'تمرين 4أ: ق(س) = 1 − 5س ، هـ(س) = 2س', f: (x) => 1 - 5 * x, g: (x) => 2 * x, ft: '1 - 5x', gt: '2x', gf: '2 - 10x', fg: '1 - 10x' },
    ex4b: { name: 'تمرين 4ب: ق(س) = س² − 1 ، هـ(س) = س + 5', f: (x) => x * x - 1, g: (x) => x + 5, ft: 'x^2 - 1', gt: 'x + 5', gf: 'x^2 + 4', fg: 'x^2 + 10x + 24' }
  };
  G.reg({
    id: 'composition-rules', unit: U, order: 9, lesson: '2-7', lessonTitle: 'تركيب الاقترانات', page: 57,
    titleAr: 'تركيب اقترانين بالقاعدة: هل هـ ∘ ق = ق ∘ هـ؟', titleEn: 'Composing Function Rules', tags: 'تركيب قاعده هـ بعد ق ق بعد هـ ترتيب',
    formula: '(g \\circ f)(x) = g(f(x)),\\qquad (f \\circ g)(x) = f(g(x))',
    book: '(هـ ∘ ق)(س) = هـ(ق(س)) ، (ق ∘ هـ)(س) = ق(هـ(س)) ؛ بشكل عام (هـ ∘ ق)(س) ≠ (ق ∘ هـ)(س)',
    summary: 'لإيجاد قاعدة $(g \\circ f)(x)$ نعوّض قاعدة $f$ مكان $x$ في قاعدة $g$. تغيير الترتيب يعطي غالباً اقتراناً مختلفاً، فالتركيب ليس تبديلياً.',
    vars: [['f, g', 'الاقترانان (ق ، هـ في الكتاب)', 'من أمثلة الكتاب'], ['x', 'قيمة نعوّضها', 'من $-5$ إلى $5$']],
    params: [
      { key: 'pre', label: 'f, g', type: 'select', value: 'ex', options: G.opts(Object.keys(CR).map((k) => [k, CR[k].name])) },
      { key: 'x', label: 'x', min: -5, max: 5, step: 0.5, value: 2 }
    ],
    plot: { view: { xmin: -6, xmax: 6, ymin: -30, ymax: 30 }, equal: false },
    compute(p) {
      const C = CR[p.pre]; const fx = C.f(p.x), gx = C.g(p.x);
      return { C: C, fx: fx, gf: C.g(fx), gx: gx, fg: C.f(gx) };
    },
    draw(P, p, d) {
      const c = P.colors(); const C = d.C;
      P.fn((x) => C.g(C.f(x)), { color: c.c1, width: 3 });
      P.fn((x) => C.f(C.g(x)), { color: c.c6, width: 3, dash: [7, 5] });
      P.point(p.x, d.gf, { color: c.c1, r: 6 }); P.point(p.x, d.fg, { color: c.c6, r: 6 });
      P.text(-5.6, 27, 'هـ ∘ ق', { color: c.c1, bold: true, size: 14, rtl: true });
      P.text(-5.6, 23, 'ق ∘ هـ', { color: c.c6, bold: true, size: 14, rtl: true });
    },
    live(p, d) { return '(g \\circ f)(' + M.fmt(p.x) + ') = ' + M.fmt(d.gf) + ',\\quad (f \\circ g)(' + M.fmt(p.x) + ') = ' + M.fmt(d.fg); },
    results(p, d) {
      return [['قاعدة هـ ∘ ق', '(g \\circ f)(x) = ' + d.C.gf], ['قاعدة ق ∘ هـ', '(f \\circ g)(x) = ' + d.C.fg],
        ['(هـ ∘ ق)(' + M.fmt(p.x) + ')', 'g(f(' + M.fmt(p.x) + ')) = g(' + M.fmt(d.fx) + ') = ' + M.fmt(d.gf)], ['(ق ∘ هـ)(' + M.fmt(p.x) + ')', 'f(g(' + M.fmt(p.x) + ')) = f(' + M.fmt(d.gx) + ') = ' + M.fmt(d.fg)],
        ['متساويان عند هذه القيمة؟', M.near(d.gf, d.fg) ? 'نعم' : 'لا', false, M.near(d.gf, d.fg) ? 'pos' : '']];
    },
    steps(p, d) { return ['نحسب الداخلي أولاً: $f(' + M.fmt(p.x) + ') = ' + M.fmt(d.fx) + '$.', 'ثم الخارجي: $g(' + M.fmt(d.fx) + ') = ' + M.fmt(d.gf) + '$.', 'وبالترتيب المعاكس: $g(' + M.fmt(p.x) + ') = ' + M.fmt(d.gx) + '$ ثم $f(' + M.fmt(d.gx) + ') = ' + M.fmt(d.fg) + '$.']; },
    explain(a, b) { return a.pre !== b.pre ? ['زوج جديد من الاقترانات؛ قارن المنحنيين: المتصل هـ ∘ ق والمتقطع ق ∘ هـ.'] : []; },
    learn: [
      '**مثال ص 57:** $(g \\circ f)(2) = g(f(2)) = g(2 \\times 2 + 1) = g(5) = 4 \\times 5 - 3 = 17$.',
      '**نشاط 3 ص 57:** $(g \\circ f)(x) = 14 + 10x$ و $(f \\circ g)(x) = 1 + 10x$، فهما مختلفان.',
      '**أتعلم ص 57:** بشكل عام $(g \\circ f)(x) \\ne (f \\circ g)(x)$.',
      '**نشاط 4 ص 58:** $f(x) = x^2$ ، $g(x) = 3x - 1$: $(g \\circ f)(1) = 2$ و $(f \\circ g)(1) = 4$.'
    ],
    challenges: [
      { q: 'أوجد $(g \\circ f)(2)$ في مثال ص 57.', hint: 'اختر المثال و $x = 2$.', init: { pre: 'act3', x: 0 }, check: (p, d) => p.pre === 'ex' && p.x === 2, why: (p, d) => '$g(5) = ' + M.fmt(d.gf) + '$.' },
      { q: 'أكمل نشاط 4: احسب $(g \\circ f)(1)$ و $(f \\circ g)(1)$.', hint: 'اختر نشاط 4 و $x = 1$.', init: { pre: 'act4', x: 0 }, check: (p) => p.pre === 'act4' && p.x === 1, why: () => '$(g \\circ f)(1) = g(1) = 2$ بينما $(f \\circ g)(1) = f(2) = 4$.' }
    ],
    tutor: [
      { q: 'كيف أجد قاعدة هـ ∘ ق؟', k: ['قاعده', 'اجد'], a: (p, d) => 'نضع $f(x) = ' + d.C.ft + '$ مكان $x$ في $g(x) = ' + d.C.gt + '$ فنحصل على $' + d.C.gf + '$.' },
      { q: 'هل التركيب تبديلي؟', k: ['تبديلي', 'ترتيب'], a: () => 'لا بشكل عام؛ في نشاط 3: $14 + 10x \\ne 1 + 10x$ لكل $x$.' }
    ]
  });

  /* ======================= 2-8 الاقتران النظير (العكسي) ======================= */
  const INV = {
    lin: { name: 'مثال ص 60: ق(س) = 2س + 3', f: (x) => 2 * x + 3, inv: (x) => (x - 3) / 2, ft: '2x + 3', it: '\\frac{x - 3}{2}' },
    ex3a: { name: 'تمرين 3أ: ق(س) = 3س − 1', f: (x) => 3 * x - 1, inv: (x) => (x + 1) / 3, ft: '3x - 1', it: '\\frac{x + 1}{3}' },
    cube1: { name: 'نشاط 5: ق(س) = س³ + 1', f: (x) => x * x * x + 1, inv: (x) => Math.cbrt(x - 1), ft: 'x^3 + 1', it: '\\sqrt[3]{x - 1}' },
    cube: { name: 'تمرين 4: ق(س) = س³', f: (x) => x * x * x, inv: Math.cbrt, ft: 'x^3', it: '\\sqrt[3]{x}' },
    sq: { name: 'أفكر وأناقش: ق(س) = س²', f: (x) => x * x, inv: null, ft: 'x^2', it: '' },
    act3: { name: 'نشاط 3: {(1، 3)، (2، 15)، (3، 12)، (4، 20)}', pairs: [[1, 3], [2, 15], [3, 12], [4, 20]] },
    act4: { name: 'نشاط 4: {(1، 1)، (2، 4)، (3، 9)، (4، 16)}', pairs: [[1, 1], [2, 4], [3, 9], [4, 16]] },
    ex1b: { name: 'تمرين 1ب: {(-1، 1)، (3، 2)، (4، 2)، (5، 3)}', pairs: [[-1, 1], [3, 2], [4, 2], [5, 3]] }
  };
  G.reg({
    id: 'inverse-function', unit: U, order: 10, lesson: '2-8', lessonTitle: 'الاقتران النظير (العكسي)', page: 59,
    titleAr: 'الاقتران النظير (العكسي) والانعكاس حول ص = س', titleEn: 'Inverse Functions', tags: 'نظير عكسي ق-1 تناظر انعكاس محايد عكس الاسهم',
    formula: '(f \\circ f^{-1})(x) = x,\\qquad (f^{-1} \\circ f)(x) = x',
    book: 'إذا كان ق تناظراً فله اقتران نظير ق⁻¹ ؛ (ق ∘ ق⁻¹)(س) = س و (ق⁻¹ ∘ ق)(س) = س',
    summary: 'الاقتران النظير يعكس اتجاه الأسهم: إذا كان $f(a) = b$ فإن $f^{-1}(b) = a$. يوجد النظير فقط إذا كان الاقتران تناظراً (واحداً لواحد وشاملاً). نجد قاعدته من $f(f^{-1}(x)) = x$، وتمثيله انعكاس تمثيل $f$ حول المستقيم $y = x$.',
    vars: [['f', 'الاقتران (ق)', 'من أمثلة الكتاب'], ['f^{-1}', 'الاقتران النظير', 'يوجد إذا كان $f$ تناظراً'], ['x', 'قيمة نعوّضها', 'من $-3$ إلى $5$']],
    params: [
      { key: 'pre', label: 'f', type: 'select', value: 'lin', options: G.opts(Object.keys(INV).map((k) => [k, INV[k].name])) },
      { key: 'x', label: 'x', min: -3, max: 5, step: 0.5, value: 2 }
    ],
    plot: { view: { xmin: -6, xmax: 22, ymin: -6, ymax: 22 } },
    compute(p) {
      const F = INV[p.pre];
      if (F.pairs) { const t = fnType({ A: F.pairs.map((q) => q[0]), B: G.uniq(F.pairs.map((q) => q[1])), pairs: F.pairs }); return { F: F, set: true, ok: t.one, inv: F.pairs.map((q) => [q[1], q[0]]) }; }
      const y = F.f(p.x); return { F: F, set: false, ok: !!F.inv, y: y, back: F.inv ? F.inv(y) : null };
    },
    draw(P, p, d) {
      const c = P.colors(); const F = d.F;
      P.fn((x) => x, { color: c.muted, width: 1.5, dash: [6, 6] });
      if (d.set) {
        F.pairs.forEach((q) => P.point(q[0], q[1], { color: c.c1, r: 5 }));
        d.inv.forEach((q) => P.point(q[0], q[1], { color: d.ok ? c.c3 : c.c2, r: 5 }));
        F.pairs.forEach((q) => P.segment(q[0], q[1], q[1], q[0], { color: c.grid, width: 1, dash: [3, 4] }));
        return;
      }
      P.fn(F.f, { color: c.c1, width: 3 });
      P.parametric((t) => F.f(t), (t) => t, -8, 22, { color: d.ok ? c.c3 : c.c2, width: 3, dash: d.ok ? [] : [6, 5] }, 400);
      P.point(p.x, d.y, { color: c.c1, r: 6, label: '(' + M.fmt(p.x) + ' ، ' + M.fmt(d.y, 2) + ')' });
      P.point(d.y, p.x, { color: d.ok ? c.c3 : c.c2, r: 6, label: '(' + M.fmt(d.y, 2) + ' ، ' + M.fmt(p.x) + ')' });
      P.segment(p.x, d.y, d.y, p.x, { color: c.c4, width: 1.5, dash: [4, 4] });
    },
    live(p, d) {
      if (d.set) return d.ok ? 'f^{-1} = \\{' + d.inv.map((q) => '(' + q[0] + ', ' + q[1] + ')').join(', ') + '\\}' : '\\text{لا يوجد اقتران نظير}';
      return d.ok ? 'f(x) = ' + d.F.ft + ' \\Rightarrow f^{-1}(x) = ' + d.F.it : 'f(x) = ' + d.F.ft + '\\ \\text{ليس واحداً لواحد على ح}';
    },
    results(p, d) {
      if (d.set) return [['ق', G.pairs(d.F.pairs), false], ['هل ق تناظر (على مداه)؟', d.ok ? 'نعم' : 'لا: عنصران لهما الصورة نفسها', false, d.ok ? 'pos' : 'neg'], ['ق⁻¹', d.ok ? G.pairs(d.inv) : 'غير موجود؛ عكس الأسهم لا يعطي اقتراناً', false]];
      const r = [['ق(' + M.fmt(p.x) + ')', M.fmt(d.y, 3), false], ['قاعدة ق⁻¹', d.ok ? 'f^{-1}(x) = ' + d.F.it : '\\text{غير موجودة على ح}']];
      if (d.ok) r.push(['ق⁻¹(ق(' + M.fmt(p.x) + '))', 'f^{-1}(' + M.fmt(d.y, 3) + ') = ' + M.fmt(d.back, 3)], ['التحقق', '(ق⁻¹ ∘ ق)(س) = س ✔', false, 'pos']);
      else r.push(['السبب', 'ق(' + M.fmt(p.x) + ') = ق(' + M.fmt(-p.x) + ') = ' + M.fmt(d.y, 3), false, 'neg']);
      return r;
    },
    steps(p, d) {
      if (d.set) return ['نعكس كل زوج مرتب: (أ ، ب) ← (ب ، أ).', d.ok ? 'لا يتكرر مسقط أول في الأزواج الجديدة، فهي اقتران.' : 'يتكرر مسقط أول بعد العكس، فلا يوجد نظير.'];
      if (!d.ok) return ['$f(x) = x^2$: لكل عدد موجب صورتان متساويتان مثل $f(2) = f(-2) = 4$.', 'إذن ليس واحداً لواحد، ولا يوجد له نظير على ح؛ لاحظ أن انعكاس منحناه حول $y = x$ ليس اقتراناً.'];
      return ['نكتب $f(f^{-1}(x)) = x$.', 'نعوّض قاعدة $f$ ونحلّ لـ $f^{-1}(x)$: $f^{-1}(x) = ' + d.F.it + '$.', 'نتحقق: $f^{-1}(' + M.fmt(d.y, 3) + ') = ' + M.fmt(d.back, 3) + '$ وهو $x$ نفسه.'];
    },
    explain(a, b, da, db) { return a.pre !== b.pre ? [db.ok ? 'منحنى النظير (الأخضر) انعكاس منحنى ق حول المستقيم ص = س.' : 'الانعكاس حول ص = س لا يمثّل اقتراناً، فلا يوجد نظير.'] : []; },
    learn: [
      '**نشاط 1 ص 59:** المدن والمعالم السياحية: من أ إلى ب اقتران، وعكس الأسهم يعطي اقتراناً أيضاً لأن لكل معلم مدينة واحدة.',
      '**أتعلم ص 59:** إذا كان ق تناظراً فإنه يوجد له اقتران نظير نرمز له بالرمز ق⁻¹.',
      '**أتعلم ص 60:** $(f \\circ f^{-1})(x) = x$ و $(f^{-1} \\circ f)(x) = x$ (الاقتران المحايد).',
      '**مثال ص 60:** $f(x) = 2x + 3$: $2f^{-1}(x) + 3 = x$ ومنه $f^{-1}(x) = \\frac{x - 3}{2}$.',
      '**أفكر وأناقش ص 61:** هل يوجد اقتران نظير للاقتران $f(x) = x^2$؟'
    ],
    challenges: [
      { q: 'جد $f^{-1}(12)$ في نشاط 3.', hint: 'الزوج $(3, 12)$ يصبح $(12, 3)$.', init: { pre: 'lin' }, check: (p, d) => p.pre === 'act3', why: () => '$f^{-1}(12) = 3$.' },
      { q: 'اختر اقتراناً ليس له نظير.', hint: 'تمرين 1ب أو $x^2$.', init: { pre: 'lin' }, check: (p, d) => !d.ok },
      { q: 'في نشاط 5 خذ $x = 2$ وتحقق أن $f^{-1}(f(2)) = 2$.', hint: '$f(2) = 9$ و $\\sqrt[3]{9 - 1} = 2$.', init: { pre: 'lin', x: 0 }, check: (p) => p.pre === 'cube1' && p.x === 2 }
    ],
    tutor: [
      { q: 'لماذا لا يوجد نظير لـ ق(س) = س²؟', k: ['س²', 'مربع', 'نظير'], a: () => 'لأن $f(2) = f(-2) = 4$: عند عكس الأسهم يرتبط 4 بعنصرين، فلا يكون اقتراناً.' },
      { q: 'ما علاقة منحنى ق بمنحنى ق⁻¹؟', k: ['منحنى', 'انعكاس'], a: () => 'كل نقطة $(a, b)$ على منحنى $f$ تقابلها $(b, a)$ على منحنى $f^{-1}$: انعكاس حول المستقيم $y = x$.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
