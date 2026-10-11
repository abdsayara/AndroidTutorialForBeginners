import { describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { makeOrg, makeProject, makeSector, makeUser } from "../../../tests/helpers";
import { approveProject, archiveProject, createProject, deleteProject, getProject, importProjects, listProjects, myProjects, pendingProjects, submitProject, updateProject } from "./service";
import { projectListSchema } from "./schema";

const L = (o: Record<string, unknown> = {}) => projectListSchema.parse(o);

describe("projects service", () => {
  it("E2E path 2: student creates, coordinator approves, appears in directory", async () => {
    const sector = await makeSector("water");
    const uni = await makeOrg("university");
    const student = await makeUser("student", uni.id);
    const sup = await makeUser("researcher", uni.id);
    const uc = await makeUser("university_coordinator", uni.id);
    const otherUc = await makeUser("university_coordinator");
    const company = await makeUser("company_admin");

    const p = await createProject(student, { type: "graduation_project", title: "معالجة مياه الصرف الصناعي بالأغشية" });
    expect(p.team_member_ids).toContain(student.id);
    await expect(submitProject(student, p.id)).rejects.toMatchObject({ message: "incomplete_project" });
    await updateProject(student, p.id, {
      summary: "نظام ترشيح بالأغشية لمعالجة مياه مصانع الأغذية وإعادة استخدامها في الري.",
      problem_addressed: "تلوث المياه من المصانع", sector_id: sector.id, trl: 4, supervisor_id: sup.id, seeking: ["industry_partner"],
    });
    await submitProject(student, p.id);
    expect((await listProjects(company, L())).items).toHaveLength(0);
    await expect(getProject(company, p.id)).rejects.toMatchObject({ code: "not_found" });
    expect((await pendingProjects(uc)).map((x) => x.id)).toEqual([p.id]);
    expect(await pendingProjects(otherUc)).toHaveLength(0);
    await expect(approveProject(otherUc, p.id, { decision: "approve" })).rejects.toMatchObject({ code: "forbidden" });
    await approveProject(uc, p.id, { decision: "approve" });

    const res = await listProjects(null, L({ q: "الأغشية" }));
    expect(res.items).toHaveLength(1);
    expect((await listProjects(null, L({ trl_min: 5 }))).items).toHaveLength(0);
    expect((await listProjects(null, L({ seeking: "industry_partner|licensing" }))).items).toHaveLength(1);
    const visitorView = await getProject(null, p.id);
    expect(visitorView.kind === "full" && visitorView.team?.every((t) => !("email" in t))).toBe(true);
    const companyView = await getProject(company, p.id);
    expect(companyView.kind === "full" && companyView.team?.some((t) => "email" in t)).toBe(true);
    expect((await myProjects(sup)).map((x) => x.id)).toContain(p.id);
    expect((await myProjects(uc)).map((x) => x.id)).toContain(p.id);
  });

  it("rejection returns to draft with a note; archive and delete rules; foreign team members rejected", async () => {
    const uni = await makeOrg("university");
    const r = await makeUser("researcher", uni.id);
    const uc = await makeUser("university_coordinator", uni.id);
    const stranger = await makeUser("student");
    await expect(createProject(r, { type: "research_output", title: "بحث", team_member_ids: [stranger.id] })).rejects.toMatchObject({ message: "members_must_be_in_university" });
    const p = await makeProject(uni.id, r.id, { status: "pending_approval" });
    await approveProject(uc, p.id, { decision: "reject", note: "أضف أدلة الأداء" });
    const v = await getProject(r, p.id);
    expect(v.kind === "full" && v.review_note).toBe("أضف أدلة الأداء");
    await deleteProject(r, p.id);
    const p2 = await makeProject(uni.id, r.id, { status: "published" });
    await expect(deleteProject(r, p2.id)).rejects.toMatchObject({ code: "forbidden" });
    await archiveProject(r, p2.id);
    await expect(archiveProject(r, p2.id)).rejects.toMatchObject({ code: "forbidden" });
  });

  it("confidential projects: teaser only and narrowing revokes grants", async () => {
    const uni = await makeOrg("university");
    const r = await makeUser("researcher", uni.id);
    const company = await makeUser("company_admin");
    const p = await makeProject(uni.id, r.id, { status: "published", visibility: "public" });
    await db.accessGrant.create({ data: { subject_type: "project", subject_id: p.id, user_id: company.id, granted_by: r.id, nda_version: "v" } });
    await expect(updateProject(r, p.id, { visibility: "confidential" })).rejects.toMatchObject({ message: "public_title_required" });
    await updateProject(r, p.id, { visibility: "confidential", public_title: "تقنية مياه" });
    expect(await db.accessGrant.count({ where: { revoked_at: null } })).toBe(0);
    const v = await getProject(company, p.id);
    expect(v).toMatchObject({ kind: "teaser", public_title: "تقنية مياه" });
    await expect(getProject(null, p.id)).rejects.toMatchObject({ code: "unauthenticated" });
  });

  it("FR-3.5: CSV import with per-row errors; 200 rows in under a minute", async () => {
    await makeSector("food");
    const uni = await makeOrg("university");
    const uc = await makeUser("university_coordinator", uni.id);
    const sup = await makeUser("researcher", uni.id);
    const supEmail = (await db.user.findUniqueOrThrow({ where: { id: sup.id } })).email;
    const header = "type,title,summary,problem_addressed,sector_slug,tags,trl,supervisor_email,seeking";
    const good = Array.from({ length: 200 }, (_, i) => `graduation_project,"مشروع رقم ${i}, تجريبي",ملخص,مشكلة,food,أغذية|تعبئة,${(i % 9) + 1},${supEmail},showcase|startup`);
    const bad = ["unknown_type,عنوان,,,,,,,", "prototype,عنوان جيد,,,nosuch,,,,", "prototype,عنوان جيد,,,,,12,,", "prototype,عنوان جيد,,,,,,ghost@x.ps,"];
    const t0 = Date.now();
    const report = await importProjects(uc, [header, ...good, ...bad].join("\n"));
    expect(Date.now() - t0).toBeLessThan(60_000);
    expect(report.created).toBe(200);
    expect(report.errors.map((e) => e.row)).toEqual([202, 203, 204, 205]);
    expect(await db.project.count({ where: { org_id: uni.id, status: "draft" } })).toBe(200);
    expect((await db.project.findFirstOrThrow({ where: { title: "مشروع رقم 1, تجريبي" } })).tags).toEqual(["أغذية", "تعبئة"]);
    await expect(importProjects(uc, "foo,bar\n1,2")).rejects.toMatchObject({ message: "missing_columns" });
    await expect(importProjects(sup, header)).rejects.toMatchObject({ code: "forbidden" });
  });
});
