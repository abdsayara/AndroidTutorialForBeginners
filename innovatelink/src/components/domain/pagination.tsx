import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";

export async function Pagination({ page, limit, total, basePath, params }: { page: number; limit: number; total: number; basePath: string; params: Record<string, string | undefined> }) {
  const t = await getTranslations("common");
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams(Object.entries({ ...params, page: String(p) }).filter(([, v]) => v) as [string, string][]);
    return `${basePath}?${sp.toString()}`;
  };
  return (
    <nav aria-label={t("pagination")} className="mt-6 flex items-center justify-center gap-3 text-sm">
      {page > 1 && <Link href={href(page - 1)} className="rounded-md border border-border px-3 py-1.5 hover:bg-muted">{t("previous")}</Link>}
      <span className="num text-muted-foreground">{t("page_of", { page, pages })}</span>
      {page < pages && <Link href={href(page + 1)} className="rounded-md border border-border px-3 py-1.5 hover:bg-muted">{t("next")}</Link>}
    </nav>
  );
}
