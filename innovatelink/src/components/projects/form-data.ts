import { db } from "@/lib/db";

export async function projectFormOptions(orgId: string, locale: string) {
  const [sectors, people, companies] = await Promise.all([
    db.sector.findMany({ orderBy: { name_ar: "asc" } }),
    db.user.findMany({ where: { org_id: orgId, status: "active", deleted_at: null, role: { in: ["student", "researcher"] } }, select: { id: true, full_name: true, role: true }, orderBy: { full_name: "asc" } }),
    db.organization.findMany({ where: { type: "company", status: "active" }, orderBy: { name_ar: "asc" } }),
  ]);
  return {
    sectors: sectors.map((s) => ({ id: s.id, name: locale === "ar" ? s.name_ar : s.name_en })),
    people: people.map((u) => ({ id: u.id, name: u.full_name })),
    supervisors: people.filter((u) => u.role === "researcher").map((u) => ({ id: u.id, name: u.full_name })),
    companies: companies.map((c) => ({ id: c.id, name: locale === "ar" ? c.name_ar : c.name_en ?? c.name_ar })),
  };
}
