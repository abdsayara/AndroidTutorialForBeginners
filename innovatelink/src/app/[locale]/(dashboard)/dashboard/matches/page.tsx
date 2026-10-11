import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";
import { db } from "@/lib/db";
import { requireActive } from "@/lib/auth/guards";
import { Empty, PageHeader } from "@/components/ui";
import { MatchCard } from "@/components/matches/match-card";
import { MatchActions } from "@/components/matches/match-actions";
import { listAcademicMatches } from "@/modules/matching/service";
import { canRespondAsAcademic } from "@/modules/matching/policy";

export const dynamic = "force-dynamic";

export default async function AcademicMatches({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const actor = await requireActive(locale);
  const t = await getTranslations("matches");
  const matches = await listAcademicMatches(actor);
  const ws = await db.workspace.findMany({ where: { match_id: { in: matches.map((m) => m.id) } }, select: { id: true, match_id: true } });
  return (
    <div className="space-y-4">
      <PageHeader title={t("incoming_title")} description={t("incoming_description")} />
      {matches.length === 0 ? <Empty>{t("empty_academic")}</Empty> : matches.map((m) => {
        const w = ws.find((x) => x.match_id === m.id);
        const challengeTitle = m.challenge.kind === "full" ? m.challenge.title : m.challenge.public_title;
        return (
          <MatchCard key={m.id} m={m} heading={<p className="mb-1 text-sm text-muted-foreground">{t("for_challenge")}: <Link href={`/challenges/${m.challenge.id}`} className="font-medium text-foreground hover:underline">{challengeTitle}</Link></p>}
            actions={<div className="space-y-2">
              {w && <Link href={`/workspaces/${w.id}`} className="text-sm font-medium text-primary underline">{t("open_workspace")}</Link>}
              {canRespondAsAcademic(actor, true, m) && <MatchActions matchId={m.id} modes={["respond", "feedback"]} />}
            </div>} />
        );
      })}
    </div>
  );
}
