"use client";
import { useMemo, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/routing";
import { api, ApiError, uploadFile } from "@/lib/api/client";
import { Badge, Button, Card, Field, Input, Select, Textarea } from "@/components/ui";
import { useErrorText } from "@/components/domain/use-api-error";
import { CATEGORIES } from "@/modules/challenges/schema";

export interface WizardChallenge {
  id?: string;
  title: string; category: string; sector_id: string; tags: string[];
  problem_statement: string; current_situation: string; desired_outcome: string;
  constraints: string; business_impact: { type?: string; estimate?: number; unit?: string; confidence?: string };
  resources_offered: { data?: boolean; site_access?: boolean; materials?: boolean; funding?: boolean; notes?: string };
  expected_duration_months: number | null;
  public_title: string; visibility: "public" | "selected_orgs" | "confidential"; visibility_org_ids: string[];
  status?: string; review_note?: string | null;
  ai_diagnosis?: Diagnosis | null;
}
interface Diagnosis {
  improved_statement: string; missing_info_questions: string[]; suggested_category: string; suggested_tags: string[];
  impact_estimate: { type: string; reasoning: string; confidence: string }; suggested_public_title: string; clarity_score: number; run_id?: string;
}
interface Opt { id: string; name: string }

const STEPS = ["basics", "problem", "impact", "attachments", "confidentiality"] as const;

/** FR-1.1: 5-step form, autosaved as draft on every step. FR-1.2/1.3: AI diagnosis shown next to the user's text. */
export function ChallengeWizard({ initial, sectors, universities, docs }: { initial: WizardChallenge; sectors: Opt[]; universities: Opt[]; docs: { id: string; filename: string }[] }) {
  const t = useTranslations("wizard");
  const te = useTranslations("enums");
  const tAi = useTranslations("ai");
  const router = useRouter();
  const errText = useErrorText();
  const [c, setC] = useState<WizardChallenge>(initial);
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<Record<string, string[]>>({});
  const [diag, setDiag] = useState<Diagnosis | null>(initial.ai_diagnosis ?? null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [files, setFiles] = useState(docs);
  const [pending, start] = useTransition();
  const idRef = useRef(initial.id);
  const editable = !c.status || c.status === "draft" || c.status === "needs_info";

  const payload = useMemo(() => ({
    title: c.title, category: c.category || undefined, sector_id: c.sector_id || null, tags: c.tags,
    problem_statement: c.problem_statement, current_situation: c.current_situation, desired_outcome: c.desired_outcome,
    constraints: c.constraints, business_impact: c.business_impact, resources_offered: c.resources_offered,
    expected_duration_months: c.expected_duration_months, public_title: c.public_title || undefined,
    visibility: c.visibility, visibility_org_ids: c.visibility === "selected_orgs" ? c.visibility_org_ids : [],
  }), [c]);

  async function save(): Promise<string> {
    if (!idRef.current) {
      const created = await api<{ id: string }>("/challenges", { json: payload });
      idRef.current = created.id;
      window.history.replaceState(null, "", window.location.pathname.replace(/\/new$/, `/${created.id}/edit`));
    } else {
      await api(`/challenges/${idRef.current}`, { method: "PATCH", json: payload });
    }
    setSaved(new Date().toLocaleTimeString("en-GB"));
    return idRef.current;
  }

  const guarded = (fn: () => Promise<void>) => start(async () => {
    setErr(null); setFieldErr({});
    try { await fn(); } catch (e) { setErr(errText(e)); if (e instanceof ApiError && e.fields) setFieldErr(e.fields); }
  });
  const go = (to: number) => guarded(async () => { if (c.title.trim().length >= 3) await save(); setStep(to); });
  const set = <K extends keyof WizardChallenge>(k: K, v: WizardChallenge[K]) => setC((p) => ({ ...p, [k]: v }));
  const fe = (k: string) => (fieldErr[k] ? t("required") : undefined);

  const suggestion = (key: string, label: string, value: string, apply: () => void) =>
    !dismissed.has(key) && (
      <div className="rounded-md border border-violet-200 bg-violet-50 p-3 text-sm">
        <div className="mb-1 font-medium text-violet-900">{label}</div>
        <p className="whitespace-pre-wrap">{value}</p>
        <div className="mt-2 flex gap-2">
          <Button size="sm" type="button" onClick={() => { apply(); setDismissed(new Set(dismissed).add(key)); }}>{t("accept")}</Button>
          <Button size="sm" type="button" variant="ghost" onClick={() => setDismissed(new Set(dismissed).add(key))}>{t("ignore")}</Button>
        </div>
      </div>
    );

  const DiagnosisPanel = diag && (
    <Card className="space-y-3 border-violet-200">
      <div className="flex items-center justify-between"><h3 className="font-semibold">{t("diagnosis_title")}</h3><Badge tone="ai">✦ {tAi("badge")}</Badge></div>
      <p className="num text-sm text-muted-foreground">{t("clarity", { score: diag.clarity_score })}</p>
      {suggestion("statement", t("suggested_statement"), diag.improved_statement, () => set("problem_statement", diag.improved_statement))}
      <div className="text-sm">
        <div className="mb-1 font-medium">{t("missing_questions")}</div>
        <ul className="list-disc space-y-1 ps-5">{diag.missing_info_questions.map((q, i) => <li key={i}>{q}</li>)}</ul>
      </div>
      {suggestion("category", t("suggested_category"), te(`category.${diag.suggested_category}`), () => set("category", diag.suggested_category))}
      {diag.suggested_tags.length > 0 && suggestion("tags", t("suggested_tags"), diag.suggested_tags.join("، "), () => set("tags", [...new Set([...c.tags, ...diag.suggested_tags])]))}
      {suggestion("impact", t("impact_estimate"), `${te(`impact_type.${diag.impact_estimate.type}`)} — ${diag.impact_estimate.reasoning}`, () => set("business_impact", { ...c.business_impact, type: diag.impact_estimate.type, confidence: diag.impact_estimate.confidence }))}
      {suggestion("public_title", t("suggested_public_title"), diag.suggested_public_title, () => set("public_title", diag.suggested_public_title))}
      <p className="text-xs text-muted-foreground">{tAi("review_note")}</p>
    </Card>
  );

  return (
    <div className="space-y-5">
      {c.review_note && c.status === "needs_info" && <Card className="border-amber-300 bg-amber-50"><strong>{t("coordinator_note")}:</strong> {c.review_note}</Card>}
      <ol className="flex gap-1 overflow-x-auto text-xs sm:text-sm" aria-label={t("steps")}>
        {STEPS.map((s, i) => (
          <li key={s} className="flex-1">
            <button type="button" onClick={() => go(i)} disabled={!editable || pending} aria-current={i === step ? "step" : undefined}
              className={`w-full rounded-md border px-2 py-2 ${i === step ? "border-primary bg-primary text-primary-foreground" : i < step ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}>
              <span className="num">{i + 1}.</span> {t(`step_${s}`)}
            </button>
          </li>
        ))}
      </ol>

      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="space-y-4 lg:col-span-3">
          {step === 0 && (
            <>
              <Field label={t("title")} htmlFor="title" error={fe("title")}><Input id="title" value={c.title} onChange={(e) => set("title", e.target.value)} required maxLength={200} /></Field>
              <Field label={t("category")} htmlFor="category" error={fe("category")}>
                <Select id="category" value={c.category} onChange={(e) => set("category", e.target.value)}>
                  <option value="">—</option>
                  {CATEGORIES.map((k) => <option key={k} value={k}>{te(`category.${k}`)}</option>)}
                </Select>
              </Field>
              <Field label={t("sector")} htmlFor="sector" error={fe("sector_id")}>
                <Select id="sector" value={c.sector_id} onChange={(e) => set("sector_id", e.target.value)}>
                  <option value="">—</option>
                  {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
              </Field>
              <Field label={t("tags")} htmlFor="tags" hint={t("tags_hint")}><Input id="tags" value={c.tags.join("، ")} onChange={(e) => set("tags", e.target.value.split(/[,،]/).map((x) => x.trim()).filter(Boolean))} /></Field>
            </>
          )}
          {step === 1 && (
            <>
              <Field label={t("problem_statement")} htmlFor="ps" hint={t("problem_hint")} error={fe("problem_statement")}><Textarea id="ps" rows={6} value={c.problem_statement} onChange={(e) => set("problem_statement", e.target.value)} /></Field>
              <Field label={t("current_situation")} htmlFor="cs"><Textarea id="cs" value={c.current_situation} onChange={(e) => set("current_situation", e.target.value)} /></Field>
              <Field label={t("desired_outcome")} htmlFor="do" error={fe("desired_outcome")}><Textarea id="do" value={c.desired_outcome} onChange={(e) => set("desired_outcome", e.target.value)} /></Field>
            </>
          )}
          {step === 2 && (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label={t("impact_type")} htmlFor="it">
                  <Select id="it" value={c.business_impact.type ?? ""} onChange={(e) => set("business_impact", { ...c.business_impact, type: e.target.value || undefined })}>
                    <option value="">—</option>
                    {["cost", "productivity", "quality", "environment", "revenue"].map((k) => <option key={k} value={k}>{te(`impact_type.${k}`)}</option>)}
                  </Select>
                </Field>
                <Field label={t("impact_estimate_value")} htmlFor="ie"><Input id="ie" type="number" min={0} inputMode="decimal" value={c.business_impact.estimate ?? ""} onChange={(e) => set("business_impact", { ...c.business_impact, estimate: e.target.value ? Number(e.target.value) : undefined })} /></Field>
                <Field label={t("impact_unit")} htmlFor="iu"><Input id="iu" value={c.business_impact.unit ?? ""} onChange={(e) => set("business_impact", { ...c.business_impact, unit: e.target.value })} placeholder={t("unit_placeholder")} /></Field>
              </div>
              <Field label={t("constraints")} htmlFor="con" hint={t("constraints_hint")}><Textarea id="con" value={c.constraints} onChange={(e) => set("constraints", e.target.value)} /></Field>
              <fieldset>
                <legend className="mb-2 text-sm font-medium">{t("resources_offered")}</legend>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {(["data", "site_access", "materials", "funding"] as const).map((k) => (
                    <label key={k} className="flex items-center gap-2"><input type="checkbox" checked={!!c.resources_offered[k]} onChange={(e) => set("resources_offered", { ...c.resources_offered, [k]: e.target.checked })} />{t(`resource_${k}`)}</label>
                  ))}
                </div>
              </fieldset>
              <Field label={t("duration")} htmlFor="dur"><Input id="dur" type="number" min={1} max={60} value={c.expected_duration_months ?? ""} onChange={(e) => set("expected_duration_months", e.target.value ? Number(e.target.value) : null)} /></Field>
            </>
          )}
          {step === 3 && (
            <>
              <p className="text-sm text-muted-foreground">{t("attachments_hint")}</p>
              <ul className="space-y-1 text-sm">{files.map((f) => <li key={f.id}>📎 {f.filename}</li>)}</ul>
              <label className="block">
                <span className="sr-only">{t("upload")}</span>
                <input type="file" accept=".pdf,.docx,.xlsx,.pptx,.png,.jpg,.jpeg,.webp,.csv,.txt" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.size > 50 * 1024 * 1024) { setErr(t("too_large")); return; }
                  guarded(async () => { const id = await save(); const d = await uploadFile(f, "challenge", id); setFiles([...files, { id: d.id, filename: f.name }]); });
                  e.target.value = "";
                }} className="block w-full text-sm file:me-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-primary-foreground" />
              </label>
            </>
          )}
          {step === 4 && (
            <>
              <fieldset className="space-y-2">
                <legend className="mb-1 text-sm font-medium">{t("visibility")}</legend>
                {(["public", "selected_orgs", "confidential"] as const).map((v) => (
                  <label key={v} className={`flex cursor-pointer items-start gap-2 rounded-md border p-3 text-sm ${c.visibility === v ? "border-primary bg-primary/5" : "border-border"}`}>
                    <input type="radio" name="vis" className="mt-1" checked={c.visibility === v} onChange={() => set("visibility", v)} />
                    <span><strong>{te(`visibility.${v}`)}</strong><span className="block text-muted-foreground">{t(`visibility_${v}_help`)}</span></span>
                  </label>
                ))}
              </fieldset>
              {c.visibility === "selected_orgs" && (
                <fieldset>
                  <legend className="mb-1 text-sm font-medium">{t("selected_universities")}</legend>
                  <div className="grid gap-1 text-sm sm:grid-cols-2">
                    {universities.map((u) => (
                      <label key={u.id} className="flex items-center gap-2"><input type="checkbox" checked={c.visibility_org_ids.includes(u.id)} onChange={(e) => set("visibility_org_ids", e.target.checked ? [...c.visibility_org_ids, u.id] : c.visibility_org_ids.filter((x) => x !== u.id))} />{u.name}</label>
                    ))}
                  </div>
                </fieldset>
              )}
              <Field label={t("public_title")} htmlFor="pt" hint={t("public_title_hint")} error={fieldErr.public_title ? t("public_title_required") : undefined}><Input id="pt" value={c.public_title} onChange={(e) => set("public_title", e.target.value)} /></Field>
              <div className="rounded-md bg-muted p-3 text-sm">
                <h3 className="mb-1 font-medium">{t("review_summary")}</h3>
                <p><strong>{c.title}</strong> — {c.category ? te(`category.${c.category}`) : "—"}</p>
                <p className="line-clamp-3 text-muted-foreground">{c.problem_statement}</p>
              </div>
            </>
          )}

          {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
            <div className="flex gap-2">
              {step > 0 && <Button type="button" variant="outline" onClick={() => go(step - 1)} disabled={pending}>{t("back")}</Button>}
              {step < STEPS.length - 1 && <Button type="button" onClick={() => go(step + 1)} disabled={pending || c.title.trim().length < 3}>{t("next")}</Button>}
              {step === STEPS.length - 1 && editable && (
                <Button type="button" disabled={pending} onClick={() => guarded(async () => { const id = await save(); await api(`/challenges/${id}/submit`, { method: "POST" }); router.push("/dashboard"); router.refresh(); })}>{t("submit")}</Button>
              )}
            </div>
            <span className="text-xs text-muted-foreground" aria-live="polite">{pending ? t("saving") : saved ? t("saved_at", { time: saved }) : t("autosave_note")}</span>
          </div>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          {step >= 1 && editable && (
            <Card className="space-y-2">
              <p className="text-sm text-muted-foreground">{t("diagnosis_help")}</p>
              <Button type="button" variant="outline" className="w-full border-violet-300 text-violet-900" disabled={pending || c.problem_statement.trim().length < 10}
                onClick={() => guarded(async () => { const id = await save(); setDismissed(new Set()); setDiag(await api<Diagnosis>(`/challenges/${id}/diagnose`, { method: "POST" })); })}>
                ✦ {t("diagnose")}
              </Button>
            </Card>
          )}
          {DiagnosisPanel}
        </div>
      </div>
    </div>
  );
}
