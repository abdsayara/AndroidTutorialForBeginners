import type { z } from "zod";
import { db } from "@/lib/db";
import { aiConfig, embed, generateStructured } from "@/lib/ai";
import { cosine, tokens } from "@/lib/ai/text";
import { AppError, assertAllowed, notFound } from "@/lib/api/errors";
import type { Actor } from "@/modules/auth/policy";
import { getChallenge } from "@/modules/challenges/service";
import { ownerAccess } from "@/modules/files/service";
import { loadWorkspaceForActor } from "@/modules/workspaces/access";
import { searchProjects } from "@/modules/search/service";
import { projectListSchema } from "@/modules/projects/schema";
import { canSummarize, canUseAssistant } from "./policy";
import { actionOutputSchema, answerSchema, summarySchema, type ACTION_KINDS, type Answer, type askInput } from "./schema";

export const INSUFFICIENT_AR = "لا توجد معلومات كافية في محتوى المنصة";
export const INSUFFICIENT_EN = "There is not enough information in the platform content";
/** Fixed badge shown with every assistant output (FR-5.4). */
export const AI_BADGE_KEY = "assistant.badge";

const sentences = (t: string) => t.split(/(?<=[.!؟?\n])\s+/).map((s) => s.trim()).filter((s) => s.length > 15);

function bestSentence(text: string, q: string): string {
  const qt = new Set(tokens(q));
  let best = sentences(text)[0] ?? text.slice(0, 300);
  let bestScore = -1;
  for (const s of sentences(text)) {
    const score = tokens(s).filter((t) => qt.has(t)).length;
    if (score > bestScore) { best = s; bestScore = score; }
  }
  return best.slice(0, 600);
}

/** FR-5.1: summary, key points, keywords of a document the user can see. */
export async function summarizeDocument(actor: Actor, documentId: string) {
  const doc = await db.document.findFirst({ where: { id: documentId, deleted_at: null, completed: true } });
  if (!doc) throw notFound();
  const acc = await ownerAccess(actor, doc.owner_type, doc.owner_id);
  if (acc.hideExistence && !acc.canView) throw notFound();
  assertAllowed(canSummarize(actor, acc.canView, doc.mime));
  if (acc.confidential && !aiConfig().allowConfidential && doc.owner_type !== "workspace") throw new AppError("forbidden", "ai_confidential_disabled");
  const text = doc.extracted_text?.trim();
  if (!text) throw new AppError("bad_request", "document_not_processed");
  const excerpt = text.slice(0, 24000);
  const res = await generateStructured(summarySchema, {
    kind: "assistant.summarize",
    system: "You summarise technical and research documents for Palestinian industry–academia collaboration.",
    instructions: "Summarise the document. Return {summary (one paragraph), key_points (3-8 bullets), keywords (5-10)}. Use only the document content.",
    data: { filename: doc.filename, content: excerpt },
    userId: actor.id,
    inputRef: `document:${doc.id}`,
    mock: () => {
      const ss = sentences(excerpt);
      const freq = new Map<string, number>();
      for (const t of tokens(excerpt)) if (t.length > 3) freq.set(t, (freq.get(t) ?? 0) + 1);
      return {
        summary: ss.slice(0, 3).join(" ") || excerpt.slice(0, 400),
        key_points: (ss.length ? ss : [excerpt.slice(0, 200)]).slice(0, 5),
        keywords: [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k]) => k),
      };
    },
  });
  return { ...res.output, run_id: res.run_id, document_id: doc.id };
}

interface Source { source_type: "document" | "challenge" | "meeting" | "update" | "project"; source_id: string; page?: number | null; text: string; sim: number }

/**
 * Gathers sources the actor may read within the scope. Permission filtering happens
 * here, BEFORE any vector ranking (PRD §7.3): only allowed document ids are queried.
 */
