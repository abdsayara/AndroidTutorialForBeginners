import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";
import { requireUser } from "@/lib/auth/guards";
import { formatDate } from "@/lib/utils";
import { Empty, PageHeader } from "@/components/ui";
import { ActionButton } from "@/components/domain/action-button";
import { Pagination } from "@/components/domain/pagination";
import { listNotifications } from "@/modules/notifications/service";
import { pageSchema } from "@/lib/api/pagination";

export const dynamic = "force-dynamic";

export default async function Notifications({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string>> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const actor = await requireUser(locale);
  const p = pageSchema.safeParse(await searchParams).data ?? pageSchema.parse({});
  const t = await getTranslations("notifications");
  const loc = await getLocale();
  const res = await listNotifications(actor, p);
  return (
    <div>
      <PageHeader title={t("page_title")} actions={res.unread > 0 ? <ActionButton path="/notifications" json={{ ids: "all" }} variant="outline" size="sm">{t("mark_all_read")}</ActionButton> : undefined} />
      {res.items.length === 0 ? <Empty>{t("empty")}</Empty> : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {res.items.map((n) => {
            const pl = n.payload as { subject?: string; status?: string; url?: string };
            const vars = { subject: pl.subject ?? "", status: pl.status ? t(`statuses.${pl.status}`) : "" };
            return (
              <li key={n.id} className={`p-3 ${n.read_at ? "" : "bg-primary/5"}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium">{pl.url ? <Link href={pl.url} className="hover:underline">{t(`types.${n.type}.title`, vars)}</Link> : t(`types.${n.type}.title`, vars)}</span>
                  <span className="num text-xs text-muted-foreground">{formatDate(n.created_at, loc)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{t(`types.${n.type}.body`, vars)}</p>
              </li>
            );
          })}
        </ul>
      )}
      <Pagination page={p.page} limit={p.limit} total={res.total} basePath="/notifications" params={{}} />
    </div>
  );
}
