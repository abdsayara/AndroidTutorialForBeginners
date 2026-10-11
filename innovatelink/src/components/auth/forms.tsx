"use client";
import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/lib/i18n/routing";
import { api, ApiError } from "@/lib/api/client";
import { Button, Card, Field, Input, Select } from "@/components/ui";
import { useErrorText } from "@/components/domain/use-api-error";

function useForm() {
  const errText = useErrorText();
  const [err, setErr] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string[]>>({});
  const [pending, start] = useTransition();
  const submit = (fn: () => Promise<void>) => start(async () => {
    setErr(null); setFields({});
    try { await fn(); } catch (e) { setErr(errText(e)); if (e instanceof ApiError && e.fields) setFields(e.fields); }
  });
  return { err, fields, pending, submit };
}

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { err, pending, submit } = useForm();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <Card className="mx-auto max-w-md space-y-4">
      <h1 className="text-xl font-bold">{t("login_title")}</h1>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); submit(async () => { await api("/auth/login", { json: { email, password } }); router.push("/dashboard"); router.refresh(); }); }}>
        <Field label={t("email")} htmlFor="email"><Input id="email" type="email" autoComplete="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label={t("password")} htmlFor="password"><Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
        <Button type="submit" className="w-full" disabled={pending}>{t("login")}</Button>
      </form>
      <div className="flex justify-between text-sm">
        <Link href="/auth/forgot" className="text-primary hover:underline">{t("forgot_link")}</Link>
        <Link href="/auth/register" className="text-primary hover:underline">{t("register_link")}</Link>
      </div>
    </Card>
  );
}

interface Org { id: string; name_ar: string; name_en: string | null; type: string }
type RoleChoice = "company_admin" | "company_member" | "student" | "researcher" | "university_coordinator";

export function RegisterForm({ consentVersion }: { consentVersion: string }) {
  const t = useTranslations("auth");
  const te = useTranslations("enums");
  const { err, fields, pending, submit } = useForm();
  const [role, setRole] = useState<RoleChoice>("company_admin");
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [orgMode, setOrgMode] = useState<"existing" | "new">("new");
  const [form, setForm] = useState({ email: "", password: "", full_name: "", org_id: "", org_name: "", city: "", size: "", consent: false });
  const [done, setDone] = useState(false);
  const orgType = role.startsWith("company") ? "company" : "university";
  const canCreateOrg = role === "company_admin" || role === "company_member" || role === "university_coordinator";

  useEffect(() => {
    api<{ items: Org[] }>(`/orgs?type=${orgType}&limit=100`).then((r) => setOrgs(r.items)).catch(() => setOrgs([]));
    if (!canCreateOrg) setOrgMode("existing");
  }, [orgType, canCreateOrg]);

  if (done) return <Card className="mx-auto max-w-md space-y-2"><h1 className="text-xl font-bold">{t("check_email_title")}</h1><p>{t("check_email_body")}</p></Card>;
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value });
  const fe = (k: string) => (fields[k]?.[0] ? t.has(`field_errors.${fields[k][0]}`) ? t(`field_errors.${fields[k][0]}`) : fields[k][0] : undefined);

  return (
    <Card className="mx-auto max-w-xl space-y-4">
      <h1 className="text-xl font-bold">{t("register_title")}</h1>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); submit(async () => {
        await api("/auth/register", { json: {
          email: form.email, password: form.password, full_name: form.full_name, role, consent_version: form.consent ? consentVersion : "",
          ...(orgMode === "existing" ? (form.org_id ? { org_id: form.org_id } : {}) : { new_org: { type: orgType, name_ar: form.org_name, city: form.city || undefined, size: form.size || undefined } }),
        } });
        setDone(true);
      }); }}>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">{t("account_type")}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {(["company_admin", "company_member", "student", "researcher", "university_coordinator"] as const).map((r) => (
              <label key={r} className={`flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm ${role === r ? "border-primary bg-primary/5" : "border-border"}`}>
                <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} />
                {te(`role.${r}`)}
              </label>
            ))}
          </div>
        </fieldset>
        <Field label={t("full_name")} htmlFor="full_name" error={fe("full_name")}><Input id="full_name" required value={form.full_name} onChange={set("full_name")} /></Field>
        <Field label={t("email")} htmlFor="email" hint={orgType === "university" ? t("uni_email_hint") : undefined} error={fe("email")}><Input id="email" type="email" dir="ltr" required value={form.email} onChange={set("email")} /></Field>
        <Field label={t("password")} htmlFor="password" hint={t("password_hint")} error={fe("password")}><Input id="password" type="password" autoComplete="new-password" minLength={10} required value={form.password} onChange={set("password")} /></Field>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">{orgType === "company" ? t("company") : t("university")}</legend>
          {canCreateOrg && (
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-1"><input type="radio" checked={orgMode === "existing"} onChange={() => setOrgMode("existing")} />{t("org_existing")}</label>
              <label className="flex items-center gap-1"><input type="radio" checked={orgMode === "new"} onChange={() => setOrgMode("new")} />{t("org_new")}</label>
            </div>
          )}
          {orgMode === "existing" ? (
            <Field label={t("choose_org")} htmlFor="org_id" error={fe("org_id")} hint={orgType === "university" ? t("auto_link_hint") : undefined}>
              <Select id="org_id" value={form.org_id} onChange={set("org_id")}>
                <option value="">—</option>
                {orgs.map((o) => <option key={o.id} value={o.id}>{o.name_ar}{o.name_en ? ` / ${o.name_en}` : ""}</option>)}
              </Select>
            </Field>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label={t("org_name")} htmlFor="org_name" className="sm:col-span-3" error={fe("new_org")}><Input id="org_name" required value={form.org_name} onChange={set("org_name")} /></Field>
              <Field label={t("city")} htmlFor="city"><Input id="city" value={form.city} onChange={set("city")} /></Field>
              {orgType === "company" && (
                <Field label={t("size")} htmlFor="size">
                  <Select id="size" value={form.size} onChange={set("size")}>
                    <option value="">—</option>
                    {(["micro", "small", "medium", "large"] as const).map((s) => <option key={s} value={s}>{te(`size.${s}`)}</option>)}
                  </Select>
                </Field>
              )}
            </div>
          )}
        </fieldset>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" checked={form.consent} onChange={set("consent")} required />
          <span>{t("consent", { version: consentVersion })}</span>
        </label>
        {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
        <Button type="submit" className="w-full" disabled={pending}>{t("register")}</Button>
      </form>
      <p className="text-sm text-muted-foreground">{t("approval_note")}</p>
    </Card>
  );
}

