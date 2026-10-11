"use client";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/routing";
import { api } from "@/lib/api/client";
import { Badge, Button, Card, Select, Textarea } from "@/components/ui";
import { useErrorText } from "@/components/domain/use-api-error";

interface CaseT { id: string; stage: string; pathway: string; notes: string | null; checklist: Record<string, { key: string; label?: string; done: boolean }[]>; project: { id: string; title: string; trl: number | null } }

/** FR-6.2/6.3: Kanban by stage, editable checklist and coordinator notes. */
export function CommercializationBoard({ board, stages, projects }: { board: Record<string, CaseT[]>; stages: readonly string[]; projects: { id: string; title: string }[] }) {
  const t = useTranslations("commercialization");
  const te = useTranslations("enums");
  const router = useRouter();
  const errText = useErrorText();
  const [open, setOpen] = useState<string | null>(null);
  const [newCase, setNewCase] = useState({ project_id: "", pathway: "licensing" });
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const call = (path: string, method: string, json: unknown) => start(async () => { setErr(null); try { await api(path, { method, json }); router.refresh(); } catch (e) { setErr(errText(e)); } });

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-end gap-2">
        <div className="min-w-48 flex-1"><label htmlFor="cp" className="text-sm font-medium">{t("project")}</label><Select id="cp" value={newCase.project_id} onChange={(e) => setNewCase({ ...newCase, project_id: e.target.value })}><option value="">—</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</Select></div>
        <div><label htmlFor="pw" className="text-sm font-medium">{t("pathway")}</label><Select id="pw" value={newCase.pathway} onChange={(e) => setNewCase({ ...newCase, pathway: e.target.value })}>{["licensing", "startup", "product_sale", "technical_service", "process_improvement"].map((p) => <option key={p} value={p}>{te(`pathway.${p}`)}</option>)}</Select></div>
        <Button disabled={pending || !newCase.project_id} onClick={() => call("/commercialization", "POST", newCase)}>{t("open_case")}</Button>
      </Card>
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {stages.map((s, i) => (
          <div key={s} className="w-72 shrink-0 rounded-lg bg-muted/60 p-2">
            <h2 className="mb-2 px-1 text-sm font-semibold"><span className="num">{i + 1}.</span> {te(`stage.${s}`)} <span className="num text-muted-foreground">({board[s]?.length ?? 0})</span></h2>
            <ul className="space-y-2">
              {(board[s] ?? []).map((c) => {
                const items = c.checklist[c.stage] ?? [];
                return (
                  <li key={c.id} className="rounded-md border border-border bg-card p-2 text-sm">
                    <button type="button" className="w-full text-start font-medium hover:underline" onClick={() => setOpen(open === c.id ? null : c.id)} aria-expanded={open === c.id}>{c.project.title}</button>
                    <div className="mt-1 flex flex-wrap gap-1"><Badge tone="muted">{te(`pathway.${c.pathway}`)}</Badge><span className="num text-xs text-muted-foreground">{items.filter((x) => x.done).length}/{items.length}</span></div>
                    {open === c.id && (
                      <div className="mt-2 space-y-2">
                        <ul className="space-y-1">
                          {items.map((it, j) => (
                            <li key={it.key}><label className="flex items-center gap-2"><input type="checkbox" checked={it.done} onChange={(e) => call(`/commercialization/${c.id}`, "PATCH", { checklist: { [c.stage]: items.map((x, k) => (k === j ? { ...x, done: e.target.checked } : x)) } })} />{it.label ?? t(`checklist.${it.key}`)}</label></li>
                          ))}
                        </ul>
                        <Textarea aria-label={t("notes")} defaultValue={c.notes ?? ""} onChange={(e) => setNotes({ ...notes, [c.id]: e.target.value })} />
                        <div className="flex flex-wrap gap-1">
                          <Button size="sm" variant="outline" disabled={pending} onClick={() => call(`/commercialization/${c.id}`, "PATCH", { notes: notes[c.id] ?? c.notes ?? "" })}>{t("save_notes")}</Button>
                          {i > 0 && <Button size="sm" variant="ghost" disabled={pending} onClick={() => call(`/commercialization/${c.id}`, "PATCH", { stage: stages[i - 1] })}>{t("prev_stage")}</Button>}
                          {i < stages.length - 1 && <Button size="sm" disabled={pending} onClick={() => call(`/commercialization/${c.id}`, "PATCH", { stage: stages[i + 1] })}>{t("next_stage")}</Button>}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
