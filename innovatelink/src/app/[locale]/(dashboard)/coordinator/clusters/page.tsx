import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";
import { requireActive } from "@/lib/auth/guards";
import { Badge, Card, Empty, PageHeader } from "@/components/ui";
import { listClusters } from "@/modules/matching/service";

export const dynamic = "force-dynamic";

/** FR-2.7: similar challenges, coordinators only. */
export default async function ClustersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const actor = await requireActive(locale, ["platform_coordinator", "platform_admin"]);
  const t = await getTranslations("clusters");
  const te = await getTranslations("enums");
  const clusters = await listClusters(actor);
  return (
    <div className="space-y-4">
      <PageHeader title={t("title")} description={t("description")} />
      {clusters.length === 0 ? <Empty>{t("empty")}</Empty> : clusters.map((c) => (
        <Card key={c.id} className="space-y-2">
          <div className="flex items-center gap-2"><Badge>{te(`category.${c.label.split(":")[0]}`)}</Badge><span className="num text-sm text-muted-foreground">{t("similarity", { s: Math.round(c.similarity * 100) })}</span></div>
          <ul className="space-y-1 text-sm">{c.challenges.map((x) => <li key={x.id}><Link href={`/challenges/${x.id}`} className="hover:underline">{x.title}</Link> <span className="text-muted-foreground">— {x.org.name_ar}</span></li>)}</ul>
        </Card>
      ))}
    </div>
  );
}
