import { describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { testObjects } from "@/lib/storage";
import { makeChallenge, makeOrg, makeProject, makeUser } from "../../../tests/helpers";
import { completeUpload, presignUploadFor } from "@/modules/files/service";
import {
  activateWorkspace, addMember, closeWorkspace, createMeeting, createMilestone, createTask, createUpdate, createWorkspace, deleteMilestone, deleteTask,
  getFinalReport, getWorkspace, linkCourse, listMeetings, listMilestones, listUpdates, myWorkspaces, removeMember, saveFinalReport, sendDeadlineReminders,
  setAgreement, updateMilestone, updateTask, updateWorkspace, upsertWorkspaceIp,
} from "./service";

async function confirmedMatch() {
  const co = await makeOrg("company");
  const rep = await makeUser("company_admin", co.id);
  const uni = await makeOrg("university");
  const student = await makeUser("student", uni.id);
  const sup = await makeUser("researcher", uni.id);
  const c = await makeChallenge(co.id, rep.id, { status: "matched" });
  const p = await makeProject(uni.id, student.id, { status: "published", supervisor_id: sup.id });
  const m = await db.match.create({ data: { challenge_id: c.id, target_type: "project", target_id: p.id, score: 0.8, rationale: "r", criteria_scores: {}, status: "confirmed" } });
  return { co, rep, uni, student, sup, c, p, m };
}

async function uploadPdf(actor: Awaited<ReturnType<typeof makeUser>>, wsId: string) {
  const up = await presignUploadFor(actor, { owner_type: "workspace", owner_id: wsId, filename: "اتفاقية.pdf", mime: "application/pdf", size: 5 });
  const d = await db.document.findUniqueOrThrow({ where: { id: up.document_id } });
  testObjects.set(d.file_key, { size: 5, head: new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]) });
  await completeUpload(actor, d.id);
  return d.id;
}

