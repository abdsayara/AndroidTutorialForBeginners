import type { Visibility } from "@prisma/client";
import { isActive, isPlatformStaff, type MaybeActor } from "@/modules/auth/policy";

/** Anything carrying the three-level confidentiality model (PRD §3). */
export interface Confidential {
  visibility: Visibility;
  visibility_org_ids: string[];
}

/**
 * Pure confidentiality rule for a *listed* (published) entity, ignoring ownership.
 * - public: everyone, including visitors
 * - selected_orgs: active users of listed orgs, or an individual grant
 * - confidential: platform staff, or an individual grant (after NDA)
 */
export function visibilityAllows(actor: MaybeActor, e: Confidential, hasGrant: boolean): boolean {
  if (e.visibility === "public") return true;
  if (isPlatformStaff(actor)) return true;
  if (!isActive(actor)) return false;
  if (hasGrant) return true;
  if (e.visibility === "selected_orgs") return e.visibility_org_ids.includes(actor.org_id);
  return false;
}

/** FR-0.5: approved users see a generic teaser of confidential entities with "request access". */
export function canSeeTeaser(actor: MaybeActor, e: Confidential): boolean {
  return isActive(actor) && e.visibility === "confidential";
}

export function canRequestAccess(actor: MaybeActor, e: Confidential, hasGrant: boolean): boolean {
  return isActive(actor) && e.visibility !== "public" && !visibilityAllows(actor, e, hasGrant);
}

/** Visibility narrowing order: public > selected_orgs > confidential. */
const RANK: Record<Visibility, number> = { public: 0, selected_orgs: 1, confidential: 2 };

/** FR-1.6: narrowing visibility revokes previously granted access. */
export function isNarrowing(from: Visibility, to: Visibility, fromOrgs: string[], toOrgs: string[]): boolean {
  if (RANK[to] > RANK[from]) return true;
  if (from === "selected_orgs" && to === "selected_orgs") return fromOrgs.some((o) => !toOrgs.includes(o));
  return false;
}

/** FR-0.6: only the owner of the entity approves access requests. */
export function canDecideAccess(isOwner: boolean, actor: MaybeActor): boolean {
  return isActive(actor) && isOwner;
}

/** FR-0.6: NDA can only be accepted against an approved request by the requester. */
export function canAcceptNda(actor: MaybeActor, req: { user_id: string; status: string }): boolean {
  return isActive(actor) && req.user_id === actor.id && req.status === "approved";
}
