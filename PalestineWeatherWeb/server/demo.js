// Demo mode (DEMO=1): a fake `fetch` that answers every upstream URL with generated,
// plausible-looking sample data, so the site can be tried and tested offline.
// The UI shows a banner whenever demo data is in use.

const pad = (n) => String(n).padStart(2, '0');
const isoHour = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:00`;
const isoDay = (d) => isoHour(d).slice(0, 10);
const OFFSET = 3 * 3600 * 1000; // Palestine summer time; good enough for samples

/** Deterministic pseudo-random in [0,1) from numbers. */
function rnd(...xs) {
  let h = 2166136261;
  for (const x of xs) {
    h ^= Math.round(x * 1000);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

// Base temperature by place: warmer in the Jordan valley and south, cooler in the hills.
const baseTemp = (lat, lon) => 30 - (lat - 29.5) * 2.2 - (lon > 35.0 && lon < 35.4 && lat > 31.4 ? 4 : 0) + (lon > 35.4 ? 6 : 0);

// Rough terrain: coast near sea level, hills in the middle, the Jordan valley below sea level.
const demoElevation = (lat, lon) => Math.round(lon > 35.42 ? -250 : lon < 34.75 ? 15 + (lon - 34.2) * 60 : 250 + (35.3 - Math.abs(lon - 35.2)) * 1.6 + (lat - 31) * 120);

function forecastFor(lat, lon, now) {
  const local = new Date(now.getTime() + OFFSET);
  const start = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()));
  const t0 = baseTemp(lat, lon);
  const hourly = { time: [], temperature_2m: [], precipitation_probability: [], precipitation: [], weather_code: [], wind_speed_10m: [], is_day: [] };
  for (let i = 0; i < 168; i++) {
    const t = new Date(start.getTime() + i * 3600000);
    const h = t.getUTCHours();
    const day = Math.floor(i / 24);
    const rainy = day === 3 || day === 4;
    const prob = rainy ? Math.round(30 + 50 * rnd(lat, lon, i)) : Math.round(10 * rnd(lat, i));
    hourly.time.push(isoHour(t));
    hourly.temperature_2m.push(+(t0 - (rainy ? 5 : 0) + 6 * Math.sin(((h - 9) / 24) * 2 * Math.PI) + rnd(lon, i) * 2).toFixed(1));
    hourly.precipitation_probability.push(prob);
    hourly.precipitation.push(prob > 60 ? +(rnd(i, lat) * 3).toFixed(1) : 0);
    hourly.weather_code.push(prob > 60 ? 63 : prob > 35 ? 80 : rnd(lat, h) > 0.6 ? 2 : 0);
    hourly.wind_speed_10m.push(Math.round(8 + 14 * rnd(lon, i)));
    hourly.is_day.push(h >= 6 && h < 18 ? 1 : 0);
  }
  const daily = { time: [], weather_code: [], temperature_2m_max: [], temperature_2m_min: [], precipitation_probability_max: [], precipitation_sum: [], wind_speed_10m_max: [], uv_index_max: [], sunrise: [], sunset: [] };
  for (let d = 0; d < 7; d++) {
    const sl = hourly.temperature_2m.slice(d * 24, d * 24 + 24);
    const pr = hourly.precipitation_probability.slice(d * 24, d * 24 + 24);
    const date = isoDay(new Date(start.getTime() + d * 86400000));
    daily.time.push(date);
    daily.temperature_2m_max.push(Math.max(...sl));
    daily.temperature_2m_min.push(Math.min(...sl));
    daily.precipitation_probability_max.push(Math.max(...pr));
    daily.precipitation_sum.push(+hourly.precipitation.slice(d * 24, d * 24 + 24).reduce((a, b) => a + b, 0).toFixed(1));
    daily.wind_speed_10m_max.push(Math.max(...hourly.wind_speed_10m.slice(d * 24, d * 24 + 24)));
    daily.weather_code.push(Math.max(...pr) > 60 ? 63 : Math.max(...pr) > 35 ? 80 : 2);
    daily.uv_index_max.push(Math.max(...pr) > 60 ? 3 : 6);
    daily.sunrise.push(`${date}T06:13`);
    daily.sunset.push(`${date}T17:31`);
  }
  const ci = local.getUTCHours();
  // Yesterday (past_days=1): a little warmer, so the summary has a change to report.
  const yesterday = isoDay(new Date(start.getTime() - 86400000));
  for (const [k, v] of Object.entries({ time: yesterday, temperature_2m_max: daily.temperature_2m_max[0] + 4, temperature_2m_min: daily.temperature_2m_min[0] + 2 })) daily[k].unshift(v);
  for (const k of Object.keys(daily)) if (daily[k].length === 7) daily[k].unshift(daily[k][0]);
  // The next 3 hours in 15-minute steps: a short shower starting in about half an hour.
  const q = new Date(Math.floor(local.getTime() / 900000) * 900000);
  const shower = [0, 0, 0.3, 0.9, 0.4, 0, 0, 0, 0, 0, 0, 0];
  const minutely_15 = { time: shower.map((_, i) => isoHour(new Date(q.getTime() + i * 900000)).slice(0, 14) + String(new Date(q.getTime() + i * 900000).getUTCMinutes()).padStart(2, '0')), precipitation: shower };
  return {
    utc_offset_seconds: OFFSET / 1000,
    minutely_15,
    elevation: demoElevation(lat, lon),
    current: {
      time: isoHour(local), temperature_2m: hourly.temperature_2m[ci], relative_humidity_2m: 45,
      apparent_temperature: hourly.temperature_2m[ci] + 1, is_day: hourly.is_day[ci], weather_code: hourly.weather_code[ci],
      wind_speed_10m: hourly.wind_speed_10m[ci], wind_direction_10m: 270,
    },
    hourly, daily,
  };
}

function gridFor(lat, lon, now) {
  const local = new Date(now.getTime() + OFFSET);
  const time = []; const precipitation = []; const cloud_cover = []; const cape = [];
  for (let i = -3; i < 7; i++) {
    const t = new Date(Math.floor(local.getTime() / 3600000) * 3600000 + i * 3600000);
    time.push(isoHour(t));
    // A rain band drifting east from the sea over the north and centre.
    const band = Math.exp(-(((lon - 34.4 - i * 0.08) / 0.35) ** 2)) * Math.exp(-(((lat - 32.3) / 0.7) ** 2));
    precipitation.push(+(band * 5 * (0.6 + 0.4 * rnd(lat, lon, i))).toFixed(2));
    cloud_cover.push(Math.min(100, Math.round(band * 100 + 30 * rnd(lon, lat, i))));
    cape.push(Math.round(band * 1800 * rnd(lat, i, lon)));
  }
  return { utc_offset_seconds: OFFSET / 1000, hourly: { time, precipitation, cloud_cover, cape } };
}

const json = (body) => new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });

export function demoFetch(now = () => new Date()) {
  return async (input) => {
    const url = new URL(input);
    const q = url.searchParams;
    const lats = (q.get('latitude') ?? '').split(',').map(Number);
    const lons = (q.get('longitude') ?? '').split(',').map(Number);
    const n = now();

    if (url.host === 'api.open-meteo.com') {
      const many = lats.length > 1;
      let out;
      if (q.get('hourly')?.includes('cape')) out = lats.map((la, i) => gridFor(la, lons[i], n));
      else if (q.get('forecast_days') === '3') {
        out = lats.map((la, i) => {
          const d = forecastFor(la, lons[i], n).daily;
          return { daily: Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v.slice(0, 3)])) };
        });
      }
      else if (q.get('forecast_hours') === '1') {
        out = lats.map((la, i) => {
          const f = forecastFor(la, lons[i], n);
          return { elevation: f.elevation, current: f.current, hourly: { precipitation_probability: [f.hourly.precipitation_probability[0]] } };
        });
      } else out = lats.map((la, i) => forecastFor(la, lons[i], n));
      return json(many ? out : out[0]);
    }
    if (url.host === 'overpass-api.de') {
      const v = (name, lat, lon, place = 'village') => ({ type: 'node', lat, lon, tags: { name, 'name:ar': name, place } });
      return json({ elements: [
        v('بيت جالا', 31.7151, 35.1872, 'town'), v('بيت ساحور', 31.7044, 35.2259, 'town'), v('بيرزيت', 31.9677, 35.1977, 'town'),
        v('سلواد', 31.9789, 35.2564), v('عرابة', 32.4093, 35.1985, 'town'), v('دورا', 31.5072, 35.0283, 'town'),
        v('بني نعيم', 31.5152, 35.1647, 'town'), v('عصيرة الشمالية', 32.2489, 35.2533), v('حوارة', 32.1531, 35.2564),
        v('العيزرية', 31.7708, 35.2639, 'town'), v('بيت لاهيا', 31.5464, 34.4951, 'town'), v('عبسان الكبيرة', 31.3215, 34.3546),
        v('كفر كنا', 32.7466, 35.3428), v('أم الفحم', 32.5194, 35.1536, 'city'), v('الطيبة', 32.2667, 35.0103, 'city'),
        v('مكان في البحر', 32.1, 34.6), v('عمّان', 31.95, 35.93, 'city'),
      ] });
    }
    if (url.host === 'nominatim.openstreetmap.org') {
      const la = Number(q.get('lat')), lo = Number(q.get('lon'));
      return json({ address: { village: `قرية تجريبية (${la.toFixed(2)}, ${lo.toFixed(2)})`, county: 'محافظة تجريبية', state: 'فلسطين' } });
    }
    if (url.host === 'geocoding-api.open-meteo.com') {
      if (q.get('countryCode') !== 'PS') return json({});
      const name = q.get('name');
      return json({ results: [
        { id: 1, name: `${name} (تجريبي)`, latitude: 31.9, longitude: 35.2, elevation: 812, admin2: 'رام الله والبيرة', population: 3000 },
        { id: 2, name: `${name} الشرقية (تجريبي)`, latitude: 32.25, longitude: 35.28, elevation: 540, admin1: 'نابلس', population: 1200 },
      ] });
    }
    if (url.host === 'air-quality-api.open-meteo.com') return json({ current: { european_aqi: 34 } });
    if (url.host === 'earthquake.usgs.gov') {
      const t = n.getTime();
      const f = (id, mag, lat, lon, depth, hoursAgo, felt) => ({
        id, properties: { mag, time: t - hoursAgo * 3600000, felt }, geometry: { coordinates: [lon, lat, depth] },
      });
      return json({ features: [
        f('demo1', 3.4, 31.62, 35.46, 10, 6, 12), f('demo2', 2.6, 32.82, 35.59, 8, 10, null),
        f('demo3', 2.1, 32.3, 35.55, 12, 70, null), f('demo4', 3.9, 32.95, 34.3, 18, 110, 40),
        f('demo5', 1.9, 31.1, 35.42, 7, 150, null), f('demo6', 3.1, 29.3, 34.85, 15, 320, null),
      ] });
    }
    if (url.host === 'api.aladhan.com') {
      return json({ data: {
        timings: { Fajr: '04:55', Sunrise: '06:13', Dhuhr: '11:52', Asr: '15:13', Maghrib: '17:31', Isha: '18:47' },
        date: { hijri: { day: '05', month: { ar: 'جُمادى الأولى' }, year: '1448' } },
      } });
    }
    if (url.host === 'open.er-api.com') {
      return json({ time_last_update_utc: n.toUTCString(), rates: { USD: 0.27, JOD: 0.192, EUR: 0.248, EGP: 13.1, GBP: 0.211, SAR: 1.01, AED: 0.99, TRY: 9.2 } });
    }
    if (url.host === 'news.google.com') {
      const items = ['عنوان خبر تجريبي عن المنخفض الجوي', 'عنوان خبر تجريبي عن موسم الزيتون', 'عنوان خبر تجريبي عن درجات الحرارة']
        .map((t, i) => `<item><title>${t} - مصدر تجريبي</title><link>https://example.com/news/${i}</link><pubDate>${new Date(n.getTime() - (i + 1) * 3600000).toUTCString()}</pubDate><source url="https://example.com">مصدر تجريبي</source></item>`);
      return new Response(`<?xml version="1.0"?><rss><channel>${items.join('')}</channel></rss>`, { headers: { 'Content-Type': 'application/rss+xml' } });
    }
    if (url.host === 'palhub.app') {
      // Next.js page with its data inside self.__next_f.push(...) like the real one.
      const city = (id, name, lat, lon) => ({ id, name_ar: name, display_order: id.length, latitude: lat, longitude: lon });
      const cp = (id, name, cityId, into, out, minAgo) => ({ id, name, city_id: cityId, status_into: into, status_out: out, wait_into_minutes: 1, wait_out_minutes: 1, tags_into: [], tags_out: [], last_status_update_at: new Date(n.getTime() - minAgo * 60000).toISOString() });
      const data = {
        cities: [city('a', 'ضواحي القدس', 31.77, 35.21), city('bb', 'رام الله و البيرة', 31.9, 35.2), city('ccc', 'نابلس', 32.22, 35.25), city('dddd', 'الخليل', 31.53, 35.1)],
        checkpoints: [
          cp('1', 'جبع', 'a', 'open', 'busy', 5), cp('2', 'قلنديا', 'a', 'crisis', 'crisis', 8), cp('3', 'الكونتينر', 'a', 'open', 'open', 3),
          cp('4', 'عطارة البلد - فوق الجسر', 'bb', 'closed', 'closed', 20), cp('5', 'عين سينيا', 'bb', 'open', 'open', 12), cp('6', 'بيت ايل DCO', 'bb', 'busy', 'open', 40),
          cp('7', 'زعترة', 'ccc', 'busy', 'busy', 6), cp('8', 'بوابة حوارة', 'ccc', 'open', 'open', 9), cp('9', 'عورتا', 'ccc', 'closed', 'closed', 300), cp('10', 'المربعة', 'ccc', 'open', 'open', 50),
          cp('11', 'راس الجورة', 'dddd', 'open', 'busy', 15), cp('12', 'الفحص', 'dddd', 'open', 'open', 30), cp('13', 'العروب – الجسر', 'dddd', 'closed', 'open', 25),
        ],
      };
      const payload = `14:["$","$L29",null,{"initial":${JSON.stringify(data)}}]`;
      return new Response(`<html><body><script>self.__next_f.push([1,${JSON.stringify(payload)}])</script></body></html>`, { headers: { 'Content-Type': 'text/html' } });
    }
    if (url.host === 'www.p-weather.ps') {
      // «طقس الوطن»: same markup as the real pages, made-up text.
      const html = (body) => new Response(`<html><body>${body}</body></html>`, { headers: { 'Content-Type': 'text/html' } });
      const day = (i) => { const d = new Date(n.getTime() + i * 86400000); return `${['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][d.getUTCDay()]} ${d.getUTCDate()}\\${d.getUTCMonth() + 1}\\${d.getUTCFullYear()}`; };
      if (url.pathname.endsWith('index.php')) {
        const lines = ['نصّ تجريبي: يكون الطقس صافياً ولطيفاً نهاراً وبارداً ليلاً، والرياح شرقية خفيفة.', 'نصّ تجريبي: تظهر سحب متفرقة ولا يطرأ تغير يذكر على درجات الحرارة.', 'نصّ تجريبي: ارتفاع طفيف على درجات الحرارة ويكون الطقس دافئاً في المناطق المنخفضة.'];
        return html(`<!-- النشرة التفصيلية --><h2 class="section-title">النشرة التفصيلية</h2><div class="news-details"><blockquote><p>${lines.map((t, i) => `<strong>${day(i)}:</strong> ${t}`).join('<br />\n')}</p></blockquote></div><!-- نهاية النشرة التفصيلية -->`);
      }
      if (url.pathname.endsWith('article.php') && q.get('article_id')) {
        const id = q.get('article_id');
        return html(`<div class="photo main-article"><div class="photo-preview photo-detail" data-bg-image="../photo/article/demo${id}.png"></div><div class="photo-details"><h3 class="photo-title"><a href="./article.php?article_id=${id}">تقرير تجريبي رقم ${id}</a></h3><div><span class="date"> ${new Date(n.getTime() - 86400000).toISOString().slice(0, 10)}</span></div><div class="body-article"><p><span style="font-size:16px"><strong>كاتب تجريبي - مثال:&nbsp;<br /><br />هذا نصّ تجريبي لتقرير كامل يُعرض داخل الموقع. يتحدث عن كميات الأمطار ودرجات الحرارة.<br /><br />فقرة ثانية تجريبية: سجّلت المحطات كميات متفاوتة من الأمطار بين المناطق الجبلية والساحلية.</strong></span></p><script>alert(1)</script></div><p><a href="article.php?tags=تقارير_مناخية" class="tags-article-page">#تقارير_مناخية</a></p></div></div>`);
      }
      if (url.pathname.endsWith('article.php')) {
        const item = (id, title, by, ex, tag, daysAgo) => `<div class="col-md-6"><div class="photo"><div class="photo-preview photo-detail"><amp-img alt="" src="../photo/article/demo${id}.png"></amp-img></div><div class="photo-details"><h3 class="photo-title"><a href="./article.php?article_id=${id}">${title}</a></h3><div class="body-article"><p><strong>${by}:&nbsp;<br />${ex}<a href="./article.php?article_id=${id}"> قراءة المزيد ...</a></div><p><a href="#" class="tags-article-page">#${tag}</a></p><div><span class="date"> ${new Date(n.getTime() - daysAgo * 86400000).toISOString().slice(0, 10)}</span></div></div></div></div>`;
        return html(`<div class="row article-all">${item(9003, 'تقرير تجريبي: كميات الأمطار في المنخفض الأخير', 'قسم المعلومات المناخية - مثال', 'نصّ تجريبي لملخّص التقرير يذكر كميات الأمطار المسجلة في عدد من المدن', 'تقارير_مناخية', 1)}${item(9002, 'تقرير تجريبي: موسم الصيف بين الأرقام', 'كاتب تجريبي - مثال', 'نصّ تجريبي لملخّص تقرير عن درجات الحرارة خلال الصيف الماضي ومقارنتها بالمعدلات', 'تقارير_مناخية', 30)}</div><div class="row article-all">${item(9001, 'تقرير تجريبي: الإنذار المبكر والعواصف', 'كاتب تجريبي - مثال', 'نصّ تجريبي عن الإنذار المبكر وكيف تُرصد العواصف الرعدية في المنطقة', 'الإنذار_المبكر', 60)}</div>`);
      }
      return html(`<p><strong>محطة تجريبية - شمال الخليل</strong></p><p><iframe src="https://www.weatherlink.com/embeddablePage/show/00000000000000000000000000000001/fullscreen"></iframe></p><p><strong>محطة تجريبية - القدس</strong></p><p><iframe src="https://www.weatherlink.com/embeddablePage/show/00000000000000000000000000000002/fullscreen"></iframe></p><p><strong>محطة تجريبية - الخليل</strong></p><p><a href="https://app.weathercloud.net/d1234567890"><img src="https://app.weathercloud.net/device/sticker/1234567890"></a></p>`);
    }
    if (url.host === 'app.weathercloud.net') {
      const e = Math.floor(n.getTime() / 1000);
      if (url.pathname.endsWith('/values')) return json({ epoch: e - 300, temp: 17.1, hum: 46, thw: 16.9, bar: 1020.7, wspd: 0.7, wspdhi: 1, wdir: 198, wspdavg: 1.1, wdiravg: 183, rain: 0 });
      return json({ temp_day_max: [e - 7200, 18.3], temp_day_min: [e - 30000, 7.8] });
    }
    if (url.host === 'www.weatherlink.com') {
      const k = url.pathname.endsWith('1') ? 0 : 1.5;
      const t = n.getTime();
      return json({ temperature: String(17.6 - k), temperatureFeelLike: String(16.3 - k), hiTemp: '18.7', hiTempDate: t - 3 * 3600000, loTemp: String(8.8 - k), loTempDate: t - 10 * 3600000,
        wind: '6.4', gust: '22.5', windDirection: 291, humidity: '45.0', rain: '0.0', seasonalRain: '38.2', barometer: '1021.9', barometerTrend: 'Falling Slowly',
        tempUnits: '&deg;C', windUnits: 'km/h', rainUnits: 'mm', barometerUnits: 'mb', lastReceived: t - 4 * 60000 });
    }
    if (url.host === 't.me') {
      // Mimics the public channel preview at t.me/s/<channel>: newest posts last.
      const channel = url.pathname.split('/').pop();
      // A public group has no web preview: Telegram shows only its info page.
      if (channel !== 'ahwalaltreq' && !channel.startsWith('demo')) return new Response('<html><body><div class="tgme_page_extra">348 653 members</div></body></html>', { headers: { 'Content-Type': 'text/html' } });
      const before = Number(q.get('before') ?? 0);
      const posts = [
        [1001, 300, 'صباح الخير 🌤\nحوارة سالك بالاتجاهين ✅\nزعترة أزمة خفيفة للنازل'],
        [1002, 190, 'قلنديا أزمة خانقة 🔴 والكونتينر سالك'],
        [1003, 130, 'عطارة مسكر من الجهتين ⛔️\nعين سينيا سالك'],
        [1004, 95, 'الأنفاق تفتيش وبطء، حاجز 300 سالك'],
        [1005, 60, 'حدا بيعرف كيف دير شرف؟'],
        [1006, 42, 'دير شرف سالك 🟢'],
        [1007, 25, 'العروب مغلق، الفوار سالك، رأس الجورة أزمة'],
        [1008, 12, 'بيت إيل DCO سالك\nجبع أزمة للطالع'],
        [1009, 4, 'زعترة صارت سالكة 👍\nالمعرجات سالك'],
      ].filter(([id]) => !before || id < before).slice(before ? -3 : -6);
      const html = posts.map(([id, minAgo, text]) => `<div class="tgme_widget_message_wrap js-widget_message_wrap"><div class="tgme_widget_message js-widget_message" data-post="${channel}/${id}">
        <div class="tgme_widget_message_text js-message_text" dir="auto">${text.replace(/\n/g, '<br/>')}</div>
        <a class="tgme_widget_message_date" href="https://t.me/${channel}/${id}"><time datetime="${new Date(n.getTime() - minAgo * 60000).toISOString().replace('Z', '+00:00')}" class="time">.</time></a></div></div>`);
      return new Response(`<html><body><section class="tgme_channel_history">${html.join('')}</section></body></html>`, { headers: { 'Content-Type': 'text/html' } });
    }
    return new Response('not found', { status: 404 });
  };
}
