import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { getActor } from "./current";
import type { Actor } from "@/modules/auth/policy";

/** Server Component guard: redirect visitors to login. UI hiding is not protection — services re-check. */
export async function requireUser(locale: string): Promise<Actor> {
  const a = await getActor();
  if (!a) redirect(`/${locale}/auth/login`);
  return a;
}

/** Guard that also requires an approved account and (optionally) a role. */
export async function requireActive(locale: string, roles?: Role[]): Promise<Actor> {
  const a = await requireUser(locale);
  if (a.status !== "active") redirect(`/${locale}/dashboard`);
  if (roles && !roles.includes(a.role)) redirect(`/${locale}/dashboard`);
  return a;
}
