"use client";
import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/routing";
import { api, ApiError, uploadFile } from "@/lib/api/client";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui";
import { useErrorText } from "@/components/domain/use-api-error";
import { IP_STATUSES, PROJECT_TYPES, SEEKING, SUPPORT_NEEDS } from "@/modules/projects/schema";

export interface ProjectFormValue {
  id?: string; status?: string; review_note?: string | null;
  type: string; title: string; public_title: string; summary: string; problem_addressed: string; sector_id: string; tags: string[];
  applications: string; team_member_ids: string[]; supervisor_id: string; trl: number | null; evidence: string; demo_url: string;
  potential_customers: string; ip_status: string; collaboration_terms: string; support_needs: string[]; seeking: string[];
  visibility: "public" | "selected_orgs" | "confidential"; visibility_org_ids: string[];
}
interface Opt { id: string; name: string }

/** FR-3.1: project profile with fields from §5. Required for publishing: title, summary, problem, sector, TRL, supervisor. */
export function ProjectForm({ initial, sectors, people, supervisors, companies, docs }: { initial: ProjectFormValue; sectors: Opt[]; people: Opt[]; supervisors: Opt[]; companies: Opt[]; docs: { id: string; filename: string }[] }) {
  const t = useTranslations("project_form");
  const te = useTranslations("enums");
  const router = useRouter();
  const errText = useErrorText();
  const [p, setP] = useState(initial);
  const [files, setFiles] = useState(docs);
  const [err, setErr] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<Record<string, string[]>>({});
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const idRef = useRef(initial.id);
  const set = <K extends keyof ProjectFormValue>(k: K, v: ProjectFormValue[K]) => { setSaved(false); setP((x) => ({ ...x, [k]: v })); };
  const toggle = (k: "support_needs" | "seeking" | "team_member_ids", v: string) => set(k, p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v]);
  const fe = (k: string) => (fieldErr[k] ? t("required") : undefined);

  const body = () => ({
    type: p.type, title: p.title, public_title: p.public_title || undefined, summary: p.summary, problem_addressed: p.problem_addressed,
    sector_id: p.sector_id || null, tags: p.tags, applications: p.applications, team_member_ids: p.team_member_ids,
    supervisor_id: p.supervisor_id || null, trl: p.trl, evidence: p.evidence, demo_url: p.demo_url, potential_customers: p.potential_customers,
    ip_status: p.ip_status, collaboration_terms: p.collaboration_terms, support_needs: p.support_needs, seeking: p.seeking,
    visibility: p.visibility, visibility_org_ids: p.visibility === "selected_orgs" ? p.visibility_org_ids : [],
  });
  async function save() {
    if (!idRef.current) {
      const r = await api<{ id: string }>("/projects", { json: body() });
      idRef.current = r.id;
      window.history.replaceState(null, "", window.location.pathname.replace(/\/new$/, `/${r.id}/edit`));
    } else await api(`/projects/${idRef.current}`, { method: "PATCH", json: body() });
    setSaved(true);
    return idRef.current;
  }
  const guarded = (fn: () => Promise<void>) => start(async () => {
    setErr(null); setFieldErr({});
    try { await fn(); } catch (e) { setErr(errText(e)); if (e instanceof ApiError && e.fields) setFieldErr(e.fields); }
  });

  return (
    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); guarded(async () => { await save(); router.refresh(); }); }}>
      {p.review_note && p.status === "draft" && <Card className="border-amber-300 bg-amber-50"><strong>{t("coordinator_note")}:</strong> {p.review_note}</Card>}
      <Card className="grid gap-4 sm:grid-cols-2">
        <h2 className="font-semibold sm:col-span-2">{t("section_basics")}</h2>
        <Field label={t("type")} htmlFor="type"><Select id="type" value={p.type} onChange={(e) => set("type", e.target.value)}>{PROJECT_TYPES.map((x) => <option key={x} value={x}>{te(`project_type.${x}`)}</option>)}</Select></Field>
        <Field label={t("sector")} htmlFor="sector" error={fe("sector_id")}><Select id="sector" value={p.sector_id} onChange={(e) => set("sector_id", e.target.value)}><option value="">—</option>{sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
        <Field label={t("title")} htmlFor="title" className="sm:col-span-2" error={fe("title")}><Input id="title" required minLength={3} value={p.title} onChange={(e) => set("title", e.target.value)} /></Field>
        <Field label={t("summary")} htmlFor="summary" className="sm:col-span-2" error={fe("summary")}><Textarea id="summary" rows={4} value={p.summary} onChange={(e) => set("summary", e.target.value)} /></Field>
        <Field label={t("problem_addressed")} htmlFor="problem" className="sm:col-span-2" error={fe("problem_addressed")}><Textarea id="problem" value={p.problem_addressed} onChange={(e) => set("problem_addressed", e.target.value)} /></Field>
        <Field label={t("applications")} htmlFor="apps" className="sm:col-span-2"><Textarea id="apps" value={p.applications} onChange={(e) => set("applications", e.target.value)} /></Field>
        <Field label={t("tags")} htmlFor="tags" hint={t("tags_hint")} className="sm:col-span-2"><Input id="tags" value={p.tags.join("، ")} onChange={(e) => set("tags", e.target.value.split(/[,،]/).map((x) => x.trim()).filter(Boolean))} /></Field>
      </Card>
      <Card className="grid gap-4 sm:grid-cols-2">
        <h2 className="font-semibold sm:col-span-2">{t("section_team")}</h2>
        <Field label={t("supervisor")} htmlFor="sup" error={fe("supervisor_id")}><Select id="sup" value={p.supervisor_id} onChange={(e) => set("supervisor_id", e.target.value)}><option value="">—</option>{supervisors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
        <fieldset className="sm:col-span-2">
          <legend className="mb-1 text-sm font-medium">{t("team")}</legend>
          <div className="grid max-h-40 gap-1 overflow-y-auto text-sm sm:grid-cols-2">{people.map((u) => <label key={u.id} className="flex items-center gap-2"><input type="checkbox" checked={p.team_member_ids.includes(u.id)} onChange={() => toggle("team_member_ids", u.id)} />{u.name}</label>)}</div>
        </fieldset>
      </Card>
      <Card className="grid gap-4 sm:grid-cols-2">
        <h2 className="font-semibold sm:col-span-2">{t("section_maturity")}</h2>
        <Field label={t("trl")} htmlFor="trl" hint={t("trl_hint")} error={fe("trl")}><Select id="trl" value={p.trl ?? ""} onChange={(e) => set("trl", e.target.value ? Number(e.target.value) : null)}><option value="">—</option>{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <option key={n} value={n}>{n} — {t(`trl_levels.${n}`)}</option>)}</Select></Field>
        <Field label={t("ip_status")} htmlFor="ip"><Select id="ip" value={p.ip_status} onChange={(e) => set("ip_status", e.target.value)}>{IP_STATUSES.map((x) => <option key={x} value={x}>{te(`ip_status.${x}`)}</option>)}</Select></Field>
        <Field label={t("evidence")} htmlFor="ev" className="sm:col-span-2"><Textarea id="ev" value={p.evidence} onChange={(e) => set("evidence", e.target.value)} /></Field>
        <Field label={t("demo_url")} htmlFor="demo"><Input id="demo" type="url" dir="ltr" value={p.demo_url} onChange={(e) => set("demo_url", e.target.value)} /></Field>
        <Field label={t("potential_customers")} htmlFor="pc"><Input id="pc" value={p.potential_customers} onChange={(e) => set("potential_customers", e.target.value)} /></Field>
        <Field label={t("collaboration_terms")} htmlFor="terms" className="sm:col-span-2"><Textarea id="terms" value={p.collaboration_terms} onChange={(e) => set("collaboration_terms", e.target.value)} /></Field>
        <fieldset><legend className="mb-1 text-sm font-medium">{t("support_needs")}</legend><div className="space-y-1 text-sm">{SUPPORT_NEEDS.map((x) => <label key={x} className="flex items-center gap-2"><input type="checkbox" checked={p.support_needs.includes(x)} onChange={() => toggle("support_needs", x)} />{te(`support.${x}`)}</label>)}</div></fieldset>
        <fieldset><legend className="mb-1 text-sm font-medium">{t("seeking")}</legend><div className="space-y-1 text-sm">{SEEKING.map((x) => <label key={x} className="flex items-center gap-2"><input type="checkbox" checked={p.seeking.includes(x)} onChange={() => toggle("seeking", x)} />{te(`seeking.${x}`)}</label>)}</div></fieldset>
      </Card>
      <Card className="space-y-3">
        <h2 className="font-semibold">{t("section_visibility")}</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          {(["public", "selected_orgs", "confidential"] as const).map((v) => (
            <label key={v} className={`flex items-center gap-2 rounded-md border p-3 text-sm ${p.visibility === v ? "border-primary bg-primary/5" : "border-border"}`}><input type="radio" checked={p.visibility === v} onChange={() => set("visibility", v)} />{te(`visibility.${v}`)}</label>
          ))}
        </div>
        {p.visibility === "selected_orgs" && <div className="grid max-h-40 gap-1 overflow-y-auto text-sm sm:grid-cols-2">{companies.map((c) => <label key={c.id} className="flex items-center gap-2"><input type="checkbox" checked={p.visibility_org_ids.includes(c.id)} onChange={() => set("visibility_org_ids", p.visibility_org_ids.includes(c.id) ? p.visibility_org_ids.filter((x) => x !== c.id) : [...p.visibility_org_ids, c.id])} />{c.name}</label>)}</div>}
        {p.visibility === "confidential" && <Field label={t("public_title")} htmlFor="pt" hint={t("public_title_hint")}><Input id="pt" value={p.public_title} onChange={(e) => set("public_title", e.target.value)} /></Field>}
      </Card>
      <Card className="space-y-2">
        <h2 className="font-semibold">{t("section_files")}</h2>
        <ul className="text-sm">{files.map((f) => <li key={f.id}>📎 {f.filename}</li>)}</ul>
        <input type="file" aria-label={t("upload")} accept=".pdf,.docx,.pptx,.png,.jpg,.jpeg,.webp" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; guarded(async () => { const id = await save(); const d = await uploadFile(f, "project", id); setFiles([...files, { id: d.id, filename: f.name }]); }); e.target.value = ""; }} className="block w-full text-sm file:me-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-primary-foreground" />
      </Card>
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" variant="outline" disabled={pending}>{t("save")}</Button>
        {(!p.status || p.status === "draft") && <Button type="button" disabled={pending} onClick={() => guarded(async () => { const id = await save(); await api(`/projects/${id}/submit`, { method: "POST" }); router.push("/dashboard"); router.refresh(); })}>{t("submit")}</Button>}
        <span className="text-xs text-muted-foreground" aria-live="polite">{pending ? t("saving") : saved ? t("saved") : ""}</span>
      </div>
    </form>
  );
}
