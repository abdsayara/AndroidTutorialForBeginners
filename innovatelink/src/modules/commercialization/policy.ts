import { isPlatformStaff, type MaybeActor } from "@/modules/auth/policy";
import { isProjectMember, isProjectUniCoordinator, type ProjectLike } from "@/modules/projects/policy";

/** FR-6.1/6.3: platform coordinators run the pipeline. */
export function canManageCommercialization(actor: MaybeActor): boolean {
  return isPlatformStaff(actor);
}

/** Project team and its university coordinator may follow their own case. */
export function canViewCase(actor: MaybeActor, project: ProjectLike): boolean {
  return isPlatformStaff(actor) || isProjectMember(actor, project) || isProjectUniCoordinator(actor, project);
}

/** FR-6.4: IP records are edited by coordinators or the project's university coordinator. */
export function canEditProjectIp(actor: MaybeActor, project: ProjectLike): boolean {
  return isPlatformStaff(actor) || isProjectUniCoordinator(actor, project);
}
