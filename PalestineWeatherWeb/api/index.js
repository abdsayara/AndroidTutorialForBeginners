// Single Vercel function for every /api/* route (the Hobby plan allows 12 functions per
// deployment). vercel.json rewrites /api/<name> to /api?__path=<name>; see server/vercel.js.
export { default } from '../server/vercel.js';
