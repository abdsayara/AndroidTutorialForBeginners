import { route, body, requireActor } from "@/lib/api/handler";
type P = { id: string };
import { progressSchema } from "@/modules/workspaces/schema";
import { createUpdate, listUpdates } from "@/modules/workspaces/service";

export const GET = route<P>(async ({ actor, params }) => listUpdates(requireActor(actor), params.id));
export const POST = route<P>(async ({ req, actor, params }) => createUpdate(requireActor(actor), params.id, await body(req, progressSchema)));
