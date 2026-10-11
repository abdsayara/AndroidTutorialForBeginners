import { getTranslations } from "next-intl/server";
import { requireActive } from "@/lib/auth/guards";
import { Badge } from "@/components/ui";
import { StatusBadge } from "@/components/domain/badges";
import { ActionButton } from "@/components/domain/action-button";
import { OrgCreateForm } from "@/components/admin-forms";
import { listOrgs } from "@/modules/orgs/service";
import { orgListSchema } from "@/modules/orgs/schema";

export const dynamic = "force-dynamic";

export default async function Orgs({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const actor = await requireActive(locale, ["platform_admin"]);
  const t = await getTranslations("admin");
  const te = await getTranslations("enums");
  const res = await listOrgs(actor, orgListSchema.parse({ limit: 100 }));
  return (
    <div className="space-y-4">
      <OrgCreateForm />
      <ul className="divide-y divide-border rounded-lg border border-border bg-card">
        {res.items.map((o) => (
          <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
            <span><strong>{o.name_ar}</strong> <Badge tone="muted">{te(`org_type.${o.type}`)}</Badge> {o.city}{"email_domains" in o && (o.email_domains as string[]).length > 0 && <span dir="ltr" className="ms-2 text-xs text-muted-foreground">{(o.email_domains as string[]).join(", ")}</span>}</span>
            <span className="flex items-center gap-2"><StatusBadge status={o.status} />{o.status === "pending" && <ActionButton size="sm" path={`/orgs/${o.id}/approve`}>{t("approve")}</ActionButton>}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
