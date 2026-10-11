import { route, body, query, requireActor } from "@/lib/api/handler";
import { challengeDraftSchema, challengeListSchema } from "@/modules/challenges/schema";
import { createChallenge } from "@/modules/challenges/service";
import { searchChallenges } from "@/modules/search/service";

export const GET = route(async ({ req, actor }) => searchChallenges(actor, query(req, challengeListSchema)));
export const POST = route(async ({ req, actor }) => {
  const c = await createChallenge(requireActor(actor), await body(req, challengeDraftSchema));
  return Response.json(c, { status: 201 });
});
