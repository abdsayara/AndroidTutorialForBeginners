"use client";
import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/routing";
import { api } from "@/lib/api/client";
import { Button, Card, Textarea } from "@/components/ui";
import { useErrorText } from "./use-api-error";

interface Props {
  subjectType: "challenge" | "project";
  subjectId: string;
  request: { id: string; status: "pending" | "approved" | "rejected" } | null;
  nda: { version: string; text_ar: string; text_en: string };
}

/** FR-0.5/0.6: request access → owner approves → user accepts the NDA → details appear. */
export function AccessPanel({ subjectType, subjectId, request, nda }: Props) {
  const t = useTranslations("access");
  const locale = useLocale();
  const router = useRouter();
  const errText = useErrorText();
  const [msg, setMsg] = useState("");
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<unknown>) => start(async () => { setErr(null); try { await fn(); router.refresh(); } catch (e) { setErr(errText(e)); } });

  return (
    <Card className="space-y-3 border-amber-300 bg-amber-50/60">
      <h2 className="font-semibold">{t("title")}</h2>
      <p className="text-sm text-muted-foreground">{t("explain")}</p>
      {!request || request.status === "rejected" ? (
        <>
          {request?.status === "rejected" && <p className="text-sm text-destructive">{t("rejected")}</p>}
          <label htmlFor="access-msg" className="sr-only">{t("message")}</label>
          <Textarea id="access-msg" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={t("message_placeholder")} />
          <Button disabled={pending} onClick={() => run(() => api("/access-requests", { json: { subject_type: subjectType, subject_id: subjectId, message: msg || undefined } }))}>{t("request")}</Button>
        </>
      ) : request.status === "pending" ? (
        <p className="text-sm font-medium">{t("pending")}</p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium text-emerald-800">{t("approved")}</p>
          <div className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-md border border-border bg-card p-3 text-sm" tabIndex={0}>{locale === "ar" ? nda.text_ar : nda.text_en}</div>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" />
            <span>{t("agree", { version: nda.version })}</span>
          </label>
          <Button disabled={!agree || pending} onClick={() => run(() => api("/nda/accept", { json: { access_request_id: request.id, nda_version: nda.version } }))}>{t("accept_nda")}</Button>
        </div>
      )}
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
    </Card>
  );
}
