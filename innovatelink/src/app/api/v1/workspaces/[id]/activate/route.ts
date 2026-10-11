import { route, query, requireActor } from "@/lib/api/handler";
type P = { id: string };
import { activateWorkspace } from "@/modules/workspaces/service";

export const POST = route<P>(async ({ actor, params, ip }) => activateWorkspace(requireActor(actor), params.id, ip));
