import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";
import { db } from "@/lib/db";
import { getActor } from "@/lib/auth/current";
import { load } from "@/lib/api/server-call";
import { formatDate, formatNumber } from "@/lib/utils";
import { Badge, buttonClass, Card } from "@/components/ui";
import { StatusBadge, VisibilityBadge } from "@/components/domain/badges";
import { AccessPanel } from "@/components/domain/access-panel";
import { ContactForm } from "@/components/domain/contact-form";
import { AssistantPanel } from "@/components/domain/assistant-panel";
import { DocumentList } from "@/components/domain/documents";
import { getChallenge } from "@/modules/challenges/service";
import { canExpressInterest, canManageChallenge } from "@/modules/challenges/policy";
import { currentNda } from "@/modules/access/service";
import { listDocuments } from "@/modules/files/service";
import { isActive, isPlatformStaff } from "@/modules/auth/policy";

export const dynamic = "force-dynamic";

export default async function ChallengeDetail({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("challenges");
  const te = await getTranslations("enums");
  const actor = await getActor();
  const res = await load(() => getChallenge(actor, id));
  const request = actor ? await db.accessRequest.findFirst({ where: { subject_type: "challenge", subject_id: id, user_id: actor.id }, orderBy: { created_at: "desc" }, select: { id: true, status: true } }) : null;

  if (!res.ok || res.data.kind === "teaser") {
    const teaser = res.ok && res.data.kind === "teaser" ? res.data : null;
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold">{teaser?.public_title ?? t("restricted_title")}</h1>
        <div className="flex gap-2"><VisibilityBadge visibility={teaser ? "confidential" : "selected_orgs"} />{teaser?.category && <Badge tone="muted">{te(`category.${teaser.category}`)}</Badge>}</div>
        {!actor ? (
          <Card><p>{t("login_to_view")}</p><Link href="/auth/login" className={buttonClass("default", "md", "mt-3")}>{t("login")}</Link></Card>
        ) : isActive(actor) ? (
          <AccessPanel subjectType="challenge" subjectId={id} request={request} nda={await currentNda()} />
        ) : <Card>{t("pending_account")}</Card>}
      </div>
    );
  }

  const c = res.data;
  const owner = actor ? canManageChallenge(actor, c) : false;
  const staff = isPlatformStaff(actor);
  const docs = actor ? await listDocuments(actor, "challenge", id).catch(() => []) : [];
  const impact = c.business_impact as { type?: string; estimate?: number; unit?: string } | null;
  const resources = (c.resources_offered ?? {}) as Record<string, boolean | string>;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <article className="space-y-5 lg:col-span-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={c.status} />
          {c.category && <Badge>{te(`category.${c.category}`)}</Badge>}
          <VisibilityBadge visibility={c.visibility} />
        </div>
        <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{c.title}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>{locale === "ar" ? c.org.name_ar : c.org.name_en ?? c.org.name_ar}</span>
          {c.org.city && <span>{c.org.city}</span>}
          {c.sector && <span>{locale === "ar" ? c.sector.name_ar : c.sector.name_en}</span>}
          <span>{formatDate(c.published_at ?? c.created_at, locale)}</span>
        </div>
        {(["problem_statement", "current_situation", "desired_outcome", "constraints"] as const).map((f) => c[f] && (
          <section key={f}>
            <h2 className="mb-1 font-semibold">{t(`fields.${f}`)}</h2>
            <p className="whitespace-pre-wrap leading-relaxed">{c[f]}</p>
          </section>
        ))}
        {docs.length > 0 && (
          <section>
            <h2 className="mb-2 font-semibold">{t("attachments")}</h2>
            <DocumentList docs={docs} summarize={isActive(actor)} />
          </section>
        )}
        {isActive(actor) && <AssistantPanel challengeId={c.id} actions />}
      </article>
      <aside className="space-y-4">
        <Card className="space-y-3 text-sm">
          {c.expected_duration_months && <div><div className="text-muted-foreground">{t("fields.expected_duration_months")}</div><div className="num font-medium">{t("duration_months", { n: c.expected_duration_months })}</div></div>}
          {impact?.type && <div><div className="text-muted-foreground">{t("fields.business_impact")}</div><div className="font-medium">{te(`impact_type.${impact.type}`)}{impact.estimate ? <span className="num"> — {formatNumber(impact.estimate, locale)} {impact.unit}</span> : null}</div></div>}
          {Object.entries(resources).some(([k, v]) => v === true && k !== "notes") && (
            <div>
              <div className="text-muted-foreground">{t("fields.resources_offered")}</div>
              <div className="mt-1 flex flex-wrap gap-1">{Object.entries(resources).filter(([k, v]) => v === true && k !== "notes").map(([k]) => <Badge key={k} tone="muted">{t(`resources.${k}`)}</Badge>)}</div>
            </div>
          )}
          {c.tags.length > 0 && <div className="flex flex-wrap gap-1">{c.tags.map((g) => <Badge key={g} tone="muted">{g}</Badge>)}</div>}
        </Card>
        {actor && canExpressInterest(actor, c, true) && <Card><ContactForm targetType="challenge" targetId={c.id} label={t("express_interest")} /></Card>}
        {(owner || staff) && (
          <Card className="flex flex-col gap-2">
            {owner && ["draft", "needs_info"].includes(c.status) && <Link href={`/dashboard/challenges/${c.id}/edit`} className={buttonClass("outline")}>{t("edit")}</Link>}
            <Link href={`/dashboard/challenges/${c.id}/matches`} className={buttonClass("default")}>{t("view_matches")}</Link>
          </Card>
        )}
        {!actor && <Card className="text-sm">{t("login_to_interact")} <Link href="/auth/login" className="text-primary underline">{t("login")}</Link></Card>}
      </aside>
    </div>
  );
}
