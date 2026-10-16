// Line icons (24×24, 2px stroke) and drawn weather icons, as SVG strings.

const svg = (body, size = 22, extra = '') =>
  `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${body}</svg>`;

const P = {
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
  pin: '<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  leaf: '<path d="M5 19C5 10 11 5 20 4c-1 9-6 15-15 15z"/><path d="M5 19l7-7"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  road: '<path d="M8 3L4 21M16 3l4 18"/><path d="M12 4v2.5M12 10.5v3M12 17.5V20"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  // In RTL, "back" points right and "forward" points left.
  back: '<path d="M9 6l6 6-6 6"/>',
  forward: '<path d="M15 6l-6 6 6 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
  star: '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/>',
  play: '<path d="M17 5v14L6 12z" fill="currentColor"/>',
  pause: '<path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  regions: '<path d="M4 4h4M12 4h4M20 4v4M20 12v4M20 20h-4M12 20H8M4 20v-4M4 12V8"/>',
  locate: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  wind: '<path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="M12 12l5-7-2 8z"/>',
  news: '<path d="M4 5h13v14H6a2 2 0 0 1-2-2z"/><path d="M17 9h3v8a2 2 0 0 1-2 2"/><path d="M8 9h5M8 13h5"/>',
  coins: '<circle cx="9" cy="9" r="6"/><path d="M15.5 9.6A6 6 0 1 1 9.6 15.5"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  arrowUp: '<path d="M12 20V4M5 11l7-7 7 7"/>',
  thermo: '<path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/>',
  wave: '<path d="M2 12h4l2-6 3 12 3-9 2 3h6"/>',
};

export const icon = (name, size, extra) => svg(P[name] ?? '', size, extra);
export const starFilled = (size = 20) =>
  `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${P.star}</svg>`;

// ---------------------------------------------------------------- weather icons

function kind(code, isDay) {
  if (code === 0 || code === 1) return isDay ? 'sun' : 'moon';
  if (code === 2) return isDay ? 'partly' : 'partly-night';
  if (code === 3) return 'cloud';
  if (code === 45 || code === 48) return 'fog';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 95) return 'storm';
  return 'cloud';
}

const sun = (cx, cy, r, color) => {
  let rays = '';
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const x1 = cx + Math.cos(a) * r * 1.45, y1 = cy + Math.sin(a) * r * 1.45;
    const x2 = cx + Math.cos(a) * r * 2, y2 = cy + Math.sin(a) * r * 2;
    rays += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>`;
  }
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>${rays}`;
};
const cloud = (dy, color) =>
  `<path d="M7 ${18 + dy}h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6 ${9.5 + dy} 4.25 4.25 0 0 0 7 ${18 + dy}z" fill="${color}"/>`;

/** A small drawn weather icon for a WMO code. */
export function weatherIcon(code, { isDay = true, size = 24, cloudColor = 'var(--muted)', sunColor = 'var(--amber)' } = {}) {
  const k = kind(code, isDay);
  let body;
  switch (k) {
    case 'sun': body = sun(12, 12, 4.2, sunColor); break;
    case 'moon': body = `<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" fill="${cloudColor}"/>`; break;
    case 'partly': body = sun(8.5, 8, 2.8, sunColor) + cloud(2, cloudColor); break;
    case 'partly-night': body = `<path d="M12 8.5A4.5 4.5 0 0 1 6.5 3a4.5 4.5 0 1 0 5.5 5.5z" fill="${cloudColor}" opacity="0.75"/>` + cloud(2, cloudColor); break;
    case 'cloud': body = cloud(0, cloudColor); break;
    case 'fog': body = [8, 12, 16].map((y) => `<line x1="4" y1="${y}" x2="20" y2="${y}" stroke="${cloudColor}" stroke-width="2" stroke-linecap="round"/>`).join(''); break;
    case 'rain': body = cloud(-3, cloudColor) + [8, 12, 16].map((x) => `<line x1="${x}" y1="18" x2="${x - 1}" y2="21" stroke="var(--blue)" stroke-width="2" stroke-linecap="round"/>`).join(''); break;
    case 'snow': body = cloud(-3, cloudColor) + [8, 12, 16].map((x) => `<circle cx="${x}" cy="20" r="1.2" fill="var(--blue)"/>`).join(''); break;
    default: body = cloud(-3, cloudColor) + `<path d="M13 15l-3 4h3l-2 4" fill="none" stroke="${sunColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  return `<svg class="wx" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
}
