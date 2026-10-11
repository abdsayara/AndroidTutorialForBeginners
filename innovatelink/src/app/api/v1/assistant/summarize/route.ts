import { route, body, requireActor } from "@/lib/api/handler";
import { summarizeInput } from "@/modules/assistant/schema";
import { summarizeDocument } from "@/modules/assistant/service";

export const POST = route(async ({ req, actor }) => summarizeDocument(requireActor(actor), (await body(req, summarizeInput)).document_id), { rateLimit: { bucket: "assistant", perMinute: 20 } });
