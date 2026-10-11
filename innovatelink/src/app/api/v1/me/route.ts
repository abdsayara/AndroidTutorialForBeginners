import { route, body, requireActor } from "@/lib/api/handler";
import { NextResponse } from "next/server";
import { profileSchema } from "@/modules/auth/schema";
import { deleteMyAccount, me, updateProfile } from "@/modules/auth/service";
import { SESSION_COOKIE } from "@/lib/auth/session";

export const GET = route(async ({ actor }) => me(requireActor(actor)));
export const PATCH = route(async ({ req, actor }) => updateProfile(requireActor(actor), await body(req, profileSchema)));
export const DELETE = route(async ({ actor, ip }) => {
  await deleteMyAccount(requireActor(actor), ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
});
