"use client";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api/client";
import { Badge, Button } from "@/components/ui";
import { useErrorText } from "./use-api-error";

/** FR-5.1 */
export function SummarizeButton({ documentId }: { documentId: string }) {
  const t = useTranslations("assistant");
  const tAi = useTranslations("ai");
  const errText = useErrorText();
  const [res, setRes] = useState<{ summary: string; key_points: string[]; keywords: string[] } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="sm:max-w-md">
      {!res && <Button size="sm" variant="outline" disabled={pending} onClick={() => start(async () => { try { setRes(await api("/assistant/summarize", { json: { document_id: documentId } })); } catch (e) { setErr(errText(e)); } })}>{pending ? t("thinking") : t("summarize")}</Button>}
      {err && <p role="alert" className="text-xs text-destructive">{err}</p>}
      {res && (
        <div className="space-y-2 rounded-md bg-violet-50 p-3 text-sm">
          <Badge tone="ai">✦ {tAi("badge")}</Badge>
          <p>{res.summary}</p>
          <ul className="list-disc ps-5">{res.key_points.map((k, i) => <li key={i}>{k}</li>)}</ul>
          <p className="text-xs text-muted-foreground">{res.keywords.join(" · ")}</p>
        </div>
      )}
    </div>
  );
}
