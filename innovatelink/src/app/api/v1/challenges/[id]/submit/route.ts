import { route, query, requireActor } from "@/lib/api/handler";
import { submitChallenge } from "@/modules/challenges/service";

export const POST = route<{ id: string }>(async ({ actor, params, ip }) => submitChallenge(requireActor(actor), params.id, ip));
