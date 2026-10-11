import { getTranslations, setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { requireActive } from "@/lib/auth/guards";
import { PageHeader } from "@/components/ui";
import { CommercializationBoard } from "@/components/coordinator/kanban";
import { kanban } from "@/modules/commercialization/service";
import { STAGES } from "@/modules/commercialization/schema";

export const dynamic = "force-dynamic";

export default async function CommercializationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const actor = await requireActive(locale, ["platform_coordinator", "platform_admin"]);
  const t = await getTranslations("commercialization");
  const board = await kanban(actor);
  const projects = await db.project.findMany({ where: { status: { in: ["published", "in_collaboration"] }, deleted_at: null, commercialization: null }, select: { id: true, title: true }, orderBy: { title: "asc" } });
  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />
      <CommercializationBoard board={JSON.parse(JSON.stringify(board))} stages={STAGES} projects={projects} />
    </div>
  );
}
