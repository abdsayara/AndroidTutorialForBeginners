/* العلوم الحياتية — الوحدة الأولى، الفصل الأول: المجاهر وأنواعها (ص 4–9) */
(function (root) {
  'use strict';
  const ML = root.ML; const B = ML.bio; const D = ML.pdraw;
  const S = 'g10-bio'; const U = 1;
  const reg = (o) => ML.register(Object.assign({ subject: S, unit: U, custom: true }, o));
  const narrow = (W) => W < 640;

  /* ======================= 1-1 سلم الأحجام (الشكل 1) ======================= */
  const TICKS = [[1, '10 م'], [0, '1 م'], [-1, '0.1 م'], [-2, '1 سم'], [-3, '1 ملم'], [-4, '100 ميكرومتر'], [-5, '10 ميكرومتر'], [-6, '1 ميكرومتر'], [-7, '100 نانومتر'], [-8, '10 نانومتر'], [-9, '1 نانومتر'], [-10, '0.1 نانومتر']];
  const tickName = (lg) => (TICKS.find((t) => t[0] === lg) || [0, ''])[1];
  function icon(ctx, k, cx, cy, R, c) {
    ctx.save(); ctx.lineWidth = 2;
    if (k === 0) { ctx.strokeStyle = c.text; ctx.beginPath(); ctx.arc(cx, cy - R * 0.55, R * 0.16, 0, 7); ctx.moveTo(cx, cy - R * 0.38); ctx.lineTo(cx, cy + R * 0.25); ctx.moveTo(cx - R * 0.3, cy - R * 0.15); ctx.lineTo(cx + R * 0.3, cy - R * 0.15); ctx.moveTo(cx, cy + R * 0.25); ctx.lineTo(cx - R * 0.22, cy + R * 0.7); ctx.moveTo(cx, cy + R * 0.25); ctx.lineTo(cx + R * 0.22, cy + R * 0.7); ctx.stroke(); }
    else if (k === 1) { ctx.strokeStyle = c.c5; ctx.beginPath(); ctx.moveTo(cx - R * 0.8, cy); ctx.lineTo(cx + R * 0.6, cy); ctx.stroke(); B.blob(ctx, cx - R * 0.7, cy, R * 0.16, R * 0.12, c.c5); for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(cx - R * 0.8, cy); ctx.lineTo(cx - R * 0.95, cy - R * 0.3 + i * R * 0.2); ctx.stroke(); } }
    else if (k <= 4) { const f = [0, 0, 0.75, 0.55, 0.4][k]; B.blob(ctx, cx, cy, R * f * 0.8, R * f, k === 2 ? '#fde68a' : '#fef3c7', c.c4, 2); B.blob(ctx, cx, cy, R * f * 0.25, R * f * 0.25, k === 2 ? '#f59e0b' : '#d97706'); }
    else if (k === 5) { for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { ctx.strokeStyle = c.c3; ctx.strokeRect(cx - R * 0.75 + i * R * 0.5, cy - R * 0.75 + j * R * 0.5, R * 0.5, R * 0.5); B.blob(ctx, cx - R * 0.5 + i * R * 0.5, cy - R * 0.5 + j * R * 0.5, R * 0.08, R * 0.08, c.c5); } }
    else if (k === 6 || k === 7) { ctx.fillStyle = 'rgba(37,99,235,.25)'; ctx.strokeStyle = c.c1; for (let i = 0; i < (k === 6 ? 3 : 6); i++) { const a = i * 1.1; ctx.save(); ctx.translate(cx + Math.cos(a) * R * 0.4, cy + Math.sin(a) * R * 0.4); ctx.rotate(a); D.rr(ctx, -R * 0.22, -R * 0.08, R * 0.44, R * 0.16, R * 0.08); ctx.fill(); ctx.stroke(); ctx.restore(); } }
    else if (k === 8) { ctx.strokeStyle = c.c2; for (let i = 0; i < 5; i++) { const x = cx - R * 0.6 + (i % 3) * R * 0.6, y = cy - R * 0.3 + Math.floor(i / 3) * R * 0.6; ctx.beginPath(); for (let a = 0; a < 6; a++) ctx.lineTo(x + Math.cos(a * Math.PI / 3) * R * 0.17, y + Math.sin(a * Math.PI / 3) * R * 0.17); ctx.closePath(); ctx.stroke(); } }
    else { const n = k === 9 ? 6 : k === 10 ? 8 : 12; for (let i = 0; i < n; i++) { const a = i * 2.4, r = R * 0.55 * Math.sqrt((i + 1) / n); B.blob(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, R * (k >= 12 ? 0.07 : 0.11), R * (k >= 12 ? 0.07 : 0.11), B.PAL[i % 8]); } }
    ctx.restore();
  }
  reg({
    id: 'size-scale', order: 1, lesson: '1-1', lessonTitle: 'ما أهمية المجاهر؟', page: 4,
    titleAr: 'سلم الأحجام: ماذا ترى العين وماذا ترى المجاهر؟', titleEn: 'The Size Scale: Eye vs Light vs Electron Microscope', tags: 'حجم الخلايا ميكرومتر نانومتر عين مجردة مجهر ضوئي الكتروني الشكل 1',
    formula: '1\\ \\text{م} = 10^{3}\\ \\text{ملم} = 10^{6}\\ \\text{ميكرومتر} = 10^{9}\\ \\text{نانومتر}',
    book: 'الشكل (1) ص 4: مقارنة بين أحجام عينات مختلفة، ومجال الرؤية بالعين المجردة والمجهر الضوئي والمجهر الإلكتروني. معظم الخلايا بين 1 ميكرومتر (خلية بكتيرية) و 100 ميكرومتر (بعض الخلايا الحيوانية).',
    summary: 'لا تستطيع العين المجردة تمييز معظم الخلايا لأن أحجامها تتراوح بين 1 ميكرومتر و 100 ميكرومتر؛ لذلك نحتاج المجهر الضوئي، ولرؤية الأجسام الأصغر (الفيروسات، الرايبوسومات، الجزيئات) نحتاج المجهر الإلكتروني.',
    vars: [['\\text{العينة}', 'جسم من الشكل (1) مرتب من الأكبر إلى الأصغر', '—', '14 عينة'], ['\\text{م ، ملم ، ميكرومتر ، نانومتر}', 'وحدات الطول المستعملة في الشكل', '\\text{م}', 'من 10 م إلى 0.1 نانومتر'], ['\\text{مجال الرؤية}', 'العين المجردة / المجهر الضوئي / المجهر الإلكتروني', '—', 'حسب الشكل (1)']],
    assumptions: ['مواقع العينات ومجالات الرؤية قراءة تقريبية من الشكل (1) في الكتاب؛ يُعرض لكل عينة خطا التدريج اللذان تقع بينهما فقط، دون اختراع قياس دقيق.'],
    params: [
      { key: 'i', label: '\\text{العينة}', type: 'stage', stages: B.SCALE.map((x) => x.name), value: 5, desc: 'من الأكبر إلى الأصغر' },
      { key: 'ranges', label: '\\text{مجالات الرؤية}', type: 'toggle', value: true, on: 'إظهار مجالات الرؤية', off: 'إخفاء مجالات الرؤية' }
    ],
    play: { mode: 'stage', key: 'i', interval: 1.4 },
    canvasHint: 'اضغط على أي عينة في السلم لاختيارها، أو استعمل زري المرحلة السابقة/التالية.',
    compute(p) { const it = B.SCALE[p.i]; const sb = B.seenBy(it.lg); const hi = Math.ceil(it.lg), lo = Math.floor(it.lg); return { it: it, sb: sb, hi: hi === lo ? hi + 1 : hi, lo: lo }; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = narrow(W); const top = 30, bot = H - 20; const x0 = nar ? W - 92 : W * 0.62; const span = bot - top;
      const Y = (lg) => top + (1 - lg) / 11 * span;
      D.txt(ctx, 'الشكل (1): مقارنة بين أحجام العينات', nar ? W / 2 : W * 0.62, 14, { color: c.text, size: 13 });
      ctx.strokeStyle = c.axis || c.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, Y(1)); ctx.lineTo(x0, Y(-10)); ctx.stroke();
      TICKS.forEach((t) => { const y = Y(t[0]); ctx.beginPath(); ctx.moveTo(x0 - 6, y); ctx.lineTo(x0 + 6, y); ctx.stroke(); D.txt(ctx, t[1], x0 + 10, y, { color: c.text, size: nar ? 10 : 11, w: '500', align: 'left' }); });
      if (p.ranges) {
        [['eye', 'العين المجردة', c.c3], ['light', 'المجهر الضوئي', c.c1], ['electron', 'المجهر الإلكتروني', c.c5]].forEach((r, k) => {
          const a = B.RANGES[r[0]]; const x = x0 - 22 - k * 16; ctx.fillStyle = r[2]; ctx.globalAlpha = 0.85; D.rr(ctx, x - 5, Y(Math.min(1, a[1])), 10, Y(a[0]) - Y(Math.min(1, a[1])), 5); ctx.fill(); ctx.globalAlpha = 1;
          const ly = H - 14 - (2 - k) * 18; ctx.fillStyle = r[2]; ctx.fillRect(nar ? 8 : 16, ly - 5, 14, 10); D.txt(ctx, r[1], (nar ? 8 : 16) + 18, ly, { color: r[2], size: 11, w: '700', align: 'left' });
        });
      }
      // العينات
      const xl = x0 - 70;
      B.SCALE.forEach((it, k) => {
        const y = Y(it.lg); const on = k === p.i;
        ctx.fillStyle = on ? c.c2 : c.muted; ctx.beginPath(); ctx.arc(x0, y, on ? 6 : 4, 0, 7); ctx.fill();
        if (!nar || on) { ctx.strokeStyle = on ? c.c2 : c.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0 - 6, y); ctx.lineTo(xl + 4, y); ctx.stroke(); }
        if (!nar) D.txt(ctx, it.name, xl, y, { color: on ? c.c2 : c.text, size: on ? 13 : 11, w: on ? '800' : '500', align: 'right', halo: c.bg });
        d.hits.push({ id: k, x: (nar ? 0 : xl - 180), y: y - 9, w: x0 - (nar ? 0 : xl - 180) + 8, h: 18 });
      });
      // نافذة التكبير
      const cx = nar ? (x0 - 60) / 2 : W * 0.22, cy = H * 0.42, R = Math.min(nar ? (x0 - 80) / 2 : W * 0.17, H * 0.3);
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fillStyle = c.bg; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = c.c2; ctx.stroke(); ctx.clip(); icon(ctx, p.i, cx, cy, R * 0.9, c); ctx.restore();
      D.txt(ctx, d.it.name, cx, cy + R + 18, { color: c.c2, size: 14, w: '800' });
      D.txt(ctx, 'بين ' + tickName(d.hi) + ' و ' + tickName(d.lo), cx, cy + R + 38, { color: c.text, size: 12 });
      const tools = [d.sb.eye ? 'العين المجردة' : null, d.sb.light ? 'المجهر الضوئي' : null, d.sb.electron ? 'المجهر الإلكتروني' : null].filter(Boolean);
      D.txt(ctx, 'يُرى بـ: ' + (tools.join(' / ') || '—'), cx, cy + R + 58, { color: c.c3, size: 12, w: '700' });
    },
    onPointer(type, x, y, p, st, api) { if (type !== 'down') return false; const h = api.hit(x, y); if (h) api.set('i', h.id); return false; },
    live(p, d) { return '\\text{' + d.it.name + '}'; },
    results(p, d) {
      return [['العينة المختارة', d.it.name, false], ['موقعها في الشكل (1)', 'بين خطي التدريج ' + tickName(d.hi) + ' و ' + tickName(d.lo), false],
        ['العين المجردة', d.sb.eye ? '✅ تُرى' : '❌ لا تُرى', false], ['المجهر الضوئي', d.sb.light ? '✅ يُرى به' : '❌ خارج مجاله', false], ['المجهر الإلكتروني', d.sb.electron ? '✅ يُرى به' : '❌ خارج مجاله', false]];
    },
    steps(p, d) { return ['حدّد موقع العينة على السلم الرأسي (كل خط تدريج أصغر بعشر مرات من الذي فوقه).', 'قارن موقعها بالأشرطة الملونة: الأخضر العين المجردة، الأزرق المجهر الضوئي، البنفسجي المجهر الإلكتروني.', 'النتيجة: ' + d.it.name + ' ' + (d.sb.eye ? 'تُرى بالعين المجردة.' : d.sb.light ? 'تحتاج المجهر الضوئي على الأقل.' : 'لا تُرى إلا بالمجهر الإلكتروني.')]; },
    explain(a, b) { if (a.i === b.i) return []; const it = B.SCALE[b.i]; const sb = B.seenBy(it.lg); return ['انتقلت إلى «' + it.name + '». ' + (b.i > a.i ? 'العينة أصغر، فتحتاج قوة تمييز أكبر.' : 'العينة أكبر.') + ' ' + (sb.eye ? 'ما زالت ضمن مجال العين المجردة.' : sb.light ? 'خرجت من مجال العين المجردة ودخلت مجال المجهر الضوئي.' : 'أصغر من مقدار تمييز المجهر الضوئي (0.2 ميكرومتر)، فلا تُرى إلا بالمجهر الإلكتروني.')]; },
    learn: ['**لماذا المجاهر؟ (ص 4):** معظم الخلايا يتراوح حجمها بين 1 ميكرومتر (خلية بكتيرية) و 100 ميكرومتر (بعض الخلايا الحيوانية)، والعين المجردة لا تستطيع تمييزها.', '**الشكل (1):** يرتّب العينات من طول الإنسان إلى الذرات، ويبيّن مجال الرؤية بالعين المجردة والمجهر الضوئي والمجهر الإلكتروني.', '**مقدار التمييز (الفصل) (ص 5):** أقصر مسافة يمكن من خلالها التمييز بين نقطتين؛ 0.2 ميكرومتر في المجهر المركب، و 3×10⁻⁴ – 1×10⁻⁵ ميكرومتر في المجاهر الإلكترونية.'],
    challenges: [
      { q: 'اختر عينة **لا تُرى إلا بالمجهر الإلكتروني**.', hint: 'انزل في السلم إلى ما دون 0.2 ميكرومتر: الفيروسات أو الرايبوسوم أو البروتين…', init: { i: 0 }, check: (p, d) => d.sb.electron && !d.sb.light && !d.sb.eye, why: (p, d) => '«' + d.it.name + '» أصغر من مقدار تمييز المجهر الضوئي.' },
      { q: 'اختر عينة **تحتاج المجهر الضوئي** ولا تُرى بالعين المجردة.', hint: 'مثل الخلايا النباتية والحيوانية أو البكتيريا.', init: { i: 0 }, check: (p, d) => d.sb.light && !d.sb.eye },
      { q: 'اختر «خلايا نباتية وخلايا حيوانية» من السلم.', hint: 'تقع بين 10 و 100 ميكرومتر.', init: { i: 12 }, check: (p) => p.i === 5 }
    ],
    tutor: [
      { q: 'لماذا لا نرى الخلية بالعين المجردة؟', k: ['لا نرى', 'العين', 'الخليه'], a: () => 'لأن معظم الخلايا بين 1 و 100 ميكرومتر (ص 4)، وهي أصغر من أن تميزها العين المجردة؛ لذلك نستعمل المجهر.' },
      { q: 'بماذا أرى هذه العينة؟', k: ['ارى', 'بماذا', 'مجهر'], a: (p, d) => '«' + d.it.name + '»: ' + (d.sb.eye ? 'تُرى بالعين المجردة.' : d.sb.light ? 'تُرى بالمجهر الضوئي.' : 'لا تُرى إلا بالمجهر الإلكتروني.') },
      { q: 'كم ميكرومتر في الملم؟', k: ['ميكرومتر', 'ملم', 'نانومتر'], a: () => '1 ملم = 1000 ميكرومتر، و 1 ميكرومتر = 1000 نانومتر.' }
    ]
  });

  /* ======================= 2-1 المجهر الضوئي المركب ======================= */
  const T_FOCUS = { 4: 41, 10: 57, 40: 69, 100: 75 }, TOL = { 4: 4, 10: 2.5, 40: 0.7, 100: 0.45 };
  const PARTS = {
    eye: ['العدسة العينية', 'يُنظر من خلالها، وتكبيرها في الكتاب X10.'],
    arm: ['الذراع', 'يُمسك منه المجهر عند نقله.'],
    nose: ['قرص تحريك العدسات الشيئية', 'يُدار لاختيار العدسة الشيئية المناسبة.'],
    obj: ['العدسات الشيئية', 'تكبيراتها في الشكل (5): X4 و X10 و X40، و X100 عدسة زيتية تحتاج نقطة زيت.'],
    clip: ['مثبت الشريحة', 'يثبّت الشريحة فوق المنضدة.'],
    stage: ['المنضدة', 'توضع عليها الشريحة فوق فتحة يمر منها الضوء.'],
    coarse: ['الضابط الكبير', 'لضبط الرؤية بحركة كبيرة؛ يُبدأ به مع أصغر عدسة شيئية.'],
    fine: ['الضابط الصغير', 'لضبط الرؤية بدقة، وهو ضروري مع التكبيرات الكبيرة.'],
    base: ['القاعدة', 'يرتكز عليها المجهر.'],
    light: ['المصدر الضوئي', 'يرسل الضوء عبر العينة إلى العدسات.']
  };
  function scope(ctx, x, y, s, c, p, hits, sel) {
    // رسم تخطيطي للمجهر المركب (الشكل 4) مع مناطق النقر
    const P = (dx, dy) => [x + dx * s, y + dy * s];
    const part = (id, poly, fill) => { ctx.beginPath(); poly.forEach((q, i) => { const r = P(q[0], q[1]); i ? ctx.lineTo(r[0], r[1]) : ctx.moveTo(r[0], r[1]); }); ctx.closePath(); ctx.fillStyle = sel === id ? '#fbbf24' : fill; ctx.fill(); ctx.strokeStyle = c.text; ctx.lineWidth = 1.2; ctx.stroke(); const xs = poly.map((q) => P(q[0], q[1])); const mnx = Math.min(...xs.map((q) => q[0])), mxx = Math.max(...xs.map((q) => q[0])), mny = Math.min(...xs.map((q) => q[1])), mxy = Math.max(...xs.map((q) => q[1])); hits.push({ id: id, x: mnx, y: mny, w: mxx - mnx, h: mxy - mny }); };
    part('base', [[-60, 175], [60, 175], [60, 195], [-60, 195]], '#64748b');
    part('arm', [[20, 170], [40, 170], [40, 20], [5, -10], [-5, 0], [22, 30]], '#94a3b8');
    part('stage', [[-55, 110], [35, 110], [35, 120], [-55, 120]], '#475569');
    part('clip', [[-50, 104], [-20, 104], [-20, 110], [-50, 110]], '#cbd5e1');
    part('light', [[-22, 150], [-2, 150], [-2, 165], [-22, 165]], '#fde047');
    part('coarse', [[38, 60], [58, 60], [58, 82], [38, 82]], '#334155');
    part('fine', [[40, 88], [54, 88], [54, 100], [40, 100]], '#475569');
    part('nose', [[-30, 40], [10, 40], [6, 52], [-26, 52]], '#94a3b8');
    const objH = { 4: 18, 10: 24, 40: 30, 100: 36 }[p.obj] || 24;
    part('obj', [[-18, 52], [-4, 52], [-6, 52 + objH], [-16, 52 + objH]], '#e2e8f0');
    part('eye', [[-24, -40], [-6, -40], [-8, 0], [-22, 0]], '#e2e8f0');
    ctx.strokeStyle = c.text; ctx.lineWidth = 2; const a = P(-15, 0), b = P(-12, 40); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    if (p.oil && p.obj === 100) { const q = P(-11, 108); B.blob(ctx, q[0], q[1], 5 * s, 2.5 * s, '#facc15'); }
    // شعاع الضوء
    if (s > 1.1) {
      const L = [['eye', -15, -30, 'العدسة العينية'], ['nose', -10, 46, 'قرص تحريك العدسات الشيئية'], ['obj', -11, 60, 'العدسات الشيئية'], ['clip', -35, 105, 'مثبت الشريحة'], ['stage', -50, 115, 'المنضدة'], ['light', -12, 158, 'المصدر الضوئي'], ['base', -40, 185, 'القاعدة']];
      const R2 = [['arm', 30, 120, 'الذراع'], ['coarse', 56, 70, 'الضابط الكبير'], ['fine', 52, 94, 'الضابط الصغير']];
      ctx.lineWidth = 1; L.forEach((q) => { const a2 = P(q[1], q[2]), b2 = P(-60, q[2]); ctx.strokeStyle = c.muted; ctx.beginPath(); ctx.moveTo(a2[0], a2[1]); ctx.lineTo(b2[0], b2[1]); ctx.stroke(); D.txt(ctx, q[3], b2[0] - 4, b2[1], { color: sel === q[0] ? '#d97706' : c.text, size: 11, w: '700', align: 'right' }); });
      R2.forEach((q) => { const a2 = P(q[1], q[2]), b2 = P(68, q[2]); ctx.strokeStyle = c.muted; ctx.beginPath(); ctx.moveTo(a2[0], a2[1]); ctx.lineTo(b2[0], b2[1]); ctx.stroke(); D.txt(ctx, q[3], b2[0] + 4, b2[1], { color: sel === q[0] ? '#d97706' : c.text, size: 11, w: '700', align: 'left' }); });
    }
    ctx.strokeStyle = 'rgba(250,204,21,.6)'; ctx.lineWidth = 3 * s; const l1 = P(-12, 150), l2 = P(-12, 52 + objH); ctx.beginPath(); ctx.moveTo(l1[0], l1[1]); ctx.lineTo(l2[0], l2[1]); ctx.stroke();
  }
  function specimen(ctx, cx, cy, R, kind, mag, c, seed) {
    // يزداد حجم الأجسام مع التكبير ويقل عدد ما يظهر منها (مجال الرؤية يصغر)
    const k = mag / 40; let rnd = seed;
    const rand = () => { rnd = (rnd * 9301 + 49297) % 233280; return rnd / 233280; };
    if (kind === 'onion') {
      const w = 34 * k, h = 12 * k; ctx.strokeStyle = '#7c2d12'; ctx.lineWidth = Math.max(1, k * 0.8);
      for (let row = -Math.ceil(R / h) - 1; row <= Math.ceil(R / h) + 1; row++) {
        const off = (row % 2) * w / 2;
        for (let col = -Math.ceil(R / w) - 1; col <= Math.ceil(R / w) + 1; col++) {
          const x = cx + col * w + off, y = cy + row * h; ctx.fillStyle = 'rgba(253,186,116,.35)'; ctx.fillRect(x - w / 2, y - h / 2, w, h); ctx.strokeRect(x - w / 2, y - h / 2, w, h);
          B.blob(ctx, x - w * 0.15, y, Math.max(1.2, h * 0.18), Math.max(1.2, h * 0.18), '#9a3412');
        }
      }
    } else {
      const n = Math.min(600, Math.round(260 / (k * k) + 6));
      for (let i = 0; i < n; i++) { const a = rand() * 7, r = R * 1.1 * Math.sqrt(rand()); const rr = (1.5 + rand() * 2.2) * k; B.blob(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, rr, rr, '#fffbeb', '#475569', Math.max(0.8, k * 0.3)); }
    }
  }
  reg({
    id: 'compound-microscope', order: 2, lesson: '2-1', lessonTitle: 'المجاهر', page: 6,
    titleAr: 'المجهر الضوئي المركب: التكبير والتركيز', titleEn: 'The Compound Light Microscope: Magnification & Focus', tags: 'مجهر مركب عدسة عينية شيئية ضابط كبير صغير تكبير X400 عدسة زيتية منضدة',
    formula: '\\text{مقدار التكبير في المجهر المركب} = \\text{تكبير العدسة العينية} \\times \\text{تكبير العدسة الشيئية}',
    book: 'مقدار التكبير في المجهر المركب = مقدار التكبير في العدسة العينية × مقدار التكبير في العدسة الشيئية (ص 7)',
    summary: 'يتركب المجهر المركب من عدسة عينية وعدسات شيئية (X4، X10، X40، X100 زيتية). التكبير الكلي حاصل ضرب تكبير العدستين. تبدأ دائماً بأصغر عدسة شيئية، وتضبط الرؤية بالضابطين الكبير والصغير (نشاط 1).',
    vars: [['\\text{X10}', 'تكبير العدسة العينية (ص 9، س4)', '\\text{مرة}', 'ثابتة X10'], ['\\text{X4 ، X10 ، X40 ، X100}', 'تكبير العدسة الشيئية (الشكل 5)', '\\text{مرة}', 'أربع عدسات؛ X100 زيتية'], ['\\text{التكبير الكلي}', 'العينية × الشيئية', '\\text{مرة}', 'X40 – X1000'], ['\\text{الضابطان}', 'الضابط الكبير والضابط الصغير لضبط الرؤية', '—', 'تدريج للعرض فقط']],
    assumptions: ['حدة الصورة وموقع التركيز في المحاكاة نموذج مبسّط لأغراض التعليم: كلما زاد التكبير ضاق مدى التركيز فاحتجت الضابط الصغير.', 'مجال الرؤية يصغر مع زيادة التكبير (يظهر جزء أصغر من العينة)؛ لا يذكر الكتاب قيمة عددية لقطره، فيُعرض نوعياً.'],
    params: [
      { key: 'eye', label: '\\text{العدسة العينية}', type: 'select', options: [[10, 'X10 (القيمة الوحيدة في الكتاب)']], value: 10, desc: 'الكتاب يذكر العينية X10 فقط' },
      { key: 'obj', label: '\\text{العدسة الشيئية}', type: 'select', options: [[4, 'X4'], [10, 'X10'], [40, 'X40'], [100, 'X100 (عدسة زيتية)']], value: 4 },
      { key: 'spec', label: '\\text{الشريحة}', type: 'select', options: [['milk', 'قطرة حليب (نشاط 1)'], ['onion', 'خلايا البصل (س2)']], value: 'milk' },
      { key: 'coarse', label: '\\text{الضابط الكبير}', min: 0, max: 100, step: 2, value: 20, desc: 'تدريج للعرض' },
      { key: 'fine', label: '\\text{الضابط الصغير}', min: 0, max: 10, step: 0.1, value: 5, desc: 'تدريج للعرض' },
      { key: 'oil', label: '\\text{نقطة زيت}', type: 'toggle', value: false, on: 'توجد نقطة زيت', off: 'دون زيت' }
    ],
    initState: () => ({ part: null }),
    canvasHint: 'اضغط على أي جزء من المجهر لمعرفة اسمه ووظيفته. حرّك الضابطين حتى تصبح الصورة حادة.',
    compute(p) {
      const mag = B.magnification(p.eye, p.obj); const pos = p.coarse + (p.fine - 5) * 0.5; const err = Math.abs(pos - T_FOCUS[p.obj]);
      const oilBad = p.obj === 100 && !p.oil; const oilWaste = p.obj !== 100 && p.oil;
      const blur = Math.min(16, Math.max(0, err - TOL[p.obj]) * 1.6) + (oilBad ? 5 : 0);
      return { mag: mag, err: err, sharp: blur < 0.01, blur: blur, oilBad: oilBad, oilWaste: oilWaste, coarseOnly: err <= 3 };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = narrow(W); const st = d.st || {};
      const s = nar ? Math.min(W * 0.36, H * 0.42) / 200 : Math.min(W * 0.34, H * 0.8) / 220;
      const sx = nar ? W * 0.22 : W * 0.29, sy = nar ? 50 : H * 0.14;
      scope(ctx, sx, sy, s, c, p, d.hits, st.part);
      // مجال الرؤية
      const R = nar ? Math.min(W * 0.27, H * 0.24) : Math.min(W * 0.2, H * 0.36); const cx = nar ? W * 0.7 : W * 0.75, cy = nar ? 30 + R : H * 0.44;
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fillStyle = d.oilBad ? '#94a3b8' : '#dbeafe'; ctx.fill(); ctx.clip();
      ctx.filter = d.blur > 0 ? 'blur(' + d.blur.toFixed(1) + 'px)' : 'none';
      specimen(ctx, cx, cy, R, p.spec, d.mag, c, p.spec === 'milk' ? 77 : 3);
      ctx.filter = 'none'; ctx.restore();
      ctx.lineWidth = 5; ctx.strokeStyle = '#1e293b'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
      D.txt(ctx, 'ما تراه في العدسة العينية', cx, cy - R - 12, { color: c.text, size: 12 });
      D.txt(ctx, 'التكبير الكلي = ' + p.eye + ' × ' + p.obj + ' = ' + d.mag, cx, cy + R + 18, { color: c.c1, size: 15, w: '800' });
      D.txt(ctx, d.sharp ? '✓ الصورة حادة' : d.oilBad ? 'العدسة X100 تحتاج نقطة زيت' : d.err > 6 ? 'الصورة غير واضحة: استعمل الضابط الكبير' : 'اقتربت: استعمل الضابط الصغير', cx, cy + R + 40, { color: d.sharp ? c.c3 : c.c2, size: 13, w: '700' });
      if (st.part) { const pr = PARTS[st.part]; const y = H - 34; ctx.fillStyle = c.bg; ctx.globalAlpha = 0.92; D.rr(ctx, 8, y - 18, W - 16, 40, 10); ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = c.c4; ctx.lineWidth = 2; ctx.stroke(); B.para(ctx, D, pr[0] + ': ' + pr[1], W / 2, y + 2, W - 40, { color: c.text, size: nar ? 10.5 : 13, w: '700', bottom: true }); }
    },
    onPointer(type, x, y, p, st, api) {
      if (type !== 'down') return false; const h = api.hit(x, y); if (!h) return false;
      st.part = h.id; const pr = PARTS[h.id]; api.say(['**' + pr[0] + '** (الشكل 4): ' + pr[1]]); return true;
    },
    graph(p, d) {
      return { view: { xmin: 0, xmax: 5, ymin: 0, ymax: 1100 }, xLabel: 'العدسة الشيئية', yLabel: 'التكبير الكلي', caption: 'التكبير الكلي مع العينية X10: X4 ← 40، X10 ← 100، X40 ← 400، X100 ← 1000 (العمود الملوّن: العدسة الحالية).',
        draw(G) { const cc = G.colors(); B.OBJECTIVES.forEach((o, i) => { const v = 10 * o; const x = i + 1; const ctx = G.ctx; ctx.fillStyle = o === p.obj ? cc.c2 : cc.c1; ctx.globalAlpha = o === p.obj ? 1 : 0.45; ctx.fillRect(G.X(x - 0.3), G.Y(v), G.X(x + 0.3) - G.X(x - 0.3), G.Y(0) - G.Y(v)); ctx.globalAlpha = 1; G.text(x, v, 'X' + o + ' → ' + v, { color: cc.text, dy: -10, bold: true }); }); } };
    },
    live(p, d) { return '\\text{التكبير الكلي} = ' + p.eye + ' \\times ' + p.obj + ' = ' + d.mag; },
    results(p, d) {
      return [['تكبير العدسة العينية', 'X' + p.eye, false], ['تكبير العدسة الشيئية', 'X' + p.obj, false], ['التكبير الكلي', p.eye + ' \\times ' + p.obj + ' = ' + d.mag],
        ['حالة الصورة', d.sharp ? '✅ حادة' : '❌ غير واضحة', false], ['مجال الرؤية', p.obj === 4 ? 'الأوسع (يظهر جزء كبير من العينة)' : p.obj === 100 ? 'الأضيق' : 'يضيق كلما زاد التكبير', false]].concat(d.oilWaste ? [['تنبيه', 'نقطة الزيت تُستخدم مع العدسة الزيتية X100 فقط', false]] : []);
    },
    steps(p, d) { return ['ضع الشريحة على المنضدة وثبّتها بمثبت الشريحة.', 'ابدأ بأصغر عدسة شيئية (X4) واضبط الرؤية بالضابط الكبير ثم الصغير (نشاط 1).', 'التكبير الكلي = تكبير العينية × تكبير الشيئية = ' + p.eye + ' × ' + p.obj + ' = ' + d.mag + '.', p.obj === 100 ? 'مع العدسة X100 ضع نقطة زيت على الشريحة.' : 'للتكبيرات الأكبر أدر قرص تحريك العدسات الشيئية ثم استعمل الضابط الصغير.']; },
    explain(a, b, da, db) {
      const out = [];
      if (a.obj !== b.obj) out.push('غيّرت العدسة الشيئية من X' + a.obj + ' إلى X' + b.obj + '، فأصبح التكبير الكلي ' + db.mag + ' بدلاً من ' + da.mag + '. ' + (b.obj > a.obj ? 'تكبر الأجسام ويضيق مجال الرؤية فيظهر عدد أقل منها، ويحتاج التركيز ضبطاً أدق.' : 'يتسع مجال الرؤية وتصغر الأجسام.'));
      if (a.coarse !== b.coarse || a.fine !== b.fine) out.push(db.sharp ? 'أصبحت الصورة حادة لأن المسافة بين العدسة الشيئية والعينة أصبحت مناسبة.' : db.err > 6 ? 'ما زالت الصورة بعيدة عن التركيز؛ الضابط الكبير يحركها بخطوات كبيرة.' : 'الصورة قريبة من التركيز؛ الضابط الصغير يضبطها بدقة.');
      if (a.oil !== b.oil) out.push(b.oil ? (b.obj === 100 ? 'نقطة الزيت ضرورية مع العدسة الزيتية X100.' : 'الزيت لا يُستخدم إلا مع العدسة الزيتية.') : 'أزلت نقطة الزيت.');
      return out;
    },
    learn: ['**أجزاء المجهر المركب (الشكل 4، ص 6):** العدسة العينية، الذراع، العدسات الشيئية، قرص تحريك العدسات الشيئية، مثبت الشريحة، المنضدة، الضابط الكبير، الضابط الصغير، القاعدة، المصدر الضوئي.', '**قانون التكبير (ص 7):** مقدار التكبير في المجهر المركب = مقدار التكبير في العدسة العينية × مقدار التكبير في العدسة الشيئية.', '**العدسات الشيئية (الشكل 5، ص 8):** X4 و X10 و X40، و X100 عدسة زيتية تحتاج نقطة زيت.', '**نشاط 1 (ص 7):** فحص قطرة حليب: ابدأ بأصغر عدسة شيئية، واضبط الرؤية بالضابطين الكبير والصغير.'],
    challenges: [
      { q: 'س4 (ص 9): تريد تكبيراً كلياً **X400** والعدسة العينية X10. اختر العدسة الشيئية المناسبة ثم اجعل الصورة حادة.', hint: '400 ÷ 10 = 40 ← العدسة X40، ثم استعمل الضابط الصغير.', init: { obj: 4, coarse: 20, fine: 5, oil: false }, check: (p, d) => p.obj === 40 && d.sharp, why: () => 'X10 × X40 = X400.' },
      { q: 'نشاط 1: افحص قطرة الحليب بأصغر عدسة شيئية واجعل الصورة حادة.', hint: 'اختر X4 وحرّك الضابط الكبير حتى قرب 40.', init: { obj: 40, coarse: 10, fine: 5, spec: 'milk', oil: false }, check: (p, d) => p.obj === 4 && d.sharp && p.spec === 'milk' },
      { q: 'احصل على أكبر تكبير ممكن (X1000) بصورة حادة.', hint: 'العدسة X100 زيتية: فعّل «نقطة زيت» ثم اضبط الضابطين.', init: { obj: 10, coarse: 30, fine: 5, oil: false }, check: (p, d) => p.obj === 100 && p.oil && d.sharp }
    ],
    tutor: [
      { q: 'كم التكبير الآن؟', k: ['تكبير', 'كم'], a: (p, d) => 'التكبير الكلي = ' + p.eye + ' × ' + p.obj + ' = ' + d.mag + ' مرة.' },
      { q: 'لماذا الصورة غير واضحة؟', k: ['واضح', 'ضبابي', 'غير حاد', 'تركيز'], a: (p, d) => (d.sharp ? 'الصورة حادة الآن.' : d.oilBad ? 'العدسة X100 زيتية وتحتاج نقطة زيت.' : d.err > 6 ? 'المسافة بعيدة عن موضع التركيز؛ حرّك الضابط الكبير أولاً.' : 'اقتربت من التركيز؛ حرّك الضابط الصغير قليلاً.') },
      { q: 'لماذا نبدأ بأصغر عدسة شيئية؟', k: ['ابدا', 'اصغر', 'لماذا نبدا'], a: () => 'لأن مجال الرؤية معها أوسع فيسهل إيجاد العينة، ومدى التركيز أكبر فيسهل ضبط الرؤية، ثم ننتقل إلى التكبيرات الأكبر (نشاط 1).' }
    ]
  });

  /* ======================= 2-1 مقارنة المجهر الضوئي والإلكترونيين ======================= */
  const KINDS = [['light', 'المجهر الضوئي المركب'], ['sem', 'المجهر الإلكتروني الماسح (SEM)'], ['tem', 'المجهر الإلكتروني النافذ (TEM)']];
  reg({
    id: 'microscope-compare', order: 3, lesson: '2-1', lessonTitle: 'المجاهر', page: 8,
    titleAr: 'المجهر الضوئي والمجهران الإلكترونيان: مقارنة', titleEn: 'Light vs SEM vs TEM Microscopes', tags: 'مجهر الكتروني ماسح نافذ SEM TEM مقدار التمييز الفصل الكترونات عدسات كهرومغناطيسية',
    formula: '\\text{مقدار التمييز: } 0.2\\ \\text{ميكرومتر (الضوئي)} \\quad ; \\quad 3\\times10^{-4} - 1\\times10^{-5}\\ \\text{ميكرومتر (الإلكتروني)}',
    book: 'الفروق الرئيسة بين المجاهر: نوع الإشعاع (ضوئي / إلكتروني)، مقدار التكبير، نوع العدسات، مقدار التمييز (ص 5، ص 8)',
    summary: 'تختلف المجاهر في نوع الإشعاع ونوع العدسات ومقدار التمييز. المجاهر الإلكترونية تستخدم إلكترونات بدل الضوء وعدسات كهرومغناطيسية، وتقع الصورة على شاشة مفلورة، ولا تُفحص بها إلا الخلايا الميتة.',
    vars: [['\\text{نوع المجهر}', 'ضوئي مركب / إلكتروني ماسح / إلكتروني نافذ', '—', 'ثلاثة أنواع'], ['\\text{مقدار التمييز}', 'أقصر مسافة يمكن من خلالها التمييز بين نقطتين', '\\text{ميكرومتر}', '0.2 للضوئي؛ 3×10⁻⁴ – 1×10⁻⁵ للإلكتروني']],
    assumptions: ['الرسم التخطيطي لمسار الأشعة نموذج مبسّط لأغراض التعليم؛ القيم المعروضة من الكتاب فقط.'],
    params: [{ key: 'k', label: '\\text{نوع المجهر}', type: 'select', options: KINDS, value: 'light' }],
    initState: () => ({ t: 0 }), play: { mode: 'time', speed: 1 }, tick(st, p, d, dt) { st.t += dt; },
    randomize(p) { const o = KINDS.map((x) => x[0]).filter((x) => x !== p.k); return { k: o[Math.floor(Math.random() * o.length)] }; },
    canvasHint: 'اضغط «تشغيل» لترى حركة الضوء أو الإلكترونات عبر المجهر. اضغط على أي مجهر في الأعلى لاختياره.',
    compute(p) { return { m: B.MICROSCOPES[p.k] }; },
    drawCustom(ctx, W, H, p, d, c) {
      const nar = narrow(W); const t = (d.st && d.st.t) || 0;
      // أزرار الاختيار
      const bw = (W - 32) / 3;
      KINDS.forEach((k, i) => { const x = W - 8 - (i + 1) * bw - i * 8 + 8; B.card(ctx, D, x, 8, bw, 34, nar ? ['الضوئي', 'الماسح', 'النافذ'][i] : k[1], { fill: p.k === k[0] ? '#2563eb' : '#e2e8f0', color: p.k === k[0] ? '#fff' : '#1e293b', size: 12 }); d.hits.push({ id: k[0], x: x, y: 8, w: bw, h: 34 }); });
      // مسار الإشعاع
      const cx = nar ? W / 2 : W * 0.24; const y0 = 60, y1 = nar ? H * 0.52 : H - 30; const elec = p.k !== 'light';
      const stops = elec ? [['مصدر الإلكترونات', 0], ['عدسة كهرومغناطيسية', 0.22], [p.k === 'sem' ? 'سطح العينة' : 'العينة', 0.45], ['عدسة كهرومغناطيسية', 0.65], ['شاشة مفلورة', 0.95]] : [['المصدر الضوئي', 0.95], ['العينة على المنضدة', 0.7], ['العدسة الشيئية', 0.5], ['العدسة العينية', 0.15], ['عين الفاحص', 0]];
      const Y = (f) => y0 + f * (y1 - y0);
      ctx.strokeStyle = c.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, y0); ctx.lineTo(cx, y1); ctx.stroke();
      stops.forEach((s) => { const y = Y(s[1]); const isLens = /عدسة/.test(s[0]); ctx.fillStyle = isLens ? (elec ? '#7c3aed' : '#93c5fd') : /العينة/.test(s[0]) ? '#f472b6' : /شاشة/.test(s[0]) ? '#a3e635' : '#fbbf24'; if (isLens) { if (elec) { D.rr(ctx, cx - 34, y - 7, 18, 14, 4); ctx.fill(); D.rr(ctx, cx + 16, y - 7, 18, 14, 4); ctx.fill(); } else B.blob(ctx, cx, y, 30, 6, ctx.fillStyle); } else { D.rr(ctx, cx - 26, y - 5, 52, 10, 4); ctx.fill(); } D.txt(ctx, s[0], cx + 42, y, { color: c.text, size: 12, align: 'left', halo: c.bg }); });
      // جسيمات متحركة
      for (let i = 0; i < 12; i++) { const f = ((t * 0.35 + i / 12) % 1); const y = elec ? Y(f) : Y(0.95 - f * 0.95); const x = cx + Math.sin(i * 1.7 + t * 3) * (elec ? 3 : 10) * (1 - Math.abs(0.5 - f)); B.blob(ctx, x, y, elec ? 2.5 : 3.5, elec ? 2.5 : 3.5, elec ? '#7c3aed' : '#facc15'); }
      if (p.k === 'sem') { const sx = cx - 26 + ((t * 40) % 52); ctx.strokeStyle = '#db2777'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx, Y(0.45) - 12); ctx.lineTo(sx, Y(0.45) + 12); ctx.stroke(); D.txt(ctx, 'مسح السطح', cx - 40, Y(0.45) - 14, { color: '#db2777', size: 11, align: 'right' }); }
      // جدول المقارنة
      const m = d.m; const tx = nar ? 10 : W * 0.48, tw = nar ? W - 20 : W * 0.5, ty = nar ? H * 0.56 : 60;
      const rows = [['نوع الإشعاع', m.radiation], ['نوع العدسات', m.lenses], ['مقدار التمييز', m.res], ['العينات', m.live], ['الصورة', m.image], ['الاستخدام', m.use]];
      const rh = nar ? (H - ty - 8) / rows.length : Math.min(44, (H - ty - 70) / rows.length);
      rows.forEach((r, i) => { const y = ty + i * rh; ctx.fillStyle = i % 2 ? 'rgba(148,163,184,.12)' : 'rgba(37,99,235,.08)'; ctx.fillRect(tx, y, tw, rh - 2); D.txt(ctx, r[0], tx + tw - 6, y + rh / 2, { color: c.c1, size: nar ? 10.5 : 12, w: '800', align: 'right' }); D.txt(ctx, r[1], tx + tw - (nar ? 82 : 100), y + rh / 2, { color: c.text, size: nar ? 10 : 12, w: '500', align: 'right' }); });
      if (!nar) { // مقياس مقدار التمييز
        const by = ty + rows.length * rh + 26; const bx0 = tx + 10, bx1 = tx + tw - 10; const X = (lg) => bx1 - (lg + 5.5) / 6 * (bx1 - bx0);
        D.txt(ctx, 'مقدار التمييز (ميكرومتر) — كلما كان أصغر كان المجهر أدق', (bx0 + bx1) / 2, by - 14, { color: c.text, size: 11 });
        ctx.strokeStyle = c.text; ctx.beginPath(); ctx.moveTo(bx0, by); ctx.lineTo(bx1, by); ctx.stroke();
        [0, -1, -2, -3, -4, -5].forEach((lg) => { ctx.beginPath(); ctx.moveTo(X(lg), by - 4); ctx.lineTo(X(lg), by + 4); ctx.stroke(); D.txt(ctx, lg === 0 ? '1' : '10⁻' + '¹²³⁴⁵'[-lg - 1], X(lg), by + 14, { color: c.text, size: 10 }); });
        ctx.fillStyle = '#2563eb'; ctx.beginPath(); ctx.arc(X(Math.log10(0.2)), by, p.k === 'light' ? 8 : 5, 0, 7); ctx.fill();
        ctx.fillStyle = '#7c3aed'; ctx.globalAlpha = p.k === 'light' ? 0.5 : 1; D.rr(ctx, X(Math.log10(3e-4)), by - 5, X(-5) - X(Math.log10(3e-4)), 10, 5); ctx.fill(); ctx.globalAlpha = 1;
      }
    },
    onPointer(type, x, y, p, st, api) { if (type !== 'down') return false; const h = api.hit(x, y); if (h) api.set('k', h.id); return false; },
    live(p, d) { return '\\text{' + d.m.name.replace(/ \(.*\)/, '') + '}'; },
    results(p, d) { const m = d.m; return [['المجهر', m.name, false], ['نوع الإشعاع', m.radiation, false], ['نوع العدسات', m.lenses, false], ['مقدار التمييز', m.res, false], ['العينات', m.live, false], ['الصورة', m.image, false], ['الاستخدام', m.use, false]]; },
    steps(p, d) { return ['مقدار التمييز = أقصر مسافة يمكن من خلالها التمييز بين نقطتين (ص 5).', 'المجهر الضوئي: 0.2 ميكرومتر. المجهران الإلكترونيان: 3×10⁻⁴ – 1×10⁻⁵ ميكرومتر، أي أدق بكثير.', 'لذلك تُدرس العضيات الدقيقة بالمجهر الإلكتروني النافذ، وسطوح العينات (حبوب اللقاح) بالماسح.']; },
    explain(a, b) { if (a.k === b.k) return []; const m = B.MICROSCOPES[b.k]; return ['اخترت ' + m.name + ': ' + (b.k === 'light' ? 'يعمل بالضوء وعدسات عينية وشيئية، ومقدار تمييزه 0.2 ميكرومتر.' : 'يستخدم إلكترونات بدل الضوء وعدسات كهرومغناطيسية، وتقع الصورة على شاشة مفلورة، ولا تُفحص إلا الخلايا الميتة. ' + m.image + '.')]; },
    learn: ['**الفروق الرئيسة بين المجاهر (ص 5):** نوع الإشعاع (ضوئي/إلكتروني)، مقدار التكبير، نوع العدسات، مقدار التمييز.', '**المجاهر الضوئية:** المجهر المركب والمجهر التشريحي (ص 6–7).', '**المجاهر الإلكترونية (ص 8):** تستخدم إلكترونات بدل المصدر الضوئي وعدسات كهرومغناطيسية، وتقع صورة الجسم على شاشة مفلورة، وتُفحص بها الخلايا الميتة.', '**الماسح (SEM):** تظهر الصورة بأبعادها الثلاثية، ويُستخدم لدراسة بعض جزيئات الخلية مثل DNA ولدراسة حبوب اللقاح.', '**النافذ (TEM):** الأداة الرئيسة لدراسة التركيب الدقيق للخلية.'],
    challenges: [
      { q: 'اختر المجهر الذي يُعد **الأداة الرئيسة لدراسة التركيب الدقيق للخلية**.', hint: 'أحد المجهرين الإلكترونيين.', init: { k: 'light' }, check: (p) => p.k === 'tem' },
      { q: 'تريد صورة **ثلاثية الأبعاد** لحبوب اللقاح لتصنيفها. أي مجهر تختار؟', hint: 'المجهر الذي يمسح السطح.', init: { k: 'tem' }, check: (p) => p.k === 'sem' },
      { q: 'س1 (ص 9): تريد فحص قطرة حليب في المختبر المدرسي بعدسة عينية وعدسات شيئية. أي مجهر تختار؟', hint: 'المجهر الذي يستخدم الضوء.', init: { k: 'sem' }, check: (p) => p.k === 'light' }
    ],
    tutor: [
      { q: 'ما مقدار التمييز؟', k: ['تمييز', 'فصل'], a: () => 'مقدار التمييز (الفصل) هو أقصر مسافة يمكن من خلالها التمييز بين نقطتين: 0.2 ميكرومتر في المجهر المركب، و 3×10⁻⁴ – 1×10⁻⁵ ميكرومتر في المجاهر الإلكترونية (ص 5).' },
      { q: 'لماذا لا نرى خلايا حية بالمجهر الإلكتروني؟', k: ['حيه', 'ميته', 'حية'], a: () => 'يذكر الكتاب (ص 8) أن المجاهر الإلكترونية تُفحص بها الخلايا الميتة، وأن الماسح لا تُشاهد به العينات حية.' },
      { q: 'ما الفرق بين الماسح والنافذ؟', k: ['الماسح', 'النافذ', 'الفرق'], a: () => 'الماسح يُظهر الصورة بأبعادها الثلاثية (حبوب اللقاح، DNA)، والنافذ الأداة الرئيسة لدراسة التركيب الدقيق للخلية (ص 8).' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
