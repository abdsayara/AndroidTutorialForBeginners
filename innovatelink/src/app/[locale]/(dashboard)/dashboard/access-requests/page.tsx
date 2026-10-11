import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { requireActive } from "@/lib/auth/guards";
import { formatDate } from "@/lib/utils";
import { Card, Empty, PageHeader } from "@/components/ui";
import { StatusBadge } from "@/components/domain/badges";
import { ActionButton } from "@/components/domain/action-button";
import { listIncomingAccessRequests, myAccessRequests } from "@/modules/access/service";

export const dynamic = "force-dynamic";

export default async function AccessRequests({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const actor = await requireActive(locale);
  const t = await getTranslations("access");
  const loc = await getLocale();
  const [incoming, mine] = await Promise.all([listIncomingAccessRequests(actor), myAccessRequests(actor)]);
  return (
    <div className="space-y-6">
      <PageHeader title={t("requests_title")} />
      <section className="space-y-3">
        <h2 className="font-semibold">{t("incoming")}</h2>
        {incoming.length === 0 ? <Empty>{t("none")}</Empty> : incoming.map((r) => (
          <Card key={r.id} className="space-y-2">
            <p><strong>{r.requester?.full_name}</strong> ({loc === "ar" ? r.requester?.org.name_ar : r.requester?.org.name_en ?? r.requester?.org.name_ar}) — {r.subject_title}</p>
            {r.message && <p className="text-sm text-muted-foreground">{r.message}</p>}
            <div className="flex gap-2">
              <ActionButton path={`/access-requests/${r.id}/decide`} json={{ decision: "approve" }} size="sm">{t("approve")}</ActionButton>
              <ActionButton path={`/access-requests/${r.id}/decide`} json={{ decision: "reject" }} size="sm" variant="outline">{t("reject")}</ActionButton>
            </div>
          </Card>
        ))}
      </section>
      <section className="space-y-3">
        <h2 className="font-semibold">{t("mine")}</h2>
        {mine.length === 0 ? <Empty>{t("none")}</Empty> : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {mine.map((r) => <li key={r.id} className="flex items-center justify-between p-3 text-sm"><a className="text-primary hover:underline" href={`/${locale}/${r.subject_type === "challenge" ? "challenges" : "projects"}/${r.subject_id}`}>{t(`subject_${r.subject_type}`)}</a><span className="flex items-center gap-2"><span className="num text-muted-foreground">{formatDate(r.created_at, loc)}</span><StatusBadge status={r.status} /></span></li>)}
          </ul>
        )}
      </section>
    </div>
  );
}
