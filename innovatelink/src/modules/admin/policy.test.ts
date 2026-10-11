import { describe, expect, it } from "vitest";
import { A } from "../../../tests/actors";
import * as P from "./policy";

describe("admin policy", () => {
  it("rules", () => {
    expect(P.canAdminister(A("platform_admin"))).toBe(true);
    expect(P.canAdminister(A("platform_coordinator"))).toBe(false);
    expect(P.canReviewAiFeedback(A("platform_coordinator"))).toBe(true);
    expect(P.canReviewAiFeedback(A("company_admin"))).toBe(false);
  });
});
