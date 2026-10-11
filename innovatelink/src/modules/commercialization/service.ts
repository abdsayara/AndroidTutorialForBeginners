import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import { db } from "@/lib/db";
import { AppError, assertAllowed, notFound } from "@/lib/api/errors";
import { audit } from "@/lib/audit";
import type { Actor } from "@/modules/auth/policy";
import { canTransitionProject } from "@/modules/projects/policy";
import { canEditProjectIp, canManageCommercialization, canViewCase } from "./policy";
import { DEFAULT_CHECKLIST, projectIpSchema, STAGES, type openCaseSchema, type updateCaseSchema } from "./schema";

export function defaultChecklist() {
  return Object.fromEntries(STAGES.map((s) => [s, DEFAULT_CHECKLIST[s].map((key) => ({ key, done: false }))]));
}

/** FR-6.1: coordinator opens a case for a project and picks a pathway. */
export async function openCase(actor: Actor, input: z.infer<typeof openCaseSchema>, ip?: string) {
  assertAllowed(canManageCommercialization(actor));
  const p = await db.project.findFirst({ where: { id: input.project_id, deleted_at: null } });
  if (!p) throw notFound();
  if (await db.commercializationCase.findUnique({ where: { project_id: p.id } })) throw new AppError("conflict", "case_exists");
  if (!canTransitionProject(p.status, "commercializing")) throw new AppError("invalid_transition", `project_${p.status}`);
  return db.$transaction(async (tx) => {
    const c = await tx.commercializationCase.create({
      data: { project_id: p.id, pathway: input.pathway, notes: input.notes, coordinator_id: actor.id, checklist: defaultChecklist() as Prisma.InputJsonValue },
    });
    await tx.project.update({ where: { id: p.id }, data: { status: "commercializing" } });
    await audit({ actor_id: actor.id, action: "status_change", entity_type: "project", entity_id: p.id, diff: { status: [p.status, "commercializing"], case_id: c.id }, ip }, tx);
    return c;
  });
}

export async function updateCase(actor: Actor, id: string, input: z.infer<typeof updateCaseSchema>, ip?: string) {
  assertAllowed(canManageCommercialization(actor));
  const c = await db.commercializationCase.findUnique({ where: { id } });
  if (!c) throw notFound();
  const checklist = input.checklist ? { ...(c.checklist as object), ...input.checklist } : undefined;
  const u = await db.commercializationCase.update({ where: { id }, data: { stage: input.stage, pathway: input.pathway, notes: input.notes, checklist: checklist as Prisma.InputJsonValue | undefined } });
  if (input.stage && input.stage !== c.stage) {
    await audit({ actor_id: actor.id, action: "status_change", entity_type: "commercialization_case", entity_id: id, diff: { stage: [c.stage, input.stage] }, ip });
  }
  return u;
}

/** FR-6.3: Kanban — every case grouped by stage. */
export async function kanban(actor: Actor) {
  assertAllowed(canManageCommercialization(actor));
  const cases = await db.commercializationCase.findMany({ include: { project: { select: { id: true, title: true, trl: true, org: { select: { name_ar: true, name_en: true } } } } }, orderBy: { updated_at: "desc" } });
  return Object.fromEntries(STAGES.map((s) => [s, cases.filter((c) => c.stage === s)]));
}

export async function getCaseForProject(actor: Actor, projectId: string) {
  const p = await db.project.findFirst({ where: { id: projectId, deleted_at: null } });
  if (!p) throw notFound();
  assertAllowed(canViewCase(actor, p));
  return db.commercializationCase.findUnique({ where: { project_id: projectId } });
}

export async function getProjectIp(actor: Actor, projectId: string) {
  const p = await db.project.findFirst({ where: { id: projectId, deleted_at: null } });
  if (!p) throw notFound();
  assertAllowed(canViewCase(actor, p));
  return db.ipRecord.findUnique({ where: { project_id: projectId } });
}

/** FR-6.4: no automatic transfer; each change needs an agreement attachment and is audited. */
export async function putProjectIp(actor: Actor, projectId: string, raw: z.infer<typeof projectIpSchema>, ip?: string) {
  const input = projectIpSchema.parse(raw);
  const p = await db.project.findFirst({ where: { id: projectId, deleted_at: null } });
  if (!p) throw notFound();
  assertAllowed(canEditProjectIp(actor, p));
  const doc = await db.document.findFirst({ where: { id: input.agreement_doc_id, completed: true, deleted_at: null, OR: [{ owner_type: "project", owner_id: projectId }, { owner_type: "ip_record" }] } });
  if (!doc) throw new AppError("validation_error", "agreement_required", { agreement_doc_id: ["invalid"] });
  const prev = await db.ipRecord.findUnique({ where: { project_id: projectId } });
  const data = { ip_status: input.ip_status, owners: input.owners as Prisma.InputJsonValue, background_ip: input.background_ip, agreement_doc_id: input.agreement_doc_id };
  const rec = await db.$transaction(async (tx) => {
    const r = await tx.ipRecord.upsert({ where: { project_id: projectId }, create: { project_id: projectId, ...data }, update: data });
    await tx.project.update({ where: { id: projectId }, data: { ip_status: input.ip_status } });
    await audit({
      actor_id: actor.id, action: "ip_record_change", entity_type: "ip_record", entity_id: r.id, ip,
      diff: { before: prev ? { ip_status: prev.ip_status, owners: prev.owners } : null, after: { ip_status: r.ip_status, owners: r.owners }, agreement_doc_id: input.agreement_doc_id } as Prisma.InputJsonValue,
    }, tx);
    return r;
  });
  return rec;
}
