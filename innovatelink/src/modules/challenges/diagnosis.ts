import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { aiConfig, generateStructured } from "@/lib/ai";
import { CONCEPT_LABEL_AR, conceptsOf } from "@/lib/ai/text";
import { AppError, assertAllowed, notFound } from "@/lib/api/errors";
import type { Actor } from "@/modules/auth/policy";
import { canDiagnoseChallenge } from "./policy";
import { CATEGORIES } from "./schema";

/** PRD §7.1 output contract. */
export const diagnosisSchema = z.object({
  improved_statement: z.string().min(1),
  missing_info_questions: z.array(z.string().min(3)).min(1).max(10),
  suggested_category: z.enum(CATEGORIES),
  suggested_tags: z.array(z.string()).max(10),
  impact_estimate: z.object({
    type: z.enum(["cost", "productivity", "quality", "environment", "revenue"]),
    reasoning: z.string(),
    confidence: z.enum(["low", "medium", "high"]),
  }),
  suggested_public_title: z.string().min(3).max(200),
  clarity_score: z.number().min(0).max(100),
});
export type Diagnosis = z.infer<typeof diagnosisSchema>;

const CONCEPT_CATEGORY: Record<string, (typeof CATEGORIES)[number]> = {
  water: "energy_water_waste", waste: "energy_water_waste", recycle: "energy_water_waste", energy: "energy_water_waste",
  quality: "quality_manufacturing", software: "digital_automation", logistics: "market_logistics",
};
const CATEGORY_AR: Record<(typeof CATEGORIES)[number], string> = {
  operations: "تحسين العمليات", product_dev: "تطوير المنتجات", digital_automation: "الأتمتة والتحول الرقمي",
  energy_water_waste: "الطاقة والمياه والمخلفات", quality_manufacturing: "الجودة والتصنيع", market_logistics: "السوق والخدمات اللوجستية", research_tech: "البحث والتكنولوجيا",
};

interface DiagnosisInput {
  title: string; problem_statement?: string | null; current_situation?: string | null; desired_outcome?: string | null;
  constraints?: string | null; business_impact?: unknown; resources_offered?: unknown; sector?: string | null; company_size?: string | null; lang: "ar" | "en";
}

/** Deterministic offline diagnosis for the mock provider. */
export function mockDiagnosis(i: DiagnosisInput): Diagnosis {
  const all = [i.title, i.problem_statement, i.current_situation, i.desired_outcome, i.constraints].filter(Boolean).join(" ");
  const concepts = conceptsOf(all);
  const category = concepts.map((c) => CONCEPT_CATEGORY[c]).find(Boolean) ?? "operations";
  const ar = i.lang === "ar";
  const q: string[] = [];
  if (!i.current_situation) q.push(ar ? "ما الوضع الحالي بالتفصيل؟ كيف تتعاملون مع المشكلة اليوم؟" : "What is the current situation and how do you handle the problem today?");
  if (!i.desired_outcome) q.push(ar ? "ما النتيجة المطلوبة وكيف ستقيسون نجاح الحل؟" : "What outcome do you want and how will you measure success?");
  if (!i.constraints) q.push(ar ? "ما القيود المتعلقة بالميزانية والوقت والمعدات؟" : "What are the budget, time and equipment constraints?");
  q.push(ar ? "ما الكميات أو الأرقام التقريبية المرتبطة بالمشكلة (شهرياً أو سنوياً)؟" : "What approximate quantities or figures are involved (monthly or yearly)?");
  q.push(ar ? "هل تتوفر بيانات أو عينات يمكن مشاركتها مع الفريق الأكاديمي؟" : "Are there data or samples you can share with the academic team?");
  q.push(ar ? "هل جُرّبت حلول سابقاً؟ وما نتائجها؟" : "Have any solutions been tried before, and with what results?");
  const hasNumbers = !!(i.business_impact as { estimate?: number } | null)?.estimate;
  const impactType = concepts.includes("waste") || concepts.includes("water") ? "environment" : concepts.includes("quality") ? "quality" : "cost";
  const len = all.length;
  const filled = [i.problem_statement, i.current_situation, i.desired_outcome, i.constraints].filter(Boolean).length;
  return {
    improved_statement: ar
      ? `المشكلة: ${i.problem_statement ?? i.title}${i.current_situation ? `\nالوضع الحالي: ${i.current_situation}` : ""}${i.desired_outcome ? `\nالنتيجة المطلوبة: ${i.desired_outcome}` : ""}`
      : `Problem: ${i.problem_statement ?? i.title}${i.current_situation ? `\nCurrent situation: ${i.current_situation}` : ""}${i.desired_outcome ? `\nDesired outcome: ${i.desired_outcome}` : ""}`,
    missing_info_questions: q.slice(0, 6),
    suggested_category: category,
    suggested_tags: concepts.map((c) => (ar ? CONCEPT_LABEL_AR[c]! : c)).slice(0, 6),
    impact_estimate: {
      type: impactType,
      reasoning: ar
        ? `يُتوقع أن يكون الأثر الأساسي ${impactType === "environment" ? "بيئياً عبر تقليل المخلفات أو التلوث" : impactType === "quality" ? "على الجودة وتقليل العيوب" : "في خفض التكاليف التشغيلية"}${hasNumbers ? " بناءً على الأرقام المدخلة" : "، ويحتاج التقدير الكمي أرقاماً من الشركة"}.`
        : `The main impact is expected to be ${impactType}${hasNumbers ? ", based on the figures provided" : "; a quantitative estimate needs figures from the company"}.`,
      confidence: hasNumbers ? "medium" : "low",
    },
    suggested_public_title: ar ? `تحدٍّ في ${CATEGORY_AR[category]}${i.sector ? ` — قطاع ${i.sector}` : ""}` : `A ${category.replace(/_/g, " ")} challenge${i.sector ? ` in ${i.sector}` : ""}`,
    clarity_score: Math.min(100, Math.round(filled * 18 + Math.min(len, 600) / 20)),
  };
}

