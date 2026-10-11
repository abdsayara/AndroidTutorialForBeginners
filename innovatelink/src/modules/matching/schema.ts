import { z } from "zod";

export const CRITERIA = ["technical", "expertise", "maturity", "resources", "need_fit"] as const;
export type Criterion = (typeof CRITERIA)[number];

export const DEFAULT_WEIGHTS: Record<Criterion, number> = { technical: 0.35, expertise: 0.2, maturity: 0.15, resources: 0.1, need_fit: 0.2 };
export const MATCH_THRESHOLD = 0.55;
export const RETRIEVE_K = 30;
export const KEEP_TOP = 10;
export const CLUSTER_SIMILARITY = 0.82;

/** §7.2 step 3: LLM rerank output for one batch (≤10 candidates). */
export const rerankSchema = z.object({
  candidates: z.array(
    z.object({
      ref: z.string(),
      scores: z.object({
        technical: z.number().min(0).max(5),
        expertise: z.number().min(0).max(5),
        maturity: z.number().min(0).max(5),
        resources: z.number().min(0).max(5),
        need_fit: z.number().min(0).max(5),
      }),
      rationale: z.string().min(10).max(1200),
    }),
  ),
});
export type Rerank = z.infer<typeof rerankSchema>;

export const shortlistSchema = z.discriminatedUnion("decision", [
  z.object({ decision: z.literal("shortlist") }),
  z.object({ decision: z.literal("reject"), rejection_reason: z.string().trim().min(3).max(1000) }),
]);
export const respondSchema = z.discriminatedUnion("decision", [
  z.object({ decision: z.literal("accept") }),
  z.object({ decision: z.literal("reject"), rejection_reason: z.string().trim().min(3).max(1000) }),
]);
export const manualMatchSchema = z.object({
  target_type: z.enum(["project", "researcher", "lab"]),
  target_id: z.string().uuid(),
  rationale: z.string().trim().min(10).max(1200),
});
export const feedbackSchema = z.object({ useful: z.boolean().optional(), report: z.string().trim().max(2000).optional() });
