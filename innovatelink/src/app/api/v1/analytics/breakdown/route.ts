import { route, query, requireActor } from "@/lib/api/handler";
import { analyticsFilterSchema, breakdown } from "@/modules/analytics/service";

export const GET = route(async ({ req, actor }) => breakdown(requireActor(actor), query(req, analyticsFilterSchema)));
