import { route } from "@/lib/api/handler";
import { currentNda } from "@/modules/access/service";

export const GET = route(async () => currentNda());
