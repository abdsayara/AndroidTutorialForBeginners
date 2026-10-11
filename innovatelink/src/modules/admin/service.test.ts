import { describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { makeUser } from "../../../tests/helpers";
import { aiFeedback, aiUsage, getSettings, listAudit, listTaxonomy, listUsers, reindex, updateSettings, updateUser, upsertTaxonomy } from "./service";
import { matchingWeights } from "@/modules/matching/service";
import { currentNda } from "@/modules/access/service";
import { userListSchema, auditListSchema } from "./schema";

describe("admin", () => {
  it("users, taxonomy, settings, audit, AI review", async () => {
    const admin = await makeUser("platform_admin");
    const coord = await makeUser("platform_coordinator");
    const s = await makeUser("student");
    await expect(listUsers(coord, userListSchema.parse({}))).rejects.toMatchObject({ code: "forbidden" });
    expect((await listUsers(admin, userListSchema.parse({ role: "student" }))).total).toBe(1);
    await updateUser(admin, s.id, { status: "suspended" });
    await expect(updateUser(admin, admin.id, { status: "suspended" })).rejects.toMatchObject({ message: "cannot_demote_self" });
    await upsertTaxonomy(admin, { kind: "sector", slug: "stone-marble", name_ar: "الحجر والرخام", name_en: "Stone & marble" });
    await upsertTaxonomy(admin, { kind: "tag", slug: "recycling", name_ar: "إعادة التدوير", name_en: "Recycling" });
    expect((await listTaxonomy()).sectors).toHaveLength(1);
    await updateSettings(admin, { matching_weights: { technical: 0.5, expertise: 0.1, maturity: 0.1, resources: 0.1, need_fit: 0.2 }, nda_template: { version: "nda-2", text_ar: "نص اتفاقية سرية تجريبي طويل بما يكفي", text_en: "A sufficiently long test NDA text body" } });
    expect((await matchingWeights()).technical).toBeCloseTo(0.5);
    expect((await currentNda()).version).toBe("nda-2");
    expect((await getSettings(admin)).ai.provider).toBe("mock");
    expect((await listAudit(admin, auditListSchema.parse({ entity_type: "user" }))).total).toBe(1);
    await db.aiRun.create({ data: { kind: "diagnose", model: "m", feedback: { entries: [{ report: "خطأ" }] } } });
    await db.aiRun.create({ data: { kind: "diagnose", model: "m" } });
    expect(await aiFeedback(coord)).toHaveLength(1);
    expect((await aiUsage(admin))[0]?._count._all).toBe(2);
    expect((await reindex(admin)).indexed).toBeGreaterThanOrEqual(0);
  });
});
