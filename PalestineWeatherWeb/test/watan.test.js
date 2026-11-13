import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as W from '../server/watan.js';

// Trimmed from the real p-weather.ps pages (November 2026).
const HOME = `<div><!-- النشرة التفصيلية -->
      <div class="row"><div class="col-md-12">
          <h2 class="section-title">النشرة التفصيلية</h2>
          <div class="news-details"><blockquote>
<p><strong>الثلاثاء 10\\11\\2026:</strong> توالي درجات الحرارة ارتفاعها بصورة طفيفة،&nbsp;ويكون الطقس صافياً.<br />
<strong>الأربعاء 11\\11\\2026:</strong> تكون الأجواء لطيفة إلى دافئة نسبياً.<br />
<strong>الجمعة 2026/11/13:</strong> تواصل درجات الحرارة رحلة صعودها.</p>
</blockquote></div></div></div>
      <!-- نهاية النشرة التفصيلية --></div>`;

const item = (id, body, tag, date) => `<div class="col-md-6"><div class="photo">
  <div class="photo-preview photo-detail" data-bg-image=""><amp-img alt="x" src="../photo/article/${id}.png" width="500px"></amp-img></div><br>
  <div class="photo-details"><h3 class="photo-title">
    <a href="./article.php?article_id=${id}">تقرير ${id}</a></h3>
    <div class="body-article">${body}<a href="./article.php?article_id=${id}"> قراءة المزيد ...</a></div>
    <p><a href="article.php?tags=${tag}" class="tags-article-page">#${tag}</a></p>
    <div><span class="date"> ${date}</span></div></div></div></div>`;
const ARTICLES = `<div class="row article-all">
  ${item(3293, '<p dir="rtl"><span><strong><img src="x.jpeg" /></strong></span></p><p dir="rtl"><span><strong>قسم ال', 'طقس_الوطن', '2026-11-09')}
  ${item(3292, '<p><span><strong>قصي الحلايقة - موقع طقس الوطن:&nbsp;<br />\n<br />\nلا يُقاس فصل الصيف بدرجات الحرارة الاستثنائية لكي يُقال بأنه صيف حار مُنا�', 'تقارير_مناخية', '2026-09-05')}
</div>`;

const STATIONS = `<div class="container about-us-text">
<p style="text-align: center;"><strong>محطة طقس الوطن - شمال الخليل</strong></p>
<p><iframe src="https://www.weatherlink.com/embeddablePage/show/9443a903846e475b93c78cc2a9167d78/fullscreen"></iframe></p><hr>
<p style="text-align: center;"><strong>محطة طقس الوطن - مدينة الخليل\`</strong></p>
<p><a href="https://app.weathercloud.net/d9105674640"><img src="https://app.weathercloud.net/device/sticker/9105674640"></a></p></div>`;

test('parseBulletin splits the bulletin into days', () => {
  const b = W.parseBulletin(HOME);
  assert.deepEqual(b.days.map((d) => d.day), ['الثلاثاء 10/11/2026', 'الأربعاء 11/11/2026', 'الجمعة 2026/11/13']);
  assert.equal(b.days[0].text, 'توالي درجات الحرارة ارتفاعها بصورة طفيفة، ويكون الطقس صافياً.');
  assert.throws(() => W.parseBulletin('<html></html>'), /not found/);
});

test('parseReports reads both reports of a row with byline, tag and date', () => {
  const r = W.parseReports(ARTICLES);
  assert.deepEqual(r.map((x) => x.id), [3293, 3292]);
  assert.equal(r[0].excerpt, null, 'a stub excerpt is dropped');
  assert.equal(r[0].tag, null); // a tag that only names the site is dropped
  assert.equal(r[0].image, 'https://www.p-weather.ps/photo/article/3293.png');
  assert.equal(r[1].byline, 'قصي الحلايقة - موقع طقس الوطن');
  assert.match(r[1].excerpt, /^لا يُقاس فصل الصيف.*مُنا…$/);
  assert.equal(r[1].date, '2026-09-05');
  assert.equal(r[1].url, 'https://www.p-weather.ps/ar/article.php?article_id=3292');
});

test('parseStations finds WeatherLink and Weathercloud stations with their names', () => {
  const s = W.parseStations(STATIONS);
  assert.deepEqual(s.map((x) => [x.name, x.kind, x.id]), [
    ['محطة طقس الوطن - شمال الخليل', 'weatherlink', '9443a903846e475b93c78cc2a9167d78'],
    ['محطة طقس الوطن - مدينة الخليل', 'weathercloud', '9105674640'],
  ]);
  assert.equal(s[1].sticker, 'https://app.weathercloud.net/device/sticker/9105674640');
});

test('parseWeatherlink converts readings and the pressure trend', () => {
  const n = W.parseWeatherlink({
    temperature: '17.6', temperatureFeelLike: '16.3', hiTemp: '18.7', hiTempDate: 1794306542252, loTemp: '8.8',
    wind: '0.0', gust: '22.5', windDirection: 291, humidity: '45.0', rain: '0.0', seasonalRain: '38.2',
    barometer: '1021.9', barometerTrend: 'Falling Rapidly', tempUnits: '&deg;C', windUnits: 'km/h', lastReceived: 1794308806000,
  });
  assert.equal(n.temp, 17.6);
  assert.equal(n.wind, 0);
  assert.equal(n.pressureTrend, 'ينخفض بسرعة');
  assert.equal(n.units.temp, '°C');
  assert.equal(n.units.wind, 'كم/س');
  assert.equal(n.lowAt, null);
  assert.equal(n.updated, new Date(1794308806000).toISOString());
});

