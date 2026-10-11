import { route, query, requireActor } from "@/lib/api/handler";
import { auditListSchema } from "@/modules/admin/schema";
import { listAudit } from "@/modules/admin/service";

export const GET = route(async ({ req, actor }) => listAudit(requireActor(actor), query(req, auditListSchema)));
