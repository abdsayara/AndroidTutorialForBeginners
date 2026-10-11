import { route, body, requireActor } from "@/lib/api/handler";
import { contactCreateSchema } from "@/modules/contact/schema";
import { createContactRequest, listContactRequests } from "@/modules/contact/service";

export const GET = route(async ({ actor }) => listContactRequests(requireActor(actor)));
export const POST = route(async ({ req, actor }) => createContactRequest(requireActor(actor), await body(req, contactCreateSchema)));
