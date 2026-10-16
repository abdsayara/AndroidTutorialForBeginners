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
