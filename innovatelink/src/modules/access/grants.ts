import type { SubjectType } from "@prisma/client";
import { db } from "@/lib/db";
import type { MaybeActor } from "@/modules/auth/policy";

export async function hasGrant(actor: MaybeActor, subject_type: SubjectType, subject_id: string): Promise<boolean> {
  if (!actor) return false;
  const g = await db.accessGrant.findFirst({ where: { subject_type, subject_id, user_id: actor.id, revoked_at: null }, select: { id: true } });
  return !!g;
}

export async function grantedIds(actor: MaybeActor, subject_type: SubjectType): Promise<Set<string>> {
  if (!actor) return new Set();
  const rows = await db.accessGrant.findMany({ where: { subject_type, user_id: actor.id, revoked_at: null }, select: { subject_id: true } });
  return new Set(rows.map((r) => r.subject_id));
}
