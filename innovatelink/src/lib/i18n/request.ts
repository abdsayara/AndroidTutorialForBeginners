import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { isLocale } from "./config";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = isLocale(requested) ? requested : routing.defaultLocale;
  return {
    locale,
    messages: (await import(`../../../messages/${locale}.json`)).default,
    timeZone: "Asia/Hebron",
    // PRD §9: Latin digits in tables and KPIs; Gregorian dates.
    formats: {
      number: { default: { numberingSystem: "latn" } },
      dateTime: { short: { day: "numeric", month: "short", year: "numeric", numberingSystem: "latn", calendar: "gregory" } },
    },
  };
});
