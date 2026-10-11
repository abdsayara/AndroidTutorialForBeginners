import { describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { makeOrg, makeUser } from "../../../tests/helpers";
import { approveOrg, createOrg, getOrg, listMembers, listOrgs, pendingOrgs, updateOrg } from "./service";
import { orgListSchema } from "./schema";

describe("orgs service", () => {
  it("FR-0.2: coordinator approves a pending company and its admin", async () => {
    const co = await makeOrg("company", { status: "pending" });
    const ca = await makeUser("company_admin", co.id, "pending");
    const coord = await makeUser("platform_coordinator");
    expect((await pendingOrgs(coord)).map((o) => o.id)).toContain(co.id);
    await expect(approveOrg(ca, co.id)).rejects.toMatchObject({ code: "forbidden" });
    await approveOrg(coord, co.id);
    expect((await db.user.findUniqueOrThrow({ where: { id: ca.id } })).status).toBe("active");
    await expect(approveOrg(coord, co.id)).rejects.toMatchObject({ code: "invalid_transition" });
  });

  it("listing hides pending orgs and email domains from non-staff", async () => {
    await makeOrg("university", { email_domains: ["birzeit.edu"], name_ar: "جامعة بيرزيت" });
    await makeOrg("company", { status: "pending" });
    const pub = await listOrgs(null, orgListSchema.parse({}));
    expect(pub.items).toHaveLength(1);
    expect("email_domains" in pub.items[0]!).toBe(false);
    expect((await listOrgs(null, orgListSchema.parse({ q: "بيرزيت" }))).total).toBe(1);
    const admin = await makeUser("platform_admin");
    expect((await listOrgs(admin, orgListSchema.parse({}))).total).toBe(3);
    const created = await createOrg(admin, { type: "partner", name_ar: "حاضنة", email_domains: [] });
    expect(created.status).toBe("active");
    const g = await getOrg(null, created.id);
    expect("email_domains" in g).toBe(false);
    await expect(createOrg(await makeUser("platform_coordinator"), { type: "partner", name_ar: "x", email_domains: [] })).rejects.toMatchObject({ code: "forbidden" });
  });

  it("update and members", async () => {
    const co = await makeOrg("company");
    const ca = await makeUser("company_admin", co.id);
    await makeUser("company_member", co.id);
    expect((await updateOrg(ca, co.id, { city: "نابلس" })).city).toBe("نابلس");
    expect(await listMembers(ca, co.id)).toHaveLength(2);
    await expect(listMembers(await makeUser("student"), co.id)).rejects.toMatchObject({ code: "forbidden" });
    await expect(getOrg(null, "00000000-0000-0000-0000-000000000000")).rejects.toMatchObject({ code: "not_found" });
  });
});
