/* الفيزياء — الوحدة الأولى، الفصل الرابع: قوانين نيوتن (ص 44–60) */
(function (root) {
  'use strict';
  const ML = root.ML; const M = ML.math; const P = ML.phys; const D = ML.pdraw;
  const S = 'g10-physics'; const U = 4; const q = P.q;
  const f2 = (x, n) => M.fmt(x, n === undefined ? 2 : n);

  /* ======================= 4-3 القانون الثاني لنيوتن — العربة ======================= */
  const LEN = 40; // طول المضمار بالأمتار
  ML.register({
    subject: S, id: 'newton2', unit: U, order: 1, lesson: '4-3', lessonTitle: 'القانون الثاني لنيوتن', page: 51,
    titleAr: 'القانون الثاني لنيوتن: عربة على سطح', titleEn: "Newton's Second Law: Cart on a Surface", tags: 'قانون نيوتن الثاني قوه كتله تسارع احتكاك محصله F=ma',
    formula: '\\sum F = m\\,a \\quad\\Rightarrow\\quad a = \\frac{F - f}{m}',
    book: 'ق = ك × ت ؛ محصلة قوتين متعاكستين = حاصل طرحهما (ص 52–53)',
    summary: 'إذا أثرت محصلة قوى خارجية على جسم فإنها تكسبه تسارعاً يتناسب طردياً مع مقدارها وعكسياً مع كتلته، ويكون باتجاهها. قوة الاحتكاك تعاكس الحركة دائماً فتقلل المحصلة.',
    vars: [['F', 'القوة المؤثرة (الدفع)', '\\mathrm{N}', '0 – 100'], ['m', 'كتلة العربة', '\\mathrm{kg}', '0.5 – 50 (> 0)'], ['f', 'قوة الاحتكاك (مقدار)', '\\mathrm{N}', '0 – 60'], ['a', 'التسارع', '\\mathrm{m/s^2}', 'يُحسب: ق محصلة ÷ ك'], ['v,\\ x,\\ t', 'السرعة والمسافة والزمن', '\\mathrm{m/s,\\ m,\\ s}', 'تُقاس أثناء الحركة']],
    assumptions: ['السطح أفقي، والعربة تبدأ من السكون.', 'قوة الاحتكاك ثابتة المقدار وتعاكس اتجاه الحركة؛ إذا كانت القوة المؤثرة لا تتجاوز الاحتكاك تبقى العربة ساكنة (ص 46، س3 ص 57).', 'بإهمال مقاومة الهواء.'],
    params: [
      { key: 'F', label: 'F\\ (\\mathrm{N})', min: 0, max: 100, step: 1, value: 20, desc: 'القوة' },
      { key: 'm', label: 'm\\ (\\mathrm{kg})', min: 0.5, max: 50, step: 0.5, value: 4, desc: 'الكتلة' },
      { key: 'f', label: 'f\\ (\\mathrm{N})', min: 0, max: 60, step: 1, value: 0, desc: 'الاحتكاك' },
      { key: 'g', label: 'g\\ (\\mathrm{m/s^2})', min: 1.6, max: 9.8, step: 0.1, value: 9.8, desc: 'للوزن فقط (القمر ≈ 1.6)' }
    ],
    resetOn: ['m'],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0, x: 0, v: 0, series: [] }),
    tick(st, p, d, dt) {
      const a = P.cartAccel(p.F, p.f, p.m, st.v);
      let v = st.v + a * dt;
      if (st.v > 0 && v < 0 && Math.abs(p.F) <= p.f) v = 0; // الاحتكاك يوقف العربة ولا يعكس حركتها
      st.x += (st.v + v) / 2 * dt; st.v = v; st.t += dt; st.a = a;
      D.pushSeries(st, st.t, [st.x, st.v, a]);
    },
    isDone: (st) => st.x >= LEN || st.t >= 60,
    custom: true, canvasHint: 'اضغط «تشغيل» لتتحرك العربة. يمكنك تغيير القوة أو الاحتكاك أثناء الحركة.',
    graphModes: ['القوة – التسارع', 'الكتلة – التسارع', 'المسافة – الزمن', 'السرعة – الزمن'],
    compute(p) {
      const net = Math.max(0, p.F - p.f); const moves = p.F > p.f;
      const a = moves ? P.newton2(p.F - p.f, p.m) : 0;
      return { net: net, a: a, moves: moves, W: P.weight(p.m, p.g), N: P.weight(p.m, p.g) };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const st = d.st || { t: 0, x: 0, v: 0 }; const y = H * 0.62; const L = Math.min(120, W * 0.18), R = W - 30;
      const X = (x) => L + (x / LEN) * (R - L - 70);
      // السطح والاحتكاك
      ctx.fillStyle = p.f > 0 ? c.c4 : c.grid; ctx.globalAlpha = p.f > 0 ? 0.25 + 0.5 * p.f / 60 : 0.6; ctx.fillRect(L, y, R - L, 14); ctx.globalAlpha = 1;
      if (p.f > 0) { ctx.strokeStyle = c.c4; ctx.lineWidth = 1; for (let i = L; i < R; i += 9) { ctx.beginPath(); ctx.moveTo(i, y + 14); ctx.lineTo(i + 6, y); ctx.stroke(); } }
      for (let m = 0; m <= LEN; m += 5) { D.txt(ctx, m + ' م', X(m) + 35, y + 26, { color: c.muted, size: 10 }); }
      // العربة (حجمها يتناسب مع الكتلة)
      const s = 0.75 + Math.min(1, p.m / 50) * 0.6; const cw = 70 * s, ch = 34 * s; const cx = X(Math.min(st.x, LEN)) + 35;
      ctx.fillStyle = c.c1; D.rr(ctx, cx - cw / 2, y - ch - 12, cw, ch, 6); ctx.fill();
      ctx.fillStyle = c.axis; [-cw / 3, cw / 3].forEach((dx) => { ctx.beginPath(); ctx.arc(cx + dx, y - 7, 7, 0, 7); ctx.fill(); });
      D.txt(ctx, p.m + ' kg', cx, y - ch / 2 - 12, { color: '#fff', size: 12, w: '700' });
      // أسهم القوى
      const sc = Math.min(1.6, (L + 10) / 110);
      if (p.F > 0) { D.arrow(ctx, cx - cw / 2 - 6 - p.F * sc, y - ch / 2 - 12, cx - cw / 2 - 4, y - ch / 2 - 12, c.c3, 4); D.txt(ctx, 'F = ' + p.F + ' N', cx - cw / 2 - 10 - p.F * sc / 2, y - ch / 2 - 30, { color: c.c3, size: 12 }); }
      if (p.f > 0) { const fr = d.moves || st.v > 0 ? p.f : Math.min(p.f, p.F); if (fr > 0) { D.arrow(ctx, cx, y - 2, cx - fr * sc, y - 2, c.c2, 3); D.txt(ctx, 'f = ' + f2(fr) + ' N', cx - fr * sc / 2, y + 40, { color: c.c2, size: 12 }); } }
      D.arrow(ctx, cx + 6, y - ch - 12, cx + 6, y - ch - 12 - 34, c.c5, 2); D.txt(ctx, 'N', cx + 16, y - ch - 40, { color: c.c5, size: 12 });
      // لوحة القراءات
      const vals = [['F', p.F + ' N'], ['m', p.m + ' kg'], ['a', f2(st.t > 0 && st.a !== undefined ? st.a : d.a, 3) + ' m/s²'], ['v', f2(st.v, 2) + ' m/s'], ['x', f2(Math.min(st.x, LEN), 2) + ' m'], ['t', f2(st.t, 2) + ' s']];
      const bw = Math.min(110, (W - 40) / 6);
      vals.forEach((v, i) => { const bx = W / 2 + (i - 2.5) * bw; ctx.fillStyle = c.grid; ctx.globalAlpha = 0.6; D.rr(ctx, bx - bw / 2 + 3, 12, bw - 6, 46, 8); ctx.fill(); ctx.globalAlpha = 1; D.txt(ctx, v[0], bx, 26, { color: c.muted, size: 12 }); D.txt(ctx, v[1], bx, 44, { color: c.text, size: 13, w: '700' }); });
      if (!d.moves && p.F > 0) D.txt(ctx, 'القوة لا تتغلب على الاحتكاك: المحصلة صفر والعربة لا تتحرك', W / 2, H - 22, { color: c.c2, size: 13, w: '700' });
    },
    graph(p, d, gi) {
      const st = d.st || { series: [] }; const ser = st.series || [];
      if (gi === 0) return { view: { xmin: 0, xmax: 100, ymin: 0, ymax: D.niceMax(100 / p.m, 2) }, xLabel: 'F (N)', yLabel: 'a (m/s²)', caption: 'التسارع يتناسب طردياً مع القوة (لكتلة ثابتة ' + p.m + ' كغم)؛ الميل = $1/m$. الاحتكاك يزيح الخط: لا حركة قبل $F = f$.', draw(G) { const c = G.colors(); G.fn((F) => (F > p.f ? (F - p.f) / p.m : 0), { color: c.c1, width: 3, domain: [0, 100] }); G.point(p.F, d.a, { color: c.c2, label: '(' + p.F + ', ' + f2(d.a) + ')' }); } };
      if (gi === 1) return { view: { xmin: 0, xmax: 50, ymin: 0, ymax: D.niceMax(d.net / 0.5 + 1, 2) }, xLabel: 'm (kg)', yLabel: 'a (m/s²)', caption: 'التسارع يتناسب عكسياً مع الكتلة (لمحصلة قوى ثابتة ' + d.net + ' N): ضاعف الكتلة ينخفض التسارع للنصف.', draw(G) { const c = G.colors(); if (d.net > 0) G.fn((m) => d.net / m, { color: c.c5, width: 3, domain: [0.5, 50] }); G.point(p.m, d.a, { color: c.c2, label: '(' + p.m + ', ' + f2(d.a) + ')' }); } };
      const T = Math.max(2, st.t || 0);
      if (gi === 2) return { view: { xmin: 0, xmax: T, ymin: 0, ymax: Math.max(5, (st.x || 0) * 1.1) }, xLabel: 't (s)', yLabel: 'x (m)', caption: 'منحنى قطع مكافئ: المسافة تتناسب مع مربع الزمن عند تسارع ثابت.', draw(G) { const c = G.colors(); D.series(G, ser.map((r) => [r[0], r[1]]), c.c1, 3); } };
      return { view: { xmin: 0, xmax: T, ymin: 0, ymax: Math.max(2, (st.v || 0) * 1.15) }, xLabel: 't (s)', yLabel: 'v (m/s)', caption: 'خط مستقيم ميله التسارع $a = ' + f2(d.a, 3) + '$ م/ث².', draw(G) { const c = G.colors(); D.series(G, ser.map((r) => [r[0], r[2]]), c.c3, 3); } };
    },
    live(p, d) { return 'a = \\frac{F - f}{m} = \\frac{' + p.F + ' - ' + p.f + '}{' + p.m + '} = ' + (d.moves ? f2(d.a, 3) : '0') + '\\ \\mathrm{m/s^2}'; },
    results(p, d) {
      const st = d.st || { t: 0, x: 0, v: 0 };
      return [
        ['محصلة القوى', q(d.net, 'N')], ['التسارع a', q(d.a, 'm/s^2'), true, d.moves ? '' : 'neg'],
        ['السرعة الآن v', q(st.v, 'm/s')], ['المسافة x', q(Math.min(st.x, LEN), 'm')], ['الزمن t', q(st.t, 's')],
        ['الوزن W = mg', q(d.W, 'N') + '\\ (= N\\ \\text{على السطح الأفقي})'],
        ['تحليل الأبعاد', '\\frac{\\mathrm{N}}{\\mathrm{kg}} = \\frac{\\mathrm{kg\\,m/s^2}}{\\mathrm{kg}} = \\mathrm{m/s^2}']
      ];
    },
    steps(p, d) {
      const s = ['محصلة القوى الأفقية (قوتان متعاكستان): $F_{net} = F - f = ' + p.F + ' - ' + p.f + ' = ' + (p.F - p.f) + '$ N.'];
      if (!d.moves) s.push('$F \\le f$: الاحتكاك يمنع الحركة، فالمحصلة الفعلية صفر والعربة ساكنة (القانون الأول).');
      else s.push('$a = F_{net}/m = ' + d.net + ' / ' + p.m + ' = ' + f2(d.a, 3) + '$ م/ث².', 'بعد $t$ ثانية: $v = at$ و $x = \\tfrac12 a t^2$.');
      return s;
    },
    explain(a, b, da, db) {
      const o = [];
      if (a.F !== b.F) o.push((b.F > a.F ? 'زادت القوة' : 'قلّت القوة') + ' من ' + a.F + ' إلى ' + b.F + ' N فصار التسارع $' + f2(db.a, 3) + '$ م/ث². **لماذا؟** التسارع يتناسب طردياً مع محصلة القوة: $a = F_{net}/m$' + (db.moves ? '' : '، والقوة الآن لا تتغلب على الاحتكاك') + '.');
      if (a.m !== b.m) o.push((b.m > a.m ? 'زادت الكتلة' : 'قلّت الكتلة') + ' إلى ' + b.m + ' كغم فصار التسارع $' + f2(db.a, 3) + '$ م/ث². **لماذا؟** الكتلة مقياس القصور الذاتي؛ الجسم الأثقل يمانع تغيير حركته أكثر، فالقوة نفسها تعطيه تسارعاً أقل.');
      if (a.f !== b.f) o.push('تغيّر الاحتكاك إلى ' + b.f + ' N: المحصلة صارت $' + db.net + '$ N. الاحتكاك يعاكس الحركة فيطرح من قوة الدفع.');
      if (a.g !== b.g) o.push('تغيّرت الجاذبية فتغيّر الوزن إلى $' + f2(db.W) + '$ N، **لكن الكتلة والتسارع الأفقي لم يتغيرا** (الكتلة لا تتغير على القمر).');
      return o;
    },
    onDone(st, p, d) { return ['وصلت العربة إلى نهاية المضمار (' + LEN + ' م) بعد $' + f2(st.t) + '$ ث بسرعة $' + f2(st.v) + '$ م/ث. تحقق: $v^2 = 2ax$ ← $' + f2(st.v * st.v) + ' \\approx ' + f2(2 * d.a * LEN) + '$.']; },
    learn: [
      '**القانون الثاني لنيوتن (ص 52):** إذا أثرت محصلة قوى خارجية مقدارها $F$ على جسم كتلته $m$ فإنها تكسبه تسارعاً $a$ يتناسب طردياً مع مقدارها ويكون باتجاهها: $F = m a$ (القوة بالنيوتن، الكتلة بالكغم، التسارع بالم/ث²).',
      '**الكتلة والقصور (ص 52):** كلما زادت كتلة الجسم زادت القوة اللازمة لتحريكه؛ تسمى «كتلة القصور».',
      '**مثال (3) ص 52:** طاولة 20 كغم يسحبها شخصان بقوتين 20 و 30 N بالاتجاه نفسه: المحصلة 50 N والتسارع 2.5 م/ث².',
      '**قوة الاحتكاك (ص 46):** الممانعة التي يبديها الجسم لتغيير حالته، وتكون عكس اتجاه الحركة دائماً؛ تنشأ من تداخل النتوءات على سطحي الجسمين.',
      '**الوزن (ص 46):** $W = m g$، الكتلة لا تتغير على القمر لكن الوزن يصبح سدسه (ص 53).'
    ],
    challenges: [
      { q: 'اجعل العربة تتحرك بتسارع 5 م/ث² تماماً.', hint: '$a = (F - f)/m = 5$؛ مثلاً $F = 20$، $m = 4$، $f = 0$.', init: { F: 10, m: 10, f: 0 }, check: (p, d) => d.moves && M.near(d.a, 5, 1e-9) },
      { q: 'مثال (3) ص 52: طاولة 20 كغم تُسحب بقوتين 20 N و 30 N بالاتجاه نفسه. اضبط القوة المحصلة والكتلة.', hint: '$F = 50$، $m = 20$، $f = 0$ ← $a = 2.5$.', init: { F: 10, m: 4, f: 0 }, check: (p, d) => p.F === 50 && p.m === 20 && p.f === 0, why: () => 'التسارع 2.5 م/ث² باتجاه الغرب.' },
      { q: 'س3 ص 57: جسم يتحرك بسرعة ثابتة تحت قوة 20 N على سطح خشن. ما قوة الاحتكاك؟ اجعل التسارع صفراً والقوة 20 N.', hint: 'السرعة الثابتة تعني المحصلة صفر: $f = F$.', init: { F: 10, m: 5, f: 0 }, check: (p, d) => p.F === 20 && p.f === 20, why: () => 'قوة الاحتكاك 20 N (معاكسة للحركة).' },
      { q: 'ضاعف الكتلة مع تثبيت القوة: اجعل التسارع نصف ما كان عند $F = 40, m = 4$.', hint: 'التسارع الأصلي 10 م/ث²؛ اجعل $m = 8$.', init: { F: 40, m: 4, f: 0 }, check: (p, d) => p.F === 40 && p.f === 0 && M.near(d.a, 5) }
    ],
    tutor: [
      { q: 'لماذا قل التسارع؟', k: ['قل', 'نقص', 'انخفض', 'لماذا قل'], a: (p, d) => 'التسارع الآن $a = \\frac{F - f}{m} = \\frac{' + p.F + ' - ' + p.f + '}{' + p.m + '} = ' + f2(d.a, 3) + '$ م/ث². يقل التسارع إذا زادت الكتلة (قصور أكبر) أو قلّت القوة أو زاد الاحتكاك؛ لأن التسارع = المحصلة ÷ الكتلة.' },
      { q: 'ما الذي يحدث لو ضاعفت القوة؟', k: ['ضاعفت', 'القوه', 'ضعف'], a: (p, d) => { const a2 = 2 * p.F > p.f ? (2 * p.F - p.f) / p.m : 0; return 'بمضاعفة القوة إلى ' + 2 * p.F + ' N يصبح التسارع $' + f2(a2, 3) + '$ م/ث² بدلاً من $' + f2(d.a, 3) + '$. ' + (p.f === 0 ? 'أي يتضاعف تماماً لأن $a \\propto F$.' : 'لا يتضاعف تماماً بسبب الاحتكاك: المحصلة $2F - f$ وليس $2(F - f)$.'); } },
      { q: 'اشرح القانون بطريقة أبسط.', k: ['ابسط', 'اشرح', 'بسط'], a: () => 'كلما دفعت أقوى تسارعت العربة أكثر، وكلما كانت أثقل تسارعت أقل. بالأرقام: التسارع = (قوة الدفع − الاحتكاك) ÷ الكتلة.' },
      { q: 'لماذا لا تتحرك العربة؟', k: ['لا تتحرك', 'ساكنه', 'متوقفه'], a: (p, d) => d.moves ? 'العربة تتحرك الآن (اضغط تشغيل).' : (p.F === 0 ? 'لا توجد قوة مؤثرة.' : 'لأن القوة ' + p.F + ' N لا تتجاوز الاحتكاك ' + p.f + ' N، فالمحصلة صفر — والجسم الساكن يبقى ساكناً (القانون الأول).') }
    ]
  });

  /* ======================= 4-2 القانون الأول لنيوتن — القصور الذاتي ======================= */
  ML.register({
    subject: S, id: 'newton1', unit: U, order: 2, lesson: '4-2', lessonTitle: 'القانون الأول لنيوتن', page: 49,
    titleAr: 'القانون الأول لنيوتن (القصور الذاتي)', titleEn: "Newton's First Law (Inertia)", tags: 'قانون نيوتن الاول قصور ذاتي حزام الامان',
    formula: '\\sum \\vec F = 0 \\iff \\vec v = \\text{const}',
    book: 'الجسم الساكن يبقى ساكناً والمتحرك بسرعة ثابتة وفي خط مستقيم يبقى كذلك ما لم تؤثر عليه محصلة قوى خارجية',
    summary: 'عندما تتوقف السيارة فجأة يستمر الراكب غير المربوط بالحركة إلى الأمام بالسرعة نفسها، لأنه لا توجد قوة تغيّر حالته الحركية — هذا هو القصور الذاتي. حزام الأمان يؤثر عليه بالقوة اللازمة لإيقافه مع السيارة.',
    vars: [['v_0', 'سرعة السيارة قبل الكبح', '\\mathrm{m/s}', '5 – 30'], ['a_b', 'مقدار تباطؤ السيارة أثناء الكبح', '\\mathrm{m/s^2}', '2 – 10'], ['m', 'كتلة الراكب', '\\mathrm{kg}', '20 – 100']],
    assumptions: ['بإهمال الاحتكاك بين الراكب والمقعد (الحالة المثالية لتوضيح القصور).', 'المسافة بين الراكب ولوحة القيادة 0.6 م.'],
    params: [
      { key: 'v0', label: 'v_0\\ (\\mathrm{m/s})', min: 5, max: 30, step: 1, value: 15 },
      { key: 'ab', label: 'a_b\\ (\\mathrm{m/s^2})', min: 2, max: 10, step: 0.5, value: 6 },
      { key: 'm', label: 'm\\ (\\mathrm{kg})', min: 20, max: 100, step: 5, value: 60 },
      { key: 'belt', label: '\\text{seat belt}', type: 'toggle', value: false, on: 'حزام الأمان مربوط', off: 'بدون حزام أمان' }
    ],
    resetOn: ['v0', 'ab', 'm', 'belt'],
    play: { mode: 'time', speed: 1 },
    initState: (p) => ({ t: 0, xc: 0, vc: p.v0, xp: 0, vp: p.v0, hit: false, series: [] }),
    tick(st, p, d, dt) {
      st.t += dt;
      st.vc = Math.max(0, st.vc - p.ab * dt); st.xc += st.vc * dt;
      if (p.belt) { st.vp = st.vc; st.xp = st.xc; }
      else if (!st.hit) { st.xp += st.vp * dt; if (st.xp - st.xc >= 0.6) { st.hit = true; st.hitT = st.t; st.hitV = st.vp - st.vc; st.vp = st.vc; st.xp = st.xc + 0.6; } }
      else { st.vp = st.vc; st.xp = st.xc + 0.6; }
      D.pushSeries(st, st.t, [st.vc, st.vp]);
    },
    isDone: (st) => st.vc <= 0 && st.t > 0.05,
    custom: true, canvasHint: 'شغّل التجربة: السيارة تكبح؛ لاحظ حركة الراكب بالنسبة للسيارة.',
    compute(p) { const tStop = p.v0 / p.ab, dStop = p.v0 * p.v0 / (2 * p.ab); const Fbelt = p.m * p.ab; return { tStop: tStop, dStop: dStop, Fbelt: Fbelt }; },
    drawCustom(ctx, W, H, p, d, c) {
      const st = d.st || { t: 0, xc: 0, xp: 0, vc: p.v0, vp: p.v0 };
      const y = H * 0.68; ctx.fillStyle = c.grid; ctx.fillRect(0, y, W, 10);
      const scale = (W - 260) / Math.max(10, d.dStop + 1); const X = 60 + st.xc * scale;
      // السيارة
      ctx.fillStyle = c.c1; D.rr(ctx, X, y - 90, 200, 70, 14); ctx.fill();
      ctx.fillStyle = c.bg; ctx.globalAlpha = 0.6; D.rr(ctx, X + 110, y - 84, 70, 34, 8); ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = c.axis; [40, 160].forEach((dx) => { ctx.beginPath(); ctx.arc(X + dx, y - 14, 16, 0, 7); ctx.fill(); });
      ctx.fillStyle = c.muted; ctx.fillRect(X + 178, y - 82, 8, 50); // لوحة القيادة
      // الراكب
      const rel = (st.xp - st.xc) * 120; const px = X + 100 + Math.min(rel, 72);
      ctx.fillStyle = c.c4; ctx.beginPath(); ctx.arc(px, y - 76, 11, 0, 7); ctx.fill(); ctx.fillRect(px - 8, y - 64, 16, 30);
      if (p.belt) { ctx.strokeStyle = c.c3; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(px - 10, y - 66); ctx.lineTo(px + 10, y - 38); ctx.stroke(); }
      D.txt(ctx, 'السيارة: ' + f2(st.vc) + ' م/ث', X + 100, y - 104, { color: c.c1, size: 13, w: '700' });
      D.txt(ctx, 'الراكب: ' + f2(st.vp) + ' م/ث', W / 2, 26, { color: c.c4, size: 15, w: '700' });
      if (st.hit) D.txt(ctx, 'اصطدم الراكب بلوحة القيادة بسرعة نسبية ' + f2(st.hitV) + ' م/ث!', W / 2, H - 20, { color: c.c2, size: 14, w: '700' });
      else if (p.belt && st.t > 0) D.txt(ctx, 'الحزام يؤثر على الراكب بقوة ' + f2(d.Fbelt) + ' N فيتباطأ مع السيارة', W / 2, H - 20, { color: c.c3, size: 14, w: '700' });
    },
    graph(p, d) {
      const st = d.st || { series: [] }; const ser = st.series || [];
      return { view: { xmin: 0, xmax: Math.max(d.tStop * 1.1, 0.5), ymin: 0, ymax: p.v0 * 1.15 }, xLabel: 't (s)', yLabel: 'v (m/s)', caption: 'الأزرق: سرعة السيارة. البرتقالي: سرعة الراكب — ' + (p.belt ? 'تتطابقان لأن الحزام يؤثر بقوة على الراكب.' : 'تبقى ثابتة (لا قوة عليه) حتى يصطدم.'), draw(G) { const c = G.colors(); D.series(G, ser.map((r) => [r[0], r[1]]), c.c1, 3); D.series(G, ser.map((r) => [r[0], r[2]]), c.c4, 3); } };
    },
    live(p, d) { return '\\sum F_{\\text{passenger}} = ' + (p.belt ? 'm a_b = ' + f2(d.Fbelt) + '\\ \\mathrm{N}' : '0 \\Rightarrow v = \\text{const} = ' + p.v0 + '\\ \\mathrm{m/s}'); },
    results(p, d) {
      const st = d.st || {};
      const r = [['زمن توقف السيارة', q(d.tStop, 's')], ['مسافة توقف السيارة', q(d.dStop, 'm')], ['القوة التي يؤثر بها الحزام', p.belt ? q(d.Fbelt, 'N') : '\\text{لا يوجد حزام}']];
      if (st.hit) r.push(['سرعة اصطدام الراكب النسبية', q(st.hitV, 'm/s'), true, 'neg']);
      return r;
    },
    steps(p, d) { return ['السيارة تتباطأ بمعدل $' + p.ab + '$ م/ث² فتتوقف بعد $t = v_0/a_b = ' + f2(d.tStop) + '$ ث.', p.belt ? 'الحزام يؤثر على الراكب بقوة $F = m a_b = ' + p.m + ' \\times ' + p.ab + ' = ' + f2(d.Fbelt) + '$ N (القانون الثاني).' : 'لا توجد قوة أفقية على الراكب ← يبقى بسرعة $' + p.v0 + '$ م/ث (القانون الأول) حتى يلمس لوحة القيادة.']; },
    explain(a, b) { if (a.belt !== b.belt) return [b.belt ? 'ربطت الحزام: صار هناك قوة خارجية على الراكب تغيّر حالته الحركية فيتوقف مع السيارة.' : 'فككت الحزام: لا توجد قوة تغيّر حركة الراكب، فيستمر بالسرعة نفسها بسبب القصور الذاتي.']; if (a.m !== b.m) return ['زادت كتلة الراكب ← قصوره الذاتي أكبر، ويحتاج الحزام قوة أكبر لإيقافه: $' + f2(b.m * b.ab) + '$ N.']; return []; },
    learn: ['**القانون الأول (ص 50):** الجسم الساكن يبقى ساكناً، والجسم المتحرك بسرعة ثابتة وفي خط مستقيم يبقى كذلك ما لم تؤثر عليه محصلة قوى خارجية تعمل على تغيير مقدار سرعته أو اتجاهه أو كليهما.', '**المشاهدة (2) ص 49:** عندما تتوقف السيارة فجأة يندفع الركاب الذين لا يربطون حزام الأمان نحو الأمام.', '**القصور الذاتي (ص 50):** الممانعة التي يبديها الجسم لتغيير حالته الحركية. نشاط (9): سحب الورقة بسرعة من تحت قطعة النقد فتسقط في الكأس.'],
    challenges: [
      { q: 'اجعل الراكب يتوقف بأمان مع السيارة.', hint: 'اربط حزام الأمان.', init: { belt: false }, check: (p) => p.belt },
      { q: 'مع الحزام، اجعل القوة التي يؤثر بها الحزام 600 N تماماً.', hint: '$F = m a_b$، مثلاً $m = 60$ و $a_b = 10$.', init: { belt: true, m: 40, ab: 4 }, check: (p, d) => p.belt && M.near(d.Fbelt, 600) }
    ],
    tutor: [
      { q: 'لماذا يندفع الراكب إلى الأمام؟', k: ['يندفع', 'الامام', 'لماذا'], a: (p) => 'لأنه لا توجد قوة تؤثر عليه لتغيّر سرعته؛ فيستمر بسرعة ' + p.v0 + ' م/ث بينما السيارة تتباطأ. لا توجد قوة «تدفعه» للأمام، بل السيارة هي التي تتوقف من تحته.' },
      { q: 'ما علاقة الكتلة بالقصور الذاتي؟', k: ['الكتله', 'القصور'], a: (p, d) => 'الكتلة مقياس القصور الذاتي: كلما زادت احتاج الجسم قوة أكبر لتغيير حركته. هنا يحتاج الحزام $' + f2(d.Fbelt) + '$ N لإيقاف راكب كتلته ' + p.m + ' كغم.' }
    ]
  });

  /* ======================= 4-1 قانون هوك (النابض) ======================= */
  ML.register({
    subject: S, id: 'hooke', unit: U, order: 3, lesson: '4-1', lessonTitle: 'القوة (قوة الشد في النابض)', page: 46,
    titleAr: 'قوة الاسترجاع في النابض', titleEn: "Spring Restoring Force (Hooke's Law)", tags: 'نابض ثابت المرونه قوه الاسترجاع استطاله هوك',
    formula: 'F = -k\\,x',
    book: 'ق = − أ س ، حيث أ: ثابت المرونة للنابض ، والإشارة السالبة تعني أن القوة تعاكس الإزاحة',
    summary: 'عندما نعلّق جسماً بنابض أو نضغطه يؤثر النابض بقوة استرجاع تحاول إعادته لموضع الاتزان؛ مقدارها يتناسب طردياً مع الإزاحة، والثابت $k$ يعبّر عن صلابة النابض (ما دمنا ضمن حد التناسب).',
    vars: [['k', 'ثابت المرونة للنابض', '\\mathrm{N/m}', '100 – 50000'], ['m', 'الكتلة المعلقة/الجالسة', '\\mathrm{kg}', '0 – 120'], ['x', 'الإزاحة (الاستطالة أو الانضغاط)', '\\mathrm{m}', 'تُحسب: x = mg/k'], ['F', 'قوة الاسترجاع', '\\mathrm{N}', 'تساوي الوزن عند الاتزان']],
    assumptions: ['النابض ضمن حد التناسب (لا يتجاوز حد المرونة) (ص 46).', 'الجسم في حالة اتزان: قوة الاسترجاع = الوزن.', 'تسارع الجاذبية 10 م/ث² كما في مثال الكتاب (يمكن تغييره).'],
    params: [
      { key: 'k', label: 'k\\ (\\mathrm{N/m})', min: 100, max: 50000, step: 100, value: 20000 },
      { key: 'm', label: 'm\\ (\\mathrm{kg})', min: 0, max: 120, step: 1, value: 60 },
      { key: 'g', label: 'g\\ (\\mathrm{m/s^2})', min: 9.8, max: 10, step: 0.2, value: 10 }
    ],
    custom: true, canvasHint: 'كرسي بنابض (مثال سعاد ص 47): كلما زاد الوزن انضغط النابض أكثر.',
    compute(p) { const W = P.weight(p.m, p.g); const x = W / p.k; return { W: W, x: x, F: P.hooke(p.k, -x) }; },
    drawCustom(ctx, W, H, p, d, c) {
      const cx = W / 2, base = H - 40; const L0 = 160; const comp = Math.min(L0 - 30, d.x * 1500);
      ctx.fillStyle = c.axis; ctx.fillRect(cx - 120, base, 240, 10);
      const top = base - (L0 - comp);
      D.spring(ctx, cx, base, cx, top, 9, 22, c.c1);
      ctx.fillStyle = c.c4; D.rr(ctx, cx - 100, top - 24, 200, 24, 6); ctx.fill();
      // الشخص/الكتلة
      if (p.m > 0) { const s = 0.5 + Math.min(1, p.m / 120) * 0.7; ctx.fillStyle = c.c5; D.rr(ctx, cx - 40 * s, top - 24 - 70 * s, 80 * s, 70 * s, 10); ctx.fill(); D.txt(ctx, p.m + ' kg', cx, top - 24 - 35 * s, { color: '#fff', size: 14, w: '700' }); }
      if (p.m > 0) { D.arrow(ctx, cx + 130, top - 40, cx + 130, top - 40 + Math.min(90, d.W / 15), c.c2, 3); D.txt(ctx, 'W = ' + f2(d.W) + ' N', cx + 140, top - 50, { color: c.c2, align: 'left' }); D.arrow(ctx, cx - 130, top, cx - 130, top - Math.min(90, d.W / 15), c.c3, 3); D.txt(ctx, 'F = ' + f2(d.W) + ' N', cx - 140, top - 50, { color: c.c3, align: 'right' }); }
      ctx.strokeStyle = c.muted; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(cx + 105, base - L0); ctx.lineTo(cx + 200, base - L0); ctx.stroke(); ctx.setLineDash([]);
      D.txt(ctx, 'الطول الطبيعي', cx + 205, base - L0, { color: c.muted, size: 11, align: 'left' });
      D.txt(ctx, 'الانضغاط x = ' + f2(d.x * 100, 3) + ' سم', W / 2, 24, { color: c.text, size: 16, w: '700' });
    },
    graph(p, d) { const xm = Math.max(0.05, d.x * 1.5); return { view: { xmin: 0, xmax: xm * 100, ymin: 0, ymax: p.k * xm * 1.05 }, xLabel: 'x (cm)', yLabel: '|F| (N)', caption: 'خط مستقيم يمر بالأصل: القوة تتناسب طردياً مع الإزاحة، وميله ثابت المرونة $k$ (بعد تحويل السنتيمتر إلى متر).', draw(G) { const c = G.colors(); G.fn((xc) => p.k * xc / 100, { color: c.c1, width: 3 }); G.point(d.x * 100, d.W, { color: c.c2, label: f2(d.W) + ' N' }); } }; },
    live(p, d) { return 'x = \\frac{mg}{k} = \\frac{' + p.m + ' \\times ' + p.g + '}{' + p.k + '} = ' + f2(d.x, 5) + '\\ \\mathrm{m}'; },
    results(p, d) { return [['الوزن = قوة الاسترجاع', q(d.W, 'N')], ['الإزاحة x', q(d.x, 'm') + ' = ' + q(d.x * 100, 'cm')], ['ثابت المرونة', q(p.k, 'N/m')], ['تحليل الأبعاد', '\\frac{\\mathrm{N}}{\\mathrm{N/m}} = \\mathrm{m}']]; },
    steps(p, d) { return ['عند الاتزان: قوة الاسترجاع = الوزن ← $kx = mg$.', '$x = \\frac{' + p.m + ' \\times ' + p.g + '}{' + p.k + '} = ' + f2(d.x, 5) + '$ م.']; },
    explain(a, b, da, db) { if (a.m !== b.m) return ['زادت/قلت الكتلة فتغيّر الوزن إلى $' + f2(db.W) + '$ N، فانضغط النابض $' + f2(db.x * 100, 3) + '$ سم. الإزاحة تتناسب طردياً مع القوة.']; if (a.k !== b.k) return ['نابض ' + (b.k > a.k ? 'أصلب' : 'أطرى') + ' (k = ' + b.k + ') ← انضغاط ' + (b.k > a.k ? 'أقل' : 'أكبر') + ' للوزن نفسه: $x = mg/k$.']; return []; },
    learn: ['**قوة الاسترجاع (ص 46):** إذا علّق جسم بنابض وكانت إزاحته $x$ عن موضع الاتزان، يؤثر النابض بقوة تحاول إعادته: $F = -kx$، $k$ ثابت المرونة ووحدته N/m، والإشارة السالبة تعني أن القوة تعاكس الإزاحة.', '**المرونة:** يعود النابض لوضعه الأصلي عند إزالة القوة ما لم يتجاوز «حد التناسب».', '**مثال (1) ص 47:** سعاد (60 كغم) تضغط نابض الكرسي 3 سم: $k = 600/0.03 = 2 \\times 10^4$ N/m. إذا حملت ابنها (المجموع 90 كغم) ينضغط 4.5 سم.'],
    challenges: [
      { q: 'مثال (1) ب: أصبحت الكتلة 90 كغم. ما الانضغاط؟', hint: '$k = 2 \\times 10^4$، $m = 90$، $g = 10$.', init: { k: 5000, m: 30, g: 10 }, check: (p, d) => p.k === 20000 && p.m === 90 && p.g === 10, why: () => '$x = 900/20000 = 0.045$ م = 4.5 سم.' },
      { q: 'س15 ص 59: قوة 30 N تضغط نابضاً 0.3 م. اضبط k لتحقق ذلك بكتلة 3 كغم و g = 10.', hint: '$k = 30/0.3$.', init: { k: 5000, m: 30, g: 10 }, check: (p, d) => p.m === 3 && p.g === 10 && M.near(d.x, 0.3, 1e-9), why: () => '$k = 100$ N/m.' }
    ],
    tutor: [
      { q: 'لماذا توجد إشارة سالبة في القانون؟', k: ['سالبه', 'الاشاره'], a: () => 'لأن قوة الاسترجاع دائماً عكس اتجاه الإزاحة: إذا ضغطت النابض للأسفل يدفع للأعلى، وإذا شددته يسحب للخلف.' },
      { q: 'ماذا يحدث لو ضاعفت الكتلة؟', k: ['ضاعفت', 'ضعف'], a: (p, d) => 'يتضاعف الوزن فيتضاعف الانضغاط: من $' + f2(d.x * 100, 3) + '$ إلى $' + f2(2 * d.x * 100, 3) + '$ سم (ما دمنا ضمن حد التناسب).' }
    ]
  });

  /* ======================= 4-1 الحركة الدائرية المنتظمة ======================= */
  ML.register({
    subject: S, id: 'circular', unit: U, order: 4, lesson: '4-1', lessonTitle: 'القوة (القوة المركزية)', page: 47,
    titleAr: 'الحركة الدائرية والتسارع المركزي', titleEn: 'Uniform Circular Motion & Centripetal Acceleration', tags: 'حركه دائريه تسارع مركزي قوه مركزيه زمن دوري تردد',
    formula: 'v = \\frac{2\\pi r}{T},\\qquad a_c = \\frac{v^2}{r},\\qquad F_c = m\\,\\frac{v^2}{r}',
    book: 'ت م = ع² / نق ، ق المركزية = ك × ع² / نق ، الزمن الدوري ن = 2π نق / ع',
    summary: 'في الحركة الدائرية المنتظمة يبقى مقدار السرعة ثابتاً لكن اتجاهها يتغير باستمرار، فالجسم يتسارع نحو المركز. القوة المركزية (مثل شد الخيط) هي التي تُبقيه على المسار؛ إذا اختفت يتحرك الجسم بخط مستقيم مماسي.',
    vars: [['r', 'نصف قطر المسار', '\\mathrm{m}', '0.1 – 5'], ['n', 'عدد الدورات في الدقيقة', '\\mathrm{rev/min}', '1 – 120'], ['m', 'الكتلة', '\\mathrm{kg}', '0.05 – 5'], ['T', 'الزمن الدوري', '\\mathrm{s}', 'T = 60/n'], ['v, a_c', 'السرعة والتسارع المركزي', '\\mathrm{m/s,\\ m/s^2}', 'تُحسب']],
    assumptions: ['حركة دائرية منتظمة في مستوى أفقي (مقدار السرعة ثابت).', 'بإهمال الجاذبية ومقاومة الهواء على مستوى الدوران.'],
    params: [
      { key: 'r', label: 'r\\ (\\mathrm{m})', min: 0.1, max: 5, step: 0.05, value: 0.6 },
      { key: 'n', label: 'n\\ (\\mathrm{rev/min})', min: 1, max: 120, step: 1, value: 30 },
      { key: 'm', label: 'm\\ (\\mathrm{kg})', min: 0.05, max: 5, step: 0.05, value: 0.15 },
      { key: 'cut', label: '\\text{release}', type: 'toggle', value: false, on: 'قُطع الخيط', off: 'الخيط مشدود' }
    ],
    resetOn: ['cut'],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0, ang: 0, rel: null }),
    tick(st, p, d, dt) {
      st.t += dt;
      if (!p.cut) st.ang += d.omega * dt;
      else { if (!st.rel) st.rel = { ang: st.ang, t: st.t }; }
    },
    isDone: (st, p) => p.cut && st.rel && st.t - st.rel.t > 3,
    custom: true, canvasHint: 'السهم الأخضر: السرعة (مماسية). السهم الأحمر: التسارع/القوة نحو المركز. فعّل «قطع الخيط» أثناء التشغيل.',
    compute(p) { const T = 60 / p.n; const v = 2 * Math.PI * p.r / T; const a = P.centripetal(v, p.r); return { T: T, f: 1 / T, v: v, a: a, F: p.m * a, omega: 2 * Math.PI / T }; },
    drawCustom(ctx, W, H, p, d, c) {
      const st = d.st || { ang: 0, t: 0 }; const cx = W / 2, cy = H / 2 + 10; const R = Math.min(W, H) * 0.32; const sc = R / p.r;
      ctx.strokeStyle = c.grid; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = c.axis; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, 7); ctx.fill();
      let bx, by, ang = st.ang;
      if (p.cut && st.rel) { const a0 = st.rel.ang; const s = d.v * (st.t - st.rel.t) * sc; bx = cx + R * Math.cos(a0) - s * Math.sin(a0); by = cy - R * Math.sin(a0) - s * Math.cos(a0); ang = a0; ctx.strokeStyle = c.c4; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(cx + R * Math.cos(a0), cy - R * Math.sin(a0)); ctx.lineTo(bx, by); ctx.stroke(); ctx.setLineDash([]); }
      else { bx = cx + R * Math.cos(ang); by = cy - R * Math.sin(ang); ctx.strokeStyle = c.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx, by); ctx.stroke(); }
      ctx.fillStyle = c.c1; ctx.beginPath(); ctx.arc(bx, by, 11, 0, 7); ctx.fill();
      const tx = -Math.sin(ang), ty = -Math.cos(ang);
      D.arrow(ctx, bx, by, bx + tx * 70, by + ty * 70, c.c3, 3); D.txt(ctx, 'v', bx + tx * 82, by + ty * 82, { color: c.c3, w: '700' });
      if (!(p.cut && st.rel)) { D.arrow(ctx, bx, by, bx + (cx - bx) * 0.45, by + (cy - by) * 0.45, c.c2, 3); D.txt(ctx, 'a_c', bx + (cx - bx) * 0.55, by + (cy - by) * 0.55 - 10, { color: c.c2, w: '700' }); }
      D.txt(ctx, p.cut && st.rel ? 'بعد قطع الخيط: لا قوة مركزية ← حركة بخط مستقيم مماسي (القانون الأول)' : 'v = ' + f2(d.v, 3) + ' m/s    a = ' + f2(d.a, 3) + ' m/s²', W / 2, 22, { color: c.text, size: 15, w: '700' });
    },
    graph(p, d) { return { view: { xmin: 0, xmax: 5, ymin: 0, ymax: D.niceMax(d.v * d.v / 0.1 > 1e4 ? 100 : (2 * Math.PI * 5 / d.T) ** 2 / 5 + 1, 5) }, xLabel: 'r (m)', yLabel: 'a_c (m/s²)', caption: 'بتثبيت الزمن الدوري ($T = ' + f2(d.T) + '$ ث): $a_c = 4\\pi^2 r / T^2$ يتناسب طردياً مع نصف القطر (مضاعفة نق تضاعف التسارع — سؤال الكتاب ص 49).', draw(G) { const c = G.colors(); G.fn((r) => 4 * Math.PI * Math.PI * r / (d.T * d.T), { color: c.c2, width: 3, domain: [0, 5] }); G.point(p.r, d.a, { color: c.c1, label: f2(d.a, 3) }); } }; },
    live(p, d) { return 'v = \\frac{2\\pi r}{T} = \\frac{2\\pi(' + p.r + ')}{' + f2(d.T, 3) + '} = ' + f2(d.v, 3) + ',\\quad a_c = \\frac{v^2}{r} = ' + f2(d.a, 3) + '\\ \\mathrm{m/s^2}'; },
    results(p, d) { return [['الزمن الدوري T', q(d.T, 's')], ['التردد', q(d.f, 'Hz') + '\\ (\\text{دورة/ث})'], ['السرعة المماسية v', q(d.v, 'm/s')], ['التسارع المركزي', q(d.a, 'm/s^2')], ['القوة المركزية', q(d.F, 'N')], ['تحليل الأبعاد', '\\frac{(\\mathrm{m/s})^2}{\\mathrm{m}} = \\mathrm{m/s^2}']]; },
    steps(p, d) { return ['$T = 60/n = 60/' + p.n + ' = ' + f2(d.T, 4) + '$ ث.', '$v = 2\\pi r / T = 2 \\times 3.14 \\times ' + p.r + ' / ' + f2(d.T, 4) + ' = ' + f2(d.v, 3) + '$ م/ث.', '$a_c = v^2 / r = ' + f2(d.v, 3) + '^2 / ' + p.r + ' = ' + f2(d.a, 3) + '$ م/ث².', '$F_c = m a_c = ' + p.m + ' \\times ' + f2(d.a, 3) + ' = ' + f2(d.F, 3) + '$ N.']; },
    explain(a, b, da, db) { if (a.n !== b.n) return ['زاد عدد الدورات ← سرعة أكبر؛ والتسارع المركزي يتناسب مع مربع السرعة، لذا مضاعفة السرعة تضرب التسارع في 4 (س2-7 ص 56).']; if (a.cut !== b.cut) return [b.cut ? 'قُطع الخيط: اختفت القوة المركزية فلم يعد شيء يغيّر اتجاه السرعة؛ يتحرك الجسم بخط مستقيم مماسي للدائرة.' : 'أُعيد الخيط.']; return []; },
    learn: ['**القوة المركزية (ص 47):** القوة التي تجعل الجسم يتحرك في مسار دائري، واتجاهها نحو مركز المسار، فيكتسب الجسم تسارعاً نحو المركز: $F = m a_c$.', '**التسارع المركزي (ص 48):** $a_c = v^2/r$؛ السرعة عمودية دائماً على التسارع المركزي.', '**الزمن الدوري (ص 48):** الزمن اللازم لإكمال دورة: $T = 2\\pi r / v$، وعدد الدورات في ثانية واحدة هو التردد.', '**مثال (2) ص 49:** كرة 150 غم، $r = 0.6$ م، 30 دورة في الدقيقة: $v = 1.88$ م/ث، $a_c = 5.89$ م/ث².'],
    challenges: [
      { q: 'مثال (2) ص 49: اضبط القيم وتحقق أن التسارع المركزي ≈ 5.89 م/ث².', hint: '$r = 0.6$، $n = 30$، $m = 0.15$.', init: { r: 1, n: 10, m: 1, cut: false }, check: (p) => p.r === 0.6 && p.n === 30 && p.m === 0.15 },
      { q: 'سؤال ص 49: ضاعف نصف القطر إلى 1.2 م مع تثبيت الزمن الدوري. كم يصبح التسارع؟', hint: '$r = 1.2$، $n = 30$.', init: { r: 0.6, n: 30, m: 0.15, cut: false }, check: (p) => p.r === 1.2 && p.n === 30, why: (p, d) => '$a_c = ' + f2(d.a) + '$ م/ث² — الضعف.' },
      { q: 'س8 ص 57: جسم يدور في دائرة نصف قطرها 5 م بسرعة 3.14 م/ث تقريباً. ما الزمن الدوري؟ (قرّب: اجعل n = 6)', hint: '$T = 2\\pi r / v = 10$ ث ← $n = 6$ دورات/دقيقة.', init: { r: 1, n: 30, m: 1, cut: false }, check: (p, d) => p.r === 5 && p.n === 6, why: (p, d) => '$v = ' + f2(d.v, 3) + '$ م/ث و $T = 10$ ث.' }
    ],
    tutor: [
      { q: 'لماذا يتسارع الجسم رغم أن سرعته ثابتة؟', k: ['يتسارع', 'ثابته', 'لماذا'], a: () => 'لأن التسارع تغيّر في السرعة **المتجهة** (مقداراً أو اتجاهاً). في الحركة الدائرية الاتجاه يتغير في كل لحظة، فيوجد تسارع نحو المركز رغم ثبات المقدار (ص 47).' },
      { q: 'أين ستتجه الكرة عند إفلاتها؟', k: ['افلات', 'تتجه', 'قطع'], a: () => 'بخط مستقيم مماسي للدائرة عند نقطة الإفلات (باتجاه السرعة لحظتها)، لأنه لم تعد هناك قوة مركزية تغيّر اتجاهها — القانون الأول.' },
      { q: 'ماذا يحدث لو ضاعفت السرعة؟', k: ['ضاعفت', 'السرعه'], a: (p, d) => 'التسارع المركزي يصبح 4 أضعاف: من $' + f2(d.a, 3) + '$ إلى $' + f2(4 * d.a, 3) + '$ م/ث²، لأن $a_c = v^2/r$.' }
    ]
  });

  /* ======================= القانون الثالث لنيوتن ======================= */
  ML.register({
    subject: S, id: 'newton3', unit: U, order: 5, lesson: '4-3', lessonTitle: 'القانون الثالث لنيوتن', page: 53,
    titleAr: 'القانون الثالث لنيوتن (الفعل ورد الفعل)', titleEn: "Newton's Third Law (Action & Reaction)", tags: 'قانون نيوتن الثالث فعل رد فعل ميزان نابض ارتداد',
    formula: '\\vec F_{AB} = -\\vec F_{BA}',
    book: 'لكل قوة فعل قوة رد فعل مساوية لها في المقدار ومعاكسة لها في الاتجاه، تؤثران في جسمين مختلفين وخط عملهما مشترك',
    summary: 'عندما يدفع متزلجان أحدهما الآخر، يؤثر كل منهما على الآخر بقوة مساوية ومعاكسة — تماماً كما تتساوى قراءتا ميزانين نابضيين مشبوكين. لكن القوتين تؤثران على جسمين مختلفين، فيكتسب الأخف تسارعاً أكبر.',
    vars: [['F', 'قوة الدفع المتبادلة', '\\mathrm{N}', '0 – 400'], ['m_A,\\ m_B', 'كتلتا المتزلجين', '\\mathrm{kg}', '20 – 120'], ['\\Delta t', 'زمن التلامس أثناء الدفع', '\\mathrm{s}', '0.1 – 1']],
    assumptions: ['سطح الجليد أملس (بإهمال الاحتكاك) لذا القوة الوحيدة الأفقية هي قوة الدفع.', 'القوة ثابتة خلال زمن التلامس.'],
    params: [
      { key: 'F', label: 'F\\ (\\mathrm{N})', min: 0, max: 400, step: 10, value: 200 },
      { key: 'mA', label: 'm_A\\ (\\mathrm{kg})', min: 20, max: 120, step: 5, value: 50 },
      { key: 'mB', label: 'm_B\\ (\\mathrm{kg})', min: 20, max: 120, step: 5, value: 80 },
      { key: 'dt', label: '\\Delta t\\ (\\mathrm{s})', min: 0.1, max: 1, step: 0.1, value: 0.5 }
    ],
    resetOn: ['F', 'mA', 'mB', 'dt'],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0, xA: -0.3, xB: 0.3, vA: 0, vB: 0, series: [] }),
    tick(st, p, d, dt) {
      const push = st.t < p.dt; const aA = push ? -p.F / p.mA : 0, aB = push ? p.F / p.mB : 0;
      st.vA += aA * dt; st.vB += aB * dt; st.xA += st.vA * dt; st.xB += st.vB * dt; st.t += dt;
      D.pushSeries(st, st.t, [push ? p.F : 0, push ? -p.F : 0, st.vA, st.vB]);
    },
    isDone: (st) => st.t > 4,
    custom: true, canvasHint: 'المتزلجان يدفع أحدهما الآخر. قراءتا الميزانين النابضيين متساويتان دائماً.',
    graphModes: ['القوة على كل متزلج – الزمن', 'السرعة – الزمن'],
    compute(p) { const aA = p.F / p.mA, aB = p.F / p.mB; return { aA: aA, aB: aB, vA: aA * p.dt, vB: aB * p.dt }; },
    drawCustom(ctx, W, H, p, d, c) {
      const st = d.st || { t: 0, xA: -0.3, xB: 0.3 }; const y = H * 0.66; const sc = Math.min(60, W / 14); const cx = W / 2;
      ctx.fillStyle = c.c1; ctx.globalAlpha = 0.12; ctx.fillRect(0, y, W, H - y); ctx.globalAlpha = 1;
      const XA = cx + st.xA * sc, XB = cx + st.xB * sc;
      const body = (X, m, col, lab) => { const s = 0.6 + m / 120 * 0.6; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X, y - 95 * s, 13 * s, 0, 7); ctx.fill(); D.rr(ctx, X - 16 * s, y - 80 * s, 32 * s, 60 * s, 8); ctx.fill(); ctx.fillRect(X - 14 * s, y - 20 * s, 8, 20 * s); ctx.fillRect(X + 6 * s, y - 20 * s, 8, 20 * s); D.txt(ctx, lab + ' ' + m + 'kg', X, y + 16, { color: col, size: 12, w: '700' }); };
      body(XA, p.mA, c.c1, 'A'); body(XB, p.mB, c.c3, 'B');
      if (st.t < p.dt) {
        D.arrow(ctx, XA - 10, y - 60, XA - 10 - p.F / 4, y - 60, c.c2, 3); D.txt(ctx, 'B على A: ' + p.F + ' N', XA - 10 - p.F / 8, y - 76, { color: c.c2, size: 12 });
        D.arrow(ctx, XB + 10, y - 60, XB + 10 + p.F / 4, y - 60, c.c5, 3); D.txt(ctx, 'A على B: ' + p.F + ' N', XB + 10 + p.F / 8, y - 76, { color: c.c5, size: 12 });
      }
      // الميزانان المشبوكان
      const my = 40; ctx.fillStyle = c.grid; D.rr(ctx, cx - 160, my - 14, 120, 28, 6); ctx.fill(); D.rr(ctx, cx + 40, my - 14, 120, 28, 6); ctx.fill();
      ctx.strokeStyle = c.axis; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 40, my); ctx.lineTo(cx + 40, my); ctx.stroke();
      const r = st.t < p.dt ? p.F : 0; D.txt(ctx, r + ' N', cx - 100, my, { color: c.text, w: '700' }); D.txt(ctx, r + ' N', cx + 100, my, { color: c.text, w: '700' });
      D.txt(ctx, 'قراءتا الميزانين النابضيين', cx, my + 26, { color: c.muted, size: 11 });
    },
    graph(p, d, gi) {
      const st = d.st || { series: [] }; const ser = st.series || []; const T = Math.max(2, st.t || 0);
      if (gi === 0) return { view: { xmin: 0, xmax: T, ymin: -p.F * 1.3 - 10, ymax: p.F * 1.3 + 10 }, xLabel: 't (s)', yLabel: 'F (N)', caption: 'القوتان متساويتان مقداراً ومتعاكستان اتجاهاً في كل لحظة.', draw(G) { const c = G.colors(); D.series(G, ser.map((r) => [r[0], r[2]]), c.c5, 3); D.series(G, ser.map((r) => [r[0], r[1]]), c.c2, 3); } };
      return { view: { xmin: 0, xmax: T, ymin: -d.vA * 1.3 - 0.5, ymax: d.vB * 1.3 + 0.5 }, xLabel: 't (s)', yLabel: 'v (m/s)', caption: 'المتزلج الأخف يكتسب سرعة أكبر لأن $a = F/m$.', draw(G) { const c = G.colors(); D.series(G, ser.map((r) => [r[0], r[3]]), c.c1, 3); D.series(G, ser.map((r) => [r[0], r[4]]), c.c3, 3); } };
    },
    live(p, d) { return 'F_{A\\to B} = ' + p.F + '\\ \\mathrm{N} = -F_{B\\to A},\\quad a_A = ' + f2(d.aA, 3) + ',\\ a_B = ' + f2(d.aB, 3) + '\\ \\mathrm{m/s^2}'; },
    results(p, d) { return [['قوة A على B', q(p.F, 'N') + '\\ \\to'], ['قوة B على A', q(p.F, 'N') + '\\ \\leftarrow'], ['تسارع A', q(d.aA, 'm/s^2')], ['تسارع B', q(d.aB, 'm/s^2')], ['سرعة A بعد الدفع', q(d.vA, 'm/s') + '\\ \\leftarrow'], ['سرعة B بعد الدفع', q(d.vB, 'm/s') + '\\ \\to']]; },
    steps(p, d) { return ['القانون الثالث: القوتان متساويتان ومتعاكستان: $' + p.F + '$ N لكل منهما.', 'القانون الثاني لكل جسم على حدة: $a_A = ' + p.F + '/' + p.mA + ' = ' + f2(d.aA, 3) + '$، $a_B = ' + p.F + '/' + p.mB + ' = ' + f2(d.aB, 3) + '$ م/ث².', 'بعد زمن الدفع $' + p.dt + '$ ث: $v = a \\Delta t$.']; },
    explain(a, b, da, db) { if (a.mA !== b.mA || a.mB !== b.mB) return ['غيّرت الكتلة: القوتان ما زالتا متساويتين (' + b.F + ' N)، لكن التسارع يختلف لأن كل قوة تؤثر على جسم مختلف كتلته مختلفة.']; return []; },
    learn: ['**نشاط (11) ص 54:** عند شبك ميزانين نابضيين وسحبهما تتساوى القراءتان: قوتا الفعل ورد الفعل متساويتان في المقدار.', '**القانون الثالث (ص 54):** لكل قوة فعل قوة رد فعل مساوية لها في المقدار ومعاكسة في الاتجاه، تؤثران على جسمين مختلفين وخط عملهما مشترك.', '**تطبيقات (ص 55):** خرطوم الإطفاء: اندفاع الماء قوة فعل وارتداد رجل الإطفاء للخلف رد فعل. ارتداد المدفع عند إطلاق القذيفة (س6 ص 57).'],
    challenges: [
      { q: 'اجعل المتزلجين يبتعدان بالسرعة نفسها.', hint: 'الكتلتان متساويتان.', init: { mA: 50, mB: 80 }, check: (p) => p.mA === p.mB },
      { q: 'اجعل سرعة A ثلاثة أضعاف سرعة B.', hint: '$m_B = 3 m_A$.', init: { mA: 50, mB: 80 }, check: (p, d) => M.near(d.vA, 3 * d.vB, 1e-9) }
    ],
    tutor: [
      { q: 'إذا كانت القوتان متساويتين فلماذا لا يلغي أحدهما الآخر؟', k: ['تلغي', 'متساويتين', 'لماذا لا'], a: () => 'لأنهما تؤثران على جسمين **مختلفين**: إحداهما على A والأخرى على B. القوى تلغي بعضها فقط إذا أثرت على الجسم نفسه.' },
      { q: 'لماذا يتحرك المتزلج الأخف أسرع؟', k: ['الاخف', 'اسرع'], a: (p, d) => 'القوة نفسها ' + p.F + ' N على الاثنين، لكن $a = F/m$: الأخف كتلته أقل فتسارعه أكبر ($' + f2(Math.max(d.aA, d.aB), 3) + '$ مقابل $' + f2(Math.min(d.aA, d.aB), 3) + '$ م/ث²).' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
