// The share card: one 1080x1350 picture of the weather for a place, made on a canvas,
// shared through the system sheet where the browser can, downloaded where it cannot.
import { weatherIcon } from './icons.js';
import { weatherText, arabicDate } from './format.js';
import { summarize, skyKind } from './insights.js';

const W = 1080;
const H = 1350;
const SITE = 'palestine-weather.vercel.app';
const FONT = "'Readex Pro', system-ui, sans-serif";
const DISPLAY = "'Readex Pro', system-ui, sans-serif";

/** Background stops per kind of sky; the same moods as the hero. */
const SKIES = {
  day: ['#2A86C6', '#1F74B0', '#165A8A'],
  night: ['#1C3A5E', '#16304F', '#0E2038'],
  dusk: ['#D2733E', '#A44F27', '#5E3550'],
  cloudy: ['#6A8597', '#4A6476', '#34495A'],
  fog: ['#8293A0', '#5E707B', '#46545E'],
  rain: ['#3F5F78', '#2E4A60', '#1F3346'],
  storm: ['#2E4157', '#213042', '#141E2B'],
  snow: ['#7194B3', '#4B6E8C', '#355069'],
};

const plainDeg = (v) => (v == null ? '—' : `${Math.round(v)}°`);

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** The weather icon as an image: CSS variables have no meaning inside an <img>, so they become colours. */
function iconImage(code, isDay, size) {
  const svg = weatherIcon(code, { isDay, size, cloudColor: '#FFFFFF', sunColor: '#FAAE3C' })
    .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')
    .replace(/var\(--blue\)/g, '#BFE0FF');
  return loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
}

/** Splits `text` into lines no wider than `max`. */
function wrap(ctx, text, max) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > max && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Draws the card and resolves to a PNG blob. */
export async function shareCardBlob(placeName, fc) {
  await document.fonts?.ready;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const c = fc.current;
  const today = fc.days[0] ?? {};

  const stops = SKIES[skyKind(fc, c.time)] ?? SKIES.day;
  const g = ctx.createLinearGradient(0, 0, W * 0.3, H);
  stops.forEach((col, i) => g.addColorStop(i / (stops.length - 1), col));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // A soft light behind the icon.
  const glow = ctx.createRadialGradient(250, 470, 20, 250, 470, 420);
  glow.addColorStop(0, 'rgba(255,255,255,0.20)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  const R = W - 84; // the right content edge; the left one is 84

  // Brand row: the logo on a white tile, then the name.
  const logo = await loadImage('/logo.svg').catch(() => null);
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, R - 112, 76, 112, 92, 24);
  ctx.fill();
  if (logo) ctx.drawImage(logo, R - 102, 88, 92, 70);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `700 40px ${DISPLAY}`;
  ctx.fillText('طقس فلسطين', R - 136, 136);

  // Place and date.
  ctx.font = `800 84px ${DISPLAY}`;
  ctx.fillText(placeName, R, 320);
  ctx.font = `500 36px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText(arabicDate(), R, 380);

  // Temperature, condition and icon.
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `800 260px ${DISPLAY}`;
  ctx.direction = 'ltr';
  ctx.textAlign = 'right';
  ctx.fillText(plainDeg(c.temp), R, 660);
  ctx.direction = 'rtl';
  ctx.font = `600 52px ${FONT}`;
  ctx.fillText(weatherText(c.code), R, 750);
  const icon = await iconImage(c.code, c.isDay, 300).catch(() => null);
  if (icon) ctx.drawImage(icon, 90, 330, 330, 330);

  // Facts: high, low, rain and wind, as four tiles.
  const facts = [
    ['العظمى', plainDeg(today.max)],
    ['الصغرى', plainDeg(today.min)],
    ['المطر', `${today.precipProbMax ?? 0}%`],
    ['الرياح', `${Math.round(c.wind ?? 0)} كم/س`],
  ];
  const gap = 20;
  const tw = (R - 84 - gap * 3) / 4;
  facts.forEach(([label, value], i) => {
    const x = R - (i + 1) * tw - i * gap;
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    roundRect(ctx, x, 820, tw, 150, 28);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = `500 30px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(label, x + tw / 2, 875);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `700 42px ${FONT}`;
    ctx.fillText(value, x + tw / 2, 940);
  });
  ctx.textAlign = 'right';

  // The summary sentence.
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `500 40px ${FONT}`;
  wrap(ctx, summarize(fc, c.time), R - 84).slice(0, 3).forEach((line, i) => ctx.fillText(line, R, 1060 + i * 62));

  // Footer: the address.
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(84, H - 130, R - 84, 2);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = `500 32px ${FONT}`;
  ctx.direction = 'ltr';
  ctx.textAlign = 'left';
  ctx.fillText(SITE, 84, H - 70);
  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  ctx.fillText('الطقس في كل مدينة وقرية فلسطينية', R, H - 70);

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

/** Opens a sheet with the card, a share button where the browser can share files, and a download. */
export async function openShare(placeName, fc) {
  const blob = await shareCardBlob(placeName, fc);
  if (!blob) return;
  const file = new File([blob], 'palestine-weather.png', { type: 'image/png' });
  const url = URL.createObjectURL(blob);
  const canShare = !!navigator.canShare?.({ files: [file] });
  const text = `الطقس في ${placeName}: ${plainDeg(fc.current.temp)}، ${weatherText(fc.current.code)} — ${SITE}`;

  const dlg = document.createElement('dialog');
  dlg.className = 'share-sheet';
  dlg.setAttribute('aria-label', 'مشاركة الطقس');
  dlg.innerHTML = `
    <img src="${url}" alt="بطاقة الطقس في ${placeName.replace(/[<>"&]/g, '')}" width="540" height="675">
    <div class="share-actions">
      ${canShare ? '<button class="btn primary" data-share>مشاركة الصورة</button>' : ''}
      <a class="btn ${canShare ? '' : 'primary'}" href="${url}" download="palestine-weather.png">تنزيل الصورة</a>
      <button class="btn ghost" data-close>إغلاق</button>
    </div>`;
  document.body.append(dlg);
  const close = () => { dlg.close(); dlg.remove(); URL.revokeObjectURL(url); };
  dlg.addEventListener('click', async (e) => {
    if (e.target === dlg || e.target.closest('[data-close]')) close();
    else if (e.target.closest('[data-share]')) {
      try { await navigator.share({ files: [file], title: 'طقس فلسطين', text }); close(); } catch { /* cancelled */ }
    }
  });
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  dlg.showModal();
}
