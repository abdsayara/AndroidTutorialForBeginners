import { route, query, requireActor } from "@/lib/api/handler";
import { listMembers } from "@/modules/orgs/service";

export const GET = route<{ id: string }>(async ({ actor, params }) => listMembers(requireActor(actor), params.id));
