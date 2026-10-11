import { describe, expect, it } from "vitest";
import { makeChallenge, makeOrg, makeSector, makeUser } from "../../../tests/helpers";
import { breakdown, exportCsv, overview } from "./service";

describe("analytics (FR-7)", () => {
  it("per-role overview; k-anonymity hides sectors with < 3 companies from non-staff; CSV export", async () => {
    const stone = await makeSector("stone");
    const food = await makeSector("food");
    const admins = [];
    for (let i = 0; i < 3; i++) {
      const co = await makeOrg("company", { sector_id: stone.id });
      const a = await makeUser("company_admin", co.id);
      admins.push(a);
      await makeChallenge(co.id, a.id, { status: "published", sector_id: stone.id, category: "energy_water_waste" });
    }
    const lone = await makeOrg("company");
    const la = await makeUser("company_admin", lone.id);
    await makeChallenge(lone.id, la.id, { status: "published", sector_id: food.id, category: "quality_manufacturing" });
    await makeChallenge(lone.id, la.id, { status: "draft", sector_id: food.id });

    const coord = await makeUser("platform_coordinator");
    const eco = await overview(coord);
    expect(eco).toMatchObject({ scope: "ecosystem", companies: 4, challenges_published: 4, challenges_submitted: 4 });
    const coView = await overview(la);
    expect(coView).toMatchObject({ scope: "company", challenges: { published: 1, draft: 1 } });

    const pub = await breakdown(la);
    expect(pub.by_sector.find((r) => r.key === stone.id)).toMatchObject({ challenges: 3, suppressed: false });
    expect(pub.by_sector.find((r) => r.key === food.id)).toMatchObject({ challenges: 0, suppressed: true });
    const staff = await breakdown(coord);
    expect(staff.by_sector.find((r) => r.key === food.id)).toMatchObject({ challenges: 1, suppressed: false });

    const csv = await exportCsv(la);
    expect(csv).toContain("by_sector");
    expect(csv).toContain("<3");
    const uc = await makeUser("university_coordinator");
    expect((await overview(uc)).scope).toBe("university");
    expect((await overview(await makeUser("student"))).scope).toBe("academic");
  });
});
