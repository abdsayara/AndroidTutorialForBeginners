import { route, query, requireActor } from "@/lib/api/handler";
import { myChallengesSchema } from "@/modules/challenges/schema";
import { myChallenges } from "@/modules/challenges/service";

export const GET = route(async ({ req, actor }) => myChallenges(requireActor(actor), query(req, myChallengesSchema).status));
