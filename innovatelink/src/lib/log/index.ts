type Level = "debug" | "info" | "warn" | "error";
const ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const min = ORDER[(process.env.LOG_LEVEL as Level) ?? "info"] ?? 20;

/**
 * Optional error forwarding to Sentry via its store endpoint when SENTRY_DSN is set
 * (PRD §9). Kept dependency-free; swap for @sentry/nextjs if richer tracing is needed.
 */
function toSentry(msg: string, extra?: Record<string, unknown>) {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  try {
    const u = new URL(dsn);
    const project = u.pathname.replace(/^\//, "");
    const url = `${u.protocol}//${u.host}/api/${project}/store/?sentry_version=7&sentry_key=${u.username}`;
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg, level: "error", platform: "node", extra, environment: process.env.NODE_ENV }),
    }).catch(() => undefined);
  } catch {
    /* invalid DSN — ignore */
  }
}

function emit(level: Level, msg: string, extra?: Record<string, unknown>) {
  if (ORDER[level] < min || process.env.NODE_ENV === "test") return;
  const line = JSON.stringify({ ts: new Date().toISOString(), level, msg, ...extra });
  (level === "error" ? console.error : console.log)(line);
  if (level === "error") toSentry(msg, extra);
}

/** Structured JSON logger (PRD §9 — monitoring). */
export const log = {
  debug: (m: string, e?: Record<string, unknown>) => emit("debug", m, e),
  info: (m: string, e?: Record<string, unknown>) => emit("info", m, e),
  warn: (m: string, e?: Record<string, unknown>) => emit("warn", m, e),
  error: (m: string, e?: Record<string, unknown>) => emit("error", m, e),
};
