import type { SubjectType } from "@prisma/client";
import { db } from "@/lib/db";
import { AppError, assertAllowed, notFound } from "@/lib/api/errors";
import { audit } from "@/lib/audit";
import type { Actor } from "@/modules/auth/policy";
import { notify } from "@/modules/notifications/service";
import { canManageChallenge, LISTED_CHALLENGE_STATUSES } from "@/modules/challenges/policy";
import { isProjectMember, isProjectUniCoordinator, LISTED_PROJECT_STATUSES } from "@/modules/projects/policy";
import { canAcceptNda, canDecideAccess, canRequestAccess } from "./policy";
import { hasGrant } from "./grants";

export const DEFAULT_NDA = {
  version: "nda-2026-v1",
  text_ar: "أتعهد بالحفاظ على سرية جميع المعلومات التي أطّلع عليها بخصوص هذا الكيان، وبعدم استخدامها أو الإفصاح عنها لأي طرف ثالث إلا لغرض التعاون عبر منصة InnovateLink Palestine، ما لم أحصل على موافقة كتابية من مالكها. (نص مؤقت — النص القانوني يقدّمه المالك من لوحة الإدارة)",
  text_en: "I undertake to keep confidential all information I access about this entity and not to use or disclose it to any third party except for collaboration through InnovateLink Palestine, without written consent from its owner. (Placeholder — legal text is provided by the owner via the admin panel.)",
};

export async function currentNda(): Promise<typeof DEFAULT_NDA> {
  const s = await db.setting.findUnique({ where: { key: "nda_template" } });
  return (s?.value as typeof DEFAULT_NDA | undefined) ?? DEFAULT_NDA;
}

interface Subject {
  id: string;
  title: string;
  visibility: "public" | "selected_orgs" | "confidential";
  visibility_org_ids: string[];
  ownerIds: string[];
  isOwner: (a: Actor) => boolean;
}

async function loadSubject(type: SubjectType, id: string): Promise<Subject> {
  if (type === "challenge") {
    const c = await db.challenge.findFirst({ where: { id, deleted_at: null, status: { in: [...LISTED_CHALLENGE_STATUSES] } } });
    if (!c) throw notFound();
    const owners = await db.user.findMany({ where: { org_id: c.org_id, role: "company_admin", status: "active" }, select: { id: true } });
    return { ...c, title: c.title, ownerIds: owners.map((o) => o.id), isOwner: (a) => canManageChallenge(a, c) };
  }
  const p = await db.project.findFirst({ where: { id, deleted_at: null, status: { in: [...LISTED_PROJECT_STATUSES] } } });
  if (!p) throw notFound();
  const ownerIds = [p.created_by, ...(p.supervisor_id ? [p.supervisor_id] : [])];
  return { ...p, ownerIds, isOwner: (a) => isProjectMember(a, p) || isProjectUniCoordinator(a, p) };
}

/** FR-0.5: "request access" on a confidential (or restricted) entity. */
export async function requestAccess(actor: Actor, input: { subject_type: SubjectType; subject_id: string; message?: string }) {
  const s = await loadSubject(input.subject_type, input.subject_id);
  const granted = await hasGrant(actor, input.subject_type, s.id);
  assertAllowed(canRequestAccess(actor, s, granted));
  const existing = await db.accessRequest.findFirst({
    where: { subject_type: input.subject_type, subject_id: s.id, user_id: actor.id, status: { in: ["pending", "approved"] } },
  });
  if (existing) return existing;
  const r = await db.accessRequest.create({ data: { ...input, user_id: actor.id } });
  // The requester sees only the public title; owners see their own title.
  await notify(s.ownerIds, "access_requested", { subject: s.title, url: `/dashboard/access-requests` });
  return r;
}

