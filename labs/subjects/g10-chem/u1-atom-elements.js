/* الكيمياء — الوحدة الأولى: بنية الذرة والعناصر الكيميائية (ص2–28) */
(function (root) {
  'use strict';
  const ML = root.ML; const C = ML.chem; const D = ML.pdraw; const R = ML.chemDraw; const B = ML.bio;
  const S = 'g10-chem', U = 1;
  const reg = (o) => ML.register(Object.assign({ subject: S, unit: U, custom: true }, o));
  const r2 = (v, k) => C.round(v, k === undefined ? 2 : k);
  const eqLine = (ctx, W, y, eq, cols, size) => { ctx.save(); ctx.direction = 'ltr'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = cols.text; let fs = size || 15; ctx.font = '700 ' + fs + 'px system-ui, sans-serif'; while (fs > 8 && ctx.measureText(eq).width > W - 16) { fs -= 0.5; ctx.font = '700 ' + fs + 'px system-ui, sans-serif'; } ctx.fillText(eq, W / 2, y); ctx.restore(); };
  ML.chemEqLine = eqLine;

  /* ======================= نشاط (2) تجارب التفريغ الكهربائي ص6 ======================= */
  const CATH = { Al: 'ألومنيوم', Fe: 'حديد', Cu: 'نحاس' };
  reg({
    id: 'cathode-rays', order: 1, lesson: '1-1-1', lessonTitle: 'تجارب التفريغ الكهربائي ونموذج ثومسون', page: 6,
    titleAr: 'تجارب التفريغ الكهربائي: أشعة المهبط', titleEn: 'Electric Discharge Tube: Cathode Rays',
    tags: 'تفريغ كهربائي أشعة المهبط الإلكترون ثومسون مغناطيس مروحة ظل نشاط 2',
    formula: '\\text{أشعة المهبط: جسيمات سالبة (إلكترونات) تتحرك من المهبط إلى المصعد}',
    book: 'نشاط (2) ص6: وصل أنبوب التفريغ بمصدر فرق جهد عالٍ، ثم تقريب مغناطيس من الشعاع. أقنعت هذه التجارب العلماء أن أحد مكونات الذرة جسيم صغير سالب سُمّي الإلكترون، وأن خصائصه لا تتغير بتغيّر مادة المهبط.',
    summary: 'عند تشغيل فرق جهد عالٍ تنطلق من المهبط أشعة: تكوّن ظلاً للأجسام التي تعترضها، وتحرّك مروحة صغيرة في طريقها، وتنحرف بالمغناطيس، ولا تتغير خصائصها بتغيّر مادة المهبط. تدل المشاهدات على جسيمات سالبة لها كتلة: الإلكترونات.',
    vars: [['\\text{الجهد}', 'تشغيل مصدر فرق الجهد العالي', '—', 'مطفأ / يعمل'], ['\\text{العائق}', 'جسم في طريق الأشعة', '—', 'لا شيء / صليب / مروحة'], ['\\text{المغناطيس}', 'مغناطيس قرب الشعاع', '—', 'بلا / قطب شمالي / قطب جنوبي'], ['\\text{المهبط}', 'مادة المهبط', '—', 'ألومنيوم / حديد / نحاس']],
    assumptions: ['مقدار انحراف الشعاع وسرعة المروحة للتوضيح فقط: ' + C.SIMPLE + '.'],
    canvasHint: 'شغّل الجهد، ثم ضع عائقاً أو قرّب المغناطيس وراقب الأشعة',
    params: [
      { key: 'power', label: '\\text{مصدر فرق الجهد}', type: 'toggle', value: false, on: 'يعمل', off: 'مطفأ' },
      { key: 'obstacle', label: '\\text{في طريق الأشعة}', type: 'select', value: 'none', options: [['none', 'لا شيء'], ['cross', 'صليب معدني'], ['wheel', 'مروحة (دولاب) صغيرة']] },
      { key: 'magnet', label: '\\text{المغناطيس}', type: 'select', value: 'none', options: [['none', 'بلا مغناطيس'], ['N', 'قطب شمالي قريب'], ['S', 'قطب جنوبي قريب']] },
      { key: 'cathode', label: '\\text{مادة المهبط}', type: 'select', value: 'Al', options: Object.keys(CATH).map((k) => [k, CATH[k]]) }
    ],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0 }),
    tick(st, p, d, dt) { st.t += dt; },
    compute(p) { return { on: !!p.power, defl: p.magnet === 'N' ? 1 : p.magnet === 'S' ? -1 : 0 }; },
    results(p, d) {
      if (!d.on) return [['الأشعة', 'لا تظهر أشعة: شغّل مصدر فرق الجهد', false]];
      return [
        ['اتجاه الأشعة', 'من المهبط (−) إلى المصعد (+)', false],
        ['العائق', p.obstacle === 'cross' ? 'يتكوّن ظل للصليب على الطرف المقابل ← الأشعة تسير في خطوط مستقيمة' : p.obstacle === 'wheel' ? 'تدور المروحة ← الأشعة جسيمات لها كتلة' : '—', false],
        ['المغناطيس', d.defl ? 'ينحرف الشعاع ← الأشعة جسيمات مشحونة' : 'لا انحراف', false],
        ['مادة المهبط', CATH[p.cathode] + ': خصائص الأشعة لا تتغير', false],
        ['الاستنتاج', 'الأشعة جسيمات سالبة الشحنة لها كتلة: الإلكترونات (ص6)', false, 'pos']
      ];
    },
    steps() { return ['تفحّص أنبوب التفريغ ومم يتكون.', 'صِل الأنبوب بمصدر فرق الجهد مراعياً الأقطاب.', 'شغّل الكهرباء بحذر لعدة ثوانٍ وسجّل ما تلاحظ.', 'قرّب مغناطيساً من الشعاع وسجّل ما تلاحظ.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const st = d.st || { t: 0 }; const n = R.narrow(W);
      const x0 = W * 0.12, x1 = W * 0.88, cy = H * 0.42, th = Math.min(110, H * 0.24);
      ctx.fillStyle = d.on ? 'rgba(167,139,250,.12)' : 'rgba(148,163,184,.08)'; D.rr(ctx, x0 - 20, cy - th / 2, x1 - x0 + 40, th, th / 2); ctx.fill();
      ctx.strokeStyle = R.GLASS; ctx.lineWidth = 2.5; D.rr(ctx, x0 - 20, cy - th / 2, x1 - x0 + 40, th, th / 2); ctx.stroke();
      ctx.fillStyle = '#475569'; ctx.fillRect(x0 - 4, cy - th * 0.3, 8, th * 0.6); ctx.fillRect(x1 - 4, cy - th * 0.3, 8, th * 0.6);
      D.txt(ctx, 'المهبط (−) — ' + CATH[p.cathode], x0 + 10, cy + th / 2 + 18, { color: cols.c1, size: n ? 11 : 13, w: '700' });
      D.txt(ctx, 'المصعد (+)', x1 - 10, cy + th / 2 + 18, { color: cols.c2, size: n ? 11 : 13, w: '700' });
      const ox = (x0 + x1) / 2;
      // مسار الشعاع
      const yAt = (x) => cy - d.defl * Math.pow(Math.max(0, (x - ox * 0.85) / (x1 - ox * 0.85)), 2) * th * 0.38;
      if (d.on) {
        const stopX = p.obstacle === 'wheel' ? ox - 14 : x1;
        ctx.strokeStyle = 'rgba(124,58,237,.75)'; ctx.lineWidth = 6; ctx.beginPath(); for (let x = x0 + 4; x <= stopX; x += 4) { const y = yAt(x); x === x0 + 4 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
        for (let i = 0; i < 10; i++) { const f = ((st.t * 0.8 + i / 10) % 1); const x = x0 + 4 + f * (stopX - x0 - 4); ctx.fillStyle = '#ede9fe'; ctx.beginPath(); ctx.arc(x, yAt(x), 2.5, 0, Math.PI * 2); ctx.fill(); }
        if (p.obstacle !== 'wheel') { ctx.fillStyle = 'rgba(132,204,22,.45)'; ctx.fillRect(x1 + 8, cy - th * 0.42, 8, th * 0.84); }
      }
      if (p.obstacle === 'cross') {
        ctx.fillStyle = '#334155'; ctx.fillRect(ox - 3, cy - 22, 6, 44); ctx.fillRect(ox - 16, cy - 3, 32, 6);
        if (d.on && !d.defl) { ctx.fillStyle = '#1e293b'; ctx.fillRect(x1 + 9, cy - 26, 6, 52); D.txt(ctx, 'ظل', x1 + 12, cy - th * 0.5 - 10, { color: cols.text, size: 12, w: '700' }); }
      } else if (p.obstacle === 'wheel') {
        ctx.save(); ctx.translate(ox, cy - 6); ctx.rotate(d.on ? st.t * 4 : 0); ctx.strokeStyle = '#334155'; ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -20); ctx.stroke(); ctx.fillStyle = '#94a3b8'; ctx.fillRect(-5, -24, 10, 6); } ctx.restore();
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ox - 40, cy + 18); ctx.lineTo(ox + 40, cy + 18); ctx.stroke();
      }
      if (p.magnet !== 'none') {
        const mx = ox + (x1 - ox) * 0.45, my = cy - th / 2 - 46; ctx.fillStyle = p.magnet === 'N' ? '#dc2626' : '#2563eb'; ctx.fillRect(mx - 26, my, 52, 30);
        D.txt(ctx, p.magnet === 'N' ? 'N' : 'S', mx, my + 15, { color: '#fff', size: 15, w: '700' });
      }
      const obs = !d.on ? 'شغّل مصدر فرق الجهد لترى الأشعة' : d.defl ? 'الشعاع ينحرف بالمغناطيس: جسيمات مشحونة' : p.obstacle === 'wheel' ? 'المروحة تدور: الجسيمات لها كتلة' : p.obstacle === 'cross' ? 'ظل الصليب: الأشعة تسير بخطوط مستقيمة' : 'أشعة تنطلق من المهبط إلى المصعد';
      D.txt(ctx, obs, W / 2, H * 0.82, { color: d.on ? cols.c5 : cols.muted, size: n ? 13 : 15, w: '700' });
    },
    explain(a, b, da, db) {
      const o = [];
      if (a.power !== b.power) o.push(b.power ? 'شغّلت فرق الجهد العالي: انطلقت أشعة من المهبط نحو المصعد.' : 'أطفأت المصدر: اختفت الأشعة.');
      if (a.obstacle !== b.obstacle) o.push(b.obstacle === 'cross' ? 'العائق يكوّن ظلاً: الأشعة تسير في خطوط مستقيمة.' : b.obstacle === 'wheel' ? 'المروحة تدور عند اصطدام الأشعة بها: الأشعة جسيمات لها كتلة.' : 'أزلت العائق.');
      if (a.magnet !== b.magnet) o.push(b.magnet === 'none' ? 'أبعدت المغناطيس فعاد الشعاع مستقيماً.' : 'المغناطيس يحرف الشعاع، ويتغير اتجاه الانحراف بتغيير القطب: الأشعة جسيمات مشحونة.');
      if (a.cathode !== b.cathode) o.push('غيّرت مادة المهبط إلى ' + CATH[b.cathode] + ': الأشعة نفسها لا تتغير خصائصها، فالإلكترون مكوّن في كل الذرات.');
      return o;
    },
    learn: ['**المشاهدات (سؤال ص6):** تكوّن ظل للأجسام التي تعترض الأشعة، وتحرّك مروحة في طريقها، وتحرّك الأشعة من المهبط إلى المصعد، وعدم تغيّر خصائصها بتغيّر مادة المهبط.', '**الاستنتاج:** أحد مكونات الذرة جسيم صغير سالب هو الإلكترون، وخصائصه واحدة مهما تغيّرت مادة المهبط.', '**أثرها في نموذج دالتون:** الذرة ليست مصمتة غير قابلة للتجزئة، بل فيها جسيمات أصغر منها؛ فاقترح ثومسون نموذجاً: كرة موجبة تنغرس فيها إلكترونات سالبة (ص7).', '**السلامة:** شغّل الكهرباء بحذر لعدة ثوانٍ فقط (ص6).'],
    challenges: [
      { q: 'أثبت أن الأشعة جسيمات لها كتلة.', hint: 'ضع في طريقها جسماً يتحرك إذا اصطدمت به الجسيمات.', init: { power: false, obstacle: 'none', magnet: 'none' }, check: (p) => p.power && p.obstacle === 'wheel', why: () => 'دوران المروحة يدل على أن الأشعة جسيمات لها كتلة.' },
      { q: 'أثبت أن الأشعة مشحونة.', hint: 'قرّب مغناطيساً من الشعاع.', init: { power: true, magnet: 'none', obstacle: 'none' }, check: (p) => p.power && p.magnet !== 'none', why: () => 'انحراف الشعاع بالمغناطيس يدل على أنه جسيمات مشحونة.' },
      { q: 'بيّن أن الأشعة تسير في خطوط مستقيمة.', hint: 'ضع عائقاً صلباً في طريقها دون مغناطيس.', init: { power: true, obstacle: 'none', magnet: 'N' }, check: (p) => p.power && p.obstacle === 'cross' && p.magnet === 'none', why: () => 'ظل حاد للصليب: الأشعة تسير في خطوط مستقيمة.' }
    ],
    tutor: [
      { q: 'علامَ يدل تكوّن الظل؟', k: ['ظل', 'مستقيم'], a: () => C.tutor('لماذا يتكون ظل للأجسام في ضوء المصباح؟', 'الأشعة تسير في خطوط مستقيمة.') },
      { q: 'لماذا تدور المروحة؟', k: ['مروحه', 'دولاب', 'تدور', 'كتله'], a: () => C.tutor('ما الذي يحرك جسماً عند الاصطدام به؟', 'الأشعة جسيمات لها كتلة تصطدم بالمروحة فتحرّكها.') },
      { q: 'ما أثر هذه الاكتشافات على نموذج دالتون؟', k: ['دالتون', 'نموذج', 'ثومسون'], a: () => C.tutor('هل الذرة غير قابلة للتجزئة كما قال دالتون؟', 'اكتشاف الإلكترون يعني أن الذرة تحتوي جسيمات أصغر منها، فاقترح ثومسون نموذج الكرة الموجبة التي تنغرس فيها الإلكترونات (ص7).') }
    ]
  });

  /* ======================= نشاط (4) تجربة رذرفورد ص8 ======================= */
  const RATIO = 12000; // ص8: نسبة الدقائق التي انحرفت بمقدار كبير (1 : 12000)
  reg({
    id: 'rutherford', order: 2, lesson: '1-1-2', lessonTitle: 'النشاط الإشعاعي ونموذج رذرفورد', page: 8,
    titleAr: 'تجربة رذرفورد: قذف صفيحة الذهب بدقائق ألفا', titleEn: 'Rutherford Gold Foil Experiment',
    tags: 'رذرفورد صفيحة ذهب دقائق ألفا نواة نموذج ثومسون كبريتيد الخارصين نشاط 4',
    formula: '\\text{نسبة الدقائق المنحرفة بمقدار كبير} = 1 : 12000',
    book: 'نشاط (4) ص8: منبع دقائق ألفا (بولونيوم مشع) في صندوق رصاص، وصفيحة ذهب رقيقة، وشاشة مطلية بكبريتيد الخارصين ZnS. نسبة الدقائق التي انحرفت بمقدار كبير (1:12000).',
    summary: 'معظم دقائق ألفا نفذت من صفيحة الذهب دون انحراف، وانحرف جزء ضئيل جداً، وارتدت نسبة قليلة جداً. استنتج رذرفورد أن معظم الذرة فراغ، وأن الشحنة الموجبة ومعظم الكتلة في نواة صغيرة جداً.',
    vars: [['N', 'عدد دقائق ألفا المقذوفة', '\\text{دقيقة}', '1000–60000'], ['\\text{النموذج}', 'ما يتوقعه نموذج ثومسون / ما شاهده رذرفورد', '—', 'ثومسون / رذرفورد']],
    assumptions: ['المسارات المرسومة عيّنة تمثيلية، والأعداد تُحسب من نسبة الكتاب 1:12000.'],
    canvasHint: 'المسارات الحمراء: دقائق انحرفت بمقدار كبير • الخضراء: نفذت',
    params: [
      { key: 'model', label: '\\text{النموذج}', type: 'select', value: 'rutherford', options: [['rutherford', 'ما شاهده رذرفورد'], ['thomson', 'ما يتوقعه نموذج ثومسون']] },
      { key: 'N', label: 'N\\ \\text{(عدد الدقائق)}', min: 1000, max: 60000, step: 1000, value: 12000, int: true }
    ],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0 }),
    tick(st, p, d, dt) { st.t += dt; },
    compute(p) { const big = p.model === 'rutherford' ? Math.floor(p.N / RATIO) : 0; return { big: big, through: p.N - big }; },
    live(p, d) { return '\\frac{N}{12000} = \\frac{' + p.N + '}{12000} \\approx ' + d.big; },
    results(p, d) {
      return [['دقائق نفذت (معظمها دون انحراف)', d.through + ' دقيقة', false], ['دقائق انحرفت بمقدار كبير', d.big + ' دقيقة' + (p.model === 'thomson' ? ' (لا يتوقع ثومسون أي ارتداد)' : ''), false, d.big ? 'neg' : ''],
        ['الاستنتاج', p.model === 'rutherford' ? 'معظم الذرة فراغ، والشحنة الموجبة في نواة صغيرة جداً (نصف قطرها 1/100000 من قطر الذرة تقريباً)' : 'الشحنة الموجبة موزعة على الذرة كلها، فلا شيء يحرف دقائق ألفا كثيراً', false]];
    },
    steps(p, d) { return ['قُذفت صفيحة ذهب رقيقة بدقائق ألفا موجبة من البولونيوم المشع.', 'راقب رذرفورد ومضات الدقائق على شاشة مطلية بكبريتيد الخارصين.', 'من ' + p.N + ' دقيقة: ' + d.big + ' انحرفت بمقدار كبير (1:12000).', 'الاستنتاج: نواة صغيرة موجبة، والإلكترونات تدور حولها.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const st = d.st || { t: 0 }; const n = R.narrow(W); d.hits = [];
      const cx = W * 0.55, cy = H * 0.45, Rs = Math.min(W * 0.32, H * 0.36);
      ctx.strokeStyle = 'rgba(132,204,22,.7)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, cy, Rs, 0, Math.PI * 2); ctx.stroke();
      D.txt(ctx, 'شاشة ZnS', cx, cy - Rs - 14, { color: cols.c3, size: 12, w: '700' });
      ctx.fillStyle = '#475569'; ctx.fillRect(W * 0.05, cy - 18, 46, 36); D.txt(ctx, 'رصاص', W * 0.05 + 23, cy + 30, { color: cols.text, size: 11, w: '700' });
      ctx.fillStyle = '#f59e0b'; ctx.fillRect(cx - 3, cy - 40, 6, 80); D.txt(ctx, 'صفيحة ذهب', cx, cy + 52, { color: cols.c4, size: 12, w: '700' });
      const tracks = 40;
      for (let i = 0; i < tracks; i++) {
        const y0 = cy + (i - tracks / 2) * 1.6; const kind = p.model === 'thomson' ? 0 : i === 7 ? 2 : (i === 19 || i === 28) ? 1 : 0;
        const f = ((st.t * 0.5 + i * 0.137) % 1);
        ctx.strokeStyle = kind === 2 ? cols.c2 : kind === 1 ? cols.c4 : 'rgba(5,150,105,.45)'; ctx.lineWidth = kind ? 2 : 1;
        ctx.beginPath(); ctx.moveTo(W * 0.05 + 46, y0); ctx.lineTo(cx, y0);
        let ex, ey; if (kind === 2) { ex = cx - Rs * 0.9; ey = y0 - Rs * 0.3; } else if (kind === 1) { ex = cx + Rs * 0.7; ey = y0 + (i === 19 ? -1 : 1) * Rs * 0.7; } else { ex = cx + Rs; ey = y0; }
        ctx.lineTo(ex, ey); ctx.stroke();
        const t = f < 0.5 ? f * 2 : (f - 0.5) * 2; const px = f < 0.5 ? W * 0.05 + 46 + (cx - W * 0.05 - 46) * t : cx + (ex - cx) * t; const py = f < 0.5 ? y0 : y0 + (ey - y0) * t;
        if (i % 4 === 0 || kind) { ctx.fillStyle = kind === 2 ? cols.c2 : cols.c3; ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fill(); }
      }
      // الذرة كما يراها كل نموذج
      const ax = n ? W * 0.18 : W * 0.15, ay = H * 0.82, ar = n ? 26 : 34;
      if (p.model === 'thomson') { ctx.fillStyle = 'rgba(239,68,68,.25)'; ctx.beginPath(); ctx.arc(ax, ay, ar, 0, Math.PI * 2); ctx.fill(); for (let k = 0; k < 7; k++) { ctx.fillStyle = cols.c1; ctx.beginPath(); ctx.arc(ax + Math.cos(k * 0.9) * ar * 0.6, ay + Math.sin(k * 1.7) * ar * 0.6, 3, 0, Math.PI * 2); ctx.fill(); } D.txt(ctx, 'نموذج ثومسون', ax, ay + ar + 14, { color: cols.text, size: 11.5, w: '700' }); }
      else { ctx.strokeStyle = cols.muted; ctx.lineWidth = 1; for (let k = 0; k < 2; k++) { ctx.beginPath(); ctx.ellipse(ax, ay, ar, ar * 0.4, k * 1.2, 0, Math.PI * 2); ctx.stroke(); } ctx.fillStyle = cols.c2; ctx.beginPath(); ctx.arc(ax, ay, 3.5, 0, Math.PI * 2); ctx.fill(); D.txt(ctx, 'نموذج رذرفورد: نواة صغيرة', ax, ay + ar + 14, { color: cols.text, size: 11.5, w: '700' }); }
      D.txt(ctx, 'انحرف بمقدار كبير: ' + d.big + ' من ' + p.N, W * 0.62, H * 0.9, { color: cols.c2, size: n ? 12 : 14, w: '700' });
    },
    explain(a, b, da, db) { const o = []; if (a.N !== b.N) o.push('من ' + b.N + ' دقيقة ينحرف بمقدار كبير ' + db.big + ' فقط (1:12000): معظم الذرة فراغ.'); if (a.model !== b.model) o.push(b.model === 'thomson' ? 'نموذج ثومسون يتوقع نفاذ كل الدقائق تقريباً دون انحراف كبير، لأن الشحنة الموجبة موزعة.' : 'شاهد رذرفورد ارتداد نسبة قليلة جداً: يوجد جزء صغير جداً موجب الشحنة يتركز فيه معظم الكتلة (النواة).'); return o; },
    learn: ['**صندوق الرصاص:** يوجّه دقائق ألفا في حزمة واحدة ويحمي من الإشعاع (سؤال 1 ص8).', '**ماذا حدث؟** معظم الدقائق نفذت دون انحراف، وانحرف جزء ضئيل جداً، وارتدت نسبة قليلة جداً (1:12000).', '**الاستنتاج:** معظم حجم الذرة فراغ، والشحنة الموجبة ومعظم الكتلة في نواة صغيرة جداً، والإلكترونات تتحرك حولها كالكواكب حول الشمس (ص9).', '**تحدّي النموذج:** عجز عن تفسير ثبات الذرة (ص9).'],
    challenges: [
      { q: 'كم دقيقة تنحرف بمقدار كبير إذا قُذفت 36000 دقيقة؟ اضبط العدد وتحقق.', hint: 'النسبة 1:12000.', init: { N: 12000, model: 'rutherford' }, check: (p) => p.N === 36000 && p.model === 'rutherford', why: () => '36000 ÷ 12000 = 3 دقائق.' },
      { q: 'اعرض ما يتوقعه نموذج ثومسون، وقارنه بما شاهده رذرفورد.', hint: 'غيّر النموذج.', init: { model: 'rutherford' }, check: (p) => p.model === 'thomson', why: () => 'نموذج ثومسون لا يتوقع ارتداداً؛ ارتداد بعض الدقائق دليل على وجود النواة.' }
    ],
    tutor: [
      { q: 'علامَ يدل ارتداد نسبة قليلة جداً؟', k: ['ارتداد', 'ترتد', 'انعكاس'], a: () => C.tutor('ما الذي يستطيع أن يردّ جسيماً موجباً سريعاً إلى الخلف؟', 'وجود جزء صغير جداً كثيف موجب الشحنة (النواة) يتنافر مع دقائق ألفا الموجبة.') },
      { q: 'لماذا نفذت معظم الدقائق؟', k: ['نفذت', 'معظم', 'فراغ'], a: () => C.tutor('ماذا يعني ألا يعترض الجسيمَ شيء؟', 'لأن معظم حجم الذرة فراغ.') },
      { q: 'ما فائدة صندوق الرصاص؟', k: ['رصاص', 'صندوق'], a: () => C.tutor('ماذا يحدث للإشعاع إذا انتشر في كل الاتجاهات؟', 'يمتص الرصاص الإشعاع فيخرج حزمة واحدة موجهة نحو الصفيحة، ويحمي المجربين.') }
    ]
  });

  /* ======================= نشاط (6) بعض خصائص عنصر الكالسيوم ص11 ======================= */
  reg({
    id: 'calcium-water', order: 3, lesson: '1-2-1', lessonTitle: 'الكالسيوم', page: 11,
    titleAr: 'تفاعل الكالسيوم مع الماء', titleEn: 'Reaction of Calcium with Water',
    tags: 'كالسيوم ماء هيدروكسيد الكالسيوم هيدروجين ورق دوار الشمس قاعدي نشاط 6',
    formula: '\\text{Ca(s)} + 2\\text{H}_2\\text{O(l)} \\rightarrow \\text{Ca(OH)}_2\\text{(aq)} + \\text{H}_2\\text{(g)}',
    book: 'نشاط (6) ص11: ضع (30) مل ماء في كأس سعة (50) مل وقِس درجة حرارته، ثم أضف قطعة كالسيوم بحجم حبة العدس، وحرّك، وقِس درجة الحرارة، ثم أضف ورقتي دوّار الشمس حمراء وزرقاء. نواتج التفاعل: هيدروكسيد الكالسيوم وغاز الهيدروجين.',
    summary: 'يتفاعل الكالسيوم مع الماء فيتصاعد غاز الهيدروجين، وترتفع درجة الحرارة، ويتكوّن محلول هيدروكسيد الكالسيوم القاعدي الذي يحوّل ورقة دوّار الشمس الحمراء إلى زرقاء.',
    vars: [['m', 'كتلة قطعة الكالسيوم (بحجم حبة العدس)', '\\text{غم}', '0.1–0.5'], ['V', 'حجم الماء', '\\text{مل}', 'الكتاب: 30'], ['n', 'عدد مولات الكالسيوم = m ÷ 40', '\\text{مول}', '—']],
    assumptions: ['ارتفاع درجة الحرارة (مقدار الطاقة لكل مول) ' + C.SIMPLE + '؛ الكتاب يطلب ملاحظة الارتفاع فقط.', 'العيّنة المؤكسدة تتفاعل جزئياً فقط (ملاحظة الكتاب ص11).'],
    canvasHint: 'أضف القطعة، ثم اختر ورقة دوّار الشمس',
    params: [
      { key: 'added', label: '\\text{إضافة قطعة الكالسيوم}', type: 'toggle', value: false, on: 'أُضيفت', off: 'لم تُضف' },
      { key: 'm', label: 'm\\ \\text{(غم)}', min: 0.1, max: 0.5, step: 0.05, value: 0.2 },
      { key: 'V', label: 'V\\ \\text{(مل)}', min: 20, max: 50, step: 5, value: 30 },
      { key: 'paper', label: '\\text{ورقة دوّار الشمس}', type: 'select', value: 'red', options: [['red', 'حمراء'], ['blue', 'زرقاء']] },
      { key: 'oxid', label: '\\text{العيّنة}', type: 'toggle', value: false, on: 'مؤكسدة السطح', off: 'نقية لامعة' }
    ],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0 }),
    tick(st, p, d, dt) { st.t += dt; },
    compute(p) {
      const n = p.m / C.MASS.Ca; const frac = p.added ? (p.oxid ? 0.15 : 1) : 0;
      const dT = frac * n * 414000 / (p.V * C.C_WATER + 20); // نموذج مبسّط
      return { n: n, frac: frac, dT: dT, nH2: n * frac, VH2: n * frac * 22.4 * 1000 };
    },
    live(p, d) { return 'n = \\frac{m}{M} = \\frac{' + p.m + '}{40} = ' + r2(d.n, 4) + '\\ \\text{مول}'; },
    results(p, d) {
      if (!p.added) return [['الحالة', 'أضف قطعة الكالسيوم إلى الماء', false], ['ورقة دوّار الشمس', p.paper === 'red' ? 'تبقى حمراء (ماء متعادل)' : 'تبقى زرقاء', false]];
      return [['دلالات التفاعل', d.frac > 0.5 ? 'فقاعات غاز + ارتفاع درجة الحرارة + تغيّر لون الكاشف' : 'فقاعات قليلة جداً — سطح العيّنة مؤكسد', false],
        ['ارتفاع درجة الحرارة (' + C.SIMPLE + ')', '≈ ' + r2(d.dT, 1) + ' °س', false],
        ['ورقة دوّار الشمس', p.paper === 'red' ? (d.frac > 0.5 ? 'تتحول إلى الزرقاء: المحلول قاعدي' : 'تزرقّ قليلاً') : 'تبقى زرقاء', false, p.paper === 'red' && d.frac > 0.5 ? 'pos' : ''],
        ['مولات H₂ الناتجة', r2(d.nH2, 4) + ' مول (≈ ' + r2(d.VH2, 0) + ' مل عند الظروف المعيارية)', false],
        ['المعادلة', '{{Ca(s) + 2H₂O(l) → Ca(OH)₂(aq) + H₂(g)}}', false]];
    },
    steps(p, d) { return ['صف لون الكالسيوم وحالته.', 'ضع ' + p.V + ' مل ماء في الكأس وقِس درجة حرارته.', 'أضف قطعة كالسيوم (' + p.m + ' غم = ' + r2(d.n, 4) + ' مول) وحرّك، وقِس درجة الحرارة.', 'أضف ورقتي دوّار الشمس، واكتب دلالات حدوث التفاعل ومعادلته.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const st = d.st || { t: 0 }; const n = R.narrow(W); const cx = W * 0.42, by = H * 0.72, bw = Math.min(170, W * 0.36), bh = Math.min(200, H * 0.5);
      const react = p.added && d.frac > 0;
      R.beaker(ctx, cx, by, bw, bh, { level: p.V / 50, color: p.added && p.paper === 'red' && d.frac > 0.5 ? 'rgba(147,197,253,.55)' : 'rgba(96,165,250,.4)', bubbles: react ? Math.round(6 + 20 * d.frac) : 0, t: st.t, solid: p.added ? { color: p.oxid ? '#9ca3af' : '#e5e7eb', h: 8, w: 0.18 } : null, label: 'كأس سعة 50 مل' });
      if (!p.added) { ctx.fillStyle = '#e5e7eb'; ctx.strokeStyle = '#64748b'; ctx.beginPath(); ctx.ellipse(cx, by - bh - 30, 9, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); D.txt(ctx, 'Ca', cx + 22, by - bh - 30, { color: cols.text, size: 13, w: '700' }); }
      R.thermo(ctx, cx + bw / 2 + 40, by - bh, bh - 10, 22 + d.dT, 0, 60, cols);
      const pc = p.paper === 'red' ? (react && d.frac > 0.5 ? R.LITMUS.blue : react ? '#a855f7' : R.LITMUS.red) : R.LITMUS.blue;
      R.paper(ctx, cx - bw / 2 - 70, by - bh * 0.6, 26, 60, pc, 'دوّار الشمس');
      eqLine(ctx, W, H * 0.9, 'Ca(s) + 2H₂O(l) → Ca(OH)₂(aq) + H₂(g)', cols, n ? 13 : 16);
      if (react) D.txt(ctx, 'H₂ ↑', cx, by - bh - 14, { color: cols.c1, size: 14, w: '700' });
    },
    explain(a, b, da, db) { const o = []; if (a.added !== b.added && b.added) o.push(b.oxid ? 'العيّنة مؤكسدة: طبقة الأكسيد تمنع الكالسيوم من ملامسة الماء فيكون التفاعل ضعيفاً (ص11).' : 'تصاعدت فقاعات غاز الهيدروجين وارتفعت درجة الحرارة وتكوّن هيدروكسيد الكالسيوم.'); if (a.paper !== b.paper) o.push(b.paper === 'red' ? 'الورقة الحمراء تزرقّ في المحلول القاعدي.' : 'الورقة الزرقاء تبقى زرقاء في المحلول القاعدي.'); if (a.m !== b.m && b.added) o.push('كتلة أكبر تعطي غازاً أكثر وارتفاعاً أكبر في درجة الحرارة.'); return o; },
    learn: ['**الكالسيوم:** يشكّل 2% من كتلة جسم الإنسان، 98% منها في العظام والأسنان (ص10). وهو من الفلزات القلوية الترابية.', '**التفاعل مع الماء:** {{Ca(s) + 2H₂O(l) → Ca(OH)₂(aq) + H₂(g)}}.', '**ملاحظة الكتاب:** قد تكون عيّنة الكالسيوم في المختبر مؤكسدة فلا تحقق الغرض من النشاط.', '**السلامة:** احذر أن يلامس المحلول الناتج جلدك (ص11).'],
    challenges: [
      { q: 'أثبت أن المحلول الناتج قاعدي.', hint: 'استخدم عيّنة نقية والورقة الحمراء.', init: { added: false, paper: 'blue', oxid: false }, check: (p) => p.added && p.paper === 'red' && !p.oxid, why: () => 'تحوّل الورقة الحمراء إلى الزرقاء: Ca(OH)₂ قاعدة.' },
      { q: 'اجعل درجة الحرارة ترتفع أكثر من 8 °س.', hint: 'زد كتلة الكالسيوم وقلّل حجم الماء.', init: { added: true, m: 0.1, V: 50, oxid: false }, check: (p, d) => d.dT > 8, why: (p, d) => 'ارتفعت ' + r2(d.dT, 1) + ' °س.' }
    ],
    tutor: [
      { q: 'ما دلالات حدوث التفاعل؟', k: ['دلالات', 'علامات'], a: () => C.tutor('ماذا ترى وماذا تقيس؟', 'تصاعد فقاعات غاز، وارتفاع درجة الحرارة، وتغير لون ورقة دوّار الشمس الحمراء إلى الزرقاء.') },
      { q: 'لماذا تتحول الورقة الحمراء إلى الزرقاء؟', k: ['ورقه', 'زرقاء', 'قاعدي'], a: () => C.tutor('ما نوع المادة Ca(OH)₂؟', 'ينتج هيدروكسيد الكالسيوم، وهو قاعدة، والقواعد تحوّل دوّار الشمس الأحمر إلى أزرق.') },
      { q: 'لماذا لم تتفاعل العيّنة؟', k: ['مؤكسد', 'لم تتفاعل', 'ضعيف'], a: () => C.tutor('ماذا يكوّن الكالسيوم مع أكسجين الهواء؟', 'سطح العيّنة مغطى بطبقة أكسيد تمنع الكالسيوم من ملامسة الماء (ملاحظة ص11).') }
    ]
  });

  /* ======================= نشاط (8) الجير المطفأ ص13 ======================= */
  const LIME = ['أكسيد الكالسيوم (الجير الحي) في أنبوب الاختبار', 'إضافة (5) مل ماء: يسخن قاع الأنبوب', 'ورقتا دوّار الشمس في المحلول', 'الترويق والترشيح: رائق الكلس', 'النفخ بالمصاصة في رائق الكلس'];
  reg({
    id: 'lime-water', order: 4, lesson: '1-2-1', lessonTitle: 'الكالسيوم', page: 13,
    titleAr: 'الجير المطفأ ورائق الكلس', titleEn: 'Slaked Lime and Limewater',
    tags: 'جير حي شيد اكسيد الكالسيوم جير مطفا رائق الكلس ثاني اكسيد الكربون تعكر نشاط 8',
    formula: '\\text{CaO} + \\text{H}_2\\text{O} \\rightarrow \\text{Ca(OH)}_2 \\quad ; \\quad \\text{Ca(OH)}_2 + \\text{CO}_2 \\rightarrow \\text{CaCO}_3 + \\text{H}_2\\text{O}',
    book: 'نشاط (8) ص13: ملعقة صغيرة من CaO في أنبوب اختبار ثم (5) مل ماء، ثم ورقتا دوّار الشمس، ثم الترويق والترشيح للحصول على رائق الكلس، ثم النفخ فيه بالمصاصة.',
    summary: 'يتفاعل الجير الحي CaO مع الماء تفاعلاً يطلق حرارة فيتكوّن الجير المطفأ Ca(OH)₂ القاعدي. ورائق الكلس (محلوله الرائق) يتعكّر عند النفخ فيه لأن CO₂ يكوّن راسب كربونات الكالسيوم؛ ويُستخدم للكشف عن CO₂.',
    vars: [['\\text{المرحلة}', 'خطوة النشاط', '—', '5 مراحل'], ['t', 'زمن النفخ في رائق الكلس', '\\text{ث}', '0–60']],
    assumptions: ['درجة التعكّر مع زمن النفخ للتوضيح: ' + C.SIMPLE + '.'],
    params: [
      { key: 'stage', label: '\\text{المرحلة}', type: 'stage', value: 0, stages: LIME },
      { key: 'blow', label: 't\\ \\text{(ث نفخ)}', min: 0, max: 60, step: 5, value: 0, hidden: (p) => p.stage < 4 }
    ],
    play: { mode: 'stage', key: 'stage', interval: 2 },
    compute(p) { return { turb: p.stage >= 4 ? Math.min(1, p.blow / 30) : 0 }; },
    results(p, d) {
      const out = [['المرحلة', LIME[p.stage], false]];
      if (p.stage >= 1) out.push(['المشاهدة', 'يسخن قاع الأنبوب: التفاعل طارد للحرارة', false]);
      if (p.stage >= 2) out.push(['دوّار الشمس', 'الحمراء تزرقّ والزرقاء تبقى زرقاء: المحلول قاعدي', false]);
      if (p.stage >= 3) out.push(['رائق الكلس', 'محلول Ca(OH)₂ الرائق بعد الترشيح', false]);
      if (p.stage >= 4) out.push(['التعكّر', d.turb >= 1 ? 'تعكّر واضح: راسب CaCO₃ أبيض' : d.turb > 0 ? 'بدأ التعكّر' : 'انفخ في رائق الكلس', false, d.turb >= 1 ? 'pos' : '']);
      out.push(['المعادلة', p.stage >= 4 ? '{{Ca(OH)₂(aq) + CO₂(g) → CaCO₃(s) + H₂O(l)}}' : '{{CaO(s) + H₂O(l) → Ca(OH)₂(aq)}}', false]);
      return out;
    },
    steps() { return LIME.map((s, i) => (i + 1) + ') ' + s); },
    drawCustom(ctx, W, H, p, d, cols) {
      const n = R.narrow(W); const cx = W * 0.4, by = H * 0.74, tw = 44, th = Math.min(220, H * 0.52);
      const milky = d.turb; const liquid = p.stage >= 1;
      const col = p.stage >= 4 ? 'rgba(' + Math.round(200 + 50 * milky) + ',' + Math.round(220 + 30 * milky) + ',255,' + (0.35 + 0.5 * milky) + ')' : p.stage === 3 ? 'rgba(186,230,253,.45)' : 'rgba(241,245,249,.85)';
      R.tube(ctx, cx, by, tw, th, { level: liquid ? 0.45 : 0, color: col, solid: p.stage <= 2 ? { color: '#f1f5f9', h: 18 } : null, bubbles: p.stage === 4 && p.blow > 0 ? 10 : 0, t: p.blow / 10 });
      if (p.stage === 1) { ctx.fillStyle = 'rgba(239,68,68,.25)'; ctx.beginPath(); ctx.arc(cx, by - 12, 30, 0, Math.PI * 2); ctx.fill(); D.txt(ctx, 'ساخن!', cx + 48, by - 12, { color: cols.c2, size: 13, w: '700' }); }
      if (p.stage === 2) { R.paper(ctx, cx + 60, by - th * 0.5, 22, 50, R.LITMUS.blue, 'الحمراء ← زرقاء'); R.paper(ctx, cx + 110, by - th * 0.5, 22, 50, R.LITMUS.blue, 'الزرقاء'); }
      if (p.stage === 3) { ctx.strokeStyle = cols.muted; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 40, by - th - 50); ctx.lineTo(cx + 40, by - th - 50); ctx.lineTo(cx, by - th - 5); ctx.closePath(); ctx.stroke(); D.txt(ctx, 'ورق ترشيح', cx + 70, by - th - 40, { color: cols.text, size: 12 }); }
      if (p.stage === 4) { ctx.strokeStyle = '#f472b6'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx + 4, by - 20); ctx.lineTo(cx + 4, by - th - 40); ctx.lineTo(cx + 60, by - th - 70); ctx.stroke(); D.txt(ctx, 'مصاصة: CO₂ من الزفير', cx + 90, by - th - 80, { color: cols.text, size: 12, w: '700' }); }
      ML.chemEqLine(ctx, W, H * 0.9, p.stage >= 4 ? 'Ca(OH)₂(aq) + CO₂(g) → CaCO₃(s) + H₂O(l)' : 'CaO(s) + H₂O(l) → Ca(OH)₂(aq)', cols, n ? 13 : 16);
    },
    explain(a, b) { const o = []; if (a.stage !== b.stage) o.push(['الجير الحي CaO مسحوق أبيض.', 'تفاعل CaO مع الماء طارد للحرارة فيسخن الأنبوب، ويتكوّن الجير المطفأ.', 'Ca(OH)₂ قاعدة: الورقة الحمراء تزرقّ.', 'بالترشيح نحصل على محلول رائق: رائق الكلس.', 'النفخ يضيف CO₂ فيتكوّن راسب CaCO₃ الأبيض فيتعكّر المحلول.'][b.stage]); if (a.blow !== b.blow && b.stage >= 4) o.push('كلما طال النفخ زاد CO₂ وزاد التعكّر.'); return o; },
    learn: ['**الجير الحي (الشيد) CaO** يُحضَّر بتسخين CaCO₃ إلى 900 °س فيتصاعد CO₂ (ص12–13).', '**الجير المطفأ:** {{CaO(s) + H₂O(l) → Ca(OH)₂(aq)}}، تفاعل يطلق حرارة.', '**الكشف عن CO₂:** يتعكّر رائق الكلس بتكوّن CaCO₃؛ ويُستخدم للكشف عن CO₂ الناتج من تنفس النباتات (ص14).', '**السلامة:** احذر تعرض الجلد والعيون لمادة الشيد مباشرة (ص13).'],
    challenges: [
      { q: 'اجعل رائق الكلس يتعكّر تعكّراً واضحاً.', hint: 'انتقل إلى مرحلة النفخ وانفخ 30 ثانية على الأقل.', init: { stage: 0, blow: 0 }, check: (p, d) => d.turb >= 1, why: () => 'تكوّن راسب CaCO₃ الأبيض.' },
      { q: 'انتقل إلى المرحلة التي تثبت أن الجير المطفأ قاعدي.', hint: 'المرحلة التي تُستخدم فيها ورقتا دوّار الشمس.', init: { stage: 0 }, check: (p) => p.stage === 2, why: () => 'تزرقّ الورقة الحمراء.' }
    ],
    tutor: [
      { q: 'لماذا يتعكّر رائق الكلس؟', k: ['يتعكر', 'تعكر', 'رائق'], a: () => C.tutor('ماذا يحتوي هواء الزفير؟ وما الذي يتكوّن مع Ca(OH)₂؟', 'CO₂ في الزفير يتفاعل مع Ca(OH)₂ فيتكوّن CaCO₃ غير الذائب: Ca(OH)₂ + CO₂ → CaCO₃ + H₂O.') },
      { q: 'لماذا يسخن الأنبوب؟', k: ['يسخن', 'حراره', 'ساخن'], a: () => C.tutor('هل التفاعل يطلق طاقة أم يمتصها؟', 'تفاعل CaO مع الماء طارد للحرارة.') },
      { q: 'لماذا يطلي المزارعون جذوع الأشجار بالشيد؟', k: ['اشجار', 'جذوع', 'المزارعون'], a: () => C.tutor('ما خاصية الشيد القاعدية والكاوية؟', 'سؤال «فكّر» ص14: الشيد مادة قاعدية كاوية تحمي الجذوع من الحشرات والفطريات.') }
    ]
  });

  /* ======================= نشاط (9) خصائص كربونات الكالسيوم ص14 ======================= */
  reg({
    id: 'calcium-carbonate', order: 5, lesson: '1-2-1', lessonTitle: 'الكالسيوم', page: 14,
    titleAr: 'خصائص كربونات الكالسيوم', titleEn: 'Properties of Calcium Carbonate',
    tags: 'كربونات الكالسيوم ذائبية ماء عصير ليمون حمض فوران ثاني اكسيد الكربون نشاط 9 مطر حمضي',
    formula: '\\text{CaCO}_3 + 2\\text{H}^+ \\rightarrow \\text{Ca}^{2+} + \\text{CO}_2 + \\text{H}_2\\text{O}',
    book: 'نشاط (9) ص14: قليل من CaCO₃ مع (10) مل ماء ثم الرجّ، وقليل منه مع بضع قطرات من عصير الليمون. سؤال ص15: لماذا تُضاف CaCO₃ إلى البحيرات المتأثرة بالمطر الحمضي؟',
    summary: 'كربونات الكالسيوم لا تذوب في الماء، لكنها تتفاعل مع الأحماض (مثل عصير الليمون) فيحدث فوران بسبب تصاعد غاز CO₂. لهذا تُستخدم لمعادلة حموضة البحيرات.',
    vars: [['\\text{السائل}', 'ماء أو عصير ليمون', '—', '10 مل ماء / بضع قطرات'], ['\\text{القطرات}', 'عدد قطرات عصير الليمون', '\\text{قطرة}', '0–10']],
    assumptions: ['شدة الفوران مع عدد القطرات للتوضيح: ' + C.SIMPLE + '.'],
    params: [
      { key: 'liquid', label: '\\text{السائل المضاف}', type: 'select', value: 'water', options: [['water', 'ماء (10 مل) مع الرج'], ['lemon', 'عصير ليمون']] },
      { key: 'drops', label: '\\text{قطرات عصير الليمون}', min: 0, max: 10, step: 1, value: 0, int: true, hidden: (p) => p.liquid !== 'lemon' }
    ],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0 }),
    tick(st, p, d, dt) { st.t += dt; },
    compute(p) { return { fizz: p.liquid === 'lemon' ? p.drops : 0 }; },
    results(p, d) {
      return p.liquid === 'water' ? [['المشاهدة', 'لا تذوب: يبقى المسحوق الأبيض في القاع بعد الرجّ', false], ['الاستنتاج', 'كربونات الكالسيوم لا تذوب في الماء', false]]
        : [['المشاهدة', d.fizz ? 'فوران وتصاعد فقاعات غاز' : 'أضف قطرات عصير الليمون', false, d.fizz ? 'pos' : ''], ['الغاز', d.fizz ? 'CO₂ (يعكّر رائق الكلس)' : '—', false], ['الاستنتاج', 'تتفاعل الكربونات مع الأحماض', false], ['المعادلة', '{{CaCO₃ + 2H⁺ → Ca²⁺ + CO₂ + H₂O}}', false]];
    },
    steps() { return ['ضع قليلاً من CaCO₃ في أنبوب، وأضف (10) مل ماء ورجّه.', 'ضع قليلاً من CaCO₃ في أنبوب آخر، وأضف بضع قطرات من عصير الليمون.', 'سجّل مشاهداتك وفسّرها.']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const st = d.st || { t: 0 }; const n = R.narrow(W); const by = H * 0.72, th = Math.min(220, H * 0.5);
      R.tube(ctx, W * 0.32, by, 46, th, { level: 0.5, color: 'rgba(96,165,250,.35)', solid: { color: '#f8fafc', h: 14 }, label: 'ماء' });
      R.tube(ctx, W * 0.68, by, 46, th, { level: p.liquid === 'lemon' && p.drops ? 0.12 : 0, color: 'rgba(250,204,21,.45)', solid: { color: '#f8fafc', h: Math.max(4, 14 - d.fizz) }, bubbles: d.fizz * 2, t: st.t, label: 'عصير ليمون' });
      if (d.fizz) { for (let i = 0; i < d.fizz; i++) { const f = (st.t * 0.7 + i * 0.21) % 1; ctx.fillStyle = 'rgba(148,163,184,.6)'; ctx.beginPath(); ctx.arc(W * 0.68 + Math.sin(i * 2) * 10, by - th - f * 50, 3, 0, Math.PI * 2); ctx.fill(); } D.txt(ctx, 'CO₂ ↑', W * 0.68, by - th - 62, { color: cols.c1, size: 14, w: '700' }); }
      D.txt(ctx, p.liquid === 'water' ? 'أنبوب الماء: لا ذوبان' : d.fizz ? 'أنبوب الليمون: فوران' : 'أضف قطرات الليمون', W / 2, H * 0.88, { color: cols.text, size: n ? 13 : 15, w: '700' });
    },
    explain(a, b, da, db) { const o = []; if (a.liquid !== b.liquid) o.push(b.liquid === 'water' ? 'كربونات الكالسيوم لا تذوب في الماء.' : 'عصير الليمون حمضي فيتفاعل مع الكربونات.'); if (a.drops !== b.drops && b.drops) o.push('قطرات حمض أكثر ← فوران أكبر (CO₂ أكثر).'); return o; },
    learn: ['**خامات الكالسيوم:** كربونات الكالسيوم CaCO₃، والجبس CaSO₄·2H₂O، والدولوميت (ص10).', '**الخصائص:** CaCO₃ لا تذوب في الماء، وتتفاعل مع الأحماض مطلقةً CO₂.', '**تطبيق (ص15):** إضافة CaCO₃ إلى البحيرات تعادل حموضة المطر الحمضي.'],
    challenges: [
      { q: 'أظهر تصاعد غاز من كربونات الكالسيوم.', hint: 'استخدم سائلاً حمضياً.', init: { liquid: 'water', drops: 0 }, check: (p, d) => d.fizz > 0, why: () => 'يتصاعد CO₂ عند تفاعل الكربونات مع الحمض.' },
      { q: 'اجعل الفوران أشد ما يمكن.', hint: 'زد عدد قطرات الليمون.', init: { liquid: 'lemon', drops: 2 }, check: (p) => p.liquid === 'lemon' && p.drops === 10, why: () => 'حمض أكثر يتفاعل مع كمية أكبر من الكربونات.' }
    ],
    tutor: [
      { q: 'ما الغاز المتصاعد؟', k: ['غاز', 'فقاعات', 'فوران'], a: () => C.tutor('ما الذي تحتويه الكربونات CO₃ ويخرج كغاز؟', 'ثاني أكسيد الكربون CO₂.') },
      { q: 'لماذا تُضاف كربونات الكالسيوم إلى البحيرات؟', k: ['بحيرات', 'مطر حمضي'], a: () => C.tutor('كيف تتفاعل الكربونات مع الأحماض؟', 'تعادل الحموضة الناتجة عن المطر الحمضي (ص15).') },
      { q: 'هل تذوب كربونات الكالسيوم في الماء؟', k: ['تذوب', 'ذوبان', 'ماء'], a: () => C.tutor('ماذا بقي في قاع أنبوب الماء بعد الرجّ؟', 'لا تذوب في الماء.') }
    ]
  });

  /* ======================= نشاط (11) و(12) الكبريت: خصائص فيزيائية ومتآصلات ص17–19 ======================= */
  const S_PATH = {
    props: ['الحالة واللون واللمعان', 'دارة كهربائية لفحص التوصيل', 'الطرق والسحب والثني'],
    prism: ['كبريت صلب أصفر في أنبوب اختبار', 'التسخين: ينصهر إلى سائل', 'لون قريب من البرتقالي', 'الصبّ في ورق الترشيح والانتظار دقيقتين', 'فتح الورقة وتسليط الضوء: بلورات إبرية', 'بعد 3 أيام: تفحّص التغيرات'],
    plastic: ['كبريت في أنبوب اختبار', 'التسخين مع التحريك حتى الغليان: لون داكن', 'صبّ المصهور في كأس ماء', 'إخراج الحبال بالملقط وفحصها باليد']
  };
  reg({
    id: 'sulfur-allotropes', order: 6, lesson: '1-2-2', lessonTitle: 'الكبريت', page: 19,
    titleAr: 'الكبريت: خصائصه الفيزيائية ومتآصلاته', titleEn: 'Sulfur: Physical Properties and Allotropes',
    tags: 'كبريت S8 متآصلات معيني منشوري ابري مطاطي بلاستيكي تسخين توصيل نشاط 11 نشاط 12',
    formula: '\\text{S}_8 :\\ \\text{معيني} \\;|\\; \\text{منشوري (إبري)} \\;|\\; \\text{مطاطي (بلاستيكي)}',
    book: 'نشاط (11) ص17: الحالة واللون، والتوصيل الكهربائي بدارة، وقابلية الطرق والسحب، والتسخين. ص18: جزيء S₈ حلقي، ومتآصلاته المعيني والإبري (المنشوري) والبلاستيكي (المطاطي). نشاط (12) ص19: تحضير الكبريت المنشوري والمطاطي.',
    summary: 'الكبريت صلب أصفر، لا يوصل الكهرباء، وهش. يوجد بأشكال مختلفة من العنصر نفسه (التآصل): بتبريد المصهور ببطء في الهواء نحصل على بلورات إبرية (منشوري)، وبصبّ المصهور الساخن جداً في الماء نحصل على الكبريت المطاطي.',
    vars: [['\\text{المسار}', 'الخصائص / المنشوري / المطاطي', '—', '3 مسارات'], ['\\text{المرحلة}', 'خطوة النشاط', '—', 'حسب المسار']],
    assumptions: ['الكتاب لا يذكر درجات الحرارة؛ الألوان مرسومة كما يصفها النشاط («قريب من البرتقالي»، «داكن»).'],
    params: [
      { key: 'path', label: '\\text{المسار}', type: 'select', value: 'props', options: [['props', 'الخصائص الفيزيائية (نشاط 11)'], ['prism', 'الكبريت المنشوري (نشاط 12)'], ['plastic', 'الكبريت المطاطي (نشاط 12)']] },
      { key: 'stage', label: '\\text{المرحلة}', type: 'stage', value: 0, stages: (p) => S_PATH[(p && p.path) || 'props'] }
    ],
    resetOn: ['path'],
    onSet(p, k) { if (k === 'path') p.stage = 0; },
    play: { mode: 'stage', key: 'stage', interval: 2 },
    compute(p) { return { list: S_PATH[p.path] }; },
    results(p, d) {
      const s = p.stage; const out = [['المرحلة', d.list[Math.min(s, d.list.length - 1)], false]];
      if (p.path === 'props') out.push(['المشاهدة', ['صلب أصفر، غير لامع', 'المصباح لا يضيء: لا يوصل الكهرباء', 'يتفتّت: هش، غير قابل للطرق أو السحب'][Math.min(s, 2)], false]);
      if (p.path === 'prism') out.push(['المشاهدة', ['صلب أصفر', 'سائل أصفر', 'سائل قريب من البرتقالي', 'يتجمّد على ورق الترشيح', 'بلورات إبرية لامعة: كبريت منشوري', 'تفقد البلورات شكلها الإبري تدريجياً (التآصل)'][Math.min(s, 5)], false, s >= 4 ? 'pos' : '']);
      if (p.path === 'plastic') out.push(['المشاهدة', ['صلب أصفر', 'سائل داكن لزج يغلي', 'يتصلّب فجأة في الماء', 'حبال مرنة مطاطية: كبريت مطاطي (بلاستيكي)'][Math.min(s, 3)], false, s >= 3 ? 'pos' : '']);
      out.push(['التركيب', p.path === 'plastic' && s >= 3 ? 'سلاسل طويلة من ذرات الكبريت' : 'جزيئات S₈ حلقية مرتبة بانتظام', false]);
      return out;
    },
    steps(p, d) { return d.list.map((x, i) => (i === p.stage ? '👉 ' : i < p.stage ? '✅ ' : '⬜ ') + x).concat(p.path !== 'props' ? ['تحذير (ص19): لا تبقِ الأنبوب بشكل مستمر على اللهب؛ أبعده قليلاً أثناء التسخين ثم أعد تسخينه.'] : []); },
    drawCustom(ctx, W, H, p, d, cols) {
      const n = R.narrow(W); const s = p.stage;
      // جزيء S8 الحلقي (الشكل 5 ص18)
      const rx = W * 0.82, ry = H * 0.2, rr = n ? 26 : 36;
      ctx.strokeStyle = '#a16207'; ctx.lineWidth = 3; ctx.beginPath();
      for (let i = 0; i <= 8; i++) { const a = i * Math.PI / 4; const z = i % 2 ? 0.75 : 1; const x = rx + Math.cos(a) * rr * z, y = ry + Math.sin(a) * rr * z * 0.6; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; const z = i % 2 ? 0.75 : 1; ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(rx + Math.cos(a) * rr * z, ry + Math.sin(a) * rr * z * 0.6, 6, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#a16207'; ctx.lineWidth = 1; ctx.stroke(); }
      D.txt(ctx, 'S₈ حلقي', rx, ry + rr + 6, { color: cols.text, size: 12, w: '700' });
      const cx = W * 0.4, by = H * 0.72, th = Math.min(200, H * 0.45);
      if (p.path === 'props') {
        ctx.fillStyle = '#facc15'; ctx.strokeStyle = '#a16207'; ctx.lineWidth = 2; ctx.fillRect(cx - 70, by - 26, 140, 26); ctx.strokeRect(cx - 70, by - 26, 140, 26);
        if (s === 1) { ctx.strokeStyle = cols.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 70, by - 13); ctx.lineTo(cx - 110, by - 13); ctx.lineTo(cx - 110, by - 120); ctx.lineTo(cx + 110, by - 120); ctx.lineTo(cx + 110, by - 13); ctx.lineTo(cx + 70, by - 13); ctx.stroke(); ctx.fillStyle = '#e5e7eb'; ctx.beginPath(); ctx.arc(cx, by - 120, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); D.txt(ctx, 'المصباح لا يضيء', cx, by - 150, { color: cols.c2, size: 13, w: '700' }); ctx.fillStyle = '#334155'; ctx.fillRect(cx - 120, by - 70, 20, 30); D.txt(ctx, 'بطارية', cx - 140, by - 55, { color: cols.text, size: 11 }); }
        if (s === 2) { for (let i = 0; i < 9; i++) { ctx.fillStyle = '#facc15'; ctx.fillRect(cx - 70 + i * 16 + (i % 2) * 4, by - 26 + (i % 3) * 3, 12, 10); } ctx.fillStyle = '#64748b'; ctx.fillRect(cx - 10, by - 110, 20, 60); ctx.fillRect(cx - 40, by - 120, 80, 18); D.txt(ctx, 'مطرقة: يتفتّت (هش)', cx, by - 140, { color: cols.c2, size: 13, w: '700' }); }
      } else {
        const hot = p.path === 'prism' ? (s >= 1 && s <= 2) : s === 1; const colr = p.path === 'prism' ? ['#facc15', '#fbbf24', '#f97316'][Math.min(s, 2)] : ['#facc15', '#7c2d12'][Math.min(s, 1)];
        if (s <= (p.path === 'prism' ? 2 : 1)) { R.tube(ctx, cx, by - 30, 40, th, { level: s >= 1 ? 0.35 : 0, color: colr, solid: s === 0 ? { color: '#facc15', h: 20 } : null }); R.flame(ctx, cx, by + 40, 40, hot); }
        else if (p.path === 'prism') {
          ctx.strokeStyle = cols.muted; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 60, by - 120); ctx.lineTo(cx + 60, by - 120); ctx.lineTo(cx, by - 30); ctx.closePath(); ctx.stroke();
          if (s >= 4) { for (let i = 0; i < 14; i++) { const a = -Math.PI / 2 + (i - 7) * 0.18; ctx.strokeStyle = s === 5 ? '#ca8a04' : '#eab308'; ctx.lineWidth = s === 5 ? 2 : 3; ctx.beginPath(); ctx.moveTo(cx, by - 60); ctx.lineTo(cx + Math.cos(a) * 55, by - 60 + Math.sin(a) * 40); ctx.stroke(); } D.txt(ctx, s === 5 ? 'تتحول تدريجياً (التآصل)' : 'بلورات إبرية: كبريت منشوري', cx, by - 140, { color: cols.c4, size: 13, w: '700' }); }
          else { ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.moveTo(cx - 40, by - 100); ctx.lineTo(cx + 40, by - 100); ctx.lineTo(cx, by - 40); ctx.closePath(); ctx.fill(); D.txt(ctx, 'انتظر دقيقتين', cx, by - 140, { color: cols.text, size: 13, w: '700' }); }
        } else {
          R.beaker(ctx, cx, by, 150, 150, { level: 0.6, color: 'rgba(96,165,250,.35)', label: 'كأس ماء' });
          ctx.strokeStyle = '#92400e'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx - 50, by - 20); for (let i = 0; i < 6; i++) ctx.quadraticCurveTo(cx - 40 + i * 18, by - (i % 2 ? 70 : 30), cx - 30 + i * 18, by - 40); ctx.stroke(); ctx.lineCap = 'butt';
          D.txt(ctx, s >= 3 ? 'حبال مطاطية: كبريت مطاطي' : 'يتصلّب فجأة في الماء', cx, by - 175, { color: cols.c4, size: 13, w: '700' });
        }
      }
      D.txt(ctx, d.list[Math.min(s, d.list.length - 1)], W / 2, H * 0.92, { color: cols.text, size: n ? 12.5 : 14.5, w: '700' });
    },
    explain(a, b, da, db) { const o = []; if (a.path !== b.path) o.push(b.path === 'props' ? 'خصائص الكبريت الفيزيائية.' : b.path === 'prism' ? 'التبريد البطيء للمصهور يعطي بلورات إبرية (منشوري).' : 'الصبّ السريع لمصهور داكن مغلي في الماء يعطي الكبريت المطاطي.'); else if (a.stage !== b.stage) o.push(db.list[b.stage]); return o; },
    learn: ['**خصائص فيزيائية (نشاط 11):** صلب أصفر، لا يوصل الكهرباء، هش لا يُطرق ولا يُسحب.', '**التركيب (ص18):** يتكوّن الكبريت الطبيعي من جزيئات S₈ حلقية؛ إذا ترتبت بانتظام نتج المعيني أو الإبري (المنشوري)، وإذا كانت سلاسل طويلة نتج البلاستيكي (المطاطي). تُسمّى هذه الظاهرة **التآصل**.', '**السلامة (ص19):** لا تبقِ الأنبوب بشكل مستمر على اللهب.'],
    challenges: [
      { q: 'حضّر الكبريت المنشوري.', hint: 'اختر مسار المنشوري وتابع المراحل حتى فتح ورقة الترشيح.', init: { path: 'props', stage: 0 }, check: (p) => p.path === 'prism' && p.stage >= 4, why: () => 'بلورات إبرية لامعة.' },
      { q: 'حضّر الكبريت المطاطي.', hint: 'سخّن حتى الغليان ثم صبّ في الماء.', init: { path: 'props', stage: 0 }, check: (p) => p.path === 'plastic' && p.stage === 3, why: () => 'حبال مرنة: سلاسل طويلة من ذرات الكبريت.' },
      { q: 'أثبت أن الكبريت لا يوصل الكهرباء.', hint: 'مسار الخصائص: الدارة الكهربائية.', init: { path: 'plastic', stage: 0 }, check: (p) => p.path === 'props' && p.stage === 1, why: () => 'المصباح لا يضيء.' }
    ],
    tutor: [
      { q: 'ما ظاهرة التآصل؟', k: ['تاصل', 'متاصلات'], a: () => C.tutor('هل المعيني والمطاطي عنصران مختلفان؟', 'وجود العنصر نفسه بأشكال مختلفة في الخصائص الفيزيائية بسبب اختلاف ترتيب ذراته (ص18).') },
      { q: 'لماذا يختلف المطاطي عن المنشوري؟', k: ['مطاطي', 'منشوري', 'فرق'], a: () => C.tutor('ماذا يحدث لحلقات S₈ عند التسخين الشديد؟', 'في المطاطي تكون الذرات سلاسل طويلة، وفي المنشوري حلقات S₈ مرتبة بانتظام.') },
      { q: 'لماذا لا أبقي الأنبوب على اللهب؟', k: ['لهب', 'تحذير', 'سلامه'], a: () => C.tutor('ماذا يحدث لمادة تُسخّن بشدة فجأة؟', 'تحذير الكتاب ص19: التسخين المستمر قد يسبب فوران المصهور أو اشتعاله؛ أبعد الأنبوب قليلاً ثم أعد تسخينه.') }
    ]
  });

  /* ======================= نشاط (13) الخصائص الكيميائية للكبريت ص20–21 ======================= */
  const M_ZnS = C.MASS.Zn + C.MASS.S;
  reg({
    id: 'sulfur-reactions', order: 7, lesson: '1-2-2', lessonTitle: 'الكبريت', page: 20,
    titleAr: 'تفاعل الكبريت مع الأكسجين ومع الخارصين', titleEn: 'Reactions of Sulfur with Oxygen and Zinc',
    tags: 'كبريت اكسجين ثاني اكسيد الكبريت حمضي خارصين كبريتيد الخارصين مادة محددة نشاط 13',
    formula: '\\text{S} + \\text{O}_2 \\rightarrow \\text{SO}_2 \\quad ; \\quad \\text{Zn} + \\text{S} \\rightarrow \\text{ZnS}',
    book: 'نشاط (13) ص20: (أ) تسخين مسحوق الكبريت وتعريض ورقتي دوّار الشمس المبللتين للغاز الناتج (SO₂). (ب) وضع (2) غم من مسحوق الكبريت مع (1) غم خارصين في جفنة والتسخين في ساحة المدرسة.',
    summary: 'يحترق الكبريت مكوّناً SO₂، وهو غاز حمضي يحوّل دوّار الشمس الأزرق إلى أحمر ويسبب المطر الحمضي. ويتحد الكبريت مع الخارصين اتحاداً مباشراً طارداً للحرارة مكوّناً ZnS؛ وتحدد المادة المحدِّدة كمية الناتج.',
    vars: [['m_{\\text{S}}', 'كتلة الكبريت', '\\text{غم}', 'الكتاب: 2'], ['m_{\\text{Zn}}', 'كتلة الخارصين', '\\text{غم}', 'الكتاب: 1'], ['n', 'عدد المولات = m ÷ M (S = 32 ، Zn = 65.39)', '\\text{مول}', '—']],
    assumptions: ['الكتل المولية: S = 32 (الكتاب)، Zn = 65.39 (الجدول الدوري ص123).'],
    params: [
      { key: 'part', label: '\\text{الجزء}', type: 'select', value: 'Zn', options: [['O2', '(أ) مع الأكسجين'], ['Zn', '(ب) مع الخارصين']] },
      { key: 'mS', label: 'm_{\\text{S}}\\ \\text{(غم)}', min: 0.5, max: 4, step: 0.5, value: 2 },
      { key: 'mZn', label: 'm_{\\text{Zn}}\\ \\text{(غم)}', min: 0.5, max: 4, step: 0.5, value: 1, hidden: (p) => p.part !== 'Zn' },
      { key: 'paper', label: '\\text{ورقة دوّار الشمس المبللة}', type: 'select', value: 'blue', options: [['blue', 'زرقاء'], ['red', 'حمراء']], hidden: (p) => p.part !== 'O2' },
      { key: 'heat', label: '\\text{التسخين}', type: 'toggle', value: false, on: 'يسخّن', off: 'بلا تسخين' }
    ],
    compute(p) {
      const nS = p.mS / C.MASS.S, nZn = p.mZn / C.MASS.Zn; const lim = nZn < nS ? 'Zn' : 'S'; const nP = Math.min(nS, nZn);
      return { nS: nS, nZn: nZn, lim: lim, nP: nP, mP: nP * M_ZnS, exS: (nS - nP) * C.MASS.S, exZn: (nZn - nP) * C.MASS.Zn, nSO2: nS, mSO2: nS * (C.MASS.S + 32) };
    },
    live(p, d) { return p.part === 'Zn' ? 'n_{\\text{S}} = \\frac{' + p.mS + '}{32} = ' + r2(d.nS, 4) + ' ,\\quad n_{\\text{Zn}} = \\frac{' + p.mZn + '}{65.39} = ' + r2(d.nZn, 4) : 'n_{\\text{S}} = \\frac{' + p.mS + '}{32} = ' + r2(d.nS, 4) + '\\ \\text{مول}'; },
    results(p, d) {
      if (!p.heat) return [['الحالة', 'سخّن الخليط لبدء التفاعل', false]];
      if (p.part === 'O2') return [['الغاز الناتج', 'SO₂ ذو رائحة خانقة', false], ['دوّار الشمس', p.paper === 'blue' ? 'يتحول إلى الأحمر: SO₂ غاز حمضي' : 'يبقى أحمر', false, p.paper === 'blue' ? 'pos' : ''], ['كتلة SO₂ الناتجة', r2(d.mSO2, 2) + ' غم', false], ['المعادلة', '{{S(s) + O₂(g) → SO₂(g)}}', false]];
      return [['المادة المحدِّدة', d.lim === 'Zn' ? 'الخارصين' : 'الكبريت', false, 'pos'], ['كتلة ZnS الناتجة', r2(d.mP, 2) + ' غم', false], ['الفائض', d.lim === 'Zn' ? 'كبريت: ' + r2(d.exS, 2) + ' غم' : 'خارصين: ' + r2(d.exZn, 2) + ' غم', false], ['نوع التفاعل', 'اتحاد مباشر طارد للحرارة (توهّج)', false], ['المعادلة', '{{Zn(s) + S(s) → ZnS(s)}}', false]];
    },
    steps(p, d) { return p.part === 'O2' ? ['سخّن مسحوق الكبريت في أنبوب بحذر حتى يتصاعد غاز.', 'عرّض ورقتي دوّار الشمس المبللتين للغاز.', 'n(SO₂) = n(S) = ' + r2(d.nS, 4) + ' مول.'] : ['n(S) = ' + p.mS + ' ÷ 32 = ' + r2(d.nS, 4) + ' مول، n(Zn) = ' + p.mZn + ' ÷ 65.39 = ' + r2(d.nZn, 4) + ' مول.', 'نسبة التفاعل 1 : 1، فالمادة الأقل مولات هي المحدِّدة: ' + (d.lim === 'Zn' ? 'الخارصين' : 'الكبريت') + '.', 'كتلة ZnS = ' + r2(d.nP, 4) + ' × ' + r2(M_ZnS, 2) + ' = ' + r2(d.mP, 2) + ' غم.', 'نفّذ التسخين في ساحة المدرسة (ص21).']; },
    drawCustom(ctx, W, H, p, d, cols) {
      const n = R.narrow(W); const cx = W * 0.38, by = H * 0.66;
      if (p.part === 'O2') {
        R.tube(ctx, cx, by - 30, 40, Math.min(180, H * 0.4), { solid: { color: p.heat ? '#ea580c' : '#facc15', h: 18 } }); R.flame(ctx, cx, by + 40, 40, p.heat);
        if (p.heat) { for (let i = 0; i < 6; i++) { ctx.fillStyle = 'rgba(148,163,184,.4)'; ctx.beginPath(); ctx.arc(cx + 40 + i * 14, by - H * 0.42 - i * 6, 8, 0, Math.PI * 2); ctx.fill(); } D.txt(ctx, 'SO₂', cx + 70, by - H * 0.42 - 40, { color: cols.text, size: 14, w: '700' }); }
        R.paper(ctx, cx + 110, by - H * 0.35, 24, 56, p.heat && p.paper === 'blue' ? R.LITMUS.red : R.LITMUS[p.paper], 'مبللة');
      } else {
        ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); ctx.moveTo(cx - 60, by - 40); ctx.quadraticCurveTo(cx, by + 10, cx + 60, by - 40); ctx.closePath(); ctx.fill(); ctx.strokeStyle = cols.muted; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = p.heat ? '#f8fafc' : '#facc15'; ctx.beginPath(); ctx.ellipse(cx, by - 32, 44, 7, 0, 0, Math.PI * 2); ctx.fill();
        if (p.heat) { ctx.fillStyle = 'rgba(251,146,60,.5)'; ctx.beginPath(); ctx.arc(cx, by - 40, 50, 0, Math.PI * 2); ctx.fill(); D.txt(ctx, 'توهّج!', cx, by - 100, { color: cols.c4, size: 14, w: '700' }); }
        D.txt(ctx, 'جفنة', cx + 80, by - 30, { color: cols.text, size: 12 }); R.flame(ctx, cx, by + 50, 40, p.heat);
        const bx = W * 0.72, bb = H * 0.62, bh = H * 0.4, maxN = Math.max(d.nS, d.nZn) || 1; const bw = n ? 30 : 44;
        [[d.nS, '#facc15', 'S'], [d.nZn, '#94a3b8', 'Zn'], [p.heat ? d.nP : 0, '#e2e8f0', 'ZnS']].forEach(([v, c, l], i) => { const h = bh * v / maxN; ctx.fillStyle = c; ctx.fillRect(bx + (i - 1) * (bw + 12) - bw / 2, bb - h, bw, h); ctx.strokeStyle = cols.muted; ctx.strokeRect(bx + (i - 1) * (bw + 12) - bw / 2, bb - h, bw, h); D.txt(ctx, l, bx + (i - 1) * (bw + 12), bb + 14, { color: cols.text, size: 12, w: '700' }); D.txt(ctx, r2(v, 3), bx + (i - 1) * (bw + 12), bb - h - 10, { color: cols.text, size: 10.5 }); });
        D.txt(ctx, 'عدد المولات', bx, bb - bh - 26, { color: cols.muted, size: 12, w: '700' });
      }
      ML.chemEqLine(ctx, W, H * 0.92, p.part === 'O2' ? 'S(s) + O₂(g) → SO₂(g)' : 'Zn(s) + S(s) → ZnS(s)', cols, n ? 14 : 17);
    },
    explain(a, b, da, db) { const o = []; if (a.heat !== b.heat && b.heat) o.push(b.part === 'O2' ? 'احترق الكبريت مكوّناً SO₂ الحمضي.' : 'تفاعل طارد مع توهّج: ' + r2(db.mP, 2) + ' غم ZnS.'); if ((a.mS !== b.mS || a.mZn !== b.mZn) && b.part === 'Zn') o.push('المادة المحدِّدة الآن: ' + (db.lim === 'Zn' ? 'الخارصين' : 'الكبريت') + '.'); return o; },
    learn: ['**(أ) مع الأكسجين:** {{S(s) + O₂(g) → SO₂(g)}}؛ SO₂ غاز حمضي، وأكاسيد الكبريت مع ماء المطر تسبب المطر الحمضي.', '**(ب) مع الخارصين:** {{Zn(s) + S(s) → ZnS(s)}} اتحاد مباشر طارد للحرارة.', '**بنسب الكتاب (2 غم S و1 غم Zn):** مولات Zn = 0.0153 أقل من مولات S = 0.0625، فالخارصين هو المادة المحدِّدة ويبقى كبريت فائض.', '**السلامة:** سخّن بحذر، ونفّذ الجزء (ب) في ساحة المدرسة (ص21).'],
    challenges: [
      { q: 'بكميات الكتاب (2 غم كبريت و1 غم خارصين)، سخّن وحدّد المادة المحدِّدة.', hint: 'قارن عدد المولات.', init: { part: 'Zn', mS: 2, mZn: 1, heat: false }, check: (p) => p.part === 'Zn' && p.heat && p.mS === 2 && p.mZn === 1, why: (p, d) => 'الخارصين محدِّد، ويبقى ' + r2(d.exS, 2) + ' غم كبريت.' },
      { q: 'اختر كتلتين يتفاعلان كلاهما تقريباً دون فائض يُذكر.', hint: 'نسبة الكتل S : Zn ≈ 32 : 65.', init: { part: 'Zn', mS: 2, mZn: 1, heat: true }, check: (p, d) => p.part === 'Zn' && Math.abs(d.nS - d.nZn) / Math.max(d.nS, d.nZn) < 0.05, why: () => 'عدد المولات متساوٍ تقريباً.' },
      { q: 'أثبت أن الغاز الناتج من احتراق الكبريت حمضي.', hint: 'استخدم الورقة الزرقاء.', init: { part: 'O2', paper: 'red', heat: false }, check: (p) => p.part === 'O2' && p.heat && p.paper === 'blue', why: () => 'تحوّل الورقة الزرقاء إلى الحمراء.' }
    ],
    tutor: [
      { q: 'كيف أحدد المادة المحدِّدة؟', k: ['محدده', 'فائض', 'المحدد'], a: (p, d) => C.tutor('أي المادتين عدد مولاتها أقل؟ (النسبة 1 : 1)', 'n(S) = ' + r2(d.nS, 4) + '، n(Zn) = ' + r2(d.nZn, 4) + '؛ المحدِّدة: ' + (d.lim === 'Zn' ? 'الخارصين' : 'الكبريت') + '.') },
      { q: 'لماذا تحمرّ الورقة الزرقاء؟', k: ['تحمر', 'حمضي', 'ورقه'], a: () => C.tutor('ماذا يكوّن SO₂ مع ماء الورقة المبللة؟', 'SO₂ غاز حمضي يكوّن مع الماء محلولاً حمضياً.') },
      { q: 'لماذا يُنفَّذ الجزء (ب) في الساحة؟', k: ['ساحه', 'خارج', 'سلامه'], a: () => C.tutor('هل التفاعل هادئ؟', 'تفاعل شديد يطلق حرارة وتوهجاً وأبخرة، فيُنفّذ في الهواء الطلق (ص21).') }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
