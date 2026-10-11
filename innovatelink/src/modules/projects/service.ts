import type { Prisma, Project } from "@prisma/client";
import type { z } from "zod";
import { db } from "@/lib/db";
import { AppError, assertAllowed, invalidTransition, notFound } from "@/lib/api/errors";
import { audit } from "@/lib/audit";
import { enqueue } from "@/lib/jobs";
import { parseCsv } from "@/lib/csv";
import { isActive, isPlatformStaff, type Actor, type MaybeActor } from "@/modules/auth/policy";
import { grantedIds, hasGrant } from "@/modules/access/grants";
import { isNarrowing } from "@/modules/access/policy";
import { revokeGrantsAfterNarrowing } from "@/modules/access/service";
import { notify, notifyRoles } from "@/modules/notifications/service";
import {
  canApproveProject, canCreateProject, canEditProject, canImportProjects, canSeeContactDetails, canSeeProjectTeaser,
  canSubmitProject, canTransitionProject, canViewProject, isProjectMember, isProjectUniCoordinator, LISTED_PROJECT_STATUSES,
} from "./policy";
import {
  IMPORT_COLUMNS, importRowSchema, projectSubmitSchema, type ProjectDraft, type ProjectListInput, type projectApproveSchema, type projectUpdateSchema,
} from "./schema";

const withOrg = { org: { select: { id: true, name_ar: true, name_en: true, city: true } }, sector: true } as const;
type ProjectWithOrg = Prisma.ProjectGetPayload<{ include: typeof withOrg }>;

export type ProjectView =
  | ({ kind: "full" } & ProjectWithOrg & { team?: { id: string; full_name: string; email?: string }[] })
  | { kind: "teaser"; id: string; public_title: string; type: Project["type"]; sector: ProjectWithOrg["sector"]; trl: number | null; visibility: "confidential" };

export function toView(actor: MaybeActor, p: ProjectWithOrg, granted: boolean): ProjectView | null {
  if (canViewProject(actor, p, granted)) {
    const { review_note, ...rest } = p;
    const owner = isProjectMember(actor, p) || isProjectUniCoordinator(actor, p) || isPlatformStaff(actor);
    return { kind: "full", ...rest, review_note: owner ? review_note : null } as ProjectView;
  }
  if (canSeeProjectTeaser(actor, p)) {
    return { kind: "teaser", id: p.id, public_title: p.public_title || "—", type: p.type, sector: p.sector, trl: p.trl, visibility: "confidential" };
  }
  return null;
}

async function load(id: string) {
  const p = await db.project.findFirst({ where: { id, deleted_at: null }, include: withOrg });
  if (!p) throw notFound();
  return p;
}

async function assertMembersInOrg(orgId: string, ids: (string | null | undefined)[]) {
  const list = ids.filter((x): x is string => !!x);
  if (list.length === 0) return;
  const n = await db.user.count({ where: { id: { in: list }, org_id: orgId, deleted_at: null } });
  if (n !== new Set(list).size) throw new AppError("validation_error", "members_must_be_in_university", { team_member_ids: ["invalid"] });
}

/** FR-3.1 */
export async function createProject(actor: Actor, data: ProjectDraft) {
  assertAllowed(canCreateProject(actor));
  await assertMembersInOrg(actor.org_id, [...(data.team_member_ids ?? []), data.supervisor_id]);
  const team = new Set(data.team_member_ids ?? []);
  if (actor.role === "student") team.add(actor.id);
  return db.project.create({
    data: {
      ...(data as Prisma.ProjectUncheckedCreateInput),
      team_member_ids: [...team],
      supervisor_id: data.supervisor_id ?? (actor.role === "researcher" ? actor.id : null),
      org_id: actor.org_id,
      created_by: actor.id,
      status: "draft",
    },
  });
}

