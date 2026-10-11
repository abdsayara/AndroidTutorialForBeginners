import { describe, expect, it } from "vitest";
import { A } from "../../../tests/actors";
import * as P from "./policy";

describe("contact policy", () => {
  it("send", () => {
    expect(P.canSendContact(A("student"), "challenge")).toBe(true);
    expect(P.canSendContact(A("company_admin"), "challenge")).toBe(false);
    expect(P.canSendContact(A("company_member"), "project")).toBe(true);
    expect(P.canSendContact(A("platform_coordinator"), "lab")).toBe(true);
    expect(P.canSendContact(A("student"), "project")).toBe(false);
    expect(P.canSendContact(null, "project")).toBe(false);
  });
  it("respond", () => {
    expect(P.canRespondContact(A("student"), ["u-student"], "pending")).toBe(true);
    expect(P.canRespondContact(A("student"), ["u-student"], "accepted")).toBe(false);
    expect(P.canRespondContact(A("student"), ["x"], "pending")).toBe(false);
    expect(P.canRespondContact(null, ["x"], "pending")).toBe(false);
  });
});
