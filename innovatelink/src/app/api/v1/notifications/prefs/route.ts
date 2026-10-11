import { route, body, requireActor } from "@/lib/api/handler";
import { z } from "zod";
import { NOTIFICATION_TYPES, updateEmailPrefs } from "@/modules/notifications/service";

const prefs = z.record(z.enum(NOTIFICATION_TYPES), z.boolean());
export const PUT = route(async ({ req, actor }) => updateEmailPrefs(requireActor(actor), await body(req, prefs)));
