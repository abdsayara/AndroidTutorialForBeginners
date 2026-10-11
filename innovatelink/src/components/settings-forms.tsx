"use client";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/routing";
import { api } from "@/lib/api/client";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui";
import { useErrorText } from "@/components/domain/use-api-error";

function useSave() {
  const errText = useErrorText();
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return { msg, err, pending, run: (fn: () => Promise<void>, ok: string) => start(async () => { setErr(null); setMsg(null); try { await fn(); setMsg(ok); router.refresh(); } catch (e) { setErr(errText(e)); } }) };
}

export function ProfileForm({ fullName, locale }: { fullName: string; locale: "ar" | "en" }) {
  const t = useTranslations("settings");
  const s = useSave();
  const [name, setName] = useState(fullName);
  const [loc, setLoc] = useState(locale);
  return (
    <Card className="space-y-3">
      <h2 className="font-semibold">{t("profile")}</h2>
      <Field label={t("full_name")} htmlFor="fn"><Input id="fn" value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label={t("language")} htmlFor="loc"><Select id="loc" value={loc} onChange={(e) => setLoc(e.target.value as "ar" | "en")}><option value="ar">العربية</option><option value="en">English</option></Select></Field>
      <Button disabled={s.pending} onClick={() => s.run(() => api("/me", { method: "PATCH", json: { full_name: name, locale: loc } }), t("saved"))}>{t("save")}</Button>
      {s.msg && <p className="text-sm text-emerald-700">{s.msg}</p>}{s.err && <p role="alert" className="text-sm text-destructive">{s.err}</p>}
    </Card>
  );
}

export function ResearcherForm({ initial }: { initial: { department: string; title: string; expertise_tags: string[]; bio: string; publications_url: string; availability: string } }) {
  const t = useTranslations("settings");
  const s = useSave();
  const [v, setV] = useState(initial);
  return (
    <Card className="grid gap-3 sm:grid-cols-2">
      <h2 className="font-semibold sm:col-span-2">{t("researcher_profile")}</h2>
      <Field label={t("academic_title")} htmlFor="rt"><Input id="rt" value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} /></Field>
      <Field label={t("department")} htmlFor="rd"><Input id="rd" value={v.department} onChange={(e) => setV({ ...v, department: e.target.value })} /></Field>
      <Field label={t("expertise")} htmlFor="re" hint={t("expertise_hint")} className="sm:col-span-2"><Input id="re" value={v.expertise_tags.join("، ")} onChange={(e) => setV({ ...v, expertise_tags: e.target.value.split(/[,،]/).map((x) => x.trim()).filter(Boolean) })} /></Field>
      <Field label={t("bio")} htmlFor="rb" className="sm:col-span-2"><Textarea id="rb" value={v.bio} onChange={(e) => setV({ ...v, bio: e.target.value })} /></Field>
      <Field label={t("publications_url")} htmlFor="rp"><Input id="rp" type="url" dir="ltr" value={v.publications_url} onChange={(e) => setV({ ...v, publications_url: e.target.value })} /></Field>
      <Field label={t("availability")} htmlFor="ra"><Input id="ra" value={v.availability} onChange={(e) => setV({ ...v, availability: e.target.value })} /></Field>
      <div className="sm:col-span-2"><Button disabled={s.pending} onClick={() => s.run(() => api("/me/researcher", { method: "PUT", json: v }), t("saved"))}>{t("save")}</Button></div>
      {s.msg && <p className="text-sm text-emerald-700">{s.msg}</p>}{s.err && <p role="alert" className="text-sm text-destructive">{s.err}</p>}
    </Card>
  );
}

export function EmailPrefsForm({ types, prefs }: { types: readonly string[]; prefs: Record<string, boolean> }) {
  const t = useTranslations("settings");
  const tn = useTranslations("notifications");
  const s = useSave();
  const [v, setV] = useState<Record<string, boolean>>(Object.fromEntries(types.map((k) => [k, prefs[k] !== false])));
  return (
    <Card className="space-y-3">
      <h2 className="font-semibold">{t("email_notifications")}</h2>
      <div className="grid gap-1 text-sm sm:grid-cols-2">
        {types.map((k) => <label key={k} className="flex items-center gap-2"><input type="checkbox" checked={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.checked })} />{tn(`types.${k}.title`, { subject: "", status: "" }).replace(/[:«»“”]\s*$/, "").trim()}</label>)}
      </div>
      <Button disabled={s.pending} onClick={() => s.run(() => api("/notifications/prefs", { method: "PUT", json: v }), t("saved"))}>{t("save")}</Button>
      {s.msg && <p className="text-sm text-emerald-700">{s.msg}</p>}
    </Card>
  );
}

export function PrivacyForm() {
  const t = useTranslations("settings");
  const router = useRouter();
  const s = useSave();
  return (
    <Card className="space-y-3">
      <h2 className="font-semibold">{t("privacy")}</h2>
      <p className="text-sm text-muted-foreground">{t("privacy_note")}</p>
      <div className="flex flex-wrap gap-2">
        <a href="/api/v1/me/export" className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm hover:bg-muted">{t("export_data")}</a>
        <Button variant="destructive" disabled={s.pending} onClick={() => { if (window.confirm(t("delete_confirm"))) s.run(async () => { await api("/me", { method: "DELETE" }); router.push("/"); }, t("deleted")); }}>{t("delete_account")}</Button>
      </div>
      {s.err && <p role="alert" className="text-sm text-destructive">{s.err}</p>}
    </Card>
  );
}
