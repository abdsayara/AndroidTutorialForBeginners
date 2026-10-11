import type { Challenge, Match, MatchTargetType, Prisma, Project } from "@prisma/client";
import type { z } from "zod";
import { db, toVectorLiteral } from "@/lib/db";
import { embed, generateStructured, recordFeedback } from "@/lib/ai";
import { conceptsOf } from "@/lib/ai/text";
import { AppError, assertAllowed, invalidTransition, notFound } from "@/lib/api/errors";
import { audit } from "@/lib/audit";
import { enqueue } from "@/lib/jobs";
import { isPlatformStaff, type Actor, type MaybeActor } from "@/modules/auth/policy";
import { hasGrant } from "@/modules/access/grants";
import { canManageChallenge, isChallengeOwner, LISTED_CHALLENGE_STATUSES } from "@/modules/challenges/policy";
import { toView as challengeView } from "@/modules/challenges/service";
import { isProjectMember, LISTED_PROJECT_STATUSES } from "@/modules/projects/policy";
import { toView as projectView } from "@/modules/projects/service";
import { notify, notifyRoles } from "@/modules/notifications/service";
import { challengeText, indexEntity, labText, projectText, researcherText } from "./indexing";
import {
  canAddManualMatch, canRejectAsCoordinator, canRematch, canRespondAsAcademic, canRespondAsCompany, canShortlist, canViewClusters,
  nextOnAccept, visibleMatchStatuses,
} from "./policy";
import {
  CLUSTER_SIMILARITY, CRITERIA, DEFAULT_WEIGHTS, KEEP_TOP, MATCH_THRESHOLD, RETRIEVE_K, rerankSchema, type Criterion, type manualMatchSchema, type Rerank,
} from "./schema";

// ───────────────────────── settings ─────────────────────────

export async function matchingWeights(): Promise<Record<Criterion, number>> {
  const s = await db.setting.findUnique({ where: { key: "matching_weights" } });
  const w = { ...DEFAULT_WEIGHTS, ...((s?.value as Partial<Record<Criterion, number>>) ?? {}) };
  const sum = CRITERIA.reduce((a, k) => a + w[k], 0) || 1;
  return Object.fromEntries(CRITERIA.map((k) => [k, w[k] / sum])) as Record<Criterion, number>;
}

/** §7.2 step 4: weighted average of 0–5 criteria, normalised to 0–1. */
export function overallScore(scores: Record<Criterion, number>, w: Record<Criterion, number>): number {
  return Math.round((CRITERIA.reduce((a, k) => a + scores[k] * w[k], 0) / 5) * 1000) / 1000;
}

// ───────────────────────── candidates ─────────────────────────

export interface Candidate {
  type: MatchTargetType;
  id: string;
  sim: number;
  title: string;
  /** Data sent to the reranker (respecting confidentiality). */
  data: Record<string, unknown>;
  text: string;
  trl?: number | null;
  tags: string[];
  ownerIds: string[];
  orgId: string;
}

async function ensureEmbedding(table: "challenges" | "projects", id: string, type: "challenge" | "project"): Promise<string | null> {
  let row = await db.$queryRawUnsafe<{ e: string | null }[]>(`SELECT embedding::text AS e FROM "${table}" WHERE id = $1::uuid`, id);
  if (!row[0]?.e) {
    await indexEntity(type, id);
    row = await db.$queryRawUnsafe<{ e: string | null }[]>(`SELECT embedding::text AS e FROM "${table}" WHERE id = $1::uuid`, id);
  }
  return row[0]?.e ?? null;
}

async function nearest(table: string, vec: string, where: string, k: number) {
  return db.$queryRawUnsafe<{ id: string; sim: number }[]>(
    `SELECT id, 1 - (embedding <=> $1::vector) AS sim FROM "${table}" WHERE embedding IS NOT NULL AND ${where} ORDER BY embedding <=> $1::vector LIMIT ${k}`,
    vec,
  );
}

