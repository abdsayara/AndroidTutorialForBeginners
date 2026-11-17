// Observed weather pictures for the map's moving layers, in place of model guesses:
// - rain: the Israel Meteorological Service's rain radar (a frame every five minutes);
// - clouds: EUMETSAT's infrared satellite picture (Meteosat Third Generation, every ten minutes);
// - storms: the same satellite's Lightning Imager (flashes) over the clouds.
// The radar frames are passed through our server; the satellite pictures come from EUMETSAT's
// open map service directly.
import { imageUrl as satImageUrl } from './satellite.js';

// ---------------------------------------------------------------- the rain radar (IMS)

const IMS = 'https://ims.gov.il';
export const IMS_LIST_URL = `${IMS}/radar_satellite`;
/** The radar picture's corners, as the IMS map places it (its own web page): west, south, east, north. */
export const RADAR_BBOX = [31.7662931774178858, 29.4468656950938161, 37.864813247553009, 34.5318966003582659];
const RADAR_FILE = /^IMSRadar4GIS_(\d{12})_0\.png$/;
export const radarFileUrl = (file) => `${IMS}/sites/default/files/ims_data/map_images/IMSRadar4GIS/${file}`;
export const isRadarFile = (file) => RADAR_FILE.test(String(file ?? ''));

/** "2026-11-17 18:05:00" on Israel's clock (as IMS writes it) → an ISO time. */
export function imsTime(local) {
  const m = /^(\d{4})-(\d\d)-(\d\d)[ T](\d\d):(\d\d)/.exec(String(local ?? ''));
  if (!m) return null;
  const asUtc = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  // The zone's offset at that moment: format the instant there and compare.
  const zoned = new Date(new Date(asUtc).toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
  const utcView = new Date(new Date(asUtc).toLocaleString('en-US', { timeZone: 'UTC' }));
  return new Date(asUtc - (zoned - utcView)).toISOString();
}

/** The radar frames from IMS's list, oldest first: [{ time, file }]. Empty while the radar is off. */
export function parseRadar(json) {
  const d = json?.data ?? {};
  if (String(d.rain_radar_is_active ?? '1') === '0') return [];
  const out = [];
  for (const item of d.types?.IMSRadar ?? []) {
    const file = String(item.file_name ?? '').split('/').pop();
    const time = imsTime(item.forecast_time);
    if (isRadarFile(file) && time) out.push({ time, file });
  }
  return out.sort((a, b) => a.time.localeCompare(b.time)).slice(-24);
}

// ---------------------------------------------------------------- the satellite (EUMETSAT)

/** The part of the world the map's satellite pictures cover: west, south, east, north (degrees). */
export const SAT_BBOX = [33, 29, 37, 34];
const SAT_SIZE = [480, 600];
const CLOUDS = { layer: 'mtg_fd:ir105_hrfi', style: 'mtg_fd:mtg_fd_ir105_hrfi_style_02' };
const CLOUDS_GREY = { layer: 'mtg_fd:ir105_hrfi', style: 'mtg_fd:mtg_fd_ir105_hrfi_grayscale' };
const LIGHTNING = { layer: 'mtg_fd:li_afa', style: 'mtg_li_afa' };

/** Two hours of ten-minute steps ending at `latest`, oldest first. */
export function satTimes(latest, count = 13) {
  const end = Math.floor(new Date(latest).getTime() / 600000) * 600000;
  return Array.from({ length: count }, (_, i) => new Date(end - (count - 1 - i) * 600000).toISOString());
}

/** A satellite picture over the map's area, with nothing but the layer itself (no borders: the map draws its own). */
const satPicture = (l, time, format) => {
  const u = new URL(satImageUrl({ layer: l.layer, style: l.style }, time, SAT_SIZE[0], SAT_SIZE[1], SAT_BBOX));
  // satellite.js adds borders and coasts for its own page; the map has them already.
  u.searchParams.set('layers', l.layer);
  u.searchParams.set('styles', l.style);
  u.searchParams.set('format', format);
  if (format === 'image/png') u.searchParams.set('transparent', 'true');
  return u.toString();
};

/**
 * What the map draws for a layer: the box the pictures cover, whether it is in the web-map
 * projection (the radar) or plain degrees (the satellite), and one frame per time.
 * Each frame lists its pictures, bottom first, with how strongly to draw each.
 */
export function imagery(layer, { radar = [], cloudsAt = null, lightningAt = null } = {}) {
  if (layer === 'rain') {
    return {
      layer, bbox: RADAR_BBOX, mercator: true, source: 'IMS',
      times: radar.map((f) => f.time),
      frames: radar.map((f) => [{ url: `/api/radar-frame?f=${encodeURIComponent(f.file)}`, alpha: 0.85 }]),
    };
  }
  const latest = layer === 'storms' && lightningAt && cloudsAt ? (lightningAt < cloudsAt ? lightningAt : cloudsAt) : cloudsAt;
  if (!latest) return { layer, bbox: SAT_BBOX, mercator: false, source: 'EUMETSAT', times: [], frames: [] };
  const times = satTimes(latest);
  const frames = times.map((t) => (layer === 'storms'
    ? [{ url: satPicture(CLOUDS_GREY, t, 'image/jpeg'), alpha: 0.75 }, { url: satPicture(LIGHTNING, t, 'image/png'), alpha: 1, glow: true }]
    : [{ url: satPicture(CLOUDS, t, 'image/jpeg'), alpha: 0.92 }]));
  return { layer, bbox: SAT_BBOX, mercator: false, source: 'EUMETSAT', times, frames };
}