export async function listIncomingAccessRequests(actor: Actor) {
  const reqs = await db.accessRequest.findMany({ where: { status: "pending" }, orderBy: { created_at: "asc" }, take: 500 });
  const out = [];
  for (const r of reqs) {
    const s = await loadSubject(r.subject_type, r.subject_id).catch(() => null);
    if (s && s.isOwner(actor)) {
      const u = await db.user.findUnique({ where: { id: r.user_id }, select: { full_name: true, org: { select: { name_ar: true, name_en: true } } } });
      out.push({ ...r, subject_title: s.title, requester: u });
    }
  }
  return out;
}

export async function myAccessRequests(actor: Actor) {
  return db.accessRequest.findMany({ where: { user_id: actor.id }, orderBy: { created_at: "desc" } });
}

/** FR-0.6 step 1: owner approves or rejects. */
export async function decideAccess(actor: Actor, requestId: string, decision: "approve" | "reject", ip?: string) {
  const r = await db.accessRequest.findUnique({ where: { id: requestId } });
  if (!r) throw notFound();
  const s = await loadSubject(r.subject_type, r.subject_id);
  assertAllowed(canDecideAccess(s.isOwner(actor), actor));
  if (r.status !== "pending") throw new AppError("invalid_transition", "already_decided");
  const updated = await db.accessRequest.update({
    where: { id: requestId },
    data: { status: decision === "approve" ? "approved" : "rejected", decided_by: actor.id },
  });
  await audit({ actor_id: actor.id, action: "admin_action", entity_type: "access_request", entity_id: requestId, diff: { decision }, ip });
  return updated;
}

/** FR-0.6 step 2: requester accepts the NDA → AccessGrant with date, IP and text version. */
export async function acceptNda(actor: Actor, requestId: string, ndaVersion: string, ip: string) {
  const r = await db.accessRequest.findUnique({ where: { id: requestId } });
  if (!r) throw notFound();
  assertAllowed(canAcceptNda(actor, r));
  const nda = await currentNda();
  if (nda.version !== ndaVersion) throw new AppError("conflict", "nda_version_changed");
  const s = await loadSubject(r.subject_type, r.subject_id);
  const grant = await db.$transaction(async (tx) => {
    await tx.ndaAcceptance.create({
      data: { subject_type: r.subject_type, subject_id: r.subject_id, user_id: actor.id, nda_version: nda.version, nda_text: `${nda.text_ar}\n---\n${nda.text_en}`, ip_address: ip },
    });
    const g = await tx.accessGrant.create({
      data: { subject_type: r.subject_type, subject_id: r.subject_id, user_id: actor.id, granted_by: r.decided_by!, nda_version: nda.version },
    });
    await audit({ actor_id: actor.id, action: "nda_accepted", entity_type: r.subject_type, entity_id: r.subject_id, diff: { nda_version: nda.version }, ip }, tx);
    await audit({ actor_id: r.decided_by, action: "access_granted", entity_type: r.subject_type, entity_id: r.subject_id, diff: { user_id: actor.id, grant_id: g.id }, ip }, tx);
    return g;
  });
  await notify([actor.id], "access_granted", { subject: s.title, url: `/${r.subject_type === "challenge" ? "challenges" : "projects"}/${r.subject_id}` });
  return grant;
}

/** FR-1.6: narrowing visibility revokes every previously granted access. */
export async function revokeGrantsAfterNarrowing(actor: Actor, type: SubjectType, id: string, title: string, ip?: string) {
  const grants = await db.accessGrant.findMany({ where: { subject_type: type, subject_id: id, revoked_at: null } });
  if (grants.length === 0) return 0;
  await db.$transaction(async (tx) => {
    await tx.accessGrant.updateMany({ where: { id: { in: grants.map((g) => g.id) } }, data: { revoked_at: new Date() } });
    await tx.accessRequest.updateMany({ where: { subject_type: type, subject_id: id, status: "approved" }, data: { status: "rejected" } });
    await audit({ actor_id: actor.id, action: "access_revoked", entity_type: type, entity_id: id, diff: { user_ids: grants.map((g) => g.user_id) }, ip }, tx);
  });
  await notify(grants.map((g) => g.user_id), "access_revoked", { subject: title });
  return grants.length;
}