export async function updateProject(actor: Actor, id: string, data: z.infer<typeof projectUpdateSchema>, ip?: string) {
  const p = await load(id);
  assertAllowed(canEditProject(actor, p));
  await assertMembersInOrg(p.org_id, [...(data.team_member_ids ?? []), data.supervisor_id]);
  const narrowing = data.visibility
    ? isNarrowing(p.visibility, data.visibility, p.visibility_org_ids, data.visibility_org_ids ?? p.visibility_org_ids)
    : false;
  const visibility = data.visibility ?? p.visibility;
  if (visibility === "confidential" && !(data.public_title ?? p.public_title) && p.status !== "draft") {
    throw new AppError("validation_error", "public_title_required", { public_title: ["required"] });
  }
  const updated = await db.project.update({ where: { id }, data: data as Prisma.ProjectUncheckedUpdateInput });
  if (data.visibility && data.visibility !== p.visibility) {
    await audit({ actor_id: actor.id, action: "visibility_change", entity_type: "project", entity_id: id, diff: { visibility: [p.visibility, data.visibility] }, ip });
  }
  if (narrowing) await revokeGrantsAfterNarrowing(actor, "project", id, p.title, ip);
  if (LISTED_PROJECT_STATUSES.includes(updated.status)) await enqueue("embed.entity", { type: "project", id });
  return updated;
}

export async function getProject(actor: MaybeActor, id: string): Promise<ProjectView> {
  const p = await db.project.findFirst({ where: { id, deleted_at: null }, include: withOrg });
  if (!p) throw notFound();
  const owner = isProjectMember(actor, p) || isProjectUniCoordinator(actor, p) || isPlatformStaff(actor);
  if (!owner && !LISTED_PROJECT_STATUSES.includes(p.status)) throw notFound();
  const view = toView(actor, p, await hasGrant(actor, "project", id));
  if (!view) throw new AppError(actor ? "forbidden" : "unauthenticated");
  if (view.kind === "full") {
    const ids = [...p.team_member_ids, ...(p.supervisor_id ? [p.supervisor_id] : [])];
    const people = await db.user.findMany({ where: { id: { in: ids } }, select: { id: true, full_name: true, email: true } });
    // PRD §3: no contact details for visitors.
    view.team = people.map((u) => (canSeeContactDetails(actor) ? u : { id: u.id, full_name: u.full_name }));
  }
  return view;
}

function containsAny(q: string, fields: (keyof Prisma.ProjectWhereInput)[]): Prisma.ProjectWhereInput {
  return { OR: fields.map((f) => ({ [f]: { contains: q, mode: "insensitive" } })) };
}

export function visibilityWhere(actor: MaybeActor, granted: Set<string>, q?: string): Prisma.ProjectWhereInput {
  const fullText = q ? containsAny(q, ["title", "summary", "problem_addressed", "applications"]) : {};
  if (isPlatformStaff(actor)) return fullText;
  if (!isActive(actor)) return { AND: [{ visibility: "public" }, fullText] };
  const full: Prisma.ProjectWhereInput = {
    AND: [
      {
        OR: [
          { visibility: "public" },
          { visibility: "selected_orgs", visibility_org_ids: { has: actor.org_id } },
          { id: { in: [...granted] } },
          { created_by: actor.id },
          { team_member_ids: { has: actor.id } },
          { supervisor_id: actor.id },
          ...(actor.role === "university_coordinator" ? [{ org_id: actor.org_id }] : []),
        ],
      },
      fullText,
    ],
  };
  const teaser: Prisma.ProjectWhereInput = {
    visibility: "confidential",
    id: { notIn: [...granted] },
    ...(q ? { public_title: { contains: q, mode: "insensitive" } } : {}),
  };
  return { OR: [full, teaser] };
}

