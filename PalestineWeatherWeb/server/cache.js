import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

const UA = 'PalestineWeatherWeb/1.0 (+https://palestine-weather.vercel.app)';

/**
 * Upstream fetch with two cache layers:
 *  - memory, for `ttl` seconds, so many visitors share one upstream request;
 *  - disk, kept indefinitely, served (marked stale) when the upstream fails.
 * Concurrent requests for the same key share a single in-flight fetch.
 */
export class Cache {
  /** `maxEntries` bounds the memory and the disk copies, so made-up places cannot fill either. */
  constructor(dir, fetchImpl = fetch, maxEntries = 4000) {
    this.maxEntries = maxEntries;
    this.dir = dir;
    this.fetch = fetchImpl;
    this.memory = new Map();
    this.inflight = new Map();
  }

  file(key) {
    return path.join(this.dir, key.replace(/[^A-Za-z0-9_.-]/g, '_') + '.json');
  }

  /**
   * @param {string} key cache key
   * @param {number} ttl seconds before refetching
   * @param {() => Promise<any>} load fetches and parses the upstream value
   * @returns {Promise<{data:any, fetchedAt:number, stale:boolean}>}
   */
  async get(key, ttl, load) {
    const hit = this.memory.get(key);
    if (hit && Date.now() - hit.fetchedAt < ttl * 1000) return { ...hit, stale: false };
    if (this.inflight.has(key)) return this.inflight.get(key);

    const p = (async () => {
      try {
        const data = await load();
        const entry = { data, fetchedAt: Date.now() };
        this.memory.delete(key);
        this.memory.set(key, entry);
        // Over the bound: the oldest entry goes, from memory and from disk.
        while (this.memory.size > this.maxEntries) {
          const oldest = this.memory.keys().next().value;
          this.memory.delete(oldest);
          unlink(this.file(oldest)).catch(() => {});
        }
        await mkdir(this.dir, { recursive: true });
        await writeFile(this.file(key), JSON.stringify(entry)).catch(() => {});
        return { ...entry, stale: false };
      } catch (err) {
        const old = hit ?? (await readFile(this.file(key), 'utf8').then(JSON.parse).catch(() => null));
        if (old) return { ...old, stale: true };
        throw err;
      } finally {
        this.inflight.delete(key);
      }
    })();
    this.inflight.set(key, p);
    return p;
  }

  async json(url, headers = {}) {
    // Nominatim's usage policy asks for an identifying User-Agent.
    const res = await this.fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json', ...headers }, signal: AbortSignal.timeout(60000) });
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${new URL(url).host}`);
    return res.json();
  }

  async text(url) {
    const res = await this.fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${new URL(url).host}`);
    return res.text();
  }
}
