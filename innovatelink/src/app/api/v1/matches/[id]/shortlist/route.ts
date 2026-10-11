import { route, body, requireActor } from "@/lib/api/handler";
import { shortlistSchema } from "@/modules/matching/schema";
import { reviewMatch } from "@/modules/matching/service";

export const POST = route<{ id: string }>(async ({ req, actor, params, ip }) => reviewMatch(requireActor(actor), params.id, await body(req, shortlistSchema), ip));
