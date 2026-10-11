import type { ContactTargetType } from "@prisma/client";
import { db } from "@/lib/db";
import { assertAllowed, notFound, AppError } from "@/lib/api/errors";
import type { Actor } from "@/modules/auth/policy";
import { hasGrant } from "@/modules/access/grants";
import { canExpressInterest } from "@/modules/challenges/policy";
import { canRequestProjectContact } from "@/modules/projects/policy";
import { notify } from "@/modules/notifications/service";
import { canRespondContact, canSendContact } from "./policy";

/** Resolves the owners (recipients) and a label for a contact target, enforcing visibility for the sender. */
async function resolveTarget(actor: Actor | null, type: ContactTargetType, id: string): Promise<{ ownerIds: string[]; label: string; allowed: boolean }> {
  if (type === "challenge") {
    const c = await db.challenge.findFirst({ where: { id, deleted_at: null } });
    if (!c) throw notFound();
    const owners = await db.user.findMany({ where: { org_id: c.org_id, role: "company_admin", status: "active" }, select: { id: true } });
    const allowed = actor ? canExpressInterest(actor, c, await hasGrant(actor, "challenge", id)) : false;
    return { ownerIds: owners.map((o) => o.id), label: c.title, allowed };
  }
  if (type === "project") {
    const p = await db.project.findFirst({ where: { id, deleted_at: null } });
    if (!p) throw notFound();
    const allowed = actor ? canRequestProjectContact(actor, p, await hasGrant(actor, "project", id)) : false;
    return { ownerIds: [p.created_by, ...(p.supervisor_id ? [p.supervisor_id] : [])], label: p.title, allowed };
  }
  if (type === "researcher") {
    const r = await db.researcherProfile.findUnique({ where: { id }, include: { user: { select: { id: true, full_name: true, status: true } } } });
    if (!r || r.user.status !== "active") throw notFound();
    return { ownerIds: [r.user.id], label: r.user.full_name, allowed: true };
  }
  const l = await db.lab.findFirst({ where: { id, deleted_at: null } });
  if (!l) throw notFound();
  const owners = l.contact_user_id ? [l.contact_user_id] : (await db.user.findMany({ where: { org_id: l.org_id, role: "university_coordinator", status: "active" }, select: { id: true } })).map((u) => u.id);
  return { ownerIds: owners, label: l.name, allowed: true };
}

export async function createContactRequest(actor: Actor, input: { target_type: ContactTargetType; target_id: string; message: string }) {
  assertAllowed(canSendContact(actor, input.target_type));
  const t = await resolveTarget(actor, input.target_type, input.target_id);
  assertAllowed(t.allowed);
  const dup = await db.contactRequest.findFirst({ where: { from_user_id: actor.id, target_type: input.target_type, target_id: input.target_id, status: "pending" } });
  if (dup) throw new AppError("conflict", "already_requested");
  const r = await db.contactRequest.create({ data: { ...input, from_user_id: actor.id } });
  await notify(t.ownerIds, "contact_request", { subject: t.label, url: "/dashboard/contact-requests" });
  return r;
}

export async function respondContactRequest(actor: Actor, id: string, decision: "accepted" | "declined") {
  const r = await db.contactRequest.findUnique({ where: { id } });
  if (!r) throw notFound();
  const t = await resolveTarget(null, r.target_type, r.target_id);
  assertAllowed(canRespondContact(actor, t.ownerIds, r.status));
  const u = await db.contactRequest.update({ where: { id }, data: { status: decision } });
  await notify([r.from_user_id], "contact_response", { subject: t.label, status: decision });
  return u;
}

/** Incoming (owned targets) and outgoing requests. Contact email revealed only once accepted. */
export async function listContactRequests(actor: Actor) {
  const outgoing = await db.contactRequest.findMany({ where: { from_user_id: actor.id }, orderBy: { created_at: "desc" } });
  const candidates = await db.contactRequest.findMany({ orderBy: { created_at: "desc" }, take: 500 });
  const incoming = [];
  for (const r of candidates) {
    if (r.from_user_id === actor.id) continue;
    const t = await resolveTarget(null, r.target_type, r.target_id).catch(() => null);
    if (!t || !t.ownerIds.includes(actor.id)) continue;
    const from = await db.user.findUnique({ where: { id: r.from_user_id }, select: { full_name: true, email: true, org: { select: { name_ar: true, name_en: true } } } });
    incoming.push({ ...r, target_label: t.label, from: from ? { ...from, email: r.status === "accepted" ? from.email : undefined } : null });
  }
  return { incoming, outgoing };
}
