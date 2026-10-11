import type { JobName, JobPayloads } from "@/lib/jobs";
import { sendMail } from "@/lib/mail";
import { indexEntity } from "@/modules/matching/indexing";
import { detectClusters, runChallengeMatching, runProjectMatching } from "@/modules/matching/service";
import { processDocument } from "@/modules/assistant/documents";
import { sendDeadlineReminders } from "@/modules/workspaces/service";

/** Job handlers, shared by the pg-boss worker and tests. */
export const handlers: { [N in JobName]: (data: JobPayloads[N]) => Promise<unknown> } = {
  "embed.entity": (d) => indexEntity(d.type, d.id),
  "match.challenge": (d) => runChallengeMatching(d.challenge_id),
  "match.project": (d) => runProjectMatching(d.project_id),
  "cluster.challenges": () => detectClusters(),
  "mail.send": (d) => sendMail(d),
  "document.process": (d) => processDocument(d.document_id),
  "deadline.reminders": () => sendDeadlineReminders(),
};
