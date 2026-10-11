import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireActive } from "@/lib/auth/guards";
import { Badge, Button, Card, Empty, Input, PageHeader } from "@/components/ui";
import { ContactForm } from "@/components/domain/contact-form";
import { Pagination } from "@/components/domain/pagination";
import { directorySchema, listExperts } from "@/modules/projects/directory";
import { isCompanyUser } from "@/modules/auth/policy";

export const dynamic = "force-dynamic";

export default async function ExpertsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string>> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const actor = await requireActive(locale);
  const f = directorySchema.safeParse(await searchParams).data ?? directorySchema.parse({});
  const t = await getTranslations("directory");
  const res = await listExperts(actor, f);
  return (
    <div>
      <PageHeader title={t("experts_title")} description={t("experts_description")} />
      <form method="get" role="search" className="mb-6 flex gap-2">
        <label htmlFor="q" className="sr-only">{t("search")}</label>
        <Input id="q" name="q" defaultValue={f.q} placeholder={t("experts_placeholder")} />
        <Button type="submit">{t("search")}</Button>
      </form>
      {res.items.length === 0 ? <Empty>{t("empty")}</Empty> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {res.items.map((r) => (
            <Card key={r.id} className="flex flex-col gap-2">
              <h2 className="font-semibold">{r.user.full_name}</h2>
              <p className="text-sm text-muted-foreground">{[r.title, r.department, locale === "ar" ? r.user.org.name_ar : r.user.org.name_en ?? r.user.org.name_ar].filter(Boolean).join(" · ")}</p>
              {r.bio && <p className="line-clamp-3 text-sm">{r.bio}</p>}
              <div className="flex flex-wrap gap-1">{r.expertise_tags.map((x) => <Badge key={x} tone="muted">{x}</Badge>)}</div>
              {r.availability && <p className="text-xs text-muted-foreground">{t("availability")}: {r.availability}</p>}
              {isCompanyUser(actor) && <div className="mt-auto pt-2"><ContactForm targetType="researcher" targetId={r.id} label={t("contact")} /></div>}
            </Card>
          ))}
        </div>
      )}
      <Pagination page={f.page} limit={f.limit} total={res.total} basePath="/experts" params={{ q: f.q }} />
    </div>
  );
}
