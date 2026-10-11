import { route, body, requireActor } from "@/lib/api/handler";
import { reviewSchema } from "@/modules/challenges/schema";
import { reviewChallenge } from "@/modules/challenges/service";

export const POST = route<{ id: string }>(async ({ req, actor, params, ip }) => reviewChallenge(requireActor(actor), params.id, await body(req, reviewSchema), ip));
