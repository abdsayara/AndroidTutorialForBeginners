import { route, body, query, requireActor } from "@/lib/api/handler";
import { projectDraftSchema, projectListSchema } from "@/modules/projects/schema";
import { createProject } from "@/modules/projects/service";
import { searchProjects } from "@/modules/search/service";

export const GET = route(async ({ req, actor }) => searchProjects(actor, query(req, projectListSchema)));
export const POST = route(async ({ req, actor }) => {
  const p = await createProject(requireActor(actor), await body(req, projectDraftSchema));
  return Response.json(p, { status: 201 });
});
