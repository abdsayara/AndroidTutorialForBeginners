import { route, query } from "@/lib/api/handler";
import { directorySchema, listLabs } from "@/modules/projects/directory";

export const GET = route(async ({ req, actor }) => listLabs(actor, query(req, directorySchema)));
