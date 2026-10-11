import { describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { testQueue } from "@/lib/jobs";
import { AppError } from "@/lib/api/errors";
import { actorFromToken } from "@/lib/auth/session";
import { makeOrg, makeUser } from "../../../tests/helpers";
import {
  approveUser, CURRENT_CONSENT_VERSION, deleteMyAccount, exportMyData, forgotPassword, login, me, pendingUsersFor, register, resetPassword,
  updateProfile, updateResearcherProfile, verifyEmail,
} from "./service";

const base = { password: "correct-horse-1", full_name: "سارة أحمد", locale: "ar" as const, consent_version: CURRENT_CONSENT_VERSION };

describe("auth service", () => {
  it("FR-0.1: company registers with a new org, verifies, logs in as pending", async () => {
    const { user, verifyToken } = await register({ ...base, email: "ceo@stone.ps", role: "company_admin", new_org: { type: "company", name_ar: "مصنع حجر الخليل" } });
    expect(user.status).toBe("pending");
    expect(testQueue.some((j) => j.name === "mail.send")).toBe(true);
    await expect(login("ceo@stone.ps", base.password)).rejects.toMatchObject({ message: "email_not_verified" });
    await verifyEmail(verifyToken);
    await expect(verifyEmail(verifyToken)).rejects.toBeInstanceOf(AppError);
    const { token } = await login("ceo@stone.ps", base.password);
    const actor = await actorFromToken(token);
    expect(actor?.status).toBe("pending");
    expect((await db.organization.findFirstOrThrow({ where: { id: user.org_id } })).status).toBe("pending");
  });

  it("FR-0.4: university email domain links automatically, approval stays manual", async () => {
    const uni = await makeOrg("university", { email_domains: ["najah.edu"] });
    const { user } = await register({ ...base, email: "s1@najah.edu", role: "student" });
    expect(user.org_id).toBe(uni.id);
    expect(user.status).toBe("pending");
  });

  it("rejects duplicates, missing org, mismatched org type, and students creating universities", async () => {
    const company = await makeOrg("company");
    await register({ ...base, email: "a@x.ps", role: "company_member", org_id: company.id });
    await expect(register({ ...base, email: "a@x.ps", role: "company_member", org_id: company.id })).rejects.toMatchObject({ code: "conflict" });
    await expect(register({ ...base, email: "b@x.ps", role: "student" })).rejects.toMatchObject({ message: "org_required" });
    await expect(register({ ...base, email: "c@x.ps", role: "student", org_id: company.id })).rejects.toMatchObject({ message: "org_type_mismatch" });
    await expect(register({ ...base, email: "d@x.ps", role: "student", new_org: { type: "university", name_ar: "جامعة" } })).rejects.toMatchObject({ message: "university_required" });
    await expect(register({ ...base, email: "e@x.ps", role: "company_admin", new_org: { type: "university", name_ar: "جامعة" } })).rejects.toMatchObject({ message: "org_type_mismatch" });
    await expect(register({ ...base, email: "f@x.ps", role: "company_admin", consent_version: "old", new_org: { type: "company", name_ar: "ش" } })).rejects.toMatchObject({ message: "consent_required" });
  });

  it("PRD §9: locks the account after 5 failed attempts", async () => {
    const uni = await makeOrg("university");
    const { verifyToken } = await register({ ...base, email: "r@u.ps", role: "researcher", org_id: uni.id });
    await verifyEmail(verifyToken);
    for (let i = 0; i < 5; i++) await expect(login("r@u.ps", "wrong-password")).rejects.toMatchObject({ code: "unauthenticated" });
    await expect(login("r@u.ps", base.password)).rejects.toMatchObject({ message: "account_locked" });
    await expect(login("nobody@u.ps", "x")).rejects.toMatchObject({ code: "unauthenticated" });
  });

  it("password reset invalidates sessions", async () => {
    const uni = await makeOrg("university");
    const { verifyToken } = await register({ ...base, email: "p@u.ps", role: "researcher", org_id: uni.id });
    await verifyEmail(verifyToken);
    const { token: session } = await login("p@u.ps", base.password);
    expect(await forgotPassword("unknown@u.ps")).toBeNull();
    const reset = (await forgotPassword("p@u.ps"))!;
    await resetPassword(reset, "brand-new-password");
    expect(await actorFromToken(session)).toBeNull();
    await login("p@u.ps", "brand-new-password");
  });

  it("FR-0.2: university coordinator approves own students; others are forbidden", async () => {
    const uni = await makeOrg("university");
    const uc = await makeUser("university_coordinator", uni.id);
    const other = await makeUser("university_coordinator");
    const { user, verifyToken } = await register({ ...base, email: "st@u.ps", role: "student", org_id: uni.id });
    await verifyEmail(verifyToken);
    expect((await pendingUsersFor(uc)).map((u) => u.id)).toContain(user.id);
    expect((await pendingUsersFor(other)).map((u) => u.id)).not.toContain(user.id);
    await expect(approveUser(other, user.id)).rejects.toMatchObject({ code: "forbidden" });
    const approved = await approveUser(uc, user.id);
    expect(approved.status).toBe("active");
    await expect(approveUser(uc, user.id)).rejects.toMatchObject({ code: "invalid_transition" });
    await expect(approveUser(uc, "00000000-0000-0000-0000-000000000000")).rejects.toMatchObject({ code: "not_found" });
    expect(await db.auditLog.count({ where: { action: "user_approved", entity_id: user.id } })).toBe(1);
  });

  it("profile, researcher profile, export, and delete", async () => {
    const r = await makeUser("researcher");
    expect((await updateProfile(r, { full_name: "د. خالد" })).full_name).toBe("د. خالد");
    const p = await updateResearcherProfile(r, { expertise_tags: ["معالجة المياه"] });
    expect(p.expertise_tags).toEqual(["معالجة المياه"]);
    expect(testQueue.some((j) => j.name === "embed.entity")).toBe(true);
    const s = await makeUser("student");
    await expect(updateResearcherProfile(s, {})).rejects.toMatchObject({ code: "forbidden" });
    expect((await me(r)).researcher?.expertise_tags).toEqual(["معالجة المياه"]);
    expect((await exportMyData(r)).user.id).toBe(r.id);
    await deleteMyAccount(r);
    const u = await db.user.findUniqueOrThrow({ where: { id: r.id } });
    expect(u.deleted_at).not.toBeNull();
    expect(u.email).toContain("deleted+");
  });

  it("AuditLog is append-only", async () => {
    await db.auditLog.create({ data: { action: "x", entity_type: "y" } });
    await expect(db.auditLog.updateMany({ data: { action: "z" } })).rejects.toThrow();
    await expect(db.auditLog.deleteMany({})).rejects.toThrow();
  });
});
