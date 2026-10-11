import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireActive } from "@/lib/auth/guards";
import { PageHeader } from "@/components/ui";
import { ChallengeWizard } from "@/components/challenges/wizard";
import { wizardOptions } from "@/components/challenges/wizard-data";

export default async function NewChallenge({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireActive(locale, ["company_admin"]);
  const t = await getTranslations("wizard");
  const opts = await wizardOptions(locale);
  return (
    <div>
      <PageHeader title={t("new_title")} description={t("new_description")} />
      <ChallengeWizard
        initial={{ title: "", category: "", sector_id: "", tags: [], problem_statement: "", current_situation: "", desired_outcome: "", constraints: "", business_impact: {}, resources_offered: {}, expected_duration_months: null, public_title: "", visibility: "public", visibility_org_ids: [] }}
        sectors={opts.sectors} universities={opts.universities} docs={[]}
      />
    </div>
  );
}
