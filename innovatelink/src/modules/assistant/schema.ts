import { z } from "zod";

export const summarizeInput = z.object({ document_id: z.string().uuid() });
export const askInput = z.object({
  question: z.string().trim().min(3).max(1000),
  challenge_id: z.string().uuid().optional(),
  workspace_id: z.string().uuid().optional(),
}).refine((v) => !!v.challenge_id !== !!v.workspace_id, "exactly_one_scope");
export const ACTION_KINDS = ["research_questions", "related_solutions", "project_outline"] as const;
export const actionInput = z.object({ challenge_id: z.string().uuid() });

export const summarySchema = z.object({ summary: z.string().min(1), key_points: z.array(z.string()).min(1).max(12), keywords: z.array(z.string()).max(15) });

export const citationSchema = z.object({ source_type: z.enum(["document", "challenge", "meeting", "update", "project"]), source_id: z.string(), page: z.number().int().nullable().optional() });
export const answerSchema = z.object({
  insufficient: z.boolean(),
  paragraphs: z.array(z.object({ text: z.string().min(1), citations: z.array(citationSchema).min(1) })).max(8),
});
export type Answer = z.infer<typeof answerSchema>;

export const actionOutputSchema = z.object({
  title: z.string(),
  items: z.array(z.object({ heading: z.string(), body: z.string(), source_id: z.string().optional() })).min(1).max(12),
});
