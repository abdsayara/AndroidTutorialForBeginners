import { route, body, requireActor } from "@/lib/api/handler";
import { challengeUpdateSchema } from "@/modules/challenges/schema";
import { deleteChallenge, getChallenge, updateChallenge } from "@/modules/challenges/service";

type P = { id: string };
export const GET = route<P>(async ({ actor, params }) => getChallenge(actor, params.id));
export const PATCH = route<P>(async ({ req, actor, params }) => updateChallenge(requireActor(actor), params.id, await body(req, challengeUpdateSchema)));
export const DELETE = route<P>(async ({ actor, params }) => { await deleteChallenge(requireActor(actor), params.id); });
