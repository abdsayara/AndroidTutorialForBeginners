import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireActive } from "@/lib/auth/guards";
import { PageHeader } from "@/components/ui";
import { StatusBadge } from "@/components/domain/badges";
import { ProjectForm } from "@/components/projects/project-form";
import { projectFormOptions } from "@/components/projects/form-data";
import { canEditProject } from "@/modules/projects/policy";

export default async function EditProject({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const actor = await requireActive(locale);
  const p = await db.project.findFirst({ where: { id, deleted_at: null } });
  if (!p || !canEditProject(actor, p)) notFound();
  const t = await getTranslations("project_form");
  const [o, docs] = await Promise.all([projectFormOptions(p.org_id, locale), db.document.findMany({ where: { owner_type: "project", owner_id: id, completed: true, deleted_at: null }, select: { id: true, filename: true } })]);
  return (
    <div>
      <PageHeader title={t("edit_title")} actions={<StatusBadge status={p.status} />} />
      <ProjectForm {...o} docs={docs} initial={{
        id: p.id, status: p.status, review_note: p.review_note, type: p.type, title: p.title, public_title: p.public_title ?? "", summary: p.summary ?? "", problem_addressed: p.problem_addressed ?? "",
        sector_id: p.sector_id ?? "", tags: p.tags, applications: p.applications ?? "", team_member_ids: p.team_member_ids, supervisor_id: p.supervisor_id ?? "", trl: p.trl,
        evidence: p.evidence ?? "", demo_url: p.demo_url ?? "", potential_customers: p.potential_customers ?? "", ip_status: p.ip_status, collaboration_terms: p.collaboration_terms ?? "",
        support_needs: p.support_needs, seeking: p.seeking, visibility: p.visibility, visibility_org_ids: p.visibility_org_ids,
      }} />
    </div>
  );
}
