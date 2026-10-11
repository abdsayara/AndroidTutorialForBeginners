import { route, body, requireActor } from "@/lib/api/handler";
import { NextResponse } from "next/server";
import { loginSchema } from "@/modules/auth/schema";
import { login } from "@/modules/auth/service";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";

export const POST = route(async ({ req, ip }) => {
  const { email, password } = await body(req, loginSchema);
  const { token, user } = await login(email, password, ip);
  const res = NextResponse.json({ user });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}, { rateLimit: { bucket: "auth", perMinute: 10 } });
