import { describe, expect, it } from "vitest";
import type { ProjectStatus, Visibility } from "@prisma/client";
import { A } from "../../../tests/actors";
import * as P from "./policy";

const Pr = (status: ProjectStatus = "published", visibility: Visibility = "public", extra: Partial<P.ProjectLike> = {}): P.ProjectLike => ({
  org_id: "uni", created_by: "u-student", team_member_ids: ["t1"], supervisor_id: "sup", status, visibility, visibility_org_ids: [], ...extra,
});

describe("project policy", () => {
  const student = A("student", "uni");
  const teammate = A("student", "uni", "active", "t1");
  const sup = A("researcher", "uni", "active", "sup");
  const uc = A("university_coordinator", "uni");
  const otherUc = A("university_coordinator", "uni2");
  const company = A("company_admin", "co");
  const admin = A("platform_admin", "plat");

  it("transitions", () => {
    expect(P.canTransitionProject("draft", "pending_approval")).toBe(true);
    expect(P.canTransitionProject("draft", "published")).toBe(false);
    expect(P.canTransitionProject("archived", "draft")).toBe(false);
  });

  it("membership", () => {
    expect(P.isProjectMember(student, Pr())).toBe(true);
    expect(P.isProjectMember(teammate, Pr())).toBe(true);
    expect(P.isProjectMember(sup, Pr())).toBe(true);
    expect(P.isProjectMember(company, Pr())).toBe(false);
    expect(P.isProjectMember(null, Pr())).toBe(false);
    expect(P.isProjectUniCoordinator(uc, Pr())).toBe(true);
    expect(P.isProjectUniCoordinator(otherUc, Pr())).toBe(false);
  });

  it("create / edit / submit", () => {
    expect(P.canCreateProject(student)).toBe(true);
    expect(P.canCreateProject(uc)).toBe(true);
    expect(P.canCreateProject(company)).toBe(false);
    expect(P.canCreateProject(null)).toBe(false);
    expect(P.canEditProject(student, Pr("draft"))).toBe(true);
    expect(P.canEditProject(uc, Pr("published"))).toBe(true);
    expect(P.canEditProject(student, Pr("archived"))).toBe(false);
    expect(P.canEditProject(company, Pr("draft"))).toBe(false);
    expect(P.canSubmitProject(student, Pr("draft"))).toBe(true);
    expect(P.canSubmitProject(student, Pr("published"))).toBe(false);
  });

  it("FR-3.2 approval by own university coordinator", () => {
    expect(P.canApproveProject(uc, Pr("pending_approval"))).toBe(true);
    expect(P.canApproveProject(otherUc, Pr("pending_approval"))).toBe(false);
    expect(P.canApproveProject(admin, Pr("pending_approval"))).toBe(true);
    expect(P.canApproveProject(uc, Pr("draft"))).toBe(false);
  });

  it("view by level, teaser, contact", () => {
    expect(P.canViewProject(null, Pr())).toBe(true);
    expect(P.canViewProject(null, Pr("draft"))).toBe(false);
    expect(P.canViewProject(student, Pr("draft"))).toBe(true);
    expect(P.canViewProject(admin, Pr("draft"))).toBe(true);
    expect(P.canViewProject(company, Pr("published", "confidential"))).toBe(false);
    expect(P.canViewProject(company, Pr("published", "confidential"), true)).toBe(true);
    expect(P.canSeeProjectTeaser(company, Pr("published", "confidential"))).toBe(true);
    expect(P.canSeeProjectTeaser(company, Pr("draft", "confidential"))).toBe(false);
    expect(P.canRequestProjectContact(company, Pr())).toBe(true);
    expect(P.canRequestProjectContact(student, Pr())).toBe(false);
    expect(P.canRequestProjectContact(company, Pr("draft"))).toBe(false);
  });

  it("import and contact details", () => {
    expect(P.canImportProjects(uc)).toBe(true);
    expect(P.canImportProjects(admin)).toBe(true);
    expect(P.canImportProjects(student)).toBe(false);
    expect(P.canImportProjects(null)).toBe(false);
    expect(P.canSeeContactDetails(null)).toBe(false);
    expect(P.canSeeContactDetails(student)).toBe(true);
  });
});
