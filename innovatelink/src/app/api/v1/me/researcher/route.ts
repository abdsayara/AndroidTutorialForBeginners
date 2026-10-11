import { route, body, requireActor } from "@/lib/api/handler";
import { researcherProfileSchema } from "@/modules/auth/schema";
import { updateResearcherProfile } from "@/modules/auth/service";

export const PUT = route(async ({ req, actor }) => updateResearcherProfile(requireActor(actor), await body(req, researcherProfileSchema)));
