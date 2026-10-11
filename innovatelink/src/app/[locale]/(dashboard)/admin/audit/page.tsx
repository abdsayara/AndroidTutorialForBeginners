import { getTranslations } from "next-intl/server";
import { requireActive } from "@/lib/auth/guards";
import { Button, Input } from "@/components/ui";
import { Pagination } from "@/components/domain/pagination";
import { listAudit } from "@/modules/admin/service";
import { auditListSchema } from "@/modules/admin/schema";

export const dynamic = "force-dynamic";

export default async function Audit({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string>> }) {
  const { locale } = await params;
  const actor = await requireActive(locale, ["platform_admin"]);
  const q = auditListSchema.safeParse(Object.fromEntries(Object.entries(await searchParams).filter(([, v]) => v))).data ?? auditListSchema.parse({});
  const t = await getTranslations("admin");
  const res = await listAudit(actor, q);
  return (
    <div className="space-y-3">
      <form method="get" className="flex flex-wrap gap-2" dir="ltr">
        <Input name="action" placeholder="action" defaultValue={q.action} className="w-40" aria-label="action" />
        <Input name="entity_type" placeholder="entity_type" defaultValue={q.entity_type} className="w-40" aria-label="entity_type" />
        <Input name="entity_id" placeholder="entity_id" defaultValue={q.entity_id} className="w-72" aria-label="entity_id" />
        <Button type="submit">{t("search")}</Button>
      </form>
      <div className="overflow-x-auto rounded-lg border border-border bg-card" dir="ltr">
        <table className="w-full text-xs">
          <thead className="bg-muted"><tr><th className="p-2 text-left">time</th><th className="p-2 text-left">action</th><th className="p-2 text-left">entity</th><th className="p-2 text-left">actor</th><th className="p-2 text-left">ip</th><th className="p-2 text-left">diff</th></tr></thead>
          <tbody>{res.items.map((a) => (
            <tr key={a.id} className="border-t border-border align-top">
              <td className="whitespace-nowrap p-2 font-mono">{a.created_at.toISOString().replace("T", " ").slice(0, 19)}</td>
              <td className="p-2">{a.action}</td><td className="p-2">{a.entity_type}<div className="font-mono text-muted-foreground">{a.entity_id}</div></td>
              <td className="p-2 font-mono">{a.actor_id?.slice(0, 8)}</td><td className="p-2">{a.ip}</td>
              <td className="max-w-md p-2"><pre className="whitespace-pre-wrap break-all">{JSON.stringify(a.diff)}</pre></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <Pagination page={q.page} limit={q.limit} total={res.total} basePath="/admin/audit" params={{ action: q.action, entity_type: q.entity_type, entity_id: q.entity_id }} />
    </div>
  );
}
