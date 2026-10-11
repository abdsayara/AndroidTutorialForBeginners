import { route, query, requireActor } from "@/lib/api/handler";
import { z } from "zod";
import { listDocuments } from "@/modules/files/service";
import { OWNER_TYPES } from "@/modules/files/schema";

const q = z.object({ owner_type: z.enum(OWNER_TYPES), owner_id: z.string().uuid() });
export const GET = route(async ({ req, actor }) => {
  const p = query(req, q);
  return listDocuments(requireActor(actor), p.owner_type, p.owner_id);
});
