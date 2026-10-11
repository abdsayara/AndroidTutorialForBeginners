import { requireActive } from "@/lib/auth/guards";
import { ReportForm } from "@/components/workspace/forms";
import { getFinalReport, getWorkspace } from "@/modules/workspaces/service";

export const dynamic = "force-dynamic";

export default async function Report({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const actor = await requireActive(locale);
  const [ws, r] = await Promise.all([getWorkspace(actor, id), getFinalReport(actor, id)]);
  return <ReportForm wsId={id} report={r.report} editable={ws.can.edit} canClose={ws.can.close} locale={locale} />;
}
