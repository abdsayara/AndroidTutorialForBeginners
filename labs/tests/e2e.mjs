// اختبار شامل في المتصفح: كل محاكاة/تجربة (الرياضيات + الفيزياء) × ثلاثة مقاسات شاشة × كل منزلق (أدنى/أعلى/منتصف/صفر) + الأزرار والرسوم والأوضاع
// التشغيل: node tests/e2e.mjs [baseURL] [--shots] [--only=id] [--subject=g10-physics]
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require(process.env.PW_PATH || '/opt/node-tools/node_modules/playwright'); }
const base = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'http://127.0.0.1:8765/index.html';
const shots = process.argv.includes('--shots');
const only = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7);
const subj = (process.argv.find((a) => a.startsWith('--subject=')) || '').slice(10);
const intl = process.argv.includes('--intl'); // الوضع الدولي؛ الافتراضي صيغة الكتاب العربية
const Q = intl ? '?n=intl' : '?n=ar';

const browser = await pw.chromium.launch({ executablePath: process.env.CHROME || undefined });
const sizes = [{ name: 'phone', width: 375, height: 760 }, { name: 'tablet', width: 820, height: 1100 }, { name: 'desktop', width: 1440, height: 900 }];
let failures = 0;
const fail = (m) => { failures++; console.log('  ✗ ' + m); };

