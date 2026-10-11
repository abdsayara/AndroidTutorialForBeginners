import { route, body, requireActor } from "@/lib/api/handler";
import { updateCaseSchema } from "@/modules/commercialization/schema";
import { updateCase } from "@/modules/commercialization/service";

export const PATCH = route<{ id: string }>(async ({ req, actor, params, ip }) => updateCase(requireActor(actor), params.id, await body(req, updateCaseSchema), ip));
