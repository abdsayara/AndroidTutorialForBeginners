import { isAcademic, isActive, isCompanyUser, type MaybeActor } from "@/modules/auth/policy";

export type ContactTarget = "challenge" | "project" | "researcher" | "lab";

/** FR-1.7 academics express interest in challenges; FR-3.4 companies contact projects/experts/labs. */
export function canSendContact(actor: MaybeActor, target: ContactTarget): boolean {
  if (!isActive(actor)) return false;
  if (target === "challenge") return isAcademic(actor);
  return actor.role === "platform_coordinator" || isCompanyUser(actor);
}

export function canRespondContact(actor: MaybeActor, ownerIds: string[], status: string): boolean {
  return isActive(actor) && ownerIds.includes(actor.id) && status === "pending";
}
