import { route, query, requireActor } from "@/lib/api/handler";
import { pendingProjects } from "@/modules/projects/service";

export const GET = route(async ({ actor }) => pendingProjects(requireActor(actor)));
