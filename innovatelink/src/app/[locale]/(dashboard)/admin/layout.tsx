import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";
import { requireActive } from "@/lib/auth/guards";

const TABS = ["users", "orgs", "taxonomy", "settings", "audit", "ai"] as const;

export default async function AdminLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireActive(locale, ["platform_admin"]);
  const t = await getTranslations("admin");
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <nav aria-label={t("title")} className="flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((k) => <Link key={k} href={`/admin/${k}`} className="whitespace-nowrap rounded-t-md px-3 py-2 text-sm hover:bg-muted">{t(`tab_${k}`)}</Link>)}
      </nav>
      {children}
    </div>
  );
}
