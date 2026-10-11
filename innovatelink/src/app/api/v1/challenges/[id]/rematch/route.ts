import { route, query, requireActor } from "@/lib/api/handler";
import { rematch } from "@/modules/matching/service";

export const POST = route<{ id: string }>(async ({ actor, params }) => { await rematch(requireActor(actor), params.id); return { queued: true }; });
