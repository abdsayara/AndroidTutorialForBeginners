import { route, query, requireActor } from "@/lib/api/handler";
import { myProjects } from "@/modules/projects/service";

export const GET = route(async ({ actor }) => myProjects(requireActor(actor)));
