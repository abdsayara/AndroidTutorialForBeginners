import { route, query, requireActor } from "@/lib/api/handler";
import { approveUser } from "@/modules/auth/service";

export const POST = route<{ id: string }>(async ({ actor, params, ip }) => approveUser(requireActor(actor), params.id, ip));
