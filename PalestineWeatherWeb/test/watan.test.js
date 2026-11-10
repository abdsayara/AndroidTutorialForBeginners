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
  assert.equal(r[0].tag, 'طقس الوطن');
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