export function VerifyForm({ token }: { token: string }) {
  const t = useTranslations("auth");
  const { err, pending, submit } = useForm();
  const [ok, setOk] = useState(false);
  useEffect(() => { if (token) submit(async () => { await api("/auth/verify", { json: { token } }); setOk(true); }); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Card className="mx-auto max-w-md space-y-3">
      <h1 className="text-xl font-bold">{t("verify_title")}</h1>
      {pending && <p>{t("verifying")}</p>}
      {ok && <><p>{t("verified")}</p><Link href="/auth/login" className="text-primary underline">{t("login")}</Link></>}
      {(err || !token) && <p role="alert" className="text-destructive">{err ?? t("invalid_link")}</p>}
    </Card>
  );
}

export function ForgotForm() {
  const t = useTranslations("auth");
  const { err, pending, submit } = useForm();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <Card className="mx-auto max-w-md space-y-4">
      <h1 className="text-xl font-bold">{t("forgot_title")}</h1>
      {sent ? <p>{t("forgot_sent")}</p> : (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); submit(async () => { await api("/auth/forgot", { json: { email } }); setSent(true); }); }}>
          <Field label={t("email")} htmlFor="email"><Input id="email" type="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
          <Button type="submit" className="w-full" disabled={pending}>{t("send_link")}</Button>
        </form>
      )}
    </Card>
  );
}

export function ResetForm({ token }: { token: string }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const { err, pending, submit } = useForm();
  const [password, setPassword] = useState("");
  return (
    <Card className="mx-auto max-w-md space-y-4">
      <h1 className="text-xl font-bold">{t("reset_title")}</h1>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); submit(async () => { await api("/auth/reset", { json: { token, password } }); router.push("/auth/login"); }); }}>
        <Field label={t("new_password")} htmlFor="password" hint={t("password_hint")}><Input id="password" type="password" minLength={10} required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" /></Field>
        {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
        <Button type="submit" className="w-full" disabled={pending || !token}>{t("save_password")}</Button>
      </form>
    </Card>
  );
}
