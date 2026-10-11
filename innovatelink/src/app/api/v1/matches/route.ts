import { route, query, requireActor } from "@/lib/api/handler";
import { listAcademicMatches } from "@/modules/matching/service";

export const GET = route(async ({ actor }) => listAcademicMatches(requireActor(actor)));
