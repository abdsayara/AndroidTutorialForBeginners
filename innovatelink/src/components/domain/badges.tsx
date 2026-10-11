import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui";

const TONE: Record<string, "default" | "success" | "warning" | "danger" | "muted"> = {
  draft: "muted", submitted: "warning", needs_info: "danger", published: "success", matched: "default", in_progress: "default",
  solved: "success", closed: "muted", pending_approval: "warning", in_collaboration: "default", commercializing: "default", archived: "muted",
  suggested: "muted", shortlisted: "warning", accepted_by_company: "default", accepted_by_academic: "default", confirmed: "success", rejected: "danger",
  setup: "warning", active: "success", paused: "muted", completed: "success", cancelled: "muted", pending: "warning", suspended: "danger",
};

export async function StatusBadge({ status }: { status: string }) {
  const t = await getTranslations("enums.status");
  return <Badge tone={TONE[status] ?? "muted"}>{t(status)}</Badge>;
}

export async function VisibilityBadge({ visibility }: { visibility: string }) {
  const t = await getTranslations("enums.visibility");
  return <Badge tone={visibility === "public" ? "muted" : "warning"}>{t(visibility)}</Badge>;
}

/** FR-5.4 / §7.4: fixed marker on every AI output. */
export async function AiBadge() {
  const t = await getTranslations("ai");
  return <Badge tone="ai">✦ {t("badge")}</Badge>;
}
