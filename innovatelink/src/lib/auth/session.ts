import { db } from "@/lib/db";
import type { Actor } from "@/modules/auth/policy";
import { randomToken, sha256 } from "./crypto";

export const SESSION_COOKIE = "il_session";
/** PRD §9: sessions expire after 7 days of inactivity. */
export const SESSION_IDLE_MS = 7 * 24 * 60 * 60 * 1000;
/** Avoid a DB write on every request: slide expiry at most once per hour. */
const TOUCH_INTERVAL_MS = 60 * 60 * 1000;

export async function createSession(userId: string, ip?: string | null): Promise<string> {
  const token = randomToken();
  await db.session.create({
    data: { user_id: userId, token_hash: sha256(token), expires_at: new Date(Date.now() + SESSION_IDLE_MS), ip: ip ?? null },
  });
  return token;
}

export async function destroySession(token: string): Promise<void> {
  await db.session.deleteMany({ where: { token_hash: sha256(token) } });
}

/** Resolves a raw session token to an Actor, sliding the idle expiry. */
export async function actorFromToken(token: string | undefined | null): Promise<Actor | null> {
  if (!token) return null;
  const s = await db.session.findUnique({
    where: { token_hash: sha256(token) },
    include: { user: { include: { org: { select: { type: true } } } } },
  });
  if (!s) return null;
  const now = Date.now();
  if (s.expires_at.getTime() <= now || s.user.deleted_at || s.user.status === "suspended") {
    await db.session.delete({ where: { id: s.id } }).catch(() => undefined);
    return null;
  }
  if (now - s.last_seen_at.getTime() > TOUCH_INTERVAL_MS) {
    await db.session.update({
      where: { id: s.id },
      data: { last_seen_at: new Date(now), expires_at: new Date(now + SESSION_IDLE_MS) },
    });
  }
  const u = s.user;
  return { id: u.id, role: u.role, status: u.status, org_id: u.org_id, org_type: u.org.type };
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_IDLE_MS / 1000,
  };
}
