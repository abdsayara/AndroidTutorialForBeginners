import { cookies, headers } from "next/headers";
import { actorFromToken, SESSION_COOKIE } from "./session";
import type { Actor } from "@/modules/auth/policy";

/** Current actor for Server Components and route handlers. */
export async function getActor(): Promise<Actor | null> {
  const jar = await cookies();
  return actorFromToken(jar.get(SESSION_COOKIE)?.value);
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "0.0.0.0";
}
