import { z } from "zod";
import { ALLOWED_MIME, MAX_FILE_BYTES } from "@/lib/storage";

export const OWNER_TYPES = ["challenge", "project", "workspace", "ip_record", "admin_template"] as const;

export const presignSchema = z.object({
  owner_type: z.enum(OWNER_TYPES),
  owner_id: z.string().uuid(),
  filename: z.string().trim().min(1).max(200),
  mime: z.string().refine((m) => m in ALLOWED_MIME, "mime_not_allowed"),
  size: z.number().int().positive().max(MAX_FILE_BYTES, "file_too_large"),
  /** FR-4.5: upload a new version of an existing document. */
  previous_id: z.string().uuid().optional(),
});
export const completeSchema = z.object({ document_id: z.string().uuid() });
