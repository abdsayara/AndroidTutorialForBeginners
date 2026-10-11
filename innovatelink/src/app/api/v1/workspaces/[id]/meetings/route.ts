import { route, body, requireActor } from "@/lib/api/handler";
type P = { id: string };
import { meetingSchema } from "@/modules/workspaces/schema";
import { createMeeting, listMeetings } from "@/modules/workspaces/service";

export const GET = route<P>(async ({ actor, params }) => listMeetings(requireActor(actor), params.id));
export const POST = route<P>(async ({ req, actor, params }) => createMeeting(requireActor(actor), params.id, await body(req, meetingSchema)));
