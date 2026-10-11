import { describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { makeChallenge, makeOrg, makeUser } from "../../../tests/helpers";
import { diagnoseChallenge, scrubIdentity } from "./diagnosis";

describe("AI diagnosis (FR-1.2, §7.1)", () => {
  it("returns ≥3 clarifying questions, a scrubbed public title, and never touches user text or status", async () => {
    const co = await makeOrg("company", { name_ar: "مصنع حجر الخليل" });
    const admin = await makeUser("company_admin", co.id);
    const c = await makeChallenge(co.id, admin.id, { title: "مخلفات قص الحجر", problem_statement: "رواسب قص الحجر تتراكم في ساحة المصنع ونريد التخلص منها بطريقة مفيدة." });
    const d = await diagnoseChallenge(admin, c.id);
    expect(d.missing_info_questions.length).toBeGreaterThanOrEqual(3);
    expect(d.suggested_category).toBe("energy_water_waste");
    expect(d.suggested_public_title).not.toContain("مصنع حجر الخليل");
    expect(d.impact_estimate.reasoning).not.toMatch(/\d/);
    const after = await db.challenge.findUniqueOrThrow({ where: { id: c.id } });
    expect(after.problem_statement).toBe(c.problem_statement);
    expect(after.status).toBe("draft");
    expect(after.ai_diagnosis).toMatchObject({ suggested_category: "energy_water_waste" });
    // Cached second call, no extra run.
    const again = await diagnoseChallenge(admin, c.id);
    expect(again.cached).toBe(true);
    expect(await db.aiRun.count({ where: { kind: "diagnose" } })).toBe(1);
  });

  it("guards: permission, confidential content, missing statement, daily limit", async () => {
    const co = await makeOrg("company");
    const admin = await makeUser("company_admin", co.id);
    const other = await makeUser("company_admin");
    const c = await makeChallenge(co.id, admin.id, { problem_statement: "قصير" });
    await expect(diagnoseChallenge(other, c.id)).rejects.toMatchObject({ code: "forbidden" });
    await expect(diagnoseChallenge(admin, c.id)).rejects.toMatchObject({ message: "problem_statement_required" });
    const conf = await makeChallenge(co.id, admin.id, { visibility: "confidential", public_title: "عام", problem_statement: "وصف طويل لمشكلة سرية جداً في المصنع" });
    await expect(diagnoseChallenge(admin, conf.id)).rejects.toMatchObject({ message: "ai_confidential_disabled" });
    await db.aiRun.createMany({ data: Array.from({ length: 30 }, () => ({ kind: "diagnose", user_id: admin.id, model: "m" })) });
    const c2 = await makeChallenge(co.id, admin.id, { problem_statement: "مشكلة جديدة مختلفة تماماً عن السابقة" });
    await expect(diagnoseChallenge(admin, c2.id)).rejects.toMatchObject({ message: "ai_daily_limit" });
  });

  it("scrubIdentity removes org names", () => {
    expect(scrubIdentity("تحدي مصنع الأمل لإدارة المخلفات", ["مصنع الأمل", null])).toBe("تحدي لإدارة المخلفات");
    expect(scrubIdentity("مصنع الأمل", ["مصنع الأمل"])).toBe("—");
  });
});
