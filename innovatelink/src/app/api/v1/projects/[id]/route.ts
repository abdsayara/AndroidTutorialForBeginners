import { route, body, requireActor } from "@/lib/api/handler";
import { projectUpdateSchema } from "@/modules/projects/schema";
import { deleteProject, getProject, updateProject } from "@/modules/projects/service";

type P = { id: string };
export const GET = route<P>(async ({ actor, params }) => getProject(actor, params.id));
export const PATCH = route<P>(async ({ req, actor, params, ip }) => updateProject(requireActor(actor), params.id, await body(req, projectUpdateSchema), ip));
export const DELETE = route<P>(async ({ actor, params }) => { await deleteProject(requireActor(actor), params.id); });
