import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { formatDate } from "@/lib/utils";
import { buttonClass, Card, Empty, PageHeader, Stat } from "@/components/ui";
import { StatusBadge } from "@/components/domain/badges";
import { myChallenges } from "@/modules/challenges/service";
import { myProjects } from "@/modules/projects/service";
import { myWorkspaces } from "@/modules/workspaces/service";
import { isPlatformStaff, type Actor } from "@/modules/auth/policy";
import { CHALLENGE_STATUSES_FILTER } from "@/components/challenges/constants";
import { listContactRequests } from "@/modules/contact/service";
import { listIncomingAccessRequests } from "@/modules/access/service";

export const dynamic = "force-dynamic";

async function Workspaces({ actor }: { actor: Actor }) {
  const t = await getTranslations("dashboard");
  const locale = await getLocale();
  const ws = await myWorkspaces(actor);
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{t("workspaces")}</h2>
      {ws.length === 0 ? <Empty>{t("no_workspaces")}</Empty> : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {ws.map((w) => (
            <li key={w.id}><Card className="flex items-center justify-between gap-2">
              <div><Link href={`/workspaces/${w.id}`} className="font-medium hover:underline">{w.title}</Link><div className="text-xs text-muted-foreground">{formatDate(w.updated_at, locale)}</div></div>
              <StatusBadge status={w.status} />
            </Card></li>
          ))}
        </ul>
      )}
    </section>
  );
}

