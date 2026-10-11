import { describe, expect, it } from "vitest";
import type { Role } from "@prisma/client";
import {
  canApproveUser, canEditOwnProfile, canManageUsers, isAcademic, isActive, isCompanyUser, isPlatformAdmin, isPlatformStaff, type Actor,
} from "./policy";

const A = (role: Role, org_id = "o1", status: Actor["status"] = "active"): Actor => ({ id: `u-${role}`, role, status, org_id, org_type: "company" });

describe("auth policy", () => {
  it("role predicates require active status", () => {
    expect(isActive(null)).toBe(false);
    expect(isActive(A("student", "o", "pending"))).toBe(false);
    expect(isPlatformStaff(A("platform_coordinator"))).toBe(true);
    expect(isPlatformStaff(A("platform_admin", "o", "pending"))).toBe(false);
    expect(isPlatformAdmin(A("platform_coordinator"))).toBe(false);
    expect(isPlatformAdmin(A("platform_admin"))).toBe(true);
    expect(isCompanyUser(A("company_member"))).toBe(true);
    expect(isCompanyUser(A("student"))).toBe(false);
    expect(isAcademic(A("researcher"))).toBe(true);
    expect(isAcademic(A("company_admin"))).toBe(false);
  });

  it("FR-0.2: platform coordinator approves companies, not staff", () => {
    const pc = A("platform_coordinator");
    expect(canApproveUser(pc, { role: "company_admin", org_id: "x" })).toBe(true);
    expect(canApproveUser(pc, { role: "platform_admin", org_id: "x" })).toBe(false);
    expect(canApproveUser(A("platform_admin"), { role: "platform_coordinator", org_id: "x" })).toBe(true);
  });

  it("FR-0.2: university coordinator approves only academics of own university", () => {
    const uc = A("university_coordinator", "uni1");
    expect(canApproveUser(uc, { role: "student", org_id: "uni1" })).toBe(true);
    expect(canApproveUser(uc, { role: "researcher", org_id: "uni2" })).toBe(false);
    expect(canApproveUser(uc, { role: "company_admin", org_id: "uni1" })).toBe(false);
  });

  it("other roles and inactive actors cannot approve", () => {
    expect(canApproveUser(null, { role: "student", org_id: "o" })).toBe(false);
    expect(canApproveUser(A("company_admin"), { role: "company_member", org_id: "o1" })).toBe(false);
    expect(canApproveUser(A("platform_admin", "o", "pending"), { role: "student", org_id: "o" })).toBe(false);
  });

  it("FR-0.3: pending users may edit their own profile, suspended may not", () => {
    expect(canEditOwnProfile(A("student", "o", "pending"), "u-student")).toBe(true);
    expect(canEditOwnProfile(A("student", "o", "suspended"), "u-student")).toBe(false);
    expect(canEditOwnProfile(A("student"), "other")).toBe(false);
    expect(canEditOwnProfile(null, "x")).toBe(false);
  });

  it("only platform admin manages users", () => {
    expect(canManageUsers(A("platform_admin"))).toBe(true);
    expect(canManageUsers(A("platform_coordinator"))).toBe(false);
  });
});
