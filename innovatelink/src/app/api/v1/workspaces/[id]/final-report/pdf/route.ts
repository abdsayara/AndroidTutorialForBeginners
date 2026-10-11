import { route, query, requireActor } from "@/lib/api/handler";
type P = { id: string };
import { getFinalReport } from "@/modules/workspaces/service";
import { finalReportHtml } from "@/modules/workspaces/report";
import { htmlToPdf } from "@/lib/pdf";

export const runtime = "nodejs";
export const GET = route<P>(async ({ req, actor, params }) => {
  const locale = req.nextUrl.searchParams.get("locale") === "en" ? "en" : "ar";
  const data = await getFinalReport(requireActor(actor), params.id);
  const pdf = await htmlToPdf(finalReportHtml(data, locale));
  return new Response(Buffer.from(pdf), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="final-report-${params.id}.pdf"` },
  });
});
