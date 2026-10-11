import { route, body, query, requireActor } from "@/lib/api/handler";
import { orgCreateSchema, orgListSchema } from "@/modules/orgs/schema";
import { createOrg, listOrgs } from "@/modules/orgs/service";

export const GET = route(async ({ req, actor }) => listOrgs(actor, query(req, orgListSchema)));
export const POST = route(async ({ req, actor }) => createOrg(requireActor(actor), await body(req, orgCreateSchema)));
