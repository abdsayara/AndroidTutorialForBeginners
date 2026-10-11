import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";
import { requireActive } from "@/lib/auth/guards";
import { load } from "@/lib/api/server-call";
import { StatusBadge } from "@/components/domain/badges";
import { getWorkspace } from "@/modules/workspaces/service";
import { notFound } from "next/navigation";

const TABS = [["", "overview"], ["/tasks", "tasks"], ["/files", "files"], ["/meetings", "meetings"], ["/updates", "updates"], ["/report", "report"]] as const;

export default async function WorkspaceLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const actor = await requireActive(locale);
  const res = await load(() => getWorkspace(actor, id));
  if (!res.ok) notFound();
  const t = await getTranslations("workspace");
  const ws = res.data;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">{ws.title}</h1>
        <StatusBadge status={ws.status} />
      </div>
      {ws.status === "setup" && <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">{t("setup_banner")}</p>}
      <nav aria-label={t("tabs")} className="flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map(([path, key]) => <Link key={key} href={`/workspaces/${id}${path}`} className="whitespace-nowrap rounded-t-md px-3 py-2 text-sm hover:bg-muted">{t(`tab_${key}`)}</Link>)}
      </nav>
      {children}
    </div>
  );
}
