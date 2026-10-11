import { route, query, requireActor } from "@/lib/api/handler";
import { diagnoseChallenge } from "@/modules/challenges/diagnosis";

export const POST = route<{ id: string }>(async ({ actor, params }) => diagnoseChallenge(requireActor(actor), params.id), { rateLimit: { bucket: "ai", perMinute: 10 } });
