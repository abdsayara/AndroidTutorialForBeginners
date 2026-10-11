import { getLocale, getTranslations } from "next-intl/server";
import { requireActive } from "@/lib/auth/guards";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui";
import { UpdateForm } from "@/components/workspace/forms";
import { getWorkspace, listUpdates } from "@/modules/workspaces/service";

export const dynamic = "force-dynamic";

export default async function Updates({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const actor = await requireActive(locale);
  const t = await getTranslations("workspace");
  const loc = await getLocale();
  const [ws, ups] = await Promise.all([getWorkspace(actor, id), listUpdates(actor, id)]);
  return (
    <div className="space-y-4">
      {ws.can.edit && <UpdateForm wsId={id} />}
      {ups.map((u) => (
        <Card key={u.id} className="space-y-1">
          <div className="flex justify-between text-sm"><strong>{u.author?.full_name}</strong><span className="num text-muted-foreground">{formatDate(u.created_at, loc)}</span></div>
          <p className="whitespace-pre-wrap text-sm">{u.body}</p>
          {u.prototype_stage && <p className="text-xs"><span className="text-muted-foreground">{t("prototype_stage")}:</span> {u.prototype_stage}</p>}
          {u.test_results && <p className="text-xs"><span className="text-muted-foreground">{t("test_results")}:</span> {u.test_results}</p>}
        </Card>
      ))}
    </div>
  );
}
