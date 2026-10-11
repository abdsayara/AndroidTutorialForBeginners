import { route, body, requireActor } from "@/lib/api/handler";
type P = { id: string };
import { memberSchema } from "@/modules/workspaces/schema";
import { addMember, getWorkspace, removeMember } from "@/modules/workspaces/service";
import { AppError } from "@/lib/api/errors";

export const GET = route<P>(async ({ actor, params }) => (await getWorkspace(requireActor(actor), params.id)).members);
export const POST = route<P>(async ({ req, actor, params }) => addMember(requireActor(actor), params.id, await body(req, memberSchema)));
export const DELETE = route<P>(async ({ req, actor, params }) => {
  const userId = req.nextUrl.searchParams.get("user_id");
  if (!userId) throw new AppError("bad_request", "user_id_required");
  await removeMember(requireActor(actor), params.id, userId);
});
