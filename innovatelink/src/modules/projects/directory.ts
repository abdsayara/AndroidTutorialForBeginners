import { z } from "zod";
import { db } from "@/lib/db";
import { assertAllowed } from "@/lib/api/errors";
import { isActive, type MaybeActor } from "@/modules/auth/policy";
import { semanticIds } from "@/modules/matching/service";
import { rrf } from "@/modules/search/service";

export const directorySchema = z.object({
  q: z.string().trim().max(200).optional(),
  org_id: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(24),
});

/** FR-3.6: researchers directory (approved users only), text + semantic search. */
export async function listExperts(actor: MaybeActor, f: z.infer<typeof directorySchema>) {
  assertAllowed(isActive(actor));
  const base = { user: { status: "active" as const, deleted_at: null, ...(f.org_id ? { org_id: f.org_id } : {}) } };
  let ids: string[] | undefined;
  if (f.q) {
    const text = await db.researcherProfile.findMany({
      where: { ...base, OR: [{ bio: { contains: f.q, mode: "insensitive" } }, { department: { contains: f.q, mode: "insensitive" } }, { expertise_tags: { has: f.q } }, { user: { full_name: { contains: f.q, mode: "insensitive" } } }] },
      select: { id: true }, take: 100,
    });
    const vec = (await semanticIds("researcher_profiles", f.q, 100)).filter((r) => r.sim >= 0.15).map((r) => r.id);
    ids = rrf([text.map((t) => t.id), vec]);
  }
  const where = { ...base, ...(ids ? { id: { in: ids } } : {}) };
  const rows = await db.researcherProfile.findMany({
    where,
    include: { user: { select: { id: true, full_name: true, org: { select: { id: true, name_ar: true, name_en: true } } } } },
    ...(ids ? {} : { orderBy: { updated_at: "desc" as const }, skip: (f.page - 1) * f.limit, take: f.limit }),
  });
  const total = await db.researcherProfile.count({ where });
  const items = ids ? rows.sort((a, b) => ids!.indexOf(a.id) - ids!.indexOf(b.id)).slice((f.page - 1) * f.limit, f.page * f.limit) : rows;
  return { items, total, page: f.page, limit: f.limit };
}

/** FR-3.6: labs directory. */
export async function listLabs(actor: MaybeActor, f: z.infer<typeof directorySchema>) {
  assertAllowed(isActive(actor));
  const base = { deleted_at: null, ...(f.org_id ? { org_id: f.org_id } : {}) };
  let ids: string[] | undefined;
  if (f.q) {
    const text = await db.lab.findMany({ where: { ...base, OR: [{ name: { contains: f.q, mode: "insensitive" } }, { description: { contains: f.q, mode: "insensitive" } }, { services: { contains: f.q, mode: "insensitive" } }] }, select: { id: true }, take: 100 });
    const vec = (await semanticIds("labs", f.q, 100)).filter((r) => r.sim >= 0.15).map((r) => r.id);
    ids = rrf([text.map((t) => t.id), vec]);
  }
  const where = { ...base, ...(ids ? { id: { in: ids } } : {}) };
  const rows = await db.lab.findMany({ where, include: { org: { select: { id: true, name_ar: true, name_en: true, city: true } } }, ...(ids ? {} : { orderBy: { name: "asc" as const }, skip: (f.page - 1) * f.limit, take: f.limit }) });
  const total = await db.lab.count({ where });
  const items = ids ? rows.sort((a, b) => ids!.indexOf(a.id) - ids!.indexOf(b.id)).slice((f.page - 1) * f.limit, f.page * f.limit) : rows;
  return { items, total, page: f.page, limit: f.limit };
}
