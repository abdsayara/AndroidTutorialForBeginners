import { route, body, requireActor } from "@/lib/api/handler";
import { feedbackSchema } from "@/modules/matching/schema";
import { matchFeedback } from "@/modules/matching/service";

export const POST = route<{ id: string }>(async ({ req, actor, params }) => { await matchFeedback(requireActor(actor), params.id, await body(req, feedbackSchema)); return { ok: true }; });