async function CompanyDashboard({ actor, status }: { actor: Actor; status?: string }) {
  const t = await getTranslations("dashboard");
  const locale = await getLocale();
  const rows = await myChallenges(actor, CHALLENGE_STATUSES_FILTER.includes(status as never) ? (status as never) : undefined);
  return (
    <div className="space-y-8">
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{t("my_challenges")}</h2>
          <div className="flex gap-2">
            <form method="get"><label htmlFor="st" className="sr-only">{t("filter_status")}</label>
              <select id="st" name="status" defaultValue={status ?? ""} className="h-9 rounded-md border border-border bg-card px-2 text-sm">
                <option value="">{t("all_statuses")}</option>
                {CHALLENGE_STATUSES_FILTER.map((s) => <option key={s} value={s}>{t(`challenge_status.${s}`)}</option>)}
              </select>
              <button type="submit" className={buttonClass("outline", "sm", "ms-1")}>{t("filter")}</button>
            </form>
            {actor.role === "company_admin" && <Link href="/dashboard/challenges/new" className={buttonClass("default", "sm")}>{t("new_challenge")}</Link>}
          </div>
        </div>
        {rows.length === 0 ? <Empty>{t("no_challenges")}</Empty> : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted text-start"><tr>
                <th className="p-3 text-start font-medium">{t("col_title")}</th><th className="p-3 text-start font-medium">{t("col_status")}</th>
                <th className="p-3 text-start font-medium">{t("col_matches")}</th><th className="p-3 text-start font-medium">{t("col_activity")}</th><th className="p-3" />
              </tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="p-3"><Link href={`/challenges/${r.id}`} className="font-medium hover:underline">{r.title}</Link></td>
                    <td className="p-3"><StatusBadge status={r.status} /></td>
                    <td className="num p-3">{r.match_count}</td>
                    <td className="num p-3 text-muted-foreground">{formatDate(r.last_activity, locale)}</td>
                    <td className="p-3 text-end">
                      {["draft", "needs_info"].includes(r.status) && actor.role === "company_admin" ? <Link href={`/dashboard/challenges/${r.id}/edit`} className="text-primary hover:underline">{t("edit")}</Link>
                        : <Link href={`/dashboard/challenges/${r.id}/matches`} className="text-primary hover:underline">{t("matches")}</Link>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <Workspaces actor={actor} />
    </div>
  );
}

async function AcademicDashboard({ actor }: { actor: Actor }) {
  const t = await getTranslations("dashboard");
  const locale = await getLocale();
  const projects = await myProjects(actor);
  return (
    <div className="space-y-8">
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{t("my_projects")}</h2>
          <div className="flex gap-2">
            {actor.role === "university_coordinator" && <Link href="/dashboard/projects/import" className={buttonClass("outline", "sm")}>{t("import_csv")}</Link>}
            <Link href="/dashboard/projects/new" className={buttonClass("default", "sm")}>{t("new_project")}</Link>
          </div>
        </div>
        {projects.length === 0 ? <Empty>{t("no_projects")}</Empty> : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {projects.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
                <div><Link href={`/projects/${p.id}`} className="font-medium hover:underline">{p.title}</Link><div className="num text-xs text-muted-foreground">{p.trl ? `TRL ${p.trl} · ` : ""}{formatDate(p.updated_at, locale)}</div></div>
                <div className="flex items-center gap-3"><StatusBadge status={p.status} /><Link href={`/dashboard/projects/${p.id}/edit`} className="text-sm text-primary hover:underline">{t("edit")}</Link></div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <div className="flex flex-wrap gap-2">
        <Link href="/dashboard/matches" className={buttonClass("outline")}>{t("incoming_matches")}</Link>
        {actor.role === "researcher" && <Link href="/settings" className={buttonClass("outline")}>{t("expertise_profile")}</Link>}
      </div>
      <Workspaces actor={actor} />
    </div>
  );
}

async function StaffDashboard({ actor }: { actor: Actor }) {
  const t = await getTranslations("dashboard");
  const [orgs, challenges, matches, users] = await Promise.all([
    db.organization.count({ where: { status: "pending" } }),
    db.challenge.count({ where: { status: "submitted", deleted_at: null } }),
    db.match.count({ where: { status: "suggested" } }),
    db.user.count({ where: { status: "pending", email_verified_at: { not: null }, role: { in: ["company_admin", "company_member", "university_coordinator"] } } }),
  ]);
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={t("pending_orgs")} value={orgs} /><Stat label={t("pending_users")} value={users} />
        <Stat label={t("pending_challenges")} value={challenges} /><Stat label={t("pending_matches")} value={matches} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href="/coordinator/review" className={buttonClass()}>{t("review_queues")}</Link>
        <Link href="/coordinator/commercialization" className={buttonClass("outline")}>{t("commercialization")}</Link>
        <Link href="/coordinator/clusters" className={buttonClass("outline")}>{t("clusters")}</Link>
        <Link href="/analytics" className={buttonClass("outline")}>{t("analytics")}</Link>
      </div>
      <Workspaces actor={actor} />
    </div>
  );
}

export default async function Dashboard({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ status?: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const actor = await requireUser(locale);
  const t = await getTranslations("dashboard");
  const te = await getTranslations("enums");
  const me = await db.user.findUniqueOrThrow({ where: { id: actor.id }, select: { full_name: true } });
  const [incomingContacts, incomingAccess] = actor.status === "active"
    ? await Promise.all([
        listContactRequests(actor).then((r) => r.incoming.filter((x) => x.status === "pending").length),
        listIncomingAccessRequests(actor).then((r) => r.length),
      ])
    : [0, 0];

  return (
    <div>
      <PageHeader title={t("welcome", { name: me.full_name })} description={te(`role.${actor.role}`)} actions={
        actor.status === "active" ? <>
          {incomingContacts > 0 && <Link href="/dashboard/contact-requests" className={buttonClass("outline", "sm")}>{t("contact_requests")}</Link>}
          {incomingAccess > 0 && <Link href="/dashboard/access-requests" className={buttonClass("outline", "sm")}>{t("access_requests")}</Link>}
        </> : undefined
      } />
      {actor.status !== "active" ? (
        <Card className="space-y-2 border-amber-300 bg-amber-50">
          <h2 className="font-semibold">{t("pending_title")}</h2>
          <p>{t("pending_body")}</p>
          <Link href="/settings" className={buttonClass("outline", "sm")}>{t("complete_profile")}</Link>
        </Card>
      ) : isPlatformStaff(actor) ? <StaffDashboard actor={actor} />
        : actor.role === "company_admin" || actor.role === "company_member" ? <CompanyDashboard actor={actor} status={(await searchParams).status} />
        : <AcademicDashboard actor={actor} />}
    </div>
  );
}
