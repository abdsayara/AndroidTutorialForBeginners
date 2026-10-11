import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { requireActive } from "@/lib/auth/guards";
import { formatDate } from "@/lib/utils";
import { Card, Empty, PageHeader } from "@/components/ui";
import { StatusBadge } from "@/components/domain/badges";
import { ActionButton } from "@/components/domain/action-button";
import { listContactRequests } from "@/modules/contact/service";

export const dynamic = "force-dynamic";

export default async function ContactRequests({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const actor = await requireActive(locale);
  const t = await getTranslations("contact");
  const loc = await getLocale();
  const { incoming, outgoing } = await listContactRequests(actor);
  return (
    <div className="space-y-6">
      <PageHeader title={t("requests_title")} />
      <section className="space-y-3">
        <h2 className="font-semibold">{t("incoming")}</h2>
        {incoming.length === 0 ? <Empty>{t("none")}</Empty> : incoming.map((r) => (
          <Card key={r.id} className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p><strong>{r.from?.full_name}</strong> ({loc === "ar" ? r.from?.org.name_ar : r.from?.org.name_en ?? r.from?.org.name_ar}) — {r.target_label}</p>
              <StatusBadge status={r.status} />
            </div>
            <p className="whitespace-pre-wrap text-sm">{r.message}</p>
            {r.from?.email && <p className="text-sm" dir="ltr">{r.from.email}</p>}
            {r.status === "pending" && (
              <div className="flex gap-2">
                <ActionButton path={`/contact-requests/${r.id}/respond`} json={{ decision: "accepted" }} size="sm">{t("accept")}</ActionButton>
                <ActionButton path={`/contact-requests/${r.id}/respond`} json={{ decision: "declined" }} size="sm" variant="outline">{t("decline")}</ActionButton>
              </div>
            )}
          </Card>
        ))}
      </section>
      <section className="space-y-3">
        <h2 className="font-semibold">{t("outgoing")}</h2>
        {outgoing.length === 0 ? <Empty>{t("none")}</Empty> : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {outgoing.map((r) => <li key={r.id} className="flex items-center justify-between gap-2 p-3 text-sm"><span className="line-clamp-1">{r.message}</span><span className="flex shrink-0 items-center gap-2"><span className="num text-muted-foreground">{formatDate(r.created_at, loc)}</span><StatusBadge status={r.status} /></span></li>)}
          </ul>
        )}
      </section>
    </div>
  );
}
