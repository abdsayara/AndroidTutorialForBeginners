import { route, query, requireActor } from "@/lib/api/handler";
import { z } from "zod";
import { search } from "@/modules/search/service";

const q = z.object({ q: z.string().trim().min(1).max(200), type: z.enum(["challenge", "project"]).optional() });
export const GET = route(async ({ req, actor }) => {
  const p = query(req, q);
  return search(actor, p.q, p.type);
});