/** FR-3.3: directory with text search and filters. */
export async function listProjects(actor: MaybeActor, f: ProjectListInput, semanticIds?: string[]) {
  const granted = await grantedIds(actor, "project");
  const where: Prisma.ProjectWhereInput = {
    AND: [
      { deleted_at: null, status: { in: [...LISTED_PROJECT_STATUSES] } },
      f.type ? { type: f.type } : {},
      f.sector_id ? { sector_id: f.sector_id } : {},
      f.org_id ? { org_id: f.org_id } : {},
      f.trl_min ? { trl: { gte: f.trl_min } } : {},
      f.trl_max ? { trl: { lte: f.trl_max } } : {},
      f.ip_status ? { ip_status: f.ip_status } : {},
      f.seeking?.length ? { seeking: { hasSome: f.seeking } } : {},
      semanticIds ? { id: { in: semanticIds } } : {},
      visibilityWhere(actor, granted, semanticIds ? undefined : f.q),
    ],
  };
  const [rows, total] = await Promise.all([
    db.project.findMany({ where, include: withOrg, orderBy: { published_at: "desc" }, ...(semanticIds ? {} : { skip: (f.page - 1) * f.limit, take: f.limit }) }),
    db.project.count({ where }),
  ]);
  let ordered = rows;
  if (semanticIds) {
    const rank = new Map(semanticIds.map((id, i) => [id, i]));
    ordered = [...rows].sort((a, b) => rank.get(a.id)! - rank.get(b.id)!).slice((f.page - 1) * f.limit, f.page * f.limit);
  }
  const items = ordered.map((p) => toView(actor, p, granted.has(p.id))).filter((v): v is ProjectView => v !== null);
  return { items, total, page: f.page, limit: f.limit };
}

export async function myProjects(actor: Actor) {
  return db.project.findMany({
    where: {
      deleted_at: null,
      OR: [
        { created_by: actor.id },
        { team_member_ids: { has: actor.id } },
        { supervisor_id: actor.id },
        ...(actor.role === "university_coordinator" ? [{ org_id: actor.org_id }] : []),
      ],
    },
    select: { id: true, title: true, type: true, status: true, trl: true, visibility: true, updated_at: true },
    orderBy: { updated_at: "desc" },
  });
}

async function transition(actor: Actor, p: Project, to: Project["status"], extra: Prisma.ProjectUncheckedUpdateInput = {}, ip?: string) {
  if (!canTransitionProject(p.status, to)) throw invalidTransition(p.status, to);
  return db.$transaction(async (tx) => {
    const u = await tx.project.update({ where: { id: p.id }, data: { status: to, ...extra } });
    await audit({ actor_id: actor.id, action: "status_change", entity_type: "project", entity_id: p.id, diff: { status: [p.status, to] }, ip }, tx);
    return u;
  });
}

/** FR-3.1 / FR-3.2: submit for university approval. */
export async function submitProject(actor: Actor, id: string, ip?: string) {
  const p = await load(id);
  assertAllowed(canSubmitProject(actor, p));
  const check = projectSubmitSchema.safeParse(p);
  if (!check.success) {
    const fields: Record<string, string[]> = {};
    for (const i of check.error.issues) (fields[i.path.join(".")] ??= []).push("required");
    throw new AppError("validation_error", "incomplete_project", fields);
  }
  if (p.visibility === "confidential" && !p.public_title) {
    throw new AppError("validation_error", "public_title_required", { public_title: ["required"] });
  }
  const u = await transition(actor, p, "pending_approval", { review_note: null }, ip);
  await notifyRoles(["university_coordinator"], "review_needed", { subject: p.title, url: "/coordinator/review" }, p.org_id);
  return u;
}

/** FR-3.2: university coordinator approves (publishes) or returns to draft with a note. */
export async function approveProject(actor: Actor, id: string, input: z.infer<typeof projectApproveSchema>, ip?: string) {
  const p = await load(id);
  assertAllowed(canApproveProject(actor, p));
  const u = input.decision === "approve"
    ? await transition(actor, p, "published", { published_at: new Date() }, ip)
    : await transition(actor, p, "draft", { review_note: input.note }, ip);
  await notify([p.created_by, ...p.team_member_ids], "project_status", { subject: p.title, status: u.status, url: `/projects/${id}` });
  if (u.status === "published") {
    await enqueue("embed.entity", { type: "project", id });
    await enqueue("match.project", { project_id: id });
  }
  return u;
}

