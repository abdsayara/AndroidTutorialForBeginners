"use client";
import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { api } from "@/lib/api/client";
import { Badge, Button, Card, Input } from "@/components/ui";
import { useErrorText } from "./use-api-error";

interface Citation { source_type: string; source_id: string; page?: number | null }
interface AskResult { insufficient: boolean; message: string | null; paragraphs: { text: string; citations: Citation[] }[]; run_id: string | null }
interface ActionResult { title: string; items: { heading: string; body: string; source_id?: string }[]; run_id: string }

function citationHref(c: Citation, ctx: { challengeId?: string; workspaceId?: string }) {
  if (c.source_type === "document") return `/api/v1/files/${c.source_id}/download?redirect=1`;
  if (c.source_type === "challenge") return `/challenges/${c.source_id}`;
  if (c.source_type === "project") return `/projects/${c.source_id}`;
  if (ctx.workspaceId) return `/workspaces/${ctx.workspaceId}/${c.source_type === "meeting" ? "meetings" : "updates"}`;
  return "#";
}

/** FR-5.2/5.3/5.4: Q&A with citations + ready-made actions; every output carries the AI badge. */
export function AssistantPanel({ challengeId, workspaceId, actions = false }: { challengeId?: string; workspaceId?: string; actions?: boolean }) {
  const t = useTranslations("assistant");
  const tAi = useTranslations("ai");
  const locale = useLocale();
  const errText = useErrorText();
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState<AskResult | null>(null);
  const [action, setAction] = useState<ActionResult | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [reported, setReported] = useState(false);
  const [pending, start] = useTransition();
  const runId = action?.run_id ?? answer?.run_id;

  const go = (fn: () => Promise<void>) => start(async () => { setErr(null); setReported(false); try { await fn(); } catch (e) { setErr(errText(e)); } });
  const prefix = (path: string) => `/${locale}${path}`;

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">{t("title")}</h2>
        <Badge tone="ai">✦ {tAi("badge")}</Badge>
      </div>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (q.trim().length >= 3) go(async () => { setAction(null); setAnswer(await api<AskResult>("/assistant/ask", { json: { question: q, challenge_id: challengeId, workspace_id: workspaceId }, headers: { "Accept-Language": locale } })); }); }}>
        <label htmlFor="ask-q" className="sr-only">{t("question")}</label>
        <Input id="ask-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("placeholder")} />
        <Button type="submit" disabled={pending}>{t("ask")}</Button>
      </form>
      {actions && challengeId && (
        <div className="flex flex-wrap gap-2">
          {(["research_questions", "related_solutions", "project_outline"] as const).map((k) => (
            <Button key={k} variant="outline" size="sm" disabled={pending} onClick={() => go(async () => { setAnswer(null); setAction(await api<ActionResult>(`/assistant/actions/${k}`, { json: { challenge_id: challengeId } })); })}>{t(`action_${k}`)}</Button>
          ))}
        </div>
      )}
      {pending && <p className="text-sm text-muted-foreground" aria-live="polite">{t("thinking")}</p>}
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
      {answer && (
        <div className="space-y-3 rounded-md bg-violet-50 p-3 text-sm" aria-live="polite">
          {answer.insufficient ? <p>{answer.message}</p> : answer.paragraphs.map((p, i) => (
            <p key={i} className="leading-relaxed">
              {p.text}{" "}
              {p.citations.map((c, j) => (
                <a key={j} href={c.source_type === "document" ? citationHref(c, { challengeId, workspaceId }) : prefix(citationHref(c, { challengeId, workspaceId }))} className="num ms-1 rounded bg-violet-200 px-1.5 text-xs text-violet-900 hover:underline">
                  [{t(`source_${c.source_type}`)}{c.page ? ` ${t("page")} ${c.page}` : ""}]
                </a>
              ))}
            </p>
          ))}
        </div>
      )}
      {action && (
        <div className="space-y-2 rounded-md bg-violet-50 p-3 text-sm" aria-live="polite">
          <h3 className="font-semibold">{action.title}</h3>
          <ul className="space-y-2">
            {action.items.map((it, i) => (
              <li key={i}>
                <strong>{it.source_id ? <a className="hover:underline" href={prefix(`/projects/${it.source_id}`)}>{it.heading}</a> : it.heading}</strong>
                <div className="text-muted-foreground">{it.body}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {runId && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{tAi("review_note")}</span>
          {reported ? <span>{tAi("reported")}</span> : (
            <button type="button" className="underline" onClick={() => go(async () => { await api(`/ai-runs/${runId}/feedback`, { json: { report: "user_report" } }); setReported(true); })}>{tAi("report")}</button>
          )}
        </div>
      )}
    </Card>
  );
}
