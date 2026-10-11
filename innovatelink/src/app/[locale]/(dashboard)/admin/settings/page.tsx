import { getTranslations } from "next-intl/server";
import { requireActive } from "@/lib/auth/guards";
import { Card } from "@/components/ui";
import { ActionButton } from "@/components/domain/action-button";
import { SettingsForm } from "@/components/admin-forms";
import { getSettings } from "@/modules/admin/service";

export const dynamic = "force-dynamic";

export default async function Settings({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const actor = await requireActive(locale, ["platform_admin"]);
  const t = await getTranslations("admin");
  const s = await getSettings(actor);
  return (
    <div className="space-y-4">
      <Card className="space-y-1 text-sm">
        <h2 className="font-semibold">{t("ai_config")}</h2>
        <dl className="grid grid-cols-2 gap-1 sm:grid-cols-3" dir="ltr">
          {Object.entries(s.ai).map(([k, v]) => <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-mono">{String(v)}</dd></div>)}
        </dl>
        <p className="text-xs text-muted-foreground">{t("ai_env_note")}</p>
        <ActionButton path="/admin/reindex" variant="outline" size="sm">{t("reindex")}</ActionButton>
      </Card>
      <SettingsForm weights={s.matching_weights as Record<string, number>} nda={s.nda_template as { version: string; text_ar: string; text_en: string }} retention={s.retention_days_closed_challenges as number} />
    </div>
  );
}
