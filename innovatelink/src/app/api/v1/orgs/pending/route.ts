import { route, query, requireActor } from "@/lib/api/handler";
import { pendingOrgs } from "@/modules/orgs/service";

export const GET = route(async ({ actor }) => pendingOrgs(requireActor(actor)));