export async function archiveProject(actor: Actor, id: string, ip?: string) {
  const p = await load(id);
  assertAllowed(canEditProject(actor, p));
  return transition(actor, p, "archived", {}, ip);
}

export async function deleteProject(actor: Actor, id: string) {
  const p = await load(id);
  assertAllowed(canEditProject(actor, p) && p.status === "draft");
  await db.project.update({ where: { id }, data: { deleted_at: new Date() } });
}

export async function pendingProjects(actor: Actor) {
  assertAllowed(actor.role === "university_coordinator" || actor.role === "platform_admin");
  return db.project.findMany({
    where: { status: "pending_approval", deleted_at: null, ...(actor.role === "university_coordinator" ? { org_id: actor.org_id } : {}) },
    include: withOrg,
    orderBy: { updated_at: "asc" },
  });
}

export interface ImportReport {
  created: number;
  errors: { row: number; errors: string[] }[];
}

/** FR-3.5: bulk CSV import into the coordinator's university, as drafts, with per-row errors. */
export async function importProjects(actor: Actor, csv: string, orgId?: string): Promise<ImportReport> {
  assertAllowed(canImportProjects(actor));
  const targetOrg = actor.role === "platform_admin" && orgId ? orgId : actor.org_id;
  const rows = parseCsv(csv);
  const header = rows.shift()?.map((h) => h.trim().toLowerCase()) ?? [];
  const missing = ["type", "title"].filter((c) => !header.includes(c));
  if (missing.length) throw new AppError("validation_error", "missing_columns", { header: missing });
  if (rows.length > 2000) throw new AppError("validation_error", "too_many_rows");

  const [sectors, supervisors] = await Promise.all([
    db.sector.findMany({ select: { id: true, slug: true } }),
    db.user.findMany({ where: { org_id: targetOrg, role: "researcher", deleted_at: null }, select: { id: true, email: true } }),
  ]);
  const sectorBySlug = new Map(sectors.map((s) => [s.slug, s.id]));
  const supByEmail = new Map(supervisors.map((s) => [s.email, s.id]));

  const report: ImportReport = { created: 0, errors: [] };
  const data: Prisma.ProjectCreateManyInput[] = [];
  rows.forEach((cells, i) => {
    const rowNo = i + 2;
    const obj: Record<string, string> = {};
    header.forEach((h, j) => { if ((IMPORT_COLUMNS as readonly string[]).includes(h)) obj[h] = (cells[j] ?? "").trim(); });
    const parsed = importRowSchema.safeParse(obj);
    if (!parsed.success) {
      report.errors.push({ row: rowNo, errors: parsed.error.issues.map((x) => `${x.path.join(".")}: ${x.message}`) });
      return;
    }
    const r = parsed.data;
    const errs: string[] = [];
    const sector_id = r.sector_slug ? sectorBySlug.get(r.sector_slug) : undefined;
    if (r.sector_slug && !sector_id) errs.push(`sector_slug: unknown "${r.sector_slug}"`);
    const supervisor_id = r.supervisor_email ? supByEmail.get(r.supervisor_email) : undefined;
    if (r.supervisor_email && !supervisor_id) errs.push(`supervisor_email: not a researcher of this university`);
    if (errs.length) { report.errors.push({ row: rowNo, errors: errs }); return; }
    data.push({
      org_id: targetOrg, created_by: actor.id, type: r.type, title: r.title, summary: r.summary, problem_addressed: r.problem_addressed,
      sector_id, supervisor_id, tags: r.tags.split("|").map((t) => t.trim()).filter(Boolean), trl: r.trl,
      applications: r.applications, evidence: r.evidence, ip_status: r.ip_status ?? "none", seeking: r.seeking, lang: r.lang ?? "ar", status: "draft",
    });
  });
  if (data.length) {
    const res = await db.project.createMany({ data });
    report.created = res.count;
    await audit({ actor_id: actor.id, action: "admin_action", entity_type: "project_import", entity_id: targetOrg, diff: { created: res.count, errors: report.errors.length } });
  }
  return report;
}
