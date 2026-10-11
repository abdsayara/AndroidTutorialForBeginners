import { route, body, requireActor } from "@/lib/api/handler";
type P = { id: string };
import { courseLinkSchema } from "@/modules/workspaces/schema";
import { linkCourse } from "@/modules/workspaces/service";

export const PUT = route<P>(async ({ req, actor, params }) => linkCourse(requireActor(actor), params.id, await body(req, courseLinkSchema)));
