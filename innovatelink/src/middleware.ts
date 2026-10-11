import createMiddleware from "next-intl/middleware";
import { routing } from "@/lib/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Everything except API, Next internals and static files.
  matcher: ["/((?!api|_next|_vercel|fonts|.*\\..*).*)"],
};
