import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as R from '../server/roads.js';

const page = (channel, posts) => posts.map(([id, iso, html]) =>
  `<div class="tgme_widget_message js-widget_message" data-post="${channel}/${id}">
     <div class="tgme_widget_message_reply"><div class="tgme_widget_message_text js-message_reply_text">رد قديم</div></div>
     <div class="tgme_widget_message_text js-message_text" dir="auto">${html}</div>
     <a class="tgme_widget_message_date"><time datetime="${iso}" class="time">x</time></a></div>`).join('');

test('parseTelegram reads text, line breaks, entities and links', () => {
  const html = page('ahwalaltreq', [
    [10, '2026-10-16T08:00:00+00:00', 'حوارة <b>سالك</b><br/>زعترة &quot;أزمة&quot; <a href="x">رابط</a>'],
    [11, '2026-10-16T08:05:00+00:00', ''],
  ]) + page('other', [[12, '2026-10-16T08:06:00+00:00', 'من قناة أخرى']]);
  const posts = R.parseTelegram(html, 'ahwalaltreq');
  assert.equal(posts.length, 1);
  assert.equal(posts[0].text, 'حوارة سالك\nزعترة "أزمة" رابط');
  assert.equal(posts[0].time, '2026-10-16T08:00:00.000Z');
  assert.equal(posts[0].url, 'https://t.me/ahwalaltreq/10');
});

test('classify understands spelling variants, negation and emoji', () => {
  assert.equal(R.classify('مُغلَقة'), 'closed');
  assert.equal(R.classify('غير سالك'), 'closed');
  assert.equal(R.classify('أزمه خانقة'), 'busy');
  assert.equal(R.classify('سالكة بالاتجاهين'), 'open');
  assert.equal(R.classify('⛔️'), 'closed');
  assert.equal(R.classify('🟢'), 'open');
  assert.equal(R.classify('عسكري على الطريق'), null, '"سكر" inside another word is not "closed"');
  assert.equal(R.classify('كيف الطريق؟'), null);
});

test('mentionsIn gives each checkpoint its own status', () => {
  const m = (t) => Object.fromEntries(R.mentionsIn(t).map((x) => [x.id, x.status]));
  assert.deepEqual(m('قلنديا أزمة خانقة والكونتينر سالك'), { qalandia: 'busy', container: 'open' });
  assert.deepEqual(m('حوارة سالك\nزعترة مسكرة'), { huwwara: 'open', zaatara: 'closed' });
  assert.deepEqual(m('العروب مغلق، الفوار سالك'), { arroub: 'closed', fawwar: 'open' });
  assert.deepEqual(m('مسكر عطارة وعين سينيا'), { atara: 'closed', einsinia: 'closed' });
  assert.deepEqual(m('بالكونتينر تفتيش'), { container: 'busy' });
  assert.deepEqual(m('حاجز ٣٠٠ سالك'), { cp300: 'open' });
});

test('buildRoads keeps the newest status per checkpoint and drops old ones', () => {
  const now = Date.parse('2026-10-16T12:00:00Z');
  const post = (id, hoursAgo, text) => ({ id, channel: 'c', text, time: new Date(now - hoursAgo * 3600000).toISOString(), url: `u${id}` });
  const r = R.buildRoads([
    post(1, 2, 'حوارة مغلق'),
    post(2, 1, 'حوارة سالك'),
    post(3, 0.5, 'كيف حوارة؟'),
    post(4, 20, 'قلنديا مغلق'),
  ], { now });
  const byId = Object.fromEntries(r.checkpoints.map((c) => [c.id, c]));
  assert.equal(byId.huwwara.status, 'open');
  assert.equal(byId.huwwara.url, 'u2');
  assert.equal(byId.qalandia.status, 'unknown');
  assert.equal(r.feed[0].id, 3);
  assert.ok(!('aliases' in byId.huwwara));
});

test('roadChannels reads ids and names, ignoring bad ids', () => {
  assert.deepEqual(R.roadChannels(undefined).map((c) => c.id), ['ahwalaltreq', 'a7walstreet', 'road_jehad']);
  assert.deepEqual(R.roadChannels('@one_chan, two2:قناة ٢, bad/id'), [
    { id: 'one_chan', name: 'one_chan' }, { id: 'two2', name: 'قناة ٢' },
  ]);
});

test('postsFromMessages keeps only text and time, oldest first', async () => {
  const { postsFromMessages, telegramConfigured } = await import('../server/telegram.js');
  const posts = postsFromMessages([
    { id: 7, message: 'زعترة   سالك', date: 1792200000, senderId: 123, sender: { firstName: 'x' } },
    { id: 5, message: 'حوارة مسكر\n\n\n\nمن الجهتين', date: 1792190000 },
    { id: 6, message: '', date: 1792195000 },
    { id: 8, media: {}, date: 1792201000 },
  ], 'road_jehad');
  assert.deepEqual(posts.map((p) => p.id), [5, 7]);
  assert.equal(posts[0].text, 'حوارة مسكر\n\nمن الجهتين');
  assert.equal(posts[1].url, 'https://t.me/road_jehad/7');
  assert.equal(posts[1].time, new Date(1792200000 * 1000).toISOString());
  assert.deepEqual(Object.keys(posts[1]).sort(), ['channel', 'id', 'text', 'time', 'url']);
  assert.equal(telegramConfigured({ TG_API_ID: '1', TG_API_HASH: 'h' }), false);
  assert.equal(telegramConfigured({ TG_API_ID: '1', TG_API_HASH: 'h', TG_SESSION: 's' }), true);
});
