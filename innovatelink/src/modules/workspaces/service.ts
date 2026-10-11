import type { Prisma, WsRole } from "@prisma/client";
import type { z } from "zod";
import { db } from "@/lib/db";
import { AppError, assertAllowed, notFound } from "@/lib/api/errors";
import { audit } from "@/lib/audit";
import { isPlatformStaff, type Actor } from "@/modules/auth/policy";
import { canManageChallenge } from "@/modules/challenges/policy";
import { notify } from "@/modules/notifications/service";
import { targetOwners } from "@/modules/matching/service";
import { loadWorkspaceForActor } from "./access";
import { canActivateWorkspace, canCloseWorkspace, canEditWorkspace, canLinkCourse, canManageWorkspace } from "./policy";
import { ipRecordSchema } from "./schema";
import type {
  closeSchema, courseLinkSchema, finalReportSchema, meetingSchema, memberSchema, milestoneSchema, milestoneUpdateSchema,
  progressSchema, taskSchema, taskUpdateSchema, updateWorkspaceSchema,
} from "./schema";

async function memberIds(wsId: string) {
  return (await db.workspaceMember.findMany({ where: { workspace_id: wsId }, select: { user_id: true } })).map((m) => m.user_id);
}

/** FR-4.1: created only from a confirmed match, prefilled with challenge objectives and both parties. */
export async function createWorkspace(actor: Actor, matchId: string, ip?: string) {
  const m = await db.match.findUnique({ where: { id: matchId }, include: { challenge: true, workspace: true } });
  if (!m) throw notFound();
  assertAllowed(canManageChallenge(actor, m.challenge) || isPlatformStaff(actor));
  if (m.status !== "confirmed") throw new AppError("invalid_transition", "match_not_confirmed");
  if (m.workspace) throw new AppError("conflict", "workspace_exists");

  const members = new Map<string, WsRole>();
  for (const u of await db.user.findMany({ where: { org_id: m.challenge.org_id, role: "company_admin", status: "active" }, select: { id: true } })) members.set(u.id, "company_rep");
  if (m.target_type === "project") {
    const p = await db.project.findUniqueOrThrow({ where: { id: m.target_id } });
    for (const id of [p.created_by, ...p.team_member_ids]) if (!members.has(id)) members.set(id, "student");
    if (p.supervisor_id) members.set(p.supervisor_id, "supervisor");
  } else {
    for (const id of await targetOwners(m.target_type, m.target_id)) if (!members.has(id)) members.set(id, "supervisor");
  }
  if (isPlatformStaff(actor)) members.set(actor.id, "coordinator");

  const ws = await db.$transaction(async (tx) => {
    const w = await tx.workspace.create({
      data: {
        match_id: m.id, challenge_id: m.challenge_id, project_id: m.target_type === "project" ? m.target_id : null,
        title: m.challenge.title, objectives: m.challenge.desired_outcome ?? m.challenge.problem_statement, status: "setup",
        members: { create: [...members].map(([user_id, ws_role]) => ({ user_id, ws_role })) },
      },
    });
    await audit({ actor_id: actor.id, action: "workspace_created", entity_type: "workspace", entity_id: w.id, diff: { match_id: m.id }, ip }, tx);
    return w;
  });
  await notify([...members.keys()].filter((id) => id !== actor.id), "match_update", { subject: ws.title, status: "confirmed", url: `/workspaces/${ws.id}` });
  return ws;
}

