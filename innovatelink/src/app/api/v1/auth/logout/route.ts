import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { route } from "@/lib/api/handler";
import { destroySession, SESSION_COOKIE } from "@/lib/auth/session";

export const POST = route(async () => {
  const jar = await cookies();
  const t = jar.get(SESSION_COOKIE)?.value;
  if (t) await destroySession(t);
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
});
