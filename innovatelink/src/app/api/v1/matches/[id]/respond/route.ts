import { route, body, requireActor } from "@/lib/api/handler";
import { respondSchema } from "@/modules/matching/schema";
import { respondToMatch } from "@/modules/matching/service";

export const POST = route<{ id: string }>(async ({ req, actor, params, ip }) => respondToMatch(requireActor(actor), params.id, await body(req, respondSchema), ip));
