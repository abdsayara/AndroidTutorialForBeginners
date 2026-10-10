/* النواة الفيزيائية: قوانين كتاب الفيزياء للصف العاشر كدوال نقية + أدوات وحدات SI
 * كل دالة موثقة بالدرس والصفحة في الكتاب. لا توجد قوانين من خارج الكتاب.
 */
(function (root) {
  'use strict';
  const ML = root.ML = root.ML || {};
  const P = ML.phys = {};

  /* ---------- ثوابت وجداول من الكتاب ---------- */
  P.C = {
    g: 9.8,                 // تسارع الجاذبية (ص 38) — أمثلة الكتاب تستخدم أيضاً 10
    P0: 1.013e5,            // الضغط الجوي المعياري باسكال (ص 66) = 760 ملم زئبق
    rhoWater: 1000,         // كثافة الماء كغم/م³ (ص 71)
    rhoHg: 13595,           // كثافة الزئبق كغم/م³ (ص 70)
    R: 8.314,               // الثابت العام للغازات جول/(كلفن·مول) (ص 116)
    NA: 6.02e23,            // عدد أفوجادرو (ص 111)
    cal: 4.186              // 1 سعر = 4.186 جول (ص 87)
  };
  // الحرارة النوعية جول/(كغم·°س) — الجدول (1) ص 90
  P.specificHeat = { water: 4186, ice: 2093, mercury: 138, ethanol: 2460, oliveOil: 1971, bismuth: 123, aluminium: 900, iron: 452, copper: 387, silver: 236, gold: 129, lead: 128 };
  P.materialName = { water: 'الماء', ice: 'الجليد', mercury: 'الزئبق', ethanol: 'الكحول الإيثيلي', oliveOil: 'زيت الزيتون', bismuth: 'البزموث', aluminium: 'الألمنيوم', iron: 'الحديد', copper: 'النحاس', silver: 'الفضة', gold: 'الذهب', lead: 'الرصاص', pyrex: 'زجاج البايركس', glass: 'الزجاج العادي', concrete: 'الإسمنت', brass: 'البرونز', benzene: 'البنزين', acetone: 'الأسيتون', glycerin: 'الجليسرين', turpentine: 'زيت التربنتين', gasoline: 'الجازولين (السولار)' };
  // الحرارة الكامنة للماء جول/كغم (الجدول 2 ص 96)
  P.latent = { waterFusion: 3.33e5, waterVapor: 2.26e6 };
  // معاملات التمدد الطولي ×10⁻⁶ /°س (الجدول 3 ص 100)
  P.alphaLinear = { pyrex: 3.2, glass: 9, iron: 11, concrete: 12, gold: 14, copper: 17, brass: 19, aluminium: 24, lead: 29 };
  // معاملات التمدد الحجمي للسوائل ×10⁻⁴ /°س (الجدول 4 ص 103)
  P.betaLiquid = { ethanol: 1.12, benzene: 1.24, acetone: 1.5, mercury: 1.82, oliveOil: 2.9, glycerin: 4.85, turpentine: 9, gasoline: 9.6 };

  /* ---------- البادئات (ص 7) ---------- */
  P.prefixes = [
    ['تيرا', 'T', 12], ['جيجا', 'G', 9], ['ميجا', 'M', 6], ['كيلو', 'k', 3], ['هكتو', 'h', 2], ['ديكا', 'da', 1], ['—', '', 0],
    ['ديسي', 'd', -1], ['سنتي', 'c', -2], ['ملي', 'm', -3], ['ميكرو', 'μ', -6], ['نانو', 'n', -9], ['بيكو', 'p', -12], ['فيمتو', 'f', -15]
  ];

  /* ---------- تنسيق الأرقام والوحدات ---------- */
  // تنسيق علمي مقروء: يستخدم 10^n عندما يكون العدد كبيراً/صغيراً جداً
  P.sci = function (x, sig) {
    sig = sig || 4;
    if (x === null || x === undefined || Number.isNaN(x)) return '\\text{غير معرّف}';
    if (!Number.isFinite(x)) return x > 0 ? '\\infty' : '-\\infty';
    if (x === 0 || Math.abs(x) < 1e-12) return '0';
    const a = Math.abs(x);
    if (a >= 1e-3 && a < 1e6) { let s = (+x.toPrecision(sig)).toString(); if (s === '-0') s = '0'; return s; }
    const e = Math.floor(Math.log10(a)); let m = +(x / Math.pow(10, e)).toPrecision(sig);
    if (Math.abs(m) >= 10) { m /= 10; return m + ' \\times 10^{' + (e + 1) + '}'; }
    return m + ' \\times 10^{' + e + '}';
  };
  // صيغة نصية للرسم على Canvas (بدون TeX): 6×10⁵
  const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  P.sct = function (x, sig) {
    return P.sci(x, sig).replace(/ \\times 10\^\{(-?\d+)\}/, (m, e) => '×10' + e.split('').map((ch) => SUP[ch]).join('')).replace('\\text{غير معرّف}', '—').replace('\\infty', '∞');
  };
  // كمية مع وحدة TeX
  P.q = (x, unit, sig) => P.sci(x, sig) + (unit ? '\\ \\mathrm{' + unit + '}' : '');

  /* ---------- الفصل 1: القياس ---------- */
  // الورنية (ص 7–8): القراءة = قراءة الذراع المدرج + قراءة المنزلقة
  P.vernier = function (mainMm, vernierDiv, leastCount) {
    leastCount = leastCount || 0.05;
    return mainMm + vernierDiv * leastCount;
  };
  // الميكروميتر (ص 10): القراءة = التدريج الثابت + التدريج الدائري
  P.micrometer = (sleeveMm, thimbleDiv, lc) => sleeveMm + thimbleDiv * (lc || 0.01);
  P.convertPrefix = (value, fromExp, toExp) => value * Math.pow(10, fromExp - toExp);

  /* ---------- الفصل 2: المتجهات ---------- */
  // محصلة متجهين بالمركبات (الزاوية بالدرجات من محور السينات الموجب)
  P.vecAdd = function (A, thA, B, thB) {
    const ra = thA * Math.PI / 180, rb = thB * Math.PI / 180;
    const x = A * Math.cos(ra) + B * Math.cos(rb), y = A * Math.sin(ra) + B * Math.sin(rb);
    const R = Math.hypot(x, y);
    let th = R < 1e-12 ? NaN : Math.atan2(y, x) * 180 / Math.PI; if (th < 0) th += 360;
    return { x: clean(x), y: clean(y), R: clean(R), theta: Number.isNaN(th) ? NaN : clean(th) };
  };
  // حالات الكتاب (ص 21–22): متجهان بالاتجاه نفسه، متعاكسان، متعامدان
  P.vecParallel = (A, B) => A + B;
  P.vecAntiParallel = (A, B) => Math.abs(A - B);
  P.vecPerp = (A, B) => ({ R: Math.sqrt(A * A + B * B), theta: Math.atan2(B, A) * 180 / Math.PI });

  /* ---------- الفصل 3: وصف الحركة ---------- */
  P.avgVelocity = (dx, dt) => (dt > 0 ? dx / dt : NaN);           // ع = Δف/Δز (ص 28)
  P.avgAccel = (v1, v2, dt) => (dt > 0 ? (v2 - v1) / dt : NaN);   // ت = (ع2 − ع1)/Δز (ص 30)
  // معادلات الحركة بتسارع ثابت (ص 36)
  P.v = (v0, a, t) => v0 + a * t;                                  // ع2 = ع1 + ت ز
  P.x = (v0, a, t) => v0 * t + 0.5 * a * t * t;                    // ف = ع1 ز + ½ ت ز²
  P.v2 = (v0, a, x) => v0 * v0 + 2 * a * x;                        // ع2² = ع1² + 2 ت ف
  // السقوط الحر والقذف الرأسي (ص 37–40) بإهمال مقاومة الهواء — الأعلى موجب، g موجبة المقدار
  P.vertical = function (v0, h0, g) {
    // ارتفاع الجسم: y(t) = h0 + v0 t − ½ g t²
    const tTop = v0 > 0 ? v0 / g : 0;
    const hMax = h0 + (v0 > 0 ? v0 * v0 / (2 * g) : 0);
    // زمن الوصول للأرض (y = 0): الجذر الموجب
    const disc = v0 * v0 + 2 * g * h0;
    const tGround = (v0 + Math.sqrt(Math.max(0, disc))) / g;
    const vGround = -Math.sqrt(Math.max(0, disc));
    return { tTop: tTop, hMax: hMax, tGround: tGround, vGround: vGround, y: (t) => h0 + v0 * t - 0.5 * g * t * t, vy: (t) => v0 - g * t };
  };

  /* ---------- الفصل 4: قوانين نيوتن ---------- */
  P.weight = (m, g) => m * g;                                      // و = ك × جـ (ص 46)
  P.hooke = (k, x) => -k * x;                                      // ق = −أ س (ص 46)
  P.netForce = (F, f) => F - f;                                    // محصلة قوتين متعاكستين (ص 52–53)
  P.newton2 = (Fnet, m) => (m > 0 ? Fnet / m : NaN);               // ق = ك × ت (ص 52)
  // عربة تحت قوة دفع F وقوة احتكاك f (مقدار) — الاحتكاك يعاكس الحركة ولا يحرك جسماً ساكناً
  P.cartAccel = function (F, f, m, v) {
    if (!(m > 0)) return NaN;
    const moving = Math.abs(v) > 1e-9;
    if (!moving) { if (Math.abs(F) <= f) return 0; return (F - Math.sign(F) * f) / m; }
    return (F - Math.sign(v) * f) / m;
  };
  P.centripetal = (v, r) => (r > 0 ? v * v / r : NaN);             // ت م = ع²/نق (ص 48)
  P.periodCircle = (r, v) => (v > 0 ? 2 * Math.PI * r / v : NaN);  // ن = 2π نق / ع (ص 48)

  /* ---------- الموائع ---------- */
  P.pressure = (F, A) => (A > 0 ? F / A : NaN);                    // ض = ق/أ (ص 66)
  P.liquidPressure = (rho, h, g) => rho * g * h;                   // ض س = ث ل جـ (ص 69)
  P.absPressure = (P0, rho, h, g) => P0 + rho * g * h;             // ض م = ض0 + ث ل جـ (ص 70)
  P.pascal = (F1, A1, A2) => (A1 > 0 ? F1 * A2 / A1 : NaN);        // ق1/أ1 = ق2/أ2 (ص 73)
  P.buoyancy = (rhoL, Vsub, g) => rhoL * Vsub * g;                 // ق د = ح ث جـ (ص 76)
  // جسم في سائل: يطفو إذا كثافته أقل؛ نسبة المغمور = ث ج / ث س (ص 77)
  P.floatState = function (rhoB, rhoL) {
    if (rhoB < rhoL) return { state: 'float', frac: rhoB / rhoL };
    if (rhoB === rhoL) return { state: 'suspend', frac: 1 };
    return { state: 'sink', frac: 1 };
  };

  /* ---------- الحرارة ---------- */
  P.heat = (m, c, dT) => m * c * dT;                               // كح = ك حن Δد (ص 89–90)
  P.heatCapacity = (m, c) => m * c;                                // سح = ك × حن (ص 90)
  // الاتزان الحراري لجسمين (ص 93): كح مكتسبة = كح مفقودة
  P.equilibrium = (m1, c1, T1, m2, c2, T2) => (m1 * c1 * T1 + m2 * c2 * T2) / (m1 * c1 + m2 * c2);
  P.latentHeat = (m, L) => m * L;                                  // كح = ك × ح كامنة (ص 95)
  // منحنى التسخين (ص 94–97): جليد عند Ti ≤ 0 حتى Tf ≤ 100 (+ تبخر كامل اختياري عند 100)
  // لا نسخّن البخار فوق 100°س لأن الكتاب لا يعطي الحرارة النوعية للبخار
  P.heatingCurve = function (m, Ti, Tf, boil, ci) {
    ci = ci || P.specificHeat.ice; const cw = P.specificHeat.water, Lf = P.latent.waterFusion, Lv = P.latent.waterVapor;
    const st = [];
    if (Ti < 0) st.push({ name: 'تسخين الجليد', Q: m * ci * (Math.min(Tf, 0) - Ti), T0: Ti, T1: Math.min(Tf, 0) });
    if (Tf > 0 || (Tf === 0 && boil === 'melt')) st.push({ name: 'انصهار الجليد', Q: m * Lf, T0: 0, T1: 0 });
    if (Tf > 0) st.push({ name: 'تسخين الماء', Q: m * cw * (Tf - 0), T0: 0, T1: Tf });
    if (Tf >= 100 && boil) st.push({ name: 'تبخر الماء', Q: m * Lv, T0: 100, T1: 100 });
    return { stages: st, total: st.reduce((s, x) => s + x.Q, 0) };
  };
  P.linearExpansion = (alpha, L1, dT) => alpha * L1 * dT;          // ل2 − ل1 = م د ل1 (د2 − د1) (ص 99)
  P.volumeExpansion = (beta, V1, dT) => beta * V1 * dT;            // ح2 − ح1 = مح ح1 Δد (ص 103)
  P.cToF = (c) => 9 / 5 * c + 32; P.fToC = (f) => 5 / 9 * (f - 32); P.cToK = (c) => c + 273; // ص 105 (الكتاب يستخدم 273)

  /* ---------- الغازات والديناميكا الحرارية ---------- */
  P.moles = (m, M) => (M > 0 ? m / M : NaN);                       // ن = ك / الكتلة المولية (ص 111)
  P.boyle = (P1, V1, V2) => (V2 > 0 ? P1 * V1 / V2 : NaN);         // ض1 ح1 = ض2 ح2 (ص 113)
  P.charles = (V1, T1, T2) => (T1 > 0 ? V1 * T2 / T1 : NaN);       // ح1/د1 = ح2/د2 (ص 114)
  P.gayLussac = (P1, T1, T2) => (T1 > 0 ? P1 * T2 / T1 : NaN);     // ض1/د1 = ض2/د2 (ص 116)
  P.combined = (P1, V1, T1, P2, T2) => (P2 > 0 && T1 > 0 ? P1 * V1 * T2 / (T1 * P2) : NaN); // ض1ح1/د1 = ض2ح2/د2 (ص 116)
  P.idealP = (n, T, V) => (V > 0 ? n * P.C.R * T / V : NaN);       // ض ح = ن أ د (ص 116)
  P.firstLaw = (Q, W) => Q - W;                                    // Δطد = كح − ش (ص 120)

  /* ---------- الفلك ---------- */
  // نجم أبدي الظهور لراصد على خط عرض φ (شمالاً): δ > 90° − φ (ص 145–147)
  P.circumpolar = (dec, lat) => (lat >= 0 ? dec > 90 - lat : dec < -90 - lat);
  P.neverRises = (dec, lat) => (lat >= 0 ? dec < lat - 90 : dec > 90 + lat);

  function clean(v) { return Math.abs(v) < 1e-10 ? 0 : v; }
})(typeof window !== 'undefined' ? window : globalThis);
