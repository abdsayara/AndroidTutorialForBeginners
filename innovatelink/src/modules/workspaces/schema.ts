import { z } from "zod";

const date = z.coerce.date();
export const createWorkspaceSchema = z.object({ match_id: z.string().uuid() });
export const updateWorkspaceSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  objectives: z.string().trim().max(8000).optional(),
  start_date: date.nullable().optional(),
  end_date: date.nullable().optional(),
  status: z.enum(["active", "paused"]).optional(),
});
export const courseLinkSchema = z.object({ course_code: z.string().trim().max(40), semester: z.string().trim().max(40) });
export const memberSchema = z.object({ user_id: z.string().uuid(), ws_role: z.enum(["company_rep", "mentor", "supervisor", "student", "coordinator"]) });
export const agreementSchema = z.object({ document_id: z.string().uuid() });
export const ipRecordSchema = z.object({
  ip_status: z.enum(["none", "disclosed", "filed", "granted", "licensed"]),
  owners: z.array(z.object({ name: z.string().trim().min(1).max(200), org_id: z.string().uuid().optional(), share: z.number().min(0).max(100) })).min(1).max(10)
    .refine((o) => Math.abs(o.reduce((s, x) => s + x.share, 0) - 100) < 0.01, "shares_must_total_100"),
  background_ip: z.string().trim().max(4000).optional(),
  agreement_doc_id: z.string().uuid().optional(),
});
export const milestoneSchema = z.object({ title: z.string().trim().min(2).max(200), due_date: date.nullable().optional(), order: z.number().int().min(0).optional() });
export const milestoneUpdateSchema = milestoneSchema.partial().extend({ status: z.enum(["pending", "in_progress", "done"]).optional() });
export const taskSchema = z.object({ milestone_id: z.string().uuid(), title: z.string().trim().min(2).max(300), assignee_id: z.string().uuid().nullable().optional(), due_date: date.nullable().optional() });
export const taskUpdateSchema = z.object({ title: z.string().trim().min(2).max(300).optional(), assignee_id: z.string().uuid().nullable().optional(), due_date: date.nullable().optional(), status: z.enum(["todo", "doing", "done"]).optional(), milestone_id: z.string().uuid().optional() });
export const meetingSchema = z.object({ held_at: date, attendees: z.array(z.string().trim().max(150)).max(50).default([]), notes: z.string().trim().min(2).max(20000), action_items: z.array(z.string().trim().max(500)).max(50).default([]) });
export const progressSchema = z.object({ body: z.string().trim().min(2).max(10000), prototype_stage: z.string().trim().max(200).optional(), test_results: z.string().trim().max(5000).optional() });
/** FR-4.6 structured final report. */
export const finalReportSchema = z.object({
  summary: z.string().trim().max(10000).default(""),
  solution: z.string().trim().max(10000).default(""),
  results: z.string().trim().max(10000).default(""),
  technical_recommendations: z.string().trim().max(10000).default(""),
  business_recommendations: z.string().trim().max(10000).default(""),
  next_steps: z.string().trim().max(10000).default(""),
});
/** FR-4.7 closing: rating + optional documented impact. */
export const closeSchema = z.object({
  outcome: z.enum(["solved", "closed"]),
  rating: z.number().int().min(1).max(5),
  rating_comment: z.string().trim().max(3000).optional(),
  impact: z.object({
    savings_ils: z.number().nonnegative().optional(),
    productivity_pct: z.number().min(-100).max(1000).optional(),
    waste_reduction_tons: z.number().nonnegative().optional(),
    water_saved_m3: z.number().nonnegative().optional(),
    energy_saved_kwh: z.number().nonnegative().optional(),
    notes: z.string().trim().max(2000).optional(),
  }).default({}),
});
