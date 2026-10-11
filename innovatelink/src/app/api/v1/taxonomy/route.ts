import { route } from "@/lib/api/handler";
import { listTaxonomy } from "@/modules/admin/service";

export const GET = route(async () => listTaxonomy());
