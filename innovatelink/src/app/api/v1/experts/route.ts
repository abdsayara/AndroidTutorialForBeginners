import { route, query } from "@/lib/api/handler";
import { directorySchema, listExperts } from "@/modules/projects/directory";

export const GET = route(async ({ req, actor }) => listExperts(actor, query(req, directorySchema)));
