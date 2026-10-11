import type { ProjectStatus } from "@prisma/client";
import { isActive, isCompanyUser, isPlatformAdmin, isPlatformStaff, type MaybeActor } from "@/modules/auth/policy";
import { canSeeTeaser, visibilityAllows, type Confidential } from "@/modules/access/policy";

export interface ProjectLike extends Confidential {
  org_id: string;
  created_by: string;
  team_member_ids: string[];
  supervisor_id: string | null;
  status: ProjectStatus;
}

export const LISTED_PROJECT_STATUSES: readonly ProjectStatus[] = ["published", "in_collaboration", "commercializing"];

export const PROJECT_TRANSITIONS: Record<ProjectStatus, readonly ProjectStatus[]> = {
  draft: ["pending_approval", "archived"],
  pending_approval: ["published", "draft", "archived"],
  published: ["in_collaboration", "commercializing", "archived"],
  in_collaboration: ["published", "commercializing", "archived"],
  commercializing: ["archived"],
  archived: [],
};

export function canTransitionProject(from: ProjectStatus, to: ProjectStatus): boolean {
  return PROJECT_TRANSITIONS[from].includes(to);
}

/** Creator, team member or supervisor. */
export function isProjectMember(actor: MaybeActor, p: ProjectLike): boolean {
  if (!isActive(actor)) return false;
  return p.created_by === actor.id || p.team_member_ids.includes(actor.id) || p.supervisor_id === actor.id;
}

export function isProjectUniCoordinator(actor: MaybeActor, p: { org_id: string }): boolean {
  return isActive(actor) && actor.role === "university_coordinator" && actor.org_id === p.org_id;
}

export function canCreateProject(actor: MaybeActor): boolean {
  return isActive(actor) && (actor.role === "student" || actor.role === "researcher" || actor.role === "university_coordinator");
}

export function canEditProject(actor: MaybeActor, p: ProjectLike): boolean {
  if (p.status === "archived") return false;
  return isProjectMember(actor, p) || isProjectUniCoordinator(actor, p);
}

export function canSubmitProject(actor: MaybeActor, p: ProjectLike): boolean {
  return p.status === "draft" && canEditProject(actor, p);
}

/** FR-3.2: publication requires the coordinator of the project's university. */
export function canApproveProject(actor: MaybeActor, p: ProjectLike): boolean {
  if (p.status !== "pending_approval") return false;
  return isProjectUniCoordinator(actor, p) || isPlatformAdmin(actor);
}

export function canViewProject(actor: MaybeActor, p: ProjectLike, hasGrant = false): boolean {
  if (isProjectMember(actor, p) || isProjectUniCoordinator(actor, p) || isPlatformStaff(actor)) return true;
  if (!LISTED_PROJECT_STATUSES.includes(p.status)) return false;
  return visibilityAllows(actor, p, hasGrant);
}

export function canSeeProjectTeaser(actor: MaybeActor, p: ProjectLike): boolean {
  return LISTED_PROJECT_STATUSES.includes(p.status) && canSeeTeaser(actor, p);
}

/** FR-3.4: "request contact" button for companies. */
export function canRequestProjectContact(actor: MaybeActor, p: ProjectLike, hasGrant = false): boolean {
  return isCompanyUser(actor) && LISTED_PROJECT_STATUSES.includes(p.status) && canViewProject(actor, p, hasGrant);
}

/** FR-3.5: bulk CSV import by a university coordinator (into their own university). */
export function canImportProjects(actor: MaybeActor): boolean {
  return isActive(actor) && (actor.role === "university_coordinator" || actor.role === "platform_admin");
}

/** Contact details (team emails) are hidden from visitors (PRD §3). */
export function canSeeContactDetails(actor: MaybeActor): boolean {
  return isActive(actor);
}
