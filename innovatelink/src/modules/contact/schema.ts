import { z } from "zod";
export const contactCreateSchema = z.object({
  target_type: z.enum(["challenge", "project", "researcher", "lab"]),
  target_id: z.string().uuid(),
  message: z.string().trim().min(5).max(3000),
});
export const contactRespondSchema = z.object({ decision: z.enum(["accepted", "declined"]) });
