import { describe, expect, it } from "vitest";
import { A } from "../../../tests/actors";
import * as P from "./policy";

describe("analytics policy", () => {
  it("rules", () => {
    expect(P.canSeeEcosystem(A("platform_coordinator"))).toBe(true);
    expect(P.canSeeEcosystem(A("company_admin"))).toBe(false);
    expect(P.canSeeAnalytics(A("student"))).toBe(true);
    expect(P.canSeeAnalytics(null)).toBe(false);
    expect(P.suppressSmallGroup(A("company_admin"), 2)).toBe(true);
    expect(P.suppressSmallGroup(A("company_admin"), 3)).toBe(false);
    expect(P.suppressSmallGroup(A("platform_coordinator"), 1)).toBe(false);
  });
});
