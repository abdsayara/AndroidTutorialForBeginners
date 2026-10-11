import { describe, expect, it } from "vitest";
import { makeChallenge, makeOrg, makeProject, makeUser } from "../../../tests/helpers";
import { indexEntity } from "@/modules/matching/indexing";
import { rrf, search, searchChallenges } from "./service";
import { challengeListSchema } from "@/modules/challenges/schema";

describe("hybrid search", () => {
  it("rrf fuses ranks", () => {
    expect(rrf([["a", "b"], ["b", "c"]])[0]).toBe("b");
  });

  it("FR-3 acceptance: finds related projects without the literal phrase; semantic never surfaces hidden confidential matches", async () => {
    const uni = await makeOrg("university");
    const s = await makeUser("student", uni.id);
    const p = await makeProject(uni.id, s.id, { status: "published", title: "وحدة ترشيح بالأغشية", summary: "تنقية المياه العادمة من مصانع الألبان وإعادة استخدامها في الري" });
    await makeProject(uni.id, s.id, { status: "published", title: "تطبيق حجز مواعيد", summary: "برمجيات" });
    for (const x of [p]) await indexEntity("project", x.id);
    const res = await search(null, "معالجة مياه الصرف الصناعي", "project");
    expect(res.projects!.items[0]!.id).toBe(p.id);

    const co = await makeOrg("company");
    const admin = await makeUser("company_admin", co.id);
    const conf = await makeChallenge(co.id, admin.id, { status: "published", visibility: "confidential", public_title: "تحدي صناعي", title: "تلوث مياه الصرف", problem_statement: "مياه الصرف الصناعي الملوثة" });
    await indexEntity("challenge", conf.id);
    const viewer = await makeUser("researcher");
    const r = await searchChallenges(viewer, challengeListSchema.parse({ q: "مياه الصرف" }));
    expect(r.items).toHaveLength(0);
    const r2 = await searchChallenges(viewer, challengeListSchema.parse({ q: "صناعي" }));
    expect(r2.items[0]).toMatchObject({ kind: "teaser" });
  });
});
