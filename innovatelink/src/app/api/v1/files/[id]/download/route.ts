import { route, query, requireActor } from "@/lib/api/handler";
import { downloadUrl } from "@/modules/files/service";

/** Returns a 5-minute signed URL; `?redirect=1` redirects to it. */
export const GET = route<{ id: string }>(async ({ req, actor, params, ip }) => {
  const r = await downloadUrl(requireActor(actor), params.id, ip);
  if (req.nextUrl.searchParams.get("redirect") === "1") return Response.redirect(r.url, 302);
  return r;
});
