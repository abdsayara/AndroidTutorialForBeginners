import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Gregorian dates with Latin digits (PRD §9). */
export function formatDate(d: Date | string | null | undefined, locale: string): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-u-nu-latn-ca-gregory" : "en-GB", { dateStyle: "medium" }).format(new Date(d));
}

export function formatNumber(n: number | null | undefined, locale: string): string {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat(locale === "ar" ? "ar-u-nu-latn" : "en", { maximumFractionDigits: 2 }).format(n);
}
