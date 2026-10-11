import type { MaybeActor } from "@/modules/auth/policy";
import { listChallenges, type ChallengeView } from "@/modules/challenges/service";
import { listProjects, type ProjectView } from "@/modules/projects/service";
import { challengeListSchema, type ChallengeListInput } from "@/modules/challenges/schema";
import { projectListSchema, type ProjectListInput } from "@/modules/projects/schema";
import { semanticIds } from "@/modules/matching/service";

/** Reciprocal-rank fusion of several ranked id lists. */
export function rrf(lists: string[][], k = 60): string[] {
  const score = new Map<string, number>();
  for (const l of lists) l.forEach((id, i) => score.set(id, (score.get(id) ?? 0) + 1 / (k + i + 1)));
  return [...score.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
}

const MIN_SIM = 0.15;

/**
 * Hybrid text + semantic search over challenges (FR-1.7). Semantic hits that the
 * viewer could only see as a teaser are dropped, so vector similarity can never
 * reveal anything about hidden confidential text.
 */
export async function searchChallenges(actor: MaybeActor, f: ChallengeListInput) {
  if (!f.q || f.semantic === "0") return listChallenges(actor, f);
  const text = await listChallenges(actor, { ...f, page: 1, limit: 100 });
  const textIds = text.items.map((i) => i.id);
  const vec = (await semanticIds("challenges", f.q, 100)).filter((r) => r.sim >= MIN_SIM).map((r) => r.id);
  const fused = rrf([textIds, vec]);
  const res = await listChallenges(actor, { ...f, q: undefined }, fused);
  const textSet = new Set(textIds);
  const items = res.items.filter((i: ChallengeView) => i.kind === "full" || textSet.has(i.id));
  return { ...res, items };
}

export async function searchProjects(actor: MaybeActor, f: ProjectListInput) {
  if (!f.q || f.semantic === "0") return listProjects(actor, f);
  const text = await listProjects(actor, { ...f, page: 1, limit: 100 });
  const textIds = text.items.map((i) => i.id);
  const vec = (await semanticIds("projects", f.q, 100)).filter((r) => r.sim >= MIN_SIM).map((r) => r.id);
  const fused = rrf([textIds, vec]);
  const res = await listProjects(actor, { ...f, q: undefined }, fused);
  const textSet = new Set(textIds);
  const items = res.items.filter((i: ProjectView) => i.kind === "full" || textSet.has(i.id));
  return { ...res, items };
}

/** §8 GET /search?q=&type= — combined search. */
export async function search(actor: MaybeActor, q: string, type?: "challenge" | "project") {
  const out: { challenges?: Awaited<ReturnType<typeof searchChallenges>>; projects?: Awaited<ReturnType<typeof searchProjects>> } = {};
  if (!type || type === "challenge") out.challenges = await searchChallenges(actor, challengeListSchema.parse({ q, limit: 10 }));
  if (!type || type === "project") out.projects = await searchProjects(actor, projectListSchema.parse({ q, limit: 10 }));
  return out;
}