async function gatherSources(actor: Actor, input: z.infer<typeof askInput>, qvec: number[]): Promise<Source[]> {
  const inline: Omit<Source, "sim">[] = [];
  const docOwners: { owner_type: string; owner_id: string }[] = [];
  if (input.challenge_id) {
    const v = await getChallenge(actor, input.challenge_id);
    if (v.kind !== "full") throw new AppError("forbidden");
    if (v.visibility === "confidential" && !aiConfig().allowConfidential) throw new AppError("forbidden", "ai_confidential_disabled");
    inline.push({ source_type: "challenge", source_id: v.id, text: [v.title, v.problem_statement, v.current_situation, v.desired_outcome, v.constraints].filter(Boolean).join("\n") });
    docOwners.push({ owner_type: "challenge", owner_id: v.id });
  } else {
    const { ws } = await loadWorkspaceForActor(actor, input.workspace_id!);
    docOwners.push({ owner_type: "workspace", owner_id: ws.id });
    const c = await getChallenge(actor, ws.challenge_id).catch(() => null);
    if (c?.kind === "full") {
      inline.push({ source_type: "challenge", source_id: c.id, text: [c.title, c.problem_statement, c.desired_outcome].filter(Boolean).join("\n") });
      docOwners.push({ owner_type: "challenge", owner_id: c.id });
    }
    for (const m of await db.meetingNote.findMany({ where: { workspace_id: ws.id }, take: 50, orderBy: { held_at: "desc" } })) {
      inline.push({ source_type: "meeting", source_id: m.id, text: [m.notes, ...m.action_items].join("\n") });
    }
    for (const u of await db.progressUpdate.findMany({ where: { workspace_id: ws.id }, take: 50, orderBy: { created_at: "desc" } })) {
      inline.push({ source_type: "update", source_id: u.id, text: [u.body, u.prototype_stage, u.test_results].filter(Boolean).join("\n") });
    }
  }
  const allowedDocs = await db.document.findMany({ where: { OR: docOwners, deleted_at: null, completed: true }, select: { id: true } });
  const ids = allowedDocs.map((d) => d.id);
  const chunkRows = ids.length
    ? await db.$queryRawUnsafe<{ document_id: string; page: number | null; text: string; sim: number }[]>(
        `SELECT document_id, page, text, 1 - (embedding <=> $1::vector) AS sim FROM document_chunks
         WHERE embedding IS NOT NULL AND document_id = ANY($2::uuid[]) ORDER BY embedding <=> $1::vector LIMIT 8`,
        `[${qvec.join(",")}]`, ids,
      )
    : [];
  const inlineVecs = await embed(inline.map((s) => s.text));
  const sources: Source[] = [
    ...chunkRows.map((r) => ({ source_type: "document" as const, source_id: r.document_id, page: r.page, text: r.text, sim: Number(r.sim) })),
    ...inline.map((s, i) => ({ ...s, sim: cosine(qvec, inlineVecs[i]!) })),
  ];
  return sources.sort((a, b) => b.sim - a.sim).slice(0, 6);
}

const MIN_SOURCE_SIM = 0.12;

/** FR-5.2: RAG answer from permitted platform content only; every paragraph cites its source. */
export async function ask(actor: Actor, input: z.infer<typeof askInput>, locale: "ar" | "en" = "ar") {
  assertAllowed(canUseAssistant(actor));
  const [qvec] = await embed([input.question]);
  const sources = (await gatherSources(actor, input, qvec!)).filter((s) => s.sim >= MIN_SOURCE_SIM);
  const insufficient = { insufficient: true, paragraphs: [], message: locale === "ar" ? INSUFFICIENT_AR : INSUFFICIENT_EN, run_id: null as string | null };
  if (sources.length === 0) return insufficient;
  const res = await generateStructured(answerSchema, {
    kind: "assistant.ask",
    system: "You answer questions strictly from the provided platform sources. If the sources are not sufficient, set insufficient=true and return no paragraphs.",
    instructions: "Answer the question in the question's language. Each paragraph must cite one or more sources by {source_type, source_id, page}. Never use outside knowledge.",
    data: { question: input.question, sources: sources.map(({ sim: _s, ...s }) => s) },
    userId: actor.id,
    inputRef: input.challenge_id ? `challenge:${input.challenge_id}` : `workspace:${input.workspace_id}`,
    cache: false,
    mock: (): Answer => ({
      insufficient: false,
      paragraphs: sources.slice(0, 3).map((s) => ({ text: bestSentence(s.text, input.question), citations: [{ source_type: s.source_type, source_id: s.source_id, page: s.page ?? null }] })),
    }),
  });
  // Keep only citations to sources we actually provided (no hallucinated links).
  const valid = new Set(sources.map((s) => `${s.source_type}:${s.source_id}`));
  const paragraphs = res.output.paragraphs
    .map((p) => ({ ...p, citations: p.citations.filter((c) => valid.has(`${c.source_type}:${c.source_id}`)) }))
    .filter((p) => p.citations.length > 0);
  if (res.output.insufficient || paragraphs.length === 0) return { ...insufficient, run_id: res.run_id };
  return { insufficient: false, paragraphs, message: null, run_id: res.run_id };
}