test('parseWeathercloud converts m/s to km/h and reads the day extremes', () => {
  const n = W.parseWeathercloud(
    { epoch: 1794310508, temp: 17.1, hum: 46, thw: 16.9, bar: 1020.7, wspd: 0.7, wspdhi: 1, wdir: 198, wspdavg: 1.1, wdiravg: 183, rain: 0 },
    { temp_day_max: [1794311047, 18.3], temp_day_min: [1794279848, 7.8] },
  );
  assert.equal(n.wind, 4);
  assert.equal(n.gust, 4, 'never below the average wind');
  assert.equal(n.windDir, 183);
  assert.equal(n.high, 18.3);
  assert.equal(n.lowAt, new Date(1794279848000).toISOString());
  assert.equal(n.updated, new Date(1794310508000).toISOString());
  assert.equal(W.parseWeathercloud({ temp: 10 }).high, null);
});

test('stationName keeps the place', () => {
  assert.equal(W.stationName('محطة طقس الوطن - شمال الخليل'), 'محطة شمال الخليل');
  assert.equal(W.stationName('محطة الخليل'), 'محطة الخليل');
});

test('parseArticle reads the report and cleans its body', () => {
  const a = W.parseArticle(`<div class="photo main-article">
    <div class="photo-preview photo-detail" data-bg-image="../photo/article/1788609959575.png"></div>
    <div class="photo-details"><h3 class="photo-title"><a href="./article.php?article_id=3292">صيف فلسطين 2026</a></h3>
      <div><span class="date"> 2026-09-05</span></div>
      <div class="body-article">
        <p><span style="font-size:16px"><strong>قصي الحلايقة - موقع طقس الوطن:&nbsp;<br />
<br />
لا يُقاس فصل الصيف.<img src="../photo/article/x.jpeg" onerror="alert(1)"><img src="https://ibb.co/LH6TJXd"></strong></span></p>
        <p>&nbsp;</p><script>alert(1)</script><a href="javascript:x()">رابط</a>
      </div>
      <p><a href="article.php?tags=تقارير_مناخية" class="tags-article-page">#تقارير_مناخية</a></p></div></div>`, 3292);
  assert.equal(a.title, 'صيف فلسطين 2026');
  assert.equal(a.date, '2026-09-05');
  assert.equal(a.tag, 'تقارير مناخية');
  assert.equal(a.image, 'https://www.p-weather.ps/photo/article/1788609959575.png');
  assert.doesNotMatch(a.html, /script|onerror|javascript|style=|ibb\.co|<strong>|&nbsp;/);
  assert.match(a.html, /<img src="https:\/\/www\.p-weather\.ps\/photo\/article\/x\.jpeg" alt="" loading="lazy">/);
  assert.match(a.html, /رابط/);
  assert.throws(() => W.parseArticle('<html></html>', 1), /not found/);
});

test('currentDays drops the days that are over; parseWear reads the clothing advice', () => {
  const days = [{ day: 'الثلاثاء 10/11/2026', text: 'a' }, { day: 'الأربعاء 11/11/2026', text: 'b' }, { day: null, text: 'c' }];
  assert.deepEqual(W.currentDays(days, '2026-11-11').map((d) => d.text), ['b', 'c']);
  assert.equal(W.bulletinDate('الخميس 3/12/2026'), '2026-12-03');
  assert.equal(W.bulletinDate('الجمعة 2026/11/13'), '2026-11-13');
  assert.equal(W.parseWear('<p class="text-wear-tomorrow">\n<br>\n بين 10-15 نوفمبر 2026: ملابس دافئة صباحاً، مساءً وليلاً....  </p>'), 'بين 10-15 نوفمبر 2026: ملابس دافئة صباحاً، مساءً وليلاً');
  assert.equal(W.parseWear('<html></html>'), null);
});

test('parseWu reads a Weather Underground observation in the stations shape', async () => {
  const WU = await import('../server/wunderground.js');
  const cur = { observations: [{ obsTimeUtc: '2026-11-13T10:00:00Z', humidity: 61, winddir: 270, pressureTrend: 'steady',
    metric: { temp: 18.4, heatIndex: 18.4, windChill: 18.1, windSpeed: 9.7, windGust: 14.5, pressure: 1016.9, precipTotal: 0.3 } }] };
  const day = { observations: [
    { obsTimeUtc: '2026-11-13T03:00:00Z', metric: { tempHigh: 12.4, tempLow: 11.6 } },
    { obsTimeUtc: '2026-11-13T09:00:00Z', metric: { tempHigh: 21.2, tempLow: 19.8 } },
  ] };
  const n = WU.parseWu(cur, day);
  assert.equal(n.temp, 18.4); assert.equal(n.feelsLike, 18.1); assert.equal(n.high, 21.2); assert.equal(n.low, 11.6);
  assert.equal(n.highAt, '2026-11-13T09:00:00Z'); assert.equal(n.lowAt, '2026-11-13T03:00:00Z');
  assert.equal(n.wind, 9.7); assert.equal(n.pressureTrend, 'ثابت'); assert.equal(n.updated, '2026-11-13T10:00:00Z');
  assert.throws(() => WU.parseWu({}), /no observation/);
  assert.match(WU.currentUrl('IDEIRB6', 'k'), /stationId=IDEIRB6&format=json&units=m/);
});
