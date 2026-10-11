import { getTranslations, setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { getActor } from "@/lib/auth/current";
import { Button, Empty, Input, PageHeader, Select } from "@/components/ui";
import { ProjectCard } from "@/components/domain/cards";
import { Pagination } from "@/components/domain/pagination";
import { IP_STATUSES, PROJECT_TYPES, projectListSchema, SEEKING } from "@/modules/projects/schema";
import { searchProjects } from "@/modules/search/service";

export const dynamic = "force-dynamic";

export default async function ProjectsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string>> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const f = projectListSchema.safeParse(sp).data ?? projectListSchema.parse({});
  const t = await getTranslations("projects");
  const te = await getTranslations("enums");
  const actor = await getActor();
  const [res, sectors, unis] = await Promise.all([
    searchProjects(actor, f),
    db.sector.findMany({ orderBy: { name_ar: "asc" } }),
    db.organization.findMany({ where: { type: "university", status: "active" }, orderBy: { name_ar: "asc" } }),
  ]);
  return (
    <div>
      <PageHeader title={t("browse_title")} description={t("browse_description")} />
      <form method="get" className="mb-6 grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-4" role="search">
        <label className="sr-only" htmlFor="q">{t("search")}</label>
        <Input id="q" name="q" defaultValue={f.q} placeholder={t("search_placeholder")} className="sm:col-span-2" />
        <Select name="type" defaultValue={f.type ?? ""} aria-label={t("type")}>
          <option value="">{t("all_types")}</option>
          {PROJECT_TYPES.map((x) => <option key={x} value={x}>{te(`project_type.${x}`)}</option>)}
        </Select>
        <Select name="sector_id" defaultValue={f.sector_id ?? ""} aria-label={t("sector")}>
          <option value="">{t("all_sectors")}</option>
          {sectors.map((s) => <option key={s.id} value={s.id}>{locale === "ar" ? s.name_ar : s.name_en}</option>)}
        </Select>
        <Select name="org_id" defaultValue={f.org_id ?? ""} aria-label={t("university")}>
          <option value="">{t("all_universities")}</option>
          {unis.map((u) => <option key={u.id} value={u.id}>{locale === "ar" ? u.name_ar : u.name_en ?? u.name_ar}</option>)}
        </Select>
        <Select name="trl_min" defaultValue={f.trl_min ? String(f.trl_min) : ""} aria-label={t("trl_min")}>
          <option value="">{t("any_trl")}</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <option key={n} value={n}>{t("trl_at_least", { n })}</option>)}
        </Select>
        <Select name="ip_status" defaultValue={f.ip_status ?? ""} aria-label={t("ip_status")}>
          <option value="">{t("any_ip")}</option>
          {IP_STATUSES.map((x) => <option key={x} value={x}>{te(`ip_status.${x}`)}</option>)}
        </Select>
        <div className="flex gap-2">
          <Select name="seeking" defaultValue={f.seeking?.[0] ?? ""} aria-label={t("seeking")}>
            <option value="">{t("any_seeking")}</option>
            {SEEKING.map((x) => <option key={x} value={x}>{te(`seeking.${x}`)}</option>)}
          </Select>
          <Button type="submit">{t("search")}</Button>
        </div>
      </form>
      {res.items.length === 0 ? <Empty>{t("empty")}</Empty> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{res.items.map((p) => <ProjectCard key={p.id} p={p} />)}</div>
      )}
      <Pagination page={f.page} limit={f.limit} total={res.total} basePath="/projects" params={{ q: f.q, type: f.type, sector_id: f.sector_id, org_id: f.org_id }} />
    </div>
  );
}