/** Can the academic party (users + org) see the challenge? Hard filter (§7.2 step 2). */
async function challengeVisibleTo(c: Challenge, orgId: string, userIds: string[]): Promise<boolean> {
  if (c.visibility === "public") return true;
  if (c.visibility === "selected_orgs" && c.visibility_org_ids.includes(orgId)) return true;
  const g = await db.accessGrant.count({ where: { subject_type: "challenge", subject_id: c.id, user_id: { in: userIds }, revoked_at: null } });
  return g > 0;
}

/** Can the company see the project? */
async function projectVisibleToCompany(p: Project, companyOrg: string): Promise<boolean> {
  if (p.visibility === "public") return true;
  if (p.visibility === "selected_orgs" && p.visibility_org_ids.includes(companyOrg)) return true;
  const companyUsers = await db.user.findMany({ where: { org_id: companyOrg }, select: { id: true } });
  const g = await db.accessGrant.count({ where: { subject_type: "project", subject_id: p.id, revoked_at: null, user_id: { in: companyUsers.map((u) => u.id) } } });
  return g > 0;
}

async function labOwners(orgId: string, contact: string | null): Promise<string[]> {
  if (contact) return [contact];
  return (await db.user.findMany({ where: { org_id: orgId, role: "university_coordinator", status: "active" }, select: { id: true } })).map((u) => u.id);
}

/** §7.2 step 2: top-30 across projects, researchers and labs, after hard filters. */
export async function retrieveForChallenge(c: Challenge): Promise<Candidate[]> {
  const vec = await ensureEmbedding("challenges", c.id, "challenge");
  if (!vec) return [];
  const listed = LISTED_PROJECT_STATUSES.map((s) => `'${s}'`).join(",");
  const [pRows, rRows, lRows] = await Promise.all([
    nearest("projects", vec, `deleted_at IS NULL AND status IN (${listed})`, RETRIEVE_K),
    nearest("researcher_profiles", vec, `user_id IN (SELECT id FROM users WHERE status = 'active' AND deleted_at IS NULL)`, RETRIEVE_K),
    nearest("labs", vec, `deleted_at IS NULL`, RETRIEVE_K),
  ]);
  const out: Candidate[] = [];

  const projects = await db.project.findMany({ where: { id: { in: pRows.map((r) => r.id) } } });
  for (const p of projects) {
    const owners = [p.created_by, ...p.team_member_ids, ...(p.supervisor_id ? [p.supervisor_id] : [])];
    if (!(await challengeVisibleTo(c, p.org_id, owners))) continue;
    if (!(await projectVisibleToCompany(p, c.org_id))) continue;
    const text = projectText(p);
    const confidential = p.visibility === "confidential";
    out.push({
      type: "project", id: p.id, sim: pRows.find((r) => r.id === p.id)!.sim, title: confidential ? (p.public_title ?? "—") : p.title, text, trl: p.trl, tags: p.tags,
      ownerIds: [...new Set(owners)], orgId: p.org_id,
      data: { kind: "project", title: confidential ? p.public_title : p.title, trl: p.trl, tags: p.tags, ...(confidential ? {} : { summary: p.summary, problem_addressed: p.problem_addressed, applications: p.applications }), support_needs: p.support_needs, seeking: p.seeking },
    });
  }

  const researchers = await db.researcherProfile.findMany({ where: { id: { in: rRows.map((r) => r.id) } }, include: { user: { select: { id: true, full_name: true, org_id: true } } } });
  for (const r of researchers) {
    if (!(await challengeVisibleTo(c, r.user.org_id, [r.user.id]))) continue;
    out.push({
      type: "researcher", id: r.id, sim: rRows.find((x) => x.id === r.id)!.sim, title: r.user.full_name, text: researcherText(r), tags: r.expertise_tags,
      ownerIds: [r.user.id], orgId: r.user.org_id,
      data: { kind: "researcher", name: r.user.full_name, title: r.title, department: r.department, expertise_tags: r.expertise_tags, bio: r.bio, availability: r.availability },
    });
  }

  const labs = await db.lab.findMany({ where: { id: { in: lRows.map((r) => r.id) } } });
  for (const l of labs) {
    const owners = await labOwners(l.org_id, l.contact_user_id);
    if (!(await challengeVisibleTo(c, l.org_id, owners))) continue;
    out.push({
      type: "lab", id: l.id, sim: lRows.find((x) => x.id === l.id)!.sim, title: l.name, text: labText(l), tags: l.equipment,
      ownerIds: owners, orgId: l.org_id,
      data: { kind: "lab", name: l.name, description: l.description, equipment: l.equipment, services: l.services },
    });
  }
  return out.sort((a, b) => b.sim - a.sim).slice(0, RETRIEVE_K);
}

