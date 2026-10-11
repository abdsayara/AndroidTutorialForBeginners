"use client";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/routing";
import { api } from "@/lib/api/client";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui";
import { useErrorText } from "@/components/domain/use-api-error";

function useRun() {
  const router = useRouter();
  const errText = useErrorText();
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, start] = useTransition();
  return { err, ok, pending, run: (fn: () => Promise<unknown>) => start(async () => { setErr(null); setOk(false); try { await fn(); setOk(true); router.refresh(); } catch (e) { setErr(errText(e)); } }) };
}

export function UserRowControls({ id, status, role, roles }: { id: string; status: string; role: string; roles: { value: string; label: string }[] }) {
  const t = useTranslations("admin");
  const te = useTranslations("enums");
  const r = useRun();
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <Select aria-label={t("role")} className="h-8 w-44" defaultValue={role} onChange={(e) => r.run(() => api(`/admin/users/${id}`, { method: "PATCH", json: { role: e.target.value } }))}>{roles.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</Select>
      <Select aria-label={t("status")} className="h-8 w-32" defaultValue={status} onChange={(e) => r.run(() => api(`/admin/users/${id}`, { method: "PATCH", json: { status: e.target.value } }))}>{["pending", "active", "suspended"].map((s) => <option key={s} value={s}>{te(`status.${s}`)}</option>)}</Select>
      {r.err && <span role="alert" className="text-xs text-destructive">{r.err}</span>}
    </span>
  );
}

export function OrgCreateForm() {
  const t = useTranslations("admin");
  const te = useTranslations("enums");
  const r = useRun();
  const [v, setV] = useState({ type: "university", name_ar: "", name_en: "", city: "", email_domains: "" });
  return (
    <Card className="grid gap-2 sm:grid-cols-3">
      <h2 className="font-semibold sm:col-span-3">{t("new_org")}</h2>
      <Field label={t("org_type")} htmlFor="ot"><Select id="ot" value={v.type} onChange={(e) => setV({ ...v, type: e.target.value })}>{["company", "university", "platform", "partner"].map((x) => <option key={x} value={x}>{te(`org_type.${x}`)}</option>)}</Select></Field>
      <Field label={t("name_ar")} htmlFor="na"><Input id="na" value={v.name_ar} onChange={(e) => setV({ ...v, name_ar: e.target.value })} /></Field>
      <Field label={t("name_en")} htmlFor="ne"><Input id="ne" value={v.name_en} onChange={(e) => setV({ ...v, name_en: e.target.value })} /></Field>
      <Field label={t("city")} htmlFor="oc"><Input id="oc" value={v.city} onChange={(e) => setV({ ...v, city: e.target.value })} /></Field>
      <Field label={t("email_domains")} htmlFor="od" hint={t("domains_hint")} className="sm:col-span-2"><Input id="od" dir="ltr" value={v.email_domains} onChange={(e) => setV({ ...v, email_domains: e.target.value })} /></Field>
      <div className="sm:col-span-3"><Button disabled={r.pending} onClick={() => r.run(() => api("/orgs", { json: { type: v.type, name_ar: v.name_ar, name_en: v.name_en || undefined, city: v.city || undefined, email_domains: v.email_domains.split(/[,\s]+/).filter(Boolean) } }))}>{t("create")}</Button></div>
      {r.err && <p role="alert" className="text-sm text-destructive sm:col-span-3">{r.err}</p>}
    </Card>
  );
}

export function TaxonomyForm() {
  const t = useTranslations("admin");
  const r = useRun();
  const [v, setV] = useState({ kind: "sector", slug: "", name_ar: "", name_en: "" });
  return (
    <Card className="grid gap-2 sm:grid-cols-4">
      <Field label={t("kind")} htmlFor="tk"><Select id="tk" value={v.kind} onChange={(e) => setV({ ...v, kind: e.target.value })}><option value="sector">{t("sector")}</option><option value="tag">{t("tag")}</option></Select></Field>
      <Field label={t("slug")} htmlFor="ts"><Input id="ts" dir="ltr" value={v.slug} onChange={(e) => setV({ ...v, slug: e.target.value })} /></Field>
      <Field label={t("name_ar")} htmlFor="tna"><Input id="tna" value={v.name_ar} onChange={(e) => setV({ ...v, name_ar: e.target.value })} /></Field>
      <Field label={t("name_en")} htmlFor="tne"><Input id="tne" value={v.name_en} onChange={(e) => setV({ ...v, name_en: e.target.value })} /></Field>
      <div className="sm:col-span-4"><Button disabled={r.pending} onClick={() => r.run(() => api("/admin/taxonomy", { json: v }))}>{t("save")}</Button></div>
      {r.err && <p role="alert" className="text-sm text-destructive sm:col-span-4">{r.err}</p>}
    </Card>
  );
}

export function SettingsForm({ weights, nda, retention }: { weights: Record<string, number>; nda: { version: string; text_ar: string; text_en: string }; retention: number }) {
  const t = useTranslations("admin");
  const te = useTranslations("enums");
  const r = useRun();
  const [w, setW] = useState(weights);
  const [n, setN] = useState(nda);
  const [ret, setRet] = useState(retention);
  return (
    <div className="space-y-4">
      <Card className="space-y-2">
        <h2 className="font-semibold">{t("weights")}</h2>
        <div className="grid gap-2 sm:grid-cols-5">{Object.keys(w).map((k) => <Field key={k} label={te(`criteria.${k}`)} htmlFor={`w-${k}`}><Input id={`w-${k}`} type="number" step="0.05" min={0} max={1} value={w[k]} onChange={(e) => setW({ ...w, [k]: Number(e.target.value) })} /></Field>)}</div>
        <p className="text-xs text-muted-foreground">{t("weights_note")}</p>
        <Button disabled={r.pending} onClick={() => r.run(() => api("/admin/settings", { method: "PUT", json: { matching_weights: w } }))}>{t("save")}</Button>
      </Card>
      <Card className="space-y-2">
        <h2 className="font-semibold">{t("nda_template")}</h2>
        <Field label={t("nda_version")} htmlFor="nv"><Input id="nv" dir="ltr" value={n.version} onChange={(e) => setN({ ...n, version: e.target.value })} /></Field>
        <Field label={t("nda_ar")} htmlFor="nar"><Textarea id="nar" rows={5} value={n.text_ar} onChange={(e) => setN({ ...n, text_ar: e.target.value })} /></Field>
        <Field label={t("nda_en")} htmlFor="nen"><Textarea id="nen" dir="ltr" rows={5} value={n.text_en} onChange={(e) => setN({ ...n, text_en: e.target.value })} /></Field>
        <Button disabled={r.pending} onClick={() => r.run(() => api("/admin/settings", { method: "PUT", json: { nda_template: n } }))}>{t("save")}</Button>
      </Card>
      <Card className="space-y-2">
        <Field label={t("retention_days")} htmlFor="rd"><Input id="rd" type="number" min={30} value={ret} onChange={(e) => setRet(Number(e.target.value))} className="w-40" /></Field>
        <Button disabled={r.pending} onClick={() => r.run(() => api("/admin/settings", { method: "PUT", json: { retention_days_closed_challenges: ret } }))}>{t("save")}</Button>
      </Card>
      {r.ok && <p className="text-sm text-emerald-700">{t("saved")}</p>}
      {r.err && <p role="alert" className="text-sm text-destructive">{r.err}</p>}
    </div>
  );
}
