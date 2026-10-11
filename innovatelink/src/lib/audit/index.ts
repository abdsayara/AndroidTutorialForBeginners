import type { Prisma } from "@prisma/client";
import { db, type Tx } from "@/lib/db";

export type AuditAction =
  | "status_change"
  | "visibility_change"
  | "access_granted"
  | "access_revoked"
  | "nda_accepted"
  | "ip_record_change"
  | "confidential_download"
  | "admin_action"
  | "user_approved"
  | "org_approved"
  | "match_review"
  | "match_response"
  | "workspace_created"
  | "workspace_closed";

export interface AuditEntry {
  actor_id: string | null;
  action: AuditAction;
  entity_type: string;
  entity_id?: string | null;
  diff?: Prisma.InputJsonValue;
  ip?: string | null;
}

/** Appends to the append-only audit log (PRD §5, §9). */
export async function audit(entry: AuditEntry, tx: Tx = db): Promise<void> {
  await tx.auditLog.create({
    data: {
      actor_id: entry.actor_id,
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id ?? null,
      diff: entry.diff ?? undefined,
      ip: entry.ip ?? null,
    },
  });
}
