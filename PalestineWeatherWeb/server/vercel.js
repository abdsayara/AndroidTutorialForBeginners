// Vercel entry: every file in /api re-exports this handler. Functions are stateless,
// so cached upstream copies go to /tmp (per instance) and alerts are computed live.
import { Cache } from './cache.js';
import { LiveAlerts } from './alerts.js';
import { createHandler } from './index.js';
import { demoFetch } from './demo.js';

const demo = process.env.DEMO === '1';
const cache = new Cache('/tmp/pw-cache', demo ? demoFetch() : fetch);

export default createHandler({
  cache,
  alerts: new LiveAlerts(cache),
  demo,
  // Let Vercel's CDN share answers between visitors for 10 minutes.
  apiCacheControl: 'public, s-maxage=600, stale-while-revalidate=3600',
});
