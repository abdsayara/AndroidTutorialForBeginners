import { route, body, requireActor } from "@/lib/api/handler";
import { openCaseSchema } from "@/modules/commercialization/schema";
import { kanban, openCase } from "@/modules/commercialization/service";

export const GET = route(async ({ actor }) => kanban(requireActor(actor)));
export const POST = route(async ({ req, actor, ip }) => openCase(requireActor(actor), await body(req, openCaseSchema), ip));
