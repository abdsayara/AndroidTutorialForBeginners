import { route, body, requireActor } from "@/lib/api/handler";
type P = { id: string };
import { finalReportSchema } from "@/modules/workspaces/schema";
import { getFinalReport, saveFinalReport } from "@/modules/workspaces/service";

export const GET = route<P>(async ({ actor, params }) => (await getFinalReport(requireActor(actor), params.id)).report);
export const PUT = route<P>(async ({ req, actor, params }) => saveFinalReport(requireActor(actor), params.id, await body(req, finalReportSchema)));
