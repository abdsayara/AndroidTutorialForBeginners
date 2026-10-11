import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireUser } from "@/lib/auth/guards";
import { PageHeader } from "@/components/ui";
import { EmailPrefsForm, PrivacyForm, ProfileForm, ResearcherForm } from "@/components/settings-forms";
import { me } from "@/modules/auth/service";
import { NOTIFICATION_TYPES } from "@/modules/notifications/service";

export const dynamic = "force-dynamic";

export default async function Settings({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const actor = await requireUser(locale);
  const t = await getTranslations("settings");
  const u = await me(actor);
  const r = u.researcher;
  return (
    <div className="space-y-5">
      <PageHeader title={t("title")} description={u.email} />
      <ProfileForm fullName={u.full_name} locale={u.locale} />
      {actor.role === "researcher" && <ResearcherForm initial={{ department: r?.department ?? "", title: r?.title ?? "", expertise_tags: r?.expertise_tags ?? [], bio: r?.bio ?? "", publications_url: r?.publications_url ?? "", availability: r?.availability ?? "" }} />}
      <EmailPrefsForm types={NOTIFICATION_TYPES} prefs={(u.email_prefs ?? {}) as Record<string, boolean>} />
      <PrivacyForm />
    </div>
  );
}
