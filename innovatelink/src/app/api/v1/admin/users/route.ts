import { route, query, requireActor } from "@/lib/api/handler";
import { userListSchema } from "@/modules/admin/schema";
import { listUsers } from "@/modules/admin/service";

export const GET = route(async ({ req, actor }) => listUsers(requireActor(actor), query(req, userListSchema)));
