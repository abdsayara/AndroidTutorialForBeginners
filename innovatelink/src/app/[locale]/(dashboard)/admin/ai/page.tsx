import { getLocale, getTranslations } from "next-intl/server";
import { requireActive } from "@/lib/auth/guards";
import { formatDate, formatNumber } from "@/lib/utils";
import { Card, Empty } from "@/components/ui";
import { aiFeedback, aiUsage } from "@/modules/admin/service";

export const dynamic = "force-dynamic";

export default async function AiAdmin({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const actor = await requireActive(locale, ["platform_admin"]);
  const t = await getTranslations("admin");
  const loc = await getLocale();
  const [usage, fb] = await Promise.all([aiUsage(actor), aiFeedback(actor)]);
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="mb-2 font-semibold">{t("ai_usage")}</h2>
        <table className="w-full text-sm" dir="ltr"><thead><tr><th className="text-left">kind</th><th className="text-right">calls</th><th className="text-right">tokens in</th><th className="text-right">tokens out</th><th className="text-right">avg ms</th></tr></thead>
          <tbody className="num">{usage.map((u) => <tr key={u.kind} className="border-t border-border"><td>{u.kind}</td><td className="text-right">{u._count._all}</td><td className="text-right">{formatNumber(u._sum.tokens_in, "en")}</td><td className="text-right">{formatNumber(u._sum.tokens_out, "en")}</td><td className="text-right">{Math.round(u._avg.latency_ms ?? 0)}</td></tr>)}</tbody>
        </table>
      </Card>
      <Card>
        <h2 className="mb-2 font-semibold">{t("ai_feedback")}</h2>
        {fb.length === 0 ? <Empty>{t("no_feedback")}</Empty> : (
          <ul className="space-y-2 text-sm">{fb.map((f) => <li key={f.id} className="border-t border-border pt-2"><span className="font-mono text-xs" dir="ltr">{f.kind} · {f.input_ref}</span> <span className="num text-xs text-muted-foreground">{formatDate(f.created_at, loc)}</span><pre className="whitespace-pre-wrap text-xs" dir="ltr">{JSON.stringify(f.feedback)}</pre></li>)}</ul>
        )}
      </Card>
    </div>
  );
}
