/* الصيغة العربية للكتاب: رموز عربية، أرقام عربية (٠١٢٣…)، ووحدات بالعربية.
 * طبقة عرض فقط — الحسابات لا تتغير. الوضع 'ar' (الافتراضي) أو 'intl' (الرموز الدولية).
 *  - ML.arTeX(tex, sim): يحوّل نص TeX لاتيني إلى TeX برموز الكتاب العربية.
 *  - ML.loc(str, sim): يحوّل نصاً عادياً (Canvas/HTML) — الأرقام والوحدات والرموز المفردة.
 *  - الاتجاه من اليمين لليسار يُطبَّق بعد KaTeX بعكس المعادلة أفقياً ثم إعادة الحروف والأرقام (ui.js).
 */
(function (root) {
  'use strict';
  const ML = root.ML = root.ML || {};

  /* ---------- الوضع ---------- */
  let mode = 'ar';
  try { const q = root.location && /[?&]n=(ar|intl)/.exec(root.location.search); if (q) mode = q[1]; else if (root.localStorage && root.localStorage.getItem('ml-notation')) mode = root.localStorage.getItem('ml-notation'); } catch (e) { /* لا تخزين */ }
  ML.notationMode = () => mode;
  ML.isAr = () => mode === 'ar';
  ML.setNotation = (m) => { mode = m === 'intl' ? 'intl' : 'ar'; try { root.localStorage.setItem('ml-notation', mode); } catch (e) { /* */ } };
  ML.curSim = null; // المحاكاة المعروضة حالياً (لاختيار خريطة الرموز)

  /* ---------- الأرقام ---------- */
  const AD = '٠١٢٣٤٥٦٧٨٩';
  const SUPD = { '⁰': '٠', '¹': '١', '²': '٢', '³': '٣', '⁴': '٤', '⁵': '٥', '⁶': '٦', '⁷': '٧', '⁸': '٨', '⁹': '٩', '⁻': '-' };
  const SUBD = { '₀': '٠', '₁': '١', '₂': '٢', '₃': '٣', '₄': '٤', '₅': '٥', '₆': '٦', '₇': '٧', '₈': '٨', '₉': '٩' };
  const toAD = (s) => s.replace(/[0-9]/g, (d) => AD[+d]);
  // رقم نصي: الفاصلة العشرية في الكتاب «,»
  ML.arNum = (s) => toAD(String(s).replace(/(\d)\.(\d)/g, '$1,$2'));
  // قراءة رقم كتبه المستخدم بأي من نظامي الأرقام
  ML.parseNum = function (s) {
    s = String(s).trim().replace(/[٠-٩]/g, (d) => AD.indexOf(d)).replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
      .replace(/[٫,]/g, '.').replace(/[−–]/g, '-').replace(/\s/g, '');
    return s === '' ? NaN : Number(s);
  };
  ML.fmtInput = (v) => (ML.isAr() ? ML.arNum(String(v)) : String(v));

  /* ---------- جداول الرموز (من الكتابين) ---------- */
  // الرياضيات: س، ص، ق(س)، هـ(س)، أ ب جـ، جا جتا ظا، لو، π، العبارات ن ف م، المصفوفات أ ب جـ …
  const MATH = {
    x: 'س', y: 'ص', f: 'ق', g: 'هـ', a: 'أ', b: 'ب', c: 'جـ', h: 'ل', k: 'ك', r: 'نق', n: 'ن', m: 'م', t: 'ت', d: 'د', e: 'هـ',
    p: 'ن', q: 'ف', s: 'ع', z: 'ع', u: 'ع', v: 'و', w: 'ل', l: 'ل', i: 'ي', j: 'ك',
    A: 'أ', B: 'ب', C: 'جـ', D: 'د', E: 'هـ', F: 'و', G: 'ز', H: 'ح', I: 'ط', J: 'ي', K: 'ك', L: 'ل', M: 'م', N: 'ن', O: 'م', P: 'ب', Q: 'ف', R: 'ر', S: 'ع', T: 'ط', U: 'ش', V: 'ف', W: 'ل', X: 'س', Y: 'ص', Z: 'ع'
  };
  // الفيزياء: ف ع ز ت جـ ق ك و ض ث ل ح د كح حن ش ن نق …
  const PHYS = {
    x: 'ف', v: 'ع', t: 'ز', a: 'ت', g: 'جـ', F: 'ق', f: 'ق_ح', m: 'ك', W: 'و', N: 'ق_ع', P: 'ض', A: 'أ', h: 'ل', H: 'ل', V: 'ح', T: 'د', Q: 'كح', c: 'حن', C: 'سح', U: 'طد', n: 'ن', R: 'أ', r: 'نق', k: 'أ', d: 'ف', L: 'ل',
    M: 'ك', E: 'ط', s: 'ف', y: 'ص', z: 'ع', b: 'ب', p: 'ض', q: 'ق', e: 'هـ', l: 'ل', u: 'ع', w: 'ش', i: 'ي', j: 'ي', o: 'و',
    B: 'ب', D: 'د', G: 'جـ', I: 'م', K: 'ك', O: 'و', S: 'م', X: 'س', Y: 'ص', Z: 'ع', J: 'ج'
  };
  const GREEK_PHYS = { rho: 'ث', alpha: 'م_د', beta: 'م_ح', omega: 'ع_ز', lambda: 'ط', varphi: 'φ', phi: 'φ', delta: 'δ', theta: 'هـ', mu: 'م' };
  const GREEK_MATH = { theta: 'هـ', alpha: 'أ', beta: 'ب', varphi: 'φ', phi: 'φ', omega: 'ع', lambda: 'ل' };
  // كلمات/دلائل سفلية
  const WORDS = {
    net: 'محصلة', sub: 'مغمور', b: 'طفو', l: 'سائل', abs: 'مطلق', noon: 'الزوال', NCP: 'القطب', zenith: 'سمت', total: 'كلي', avg: 'متوسط', inst: 'لحظي',
    gained: 'مكتسبة', lost: 'مفقودة', ice: 'جليد', w: 'ماء', e: 'اتزان', f: 'انصهار', i: 'ابتدائية', c: 'مركزي', c_: 'مركزي', max: 'عظمى', min: 'صغرى',
    LST: 'ت ن', AB: 'أب', BA: 'ب أ', R: 'م', on: 'على', top: 'قمة', ground: 'أرض', AC: 'أجـ',
    passenger: 'الراكب', equator: 'الاستواء', horizon: 'الأفق', circumpolar: 'أبدي الظهور', never: 'لا يشرق', rises: '',
    process: 'العملية', law: 'القانون', type: 'النوع', material: 'المادة', body: 'الجسم', gas: 'الغاز', release: 'إفلات', boil: 'تبخير',
    view: 'زاوية النظر', tilt: 'ارتفاع النظر', ecliptic: 'دائرة البروج', distance: 'البعد', seat: 'حزام', belt: 'الأمان', or: 'أو', at: 'عند', constant: 'ثابت', and: 'و',
    hidden: '', kind: 'النوع', mode: 'الحالة', shape: 'الشكل', axis: 'المحور', show: 'إظهار', op: 'العملية', base: 'الأساس', point: 'نقطة', angle: 'زاوية', sign: 'الإشارة', perm: 'تبديل', unit: 'الوحدة', prefix: 'البادئة'
  };
  // الوحدات (من الكتاب)
  const UNITS = {
    m: 'م', s: 'ث', kg: 'كغم', g: 'غم', N: 'نيوتن', Pa: 'باسكال', J: 'جول', K: 'كلفن', mol: 'مول', L: 'لتر', cm: 'سم', mm: 'ملم', km: 'كم', h: 'ساعة', min: 'دقيقة',
    Hz: 'هيرتز', W: 'واط', atm: 'ض.ج', bar: 'بار', mbar: 'ملي بار', Torr: 'تور', rev: 'دورة', day: 'يوم', mL: 'مل', dm: 'دسم', um: 'ميكرومتر', nm: 'نانومتر', ms: 'ملي ثانية',
    t: 'طن', A: 'أمبير', C: 'س', F: 'ف', rad: 'راديان', deg: 'درجة', mg: 'ملغم', ton: 'طن', year: 'سنة', mi: 'ميل', ft: 'قدم', inch: 'إنش', in: 'إنش', yd: 'ياردة', lb: 'رطل', oz: 'أونصة', gal: 'جالون', cal: 'سعر', hr: 'ساعة'
  };
  const FUNCS = { sin: 'جا', cos: 'جتا', tan: 'ظا', cot: 'ظتا', sec: 'قا', csc: 'قتا', log: 'لو', ln: 'لو_هـ', det: '', max: 'أكبر', min: 'أصغر' };
  ML.notation = { MATH, PHYS, UNITS, WORDS, FUNCS };
  WORDS.C = 'س'; WORDS.F = 'ف'; WORDS.K = 'كلفن'; UNITS.Hg = 'زئبق'; UNITS.pm = 'بيكومتر'; UNITS.Gm = 'جيجامتر'; UNITS.Mm = 'ميغامتر';

  // العلوم الحياتية: الرموز اللاتينية تبقى كما في الكتاب (A، T، G، C، U، DNA، G1، FSH…)، والأرقام المستقلة عربية
  const isBio = (sim) => (sim ? sim.subject === 'g10-bio' : ML.curSubject === 'g10-bio');
  ML.isBio = isBio;
  const LAT_TOK = /[0-9]*[A-Za-z][A-Za-z0-9′'’]*/g;
  // أرقام عربية خارج الكلمات اللاتينية (G1 ، 2n ، X400 تبقى كما هي)
  const bioDigits = (t) => { let out = '', k = 0; String(t).replace(LAT_TOK, (m, i) => { out += toAD(t.slice(k, i).replace(/(\d)\.(\d)/g, '$1,$2')) + m; k = i + m.length; return m; }); return out + toAD(t.slice(k).replace(/(\d)\.(\d)/g, '$1,$2')); };
  function varMap(sim) {
    if (isBio(sim)) return { base: {}, greek: {}, own: (sim && sim.ar) || {}, bio: true };
    const subj = sim && sim.subject === 'g10-physics' ? 'p' : 'm';
    return { base: subj === 'p' ? PHYS : MATH, greek: subj === 'p' ? GREEK_PHYS : GREEK_MATH, own: (sim && sim.ar) || {} };
  }
  ML.sym = function (ch, sim) { sim = sim === undefined ? ML.curSim : sim; if (!ML.isAr()) return ch; const vm = varMap(sim); return vm.own[ch] || vm.base[ch] || ch; };

  /* ---------- TeX ← TeX عربي ---------- */
  const isArabic = (s) => /[؀-ۿ]/.test(s);
  const T = (s) => '{\\text{' + s + '}}';
  // رمز عربي قد يحوي دليلاً سفلياً «ق_ح»
  function symTeX(s) {
    const k = s.indexOf('_'); if (k > 0) return T(s.slice(0, k)) + '_{' + T(s.slice(k + 1)) + '}';
    return T(s);
  }
  function numTeX(n) { return T(toAD(n.replace('.', ','))); }
  function readGroup(s, i) { // s[i] === '{' → [content, endIndex]
    let depth = 0, j = i;
    for (; j < s.length; j++) { if (s[j] === '\\') { j++; continue; } if (s[j] === '{') depth++; else if (s[j] === '}') { depth--; if (!depth) break; } }
    return [s.slice(i + 1, j), j + 1];
  }
  // وحدات داخل \mathrm{...}
  function unitTeX(u) {
    let out = '', i = 0;
    while (i < u.length) {
      const ch = u[i];
      if (/[A-Za-z]/.test(ch)) { let j = i; while (j < u.length && /[A-Za-z]/.test(u[j])) j++; const w = u.slice(i, j); out += UNITS[w] !== undefined ? T(UNITS[w]) : (WORDS[w] !== undefined ? T(WORDS[w]) : T(w.split('').map((c) => UNITS[c] || c).join(''))); i = j; continue; }
      if (/[0-9]/.test(ch)) { let j = i; while (j < u.length && /[0-9.]/.test(u[j])) j++; out += numTeX(u.slice(i, j)); i = j; continue; }
      if (ch === '\\') { let j = i + 1; while (j < u.length && /[A-Za-z]/.test(u[j])) j++; if (j === i + 1) j++; out += u.slice(i, j); i = j; continue; }
      if (ch === ' ') { out += '\\,'; i++; continue; }
      out += ch; i++;
    }
    return out.replace(/\^\\circ/g, '{}^{\\circ}');
  }
  // عبارات إنجليزية تظهر داخل \text{...}
  const PHRASES = [
    ['main scale', 'التدريج الرئيسي'], ['least count', 'أصغر قراءة'], ['seat belt', 'حزام الأمان'], ['at constant', 'عند ثبوت'], ['never rises', 'لا يشرق أبداً'],
    ['l.c.', 'أ.ق'], ['view, tilt', 'زاويتا النظر'], ['mm\\,Hg', 'ملم زئبق']
  ];
  const TWORDS = {
    reading: 'القراءة', from: 'من', to: 'إلى', quantity: 'الكمية', derived: 'المشتقة', unit: 'الوحدة', parallelogram: 'متوازي الأضلاع', case: 'الحالة', distance: 'المسافة',
    path: 'المسار', progress: 'التقدم', slope: 'ميل', of: '', tangent: 'المماس', area: 'المساحة', const: 'ثابت', constant: 'ثابت', passenger: 'الراكب', release: 'إفلات',
    floating: 'طفو', material: 'المادة', body: 'الجسم', boil: 'تبخير', type: 'النوع', law: 'القانون', gas: 'الغاز', process: 'العملية', NCP: 'القطب', zenith: 'سمت الرأس',
    equator: 'الاستواء', horizon: 'الأفق', LST: 'ت.ن', view: 'زاوية النظر', tilt: 'ارتفاع النظر', day: 'يوم', circumpolar: 'أبدي الظهور', or: 'أو', and: 'و', if: 'إذا',
    otherwise: 'غير ذلك', for: 'لـ', mm: 'ملم', cm: 'سم', m: 'م', s: 'ث', kg: 'كغم', N: 'نيوتن', Pa: 'باسكال', J: 'جول', K: 'كلفن', h: 'ساعة', mode: 'الحالة', kind: 'النوع',
    shape: 'الشكل', show: 'إظهار', point: 'نقطة', angle: 'الزاوية', sign: 'الإشارة', base: 'الأساس', op: 'العملية', axis: 'المحور', operation: 'العملية', matrix: 'المصفوفة',
    det: 'المحدد', undefined: 'غير معرّف', True: 'ص', False: 'خ', T: 'ص', F: 'خ', where: 'حيث', when: 'عندما', is: '', the: '', on: 'على', in: 'في', with: 'مع', by: 'بـ'
  };
  ML.notation.TWORDS = TWORDS; Object.assign(TWORDS, { inner: 'الداخلي', form: 'الصورة', exterior: 'الخارجية', arc: 'القوس', length: 'الطول', period: 'الدورة', amplitude: 'السعة', identity: 'المتطابقة', L: 'الطرف الأيمن', R: 'الطرف الأيسر', trig: 'اقتران' }); Object.assign(WORDS, { trig: 'اقتران', rad: 'دائري' }); TWORDS.tool = 'الأداة'; TWORDS.ecliptic = 'دائرة البروج';
  function textArabic(t, bio) { // داخل \text{...}: أرقام عربية وترجمة الكلمات الإنجليزية
    if (bio) return bioDigits(t).replace(/[0-9]+[A-Za-z][A-Za-z0-9]*|[A-Za-z]+[0-9][A-Za-z0-9]*/g, (m) => '\u2066' + m + '\u2069'); // 2n ، G1 تبقى متماسكة داخل النص العربي
    PHRASES.forEach((ph) => { t = t.split(ph[0]).join(ph[1]); });
    t = t.replace(/[A-Za-z]+/g, (w) => (TWORDS[w] !== undefined ? TWORDS[w] : (UNITS[w] || w)));
    return toAD(t.replace(/(\d)\.(\d)/g, '$1,$2'));
  }
  // إشارة السالب على يسار العدد كما في الكتاب (−٤): في المعادلة المعكوسة نضع السالب بعد معامله
  const UNARY_OPS = /^(le|ge|leq|geq|lt|gt|times|cdot|div|quad|qquad|Rightarrow|Leftarrow|rightarrow|leftarrow|to|approx|ne|neq|iff|implies|in|pm|mp|left|right|equiv|sim|lim|sum|frac|dfrac|tfrac|sqrt|mid|colon|land|lor|wedge|vee|neg|,|;|!)$/;
  function groupEnd(s, i) { let d = 0; for (let j = i; j < s.length; j++) { if (s[j] === '\\') { j++; continue; } if (s[j] === '{') d++; else if (s[j] === '}') { d--; if (!d) return j + 1; } } return s.length; }
  function scriptsEnd(s, j) { while (s[j] === '^' || s[j] === '_') { j++; if (s[j] === '{') j = groupEnd(s, j); else if (s[j] === '\\') { j++; while (/[A-Za-z]/.test(s[j] || '')) j++; } else j++; } return j; }
  function operandEnd(s, i) {
    const c = s[i];
    if (/[0-9]/.test(c || '')) { let j = i; while (/[0-9.]/.test(s[j] || '')) j++; return scriptsEnd(s, j); }
    if (/[A-Za-z]/.test(c || '')) return scriptsEnd(s, i + 1);
    if (c === '{') return scriptsEnd(s, groupEnd(s, i));
    if (c === '(') { let d = 0; for (let j = i; j < s.length; j++) { if (s[j] === '(') d++; else if (s[j] === ')') { d--; if (!d) return scriptsEnd(s, j + 1); } } return -1; }
    if (c === '\\') {
      let j = i + 1; while (/[A-Za-z]/.test(s[j] || '')) j++; const cmd = s.slice(i + 1, j);
      if (/^(frac|dfrac|tfrac|binom)$/.test(cmd) && s[j] === '{') { j = groupEnd(s, j); if (s[j] === '{') j = groupEnd(s, j); return scriptsEnd(s, j); }
      if (cmd === 'sqrt' && s[j] === '{') return scriptsEnd(s, groupEnd(s, j));
      if (cmd === 'left') { let d = 0; for (let k = i; k < s.length; k++) { if (s.startsWith('\\left', k)) { d++; k += 4; } else if (s.startsWith('\\right', k)) { d--; k += 5; if (!d) { let e = k + 1; if (s[e] === '\\') { e++; while (/[A-Za-z]/.test(s[e] || '')) e++; } else e++; return scriptsEnd(s, e); } } } return -1; }
      if (/^(text|mathrm|vec|bar|hat)$/.test(cmd) && s[j] === '{') return scriptsEnd(s, groupEnd(s, j));
      if (/^(pi|infty|theta|alpha|beta|delta|varphi|phi|lambda|rho|omega|mu|Delta|circ)$/.test(cmd)) return scriptsEnd(s, j);
      return -1;
    }
    return -1;
  }
  function isUnaryAt(s, i) {
    let k = i - 1; while (k >= 0 && s[k] === ' ') k--;
    if (k < 0) return true;
    const p = s[k];
    if ('([{=,+-−<>:;&|'.indexOf(p) >= 0) return !(p === '|' && /[A-Za-z0-9)]/.test(s[k - 1] || '')) && !(p === '{' && s[k - 1] === '\\' && false);
    if (/[A-Za-z]/.test(p)) { let b = k; while (b >= 0 && /[A-Za-z]/.test(s[b])) b--; if (s[b] === '\\') return UNARY_OPS.test(s.slice(b + 1, k + 1)); }
    if (p === '\\') return false;
    return false;
  }
  function moveUnaryMinus(s) {
    let out = '', i = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === '\\') { let j = i + 1; if (/[A-Za-z]/.test(s[j] || '')) { while (/[A-Za-z]/.test(s[j] || '')) j++; } else j++; out += s.slice(i, j); i = j; continue; }
      if ((c === '-' || c === '−') && isUnaryAt(s, i)) {
        let j = i + 1; while (s[j] === ' ') j++;
        const e = operandEnd(s, j);
        if (e > j) { out += moveUnaryMinus(s.slice(j, e)) + '{-}'; i = e; continue; }
      }
      out += c; i++;
    }
    return out;
  }
  ML.moveUnaryMinus = moveUnaryMinus;
  // حرف لاتيني قبل الموضع i ليس جزءاً من أمر TeX (مثل \\times)
  function latinBefore(s, i) { let k = i - 1; if (!/[A-Za-z]/.test(s[k] || '')) return false; while (k >= 0 && /[A-Za-z]/.test(s[k])) k--; return s[k] !== '\\'; }
  ML.arTeX = function (tex, sim) {
    if (!ML.isAr()) return tex;
    sim = sim === undefined ? ML.curSim : sim;
    const vm = varMap(sim); const s = moveUnaryMinus(String(tex)); let out = ''; let i = 0; let prevLetter = false; let argN = 0; // معاملات بلا أقواس: \\tfrac12 ، x^2
    const mapLetter = (c) => vm.own[c] || vm.base[c] || c;
    while (i < s.length) {
      const ch = s[i];
      if (ch === '\\') {
        let j = i + 1; while (j < s.length && /[A-Za-z]/.test(s[j])) j++;
        if (j === i + 1) { // \, \; \{ \\ ...
          out += s.slice(i, i + 2); i += 2; prevLetter = false; continue;
        }
        const cmd = s.slice(i + 1, j);
        if (/^(frac|tfrac|dfrac|binom)$/.test(cmd) && s[j] !== '{') { out += '\\' + cmd; i = j; argN = 2; continue; }
        if (cmd === 'sqrt' && s[j] !== '{' && s[j] !== '[') { out += '\\' + cmd; i = j; argN = 1; continue; }
        if ((cmd === 'text' || cmd === 'textrm' || cmd === 'textbf') && s[j] === '{') { const [g, e] = readGroup(s, j); out += '\\' + cmd + '{' + textArabic(g, vm.bio) + '}'; i = e; prevLetter = false; continue; }
        if ((cmd === 'mathrm' || cmd === 'mathrm' || cmd === 'operatorname') && s[j] === '{') { const [g, e] = readGroup(s, j); out += unitTeX(g); i = e; prevLetter = false; continue; }
        if (cmd === 'mathbb' && s[j] === '{') { const [g, e] = readGroup(s, j); out += T({ R: 'ح', Z: 'ص', N: 'ط', Q: 'ن' }[g] || g); i = e; prevLetter = false; continue; }
        if ((cmd === 'begin' || cmd === 'end') && s[j] === '{') { const [g, e] = readGroup(s, j); out += '\\' + cmd + '{' + g + '}'; i = e; continue; }
        if (FUNCS[cmd] !== undefined) { const f = FUNCS[cmd]; out += (prevLetter ? '\\,' : '') + (f ? '{' + symTeX(f) + '}' : ''); i = j; prevLetter = true; continue; }
        if (s[j] === '_') { // \\rho_b ونحوه
          let sub, e; if (s[j + 1] === '{') { const g = readGroup(s, j + 1); sub = g[0].replace(/\\text\{([^}]*)\}/, '$1'); e = g[1]; } else { sub = s[j + 1]; e = j + 2; }
          const key = cmd + '_' + sub; if (vm.own[key] !== undefined) { out += (prevLetter ? '\\,' : '') + symTeX(vm.own[key]); i = e; prevLetter = true; continue; }
        }
        if (vm.own['\\' + cmd]) { out += symTeX(vm.own['\\' + cmd]); i = j; prevLetter = true; continue; }
        if (vm.greek[cmd] && /[؀-ۿ]/.test(vm.greek[cmd])) { out += (prevLetter ? '\\,' : '') + symTeX(vm.greek[cmd]); i = j; prevLetter = true; continue; }
        out += '\\' + cmd; i = j; prevLetter = false; continue;
      }
      if (/[A-Za-z]/.test(ch)) {
        let j = i; while (j < s.length && /[A-Za-z]/.test(s[j])) j++;
        const w = s.slice(i, j);
        // رمز مع دليله كاملاً (F_b ، T_K ، L_f) له رمز خاص في هذه المحاكاة
        if (w.length === 1 && s[j] === '_') {
          let sub, e;
          if (s[j + 1] === '{') { const g = readGroup(s, j + 1); sub = g[0].replace(/\\text\{([^}]*)\}/, '$1'); e = g[1]; } else { sub = s[j + 1]; e = j + 2; }
          const key = w + '_' + sub;
          if (vm.own[key] !== undefined) { out += (prevLetter ? '\\,' : '') + symTeX(vm.own[key]); i = e; prevLetter = true; continue; }
        }
        // كلمة في دليل سفلي
        const inSub = out.endsWith('_{') || out.endsWith('_');
        if (vm.bio) { out += w; i = j; prevLetter = true; continue; }
        if (w.length > 1 && WORDS[w] !== undefined && (inSub || w.length > 2)) { out += WORDS[w] ? T(WORDS[w]) : ''; i = j; prevLetter = false; continue; }
        if (inSub && vm.own['_' + w] !== undefined) { out += T(vm.own['_' + w]); i = j; continue; }
        if (inSub && w.length === 1 && WORDS[w] !== undefined && !vm.own[w]) { out += T(WORDS[w]); i = j; continue; }
        const parts = w.split('').map((c) => symTeX(mapLetter(c)));
        out += (prevLetter ? '\\,' : '') + parts.join('\\,'); i = j; prevLetter = true; continue;
      }
      if (/[0-9]/.test(ch) && argN > 0) { out += '{' + numTeX(ch) + '}'; i++; argN--; continue; }
      if (vm.bio && /[0-9]/.test(ch) && (latinBefore(s, i) || /[A-Za-z]/.test(s[i + 1] || '') || (/[0-9]/.test(s[i - 1] || '') && /[A-Za-z]/.test(out.slice(-1))))) { out += ch; i++; continue; }
      if ((ch === '^' || ch === '_') && /[0-9]/.test(s[i + 1] || '')) { out += ch + '{' + numTeX(s[i + 1]) + '}'; i += 2; continue; }
      if (/[0-9]/.test(ch)) {
        let j = i; while (j < s.length && (/[0-9]/.test(s[j]) || (s[j] === '.' && /[0-9]/.test(s[j + 1] || '')))) j++;
        out += numTeX(s.slice(i, j)); i = j; prevLetter = false; continue;
      }
      if (ch === ',') { out += '{\\text{،}\\,}'; i++; prevLetter = false; continue; }
      if (ch === '{' || ch === '}' || ch === '^' || ch === '_') { out += ch; i++; prevLetter = false; continue; }
      if (/[؀-ۿ]/.test(ch)) { let j = i; while (j < s.length && /[؀-ۿـ]/.test(s[j])) j++; out += T(s.slice(i, j)); i = j; prevLetter = true; continue; }
      out += ch; i++; if (ch !== ' ') prevLetter = false;
    }
    return out;
  };

  /* ---------- النص العادي (Canvas / HTML) ---------- */
  // وحدات بعد رقم أو بين قوسين
  const UNIT_TXT = [
    ['kg/m³', 'كغم/م³'], ['J/(kg·°C)', 'جول/(كغم.°س)'], ['m/s²', 'م/ث²'], ['m/s', 'م/ث'], ['N/m', 'نيوتن/م'], ['g/mol', 'غم/مول'], ['rev/min', 'دورة/دقيقة'], ['J/°C', 'جول/°س'], ['J/K', 'جول/كلفن'],
    ['10⁵ Pa', '١٠⁵ باسكال'], ['cm³', 'سم³'], ['cm²', 'سم²'], ['m³', 'م³'], ['m²', 'م²'], ['mm', 'ملم'], ['cm', 'سم'], ['km', 'كم'], ['kg', 'كغم'], ['mol', 'مول'], ['Pa', 'باسكال'], ['Hz', 'هيرتز'],
    ['°C', '°س'], ['°F', '°ف'], ['K', 'كلفن'], ['N', 'نيوتن'], ['J', 'جول'], ['L', 'لتر'], ['m', 'م'], ['s', 'ث'], ['h', 'ساعة'], ['g', 'غم'], ['W', 'واط']
  ];
  const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const UNIT_RE = new RegExp('(\\d[\\d.,⁰-⁹⁻×\\s]*|\\()\\s?(' + UNIT_TXT.map((u) => escRe(u[0])).join('|') + ')(?![A-Za-z²³])', 'g');
  const UNIT_MAP = Object.fromEntries(UNIT_TXT);
  // في النص العادي: السالب ملاصق للعدد على يساره (−٤) داخل النص العربي
  const isoNeg = (s) => String(s).replace(/(^|[^٠-٩A-Za-z0-9)\]⁦])([-−])([٠-٩][٠-٩,]*)/g, '$1⁦$2$3⁩');
  ML.isoNeg = isoNeg;
  ML.loc = function (str, sim) {
    if (!ML.isAr() || str === null || str === undefined) return str;
    sim = sim === undefined ? ML.curSim : sim;
    if (isBio(sim)) return isoNeg(bioDigits(String(str)).replace(/(?<![٠-٩]),|,(?![٠-٩])/g, '،'));
    let s = String(str);
    s = s.replace(UNIT_RE, (m0, pre, u) => (pre === '(' ? pre : pre.replace(/\s+$/, '') + ' ') + UNIT_MAP[u]);
    // رموز لاتينية مفردة (مع دليل سفلي اختياري): F, F₁, a_c, PV/T
    const vm = varMap(sim);
    s = s.replace(/(^|[^A-Za-z])([A-Za-z])((?:_[A-Za-z0-9]+)|[₀-₉]+)?(?![A-Za-z])/g, (m0, pre, c, sub) => {
      if (sub && /^[₀-₉]/.test(sub) && /[HNOC]/.test(c)) return m0; // صيغ كيميائية H₂ ، O₂
      if (sub && sub[0] === '_' && vm.own[c + sub] !== undefined) return pre + vm.own[c + sub].replace('_', ' ');
      let r = vm.own[c] || vm.base[c] || c;
      if (sub && sub[0] === '_' && vm.own[sub] !== undefined) return pre + r.replace('_', ' ') + ' ' + vm.own[sub];
      if (r.indexOf('_') > 0) r = r.replace('_', ' ');
      if (sub) { const w = sub.slice(1); r += sub.startsWith('_') ? ' ' + (WORDS[w] !== undefined ? WORDS[w] : w.split('').map((x) => vm.own[x] || vm.base[x] || x).join('')) : sub; }
      return pre + r;
    });
    // أسماء الاقترانات، ثم حواصل الضرب القصيرة (mg ، ma) وأسماء النقاط والقطع (AB ، AOB)
    s = s.replace(/(^|[^A-Za-z])(sin|cos|tan|log|ln)(?![A-Za-z])/g, (m0, pre, w) => pre + FUNCS[w].replace('_', ''));
    const ACR = /^(SI|LST|PV|NCP|CO|He|Ar|Hg|Pa|OK|GPS|Excel)$/;
    s = s.replace(/(^|[^A-Za-z])([A-Za-z]{2,3})(?![A-Za-z])/g, (m0, pre, w) => {
      if (ACR.test(w)) return m0;
      const up = /^[A-Z]+$/.test(w);
      return pre + w.split('').map((c) => { const r = vm.own[c] || vm.base[c] || c; return r.replace('_', ' '); }).join(up ? '' : ' ');
    });
    s = s.replace(/(^|[^A-Za-z])Pa(?![A-Za-z])/g, '$1باسكال');
    // كلمات/اختصارات شائعة في التسميات
    s = s.replace(/\bLST\b/g, 'ت.ن').replace(/\bPV\b/g, 'ض ح');
    s = s.replace(/[θφαβδλρωμ]/g, (c) => { const k = { 'θ': 'theta', 'φ': 'varphi', 'α': 'alpha', 'β': 'beta', 'δ': 'delta', 'λ': 'lambda', 'ρ': 'rho', 'ω': 'omega', 'μ': 'mu' }[c]; const r = vm.own['\\' + k] || vm.greek[k]; return r && /[\u0600-\u06FF]/.test(r) ? r.replace('_', ' ') : c; });
    s = s.replace(/[₀-₉]/g, (c) => SUBD[c]);
    s = s.replace(/(?<![٠-٩]),|,(?![٠-٩])/g, '،').replace(/(\d)\.(\d)/g, '$1,$2');
    return isoNeg(toAD(s));
  };
  // أرقام فقط (لعقد النص في الصفحة)
  ML.locDigits = (s) => (ML.isAr() ? (isBio() ? bioDigits(String(s)) : toAD(String(s).replace(/(\d)\.(\d)/g, '$1,$2'))) : s);
  ML.bioDigits = bioDigits;
  ML.supDigits = SUPD;

  // كل نص يُرسم على Canvas يمر بالتعريب (الأرقام والرموز والوحدات)
  if (root.CanvasRenderingContext2D && !root.CanvasRenderingContext2D.prototype.__mlLoc) {
    const proto = root.CanvasRenderingContext2D.prototype; const ft = proto.fillText, st = proto.strokeText, mt = proto.measureText;
    const L = (t) => (mode === 'ar' && /[0-9A-Za-z,]/.test(t) ? ML.loc(t) : t);
    // الصيغة العلمية كما في الكتاب: الأس صغير ومرفوع على يسار العشرة (٥١٠ × ٢)
    const SCI = /(-?[٠-٩][٠-٩,]*)\s*×\s*١٠([⁻⁰¹²³⁴-⁹]+)/;
    function sciDraw(fn, ctx, t, x, y) {
      t = t.replace(/[\u2066-\u2069]/g, ''); const m = SCI.exec(t); if (!m) return false;
      const px = +((/(\d+(?:\.\d+)?)px/.exec(ctx.font) || [0, 13])[1]); const small = ctx.font.replace(/(\d+(?:\.\d+)?)px/, Math.round(px * 0.68) + 'px'); const big = ctx.font;
      const pre = t.slice(0, m.index), post = t.slice(m.index + m[0].length);
      const exp = m[2].replace(/[⁻⁰¹²³⁴-⁹]/g, (c) => SUPD[c]);
      ctx.save(); ctx.direction = 'ltr';
      const W = (s2, f) => { ctx.font = f; return mt.call(ctx, s2).width; };
      const parts = [[post, big, 0, 'rtl'], [exp, small, -px * 0.38, 'ltr'], ['١٠', big, 0, 'ltr'], [' × ', big, 0, 'ltr'], [m[1], big, 0, 'ltr'], [pre, big, 0, 'rtl']].filter((q) => q[0]);
      const ws = parts.map((q) => W(q[0], q[1])); const total = ws.reduce((a2, b2) => a2 + b2, 0);
      const al = ctx.textAlign; const rtl = getComputedDir(ctx);
      let x0 = al === 'center' ? x - total / 2 : (al === 'right' || (al === 'start' && rtl) || (al === 'end' && !rtl)) ? x - total : x;
      ctx.textAlign = 'left';
      parts.forEach((q, k) => { ctx.font = q[1]; ctx.direction = 'rtl'; fn.call(ctx, q[3] === 'rtl' ? rtlText(q[0]) : q[0], x0, y + q[2]); x0 += ws[k]; });
      ctx.restore(); return true;
    }
    function getComputedDir(ctx) { return ctx.direction === 'rtl'; }
    // صيغة الكتاب: النص المعرّب يُرسم من اليمين لليسار؛ فقط المقاطع اللاتينية (H₂ …) تُعزل
    const ARX = /[\u0600-\u06FF]/;
    const rtlText = (t) => isoNeg(t.replace(/[\u2066-\u2069]/g, '')).replace(/[0-9]*[A-Za-z][A-Za-z0-9₀-₉′'’]*(?:[ –\-/]+[A-Za-z][A-Za-z0-9₀-₉′'’]*)*/g, (m) => '\u2066' + m + '\u2069');
    function draw(fn, ctx, t, a) {
      t = L(String(t));
      if (mode !== 'ar' || !ARX.test(t)) return fn.call(ctx, t, ...a);
      if (/[⁰¹²³⁴-⁹]/.test(t) && sciDraw(fn, ctx, t, a[0], a[1])) return undefined;
      const d = ctx.direction; ctx.direction = 'rtl';
      const r = fn.call(ctx, rtlText(t), ...a); ctx.direction = d; return r;
    }
    proto.fillText = function (t, ...a) { return draw(ft, this, t, a); };
    proto.strokeText = function (t, ...a) { return draw(st, this, t, a); };
    proto.measureText = function (t) { t = L(String(t)); if (mode !== 'ar' || !ARX.test(t)) return mt.call(this, t); const d = this.direction; this.direction = 'rtl'; const r = mt.call(this, rtlText(t)); this.direction = d; return r; };
    proto.__mlLoc = true;
  }

  /* ---------- عكس المعادلة (من اليمين لليسار) بعد KaTeX ---------- */
  // نعيد عكس عقد النص التي تحوي حروفاً أو أرقاماً كي تُقرأ طبيعياً؛ الأقواس والأسهم والمتباينات تبقى معكوسة كما في الكتاب
  const KEEP_MIRROR = /^[\s()[\]{}<>≤≥⟨⟩→←⇒⇐↔⇔⟶⟵⟹⟸⟺|∣∥‖]*$/;
  ML.mirrorKaTeX = function (html) {
    return html.replace(/>([^<>]+)</g, (m0, t) => (KEEP_MIRROR.test(t) || /^&[a-z#0-9]+;$/i.test(t) && !/&amp;/.test(t) ? m0 : '><span class="um">' + t + '</span><'));
  };
})(typeof window !== 'undefined' ? window : globalThis);
