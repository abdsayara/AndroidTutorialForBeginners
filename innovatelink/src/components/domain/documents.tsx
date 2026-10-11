import { getLocale, getTranslations } from "next-intl/server";
import { formatDate } from "@/lib/utils";
import { Badge, Empty } from "@/components/ui";
import { SummarizeButton } from "./summarize-button";

interface Doc { id: string; filename: string; mime: string; size: number; version: number; created_at: Date; is_latest: boolean }

export async function DocumentList({ docs, summarize = false }: { docs: Doc[]; summarize?: boolean }) {
  const t = await getTranslations("files");
  const locale = await getLocale();
  if (docs.length === 0) return <Empty>{t("empty")}</Empty>;
  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-card">
      {docs.map((d) => (
        <li key={d.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <a href={`/api/v1/files/${d.id}/download?redirect=1`} className="font-medium text-primary hover:underline">{d.filename}</a>
            <div className="num text-xs text-muted-foreground">
              {formatDate(d.created_at, locale)} · {(d.size / 1024).toFixed(0)} KB · v{d.version} {!d.is_latest && <Badge tone="muted" className="ms-1">{t("old_version")}</Badge>}
            </div>
          </div>
          {summarize && d.is_latest && ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"].includes(d.mime) && <SummarizeButton documentId={d.id} />}
        </li>
      ))}
    </ul>
  );
}
