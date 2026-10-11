import { getTranslations } from "next-intl/server";
import { requireActive } from "@/lib/auth/guards";
import { Badge, Card } from "@/components/ui";
import { TaxonomyForm } from "@/components/admin-forms";
import { listTaxonomy } from "@/modules/admin/service";

export const dynamic = "force-dynamic";

export default async function Taxonomy({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireActive(locale, ["platform_admin"]);
  const t = await getTranslations("admin");
  const { sectors, tags } = await listTaxonomy();
  return (
    <div className="space-y-4">
      <TaxonomyForm />
      <div className="grid gap-4 md:grid-cols-2">
        <Card><h2 className="mb-2 font-semibold">{t("sectors")}</h2><ul className="space-y-1 text-sm">{sectors.map((s) => <li key={s.id}>{s.name_ar} / {s.name_en} <code dir="ltr" className="text-xs text-muted-foreground">{s.slug}</code></li>)}</ul></Card>
        <Card><h2 className="mb-2 font-semibold">{t("tags")}</h2><div className="flex flex-wrap gap-1">{tags.map((x) => <Badge key={x.id} tone="muted">{x.name_ar}</Badge>)}</div></Card>
      </div>
    </div>
  );
}
