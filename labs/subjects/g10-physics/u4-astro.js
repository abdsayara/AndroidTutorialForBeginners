/* الفيزياء — الوحدة الرابعة: الفلك (ص 126–151)
 * عرض ثلاثي الأبعاد (إسقاط متعامد) للكرة السماوية: الكرة السماوية ثلاثية الأبعاد بطبيعتها،
 * لذا نستخدم منزلقي «زاوية النظر» و«ارتفاع النظر» لتدويرها.
 */
(function (root) {
  'use strict';
  const ML = root.ML; const M = ML.math; const D = ML.pdraw;
  const S = 'g10-physics'; const U = 8;
  const f2 = (x, n) => M.fmt(x, n === undefined ? 2 : n);
  const R = Math.PI / 180; const EPS = 23.5; // ميل محور الأرض (ص 137)

  /* ---------- هندسة ثلاثية الأبعاد ---------- */
  const add = (...vs) => vs.reduce((a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], [0, 0, 0]);
  const mul = (v, k) => [v[0] * k, v[1] * k, v[2] * k];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  // إطار الأفق: x = الشمال، y = الغرب، z = سمت الرأس. φ دائرة عرض الراصد.
  function frame(phi) { const f = phi * R; return { N: [1, 0, 0], W: [0, 1, 0], Z: [0, 0, 1], P: [Math.cos(f), 0, Math.sin(f)], Q: [-Math.sin(f), 0, Math.cos(f)] }; }
  // موقع جرم ميله δ وزاوية ساعته H (بالدرجات، تزداد غرباً)
  function eqv(F, Hdeg, dec) { const H = Hdeg * R, d = dec * R; return add(mul(F.Q, Math.cos(d) * Math.cos(H)), mul(F.W, Math.cos(d) * Math.sin(H)), mul(F.P, Math.sin(d))); }
  // من المطلع المستقيم (بالساعات) والميل والتوقيت النجمي المحلي (بالساعات)
  const radec = (F, raH, dec, lst) => eqv(F, (lst - raH) * 15, dec);
  // نقطة على دائرة البروج عند الطول البروجي λ
  function eclip(lam) { const l = lam * R, e = EPS * R; const x = Math.cos(l), y = Math.cos(e) * Math.sin(l), z = Math.sin(e) * Math.sin(l); return { ra: ((Math.atan2(y, x) / R + 360) % 360) / 15, dec: Math.asin(z) / R }; }
  function cam(yaw, elev, cx, cy, r) {
    const p = yaw * R, e = elev * R;
    const Dv = [Math.cos(e) * Math.cos(p), Math.cos(e) * Math.sin(p), Math.sin(e)];
    const Uv = [-Math.sin(e) * Math.cos(p), -Math.sin(e) * Math.sin(p), Math.cos(e)];
    const Rv = [Uv[1] * Dv[2] - Uv[2] * Dv[1], Uv[2] * Dv[0] - Uv[0] * Dv[2], Uv[0] * Dv[1] - Uv[1] * Dv[0]];
    return { P: (v) => ({ x: cx + dot(Rv, v) * r, y: cy - dot(Uv, v) * r, z: dot(Dv, v) }), cx: cx, cy: cy, r: r };
  }
  // منحنى ثلاثي الأبعاد: الجزء الأمامي متصل، والخلفي متقطع باهت
  function curve(ctx, C, pts, color, w) {
    const pp = pts.map(C.P); ctx.save(); ctx.strokeStyle = color; ctx.lineCap = 'round';
    for (let i = 1; i < pp.length; i++) {
      const a = pp[i - 1], b = pp[i]; const front = (a.z + b.z) / 2 >= 0;
      ctx.lineWidth = front ? (w || 2.2) : 1.2; ctx.globalAlpha = front ? 1 : 0.4; ctx.setLineDash(front ? [] : [4, 4]);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    ctx.restore();
  }
  const great = (u, v, n, t0, t1) => { const a = []; n = n || 120; t0 = t0 || 0; t1 = t1 === undefined ? 2 * Math.PI : t1; for (let i = 0; i <= n; i++) { const t = t0 + (t1 - t0) * i / n; a.push(add(mul(u, Math.cos(t)), mul(v, Math.sin(t)))); } return a; };
  // دائرة يومية لجرم ميله δ
  const diurnal = (F, dec, n) => { const a = []; n = n || 120; for (let i = 0; i <= n; i++) a.push(eqv(F, i * 360 / n, dec)); return a; };
  function dot3(ctx, C, v, color, r, label, lc) { const p = C.P(v); ctx.save(); ctx.globalAlpha = p.z >= 0 ? 1 : 0.45; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(p.x, p.y, r || 5, 0, 7); ctx.fill(); ctx.restore(); if (label) D.txt(ctx, label, p.x + 8, p.y - 10, { color: lc || color, size: 12, w: '700', align: 'left', halo: '#ffffffaa' }); return p; }
  function sphereBase(ctx, C, F, c, opts) {
    opts = opts || {};
    ctx.strokeStyle = c.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(C.cx, C.cy, C.r, 0, 7); ctx.stroke();
    // مستوى الأفق (الأرض)
    const hz = great(F.N, F.W, 90).map(C.P); ctx.fillStyle = '#16a34a'; ctx.globalAlpha = 0.12; ctx.beginPath(); hz.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.fill(); ctx.globalAlpha = 1;
    curve(ctx, C, great(F.N, F.W), '#16a34a', 2.5);
    if (opts.equator !== false) curve(ctx, C, great(F.Q, F.W), c.c1, 2.5);
    if (opts.meridian) curve(ctx, C, great(F.N, F.Z), c.c4, 1.8);
    // المحور والقطبان
    const pN = C.P(F.P), pS = C.P(mul(F.P, -1)); ctx.strokeStyle = c.c5; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(pS.x, pS.y); ctx.lineTo(pN.x, pN.y); ctx.stroke(); ctx.setLineDash([]);
    dot3(ctx, C, F.P, c.c5, 5, 'القطب السماوي الشمالي'); dot3(ctx, C, mul(F.P, -1), c.c5, 4, 'الجنوبي');
    // الراصد والاتجاهات
    ctx.fillStyle = c.text; ctx.beginPath(); ctx.arc(C.cx, C.cy, 4, 0, 7); ctx.fill();
    [[F.N, 'ش'], [mul(F.N, -1), 'ج'], [F.W, 'غ'], [mul(F.W, -1), 'ق']].forEach((a) => { const p = C.P(mul(a[0], 1.1)); D.txt(ctx, a[1], p.x, p.y, { color: '#16a34a', size: 13, w: '700' }); });
  }
  const camParams = [
    { key: 'yaw', label: '\\text{view}^{\\circ}', min: 0, max: 360, step: 5, value: 215, desc: 'زاوية النظر (تدوير المشهد)', noRandom: true },
    { key: 'elev', label: '\\text{tilt}^{\\circ}', min: 0, max: 80, step: 5, value: 20, desc: 'ارتفاع النظر', noRandom: true }
  ];
  const sphereCam = (W, H, p) => cam(p.yaw, p.elev, W / 2, H / 2 + 6, Math.min(W, H) * 0.4);
  const altOf = (v) => Math.asin(M.clamp(v[2], -1, 1)) / R;

  /* ======================= 1-2 / 1-3 الكرة السماوية ومعالمها ======================= */
  ML.register({
    subject: S, id: 'celestial-sphere', unit: U, order: 1, lesson: '1-3', lessonTitle: 'معالم الكرة السماوية', page: 131,
    titleAr: 'الكرة السماوية ومعالمها', titleEn: 'The Celestial Sphere & its Landmarks', tags: 'كره سماويه قبه سماويه سمت الراس النظير الافق دائره الاستواء السماوي قطب سماوي دائره الزوال البروج',
    formula: 'h_{\\text{NCP}} = \\varphi, \\qquad \\delta_{\\text{zenith}} = \\varphi, \\qquad \\angle(\\text{equator}, \\text{horizon}) = 90^\\circ - |\\varphi|',
    book: 'الميل الاستوائي لسمت رأس الراصد يساوي دائرة عرضه (ص 135) ؛ دائرة الاستواء السماوي تبعد 90° عن القطبين (ص 133) ؛ سمت الرأس والنظير يبعدان 90° عن الأفق (ص 133)',
    summary: 'الكرة السماوية كرة وهمية مجوفة مركزها الأرض وتنتشر الأجرام على سطحها الداخلي. يرى الراصد نصفها فوق دائرة الأفق (القبة السماوية). يتغير ميل القبة بالنسبة للراصد بتغيّر دائرة عرضه: يرتفع القطب السماوي الشمالي فوق الأفق بزاوية تساوي دائرة العرض.',
    vars: [['\\varphi', 'دائرة عرض الراصد', '^\\circ', '−90 (القطب الجنوبي) – 90 (القطب الشمالي)'], ['\\text{LST}', 'زاوية دوران الكرة السماوية (التوقيت النجمي)', '\\mathrm{h}', '0 – 24'], ['\\text{view, tilt}', 'زاويتا النظر إلى النموذج', '^\\circ', 'للعرض فقط']],
    assumptions: ['الأرض في مركز الكرة السماوية، ونصف قطر الكرة كبير جداً مقارنة بالأرض (يُهمل حجم الأرض).', 'دائرة البروج تميل عن دائرة الاستواء السماوي بزاوية 23.5°.'],
    params: [
      { key: 'phi', label: '\\varphi\\ (^\\circ)', min: -90, max: 90, step: 0.5, value: 31.5, desc: 'فلسطين ≈ 31.5° شمالاً' },
      { key: 'lst', label: '\\text{LST}\\ (\\mathrm{h})', min: 0, max: 24, step: 0.1, value: 6 },
      { key: 'ecl', label: '\\text{ecliptic}', type: 'toggle', value: true, on: 'إظهار دائرة البروج', off: 'إخفاء دائرة البروج' }
    ].concat(camParams),
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0 }),
    tick(st, p, d, dt) { st.t += dt; p.lst = (p.lst + 2 * dt) % 24; },
    custom: true, canvasHint: 'الأخضر: الأفق. الأزرق: الاستواء السماوي. البرتقالي: دائرة الزوال. الأحمر: دائرة البروج. اضغط «تشغيل» لتدور الكرة السماوية.',
    compute(p) { return { hNCP: p.phi, decZ: p.phi, ang: 90 - Math.abs(p.phi) }; },
    drawCustom(ctx, W, H, p, d, c) {
      const F = frame(p.phi); const C = sphereCam(W, H, p);
      sphereBase(ctx, C, F, c, { meridian: true });
      if (p.ecl) { const pts = []; for (let l = 0; l <= 360; l += 3) { const e = eclip(l); pts.push(radec(F, e.ra, e.dec, p.lst)); } curve(ctx, C, pts, c.c2, 2.2); const g = radec(F, 0, 0, p.lst); dot3(ctx, C, g, c.c2, 4, 'الاعتدال الربيعي γ'); }
      dot3(ctx, C, F.Z, c.c3, 5, 'سمت الرأس'); dot3(ctx, C, mul(F.Z, -1), c.c3, 4, 'النظير');
      // ارتفاع القطب
      const arc = []; for (let i = 0; i <= 30; i++) { const t = p.phi * R * i / 30; arc.push(add(mul(F.N, 0.35 * Math.cos(t)), mul(F.Z, 0.35 * Math.sin(t)))); }
      curve(ctx, C, arc, c.c5, 3); const pa = C.P(arc[15]); D.txt(ctx, 'φ = ' + p.phi + '°', pa.x + 10, pa.y, { color: c.c5, size: 13, w: '700', align: 'left', halo: c.bg });
      D.txt(ctx, 'ارتفاع القطب السماوي = دائرة العرض = ' + p.phi + '°', W / 2, 18, { color: c.text, size: 14, w: '700' });
    },
    graph(p, d) { return { view: { xmin: -90, xmax: 90, ymin: -90, ymax: 90 }, xLabel: 'φ (°)', yLabel: 'h القطب (°)', caption: 'ارتفاع القطب السماوي الشمالي فوق الأفق يساوي دائرة عرض الراصد: عند القطب (90°) يكون في سمت الرأس، وعند خط الاستواء (0°) على الأفق، وفي نصف الكرة الجنوبي تحت الأفق.', draw(G) { const c = G.colors(); G.fn((x) => x, { color: c.c5, width: 3, domain: [-90, 90] }); G.point(p.phi, p.phi, { color: c.c2, label: p.phi + '°' }); } }; },
    live(p, d) { return 'h_{\\text{NCP}} = \\varphi = ' + p.phi + '^\\circ,\\quad 90^\\circ - |\\varphi| = ' + f2(d.ang) + '^\\circ'; },
    results(p, d) { return [['ارتفاع القطب السماوي الشمالي', d.hNCP + '^\\circ'], ['الميل الاستوائي لسمت الرأس', d.decZ + '^\\circ'], ['الزاوية بين الاستواء السماوي والأفق', f2(d.ang) + '^\\circ'], ['البعد بين سمت الرأس والأفق', '90^\\circ'], ['البعد بين سمت الرأس والنظير', '180^\\circ']]; },
    steps(p) { return ['سمت الرأس يبعد 90° عن الأفق، والقطب السماوي يبعد 90° عن الاستواء السماوي.', 'لذلك الزاوية بين القطب والأفق تساوي الزاوية بين سمت الرأس والاستواء $= \\varphi = ' + p.phi + '°$.']; },
    explain(a, b) {
      if (a.phi !== b.phi) return ['انتقل الراصد إلى دائرة عرض ' + b.phi + '°: ' + (Math.abs(b.phi) === 90 ? 'عند القطب ينطبق الاستواء السماوي على الأفق والقطب السماوي في سمت الرأس.' : b.phi === 0 ? 'عند خط الاستواء يقع القطبان السماويان على الأفق والاستواء السماوي يمر بسمت الرأس.' : 'ارتفع القطب السماوي إلى ' + b.phi + '° فوق الأفق، ومالت دائرة الاستواء السماوي بزاوية ' + (90 - Math.abs(b.phi)) + '° عن الأفق.')];
      if (a.lst !== b.lst) return ['دارت الكرة السماوية ظاهرياً من الشرق إلى الغرب حول المحور المار بالقطبين؛ الأفق وسمت الرأس ودائرة الزوال ثابتة بالنسبة للراصد، أما دائرة البروج فتتحرك مع النجوم.'];
      return [];
    },
    learn: ['**الكرة السماوية (ص 130):** كرة وهمية مجوفة مركزها الأرض، تنتشر الأجرام على سطحها الداخلي، ويرى الراصد جزءاً منها على شكل قبة (القبة السماوية).', '**دائرة الاستواء السماوي (ص 133):** امتداد خط استواء الأرض على الكرة السماوية، تقسمها إلى نصفين شمالي وجنوبي، وتبعد 90° عن القطبين السماويين.', '**سمت الرأس والنظير ودائرة الأفق (ص 133):** سمت الرأس النقطة فوق الراصد تماماً، والنظير المقابلة لها، والأفق دائرة عظمى تبعد عنهما 90°.', '**دائرة الزوال (ص 134):** دائرة عظمى تمر بالقطبين السماويين وسمت الرأس والنظير.', '**دائرة البروج (ص 134):** الدائرة العظمى التي تصنعها الشمس في حركتها الظاهرية خلال سنة، وتتقاطع مع الاستواء السماوي في نقطتي الاعتدال الربيعي والخريفي.'],
    challenges: [
      { q: 'ضع الراصد بحيث يكون القطب السماوي الشمالي في سمت الرأس تماماً.', hint: 'الراصد عند القطب الشمالي: $\\varphi = 90°$.', init: { phi: 31.5 }, check: (p) => p.phi === 90, why: () => 'عندها ينطبق الاستواء السماوي على الأفق.' },
      { q: 'ضع الراصد بحيث يقع القطبان السماويان على الأفق.', hint: 'خط الاستواء الأرضي: $\\varphi = 0$.', init: { phi: 31.5 }, check: (p) => p.phi === 0 },
      { q: 'راصد في فلسطين: اجعل الزاوية بين الاستواء السماوي والأفق 58.5°.', hint: '$90 - \\varphi = 58.5$ ← $\\varphi = 31.5$.', init: { phi: 0 }, check: (p, d) => M.near(d.ang, 58.5) && p.phi > 0 }
    ],
    tutor: [
      { q: 'لماذا لا يرى الراصد الكرة السماوية كلها؟', k: ['لا يرى', 'كلها', 'نصف'], a: () => 'لأن الأرض تحجب النصف الواقع تحت دائرة أفقه؛ يرى فقط القبة السماوية فوق الأفق (نصف الكرة).' },
      { q: 'كم ارتفاع النجم القطبي عندي؟', k: ['القطبي', 'ارتفاع', 'القطب'], a: (p) => 'النجم القطبي قريب جداً من القطب السماوي الشمالي، فارتفاعه فوق الأفق ≈ دائرة عرضك = ' + p.phi + '°' + (p.phi < 0 ? ' (أي تحت الأفق: لا يُرى من نصف الكرة الجنوبي).' : '.') }
    ]
  });

  /* ======================= 1-4 الإحداثيات السماوية الاستوائية ======================= */
  ML.register({
    subject: S, id: 'equatorial-coords', unit: U, order: 2, lesson: '1-4', lessonTitle: 'الإحداثيات السماوية الاستوائية', page: 134,
    titleAr: 'الإحداثيات الاستوائية: الميل الاستوائي والمطلع المستقيم', titleEn: 'Equatorial Coordinates: Declination & Right Ascension', tags: 'احداثيات سماويه ميل استوائي مطلع مستقيم دائره الساعه الاعتدال الربيعي',
    formula: '(\\alpha,\\ \\delta), \\qquad 1\\ \\mathrm{h} = 15^\\circ,\\qquad H = \\text{LST} - \\alpha',
    book: 'الميل الاستوائي: البعد الزاوي عن دائرة استواء السماء شمالاً (+) أو جنوباً (−) ؛ المطلع المستقيم: البعد الزاوي من نقطة الاعتدال الربيعي شرقاً ويقاس بالساعات (ص 135–136)',
    summary: 'يحدَّد موقع أي جرم على الكرة السماوية بإحداثيين: الميل الاستوائي (يشبه دوائر العرض) والمطلع المستقيم (يشبه خطوط الطول) ويقاس بالساعات من نقطة الاعتدال الربيعي باتجاه الشرق.',
    vars: [['\\alpha', 'المطلع المستقيم للنجم', '\\mathrm{h}', '0 – 24'], ['\\delta', 'الميل الاستوائي للنجم', '^\\circ', '−90 – +90'], ['\\varphi', 'دائرة عرض الراصد', '^\\circ', '−90 – 90'], ['\\text{LST}', 'دوران الكرة السماوية', '\\mathrm{h}', '0 – 24']],
    assumptions: ['تدور الكرة السماوية ظاهرياً دورة كل 24 ساعة نجمية حول محور القطبين، فيتغير موقع النجم بالنسبة للأفق بينما يبقى إحداثياه الاستوائيان ثابتين.'],
    params: [
      { key: 'ra', label: '\\alpha\\ (\\mathrm{h})', min: 0, max: 24, step: 0.1, value: 4 },
      { key: 'dec', label: '\\delta\\ (^\\circ)', min: -90, max: 90, step: 1, value: 40 },
      { key: 'phi', label: '\\varphi\\ (^\\circ)', min: -90, max: 90, step: 0.5, value: 31.5 },
      { key: 'lst', label: '\\text{LST}\\ (\\mathrm{h})', min: 0, max: 24, step: 0.1, value: 2 }
    ].concat(camParams),
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0 }),
    tick(st, p, d, dt) { st.t += dt; p.lst = (p.lst + 2 * dt) % 24; },
    custom: true, canvasHint: 'البنفسجي: دائرة الساعة للنجم. الأحمر: قوس الميل الاستوائي. البرتقالي: قوس المطلع المستقيم من نقطة الاعتدال الربيعي γ شرقاً.',
    compute(p) { const F = frame(p.phi); const v = radec(F, p.ra, p.dec, p.lst); const H = (((p.lst - p.ra) % 24) + 24) % 24; return { v: v, alt: altOf(v), H: H, raDeg: p.ra * 15 }; },
    drawCustom(ctx, W, H, p, d, c) {
      const F = frame(p.phi); const C = sphereCam(W, H, p);
      sphereBase(ctx, C, F, c);
      const g = radec(F, 0, 0, p.lst); dot3(ctx, C, g, c.c2, 5, 'γ');
      // دائرة الساعة للنجم
      const foot = radec(F, p.ra, 0, p.lst); curve(ctx, C, great(F.P, foot), c.c5, 1.6);
      // قوس الميل
      const da = []; for (let i = 0; i <= 30; i++) da.push(radec(F, p.ra, p.dec * i / 30, p.lst)); curve(ctx, C, da, c.c2, 4);
      // قوس المطلع المستقيم (شرقاً من γ)
      const ra = []; for (let i = 0; i <= 40; i++) ra.push(radec(F, p.ra * i / 40, 0, p.lst)); curve(ctx, C, ra, c.c4, 4);
      const pm = C.P(ra[20]); D.txt(ctx, 'α = ' + p.ra + ' h', pm.x, pm.y + 16, { color: c.c4, size: 13, w: '700', halo: c.bg });
      const pd = C.P(da[15]); D.txt(ctx, 'δ = ' + p.dec + '°', pd.x + 10, pd.y, { color: c.c2, size: 13, w: '700', align: 'left', halo: c.bg });
      dot3(ctx, C, d.v, '#f59e0b', 7, '★ النجم', c.text);
      D.txt(ctx, d.alt >= 0 ? 'النجم فوق الأفق (ارتفاعه ' + f2(d.alt, 1) + '°)' : 'النجم تحت الأفق الآن', W / 2, 18, { color: d.alt >= 0 ? c.c3 : c.c2, size: 14, w: '700' });
    },
    graph(p, d) {
      const F = frame(p.phi); const f = (t) => altOf(radec(F, p.ra, p.dec, t));
      return { view: { xmin: 0, xmax: 24, ymin: -90, ymax: 90 }, xLabel: 'LST (h)', yLabel: 'الارتفاع (°)', caption: 'ارتفاع النجم فوق الأفق خلال دورة كاملة للكرة السماوية (24 ساعة). أعلى ارتفاع عند عبوره دائرة الزوال (LST = α)؛ الجزء تحت الصفر: النجم تحت الأفق.', draw(G) { const c = G.colors(); G.hline(0, { color: '#16a34a', width: 2 }); G.fn(f, { color: c.c4, width: 3, domain: [0, 24] }); G.point(p.lst, d.alt, { color: c.c2 }); } };
    },
    live(p, d) { return '\\alpha = ' + p.ra + '\\ \\mathrm{h} = ' + f2(d.raDeg) + '^\\circ,\\quad \\delta = ' + p.dec + '^\\circ,\\quad H = \\text{LST} - \\alpha = ' + f2(d.H) + '\\ \\mathrm{h}'; },
    results(p, d) { return [['المطلع المستقيم', p.ra + '\\ \\mathrm{h} = ' + f2(d.raDeg) + '^\\circ'], ['الميل الاستوائي', p.dec + '^\\circ' + (p.dec >= 0 ? '\\ (\\text{شمال})' : '\\ (\\text{جنوب})')], ['زاوية الساعة الآن', f2(d.H) + '\\ \\mathrm{h}'], ['الارتفاع فوق الأفق (من الشكل)', f2(d.alt, 1) + '^\\circ', true, d.alt >= 0 ? 'pos' : 'neg']]; },
    steps(p, d) { return ['حوّل المطلع المستقيم إلى درجات: $' + p.ra + ' \\times 15 = ' + f2(d.raDeg) + '°$ شرق نقطة الاعتدال الربيعي.', 'الميل الاستوائي $' + p.dec + '°$ ' + (p.dec >= 0 ? 'شمال' : 'جنوب') + ' دائرة الاستواء السماوي.']; },
    explain(a, b, da, db) {
      if (a.lst !== b.lst) return ['دارت الكرة السماوية: تغيّر موقع النجم بالنسبة للأفق (ارتفاعه ' + f2(db.alt, 1) + '°) **لكن إحداثياه الاستوائيان لم يتغيرا** لأنهما مقيسان على الكرة السماوية نفسها التي تدور معه.'];
      if (a.ra !== b.ra) return ['تغيّر المطلع المستقيم إلى ' + b.ra + ' h: تحركت دائرة الساعة للنجم شرقاً من نقطة الاعتدال الربيعي بمقدار ' + f2(b.ra * 15) + '°.'];
      if (a.dec !== b.dec) return ['تغيّر الميل الاستوائي إلى ' + b.dec + '°: تحرك النجم على دائرة ساعته ' + (b.dec >= 0 ? 'شمال' : 'جنوب') + ' الاستواء السماوي.'];
      return [];
    },
    learn: ['**الميل الاستوائي (ص 135):** البعد الزاوي للجرم عن دائرة استواء السماء شمالاً (+) أو جنوباً (−)، ويقاس بالدرجات. الميل الاستوائي لسمت رأس الراصد يساوي دائرة عرضه.', '**دائرة الساعة (ص 135):** الدائرة العظمى التي تصل الجرم بالقطبين السماويين، وهي عمودية على الاستواء السماوي.', '**المطلع المستقيم (ص 135–136):** البعد الزاوي بين نقطة تقاطع دائرة ساعة الجرم مع الاستواء السماوي ونقطة الاعتدال الربيعي، ويزداد شرقاً، ويقاس بالساعات (الساعة = 15°).'],
    challenges: [
      { q: 'ضع نجماً على دائرة الاستواء السماوي تماماً عند نقطة الاعتدال الربيعي.', hint: '$\\alpha = 0$ و $\\delta = 0$.', init: { ra: 6, dec: 30 }, check: (p) => (p.ra === 0 || p.ra === 24) && p.dec === 0 },
      { q: 'ضع نجماً في سمت رأس راصد في فلسطين ($\\varphi = 31.5°$).', hint: 'ميله يساوي دائرة العرض ($\\delta = 31.5$ تقريباً → 31 أو 32)، ومطلعه المستقيم = LST.', init: { ra: 0, dec: 0, phi: 31.5, lst: 5 }, check: (p, d) => d.alt > 88.5, why: (p, d) => 'ارتفاعه ' + f2(d.alt, 1) + '°.' },
      { q: 'حوّل: نجم مطلعه المستقيم 90°. اضبط α بالساعات.', hint: '$90 / 15 = 6$ h.', init: { ra: 0 }, check: (p) => p.ra === 6 }
    ],
    tutor: [
      { q: 'لماذا يقاس المطلع المستقيم بالساعات؟', k: ['بالساعات', 'ساعات', 'المطلع'], a: (p, d) => 'لأن الكرة السماوية تدور ظاهرياً 360° في 24 ساعة، فكل ساعة تقابل 15°. المطلع المستقيم الحالي ' + p.ra + ' h = ' + f2(d.raDeg) + '°.' },
      { q: 'هل يتغير الميل الاستوائي مع دوران السماء؟', k: ['يتغير', 'دوران'], a: () => 'لا. الميل والمطلع المستقيم ثابتان للنجم لأنهما مقيسان على الكرة السماوية التي تدور معه؛ الذي يتغير هو ارتفاعه فوق الأفق.' }
    ]
  });

  /* ======================= 1-5 حركة الشمس الفصلية والفصول ======================= */
  const MONTHS = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'];
  const DAYS_IN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function dateOf(n) { let d = Math.floor(n); for (let i = 0; i < 12; i++) { if (d < DAYS_IN[i]) return (d + 1) + ' ' + MONTHS[i]; d -= DAYS_IN[i]; } return '31 كانون الأول'; }
  // الطول البروجي للشمس: تقطع ≈ 1° يومياً (ص 134)، والاعتدال الربيعي ≈ 21 آذار (اليوم 79)
  const sunLam = (n) => ((n - 79) * 360 / 365.25 + 360) % 360;
  const sunDec = (n) => Math.asin(Math.sin(EPS * R) * Math.sin(sunLam(n) * R)) / R;
  ML.register({
    subject: S, id: 'seasons', unit: U, order: 3, lesson: '1-5', lessonTitle: 'الظواهر الفلكية: حركة الشمس والفصول', page: 137,
    titleAr: 'حركة الشمس الظاهرية والفصول الأربعة', titleEn: "Sun's Apparent Motion & the Seasons", tags: 'فصول اربعه ميلان محور الارض 23.5 انقلاب صيفي شتوي اعتدال ربيعي خريفي دائره البروج ارتفاع الشمس',
    formula: '\\sin\\delta_\\odot = \\sin 23.5^\\circ\\,\\sin\\lambda_\\odot, \\qquad h_{noon} = 90^\\circ - |\\varphi - \\delta_\\odot|',
    book: 'سبب الفصول ميلان محور الأرض؛ في الصيف يميل النصف الشمالي نحو الشمس فتبدو في أعلى أوضاعها، وفي الشتاء في أدناها، وفي الاعتدالين بينهما (ص 137–138) ؛ تقطع الشمس على دائرة البروج ≈ 1° يومياً (ص 134)',
    summary: 'تدور الأرض حول الشمس ومحورها مائل بزاوية ثابتة 23.5° عن العمودي على مستوى مدارها. لذلك يميل نصف الكرة الشمالي نحو الشمس صيفاً فتكون الشمس أعلى في السماء والنهار أطول، ويميل بعيداً عنها شتاءً. السبب هو الميلان وليس تغيّر البعد عن الشمس.',
    vars: [['n', 'رقم اليوم في السنة', '\\text{day}', '0 – 365'], ['\\varphi', 'دائرة عرض الراصد', '^\\circ', '−66 – 66'], ['\\lambda_\\odot', 'موقع الشمس على دائرة البروج', '^\\circ', 'من الاعتدال الربيعي'], ['\\delta_\\odot', 'الميل الاستوائي للشمس', '^\\circ', '−23.5 – +23.5'], ['h_{noon}', 'ارتفاع الشمس وقت الزوال', '^\\circ', 'يُحسب']],
    assumptions: ['حركة الشمس على دائرة البروج منتظمة تقريباً (≈ 1° يومياً)، والاعتدال الربيعي في 21 آذار تقريباً.', 'ارتفاع الشمس وقت الزوال $h = 90° - |\\varphi - \\delta|$ (الشمس على دائرة الزوال)، لراصد بين الدائرتين القطبيتين.', 'المدار مرسوم دائرياً ومقاييس الأحجام غير حقيقية.'],
    params: [
      { key: 'day', label: 'n\\ (\\text{day})', min: 0, max: 365, step: 1, value: 172, desc: 'اليوم من السنة' },
      { key: 'phi', label: '\\varphi\\ (^\\circ)', min: -66, max: 66, step: 0.5, value: 31.5 }
    ],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0 }),
    tick(st, p, d, dt) { st.t += dt; p.day = (p.day + 30 * dt) % 365; },
    custom: true, canvasHint: 'يسار: الأرض حول الشمس (المحور ثابت الاتجاه). يمين: ارتفاع الشمس وقت الزوال لراصد عند دائرة العرض المختارة.',
    graphModes: ['ميل الشمس على مدار السنة', 'ارتفاع الشمس وقت الزوال'],
    compute(p) {
      const lam = sunLam(p.day), dec = sunDec(p.day); const h = 90 - Math.abs(p.phi - dec);
      const season = p.phi >= 0 ? (lam < 90 ? 'الربيع' : lam < 180 ? 'الصيف' : lam < 270 ? 'الخريف' : 'الشتاء') : (lam < 90 ? 'الخريف' : lam < 180 ? 'الشتاء' : lam < 270 ? 'الربيع' : 'الصيف');
      return { lam: lam, dec: dec, h: h, season: season };
    },
    drawCustom(ctx, W, H, p, d, c) {
      // المدار (منظر مائل)
      const ox = W * 0.32, oy = H * 0.55, a = Math.min(W * 0.27, 230), b = a * 0.42;
      ctx.strokeStyle = c.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(ox, oy, a, b, 0, 0, 7); ctx.stroke();
      ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(ox, oy, 20, 0, 7); ctx.fill(); D.txt(ctx, 'الشمس', ox, oy + 32, { color: c.text, size: 12 });
      [[0, 'اعتدال ربيعي'], [90, 'انقلاب صيفي'], [180, 'اعتدال خريفي'], [270, 'انقلاب شتوي']].forEach((m) => { const t = (m[0] + 90) * R; const x = ox + a * Math.cos(t), y = oy + b * Math.sin(t); ctx.fillStyle = c.muted; ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill(); D.txt(ctx, m[1], x, y + (Math.sin(t) >= 0 ? 16 : -14), { color: c.muted, size: 10 }); });
      // الأرض: موقعها مقابل موقع الشمس الظاهري
      const t = (d.lam + 90) * R; const ex = ox + a * Math.cos(t), ey = oy + b * Math.sin(t);
      ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.arc(ex, ey, 14, 0, 7); ctx.fill();
      // الجهة المضيئة
      const toS = Math.atan2(oy - ey, ox - ex); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.arc(ex, ey, 14, toS + Math.PI / 2, toS + 3 * Math.PI / 2); ctx.fill();
      // المحور مائل 23.5° نحو جهة ثابتة في الفضاء (نحو الشمس عند الانقلاب الصيفي)
      const ax = Math.sin(EPS * R) * 30, ay = Math.cos(EPS * R) * 30; ctx.strokeStyle = c.c2; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(ex + ax, ey - ay); ctx.lineTo(ex - ax, ey + ay); ctx.stroke(); D.txt(ctx, 'N', ex + ax + 6, ey - ay - 6, { color: c.c2, size: 11, w: '700' });
      D.txt(ctx, dateOf(p.day) + ' — ' + d.season + ' (للنصف ' + (p.phi >= 0 ? 'الشمالي' : 'الجنوبي') + ')', W * 0.32, 20, { color: c.text, size: 14, w: '700' });
      // مقطع الراصد: ارتفاع الشمس وقت الزوال
      const gx = W * 0.8, gy = H * 0.78, L = Math.min(W * 0.17, 140);
      ctx.strokeStyle = '#16a34a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(gx - L, gy); ctx.lineTo(gx + L, gy); ctx.stroke();
      D.txt(ctx, 'ج', gx - L - 10, gy, { color: '#16a34a', size: 12, w: '700' }); D.txt(ctx, 'ش', gx + L + 10, gy, { color: '#16a34a', size: 12, w: '700' });
      ctx.fillStyle = c.text; ctx.fillRect(gx - 2, gy - 26, 4, 26);
      const hh = d.h * R; const sx = gx - L * Math.cos(hh), sy = gy - L * Math.sin(hh);
      ctx.strokeStyle = '#facc15'; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(sx, sy); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(sx, sy, 10, 0, 7); ctx.fill();
      // الظل
      if (d.h > 3) { const sh = Math.min(L, 26 / Math.tan(hh)); ctx.fillStyle = c.muted; ctx.fillRect(gx, gy - 3, sh, 3); }
      ctx.strokeStyle = c.c5; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(gx, gy, 40, Math.PI, Math.PI + hh); ctx.stroke();
      D.txt(ctx, 'h = ' + f2(d.h, 1) + '°', gx - 60, gy - 20, { color: c.c5, size: 13, w: '700', align: 'right' });
    },
    graph(p, d, gi) {
      if (gi === 1) return { view: { xmin: 0, xmax: 365, ymin: 0, ymax: 90 }, xLabel: 'n (day)', yLabel: 'h_noon (°)', caption: 'ارتفاع الشمس وقت الزوال عند دائرة عرض ' + p.phi + '°: $h = 90 - |\\varphi - \\delta|$؛ لراصد شمال المدار يكون أعلاه في الانقلاب الصيفي وأدناه في الانقلاب الشتوي، والفرق بينهما 47° (ضعف 23.5°).', draw(G) { const c = G.colors(); G.fn((n) => 90 - Math.abs(p.phi - sunDec(n)), { color: '#f59e0b', width: 3, domain: [0, 365] }); G.point(p.day, d.h, { color: c.c2 }); } };
      return { view: { xmin: 0, xmax: 365, ymin: -30, ymax: 30 }, xLabel: 'n (day)', yLabel: 'δ☉ (°)', caption: 'الميل الاستوائي للشمس يتأرجح بين +23.5° (الانقلاب الصيفي ≈ 21 حزيران) و −23.5° (الانقلاب الشتوي ≈ 21 كانون الأول)، ويساوي صفراً في الاعتدالين.', draw(G) { const c = G.colors(); G.hline(EPS, { color: c.muted, dash: [5, 5] }); G.hline(-EPS, { color: c.muted, dash: [5, 5] }); G.fn(sunDec, { color: c.c2, width: 3, domain: [0, 365] }); G.point(p.day, d.dec, { color: c.c1 }); } };
    },
    live(p, d) { return '\\delta_\\odot = ' + f2(d.dec, 2) + '^\\circ,\\quad h_{noon} = 90^\\circ - |' + p.phi + '^\\circ - (' + f2(d.dec, 2) + '^\\circ)| = ' + f2(d.h, 2) + '^\\circ'; },
    results(p, d) { return [['التاريخ (تقريبي)', dateOf(p.day), false], ['الفصل', d.season, false, 'pos'], ['موقع الشمس على دائرة البروج', f2(d.lam, 1) + '^\\circ'], ['الميل الاستوائي للشمس', f2(d.dec, 2) + '^\\circ'], ['ارتفاع الشمس وقت الزوال', f2(d.h, 2) + '^\\circ', true, 'pos']]; },
    steps(p, d) { return ['موقع الشمس على دائرة البروج: $\\lambda \\approx (n - 79) \\times 360/365.25 = ' + f2(d.lam, 1) + '°$.', '$\\sin\\delta = \\sin 23.5° \\sin\\lambda$ ← $\\delta = ' + f2(d.dec, 2) + '°$.', '$h = 90° - |\\varphi - \\delta| = ' + f2(d.h, 2) + '°$.']; },
    explain(a, b, da, db) {
      if (a.day !== b.day) return ['تحركت الأرض في مدارها إلى ' + dateOf(b.day) + ': الميل الاستوائي للشمس ' + f2(db.dec, 1) + '° فصار ارتفاعها وقت الزوال ' + f2(db.h, 1) + '°. **لماذا؟** محور الأرض يبقى مائلاً بالاتجاه نفسه في الفضاء، فيميل النصف الشمالي نحو الشمس في جزء من المدار وبعيداً عنها في الجزء المقابل.'];
      if (a.phi !== b.phi) return ['غيّرت دائرة العرض إلى ' + b.phi + '°: صار ارتفاع الشمس وقت الزوال ' + f2(db.h, 1) + '°. كلما ابتعد الراصد عن دائرة العرض التي تكون الشمس في سمت رأسها انخفضت الشمس.'];
      return [];
    },
    learn: ['**الفصول (ص 137):** سببها ميلان محور الأرض؛ في الصيف يميل نصف الكرة الشمالي نحو الشمس، وفي الشتاء بعيداً عنها.', '**موقع الشروق (ص 138):** في الصيف تشرق الشمس من الشمال الشرقي وتغرب في الشمال الغربي، وفي الشتاء من الجنوب الشرقي، وفي الاعتدالين من الشرق الجغرافي.', '**دائرة البروج (ص 134):** تقطع الأرض ≈ 1° يومياً حول الشمس (360° في 365.25 يوماً).', '**الظل (ص 139):** يكون أقصر ما يمكن وقت الزوال ومتجهاً نحو الشمال في المناطق المعتدلة.'],
    challenges: [
      { q: 'اجعل الشمس في أعلى ارتفاع لها وقت الزوال في فلسطين (الانقلاب الصيفي).', hint: '≈ 21 حزيران (اليوم 171–172).', init: { day: 0, phi: 31.5 }, check: (p, d) => p.phi === 31.5 && d.dec > 23.45, why: (p, d) => 'ارتفاع الشمس ' + f2(d.h, 1) + '° ≈ 90 − 31.5 + 23.5 = 82°.' },
      { q: 'اختر يوماً يكون فيه الليل مساوياً للنهار (اعتدال).', hint: 'ميل الشمس صفر: ≈ 21 آذار أو 23 أيلول.', init: { day: 0 }, check: (p, d) => Math.abs(d.dec) < 0.45 },
      { q: 'جد دائرة العرض التي تكون فيها الشمس في سمت الرأس وقت الزوال في الانقلاب الصيفي.', hint: '$\\varphi = \\delta = 23.5°$ (مدار السرطان).', init: { day: 172, phi: 0 }, check: (p, d) => d.dec > 23.4 && d.h > 89.4 }
    ],
    tutor: [
      { q: 'هل سبب الصيف قرب الأرض من الشمس؟', k: ['قرب', 'البعد', 'سبب'], a: () => 'لا. السبب ميلان محور الأرض 23.5°: صيفاً تسقط أشعة الشمس على نصفنا الشمالي بزاوية أقرب للعمودية ويطول النهار. ولو كان السبب البعد لحدث الصيف في النصفين معاً.' },
      { q: 'كم ارتفاع الشمس اليوم وقت الظهر؟', k: ['ارتفاع', 'الظهر', 'الزوال'], a: (p, d) => 'في ' + dateOf(p.day) + ' وعند دائرة عرض ' + p.phi + '°: $h = 90 - |' + p.phi + ' - (' + f2(d.dec, 1) + ')| = ' + f2(d.h, 1) + '°$.' }
    ]
  });

  /* ======================= 1-5 أطوار القمر والخسوف والكسوف ======================= */
  const SYN = 29.5; const INC = 5.1; // الشهر القمري الاقتراني (≈ 4 أسابيع — ص 140)، ميل مدار القمر
  const PHASES = ['محاق', 'هلال أول', 'تربيع أول', 'أحدب أول', 'بدر', 'أحدب ثانٍ', 'تربيع ثانٍ', 'هلال ثانٍ'];
  function phaseName(age) { const i = Math.floor(((age / SYN) * 8 + 0.5)) % 8; return PHASES[i]; }
  ML.register({
    subject: S, id: 'moon-phases', unit: U, order: 4, lesson: '1-5', lessonTitle: 'الظواهر الفلكية: حركة القمر والخسوف والكسوف', page: 140,
    titleAr: 'أطوار القمر وخسوف القمر وكسوف الشمس', titleEn: 'Moon Phases, Lunar & Solar Eclipses', tags: 'قمر اطوار محاق هلال تربيع احدب بدر خسوف كسوف ظل شبه ظل حلقي',
    formula: 'k = \\frac{1 - \\cos\\theta}{2},\\qquad \\theta = 360^\\circ \\times \\frac{t}{29.5\\ \\text{day}}',
    book: 'أطوار القمر الثمانية (ص 140) ؛ الخسوف عندما تقع الأرض بين الشمس والقمر على استقامة واحدة ويكون القمر بدراً (ص 142) ؛ الكسوف عندما يقع القمر بين الشمس والأرض في بداية أو نهاية الشهر القمري (ص 143)',
    summary: 'تضيء الشمس دائماً نصف سطح القمر، لكننا نرى من الأرض أجزاء مختلفة من هذا النصف المضيء أثناء دوران القمر حول الأرض، فتظهر الأطوار. ولا يحدث الخسوف في كل بدر ولا الكسوف في كل محاق لأن مدار القمر مائل قليلاً عن مستوى مدار الأرض.',
    vars: [['t', 'عمر القمر منذ المحاق', '\\text{day}', '0 – 29.5'], ['\\theta', 'زاوية القمر من اتجاه الشمس (الاستطالة)', '^\\circ', '0 – 360'], ['k', 'نسبة الجزء المضيء الذي نراه', '—', '0 – 1'], ['\\Omega', 'موقع خط تقاطع مدار القمر مع مستوى مدار الأرض', '^\\circ', '0 – 360']],
    assumptions: ['مدار القمر دائري ويميل ≈ 5° عن مستوى مدار الأرض (لهذا لا يحدث الخسوف كل شهر).', 'حدود أنواع الخسوف والكسوف تقريبية: نصف قطر ظل الأرض عند القمر ≈ 0.7° وشبه الظل ≈ 1.25° ونصف قطر القمر ≈ 0.26°.', 'الأحجام والأبعاد في الرسم ليست بمقياس حقيقي.'],
    params: [
      { key: 'age', label: 't\\ (\\text{day})', min: 0, max: 29.5, step: 0.1, value: 7.4 },
      { key: 'node', label: '\\Omega\\ (^\\circ)', min: 0, max: 360, step: 1, value: 0, desc: 'اتجاه العقدة (0: تقاطع على خط الشمس)' },
      { key: 'far', label: '\\text{distance}', type: 'toggle', value: false, on: 'القمر في أبعد موقع', off: 'القمر في أقرب موقع' }
    ],
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0 }),
    tick(st, p, d, dt) { st.t += dt; p.age = (p.age + 3 * dt) % SYN; },
    custom: true, canvasHint: 'يسار: منظر من فوق (الشمس من اليمين). يمين: شكل القمر كما يُرى من الأرض.',
    graphModes: ['الجزء المضيء – عمر القمر', 'بعد القمر عن مستوى البروج'],
    compute(p) {
      const th = 360 * p.age / SYN; const k = (1 - Math.cos(th * R)) / 2; const beta = INC * Math.sin((th - p.node) * R);
      const nearFull = Math.abs(th - 180) < 6, nearNew = th < 6 || th > 354; const b = Math.abs(beta);
      let ecl = 'لا يوجد';
      if (nearFull) ecl = b + 0.26 < 0.7 ? 'خسوف كلي للقمر' : b - 0.26 < 0.7 ? 'خسوف جزئي للقمر' : b - 0.26 < 1.25 ? 'خسوف شبه الظل' : 'لا خسوف (القمر فوق أو تحت ظل الأرض)';
      if (nearNew) ecl = b < 0.55 ? (p.far ? 'كسوف حلقي للشمس' : 'كسوف كلي للشمس') + ' (في منطقة ضيقة من الأرض)' : b < 1.5 ? 'كسوف جزئي للشمس' : 'لا كسوف (ظل القمر لا يصيب الأرض)';
      return { th: th, k: k, beta: beta, phase: phaseName(p.age), ecl: ecl, near: nearFull || nearNew };
    },
    drawCustom(ctx, W, H, p, d, c) {
      const ox = W * 0.3, oy = H * 0.52, r = Math.min(W * 0.22, H * 0.36);
      // أشعة الشمس من اليمين
      for (let i = -3; i <= 3; i++) D.arrow(ctx, W * 0.58, oy + i * 26, W * 0.53, oy + i * 26, '#facc15', 2);
      D.txt(ctx, 'ضوء الشمس', W * 0.56, oy - 100, { color: '#ca8a04', size: 12, w: '700' });
      ctx.strokeStyle = c.muted; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(ox, oy, r, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      // ظل الأرض
      ctx.fillStyle = 'rgba(15,23,42,0.18)'; ctx.fillRect(ox - r - 30, oy - 12, r + 30, 24);
      ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.arc(ox, oy, 16, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.arc(ox, oy, 16, Math.PI / 2, 3 * Math.PI / 2); ctx.fill();
      // القمر: الزاوية تُقاس من اتجاه الشمس عكس عقارب الساعة
      const a = d.th * R; const mx = ox + r * Math.cos(a), my = oy - r * Math.sin(a);
      ctx.fillStyle = '#e5e7eb'; ctx.beginPath(); ctx.arc(mx, my, 11, 0, 7); ctx.fill(); ctx.fillStyle = '#334155'; ctx.beginPath(); ctx.arc(mx, my, 11, Math.PI / 2, 3 * Math.PI / 2); ctx.fill();
      ctx.strokeStyle = c.axis; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(mx, my, 11, 0, 7); ctx.stroke();
      // خط العقد
      const n = p.node * R; ctx.strokeStyle = c.c5; ctx.setLineDash([2, 5]); ctx.beginPath(); ctx.moveTo(ox - (r + 20) * Math.cos(n), oy + (r + 20) * Math.sin(n)); ctx.lineTo(ox + (r + 20) * Math.cos(n), oy - (r + 20) * Math.sin(n)); ctx.stroke(); ctx.setLineDash([]);
      // القمر كما يُرى من الأرض
      const vx = W * 0.8, vy = H * 0.45, R0 = Math.min(W * 0.12, H * 0.25);
      ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(vx, vy, R0 + 8, 0, 7); ctx.fill();
      ctx.fillStyle = '#334155'; ctx.beginPath(); ctx.arc(vx, vy, R0, 0, 7); ctx.fill();
      // الجزء المضيء: نصف دائرة + نصف قطع ناقص (المتزايد مضاء من اليمين كما يُرى من نصف الكرة الشمالي)
      const waxing = d.th <= 180; const ex = R0 * Math.cos(d.th * R);
      ctx.fillStyle = d.ecl.indexOf('خسوف كلي') >= 0 ? '#b45309' : '#f8fafc';
      ctx.beginPath();
      if (waxing) { ctx.arc(vx, vy, R0, -Math.PI / 2, Math.PI / 2); ctx.ellipse(vx, vy, Math.abs(ex), R0, 0, Math.PI / 2, -Math.PI / 2, ex > 0); }
      else { ctx.arc(vx, vy, R0, Math.PI / 2, 3 * Math.PI / 2); ctx.ellipse(vx, vy, Math.abs(ex), R0, 0, -Math.PI / 2, Math.PI / 2, ex > 0); }
      ctx.fill();
      D.txt(ctx, d.phase, vx, vy + R0 + 26, { color: c.text, size: 16, w: '700' });
      D.txt(ctx, 'الجزء المضيء ' + f2(d.k * 100, 0) + '%', vx, vy + R0 + 48, { color: c.muted, size: 12 });
      D.txt(ctx, 'اليوم ' + f2(p.age, 1) + ' من الشهر القمري', W * 0.3, 20, { color: c.text, size: 14, w: '700' });
      if (d.near) D.txt(ctx, d.ecl, W / 2, H - 14, { color: d.ecl.indexOf('لا ') === 0 ? c.muted : c.c2, size: 14, w: '700' });
    },
    graph(p, d, gi) {
      if (gi === 1) return { view: { xmin: 0, xmax: SYN, ymin: -6, ymax: 6 }, xLabel: 't (day)', yLabel: 'β (°)', caption: 'بعد القمر شمال أو جنوب مستوى مدار الأرض. يحدث الخسوف (عند البدر، t ≈ 14.75) أو الكسوف (عند المحاق، t ≈ 0) فقط إذا كان القمر قريباً من هذا المستوى (المنطقة المظللة).', draw(G) { const c = G.colors(); G.shade(() => 1, 0, SYN, { color: c.c3, alpha: 0.12 }, () => -1); G.fn((t) => INC * Math.sin((360 * t / SYN - p.node) * R), { color: c.c5, width: 3, domain: [0, SYN] }); G.vline(SYN / 2, { color: c.muted, dash: [4, 4] }); G.point(p.age, d.beta, { color: c.c2 }); } };
      return { view: { xmin: 0, xmax: SYN, ymin: 0, ymax: 1.05 }, xLabel: 't (day)', yLabel: 'k', caption: 'نسبة الجزء المضيء الذي نراه: صفر في المحاق، نصف في التربيعين، واحد في البدر — دورة كل ≈ 29.5 يوماً.', draw(G) { const c = G.colors(); G.fn((t) => (1 - Math.cos(2 * Math.PI * t / SYN)) / 2, { color: '#f59e0b', width: 3, domain: [0, SYN] }); G.point(p.age, d.k, { color: c.c2, label: d.phase }); } };
    },
    live(p, d) { return '\\theta = ' + f2(d.th, 1) + '^\\circ,\\quad k = \\frac{1 - \\cos\\theta}{2} = ' + f2(d.k, 3); },
    results(p, d) { return [['الطور', d.phase, false, 'pos'], ['الزاوية بين القمر والشمس (من الأرض)', f2(d.th, 1) + '^\\circ'], ['نسبة الجزء المضيء المرئي', f2(d.k * 100, 1) + '\\%'], ['بعد القمر عن مستوى مدار الأرض', f2(d.beta, 2) + '^\\circ'], ['الظاهرة', d.near ? d.ecl : 'القمر ليس بدراً ولا محاقاً', false]]; },
    steps(p, d) { return ['$\\theta = 360° \\times ' + p.age + ' / 29.5 = ' + f2(d.th, 1) + '°$.', 'الجزء المضيء المرئي $k = (1 - \\cos\\theta)/2 = ' + f2(d.k, 3) + '$.', 'شرط الخسوف/الكسوف: القمر بدر/محاق **و** قريب من مستوى مدار الأرض ($|\\beta|$ صغيرة).']; },
    explain(a, b, da, db) {
      if (a.age !== b.age) return ['تحرك القمر في مداره إلى زاوية ' + f2(db.th, 0) + '° من اتجاه الشمس، فصار الطور **' + db.phase + '**. **لماذا؟** النصف المواجه للشمس مضيء دائماً، لكن ما نراه منه يتغير بحسب موقع القمر.'];
      if (a.node !== b.node) return ['غيّرت اتجاه خط العقد: عندما يمر خط العقد قرب خط الشمس–الأرض يكون القمر في البدر أو المحاق قريباً من مستوى مدار الأرض فيمكن حدوث خسوف أو كسوف (موسم الكسوف).'];
      if (a.far !== b.far) return [b.far ? 'القمر في أبعد موقع: قرصه الظاهري أصغر من قرص الشمس، فلا يحجبها كلها ← كسوف حلقي.' : 'القمر في أقرب موقع: يصل مخروط ظله إلى الأرض ← كسوف كلي ممكن.'];
      return [];
    },
    learn: ['**أطوار القمر (ص 140):** محاق ← هلال أول ← تربيع أول ← أحدب أول ← بدر ← أحدب ثانٍ ← تربيع ثانٍ ← هلال ثانٍ، في دورة ≈ 4 أسابيع.', '**دوران القمر حول نفسه (ص 141):** يساوي زمن دورانه حول الأرض، لذلك نرى وجهاً واحداً فقط منه.', '**خسوف القمر (ص 142):** تقع الأرض بين الشمس والقمر على استقامة واحدة، ويكون القمر بدراً. أنواعه: كلي (القمر كله في الظل، ويظهر بلون نحاسي محمر)، جزئي، وشبه الظل.', '**كسوف الشمس (ص 143–144):** يقع القمر بين الشمس والأرض (محاق). أنواعه: كلي، جزئي، وحلقي عندما يكون القمر بعيداً فلا يغطي قرص الشمس كله.'],
    challenges: [
      { q: 'اجعل القمر بدراً.', hint: '$t \\approx 14.75$ يوماً.', init: { age: 3 }, check: (p, d) => d.phase === 'بدر' },
      { q: 'أحدث خسوفاً كلياً للقمر.', hint: 'اجعل القمر بدراً ($t = 14.75$) ووجّه خط العقد نحو الشمس ($\\Omega = 0$ أو 180).', init: { age: 7, node: 90 }, check: (p, d) => d.ecl === 'خسوف كلي للقمر' },
      { q: 'أحدث كسوفاً حلقياً للشمس.', hint: 'محاق ($t = 0$)، $\\Omega = 0$، والقمر في أبعد موقع.', init: { age: 10, node: 90, far: false }, check: (p, d) => d.ecl.indexOf('كسوف حلقي') === 0 },
      { q: 'اجعل القمر بدراً دون أن يحدث خسوف (لماذا لا يحدث الخسوف كل شهر؟).', hint: 'بدر مع $\\Omega = 90$.', init: { age: 3, node: 0 }, check: (p, d) => d.phase === 'بدر' && d.ecl.indexOf('لا خسوف') === 0 }
    ],
    tutor: [
      { q: 'لماذا لا يحدث الخسوف كل شهر؟', k: ['كل شهر', 'لا يحدث', 'لماذا'], a: (p, d) => 'لأن مدار القمر يميل ≈ 5° عن مستوى مدار الأرض، ففي معظم الأشهر يمر القمر البدر فوق ظل الأرض أو تحته. الآن بعده عن المستوى $' + f2(d.beta, 2) + '°$.' },
      { q: 'لماذا يظهر القمر محمراً في الخسوف الكلي؟', k: ['محمر', 'نحاسي', 'احمر'], a: () => 'لأن الغلاف الجوي للأرض يكسر جزءاً من ضوء الشمس (خاصة الأحمر) نحو منطقة الظل فيصل إلى القمر، فلا يختفي تماماً بل يظهر بلون نحاسي محمر (ص 142).' },
      { q: 'ما الطور الآن؟', k: ['الطور', 'شكل القمر'], a: (p, d) => 'الطور: **' + d.phase + '**، ويضيء ' + f2(d.k * 100, 0) + '% من القرص المرئي (اليوم ' + p.age + ' من الشهر القمري).' }
    ]
  });

  /* ======================= 1-6 النجوم أبدية الظهور ======================= */
  ML.register({
    subject: S, id: 'circumpolar', unit: U, order: 5, lesson: '1-6', lessonTitle: 'النجوم أبدية الظهور', page: 145,
    titleAr: 'النجوم أبدية الظهور', titleEn: 'Circumpolar Stars', tags: 'نجوم ابديه الظهور القطب نجم القطب دائره عرض شروق غروب',
    formula: '\\delta > 90^\\circ - \\varphi \\;\\Rightarrow\\; \\text{circumpolar}, \\qquad \\delta < \\varphi - 90^\\circ \\;\\Rightarrow\\; \\text{never rises}',
    book: 'النجوم التي ميلها أكبر من (90 − دائرة العرض) أبدية الظهور، وتدور حول القطب الشمالي دون أن تغيب (ص 146–147)',
    summary: 'تبدو النجوم وكأنها تدور حول محور يمر بالقطبين السماويين في دوائر موازية للاستواء السماوي. لراصد عند دائرة عرض φ شمالاً، النجوم القريبة من القطب (ميلها أكبر من 90° − φ) لا تغيب أبداً، والنجوم القريبة من القطب الجنوبي لا تشرق أبداً، والباقي يشرق ويغرب.',
    vars: [['\\varphi', 'دائرة عرض الراصد', '^\\circ', '0 – 90 (نصف الكرة الشمالي)'], ['\\delta', 'الميل الاستوائي للنجم', '^\\circ', '−90 – 90'], ['90^\\circ - \\varphi', 'الحد الأدنى لميل النجوم أبدية الظهور', '^\\circ', 'يُحسب']],
    assumptions: ['الراصد في نصف الكرة الشمالي ($\\varphi \\ge 0$) كما في مثال الكتاب.', 'بإهمال الانكسار الجوي وارتفاع الراصد عن سطح الأرض.'],
    params: [
      { key: 'phi', label: '\\varphi\\ (^\\circ)', min: 0, max: 90, step: 0.5, value: 50 },
      { key: 'dec', label: '\\delta\\ (^\\circ)', min: -90, max: 90, step: 1, value: 60, desc: 'ميل النجم المختار' },
      { key: 'lst', label: '\\text{LST}\\ (\\mathrm{h})', min: 0, max: 24, step: 0.1, value: 0 }
    ].concat(camParams),
    play: { mode: 'time', speed: 1 },
    initState: () => ({ t: 0 }),
    tick(st, p, d, dt) { st.t += dt; p.lst = (p.lst + 2 * dt) % 24; },
    custom: true, canvasHint: 'الأخضر: نجوم أبدية الظهور. البرتقالي: تشرق وتغرب. الرمادي: لا تشرق أبداً. اضغط «تشغيل» لترى دوران النجوم.',
    graphModes: ['تصنيف النجوم حسب دائرة العرض', 'ارتفاع النجم خلال اليوم'],
    compute(p) { const lim = 90 - p.phi; const cls = ML.phys.circumpolar(p.dec, p.phi) ? 'أبدي الظهور' : ML.phys.neverRises(p.dec, p.phi) ? 'لا يشرق أبداً' : 'يشرق ويغرب'; const hmax = M.clamp(90 - Math.abs(p.phi - p.dec), -90, 90), hmin = M.clamp(p.phi + p.dec - 90, -90, 90); return { lim: lim, cls: cls, hmax: hmax, hmin: hmin }; },
    drawCustom(ctx, W, H, p, d, c) {
      const F = frame(p.phi); const C = sphereCam(W, H, p);
      sphereBase(ctx, C, F, c, { equator: true });
      const P = ML.phys;
      [-60, -30, 0, 20, 40, 55, 70, 80].forEach((dec, i) => {
        const col = P.circumpolar(dec, p.phi) ? c.c3 : P.neverRises(dec, p.phi) ? c.muted : c.c4;
        curve(ctx, C, diurnal(F, dec), col, 1.3);
        dot3(ctx, C, eqv(F, (p.lst * 15 + i * 47) % 360, dec), col, 4);
      });
      const col = P.circumpolar(p.dec, p.phi) ? c.c3 : P.neverRises(p.dec, p.phi) ? c.muted : c.c4;
      curve(ctx, C, diurnal(F, p.dec), col, 3.5);
      dot3(ctx, C, eqv(F, p.lst * 15, p.dec), '#f59e0b', 7, '★ δ = ' + p.dec + '°', c.text);
      // حد النجوم أبدية الظهور (دائرة تمس الأفق شمالاً)
      if (p.phi > 0 && p.phi < 90) curve(ctx, C, diurnal(F, d.lim), c.c3, 1);
      D.txt(ctx, 'النجم المختار: ' + d.cls + ' (الحد: δ > ' + f2(d.lim, 1) + '°)', W / 2, 18, { color: col, size: 14, w: '700' });
    },
    graph(p, d, gi) {
      if (gi === 1) { const F = frame(p.phi); return { view: { xmin: 0, xmax: 24, ymin: -90, ymax: 90 }, xLabel: 'LST (h)', yLabel: 'الارتفاع (°)', caption: 'ارتفاع النجم المختار خلال 24 ساعة: أبدي الظهور إذا بقي المنحنى كله فوق خط الأفق (الصفر). أعلى ارتفاع $' + f2(d.hmax, 1) + '°$ وأدناه $' + f2(d.hmin, 1) + '°$.', draw(G) { const c = G.colors(); G.hline(0, { color: '#16a34a', width: 2 }); G.fn((t) => altOf(eqv(F, t * 15, p.dec)), { color: c.c4, width: 3, domain: [0, 24] }); G.point(p.lst, altOf(eqv(F, p.lst * 15, p.dec)), { color: c.c2 }); } }; }
      return { view: { xmin: 0, xmax: 90, ymin: -90, ymax: 90 }, xLabel: 'φ (°)', yLabel: 'δ (°)', caption: 'فوق الخط الأخضر $\\delta = 90 - \\varphi$: أبدية الظهور. تحت الخط الرمادي $\\delta = \\varphi - 90$: لا تشرق. بينهما: تشرق وتغرب. عند القطب ($\\varphi = 90$) كل النجوم الشمالية أبدية الظهور.', draw(G) { const c = G.colors(); G.shade((x) => 90, 0, 90, { color: c.c3, alpha: 0.15 }, (x) => 90 - x); G.shade((x) => x - 90, 0, 90, { color: c.muted, alpha: 0.2 }, () => -90); G.fn((x) => 90 - x, { color: c.c3, width: 3 }); G.fn((x) => x - 90, { color: c.muted, width: 3 }); G.point(p.phi, p.dec, { color: c.c2, label: d.cls }); } };
    },
    live(p, d) { return '90^\\circ - \\varphi = 90^\\circ - ' + p.phi + '^\\circ = ' + f2(d.lim) + '^\\circ;\\quad \\delta = ' + p.dec + '^\\circ ' + (p.dec > d.lim ? '>' : '\\le') + ' ' + f2(d.lim) + '^\\circ'; },
    results(p, d) { return [['حد النجوم أبدية الظهور', '\\delta > ' + f2(d.lim) + '^\\circ'], ['حد النجوم التي لا تشرق', '\\delta < ' + f2(-d.lim) + '^\\circ'], ['تصنيف النجم المختار', d.cls, false, d.cls === 'أبدي الظهور' ? 'pos' : ''], ['أعلى ارتفاع له', f2(d.hmax, 1) + '^\\circ'], ['أدنى ارتفاع له', f2(d.hmin, 1) + '^\\circ']]; },
    steps(p, d) { return ['ميل سمت رأس الراصد = دائرة العرض = ' + p.phi + '°.', 'النجوم أبدية الظهور: $\\delta > 90 - \\varphi = ' + f2(d.lim) + '°$.', 'النجم المختار $\\delta = ' + p.dec + '°$ ← **' + d.cls + '**.']; },
    explain(a, b, da, db) {
      if (a.phi !== b.phi) return ['انتقل الراصد إلى دائرة عرض ' + b.phi + '°: صار حد النجوم أبدية الظهور ' + f2(db.lim) + '°. **لماذا؟** كلما اتجه الراصد شمالاً ارتفع القطب السماوي في سمائه، فتتسع منطقة النجوم التي تدور حوله دون أن تغيب.'];
      if (a.dec !== b.dec) return ['اخترت نجماً ميله ' + b.dec + '° ← ' + db.cls + '.'];
      if (a.lst !== b.lst) return ['دارت السماء: النجوم تتحرك على دوائر موازية للاستواء السماوي حول القطب.'];
      return [];
    },
    learn: ['**النجوم أبدية الظهور (ص 146):** النجوم التي تقطع السماء دوماً دون أن تختفي تحت الأفق.', '**حركة النجوم الظاهرية (ص 146):** تبدو الأجرام وكأنها تدور حول محور يمر بالقطبين السماويين في دوائر متوازية وموازية لدائرة الاستواء السماوي؛ وتميل هذه الدوائر عن الأفق بزاوية $90 - \\varphi$.', '**مثال ص 147:** راصد عند دائرة عرض +50°: النجوم التي ميلها أكبر من 40° أبدية الظهور، والتي ميلها أقل تشرق وتغرب.', '**نجم القطب (ص 147):** قريب جداً من القطب السماوي الشمالي، فيبقى ثابتاً تقريباً ويدل على الشمال؛ وارتفاعه يساوي دائرة عرض الراصد.'],
    challenges: [
      { q: 'مثال ص 147: راصد عند دائرة عرض 50°. اختر نجماً على الحد تماماً بين أبدي الظهور والذي يشرق ويغرب.', hint: '$\\delta = 90 - 50 = 40°$.', init: { phi: 31.5, dec: 0 }, check: (p) => p.phi === 50 && p.dec === 40, why: () => 'هذا النجم يلامس الأفق الشمالي في أدنى نقطة له.' },
      { q: 'اجعل كل النجوم ذات الميل الموجب أبدية الظهور.', hint: 'الراصد عند القطب الشمالي: $\\varphi = 90$.', init: { phi: 31.5, dec: 20 }, check: (p) => p.phi === 90 },
      { q: 'راصد في فلسطين (31.5°): اختر أصغر ميل (عدد صحيح) لنجم أبدي الظهور.', hint: '$90 - 31.5 = 58.5$ ← $\\delta = 59°$.', init: { phi: 31.5, dec: 0 }, check: (p) => p.phi === 31.5 && p.dec === 59 }
    ],
    tutor: [
      { q: 'لماذا لا تغيب بعض النجوم؟', k: ['لا تغيب', 'تغيب', 'ابديه'], a: (p, d) => 'لأن دوائرها اليومية حول القطب السماوي صغيرة وتقع كلها فوق الأفق. عند دائرة عرض ' + p.phi + '° يرتفع القطب ' + p.phi + '° فوق الأفق، فكل نجم يبعد عن القطب أقل من ' + p.phi + '° (أي ميله > ' + f2(d.lim) + '°) لا يغيب.' },
      { q: 'هل يرى راصد عند خط الاستواء نجوماً أبدية الظهور؟', k: ['خط الاستواء', 'الاستواء'], a: () => 'لا. عند $\\varphi = 0$ الحد $90 - 0 = 90°$، أي لا يوجد نجم أبدي الظهور: كل النجوم تشرق وتغرب (والقطبان على الأفق).' }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
