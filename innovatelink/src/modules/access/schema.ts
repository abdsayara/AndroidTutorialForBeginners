import { z } from "zod";

export const accessRequestSchema = z.object({
  subject_type: z.enum(["challenge", "project"]),
  subject_id: z.string().uuid(),
  message: z.string().trim().max(2000).optional(),
});
export const accessDecisionSchema = z.object({ decision: z.enum(["approve", "reject"]) });
export const ndaAcceptSchema = z.object({ access_request_id: z.string().uuid(), nda_version: z.string().min(1) });
