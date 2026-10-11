import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";
import { Badge, Card } from "@/components/ui";
import { AiBadge, StatusBadge } from "@/components/domain/badges";
import { CRITERIA } from "@/modules/matching/schema";

export interface MatchLike {
  id: string; status: string; score: number; rationale: string; source: string; rejection_reason: string | null;
  criteria_scores: unknown;
  target: { kind: "full" | "teaser"; type: string; id: string; title: string; summary?: string | null; trl?: number | null } | null;
}

/** FR-2.2: overall score, five criteria, and a cited rationale. */
export async function MatchCard({ m, actions, heading }: { m: MatchLike; actions?: React.ReactNode; heading?: React.ReactNode }) {
  const t = await getTranslations("matches");
  const te = await getTranslations("enums");
  const scores = (m.criteria_scores ?? {}) as Record<string, number>;
  const href = m.target ? (m.target.type === "project" ? `/projects/${m.target.id}` : m.target.type === "researcher" ? "/experts" : "/labs") : "#";
  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          {heading}
          <div className="flex flex-wrap items-center gap-2">
            {m.target && <Badge tone="muted">{te(`target_type.${m.target.type}`)}</Badge>}
            <h3 className="font-semibold">{m.target ? <Link href={href} className="hover:underline">{m.target.title}</Link> : "—"}</h3>
            {m.target?.trl && <Badge tone="muted" className="num">TRL {m.target.trl}</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {m.source === "manual" ? <Badge tone="muted">{t("manual")}</Badge> : <AiBadge />}
          <StatusBadge status={m.status} />
        </div>
      </div>
      {m.source !== "manual" && (
        <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="text-center">
            <div className="num text-3xl font-bold text-primary">{Math.round(m.score * 100)}%</div>
            <div className="text-xs text-muted-foreground">{t("overall")}</div>
          </div>
          <dl className="grid grid-cols-1 gap-1 text-xs sm:grid-cols-5">
            {CRITERIA.map((k) => (
              <div key={k}>
                <dt className="text-muted-foreground">{te(`criteria.${k}`)}</dt>
                <dd className="flex items-center gap-1">
                  <span className="h-1.5 flex-1 rounded-full bg-muted" aria-hidden><span className="block h-1.5 rounded-full bg-primary" style={{ width: `${((scores[k] ?? 0) / 5) * 100}%` }} /></span>
                  <span className="num">{(scores[k] ?? 0).toFixed(1)}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      <p className="text-sm leading-relaxed">{m.rationale}</p>
      {m.rejection_reason && <p className="text-sm text-destructive">{t("rejection_reason")}: {m.rejection_reason}</p>}
      {actions}
    </Card>
  );
}
