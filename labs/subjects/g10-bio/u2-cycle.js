/* العلوم الحياتية — الوحدة الثانية، الفصل الأول: دورة الخلية (ص 34–42) */
(function (root) {
  'use strict';
  const ML = root.ML; const B = ML.bio; const D = ML.pdraw;
  const S = 'g10-bio'; const U = 4;
  const reg = (o) => ML.register(Object.assign({ subject: S, unit: U, custom: true }, o));
  const narrow = (W) => W < 640;
  const PH_COL = { G1: '#22c55e', S: '#3b82f6', G2: '#f59e0b', M: '#ef4444' };
  const PH_AR = { G1: 'النمو الأول G1', S: 'بناء DNA (S)', G2: 'النمو الثاني G2', M: 'طور الانقسام M' };
  const PH_TXT = {
    G1: 'نشاط أيضي عالٍ للخلية، تنمو ويزداد حجمها وعدد عضياتها، وبناء حمض RNA وبعض الإنزيمات.',
    S: 'تتضاعف المادة الوراثية DNA، وتستمر الخلية بالنمو وزيادة عدد عضياتها.',
    G2: 'يُستكمل بناء البروتينات وجزيئات RNA واكتمال زيادة عدد العضيات، وتخزين كمية زائدة من الطاقة وإنتاج الإنزيمات اللازمة لعملية الانقسام.',
    M: 'الانقسام المتساوي (النووي) ثم انقسام السيتوبلازم.'
  };
  const CELLS = Object.keys(B.CYCLE_TABLE).map((k) => [k, B.CYCLE_TABLE[k].name]);
  const n2Param = (val) => ({ key: 'n2', label: '\\text{العدد الكروموسومي 2n}', type: 'text', value: String(val), maxLength: 3, desc: 'عدد زوجي موجب (حتى 60 للعرض)', normalize: (v) => String(v).trim(), validate: (v) => { const x = ML.parseNum(v); const e = B.validate2n(x); return e || (x > 60 ? 'للعرض الواضح اختر عدداً حتى 60 (الإنسان 46).' : null); } });
  ML.bio.n2Param = n2Param;
  const n2Of = (p) => { const x = ML.parseNum(p.n2); return B.validate2n(x) || x > 60 ? null : x; };

  /* ======================= 2-3 دورة الخلية (عجلة بجدول الكتاب) ======================= */
  reg({
    id: 'cell-cycle', order: 1, lesson: '2-3', lessonTitle: 'أطوار دورة الخلية', page: 35,
    titleAr: 'عجلة دورة الخلية: G1 و S و G2 و M', titleEn: 'The Cell Cycle Wheel (Book Table 1)', tags: 'دوره الخليه طور بيني G1 S G2 G0 سايكلين نقاط تحكم سكون دائم مؤقت',
    formula: '\\text{نسبة المرحلة} = \\dfrac{\\text{زمن المرحلة}}{\\text{زمن الدورة}} \\times 100\\%',
    book: 'جدول (1) ص 35: زمن مراحل الطور البيني بالساعات لخلية نبات فاصولياء (5، 7، 5)، وخلية مولدة الألياف في فأر (9، 10، 2)، وخلايا بطانة الأمعاء في الإنسان (6، 12، 5). زمن الانقسام المتساوي لخلية الفاصولياء ساعتان (ص 36). الطور البيني يشكل 90% من دورة الخلية (ص 35).',
    summary: 'تمر الخلية بالطور البيني (G1 ثم S ثم G2) ثم طور الانقسام M. تتحكم ثلاث نقاط تحكم (عند G1 و G2 و M) بالانتقال بين المراحل، ويؤدي تراكم بروتين السايكلين إلى تنشيط الانقسام. بعض الخلايا تخرج إلى G0 (طور السكون).',
    vars: [['\\text{G1 ، S ، G2}', 'مراحل الطور البيني (جدول 1)', '\\text{ساعة}', 'من الجدول'], ['\\text{M}', 'طور الانقسام', '\\text{ساعة}', '2 لخلية الفاصولياء فقط (ص 36)'], ['\\text{G0}', 'طور السكون الدائم أو المؤقت', '—', 'وصفي (ص 36)']],
    assumptions: ['زمن طور الانقسام غير مذكور في الجدول لخلية الفأر وخلايا الأمعاء؛ لذا يُرسم قطاعه مخططاً دون زمن، وتُحسب النسب من الطور البيني فقط.', 'حركة المؤشر للعرض: كل ثانية تشغيل ≈ 3 ساعات من الجدول.'],
    params: [
      { key: 'cell', label: '\\text{الخلية}', type: 'select', options: CELLS, value: 'bean' },
      { key: 'cyclin', label: '\\text{بروتين السايكلين}', type: 'toggle', value: true, on: 'تراكم كافٍ (ينشط الانقسام)', off: 'غير كافٍ (يتوقف الانقسام)' },
      { key: 'g0', label: '\\text{الخروج إلى G0}', type: 'select', options: [['none', 'لا (تستمر في الانقسام)'], ['perm', 'طور السكون الدائم (عصبونات، عضلات هيكلية، خلايا دم حمراء ناضجة)'], ['temp', 'طور السكون المؤقت (خلايا الكبد)']], value: 'none' },
      { key: 'heal', label: '\\text{تلف في النسيج}', type: 'toggle', value: false, on: 'يوجد جرح/تلف يحتاج إصلاحاً', off: 'لا يوجد', hidden: (p) => p.g0 !== 'temp' }
    ],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ h: 0, ph: 'G1', cycles: 0, stop: '' }), resetOn: ['cell'],
    tick(st, p, d, dt) {
      const r = B.CYCLE_TABLE[p.cell]; const dur = { G1: r.G1, S: r.S, G2: r.G2, M: r.M || 1 };
      const order = ['G1', 'S', 'G2', 'M'];
      st.stop = '';
      if (st.ph === 'G1' && st.h >= dur.G1 * 0.5 && (p.g0 === 'perm' || (p.g0 === 'temp' && !p.heal))) { st.stop = 'G0'; return; }
      if (st.ph === 'G2' && st.h >= dur.G2 && !p.cyclin) { st.stop = 'G2'; return; }
      st.h += dt * 3;
      if (st.h >= dur[st.ph]) { st.h = 0; const i = order.indexOf(st.ph); st.ph = order[(i + 1) % 4]; if (st.ph === 'G1') st.cycles++; }
    },
    compute(p) { const r = B.CYCLE_TABLE[p.cell]; return { r: r, sh: B.cycleShares(p.cell) }; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = narrow(W); const st = d.st || { h: 0, ph: 'G1' }; const r = d.r; const sh = d.sh;
      const cx = nar ? W / 2 : W * 0.36, cy = nar ? H * 0.42 : H / 2, R = Math.min(nar ? W * 0.4 : W * 0.28, H * (nar ? 0.34 : 0.4));
      // القطاعات: إن لم يُعطَ M نرسمه قطاعاً مخططاً بعرض ثابت للعرض فقط
      const mFrac = r.M ? r.M / sh.total : 0.08; const scale = r.M ? 1 : 0.92;
      const fr = { G1: r.G1 / sh.interphase * scale, S: r.S / sh.interphase * scale, G2: r.G2 / sh.interphase * scale, M: mFrac };
      if (r.M) { fr.G1 = r.G1 / sh.total; fr.S = r.S / sh.total; fr.G2 = r.G2 / sh.total; }
      let a0 = -Math.PI / 2; const ang = {};
      ['G1', 'S', 'G2', 'M'].forEach((k) => {
        const a1 = a0 + fr[k] * Math.PI * 2; ang[k] = [a0, a1];
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, a0, a1); ctx.closePath(); ctx.fillStyle = PH_COL[k]; ctx.globalAlpha = st.ph === k ? 1 : 0.55; ctx.fill(); ctx.globalAlpha = 1;
        if (k === 'M' && !r.M) { ctx.save(); ctx.clip(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; for (let i = -20; i < 20; i++) { ctx.beginPath(); ctx.moveTo(cx + i * 10 - R, cy - R); ctx.lineTo(cx + i * 10 + R, cy + R); ctx.stroke(); } ctx.restore(); }
        ctx.strokeStyle = c.bg; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, a0, a1); ctx.closePath(); ctx.stroke();
        const am = (a0 + a1) / 2; const lx = cx + Math.cos(am) * R * 0.66, ly = cy + Math.sin(am) * R * 0.66;
        D.txt(ctx, k, lx, ly - 8, { color: '#fff', size: 16, w: '800' });
        D.txt(ctx, k === 'M' && !r.M ? '—' : r[k] + ' ساعة', lx, ly + 10, { color: '#fff', size: 11, w: '700' });
        a0 = a1;
      });
      B.blob(ctx, cx, cy, R * 0.36, R * 0.36, c.bg); D.txt(ctx, r.name, cx, cy - 8, { color: c.text, size: nar ? 10 : 12, w: '800' }); D.txt(ctx, 'دورات مكتملة: ' + (st.cycles || 0), cx, cy + 12, { color: c.c5, size: 11, w: '700' });
      // المؤشر
      const dur = { G1: r.G1, S: r.S, G2: r.G2, M: r.M || 1 }; const f = Math.min(1, st.h / dur[st.ph]); const pa = ang[st.ph][0] + (ang[st.ph][1] - ang[st.ph][0]) * f;
      D.arrow(ctx, cx + Math.cos(pa) * R * 0.38, cy + Math.sin(pa) * R * 0.38, cx + Math.cos(pa) * (R + 16), cy + Math.sin(pa) * (R + 16), c.text, 4);
      // نقاط التحكم
      [['G1', ang.G1[1] - 0.12], ['G2', ang.G2[1]], ['M', ang.M[0] + (ang.M[1] - ang.M[0]) * 0.5]].forEach((q) => { const x = cx + Math.cos(q[1]) * (R + 8), y = cy + Math.sin(q[1]) * (R + 8); const blocked = (q[0] === 'G2' && st.stop === 'G2'); ctx.fillStyle = blocked ? '#dc2626' : '#111827'; ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fill(); D.txt(ctx, '✓', x, y + 1, { color: '#fff', size: 10, w: '800' }); });
      // G0
      if (p.g0 !== 'none') { const ga = ang.G1[0] + (ang.G1[1] - ang.G1[0]) * 0.5; const gx = cx + Math.cos(ga) * (R + 50), gy = cy + Math.sin(ga) * (R + 50); B.blob(ctx, gx, gy, 26, 18, st.stop === 'G0' ? '#a855f7' : '#e9d5ff', '#7c3aed', 2); D.txt(ctx, 'G0', gx, gy, { color: st.stop === 'G0' ? '#fff' : '#6b21a8', size: 14, w: '800' }); }
      // لوحة المعلومات
      const tx = nar ? 12 : W * 0.66, ty = nar ? H * 0.8 : H * 0.18, tw = nar ? W - 24 : W * 0.32;
      D.txt(ctx, PH_AR[st.ph], tx + tw / 2, ty, { color: PH_COL[st.ph], size: 16, w: '800' });
      const msg = st.stop === 'G0' ? (p.g0 === 'perm' ? 'خرجت الخلية إلى طور السكون الدائم G0 ولن تنقسم طيلة حياتها.' : 'الخلية في طور السكون المؤقت: لا تنقسم إلا في حالات خاصة مثل إصلاح نسيج تالف.') : st.stop === 'G2' ? 'توقفت الخلية عند نقطة التحكم: لم يتراكم بروتين السايكلين بكمية كافية لتنشيط الانقسام.' : PH_TXT[st.ph];
      B.para(ctx, D, msg, tx + tw / 2, ty + 26, tw, { color: c.text, size: nar ? 11 : 13 });
      if (!nar) { const ly = H * 0.62; [['G1', r.G1], ['S', r.S], ['G2', r.G2], ['M', r.M]].forEach((q, i) => { const y = ly + i * 24; ctx.fillStyle = PH_COL[q[0]]; ctx.fillRect(tx + tw - 14, y - 7, 14, 14); D.txt(ctx, q[0] + ': ' + (q[1] ? q[1] + ' ساعة (' + (d.sh[q[0]]).toFixed(1) + '%)' : 'غير مذكور في الجدول'), tx + tw - 22, y, { color: c.text, size: 12, w: '700', align: 'right' }); }); }
    },
    graph(p, d) {
      return { view: { xmin: 0, xmax: 4, ymin: 0, ymax: 14 }, xLabel: 'المرحلة', yLabel: 'ساعة', caption: 'جدول (1): أعمدة زمن مراحل الطور البيني للخلايا الثلاث (الأخضر الفاصولياء، الأزرق الفأر، البرتقالي الأمعاء). المرحلة S الأطول في الخلايا الثلاث.',
        draw(G) { const ctx = G.ctx; const cols = ['#16a34a', '#2563eb', '#ea580c']; ['G1', 'S', 'G2'].forEach((k, i) => { ['bean', 'mouse', 'gut'].forEach((cl, j) => { const v = B.CYCLE_TABLE[cl][k]; const x = i + 1 + (j - 1) * 0.24; ctx.fillStyle = cols[j]; ctx.globalAlpha = cl === p.cell ? 1 : 0.4; ctx.fillRect(G.X(x - 0.1), G.Y(v), G.X(x + 0.1) - G.X(x - 0.1), G.Y(0) - G.Y(v)); ctx.globalAlpha = 1; G.text(x, v, String(v), { color: G.colors().text, dy: -9 }); }); G.text(i + 1, 0, k, { color: G.colors().text, dy: 12, bold: true }); }); } };
    },
    live(p, d) { const r = d.r; return '\\text{الطور البيني} = ' + d.sh.interphase + '\\ \\text{ساعة}' + (r.M ? ' \\approx ' + (d.sh.interphase / d.sh.total * 100).toFixed(1) + '\\%' : ''); },
    results(p, d) {
      const r = d.r; const st = d.st || {}; const base = r.M ? 'من الدورة' : 'من الطور البيني';
      return [['المرحلة الحالية', PH_AR[st.ph || 'G1'], false], ['G1', r.G1 + '\\ \\text{ساعة} \\ (' + d.sh.G1.toFixed(1) + '\\%)'], ['S', r.S + '\\ \\text{ساعة} \\ (' + d.sh.S.toFixed(1) + '\\%)'], ['G2', r.G2 + '\\ \\text{ساعة} \\ (' + d.sh.G2.toFixed(1) + '\\%)'],
        ['M', r.M ? r.M + '\\ \\text{ساعة} \\ (' + d.sh.M.toFixed(1) + '\\%)' : 'غير مذكور في الجدول', !!r.M], ['النسب محسوبة', base, false], ['أطول مرحلة في الطور البيني', 'S (بناء DNA)', false], ['الحالة', st.stop === 'G0' ? 'في طور السكون G0' : st.stop === 'G2' ? 'متوقفة عند نقطة التحكم' : 'تتقدم في الدورة', false]];
    },
    steps(p, d) { const r = d.r; const tot = d.sh.total; return ['زمن الدورة = ' + ['G1', 'S', 'G2'].concat(r.M ? ['M'] : []).map((k) => r[k]).join(' + ') + ' = ' + tot + ' ساعة' + (r.M ? '' : ' (للطور البيني فقط).'), 'نسبة S = ' + r.S + ' ÷ ' + tot + ' × 100% = ' + d.sh.S.toFixed(1) + '%.', r.M ? 'نسبة الطور البيني = ' + d.sh.interphase + ' ÷ ' + tot + ' ≈ ' + (d.sh.interphase / tot * 100).toFixed(1) + '% (قريبة من 90% في الكتاب).' : 'لا يعطي الجدول زمن طور الانقسام لهذه الخلية.']; },
    explain(a, b) {
      if (a.cell !== b.cell) { const r = B.CYCLE_TABLE[b.cell]; return ['اخترت ' + r.name + ': G1 = ' + r.G1 + '، S = ' + r.S + '، G2 = ' + r.G2 + ' ساعة. ' + (r.M ? 'وزمن الانقسام ساعتان.' : 'زمن الانقسام غير مذكور في الجدول.')]; }
      if (a.cyclin !== b.cyclin) return [b.cyclin ? 'تراكم بروتين السايكلين بكمية كافية وارتباطه مع بروتين آخر ينشط الانقسام المتساوي.' : 'بدون تراكم كافٍ من السايكلين تتوقف عملية الانقسام: ستتوقف الخلية عند نقطة التحكم قبل الانقسام.'];
      if (a.g0 !== b.g0) return [b.g0 === 'perm' ? 'طور السكون الدائم: تبقى خلايا الدم الحمراء الناضجة والعضلات الهيكلية والعصبونات في G0 طيلة حياتها.' : b.g0 === 'temp' ? 'طور السكون المؤقت: خلايا الكبد لها قدرة عالية على الانقسام، لكنها لا تنقسم إلا في حالات خاصة مثل إصلاح أنسجة الكبد التالفة.' : 'تستمر الخلية في الدورة دون الخروج إلى G0.'];
      if (a.heal !== b.heal) return [b.heal ? 'حدث تلف في النسيج: تعود خلايا الكبد من السكون المؤقت إلى الانقسام لإصلاحه.' : 'لا يوجد تلف: تبقى الخلية في السكون المؤقت.'];
      return [];
    },
    learn: ['**دورة الخلية (ص 35):** الطور البيني (90% من الدورة) وطور انقسام الخلية (الانقسام المتساوي وانقسام السيتوبلازم).', '**جدول (1):** G1 نشاط أيضي ونمو؛ S تضاعف DNA؛ G2 استكمال بناء البروتينات و RNA وتخزين الطاقة وإنتاج إنزيمات الانقسام.', '**G0 (ص 36):** طور السكون الدائم (خلايا الدم الحمراء الناضجة، العضلات الهيكلية، العصبونات) وطور السكون المؤقت (خلايا الكبد).', '**تنظيم دورة الخلية (ص 36):** ثلاث نقاط تحكم عند G1 و G2 و M، يتحكم بها عامل إنزيمي وعامل وراثي؛ تراكم بروتين السايكلين بكميات كافية وارتباطه مع بروتين آخر ينشط الانقسام المتساوي.'],
    challenges: [
      { q: 'سؤال الكتاب (ص 36): ما النسبة المئوية لمراحل دورة خلية نبات الفاصولياء إذا كان زمن الانقسام ساعتين؟ اختر الخلية لترى النسب.', hint: 'المجموع 5 + 7 + 5 + 2 = 19 ساعة.', init: { cell: 'gut', g0: 'none', cyclin: true }, check: (p) => p.cell === 'bean', why: (p, d) => 'G1 ≈ ' + d.sh.G1.toFixed(1) + '%، S ≈ ' + d.sh.S.toFixed(1) + '%، G2 ≈ ' + d.sh.G2.toFixed(1) + '%، M ≈ ' + d.sh.M.toFixed(1) + '%.' },
      { q: 'اختر الخلية التي تكون فيها المرحلة **S أطول** من المراحل في الخلايا الثلاث.', hint: 'قارن أعمدة S: 7 و 10 و 12.', init: { cell: 'bean', g0: 'none', cyclin: true }, check: (p) => p.cell === 'gut' },
      { q: 'اجعل الخلية **تتوقف قبل الانقسام** عند نقطة التحكم.', hint: 'أوقف تراكم بروتين السايكلين.', init: { cell: 'bean', g0: 'none', cyclin: true }, check: (p) => !p.cyclin },
      { q: 'مثّل حالة **العصبونات** في الإنسان.', hint: 'تبقى طيلة حياتها في طور السكون الدائم.', init: { cell: 'bean', g0: 'none', cyclin: true }, check: (p) => p.g0 === 'perm' }
    ],
    tutor: [
      { q: 'أي مرحلة أطول في الطور البيني؟', k: ['اطول', 'اكبر', 'زمنا'], a: (p, d) => 'في ' + d.r.name + ' أطولها S (' + d.r.S + ' ساعة)؛ وهي الأطول أيضاً في الخلايا الثلاث بالجدول (1).' },
      { q: 'ما دور السايكلين؟', k: ['سايكلين', 'منبه'], a: () => 'تراكم بروتين السايكلين (بروتين منبه) بكميات كافية وارتباطه مع بروتين آخر يؤدي إلى تنشيط الانقسام المتساوي، وبدونه تتوقف عملية الانقسام (ص 36).' },
      { q: 'ما الفرق بين السكون الدائم والمؤقت؟', k: ['سكون', 'g0', 'دائم', 'مؤقت'], a: () => 'الدائم: خلايا لا تنقسم طيلة حياتها (الدم الحمراء الناضجة، العضلات الهيكلية، العصبونات). المؤقت: خلايا الكبد، تنقسم فقط في حالات خاصة مثل إصلاح الأنسجة التالفة.' }
    ]
  });

  /* ======================= 3-3 الانقسام المتساوي ======================= */
  // مواقع الكروموسومات في كل دور
  function drawMitosis(ctx, W, H, p, c, n2, st) {
    const nar = narrow(W); const plant = p.kind === 'plant'; const s = p.s; const t = (st && st.t) || 0;
    const cx = W / 2, cy = H * 0.5, RX = Math.min(W * 0.42, 330), RY = Math.min(H * 0.36, 190);
    const pairs = n2 / 2; const cols = B.PAL; const L = Math.max(12, Math.min(34, 300 / Math.sqrt(n2 * 6)));
    const cellShape = (x, y, rx, ry, pinch) => {
      ctx.beginPath();
      if (plant) { ctx.rect(x - rx, y - ry, 2 * rx, 2 * ry); }
      else { for (let i = 0; i <= 80; i++) { const a = i / 80 * Math.PI * 2; const k = 1 - pinch * Math.pow(Math.abs(Math.sin(a)), 6) * 0; ctx.lineTo(x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * (1 - pinch * Math.exp(-Math.pow(Math.cos(a) / 0.18, 2)))); } ctx.closePath(); }
      ctx.fillStyle = plant ? 'rgba(220,252,231,.95)' : 'rgba(254,226,226,.9)'; ctx.fill(); ctx.strokeStyle = plant ? '#15803d' : '#b91c1c'; ctx.lineWidth = plant ? 6 : 3; ctx.stroke();
    };
    const pole = (x, y) => { if (plant) return; ctx.fillStyle = '#111827'; ctx.fillRect(x - 7, y - 2.5, 14, 5); ctx.fillRect(x - 2.5, y - 7, 5, 14); for (let a = 0; a < 6.3; a += 0.5) { ctx.strokeStyle = 'rgba(17,24,39,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 16, y + Math.sin(a) * 16); ctx.stroke(); } };
    const spindle = (xl, xr, targets) => { ctx.strokeStyle = 'rgba(100,116,139,.55)'; ctx.lineWidth = 1; targets.forEach((tg) => { ctx.beginPath(); ctx.moveTo(xl, cy); ctx.lineTo(tg[0], tg[1]); ctx.stroke(); ctx.beginPath(); ctx.moveTo(xr, cy); ctx.lineTo(tg[0], tg[1]); ctx.stroke(); }); };
    const colOf = (k) => cols[Math.floor(k / 2) % cols.length];
    if (s <= 4) cellShape(cx, cy, RX, RY, s === 4 && !plant ? 0.55 : 0);
    if (s === 0) { // الطور البيني: كروماتين خيطي داخل النواة
      B.blob(ctx, cx, cy, RY * 0.6, RY * 0.6, 'rgba(196,181,253,.6)', '#6d28d9', 3);
      for (let k = 0; k < n2; k++) { ctx.strokeStyle = colOf(k); ctx.lineWidth = 1.5; ctx.beginPath(); let x = cx + Math.cos(k * 2.4) * RY * 0.3, y = cy + Math.sin(k * 2.4) * RY * 0.3; ctx.moveTo(x, y); for (let i = 0; i < 6; i++) { x += Math.cos(k + i * 1.7) * 9; y += Math.sin(k * 1.3 + i) * 9; ctx.lineTo(x, y); } ctx.stroke(); }
      B.blob(ctx, cx + RY * 0.2, cy - RY * 0.15, RY * 0.12, RY * 0.12, '#5b21b6'); if (!plant) pole(cx - RX * 0.75, cy - RY * 0.5);
      return;
    }
    if (s === 1) { // التمهيدي: كروموسومات متضاعفة، الغلاف يتحلل
      ctx.setLineDash([6, 6]); B.blob(ctx, cx, cy, RY * 0.68, RY * 0.68, 'rgba(196,181,253,.25)', '#6d28d9', 2); ctx.setLineDash([]);
      for (let k = 0; k < n2; k++) { const a = k * 2.399, r = RY * 0.55 * Math.sqrt((k + 0.5) / n2); B.chromosome(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, L, k * 0.7, colOf(k), true, Math.max(3, L * 0.22)); }
      pole(cx - RX * 0.85, cy); pole(cx + RX * 0.85, cy); if (plant) { ctx.strokeStyle = 'rgba(21,128,61,.4)'; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(cx - RX * 0.8, cy + i * 12); ctx.lineTo(cx + RX * 0.8, cy + i * 12); ctx.stroke(); } }
      return;
    }
    if (s === 2) { // الاستوائي
      const gap = Math.min((2 * RY - 20) / n2, L * 0.9); const tg = [];
      for (let k = 0; k < n2; k++) { const y = cy - (n2 - 1) * gap / 2 + k * gap; tg.push([cx, y]); }
      spindle(cx - RX * 0.85, cx + RX * 0.85, tg); pole(cx - RX * 0.85, cy); pole(cx + RX * 0.85, cy);
      tg.forEach((q, k) => B.chromosome(ctx, q[0], q[1], L, Math.PI / 2, colOf(k), true, Math.max(3, L * 0.22)));
      ctx.strokeStyle = c.c2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(cx, cy - RY); ctx.lineTo(cx, cy + RY); ctx.stroke(); ctx.setLineDash([]);
      return;
    }
    if (s === 3) { // الانفصالي: الكروماتيدات تتباعد
      const gap = Math.min((2 * RY - 20) / n2, L * 0.9); const f = 0.35 + 0.35 * Math.min(1, (t % 2.2) / 1.8); const tg = [];
      for (let k = 0; k < n2; k++) { const y = cy - (n2 - 1) * gap / 2 + k * gap; tg.push([cx - RX * f, y], [cx + RX * f, y]); }
      spindle(cx - RX * 0.85, cx + RX * 0.85, tg); pole(cx - RX * 0.85, cy); pole(cx + RX * 0.85, cy);
      tg.forEach((q, i) => { ctx.save(); ctx.translate(q[0], q[1]); ctx.strokeStyle = colOf(Math.floor(i / 2)); ctx.lineWidth = Math.max(3, L * 0.22); ctx.lineCap = 'round'; ctx.beginPath(); const dir = i % 2 ? 1 : -1; ctx.moveTo(-dir * L * 0.5, -L * 0.35); ctx.lineTo(0, 0); ctx.lineTo(-dir * L * 0.5, L * 0.35); ctx.stroke(); ctx.restore(); });
      return;
    }
    // النهائي (4) وانقسام السيتوبلازم (5)
    const two = s === 5; const dx = two ? RX * 0.55 : RX * 0.55;
    if (two) { cellShape(cx - RX * 0.55, cy, RX * 0.44, RY * 0.8, 0); cellShape(cx + RX * 0.55, cy, RX * 0.44, RY * 0.8, 0); }
    if (s === 4 && plant) { ctx.strokeStyle = '#15803d'; ctx.lineWidth = 6; const f = Math.min(1, (t % 2.2) / 1.6); ctx.beginPath(); ctx.moveTo(cx, cy - RY * f); ctx.lineTo(cx, cy + RY * f); ctx.stroke(); D.txt(ctx, 'الصفيحة الخلوية', cx, cy - RY - 14, { color: '#15803d', size: 13, w: '800' }); }
    if (s === 4 && !plant) D.txt(ctx, 'تخصّر السيتوبلازم', cx, cy - RY - 14, { color: '#b91c1c', size: 13, w: '800' });
    [-1, 1].forEach((sg) => {
      const nx = cx + sg * dx; B.blob(ctx, nx, cy, RY * 0.42, RY * 0.42, 'rgba(196,181,253,.45)', '#6d28d9', 2);
      for (let k = 0; k < n2; k++) { const a = k * 2.399, r = RY * 0.34 * Math.sqrt((k + 0.5) / n2); ctx.strokeStyle = colOf(k); ctx.lineWidth = Math.max(2, L * 0.16); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(nx + Math.cos(a) * r - 4, cy + Math.sin(a) * r - L * 0.25); ctx.lineTo(nx + Math.cos(a) * r + 4, cy + Math.sin(a) * r + L * 0.25); ctx.stroke(); }
      pole(nx + sg * RY * 0.6, cy - RY * 0.45);
    });
  }
  reg({
    id: 'mitosis', order: 2, lesson: '3-3 / 4-3', lessonTitle: 'انقسام الخلية والفروق بين الخلية النباتية والحيوانية', page: 37,
    titleAr: 'الانقسام المتساوي خطوة بخطوة (حيوانية / نباتية)', titleEn: 'Mitosis Step by Step (Animal / Plant)', tags: 'انقسام متساوي تمهيدي استوائي انفصالي نهائي سنترومير كروماتيد مغزل صفيحه خلويه تخصر',
    formula: '\\text{2n} \\to \\text{2n} + \\text{2n}',
    book: 'أدوار الانقسام المتساوي (ص 38): التمهيدي (الأطول)، الاستوائي، الانفصالي (الأقصر)، النهائي، ثم انقسام السيتوبلازم (ص 39). جدول (2) ص 39: الفروق بين الخلية النباتية والحيوانية.',
    summary: 'تنقسم الخلية الجسمية إلى خليتين متماثلتين في كل منهما العدد نفسه من الكروموسومات (2n). أدخل العدد 2n وانتقل بين الأدوار، وقارن بين الخلية الحيوانية (مريكزات، تخصّر) والنباتية (مغزل من الأنيبيبات الدقيقة، صفيحة خلوية).',
    vars: [['\\text{2n}', 'العدد الكروموسومي في الخلية الجسمية', '\\text{كروموسوم}', 'عدد زوجي موجب (حتى 60 للعرض)'], ['\\text{الدور}', 'أدوار الانقسام بحسب الكتاب', '—', '6 مراحل'], ['\\text{الكروماتيد}', 'أحد القسمين المتطابقين المكونين للكروموسوم', '—', '2 لكل كروموسوم بعد S']],
    assumptions: ['الأشكال تخطيطية (نموذج مبسّط لأغراض التعليم) وألوان الكروموسومات تميّز الأزواج المتماثلة فقط.'],
    params: [
      { key: 's', label: '\\text{الدور}', type: 'stage', stages: B.MITOSIS, value: 0 },
      { key: 'kind', label: '\\text{نوع الخلية}', type: 'select', options: [['animal', 'خلية حيوانية'], ['plant', 'خلية نباتية']], value: 'animal' },
      n2Param(4)
    ],
    play: { mode: 'stage', key: 's', interval: 2.2 }, initState: () => ({ t: 0 }), tick(st, p, d, dt) { st.t += dt; },
    randomize() { const v = [4, 6, 8, 12]; return { n2: String(v[Math.floor(Math.random() * v.length)]), s: Math.floor(Math.random() * 6) }; },
    canvasHint: 'استعمل زري المرحلة أو «تشغيل». غيّر 2n لترى أن العدد يبقى ثابتاً في الخليتين الناتجتين.',
    compute(p) { const n2 = n2Of(p); if (!n2) return { err: B.validate2n(ML.parseNum(p.n2)) || 'للعرض الواضح اختر عدداً حتى 60.' }; return { n2: n2, cnt: B.mitosisCounts(n2)[p.s] }; },
    drawCustom(ctx, W, H, p, d, c) {
      if (d.err) { B.para(ctx, D, d.err, W / 2, H / 2, W - 40, { color: c.c2, size: 14 }); return; }
      D.txt(ctx, (p.s + 1) + '. ' + B.MITOSIS[p.s], W / 2, 18, { color: c.c5, size: 16, w: '800' });
      drawMitosis(ctx, W, H, p, c, d.n2, d.st);
      D.txt(ctx, 'خلايا: ' + d.cnt.cells + '   •   كروموسومات في الخلية: ' + d.cnt.chrom + '   •   كروماتيدات: ' + d.cnt.chromatids, W / 2, H - 16, { color: c.text, size: narrow(W) ? 11 : 14, w: '800' });
    },
    live(p, d) { return d.err ? '\\text{إدخال غير صالح}' : '\\text{الدور: ' + B.MITOSIS[p.s] + '}'; },
    results(p, d) {
      if (d.err) return [['خطأ في الإدخال', d.err, false]];
      const DESC = ['الكروماتين على شكل خيوط داخل النواة؛ تضاعف DNA في S فأصبح كل كروموسوم كروماتيدين.', 'أطول الأدوار: تتمايز الكروموسومات، كل منها كروماتيدان يرتبطان بالسنترومير؛ ' + (p.kind === 'animal' ? 'يتحرك كل جسم مركزي إلى قطب وتنشأ عنه خيوط المغزل' : 'تنشأ الخيوط المغزلية من الأنيبيبات الدقيقة في الهيكل الخلوي') + '؛ يتحلل الغلاف النووي وتختفي النوية.', 'تصطف الكروموسومات فرادى في وسط الخلية مرتبطة بالخيوط المغزلية بوساطة السنترومير.', 'أقصر الأدوار: ينفصل السنترومير وتتباعد الكروماتيدات الشقيقة كروموسومات منفردة نحو القطبين.', 'تختفي خيوط المغزل، ' + (p.kind === 'animal' ? 'ويبدأ التخصر في السيتوبلازم، ويتكون جسم مركزي جديد في كل قطب' : 'وتتكون الصفيحة الخلوية من وسط الخلية وتمتد إلى أطرافها') + '، ويظهر الغشاء النووي والنوية.', 'ينفصل السيتوبلازم إلى قسمين، كل منهما بنواة فيها العدد نفسه من الكروموسومات.'];
      return [['الدور', B.MITOSIS[p.s], false], ['ماذا يحدث', DESC[p.s], false], ['عدد الخلايا', '' + d.cnt.cells, false], ['الكروموسومات في كل خلية', '' + d.cnt.chrom, false], ['الكروماتيدات في كل خلية', '' + d.cnt.chromatids, false], ['الناتج النهائي', '2 خليتان، في كل منهما ' + d.n2 + ' كروموسوماً (2n)', false]];
    },
    steps(p) { return [p.kind === 'animal' ? 'الحيوانية: المغزل من المريكزات في قطبي الخلية، وينقسم السيتوبلازم بالتخصّر.' : 'النباتية: لا مريكزات؛ المغزل من الأنيبيبات الدقيقة في الهيكل الخلوي، وتتكون صفيحة خلوية من وسط الخلية إلى أطرافها.', 'الدور التمهيدي أطول الأدوار (أكثر من نصف زمن الانقسام)، والانفصالي أقصرها (ص 38).']; },
    explain(a, b, da, db) {
      if (a.kind !== b.kind) return [b.kind === 'plant' ? 'في الخلية النباتية لا توجد مريكزات، وتنشأ الخيوط المغزلية من الأنيبيبات الدقيقة، وينقسم السيتوبلازم بتكوين صفيحة خلوية (جدول 2).' : 'في الخلية الحيوانية ينشأ المغزل من المريكزات في القطبين، وينقسم السيتوبلازم بالتخصّر (جدول 2).'];
      if (a.n2 !== b.n2 && !db.err) return ['أصبح 2n = ' + db.n2 + '. لاحظ أن كل خلية ناتجة تحصل على ' + db.n2 + ' كروموسوماً أيضاً: الانقسام المتساوي يحافظ على العدد.'];
      if (a.s !== b.s && !db.err) return ['انتقلت إلى ' + B.MITOSIS[b.s] + '.'];
      return [];
    },
    learn: ['**أين؟ (ص 37):** يحدث الانقسام المتساوي في الخلايا الجسمية، ويسمى في وحيدات الخلية (الأميبا والبراميسيوم) الانشطار الثنائي؛ هدفه التكاثر والنمو وإصلاح الخلايا التالفة وتجديد الأنسجة.', '**الأدوار (ص 38):** التمهيدي ← الاستوائي ← الانفصالي ← النهائي، ثم انقسام السيتوبلازم.', '**جدول (2) ص 39:** النباتية: صفيحة خلوية من الوسط إلى الأطراف، والمغزل من الأنيبيبات الدقيقة في الهيكل الخلوي في وسط الخلية. الحيوانية: تخصّر، والمغزل من المريكزات (السنتريولات) في قطبي الخلية.', '**أهمية الانقسام المتساوي (س2 ص 41):** زيادة عدد خلايا الجسم دون تغيير معلومات المادة الوراثية.'],
    challenges: [
      { q: 'سؤال الكتاب: خلية في ورقة نبات تحتوي **12 كروموسوماً** انقسمت انقساماً متساوياً. أدخل العدد، واختر الخلية النباتية، وانتقل إلى نهاية الانقسام.', hint: '2n = 12، نوع الخلية نباتية، المرحلة الأخيرة.', init: { n2: '4', kind: 'animal', s: 0 }, check: (p, d) => !d.err && d.n2 === 12 && p.kind === 'plant' && p.s === 5, why: () => 'تنتج خليتان في كل منهما 12 كروموسوماً.' },
      { q: 'انتقل إلى **أقصر** أدوار الانقسام زمناً.', hint: 'الدور الذي ينفصل فيه السنترومير.', init: { s: 0 }, check: (p) => p.s === 3 },
      { q: 'انتقل إلى الدور الذي **تصطف فيه الكروموسومات فرادى في وسط الخلية**.', hint: 'الاستوائي.', init: { s: 5 }, check: (p) => p.s === 2 }
    ],
    tutor: [
      { q: 'كم كروموسوماً في كل خلية ناتجة؟', k: ['كم', 'ناتجه', 'كروموسوم'], a: (p, d) => (d.err ? d.err : 'كل خلية ناتجة تحتوي ' + d.n2 + ' كروموسوماً، مثل الخلية الأم.') },
      { q: 'ما الفرق بين انقسام الخلية النباتية والحيوانية؟', k: ['الفرق', 'نباتيه', 'حيوانيه'], a: () => 'جدول (2): النباتية تكوّن صفيحة خلوية والمغزل فيها من الأنيبيبات الدقيقة؛ الحيوانية تنقسم بالتخصر والمغزل فيها من المريكزات.' },
      { q: 'لماذا لا يُقبل عدد فردي؟', k: ['فردي', 'زوجي', 'لا يقبل'], a: () => 'لأن الكروموسومات في الخلية الجسمية أزواج متماثلة (مثل 46 = 23 + 23)، فالعدد 2n زوجي دائماً.' }
    ]
  });

  /* ======================= 5-3 الأورام ======================= */
  reg({
    id: 'tumors', order: 3, lesson: '5-3', lessonTitle: 'الأورام', page: 40,
    titleAr: 'الأورام: عندما تفقد الخلية السيطرة على الانقسام', titleEn: 'Tumours: Losing Control of Cell Division', tags: 'ورم خبيث سرطان غير خبيث انقسام غير منظم انويه كبيره',
    formula: '\\text{فقدان السيطرة على الانقسام} \\to \\text{انقسامات غير منظمة} \\to \\text{ورم}',
    book: 'قد تفقد الخلية سيطرتها على التنظيم والتحكم بالانقسام الخلوي، فتبدأ بسلسلة انقسامات غير منظمة ينتج عنها كتل غير طبيعية تسمى الورم: ورم خبيث (السرطان) تنتشر خلاياه في الجسم، وورم غير خبيث (ص 40).',
    summary: 'في النسيج الطبيعي تنقسم الخلايا بانتظام لتعويض التالف فقط. عند فقدان السيطرة تنقسم الخلايا دون توقف وتظهر خلايا غير طبيعية بأنوية كبيرة (الشكل 7)؛ في الورم الخبيث تنتشر الخلايا إلى أماكن أخرى.',
    vars: [['\\text{السيطرة}', 'تنظيم الانقسام الخلوي', '—', 'تعمل / مفقودة'], ['\\text{نوع الورم}', 'خبيث (سرطان) / غير خبيث', '—', 'من الكتاب'], ['\\text{عدد الخلايا}', 'عدد الخلايا في النموذج', '\\text{خلية}', 'نموذج للعرض']],
    assumptions: ['معدلات الانقسام وعدد الخلايا نموذج مبسّط لأغراض التعليم؛ الكتاب لا يذكر أرقاماً.'],
    params: [
      { key: 'ctrl', label: '\\text{السيطرة على الانقسام}', type: 'toggle', value: true, on: 'تعمل (نسيج طبيعي)', off: 'مفقودة (انقسامات غير منظمة)' },
      { key: 'type', label: '\\text{نوع الورم}', type: 'select', options: [['benign', 'ورم غير خبيث'], ['malignant', 'ورم خبيث (سرطان)']], value: 'benign', hidden: (p) => p.ctrl }
    ],
    play: { mode: 'time', speed: 1 },
    initState() { const cells = []; for (let i = 0; i < 14; i++) cells.push({ x: i, y: 0, ab: false, age: Math.random() * 3 }); return { cells: cells, t: 0, spread: 0 }; },
    resetOn: ['ctrl', 'type'],
    tick(st, p, d, dt) {
      st.t += dt; const C = st.cells;
      C.forEach((cl) => { cl.age += dt; });
      if (p.ctrl) { // تعويض التالف فقط: يبقى العدد ثابتاً
        if (Math.random() < dt * 0.6) { const i = Math.floor(Math.random() * C.length); C[i].age = 0; C[i].flash = 0.6; }
      } else {
        const ab = C.filter((cl) => cl.ab); if (!ab.length) { const i = 6; C[i].ab = true; }
        if (C.length < 140) C.filter((cl) => cl.ab && cl.age > 1.1).forEach((cl) => { cl.age = 0; const a = Math.random() * Math.PI; C.push({ x: cl.x + Math.cos(a) * 0.9, y: Math.max(0.6, cl.y + Math.sin(a) * 0.9), ab: true, age: 0 }); });
        if (p.type === 'malignant' && st.t > 2 && C.length > 30 && Math.random() < dt * 1.2) { const src = C.filter((cl) => cl.ab)[Math.floor(Math.random() * C.filter((cl) => cl.ab).length)]; if (src && !src.mig) { src.mig = true; st.spread++; } }
        C.forEach((cl) => { if (cl.mig) { cl.x += dt * 2.2; cl.y += dt * (Math.random() - 0.3); } });
      }
      C.forEach((cl) => { if (cl.flash) cl.flash = Math.max(0, cl.flash - dt); });
    },
    isDone(st) { return st.t > 14; },
    compute(p) { return {}; },
    drawCustom(ctx, W, H, p, d, c) {
      const st = d.st || { cells: [] }; const nar = narrow(W);
      const cw = Math.min(46, (W - 40) / 15), base = H * 0.72, x0 = (W - cw * 14) / 2;
      ctx.fillStyle = 'rgba(148,163,184,.25)'; ctx.fillRect(0, base + cw * 0.55, W, H - base); D.txt(ctx, 'غشاء قاعدي / نسيج تحت الطبقة', W / 2, base + cw * 1.1, { color: c.muted, size: 11 });
      // وعاء دموي للانتشار
      ctx.fillStyle = 'rgba(220,38,38,.15)'; ctx.fillRect(W - (nar ? 60 : 110), 30, nar ? 50 : 90, H - 80); D.txt(ctx, 'وعاء دموي', W - (nar ? 35 : 65), 22, { color: '#b91c1c', size: 11, w: '700' });
      (st.cells || []).forEach((cl) => {
        const x = x0 + cw * (cl.x + 0.5), y = base - cl.y * cw * 0.85; const r = cw * 0.45;
        D.rr(ctx, x - r, y - r, 2 * r, 2 * r, 6); ctx.fillStyle = cl.ab ? 'rgba(251,113,133,.85)' : cl.flash ? 'rgba(134,239,172,.95)' : 'rgba(254,215,170,.95)'; ctx.fill(); ctx.strokeStyle = cl.ab ? '#be123c' : '#c2410c'; ctx.lineWidth = 1.5; ctx.stroke();
        B.blob(ctx, x, y, r * (cl.ab ? 0.62 : 0.3), r * (cl.ab ? 0.55 : 0.3), cl.ab ? '#7f1d1d' : '#7c2d12');
      });
      const n = (st.cells || []).length, nab = (st.cells || []).filter((x) => x.ab).length;
      D.txt(ctx, p.ctrl ? 'نسيج طبيعي: تنقسم الخلايا لتعويض التالف فقط (الأخضر)' : p.type === 'malignant' ? 'ورم خبيث: انقسامات غير منظمة وتنتشر خلاياه في الجسم' : 'ورم غير خبيث: كتلة غير طبيعية من الخلايا', W / 2, 20, { color: p.ctrl ? c.c3 : c.c2, size: nar ? 12 : 15, w: '800' });
      D.txt(ctx, 'الخلايا: ' + n + '  •  غير طبيعية: ' + nab + (p.type === 'malignant' && !p.ctrl ? '  •  منتشرة: ' + (st.spread || 0) : ''), W / 2, 44, { color: c.text, size: 12, w: '700' });
      if (!p.ctrl) { const cx = x0 + cw * 3, cy = H * 0.3; D.txt(ctx, 'خلية طبيعية', cx - 40, cy - 34, { color: c.text, size: 11 }); B.blob(ctx, cx - 40, cy, 20, 20, 'rgba(254,215,170,.95)', '#c2410c', 2); B.blob(ctx, cx - 40, cy, 6, 6, '#7c2d12'); D.txt(ctx, 'غير طبيعية: نواة كبيرة', cx + 40, cy - 34, { color: c.text, size: 11 }); B.blob(ctx, cx + 40, cy, 20, 20, 'rgba(251,113,133,.85)', '#be123c', 2); B.blob(ctx, cx + 40, cy, 13, 11, '#7f1d1d'); }
    },
    live(p, d) { const st = d.st || { cells: [] }; return '\\text{عدد الخلايا} = ' + st.cells.length; },
    results(p, d) { const st = d.st || { cells: [] }; const nab = st.cells.filter((x) => x.ab).length; return [['حالة التنظيم', p.ctrl ? 'السيطرة على الانقسام تعمل' : 'مفقودة: انقسامات غير منظمة', false], ['عدد الخلايا (نموذج)', '' + st.cells.length, false], ['خلايا غير طبيعية', '' + nab, false], ['حجم أنوية الخلايا غير الطبيعية', 'أكبر من أنوية الخلايا الطبيعية (الشكل 7)', false], ['انتشار الخلايا', p.ctrl ? 'لا' : p.type === 'malignant' ? 'نعم — تنتشر خلايا السرطان في الجسم (' + (st.spread || 0) + ')' : 'لا ينتشر (ورم غير خبيث)', false]]; },
    steps() { return ['تفقد الخلية سيطرتها على التنظيم والتحكم بالانقسام الخلوي.', 'تبدأ سلسلة انقسامات غير منظمة.', 'تتكون كتلة غير طبيعية من الخلايا (ورم): غير خبيث، أو خبيث (سرطان) تنتشر خلاياه.', 'يُعزى تحول الخلايا السليمة إلى سرطانية إلى حدوث تغييرات في المادة الجينية الموروثة (ص 40).']; },
    explain(a, b) { if (a.ctrl !== b.ctrl) return [b.ctrl ? 'عادت السيطرة: الخلايا تنقسم بانتظام لتعويض التالف فقط فيبقى عددها ثابتاً تقريباً.' : 'فقدت الخلية السيطرة على الانقسام: اضغط «تشغيل» لترى الانقسامات غير المنظمة وتكوّن الورم.']; if (a.type !== b.type) return [b.type === 'malignant' ? 'الورم الخبيث (السرطان) تنتشر خلاياه في الجسم.' : 'الورم غير الخبيث كتلة غير طبيعية لا تنتشر خلاياها.']; return []; },
    onDone(st, p) { return [p.ctrl ? 'بعد مدة طويلة بقي عدد الخلايا ثابتاً تقريباً: الانقسام منظم.' : 'تضاعف عدد الخلايا غير الطبيعية بسرعة' + (p.type === 'malignant' ? ' وانتشر بعضها عبر الوعاء الدموي.' : ' وتكونت كتلة (ورم).')]; },
    learn: ['**الورم (ص 40):** عندما تفقد الخلية سيطرتها على التنظيم والتحكم بالانقسام الخلوي، تبدأ بسلسلة انقسامات غير منظمة ينتج عنها كتل غير طبيعية تسمى الورم.', '**نوعاه:** ورم خبيث أو السرطان تنتشر خلاياه في الجسم، وورم غير خبيث.', '**الشكل (7):** قارن الخلايا الطبيعية وغير الطبيعية من حيث حجم الأنوية.', '**السبب:** يُعزى تحول الخلايا السليمة إلى خلايا سرطانية إلى تغييرات في المادة الجينية الموروثة.'],
    challenges: [
      { q: 'مثّل حالة **السرطان**: خلايا تنقسم دون تنظيم وتنتشر في الجسم.', hint: 'أوقف السيطرة على الانقسام، واختر ورماً خبيثاً.', init: { ctrl: true, type: 'benign' }, check: (p) => !p.ctrl && p.type === 'malignant' },
      { q: 'مثّل **ورماً غير خبيث**.', hint: 'السيطرة مفقودة، ونوع الورم غير خبيث.', init: { ctrl: true, type: 'malignant' }, check: (p) => !p.ctrl && p.type === 'benign' }
    ],
    tutor: [
      { q: 'ما الفرق بين الورم الخبيث وغير الخبيث؟', k: ['خبيث', 'الفرق'], a: () => 'الخبيث (السرطان) تنتشر خلاياه في الجسم، أما غير الخبيث فيبقى كتلة غير طبيعية في مكانه (ص 40).' },
      { q: 'كيف أميز الخلية غير الطبيعية؟', k: ['اميز', 'نواه', 'غير طبيعيه'], a: () => 'من الشكل (7): الخلايا غير الطبيعية لها أنوية كبيرة مقارنة بالطبيعية.' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
