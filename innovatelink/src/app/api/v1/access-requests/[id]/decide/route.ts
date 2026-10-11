import { route, body, requireActor } from "@/lib/api/handler";
import { accessDecisionSchema } from "@/modules/access/schema";
import { decideAccess } from "@/modules/access/service";

export const POST = route<{ id: string }>(async ({ req, actor, params, ip }) => decideAccess(requireActor(actor), params.id, (await body(req, accessDecisionSchema)).decision, ip));
