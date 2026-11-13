// Live satellite pictures of the region, from EUMETSAT's open map service (EUMETView WMS):
// the Meteosat Third Generation full-disc imagery, a new picture every ten minutes.

const WMS = 'https://view.eumetsat.int/geoserver/ows';
export const CAPABILITIES_URL = 'https://view.eumetsat.int/geoserver/mtg_fd/ows?service=WMS&request=GetCapabilities&version=1.3.0';

/** The part of the world shown: Turkey down to Yemen, Egypt across to the Gulf (west, south, east, north). */
export const BBOX = [24, 12, 50, 46];
const BORDERS = 'backgrounds:ne_boundary_lines_land,backgrounds:ne_10m_coastline';

/** The pictures offered, in the order of the picker. `style` is the WMS style of the first layer. */
export const LAYERS = [
  { id: 'clouds', title: 'درجة حرارة السحب', layer: 'mtg_fd:ir105_hrfi', style: 'mtg_fd:mtg_fd_ir105_hrfi_style_02', hint: 'الألوان تدل على السحب العالية الباردة، وهي الأغزر مطراً' },
  { id: 'natural', title: 'صور طبيعية ملوّنة', layer: 'mtg_fd:rgb_geocolour', style: '', hint: 'كما تُرى الأرض من الفضاء، نهاراً وليلاً' },
  { id: 'dust', title: 'أماكن تشكّل الغبار', layer: 'mtg_fd:rgb_dust', style: '', hint: 'الغبار يظهر باللون الوردي والبنفسجي الفاقع' },
  { id: 'fog', title: 'الضباب', layer: 'mtg_fd:rgb_fog', style: '', hint: 'الضباب والسحب المنخفضة تظهر بلون فاتح مائل للخضرة' },
];

/** The time of the newest picture, from the service's capabilities document; null when not found. */
export function parseLatestTime(xml) {
  const at = xml.indexOf('<Name>rgb_geocolour</Name>');
  const from = at >= 0 ? at : xml.indexOf('<Dimension name="time"');
  const m = /<Dimension name="time"[^>]*default="([^"]+)"/.exec(xml.slice(Math.max(0, from)));
  const t = m && new Date(m[1]);
  return t && !Number.isNaN(t.getTime()) ? t.toISOString() : null;
}

/** When the capabilities can't be read: the ten-minute slot half an hour ago, which is always there. */
export function fallbackTime(now = Date.now()) {
  return new Date(Math.floor((now - 30 * 60000) / 600000) * 600000).toISOString();
}

/** A picture's address: one layer over the region at a time, with borders and coasts drawn on. */
export function imageUrl(l, time, width, height, bbox = BBOX) {
  const q = new URLSearchParams({
    service: 'WMS', version: '1.1.1', request: 'GetMap', layers: `${l.layer},${BORDERS}`, styles: `${l.style},,`,
    srs: 'EPSG:4326', bbox: bbox.join(','), width: String(width), height: String(height), format: 'image/jpeg', time,
  });
  return `${WMS}?${q}`;
}

/** The pictures of the last two hours, oldest first, one every twenty minutes, ending at [time]. */
export function frameTimes(time, count = 7, stepMinutes = 20) {
  const end = new Date(time).getTime();
  return Array.from({ length: count }, (_, i) => new Date(end - (count - 1 - i) * stepMinutes * 60000).toISOString());
}

/**
 * What the site and the app show: the newest picture's time, the region, the times of the
 * moving pictures, and for each layer its thumbnail and one picture per time (the last is the newest).
 */
export function satellite(time) {
  // The home tile and the picker's thumbnails look closer, at the Levant.
  const near = [29, 24, 43, 38];
  const times = frameTimes(time);
  return {
    time, bbox: BBOX, times,
    layers: LAYERS.map((l) => ({
      id: l.id, title: l.title, hint: l.hint,
      image: imageUrl(l, time, 780, 1020),
      thumb: imageUrl(l, time, 320, 320, near),
      frames: times.map((t) => imageUrl(l, t, 780, 1020)),
    })),
  };
}
