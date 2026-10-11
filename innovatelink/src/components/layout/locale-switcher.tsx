"use client";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/lib/i18n/routing";
import { useSearchParams } from "next/navigation";

export function LocaleSwitcher({ current }: { current: string }) {
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const next = current === "ar" ? "en" : "ar";
  return (
    <button
      type="button"
      className="rounded-md px-2 py-2 text-sm hover:bg-muted"
      onClick={() => router.replace(`${pathname}${sp.size ? `?${sp.toString()}` : ""}`, { locale: next })}
      lang={next}
    >
      {t("switch_locale")}
    </button>
  );
}