// ───────────────────────── rerank ─────────────────────────

const clamp5 = (x: number) => Math.max(0, Math.min(5, Math.round(x * 10) / 10));

/** Deterministic reranker used by the mock provider. Cites fields from both sides. */
export function mockRerank(challenge: { title: string; text: string; category?: string | null }, cands: Candidate[]): Rerank {
  const cc = new Set(conceptsOf(challenge.text));
  return {
    candidates: cands.map((k) => {
      const kc = conceptsOf(`${k.text} ${k.tags.join(" ")}`);
      const overlap = kc.filter((x) => cc.has(x));
      const ratio = cc.size ? overlap.length / cc.size : 0;
      const scores = {
        technical: clamp5(k.sim * 6 + ratio * 1.5),
        expertise: clamp5(1.5 + overlap.length * 1.2),
        maturity: clamp5(k.type === "project" ? ((k.trl ?? 3) / 9) * 5 : k.type === "lab" ? 3.5 : 3),
        resources: clamp5(k.type === "lab" ? 4.5 : k.type === "researcher" ? 3 : 2.5),
        need_fit: clamp5(ratio * 5),
      };
      const label = k.type === "project" ? `المشروع «${k.title}»${k.trl ? ` (TRL ${k.trl})` : ""}` : k.type === "researcher" ? `الباحث ${k.title}` : `مختبر «${k.title}»`;
      const shared = overlap.length ? `في مجالات مشتركة: ${overlap.join("، ")}` : "بصلة دلالية عامة";
      const fieldNote = k.type === "researcher" && k.tags.length ? ` وخبراته المعلنة (${k.tags.slice(0, 3).join("، ")})` : k.type === "lab" && k.tags.length ? ` وتجهيزاته (${k.tags.slice(0, 3).join("، ")})` : "";
      return {
        ref: `${k.type}:${k.id}`,
        scores,
        rationale: `يتقاطع وصف التحدي «${challenge.title}» مع ${label}${fieldNote} ${shared}. درجة التشابه الدلالي ${k.sim.toFixed(2)}${k.type === "project" && k.trl ? `، ومستوى الجاهزية التقنية ${k.trl} من 9` : ""}.`,
      };
    }),
  };
}

/** PRD §7.2: rationale must cite a field from each side; generic text is replaced with a cited template. */
export function ensureCitations(rationale: string, challengeTitle: string, cand: Candidate): string {
  const mentionsCand = rationale.includes(cand.title) || cand.tags.some((t) => rationale.includes(t));
  const mentionsChallenge = rationale.includes(challengeTitle);
  if (mentionsCand && mentionsChallenge) return rationale;
  return `${rationale} (التحدي: «${challengeTitle}»؛ ${cand.type === "project" ? "المشروع" : cand.type === "researcher" ? "الباحث" : "المختبر"}: «${cand.title}»)`;
}

