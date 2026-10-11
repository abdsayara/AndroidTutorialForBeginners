import { isActive, type MaybeActor } from "@/modules/auth/policy";

/** Assistant features are for approved users only (pending accounts see nothing non-public). */
export function canUseAssistant(actor: MaybeActor): boolean {
  return isActive(actor);
}

/** Summaries: PDF/DOCX/TXT documents the user may view (FR-5.1). */
export function canSummarize(actor: MaybeActor, canViewDoc: boolean, mime: string): boolean {
  return canUseAssistant(actor) && canViewDoc && ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"].includes(mime);
}
