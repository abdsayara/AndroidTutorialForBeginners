"use client";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/routing";
import { api } from "@/lib/api/client";
import { Button, Input } from "@/components/ui";
import { useErrorText } from "@/components/domain/use-api-error";

/** FR-1.4 / FR-3.2: approve, or return with a mandatory note. */
export function ReviewDecision({ path, approveJson, returnKey, approveLabel, returnLabel }: { path: string; approveJson: unknown; returnKey: "needs_info" | "reject"; approveLabel: string; returnLabel: string }) {
  const t = useTranslations("review");
  const router = useRouter();
  const errText = useErrorText();
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const send = (json: unknown) => start(async () => { setErr(null); try { await api(path, { json }); router.refresh(); } catch (e) { setErr(errText(e)); } });
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button size="sm" disabled={pending} onClick={() => send(approveJson)}>{approveLabel}</Button>
        <Button size="sm" variant="outline" disabled={pending} onClick={() => setOpen(!open)}>{returnLabel}</Button>
      </div>
      {open && (
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); send({ decision: returnKey, note }); }}>
          <label className="sr-only" htmlFor={`note-${path}`}>{t("note")}</label>
          <Input id={`note-${path}`} required minLength={5} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("note_placeholder")} />
          <Button size="sm" type="submit" disabled={pending}>{t("send")}</Button>
        </form>
      )}
      {err && <p role="alert" className="text-xs text-destructive">{err}</p>}
    </div>
  );
}
