import { route, body, requireActor } from "@/lib/api/handler";
import { visibilitySchema } from "@/modules/challenges/schema";
import { changeVisibility } from "@/modules/challenges/service";

export const PUT = route<{ id: string }>(async ({ req, actor, params, ip }) => changeVisibility(requireActor(actor), params.id, await body(req, visibilitySchema), ip));
