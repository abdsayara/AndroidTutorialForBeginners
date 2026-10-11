import { z } from "zod";

export const STAGES = ["ip_assessment", "market_validation", "prototype_refinement", "business_model", "investment_readiness", "market_entry"] as const;
export const PATHWAYS = ["licensing", "startup", "product_sale", "technical_service", "process_improvement"] as const;

/** FR-6.2: default editable checklist per stage (keys map to messages `commercialization.checklist.*`). */
export const DEFAULT_CHECKLIST: Record<(typeof STAGES)[number], string[]> = {
  ip_assessment: ["novelty_search", "ownership_confirmed", "disclosure_filed"],
  market_validation: ["customer_interviews", "market_size", "competitor_analysis"],
  prototype_refinement: ["field_testing", "cost_reduction", "certifications"],
  business_model: ["revenue_model", "pricing", "partners_identified"],
  investment_readiness: ["pitch_deck", "financial_projections", "investor_list"],
  market_entry: ["first_customer", "launch_plan", "support_plan"],
};

export const checklistItem = z.object({ key: z.string().max(80), label: z.string().max(300).optional(), done: z.boolean() });
export const openCaseSchema = z.object({ project_id: z.string().uuid(), pathway: z.enum(PATHWAYS), notes: z.string().trim().max(5000).optional() });
export const updateCaseSchema = z.object({
  stage: z.enum(STAGES).optional(),
  pathway: z.enum(PATHWAYS).optional(),
  notes: z.string().trim().max(10000).optional(),
  checklist: z.record(z.enum(STAGES), z.array(checklistItem).max(30)).optional(),
});
export const projectIpSchema = z.object({
  ip_status: z.enum(["none", "disclosed", "filed", "granted", "licensed"]),
  owners: z.array(z.object({ name: z.string().trim().min(1).max(200), org_id: z.string().uuid().optional(), share: z.number().min(0).max(100) })).min(1).max(10)
    .refine((o) => Math.abs(o.reduce((s, x) => s + x.share, 0) - 100) < 0.01, "shares_must_total_100"),
  background_ip: z.string().trim().max(4000).optional(),
  agreement_doc_id: z.string().uuid(),
});
