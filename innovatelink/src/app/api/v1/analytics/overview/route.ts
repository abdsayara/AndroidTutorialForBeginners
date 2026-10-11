import { route, query, requireActor } from "@/lib/api/handler";
import { analyticsFilterSchema, overview } from "@/modules/analytics/service";

export const GET = route(async ({ req, actor }) => overview(requireActor(actor), query(req, analyticsFilterSchema)));
