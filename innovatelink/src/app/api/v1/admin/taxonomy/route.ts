import { route, body, requireActor } from "@/lib/api/handler";
import { taxonomySchema } from "@/modules/admin/schema";
import { listTaxonomy, upsertTaxonomy } from "@/modules/admin/service";

export const GET = route(async () => listTaxonomy());
export const POST = route(async ({ req, actor, ip }) => upsertTaxonomy(requireActor(actor), await body(req, taxonomySchema), ip));
