import { route, body, requireActor } from "@/lib/api/handler";
type P = { id: string };
import { milestoneSchema } from "@/modules/workspaces/schema";
import { createMilestone, listMilestones } from "@/modules/workspaces/service";

export const GET = route<P>(async ({ actor, params }) => listMilestones(requireActor(actor), params.id));
export const POST = route<P>(async ({ req, actor, params }) => createMilestone(requireActor(actor), params.id, await body(req, milestoneSchema)));
