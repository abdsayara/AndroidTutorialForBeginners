import { route, query, requireActor } from "@/lib/api/handler";
import { exportMyData } from "@/modules/auth/service";

export const GET = route(async ({ actor }) => {
  const data = await exportMyData(requireActor(actor));
  return new Response(JSON.stringify(data, null, 2), {
    headers: { "Content-Type": "application/json", "Content-Disposition": 'attachment; filename="my-data.json"' },
  });
});
