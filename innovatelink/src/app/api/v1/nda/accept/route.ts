import { route, body, requireActor } from "@/lib/api/handler";
import { ndaAcceptSchema } from "@/modules/access/schema";
import { acceptNda } from "@/modules/access/service";

export const POST = route(async ({ req, actor, ip }) => {
  const b = await body(req, ndaAcceptSchema);
  return acceptNda(requireActor(actor), b.access_request_id, b.nda_version, ip);
});
