import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";
import { Badge, Card } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { ChallengeView } from "@/modules/challenges/service";
import type { ProjectView } from "@/modules/projects/service";
import { VisibilityBadge } from "./badges";

export async function ChallengeCard({ c }: { c: ChallengeView }) {
  const t = await getTranslations("challenges");
  const te = await getTranslations("enums");
  const locale = await getLocale();
  if (c.kind === "teaser") {
    return (
      <Card className="flex flex-col gap-2 border-dashed">
        <div className="flex flex-wrap items-center gap-2">
          <VisibilityBadge visibility="confidential" />
          {c.category && <Badge tone="muted">{te(`category.${c.category}`)}</Badge>}
        </div>
        <h3 className="font-semibold">{c.public_title}</h3>
        {c.sector && <p className="text-sm text-muted-foreground">{locale === "ar" ? c.sector.name_ar : c.sector.name_en}</p>}
        <Link href={`/challenges/${c.id}`} className="mt-auto text-sm font-medium text-primary hover:underline">{t("request_access")}</Link>
      </Card>
    );
  }
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {c.category && <Badge>{te(`category.${c.category}`)}</Badge>}
        {c.visibility !== "public" && <VisibilityBadge visibility={c.visibility} />}
      </div>
      <h3 className="font-semibold leading-snug">
        <Link href={`/challenges/${c.id}`} className="hover:underline">{c.title}</Link>
      </h3>
      <p className="line-clamp-3 text-sm text-muted-foreground">{c.problem_statement}</p>
      <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-2 text-xs text-muted-foreground">
        {c.sector && <span>{locale === "ar" ? c.sector.name_ar : c.sector.name_en}</span>}
        {c.org.city && <span>{c.org.city}</span>}
        {c.expected_duration_months && <span className="num">{t("duration_months", { n: c.expected_duration_months })}</span>}
        <span>{formatDate(c.published_at, locale)}</span>
      </div>
    </Card>
  );
}

export async function ProjectCard({ p }: { p: ProjectView }) {
  const te = await getTranslations("enums");
  const t = await getTranslations("projects");
  const locale = await getLocale();
  if (p.kind === "teaser") {
    return (
      <Card className="flex flex-col gap-2 border-dashed">
        <div className="flex flex-wrap gap-2"><VisibilityBadge visibility="confidential" /><Badge tone="muted">{te(`project_type.${p.type}`)}</Badge></div>
        <h3 className="font-semibold">{p.public_title}</h3>
        {p.trl && <span className="num text-xs text-muted-foreground">TRL {p.trl}</span>}
        <Link href={`/projects/${p.id}`} className="mt-auto text-sm font-medium text-primary hover:underline">{t("request_access")}</Link>
      </Card>
    );
  }
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{te(`project_type.${p.type}`)}</Badge>
        {p.trl && <Badge tone="muted" className="num">TRL {p.trl}</Badge>}
        {p.ip_status !== "none" && <Badge tone="warning">{te(`ip_status.${p.ip_status}`)}</Badge>}
      </div>
      <h3 className="font-semibold leading-snug"><Link href={`/projects/${p.id}`} className="hover:underline">{p.title}</Link></h3>
      <p className="line-clamp-3 text-sm text-muted-foreground">{p.summary}</p>
      <div className="mt-auto flex flex-wrap gap-x-4 pt-2 text-xs text-muted-foreground">
        <span>{locale === "ar" ? p.org.name_ar : p.org.name_en ?? p.org.name_ar}</span>
        {p.sector && <span>{locale === "ar" ? p.sector.name_ar : p.sector.name_en}</span>}
      </div>
    </Card>
  );
}
