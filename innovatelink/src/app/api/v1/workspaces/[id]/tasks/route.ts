import { route, body, requireActor } from "@/lib/api/handler";
type P = { id: string };
import { taskSchema } from "@/modules/workspaces/schema";
import { createTask } from "@/modules/workspaces/service";

export const POST = route<P>(async ({ req, actor, params }) => createTask(requireActor(actor), params.id, await body(req, taskSchema)));