async function rerank(challengeData: { title: string; text: string; category?: string | null }, cands: Candidate[], inputRef: string) {
  const results: { cand: Candidate; scores: Record<Criterion, number>; rationale: string; run_id: string }[] = [];
  for (let i = 0; i < cands.length; i += 10) {
    const batch = cands.slice(i, i + 10);
    const res = await generateStructured(rerankSchema, {
      kind: "match.rerank",
      system: "You evaluate how well academic resources (projects, researchers, labs) fit an industrial challenge from a Palestinian company.",
      instructions:
        "For each candidate (identified by ref) score 0-5 on: technical (technical relevance), expertise, maturity (TRL), resources (availability of resources/equipment), need_fit (fit to the company's need). " +
        "Write a 2-3 sentence rationale that explicitly cites at least one concrete field from the challenge AND one from the candidate (e.g. title, TRL, expertise tags). Generic statements are not acceptable. " +
        'Return {"candidates":[{"ref","scores":{technical,expertise,maturity,resources,need_fit},"rationale"}]}.',
      data: { challenge: { title: challengeData.title, category: challengeData.category, description: challengeData.text }, candidates: batch.map((k) => ({ ref: `${k.type}:${k.id}`, ...k.data })) },
      inputRef,
      mock: () => mockRerank(challengeData, batch),
    });
    for (const r of res.output.candidates) {
      const cand = batch.find((k) => `${k.type}:${k.id}` === r.ref);
      if (cand) results.push({ cand, scores: r.scores, rationale: ensureCitations(r.rationale, challengeData.title, cand), run_id: res.run_id });
    }
  }
  return results;
}

// ───────────────────────── pipeline ─────────────────────────

/** Display title of a challenge for AI/rationales: public_title when confidential. */
function aiChallengeTitle(c: Challenge) {
  return c.visibility === "confidential" ? (c.public_title ?? "—") : c.title;
}

async function saveMatches(c: Challenge, scored: Awaited<ReturnType<typeof rerank>>) {
  const w = await matchingWeights();
  const ranked = scored
    .map((s) => ({ ...s, score: overallScore(s.scores, w) }))
    .filter((s) => s.score >= MATCH_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, KEEP_TOP);
  let created = 0;
  for (const s of ranked) {
    const exists = await db.match.findUnique({ where: { challenge_id_target_type_target_id: { challenge_id: c.id, target_type: s.cand.type, target_id: s.cand.id } } });
    if (exists) continue;
    await db.match.create({
      data: { challenge_id: c.id, target_type: s.cand.type, target_id: s.cand.id, score: s.score, rationale: s.rationale, criteria_scores: s.scores, status: "suggested", source: "ai", ai_run_id: s.run_id },
    });
    created++;
  }
  return { ranked, created };
}

/** FR-2.1: run on publish; produce up to 10 `suggested` matches (§7.2). Never changes any status. */
export async function runChallengeMatching(challengeId: string) {
  const c = await db.challenge.findFirst({ where: { id: challengeId, deleted_at: null } });
  if (!c || !LISTED_CHALLENGE_STATUSES.includes(c.status)) return { created: 0 };
  const cands = await retrieveForChallenge(c);
  const scored = await rerank({ title: aiChallengeTitle(c), text: challengeText(c), category: c.category }, cands, `challenge:${c.id}`);
  const { ranked, created } = await saveMatches(c, scored);
  const subject = aiChallengeTitle(c);
  if (ranked.length === 0) await notifyRoles(["platform_coordinator"], "no_matches", { subject, url: `/dashboard/challenges/${c.id}/matches` });
  else if (created > 0) await notifyRoles(["platform_coordinator"], "new_match", { subject, url: `/dashboard/challenges/${c.id}/matches` });
  return { created, considered: cands.length };
}

