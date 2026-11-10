// Cities shown in the app. Shared with the browser via /api/cities.

export const REGIONS = {
  westbank: 'الضفة',
  gaza: 'قطاع غزة',
  interior: 'الداخل',
};

export const CITIES = [
  { id: 'jerusalem', name: 'القدس', lat: 31.7683, lon: 35.2137, region: 'westbank', major: true },
  { id: 'ramallah', name: 'رام الله', lat: 31.9038, lon: 35.2034, region: 'westbank', major: false },
  { id: 'nablus', name: 'نابلس', lat: 32.2211, lon: 35.2544, region: 'westbank', major: true },
  { id: 'jenin', name: 'جنين', lat: 32.4646, lon: 35.3027, region: 'westbank', major: false },
  { id: 'tulkarm', name: 'طولكرم', lat: 32.3104, lon: 35.0286, region: 'westbank', major: false },
  { id: 'qalqilya', name: 'قلقيلية', lat: 32.1896, lon: 34.9706, region: 'westbank', major: false },
  { id: 'hebron', name: 'الخليل', lat: 31.5326, lon: 35.0998, region: 'westbank', major: true },
  { id: 'bethlehem', name: 'بيت لحم', lat: 31.7054, lon: 35.2024, region: 'westbank', major: false },
  { id: 'jericho', name: 'أريحا', lat: 31.8667, lon: 35.4444, region: 'westbank', major: true },
  { id: 'tubas', name: 'طوباس', lat: 32.3209, lon: 35.3699, region: 'westbank', major: false },
  { id: 'salfit', name: 'سلفيت', lat: 32.0836, lon: 35.1806, region: 'westbank', major: false },
  { id: 'gaza', name: 'غزة', lat: 31.5017, lon: 34.4668, region: 'gaza', major: true },
  { id: 'khanyunis', name: 'خان يونس', lat: 31.3462, lon: 34.3063, region: 'gaza', major: false },
  { id: 'rafah', name: 'رفح', lat: 31.2969, lon: 34.2654, region: 'gaza', major: false },
  { id: 'deirbalah', name: 'دير البلح', lat: 31.4181, lon: 34.3517, region: 'gaza', major: false },
  { id: 'haifa', name: 'حيفا', lat: 32.794, lon: 34.9896, region: 'interior', major: true },
  { id: 'akka', name: 'عكا', lat: 32.9281, lon: 35.0818, region: 'interior', major: false },
  { id: 'jaffa', name: 'يافا', lat: 32.0504, lon: 34.752, region: 'interior', major: true },
  { id: 'lydd', name: 'اللد', lat: 31.9514, lon: 34.8955, region: 'interior', major: false },
  { id: 'nazareth', name: 'الناصرة', lat: 32.6996, lon: 35.3035, region: 'interior', major: true },
  { id: 'safad', name: 'صفد', lat: 32.9646, lon: 35.496, region: 'interior', major: false },
  { id: 'tiberias', name: 'طبريا', lat: 32.7922, lon: 35.5312, region: 'interior', major: false },
  { id: 'beersheba', name: 'بئر السبع', lat: 31.2518, lon: 34.7913, region: 'interior', major: true },
  { id: 'umrashrash', name: 'أم الرشراش', lat: 29.5577, lon: 34.9519, region: 'interior', major: true },
];

export const cityById = (id) => CITIES.find((c) => c.id === id);

// West Bank towns tied to their governorate's city, so a village is placed in the right
// governorate rather than simply the nearest city (ترمسعيا is in رام الله, not سلفيت).
// Positions are approximate (town centres).
const ANCHORS = [
  ['ramallah', 31.968, 35.197], ['ramallah', 32.031, 35.265], ['ramallah', 31.912, 35.272], ['ramallah', 31.872, 35.06],
  ['ramallah', 31.951, 35.023], ['ramallah', 32.006, 35.07], ['ramallah', 31.984, 35.286], ['ramallah', 31.935, 35.335],
  ['nablus', 32.13, 35.34], ['nablus', 32.144, 35.288], ['nablus', 32.155, 35.256], ['nablus', 32.1, 35.28], ['nablus', 32.27, 35.2],
  ['salfit', 32.11, 35.08], ['salfit', 32.12, 35.15], ['salfit', 32.06, 35.14],
  ['hebron', 31.507, 35.028], ['hebron', 31.446, 35.09], ['hebron', 31.515, 35.165], ['hebron', 31.58, 35.1], ['hebron', 31.62, 35.1],
  ['hebron', 31.58, 35.14], ['hebron', 31.41, 34.97], ['hebron', 31.4, 35.07], ['hebron', 31.552, 35.106],
  ['bethlehem', 31.704, 35.226], ['bethlehem', 31.715, 35.187], ['bethlehem', 31.69, 35.165], ['bethlehem', 31.635, 35.215],
  ['bethlehem', 31.62, 35.155], ['bethlehem', 31.72, 35.27],
  ['jerusalem', 31.771, 35.264], ['jerusalem', 31.762, 35.262], ['jerusalem', 31.85, 35.233], ['jerusalem', 31.835, 35.26],
  ['jenin', 32.447, 35.17], ['jenin', 32.41, 35.28], ['jenin', 32.409, 35.199], ['jenin', 32.46, 35.27],
  ['tulkarm', 32.307, 35.12], ['tulkarm', 32.33, 35.11], ['tulkarm', 32.355, 35.08],
  ['qalqilya', 32.17, 35.06], ['qalqilya', 32.16, 34.98],
  ['tubas', 32.28, 35.385], ['tubas', 32.33, 35.41], ['jericho', 31.95, 35.46],
].map(([id, lat, lon]) => ({ id, lat, lon }));

/** The governorate city a West Bank place belongs to, else the nearest listed city. */
export function areaCity(lat, lon) {
  const { city, km } = nearestCity(lat, lon);
  if (city.region !== 'westbank') return city;
  let best = city;
  let bestD = km;
  for (const a of ANCHORS) {
    const d = distanceKm(lat, lon, a.lat, a.lon);
    if (d < bestD) { best = cityById(a.id); bestD = d; }
  }
  return best;
}

export function distanceKm(lat1, lon1, lat2, lon2) {
  const r = 6371;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(a));
}

export function nearestCity(lat, lon) {
  let best = CITIES[0];
  let bestD = Infinity;
  for (const c of CITIES) {
    const d = distanceKm(lat, lon, c.lat, c.lon);
    if (d < bestD) { best = c; bestD = d; }
  }
  return { city: best, km: bestD };
}

/** Arabic place description relative to the nearest known city. */
export function describePlace(lat, lon) {
  const { city, km } = nearestCity(lat, lon);
  const k = Math.round(km);
  return k <= 5 ? `قرب ${city.name}` : `${k} كم من ${city.name}`;
}
