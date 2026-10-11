import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";
import { db } from "@/lib/db";
import { getActor } from "@/lib/auth/current";
import { buttonClass, Stat } from "@/components/ui";
import { ChallengeCard, ProjectCard } from "@/components/domain/cards";
import { listChallenges } from "@/modules/challenges/service";
import { listProjects } from "@/modules/projects/service";
import { challengeListSchema } from "@/modules/challenges/schema";
import { projectListSchema } from "@/modules/projects/schema";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const actor = await getActor();
  const [companies, challenges, projects, workspaces, featuredC, featuredP] = await Promise.all([
    db.organization.count({ where: { type: "company", status: "active", deleted_at: null } }),
    db.challenge.count({ where: { status: { in: ["published", "matched", "in_progress", "solved"] }, deleted_at: null } }),
    db.project.count({ where: { status: { in: ["published", "in_collaboration", "commercializing"] }, deleted_at: null } }),
    db.workspace.count({ where: { status: { in: ["active", "completed"] } } }),
    listChallenges(null, challengeListSchema.parse({ limit: 3 })),
    listProjects(null, projectListSchema.parse({ limit: 3 })),
  ]);
  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-primary px-6 py-10 text-primary-foreground sm:px-10 sm:py-14">
        <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">{t("hero_title")}</h1>
        <p className="mt-4 max-w-2xl text-lg opacity-90">{t("hero_body")}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {actor ? (
            <Link href="/dashboard" className={buttonClass("secondary", "lg", "bg-card text-primary")}>{t("cta_dashboard")}</Link>
          ) : (
            <>
              <Link href="/auth/register" className={buttonClass("secondary", "lg", "bg-accent text-accent-foreground hover:bg-accent/90")}>{t("cta_company")}</Link>
              <Link href="/auth/register" className={buttonClass("outline", "lg", "border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10")}>{t("cta_academic")}</Link>
            </>
          )}
        </div>
      </section>

      <section aria-labelledby="stats" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <h2 id="stats" className="sr-only">{t("stats_title")}</h2>
        <Stat label={t("stat_companies")} value={formatNumber(companies, locale)} />
        <Stat label={t("stat_challenges")} value={formatNumber(challenges, locale)} />
        <Stat label={t("stat_projects")} value={formatNumber(projects, locale)} />
        <Stat label={t("stat_collaborations")} value={formatNumber(workspaces, locale)} />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {(["step1", "step2", "step3"] as const).map((s, i) => (
          <div key={s} className="rounded-lg border border-border bg-card p-5">
            <div className="num mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 font-bold text-accent-foreground">{i + 1}</div>
            <h3 className="font-semibold">{t(`${s}_title`)}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t(`${s}_body`)}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-bold">{t("featured_challenges")}</h2>
          <Link href="/challenges" className="text-sm text-primary hover:underline">{t("view_all")}</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{featuredC.items.map((c) => <ChallengeCard key={c.id} c={c} />)}</div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-bold">{t("featured_projects")}</h2>
          <Link href="/projects" className="text-sm text-primary hover:underline">{t("view_all")}</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{featuredP.items.map((p) => <ProjectCard key={p.id} p={p} />)}</div>
      </section>
    </div>
  );
}
