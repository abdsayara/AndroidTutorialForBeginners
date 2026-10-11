import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { assertAllowed } from "@/lib/api/errors";
import { toCsv } from "@/lib/csv";
import type { Actor } from "@/modules/auth/policy";
import { canSeeAnalytics, canSeeEcosystem, suppressSmallGroup } from "./policy";

export const analyticsFilterSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  sector_id: z.string().uuid().optional(),
});
export type AnalyticsFilter = z.infer<typeof analyticsFilterSchema>;

const range = (f: AnalyticsFilter) => (f.from || f.to ? { created_at: { ...(f.from ? { gte: f.from } : {}), ...(f.to ? { lte: f.to } : {}) } } : {});

/** FR-7.2 ecosystem KPIs (platform staff). */
async function ecosystem(f: AnalyticsFilter) {
  const cw: Prisma.ChallengeWhereInput = { deleted_at: null, ...range(f), ...(f.sector_id ? { sector_id: f.sector_id } : {}) };
  const pw: Prisma.ProjectWhereInput = { deleted_at: null, ...range(f), ...(f.sector_id ? { sector_id: f.sector_id } : {}) };
  const [companies, submitted, published, matched, activeWs, projects, prototypes, cases, ratings, workspaces] = await Promise.all([
    db.organization.count({ where: { type: "company", status: "active", deleted_at: null } }),
    db.challenge.count({ where: { ...cw, status: { not: "draft" } } }),
    db.challenge.count({ where: { ...cw, status: { in: ["published", "matched", "in_progress", "solved"] } } }),
    db.challenge.count({ where: { ...cw, matches: { some: { status: "confirmed" } } } }),
    db.workspace.count({ where: { status: "active", deleted_at: null } }),
    db.project.count({ where: { ...pw, status: { in: ["published", "in_collaboration", "commercializing"] } } }),
    db.project.count({ where: { ...pw, trl: { gte: 4 }, status: { in: ["published", "in_collaboration", "commercializing"] } } }),
    db.commercializationCase.groupBy({ by: ["stage"], _count: { _all: true } }),
    db.workspace.aggregate({ _avg: { rating: true }, where: { rating: { not: null } } }),
    db.workspace.findMany({ where: { status: "completed" }, select: { impact: true } }),
  ]);
  const impact = { savings_ils: 0, waste_reduction_tons: 0, water_saved_m3: 0, energy_saved_kwh: 0 };
  for (const w of workspaces) {
    const i = (w.impact ?? {}) as Record<string, number>;
    for (const k of Object.keys(impact) as (keyof typeof impact)[]) impact[k] += Number(i[k] ?? 0);
  }
  return {
    companies, challenges_submitted: submitted, challenges_published: published, challenges_matched: matched,
    match_rate: published ? Math.round((matched / published) * 100) : 0,
    active_workspaces: activeWs, projects_in_directory: projects, projects_prototype: prototypes,
    commercialization_by_stage: Object.fromEntries(cases.map((c) => [c.stage, c._count._all])),
    avg_rating: ratings._avg.rating ? Math.round(ratings._avg.rating * 10) / 10 : null,
    impact,
  };
}

