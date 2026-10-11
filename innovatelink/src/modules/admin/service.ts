import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { db } from "@/lib/db";
import { AppError, assertAllowed, notFound } from "@/lib/api/errors";
import { audit } from "@/lib/audit";
import { aiConfig } from "@/lib/ai";
import type { Actor } from "@/modules/auth/policy";
import { DEFAULT_NDA } from "@/modules/access/service";
import { DEFAULT_WEIGHTS } from "@/modules/matching/schema";
import { reindexAll } from "@/modules/matching/indexing";
import { canAdminister, canReviewAiFeedback } from "./policy";
import type { auditListSchema, settingsSchema, taxonomySchema, userListSchema, userUpdateSchema } from "./schema";

export async function listUsers(actor: Actor, q: z.infer<typeof userListSchema>) {
  assertAllowed(canAdminister(actor));
  const where: Prisma.UserWhereInput = {
    deleted_at: null,
    ...(q.role ? { role: q.role } : {}),
    ...(q.status ? { status: q.status } : {}),
    ...(q.q ? { OR: [{ email: { contains: q.q, mode: "insensitive" } }, { full_name: { contains: q.q, mode: "insensitive" } }] } : {}),
  };
  const [items, total] = await Promise.all([
    db.user.findMany({ where, select: { id: true, email: true, full_name: true, role: true, status: true, created_at: true, email_verified_at: true, org: { select: { id: true, name_ar: true, type: true } } }, orderBy: { created_at: "desc" }, skip: (q.page - 1) * q.limit, take: q.limit }),
    db.user.count({ where }),
  ]);
  return { items, total, page: q.page, limit: q.limit };
}

export async function updateUser(actor: Actor, id: string, data: z.infer<typeof userUpdateSchema>, ip?: string) {
  assertAllowed(canAdminister(actor));
  if (id === actor.id && (data.status === "suspended" || (data.role && data.role !== "platform_admin"))) throw new AppError("bad_request", "cannot_demote_self");
  const before = await db.user.findFirst({ where: { id, deleted_at: null } });
  if (!before) throw notFound();
  const u = await db.user.update({ where: { id }, data });
  if (data.status === "suspended") await db.session.deleteMany({ where: { user_id: id } });
  await audit({ actor_id: actor.id, action: "admin_action", entity_type: "user", entity_id: id, diff: { before: { status: before.status, role: before.role }, after: data }, ip });
  return { id: u.id, status: u.status, role: u.role };
}

export async function listTaxonomy() {
  const [sectors, tags] = await Promise.all([db.sector.findMany({ orderBy: { name_ar: "asc" } }), db.tag.findMany({ orderBy: { name_ar: "asc" } })]);
  return { sectors, tags };
}

export async function upsertTaxonomy(actor: Actor, input: z.infer<typeof taxonomySchema>, ip?: string) {
  assertAllowed(canAdminister(actor));
  const { kind, ...data } = input;
  const row = kind === "sector"
    ? await db.sector.upsert({ where: { slug: data.slug }, create: data, update: data })
    : await db.tag.upsert({ where: { slug: data.slug }, create: data, update: data });
  await audit({ actor_id: actor.id, action: "admin_action", entity_type: kind, entity_id: row.id, diff: data, ip });
  return row;
}

export async function getSettings(actor: Actor) {
  assertAllowed(canAdminister(actor));
  const rows = await db.setting.findMany();
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const c = aiConfig();
  return {
    matching_weights: s.matching_weights ?? DEFAULT_WEIGHTS,
    nda_template: s.nda_template ?? DEFAULT_NDA,
    retention_days_closed_challenges: s.retention_days_closed_challenges ?? 730,
    ai: { provider: c.provider, model: c.model, embedding_model: c.embeddingModel, dim: c.dim, allow_confidential: c.allowConfidential, daily_limit: c.dailyLimit },
  };
}

export async function updateSettings(actor: Actor, input: z.infer<typeof settingsSchema>, ip?: string) {
  assertAllowed(canAdminister(actor));
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    await db.setting.upsert({ where: { key }, create: { key, value: value as Prisma.InputJsonValue }, update: { value: value as Prisma.InputJsonValue } });
    await audit({ actor_id: actor.id, action: "admin_action", entity_type: "setting", entity_id: key, diff: { value } as Prisma.InputJsonValue, ip });
  }
  return getSettings(actor);
}

export async function listAudit(actor: Actor, q: z.infer<typeof auditListSchema>) {
  assertAllowed(canAdminister(actor));
  const where: Prisma.AuditLogWhereInput = { ...(q.entity_type ? { entity_type: q.entity_type } : {}), ...(q.entity_id ? { entity_id: q.entity_id } : {}), ...(q.action ? { action: q.action } : {}) };
  const [items, total] = await Promise.all([
    db.auditLog.findMany({ where, orderBy: { created_at: "desc" }, skip: (q.page - 1) * q.limit, take: q.limit }),
    db.auditLog.count({ where }),
  ]);
  return { items, total, page: q.page, limit: q.limit };
}

/** §7.4: AI outputs with feedback / error reports, for coordinator review. */
export async function aiFeedback(actor: Actor) {
  assertAllowed(canReviewAiFeedback(actor));
  const runs = await db.aiRun.findMany({ where: { feedback: { not: Prisma.DbNull } }, orderBy: { updated_at: "desc" }, take: 200 });
  return runs.filter((r) => r.feedback).map((r) => ({ id: r.id, kind: r.kind, input_ref: r.input_ref, model: r.model, feedback: r.feedback, created_at: r.created_at }));
}

export async function aiUsage(actor: Actor) {
  assertAllowed(canAdminister(actor));
  const since = new Date(Date.now() - 30 * 864e5);
  return db.aiRun.groupBy({ by: ["kind"], where: { created_at: { gte: since } }, _count: { _all: true }, _sum: { tokens_in: true, tokens_out: true }, _avg: { latency_ms: true } });
}

export async function reindex(actor: Actor) {
  assertAllowed(canAdminister(actor));
  return { indexed: await reindexAll() };
}
