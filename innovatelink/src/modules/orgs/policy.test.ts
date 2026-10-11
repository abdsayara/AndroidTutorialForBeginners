import { describe, expect, it } from "vitest";
import { A } from "../../../tests/actors";
import * as P from "./policy";

const O = (status = "active", id = "org-1") => ({ id, type: "company", status });

describe("org policy", () => {
  it("approve", () => {
    expect(P.canApproveOrg(A("platform_coordinator"))).toBe(true);
    expect(P.canApproveOrg(A("company_admin"))).toBe(false);
  });
  it("edit", () => {
    expect(P.canEditOrg(A("platform_admin", "p"), O())).toBe(true);
    expect(P.canEditOrg(A("company_admin"), O())).toBe(true);
    expect(P.canEditOrg(A("company_admin", "org-1", "pending"), O())).toBe(true);
    expect(P.canEditOrg(A("university_coordinator"), O())).toBe(true);
    expect(P.canEditOrg(A("company_member"), O())).toBe(false);
    expect(P.canEditOrg(A("company_admin", "other"), O())).toBe(false);
    expect(P.canEditOrg(A("company_admin", "org-1", "suspended"), O())).toBe(false);
    expect(P.canEditOrg(null, O())).toBe(false);
  });
  it("members and view", () => {
    expect(P.canListMembers(A("platform_coordinator", "p"), O())).toBe(true);
    expect(P.canListMembers(A("company_member"), O())).toBe(true);
    expect(P.canListMembers(A("company_member", "x"), O())).toBe(false);
    expect(P.canViewOrg(null, O())).toBe(true);
    expect(P.canViewOrg(null, O("pending"))).toBe(false);
    expect(P.canViewOrg(A("platform_coordinator", "p"), O("pending"))).toBe(true);
    expect(P.canViewOrg(A("company_admin", "org-1", "pending"), O("pending"))).toBe(true);
  });
});
