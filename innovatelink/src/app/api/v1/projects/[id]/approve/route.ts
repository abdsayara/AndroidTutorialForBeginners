import { route, body, requireActor } from "@/lib/api/handler";
import { projectApproveSchema } from "@/modules/projects/schema";
import { approveProject } from "@/modules/projects/service";

export const POST = route<{ id: string }>(async ({ req, actor, params, ip }) => approveProject(requireActor(actor), params.id, await body(req, projectApproveSchema), ip));
