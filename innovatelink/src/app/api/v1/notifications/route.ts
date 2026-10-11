import { route, body, query, requireActor } from "@/lib/api/handler";
import { z } from "zod";
import { pageSchema } from "@/lib/api/pagination";
import { listNotifications, markRead } from "@/modules/notifications/service";

export const GET = route(async ({ req, actor }) => listNotifications(requireActor(actor), query(req, pageSchema)));
const readSchema = z.object({ ids: z.union([z.literal("all"), z.array(z.string().uuid()).max(200)]) });
export const POST = route(async ({ req, actor }) => { await markRead(requireActor(actor), (await body(req, readSchema)).ids); return { ok: true }; });
