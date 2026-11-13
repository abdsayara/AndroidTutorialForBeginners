// The «شو نلبس؟» avatar: a small figure dressed for the day. Drawn on a 120×120 grid; the
// Android app draws the same figure (ui/components/WearAvatar.kt).
const SKIN = '#F2C29B';
const OUTFIT = {
  cold: { top: '#C8453B', legs: '#2E4A6B' },
  cool: { top: '#2F6FB5', legs: '#33475E' },
  mild: { top: '#2F9E6E', legs: '#3B4F66' },
  warm: { top: '#F2B33D', legs: '#5A7FA8' },
};

export function wearAvatar({ kind, rain }, size = 96) {
  const o = OUTFIT[kind] ?? OUTFIT.mild;
  const shortSleeves = kind === 'warm';
  const parts = [];
  // Umbrella behind the figure, held in the right hand.
  if (rain) parts.push(`<path d="M22 30 Q66 -8 110 30 Q99 23 88 30 Q77 23 66 30 Q55 23 44 30 Q33 23 22 30Z" fill="#3E7CC4"/>
    <path d="M88 28 V88 Q88 94 83 94" fill="none" stroke="#2B2B2B" stroke-width="2.6" stroke-linecap="round"/>`);
  // Legs and shoes.
  parts.push(`<rect x="46" y="86" width="11" height="26" rx="5" fill="${o.legs}"/><rect x="63" y="86" width="11" height="26" rx="5" fill="${o.legs}"/>
    <ellipse cx="50" cy="113" rx="8" ry="4" fill="#2B2B2B"/><ellipse cx="70" cy="113" rx="8" ry="4" fill="#2B2B2B"/>`);
  // Arms (short sleeves show skin) with their hands; each turns at its shoulder. The free hand waves.
  for (const [x, side] of [[28, 'l'], [80, 'r']]) {
    const waves = rain ? side === 'l' : side === 'r';
    parts.push(`<g class="arm${waves ? ' waver' : ''} arm-${side}" style="transform-origin:${x + 6}px 62px">
      <rect x="${x}" y="60" width="12" height="27" rx="6" fill="${shortSleeves ? SKIN : o.top}"/>
      ${shortSleeves ? `<rect x="${x}" y="58" width="12" height="12" rx="5" fill="${o.top}"/>` : ''}
      <circle cx="${x + 6}" cy="88" r="5.5" fill="${SKIN}"/></g>`);
  }
  parts.push(`<rect x="38" y="55" width="44" height="37" rx="14" fill="${o.top}"/>`);
  if (kind === 'cool' || kind === 'cold') parts.push('<path d="M60 58 V91" stroke="#fff" stroke-opacity=".55" stroke-width="2"/>');
  if (kind === 'cold') parts.push('<rect x="43" y="51" width="34" height="9" rx="4.5" fill="#F2B33D"/><rect x="65" y="56" width="7" height="20" rx="3" fill="#F2B33D"/>');
  // Head and face.
  parts.push(`<circle cx="60" cy="38" r="18" fill="${SKIN}"/>
    <circle cx="49" cy="43.5" r="3.2" fill="#F08A8A" fill-opacity=".45"/><circle cx="71" cy="43.5" r="3.2" fill="#F08A8A" fill-opacity=".45"/>
    <path d="M53 45 Q60 51 67 45" fill="none" stroke="#5B3A29" stroke-width="2.2" stroke-linecap="round"/>`);
  if (kind === 'warm') parts.push('<rect x="47" y="33" width="11" height="7" rx="3" fill="#1F2A36"/><rect x="62" y="33" width="11" height="7" rx="3" fill="#1F2A36"/><path d="M58 36 H62" stroke="#1F2A36" stroke-width="2"/>');
  else parts.push('<circle cx="53" cy="37" r="2.3" fill="#2B2B2B"/><circle cx="67" cy="37" r="2.3" fill="#2B2B2B"/>');
  // Hair or hat.
  if (kind === 'cold') parts.push('<path d="M41 33 Q41 15 60 15 Q79 15 79 33 Z" fill="#2F6FB5"/><rect x="40" y="29" width="40" height="7" rx="3.5" fill="#24599A"/><circle cx="60" cy="14" r="4.5" fill="#fff"/>');
  else if (kind === 'warm') parts.push('<path d="M42 30 Q42 18 60 18 Q78 18 78 30 Z" fill="#E8505B"/><rect x="58" y="27" width="30" height="5" rx="2.5" fill="#C93C47"/>');
  else parts.push('<path d="M42 36 Q42 18 60 18 Q78 18 78 36 Q71 27 60 27 Q49 27 42 36Z" fill="#4A3426"/>');
  return `<svg class="wear-avatar${rain ? ' rain' : ''}" viewBox="0 0 120 120" width="${size}" height="${size}" role="button" tabindex="0" aria-label="سلّم" data-action="wave">${parts.join('')}</svg>`;
}
