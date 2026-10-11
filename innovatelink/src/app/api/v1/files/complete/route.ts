import { route, body, requireActor } from "@/lib/api/handler";
import { completeSchema } from "@/modules/files/schema";
import { completeUpload } from "@/modules/files/service";

export const POST = route(async ({ req, actor }) => completeUpload(requireActor(actor), (await body(req, completeSchema)).document_id));