export async function getWorkspace(actor: Actor, id: string) {
  const { ws, member } = await loadWorkspaceForActor(actor, id);
  const [members, ip, agreement, counts] = await Promise.all([
    db.workspaceMember.findMany({ where: { workspace_id: id }, include: { user: { select: { id: true, full_name: true, email: true, role: true, org: { select: { name_ar: true, name_en: true } } } } } }),
    db.ipRecord.findUnique({ where: { workspace_id: id } }),
    ws.agreement_doc_id ? db.document.findUnique({ where: { id: ws.agreement_doc_id }, select: { id: true, filename: true, created_at: true } }) : null,
    db.milestone.findMany({ where: { workspace_id: id }, select: { status: true, tasks: { select: { status: true } } } }),
  ]);
  const tasks = counts.flatMap((m) => m.tasks);
  return {
    ...ws, my_role: member?.ws_role ?? (isPlatformStaff(actor) ? "coordinator" : null), members, ip_record: ip, agreement,
    setup: { agreement_uploaded: !!ws.agreement_doc_id, ip_record_filled: !!ip },
    progress: { milestones: counts.length, milestones_done: counts.filter((m) => m.status === "done").length, tasks: tasks.length, tasks_done: tasks.filter((t) => t.status === "done").length },
    can: {
      edit: canEditWorkspace(actor, member, ws), manage: canManageWorkspace(actor, member, ws), activate: canActivateWorkspace(actor, member, ws),
      close: canCloseWorkspace(actor, member, ws), link_course: !!member && canLinkCourse(actor, member, ws),
    },
  };
}

export async function myWorkspaces(actor: Actor) {
  return db.workspace.findMany({
    where: { deleted_at: null, ...(isPlatformStaff(actor) ? {} : { members: { some: { user_id: actor.id } } }) },
    select: { id: true, title: true, status: true, start_date: true, end_date: true, updated_at: true },
    orderBy: { updated_at: "desc" },
  });
}

export async function updateWorkspace(actor: Actor, id: string, data: z.infer<typeof updateWorkspaceSchema>) {
  const { ws, member } = await loadWorkspaceForActor(actor, id);
  assertAllowed(canManageWorkspace(actor, member, ws));
  if (data.status && ws.status === "setup") throw new AppError("invalid_transition", "activate_first");
  return db.workspace.update({ where: { id }, data });
}

/** FR-4.8 */
export async function linkCourse(actor: Actor, id: string, data: z.infer<typeof courseLinkSchema>) {
  const { ws, member } = await loadWorkspaceForActor(actor, id);
  assertAllowed(!!member && canLinkCourse(actor, member, ws));
  return db.workspace.update({ where: { id }, data });
}

export async function addMember(actor: Actor, id: string, data: z.infer<typeof memberSchema>) {
  const { ws, member } = await loadWorkspaceForActor(actor, id);
  assertAllowed(canManageWorkspace(actor, member, ws));
  const u = await db.user.findFirst({ where: { id: data.user_id, status: "active", deleted_at: null } });
  if (!u) throw notFound();
  // Members must belong to one of the two parties' organisations (or the platform).
  const allowedOrgs = new Set((await db.workspaceMember.findMany({ where: { workspace_id: id }, include: { user: { select: { org_id: true } } } })).map((x) => x.user.org_id));
  if (!allowedOrgs.has(u.org_id) && u.role !== "platform_coordinator") throw new AppError("validation_error", "member_org_not_in_workspace");
  return db.workspaceMember.upsert({ where: { workspace_id_user_id: { workspace_id: id, user_id: u.id } }, create: { workspace_id: id, ...data }, update: { ws_role: data.ws_role } });
}

export async function removeMember(actor: Actor, id: string, userId: string) {
  const { ws, member } = await loadWorkspaceForActor(actor, id);
  assertAllowed(canManageWorkspace(actor, member, ws));
  await db.workspaceMember.deleteMany({ where: { workspace_id: id, user_id: userId } });
}

/** FR-4.2: attach the signed collaboration agreement (a completed workspace Document). */
export async function setAgreement(actor: Actor, id: string, documentId: string, ip?: string) {
  const { ws, member } = await loadWorkspaceForActor(actor, id);
  assertAllowed(canManageWorkspace(actor, member, ws));
  const doc = await db.document.findFirst({ where: { id: documentId, owner_type: "workspace", owner_id: id, completed: true, deleted_at: null } });
  if (!doc) throw notFound();
  if (doc.mime !== "application/pdf") throw new AppError("validation_error", "agreement_must_be_pdf");
  await audit({ actor_id: actor.id, action: "admin_action", entity_type: "workspace", entity_id: id, diff: { agreement_doc_id: documentId }, ip });
  return db.workspace.update({ where: { id }, data: { agreement_doc_id: documentId } });
}

