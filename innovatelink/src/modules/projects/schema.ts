import { z } from "zod";

export const PROJECT_TYPES = ["graduation_project", "research_output", "prototype", "technology"] as const;
export const IP_STATUSES = ["none", "disclosed", "filed", "granted", "licensed"] as const;
export const SUPPORT_NEEDS = ["technical", "funding", "mentoring", "lab_access", "market_access"] as const;
export const SEEKING = ["showcase", "industry_partner", "licensing", "startup", "consulting"] as const;

const text = (max = 8000) => z.string().trim().max(max);

export const projectDraftSchema = z.object({
  type: z.enum(PROJECT_TYPES),
  title: text(200).min(3),
  public_title: text(200).optional(),
  summary: text().optional(),
  problem_addressed: text().optional(),
  sector_id: z.string().uuid().optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
  applications: text().optional(),
  team_member_ids: z.array(z.string().uuid()).max(20).optional(),
  supervisor_id: z.string().uuid().optional().nullable(),
  trl: z.number().int().min(1).max(9).optional().nullable(),
  evidence: text().optional(),
  demo_url: z.string().url().max(500).optional().or(z.literal("")),
  potential_customers: text().optional(),
  ip_status: z.enum(IP_STATUSES).optional(),
  collaboration_terms: text().optional(),
  support_needs: z.array(z.enum(SUPPORT_NEEDS)).optional(),
  seeking: z.array(z.enum(SEEKING)).optional(),
  visibility: z.enum(["public", "selected_orgs", "confidential"]).optional(),
  visibility_org_ids: z.array(z.string().uuid()).max(50).optional(),
  lang: z.enum(["ar", "en"]).optional(),
});
export type ProjectDraft = z.infer<typeof projectDraftSchema>;
export const projectUpdateSchema = projectDraftSchema.partial();

/** FR-3.1: required for publication. */
export const projectSubmitSchema = z.object({
  title: z.string().min(3),
  summary: z.string().min(20),
  problem_addressed: z.string().min(10),
  sector_id: z.string().uuid(),
  trl: z.number().int().min(1).max(9),
  supervisor_id: z.string().uuid(),
});

export const projectApproveSchema = z.discriminatedUnion("decision", [
  z.object({ decision: z.literal("approve") }),
  z.object({ decision: z.literal("reject"), note: z.string().trim().min(5).max(2000) }),
]);

const csvList = <T extends string>(vals: readonly [T, ...T[]]) =>
  z.preprocess((v) => (typeof v === "string" ? v.split(/[|;]/).map((s) => s.trim()).filter(Boolean) : v), z.array(z.enum(vals)));
export const projectListSchema = z.object({
  q: z.string().trim().max(200).optional(),
  type: z.enum(PROJECT_TYPES).optional(),
  sector_id: z.string().uuid().optional(),
  org_id: z.string().uuid().optional(),
  trl_min: z.coerce.number().int().min(1).max(9).optional(),
  trl_max: z.coerce.number().int().min(1).max(9).optional(),
  ip_status: z.enum(IP_STATUSES).optional(),
  seeking: csvList(SEEKING).optional(),
  semantic: z.enum(["0", "1"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ProjectListInput = z.infer<typeof projectListSchema>;

/** FR-3.5: CSV import template columns. */
export const IMPORT_COLUMNS = ["type", "title", "summary", "problem_addressed", "sector_slug", "tags", "trl", "supervisor_email", "applications", "evidence", "ip_status", "seeking", "lang"] as const;

export const importRowSchema = z.object({
  type: z.enum(PROJECT_TYPES),
  title: z.string().trim().min(3).max(200),
  summary: z.string().trim().max(8000).optional().default(""),
  problem_addressed: z.string().trim().max(8000).optional().default(""),
  sector_slug: z.string().trim().optional().default(""),
  tags: z.string().optional().default(""),
  trl: z.preprocess((v) => (v === "" || v === undefined ? undefined : Number(v)), z.number().int().min(1).max(9).optional()),
  supervisor_email: z.string().trim().toLowerCase().email().optional().or(z.literal("")),
  applications: z.string().trim().max(8000).optional().default(""),
  evidence: z.string().trim().max(8000).optional().default(""),
  ip_status: z.preprocess((v) => (v === "" ? undefined : v), z.enum(IP_STATUSES).optional()),
  seeking: z.preprocess((v) => (typeof v === "string" ? v.split("|").map((s) => s.trim()).filter(Boolean) : []), z.array(z.enum(SEEKING))),
  lang: z.preprocess((v) => (v === "" ? undefined : v), z.enum(["ar", "en"]).optional()),
});
