import { describe, expect, it } from "vitest";
import { A } from "../../../tests/actors";
import * as P from "./policy";

describe("assistant policy", () => {
  it("rules", () => {
    expect(P.canUseAssistant(A("student"))).toBe(true);
    expect(P.canUseAssistant(A("student", "o", "pending"))).toBe(false);
    expect(P.canSummarize(A("student"), true, "application/pdf")).toBe(true);
    expect(P.canSummarize(A("student"), true, "image/png")).toBe(false);
    expect(P.canSummarize(A("student"), false, "application/pdf")).toBe(false);
    expect(P.canSummarize(null, true, "application/pdf")).toBe(false);
  });
});
