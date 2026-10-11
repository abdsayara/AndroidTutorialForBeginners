import { getLocale, getTranslations } from "next-intl/server";
import { requireActive } from "@/lib/auth/guards";
import { formatDate } from "@/lib/utils";
import { Button, Input } from "@/components/ui";
import { UserRowControls } from "@/components/admin-forms";
import { Pagination } from "@/components/domain/pagination";
import { listUsers } from "@/modules/admin/service";
import { userListSchema } from "@/modules/admin/schema";

export const dynamic = "force-dynamic";
const ROLES = ["company_admin", "company_member", "student", "researcher", "university_coordinator", "platform_coordinator", "platform_admin"];

export default async function Users({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string>> }) {
  const { locale } = await params;
  const actor = await requireActive(locale, ["platform_admin"]);
  const q = userListSchema.safeParse(await searchParams).data ?? userListSchema.parse({});
  const t = await getTranslations("admin");
  const te = await getTranslations("enums");
  const loc = await getLocale();
  const res = await listUsers(actor, q);
  return (
    <div className="space-y-3">
      <form method="get" className="flex gap-2"><label htmlFor="uq" className="sr-only">{t("search")}</label><Input id="uq" name="q" defaultValue={q.q} placeholder={t("search")} /><Button type="submit">{t("search")}</Button></form>
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted"><tr><th className="p-2 text-start">{t("name")}</th><th className="p-2 text-start">{t("org")}</th><th className="p-2 text-start">{t("created")}</th><th className="p-2 text-start">{t("role_status")}</th></tr></thead>
          <tbody>{res.items.map((u) => (
            <tr key={u.id} className="border-t border-border">
              <td className="p-2"><div className="font-medium">{u.full_name}</div><div dir="ltr" className="text-xs text-muted-foreground">{u.email}{!u.email_verified_at && " ⚠"}</div></td>
              <td className="p-2">{u.org.name_ar}</td>
              <td className="num p-2">{formatDate(u.created_at, loc)}</td>
              <td className="p-2"><UserRowControls id={u.id} status={u.status} role={u.role} roles={ROLES.map((r) => ({ value: r, label: te(`role.${r}`) }))} /></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <Pagination page={q.page} limit={q.limit} total={res.total} basePath="/admin/users" params={{ q: q.q }} />
    </div>
  );
}
