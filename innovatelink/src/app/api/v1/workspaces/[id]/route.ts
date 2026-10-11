import { route, body, requireActor } from "@/lib/api/handler";
type P = { id: string };
import { updateWorkspaceSchema } from "@/modules/workspaces/schema";
import { getWorkspace, updateWorkspace } from "@/modules/workspaces/service";

export const GET = route<P>(async ({ actor, params }) => getWorkspace(requireActor(actor), params.id));
export const PATCH = route<P>(async ({ req, actor, params }) => updateWorkspace(requireActor(actor), params.id, await body(req, updateWorkspaceSchema)));
