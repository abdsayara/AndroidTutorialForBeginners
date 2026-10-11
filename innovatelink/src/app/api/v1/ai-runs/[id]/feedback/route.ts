import { route, body, requireActor } from "@/lib/api/handler";
import { recordFeedback } from "@/lib/ai";
import { feedbackSchema } from "@/modules/matching/schema";
import { db } from "@/lib/db";
import { notFound } from "@/lib/api/errors";

/** §7.4 "report an error" on any AI output the user received. */
export const POST = route<{ id: string }>(async ({ req, actor, params }) => {
  const a = requireActor(actor);
  const run = await db.aiRun.findUnique({ where: { id: params.id } });
  if (!run || (run.user_id && run.user_id !== a.id)) throw notFound();
  await recordFeedback(params.id, a.id, await body(req, feedbackSchema));
  return { ok: true };
});
