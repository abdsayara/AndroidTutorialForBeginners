import { route, query, requireActor } from "@/lib/api/handler";
import { closeChallenge } from "@/modules/challenges/service";

export const POST = route<{ id: string }>(async ({ actor, params, ip }) => closeChallenge(requireActor(actor), params.id, ip));
