import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireActive } from "@/lib/auth/guards";
import { Badge, Button, Card, Empty, Input, PageHeader } from "@/components/ui";
import { ContactForm } from "@/components/domain/contact-form";
import { Pagination } from "@/components/domain/pagination";
import { directorySchema, listLabs } from "@/modules/projects/directory";
import { isCompanyUser } from "@/modules/auth/policy";

export const dynamic = "force-dynamic";

export default async function LabsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string>> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const actor = await requireActive(locale);
  const f = directorySchema.safeParse(await searchParams).data ?? directorySchema.parse({});
  const t = await getTranslations("directory");
  const res = await listLabs(actor, f);
  return (
    <div>
      <PageHeader title={t("labs_title")} description={t("labs_description")} />
      <form method="get" role="search" className="mb-6 flex gap-2">
        <label htmlFor="q" className="sr-only">{t("search")}</label>
        <Input id="q" name="q" defaultValue={f.q} placeholder={t("labs_placeholder")} />
        <Button type="submit">{t("search")}</Button>
      </form>
      {res.items.length === 0 ? <Empty>{t("empty")}</Empty> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {res.items.map((l) => (
            <Card key={l.id} className="flex flex-col gap-2">
              <h2 className="font-semibold">{l.name}</h2>
              <p className="text-sm text-muted-foreground">{locale === "ar" ? l.org.name_ar : l.org.name_en ?? l.org.name_ar}{l.org.city ? ` · ${l.org.city}` : ""}</p>
              <p className="line-clamp-3 text-sm">{l.description}</p>
              {l.services && <p className="text-sm"><span className="text-muted-foreground">{t("services")}: </span>{l.services}</p>}
              <div className="flex flex-wrap gap-1">{l.equipment.map((x) => <Badge key={x} tone="muted">{x}</Badge>)}</div>
              {isCompanyUser(actor) && <div className="mt-auto pt-2"><ContactForm targetType="lab" targetId={l.id} label={t("contact")} /></div>}
            </Card>
          ))}
        </div>
      )}
      <Pagination page={f.page} limit={f.limit} total={res.total} basePath="/labs" params={{ q: f.q }} />
    </div>
  );
}
