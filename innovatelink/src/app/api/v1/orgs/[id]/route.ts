import { route, body, requireActor } from "@/lib/api/handler";
import { orgUpdateSchema } from "@/modules/orgs/schema";
import { getOrg, updateOrg } from "@/modules/orgs/service";

type P = { id: string };
export const GET = route<P>(async ({ actor, params }) => getOrg(actor, params.id));
export const PATCH = route<P>(async ({ req, actor, params }) => updateOrg(requireActor(actor), params.id, await body(req, orgUpdateSchema)));
