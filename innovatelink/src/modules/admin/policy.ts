import { isPlatformAdmin, isPlatformStaff, type MaybeActor } from "@/modules/auth/policy";

/** /admin/* is platform_admin only (§8). */
export function canAdminister(actor: MaybeActor): boolean {
  return isPlatformAdmin(actor);
}

/** §7.4: coordinators review AI error reports. */
export function canReviewAiFeedback(actor: MaybeActor): boolean {
  return isPlatformStaff(actor);
}
