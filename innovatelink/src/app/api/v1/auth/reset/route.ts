import { route, body, requireActor } from "@/lib/api/handler";
import { resetSchema } from "@/modules/auth/schema";
import { resetPassword } from "@/modules/auth/service";

export const POST = route(async ({ req }) => {
  const { token, password } = await body(req, resetSchema);
  await resetPassword(token, password);
  return { ok: true };
}, { rateLimit: { bucket: "auth", perMinute: 10 } });
