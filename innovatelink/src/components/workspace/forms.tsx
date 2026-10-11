"use client";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/routing";
import { api, uploadFile } from "@/lib/api/client";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui";
import { useErrorText } from "@/components/domain/use-api-error";

function useRun() {
  const router = useRouter();
  const errText = useErrorText();
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return { err, pending, run: (fn: () => Promise<unknown>, after?: () => void) => start(async () => { setErr(null); try { await fn(); after?.(); router.refresh(); } catch (e) { setErr(errText(e)); } }) };
}
const Err = ({ e }: { e: string | null }) => (e ? <p role="alert" className="text-sm text-destructive">{e}</p> : null);

/** FR-4.2 setup: agreement upload + IpRecord. */
export function SetupForm({ wsId, hasAgreement, ip }: { wsId: string; hasAgreement: boolean; ip: { ip_status: string; owners: { name: string; share: number }[]; background_ip?: string | null } | null }) {
  const t = useTranslations("workspace");
  const te = useTranslations("enums");
  const r = useRun();
  const [owners, setOwners] = useState(ip?.owners ?? [{ name: "", share: 50 }, { name: "", share: 50 }]);
  const [status, setStatus] = useState(ip?.ip_status ?? "none");
  const [bg, setBg] = useState(ip?.background_ip ?? "");
  const [agreementId, setAgreementId] = useState<string | null>(null);
  const total = owners.reduce((s, o) => s + (Number(o.share) || 0), 0);
  return (
    <Card className="space-y-4">
      <h2 className="font-semibold">{t("setup_title")}</h2>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">1. {t("agreement")} {hasAgreement && "✓"}</h3>
        <input type="file" accept="application/pdf" aria-label={t("upload_agreement")} onChange={(e) => { const f = e.target.files?.[0]; if (f) r.run(async () => { const d = await uploadFile(f, "workspace", wsId); await api(`/workspaces/${wsId}/agreement`, { method: "PUT", json: { document_id: d.id } }); setAgreementId(d.id); }); }} className="block text-sm" />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">2. {t("ip_record")} {ip && "✓"}</h3>
        <Field label={t("ip_status")} htmlFor="ips"><Select id="ips" value={status} onChange={(e) => setStatus(e.target.value)}>{["none", "disclosed", "filed", "granted", "licensed"].map((x) => <option key={x} value={x}>{te(`ip_status.${x}`)}</option>)}</Select></Field>
        <fieldset className="space-y-2">
          <legend className="text-sm">{t("owners")}</legend>
          {owners.map((o, i) => (
            <div key={i} className="flex gap-2">
              <Input aria-label={t("owner_name")} value={o.name} onChange={(e) => setOwners(owners.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder={t("owner_name")} />
              <Input aria-label={t("share")} type="number" min={0} max={100} className="w-24" value={o.share} onChange={(e) => setOwners(owners.map((x, j) => (j === i ? { ...x, share: Number(e.target.value) } : x)))} />
            </div>
          ))}
          <div className="flex items-center gap-3 text-sm"><Button type="button" variant="ghost" size="sm" onClick={() => setOwners([...owners, { name: "", share: 0 }])}>+ {t("add_owner")}</Button><span className={`num ${total === 100 ? "text-emerald-700" : "text-destructive"}`}>{t("total", { n: total })}</span></div>
        </fieldset>
        <Field label={t("background_ip")} htmlFor="bg"><Textarea id="bg" value={bg} onChange={(e) => setBg(e.target.value)} /></Field>
        <Button disabled={r.pending || total !== 100} onClick={() => r.run(() => api(`/workspaces/${wsId}/ip`, { method: "PUT", json: { ip_status: status, owners, background_ip: bg || undefined, ...(ip ? { agreement_doc_id: agreementId ?? undefined } : {}) } }))}>{t("save_ip")}</Button>
        {ip && <p className="text-xs text-muted-foreground">{t("ip_change_note")}</p>}
      </div>
      <Err e={r.err} />
    </Card>
  );
}

export function CourseForm({ wsId, course, semester }: { wsId: string; course: string; semester: string }) {
  const t = useTranslations("workspace");
  const r = useRun();
  const [c, setC] = useState(course);
  const [s, setS] = useState(semester);
  return (
    <form className="flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); r.run(() => api(`/workspaces/${wsId}/course`, { method: "PUT", json: { course_code: c, semester: s } })); }}>
      <Field label={t("course_code")} htmlFor="cc"><Input id="cc" value={c} onChange={(e) => setC(e.target.value)} className="w-32" /></Field>
      <Field label={t("semester")} htmlFor="sem"><Input id="sem" value={s} onChange={(e) => setS(e.target.value)} className="w-32" /></Field>
      <Button type="submit" variant="outline" disabled={r.pending}>{t("link_course")}</Button>
      <Err e={r.err} />
    </form>
  );
}

interface TaskT { id: string; title: string; status: string; assignee_id: string | null; due_date: string | null }
interface MilestoneT { id: string; title: string; status: string; due_date: string | null; tasks: TaskT[] }

/** FR-4.3: milestones & tasks as a list and a Kanban board. */
export function TasksBoard({ wsId, milestones, members, editable }: { wsId: string; milestones: MilestoneT[]; members: { id: string; name: string }[]; editable: boolean }) {
  const t = useTranslations("workspace");
  const te = useTranslations("enums");
  const r = useRun();
  const [view, setView] = useState<"list" | "kanban">("list");
  const [ms, setMs] = useState({ title: "", due_date: "" });
  const [task, setTask] = useState({ milestone_id: milestones[0]?.id ?? "", title: "", assignee_id: "" });
  const all = milestones.flatMap((m) => m.tasks.map((x) => ({ ...x, milestone: m.title })));
  const name = (id: string | null) => members.find((m) => m.id === id)?.name ?? "—";
  const move = (id: string, status: string) => r.run(() => api(`/workspaces/${wsId}/tasks/${id}`, { method: "PATCH", json: { status } }));
  return (
    <div className="space-y-4">
      <div className="flex gap-2" role="tablist">
        {(["list", "kanban"] as const).map((v) => <Button key={v} role="tab" aria-selected={view === v} size="sm" variant={view === v ? "default" : "outline"} onClick={() => setView(v)}>{t(`view_${v}`)}</Button>)}
      </div>
      {view === "list" ? milestones.map((m) => (
        <Card key={m.id} className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold">{m.title} {m.due_date && <span className="num text-xs font-normal text-muted-foreground">({m.due_date.slice(0, 10)})</span>}</h3>
            {editable ? <Select aria-label={t("milestone_status")} className="h-8 w-36" value={m.status} onChange={(e) => r.run(() => api(`/workspaces/${wsId}/milestones/${m.id}`, { method: "PATCH", json: { status: e.target.value } }))}>{["pending", "in_progress", "done"].map((s) => <option key={s} value={s}>{te(`milestone_status.${s}`)}</option>)}</Select> : te(`milestone_status.${m.status}`)}
          </div>
          <ul className="space-y-1">
            {m.tasks.map((x) => (
              <li key={x.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted/50 px-2 py-1.5 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" disabled={!editable} checked={x.status === "done"} onChange={(e) => move(x.id, e.target.checked ? "done" : "todo")} /><span className={x.status === "done" ? "line-through" : ""}>{x.title}</span></label>
                <span className="text-xs text-muted-foreground">{name(x.assignee_id)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )) : (
        <div className="grid gap-3 md:grid-cols-3">
          {(["todo", "doing", "done"] as const).map((col) => (
            <div key={col} className="rounded-lg bg-muted/60 p-2">
              <h3 className="mb-2 px-1 text-sm font-semibold">{te(`task_status.${col}`)}</h3>
              <ul className="space-y-2">
                {all.filter((x) => x.status === col).map((x) => (
                  <li key={x.id} className="rounded-md border border-border bg-card p-2 text-sm">
                    <div className="font-medium">{x.title}</div>
                    <div className="text-xs text-muted-foreground">{x.milestone} · {name(x.assignee_id)}</div>
                    {editable && <div className="mt-1 flex gap-1">{(["todo", "doing", "done"] as const).filter((s) => s !== col).map((s) => <button key={s} type="button" className="rounded border border-border px-1.5 text-xs hover:bg-muted" onClick={() => move(x.id, s)}>→ {te(`task_status.${s}`)}</button>)}</div>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {editable && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-2">
            <h3 className="font-semibold">{t("new_milestone")}</h3>
            <Input aria-label={t("title")} placeholder={t("title")} value={ms.title} onChange={(e) => setMs({ ...ms, title: e.target.value })} />
            <Input aria-label={t("due_date")} type="date" value={ms.due_date} onChange={(e) => setMs({ ...ms, due_date: e.target.value })} />
            <Button size="sm" disabled={r.pending || ms.title.length < 2} onClick={() => r.run(() => api(`/workspaces/${wsId}/milestones`, { json: { title: ms.title, due_date: ms.due_date || null, order: milestones.length } }), () => setMs({ title: "", due_date: "" }))}>{t("add")}</Button>
          </Card>
          <Card className="space-y-2">
            <h3 className="font-semibold">{t("new_task")}</h3>
            <Select aria-label={t("milestone")} value={task.milestone_id} onChange={(e) => setTask({ ...task, milestone_id: e.target.value })}>{milestones.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</Select>
            <Input aria-label={t("title")} placeholder={t("title")} value={task.title} onChange={(e) => setTask({ ...task, title: e.target.value })} />
            <Select aria-label={t("assignee")} value={task.assignee_id} onChange={(e) => setTask({ ...task, assignee_id: e.target.value })}><option value="">{t("unassigned")}</option>{members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</Select>
            <Button size="sm" disabled={r.pending || !task.milestone_id || task.title.length < 2} onClick={() => r.run(() => api(`/workspaces/${wsId}/tasks`, { json: { milestone_id: task.milestone_id, title: task.title, assignee_id: task.assignee_id || null } }), () => setTask({ ...task, title: "" }))}>{t("add")}</Button>
          </Card>
        </div>
      )}
      <Err e={r.err} />
    </div>
  );
}

export function UploadVersion({ wsId, previousId, label }: { wsId: string; previousId?: string; label: string }) {
  const r = useRun();
  const t = useTranslations("workspace");
  return (
    <span className="inline-flex flex-col">
      <label className="cursor-pointer text-sm text-primary underline">
        {label}
        <input type="file" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; if (f.size > 50 * 1024 * 1024) return; r.run(() => uploadFile(f, "workspace", wsId, previousId)); e.target.value = ""; }} />
      </label>
      {r.pending && <span className="text-xs text-muted-foreground">{t("uploading")}</span>}
      <Err e={r.err} />
    </span>
  );
}

export function MeetingForm({ wsId }: { wsId: string }) {
  const t = useTranslations("workspace");
  const r = useRun();
  const [v, setV] = useState({ held_at: new Date().toISOString().slice(0, 10), attendees: "", notes: "", action_items: "" });
  return (
    <Card className="space-y-2">
      <h2 className="font-semibold">{t("new_meeting")}</h2>
      <Field label={t("held_at")} htmlFor="ha"><Input id="ha" type="date" value={v.held_at} onChange={(e) => setV({ ...v, held_at: e.target.value })} /></Field>
      <Field label={t("attendees")} htmlFor="at" hint={t("comma_hint")}><Input id="at" value={v.attendees} onChange={(e) => setV({ ...v, attendees: e.target.value })} /></Field>
      <Field label={t("notes")} htmlFor="nt"><Textarea id="nt" rows={5} value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} /></Field>
      <Field label={t("action_items")} htmlFor="ai" hint={t("lines_hint")}><Textarea id="ai" value={v.action_items} onChange={(e) => setV({ ...v, action_items: e.target.value })} /></Field>
      <Button disabled={r.pending || v.notes.length < 2} onClick={() => r.run(() => api(`/workspaces/${wsId}/meetings`, { json: { held_at: v.held_at, attendees: v.attendees.split(/[,،]/).map((x) => x.trim()).filter(Boolean), notes: v.notes, action_items: v.action_items.split("\n").map((x) => x.trim()).filter(Boolean) } }), () => setV({ ...v, notes: "", action_items: "", attendees: "" }))}>{t("save")}</Button>
      <Err e={r.err} />
    </Card>
  );
}

/** FR-4.4 */
export function UpdateForm({ wsId }: { wsId: string }) {
  const t = useTranslations("workspace");
  const r = useRun();
  const [v, setV] = useState({ body: "", prototype_stage: "", test_results: "" });
  return (
    <Card className="space-y-2">
      <h2 className="font-semibold">{t("new_update")}</h2>
      <Field label={t("update_body")} htmlFor="ub"><Textarea id="ub" value={v.body} onChange={(e) => setV({ ...v, body: e.target.value })} /></Field>
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label={t("prototype_stage")} htmlFor="ps"><Input id="ps" value={v.prototype_stage} onChange={(e) => setV({ ...v, prototype_stage: e.target.value })} /></Field>
        <Field label={t("test_results")} htmlFor="tr"><Input id="tr" value={v.test_results} onChange={(e) => setV({ ...v, test_results: e.target.value })} /></Field>
      </div>
      <Button disabled={r.pending || v.body.length < 2} onClick={() => r.run(() => api(`/workspaces/${wsId}/updates`, { json: { body: v.body, prototype_stage: v.prototype_stage || undefined, test_results: v.test_results || undefined } }), () => setV({ body: "", prototype_stage: "", test_results: "" }))}>{t("post")}</Button>
      <Err e={r.err} />
    </Card>
  );
}

const SECTIONS = ["summary", "solution", "results", "technical_recommendations", "business_recommendations", "next_steps"] as const;

/** FR-4.6 report editor + FR-4.7 closing with rating and documented impact. */
export function ReportForm({ wsId, report, editable, canClose, locale }: { wsId: string; report: Record<string, string>; editable: boolean; canClose: boolean; locale: string }) {
  const t = useTranslations("workspace");
  const r = useRun();
  const [v, setV] = useState<Record<string, string>>(Object.fromEntries(SECTIONS.map((s) => [s, report[s] ?? ""])));
  const [close, setClose] = useState({ outcome: "solved", rating: 5, rating_comment: "", savings_ils: "", productivity_pct: "", waste_reduction_tons: "", water_saved_m3: "", energy_saved_kwh: "" });
  const num = (x: string) => (x === "" ? undefined : Number(x));
  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">{t("report_title")}</h2>
          <a href={`/api/v1/workspaces/${wsId}/final-report/pdf?locale=${locale}`} className="text-sm text-primary underline">{t("export_pdf")}</a>
        </div>
        {SECTIONS.map((s) => <Field key={s} label={t(`report.sections.${s}`)} htmlFor={`r-${s}`}><Textarea id={`r-${s}`} readOnly={!editable} value={v[s]} onChange={(e) => setV({ ...v, [s]: e.target.value })} /></Field>)}
        {editable && <Button disabled={r.pending} onClick={() => r.run(() => api(`/workspaces/${wsId}/final-report`, { method: "PUT", json: v }))}>{t("save_report")}</Button>}
      </Card>
      {canClose && (
        <Card className="space-y-3">
          <h2 className="font-semibold">{t("close_title")}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("outcome")} htmlFor="oc"><Select id="oc" value={close.outcome} onChange={(e) => setClose({ ...close, outcome: e.target.value })}><option value="solved">{t("outcome_solved")}</option><option value="closed">{t("outcome_closed")}</option></Select></Field>
            <fieldset><legend className="mb-1 text-sm font-medium">{t("rating")}</legend><div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <label key={n} className={`num cursor-pointer rounded-md border px-3 py-1.5 ${close.rating === n ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}><input type="radio" className="sr-only" checked={close.rating === n} onChange={() => setClose({ ...close, rating: n })} />{n}</label>)}</div></fieldset>
            <Field label={t("rating_comment")} htmlFor="rc" className="sm:col-span-2"><Textarea id="rc" value={close.rating_comment} onChange={(e) => setClose({ ...close, rating_comment: e.target.value })} /></Field>
          </div>
          <fieldset className="grid gap-2 sm:grid-cols-3">
            <legend className="mb-1 text-sm font-medium">{t("impact")}</legend>
            {(["savings_ils", "productivity_pct", "waste_reduction_tons", "water_saved_m3", "energy_saved_kwh"] as const).map((k) => <Field key={k} label={t(`impact_${k}`)} htmlFor={k}><Input id={k} type="number" inputMode="decimal" value={close[k]} onChange={(e) => setClose({ ...close, [k]: e.target.value })} /></Field>)}
          </fieldset>
          <Button variant="destructive" disabled={r.pending} onClick={() => { if (window.confirm(t("close_confirm"))) r.run(() => api(`/workspaces/${wsId}/close`, { json: { outcome: close.outcome, rating: close.rating, rating_comment: close.rating_comment || undefined, impact: { savings_ils: num(close.savings_ils), productivity_pct: num(close.productivity_pct), waste_reduction_tons: num(close.waste_reduction_tons), water_saved_m3: num(close.water_saved_m3), energy_saved_kwh: num(close.energy_saved_kwh) } } })); }}>{t("close_workspace")}</Button>
        </Card>
      )}
      <Err e={r.err} />
    </div>
  );
}
