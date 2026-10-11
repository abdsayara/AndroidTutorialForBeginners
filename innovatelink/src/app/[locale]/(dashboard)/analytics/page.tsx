import { getTranslations, setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { requireActive } from "@/lib/auth/guards";
import { formatNumber } from "@/lib/utils";
import { Button, Card, Input, PageHeader, Select, Stat } from "@/components/ui";
import { BarList } from "@/components/domain/bar-list";
import { analyticsFilterSchema, breakdown, overview } from "@/modules/analytics/service";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string>> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const actor = await requireActive(locale);
  const sp = await searchParams;
  const f = analyticsFilterSchema.safeParse(Object.fromEntries(Object.entries(sp).filter(([, v]) => v))).data ?? {};
  const t = await getTranslations("analytics");
  const te = await getTranslations("enums");
  const [ov, br, sectors] = await Promise.all([overview(actor, f), breakdown(actor, f), db.sector.findMany({ orderBy: { name_ar: "asc" } })]);
  const n = (x: number | null | undefined) => formatNumber(x ?? 0, locale);
  const qs = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]).toString();
  const sum = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t(`scope_${ov.scope}`)} actions={<a href={`/api/v1/analytics/export.csv${qs ? `?${qs}` : ""}`} className="inline-flex h-10 items-center rounded-md border border-border bg-card px-4 text-sm hover:bg-muted">{t("export_csv")}</a>} />
      <form method="get" className="flex flex-wrap items-end gap-2 rounded-lg border border-border bg-card p-3">
        <label className="text-sm">{t("from")}<Input type="date" name="from" defaultValue={sp.from} className="mt-1" /></label>
        <label className="text-sm">{t("to")}<Input type="date" name="to" defaultValue={sp.to} className="mt-1" /></label>
        <label className="text-sm">{t("sector")}<Select name="sector_id" defaultValue={sp.sector_id ?? ""} className="mt-1"><option value="">{t("all")}</option>{sectors.map((s) => <option key={s.id} value={s.id}>{locale === "ar" ? s.name_ar : s.name_en}</option>)}</Select></label>
        <Button type="submit">{t("apply")}</Button>
      </form>

      {ov.scope === "ecosystem" && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label={t("companies")} value={n(ov.companies)} />
          <Stat label={t("challenges_submitted")} value={n(ov.challenges_submitted)} />
          <Stat label={t("challenges_published")} value={n(ov.challenges_published)} />
          <Stat label={t("challenges_matched")} value={`${n(ov.challenges_matched)} (${n(ov.match_rate)}%)`} />
          <Stat label={t("active_workspaces")} value={n(ov.active_workspaces)} />
          <Stat label={t("projects_in_directory")} value={n(ov.projects_in_directory)} />
          <Stat label={t("projects_prototype")} value={n(ov.projects_prototype)} />
          <Stat label={t("avg_rating")} value={ov.avg_rating ? `${ov.avg_rating}/5` : "—"} />
          <Stat label={t("impact_savings")} value={`${n(ov.impact.savings_ils)} ₪`} />
          <Stat label={t("impact_waste")} value={`${n(ov.impact.waste_reduction_tons)} t`} />
          <Stat label={t("impact_water")} value={`${n(ov.impact.water_saved_m3)} m³`} />
          <Stat label={t("impact_energy")} value={`${n(ov.impact.energy_saved_kwh)} kWh`} />
        </div>
      )}
      {ov.scope === "ecosystem" && (
        <Card><BarList caption={t("commercialization_by_stage")} locale={locale} suppressedLabel={t("suppressed")}
          rows={["ip_assessment", "market_validation", "prototype_refinement", "business_model", "investment_readiness", "market_entry"].map((s) => ({ label: te(`stage.${s}`), value: (ov.commercialization_by_stage as Record<string, number>)[s] ?? 0 }))} /></Card>
      )}
      {ov.scope === "company" && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Stat label={t("my_challenges")} value={n(sum(ov.challenges))} />
          <Stat label={t("my_matches")} value={n(sum(ov.matches))} />
          <Stat label={t("my_workspaces")} value={n(sum(ov.workspaces))} />
        </div>
      )}
      {ov.scope === "university" && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label={t("uni_projects")} value={n(sum(ov.projects))} />
          <Stat label={t("uni_users")} value={n(sum(ov.users))} />
          <Stat label={t("active_workspaces")} value={n(ov.active_workspaces)} />
          <Stat label={t("commercialization_cases")} value={n(ov.commercialization_cases)} />
        </div>
      )}
      {ov.scope === "academic" && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Stat label={t("my_projects")} value={n(sum(ov.projects))} />
          <Stat label={t("pending_contacts")} value={n(ov.pending_contact_requests)} />
          <Stat label={t("my_workspaces")} value={n(ov.workspaces)} />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card><BarList caption={t("by_category")} locale={locale} suppressedLabel={t("suppressed")} rows={br.by_category.map((r) => ({ label: te(`category.${r.key}`), value: r.challenges, suppressed: r.suppressed }))} /></Card>
        <Card><BarList caption={t("by_sector")} locale={locale} suppressedLabel={t("suppressed")} rows={br.by_sector.map((r) => ({ label: locale === "ar" ? r.label_ar : r.label_en, value: r.challenges, suppressed: r.suppressed }))} /></Card>
      </div>
      {br.by_sector.some((r) => r.suppressed) && <p className="text-xs text-muted-foreground">{t("k_anon_note")}</p>}
    </div>
  );
}
