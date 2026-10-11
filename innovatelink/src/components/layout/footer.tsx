import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("footer");
  return (
    <footer className="mt-12 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <span>{t("owner")}</span>
        <span>{t("scope")}</span>
      </div>
    </footer>
  );
}
