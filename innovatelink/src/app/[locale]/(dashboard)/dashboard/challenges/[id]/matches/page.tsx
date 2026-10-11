import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireActive } from "@/lib/auth/guards";
import { Card, Empty, PageHeader } from "@/components/ui";
import { ActionButton } from "@/components/domain/action-button";
import { MatchCard } from "@/components/matches/match-card";
import { ManualMatchForm, MatchActions } from "@/components/matches/match-actions";
import { listChallengeMatches } from "@/modules/matching/service";
import { canManageChallenge, isChallengeOwner } from "@/modules/challenges/policy";
import { isPlatformStaff } from "@/modules/auth/policy";
import { canRespondAsCompany } from "@/modules/matching/policy";

export const dynamic = "force-dynamic";

export default async function ChallengeMatches({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const actor = await requireActive(locale);
  const c = await db.challenge.findFirst({ where: { id, deleted_at: null } });
  if (!c || !(isChallengeOwner(actor, c) || isPlatformStaff(actor))) notFound();
  const t = await getTranslations("matches");
  const staff = isPlatformStaff(actor);
  const companyAdmin = canManageChallenge(actor, c);
  const matches = await listChallengeMatches(actor, id);
  const workspaces = await db.workspace.findMany({ where: { challenge_id: id }, select: { id: true, match_id: true } });
  const wsByMatch = new Map(workspaces.map((w) => [w.match_id, w.id]));
  const manualOptions = staff ? [
    ...(await db.project.findMany({ where: { status: { in: ["published", "in_collaboration"] }, deleted_at: null }, select: { id: true, title: true }, take: 200, orderBy: { title: "asc" } })).map((p) => ({ type: "project" as const, id: p.id, label: `${t("project")}: ${p.title}` })),
    ...(await db.researcherProfile.findMany({ include: { user: { select: { full_name: true } } }, take: 200 })).map((r) => ({ type: "researcher" as const, id: r.id, label: `${t("researcher")}: ${r.user.full_name}` })),
    ...(await db.lab.findMany({ where: { deleted_at: null }, select: { id: true, name: true }, take: 200 })).map((l) => ({ type: "lab" as const, id: l.id, label: `${t("lab")}: ${l.name}` })),
  ] : [];

  return (
    <div className="space-y-4">
      <PageHeader title={t("challenge_matches_title")} description={c.title} actions={staff ? <ActionButton path={`/challenges/${id}/rematch`} variant="outline">{t("rematch")}</ActionButton> : undefined} />
      {!staff && <p className="text-sm text-muted-foreground">{t("company_note")}</p>}
      {matches.length === 0 ? <Empty>{staff ? t("empty_staff") : t("empty_company")}</Empty> : matches.map((m) => {
        const modes: ("coordinator" | "respond" | "workspace" | "feedback")[] = ["feedback"];
        if (staff && m.status === "suggested") modes.push("coordinator");
        if (companyAdmin && canRespondAsCompany(actor, true, m)) modes.push("respond");
        if ((companyAdmin || staff) && m.status === "confirmed" && !wsByMatch.has(m.id)) modes.push("workspace");
        const ws = wsByMatch.get(m.id);
        return (
          <MatchCard key={m.id} m={m} actions={
            <div className="space-y-2">
              {ws && <a href={`/${locale}/workspaces/${ws}`} className="text-sm font-medium text-primary underline">{t("open_workspace")}</a>}
              {m.status !== "rejected" && <MatchActions matchId={m.id} modes={m.source === "manual" ? modes.filter((x) => x !== "feedback") : modes} />}
            </div>
          } />
        );
      })}
      {staff && <Card><h2 className="mb-2 font-semibold">{t("manual_title")}</h2><ManualMatchForm challengeId={id} options={manualOptions} /></Card>}
    </div>
  );
}
