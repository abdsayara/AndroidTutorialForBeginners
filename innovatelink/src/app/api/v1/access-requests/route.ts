import { route, body, requireActor } from "@/lib/api/handler";
import { accessRequestSchema } from "@/modules/access/schema";
import { listIncomingAccessRequests, myAccessRequests, requestAccess } from "@/modules/access/service";

export const GET = route(async ({ actor }) => {
  const a = requireActor(actor);
  return { incoming: await listIncomingAccessRequests(a), mine: await myAccessRequests(a) };
});
export const POST = route(async ({ req, actor }) => requestAccess(requireActor(actor), await body(req, accessRequestSchema)));