/** FR-4.2 / FR-6.4: IpRecord for the workspace — every change audited; owners' shares total 100%. */
export async function upsertWorkspaceIp(actor: Actor, id: string, input: z.infer<typeof ipRecordSchema>, ip?: string) {
  const data = ipRecordSchema.parse(input);
  const { ws, member } = await loadWorkspaceForActor(actor, id);
  assertAllowed(canManageWorkspace(actor, member, ws));
  const prev = await db.ipRecord.findUnique({ where: { workspace_id: id } });
  if (prev && !data.agreement_doc_id) throw new AppError("validation_error", "agreement_required_for_change", { agreement_doc_id: ["required"] });
  const rec = await db.ipRecord.upsert({
    where: { workspace_id: id },
    create: { workspace_id: id, ...data, owners: data.owners as Prisma.InputJsonValue },
    update: { ...data, owners: data.owners as Prisma.InputJsonValue },
  });
  await audit({ actor_id: actor.id, action: "ip_record_change", entity_type: "ip_record", entity_id: rec.id, diff: { before: prev ? { ip_status: prev.ip_status, owners: prev.owners } : null, after: { ip_status: rec.ip_status, owners: rec.owners } } as Prisma.InputJsonValue, ip });
  return rec;
}

/** FR-4.2: activation requires the agreement + basic IpRecord. Moves challenge/project into collaboration. */
export async function activateWorkspace(actor: Actor, id: string, ip?: string) {
  const { ws, member } = await loadWorkspaceForActor(actor, id);
  assertAllowed(canActivateWorkspace(actor, member, ws));
  const ipRec = await db.ipRecord.findUnique({ where: { workspace_id: id } });
  if (!ws.agreement_doc_id || !ipRec) throw new AppError("validation_error", "setup_incomplete", { agreement: ws.agreement_doc_id ? [] : ["required"], ip_record: ipRec ? [] : ["required"] });
  return db.$transaction(async (tx) => {
    const w = await tx.workspace.update({ where: { id }, data: { status: "active", start_date: ws.start_date ?? new Date() } });
    await audit({ actor_id: actor.id, action: "status_change", entity_type: "workspace", entity_id: id, diff: { status: ["setup", "active"] }, ip }, tx);
    const c = await tx.challenge.findUniqueOrThrow({ where: { id: ws.challenge_id } });
    if (c.status === "matched") {
      await tx.challenge.update({ where: { id: c.id }, data: { status: "in_progress" } });
      await audit({ actor_id: actor.id, action: "status_change", entity_type: "challenge", entity_id: c.id, diff: { status: ["matched", "in_progress"] }, ip }, tx);
    }
    if (ws.project_id) {
      const p = await tx.project.findUniqueOrThrow({ where: { id: ws.project_id } });
      if (p.status === "published") {
        await tx.project.update({ where: { id: p.id }, data: { status: "in_collaboration" } });
        await audit({ actor_id: actor.id, action: "status_change", entity_type: "project", entity_id: p.id, diff: { status: ["published", "in_collaboration"] }, ip }, tx);
      }
    }
    return w;
  });
}

// ── milestones & tasks (FR-4.3) ──

export async function listMilestones(actor: Actor, id: string) {
  await loadWorkspaceForActor(actor, id);
  return db.milestone.findMany({ where: { workspace_id: id }, include: { tasks: { orderBy: { created_at: "asc" } } }, orderBy: [{ order: "asc" }, { created_at: "asc" }] });
}

export async function createMilestone(actor: Actor, id: string, data: z.infer<typeof milestoneSchema>) {
  const { ws, member } = await loadWorkspaceForActor(actor, id);
  assertAllowed(canEditWorkspace(actor, member, ws));
  return db.milestone.create({ data: { workspace_id: id, ...data } });
}

