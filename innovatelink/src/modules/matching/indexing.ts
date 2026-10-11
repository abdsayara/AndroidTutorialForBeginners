import type { Challenge, Lab, Project, ResearcherProfile } from "@prisma/client";
import { db, toVectorLiteral } from "@/lib/db";
import { aiConfig, embed } from "@/lib/ai";
import { serverT } from "@/lib/i18n/server-t";

const join = (...parts: (string | null | undefined | string[])[]) =>
  parts.flat().filter((p): p is string => !!p && p.trim().length > 0).join("\n");

/**
 * Text sent to the AI provider for a challenge. With AI_ALLOW_CONFIDENTIAL=false,
 * confidential challenges contribute only public_title + category (PRD §7.4).
 */
export function challengeText(c: Pick<Challenge, "title" | "public_title" | "category" | "visibility" | "problem_statement" | "current_situation" | "desired_outcome" | "constraints" | "tags">): string {
  const category = c.category ? serverT("ar", "enums.category")(c.category) : "";
  if (c.visibility === "confidential" && !aiConfig().allowConfidential) return join(c.public_title, category);
  return join(c.title, category, c.tags, c.problem_statement, c.current_situation, c.desired_outcome, c.constraints);
}

export function projectText(p: Pick<Project, "title" | "public_title" | "visibility" | "summary" | "problem_addressed" | "applications" | "tags" | "evidence">): string {
  if (p.visibility === "confidential" && !aiConfig().allowConfidential) return join(p.public_title, p.tags);
  return join(p.title, p.tags, p.summary, p.problem_addressed, p.applications, p.evidence);
}

export function researcherText(r: Pick<ResearcherProfile, "department" | "title" | "expertise_tags" | "bio">): string {
  return join(r.title, r.department, r.expertise_tags, r.bio);
}

export function labText(l: Pick<Lab, "name" | "description" | "equipment" | "services">): string {
  return join(l.name, l.description, l.equipment, l.services);
}

const TABLE = { challenge: "challenges", project: "projects", researcher: "researcher_profiles", lab: "labs" } as const;
export type IndexType = keyof typeof TABLE;

async function store(type: IndexType, id: string, text: string) {
  if (!text.trim()) return;
  const [vec] = await embed([text]);
  await db.$executeRawUnsafe(`UPDATE "${TABLE[type]}" SET embedding = $1::vector WHERE id = $2::uuid`, toVectorLiteral(vec!), id);
}

/** §7.2 step 1: (re)compute and store the embedding of one entity. */
export async function indexEntity(type: IndexType, id: string): Promise<void> {
  if (type === "challenge") {
    const c = await db.challenge.findUnique({ where: { id } });
    if (c) await store(type, id, challengeText(c));
  } else if (type === "project") {
    const p = await db.project.findUnique({ where: { id } });
    if (p) await store(type, id, projectText(p));
  } else if (type === "researcher") {
    const r = await db.researcherProfile.findUnique({ where: { id } });
    if (r) await store(type, id, researcherText(r));
  } else {
    const l = await db.lab.findUnique({ where: { id } });
    if (l) await store(type, id, labText(l));
  }
}

/** Batch (re)index everything — used by seed and admin "reindex". */
export async function reindexAll(): Promise<number> {
  let n = 0;
  const batch = async <T extends { id: string }>(type: IndexType, rows: T[], text: (r: T) => string) => {
    for (let i = 0; i < rows.length; i += 64) {
      const slice = rows.slice(i, i + 64).filter((r) => text(r).trim());
      const vecs = await embed(slice.map(text));
      for (let j = 0; j < slice.length; j++) {
        await db.$executeRawUnsafe(`UPDATE "${TABLE[type]}" SET embedding = $1::vector WHERE id = $2::uuid`, toVectorLiteral(vecs[j]!), slice[j]!.id);
        n++;
      }
    }
  };
  await batch("challenge", await db.challenge.findMany({ where: { deleted_at: null } }), challengeText);
  await batch("project", await db.project.findMany({ where: { deleted_at: null } }), projectText);
  await batch("researcher", await db.researcherProfile.findMany(), researcherText);
  await batch("lab", await db.lab.findMany({ where: { deleted_at: null } }), labText);
  return n;
}