/** FR-2.6: reverse direction — suggest published challenges for a newly published project. */
export async function runProjectMatching(projectId: string) {
  const p = await db.project.findFirst({ where: { id: projectId, deleted_at: null } });
  if (!p || !LISTED_PROJECT_STATUSES.includes(p.status)) return { created: 0 };
  const vec = await ensureEmbedding("projects", p.id, "project");
  if (!vec) return { created: 0 };
  const rows = await nearest("challenges", vec, `deleted_at IS NULL AND status = 'published'`, RETRIEVE_K);
  const owners = [p.created_by, ...p.team_member_ids, ...(p.supervisor_id ? [p.supervisor_id] : [])];
  const cand: Candidate = {
    type: "project", id: p.id, sim: 0, title: p.visibility === "confidential" ? (p.public_title ?? "—") : p.title, text: projectText(p), trl: p.trl, tags: p.tags, ownerIds: owners, orgId: p.org_id,
    data: { kind: "project", title: p.visibility === "confidential" ? p.public_title : p.title, trl: p.trl, tags: p.tags, ...(p.visibility === "confidential" ? {} : { summary: p.summary }) },
  };
  let created = 0;
  for (const row of rows) {
    const c = await db.challenge.findUnique({ where: { id: row.id } });
    if (!c || !(await challengeVisibleTo(c, p.org_id, owners)) || !(await projectVisibleToCompany(p, c.org_id))) continue;
    const scored = await rerank({ title: aiChallengeTitle(c), text: challengeText(c), category: c.category }, [{ ...cand, sim: row.sim }], `project:${p.id}`);
    created += (await saveMatches(c, scored)).created;
  }
  if (created > 0) await notifyRoles(["platform_coordinator"], "new_match", { subject: cand.title, url: "/coordinator/review" });
  return { created };
}

/** FR-2.7: weekly similar-challenge detection (similarity ≥ 0.82), coordinators only. */
export async function detectClusters() {
  const rows = await db.$queryRawUnsafe<{ a: string; b: string; sim: number }[]>(
    `SELECT x.id AS a, y.id AS b, 1 - (x.embedding <=> y.embedding) AS sim
     FROM challenges x JOIN challenges y ON x.id < y.id
     WHERE x.embedding IS NOT NULL AND y.embedding IS NOT NULL AND x.deleted_at IS NULL AND y.deleted_at IS NULL
       AND x.status IN ('published','matched','in_progress') AND y.status IN ('published','matched','in_progress')
       AND 1 - (x.embedding <=> y.embedding) >= $1`,
    CLUSTER_SIMILARITY,
  );
  // Union-find into connected components.
  const parent = new Map<string, string>();
  const find = (x: string): string => { if (!parent.has(x)) parent.set(x, x); const p = parent.get(x)!; if (p === x) return x; const r = find(p); parent.set(x, r); return r; };
  for (const r of rows) parent.set(find(r.a), find(r.b));
  const groups = new Map<string, Set<string>>();
  for (const r of rows) for (const id of [r.a, r.b]) { const root = find(id); (groups.get(root) ?? groups.set(root, new Set()).get(root)!).add(id); }
  await db.challengeCluster.deleteMany({});
  for (const ids of groups.values()) {
    const list = [...ids];
    const sims = rows.filter((r) => ids.has(r.a) && ids.has(r.b)).map((r) => r.sim);
    const cats = await db.challenge.findMany({ where: { id: { in: list } }, select: { category: true } });
    const top = cats.map((x) => x.category).filter(Boolean).sort().at(0) ?? "operations";
    await db.challengeCluster.create({ data: { label: `${top}:${list.length}`, challenge_ids: list, similarity: Math.min(...sims) } });
  }
  return groups.size;
}

// ───────────────────────── human review flow ─────────────────────────

async function loadMatch(id: string) {
  const m = await db.match.findUnique({ where: { id }, include: { challenge: true } });
  if (!m) throw notFound();
  return m;
}

