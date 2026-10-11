import type { Role } from "@prisma/client";
import type { Actor } from "@/modules/auth/policy";

/** In-memory actor for pure policy tests. */
export const A = (role: Role, org_id = "org-1", status: Actor["status"] = "active", id = `u-${role}`): Actor => ({
  id, role, status, org_id, org_type: role.startsWith("company") ? "company" : role.startsWith("platform") ? "platform" : "university",
});