export async function updateMilestone(actor: Actor, id: string, milestoneId: string, data: z.infer<typeof milestoneUpdateSchema>) {
  const { ws, member } = await loadWorkspaceForActor(actor, id);
  assertAllowed(canEditWorkspace(actor, member, ws));
  const m = await db.milestone.findFirst({ where: { id: milestoneId, workspace_id: id } });
  if (!m) throw notFound();
  return db.milestone.update({ where: { id: milestoneId }, data });
}

export async function deleteMilestone(actor: Actor, id: string, milestoneId: string) {
  const { ws, member } = await loadWorkspaceForActor(actor, id);
  assertAllowed(canEditWorkspace(actor, member, ws));
  await db.milestone.deleteMany({ where: { id: milestoneId, workspace_id: id } });
}

async function assertMember(wsId: string, userId: string | null | undefined) {
  if (!userId) return;
  const m = await db.workspaceMember.findUnique({ where: { workspace_id_user_id: { workspace_id: wsId, user_id: userId } } });
  if (!m) throw new AppError("validation_error", "assignee_not_member", { assignee_id: ["not_member"] });
}

export async function createTask(actor: Actor, id: string, data: z.infer<typeof taskSchema>) {
  const { ws, member } = await loadWorkspaceForActor(actor, id);
  assertAllowed(canEditWorkspace(actor, member, ws));
  const ms = await db.milestone.findFirst({ where: { id: data.milestone_id, workspace_id: id } });
  if (!ms) throw notFound();
  await assertMember(id, data.assignee_id);
  const t = await db.task.create({ data });
  if (t.assignee_id && t.assignee_id !== actor.id) await notify([t.assignee_id], "task_assigned", { subject: t.title, url: `/workspaces/${id}/tasks` });
  return t;
}

export async function updateTask(actor: Actor, id: string, taskId: string, data: z.infer<typeof taskUpdateSchema>) {
  const { ws, member } = await loadWorkspaceForActor(actor, id);
  assertAllowed(canEditWorkspace(actor, member, ws));
  const t = await db.task.findFirst({ where: { id: taskId, milestone: { workspace_id: id } } });
  if (!t) throw notFound();
  if (data.milestone_id && !(await db.milestone.findFirst({ where: { id: data.milestone_id, workspace_id: id } }))) throw notFound();
  await assertMember(id, data.assignee_id);
  const u = await db.task.update({ where: { id: taskId }, data });
  if (data.assignee_id && data.assignee_id !== t.assignee_id && data.assignee_id !== actor.id) {
    await notify([data.assignee_id], "task_assigned", { subject: u.title, url: `/workspaces/${id}/tasks` });
  }
  return u;
}

export async function deleteTask(actor: Actor, id: string, taskId: string) {
  const { ws, member } = await loadWorkspaceForActor(actor, id);
  assertAllowed(canEditWorkspace(actor, member, ws));
  await db.task.deleteMany({ where: { id: taskId, milestone: { workspace_id: id } } });
}

// ── meetings & updates ──

export async function listMeetings(actor: Actor, id: string) {
  await loadWorkspaceForActor(actor, id);
  return db.meetingNote.findMany({ where: { workspace_id: id }, orderBy: { held_at: "desc" } });
}

export async function createMeeting(actor: Actor, id: string, data: z.infer<typeof meetingSchema>) {
  const { ws, member } = await loadWorkspaceForActor(actor, id);
  assertAllowed(canEditWorkspace(actor, member, ws));
  return db.meetingNote.create({ data: { workspace_id: id, created_by: actor.id, ...data } });
}

export async function listUpdates(actor: Actor, id: string) {
  await loadWorkspaceForActor(actor, id);
  const ups = await db.progressUpdate.findMany({ where: { workspace_id: id }, orderBy: { created_at: "desc" } });
  const authors = await db.user.findMany({ where: { id: { in: ups.map((u) => u.author_id) } }, select: { id: true, full_name: true } });
  return ups.map((u) => ({ ...u, author: authors.find((a) => a.id === u.author_id) ?? null }));
}

