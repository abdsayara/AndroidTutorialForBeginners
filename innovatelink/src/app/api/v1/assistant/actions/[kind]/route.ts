import { route, body, requireActor } from "@/lib/api/handler";
import { z } from "zod";
import { ACTION_KINDS, actionInput } from "@/modules/assistant/schema";
import { runAction } from "@/modules/assistant/service";

export const POST = route<{ kind: string }>(async ({ req, actor, params }) => {
  const kind = z.enum(ACTION_KINDS).parse(params.kind);
  return runAction(requireActor(actor), kind, (await body(req, actionInput)).challenge_id);
}, { rateLimit: { bucket: "assistant", perMinute: 20 } });
