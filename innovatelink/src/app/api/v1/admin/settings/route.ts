import { route, body, requireActor } from "@/lib/api/handler";
import { settingsSchema } from "@/modules/admin/schema";
import { getSettings, updateSettings } from "@/modules/admin/service";

export const GET = route(async ({ actor }) => getSettings(requireActor(actor)));
export const PUT = route(async ({ req, actor, ip }) => updateSettings(requireActor(actor), await body(req, settingsSchema), ip));
