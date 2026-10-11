import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireActive } from "@/lib/auth/guards";
import { PageHeader } from "@/components/ui";
import { StatusBadge } from "@/components/domain/badges";
import { ChallengeWizard, type WizardChallenge } from "@/components/challenges/wizard";
import { wizardOptions } from "@/components/challenges/wizard-data";
import { canManageChallenge } from "@/modules/challenges/policy";

export default async function EditChallenge({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const actor = await requireActive(locale, ["company_admin"]);
  const c = await db.challenge.findFirst({ where: { id, deleted_at: null } });
  if (!c || !canManageChallenge(actor, c)) notFound();
  const t = await getTranslations("wizard");
  const [opts, docs] = await Promise.all([
    wizardOptions(locale),
    db.document.findMany({ where: { owner_type: "challenge", owner_id: id, completed: true, deleted_at: null }, select: { id: true, filename: true } }),
  ]);
  const initial: WizardChallenge = {
    id: c.id, title: c.title, category: c.category ?? "", sector_id: c.sector_id ?? "", tags: c.tags,
    problem_statement: c.problem_statement ?? "", current_situation: c.current_situation ?? "", desired_outcome: c.desired_outcome ?? "",
    constraints: c.constraints ?? "", business_impact: (c.business_impact ?? {}) as WizardChallenge["business_impact"],
    resources_offered: (c.resources_offered ?? {}) as WizardChallenge["resources_offered"], expected_duration_months: c.expected_duration_months,
    public_title: c.public_title ?? "", visibility: c.visibility, visibility_org_ids: c.visibility_org_ids,
    status: c.status, review_note: c.review_note, ai_diagnosis: c.ai_diagnosis as WizardChallenge["ai_diagnosis"],
  };
  return (
    <div>
      <PageHeader title={t("edit_title")} actions={<StatusBadge status={c.status} />} />
      <ChallengeWizard initial={initial} sectors={opts.sectors} universities={opts.universities} docs={docs} />
    </div>
  );
}
