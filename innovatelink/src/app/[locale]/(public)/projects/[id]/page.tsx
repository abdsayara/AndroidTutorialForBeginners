import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";
import { db } from "@/lib/db";
import { getActor } from "@/lib/auth/current";
import { load } from "@/lib/api/server-call";
import { formatDate } from "@/lib/utils";
import { Badge, buttonClass, Card } from "@/components/ui";
import { StatusBadge, VisibilityBadge } from "@/components/domain/badges";
import { AccessPanel } from "@/components/domain/access-panel";
import { ContactForm } from "@/components/domain/contact-form";
import { DocumentList } from "@/components/domain/documents";
import { getProject } from "@/modules/projects/service";
import { canEditProject, canRequestProjectContact } from "@/modules/projects/policy";
import { currentNda } from "@/modules/access/service";
import { listDocuments } from "@/modules/files/service";
import { isActive } from "@/modules/auth/policy";

export const dynamic = "force-dynamic";

export default async function ProjectDetail({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("projects");
  const te = await getTranslations("enums");
  const actor = await getActor();
  const res = await load(() => getProject(actor, id));
  const request = actor ? await db.accessRequest.findFirst({ where: { subject_type: "project", subject_id: id, user_id: actor.id }, orderBy: { created_at: "desc" }, select: { id: true, status: true } }) : null;

  if (!res.ok || res.data.kind === "teaser") {
    const teaser = res.ok && res.data.kind === "teaser" ? res.data : null;
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold">{teaser?.public_title ?? t("restricted_title")}</h1>
        <VisibilityBadge visibility={teaser ? "confidential" : "selected_orgs"} />
        {!actor ? <Card>{t("login_to_view")} <Link href="/auth/login" className="text-primary underline">{t("login")}</Link></Card>
          : isActive(actor) ? <AccessPanel subjectType="project" subjectId={id} request={request} nda={await currentNda()} /> : <Card>{t("pending_account")}</Card>}
      </div>
    );
  }
  const p = res.data;
  const docs = actor ? await listDocuments(actor, "project", id).catch(() => []) : [];
  const editable = actor ? canEditProject(actor, p) : false;
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <article className="space-y-5 lg:col-span-2">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={p.status} />
          <Badge>{te(`project_type.${p.type}`)}</Badge>
          {p.trl && <Badge tone="muted" className="num">TRL {p.trl}/9</Badge>}
          <VisibilityBadge visibility={p.visibility} />
        </div>
        <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{p.title}</h1>
        <div className="flex flex-wrap gap-x-4 text-sm text-muted-foreground">
          <span>{locale === "ar" ? p.org.name_ar : p.org.name_en ?? p.org.name_ar}</span>
          {p.sector && <span>{locale === "ar" ? p.sector.name_ar : p.sector.name_en}</span>}
          <span>{formatDate(p.published_at ?? p.created_at, locale)}</span>
        </div>
        {(["summary", "problem_addressed", "applications", "evidence", "potential_customers", "collaboration_terms"] as const).map((f) => p[f] && (
          <section key={f}>
            <h2 className="mb-1 font-semibold">{t(`fields.${f}`)}</h2>
            <p className="whitespace-pre-wrap leading-relaxed">{p[f]}</p>
          </section>
        ))}
        {p.demo_url && <a href={p.demo_url} rel="noopener noreferrer" target="_blank" className="text-primary underline">{t("fields.demo_url")}</a>}
        {docs.length > 0 && <section><h2 className="mb-2 font-semibold">{t("attachments")}</h2><DocumentList docs={docs} summarize={isActive(actor)} /></section>}
      </article>
      <aside className="space-y-4">
        <Card className="space-y-3 text-sm">
          <div><div className="text-muted-foreground">{t("fields.ip_status")}</div><div className="font-medium">{te(`ip_status.${p.ip_status}`)}</div></div>
          {p.seeking.length > 0 && <div><div className="text-muted-foreground">{t("fields.seeking")}</div><div className="mt-1 flex flex-wrap gap-1">{p.seeking.map((s) => <Badge key={s}>{te(`seeking.${s}`)}</Badge>)}</div></div>}
          {p.support_needs.length > 0 && <div><div className="text-muted-foreground">{t("fields.support_needs")}</div><div className="mt-1 flex flex-wrap gap-1">{p.support_needs.map((s) => <Badge key={s} tone="muted">{te(`support.${s}`)}</Badge>)}</div></div>}
          {p.team && p.team.length > 0 && (
            <div>
              <div className="text-muted-foreground">{t("team")}</div>
              <ul className="mt-1 space-y-0.5">{p.team.map((m) => <li key={m.id}>{m.full_name}{m.id === p.supervisor_id && <span className="text-muted-foreground"> ({t("supervisor")})</span>}{"email" in m && m.email ? <span className="block text-xs text-muted-foreground" dir="ltr">{m.email}</span> : null}</li>)}</ul>
            </div>
          )}
          {p.tags.length > 0 && <div className="flex flex-wrap gap-1">{p.tags.map((g) => <Badge key={g} tone="muted">{g}</Badge>)}</div>}
        </Card>
        {actor && canRequestProjectContact(actor, p, true) && <Card><ContactForm targetType="project" targetId={p.id} label={t("request_contact")} /></Card>}
        {editable && <Link href={`/dashboard/projects/${p.id}/edit`} className={buttonClass("outline", "md", "w-full")}>{t("edit")}</Link>}
      </aside>
    </div>
  );
}