for (const size of sizes) {
  const page = await browser.newPage({ viewport: { width: size.width, height: size.height } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await page.addInitScript(() => { window.__ft = []; const o = CanvasRenderingContext2D.prototype.fillText; CanvasRenderingContext2D.prototype.fillText = function (t, ...a) { if (window.__ft.length < 4000) window.__ft.push(String(t)); return o.call(this, t, ...a); }; });
  await page.goto(base + Q, { waitUntil: 'load' });
  await page.waitForSelector('.units');
  const sims = await page.evaluate(() => ML.sims.map((s) => ({ id: s.id, subject: s.subject, href: ML.simHref(s) })));
  console.log(`[${size.name}] ${sims.length} sims, katex=${await page.evaluate(() => !!window.katex)}`);
  // صفحتا المادتين والتنقل بين التبويبات
  for (const sl of ['math', 'physics']) {
    await page.goto(base + Q + '#/g10/' + sl); await page.waitForSelector('.units .card, .units a'); await page.waitForTimeout(150);
    const st = await page.evaluate(() => ({ n: document.querySelectorAll('.units a[href*="/sim/"]').length, on: (document.querySelector('.stab.on') || {}).textContent || '', g: (document.querySelector('.gtab.on') || {}).textContent || '' }));
    if (!st.n || !st.g) fail(`home ${sl}: links=${st.n} gradeTab=${st.g}`);
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); if (ov > 1) fail(`home ${sl}: horizontal overflow ${ov}px`);
    if (shots) await page.screenshot({ path: `tests/shots/home-${sl}-${size.name}.png`, fullPage: false });
  }
  for (const sm of sims) {
    const id = sm.id;
    if (only && id !== only) continue;
    if (subj && sm.subject !== subj) continue;
    errors.length = 0;
    await page.goto(base + Q + sm.href); await page.waitForSelector('.sim-grid canvas');
    await page.waitForTimeout(150);
    // كل منزلق: أدنى، أعلى، قيمة عشوائية
    const params = await page.evaluate(() => ML.current.sim.params.map((q) => ({ key: q.key, type: q.type || 'range', min: q.min, max: q.max })));
    for (const q of params) {
      const opts = q.type === 'select' ? await page.evaluate((k) => { const cur = ML.current; const qq = cur.sim.params.find((x) => x.key === k); return (typeof qq.options === 'function' ? qq.options(cur.p) : qq.options).map((o) => (isNaN(+o[0]) ? o[0] : +o[0])); }, q.key) : null;
      const vals = q.type === 'select' ? opts : q.type === 'toggle' ? [true, false] : [q.min, q.max, (q.min + q.max) / 2, q.min + (q.max - q.min) * 0.37].concat(q.min < 0 && q.max > 0 ? [0] : []);
      for (const v of vals) {
        await page.evaluate(([k, v]) => { const cur = ML.current; const qq = cur.sim.params.find((x) => x.key === k); const vv = (qq.type ? v : cur.fixParam(qq, v)); cur.set(k, vv); }, [q.key, v]);
        const bad = await page.evaluate(() => {
          const t = document.querySelector('.results').innerText + ' ' + document.querySelector('.live').innerText + ' ' + document.querySelector('.steps').innerText;
          return /NaN|undefined|Infinity(?!\))|\[object/.test(t) ? t.slice(0, 300) : null;
        });
        if (bad) fail(`${id} ${q.key}=${v}: bad text → ${bad.replace(/\s+/g, ' ')}`);
      }
    }
    // الأزرار
    await page.click('[data-a=rand]'); await page.waitForTimeout(520);
    if (await page.$('[data-a=play]')) {
      await page.click('[data-a=play]'); await page.waitForTimeout(sm.subject === 'g10-physics' ? 1500 : 400);
      if (await page.evaluate(() => ML.current.playing)) await page.click('[data-a=play]');
      const bad = await page.evaluate(() => { const t = document.querySelector('.results').innerText + ' ' + document.querySelector('.live').innerText; return /NaN|undefined|Infinity(?!\))|\[object/.test(t) ? t.slice(0, 300) : null; });
      if (bad) fail(`${id} after play: ${bad.replace(/\s+/g, ' ')}`);
    }
    // أنماط الرسم البياني الحي
    const gm = await page.$$('.gmodes button');
    for (const b of gm) { await b.click(); await page.waitForTimeout(60); const cap = await page.evaluate(() => (document.querySelector('.graph') || {}).innerText || ''); if (/NaN|undefined|\[object/.test(cap)) fail(`${id}: graph caption ${cap.slice(0, 200)}`); }
    if (sm.subject === 'g10-physics') { const ok = await page.evaluate(() => !!document.querySelector('.assume') && !!document.querySelector('.graph canvas')); if (!ok) fail(`${id}: missing assumptions box or live graph`); }
    await page.click('[data-a=reset]'); await page.waitForTimeout(520);
    // الأوضاع
    for (const m of ['learn', 'challenge', 'explore']) { await page.click(`.modes [data-m=${m}]`); await page.waitForTimeout(80); }
    // جميع التحديات: نطبّق init ثم نتحقق أن الحالة الابتدائية ليست محلولة مسبقاً
    const nCh = await page.evaluate(() => ML.current.sim.challenges.length);
    for (let i = 0; i < nCh; i++) {
      await page.evaluate((i) => { ML.current.chIdx = i; ML.current.setMode('challenge'); }, i);
      await page.waitForTimeout(520);
      const solved = await page.evaluate(() => document.querySelector('.ch-status').classList.contains('ok'));
      if (solved) fail(`${id}: challenge ${i + 1} is already solved by its init state`);
    }
    // صيغة الكتاب: لا أرقام إنجليزية في النصوص الظاهرة ولا على الرسوم (Canvas)
    if (!intl) {
      const asc = await page.evaluate(() => {
        const out = [];
        document.querySelectorAll('.results, .live, .steps, .law, .why, .controls .param label, .graph .gcap, .assume, .sim-head .src').forEach((e) => { const t = e.innerText; if (/[0-9]/.test(t)) out.push(t.match(/.{0,30}[0-9].{0,20}/)[0]); });
        const cv = window.__ft.map((t) => t.replace(/[\u2066-\u2069]/g, '').replace(/\b[HNOC]₂/g, '')).filter((t) => /[0-9]/.test(t) || /(^|[^A-Za-z])[A-Za-z]($|[^A-Za-z])/.test(t));
        window.__ft.length = 0; return out.concat(cv.map((t) => 'canvas: ' + t)).slice(0, 5);
      });
      if (asc.length) fail(`${id}: western digits/latin symbols → ${asc.join(' | ')}`);
    }
    // المساعد
    await page.click('.tutor .fab');
    const chips = await page.$$('.tutor .chip');
    for (const c of chips) await c.click();
    await page.fill('.tutor form input', 'اشرح الدرس'); await page.press('.tutor form input', 'Enter');
    await page.waitForTimeout(200);
    const tutorBad = await page.evaluate(() => { const t = document.querySelector('.msgs').innerText; return /NaN|undefined|\[object/.test(t) ? t.slice(-300) : null; });
    if (tutorBad) fail(`${id}: tutor text → ${tutorBad}`);
    await page.click('.tutor .x');
    // لا تمرير أفقي للصفحة
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 1) fail(`${id}: horizontal overflow ${overflow}px`);
    if (errors.length) fail(`${id}: ${errors.join(' | ')}`);
    if (shots) await page.screenshot({ path: `tests/shots/${id}-${size.name}.png`, fullPage: size.name === 'phone' });
  }
  await page.close();
}
await browser.close();
console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL E2E CHECKS PASSED');
process.exit(failures ? 1 : 0);
