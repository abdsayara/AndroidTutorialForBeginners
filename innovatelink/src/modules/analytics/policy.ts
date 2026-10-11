import { isActive, isPlatformStaff, type MaybeActor } from "@/modules/auth/policy";

/** FR-7.4: sector-level stats shown to non-platform users hide groups with < 3 companies. */
export const MIN_COMPANIES = 3;

export function canSeeEcosystem(actor: MaybeActor): boolean {
  return isPlatformStaff(actor);
}

export function canSeeAnalytics(actor: MaybeActor): boolean {
  return isActive(actor);
}

export function suppressSmallGroup(actor: MaybeActor, companyCount: number): boolean {
  return !isPlatformStaff(actor) && companyCount < MIN_COMPANIES;
}