/** FR-5.3: ready-made actions inside a challenge. */
export async function runAction(actor: Actor, kind: (typeof ACTION_KINDS)[number], challengeId: string) {
  assertAllowed(canUseAssistant(actor));
  const v = await getChallenge(actor, challengeId);
  if (v.kind !== "full") throw new AppError("forbidden");
  if (v.visibility === "confidential" && !aiConfig().allowConfidential) throw new AppError("forbidden", "ai_confidential_disabled");
  const challenge = { title: v.title, problem_statement: v.problem_statement, desired_outcome: v.desired_outcome, constraints: v.constraints };
  let related: { id: string; title: string; summary: string | null }[] = [];
  if (kind === "related_solutions") {
    const r = await searchProjects(actor, projectListSchema.parse({ q: `${v.title} ${v.problem_statement ?? ""}`.slice(0, 200), limit: 5 }));
    related = r.items.filter((i) => i.kind === "full").map((i) => ({ id: i.id, title: (i as { title: string }).title, summary: (i as { summary: string | null }).summary }));
  }
  const instructions: Record<typeof kind, string> = {
    research_questions: "Propose 4-6 concrete research questions an academic team could investigate for this challenge. items: {heading: question, body: why it matters}.",
    related_solutions: "Using ONLY the provided related platform projects, explain how each could relate to the challenge. items: {heading: project title, body: relevance, source_id: project id}. If none, return one item saying no related solutions were found.",
    project_outline: "Draft an initial project outline with phases (understanding, design, prototype, testing, handover). items: {heading: phase, body: activities and deliverables}.",
  };
  const res = await generateStructured(actionOutputSchema, {
    kind: "assistant.action",
    system: "You help Palestinian academics and companies plan collaborative innovation projects. Outputs are preliminary and require expert review.",
    instructions: instructions[kind],
    data: { challenge, related_projects: related },
    userId: actor.id,
    inputRef: `challenge:${challengeId}:${kind}`,
    mock: () => {
      const t = v.title;
      if (kind === "research_questions") return { title: `أسئلة بحثية: ${t}`, items: [
        { heading: `ما الأسباب الجذرية لـ«${t}» وكيف تُقاس؟`, body: "تحديد المؤشرات والبيانات اللازمة لقياس المشكلة بدقة." },
        { heading: "ما البدائل التقنية المتاحة محلياً وما كلفتها؟", body: "مقارنة الحلول من حيث الكلفة والتوفر في السوق الفلسطيني." },
        { heading: "ما أثر الحل المقترح على الإنتاجية والبيئة؟", body: "تصميم تجربة لقياس الأثر قبل التطبيق وبعده." },
        { heading: "ما متطلبات التوسع من نموذج أولي إلى خط إنتاج؟", body: "تقدير الموارد والقيود التشغيلية." },
      ] };
      if (kind === "related_solutions") return related.length
        ? { title: "حلول ذات صلة على المنصة", items: related.map((r) => ({ heading: r.title, body: (r.summary ?? "").slice(0, 300) || "مشروع ذو صلة دلالية بالتحدي.", source_id: r.id })) }
        : { title: "حلول ذات صلة على المنصة", items: [{ heading: "لا توجد حلول مرتبطة", body: INSUFFICIENT_AR }] };
      return { title: `مخطط مشروع أولي: ${t}`, items: [
        { heading: "1. فهم المشكلة", body: "زيارة ميدانية، جمع البيانات، تحديد مؤشرات النجاح (2–3 أسابيع)." },
        { heading: "2. التصميم", body: "اقتراح بدائل، اختيار الحل، خطة الاختبار." },
        { heading: "3. النموذج الأولي", body: "بناء نموذج أولي مصغر واختباره مخبرياً." },
        { heading: "4. الاختبار الميداني", body: "تجربة في موقع الشركة وقياس الأثر." },
        { heading: "5. التسليم", body: "تقرير ختامي وتوصيات فنية وتجارية." },
      ] };
    },
  });
  return { ...res.output, run_id: res.run_id };
}
