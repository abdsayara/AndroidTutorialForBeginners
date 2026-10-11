import { route, body, requireActor } from "@/lib/api/handler";
import { manualMatchSchema } from "@/modules/matching/schema";
import { addManualMatch, listChallengeMatches } from "@/modules/matching/service";

type P = { id: string };
export const GET = route<P>(async ({ actor, params }) => listChallengeMatches(requireActor(actor), params.id));
export const POST = route<P>(async ({ req, actor, params }) => addManualMatch(requireActor(actor), params.id, await body(req, manualMatchSchema)));
