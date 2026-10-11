import type { WorkspaceStatus, WsRole } from "@prisma/client";
import { isActive, isPlatformStaff, type MaybeActor } from "@/modules/auth/policy";

export interface MemberLike { ws_role: WsRole }
export interface WorkspaceLike { status: WorkspaceStatus }

/** FR-4 acceptance: non-members get 404 for any workspace route. Platform staff can oversee. */
export function canViewWorkspace(actor: MaybeActor, member: MemberLike | null): boolean {
  if (!isActive(actor)) return false;
  return !!member || isPlatformStaff(actor);
}

/** Content edits (tasks, files, notes, updates) by members while not finished. */
export function canEditWorkspace(actor: MaybeActor, member: MemberLike | null, ws: WorkspaceLike): boolean {
  if (!isActive(actor) || !member) return false;
  return ws.status === "setup" || ws.status === "active" || ws.status === "paused";
}

/** Manage members, settings, activation: company rep, supervisor or coordinator. */
export function canManageWorkspace(actor: MaybeActor, member: MemberLike | null, ws: WorkspaceLike): boolean {
  if (!canEditWorkspace(actor, member, ws) && !(isPlatformStaff(actor) && ws.status !== "completed" && ws.status !== "cancelled")) return false;
  return isPlatformStaff(actor) || (!!member && ["company_rep", "supervisor", "coordinator"].includes(member.ws_role));
}

/** FR-4.2: activation requires the signed agreement and a basic IpRecord (checked by service). */
export function canActivateWorkspace(actor: MaybeActor, member: MemberLike | null, ws: WorkspaceLike): boolean {
  return ws.status === "setup" && canManageWorkspace(actor, member, ws);
}

/** FR-4.7: closing and rating are done by the company representative. */
export function canCloseWorkspace(actor: MaybeActor, member: MemberLike | null, ws: WorkspaceLike): boolean {
  return (ws.status === "active" || ws.status === "paused") && !!member && member.ws_role === "company_rep" && isActive(actor);
}

/** FR-4.8: academic supervisor links the workspace to a course. */
export function canLinkCourse(actor: MaybeActor, member: MemberLike | null, ws: WorkspaceLike): boolean {
  return canEditWorkspace(actor, member, ws) && member!.ws_role === "supervisor";
}
