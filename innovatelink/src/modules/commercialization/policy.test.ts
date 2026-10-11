import { describe, expect, it } from "vitest";
import { A } from "../../../tests/actors";
import * as P from "./policy";

const pr = { org_id: "uni", created_by: "u-student", team_member_ids: [], supervisor_id: null, status: "published" as const, visibility: "public" as const, visibility_org_ids: [] };
describe("commercialization policy", () => {
  it("rules", () => {
    expect(P.canManageCommercialization(A("platform_coordinator"))).toBe(true);
    expect(P.canManageCommercialization(A("university_coordinator"))).toBe(false);
    expect(P.canViewCase(A("student", "uni"), pr)).toBe(true);
    expect(P.canViewCase(A("university_coordinator", "uni"), pr)).toBe(true);
    expect(P.canViewCase(A("platform_admin"), pr)).toBe(true);
    expect(P.canViewCase(A("company_admin"), pr)).toBe(false);
    expect(P.canEditProjectIp(A("university_coordinator", "uni"), pr)).toBe(true);
    expect(P.canEditProjectIp(A("platform_coordinator"), pr)).toBe(true);
    expect(P.canEditProjectIp(A("student", "uni"), pr)).toBe(false);
  });
});
