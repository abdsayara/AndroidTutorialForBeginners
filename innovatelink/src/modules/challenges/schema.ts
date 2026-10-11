import { z } from "zod";

export const CATEGORIES = ["operations", "product_dev", "digital_automation", "energy_water_waste", "quality_manufacturing", "market_logistics", "research_tech"] as const;

const text = (max = 8000) => z.string().trim().max(max);

export const businessImpactSchema = z.object({
  type: z.enum(["cost", "productivity", "quality", "environment", "revenue"]).optional(),
  estimate: z.number().nonnegative().optional(),
  unit: z.string().max(40).optional(),
  confidence: z.enum(["low", "medium", "high"]).optional(),
});

export const resourcesOfferedSchema = z.object({
  data: z.boolean().optional(),
  site_access: z.boolean().optional(),
  materials: z.boolean().optional(),
  funding: z.boolean().optional(),
  notes: text(1000).optional(),
});

/** One schema shared by the 5-step form and the API (FR-1.1). Every field optional while drafting. */
export const challengeDraftSchema = z.object({
  // step 1
  title: text(200).min(3),
  category: z.enum(CATEGORIES).optional(),
  sector_id: z.string().uuid().optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
  // step 2
  problem_statement: text().optional(),
  current_situation: text().optional(),
  desired_outcome: text().optional(),
  // step 3
  constraints: text().optional(),
  business_impact: businessImpactSchema.optional(),
  resources_offered: resourcesOfferedSchema.optional(),
  expected_duration_months: z.number().int().min(1).max(60).optional().nullable(),
  // step 5
  public_title: text(200).optional(),
  visibility: z.enum(["public", "selected_orgs", "confidential"]).optional(),
  visibility_org_ids: z.array(z.string().uuid()).max(50).optional(),
  lang: z.enum(["ar", "en"]).optional(),
});
export type ChallengeDraft = z.infer<typeof challengeDraftSchema>;
export const challengeUpdateSchema = challengeDraftSchema.partial();

/** Fields required before submission. */
export const challengeSubmitSchema = z.object({
  title: z.string().min(3),
  category: z.enum(CATEGORIES),
  sector_id: z.string().uuid(),
  problem_statement: z.string().min(20),
  desired_outcome: z.string().min(5),
});

export const reviewSchema = z.discriminatedUnion("decision", [
  z.object({ decision: z.literal("publish") }),
  z.object({ decision: z.literal("needs_info"), note: z.string().trim().min(5).max(2000) }),
]);

export const visibilitySchema = z.object({
  visibility: z.enum(["public", "selected_orgs", "confidential"]),
  visibility_org_ids: z.array(z.string().uuid()).max(50).default([]),
  public_title: z.string().trim().max(200).optional(),
});

export const challengeListSchema = z.object({
  q: z.string().trim().max(200).optional(),
  category: z.enum(CATEGORIES).optional(),
  sector_id: z.string().uuid().optional(),
  city: z.string().trim().max(100).optional(),
  max_duration: z.coerce.number().int().min(1).max(60).optional(),
  semantic: z.enum(["0", "1"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ChallengeListInput = z.infer<typeof challengeListSchema>;

export const myChallengesSchema = z.object({
  status: z.enum(["draft", "submitted", "needs_info", "published", "matched", "in_progress", "solved", "closed"]).optional(),
});
