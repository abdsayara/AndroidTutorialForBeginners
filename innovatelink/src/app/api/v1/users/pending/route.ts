import { route, query, requireActor } from "@/lib/api/handler";
import { pendingUsersFor } from "@/modules/auth/service";

export const GET = route(async ({ actor }) => pendingUsersFor(requireActor(actor)));