/** Academic owners of a match target (who may accept/reject on the academic side). */
export async function targetOwners(type: MatchTargetType, id: string): Promise<string[]> {
  if (type === "project") {
    const p = await db.project.findUnique({ where: { id } });
    return p ? [...new Set([p.created_by, ...p.team_member_ids, ...(p.supervisor_id ? [p.supervisor_id] : [])])] : [];
  }
  if (type === "researcher") {
    const r = await db.researcherProfile.findUnique({ where: { id } });
    return r ? [r.user_id] : [];
  }
  const l = await db.lab.findUnique({ where: { id } });
  return l ? labOwners(l.org_id, l.contact_user_id) : [];
}

async function companyAdmins(orgId: string) {
  return (await db.user.findMany({ where: { org_id: orgId, role: "company_admin", status: "active" }, select: { id: true } })).map((u) => u.id);
}

/** FR-2.3: coordinator shortlists or rejects (reason mandatory). */
export async function reviewMatch(actor: Actor, id: string, input: { decision: "shortlist" } | { decision: "reject"; rejection_reason: string }, ip?: string) {
  const m = await loadMatch(id);
  if (input.decision === "shortlist") assertAllowed(canShortlist(actor, m));
  else assertAllowed(canRejectAsCoordinator(actor, m));
  const status = input.decision === "shortlist" ? "shortlisted" : "rejected";
  const u = await db.match.update({
    where: { id },
    data: { status, reviewed_by: actor.id, ...(input.decision === "reject" ? { rejection_reason: input.rejection_reason } : {}) },
  });
  await audit({ actor_id: actor.id, action: "match_review", entity_type: "match", entity_id: id, diff: { status: [m.status, status] }, ip });
  if (status === "shortlisted") {
    const subject = aiChallengeTitle(m.challenge);
    await notify(await companyAdmins(m.challenge.org_id), "new_match", { subject: m.challenge.title, url: `/dashboard/challenges/${m.challenge_id}/matches` });
    await notify(await targetOwners(m.target_type, m.target_id), "new_match", { subject, url: "/dashboard/matches" });
  }
  return u;
}

/** FR-2.4: each side accepts or rejects independently; both → confirmed. */
export async function respondToMatch(actor: Actor, id: string, input: { decision: "accept" } | { decision: "reject"; rejection_reason: string }, ip?: string) {
  const m = await loadMatch(id);
  const isCompany = canManageChallenge(actor, m.challenge);
  const isAcademic = (await targetOwners(m.target_type, m.target_id)).includes(actor.id);
  let side: "company" | "academic";
  if (isCompany && canRespondAsCompany(actor, true, m)) side = "company";
  else if (isAcademic && canRespondAsAcademic(actor, true, m)) side = "academic";
  else throw new AppError(isCompany || isAcademic ? "invalid_transition" : "forbidden", "cannot_respond");

  const status = input.decision === "accept" ? nextOnAccept(side, m.status) : "rejected";
  const u = await db.match.update({
    where: { id },
    data: {
      status,
      ...(input.decision === "reject" ? { rejection_reason: input.rejection_reason } : {}),
      ...(input.decision === "accept" && side === "company" ? { company_accepted_at: new Date() } : {}),
      ...(input.decision === "accept" && side === "academic" ? { academic_accepted_at: new Date() } : {}),
    },
  });
  await audit({ actor_id: actor.id, action: "match_response", entity_type: "match", entity_id: id, diff: { side, status: [m.status, status] }, ip });
  const recipients = side === "company" ? await targetOwners(m.target_type, m.target_id) : await companyAdmins(m.challenge.org_id);
  await notify(recipients, "match_update", { subject: side === "company" ? aiChallengeTitle(m.challenge) : m.challenge.title, status });
  if (status === "confirmed") {
    // Confirmation moves the challenge to `matched` — a consequence of three human acts, not of AI.
    if (m.challenge.status === "published") {
      await db.challenge.update({ where: { id: m.challenge_id }, data: { status: "matched" } });
      await audit({ actor_id: actor.id, action: "status_change", entity_type: "challenge", entity_id: m.challenge_id, diff: { status: ["published", "matched"], via: "match_confirmed" }, ip });
    }
    await notifyRoles(["platform_coordinator"], "match_update", { subject: m.challenge.title, status });
  }
  return u;
}

