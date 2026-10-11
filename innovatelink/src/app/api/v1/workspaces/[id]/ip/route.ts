import { route, body, requireActor } from "@/lib/api/handler";
type P = { id: string };
import { ipRecordSchema } from "@/modules/workspaces/schema";
import { upsertWorkspaceIp } from "@/modules/workspaces/service";

export const PUT = route<P>(async ({ req, actor, params, ip }) => upsertWorkspaceIp(requireActor(actor), params.id, await body(req, ipRecordSchema), ip));
