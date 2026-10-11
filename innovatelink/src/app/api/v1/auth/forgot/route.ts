import { route, body, requireActor } from "@/lib/api/handler";
import { forgotSchema } from "@/modules/auth/schema";
import { forgotPassword } from "@/modules/auth/service";

export const POST = route(async ({ req }) => {
  await forgotPassword((await body(req, forgotSchema)).email);
  return { ok: true };
}, { rateLimit: { bucket: "auth", perMinute: Number(process.env.AUTH_RATE_LIMIT_PER_MIN ?? 5) } });
