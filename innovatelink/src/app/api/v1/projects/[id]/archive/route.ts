import { route, query, requireActor } from "@/lib/api/handler";
import { archiveProject } from "@/modules/projects/service";

export const POST = route<{ id: string }>(async ({ actor, params, ip }) => archiveProject(requireActor(actor), params.id, ip));
