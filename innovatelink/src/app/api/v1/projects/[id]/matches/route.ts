import { route, query, requireActor } from "@/lib/api/handler";
import { listAcademicMatches } from "@/modules/matching/service";

export const GET = route<{ id: string }>(async ({ actor, params }) => listAcademicMatches(requireActor(actor), params.id));
