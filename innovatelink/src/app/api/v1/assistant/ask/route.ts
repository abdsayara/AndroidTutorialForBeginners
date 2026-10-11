import { route, body, requireActor } from "@/lib/api/handler";
import { askInput } from "@/modules/assistant/schema";
import { ask } from "@/modules/assistant/service";

export const POST = route(async ({ req, actor }) => {
  const a = requireActor(actor);
  const locale = req.headers.get("accept-language")?.startsWith("en") ? "en" : "ar";
  return ask(a, await body(req, askInput), locale);
}, { rateLimit: { bucket: "assistant", perMinute: 20 } });
