/* الكيمياء — الوحدة الثالثة: الماء في حياتنا (ص50–68) */
(function (root) {
  'use strict';
  const ML = root.ML; const C = ML.chem; const D = ML.pdraw; const R = ML.chemDraw;
  const S = 'g10-chem', U = 3;
  const reg = (o) => ML.register(Object.assign({ subject: S, unit: U, custom: true }, o));
  const r2 = (v, k) => C.round(v, k === undefined ? 2 : k);

  /* ======================= نشاطا (1) و(2) تركيب الماء وخصائصه ص52–55 ======================= */
  const CUPS = { tap: ['ماء الصنبور', 'متعادل', '#22c55e'], NaOH: ['ماء + حبة NaOH', 'قاعدي', '#1d4ed8'], HCl: ['ماء + قطرة HCl 32%', 'حمضي', '#dc2626'] };
  reg({
    id: 'water-properties', order: 1, lesson: '3-1', lessonTitle: 'تركيب الماء وخصائصه', page: 53,
    titleAr: 'جزيء الماء وخصائص الماء', titleEn: 'The Water Molecule and Properties of Water',
    tags: 'جزيء الماء منحني رابطة هيدروجينية ورق pH متعادل حمضي قاعدي تجمد تمدد شذوذ الماء نشاط 1 نشاط 2',
    formula: '\\text{H}_2\\text{O}:\\ \\text{جزيء منحنٍ قطبي} ,\\quad \\text{O–H}\\cdots\\text{O}:\\ \\text{رابطة هيدروجينية}',
    book: 'نشاط (1) ص52: زوجان غير رابطين يجعلان جزيء الماء منحنياً، والرابطة الهيدروجينية أضعف من الرابطة O–H، وكل جزيء في الحالة السائلة محاط بأربعة جزيئات. نشاط (2) ص53–55: ورق pH في ماء الصنبور، ومع حبة NaOH، ومع قطرة HCl 32%؛ وتجميد 100 مل ماء و100 مل زيت.',
    summary: 'جزيء الماء منحنٍ قطبي، وترتبط جزيئاته بروابط هيدروجينية. الماء النقي متعادل، ويصبح قاعدياً أو حمضياً بإضافة قاعدة أو حمض. ويتمدد الماء عند التجمد بخلاف معظم السوائل (شذوذ الماء)، فتقل كثافة الجليد ويطفو.',
    vars: [['\\text{الاختبار}', 'شكل الجزيء / ورق pH / التجميد', '—', '3 اختبارات'], ['T', 'درجة الحرارة في المبرد', '^{\\circ}\\text{س}', '−10 إلى 20']],
    assumptions: ['قيم الجدول (3-1) لكثافة الماء صورة غير مقروءة في الكتاب، لذا يُعرض التمدد نوعياً: ' + C.SIMPLE + '.', 'ألوان ورق pH تقريبية.'],
    params: [
      { key: 'test', label: '\\text{الاختبار}', type: 'select', value: 'molecule', options: [['molecule', 'جزيء الماء والرابطة الهيدروجينية (نشاط 1)'], ['ph', 'ورق pH (نشاط 2 ب)'], ['freeze', 'التجميد: ماء وزيت (نشاط 2 د)']] },
      { key: 'cup', label: '\\text{الكأس}', type: 'select', value: 'tap', options: Object.keys(CUPS).map((k) => [k, CUPS[k][0]]), hidden: (p) => p.test !== 'ph' },
      { key: 'T', label: 'T\\ (^{\\circ}\\text{س})', min: -10, max: 20, step: 1, value: 20, hidden: (p) => p.test !== 'freeze' }
    ],
    compute(p) { const frozen = p.T <= 0; return { frozen: frozen, wLevel: frozen ? 1.09 : 1, oLevel: frozen ? 0.93 : 1 }; },
    results(p, d) {
      if (p.test === 'molecule') return [['شكل الجزيء', 'منحنٍ بسبب زوجين غير رابطين على ذرة O', false], ['الرابطة الهيدروجينية', 'بين H (δ+) في جزيء و O (δ−) في جزيء آخر، أضعف من O–H', false], ['في الحالة السائلة', 'كل جزيء محاط بأربعة جزيئات', false]];
      if (p.test === 'ph') return [['الكأس', CUPS[p.cup][0], false], ['ورق pH', CUPS[p.cup][1], false, 'pos']];
      return [['درجة الحرارة', p.T + ' °س', false], ['الماء', d.frozen ? 'تجمّد وارتفع مستواه فوق العلامة: يتمدد' : 'سائل عند العلامة', false, d.frozen ? 'pos' : ''], ['الزيت', d.frozen ? 'تجمّد وانخفض مستواه: ينكمش' : 'سائل عند العلامة', false], ['التفسير', d.frozen ? 'شذوذ الماء: تقل كثافته تحت 4 °س فيتمدد عند التجمد' : '—', false]];
    },
    steps(p) { return p.test === 'ph' ? ['ضع (100) مل ماء صنبور في كل من الكؤوس الثلاث.', 'أضف حبة NaOH إلى الأولى، وقطرة HCl 32% إلى الثانية.', 'ضع ورق pH في الكؤوس الثلاث وسجّل النتائج.'] : p.test === 'freeze' ? ['ضع (100) مل ماء في قارورة و(100) مل زيت في أخرى، وعلّم مستوى كل منهما.', 'ضع القارورتين في مبرد الثلاجة حتى التجمد.', 'قارن المستويين بالعلامتين.'] : ['اكتب التوزيع الإلكتروني للأكسجين والهيدروجين.', 'ارسم الترابط في الجزيء.', 'استنتج الشكل المنحني من الزوجين غير الرابطين.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const n = R.narrow(W);
      if (p.test === 'molecule') {
        const mol = C.molecule('H2O'); const pts = [[W * 0.5, H * 0.42, 0], [W * 0.22, H * 0.25, 1.2], [W * 0.78, H * 0.28, -1], [W * 0.3, H * 0.72, 2.2], [W * 0.72, H * 0.72, -2.4]];
        pts.forEach(([x, y, a], i) => C.drawBallStick(ctx, { atoms: mol.atoms, bonds: mol.bonds.map((b) => ({ i: b[0], j: b[1], o: 1, a: 1, kind: 'old' })) }, { yaw: 0, pitch: 0, cx: x, cy: y, s: i ? (n ? 26 : 34) : (n ? 40 : 52), fov: 1e6, labels: true, colors: { bond: '#94a3b8' } }));
        ctx.save(); ctx.setLineDash([4, 5]); ctx.strokeStyle = cols.c5; ctx.lineWidth = 2; pts.slice(1).forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(W * 0.5, H * 0.42); ctx.lineTo(x, y); ctx.stroke(); }); ctx.restore();
        D.txt(ctx, 'روابط هيدروجينية مع أربعة جزيئات', W / 2, H * 0.92, { color: cols.c5, size: n ? 13 : 15, w: '700' });
        D.txt(ctx, 'δ−', W * 0.5, H * 0.42 - (n ? 30 : 40), { color: cols.c2, size: 13, w: '700' });
      } else if (p.test === 'ph') {
        Object.keys(CUPS).forEach((k, i) => { const cx = W * (0.2 + i * 0.3), by = H * 0.7; R.beaker(ctx, cx, by, Math.min(120, W * 0.22), Math.min(150, H * 0.38), { level: 0.6, color: 'rgba(96,165,250,.3)', label: CUPS[k][0], stroke: k === p.cup ? cols.c4 : undefined }); R.paper(ctx, cx - 10, by - Math.min(150, H * 0.38) - 70, 20, 50, CUPS[k][2], CUPS[k][1]); });
      } else {
        [['ماء', d.wLevel, 'rgba(96,165,250,.5)', 'rgba(219,234,254,.95)'], ['زيت', d.oLevel, 'rgba(250,204,21,.55)', 'rgba(254,240,138,.95)']].forEach(([lab, lv, c1, c2], i) => {
          const cx = W * (0.32 + i * 0.36), by = H * 0.76, bw = 70, bh = H * 0.5; const mark = by - bh * 0.6;
          ctx.fillStyle = d.frozen ? c2 : c1; ctx.fillRect(cx - bw / 2 + 3, by - bh * 0.6 * lv, bw - 6, bh * 0.6 * lv);
          ctx.strokeStyle = R.GLASS; ctx.lineWidth = 2.5; ctx.strokeRect(cx - bw / 2, by - bh, bw, bh);
          ctx.strokeStyle = cols.c2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(cx - bw / 2 - 10, mark); ctx.lineTo(cx + bw / 2 + 10, mark); ctx.stroke(); ctx.setLineDash([]);
          D.txt(ctx, lab + (d.frozen ? (lv > 1 ? ': تمدد ↑' : ': انكماش ↓') : ''), cx, by + 16, { color: cols.text, size: 13, w: '700' });
        });
        D.txt(ctx, 'المبرد: ' + p.T + ' °س', W / 2, H * 0.12, { color: p.T <= 0 ? cols.c1 : cols.text, size: 15, w: '700' });
      }
    },
    explain(a, b, da, db) { const o = []; if (a.test !== b.test) o.push(b.test === 'molecule' ? 'جزيء الماء منحنٍ وقطبي.' : b.test === 'ph' ? 'قارن لون ورق pH في الكؤوس الثلاث.' : 'برّد القارورتين وقارن المستويين.'); if (a.cup !== b.cup) o.push(CUPS[b.cup][0] + ': ' + CUPS[b.cup][1] + '.'); if (a.T !== b.T && db.frozen !== da.frozen) o.push(db.frozen ? 'تجمّد الماء فتمدد (ارتفع مستواه)، وانكمش الزيت.' : 'عاد السائلان إلى العلامتين.'); return o; },
    learn: ['**جزيء الماء (ص52):** ذرة O مرتبطة بذرتي H، وعليها زوجان غير رابطين يجعلان الجزيء منحنياً.', '**الرابطة الهيدروجينية:** تنشأ بين H (δ+) المرتبطة بـ F أو O أو N وبين F أو O أو N (δ−) في جزيء آخر، وهي أضعف من الرابطة O–H.', '**شذوذ الماء (ص55):** يتجمد الماء عند 0 °س، وتقل كثافته تحت 4 °س فيتمدد عند التجمد، لذلك يطفو الجليد وتبقى الأسماك حية تحته.'],
    challenges: [
      { q: 'أظهر أن إضافة NaOH تجعل الماء قاعدياً.', hint: 'اختبار ورق pH، والكأس الأولى.', init: { test: 'molecule', cup: 'tap' }, check: (p) => p.test === 'ph' && p.cup === 'NaOH', why: () => 'ورق pH يدل على وسط قاعدي.' },
      { q: 'برّد القارورتين حتى يظهر شذوذ الماء.', hint: 'اختبار التجميد، ودرجة حرارة 0 °س أو أقل.', init: { test: 'freeze', T: 20 }, check: (p, d) => p.test === 'freeze' && d.frozen, why: () => 'يرتفع مستوى الماء المتجمد فوق العلامة بينما ينكمش الزيت.' }
    ],
    tutor: [
      { q: 'لماذا جزيء الماء منحنٍ؟', k: ['منحني', 'شكل', 'زوجان'], a: () => C.tutor('ماذا يوجد على ذرة الأكسجين غير الرابطتين مع H؟', 'زوجان من الإلكترونات غير الرابطة يدفعان الرابطتين فيصبح الجزيء منحنياً (ص52).') },
      { q: 'لماذا يطفو الجليد؟', k: ['يطفو', 'جليد', 'كثافه', 'شذوذ'], a: () => C.tutor('هل يزداد حجم الماء أم يقل عند تجمده؟', 'يتمدد الماء عند التجمد فتقل كثافته، فيطفو الجليد (شذوذ الماء).') },
      { q: 'ما الرابطة الهيدروجينية؟', k: ['هيدروجينيه', 'رابطه'], a: () => C.tutor('أي ذرات تحمل شحنة جزئية موجبة وأيها سالبة؟', 'تجاذب بين H (δ+) في جزيء وذرة O أو N أو F (δ−) في جزيء آخر، وهي أضعف من الرابطة التساهمية O–H.') }
    ]
  });

  /* ======================= نشاط (3) الماء مذيب عام ص56 ======================= */
  const SOL = { sugar: ['سكر (1 غم)', true, false], salt: ['ملح طعام (1 غم)', true, false], CaCO3: ['كربونات الكالسيوم (1 غم)', false, false], EtOH: ['كحول إيثانول 96% (5 مل)', true, false] };
  reg({
    id: 'water-solvent', order: 2, lesson: '3-2', lessonTitle: 'الماء مذيب جيد لمعظم المواد', page: 56,
    titleAr: 'الماء مذيب عام: مقارنة الماء بالزيت', titleEn: 'Water as a Universal Solvent',
    tags: 'ذوبان مذيب مذاب ماء زيت ذرة سكر ملح كربونات الكالسيوم كحول نشاط 3',
    formula: '\\text{المذاب} + \\text{المذيب} \\rightarrow \\text{محلول}',
    book: 'نشاط (3) ص56: (10) مل ماء مقطّر في 4 أنابيب، ثم (1) غم سكر، و(1) غم ملح، و(1) غم CaCO₃، و(5) مل كحول، مع الرجّ؛ ثم إعادة الخطوات بزيت الذرة بدل الماء.',
    summary: 'الماء يذيب كثيراً من المواد مثل السكر والملح ويمتزج بالكحول، لذلك يُسمى مذيباً عاماً، لكنه لا يذيب كل المواد (مثل كربونات الكالسيوم). أما زيت الذرة فلا يذيب هذه المواد.',
    vars: [['\\text{المذيب}', 'ماء مقطّر أو زيت ذرة', '—', '10 مل'], ['\\text{المذاب}', 'المادة المضافة', '—', '4 مواد']],
    assumptions: ['النتائج نوعية (يذوب / لا يذوب) كما يطلبها النشاط.'],
    params: [
      { key: 'solvent', label: '\\text{المذيب}', type: 'select', value: 'water', options: [['water', 'ماء مقطّر'], ['oil', 'زيت ذرة']] },
      { key: 'solute', label: '\\text{المادة المضافة}', type: 'select', value: 'sugar', options: Object.keys(SOL).map((k) => [k, SOL[k][0]]) },
      { key: 'shake', label: '\\text{الرجّ}', type: 'toggle', value: false, on: 'رُجّ الأنبوب', off: 'قبل الرجّ' }
    ],
    compute(p) { const s = SOL[p.solute]; const dis = p.shake && (p.solvent === 'water' ? s[1] : s[2]); return { dis: dis }; },
    results(p, d) { return [['المذيب', p.solvent === 'water' ? 'ماء مقطّر' : 'زيت ذرة', false], ['المادة', SOL[p.solute][0], false], ['النتيجة', !p.shake ? 'رُجّ الأنبوب' : d.dis ? (p.solute === 'EtOH' ? 'يمتزج تماماً: طبقة واحدة' : 'يذوب: محلول رائق') : (p.solute === 'EtOH' ? 'لا يمتزج: طبقتان' : 'لا يذوب: يبقى في القاع'), false, p.shake ? (d.dis ? 'pos' : 'neg') : '']]; },
    steps() { return ['ضع (10) مل ماء مقطّر في 4 أنابيب اختبار.', 'أضف إلى الأنابيب: 1 غم سكر، 1 غم ملح، 1 غم CaCO₃، 5 مل كحول، ورجّ كل أنبوب.', 'أعد الخطوات باستخدام زيت الذرة بدل الماء، وقارن.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const n = R.narrow(W); const keys = Object.keys(SOL);
      keys.forEach((k, i) => {
        const cx = W * (0.14 + i * 0.24), by = H * 0.72, th = Math.min(200, H * 0.48); const on = k === p.solute; const sh = on && p.shake;
        const dis = (p.solvent === 'water' ? SOL[k][1] : SOL[k][2]) && sh;
        const base = p.solvent === 'water' ? 'rgba(96,165,250,.35)' : 'rgba(250,204,21,.45)';
        R.tube(ctx, cx, by, 34, th, { level: 0.45, color: base, solid: on && !dis && k !== 'EtOH' ? { color: '#f8fafc', h: 10 } : null, layer: on && k === 'EtOH' && !dis ? { color: 'rgba(241,245,249,.9)', top: 0.6, bottom: 0.45 } : null, label: SOL[k][0].split(' (')[0] });
        if (on) { ctx.strokeStyle = cols.c4; ctx.lineWidth = 3; ctx.strokeRect(cx - 24, by - th - 8, 48, th + 14); D.txt(ctx, !p.shake ? '؟' : dis ? 'يذوب ✓' : 'لا يذوب ✗', cx, by - th - 22, { color: !p.shake ? cols.muted : dis ? cols.c3 : cols.c2, size: 13, w: '700' }); }
      });
      D.txt(ctx, 'المذيب: ' + (p.solvent === 'water' ? 'ماء مقطّر' : 'زيت ذرة'), W / 2, H * 0.92, { color: cols.text, size: n ? 13 : 15, w: '700' });
    },
    explain(a, b, da, db) { const o = []; if (a.solvent !== b.solvent) o.push(b.solvent === 'oil' ? 'الزيت لا يذيب السكر ولا الملح ولا يمتزج بالكحول.' : 'الماء يذيب معظم المواد.'); if (b.shake && (a.shake !== b.shake || a.solute !== b.solute)) o.push(SOL[b.solute][0] + ': ' + (db.dis ? 'يذوب في ' : 'لا يذوب في ') + (b.solvent === 'water' ? 'الماء' : 'الزيت') + '.'); return o; },
    learn: ['**الماء مذيب عام (ص56):** يذيب السكر والملح ويمتزج بالكحول، ولا يذيب كربونات الكالسيوم.', '**أهمية ذلك:** تغذية الكائنات الحية تعتمد على إذابة المواد الغذائية في الماء (ص57).', '**فكّر:** هل يذوب الأكسجين وثاني أكسيد الكربون في الماء؟ (تعيش الأسماك بالأكسجين الذائب).'],
    challenges: [
      { q: 'أوجد مادة لا تذوب حتى في الماء.', hint: 'جرّب المواد الأربع في الماء مع الرجّ.', init: { solvent: 'water', solute: 'sugar', shake: false }, check: (p, d) => p.solvent === 'water' && p.shake && !d.dis, why: () => 'كربونات الكالسيوم لا تذوب في الماء.' },
      { q: 'بيّن أن الزيت لا يذيب الملح.', hint: 'غيّر المذيب إلى الزيت والمادة إلى الملح ورجّ.', init: { solvent: 'water', solute: 'salt', shake: false }, check: (p) => p.solvent === 'oil' && p.solute === 'salt' && p.shake, why: () => 'يبقى الملح في قاع أنبوب الزيت.' }
    ],
    tutor: [
      { q: 'لماذا يُسمى الماء مذيباً عاماً؟', k: ['عام', 'مذيب', 'لماذا'], a: () => C.tutor('كم مادة من الأربع ذابت في الماء؟ وكم في الزيت؟', 'لأنه يذيب عدداً كبيراً من المواد مقارنة بغيره من المذيبات.') },
      { q: 'ما المشكلات الناتجة عن كون الماء مذيباً عاماً؟', k: ['مشكلات', 'تلوث'], a: () => C.tutor('ماذا يحمل الماء أثناء جريانه على الصخور والتربة؟', 'يذيب الأملاح والملوثات بسهولة فيتلوث ويصبح عسراً (فكّر ص57).') },
      { q: 'هل يذوب الأكسجين في الماء؟', k: ['اكسجين', 'غاز'], a: () => C.tutor('كيف تتنفس الأسماك تحت الماء؟', 'نعم، يذوب الأكسجين بكمية قليلة، وتتنفسه الكائنات المائية.') }
    ]
  });

  /* ======================= نشاط (5) الماء وسط للتفاعلات ص59 ======================= */
  reg({
    id: 'water-medium', order: 3, lesson: '3-3', lessonTitle: 'الماء وسط تجري فيه التفاعلات', page: 59,
    titleAr: 'الماء وسط للتفاعلات: FeCl₃ مع NaOH', titleEn: 'Water as a Reaction Medium',
    tags: 'كلوريد الحديد هيدروكسيد الصوديوم راسب هيدروكسيد الحديد ايونات محلول صلب سرعة التفاعل نشاط 5',
    formula: '\\text{FeCl}_3 + 3\\text{NaOH} \\rightarrow \\text{Fe(OH)}_3 + 3\\text{NaCl}',
    book: 'نشاط (5) ص59: البس القفازات، واخلط (1) غم FeCl₃ صلب مع (1) غم NaOH صلب على ورق ترشيح، وسجّل الزمن (ز1)؛ ثم أذب كلاً منهما في (20) مل ماء، وأضف قطرات من محلول NaOH إلى (10) مل محلول FeCl₃ وسجّل الزمن (ز2). المعادلة الأيونية: {{3Na⁺ + 3OH⁻ + Fe³⁺ + 3Cl⁻ → Fe(OH)₃(s) + 3Na⁺ + 3Cl⁻}}.',
    summary: 'في المحلول المائي تكون الأيونات حرة الحركة فتتصادم بسرعة، لذلك يحدث التفاعل في المحلول أسرع بكثير منه بين المادتين الصلبتين (ز2 أقصر من ز1)، ويتكوّن راسب هيدروكسيد الحديد (III).',
    vars: [['\\text{الحالة}', 'المادتان صلبتان أو محلولان', '—', 'صلب / محلول'], ['t', 'الزمن منذ الخلط', '\\text{ث}', '—']],
    assumptions: ['الزمنان ز1 وز2 لا يذكرهما الكتاب؛ القيم المعروضة ' + C.SIMPLE + ' لإظهار الفرق.'],
    params: [
      { key: 'state', label: '\\text{حالة المواد}', type: 'select', value: 'solid', options: [['solid', 'صلبتان على ورق ترشيح (ز1)'], ['solution', 'محلولان في الماء (ز2)']] },
      { key: 'gloves', label: '\\text{القفازات}', type: 'toggle', value: true, on: 'ألبسها', off: 'بلا قفازات' }
    ],
    resetOn: ['state'],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0 }),
    tick(st, p, d, dt) { st.t += dt; },
    isDone: (st, p) => st.t >= (p.state === 'solid' ? 60 : 4),
    compute(p) { return { tau: p.state === 'solid' ? 45 : 1.2 }; },
    results(p, d) {
      const st = d.st || { t: 0 }; const prog = 1 - Math.exp(-st.t / d.tau);
      return [['الزمن', r2(st.t, 1) + ' ث', false], ['التقدم (' + C.SIMPLE + ')', Math.round(prog * 100) + ' %', false], ['المشاهدة', prog > 0.9 ? 'تغيّر اللون: راسب بني محمر Fe(OH)₃' : prog > 0.2 ? 'يبدأ تغيّر اللون' : 'لا تغيّر واضحاً بعد', false, prog > 0.9 ? 'pos' : ''], ['التفسير', p.state === 'solution' ? 'الأيونات حرة الحركة في الماء: تفاعل سريع (ز2 قصير)' : 'الأيونات مقيدة في الشبكة الصلبة: تفاعل بطيء (ز1 طويل)', false], ['نوع التفاعل', 'إحلال مزدوج', false]].concat(p.gloves ? [] : [['تنبيه سلامة', 'البس القفازات: NaOH مادة كاوية (ص59)', false, 'neg']]);
    },
    steps(p) { return p.state === 'solid' ? ['البس القفازات، واخلط 1 غم FeCl₃ صلب مع 1 غم NaOH صلب على ورق ترشيح.', 'شغّل الزمن وسجّل زمن تغيّر اللون (ز1).'] : ['أذب 1 غم FeCl₃ في 20 مل ماء مقطّر، و1 غم NaOH في 20 مل أخرى.', 'ضع 10 مل من محلول FeCl₃ في أنبوب، وأضف قطرات من محلول NaOH.', 'شغّل الزمن وسجّل الزمن (ز2)، وقارنه بـ (ز1).']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const st = d.st || { t: 0 }; const n = R.narrow(W); const prog = 1 - Math.exp(-st.t / d.tau);
      const mix = (a, b, f) => 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * f)).join(',') + ')';
      if (p.state === 'solid') {
        const cx = W * 0.4, cy = H * 0.5; ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.arc(cx, cy, Math.min(W, H) * 0.26, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = cols.muted; ctx.stroke();
        for (let i = 0; i < 40; i++) { const a = i * 2.4, r = Math.sqrt(i) * 10; ctx.fillStyle = i % 2 ? mix([253, 224, 71], [154, 52, 18], prog) : mix([248, 250, 252], [154, 52, 18], prog); ctx.fillRect(cx + Math.cos(a) * r - 4, cy + Math.sin(a) * r - 4, 8, 8); }
        D.txt(ctx, 'ورق ترشيح: FeCl₃ (أصفر) + NaOH (أبيض) صلبان', cx, cy + Math.min(W, H) * 0.26 + 18, { color: cols.text, size: 12, w: '700' });
      } else {
        const cx = W * 0.4, by = H * 0.75; R.tube(ctx, cx, by, 50, Math.min(230, H * 0.55), { level: 0.45, color: mix([250, 204, 21], [180, 83, 9], prog).replace('rgb', 'rgba').replace(')', ',.6)'), solid: prog > 0.3 ? { color: '#9a3412', h: 6 + 14 * prog } : null, label: '10 مل محلول FeCl₃' });
        for (let i = 0; i < 3; i++) { ctx.fillStyle = 'rgba(241,245,249,.9)'; ctx.beginPath(); ctx.arc(cx, by - Math.min(230, H * 0.55) - 20 - i * 14, 4, 0, Math.PI * 2); ctx.fill(); }
        D.txt(ctx, 'قطرات NaOH', cx + 60, by - Math.min(230, H * 0.55) - 30, { color: cols.text, size: 12 });
      }
      const tx = W * 0.8; D.txt(ctx, (p.state === 'solid' ? 'ز1' : 'ز2') + ' = ' + r2(st.t, 1) + ' ث', tx, H * 0.3, { color: cols.c1, size: n ? 15 : 18, w: '700' }); D.txt(ctx, Math.round(prog * 100) + '%', tx, H * 0.42, { color: cols.c4, size: n ? 14 : 16, w: '700' });
      ML.chemEqLine(ctx, W, H * 0.93, 'FeCl₃ + 3NaOH → Fe(OH)₃(s) + 3NaCl', cols, n ? 13 : 16);
    },
    explain(a, b) { const o = []; if (a.state !== b.state) o.push(b.state === 'solution' ? 'في المحلول الأيونات حرة الحركة، فيتكوّن الراسب فوراً تقريباً.' : 'بين الصلبين يكون التلامس قليلاً والأيونات غير حرة، فيبطؤ التفاعل.'); if (a.gloves !== b.gloves && !b.gloves) o.push('النشاط يطلب لبس القفازات.'); return o; },
    learn: ['**الماء وسط للتفاعلات (ص58–59):** معظم التفاعلات في المختبر والطبيعة تحدث في وسط مائي.', '**السبب:** في المحلول تتفكك المركبات الأيونية إلى أيونات حرة الحركة فتتصادم بسهولة، فيكون ز2 أقصر بكثير من ز1.', '**نوع التفاعل:** إحلال مزدوج، ويتكون راسب هيدروكسيد الحديد (III).'],
    challenges: [
      { q: 'شغّل التفاعل في المحلول حتى يتكوّن الراسب.', hint: 'اختر المحلولين ثم ▶ تشغيل.', init: { state: 'solid' }, check: (p, d) => p.state === 'solution' && !!d.st && d.st.t > 3, why: () => 'تكوّن الراسب خلال ثوانٍ.' },
      { q: 'قِس ز1 للمادتين الصلبتين: شغّل حتى يتجاوز التقدم 70%.', hint: 'المادتان الصلبتان تحتاجان وقتاً أطول بكثير.', init: { state: 'solution' }, check: (p, d) => p.state === 'solid' && !!d.st && (1 - Math.exp(-d.st.t / 45)) > 0.7, why: (p, d) => 'ز1 ≈ ' + r2(d.st.t, 0) + ' ث، أطول بكثير من ز2.' }
    ],
    tutor: [
      { q: 'لماذا ز2 أقصر من ز1؟', k: ['ز2', 'ز1', 'اسرع', 'لماذا'], a: () => C.tutor('هل الأيونات في الحالة الصلبة حرة الحركة؟', 'في المحلول تتحرك الأيونات بحرية فتتصادم بسرعة؛ أما في الصلب فهي مقيدة.') },
      { q: 'ما الراسب المتكوّن؟', k: ['راسب', 'لون'], a: () => C.tutor('أي النواتج لا يذوب في الماء؟', 'هيدروكسيد الحديد (III) Fe(OH)₃.') },
      { q: 'ما نوع التفاعل؟', k: ['نوع', 'احلال'], a: () => C.tutor('ماذا تبادلت الأيونات؟', 'إحلال مزدوج: تتبادل الأيونات الموجبة والسالبة شركاءها.') }
    ]
  });

  /* ======================= نشاط (6) عسر الماء ص60–62 ======================= */
  const WAT = { distilled: ['ماء مقطّر', 0], tap: ['ماء الصنبور', 1], temp: ['ماء + Ca(HCO₃)₂ (عسر مؤقت)', 2], perm: ['ماء + CaSO₄ (عسر دائم)', 3] };
  // عدد القطرات اللازمة لتكوين رغوة: لا يذكره الكتاب — نموذج مبسّط
  const NEED = [3, 12, 26, 26];
  reg({
    id: 'water-hardness', order: 4, lesson: '3-4', lessonTitle: 'عسر الماء', page: 60,
    titleAr: 'عسر الماء والصابون: المؤقت والدائم', titleEn: 'Water Hardness and Soap',
    tags: 'عسر الماء مؤقت دائم صابون رغوة كربونات الكالسيوم الهيدروجينية كبريتات تسخين كربونات الصوديوم تكلس نشاط 6',
    formula: '\\text{Ca(HCO}_3)_2 \\xrightarrow{\\Delta} \\text{CaCO}_3 + \\text{CO}_2 + \\text{H}_2\\text{O} \\;;\\; \\text{Na}_2\\text{CO}_3 + \\text{CaSO}_4 \\rightarrow \\text{CaCO}_3 + \\text{Na}_2\\text{SO}_4',
    book: 'نشاط (6) ص60: (5) مل من كل عيّنة ماء، وإضافة محلول الصابون قطرة قطرة مع الرجّ حتى تتكون رغوة، وعدّ القطرات. ص61: العسر المؤقت يزول بالتسخين، والعسر الدائم (CaSO₄ ، MgSO₄) يُعالج بإضافة Na₂CO₃.',
    summary: 'الماء العسر يحتوي أيونات Ca²⁺ و Mg²⁺ فيصعب تكوّن الرغوة مع الصابون ويحتاج قطرات أكثر. العسر المؤقت (الكربونات الهيدروجينية) يزول بالتسخين، والدائم (الكبريتات) يحتاج معالجة كيميائية بكربونات الصوديوم.',
    vars: [['\\text{العيّنة}', 'نوع الماء (5 مل)', '—', '4 عيّنات'], ['\\text{القطرات}', 'قطرات محلول الصابون المضافة', '\\text{قطرة}', '0–40'], ['\\text{المعالجة}', 'بلا / تسخين / Na₂CO₃', '—', '—']],
    assumptions: ['عدد القطرات اللازم لكل عيّنة لا يذكره الكتاب: ' + C.SIMPLE + '؛ الكتاب يطلب المقارنة بين العيّنات.'],
    params: [
      { key: 'water', label: '\\text{العيّنة}', type: 'select', value: 'distilled', options: Object.keys(WAT).map((k) => [k, WAT[k][0]]) },
      { key: 'treat', label: '\\text{المعالجة قبل الاختبار}', type: 'select', value: 'none', options: [['none', 'بلا معالجة'], ['boil', 'التسخين حتى الغليان'], ['soda', 'إضافة Na₂CO₃']] },
      { key: 'drops', label: '\\text{قطرات الصابون}', min: 0, max: 40, step: 1, value: 0, int: true }
    ],
    compute(p) {
      const i = WAT[p.water][1]; let need = NEED[i]; let removed = false;
      if (p.treat === 'boil' && i === 2) { need = NEED[0] + 1; removed = true; }
      if (p.treat === 'soda' && i >= 2) { need = NEED[0] + 1; removed = true; }
      if (p.treat === 'soda' && i === 1) need = NEED[0] + 1;
      if (p.treat === 'boil' && i === 1) need = Math.round((NEED[1] + NEED[0]) / 2);
      return { need: need, foam: p.drops >= need, removed: removed, kind: i === 2 ? 'مؤقت' : i === 3 ? 'دائم' : i === 1 ? 'مؤقت ودائم بنسب مختلفة' : 'لا عسر' };
    },
    results(p, d) {
      const out = [['العيّنة', WAT[p.water][0], false], ['القطرات المضافة', p.drops + ' قطرة', false], ['الرغوة', d.foam ? 'تكوّنت رغوة ثابتة' : 'لم تتكوّن رغوة بعد (يتكوّن راسب خثر)', false, d.foam ? 'pos' : 'neg'], ['نوع العسر', d.kind, false]];
      if (p.treat === 'boil') out.push(['التسخين', WAT[p.water][1] === 2 ? 'يزيل العسر المؤقت: يترسب CaCO₃' : WAT[p.water][1] === 3 ? 'لا يزيل العسر الدائم' : 'يزيل الجزء المؤقت فقط', false]);
      if (p.treat === 'soda') out.push(['Na₂CO₃', 'يرسّب Ca²⁺ و Mg²⁺ على شكل كربونات فيزيل العسر', false]);
      return out;
    },
    steps(p, d) { return ['أذب ملعقة من برش الصابون في ماء مقطّر داخل دورق حجمي سعته لتر.', 'ضع (5) مل من العيّنة في أنبوب اختبار' + (p.treat !== 'none' ? ' بعد ' + (p.treat === 'boil' ? 'تسخينها حتى الغليان' : 'إضافة Na₂CO₃') : '') + '.', 'أضف محلول الصابون قطرة قطرة مع الرجّ حتى تتكون رغوة، وعدّ القطرات (اللازم هنا ≈ ' + d.need + ').', 'قارن عدد القطرات بين العيّنات وفسّر.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const n = R.narrow(W); const cx = W * 0.38, by = H * 0.74, th = Math.min(220, H * 0.52);
      R.tube(ctx, cx, by, 54, th, { level: 0.42, color: 'rgba(96,165,250,.35)', solid: !d.foam && p.drops > 2 && WAT[p.water][1] > 0 && !d.removed ? { color: 'rgba(241,245,249,.95)', h: 8 } : null, label: '5 مل' });
      if (d.foam) { for (let i = 0; i < 26; i++) { ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.strokeStyle = '#cbd5e1'; ctx.beginPath(); ctx.arc(cx - 20 + (i % 6) * 8, by - th * 0.42 - 8 - Math.floor(i / 6) * 8, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); } D.txt(ctx, 'رغوة ✓', cx, by - th * 0.42 - 54, { color: cols.c3, size: 14, w: '700' }); }
      if (d.removed) D.txt(ctx, 'أُزيل العسر: راسب CaCO₃', cx + 90, by - 10, { color: cols.c4, size: 12, w: '700' });
      const bx = W * 0.7, bb = H * 0.74, bh = H * 0.5; ctx.fillStyle = 'rgba(148,163,184,.18)'; ctx.fillRect(bx - 22, bb - bh, 44, bh); const f = Math.min(1, p.drops / 40); ctx.fillStyle = d.foam ? cols.c3 : cols.c1; ctx.fillRect(bx - 22, bb - bh * f, 44, bh * f);
      const ny = bb - bh * Math.min(1, d.need / 40); ctx.strokeStyle = cols.c2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(bx - 36, ny); ctx.lineTo(bx + 36, ny); ctx.stroke(); ctx.setLineDash([]);
      D.txt(ctx, p.drops + ' قطرة', bx, bb + 16, { color: cols.text, size: 13, w: '700' }); D.txt(ctx, 'اللازم للرغوة', bx + 46, ny, { color: cols.c2, size: 11, align: 'left' });
      ML.chemEqLine(ctx, W, H * 0.93, p.treat === 'soda' ? 'Na₂CO₃(aq) + CaSO₄(aq) → CaCO₃(s) + Na₂SO₄(aq)' : 'Ca(HCO₃)₂(aq) →(Δ) CaCO₃(s) + CO₂(g) + H₂O(l)', cols, n ? 12 : 15);
    },
    explain(a, b, da, db) { const o = []; if (a.water !== b.water || a.treat !== b.treat) o.push(WAT[b.water][0] + (b.treat !== 'none' ? ' بعد ' + (b.treat === 'boil' ? 'التسخين' : 'إضافة Na₂CO₃') : '') + ': تحتاج نحو ' + db.need + ' قطرة لتكوين الرغوة.'); if (a.drops !== b.drops && db.foam && !da.foam) o.push('تكوّنت الرغوة بعد ' + b.drops + ' قطرة.'); return o; },
    learn: ['**عسر الماء (ص61):** ارتفاع نسبة أيونات Ca²⁺ و Mg²⁺ في الماء، فيصعب تكوّن رغوة مع الصابون.', '**العسر المؤقت:** سببه كربونات الكالسيوم الهيدروجينية، ويزول بالتسخين: {{Ca(HCO₃)₂(aq) → CaCO₃(s) + CO₂(g) + H₂O(l)}} (يترسب في قاع السخان).', '**العسر الدائم:** سببه CaSO₄ و MgSO₄، ولا يزول بالتسخين، ويُعالج بـ Na₂CO₃.', '**التكلّس:** يقلل كفاءة سخانات الماء وأنظمة التسخين (ص62).'],
    challenges: [
      { q: 'كوّن رغوة مع ماء فيه عسر مؤقت دون معالجة.', hint: 'أضف قطرات صابون أكثر بكثير من الماء المقطّر.', init: { water: 'temp', treat: 'none', drops: 0 }, check: (p, d) => p.water === 'temp' && p.treat === 'none' && d.foam, why: (p) => 'احتاج ' + p.drops + ' قطرة على الأقل.' },
      { q: 'أزل العسر المؤقت بالتسخين، ثم كوّن رغوة بأقل من 6 قطرات.', hint: 'المعالجة: التسخين حتى الغليان.', init: { water: 'temp', treat: 'none', drops: 5 }, check: (p, d) => p.water === 'temp' && p.treat === 'boil' && d.foam && p.drops < 6, why: () => 'التسخين رسّب CaCO₃ فزال العسر.' },
      { q: 'العسر الدائم لا يزول بالتسخين: أزله بطريقة أخرى ثم كوّن رغوة بأقل من 6 قطرات.', hint: 'أضف كربونات الصوديوم.', init: { water: 'perm', treat: 'boil', drops: 5 }, check: (p, d) => p.water === 'perm' && p.treat === 'soda' && d.foam && p.drops < 6, why: () => 'رسّبت Na₂CO₃ أيونات الكالسيوم على شكل CaCO₃.' }
    ],
    tutor: [
      { q: 'لماذا يحتاج الماء العسر قطرات أكثر؟', k: ['قطرات', 'رغوه', 'اكثر'], a: () => C.tutor('ماذا تفعل أيونات Ca²⁺ و Mg²⁺ بالصابون؟', 'تتفاعل أيونات الكالسيوم والمغنيسيوم مع الصابون فتكوّن راسباً بدل الرغوة، فيلزم صابون أكثر.') },
      { q: 'ما الفرق بين العسر المؤقت والدائم؟', k: ['مؤقت', 'دائم', 'فرق'], a: () => C.tutor('أيّهما يزول بالغليان؟', 'المؤقت سببه Ca(HCO₃)₂ ويزول بالتسخين؛ والدائم سببه CaSO₄ و MgSO₄ ولا يزول إلا بمعالجة كيميائية (Na₂CO₃).') },
      { q: 'كيف نتخلص من التكلّس؟', k: ['تكلس', 'سخان'], a: () => C.tutor('ما سبب الطبقة البيضاء في السخان؟', 'التكلّس راسب CaCO₃ من العسر المؤقت؛ نقلّله بمعالجة الماء أو إزالة الكلس بمحلول حمضي مخفف.') }
    ]
  });

  /* ======================= نشاطا (4) و(7) أصناف المياه وتلوثها ص57–64 ======================= */
  const DEAD = [['Cl⁻ و Br⁻', 230.4], ['Mg²⁺', 45.9], ['Na⁺', 36.6], ['Ca²⁺', 17.6], ['K⁺', 7.8]]; // الجدول (3-2) ص58
  const WADI = [['الأملاح الذائبة الكلية TDS', 1485], ['الكلورايد Cl⁻', 591], ['النترات NO₃⁻', 48], ['الزئبق Hg²⁺', 0.01, 1], ['الرصاص Pb²⁺', 0.008, 1], ['العسر الكلي', 850], ['الكبريتات SO₄²⁻', 179], ['الكالسيوم Ca²⁺', 100], ['المغنيسيوم Mg²⁺', 102], ['الصوديوم Na⁺', 190], ['البوتاسيوم K⁺', 15], ['الفلورايد F⁻', 1.5], ['الكادميوم Cd²⁺', 0.0048, 1], ['المنظفات ABS', 1.5]]; // نشاط (7) ص64
  reg({
    id: 'water-types', order: 5, lesson: '3-5', lessonTitle: 'أصناف المياه وتلوث الماء', page: 64,
    titleAr: 'أصناف المياه: البحر الميت وعيّنة ماء ملوّث', titleEn: 'Types of Water: Dead Sea and a Polluted Sample',
    tags: 'اصناف المياه عذب مالح البحر الميت ملوحة تلوث ايونات ثقيلة سامة زئبق رصاص كادميوم نشاط 4 نشاط 7 جدول 3-2',
    formula: '\\text{ملوحة البحر الميت} \\approx 35\\text{–}55\\% \\;(\\approx 340\\ \\text{غم/لتر}) ,\\quad \\text{البحار} \\approx 4\\text{–}6\\%',
    book: 'نشاط (4) ص57–58: أصناف المياه في الآية (فاطر: 12)؛ ملوحة البحر الميت 35–55% أي نحو 340 غم/لتر مقابل 4–6% لبحار العالم، والجدول (3-2) تراكيز الأملاح فيه (كما وردت: ملغم/لتر). نشاط (7) ص64: نتيجة فحص عيّنة ماء من أحد الأودية.',
    summary: 'تختلف المياه في الطبيعة بنسب الأملاح الذائبة فيها: عذبة ومالحة، والبحر الميت أكثر مياه الأرض ملوحة. ويُحكم على صلاحية الماء للشرب بمقارنة تراكيز الأيونات بالمواصفات، ومن أخطرها الأيونات الثقيلة السامة كالزئبق والرصاص والكادميوم.',
    vars: [['\\text{العرض}', 'الملوحة / أيونات البحر الميت / عيّنة الوادي', '—', '3 عروض'], ['\\text{التركيز}', 'تركيز الأيون كما في جداول الكتاب', '\\text{ملغم/لتر}', '—']],
    assumptions: ['حدود المواصفات الفلسطينية موجودة في رمز QR وليست في الكتاب، فلا تُعرض أرقامها هنا.'],
    params: [{ key: 'view', label: '\\text{العرض}', type: 'select', value: 'salinity', options: [['salinity', 'ملوحة المياه (نشاط 4)'], ['dead', 'أملاح البحر الميت — جدول (3-2)'], ['wadi', 'عيّنة ماء من وادٍ (نشاط 7)']] }],
    compute(p) { return {}; },
    results(p) {
      if (p.view === 'salinity') return [['البحر الميت', '35–55% (≈ 340 غم/لتر)', false], ['بحار العالم ومحيطاته', '4–6%', false], ['مياه الأمطار', 'من أنقى صور الماء في الطبيعة', false]];
      if (p.view === 'dead') return DEAD.map((x) => [x[0], x[1] + ' (كما في الجدول 3-2)', false]);
      return [['أيونات ثقيلة وسامة في العيّنة', 'الزئبق Hg²⁺ (0.01)، الرصاص Pb²⁺ (0.008)، الكادميوم Cd²⁺ (0.0048) ملغم/لتر', false, 'neg'], ['أعلى تركيز', 'الأملاح الذائبة الكلية 1485 ملغم/لتر', false], ['الحكم على الصلاحية', 'قارن كل قيمة بمصفوفة المواصفات الفلسطينية (رمز QR في الكتاب)', false]];
    },
    steps(p) { return p.view === 'wadi' ? ['اقرأ تراكيز الأيونات في عيّنة الوادي.', 'حدّد الأيونات الثقيلة السامة.', 'قارن كل قيمة بالمواصفات الفلسطينية واحكم على صلاحية العيّنة للشرب.'] : ['قارن بين المياه العذبة والمالحة والمياه النقية.', 'لماذا سُمّي البحر الميت بهذا الاسم؟']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const n = R.narrow(W);
      if (p.view === 'salinity') {
        const items = [['مياه الأمطار', 0.5, cols.c1], ['بحار العالم 4–6%', 5, cols.c3], ['البحر الميت 35–55%', 45, cols.c4]];
        items.forEach(([lab, v, c], i) => { const x = W * (0.2 + i * 0.3), base = H * 0.78, h = H * 0.6 * v / 55; ctx.fillStyle = c; ctx.fillRect(x - 30, base - Math.max(2, h), 60, Math.max(2, h)); D.txt(ctx, lab, x, base + 16, { color: cols.text, size: n ? 11 : 13, w: '700' }); });
        D.txt(ctx, 'نسبة الأملاح والشوائب', W / 2, H * 0.1, { color: cols.text, size: n ? 13 : 15, w: '700' });
      } else if (p.view === 'dead') {
        const max = 230.4; DEAD.forEach(([lab, v], i) => { const y = H * 0.14 + i * (H * 0.15); const w = (W * 0.6) * v / max; ctx.fillStyle = cols.c1; ctx.fillRect(W * 0.3, y, w, H * 0.09); D.txt(ctx, lab, W * 0.27, y + H * 0.045, { color: cols.text, size: 12.5, w: '700', align: 'right' }); D.txt(ctx, String(v), W * 0.3 + w + 8, y + H * 0.045, { color: cols.text, size: 12, align: 'left' }); });
      } else {
        const rows = [['الخاصية', 'ملغم/لتر']].concat(WADI.map((x) => [x[0], x[1]]));
        R.table(ctx, 14, 10, W - 28, Math.min(30, (H - 20) / rows.length), rows, cols, { size: n ? 10.5 : 12, colColor: (i) => (i > 0 && WADI[i - 1][2] ? cols.c2 : null) });
      }
    },
    explain(a, b) { return a.view !== b.view ? [b.view === 'salinity' ? 'البحر الميت أكثر مياه الأرض ملوحة.' : b.view === 'dead' ? 'أكثر الأيونات تركيزاً في البحر الميت: الكلورايد والبروميد.' : 'الأيونات الحمراء ثقيلة وسامة حتى بتراكيز صغيرة جداً.'] : []; },
    learn: ['**أصناف المياه (نشاط 4):** عذب فرات، وملح أجاج (فاطر: 12)، والماء النقي لا يحتوي إلا جزيئات H₂O.', '**البحر الميت:** أكثر مياه الأرض ملوحة (35–55%)، وأكثر أيوناته تركيزاً Cl⁻ و Br⁻ ثم Mg²⁺ (جدول 3-2).', '**التلوث (ص63):** بيولوجي وكيميائي وفيزيائي وإشعاعي؛ ومن الملوثات الكيميائية السامة الزئبق والرصاص.'],
    challenges: [
      { q: 'اعرض الأيونات الثقيلة السامة في عيّنة الوادي.', hint: 'اختر عرض عيّنة الوادي.', init: { view: 'salinity' }, check: (p) => p.view === 'wadi', why: () => 'Hg²⁺ و Pb²⁺ و Cd²⁺.' },
      { q: 'أي أيونات البحر الميت أعلى تركيزاً؟ اعرض الجدول (3-2).', hint: 'اختر أملاح البحر الميت.', init: { view: 'salinity' }, check: (p) => p.view === 'dead', why: () => 'Cl⁻ و Br⁻ (230.4).' }
    ],
    tutor: [
      { q: 'لماذا سُمّي البحر الميت بهذا الاسم؟', k: ['الميت', 'سمي'], a: () => C.tutor('هل تستطيع الكائنات الحية العيش في ماء نسبة أملاحه 35–55%؟', 'لشدة ملوحته لا تعيش فيه الأسماك والكائنات المائية المعروفة.') },
      { q: 'ما الأيونات الثقيلة السامة؟', k: ['ثقيله', 'سامه', 'زئبق', 'رصاص'], a: () => C.tutor('أي الأيونات في الجدول لفلزات ثقيلة؟', 'الزئبق Hg²⁺ والرصاص Pb²⁺ والكادميوم Cd²⁺.') },
      { q: 'هل عيّنة الوادي صالحة للشرب؟', k: ['صالحه', 'الشرب'], a: () => C.tutor('ما الذي تحتاجه لتحكم على كل قيمة؟', 'قارن كل تركيز بالحد المسموح في المواصفات الفلسطينية (رمز QR)؛ وجود أيونات سامة وعسر كلي مرتفع (850) يستدعي الحذر.') }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
