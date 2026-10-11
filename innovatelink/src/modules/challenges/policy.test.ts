import { describe, expect, it } from "vitest";
import type { ChallengeStatus, Visibility } from "@prisma/client";
import { A } from "../../../tests/actors";
import * as P from "./policy";

const C = (status: ChallengeStatus = "published", visibility: Visibility = "public", orgs: string[] = []): P.ChallengeLike => ({ org_id: "co", status, visibility, visibility_org_ids: orgs });

describe("challenge policy", () => {
  const admin = A("company_admin", "co");
  const member = A("company_member", "co");
  const outsider = A("company_admin", "other");
  const student = A("student", "uni");
  const coord = A("platform_coordinator", "plat");

  it("transitions follow the PRD state machine", () => {
    expect(P.canTransitionChallenge("draft", "submitted")).toBe(true);
    expect(P.canTransitionChallenge("draft", "published")).toBe(false);
    expect(P.canTransitionChallenge("needs_info", "submitted")).toBe(true);
    expect(P.canTransitionChallenge("solved", "closed")).toBe(false);
  });

  it("only company admins create and manage", () => {
    expect(P.canCreateChallenge(admin)).toBe(true);
    expect(P.canCreateChallenge(member)).toBe(false);
    expect(P.canCreateChallenge(null)).toBe(false);
    expect(P.canManageChallenge(admin, C())).toBe(true);
    expect(P.canManageChallenge(outsider, C())).toBe(false);
    expect(P.isChallengeOwner(member, C())).toBe(true);
    expect(P.isChallengeOwner(A("company_member", "co", "pending"), C())).toBe(false);
    expect(P.isChallengeOwner(A("student", "co"), C())).toBe(false);
    expect(P.isChallengeOwner(null, C())).toBe(false);
  });

  it("content editable only in draft/needs_info; visibility & close any time", () => {
    expect(P.canEditChallengeContent(admin, C("draft"))).toBe(true);
    expect(P.canEditChallengeContent(admin, C("published"))).toBe(false);
    expect(P.canSubmitChallenge(admin, C("needs_info"))).toBe(true);
    expect(P.canDiagnoseChallenge(admin, C("draft"))).toBe(true);
    expect(P.canChangeChallengeVisibility(admin, C("in_progress"))).toBe(true);
    expect(P.canChangeChallengeVisibility(admin, C("closed"))).toBe(false);
    expect(P.canCloseChallenge(admin, C("published"))).toBe(true);
    expect(P.canCloseChallenge(coord, C("published"))).toBe(true);
    expect(P.canCloseChallenge(student, C("published"))).toBe(false);
    expect(P.canCloseChallenge(admin, C("closed"))).toBe(false);
    expect(P.canCloseChallenge(admin, C("solved"))).toBe(false);
  });

  it("FR-1.4: only platform staff review submitted challenges", () => {
    expect(P.canReviewChallenge(coord, C("submitted"))).toBe(true);
    expect(P.canReviewChallenge(coord, C("draft"))).toBe(false);
    expect(P.canReviewChallenge(admin, C("submitted"))).toBe(false);
  });

  it("acceptance: unpublished challenges are invisible to academics", () => {
    for (const s of ["draft", "submitted", "needs_info", "closed"] as const) expect(P.canViewChallenge(student, C(s))).toBe(false);
    expect(P.canViewChallenge(member, C("draft"))).toBe(true);
    expect(P.canViewChallenge(coord, C("draft"))).toBe(true);
  });

  it("§3 visibility levels", () => {
    expect(P.canViewChallenge(null, C("published", "public"))).toBe(true);
    expect(P.canViewChallenge(null, C("published", "selected_orgs", ["uni"]))).toBe(false);
    expect(P.canViewChallenge(student, C("published", "selected_orgs", ["uni"]))).toBe(true);
    expect(P.canViewChallenge(A("student", "uni2"), C("published", "selected_orgs", ["uni"]))).toBe(false);
    expect(P.canViewChallenge(student, C("published", "confidential"))).toBe(false);
    expect(P.canViewChallenge(student, C("published", "confidential"), true)).toBe(true);
    expect(P.canViewChallenge(A("student", "uni", "pending"), C("published", "confidential"), true)).toBe(false);
  });

  it("FR-0.5 teaser for confidential, only for approved users", () => {
    expect(P.canSeeChallengeTeaser(student, C("published", "confidential"))).toBe(true);
    expect(P.canSeeChallengeTeaser(null, C("published", "confidential"))).toBe(false);
    expect(P.canSeeChallengeTeaser(student, C("draft", "confidential"))).toBe(false);
    expect(P.canSeeChallengeTeaser(student, C("published", "public"))).toBe(false);
  });

  it("FR-1.7 express interest", () => {
    expect(P.canExpressInterest(student, C())).toBe(true);
    expect(P.canExpressInterest(admin, C())).toBe(false);
    expect(P.canExpressInterest(student, C("matched"))).toBe(false);
    expect(P.canExpressInterest(student, C("published", "confidential"))).toBe(false);
  });
});
