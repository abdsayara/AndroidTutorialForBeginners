import { route, query, requireActor } from "@/lib/api/handler";
import { submittedChallenges } from "@/modules/challenges/service";

export const GET = route(async ({ actor }) => submittedChallenges(requireActor(actor)));