/** FR-2.5: coordinator adds a manual match for any resource. */
export async function addManualMatch(actor: Actor, challengeId: string, input: z.infer<typeof manualMatchSchema>) {
  assertAllowed(canAddManualMatch(actor));
  const c = await db.challenge.findFirst({ where: { id: challengeId, deleted_at: null } });
  if (!c) throw notFound();
  if ((await targetOwners(input.target_type, input.target_id)).length === 0) throw notFound();
  try {
    return await db.match.create({
      data: { challenge_id: challengeId, target_type: input.target_type, target_id: input.target_id, score: 0, rationale: input.rationale, criteria_scores: {}, status: "shortlisted", source: "manual", reviewed_by: actor.id },
    });
  } catch {
    throw new AppError("conflict", "match_exists");
  }
}

export async function rematch(actor: Actor, challengeId: string) {
  assertAllowed(canRematch(actor));
  await indexEntity("challenge", challengeId);
  await enqueue("match.challenge", { challenge_id: challengeId });
}

/** FR-2.8 */
export async function matchFeedback(actor: Actor, id: string, fb: { useful?: boolean; report?: string }) {
  const m = await loadMatch(id);
  const side = await sideOf(actor, m);
  assertAllowed(side !== "none" || isPlatformStaff(actor));
  if (!m.ai_run_id) throw new AppError("bad_request", "no_ai_run");
  await recordFeedback(m.ai_run_id, actor.id, fb);
}

// ───────────────────────── views ─────────────────────────

async function sideOf(actor: MaybeActor, m: Match & { challenge: Challenge }): Promise<"company" | "academic" | "none"> {
  if (!actor) return "none";
  if (isChallengeOwner(actor, m.challenge)) return "company";
  if ((await targetOwners(m.target_type, m.target_id)).includes(actor.id)) return "academic";
  return "none";
}

async function targetSummary(actor: MaybeActor, type: MatchTargetType, id: string) {
  if (type === "project") {
    const p = await db.project.findUnique({ where: { id }, include: { org: { select: { id: true, name_ar: true, name_en: true, city: true } }, sector: true } });
    if (!p) return null;
    const v = projectView(actor, p, await hasGrant(actor, "project", id));
    if (!v) return null;
    return v.kind === "full" ? { kind: "full" as const, type, id, title: v.title, summary: v.summary, trl: v.trl, org: v.org } : { kind: "teaser" as const, type, id, title: v.public_title, trl: v.trl };
  }
  if (type === "researcher") {
    const r = await db.researcherProfile.findUnique({ where: { id }, include: { user: { select: { full_name: true, org: { select: { name_ar: true, name_en: true } } } } } });
    return r ? { kind: "full" as const, type, id, title: r.user.full_name, summary: r.bio, expertise_tags: r.expertise_tags, org: r.user.org } : null;
  }
  const l = await db.lab.findUnique({ where: { id }, include: { org: { select: { name_ar: true, name_en: true } } } });
  return l ? { kind: "full" as const, type, id, title: l.name, summary: l.description, equipment: l.equipment, org: l.org } : null;
}

/** FR-2.2/2.3: matches of a challenge. Company sees only shortlisted onwards. */
export async function listChallengeMatches(actor: Actor, challengeId: string) {
  const c = await db.challenge.findFirst({ where: { id: challengeId, deleted_at: null } });
  if (!c) throw notFound();
  const side = isChallengeOwner(actor, c) ? "company" : "none";
  assertAllowed(side === "company" || isPlatformStaff(actor));
  const statuses = visibleMatchStatuses(actor, side);
  const ms = await db.match.findMany({ where: { challenge_id: challengeId, status: { in: [...statuses] } }, orderBy: { score: "desc" } });
  const out = [];
  for (const m of ms) {
    const target = await targetSummary(actor, m.target_type, m.target_id);
    if (target) out.push({ ...m, target });
  }
  return out;
}

