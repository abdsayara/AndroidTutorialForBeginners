// Reads public Telegram groups and channels through Telegram's own API (MTProto, via
// GramJS) with a logged-in account. Needed for groups: unlike channels they have no
// t.me/s web preview. Configure with TG_API_ID and TG_API_HASH (from my.telegram.org)
// and TG_SESSION (printed by `npm run telegram-login`). Only the text and time of each
// message are kept — never who sent it.

export const telegramConfigured = (env = process.env) => !!(env.TG_API_ID && env.TG_API_HASH && env.TG_SESSION);

/** GramJS messages → posts in the same shape as parseTelegram, oldest first. */
export function postsFromMessages(messages, chat) {
  return messages
    .filter((m) => m && typeof m.message === 'string' && m.message.trim() && m.date)
    .map((m) => ({
      id: m.id,
      channel: chat,
      text: m.message.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim(),
      time: new Date(m.date * 1000).toISOString(),
      url: `https://t.me/${chat}/${m.id}`,
    }))
    .sort((a, b) => a.id - b.id);
}

/**
 * Latest `limit` messages of each public chat, over one connection.
 * Resolves to {chat: {posts} | {error}}; throws only when it cannot connect at all.
 */
// After a failed connection GramJS keeps retrying in the background; wait before the next
// attempt so a long-running server doesn't pile up clients while Telegram is unreachable.
const BACKOFF_MS = 10 * 60000;
let failedAt = 0;

export async function readChats(chats, { limit = 100, env = process.env, timeoutMs = 25000 } = {}) {
  if (Date.now() - failedAt < BACKOFF_MS) throw new Error('telegram unreachable, retrying later');
  const mod = await import('telegram');
  const { TelegramClient } = mod.default ?? mod;
  const { StringSession } = await import('telegram/sessions/index.js');
  const client = new TelegramClient(new StringSession(env.TG_SESSION), Number(env.TG_API_ID), env.TG_API_HASH, {
    connectionRetries: 2,
    requestRetries: 1,
  });
  client.setLogLevel('none');
  let timer;
  const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('telegram timeout')), timeoutMs); });
  timeout.catch(() => {});
  try {
    await Promise.race([client.connect(), timeout]).catch((err) => { failedAt = Date.now(); throw err; });
    const out = {};
    await Promise.race([
      Promise.all(chats.map(async (chat) => {
        try {
          out[chat] = { posts: postsFromMessages(await client.getMessages(chat, { limit }), chat) };
        } catch (err) {
          out[chat] = { error: err.errorMessage ?? err.message };
        }
      })),
      timeout,
    ]);
    return out;
  } finally {
    clearTimeout(timer);
    // destroy() also stops GramJS's background update loop; it can hang while still
    // trying to reach Telegram, so don't wait on it for long.
    await Promise.race([client.destroy().catch(() => {}), new Promise((r) => setTimeout(r, 2000).unref())]);
  }
}
