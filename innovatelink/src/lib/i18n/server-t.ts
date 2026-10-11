import { createTranslator } from "next-intl";
import ar from "../../../messages/ar.json";
import en from "../../../messages/en.json";
import type { Locale } from "./config";

const MESSAGES = { ar, en } as const;

/** Translator usable outside React (emails, worker, CSV export headers). */
export function serverT(locale: Locale, namespace?: string) {
  return createTranslator({ locale, messages: MESSAGES[locale], namespace: namespace as never });
}
