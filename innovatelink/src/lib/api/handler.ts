import { NextResponse, type NextRequest } from "next/server";
import { ZodError, type ZodType, type ZodTypeDef } from "zod";
import { AppError } from "./errors";
import { getActor, getClientIp } from "@/lib/auth/current";
import { rateLimit } from "@/lib/auth/rate-limit";
import type { Actor } from "@/modules/auth/policy";
import { log } from "@/lib/log";

export interface Ctx<P> {
  req: NextRequest;
  actor: Actor | null;
  ip: string;
  params: P;
}

interface Options {
  /** Require a logged-in user (any status). */
  auth?: boolean;
  /** Rate-limit bucket name and per-minute limit (PRD §9: /auth/*, /assistant/*). */
  rateLimit?: { bucket: string; perMinute: number };
}

export function errorResponse(e: unknown): NextResponse {
  if (e instanceof AppError) {
    return NextResponse.json({ error: { code: e.code, message: e.message, fields: e.fields } }, { status: e.status });
  }
  if (e instanceof ZodError) {
    const fields: Record<string, string[]> = {};
    for (const i of e.issues) (fields[i.path.join(".") || "_"] ??= []).push(i.message);
    return NextResponse.json({ error: { code: "validation_error", message: "Invalid input", fields } }, { status: 422 });
  }
  log.error("unhandled", { err: e instanceof Error ? { message: e.message, stack: e.stack } : String(e) });
  return NextResponse.json({ error: { code: "internal", message: "Internal error" } }, { status: 500 });
}

/**
 * CSRF: state-changing requests must originate from our own origin.
 * Combined with SameSite=Lax cookies this blocks cross-site form posts.
 */
function checkOrigin(req: NextRequest): void {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return;
  const origin = req.headers.get("origin");
  if (!origin) return; // non-browser clients (no ambient cookies sent cross-site)
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    if (new URL(origin).host !== host) throw new AppError("forbidden", "Cross-origin request blocked");
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError("forbidden", "Bad origin");
  }
}

type RouteCtx = { params: Promise<Record<string, string>> };

export function route<P extends Record<string, string> = Record<string, never>>(
  fn: (ctx: Ctx<P>) => Promise<unknown>,
  opts: Options = {},
) {
  return async (req: NextRequest, rc: RouteCtx): Promise<Response> => {
    try {
      checkOrigin(req);
      const ip = await getClientIp();
      if (opts.rateLimit) {
        const r = rateLimit(`${opts.rateLimit.bucket}:${ip}`, opts.rateLimit.perMinute, 60_000);
        if (!r.ok) {
          return NextResponse.json(
            { error: { code: "rate_limited", message: "Too many requests" } },
            { status: 429, headers: { "Retry-After": String(r.retryAfter) } },
          );
        }
      }
      const actor = await getActor();
      if (opts.auth && !actor) throw new AppError("unauthenticated");
      const params = ((await rc?.params) ?? {}) as P;
      const out = await fn({ req, actor, ip, params });
      if (out instanceof Response) return out;
      if (out === undefined) return new NextResponse(null, { status: 204 });
      return NextResponse.json(out);
    } catch (e) {
      return errorResponse(e);
    }
  };
}

export async function body<T>(req: NextRequest, schema: ZodType<T, ZodTypeDef, unknown>): Promise<T> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new AppError("bad_request", "Invalid JSON body");
  }
  return schema.parse(json);
}

export function query<T>(req: NextRequest, schema: ZodType<T, ZodTypeDef, unknown>): T {
  const obj: Record<string, string | string[]> = {};
  req.nextUrl.searchParams.forEach((v, k) => {
    const prev = obj[k];
    obj[k] = prev === undefined ? v : Array.isArray(prev) ? [...prev, v] : [prev, v];
  });
  return schema.parse(obj);
}

export function requireActor(a: Actor | null): Actor {
  if (!a) throw new AppError("unauthenticated");
  return a;
}