describe("workspaces (E2E path 4)", () => {
  it("create from confirmed match → setup gate → activate → milestones/tasks/files/updates → final report → close with rating", async () => {
    const s = await confirmedMatch();
    const pending = await db.match.create({ data: { challenge_id: s.c.id, target_type: "researcher", target_id: (await db.researcherProfile.findFirstOrThrow()).id, score: 0.7, rationale: "r", criteria_scores: {}, status: "shortlisted" } });
    await expect(createWorkspace(s.rep, pending.id)).rejects.toMatchObject({ message: "match_not_confirmed" });
    await expect(createWorkspace(s.student, s.m.id)).rejects.toMatchObject({ code: "forbidden" });
    const ws = await createWorkspace(s.rep, s.m.id);
    await expect(createWorkspace(s.rep, s.m.id)).rejects.toMatchObject({ code: "conflict" });
    expect(ws.status).toBe("setup");
    const view = await getWorkspace(s.student, ws.id);
    expect(view.members.map((m) => m.ws_role).sort()).toEqual(["company_rep", "student", "supervisor"]);
    expect(view.my_role).toBe("student");

    // FR-4 acceptance: non-members get 404 everywhere.
    const outsider = await makeUser("company_admin");
    for (const fn of [() => getWorkspace(outsider, ws.id), () => listMilestones(outsider, ws.id), () => listUpdates(outsider, ws.id), () => listMeetings(outsider, ws.id), () => getFinalReport(outsider, ws.id)]) {
      await expect(fn()).rejects.toMatchObject({ status: 404 });
    }
    await expect(presignUploadFor(outsider, { owner_type: "workspace", owner_id: ws.id, filename: "x.pdf", mime: "application/pdf", size: 1 })).rejects.toMatchObject({ status: 404 });

    // FR-4.2 gate
    await expect(activateWorkspace(s.rep, ws.id)).rejects.toMatchObject({ message: "setup_incomplete" });
    await expect(activateWorkspace(s.student, ws.id)).rejects.toMatchObject({ code: "forbidden" });
    const doc = await uploadPdf(s.rep, ws.id);
    await setAgreement(s.rep, ws.id, doc);
    await expect(upsertWorkspaceIp(s.rep, ws.id, { ip_status: "none", owners: [{ name: "الشركة", share: 60 }, { name: "الجامعة", share: 30 }] })).rejects.toThrow();
    await upsertWorkspaceIp(s.rep, ws.id, { ip_status: "none", owners: [{ name: "الشركة", share: 50 }, { name: "الجامعة", share: 50 }] });
    await expect(upsertWorkspaceIp(s.rep, ws.id, { ip_status: "disclosed", owners: [{ name: "الشركة", share: 100 }] })).rejects.toMatchObject({ message: "agreement_required_for_change" });
    await updateWorkspace(s.rep, ws.id, { objectives: "أهداف" });
    await expect(updateWorkspace(s.rep, ws.id, { status: "paused" })).rejects.toMatchObject({ message: "activate_first" });
    await activateWorkspace(s.rep, ws.id);
    expect((await db.challenge.findUniqueOrThrow({ where: { id: s.c.id } })).status).toBe("in_progress");
    expect((await db.project.findUniqueOrThrow({ where: { id: s.p.id } })).status).toBe("in_collaboration");

    // Work
    const ms = await createMilestone(s.sup, ws.id, { title: "النموذج الأولي", due_date: new Date(Date.now() + 2 * 864e5) });
    const t = await createTask(s.sup, ws.id, { milestone_id: ms.id, title: "تجهيز العينات", assignee_id: s.student.id });
    expect(await db.notification.count({ where: { user_id: s.student.id, type: "task_assigned" } })).toBe(1);
    await expect(createTask(s.sup, ws.id, { milestone_id: ms.id, title: "مهمة", assignee_id: outsider.id })).rejects.toMatchObject({ message: "assignee_not_member" });
    await updateTask(s.student, ws.id, t.id, { status: "done" });
    await updateMilestone(s.student, ws.id, ms.id, { status: "in_progress" });
    expect((await listMilestones(s.rep, ws.id))[0]!.tasks[0]!.status).toBe("done");
    await createMeeting(s.rep, ws.id, { held_at: new Date(), attendees: ["أحمد"], notes: "اجتماع انطلاق", action_items: ["إرسال العينات"] });
    await createUpdate(s.student, ws.id, { body: "أنجزنا أول نموذج", prototype_stage: "lab", test_results: "قوة ضغط 12 ميغاباسكال" });
    expect(await db.notification.count({ where: { type: "progress_update" } })).toBe(2); // rep + supervisor
    expect(await sendDeadlineReminders()).toBe(1);
    await linkCourse(s.sup, ws.id, { course_code: "CE499", semester: "2026-1" });
    await expect(linkCourse(s.student, ws.id, { course_code: "x", semester: "y" })).rejects.toMatchObject({ code: "forbidden" });
    const extra = await makeUser("company_member", s.co.id);
    await addMember(s.rep, ws.id, { user_id: extra.id, ws_role: "mentor" });
    await expect(addMember(s.rep, ws.id, { user_id: outsider.id, ws_role: "mentor" })).rejects.toMatchObject({ message: "member_org_not_in_workspace" });
    await removeMember(s.rep, ws.id, extra.id);
    const t2 = await createTask(s.sup, ws.id, { milestone_id: ms.id, title: "مؤقتة" });
    await deleteTask(s.sup, ws.id, t2.id);
    const ms2 = await createMilestone(s.sup, ws.id, { title: "مؤقتة" });
    await deleteMilestone(s.sup, ws.id, ms2.id);

    // Close
    const closeInput = { outcome: "solved" as const, rating: 5, rating_comment: "تعاون ممتاز", impact: { waste_reduction_tons: 120 } };
    await expect(closeWorkspace(s.rep, ws.id, closeInput)).rejects.toMatchObject({ message: "final_report_required" });
    await saveFinalReport(s.student, ws.id, { summary: "ملخص", solution: "حل", results: "نتائج", technical_recommendations: "", business_recommendations: "", next_steps: "" });
    await expect(closeWorkspace(s.sup, ws.id, closeInput)).rejects.toMatchObject({ code: "forbidden" });
    await closeWorkspace(s.rep, ws.id, closeInput);
    const closed = await getWorkspace(s.rep, ws.id);
    expect(closed).toMatchObject({ status: "completed", rating: 5 });
    expect(closed.can.edit).toBe(false);
    expect((await db.challenge.findUniqueOrThrow({ where: { id: s.c.id } })).status).toBe("solved");
    expect((await getFinalReport(s.rep, ws.id)).report.summary).toBe("ملخص");
    expect((await myWorkspaces(s.student)).map((w) => w.id)).toEqual([ws.id]);
    await expect(createUpdate(s.student, ws.id, { body: "بعد الإغلاق" })).rejects.toMatchObject({ code: "forbidden" });
    expect(await db.auditLog.count({ where: { action: "ip_record_change" } })).toBe(1);
  });
});
