// Protection against being flooded: a visitor who asks too often is told to wait, and the
// requests that cost an upstream call share a budget, so nobody can spend the weather
// sources' daily allowance (or get the site banned by them) with made-up places or ids.

/** At most `limit` requests per `windowMs` for each key (a visitor's address). */
export class RateLimit {
  constructor({ limit = 300, windowMs = 60_000, maxKeys = 20_000 } = {}) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.maxKeys = maxKeys;
    this.hits = new Map();
  }

  /** True while the key is within its allowance; counts the request. */
  allow(key, now = Date.now()) {
    let h = this.hits.get(key);
    if (!h || now - h.start >= this.windowMs) {
      // Forget finished windows before the table grows without end.
      if (this.hits.size >= this.maxKeys) {
        for (const [k, v] of this.hits) if (now - v.start >= this.windowMs) this.hits.delete(k);
        if (this.hits.size >= this.maxKeys) this.hits.clear();
      }
      h = { start: now, count: 0 };
      this.hits.set(key, h);
    }
    h.count += 1;
    return h.count <= this.limit;
  }

  /** Seconds until the key's window ends. */
  retryAfter(key, now = Date.now()) {
    const h = this.hits.get(key);
    return h ? Math.max(1, Math.ceil((h.start + this.windowMs - now) / 1000)) : 1;
  }
}

/** A shared allowance that refills steadily: `capacity` at once, `perSecond` after that. */
export class Budget {
  constructor(capacity = 120, perSecond = 2) {
    this.capacity = capacity;
    this.perSecond = perSecond;
    this.tokens = capacity;
    this.at = Date.now();
  }

  /** Takes one from the allowance; false when it is spent. */
  take(now = Date.now()) {
    this.tokens = Math.min(this.capacity, this.tokens + ((now - this.at) / 1000) * this.perSecond);
    this.at = now;
    if (this.tokens < 1) return false;
    this.tokens -= 1;
    return true;
  }
}

/** The visitor's address: the platform's header on Vercel, the socket otherwise. */
export function clientAddress(req) {
  const h = req.headers ?? {};
  const forwarded = String(h['x-real-ip'] ?? h['x-forwarded-for'] ?? '').split(',')[0].trim();
  return forwarded || req.socket?.remoteAddress || 'unknown';
}

/** What a page may load and do: its own files only, no inline script, no framing by other sites. */
export const SECURITY_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'", "script-src 'self'", "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob: https:",
    "font-src 'self'", "connect-src 'self'", "frame-src 'self'", "frame-ancestors 'self'", "base-uri 'self'",
    "form-action 'self'", "object-src 'none'",
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(self), camera=(), microphone=(), payment=(), usb=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
};