/** Removes the company name from the suggested public title (PRD §7.1). */
export function scrubIdentity(title: string, names: (string | null | undefined)[]): string {
  let t = title;
  for (const n of names) if (n && n.trim().length > 1) t = t.split(n).join("").trim();
  return t.replace(/\s{2,}/g, " ").replace(/^[\s—\-–:]+|[\s—\-–:]+$/g, "") || "—";
}

/** FR-1.2: AI diagnosis; FR-1.3: stored as suggestions, never applied to the user's text. */
export async function diagnoseChallenge(actor: Actor, id: string) {
  const c = await db.challenge.findFirst({ where: { id, deleted_at: null }, include: { org: true, sector: true } });
  if (!c) throw notFound();
  assertAllowed(canDiagnoseChallenge(actor, c));
  if (c.visibility === "confidential" && !aiConfig().allowConfidential) throw new AppError("forbidden", "ai_confidential_disabled");
  if (!c.problem_statement || c.problem_statement.trim().length < 10) {
    throw new AppError("validation_error", "problem_statement_required", { problem_statement: ["required"] });
  }
  const input: DiagnosisInput = {
    title: c.title, problem_statement: c.problem_statement, current_situation: c.current_situation, desired_outcome: c.desired_outcome,
    constraints: c.constraints, business_impact: c.business_impact, resources_offered: c.resources_offered,
    sector: c.sector?.name_ar ?? null, company_size: c.org.size, lang: c.lang,
  };
  const res = await generateStructured(diagnosisSchema, {
    kind: "diagnose",
    system: "You are an innovation consultant helping Palestinian companies describe industrial challenges clearly for university researchers.",
    instructions:
      "Diagnose the challenge. Return JSON with: improved_statement (a clearer rewrite, do not invent facts), missing_info_questions (3-6 clarifying questions), " +
      `suggested_category (one of ${CATEGORIES.join(", ")}), suggested_tags, impact_estimate {type, reasoning, confidence} — no monetary figures unless the user provided numbers, ` +
      "suggested_public_title (generic; never include the company name or identifying details), clarity_score (0-100).",
    data: input as unknown as Record<string, unknown>,
    userId: actor.id,
    inputRef: `challenge:${id}`,
    mock: () => mockDiagnosis(input),
  });
  const output = { ...res.output, suggested_public_title: scrubIdentity(res.output.suggested_public_title, [c.org.name_ar, c.org.name_en]) };
  await db.challenge.update({ where: { id }, data: { ai_diagnosis: { ...output, run_id: res.run_id, at: new Date().toISOString() } as Prisma.InputJsonValue } });
  return { ...output, run_id: res.run_id, cached: res.cached };
}
