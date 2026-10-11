import { db } from "@/lib/db";

export async function wizardOptions(locale: string) {
  const [sectors, unis] = await Promise.all([
    db.sector.findMany({ orderBy: { name_ar: "asc" } }),
    db.organization.findMany({ where: { type: "university", status: "active", deleted_at: null }, orderBy: { name_ar: "asc" } }),
  ]);
  return {
    sectors: sectors.map((s) => ({ id: s.id, name: locale === "ar" ? s.name_ar : s.name_en })),
    universities: unis.map((u) => ({ id: u.id, name: locale === "ar" ? u.name_ar : u.name_en ?? u.name_ar })),
  };
}