/** FR-7.1: dashboard per role. */
export async function overview(actor: Actor, f: AnalyticsFilter = {}) {
  assertAllowed(canSeeAnalytics(actor));
  if (canSeeEcosystem(actor)) return { scope: "ecosystem" as const, ...(await ecosystem(f)) };
  if (actor.role === "company_admin" || actor.role === "company_member") {
    const [byStatus, matches, ws] = await Promise.all([
      db.challenge.groupBy({ by: ["status"], where: { org_id: actor.org_id, deleted_at: null }, _count: { _all: true } }),
      db.match.groupBy({ by: ["status"], where: { challenge: { org_id: actor.org_id }, status: { not: "suggested" } }, _count: { _all: true } }),
      db.workspace.groupBy({ by: ["status"], where: { members: { some: { user: { org_id: actor.org_id } } } }, _count: { _all: true } }),
    ]);
    return { scope: "company" as const, challenges: count(byStatus), matches: count(matches), workspaces: count(ws) };
  }
  if (actor.role === "university_coordinator") {
    const [projects, users, ws, cases] = await Promise.all([
      db.project.groupBy({ by: ["status"], where: { org_id: actor.org_id, deleted_at: null }, _count: { _all: true } }),
      db.user.groupBy({ by: ["status"], where: { org_id: actor.org_id, deleted_at: null }, _count: { _all: true } }),
      db.workspace.count({ where: { members: { some: { user: { org_id: actor.org_id } } }, status: "active" } }),
      db.commercializationCase.count({ where: { project: { org_id: actor.org_id } } }),
    ]);
    return { scope: "university" as const, projects: count(projects), users: count(users), active_workspaces: ws, commercialization_cases: cases };
  }
  const mine = { OR: [{ created_by: actor.id }, { team_member_ids: { has: actor.id } }, { supervisor_id: actor.id }] };
  const [projects, contacts, ws] = await Promise.all([
    db.project.groupBy({ by: ["status"], where: { deleted_at: null, ...mine }, _count: { _all: true } }),
    db.contactRequest.count({ where: { status: "pending", OR: [{ from_user_id: actor.id }] } }),
    db.workspace.count({ where: { members: { some: { user_id: actor.id } }, status: { in: ["setup", "active"] } } }),
  ]);
  return { scope: "academic" as const, projects: count(projects), pending_contact_requests: contacts, workspaces: ws };
}

function count(rows: { status: string; _count: { _all: number } }[]): Record<string, number> {
  return Object.fromEntries(rows.map((r) => [r.status, r._count._all]));
}

export interface BreakdownRow { key: string; label_ar: string; label_en: string; challenges: number; companies: number; suppressed: boolean }

/** FR-7.3/7.4: distribution of published challenges by category and by sector, with k-anonymity. */
export async function breakdown(actor: Actor, f: AnalyticsFilter = {}) {
  assertAllowed(canSeeAnalytics(actor));
  const rows = await db.challenge.findMany({
    where: { deleted_at: null, status: { in: ["published", "matched", "in_progress", "solved"] }, ...range(f), ...(f.sector_id ? { sector_id: f.sector_id } : {}) },
    select: { category: true, org_id: true, sector: { select: { id: true, name_ar: true, name_en: true } } },
  });
  const group = (keyOf: (r: (typeof rows)[number]) => { key: string; ar: string; en: string } | null): BreakdownRow[] => {
    const m = new Map<string, { ar: string; en: string; n: number; orgs: Set<string> }>();
    for (const r of rows) {
      const k = keyOf(r);
      if (!k) continue;
      const g = m.get(k.key) ?? { ar: k.ar, en: k.en, n: 0, orgs: new Set() };
      g.n++; g.orgs.add(r.org_id); m.set(k.key, g);
    }
    return [...m].map(([key, g]) => {
      const suppressed = suppressSmallGroup(actor, g.orgs.size);
      return { key, label_ar: g.ar, label_en: g.en, challenges: suppressed ? 0 : g.n, companies: suppressed ? 0 : g.orgs.size, suppressed };
    }).sort((a, b) => b.challenges - a.challenges);
  };
  return {
    by_category: group((r) => (r.category ? { key: r.category, ar: r.category, en: r.category } : null)),
    by_sector: group((r) => (r.sector ? { key: r.sector.id, ar: r.sector.name_ar, en: r.sector.name_en } : null)),
  };
}

/** FR-7.3: CSV export of the viewer's KPIs and breakdowns. */
export async function exportCsv(actor: Actor, f: AnalyticsFilter = {}) {
  const ov = await overview(actor, f);
  const br = await breakdown(actor, f);
  const rows: (string | number | null)[][] = [["section", "key", "value"]];
  const flat = (prefix: string, o: unknown) => {
    if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) flat(prefix ? `${prefix}.${k}` : k, v);
    else rows.push(["overview", prefix, o as string | number | null]);
  };
  flat("", ov);
  for (const r of br.by_category) rows.push(["by_category", r.key, r.suppressed ? "<3" : r.challenges]);
  for (const r of br.by_sector) rows.push(["by_sector", r.label_en, r.suppressed ? "<3" : r.challenges]);
  return toCsv(rows);
}
