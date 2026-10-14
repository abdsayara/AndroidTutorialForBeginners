/* الكيمياء — الوحدة الثانية: الحسابات الكيميائية (ص29–49) */
(function (root) {
  'use strict';
  const ML = root.ML; const C = ML.chem; const D = ML.pdraw; const R = ML.chemDraw;
  const S = 'g10-chem', U = 2;
  const reg = (o) => ML.register(Object.assign({ subject: S, unit: U, custom: true }, o));
  const r2 = (v, k) => C.round(v, k === undefined ? 2 : k);
  const sci = (v) => { if (!(v > 0)) return '0'; const e = Math.floor(Math.log10(v)); const m = v / Math.pow(10, e); return r2(m, 3) + '×10' + String(e).split('').map((c) => (c === '-' ? '⁻' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c])).join(''); };
  const M = (f) => C.molarMass(f);

  /* ======================= نشاط (1) قانون حفظ الكتلة ص31 ======================= */
  const M_KI = M('KI'), M_PB = M('Pb(NO3)2'), M_PBI2 = M('PbI2');
  reg({
    id: 'conservation-mass', order: 1, lesson: '2-1', lessonTitle: 'قوانين الاتحاد الكيميائي', page: 31,
    titleAr: 'قانون حفظ الكتلة', titleEn: 'Law of Conservation of Mass',
    tags: 'حفظ الكتلة يوديد البوتاسيوم نترات الرصاص راسب يوديد الرصاص ميزان دورق نظام مغلق نشاط 1 لافوازييه',
    formula: '\\text{مجموع كتل المتفاعلات} = \\text{مجموع كتل النواتج}',
    book: 'نشاط (1) ص31: إذابة (0.5) غم KI في 100 مل ماء، و(0.5) غم Pb(NO₃)₂ في 100 مل ماء؛ محلول KI في الدورق، ومحلول نترات الرصاص في أنبوب داخل الدورق، ثم السدّ والوزن (القراءة 1)، ثم الخلط والوزن (القراءة 2). المعادلة: {{2KI(aq) + Pb(NO₃)₂(aq) → PbI₂(s) + 2KNO₃(aq)}}.',
    summary: 'عند خلط المحلولين يتكوّن راسب أصفر من يوديد الرصاص، ولا تتغير قراءة الميزان: مجموع كتل المواد قبل التفاعل يساوي مجموع كتلها بعده (قانون حفظ الكتلة).',
    vars: [['m_{\\text{KI}}', 'كتلة يوديد البوتاسيوم', '\\text{غم}', 'الكتاب: 0.5'], ['m_{\\text{Pb(NO}_3)_2}', 'كتلة نترات الرصاص', '\\text{غم}', 'الكتاب: 0.5'], ['\\text{القراءة}', 'قراءة الميزان الحساس', '\\text{غم}', 'قبل الخلط وبعده']],
    assumptions: ['كتلة الدورق والأنبوب والسدادة (250 غم معاً): ' + C.SIMPLE + '. الكتل المولية من الجدول الدوري ص123.'],
    params: [
      { key: 'mKI', label: 'm_{\\text{KI}}\\ \\text{(غم)}', min: 0.1, max: 1, step: 0.1, value: 0.5 },
      { key: 'mPb', label: 'm_{\\text{Pb(NO}_3)_2}\\ \\text{(غم)}', min: 0.1, max: 1, step: 0.1, value: 0.5 },
      { key: 'mixed', label: '\\text{خلط المحلولين}', type: 'toggle', value: false, on: 'خُلطا', off: 'منفصلان' },
      { key: 'stopper', label: '\\text{السدادة}', type: 'toggle', value: true, on: 'الدورق مسدود', off: 'مفتوح' }
    ],
    compute(p) {
      const nKI = p.mKI / M_KI, nPb = p.mPb / M_PB; const xi = Math.min(nKI / 2, nPb);
      const total = 250 + 200 + p.mKI + p.mPb;
      return { nKI: nKI, nPb: nPb, xi: xi, lim: nKI / 2 < nPb ? 'KI' : 'Pb', mPbI2: p.mixed ? xi * M_PBI2 : 0, r1: total, r2: total };
    },
    live(p, d) { return '\\text{القراءة 1} = ' + r2(d.r1, 2) + ' \\ ,\\ \\text{القراءة 2} = ' + r2(d.r2, 2) + '\\ \\text{غم}'; },
    results(p, d) {
      return [['القراءة (1) قبل الخلط', r2(d.r1, 2) + ' غم', false], ['القراءة (2) بعد الخلط', p.mixed ? r2(d.r2, 2) + ' غم' : 'اخلط المحلولين أولاً', false],
        ['المشاهدة', p.mixed ? 'يتكوّن راسب أصفر (يوديد الرصاص PbI₂)' : 'محلولان عديما اللون منفصلان', false, p.mixed ? 'pos' : ''],
        ['كتلة الراسب PbI₂', r2(d.mPbI2, 3) + ' غم', false], ['المادة المحدِّدة', d.lim === 'KI' ? 'يوديد البوتاسيوم' : 'نترات الرصاص', false],
        ['الاستنتاج', p.mixed ? 'القراءة (1) = القراءة (2): الكتلة محفوظة' : '—', false, p.mixed ? 'pos' : '']];
    },
    steps(p, d) { return ['أذب ' + p.mKI + ' غم KI في 100 مل ماء، و' + p.mPb + ' غم Pb(NO₃)₂ في 100 مل ماء.', 'ضع محلول KI في الدورق، وأنبوباً فيه محلول نترات الرصاص داخل الدورق دون أن ينسكب.', 'سدّ الدورق وزنه: القراءة (1) = ' + r2(d.r1, 2) + ' غم.', 'حرّك الدورق ليختلط المحلولان، ثم زنه: القراءة (2) = ' + r2(d.r2, 2) + ' غم.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const n = R.narrow(W); const cx = W * 0.45, by = H * 0.68;
      ctx.strokeStyle = R.GLASS; ctx.lineWidth = 2.5; const fw = Math.min(180, W * 0.36), fh = Math.min(200, H * 0.46);
      ctx.beginPath(); ctx.moveTo(cx - 18, by - fh); ctx.lineTo(cx - 18, by - fh * 0.62); ctx.lineTo(cx - fw / 2, by); ctx.lineTo(cx + fw / 2, by); ctx.lineTo(cx + 18, by - fh * 0.62); ctx.lineTo(cx + 18, by - fh); ctx.stroke();
      ctx.fillStyle = p.mixed ? 'rgba(250,204,21,.35)' : 'rgba(186,230,253,.45)'; ctx.beginPath(); ctx.moveTo(cx - fw / 2 + 12, by - 4); ctx.lineTo(cx - fw * 0.3, by - fh * 0.3); ctx.lineTo(cx + fw * 0.3, by - fh * 0.3); ctx.lineTo(cx + fw / 2 - 12, by - 4); ctx.closePath(); ctx.fill();
      if (p.mixed) { ctx.fillStyle = '#eab308'; ctx.beginPath(); ctx.ellipse(cx, by - 6, fw * 0.3, 6, 0, 0, Math.PI * 2); ctx.fill(); }
      else R.tube(ctx, cx + 4, by - 8, 18, fh * 0.6, { level: 0.5, color: 'rgba(241,245,249,.8)' });
      if (p.stopper) { ctx.fillStyle = '#92400e'; ctx.fillRect(cx - 20, by - fh - 14, 40, 16); }
      R.balance(ctx, cx, by + 34, fw + 40, r2(p.mixed ? d.r2 : d.r1, 2) + ' g');
      D.txt(ctx, p.mixed ? 'راسب أصفر: PbI₂' : 'قبل الخلط', cx + fw / 2 + 50, by - fh * 0.3, { color: p.mixed ? cols.c4 : cols.muted, size: 13, w: '700' });
      ML.chemEqLine(ctx, W, H * 0.93, '2KI(aq) + Pb(NO₃)₂(aq) → PbI₂(s) + 2KNO₃(aq)', cols, n ? 12.5 : 16);
    },
    explain(a, b, da, db) { const o = []; if (a.mixed !== b.mixed && b.mixed) o.push('تكوّن راسب أصفر من يوديد الرصاص، والقراءة لم تتغير: ' + r2(db.r2, 2) + ' غم.'); if (a.stopper !== b.stopper) o.push('في هذا التفاعل لا يتصاعد غاز، فلا تتغير القراءة. أما في تفاعل يتصاعد فيه غاز فيجب أن يكون النظام مغلقاً لتتحقق من حفظ الكتلة.'); if (a.mKI !== b.mKI || a.mPb !== b.mPb) o.push('المادة المحدِّدة: ' + (db.lim === 'KI' ? 'يوديد البوتاسيوم' : 'نترات الرصاص') + '، وكتلة الراسب ' + r2(db.mPbI2, 3) + ' غم.'); return o; },
    learn: ['**قانون حفظ الكتلة (ص31):** مجموع كتل المواد المتفاعلة يساوي مجموع كتل المواد الناتجة.', '**المعادلة:** {{2KI(aq) + Pb(NO₃)₂(aq) → PbI₂(s) + 2KNO₃(aq)}} — PbI₂ راسب أصفر (يُستخدم لإنتاج «المطر الذهبي»).', '**فكّر (ص32):** قطعة خشب كتلتها 1 كغم يبقى منها بعد حرقها بضع غرامات من الرماد؛ لأن الغازات الناتجة تخرج إلى الهواء (نظام مفتوح).'],
    challenges: [
      { q: 'تحقق من قانون حفظ الكتلة: اخلط المحلولين وقارن القراءتين.', hint: 'شغّل «خلط المحلولين».', init: { mixed: false }, check: (p) => p.mixed, why: (p, d) => 'القراءة (1) = القراءة (2) = ' + r2(d.r1, 2) + ' غم.' },
      { q: 'اختر كتلتين تجعلان يوديد البوتاسيوم هو المادة المحدِّدة.', hint: 'قلّل كتلة KI.', init: { mKI: 0.5, mPb: 0.5 }, check: (p, d) => d.lim === 'KI' && d.nKI / 2 < d.nPb * 0.9, why: () => 'مولات KI أقل من ضعف مولات نترات الرصاص.' }
    ],
    tutor: [
      { q: 'لماذا لم تتغير قراءة الميزان؟', k: ['القراءه', 'تتغير', 'الميزان'], a: () => C.tutor('هل تختفي الذرات أم يتغير ترتيبها فقط؟', 'الذرات لا تفنى ولا تُستحدث؛ يتغير ترتيبها فقط، فتبقى الكتلة الكلية ثابتة.') },
      { q: 'لماذا تقل كتلة الخشب بعد حرقه؟', k: ['خشب', 'رماد', 'حرق'], a: () => C.tutor('أين تذهب الغازات الناتجة عن الاحتراق؟', 'تخرج CO₂ وبخار الماء إلى الهواء لأن النظام مفتوح؛ لو جُمعت كل النواتج لكانت الكتلة محفوظة.') },
      { q: 'ما الراسب الأصفر؟', k: ['راسب', 'اصفر'], a: () => C.tutor('أي النواتج لا يذوب في الماء؟', 'يوديد الرصاص PbI₂.') }
    ]
  });

  /* ======================= النظائر ومعدّل الكتلة الذرية ص33–35 ======================= */
  // الجدول (2-1) ص35 ومثال النحاس ص35
  const ISO = {
    Cu: { name: 'النحاس (مثال ص35)', iso: [[63, 62.93, 69.15], [65, 64.93, 30.85]], book: 63.5 },
    Cl: { name: 'الكلور (جدول 2-1)', iso: [[35, 34.97, 75.77], [37, 36.97, 24.23]] },
    O: { name: 'الأكسجين (جدول 2-1)', iso: [[16, 16, 99.762], [17, 17, 0.038], [18, 18, 0.2]] },
    Pb: { name: 'الرصاص (جدول 2-1)', iso: [[204, 204, 1.4], [206, 206, 24.1], [207, 207, 22.1], [208, 208, 52.4]] }
  };
  reg({
    id: 'isotopes', order: 2, lesson: '2-3', lessonTitle: 'النظائر', page: 35,
    titleAr: 'النظائر ومعدّل الكتلة الذرية', titleEn: 'Isotopes and Average Atomic Mass',
    tags: 'نظائر كتلة ذرية معدل نسبة الوجود مطياف الكتلة نحاس كلور رصاص اكسجين جدول 2-1',
    formula: '\\text{معدّل الكتلة الذرية} = \\sum \\left( \\text{كتلة النظير} \\times \\frac{\\text{نسبة وجوده}}{100} \\right)',
    book: 'ص35: مثال النحاس: (62.93 × 69.15/100) + (64.93 × 30.85/100) = 63.5u. الجدول (2-1): نظائر الكلور والأكسجين والرصاص ونسب وجودها.',
    summary: 'النظائر ذرات للعنصر نفسه لها العدد الذري نفسه وتختلف في عدد النيوترونات (العدد الكتلي). الكتلة الذرية للعنصر هي معدّل كتل نظائره مرجّحاً بنسبة وجود كل نظير.',
    vars: [['\\text{الكتلة}', 'كتلة النظير', 'u', 'من الجدول'], ['\\%', 'نسبة وجود النظير الأول (للعناصر ذات النظيرين)', '\\%', '0–100']],
    assumptions: ['ارتفاع الأعمدة يمثل نسبة الوجود كما في طيف مطياف الكتلة (نشاط 2 ص34).'],
    params: [
      { key: 'el', label: '\\text{العنصر}', type: 'select', value: 'Cu', options: Object.keys(ISO).map((k) => [k, ISO[k].name]) },
      { key: 'ab', label: '\\%\\ \\text{للنظير الأخف}', min: 0, max: 100, step: 0.01, value: 69.15, desc: 'للعناصر ذات النظيرين فقط', hidden: (p) => ISO[p.el].iso.length !== 2 }
    ],
    onSet(p, k) { if (k === 'el' && ISO[p.el].iso.length === 2) p.ab = ISO[p.el].iso[0][2]; },
    compute(p) {
      const E = ISO[p.el]; const iso = E.iso.map((x) => x.slice());
      if (iso.length === 2) { iso[0][2] = p.ab; iso[1][2] = r2(100 - p.ab, 2); }
      const avg = iso.reduce((t, x) => t + x[1] * x[2] / 100, 0);
      return { E: E, iso: iso, avg: avg };
    },
    live(p, d) { return '\\bar{m} = ' + d.iso.map((x) => '(' + x[1] + ' \\times ' + r2(x[2] / 100, 5) + ')').join(' + ') + ' = ' + r2(d.avg, 2) + '\\ u'; },
    results(p, d) { return d.iso.map((x) => [p.el + '-' + x[0], 'الكتلة ' + x[1] + 'u — نسبة الوجود ' + x[2] + ' %', false]).concat([['معدّل الكتلة الذرية', r2(d.avg, 2) + ' u', false, 'pos']]).concat(d.E.book ? [['جواب الكتاب', d.E.book + ' u', false]] : []); },
    steps(p, d) { return ['اضرب كتلة كل نظير في نسبة وجوده ÷ 100.', d.iso.map((x) => x[1] + ' × ' + r2(x[2] / 100, 5) + ' = ' + r2(x[1] * x[2] / 100, 3)).join(' ، '), 'اجمع النواتج: ' + r2(d.avg, 2) + ' u.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const n = R.narrow(W); const x0 = W * 0.14, x1 = W * 0.9, base = H * 0.7, top = H * 0.16;
      ctx.strokeStyle = cols.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, top); ctx.lineTo(x0, base); ctx.lineTo(x1, base); ctx.stroke();
      D.txt(ctx, 'نسبة الوجود %', x0, top - 12, { color: cols.text, size: 12, w: '700' }); D.txt(ctx, 'العدد الكتلي', x1, base + 30, { color: cols.text, size: 12, w: '700', align: 'right' });
      const ms = d.iso.map((x) => x[0]); const lo = Math.min(...ms) - 1, hi = Math.max(...ms) + 1; const X = (m) => x0 + (m - lo) / (hi - lo) * (x1 - x0);
      d.iso.forEach((x) => { const h = (base - top) * x[2] / 100; ctx.fillStyle = cols.c1; ctx.fillRect(X(x[0]) - 8, base - h, 16, h); D.txt(ctx, String(x[0]), X(x[0]), base + 14, { color: cols.text, size: 12, w: '700' }); D.txt(ctx, x[2] + '%', X(x[0]), base - h - 12, { color: cols.c1, size: 11.5, w: '700' }); });
      const xa = x0 + (d.avg - lo) / (hi - lo) * (x1 - x0); ctx.strokeStyle = cols.c2; ctx.setLineDash([6, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xa, top); ctx.lineTo(xa, base); ctx.stroke(); ctx.setLineDash([]);
      D.txt(ctx, 'المعدّل ' + r2(d.avg, 2) + ' u', xa, top - 2, { color: cols.c2, size: n ? 12 : 14, w: '700', halo: cols.bg });
      D.txt(ctx, d.E.name, W / 2, H * 0.9, { color: cols.text, size: n ? 13 : 15, w: '700' });
    },
    explain(a, b, da, db) { const o = []; if (a.el !== b.el) o.push(db.E.name + ': المعدّل ' + r2(db.avg, 2) + ' u.'); if (a.ab !== b.ab) o.push('زيادة نسبة النظير الأخف تقرّب المعدّل من كتلته: ' + r2(db.avg, 2) + ' u.'); return o; },
    learn: ['**النظائر:** ذرات للعنصر نفسه تتساوى في عدد البروتونات وتختلف في عدد النيوترونات (نشاط 3 ص34).', '**الكتلة الذرية:** 1u = 1.660538921×10⁻²⁴ غم، وكتلة ذرة الكربون 12u (ص33).', '**المعدّل:** في مثال النحاس: (62.93 × 69.15/100) + (64.93 × 30.85/100) = 63.5u.'],
    challenges: [
      { q: 'تحقق من مثال الكتاب: احسب معدّل الكتلة الذرية للنحاس بنسب الكتاب.', hint: 'نسبة النحاس-63 هي 69.15 %.', init: { el: 'Cu', ab: 50 }, check: (p, d) => p.el === 'Cu' && Math.abs(d.avg - 63.5) < 0.01, why: () => '63.5u كما في الكتاب.' },
      { q: 'اجعل معدّل الكتلة الذرية للكلور 35.45u تقريباً.', hint: 'نسبة الكلور-35 في الجدول (2-1).', init: { el: 'Cl', ab: 50 }, check: (p, d) => p.el === 'Cl' && Math.abs(d.avg - 35.45) < 0.02, why: (p, d) => 'المعدّل ' + r2(d.avg, 2) + 'u بنسبة ' + p.ab + '%.' }
    ],
    tutor: [
      { q: 'لماذا الكتلة الذرية ليست عدداً صحيحاً؟', k: ['صحيح', 'كسر', 'لماذا'], a: () => C.tutor('هل لكل ذرات العنصر الكتلة نفسها؟', 'لأنها معدّل كتل النظائر مرجّحاً بنسب وجودها.') },
      { q: 'ما النظائر؟', k: ['نظائر', 'نظير'], a: () => C.tutor('ما الذي يتغير بين ذرة كربون-12 وكربون-14؟', 'ذرات للعنصر نفسه لها العدد الذري نفسه وتختلف في عدد النيوترونات.') },
      { q: 'كيف أحسب المعدّل؟', k: ['احسب', 'معدل'], a: (p, d) => C.tutor('ما وزن كل نظير في المعدّل؟', d.iso.map((x) => x[1] + '×' + x[2] + '%').join(' + ') + ' = ' + r2(d.avg, 2) + 'u.') }
    ]
  });

  /* ======================= المول والكتلة المولية والحجم المولي ص36–41 (نشاطا 6 و7) ======================= */
  const SUB = {
    Ca: 'الكالسيوم', H2SO4: 'حمض الكبريتيك', C12H22O11: 'سكر المائدة (السكروز)', NaCl: 'ملح الطعام', H2O: 'الماء', CaCO3: 'كربونات الكالسيوم', C6H12O6: 'الجلوكوز',
    CO2: 'ثاني أكسيد الكربون (غاز)', O2: 'الأكسجين (غاز)', N2: 'النيتروجين (غاز)', H2: 'الهيدروجين (غاز)'
  };
  const GAS = { CO2: 1, O2: 1, N2: 1, H2: 1 };
  reg({
    id: 'mole', order: 3, lesson: '2-4', lessonTitle: 'المول والكتلة المولية', page: 39,
    titleAr: 'المول: الكتلة وعدد الجسيمات والحجم المولي', titleEn: 'The Mole: Mass, Particles and Molar Volume',
    tags: 'مول كتلة مولية عدد افوجادرو حجم مولي 22.4 الظروف المعيارية ميزان نشاط 6 نشاط 7 n=m/M',
    formula: 'n = \\frac{m}{M} ,\\quad N = n \\times 6.023 \\times 10^{23} ,\\quad V = n \\times 22.4\\ \\text{لتر}',
    book: 'نشاط (6) ص39: n = m/M (الكالسيوم 40 غم/مول: 10 غم = 0.25 مول). نشاط (7) ص40: حضّر 0.5 مول سكر و0.25 مول NaCl و1 مول ماء. ص40–41: الحجم المولي 22.4 لتر عند الظروف المعيارية، مثال: 5 مول N₂ = 112 لتراً.',
    summary: 'المول كمية المادة التي تحتوي على 6.023×10²³ جسيماً. نحسب عدد المولات بقسمة الكتلة على الكتلة المولية، وحجم مول أي غاز في الظروف المعيارية (1 ضغط جوي، 0 °س) يساوي 22.4 لتراً.',
    vars: [['m', 'كتلة المادة', '\\text{غم}', '0.1–500'], ['M', 'الكتلة المولية', '\\text{غم/مول}', 'من الصيغة'], ['n', 'عدد المولات', '\\text{مول}', '—'], ['V', 'حجم الغاز عند الظروف المعيارية', '\\text{لتر}', 'للغازات فقط']],
    assumptions: ['الكتل الذرية المقرّبة كما في أمثلة الكتاب (H = 1 ، C = 12 ، O = 16 ، Ca = 40 …).'],
    params: [
      { key: 'sub', label: '\\text{المادة}', type: 'select', value: 'Ca', options: Object.keys(SUB).map((k) => [k, SUB[k] + ' ' + C.sub(k)]) },
      { key: 'by', label: '\\text{أعطِ}', type: 'select', value: 'mass', options: (p) => [['mass', 'الكتلة (غم)'], ['moles', 'عدد المولات']].concat(p && GAS[p.sub] ? [['vol', 'الحجم (لتر)']] : []) },
      { key: 'm', label: 'm\\ \\text{(غم)}', min: 0.1, max: 500, step: 0.1, value: 10, hidden: (p) => p.by !== 'mass' },
      { key: 'n', label: 'n\\ \\text{(مول)}', min: 0.01, max: 10, step: 0.01, value: 0.25, hidden: (p) => p.by !== 'moles' },
      { key: 'V', label: 'V\\ \\text{(لتر)}', min: 0.5, max: 200, step: 0.5, value: 22.4, hidden: (p) => p.by !== 'vol' }
    ],
    onSet(p) { if (p.by === 'vol' && !GAS[p.sub]) p.by = 'mass'; },
    compute(p) {
      const Mm = M(p.sub); const n = p.by === 'mass' ? p.m / Mm : p.by === 'moles' ? p.n : p.V / 22.4;
      return { M: Mm, nn: n, mass: n * Mm, N: n * C.NA, V: GAS[p.sub] ? n * 22.4 : null };
    },
    live(p, d) { return p.by === 'mass' ? 'n = \\frac{m}{M} = \\frac{' + p.m + '}{' + d.M + '} = ' + r2(d.nn, 4) + '\\ \\text{مول}' : p.by === 'moles' ? 'm = n \\times M = ' + p.n + ' \\times ' + d.M + ' = ' + r2(d.mass, 2) + '\\ \\text{غم}' : 'n = \\frac{V}{22.4} = \\frac{' + p.V + '}{22.4} = ' + r2(d.nn, 4) + '\\ \\text{مول}'; },
    results(p, d) {
      const out = [['المادة', SUB[p.sub] + ' {{' + C.sub(p.sub) + '}}', false], ['الكتلة المولية M', d.M + ' غم/مول', false], ['الكتلة m', r2(d.mass, 3) + ' غم', false], ['عدد المولات n', r2(d.nn, 4) + ' مول', false, 'pos'], ['عدد الجسيمات N', sci(d.N) + (p.sub === 'Ca' ? ' ذرة' : ' جزيء (وحدة صيغة)'), false]];
      if (d.V !== null) out.push(['الحجم عند الظروف المعيارية', r2(d.V, 3) + ' لتر', false]);
      return out;
    },
    steps(p, d) { const at = C.parse(p.sub); return ['الكتلة المولية: ' + Object.keys(at).map((e) => (at[e] > 1 ? at[e] + '×' : '') + C.MASS[e]).join(' + ') + ' = ' + d.M + ' غم/مول.', p.by === 'mass' ? 'n = ' + p.m + ' ÷ ' + d.M + ' = ' + r2(d.nn, 4) + ' مول.' : p.by === 'moles' ? 'm = ' + p.n + ' × ' + d.M + ' = ' + r2(d.mass, 2) + ' غم (هذه الكتلة تُوزن بالميزان).' : 'n = ' + p.V + ' ÷ 22.4 = ' + r2(d.nn, 4) + ' مول.', 'N = ' + r2(d.nn, 4) + ' × 6.023×10²³ = ' + sci(d.N) + '.'].concat(d.V !== null ? ['V = ' + r2(d.nn, 4) + ' × 22.4 = ' + r2(d.V, 3) + ' لتر.'] : []); },
    drawCustom(ctx, W, H, p, d, cols) {
      const n = R.narrow(W); const cx = W * 0.32, by = H * 0.7;
      if (GAS[p.sub]) {
        const h = Math.min(H * 0.55, 40 + Math.sqrt(d.V || 0) * 22); ctx.strokeStyle = cols.axis; ctx.lineWidth = 2; ctx.strokeRect(cx - 50, by - H * 0.56, 100, H * 0.56); ctx.fillStyle = 'rgba(96,165,250,.2)'; ctx.fillRect(cx - 49, by - h, 98, h); ctx.fillStyle = '#64748b'; ctx.fillRect(cx - 50, by - h - 8, 100, 8);
        D.txt(ctx, r2(d.V, 2) + ' لتر', cx, by - h - 22, { color: cols.c1, size: 14, w: '700' }); D.txt(ctx, 'أسطوانة بمكبس عند 0 °س و1 ضغط جوي', cx, by + 18, { color: cols.muted, size: 11.5 });
      } else {
        const pile = Math.min(90, 12 + Math.sqrt(d.mass) * 6); ctx.fillStyle = p.sub === 'H2O' ? 'rgba(96,165,250,.55)' : p.sub === 'Ca' ? '#cbd5e1' : '#f8fafc'; ctx.strokeStyle = cols.muted; ctx.beginPath(); ctx.moveTo(cx - pile, by - 34); ctx.quadraticCurveTo(cx, by - 34 - pile * 0.9, cx + pile, by - 34); ctx.closePath(); ctx.fill(); ctx.stroke();
        R.balance(ctx, cx, by, Math.max(150, pile * 2 + 30), r2(d.mass, 2) + ' g');
      }
      const tx = W * 0.72; [['n', r2(d.nn, 4) + ' مول', cols.c1], ['N', sci(d.N), cols.c5], ['M', d.M + ' غم/مول', cols.c3]].forEach(([k, v, c], i) => { D.txt(ctx, k + ' = ' + v, tx, H * 0.25 + i * (n ? 34 : 42), { color: c, size: n ? 14 : 17, w: '700' }); });
      D.txt(ctx, SUB[p.sub], W / 2, H * 0.9, { color: cols.text, size: n ? 13 : 15, w: '700' });
    },
    explain(a, b, da, db) { const o = []; if (a.sub !== b.sub) o.push('الكتلة المولية لـ ' + SUB[b.sub] + ' = ' + db.M + ' غم/مول: مول واحد منها كتلته ' + db.M + ' غم ويحتوي 6.023×10²³ جسيماً.'); if (a.m !== b.m || a.n !== b.n || a.V !== b.V) o.push('عدد المولات ' + r2(db.nn, 4) + ' مول، وعدد الجسيمات ' + sci(db.N) + '.'); return o; },
    learn: ['**المول:** 6.023×10²³ جسيم (عدد أفوجادرو)، و12 غم من الكربون-12 تحتوي هذا العدد من الذرات (ص36–37).', '**الكتلة المولية:** مجموع الكتل الذرية في الصيغة، مثال: CaCO₃ = 40 + 12 + 3×16 = 100 غم/مول (ص38).', '**n = m/M:** 10 غم كالسيوم = 0.25 مول (نشاط 6).', '**الحجم المولي:** 22.4 لتر لأي غاز في الظروف المعيارية؛ 5 مول N₂ = 112 لتراً، و10 لترات H₂ = 0.892 غم (ص41).'],
    challenges: [
      { q: 'نشاط (7): كم غراماً تزن لتحضير 0.5 مول من سكر المائدة؟ اضبط المحاكاة وتحقق.', hint: 'اختر السكروز، وأعطِ عدد المولات 0.5.', init: { sub: 'Ca', by: 'mass', m: 10 }, check: (p, d) => p.sub === 'C12H22O11' && Math.abs(d.nn - 0.5) < 0.001, why: (p, d) => 'تزن ' + r2(d.mass, 1) + ' غم.' },
      { q: 'ما حجم 5 مول من غاز النيتروجين في الظروف المعيارية؟', hint: 'اختر N₂ وأعطِ 5 مول.', init: { sub: 'Ca', by: 'mass' }, check: (p, d) => p.sub === 'N2' && Math.abs(d.nn - 5) < 1e-6, why: () => '5 × 22.4 = 112 لتراً (ص41).' },
      { q: 'كم مولاً في 9.8 غم من حمض الكبريتيك؟', hint: 'M(H₂SO₄) = 98.', init: { sub: 'Ca', by: 'mass', m: 10 }, check: (p) => p.sub === 'H2SO4' && p.by === 'mass' && Math.abs(p.m - 9.8) < 1e-6, why: () => '9.8 ÷ 98 = 0.1 مول.' }
    ],
    tutor: [
      { q: 'كيف أحسب عدد المولات؟', k: ['مولات', 'احسب', 'n'], a: (p, d) => C.tutor('ما العلاقة بين الكتلة والكتلة المولية؟', 'n = m ÷ M = ' + r2(d.mass, 3) + ' ÷ ' + d.M + ' = ' + r2(d.nn, 4) + ' مول.') },
      { q: 'كيف أحسب الكتلة المولية؟', k: ['الكتله الموليه', 'M'], a: (p, d) => C.tutor('كم ذرة من كل عنصر في الصيغة؟', 'اجمع الكتل الذرية لكل الذرات في ' + C.sub(p.sub) + ': ' + d.M + ' غم/مول.') },
      { q: 'ما الحجم المولي؟', k: ['حجم', '22.4', 'غاز'], a: () => C.tutor('هل يعتمد حجم مول الغاز على نوعه في الظروف نفسها؟', 'حجم مول أي غاز في الظروف المعيارية (0 °س، 1 ضغط جوي) = 22.4 لتر (ص40).') }
    ]
  });

  /* ======================= نشاط (8) النسبة المئوية لمكونات المادة ص42 ======================= */
  const PCT = { 'Cu3(CO3)2(OH)2': 'خام الأزورايت', CaO: 'الجير الحي', C12H22O11: 'السكروز', CaCO3: 'كربونات الكالسيوم', C6H12O6: 'الجلوكوز', H2O: 'الماء', NH3: 'الأمونيا' };
  const EL_COL = { Cu: '#b45309', C: '#374151', O: '#ef4444', H: '#94a3b8', Ca: '#65a30d', N: '#3b82f6' };
  reg({
    id: 'percent-composition', order: 4, lesson: '2-5', lessonTitle: 'النسبة المئوية لمكونات المادة', page: 42,
    titleAr: 'النسبة المئوية لمكونات المادة', titleEn: 'Percentage Composition',
    tags: 'نسبة مئوية مكونات ازورايت نحاس جير حي كالسيوم كتلة العنصر في العينة نشاط 8',
    formula: '\\%\\ \\text{العنصر} = \\frac{M_{\\text{العنصر}} \\times \\text{عدد ذراته}}{M_{\\text{المركب}}} \\times 100\\%',
    book: 'نشاط (8) ص42: خام الأزورايت Cu₃(CO₃)₂(OH)₂. مثال ص43: نسبة الكالسيوم في الجير الحي CaO = 40/56 × 100 = 71.4%.',
    summary: 'نسبة العنصر في المركب = كتلة ذراته في مول من المركب ÷ الكتلة المولية للمركب × 100%. وتفيد في معرفة كتلة العنصر في عيّنة من الخام.',
    vars: [['\\%', 'نسبة العنصر', '\\%', '0–100'], ['m', 'كتلة العيّنة', '\\text{غم}', '1–1000']],
    assumptions: ['العيّنة نقية (الخام كله من المركب نفسه).'],
    params: [
      { key: 'sub', label: '\\text{المادة}', type: 'select', value: 'Cu3(CO3)2(OH)2', options: Object.keys(PCT).map((k) => [k, PCT[k] + ' ' + C.sub(k)]) },
      { key: 'm', label: 'm\\ \\text{(غم عيّنة)}', min: 1, max: 1000, step: 1, value: 100 }
    ],
    compute(p) { const at = C.parse(p.sub); const Mm = M(p.sub); const parts = Object.keys(at).map((e) => ({ el: e, n: at[e], mass: at[e] * C.MASS[e], pct: at[e] * C.MASS[e] / Mm * 100 })); return { M: Mm, parts: parts }; },
    live(p, d) { const a = d.parts[0]; return '\\%\\ \\text{' + a.el + '} = \\frac{' + a.n + ' \\times ' + C.MASS[a.el] + '}{' + d.M + '} \\times 100 = ' + r2(a.pct, 1) + '\\%'; },
    results(p, d) { return [['الكتلة المولية', d.M + ' غم/مول', false]].concat(d.parts.map((x) => ['نسبة ' + (C.NAMES[x.el] || x.el) + ' (' + x.el + ')', r2(x.pct, 1) + ' % — في ' + p.m + ' غم: ' + r2(x.pct * p.m / 100, 2) + ' غم', false])); },
    steps(p, d) { return ['احسب الكتلة المولية: ' + d.parts.map((x) => (x.n > 1 ? x.n + '×' : '') + C.MASS[x.el]).join(' + ') + ' = ' + d.M + ' غم/مول.'].concat(d.parts.map((x) => '% ' + x.el + ' = ' + r2(x.mass, 2) + ' ÷ ' + d.M + ' × 100 = ' + r2(x.pct, 1) + '%.')).concat(['مجموع النسب = 100%.']); },
    drawCustom(ctx, W, H, p, d, cols) {
      const n = R.narrow(W); const cx = W * (n ? 0.5 : 0.35), cy = H * (n ? 0.38 : 0.47), r = Math.min(W * 0.22, H * 0.3);
      let a0 = -Math.PI / 2; d.parts.forEach((x) => { const a1 = a0 + x.pct / 100 * Math.PI * 2; ctx.fillStyle = EL_COL[x.el] || cols.c5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a0, a1); ctx.closePath(); ctx.fill(); ctx.strokeStyle = cols.bg; ctx.lineWidth = 2; ctx.stroke(); const am = (a0 + a1) / 2; if (x.pct > 4) D.txt(ctx, x.el + ' ' + r2(x.pct, 1) + '%', cx + Math.cos(am) * r * 0.65, cy + Math.sin(am) * r * 0.65, { color: '#fff', size: 12.5, w: '700', halo: 'rgba(0,0,0,.35)' }); a0 = a1; });
      const tx = n ? W * 0.5 : W * 0.75; const ty = n ? H * 0.72 : H * 0.25;
      D.txt(ctx, PCT[p.sub] + ' — ' + C.sub(p.sub), tx, ty, { color: cols.text, size: n ? 13 : 15, w: '700' });
      d.parts.forEach((x, i) => D.txt(ctx, x.el + ': ' + r2(x.pct * p.m / 100, 2) + ' غم في ' + p.m + ' غم', tx, ty + 26 + i * 22, { color: EL_COL[x.el] || cols.text, size: 12.5, w: '700' }));
    },
    explain(a, b, da, db) { const o = []; if (a.sub !== b.sub) o.push(PCT[b.sub] + ': ' + db.parts.map((x) => x.el + ' ' + r2(x.pct, 1) + '%').join('، ') + '.'); if (a.m !== b.m) o.push('النسبة لا تتغير بتغيّر كتلة العيّنة، لكن كتلة كل عنصر تتناسب معها.'); return o; },
    learn: ['**القانون:** % العنصر = (M العنصر × عدد ذراته ÷ M المركب) × 100%. و% العنصر في عيّنة = كتلة العنصر ÷ كتلة العيّنة × 100% (ص42).', '**مثال ص43:** % Ca في CaO = 40 ÷ 56 × 100 = 71.4%.', '**الأزورايت:** في المول ثلاث مولات من Cu، والكتلة المولية 344.5 غم/مول، فنسبة النحاس ≈ 55.3%.'],
    challenges: [
      { q: 'تحقق من مثال الكتاب: نسبة الكالسيوم في الجير الحي.', hint: 'اختر CaO.', init: { sub: 'Cu3(CO3)2(OH)2' }, check: (p) => p.sub === 'CaO', why: () => '40 ÷ 56 × 100 = 71.4%.' },
      { q: 'كم غراماً من النحاس في 500 غم من خام الأزورايت النقي؟ اضبط الكتلة.', hint: 'اختر الأزورايت واجعل الكتلة 500 غم.', init: { sub: 'CaO', m: 100 }, check: (p) => p.sub === 'Cu3(CO3)2(OH)2' && p.m === 500, why: (p, d) => r2(d.parts.find((x) => x.el === 'Cu').pct * 5, 1) + ' غم نحاس.' }
    ],
    tutor: [
      { q: 'كيف أحسب النسبة المئوية لعنصر؟', k: ['نسبه', 'احسب', 'مئويه'], a: (p, d) => C.tutor('كم كتلة هذا العنصر في مول واحد من المركب؟', d.parts.map((x) => x.el + ': ' + r2(x.mass, 2) + ' ÷ ' + d.M + ' × 100 = ' + r2(x.pct, 1) + '%').join('\n')) },
      { q: 'هل تتغير النسبة بتغير كتلة العيّنة؟', k: ['تتغير', 'كتله العينه'], a: () => C.tutor('هل يتغير تركيب المركب إذا أخذت كمية أكبر منه؟', 'لا؛ النسبة ثابتة للمركب (قانون النسب الثابتة ص32)، وكتلة العنصر تتناسب مع كتلة العيّنة.') },
      { q: 'أي الخامين أفضل اقتصادياً؟', k: ['اقتصادي', 'منجم', 'خام'], a: () => C.tutor('ما الذي يحدد كمية الفلز التي نحصل عليها من طن من الخام؟', 'الخام ذو النسبة المئوية الأعلى للفلز يعطي فلزاً أكثر من الكتلة نفسها (فكّر ص43).') }
    ]
  });

  /* ======================= استخدام المعادلة الموزونة في الحسابات ص43–45 ======================= */
  const RX = {
    NO: { name: 'أكسدة الأمونيا (مثال ص44)', sp: [[4, 'NH3', 'g'], [5, 'O2', 'g'], [4, 'NO', 'g'], [6, 'H2O', 'g']], nl: 2 },
    NH3: { name: 'تحضير الأمونيا (ص44)', sp: [[1, 'N2', 'g'], [3, 'H2', 'g'], [2, 'NH3', 'g']], nl: 2 },
    H2O: { name: 'تكوين الماء (نشاط 9 ص43)', sp: [[2, 'H2', 'g'], [1, 'O2', 'g'], [2, 'H2O', 'g']], nl: 2 },
    C4H10: { name: 'احتراق البيوتان — أسطوانة الغاز (ص45)', sp: [[2, 'C4H10', 'g'], [13, 'O2', 'g'], [8, 'CO2', 'g'], [10, 'H2O', 'g']], nl: 2 }
  };
  reg({
    id: 'stoichiometry', order: 5, lesson: '2-6', lessonTitle: 'استخدام المعادلة الموزونة في الحسابات', page: 44,
    titleAr: 'الحسابات بالمعادلة الموزونة: الكتل والحجوم', titleEn: 'Stoichiometry with Balanced Equations',
    tags: 'حسابات كيميائية معادلة موزونة نسبة مولية كتلة حجم امونيا اكسجين بيوتان اسطوانة غاز 22.4',
    formula: '\\frac{n_{\\text{المطلوب}}}{\\text{معامله}} = \\frac{n_{\\text{المعطى}}}{\\text{معامله}}',
    book: 'مثال ص44–45: {{4NH₃(g) + 5O₂(g) → 4NO(g) + 6H₂O(g)}}: كتلة O₂ اللازمة لـ 17 غم NH₃ = 40 غم. تمرين ص45: أسطوانة غاز بيوتان كتلتها 12 كغم.',
    summary: 'المعاملات في المعادلة الموزونة تعطي نسب المولات. نحوّل كتلة المادة المعطاة إلى مولات، ونضربها في نسبة المعاملات لنحصل على مولات المادة المطلوبة، ثم نحوّلها إلى كتلة أو حجم.',
    vars: [['m', 'كتلة المادة المعطاة', '\\text{غم أو كغم}', '1–200'], ['n', 'عدد المولات = m ÷ M', '\\text{مول}', '—'], ['V', 'حجم الغاز عند الظروف المعيارية = n × 22.4', '\\text{لتر}', '—']],
    assumptions: ['التفاعل تام، والغازات في الظروف المعيارية (22.4 لتر/مول).'],
    params: [
      { key: 'rx', label: '\\text{التفاعل}', type: 'select', value: 'NO', options: Object.keys(RX).map((k) => [k, RX[k].name]) },
      { key: 'given', label: '\\text{المادة المعطاة}', type: 'select', value: 0, options: (p) => RX[(p && p.rx) || 'NO'].sp.slice(0, RX[(p && p.rx) || 'NO'].nl).map((s, i) => [i, C.sub(s[1])]) },
      { key: 'm', label: 'm', min: 1, max: 200, step: 1, value: 17 },
      { key: 'unit', label: '\\text{وحدة الكتلة}', type: 'select', value: 'g', options: [['g', 'غم'], ['kg', 'كغم']] }
    ],
    onSet(p, k) { if (k === 'rx') p.given = 0; },
    compute(p) {
      const r = RX[p.rx]; const g = r.sp[p.given] || r.sp[0]; const mg = p.m * (p.unit === 'kg' ? 1000 : 1);
      const ng = mg / M(g[1]); const rows = r.sp.map(([k, f, st], i) => { const nn = ng / g[0] * k; return { k: k, f: f, st: st, n: nn, m: nn * M(f), V: st === 'g' ? nn * 22.4 : null, side: i < r.nl ? 'L' : 'R' }; });
      const mL = rows.filter((x) => x.side === 'L').reduce((t, x) => t + x.m, 0), mR = rows.filter((x) => x.side === 'R').reduce((t, x) => t + x.m, 0);
      return { r: r, g: g, ng: ng, rows: rows, mL: mL, mR: mR, eq: r.sp.map(([k, f, st], i) => (k === 1 ? '' : k) + C.sub(f) + '(' + st + ')' + (i === r.nl - 1 ? ' → ' : i < r.sp.length - 1 ? ' + ' : '')).join('') };
    },
    live(p, d) { return 'n_{\\text{' + C.sub(d.g[1]) + '}} = \\frac{' + (p.m * (p.unit === 'kg' ? 1000 : 1)) + '}{' + M(d.g[1]) + '} = ' + r2(d.ng, 4) + '\\ \\text{مول}'; },
    results(p, d) { return [['المعادلة', '{{' + d.eq + '}}', false]].concat(d.rows.map((x) => [C.sub(x.f), r2(x.n, 4) + ' مول • ' + r2(x.m, 2) + ' غم' + (x.V !== null ? ' • ' + r2(x.V, 2) + ' لتر' : ''), false, x.f === d.g[1] ? 'pos' : ''])).concat([['حفظ الكتلة', r2(d.mL, 2) + ' غم = ' + r2(d.mR, 2) + ' غم', false]]); },
    steps(p, d) { const g = d.g; return ['حوّل كتلة ' + C.sub(g[1]) + ' إلى مولات: ' + (p.m * (p.unit === 'kg' ? 1000 : 1)) + ' ÷ ' + M(g[1]) + ' = ' + r2(d.ng, 4) + ' مول.'].concat(d.rows.filter((x) => x.f !== g[1]).map((x) => 'مولات ' + C.sub(x.f) + ' = ' + r2(d.ng, 4) + ' × ' + x.k + '/' + g[0] + ' = ' + r2(x.n, 4) + ' مول ← ' + r2(x.m, 2) + ' غم' + (x.V !== null ? ' أو ' + r2(x.V, 2) + ' لتر.' : '.'))); },
    drawCustom(ctx, W, H, p, d, cols) {
      const n = R.narrow(W); ML.chemEqLine(ctx, W, 26, d.eq, cols, n ? 14 : 18);
      const rows = [['المادة', 'المعامل', 'المولات', 'الكتلة (غم)', 'الحجم (لتر)']].concat(d.rows.map((x) => [C.sub(x.f), x.k, r2(x.n, 3), r2(x.m, 1), x.V !== null ? r2(x.V, 1) : '—']));
      R.table(ctx, 14, 52, W - 28, n ? 30 : 36, rows, cols, { size: n ? 11 : 13, hl: d.rows.findIndex((x) => x.f === d.g[1]) + 1 });
      const by = H * 0.9, maxM = Math.max(...d.rows.map((x) => x.m)); const bw = (W - 60) / d.rows.length;
      d.rows.forEach((x, i) => { const h = (H * 0.32) * x.m / maxM; ctx.fillStyle = x.side === 'L' ? cols.c1 : cols.c3; ctx.fillRect(30 + i * bw + bw * 0.2, by - h, bw * 0.6, h); D.txt(ctx, C.sub(x.f), 30 + i * bw + bw / 2, by + 12, { color: cols.text, size: 12, w: '700' }); });
      D.txt(ctx, 'الكتل: ' + r2(d.mL, 1) + ' غم متفاعلات = ' + r2(d.mR, 1) + ' غم نواتج', W / 2, by - H * 0.36, { color: cols.muted, size: 12.5, w: '700' });
    },
    explain(a, b, da, db) { const o = []; if (a.rx !== b.rx) o.push(db.r.name + ': ' + db.eq + '.'); if (a.m !== b.m || a.unit !== b.unit || a.given !== b.given) o.push('مولات ' + C.sub(db.g[1]) + ' = ' + r2(db.ng, 4) + '؛ كل المواد الأخرى تتغير بالنسبة نفسها (نسب المعاملات).'); return o; },
    learn: ['**نسبة المولات:** معاملات المعادلة الموزونة تعطي نسب المولات بين المواد (ص43).', '**مثال ص44:** 17 غم NH₃ = 1 مول، فيلزم 1 × 5/4 = 1.25 مول O₂ = 40 غم.', '**الحجوم:** في الغازات عند الظروف نفسها تتناسب الحجوم مع المعاملات: 4 لترات NH₃ تعطي 4 لترات NO (ص45).'],
    challenges: [
      { q: 'تحقق من مثال الكتاب: كتلة O₂ اللازمة لـ 17 غم NH₃.', hint: 'التفاعل الأول، والمادة المعطاة NH₃، والكتلة 17 غم.', init: { rx: 'NH3', given: 0, m: 10, unit: 'g' }, check: (p) => p.rx === 'NO' && p.given === 0 && p.m === 17 && p.unit === 'g', why: () => 'كتلة O₂ = 40 غم.' },
      { q: 'كم غراماً من NH₃ ينتج من 28 غم N₂؟', hint: 'تفاعل تحضير الأمونيا، والمادة المعطاة N₂.', init: { rx: 'NO', m: 17 }, check: (p) => p.rx === 'NH3' && p.given === 0 && p.m === 28 && p.unit === 'g', why: () => '1 مول N₂ يعطي 2 مول NH₃ = 34 غم.' },
      { q: 'أسطوانة غاز بيوتان 12 كغم: ما حجم O₂ اللازم لحرقها كلها؟', hint: 'تفاعل البيوتان، والكتلة 12 بوحدة كغم.', init: { rx: 'NO', m: 17, unit: 'g' }, check: (p) => p.rx === 'C4H10' && p.given === 0 && p.m === 12 && p.unit === 'kg', why: (p, d) => 'حجم O₂ ≈ ' + r2(d.rows[1].V, 0) + ' لتر.' }
    ],
    tutor: [
      { q: 'كيف أستخدم المعادلة في الحساب؟', k: ['كيف', 'احسب', 'نسبه'], a: (p, d) => C.tutor('ما نسبة معامل المادة المطلوبة إلى معامل المادة المعطاة؟', 'حوّل الكتلة إلى مولات (' + r2(d.ng, 4) + ' مول)، ثم اضرب في نسبة المعاملات، ثم حوّل إلى كتلة أو حجم.') },
      { q: 'ما العلاقة بين حجوم الغازات ومعاملاتها؟', k: ['حجوم', 'حجم', 'معاملات'], a: () => C.tutor('هل يعتمد حجم المول على نوع الغاز؟', 'في الظروف نفسها تتناسب حجوم الغازات مع معاملاتها في المعادلة الموزونة (سؤال ص45).') },
      { q: 'لماذا يجب أن تكون المعادلة موزونة؟', k: ['موزونه', 'لماذا'], a: () => C.tutor('ماذا يحدث لنسب المولات إن لم تكن المعادلة موزونة؟', 'غير الموزونة تخالف قانون حفظ الكتلة وتعطي نسب مولات خاطئة (نشاط 9 ص43).') }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
