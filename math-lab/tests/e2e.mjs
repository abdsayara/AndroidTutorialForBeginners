// اختبار شامل في المتصفح: كل محاكاة × ثلاثة مقاسات شاشة × كل منزلق (أدنى/أعلى/عشوائي) + الأزرار
// التشغيل: node tests/e2e.mjs [baseURL] [--shots]
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require(process.env.PW_PATH || '/opt/node-tools/node_modules/playwright'); }
const base = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'http://127.0.0.1:8765/index.html';
const shots = process.argv.includes('--shots');
const only = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7);

const browser = await pw.chromium.launch({ executablePath: process.env.CHROME || undefined });
const sizes = [{ name: 'phone', width: 375, height: 760 }, { name: 'tablet', width: 820, height: 1100 }, { name: 'desktop', width: 1440, height: 900 }];
let failures = 0;
const fail = (m) => { failures++; console.log('  ✗ ' + m); };

for (const size of sizes) {
  const page = await browser.newPage({ viewport: { width: size.width, height: size.height } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await page.goto(base, { waitUntil: 'load' });
  await page.waitForSelector('.units');
  const ids = await page.evaluate(() => ML.sims.map((s) => s.id));
  console.log(`[${size.name}] ${ids.length} sims, katex=${await page.evaluate(() => !!window.katex)}`);
  if (shots) await page.screenshot({ path: `tests/shots/home-${size.name}.png`, fullPage: false });
  for (const id of ids) {
    if (only && id !== only) continue;
    errors.length = 0;
    await page.goto(base + '#/sim/' + id); await page.waitForSelector('.sim-grid canvas');
    await page.waitForTimeout(150);
    // كل منزلق: أدنى، أعلى، قيمة عشوائية
    const params = await page.evaluate(() => ML.current.sim.params.map((q) => ({ key: q.key, type: q.type || 'range', min: q.min, max: q.max, options: q.options ? q.options.map((o) => o[0]) : null })));
    for (const q of params) {
      const vals = q.type === 'select' ? q.options : q.type === 'toggle' ? [true, false] : [q.min, q.max, (q.min + q.max) / 2, q.min + (q.max - q.min) * 0.37];
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
    if (await page.$('[data-a=play]')) { await page.click('[data-a=play]'); await page.waitForTimeout(400); await page.click('[data-a=play]'); }
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
