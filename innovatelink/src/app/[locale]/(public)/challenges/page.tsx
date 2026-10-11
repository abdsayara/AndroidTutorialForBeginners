import { getTranslations, setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { getActor } from "@/lib/auth/current";
import { Button, Empty, Input, PageHeader, Select } from "@/components/ui";
import { ChallengeCard } from "@/components/domain/cards";
import { Pagination } from "@/components/domain/pagination";
import { challengeListSchema, CATEGORIES } from "@/modules/challenges/schema";
import { searchChallenges } from "@/modules/search/service";

export const dynamic = "force-dynamic";

export default async function ChallengesPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string>> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const f = challengeListSchema.safeParse(sp).data ?? challengeListSchema.parse({});
  const t = await getTranslations("challenges");
  const te = await getTranslations("enums");
  const actor = await getActor();
  const [res, sectors, cities] = await Promise.all([
    searchChallenges(actor, f),
    db.sector.findMany({ orderBy: { name_ar: "asc" } }),
    db.organization.findMany({ where: { type: "company", status: "active", city: { not: null } }, distinct: ["city"], select: { city: true } }),
  ]);
  return (
    <div>
      <PageHeader title={t("browse_title")} description={t("browse_description")} />
      <form method="get" className="mb-6 grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-6" role="search">
        <label className="sr-only" htmlFor="q">{t("search")}</label>
        <Input id="q" name="q" defaultValue={f.q} placeholder={t("search_placeholder")} className="sm:col-span-2" />
        <Select name="category" defaultValue={f.category ?? ""} aria-label={t("category")}>
          <option value="">{t("all_categories")}</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{te(`category.${c}`)}</option>)}
        </Select>
        <Select name="sector_id" defaultValue={f.sector_id ?? ""} aria-label={t("sector")}>
          <option value="">{t("all_sectors")}</option>
          {sectors.map((s) => <option key={s.id} value={s.id}>{locale === "ar" ? s.name_ar : s.name_en}</option>)}
        </Select>
        <Select name="city" defaultValue={f.city ?? ""} aria-label={t("city")}>
          <option value="">{t("all_cities")}</option>
          {cities.map((c) => c.city && <option key={c.city} value={c.city}>{c.city}</option>)}
        </Select>
        <div className="flex gap-2">
          <Select name="max_duration" defaultValue={f.max_duration ? String(f.max_duration) : ""} aria-label={t("duration")}>
            <option value="">{t("any_duration")}</option>
            {[3, 6, 12].map((m) => <option key={m} value={m}>{t("up_to_months", { n: m })}</option>)}
          </Select>
          <Button type="submit">{t("search")}</Button>
        </div>
      </form>
      {res.items.length === 0 ? <Empty>{t("empty")}</Empty> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{res.items.map((c) => <ChallengeCard key={c.id} c={c} />)}</div>
      )}
      <Pagination page={f.page} limit={f.limit} total={res.total} basePath="/challenges" params={{ q: f.q, category: f.category, sector_id: f.sector_id, city: f.city }} />
    </div>
  );
}
