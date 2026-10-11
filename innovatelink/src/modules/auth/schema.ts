import { z } from "zod";

export const passwordSchema = z.string().min(10, "min_10").max(200);
export const emailSchema = z.string().trim().toLowerCase().email("invalid_email").max(254);

export const newOrgSchema = z.object({
  type: z.enum(["company", "university", "partner"]),
  name_ar: z.string().trim().min(2).max(200),
  name_en: z.string().trim().max(200).optional(),
  sector_id: z.string().uuid().optional(),
  city: z.string().trim().max(100).optional(),
  size: z.enum(["micro", "small", "medium", "large"]).optional(),
});

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    full_name: z.string().trim().min(2).max(150),
    role: z.enum(["company_admin", "company_member", "student", "researcher", "university_coordinator"]),
    locale: z.enum(["ar", "en"]).default("ar"),
    org_id: z.string().uuid().optional(),
    new_org: newOrgSchema.optional(),
    consent_version: z.string().min(1, "consent_required"),
  })
  .refine((v) => !(v.org_id && v.new_org), { message: "org_or_new_org", path: ["org_id"] });
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1).max(200) });
export const tokenSchema = z.object({ token: z.string().min(10).max(200) });
export const forgotSchema = z.object({ email: emailSchema });
export const resetSchema = z.object({ token: z.string().min(10).max(200), password: passwordSchema });

export const profileSchema = z.object({
  full_name: z.string().trim().min(2).max(150).optional(),
  locale: z.enum(["ar", "en"]).optional(),
});

export const researcherProfileSchema = z.object({
  department: z.string().trim().max(200).optional(),
  title: z.string().trim().max(100).optional(),
  expertise_tags: z.array(z.string().trim().min(1).max(60)).max(30).optional(),
  bio: z.string().trim().max(4000).optional(),
  publications_url: z.string().url().max(500).optional().or(z.literal("")),
  availability: z.string().trim().max(200).optional(),
  lang: z.enum(["ar", "en"]).optional(),
});
