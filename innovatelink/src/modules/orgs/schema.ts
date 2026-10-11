import { z } from "zod";

export const orgUpdateSchema = z.object({
  name_ar: z.string().trim().min(2).max(200).optional(),
  name_en: z.string().trim().max(200).optional(),
  sector_id: z.string().uuid().nullable().optional(),
  city: z.string().trim().max(100).optional(),
  size: z.enum(["micro", "small", "medium", "large"]).optional(),
});

export const orgCreateSchema = z.object({
  type: z.enum(["company", "university", "platform", "partner"]),
  name_ar: z.string().trim().min(2).max(200),
  name_en: z.string().trim().max(200).optional(),
  sector_id: z.string().uuid().optional(),
  city: z.string().trim().max(100).optional(),
  size: z.enum(["micro", "small", "medium", "large"]).optional(),
  email_domains: z.array(z.string().trim().toLowerCase().regex(/^[a-z0-9.-]+\.[a-z]{2,}$/)).max(10).default([]),
});

export const orgListSchema = z.object({
  type: z.enum(["company", "university", "platform", "partner"]).optional(),
  status: z.enum(["pending", "active", "suspended"]).optional(),
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