/** FR-4.4: progress update notifies every member. */
export async function createUpdate(actor: Actor, id: string, data: z.infer<typeof progressSchema>) {
  const { ws, member } = await loadWorkspaceForActor(actor, id);
  assertAllowed(canEditWorkspace(actor, member, ws));
  const u = await db.progressUpdate.create({ data: { workspace_id: id, author_id: actor.id, ...data } });
  await notify((await memberIds(id)).filter((x) => x !== actor.id), "progress_update", { subject: ws.title, url: `/workspaces/${id}/updates` });
  return u;
}

// ── final report & closing ──

/** FR-4.6 */
export async function saveFinalReport(actor: Actor, id: string, data: z.infer<typeof finalReportSchema>) {
  const { ws, member } = await loadWorkspaceForActor(actor, id);
  assertAllowed(canEditWorkspace(actor, member, ws));
  return db.workspace.update({ where: { id }, data: { final_report: { ...data, updated_by: actor.id, updated_at: new Date().toISOString() } } });
}

export async function getFinalReport(actor: Actor, id: string) {
  const { ws } = await loadWorkspaceForActor(actor, id);
  const challenge = await db.challenge.findUniqueOrThrow({ where: { id: ws.challenge_id }, include: { org: { select: { name_ar: true, name_en: true } } } });
  const project = ws.project_id ? await db.project.findUnique({ where: { id: ws.project_id }, include: { org: { select: { name_ar: true, name_en: true } } } }) : null;
  const members = await db.workspaceMember.findMany({ where: { workspace_id: id }, include: { user: { select: { full_name: true } } } });
  return { workspace: ws, report: (ws.final_report ?? {}) as Record<string, string>, challenge, project, members };
}

/** FR-4.7: company closes with a rating and optional documented impact. */
export async function closeWorkspace(actor: Actor, id: string, data: z.infer<typeof closeSchema>, ip?: string) {
  const { ws, member } = await loadWorkspaceForActor(actor, id);
  assertAllowed(canCloseWorkspace(actor, member, ws));
  const report = (ws.final_report ?? {}) as Record<string, string>;
  if (!report.summary) throw new AppError("validation_error", "final_report_required", { final_report: ["required"] });
  return db.$transaction(async (tx) => {
    const w = await tx.workspace.update({
      where: { id },
      data: { status: "completed", end_date: new Date(), rating: data.rating, rating_comment: data.rating_comment, impact: data.impact as Prisma.InputJsonValue },
    });
    await audit({ actor_id: actor.id, action: "workspace_closed", entity_type: "workspace", entity_id: id, diff: { status: [ws.status, "completed"], rating: data.rating, outcome: data.outcome }, ip }, tx);
    const c = await tx.challenge.findUniqueOrThrow({ where: { id: ws.challenge_id } });
    if (c.status === "in_progress") {
      await tx.challenge.update({ where: { id: c.id }, data: { status: data.outcome, closed_at: new Date() } });
      await audit({ actor_id: actor.id, action: "status_change", entity_type: "challenge", entity_id: c.id, diff: { status: ["in_progress", data.outcome] }, ip }, tx);
    }
    if (ws.project_id) {
      const p = await tx.project.findUniqueOrThrow({ where: { id: ws.project_id } });
      if (p.status === "in_collaboration") {
        await tx.project.update({ where: { id: p.id }, data: { status: "published" } });
        await audit({ actor_id: actor.id, action: "status_change", entity_type: "project", entity_id: p.id, diff: { status: ["in_collaboration", "published"] }, ip }, tx);
      }
    }
    return w;
  });
}

/** FR-8.1: milestones due within 3 days → notify members (daily job). */
export async function sendDeadlineReminders(now = new Date()) {
  const soon = new Date(now.getTime() + 3 * 864e5);
  const ms = await db.milestone.findMany({
    where: { status: { not: "done" }, due_date: { gte: now, lte: soon }, workspace: { status: "active", deleted_at: null } },
  });
  for (const m of ms) await notify(await memberIds(m.workspace_id), "milestone_due", { subject: m.title, url: `/workspaces/${m.workspace_id}/tasks` });
  return ms.length;
}
