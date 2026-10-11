import type { z } from "zod";
import { db } from "@/lib/db";
import { AppError, assertAllowed, notFound } from "@/lib/api/errors";
import { audit } from "@/lib/audit";
import { notify } from "@/modules/notifications/service";
import { isPlatformAdmin, isPlatformStaff, type MaybeActor, type Actor } from "@/modules/auth/policy";
import { canApproveOrg, canEditOrg, canListMembers, canViewOrg } from "./policy";
import type { orgCreateSchema, orgListSchema, orgUpdateSchema } from "./schema";

const PUBLIC_FIELDS = { id: true, type: true, name_ar: true, name_en: true, city: true, size: true, sector_id: true, status: true } as const;

export async function listOrgs(actor: MaybeActor, q: z.infer<typeof orgListSchema>) {
  const staff = isPlatformStaff(actor);
  const where = {
    deleted_at: null,
    ...(q.type ? { type: q.type } : {}),
    // Non-staff only see active orgs (for the registration picker and directories).
    status: staff ? q.status : ("active" as const),
    ...(q.q ? { OR: [{ name_ar: { contains: q.q, mode: "insensitive" as const } }, { name_en: { contains: q.q, mode: "insensitive" as const } }] } : {}),
  };
  const [items, total] = await Promise.all([
    db.organization.findMany({ where, select: staff ? { ...PUBLIC_FIELDS, email_domains: true, created_at: true } : PUBLIC_FIELDS, orderBy: { name_ar: "asc" }, skip: (q.page - 1) * q.limit, take: q.limit }),
    db.organization.count({ where }),
  ]);
  return { items, total, page: q.page, limit: q.limit };
}

export async function getOrg(actor: MaybeActor, id: string) {
  const org = await db.organization.findFirst({ where: { id, deleted_at: null } });
  if (!org || !canViewOrg(actor, org)) throw notFound();
  if (isPlatformStaff(actor) || actor?.org_id === id) return org;
  const { email_domains: _d, ...rest } = org;
  return rest;
}

export async function createOrg(actor: Actor, data: z.infer<typeof orgCreateSchema>) {
  assertAllowed(isPlatformAdmin(actor));
  const org = await db.organization.create({ data: { ...data, status: "active" } });
  await audit({ actor_id: actor.id, action: "admin_action", entity_type: "organization", entity_id: org.id, diff: { created: data } });
  return org;
}

export async function updateOrg(actor: Actor, id: string, data: z.infer<typeof orgUpdateSchema>) {
  const org = await db.organization.findFirst({ where: { id, deleted_at: null } });
  if (!org) throw notFound();
  assertAllowed(canEditOrg(actor, org));
  return db.organization.update({ where: { id }, data });
}

/**
 * FR-0.2: approving a pending organisation activates it together with the
 * pending company accounts that created it (assumption A-3).
 */
export async function approveOrg(actor: Actor, id: string, ip?: string) {
  assertAllowed(canApproveOrg(actor));
  const org = await db.organization.findFirst({ where: { id, deleted_at: null } });
  if (!org) throw notFound();
  if (org.status !== "pending") throw new AppError("invalid_transition", "not_pending");
  const activated = await db.$transaction(async (tx) => {
    const o = await tx.organization.update({ where: { id }, data: { status: "active" } });
    const users = await tx.user.findMany({
      where: { org_id: id, status: "pending", email_verified_at: { not: null }, role: { in: ["company_admin", "company_member", "university_coordinator"] } },
    });
    await tx.user.updateMany({ where: { id: { in: users.map((u) => u.id) } }, data: { status: "active" } });
    await audit({ actor_id: actor.id, action: "org_approved", entity_type: "organization", entity_id: id, diff: { status: ["pending", "active"], users: users.map((u) => u.id) }, ip }, tx);
    return { org: o, userIds: users.map((u) => u.id) };
  });
  await notify(activated.userIds, "account_approved", { subject: org.name_ar, url: "/dashboard" });
  return activated.org;
}

export async function listMembers(actor: Actor, id: string) {
  const org = await db.organization.findFirst({ where: { id, deleted_at: null } });
  if (!org) throw notFound();
  assertAllowed(canListMembers(actor, org));
  return db.user.findMany({
    where: { org_id: id, deleted_at: null },
    select: { id: true, full_name: true, email: true, role: true, status: true, created_at: true },
    orderBy: { created_at: "asc" },
  });
}

export async function pendingOrgs(actor: Actor) {
  assertAllowed(canApproveOrg(actor));
  return db.organization.findMany({
    where: { status: "pending", deleted_at: null },
    include: { users: { select: { id: true, full_name: true, email: true, role: true } } },
    orderBy: { created_at: "asc" },
  });
}
