import { route, body, requireActor } from "@/lib/api/handler";
import { createWorkspaceSchema } from "@/modules/workspaces/schema";
import { createWorkspace, myWorkspaces } from "@/modules/workspaces/service";

export const GET = route(async ({ actor }) => myWorkspaces(requireActor(actor)));
export const POST = route(async ({ req, actor, ip }) => {
  const w = await createWorkspace(requireActor(actor), (await body(req, createWorkspaceSchema)).match_id, ip);
  return Response.json(w, { status: 201 });
});
