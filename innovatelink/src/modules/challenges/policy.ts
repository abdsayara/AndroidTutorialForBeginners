import type { ChallengeStatus } from "@prisma/client";
import { isAcademic, isActive, isPlatformStaff, type MaybeActor } from "@/modules/auth/policy";
import { canSeeTeaser, visibilityAllows, type Confidential } from "@/modules/access/policy";

export interface ChallengeLike extends Confidential {
  org_id: string;
  status: ChallengeStatus;
}

/** Statuses visible outside the owning company and the platform team. */
export const LISTED_CHALLENGE_STATUSES: readonly ChallengeStatus[] = ["published", "matched", "in_progress", "solved"];

/** Statuses in which the company may still edit the challenge content. */
export const EDITABLE_CHALLENGE_STATUSES: readonly ChallengeStatus[] = ["draft", "needs_info"];

/** Allowed transitions (PRD §5). Keys are `from`, values the permitted `to`. */
export const CHALLENGE_TRANSITIONS: Record<ChallengeStatus, readonly ChallengeStatus[]> = {
  draft: ["submitted", "closed"],
  submitted: ["published", "needs_info", "closed"],
  needs_info: ["submitted", "closed"],
  published: ["matched", "closed"],
  matched: ["in_progress", "closed"],
  in_progress: ["solved", "closed"],
  solved: [],
  closed: [],
};

export function canTransitionChallenge(from: ChallengeStatus, to: ChallengeStatus): boolean {
  return CHALLENGE_TRANSITIONS[from].includes(to);
}

export function isChallengeOwner(actor: MaybeActor, c: { org_id: string }): boolean {
  return !!actor && actor.status === "active" && actor.org_id === c.org_id &&
    (actor.role === "company_admin" || actor.role === "company_member");
}

export function canCreateChallenge(actor: MaybeActor): boolean {
  return isActive(actor) && actor.role === "company_admin";
}

/** Only the company admin may manage a challenge (content, visibility, close, accept matches). */
export function canManageChallenge(actor: MaybeActor, c: { org_id: string }): boolean {
  return isActive(actor) && actor.role === "company_admin" && actor.org_id === c.org_id;
}

export function canEditChallengeContent(actor: MaybeActor, c: ChallengeLike): boolean {
  return canManageChallenge(actor, c) && EDITABLE_CHALLENGE_STATUSES.includes(c.status);
}

export function canSubmitChallenge(actor: MaybeActor, c: ChallengeLike): boolean {
  return canEditChallengeContent(actor, c);
}

/** FR-1.6: visibility can be changed or the challenge closed at any time. */
export function canChangeChallengeVisibility(actor: MaybeActor, c: ChallengeLike): boolean {
  return canManageChallenge(actor, c) && c.status !== "closed";
}

export function canCloseChallenge(actor: MaybeActor, c: ChallengeLike): boolean {
  if (c.status === "closed" || c.status === "solved") return false;
  return canManageChallenge(actor, c) || isPlatformStaff(actor);
}

/** FR-1.4 / §5: only a platform coordinator moves submitted → published | needs_info. */
export function canReviewChallenge(actor: MaybeActor, c: ChallengeLike): boolean {
  return isPlatformStaff(actor) && c.status === "submitted";
}

/** Full details. FR-1.x acceptance: never visible to academics before publication. */
export function canViewChallenge(actor: MaybeActor, c: ChallengeLike, hasGrant = false): boolean {
  if (isChallengeOwner(actor, c)) return true;
  if (isPlatformStaff(actor)) return true;
  if (!LISTED_CHALLENGE_STATUSES.includes(c.status)) return false;
  return visibilityAllows(actor, c, hasGrant);
}

/** FR-0.5: generic title + sector only, with a "request access" button. */
export function canSeeChallengeTeaser(actor: MaybeActor, c: ChallengeLike): boolean {
  return LISTED_CHALLENGE_STATUSES.includes(c.status) && canSeeTeaser(actor, c);
}

/** FR-1.7: "express interest" for academics who can see the challenge. */
export function canExpressInterest(actor: MaybeActor, c: ChallengeLike, hasGrant = false): boolean {
  return isAcademic(actor) && c.status === "published" && canViewChallenge(actor, c, hasGrant);
}

export function canDiagnoseChallenge(actor: MaybeActor, c: ChallengeLike): boolean {
  return canEditChallengeContent(actor, c);
}
