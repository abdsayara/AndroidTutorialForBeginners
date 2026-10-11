import { route, body, requireActor } from "@/lib/api/handler";
import { taskUpdateSchema } from "@/modules/workspaces/schema";
import { deleteTask, updateTask } from "@/modules/workspaces/service";

type P = { id: string; tid: string };
export const PATCH = route<P>(async ({ req, actor, params }) => updateTask(requireActor(actor), params.id, params.tid, await body(req, taskUpdateSchema)));
export const DELETE = route<P>(async ({ actor, params }) => { await deleteTask(requireActor(actor), params.id, params.tid); });
