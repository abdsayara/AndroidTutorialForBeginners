import { describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { makeChallenge, makeOrg, makeProject, makeUser } from "../../../tests/helpers";
import { createContactRequest, listContactRequests, respondContactRequest } from "./service";

describe("contact service", () => {
  it("FR-1.7 academic expresses interest; owner accepts; email revealed after acceptance", async () => {
    const co = await makeOrg("company");
    const admin = await makeUser("company_admin", co.id);
    const r = await makeUser("researcher");
    const c = await makeChallenge(co.id, admin.id, { status: "published" });
    const req = await createContactRequest(r, { target_type: "challenge", target_id: c.id, message: "مهتم بالتعاون في هذا التحدي" });
    await expect(createContactRequest(r, { target_type: "challenge", target_id: c.id, message: "مرة أخرى" })).rejects.toMatchObject({ code: "conflict" });
    let inbox = await listContactRequests(admin);
    expect(inbox.incoming).toHaveLength(1);
    expect(inbox.incoming[0]!.from?.email).toBeUndefined();
    await expect(respondContactRequest(r, req.id, "accepted")).rejects.toMatchObject({ code: "forbidden" });
    await respondContactRequest(admin, req.id, "accepted");
    inbox = await listContactRequests(admin);
    expect(inbox.incoming[0]!.from?.email).toContain("@");
    expect((await listContactRequests(r)).outgoing).toHaveLength(1);
    expect(await db.notification.count({ where: { user_id: r.id, type: "contact_response" } })).toBe(1);
  });

  it("FR-3.4 company contacts a project; cannot contact unpublished; researcher & lab targets", async () => {
    const uni = await makeOrg("university");
    const r = await makeUser("researcher", uni.id);
    const company = await makeUser("company_member");
    const draft = await makeProject(uni.id, r.id, { status: "draft" });
    await expect(createContactRequest(company, { target_type: "project", target_id: draft.id, message: "نود التواصل" })).rejects.toMatchObject({ code: "forbidden" });
    const pub = await makeProject(uni.id, r.id, { status: "published" });
    await createContactRequest(company, { target_type: "project", target_id: pub.id, message: "نود التواصل" });
    const profile = await db.researcherProfile.findUniqueOrThrow({ where: { user_id: r.id } });
    await createContactRequest(company, { target_type: "researcher", target_id: profile.id, message: "استشارة فنية" });
    const uc = await makeUser("university_coordinator", uni.id);
    const lab = await db.lab.create({ data: { org_id: uni.id, name: "مختبر المياه", description: "تحاليل" } });
    await createContactRequest(company, { target_type: "lab", target_id: lab.id, message: "نحتاج تحاليل" });
    expect((await listContactRequests(r)).incoming).toHaveLength(2);
    expect((await listContactRequests(uc)).incoming).toHaveLength(1);
    await expect(createContactRequest(r, { target_type: "project", target_id: pub.id, message: "x".repeat(6) })).rejects.toMatchObject({ code: "forbidden" });
  });
});
