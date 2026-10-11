import type { Challenge, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { AppError, assertAllowed, invalidTransition, notFound } from "@/lib/api/errors";
import { audit } from "@/lib/audit";
import { enqueue } from "@/lib/jobs";
import { isActive, isPlatformStaff, type Actor, type MaybeActor } from "@/modules/auth/policy";
import { grantedIds, hasGrant } from "@/modules/access/grants";
import { isNarrowing } from "@/modules/access/policy";
import { revokeGrantsAfterNarrowing } from "@/modules/access/service";
import { notify, notifyRoles } from "@/modules/notifications/service";
import {
  canChangeChallengeVisibility, canCloseChallenge, canCreateChallenge, canEditChallengeContent, canManageChallenge,
  canReviewChallenge, canSeeChallengeTeaser, canSubmitChallenge, canTransitionChallenge, canViewChallenge,
  isChallengeOwner, LISTED_CHALLENGE_STATUSES,
} from "./policy";
import {
  challengeSubmitSchema, type ChallengeDraft, type ChallengeListInput, type challengeUpdateSchema, type reviewSchema, type visibilitySchema,
} from "./schema";
import type { z } from "zod";

const withOrg = { org: { select: { id: true, name_ar: true, name_en: true, city: true, size: true } }, sector: true } as const;
type ChallengeWithOrg = Prisma.ChallengeGetPayload<{ include: typeof withOrg }>;

export type ChallengeView =
  | ({ kind: "full" } & Omit<ChallengeWithOrg, "ai_diagnosis" | "review_note"> & { ai_diagnosis?: unknown; review_note?: string | null })
  | { kind: "teaser"; id: string; public_title: string; category: Challenge["category"]; sector: ChallengeWithOrg["sector"]; visibility: "confidential"; published_at: Date | null };

/** Serialise according to the viewer's access. Owner-only fields are dropped for others. */
export function toView(actor: MaybeActor, c: ChallengeWithOrg, granted: boolean): ChallengeView | null {
  if (canViewChallenge(actor, c, granted)) {
    const owner = isChallengeOwner(actor, c) || isPlatformStaff(actor);
    const { ai_diagnosis, review_note, ...rest } = c;
    return { kind: "full", ...rest, ...(owner ? { ai_diagnosis, review_note } : {}) };
  }
  if (canSeeChallengeTeaser(actor, c)) {
    return { kind: "teaser", id: c.id, public_title: c.public_title || "—", category: c.category, sector: c.sector, visibility: "confidential", published_at: c.published_at };
  }
  return null;
}

async function load(id: string) {
  const c = await db.challenge.findFirst({ where: { id, deleted_at: null }, include: withOrg });
  if (!c) throw notFound();
  return c;
}

export async function createChallenge(actor: Actor, data: ChallengeDraft) {
  assertAllowed(canCreateChallenge(actor));
  return db.challenge.create({
    data: { ...(data as Prisma.ChallengeUncheckedCreateInput), org_id: actor.org_id, created_by: actor.id, status: "draft" },
  });
}

/** FR-1.1: autosave on every step while draft / needs_info. */
export async function updateChallenge(actor: Actor, id: string, data: z.infer<typeof challengeUpdateSchema>) {
  const c = await load(id);
  assertAllowed(canEditChallengeContent(actor, c));
  // Visibility goes through changeVisibility so narrowing revokes grants (FR-1.6).
  const { visibility, visibility_org_ids, ...content } = data;
  const updated = await db.challenge.update({ where: { id }, data: content as Prisma.ChallengeUncheckedUpdateInput });
  if (visibility || visibility_org_ids) {
    await changeVisibility(actor, id, { visibility: visibility ?? c.visibility, visibility_org_ids: visibility_org_ids ?? c.visibility_org_ids });
  }
  return updated;
}

export async function getChallenge(actor: MaybeActor, id: string): Promise<ChallengeView> {
  const c = await db.challenge.findFirst({ where: { id, deleted_at: null }, include: withOrg });
  // Unpublished challenges do not exist for outsiders.
  if (!c || (!LISTED_CHALLENGE_STATUSES.includes(c.status) && !isChallengeOwner(actor, c) && !isPlatformStaff(actor))) throw notFound();
  const view = toView(actor, c, await hasGrant(actor, "challenge", id));
  if (!view) throw new AppError(actor ? "forbidden" : "unauthenticated");
  return view;
}

function containsAny(q: string, fields: (keyof Prisma.ChallengeWhereInput)[]): Prisma.ChallengeWhereInput {
  return { OR: fields.map((f) => ({ [f]: { contains: q, mode: "insensitive" } })) };
}

/** Builds a SQL filter equivalent to toView() != null, split into full-access and teaser branches. */
export function visibilityWhere(actor: MaybeActor, granted: Set<string>, q?: string): Prisma.ChallengeWhereInput {
  const fullText = q ? containsAny(q, ["title", "problem_statement", "desired_outcome", "current_situation"]) : {};
  if (isPlatformStaff(actor)) return fullText;
  if (!isActive(actor)) return { AND: [{ visibility: "public" }, fullText] };
  const full: Prisma.ChallengeWhereInput = {
    AND: [
      {
        OR: [
          { visibility: "public" },
          { visibility: "selected_orgs", visibility_org_ids: { has: actor.org_id } },
          { id: { in: [...granted] } },
          { org_id: actor.org_id },
        ],
      },
      fullText,
    ],
  };
  const teaser: Prisma.ChallengeWhereInput = {
    visibility: "confidential",
    id: { notIn: [...granted] },
    NOT: { org_id: actor.org_id },
    ...(q ? { public_title: { contains: q, mode: "insensitive" } } : {}),
  };
  return { OR: [full, teaser] };
}

/**
 * FR-1.7: browse published challenges with text search and filters.
 * `semanticIds` (Phase 3) restricts and orders results by vector similarity.
 */
export async function listChallenges(actor: MaybeActor, f: ChallengeListInput, semanticIds?: string[]) {
  const granted = await grantedIds(actor, "challenge");
  const where: Prisma.ChallengeWhereInput = {
    AND: [
      { deleted_at: null, status: { in: [...LISTED_CHALLENGE_STATUSES] } },
      f.category ? { category: f.category } : {},
      f.sector_id ? { sector_id: f.sector_id } : {},
      f.city ? { org: { city: f.city } } : {},
      f.max_duration ? { expected_duration_months: { lte: f.max_duration } } : {},
      semanticIds ? { id: { in: semanticIds } } : {},
      visibilityWhere(actor, granted, semanticIds ? undefined : f.q),
    ],
  };
  const [rows, total] = await Promise.all([
    db.challenge.findMany({
      where,
      include: withOrg,
      orderBy: { published_at: "desc" },
      ...(semanticIds ? {} : { skip: (f.page - 1) * f.limit, take: f.limit }),
    }),
    db.challenge.count({ where }),
  ]);
  let ordered = rows;
  if (semanticIds) {
    const rank = new Map(semanticIds.map((id, i) => [id, i]));
    ordered = [...rows].sort((a, b) => rank.get(a.id)! - rank.get(b.id)!).slice((f.page - 1) * f.limit, f.page * f.limit);
  }
  const items = ordered.map((c) => toView(actor, c, granted.has(c.id))).filter((v): v is ChallengeView => v !== null);
  return { items, total, page: f.page, limit: f.limit };
}

/** FR-1.5: "My challenges" with status, match count and last activity. */
export async function myChallenges(actor: Actor, status?: Challenge["status"]) {
  assertAllowed(actor.role === "company_admin" || actor.role === "company_member");
  const rows = await db.challenge.findMany({
    where: { org_id: actor.org_id, deleted_at: null, ...(status ? { status } : {}) },
    orderBy: { updated_at: "desc" },
    select: { id: true, title: true, status: true, visibility: true, category: true, updated_at: true, created_at: true, published_at: true, _count: { select: { matches: { where: { status: { not: "rejected" } } } } } },
  });
  return rows.map(({ _count, ...r }) => ({ ...r, match_count: _count.matches, last_activity: r.updated_at }));
}

async function transition(actor: Actor, c: Challenge, to: Challenge["status"], extra: Prisma.ChallengeUncheckedUpdateInput = {}, ip?: string) {
  if (!canTransitionChallenge(c.status, to)) throw invalidTransition(c.status, to);
  const updated = await db.$transaction(async (tx) => {
    const u = await tx.challenge.update({ where: { id: c.id }, data: { status: to, ...extra } });
    await audit({ actor_id: actor.id, action: "status_change", entity_type: "challenge", entity_id: c.id, diff: { status: [c.status, to] }, ip }, tx);
    return u;
  });
  return updated;
}

/** FR-1.4: submit → platform coordinators are notified. */
export async function submitChallenge(actor: Actor, id: string, ip?: string) {
  const c = await load(id);
  assertAllowed(canSubmitChallenge(actor, c));
  const check = challengeSubmitSchema.safeParse(c);
  if (!check.success) {
    const fields: Record<string, string[]> = {};
    for (const i of check.error.issues) (fields[i.path.join(".")] ??= []).push("required");
    throw new AppError("validation_error", "incomplete_challenge", fields);
  }
  if (c.visibility === "confidential" && !c.public_title) {
    throw new AppError("validation_error", "public_title_required", { public_title: ["required"] });
  }
  const u = await transition(actor, c, "submitted", { review_note: null }, ip);
  await notifyRoles(["platform_coordinator"], "review_needed", { subject: c.public_title || c.title, url: "/coordinator/review" });
  return u;
}

/** FR-1.4: coordinator publishes, or returns as needs_info with a mandatory note. */
export async function reviewChallenge(actor: Actor, id: string, input: z.infer<typeof reviewSchema>, ip?: string) {
  const c = await load(id);
  assertAllowed(canReviewChallenge(actor, c));
  const u =
    input.decision === "publish"
      ? await transition(actor, c, "published", { published_at: new Date() }, ip)
      : await transition(actor, c, "needs_info", { review_note: input.note }, ip);
  const owners = await db.user.findMany({ where: { org_id: c.org_id, role: "company_admin", status: "active" }, select: { id: true } });
  await notify(owners.map((o) => o.id), "challenge_status", { subject: c.title, status: u.status, url: `/dashboard/challenges/${id}/edit` });
  if (u.status === "published") {
    await enqueue("embed.entity", { type: "challenge", id });
    await enqueue("match.challenge", { challenge_id: id });
  }
  return u;
}

/** FR-1.6: close at any time. */
export async function closeChallenge(actor: Actor, id: string, ip?: string) {
  const c = await load(id);
  assertAllowed(canCloseChallenge(actor, c));
  return transition(actor, c, "closed", { closed_at: new Date() }, ip);
}

/** FR-1.6: change visibility at any time; narrowing revokes prior grants and is audited. */
export async function changeVisibility(actor: Actor, id: string, input: z.infer<typeof visibilitySchema>, ip?: string) {
  const c = await load(id);
  assertAllowed(canChangeChallengeVisibility(actor, c));
  const public_title = input.public_title ?? c.public_title;
  if (input.visibility === "confidential" && !public_title) {
    throw new AppError("validation_error", "public_title_required", { public_title: ["required"] });
  }
  const narrowing = isNarrowing(c.visibility, input.visibility, c.visibility_org_ids, input.visibility_org_ids);
  const updated = await db.$transaction(async (tx) => {
    const u = await tx.challenge.update({
      where: { id },
      data: { visibility: input.visibility, visibility_org_ids: input.visibility === "selected_orgs" ? input.visibility_org_ids : [], public_title },
    });
    await audit({
      actor_id: actor.id, action: "visibility_change", entity_type: "challenge", entity_id: id, ip,
      diff: { visibility: [c.visibility, u.visibility], visibility_org_ids: [c.visibility_org_ids, u.visibility_org_ids] },
    }, tx);
    return u;
  });
  if (narrowing) await revokeGrantsAfterNarrowing(actor, "challenge", id, c.title, ip);
  if (LISTED_CHALLENGE_STATUSES.includes(updated.status)) await enqueue("embed.entity", { type: "challenge", id });
  return updated;
}

/** Soft delete — drafts only. */
export async function deleteChallenge(actor: Actor, id: string) {
  const c = await load(id);
  assertAllowed(canManageChallenge(actor, c) && c.status === "draft");
  await db.challenge.update({ where: { id }, data: { deleted_at: new Date() } });
}

/** Coordinator review queue. */
export async function submittedChallenges(actor: Actor) {
  assertAllowed(isPlatformStaff(actor));
  return db.challenge.findMany({ where: { status: "submitted", deleted_at: null }, include: withOrg, orderBy: { updated_at: "asc" } });
}
