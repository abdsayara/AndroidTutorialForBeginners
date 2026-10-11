import { route, query, requireActor } from "@/lib/api/handler";
import { listClusters } from "@/modules/matching/service";

export const GET = route(async ({ actor }) => listClusters(requireActor(actor)));
