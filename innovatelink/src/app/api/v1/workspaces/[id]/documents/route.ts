import { route, query, requireActor } from "@/lib/api/handler";
type P = { id: string };
import { listDocuments } from "@/modules/files/service";

export const GET = route<P>(async ({ actor, params }) => listDocuments(requireActor(actor), "workspace", params.id));
