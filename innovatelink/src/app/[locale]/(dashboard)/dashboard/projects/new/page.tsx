import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireActive } from "@/lib/auth/guards";
import { PageHeader } from "@/components/ui";
import { ProjectForm } from "@/components/projects/project-form";
import { projectFormOptions } from "@/components/projects/form-data";

export default async function NewProject({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const actor = await requireActive(locale, ["student", "researcher", "university_coordinator"]);
  const t = await getTranslations("project_form");
  const o = await projectFormOptions(actor.org_id, locale);
  return (
    <div>
      <PageHeader title={t("new_title")} description={t("new_description")} />
      <ProjectForm initial={{ type: "graduation_project", title: "", public_title: "", summary: "", problem_addressed: "", sector_id: "", tags: [], applications: "", team_member_ids: [], supervisor_id: actor.role === "researcher" ? actor.id : "", trl: null, evidence: "", demo_url: "", potential_customers: "", ip_status: "none", collaboration_terms: "", support_needs: [], seeking: [], visibility: "public", visibility_org_ids: [] }} {...o} docs={[]} />
    </div>
  );
}
