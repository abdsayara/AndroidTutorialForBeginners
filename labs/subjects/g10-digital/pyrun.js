/* مفسّر بايثون مصغّر للتتبع خطوة بخطوة — يغطي ما يستخدمه كتاب المهارات الرقمية (الوحدة الثانية):
   المتغيرات، المعاملات الحسابية والمقارنة والمنطقية، if/elif/else، for/range، while، print/input/int/float/str/len */
(function (root) {
  'use strict';
  const ML = root.ML = root.ML || {};
  const PY = ML.py = {};
  const KW = ['False', 'None', 'True', 'and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'];
  PY.KW = KW;
  const LETTER = /[A-Za-z_؀-ۿ]/, WORD = /[A-Za-z0-9_؀-ۿ]/;
  function PyErr(kind, msg, line, ar) { this.kind = kind; this.msg = msg; this.line = line; this.ar = ar; }
  PY.PyErr = PyErr;

  /* ---------- القيم ---------- */
  const I = (v) => ({ t: 'int', v: v }), F = (v) => ({ t: 'float', v: v }), S = (v) => ({ t: 'str', v: v }), B = (v) => ({ t: 'bool', v: !!v }), L = (v) => ({ t: 'list', v: v });
  const NONE = { t: 'none', v: null };
  const isNum = (x) => x.t === 'int' || x.t === 'float' || x.t === 'bool';
  const TYPE = { int: 'int', float: 'float', str: 'str', bool: 'bool', list: 'list', none: 'NoneType', range: 'range' };
  PY.typeName = (x) => TYPE[x.t];
  function fmtFloat(x) {
    if (Number.isNaN(x)) return 'nan'; if (!Number.isFinite(x)) return x > 0 ? 'inf' : '-inf';
    if (Number.isInteger(x) && Math.abs(x) < 1e16) return x.toFixed(1);
    let s = String(x); if (/e/.test(s)) s = s.replace(/e([+-])(\d)$/, 'e$10$2'); return s;
  }
  function toStr(x) {
    switch (x.t) {
      case 'int': return String(x.v);
      case 'float': return fmtFloat(x.v);
      case 'bool': return x.v ? 'True' : 'False';
      case 'none': return 'None';
      case 'str': return x.v;
      case 'list': return '[' + x.v.map(repr).join(', ') + ']';
      case 'range': return 'range(' + x.a + ', ' + x.b + (x.s !== 1 ? ', ' + x.s : '') + ')';
    }
    return '?';
  }
  function repr(x) { return x.t === 'str' ? (x.v.indexOf("'") >= 0 && x.v.indexOf('"') < 0 ? '"' + x.v + '"' : "'" + x.v + "'") : toStr(x); }
  PY.toStr = toStr; PY.repr = repr;
  const truthy = (x) => (x.t === 'list' ? x.v.length > 0 : x.t === 'none' ? false : x.t === 'str' ? x.v.length > 0 : x.t === 'range' ? rangeVals(x).length > 0 : !!x.v);
  function rangeVals(r) { const out = []; if (r.s > 0) for (let i = r.a; i < r.b; i += r.s) out.push(i); else for (let i = r.a; i > r.b; i += r.s) out.push(i); return out; }

  /* ---------- التحليل اللفظي ---------- */
  function tokenize(src) {
    const lines = String(src).replace(/\r/g, '').split('\n'); const toks = []; const ind = [0];
    lines.forEach((raw, li) => {
      const ln = li + 1; const line = raw.replace(/\t/g, '    ');
      let s = '', q = null;
      for (let i = 0; i < line.length; i++) { const ch = line[i]; if (q) { s += ch; if (ch === '\\') { s += line[++i] || ''; continue; } if (ch === q) q = null; } else { if (ch === '#') break; if (ch === '"' || ch === "'") q = ch; s += ch; } }
      if (!s.trim()) return;
      const n = s.length - s.replace(/^ +/, '').length;
      if (n > ind[ind.length - 1]) { ind.push(n); toks.push({ t: 'INDENT', line: ln }); }
      else {
        while (n < ind[ind.length - 1]) { ind.pop(); toks.push({ t: 'DEDENT', line: ln }); }
        if (n !== ind[ind.length - 1]) throw new PyErr('IndentationError', 'unindent does not match any outer indentation level', ln, 'المسافة البادئة لا تطابق أي مستوى سابق.');
      }
      let i = n;
      while (i < s.length) {
        const ch = s[i];
        if (ch === ' ') { i++; continue; }
        if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(s[i + 1] || ''))) {
          const m = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(s.slice(i)); i += m[0].length;
          if (LETTER.test(s[i] || '')) throw new PyErr('SyntaxError', 'invalid decimal literal', ln, 'لا يجوز أن يبدأ اسم المتغير برقم.');
          toks.push({ t: 'NUM', v: m[0], line: ln }); continue;
        }
        if (LETTER.test(ch)) { let j = i; while (j < s.length && WORD.test(s[j])) j++; toks.push({ t: 'NAME', v: s.slice(i, j), line: ln }); i = j; continue; }
        if (ch === '"' || ch === "'") {
          let j = i + 1, v = '';
          while (j < s.length && s[j] !== ch) { if (s[j] === '\\') { const c = s[j + 1]; v += c === 'n' ? '\n' : c === 't' ? '\t' : c; j += 2; } else v += s[j++]; }
          if (j >= s.length) throw new PyErr('SyntaxError', 'unterminated string literal', ln, 'لم تُغلق علامة التنصيص.');
          toks.push({ t: 'STR', v: v, line: ln }); i = j + 1; continue;
        }
        if (s.startsWith('=>', i) || s.startsWith('=<', i)) throw new PyErr('SyntaxError', 'invalid syntax', ln, 'الرمز «' + s.substr(i, 2) + '» غير موجود في بايثون؛ الصحيح «' + (s[i + 1] === '>' ? '>=' : '<=') + '».');
        const op = ['**=', '//='].find((o) => s.startsWith(o, i)) || ['**', '//', '==', '!=', '>=', '<=', '+=', '-=', '*=', '/=', '%='].find((o) => s.startsWith(o, i)) || ('+-*/%=<>()[],:'.indexOf(ch) >= 0 ? ch : null);
        if (!op) throw new PyErr('SyntaxError', "invalid character '" + ch + "'", ln, 'رمز غير مسموح به هنا: «' + ch + '».');
        toks.push({ t: 'OP', v: op, line: ln }); i += op.length;
      }
      toks.push({ t: 'NL', line: ln });
    });
    while (ind.length > 1) { ind.pop(); toks.push({ t: 'DEDENT', line: lines.length }); }
    toks.push({ t: 'EOF', line: lines.length });
    return toks;
  }

  /* ---------- التحليل النحوي ---------- */
  const AUG = ['+=', '-=', '*=', '/=', '//=', '%=', '**='];
  function parse(src) {
    const T = tokenize(src); let p = 0;
    const cur = () => T[p];
    const isOp = (v) => T[p].t === 'OP' && T[p].v === v;
    const isName = (v) => T[p].t === 'NAME' && T[p].v === v;
    const fail = (ar, msg) => { throw new PyErr('SyntaxError', msg || 'invalid syntax', T[p].line, ar); };
    const colon = () => { if (isOp('=')) fail('استخدم «==» للمقارنة؛ «=» للإسناد فقط.'); if (!isOp(':')) fail('نسيت النقطتين الرأسيتين «:» في نهاية السطر.', "expected ':'"); p++; };
    const endLine = () => { if (T[p].t !== 'NL') fail(T[p].t === 'NAME' ? 'صيغة غير صحيحة: كلمتان متتاليتان (هل في اسم المتغير مسافة؟ أو كلمة مكتوبة خطأ مثل Else؟).' : T[p].v === ':' ? 'نقطتان رأسيتان في غير مكانهما (هل كتبت الكلمة المفتاحية بحرف كبير مثل Else أو If؟).' : 'صيغة غير صحيحة في هذا السطر.'); p++; };
    function block() {
      if (T[p].t === 'NL') {
        p++; if (T[p].t !== 'INDENT') throw new PyErr('IndentationError', 'expected an indented block', T[p].line, 'يجب أن يبدأ السطر التالي بمسافة بادئة (4 مسافات).');
        p++; const body = []; while (T[p].t !== 'DEDENT' && T[p].t !== 'EOF') body.push(stmt()); if (T[p].t === 'DEDENT') p++; return body;
      }
      const s = simple(); endLine(); return [s];
    }
    function stmt() {
      const t = cur();
      if (t.t === 'INDENT') throw new PyErr('IndentationError', 'unexpected indent', t.line, 'مسافة بادئة في غير مكانها.');
      if (t.t === 'NAME' && KW.indexOf(t.v) >= 0 && T[p + 1].t === 'OP' && (T[p + 1].v === '=' || AUG.indexOf(T[p + 1].v) >= 0)) fail('«' + t.v + '» كلمة محجوزة في بايثون ولا تصلح اسماً لمتغير.');
      if (t.t === 'NAME') {
        if (t.v === 'if') {
          p++; const node = { k: 'if', line: t.line, br: [], orelse: null }; const c = expr(); colon(); node.br.push({ cond: c, body: block(), line: t.line });
          while (isName('elif')) { const l = cur().line; p++; const c2 = expr(); colon(); node.br.push({ cond: c2, body: block(), line: l }); }
          if (isName('else')) { const l = cur().line; p++; colon(); node.orelse = { body: block(), line: l }; }
          return node;
        }
        if (t.v === 'while') { p++; const c = expr(); colon(); return { k: 'while', line: t.line, cond: c, body: block() }; }
        if (t.v === 'for') {
          p++; const v = cur(); if (v.t !== 'NAME') fail('يجب أن يأتي بعد for اسم متغير.'); p++;
          if (!isName('in')) fail('نسيت كلمة in في حلقة for.'); p++; const it = expr(); colon();
          return { k: 'for', line: t.line, name: v.v, iter: it, body: block() };
        }
        if (t.v === 'elif' || t.v === 'else') fail('«' + t.v + '» دون if قبلها بالمسافة البادئة نفسها.');
      }
      const s = simple(); endLine(); return s;
    }
    function simple() {
      const line = cur().line;
      if (isName('pass')) { p++; return { k: 'pass', line: line }; }
      const e = expr();
      if (isOp('=') || (T[p].t === 'OP' && AUG.indexOf(T[p].v) >= 0)) {
        if (e.k !== 'name') fail(e.k === 'bin' && e.op === '-' ? 'لا يمكن الإسناد إلى تعبير: الشرطة «-» تُقرأ طرحاً، استخدم الشرطة السفلية «_».' : 'لا يمكن الإسناد إلى قيمة أو تعبير؛ اسم المتغير يُكتب يسار =.', 'cannot assign to expression');
        const op = T[p].v; p++; const val = expr(); return { k: 'assign', line: line, name: e.id, op: op, value: val };
      }
      return { k: 'expr', line: line, e: e };
    }
    const expr = () => orE();
    function orE() { let a = andE(); while (isName('or')) { p++; a = { k: 'bool', op: 'or', l: a, r: andE() }; } return a; }
    function andE() { let a = notE(); while (isName('and')) { p++; a = { k: 'bool', op: 'and', l: a, r: notE() }; } return a; }
    function notE() { if (isName('not')) { p++; return { k: 'not', e: notE() }; } return cmp(); }
    function cmp() {
      const a = arith(); const ops = [], xs = [a];
      while (T[p].t === 'OP' && ['==', '!=', '<', '>', '<=', '>='].indexOf(T[p].v) >= 0) { ops.push(T[p].v); p++; xs.push(arith()); }
      if (isOp('=') && T[p + 1] && T[p + 1].t !== 'NL' && (ops.length || a.k !== 'name')) fail('استخدم «==» للمقارنة؛ «=» للإسناد فقط.');
      return ops.length ? { k: 'cmp', ops: ops, xs: xs } : a;
    }
    function arith() { let a = term(); while (isOp('+') || isOp('-')) { const op = T[p].v; p++; a = { k: 'bin', op: op, l: a, r: term() }; } return a; }
    function term() { let a = unary(); while (isOp('*') || isOp('/') || isOp('//') || isOp('%')) { const op = T[p].v; p++; a = { k: 'bin', op: op, l: a, r: unary() }; } return a; }
    function unary() { if (isOp('-') || isOp('+')) { const op = T[p].v; p++; return { k: 'un', op: op, e: unary() }; } return power(); }
    function power() { const a = atom(); if (isOp('**')) { p++; return { k: 'bin', op: '**', l: a, r: unary() }; } return a; }
    function atom() {
      const t = cur();
      if (t.t === 'NUM') { p++; return { k: 'num', v: Number(t.v), fl: /[.eE]/.test(t.v) }; }
      if (t.t === 'STR') { p++; return { k: 'str', v: t.v }; }
      if (t.t === 'NAME') {
        if (t.v === 'True' || t.v === 'False') { p++; return { k: 'const', v: B(t.v === 'True') }; }
        if (t.v === 'None') { p++; return { k: 'const', v: NONE }; }
        if (KW.indexOf(t.v) >= 0) fail('«' + t.v + '» كلمة محجوزة في غير مكانها.');
        p++;
        if (isOp('(')) {
          p++; const args = [], kw = {};
          while (!isOp(')')) {
            if (T[p].t === 'NAME' && T[p + 1].t === 'OP' && T[p + 1].v === '=') { const k = T[p].v; p += 2; kw[k] = expr(); } else args.push(expr());
            if (isOp(',')) p++; else if (!isOp(')')) fail('نسيت إغلاق القوس «)» أو الفاصلة بين المعاملات.');
          }
          p++; return { k: 'call', fn: t.v, args: args, kw: kw };
        }
        return { k: 'name', id: t.v };
      }
      if (isOp('(')) { p++; const e = expr(); if (!isOp(')')) fail('نسيت إغلاق القوس «)».'); p++; e.paren = true; return e; }
      if (isOp('[')) { p++; const items = []; while (!isOp(']')) { items.push(expr()); if (isOp(',')) p++; else if (!isOp(']')) fail('نسيت إغلاق القوس «]».'); } p++; return { k: 'list', items: items }; }
      fail(t.t === 'NL' || t.t === 'EOF' ? 'السطر ناقص: ينقصه تعبير.' : 'رمز في غير مكانه: «' + (t.v || t.t) + '».');
    }
    const body = []; while (T[p].t !== 'EOF') { if (T[p].t === 'DEDENT') { p++; continue; } body.push(stmt()); }
    return body;
  }
  PY.parse = parse;

  /* ---------- العمليات ---------- */
  const TN = (x) => "'" + TYPE[x.t] + "'";
  function binop(op, a, b, line) {
    if (op === '+') { if (a.t === 'str' && b.t === 'str') return S(a.v + b.v); if (a.t === 'list' && b.t === 'list') return L(a.v.concat(b.v)); }
    if (op === '*') { if (a.t === 'str' && (b.t === 'int' || b.t === 'bool')) return S(a.v.repeat(Math.max(0, +b.v))); if (b.t === 'str' && (a.t === 'int' || a.t === 'bool')) return S(b.v.repeat(Math.max(0, +a.v))); }
    if (!isNum(a) || !isNum(b)) {
      const msg = op === '+' && a.t === 'str' ? 'can only concatenate str (not "' + TYPE[b.t] + '") to str' : 'unsupported operand type(s) for ' + op + ': ' + TN(a) + ' and ' + TN(b);
      throw new PyErr('TypeError', msg, line, (a.t === 'str' || b.t === 'str') ? 'لا يمكن إجراء العملية «' + op + '» بين نص وعدد؛ القيمة بين علامتي تنصيص نص. حوّلها بـ int() أو float().' : 'نوعا البيانات لا يسمحان بهذه العملية.');
    }
    const fl = a.t === 'float' || b.t === 'float'; const x = +a.v, y = +b.v;
    const R = (r) => (fl ? F(r) : I(r));
    switch (op) {
      case '+': return R(x + y);
      case '-': return R(x - y);
      case '*': return R(x * y);
      case '/': if (y === 0) throw new PyErr('ZeroDivisionError', 'division by zero', line, 'القسمة على صفر مستحيلة: خطأ وقت التشغيل.'); return F(x / y);
      case '//': if (y === 0) throw new PyErr('ZeroDivisionError', 'integer division or modulo by zero', line, 'القسمة على صفر مستحيلة.'); return R(Math.floor(x / y));
      case '%': if (y === 0) throw new PyErr('ZeroDivisionError', 'integer modulo by zero', line, 'القسمة على صفر مستحيلة.'); return R(x - y * Math.floor(x / y));
      case '**': return !fl && y >= 0 ? I(Math.pow(x, y)) : F(Math.pow(x, y));
    }
    throw new PyErr('SyntaxError', 'bad operator', line, 'عامل غير معروف.');
  }
  function eq(a, b) {
    if (isNum(a) && isNum(b)) return +a.v === +b.v;
    if (a.t !== b.t) return false;
    if (a.t === 'list') return a.v.length === b.v.length && a.v.every((x, i) => eq(x, b.v[i]));
    return a.v === b.v;
  }
  function compare(op, a, b, line) {
    if (op === '==') return eq(a, b); if (op === '!=') return !eq(a, b);
    let x, y;
    if (isNum(a) && isNum(b)) { x = +a.v; y = +b.v; } else if (a.t === 'str' && b.t === 'str') { x = a.v; y = b.v; }
    else throw new PyErr('TypeError', "'" + op + "' not supported between instances of " + TN(a) + ' and ' + TN(b), line, 'لا يمكن مقارنة نص بعدد؛ الدالة input() تُعيد نصاً دائماً — استخدم int() أو float().');
    return op === '<' ? x < y : op === '>' ? x > y : op === '<=' ? x <= y : x >= y;
  }
  PY.binop = binop; PY.compare = compare;

  /* ---------- كتابة تعبير مع التعويض بالقيم ---------- */
  const PREC = { or: 1, and: 2, not: 3, cmp: 4, '+': 5, '-': 5, '*': 6, '/': 6, '//': 6, '%': 6, un: 7, '**': 8 };
  function show(n, env) {
    let s;
    switch (n.k) {
      case 'num': s = n.fl ? fmtFloat(n.v) : String(n.v); break;
      case 'str': s = repr(S(n.v)); break;
      case 'const': case 'val': s = repr(n.v); break;
      case 'name': s = env && Object.prototype.hasOwnProperty.call(env, n.id) ? repr(env[n.id]) : n.id; break;
      case 'list': s = '[' + n.items.map((x) => show(x, env)).join(', ') + ']'; break;
      case 'call': s = n.fn + '(' + n.args.map((x) => show(x, env)).concat(Object.keys(n.kw).map((k) => k + '=' + show(n.kw[k], env))).join(', ') + ')'; break;
      case 'bin': s = show(n.l, env) + ' ' + n.op + ' ' + show(n.r, env); break;
      case 'un': s = n.op + show(n.e, env); break;
      case 'not': s = 'not ' + show(n.e, env); break;
      case 'bool': s = show(n.l, env) + ' ' + n.op + ' ' + show(n.r, env); break;
      case 'cmp': s = n.xs.map((x, i) => (i ? n.ops[i - 1] + ' ' : '') + show(x, env)).join(' '); break;
    }
    return n.paren ? '(' + s + ')' : s;
  }
  PY.show = show;

  /* ---------- التنفيذ مع تسجيل خطوات التتبع ---------- */
  function run(src, inputs, opt) {
    opt = opt || {};
    const MAX = opt.max || 600; const env = {}; const steps = []; let out = ''; const inq = (inputs || []).slice(); let inCount = 0;
    const res = { steps: steps, error: null, env: env };
    const snap = () => Object.keys(env).map((k) => [k, TYPE[env[k].t], repr(env[k])]);
    function rec(line, note, extra) {
      steps.push(Object.assign({ line: line, note: note, vars: snap(), out: out }, extra || {}));
      if (steps.length >= MAX) throw new PyErr('Limit', 'too many steps', line, 'توقّف التتبع بعد ' + MAX + ' خطوة: يبدو أن الحلقة لا تنتهي (حلقة لا نهائية).');
    }
    let lastInput = null;
    function ev(n, line) {
      switch (n.k) {
        case 'num': return n.fl ? F(n.v) : I(n.v);
        case 'str': return S(n.v);
        case 'const': case 'val': return n.v;
        case 'list': return L(n.items.map((x) => ev(x, line)));
        case 'name': if (!Object.prototype.hasOwnProperty.call(env, n.id)) throw new PyErr('NameError', "name '" + n.id + "' is not defined", line, 'المتغير «' + n.id + '» غير معرّف: لم تُسند إليه قيمة قبل استخدامه (أو كُتب اسمه بحالة أحرف مختلفة).'); return env[n.id];
        case 'bin': return binop(n.op, ev(n.l, line), ev(n.r, line), line);
        case 'un': { const v = ev(n.e, line); if (!isNum(v)) throw new PyErr('TypeError', 'bad operand type for unary ' + n.op + ': ' + TN(v), line, 'لا يمكن وضع إشارة قبل نص.'); return n.op === '-' ? (v.t === 'float' ? F(-v.v) : I(-v.v)) : v; }
        case 'not': return B(!truthy(ev(n.e, line)));
        case 'bool': { const a = ev(n.l, line); if (n.op === 'and') return truthy(a) ? ev(n.r, line) : a; return truthy(a) ? a : ev(n.r, line); }
        case 'cmp': { let a = ev(n.xs[0], line); for (let i = 0; i < n.ops.length; i++) { const b = ev(n.xs[i + 1], line); if (!compare(n.ops[i], a, b, line)) return B(false); a = b; } return B(true); }
        case 'call': return call(n, line);
      }
      throw new PyErr('SyntaxError', 'bad node', line, 'تعبير غير مدعوم.');
    }
    function call(n, line) {
      const a = n.args.map((x) => ev(x, line));
      switch (n.fn) {
        case 'print': {
          const sep = n.kw.sep ? toStr(ev(n.kw.sep, line)) : ' ', end = n.kw.end ? toStr(ev(n.kw.end, line)) : '\n';
          out += a.map(toStr).join(sep) + end; return NONE;
        }
        case 'input': {
          const prompt = a.length ? toStr(a[0]) : '';
          if (!inq.length) throw new PyErr('EOFError', 'EOF when reading a line', line, 'انتهت قيم الإدخال: أضف قيمة أخرى في خانة «قيم الإدخال».');
          const v = inq.shift(); inCount++; out += prompt + v + '\n'; lastInput = v; return S(v);
        }
        case 'int': {
          const x = a[0];
          if (!x) return I(0);
          if (x.t === 'str') { const s = x.v.trim(); if (!/^[+-]?\d+$/.test(s)) throw new PyErr('ValueError', "invalid literal for int() with base 10: '" + x.v + "'", line, 'النص «' + x.v + '» لا يمكن تحويله إلى عدد صحيح.'); return I(parseInt(s, 10)); }
          if (isNum(x)) return I(Math.trunc(+x.v));
          throw new PyErr('TypeError', 'int() argument must be a string or a number', line, 'لا يمكن تحويل هذا النوع إلى عدد صحيح.');
        }
        case 'float': {
          const x = a[0];
          if (x.t === 'str') { const s = x.v.trim(); if (!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(s)) throw new PyErr('ValueError', "could not convert string to float: '" + x.v + "'", line, 'النص «' + x.v + '» لا يمكن تحويله إلى عدد عشري.'); return F(parseFloat(s)); }
          if (isNum(x)) return F(+x.v);
          throw new PyErr('TypeError', 'float() argument must be a string or a number', line, 'لا يمكن تحويل هذا النوع إلى عدد عشري.');
        }
        case 'str': return S(a.length ? toStr(a[0]) : '');
        case 'bool': return B(a.length ? truthy(a[0]) : false);
        case 'len': if (a[0].t === 'str' || a[0].t === 'list') return I(a[0].v.length); throw new PyErr('TypeError', "object of type '" + TYPE[a[0].t] + "' has no len()", line, 'هذا النوع ليس له طول.');
        case 'range': {
          a.forEach((x) => { if (x.t !== 'int' && x.t !== 'bool') throw new PyErr('TypeError', "'" + TYPE[x.t] + "' object cannot be interpreted as an integer", line, 'معاملات range() يجب أن تكون أعداداً صحيحة.'); });
          const v = a.map((x) => +x.v); const r = v.length === 1 ? { a: 0, b: v[0], s: 1 } : { a: v[0], b: v[1], s: v.length > 2 ? v[2] : 1 };
          if (r.s === 0) throw new PyErr('ValueError', 'range() arg 3 must not be zero', line, 'خطوة range() لا تكون صفراً.');
          return Object.assign({ t: 'range' }, r);
        }
        case 'abs': return a[0].t === 'float' ? F(Math.abs(a[0].v)) : I(Math.abs(+a[0].v));
        case 'round': { const d = a[1] ? +a[1].v : 0; const k = Math.pow(10, d); const r = Math.round(a[0].v * k) / k; return d ? F(r) : I(r); }
      }
      throw new PyErr('NameError', "name '" + n.fn + "' is not defined", line, 'الدالة «' + n.fn + '» غير معرّفة.');
    }
    function iterVals(v, line) {
      if (v.t === 'range') return rangeVals(v).map(I);
      if (v.t === 'list') return v.v.slice();
      if (v.t === 'str') return v.v.split('').map(S);
      throw new PyErr('TypeError', "'" + TYPE[v.t] + "' object is not iterable", line, 'لا يمكن المرور على هذا النوع بحلقة for.');
    }
    function exec(body) {
      for (const s of body) {
        if (s.k === 'assign') {
          lastInput = null; const pre = show(s.value, env); let v = ev(s.value, s.line);
          if (s.op !== '=') { if (!Object.prototype.hasOwnProperty.call(env, s.name)) throw new PyErr('NameError', "name '" + s.name + "' is not defined", s.line, 'لا يمكن تعديل متغير لم تُسند إليه قيمة بعد.'); const old = env[s.name]; v = binop(s.op.slice(0, -1), old, v, s.line); env[s.name] = v; rec(s.line, s.name + ' = ' + repr(old) + ' ' + s.op.slice(0, -1) + ' ' + pre + ' ← ' + repr(v), { changed: [s.name], kind: 'assign' }); }
          else { env[s.name] = v; const plain = /^[-\d.]+$|^'.*'$|^True$|^False$/.test(pre) || pre === repr(v); rec(s.line, s.name + ' ← ' + repr(v) + (plain ? '' : '   (' + pre + ')') + (lastInput !== null ? '   [أدخل المستخدم: ' + lastInput + ']' : ''), { changed: [s.name], kind: 'assign' }); }
        } else if (s.k === 'expr') {
          const before = out; ev(s.e, s.line); const printed = out.slice(before.length);
          rec(s.line, s.e.k === 'call' && s.e.fn === 'print' ? 'طباعة: ' + (printed.replace(/\n$/, '') || '(سطر فارغ)') : 'تنفيذ تعبير', { kind: 'print' });
        } else if (s.k === 'pass') rec(s.line, 'pass: لا شيء', { kind: 'pass' });
        else if (s.k === 'if') {
          let done = false;
          for (const b of s.br) {
            const txt = show(b.cond, env); const c = truthy(ev(b.cond, b.line));
            rec(b.line, 'الشرط ' + txt + ' ← ' + (c ? 'True' : 'False') + (c ? ': يُنفَّذ ما بداخله' : ': ننتقل للتالي'), { kind: 'cond', cond: c });
            if (c) { exec(b.body); done = true; break; }
          }
          if (!done && s.orelse) { rec(s.orelse.line, 'else: لم يتحقق أي شرط، فيُنفَّذ ما بداخلها', { kind: 'else' }); exec(s.orelse.body); }
        } else if (s.k === 'while') {
          let k = 0;
          for (;;) {
            const txt = show(s.cond, env); const c = truthy(ev(s.cond, s.line));
            rec(s.line, 'شرط while: ' + txt + ' ← ' + (c ? 'True: ندخل الحلقة (الدورة ' + (k + 1) + ')' : 'False: نخرج من الحلقة'), { kind: 'loop', cond: c });
            if (!c) break; k++; exec(s.body);
          }
        } else if (s.k === 'for') {
          const vals = iterVals(ev(s.iter, s.line), s.line);
          vals.forEach((v, k) => { env[s.name] = v; rec(s.line, s.name + ' ← ' + repr(v) + '   (الدورة ' + (k + 1) + ' من ' + vals.length + ')', { changed: [s.name], kind: 'loop' }); exec(s.body); });
          rec(s.line, 'انتهت حلقة for بعد ' + vals.length + ' دورات', { kind: 'loopend' });
        }
      }
    }
    try { const prog = parse(src); exec(prog); }
    catch (e) {
      if (!(e instanceof PyErr)) throw e;
      res.error = e;
      if (e.kind !== 'Limit') out += (e.kind === 'SyntaxError' || e.kind === 'IndentationError' ? '  File "main.py", line ' + e.line + '\n' : 'Traceback (most recent call last):\n  line ' + e.line + '\n') + e.kind + ': ' + e.msg + '\n';
      steps.push({ line: e.line, note: (e.kind === 'Limit' ? '' : e.kind + ': ') + e.ar, vars: snap(), out: out, kind: 'error' });
    }
    res.out = out; res.inputsUsed = inCount;
    return res;
  }
  PY.run = run;

  /* ---------- تبسيط تعبير خطوة بخطوة حسب أولويات العمليات (كما في جدول الكتاب) ---------- */
  const LEVEL = { '**': 0, un: 1, '*': 2, '/': 2, '//': 2, '%': 2, '+': 3, '-': 3, cmp: 4, not: 5, and: 6, or: 7 };
  function exprSteps(src, vars) {
    const env = {}; Object.keys(vars || {}).forEach((k) => { const x = vars[k]; env[k] = typeof x === 'number' ? (Number.isInteger(x) ? I(x) : F(x)) : typeof x === 'boolean' ? B(x) : S(String(x)); });
    const body = parse(src); if (body.length !== 1 || body[0].k === 'if') throw new PyErr('SyntaxError', 'expression expected', 1, 'اكتب تعبيراً واحداً.');
    let root = body[0].k === 'assign' ? body[0].value : body[0].e;
    const lit = (n) => n.k === 'num' || n.k === 'str' || n.k === 'const' || n.k === 'val';
    const val = (n) => (n.k === 'num' ? (n.fl ? F(n.v) : I(n.v)) : n.k === 'str' ? S(n.v) : n.v);
    // التعويض بقيم المتغيرات
    const subst = (n) => { if (n.k === 'name') { if (!env[n.id]) throw new PyErr('NameError', "name '" + n.id + "' is not defined", 1, 'المتغير «' + n.id + '» غير معرّف.'); return { k: 'val', v: env[n.id], paren: n.paren }; } ['l', 'r', 'e'].forEach((k) => { if (n[k]) n[k] = subst(n[k]); }); if (n.xs) n.xs = n.xs.map(subst); return n; };
    root = subst(root);
    const steps = [];
    for (let guard = 0; guard < 60 && !lit(root); guard++) {
      const cands = []; let idx = 0;
      (function walk(n, depth, parent, key) {
        const d = depth + (n.paren ? 1 : 0); const i = idx++;
        const kids = n.k === 'bin' || n.k === 'bool' ? [n.l, n.r] : n.k === 'un' || n.k === 'not' ? [n.e] : n.k === 'cmp' ? n.xs : [];
        if (kids.length && kids.every(lit)) cands.push({ n: n, d: d, lv: LEVEL[n.k === 'bin' ? n.op : n.k === 'bool' ? n.op : n.k], i: n.k === 'bin' && n.op === '**' ? -i : i, parent: parent, key: key });
        if (n.k === 'bin' || n.k === 'bool') { walk(n.l, d, n, 'l'); walk(n.r, d, n, 'r'); } else if (n.k === 'un' || n.k === 'not') walk(n.e, d, n, 'e'); else if (n.k === 'cmp') n.xs.forEach((x, j) => walk(x, d, n, j));
      })(root, 0, null, null);
      cands.sort((a, b) => b.d - a.d || a.lv - b.lv || a.i - b.i);
      const c = cands[0]; const n = c.n; const before = show(Object.assign({}, n, { paren: false }));
      let v;
      if (n.k === 'bin') v = binop(n.op, val(n.l), val(n.r), 1);
      else if (n.k === 'un') { const x = val(n.e); v = n.op === '-' ? (x.t === 'float' ? F(-x.v) : I(-x.v)) : x; }
      else if (n.k === 'not') v = B(!truthy(val(n.e)));
      else if (n.k === 'bool') { const a = val(n.l); v = n.op === 'and' ? (truthy(a) ? val(n.r) : a) : (truthy(a) ? a : val(n.r)); }
      else { let ok = true; for (let j = 0; j < n.ops.length; j++) if (!compare(n.ops[j], val(n.xs[j]), val(n.xs[j + 1]), 1)) { ok = false; break; } v = B(ok); }
      const nn = { k: 'val', v: v };
      if (!c.parent) root = nn; else if (c.parent.k === 'cmp') c.parent.xs[c.key] = nn; else c.parent[c.key] = nn;
      const kind = n.paren ? 'الأقواس' : n.k === 'bin' ? ({ '**': 'الأس', '*': 'الضرب', '/': 'القسمة', '//': 'القسمة الصحيحة', '%': 'باقي القسمة', '+': 'الجمع', '-': 'الطرح' })[n.op] : n.k === 'un' ? 'الإشارة' : n.k === 'not' ? 'not' : n.k === 'bool' ? n.op : 'المقارنة';
      steps.push({ kind: kind, expr: before, value: repr(v), whole: show(root) });
    }
    return { steps: steps, result: lit(root) ? val(root) : null };
  }
  PY.exprSteps = exprSteps;

  /* ---------- قواعد تسمية المتغيرات (ص 46) ونوع القيمة (ص 47) ---------- */
  PY.checkName = function (name) {
    const n = String(name);
    if (!n.length) return { ok: false, why: 'الاسم فارغ.' };
    if (/\s/.test(n)) return { ok: false, why: 'يحتوي على مسافة.', fix: n.trim().replace(/\s+/g, '_') };
    if (/^[0-9]/.test(n)) return { ok: false, why: 'يبدأ برقم.', fix: n.replace(/^([0-9]+)(.*)$/, '$2_$1').replace(/^_/, '') || '_' + n };
    if (/-/.test(n)) return { ok: false, why: 'يحتوي على شرطة «-» (تُقرأ طرحاً).', fix: n.replace(/-/g, '_') };
    if (/[^A-Za-z0-9_؀-ۿ]/.test(n)) return { ok: false, why: 'يحتوي على رمز خاص مثل # أو @ أو $.', fix: n.replace(/[^A-Za-z0-9_؀-ۿ]/g, '') || 'name' };
    if (KW.indexOf(n) >= 0) return { ok: false, why: 'كلمة محجوزة في بايثون.', fix: n + '_value' };
    const constant = /^[A-Z][A-Z0-9_]*$/.test(n) && /[A-Z]/.test(n);
    const snake = /^[a-z_][a-z0-9_]*$/.test(n);
    return { ok: true, why: constant ? 'صحيح، وبحروف كبيرة: يدل اصطلاحاً على ثابت.' : snake ? 'صحيح ويتبع طريقة snake_case.' : 'صحيح، لكن يفضّل الحروف الصغيرة مع _ (snake_case).', constant: constant, snake: snake };
  };
  PY.literalType = function (src) {
    try { const b = parse(src); if (b.length !== 1 || b[0].k !== 'expr') return { ok: false, why: 'اكتب قيمة واحدة فقط.' }; const r = run('__v = ' + src); if (r.error) return { ok: false, why: r.error.ar }; const v = r.env.__v; return { ok: true, t: TYPE[v.t], v: repr(v) }; }
    catch (e) { if (e instanceof PyErr) return { ok: false, why: e.ar }; throw e; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
