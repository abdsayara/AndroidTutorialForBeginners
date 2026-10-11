import { route, body, requireActor } from "@/lib/api/handler";
import { registerSchema } from "@/modules/auth/schema";
import { register } from "@/modules/auth/service";

const RL = { bucket: "auth", perMinute: 10 };
export const POST = route(async ({ req }) => {
  const { user } = await register(await body(req, registerSchema));
  return Response.json({ user }, { status: 201 });
}, { rateLimit: RL });
