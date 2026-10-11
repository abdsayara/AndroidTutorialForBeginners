import { route, body, requireActor } from "@/lib/api/handler";
import { projectIpSchema } from "@/modules/commercialization/schema";
import { getProjectIp, putProjectIp } from "@/modules/commercialization/service";

type P = { id: string };
export const GET = route<P>(async ({ actor, params }) => getProjectIp(requireActor(actor), params.id));
export const PUT = route<P>(async ({ req, actor, params, ip }) => putProjectIp(requireActor(actor), params.id, await body(req, projectIpSchema), ip));