/** Matches where the actor is on the academic side (dashboard/matches), or a project's matches. */
export async function listAcademicMatches(actor: Actor, projectId?: string) {
  let filter: Prisma.MatchWhereInput;
  if (projectId) {
    const p = await db.project.findFirst({ where: { id: projectId, deleted_at: null } });
    if (!p) throw notFound();
    assertAllowed(isProjectMember(actor, p) || isPlatformStaff(actor));
    filter = { target_type: "project", target_id: projectId };
  } else {
    const projects = await db.project.findMany({ where: { deleted_at: null, OR: [{ created_by: actor.id }, { team_member_ids: { has: actor.id } }, { supervisor_id: actor.id }] }, select: { id: true } });
    const profile = await db.researcherProfile.findUnique({ where: { user_id: actor.id }, select: { id: true } });
    const labs = await db.lab.findMany({ where: { OR: [{ contact_user_id: actor.id }, ...(actor.role === "university_coordinator" ? [{ org_id: actor.org_id, contact_user_id: null }] : [])] }, select: { id: true } });
    filter = {
      OR: [
        { target_type: "project", target_id: { in: projects.map((p) => p.id) } },
        ...(profile ? [{ target_type: "researcher" as const, target_id: profile.id }] : []),
        { target_type: "lab", target_id: { in: labs.map((l) => l.id) } },
      ],
    };
  }
  const statuses = visibleMatchStatuses(actor, isPlatformStaff(actor) ? "none" : "academic");
  const ms = await db.match.findMany({ where: { AND: [filter, { status: { in: [...statuses] } }] }, include: { challenge: { include: { org: { select: { id: true, name_ar: true, name_en: true, city: true, size: true } }, sector: true } } }, orderBy: { score: "desc" } });
  const out = [];
  for (const { challenge, ...m } of ms) {
    // Confidential challenge fields are never returned to academics without a grant.
    const view = challengeView(actor, challenge, await hasGrant(actor, "challenge", challenge.id));
    if (view) out.push({ ...m, challenge: view, target: await targetSummary(actor, m.target_type, m.target_id) });
  }
  return out;
}

/** Coordinator queue: suggested matches awaiting review. */
export async function suggestedMatches(actor: Actor) {
  assertAllowed(isPlatformStaff(actor));
  const ms = await db.match.findMany({ where: { status: "suggested" }, include: { challenge: { select: { id: true, title: true, public_title: true } } }, orderBy: [{ challenge_id: "asc" }, { score: "desc" }], take: 300 });
  const out = [];
  for (const m of ms) out.push({ ...m, target: await targetSummary(actor, m.target_type, m.target_id) });
  return out;
}

export async function listClusters(actor: Actor) {
  assertAllowed(canViewClusters(actor));
  const clusters = await db.challengeCluster.findMany({ orderBy: { similarity: "desc" } });
  const out = [];
  for (const cl of clusters) {
    const cs = await db.challenge.findMany({ where: { id: { in: cl.challenge_ids } }, select: { id: true, title: true, category: true, status: true, org: { select: { name_ar: true } } } });
    out.push({ ...cl, challenges: cs });
  }
  return out;
}

// ───────────────────────── semantic search ─────────────────────────

/** Vector neighbours of a free-text query (FR-1.7, FR-3.3, §8 /search). */
export async function semanticIds(table: "challenges" | "projects" | "researcher_profiles" | "labs", q: string, k = 50): Promise<{ id: string; sim: number }[]> {
  const [vec] = await embed([q]);
  return nearest(table, toVectorLiteral(vec!), table === "challenges" || table === "projects" || table === "labs" ? "deleted_at IS NULL" : "TRUE", k);
}
