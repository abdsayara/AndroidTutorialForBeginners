import type { OrgType, Role, Visibility } from "@prisma/client";
import { db } from "@/lib/db";
import type { Actor } from "@/modules/auth/policy";

let seq = 0;
const n = () => `${Date.now().toString(36)}${(seq++).toString(36)}`;

/** Truncates every table except the migration history. audit_logs needs its trigger bypassed. */
export async function resetDb() {
  const tables = await db.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE '_prisma%'`;
  const list = tables.map((t) => `"public"."${t.tablename}"`).join(", ");
  if (list) await db.$executeRawUnsafe(`TRUNCATE ${list} CASCADE`);
}

export async function makeOrg(type: OrgType, extra: Partial<{ name_ar: string; status: "pending" | "active"; email_domains: string[]; sector_id: string; city: string }> = {}) {
  return db.organization.create({
    data: { type, name_ar: extra.name_ar ?? `مؤسسة ${n()}`, status: extra.status ?? "active", email_domains: extra.email_domains ?? [], sector_id: extra.sector_id, city: extra.city },
  });
}

export async function makeUser(role: Role, orgId?: string, status: "active" | "pending" = "active"): Promise<Actor> {
  const typeFor: Record<Role, OrgType> = {
    company_admin: "company", company_member: "company", student: "university", researcher: "university",
    university_coordinator: "university", platform_coordinator: "platform", platform_admin: "platform",
  };
  const org = orgId ? await db.organization.findUniqueOrThrow({ where: { id: orgId } }) : await makeOrg(typeFor[role]);
  const u = await db.user.create({
    data: { email: `${role}.${n()}@test.ps`, password_hash: "!", full_name: `مستخدم ${role}`, role, status, org_id: org.id, email_verified_at: new Date() },
  });
  if (role === "researcher") await db.researcherProfile.create({ data: { user_id: u.id, expertise_tags: [] } });
  return { id: u.id, role, status, org_id: org.id, org_type: org.type };
}

export async function makeSector(slug = `s-${n()}`) {
  return db.sector.create({ data: { slug, name_ar: `قطاع ${slug}`, name_en: `Sector ${slug}` } });
}

export async function makeChallenge(orgId: string, createdBy: string, extra: Partial<{ status: string; visibility: Visibility; visibility_org_ids: string[]; title: string; public_title: string; problem_statement: string; sector_id: string; category: string }> = {}) {
  return db.challenge.create({
    data: {
      org_id: orgId,
      created_by: createdBy,
      title: extra.title ?? `تحدي ${n()}`,
      public_title: extra.public_title,
      problem_statement: extra.problem_statement ?? "وصف المشكلة",
      status: (extra.status as never) ?? "draft",
      visibility: extra.visibility ?? "public",
      visibility_org_ids: extra.visibility_org_ids ?? [],
      sector_id: extra.sector_id,
      category: (extra.category as never) ?? "operations",
    },
  });
}

export async function makeProject(orgId: string, createdBy: string, extra: Partial<{ status: string; visibility: Visibility; visibility_org_ids: string[]; title: string; summary: string; supervisor_id: string; trl: number; sector_id: string }> = {}) {
  return db.project.create({
    data: {
      org_id: orgId,
      created_by: createdBy,
      type: "graduation_project",
      title: extra.title ?? `مشروع ${n()}`,
      summary: extra.summary ?? "ملخص",
      problem_addressed: "مشكلة",
      status: (extra.status as never) ?? "draft",
      visibility: extra.visibility ?? "public",
      visibility_org_ids: extra.visibility_org_ids ?? [],
      supervisor_id: extra.supervisor_id,
      trl: extra.trl ?? 3,
      sector_id: extra.sector_id,
    },
  });
}
