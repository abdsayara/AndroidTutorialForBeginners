// One-time login that prints TG_SESSION for reading road-condition groups.
// Run on your own computer:  npm run telegram-login
// It asks for TG_API_ID and TG_API_HASH (from https://my.telegram.org → API development
// tools), the phone number of the Telegram account, the code Telegram sends, and the
// two-step password if the account has one. Nothing is sent anywhere except Telegram.
// Keep the printed session secret: it gives access to that Telegram account.
import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import tg from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';

const rl = readline.createInterface({ input: stdin, output: stdout });
const ask = (q) => rl.question(q);

const apiId = Number(process.env.TG_API_ID || await ask('TG_API_ID: '));
const apiHash = process.env.TG_API_HASH || await ask('TG_API_HASH: ');
const client = new tg.TelegramClient(new StringSession(''), apiId, apiHash, { connectionRetries: 3 });
client.setLogLevel('error');

await client.start({
  phoneNumber: () => ask('رقم الهاتف مع رمز الدولة (مثل +970599...): '),
  phoneCode: () => ask('الرمز الذي وصلك من تلغرام: '),
  password: () => ask('كلمة مرور التحقق بخطوتين (إن وُجدت): '),
  onError: (err) => console.error('خطأ:', err.message),
});

console.log('\nتم تسجيل الدخول. ضع القيم الثلاث في Vercel → Settings → Environment Variables:\n');
console.log(`TG_API_ID=${apiId}`);
console.log(`TG_API_HASH=${apiHash}`);
console.log(`TG_SESSION=${client.session.save()}`);
console.log('\nلا تشارك TG_SESSION مع أحد: من يملكه يستطيع استخدام هذا الحساب.');
await client.destroy();
rl.close();
