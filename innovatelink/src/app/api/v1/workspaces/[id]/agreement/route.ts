import { route, body, requireActor } from "@/lib/api/handler";
type P = { id: string };
import { agreementSchema } from "@/modules/workspaces/schema";
import { setAgreement } from "@/modules/workspaces/service";

export const PUT = route<P>(async ({ req, actor, params, ip }) => setAgreement(requireActor(actor), params.id, (await body(req, agreementSchema)).document_id, ip));
