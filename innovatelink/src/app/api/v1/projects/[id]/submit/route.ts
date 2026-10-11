import { route, query, requireActor } from "@/lib/api/handler";
import { submitProject } from "@/modules/projects/service";

export const POST = route<{ id: string }>(async ({ actor, params, ip }) => submitProject(requireActor(actor), params.id, ip));
