import { describe, expect, it } from "vitest";
import { A } from "../../../tests/actors";
import * as P from "./policy";

const W = (status: "setup" | "active" | "paused" | "completed" | "cancelled" = "active") => ({ status });
const M = (ws_role: "company_rep" | "mentor" | "supervisor" | "student" | "coordinator") => ({ ws_role });

describe("workspace policy", () => {
  const u = A("student");
  const staff = A("platform_coordinator");
  it("view: members and staff only", () => {
    expect(P.canViewWorkspace(u, M("student"))).toBe(true);
    expect(P.canViewWorkspace(u, null)).toBe(false);
    expect(P.canViewWorkspace(staff, null)).toBe(true);
    expect(P.canViewWorkspace(null, M("student"))).toBe(false);
  });
  it("edit while open", () => {
    expect(P.canEditWorkspace(u, M("student"), W("setup"))).toBe(true);
    expect(P.canEditWorkspace(u, M("student"), W("paused"))).toBe(true);
    expect(P.canEditWorkspace(u, M("student"), W("completed"))).toBe(false);
    expect(P.canEditWorkspace(u, null, W())).toBe(false);
    expect(P.canEditWorkspace(null, M("student"), W())).toBe(false);
  });
  it("manage / activate", () => {
    expect(P.canManageWorkspace(u, M("company_rep"), W())).toBe(true);
    expect(P.canManageWorkspace(u, M("student"), W())).toBe(false);
    expect(P.canManageWorkspace(staff, null, W())).toBe(true);
    expect(P.canManageWorkspace(staff, null, W("completed"))).toBe(false);
    expect(P.canManageWorkspace(u, M("company_rep"), W("completed"))).toBe(false);
    expect(P.canActivateWorkspace(u, M("supervisor"), W("setup"))).toBe(true);
    expect(P.canActivateWorkspace(u, M("supervisor"), W("active"))).toBe(false);
  });
  it("close and course link", () => {
    expect(P.canCloseWorkspace(u, M("company_rep"), W())).toBe(true);
    expect(P.canCloseWorkspace(u, M("supervisor"), W())).toBe(false);
    expect(P.canCloseWorkspace(u, M("company_rep"), W("setup"))).toBe(false);
    expect(P.canCloseWorkspace(u, null, W())).toBe(false);
    expect(P.canCloseWorkspace(A("student", "o", "suspended"), M("company_rep"), W())).toBe(false);
    expect(P.canLinkCourse(u, M("supervisor"), W())).toBe(true);
    expect(P.canLinkCourse(u, M("student"), W())).toBe(false);
    expect(P.canLinkCourse(u, M("supervisor"), W("completed"))).toBe(false);
  });
});
