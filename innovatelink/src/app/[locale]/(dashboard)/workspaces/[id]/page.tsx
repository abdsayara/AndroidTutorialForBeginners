import { getLocale, getTranslations } from "next-intl/server";
import { requireActive } from "@/lib/auth/guards";
import { formatDate } from "@/lib/utils";
import { Card, Stat } from "@/components/ui";
import { ActionButton } from "@/components/domain/action-button";
import { AssistantPanel } from "@/components/domain/assistant-panel";
import { CourseForm, SetupForm } from "@/components/workspace/forms";
import { getWorkspace } from "@/modules/workspaces/service";

export const dynamic = "force-dynamic";

export default async function Overview({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const actor = await requireActive(locale);
  const ws = await getWorkspace(actor, id);
  const t = await getTranslations("workspace");
  const te = await getTranslations("enums");
  const loc = await getLocale();
  const ip = ws.ip_record as { ip_status: string; owners: { name: string; share: number }[]; background_ip: string | null } | null;
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <Card className="space-y-2">
          <h2 className="font-semibold">{t("objectives")}</h2>
          <p className="whitespace-pre-wrap text-sm">{ws.objectives ?? "—"}</p>
          <p className="num text-xs text-muted-foreground">{formatDate(ws.start_date, loc)} – {formatDate(ws.end_date, loc)}{ws.course_code ? ` · ${ws.course_code} / ${ws.semester}` : ""}</p>
        </Card>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label={t("milestones")} value={`${ws.progress.milestones_done}/${ws.progress.milestones}`} />
          <Stat label={t("tasks")} value={`${ws.progress.tasks_done}/${ws.progress.tasks}`} />
          <Stat label={t("agreement")} value={ws.setup.agreement_uploaded ? "✓" : "—"} />
          <Stat label={t("ip_record")} value={ws.setup.ip_record_filled ? "✓" : "—"} />
        </div>
        {ws.can.manage && ws.status !== "completed" && <SetupForm wsId={id} hasAgreement={ws.setup.agreement_uploaded} ip={ip} />}
        {ws.can.activate && (
          <Card className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm">{ws.setup.agreement_uploaded && ws.setup.ip_record_filled ? t("ready_to_activate") : t("not_ready")}</p>
            <ActionButton path={`/workspaces/${id}/activate`} disabled={!(ws.setup.agreement_uploaded && ws.setup.ip_record_filled)}>{t("activate")}</ActionButton>
          </Card>
        )}
        {ws.can.link_course && <Card><CourseForm wsId={id} course={ws.course_code ?? ""} semester={ws.semester ?? ""} /></Card>}
        {ws.rating && <Card><p className="num">{t("rating")}: {"★".repeat(ws.rating)}{"☆".repeat(5 - ws.rating)}</p>{ws.rating_comment && <p className="text-sm">{ws.rating_comment}</p>}</Card>}
        <AssistantPanel workspaceId={id} />
      </div>
      <aside className="space-y-4">
        <Card>
          <h2 className="mb-2 font-semibold">{t("members")}</h2>
          <ul className="space-y-2 text-sm">
            {ws.members.map((m) => <li key={m.id}><div className="font-medium">{m.user.full_name}</div><div className="text-xs text-muted-foreground">{te(`ws_role.${m.ws_role}`)} · {loc === "ar" ? m.user.org.name_ar : m.user.org.name_en ?? m.user.org.name_ar}</div></li>)}
          </ul>
        </Card>
        {ip && <Card className="text-sm"><h2 className="mb-2 font-semibold">{t("ip_record")}</h2><p>{te(`ip_status.${ip.ip_status}`)}</p><ul className="num mt-1">{ip.owners.map((o, i) => <li key={i}>{o.name}: {o.share}%</li>)}</ul></Card>}
      </aside>
    </div>
  );
}
