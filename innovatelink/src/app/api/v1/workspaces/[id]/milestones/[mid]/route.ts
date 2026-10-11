import { route, body, requireActor } from "@/lib/api/handler";
import { milestoneUpdateSchema } from "@/modules/workspaces/schema";
import { deleteMilestone, updateMilestone } from "@/modules/workspaces/service";

type P = { id: string; mid: string };
export const PATCH = route<P>(async ({ req, actor, params }) => updateMilestone(requireActor(actor), params.id, params.mid, await body(req, milestoneUpdateSchema)));
export const DELETE = route<P>(async ({ actor, params }) => { await deleteMilestone(requireActor(actor), params.id, params.mid); });
