import { route, body, requireActor } from "@/lib/api/handler";
import { userUpdateSchema } from "@/modules/admin/schema";
import { updateUser } from "@/modules/admin/service";

export const PATCH = route<{ id: string }>(async ({ req, actor, params, ip }) => updateUser(requireActor(actor), params.id, await body(req, userUpdateSchema), ip));
