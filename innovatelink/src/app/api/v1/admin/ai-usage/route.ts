import { route, query, requireActor } from "@/lib/api/handler";
import { aiUsage } from "@/modules/admin/service";

export const GET = route(async ({ actor }) => aiUsage(requireActor(actor)));
