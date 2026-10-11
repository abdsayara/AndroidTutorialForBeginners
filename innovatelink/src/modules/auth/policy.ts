import type { OrgType, Role, UserStatus } from "@prisma/client";

/** The authenticated principal every service and policy receives. `null` = visitor. */
export interface Actor {
  id: string;
  role: Role;
  status: UserStatus;
  org_id: string;
  org_type: OrgType;
}

export type MaybeActor = Actor | null;

export const COMPANY_ROLES: readonly Role[] = ["company_admin", "company_member"];
export const ACADEMIC_ROLES: readonly Role[] = ["student", "researcher"];
export const PLATFORM_ROLES: readonly Role[] = ["platform_coordinator", "platform_admin"];

/** Roles a self-registering user may pick (FR-0.1). Staff roles are assigned by an admin. */
export const SELF_REGISTER_ROLES: readonly Role[] = [
  "company_admin",
  "company_member",
  "student",
  "researcher",
  "university_coordinator",
];

/** Org type each role must belong to. */
export const ROLE_ORG_TYPE: Record<Role, OrgType> = {
  company_admin: "company",
  company_member: "company",
  student: "university",
  researcher: "university",
  university_coordinator: "university",
  platform_coordinator: "platform",
  platform_admin: "platform",
};

export function isActive(a: MaybeActor): a is Actor {
  return !!a && a.status === "active";
}

export function isPlatformStaff(a: MaybeActor): a is Actor {
  return isActive(a) && PLATFORM_ROLES.includes(a.role);
}

export function isPlatformAdmin(a: MaybeActor): a is Actor {
  return isActive(a) && a.role === "platform_admin";
}

export function isCompanyUser(a: MaybeActor): a is Actor {
  return isActive(a) && COMPANY_ROLES.includes(a.role);
}

export function isAcademic(a: MaybeActor): a is Actor {
  return isActive(a) && ACADEMIC_ROLES.includes(a.role);
}

/**
 * FR-0.2: company accounts are approved by platform coordinators;
 * students/researchers by the coordinator of their own university.
 * University coordinators are approved by platform staff.
 */
export function canApproveUser(actor: MaybeActor, target: { role: Role; org_id: string }): boolean {
  if (!isActive(actor)) return false;
  if (actor.role === "platform_admin") return true;
  if (actor.role === "platform_coordinator") {
    return !PLATFORM_ROLES.includes(target.role);
  }
  if (actor.role === "university_coordinator") {
    return ACADEMIC_ROLES.includes(target.role) && target.org_id === actor.org_id;
  }
  return false;
}

/** FR-0.3: a pending account may only complete its own profile. */
export function canEditOwnProfile(actor: MaybeActor, userId: string): boolean {
  return !!actor && actor.status !== "suspended" && actor.id === userId;
}

export function canManageUsers(actor: MaybeActor): boolean {
  return isPlatformAdmin(actor);
}
