import { route, body, requireActor } from "@/lib/api/handler";
type P = { id: string };
import { closeSchema } from "@/modules/workspaces/schema";
import { closeWorkspace } from "@/modules/workspaces/service";

export const POST = route<P>(async ({ req, actor, params, ip }) => closeWorkspace(requireActor(actor), params.id, await body(req, closeSchema), ip));
