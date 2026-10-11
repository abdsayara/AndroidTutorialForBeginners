import { describe, expect, it } from "vitest";
import { A } from "../../../tests/actors";
import * as P from "./policy";

describe("matching policy", () => {
  const coord = A("platform_coordinator");
  const co = A("company_admin");
  it("visibility by side", () => {
    expect(P.visibleMatchStatuses(coord, "none")).toContain("suggested");
    expect(P.visibleMatchStatuses(co, "company")).not.toContain("suggested");
    expect(P.visibleMatchStatuses(co, "academic")).toEqual(P.ACADEMIC_VISIBLE);
    expect(P.visibleMatchStatuses(co, "none")).toEqual([]);
    expect(P.visibleMatchStatuses(null, "company")).toEqual([]);
  });
  it("coordinator actions", () => {
    expect(P.canShortlist(coord, { status: "suggested" })).toBe(true);
    expect(P.canShortlist(coord, { status: "shortlisted" })).toBe(false);
    expect(P.canShortlist(co, { status: "suggested" })).toBe(false);
    expect(P.canRejectAsCoordinator(coord, { status: "shortlisted" })).toBe(true);
    expect(P.canRejectAsCoordinator(coord, { status: "confirmed" })).toBe(false);
    expect(P.canRejectAsCoordinator(coord, { status: "rejected" })).toBe(false);
    expect(P.canAddManualMatch(coord)).toBe(true);
    expect(P.canViewClusters(co)).toBe(false);
    expect(P.canRematch(coord)).toBe(true);
    expect(P.canSeeAllMatches(co)).toBe(false);
  });
  it("responses and the three-act rule", () => {
    expect(P.canRespondAsCompany(co, true, { status: "suggested" })).toBe(false);
    expect(P.canRespondAsCompany(co, true, { status: "shortlisted" })).toBe(true);
    expect(P.canRespondAsCompany(co, true, { status: "accepted_by_academic" })).toBe(true);
    expect(P.canRespondAsCompany(co, false, { status: "shortlisted" })).toBe(false);
    expect(P.canRespondAsAcademic(A("student"), true, { status: "accepted_by_company" })).toBe(true);
    expect(P.canRespondAsAcademic(A("student"), true, { status: "suggested" })).toBe(false);
    expect(P.nextOnAccept("company", "shortlisted")).toBe("accepted_by_company");
    expect(P.nextOnAccept("company", "accepted_by_academic")).toBe("confirmed");
    expect(P.nextOnAccept("academic", "shortlisted")).toBe("accepted_by_academic");
    expect(P.nextOnAccept("academic", "accepted_by_company")).toBe("confirmed");
  });
});
