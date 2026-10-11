"use client";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/routing";
import { api } from "@/lib/api/client";
import { Button, Input } from "@/components/ui";
import { useErrorText } from "@/components/domain/use-api-error";

type Mode = "coordinator" | "respond" | "workspace" | "feedback";

/** Buttons for each human act on a match (FR-2.3, 2.4, 2.8, 4.1). Rejection always requires a reason. */
export function MatchActions({ matchId, modes }: { matchId: string; modes: Mode[] }) {
  const t = useTranslations("matches");
  const router = useRouter();
  const errText = useErrorText();
  const [reject, setReject] = useState<null | "coordinator" | "respond">(null);
  const [reason, setReason] = useState("");
  const [fb, setFb] = useState<boolean | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const call = (path: string, json: unknown, after?: (r: { id?: string }) => void) => start(async () => {
    setErr(null);
    try { const r = await api<{ id?: string }>(path, { json }); after?.(r); router.refresh(); } catch (e) { setErr(errText(e)); }
  });

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {modes.includes("coordinator") && <>
          <Button size="sm" disabled={pending} onClick={() => call(`/matches/${matchId}/shortlist`, { decision: "shortlist" })}>{t("shortlist")}</Button>
          <Button size="sm" variant="outline" disabled={pending} onClick={() => setReject("coordinator")}>{t("reject")}</Button>
        </>}
        {modes.includes("respond") && <>
          <Button size="sm" disabled={pending} onClick={() => call(`/matches/${matchId}/respond`, { decision: "accept" })}>{t("accept")}</Button>
          <Button size="sm" variant="outline" disabled={pending} onClick={() => setReject("respond")}>{t("decline")}</Button>
        </>}
        {modes.includes("workspace") && (
          <Button size="sm" disabled={pending} onClick={() => call("/workspaces", { match_id: matchId }, (r) => r.id && router.push(`/workspaces/${r.id}`))}>{t("create_workspace")}</Button>
        )}
        {modes.includes("feedback") && (fb === null ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            {t("was_useful")}
            <Button size="sm" variant="ghost" disabled={pending} onClick={() => call(`/matches/${matchId}/feedback`, { useful: true }, () => setFb(true))}>👍</Button>
            <Button size="sm" variant="ghost" disabled={pending} onClick={() => call(`/matches/${matchId}/feedback`, { useful: false }, () => setFb(false))}>👎</Button>
          </span>
        ) : <span className="text-xs text-muted-foreground">{t("thanks")}</span>)}
      </div>
      {reject && (
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); call(reject === "coordinator" ? `/matches/${matchId}/shortlist` : `/matches/${matchId}/respond`, { decision: "reject", rejection_reason: reason }, () => setReject(null)); }}>
          <label htmlFor={`reason-${matchId}`} className="sr-only">{t("reason")}</label>
          <Input id={`reason-${matchId}`} required minLength={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("reason_placeholder")} />
          <Button size="sm" type="submit" variant="destructive" disabled={pending}>{t("confirm_reject")}</Button>
        </form>
      )}
      {err && <p role="alert" className="text-xs text-destructive">{err}</p>}
    </div>
  );
}

/** FR-2.5: coordinator adds a manual match. */
export function ManualMatchForm({ challengeId, options }: { challengeId: string; options: { type: "project" | "researcher" | "lab"; id: string; label: string }[] }) {
  const t = useTranslations("matches");
  const router = useRouter();
  const errText = useErrorText();
  const [sel, setSel] = useState("");
  const [rationale, setRationale] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); const [type, id] = sel.split(":"); start(async () => {
      setErr(null);
      try { await api(`/challenges/${challengeId}/matches`, { json: { target_type: type, target_id: id, rationale } }); setSel(""); setRationale(""); router.refresh(); } catch (er) { setErr(errText(er)); }
    }); }}>
      <label htmlFor="manual-target" className="text-sm font-medium">{t("manual_target")}</label>
      <select id="manual-target" required value={sel} onChange={(e) => setSel(e.target.value)} className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm">
        <option value="">—</option>
        {options.map((o) => <option key={`${o.type}:${o.id}`} value={`${o.type}:${o.id}`}>{o.label}</option>)}
      </select>
      <label htmlFor="manual-rationale" className="text-sm font-medium">{t("rationale")}</label>
      <Input id="manual-rationale" required minLength={10} value={rationale} onChange={(e) => setRationale(e.target.value)} />
      <Button type="submit" size="sm" disabled={pending}>{t("add_manual")}</Button>
      {err && <p role="alert" className="text-xs text-destructive">{err}</p>}
    </form>
  );
}
