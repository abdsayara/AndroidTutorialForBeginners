import type { MatchStatus } from "@prisma/client";
import { isActive, isPlatformStaff, type MaybeActor } from "@/modules/auth/policy";

/** Statuses the company may see (FR-2.3: only what the coordinator shortlisted onwards). */
export const COMPANY_VISIBLE: readonly MatchStatus[] = ["shortlisted", "accepted_by_company", "accepted_by_academic", "confirmed"];
/** The academic side sees the match once shortlisted, like the company. */
export const ACADEMIC_VISIBLE = COMPANY_VISIBLE;

export function canSeeAllMatches(actor: MaybeActor): boolean {
  return isPlatformStaff(actor);
}

/** Which match statuses this viewer may see, given their side. */
export function visibleMatchStatuses(actor: MaybeActor, side: "company" | "academic" | "none"): readonly MatchStatus[] {
  if (canSeeAllMatches(actor)) return ["suggested", "shortlisted", "accepted_by_company", "accepted_by_academic", "confirmed", "rejected"];
  if (!isActive(actor) || side === "none") return [];
  return side === "company" ? COMPANY_VISIBLE : ACADEMIC_VISIBLE;
}

/** FR-2.3: coordinator shortlists or rejects suggestions. */
export function canShortlist(actor: MaybeActor, m: { status: MatchStatus }): boolean {
  return isPlatformStaff(actor) && m.status === "suggested";
}

export function canRejectAsCoordinator(actor: MaybeActor, m: { status: MatchStatus }): boolean {
  return isPlatformStaff(actor) && m.status !== "confirmed" && m.status !== "rejected";
}

/** FR-2.4: company admin of the challenge responds once shortlisted. */
export function canRespondAsCompany(actor: MaybeActor, isChallengeAdmin: boolean, m: { status: MatchStatus }): boolean {
  return isActive(actor) && isChallengeAdmin && (m.status === "shortlisted" || m.status === "accepted_by_academic");
}

/** FR-2.4: the academic owner of the target responds once shortlisted. */
export function canRespondAsAcademic(actor: MaybeActor, isTargetOwner: boolean, m: { status: MatchStatus }): boolean {
  return isActive(actor) && isTargetOwner && (m.status === "shortlisted" || m.status === "accepted_by_company");
}

/**
 * Next status after an acceptance. Confirmation requires both sides, and both
 * sides can act only after a coordinator shortlisted: three human acts in total.
 */
export function nextOnAccept(side: "company" | "academic", current: MatchStatus): MatchStatus {
  if (side === "company") return current === "accepted_by_academic" ? "confirmed" : "accepted_by_company";
  return current === "accepted_by_company" ? "confirmed" : "accepted_by_academic";
}

/** FR-2.5 */
export function canAddManualMatch(actor: MaybeActor): boolean {
  return isPlatformStaff(actor);
}

/** FR-2.7: clusters are visible to platform coordinators only. */
export function canViewClusters(actor: MaybeActor): boolean {
  return isPlatformStaff(actor);
}

export function canRematch(actor: MaybeActor): boolean {
  return isPlatformStaff(actor);
}
