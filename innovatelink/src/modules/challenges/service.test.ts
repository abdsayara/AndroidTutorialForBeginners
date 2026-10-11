import { describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { testQueue } from "@/lib/jobs";
import { makeChallenge, makeOrg, makeSector, makeUser } from "../../../tests/helpers";
import {
  changeVisibility, closeChallenge, createChallenge, deleteChallenge, getChallenge, listChallenges, myChallenges, reviewChallenge,
  submitChallenge, submittedChallenges, updateChallenge,
} from "./service";
import { acceptNda, currentNda, decideAccess, requestAccess } from "@/modules/access/service";
import { challengeListSchema } from "./schema";

const L = (o: Record<string, unknown> = {}) => challengeListSchema.parse(o);

describe("challenges service", () => {
  it("FR-1.1/1.4: draft → submitted → needs_info → submitted → published; never visible to academics before publish", async () => {
    const sector = await makeSector("stone");
    const co = await makeOrg("company", { city: "الخليل" });
    const admin = await makeUser("company_admin", co.id);
    const coord = await makeUser("platform_coordinator");
    const student = await makeUser("student");

    const c = await createChallenge(admin, { title: "مخلفات قص الحجر" });
    await expect(submitChallenge(admin, c.id)).rejects.toMatchObject({ message: "incomplete_challenge" });
    await updateChallenge(admin, c.id, {
      category: "energy_water_waste", sector_id: sector.id,
      problem_statement: "ينتج المصنع كميات كبيرة من رواسب قص الحجر (الروبة) التي تُلقى في الأودية وتلوث المياه.",
      desired_outcome: "حل لإعادة استخدام الروبة",
    });
    await submitChallenge(admin, c.id);
    await expect(getChallenge(student, c.id)).rejects.toMatchObject({ code: "not_found" });
    expect((await listChallenges(student, L())).items).toHaveLength(0);
    expect((await submittedChallenges(coord)).map((x) => x.id)).toContain(c.id);

    await expect(reviewChallenge(admin, c.id, { decision: "publish" })).rejects.toMatchObject({ code: "forbidden" });
    await reviewChallenge(coord, c.id, { decision: "needs_info", note: "يرجى توضيح الكميات الشهرية" });
    const back = await getChallenge(admin, c.id);
    expect(back.kind === "full" && back.review_note).toBe("يرجى توضيح الكميات الشهرية");
    await submitChallenge(admin, c.id);
    await reviewChallenge(coord, c.id, { decision: "publish" });
    expect(testQueue.map((j) => j.name)).toEqual(expect.arrayContaining(["embed.entity", "match.challenge"]));

    const v = await getChallenge(student, c.id);
    expect(v.kind).toBe("full");
    expect(v.kind === "full" && "review_note" in v).toBe(false);
    expect((await listChallenges(null, L({ q: "الروبة" }))).items).toHaveLength(1);
    expect((await listChallenges(null, L({ city: "الخليل" }))).total).toBe(1);
    expect((await listChallenges(null, L({ city: "نابلس" }))).total).toBe(0);
    expect(await db.auditLog.count({ where: { entity_id: c.id, action: "status_change" } })).toBe(4);
    expect((await myChallenges(admin))[0]).toMatchObject({ id: c.id, match_count: 0 });
    await expect(myChallenges(student)).rejects.toMatchObject({ code: "forbidden" });
  });

  it("§3 acceptance: user of an unlisted org gets 403 on a selected_orgs challenge", async () => {
    const co = await makeOrg("company");
    const admin = await makeUser("company_admin", co.id);
    const uniA = await makeOrg("university");
    const inA = await makeUser("researcher", uniA.id);
    const outsider = await makeUser("researcher");
    const c = await makeChallenge(co.id, admin.id, { status: "published", visibility: "selected_orgs", visibility_org_ids: [uniA.id] });
    expect((await getChallenge(inA, c.id)).kind).toBe("full");
    await expect(getChallenge(outsider, c.id)).rejects.toMatchObject({ code: "forbidden", status: 403 });
    await expect(getChallenge(null, c.id)).rejects.toMatchObject({ code: "unauthenticated" });
    expect((await listChallenges(outsider, L())).items).toHaveLength(0);
    expect((await listChallenges(inA, L())).items).toHaveLength(1);
  });

  it("FR-0.5/0.6 + E2E path 5: confidential teaser → request → owner approves → NDA → full details", async () => {
    const co = await makeOrg("company");
    const admin = await makeUser("company_admin", co.id);
    const r = await makeUser("researcher");
    const c = await makeChallenge(co.id, admin.id, { status: "published", visibility: "confidential", title: "تسرب في خط إنتاج شركة الأدوية X", public_title: "تحسين كفاءة خط إنتاج دوائي", problem_statement: "سر" });

    const list = await listChallenges(r, L());
    expect(list.items[0]).toMatchObject({ kind: "teaser", public_title: "تحسين كفاءة خط إنتاج دوائي" });
    expect(JSON.stringify(list)).not.toContain("سر");
    expect(JSON.stringify(list)).not.toContain("الأدوية X");
    expect((await listChallenges(r, L({ q: "تسرب" }))).items).toHaveLength(0); // no leak via search on hidden fields
    expect((await getChallenge(r, c.id)).kind).toBe("teaser");
    expect((await listChallenges(null, L())).items).toHaveLength(0);

    const req = await requestAccess(r, { subject_type: "challenge", subject_id: c.id });
    expect((await requestAccess(r, { subject_type: "challenge", subject_id: c.id })).id).toBe(req.id);
    const nda = await currentNda();
    await expect(acceptNda(r, req.id, nda.version, "1.2.3.4")).rejects.toMatchObject({ code: "forbidden" });
    await expect(decideAccess(r, req.id, "approve")).rejects.toMatchObject({ code: "forbidden" });
    await decideAccess(admin, req.id, "approve");
    await expect(decideAccess(admin, req.id, "approve")).rejects.toMatchObject({ code: "invalid_transition" });
    await expect(acceptNda(r, req.id, "old-version", "1.2.3.4")).rejects.toMatchObject({ code: "conflict" });
    await acceptNda(r, req.id, nda.version, "1.2.3.4");
    const nd = await db.ndaAcceptance.findFirstOrThrow({ where: { user_id: r.id } });
    expect(nd).toMatchObject({ ip_address: "1.2.3.4", nda_version: nda.version });
    const full = await getChallenge(r, c.id);
    expect(full.kind === "full" && full.problem_statement).toBe("سر");

    // FR-1.6: widening keeps grants; narrowing back to confidential revokes them.
    await changeVisibility(admin, c.id, { visibility: "public", visibility_org_ids: [] });
    expect(await db.accessGrant.count({ where: { revoked_at: null } })).toBe(1);
    await changeVisibility(admin, c.id, { visibility: "confidential", visibility_org_ids: [] });
    expect(await db.accessGrant.count({ where: { revoked_at: null } })).toBe(0);
    expect(await db.auditLog.count({ where: { action: "access_revoked", entity_id: c.id } })).toBe(1);
    expect(await db.auditLog.count({ where: { action: "visibility_change", entity_id: c.id } })).toBe(2);
    expect((await getChallenge(r, c.id)).kind).toBe("teaser");
  });

  it("visibility validation, close, delete, update with visibility", async () => {
    const co = await makeOrg("company");
    const admin = await makeUser("company_admin", co.id);
    const c = await createChallenge(admin, { title: "تحدي اختبار" });
    await expect(changeVisibility(admin, c.id, { visibility: "confidential", visibility_org_ids: [] })).rejects.toMatchObject({ message: "public_title_required" });
    await updateChallenge(admin, c.id, { visibility: "confidential", public_title: "عنوان عام" });
    expect((await db.challenge.findUniqueOrThrow({ where: { id: c.id } })).visibility).toBe("confidential");
    await deleteChallenge(admin, c.id);
    await expect(getChallenge(admin, c.id)).rejects.toMatchObject({ code: "not_found" });
    const c2 = await makeChallenge(co.id, admin.id, { status: "published" });
    await closeChallenge(admin, c2.id);
    await expect(closeChallenge(admin, c2.id)).rejects.toMatchObject({ code: "forbidden" });
    await expect(updateChallenge(admin, c2.id, { title: "x" })).rejects.toMatchObject({ code: "forbidden" });
  });

  it("confidential submission requires public_title", async () => {
    const sector = await makeSector();
    const co = await makeOrg("company");
    const admin = await makeUser("company_admin", co.id);
    const c = await createChallenge(admin, {
      title: "تحدي سري", category: "operations", sector_id: sector.id, problem_statement: "وصف طويل بما يكفي للمشكلة المطروحة هنا", desired_outcome: "نتيجة مطلوبة",
    });
    await db.challenge.update({ where: { id: c.id }, data: { visibility: "confidential" } });
    await expect(submitChallenge(admin, c.id)).rejects.toMatchObject({ message: "public_title_required" });
  });
});
