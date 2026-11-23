// The iPhone app shows the website's pages, shipped inside it (www/), and reads its data from
// the website's API over the internet. This copies the site's public folder into www/.
import { cpSync, rmSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const from = fileURLToPath(new URL('../../PalestineWeatherWeb/public/', import.meta.url));
const to = fileURLToPath(new URL('../www/', import.meta.url));
rmSync(to, { recursive: true, force: true });
mkdirSync(to, { recursive: true });
cpSync(from, to, { recursive: true });
console.log(`copied ${from} → ${to}`);
