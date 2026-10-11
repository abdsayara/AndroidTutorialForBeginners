import { route, query, requireActor } from "@/lib/api/handler";
import { suggestedMatches } from "@/modules/matching/service";

export const GET = route(async ({ actor }) => suggestedMatches(requireActor(actor)));
