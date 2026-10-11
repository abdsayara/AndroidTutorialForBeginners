import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireActive } from "@/lib/auth/guards";
import { PageHeader } from "@/components/ui";
import { ImportForm } from "@/components/projects/import-form";
import { IMPORT_COLUMNS } from "@/modules/projects/schema";

export default async function ImportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireActive(locale, ["university_coordinator", "platform_admin"]);
  const t = await getTranslations("import");
  return <div><PageHeader title={t("title")} description={t("description")} /><ImportForm columns={IMPORT_COLUMNS} /></div>;
}
