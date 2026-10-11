import { z } from "zod";
import { CRITERIA } from "@/modules/matching/schema";

export const userListSchema = z.object({
  q: z.string().trim().max(100).optional(),
  role: z.enum(["company_admin", "company_member", "student", "researcher", "university_coordinator", "platform_coordinator", "platform_admin"]).optional(),
  status: z.enum(["pending", "active", "suspended"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
export const userUpdateSchema = z.object({
  status: z.enum(["pending", "active", "suspended"]).optional(),
  role: z.enum(["company_admin", "company_member", "student", "researcher", "university_coordinator", "platform_coordinator", "platform_admin"]).optional(),
});
export const taxonomySchema = z.object({
  kind: z.enum(["sector", "tag"]),
  slug: z.string().trim().regex(/^[a-z0-9-]{2,60}$/),
  name_ar: z.string().trim().min(2).max(120),
  name_en: z.string().trim().min(2).max(120),
  parent_id: z.string().uuid().nullable().optional(),
});
export const settingsSchema = z.object({
  matching_weights: z.object(Object.fromEntries(CRITERIA.map((k) => [k, z.number().min(0).max(1)])) as Record<(typeof CRITERIA)[number], z.ZodNumber>).optional(),
  nda_template: z.object({ version: z.string().min(1).max(40), text_ar: z.string().min(20), text_en: z.string().min(20) }).optional(),
  retention_days_closed_challenges: z.number().int().min(30).max(3650).optional(),
});
export const auditListSchema = z.object({
  entity_type: z.string().max(60).optional(),
  entity_id: z.string().max(60).optional(),
  action: z.string().max(60).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});
