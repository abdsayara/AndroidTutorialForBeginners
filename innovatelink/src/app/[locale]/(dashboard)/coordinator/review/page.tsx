import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";
import { requireActive } from "@/lib/auth/guards";
import { formatDate } from "@/lib/utils";
import { Badge, Card, Empty, PageHeader } from "@/components/ui";
import { ActionButton } from "@/components/domain/action-button";
import { ReviewDecision } from "@/components/coordinator/review-forms";
import { MatchCard } from "@/components/matches/match-card";
import { MatchActions } from "@/components/matches/match-actions";
import { pendingUsersFor } from "@/modules/auth/service";
import { pendingOrgs } from "@/modules/orgs/service";
import { submittedChallenges } from "@/modules/challenges/service";
import { pendingProjects } from "@/modules/projects/service";
import { suggestedMatches } from "@/modules/matching/service";
import { isPlatformStaff } from "@/modules/auth/policy";

export const dynamic = "force-dynamic";

/** §8 /coordinator/review: queues for companies, accounts, challenges, projects and matches. */
export default async function ReviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const actor = await requireActive(locale, ["platform_coordinator", "platform_admin", "university_coordinator"]);
  const t = await getTranslations("review");
  const te = await getTranslations("enums");
  const loc = await getLocale();
  const staff = isPlatformStaff(actor);
  const [users, orgs, challenges, projects, matches] = await Promise.all([
    pendingUsersFor(actor),
    staff ? pendingOrgs(actor) : Promise.resolve([]),
    staff ? submittedChallenges(actor) : Promise.resolve([]),
    actor.role !== "platform_coordinator" ? pendingProjects(actor) : Promise.resolve([]),
    staff ? suggestedMatches(actor) : Promise.resolve([]),
  ]);
  const name = (o: { name_ar: string; name_en?: string | null }) => (loc === "ar" ? o.name_ar : o.name_en ?? o.name_ar);

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} />
      {staff && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{t("orgs")} <Badge tone="muted" className="num">{orgs.length}</Badge></h2>
          {orgs.length === 0 ? <Empty>{t("empty")}</Empty> : orgs.map((o) => (
            <Card key={o.id} className="flex flex-wrap items-center justify-between gap-2">
              <div><strong>{o.name_ar}</strong> <Badge tone="muted">{te(`org_type.${o.type}`)}</Badge><div className="text-xs text-muted-foreground">{o.city} · {o.users.map((u) => `${u.full_name} <${u.email}>`).join("، ")}</div></div>
              <ActionButton path={`/orgs/${o.id}/approve`} size="sm">{t("approve")}</ActionButton>
            </Card>
          ))}
        </section>
      )}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("users")} <Badge tone="muted" className="num">{users.length}</Badge></h2>
        {users.length === 0 ? <Empty>{t("empty")}</Empty> : users.map((u) => (
          <Card key={u.id} className="flex flex-wrap items-center justify-between gap-2">
            <div><strong>{u.full_name}</strong> <span dir="ltr" className="text-sm text-muted-foreground">{u.email}</span><div className="text-xs text-muted-foreground">{te(`role.${u.role}`)} · {name(u.org)}{u.org.status === "pending" ? ` (${t("org_pending")})` : ""}</div></div>
            <ActionButton path={`/users/${u.id}/approve`} size="sm">{t("approve")}</ActionButton>
          </Card>
        ))}
      </section>
      {staff && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{t("challenges")} <Badge tone="muted" className="num">{challenges.length}</Badge></h2>
          {challenges.length === 0 ? <Empty>{t("empty")}</Empty> : challenges.map((c) => (
            <Card key={c.id} className="space-y-2">
              <div className="flex flex-wrap items-center gap-2"><Link href={`/challenges/${c.id}`} className="font-semibold hover:underline">{c.title}</Link>{c.category && <Badge>{te(`category.${c.category}`)}</Badge>}<Badge tone="muted">{te(`visibility.${c.visibility}`)}</Badge></div>
              <p className="text-xs text-muted-foreground">{name(c.org)} · {formatDate(c.updated_at, loc)}</p>
              <p className="line-clamp-3 text-sm">{c.problem_statement}</p>
              <ReviewDecision path={`/challenges/${c.id}/review`} approveJson={{ decision: "publish" }} returnKey="needs_info" approveLabel={t("publish")} returnLabel={t("needs_info")} />
            </Card>
          ))}
        </section>
      )}
      {actor.role !== "platform_coordinator" && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{t("projects")} <Badge tone="muted" className="num">{projects.length}</Badge></h2>
          {projects.length === 0 ? <Empty>{t("empty")}</Empty> : projects.map((p) => (
            <Card key={p.id} className="space-y-2">
              <Link href={`/projects/${p.id}`} className="font-semibold hover:underline">{p.title}</Link>
              <p className="line-clamp-2 text-sm text-muted-foreground">{p.summary}</p>
              <ReviewDecision path={`/projects/${p.id}/approve`} approveJson={{ decision: "approve" }} returnKey="reject" approveLabel={t("approve_publish")} returnLabel={t("return_draft")} />
            </Card>
          ))}
        </section>
      )}
      {staff && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{t("matches")} <Badge tone="muted" className="num">{matches.length}</Badge></h2>
          {matches.length === 0 ? <Empty>{t("empty")}</Empty> : matches.map((m) => (
            <MatchCard key={m.id} m={m} heading={<p className="mb-1 text-sm text-muted-foreground">{t("for_challenge")}: <Link href={`/dashboard/challenges/${m.challenge_id}/matches`} className="font-medium text-foreground hover:underline">{m.challenge.title}</Link></p>} actions={<MatchActions matchId={m.id} modes={["coordinator"]} />} />
          ))}
        </section>
      )}
    </div>
  );
}
