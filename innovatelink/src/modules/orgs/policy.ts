import { isActive, isPlatformAdmin, isPlatformStaff, type MaybeActor } from "@/modules/auth/policy";

interface OrgLike {
  id: string;
  type: string;
  status: string;
}

/** FR-0.2: companies (and partners/universities) are approved by platform staff. */
export function canApproveOrg(actor: MaybeActor): boolean {
  return isPlatformStaff(actor);
}

export function canEditOrg(actor: MaybeActor, org: OrgLike): boolean {
  if (isPlatformAdmin(actor)) return true;
  if (!actor || actor.status === "suspended" || actor.org_id !== org.id) return false;
  return actor.role === "company_admin" || actor.role === "university_coordinator";
}

export function canListMembers(actor: MaybeActor, org: OrgLike): boolean {
  if (isPlatformStaff(actor)) return true;
  return isActive(actor) && actor.org_id === org.id;
}

/** Org names are public once active (needed for picking an org at registration). */
export function canViewOrg(actor: MaybeActor, org: OrgLike): boolean {
  if (org.status === "active") return true;
  if (isPlatformStaff(actor)) return true;
  return !!actor && actor.org_id === org.id;
}
