import { describe, expect, it } from "vitest";
import { A } from "../../../tests/actors";
import * as P from "./policy";

describe("access policy", () => {
  const s = A("student", "uni");
  it("visibilityAllows", () => {
    expect(P.visibilityAllows(null, { visibility: "public", visibility_org_ids: [] }, false)).toBe(true);
    expect(P.visibilityAllows(A("platform_coordinator"), { visibility: "confidential", visibility_org_ids: [] }, false)).toBe(true);
    expect(P.visibilityAllows(null, { visibility: "selected_orgs", visibility_org_ids: ["uni"] }, false)).toBe(false);
    expect(P.visibilityAllows(s, { visibility: "selected_orgs", visibility_org_ids: ["uni"] }, false)).toBe(true);
    expect(P.visibilityAllows(s, { visibility: "selected_orgs", visibility_org_ids: ["x"] }, false)).toBe(false);
    expect(P.visibilityAllows(s, { visibility: "confidential", visibility_org_ids: [] }, false)).toBe(false);
    expect(P.visibilityAllows(s, { visibility: "confidential", visibility_org_ids: [] }, true)).toBe(true);
  });
  it("teaser / request", () => {
    expect(P.canSeeTeaser(s, { visibility: "confidential", visibility_org_ids: [] })).toBe(true);
    expect(P.canSeeTeaser(null, { visibility: "confidential", visibility_org_ids: [] })).toBe(false);
    expect(P.canRequestAccess(s, { visibility: "confidential", visibility_org_ids: [] }, false)).toBe(true);
    expect(P.canRequestAccess(s, { visibility: "confidential", visibility_org_ids: [] }, true)).toBe(false);
    expect(P.canRequestAccess(s, { visibility: "public", visibility_org_ids: [] }, false)).toBe(false);
    expect(P.canRequestAccess(null, { visibility: "confidential", visibility_org_ids: [] }, false)).toBe(false);
  });
  it("narrowing", () => {
    expect(P.isNarrowing("public", "confidential", [], [])).toBe(true);
    expect(P.isNarrowing("confidential", "public", [], [])).toBe(false);
    expect(P.isNarrowing("selected_orgs", "selected_orgs", ["a", "b"], ["a"])).toBe(true);
    expect(P.isNarrowing("selected_orgs", "selected_orgs", ["a"], ["a", "b"])).toBe(false);
  });
  it("decide / NDA", () => {
    expect(P.canDecideAccess(true, s)).toBe(true);
    expect(P.canDecideAccess(false, s)).toBe(false);
    expect(P.canDecideAccess(true, null)).toBe(false);
    expect(P.canAcceptNda(s, { user_id: s.id, status: "approved" })).toBe(true);
    expect(P.canAcceptNda(s, { user_id: s.id, status: "pending" })).toBe(false);
    expect(P.canAcceptNda(s, { user_id: "x", status: "approved" })).toBe(false);
    expect(P.canAcceptNda(null, { user_id: "x", status: "approved" })).toBe(false);
  });
});
