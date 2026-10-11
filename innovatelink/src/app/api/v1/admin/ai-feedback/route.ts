import { route, query, requireActor } from "@/lib/api/handler";
import { aiFeedback } from "@/modules/admin/service";

export const GET = route(async ({ actor }) => aiFeedback(requireActor(actor)));
