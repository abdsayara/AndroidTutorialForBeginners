import { route, query, requireActor } from "@/lib/api/handler";
import { analyticsFilterSchema, exportCsv } from "@/modules/analytics/service";

export const GET = route(async ({ req, actor }) => {
  const csv = await exportCsv(requireActor(actor), query(req, analyticsFilterSchema));
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="analytics.csv"' } });
});
