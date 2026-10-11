import { route, body, requireActor } from "@/lib/api/handler";
import { tokenSchema } from "@/modules/auth/schema";
import { verifyEmail } from "@/modules/auth/service";

export const POST = route(async ({ req }) => {
  await verifyEmail((await body(req, tokenSchema)).token);
  return { ok: true };
}, { rateLimit: { bucket: "auth", perMinute: 10 } });
