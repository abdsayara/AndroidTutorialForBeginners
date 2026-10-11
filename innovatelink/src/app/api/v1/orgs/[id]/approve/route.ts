import { route, query, requireActor } from "@/lib/api/handler";
import { approveOrg } from "@/modules/orgs/service";

export const POST = route<{ id: string }>(async ({ actor, params, ip }) => approveOrg(requireActor(actor), params.id, ip));
