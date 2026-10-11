import { route, body, requireActor } from "@/lib/api/handler";
import { contactRespondSchema } from "@/modules/contact/schema";
import { respondContactRequest } from "@/modules/contact/service";

export const POST = route<{ id: string }>(async ({ req, actor, params }) => respondContactRequest(requireActor(actor), params.id, (await body(req, contactRespondSchema)).decision));
