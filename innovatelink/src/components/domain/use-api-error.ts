"use client";
import { useTranslations } from "next-intl";
import { ApiError } from "@/lib/api/client";

/** Maps API error codes/messages to translated text (errors.*). */
export function useErrorText() {
  const t = useTranslations("errors");
  return (e: unknown): string => {
    if (e instanceof ApiError) {
      if (t.has(e.message)) return t(e.message);
      if (t.has(e.code)) return t(e.code);
    }
    return t("generic");
  };
}
