import { route, query, requireActor } from "@/lib/api/handler";
import { reindex } from "@/modules/admin/service";

export const POST = route(async ({ actor }) => reindex(requireActor(actor)));
