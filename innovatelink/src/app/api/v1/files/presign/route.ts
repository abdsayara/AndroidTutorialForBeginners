import { route, body, requireActor } from "@/lib/api/handler";
import { presignSchema } from "@/modules/files/schema";
import { presignUploadFor } from "@/modules/files/service";

export const POST = route(async ({ req, actor }) => presignUploadFor(requireActor(actor), await body(req, presignSchema)));
