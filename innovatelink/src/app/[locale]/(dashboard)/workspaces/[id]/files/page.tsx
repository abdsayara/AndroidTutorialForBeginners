import { getTranslations } from "next-intl/server";
import { requireActive } from "@/lib/auth/guards";
import { Card } from "@/components/ui";
import { DocumentList } from "@/components/domain/documents";
import { UploadVersion } from "@/components/workspace/forms";
import { getWorkspace } from "@/modules/workspaces/service";
import { listDocuments } from "@/modules/files/service";

export const dynamic = "force-dynamic";

/** FR-4.5: 50MB limit, allowed types, simple versions (new upload keeps the previous). */
export default async function Files({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const actor = await requireActive(locale);
  const t = await getTranslations("workspace");
  const [ws, docs] = await Promise.all([getWorkspace(actor, id), listDocuments(actor, "workspace", id)]);
  return (
    <div className="space-y-4">
      {ws.can.edit && <Card className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm text-muted-foreground">{t("files_hint")}</p><UploadVersion wsId={id} label={t("upload_file")} /></Card>}
      <DocumentList docs={docs} summarize />
      {ws.can.edit && docs.filter((d) => d.is_latest).length > 0 && (
        <Card className="space-y-1 text-sm">
          <h2 className="font-semibold">{t("new_version")}</h2>
          {docs.filter((d) => d.is_latest).map((d) => <div key={d.id} className="flex items-center justify-between gap-2"><span>{d.filename} (v{d.version})</span><UploadVersion wsId={id} previousId={d.id} label={t("upload_new_version")} /></div>)}
        </Card>
      )}
    </div>
  );
}
