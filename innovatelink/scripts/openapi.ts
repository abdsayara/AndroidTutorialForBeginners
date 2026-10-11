/**
 * Generates openapi.yaml from the shared Zod schemas (PRD §8). Run: npm run openapi
 * Each entry: [method, path, summary, requestSchema?, querySchema?]
 */
import { writeFileSync } from "node:fs";
import { z, type ZodTypeAny } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import * as auth from "../src/modules/auth/schema";
import * as orgs from "../src/modules/orgs/schema";
import * as ch from "../src/modules/challenges/schema";
import * as pr from "../src/modules/projects/schema";
import * as mt from "../src/modules/matching/schema";
import * as ac from "../src/modules/access/schema";
import * as ct from "../src/modules/contact/schema";
import * as fl from "../src/modules/files/schema";
import * as ws from "../src/modules/workspaces/schema";
import * as as from "../src/modules/assistant/schema";
import * as cm from "../src/modules/commercialization/schema";
import * as ad from "../src/modules/admin/schema";
import { analyticsFilterSchema } from "../src/modules/analytics/service";

type E = [string, string, string, ZodTypeAny?, ZodTypeAny?];
const E: E[] = [
  ["post", "/auth/register", "Register (FR-0.1)", auth.registerSchema], ["post", "/auth/verify", "Confirm email", auth.tokenSchema],
  ["post", "/auth/login", "Log in (sets HttpOnly session cookie)", auth.loginSchema], ["post", "/auth/logout", "Log out"],
  ["post", "/auth/forgot", "Request password reset", auth.forgotSchema], ["post", "/auth/reset", "Reset password", auth.resetSchema],
  ["get", "/me", "Current user"], ["patch", "/me", "Update profile", auth.profileSchema], ["delete", "/me", "Delete own account (privacy)"],
  ["put", "/me/researcher", "Update researcher profile", auth.researcherProfileSchema], ["get", "/me/export", "Export own data (privacy)"],
  ["get", "/orgs", "List organisations", undefined, orgs.orgListSchema], ["post", "/orgs", "Create organisation (admin)", orgs.orgCreateSchema],
  ["get", "/orgs/{id}", "Get organisation"], ["patch", "/orgs/{id}", "Update organisation", orgs.orgUpdateSchema],
  ["post", "/orgs/{id}/approve", "Approve organisation (FR-0.2)"], ["get", "/orgs/{id}/members", "Organisation members"], ["get", "/orgs/pending", "Pending organisations"],
  ["get", "/users/pending", "Accounts the caller may approve"], ["post", "/users/{id}/approve", "Approve account (FR-0.2)"], ["get", "/taxonomy", "Sectors and tags"],
  ["get", "/challenges", "Browse challenges — hybrid text+semantic (FR-1.7)", undefined, ch.challengeListSchema], ["post", "/challenges", "Create draft (FR-1.1)", ch.challengeDraftSchema],
  ["get", "/challenges/mine", "My challenges (FR-1.5)", undefined, ch.myChallengesSchema], ["get", "/challenges/review-queue", "Submitted challenges (coordinators)"],
  ["get", "/challenges/{id}", "Challenge (full or confidential teaser)"], ["patch", "/challenges/{id}", "Autosave draft", ch.challengeUpdateSchema], ["delete", "/challenges/{id}", "Delete draft"],
  ["post", "/challenges/{id}/submit", "Submit for review (FR-1.4)"], ["post", "/challenges/{id}/review", "Publish or needs_info (FR-1.4)", ch.reviewSchema],
  ["post", "/challenges/{id}/diagnose", "AI diagnosis (FR-1.2, §7.1)"], ["post", "/challenges/{id}/close", "Close (FR-1.6)"],
  ["put", "/challenges/{id}/visibility", "Change confidentiality (FR-1.6)", ch.visibilitySchema],
  ["get", "/challenges/{id}/matches", "Matches of a challenge (FR-2.2/2.3)"], ["post", "/challenges/{id}/matches", "Manual match (FR-2.5)", mt.manualMatchSchema], ["post", "/challenges/{id}/rematch", "Re-run matching"],
  ["get", "/projects", "Project directory (FR-3.3)", undefined, pr.projectListSchema], ["post", "/projects", "Create project (FR-3.1)", pr.projectDraftSchema],
  ["get", "/projects/mine", "My projects"], ["get", "/projects/review-queue", "Projects pending approval"], ["post", "/projects/import", "CSV import (FR-3.5) — text/csv or multipart"],
  ["get", "/projects/{id}", "Project"], ["patch", "/projects/{id}", "Update project", pr.projectUpdateSchema], ["delete", "/projects/{id}", "Delete draft"],
  ["post", "/projects/{id}/submit", "Submit for approval"], ["post", "/projects/{id}/approve", "Approve / return (FR-3.2)", pr.projectApproveSchema], ["post", "/projects/{id}/archive", "Archive"],
  ["get", "/projects/{id}/matches", "Matches for a project"], ["get", "/projects/{id}/ip", "IP record"], ["put", "/projects/{id}/ip", "Update IP record (FR-6.4)", cm.projectIpSchema],
  ["get", "/matches", "Incoming matches for the academic side"], ["get", "/matches/suggested", "Suggested matches (coordinators)"], ["get", "/matches/clusters", "Similar challenges (FR-2.7)"],
  ["post", "/matches/{id}/shortlist", "Coordinator shortlist/reject (FR-2.3)", mt.shortlistSchema], ["post", "/matches/{id}/respond", "Accept/reject (FR-2.4)", mt.respondSchema],
  ["post", "/matches/{id}/feedback", "Useful / not useful (FR-2.8)", mt.feedbackSchema], ["post", "/ai-runs/{id}/feedback", "Report an AI error (§7.4)", mt.feedbackSchema],
  ["get", "/access-requests", "Incoming and own access requests"], ["post", "/access-requests", "Request access (FR-0.5)", ac.accessRequestSchema],
  ["post", "/access-requests/{id}/decide", "Owner decision (FR-0.6)", ac.accessDecisionSchema], ["get", "/nda", "Current NDA text"], ["post", "/nda/accept", "Accept NDA → grant (FR-0.6)", ac.ndaAcceptSchema],
  ["get", "/contact-requests", "Contact requests"], ["post", "/contact-requests", "Express interest / request contact", ct.contactCreateSchema], ["post", "/contact-requests/{id}/respond", "Respond", ct.contactRespondSchema],
  ["get", "/experts", "Researchers directory (FR-3.6)"], ["get", "/labs", "Labs directory (FR-3.6)"],
  ["post", "/files/presign", "Presigned upload URL", fl.presignSchema], ["post", "/files/complete", "Verify upload (MIME sniffing)", fl.completeSchema],
  ["get", "/files/{id}/download", "5-minute signed download URL"], ["get", "/files", "List documents of an entity"],
  ["get", "/workspaces", "My workspaces"], ["post", "/workspaces", "Create from confirmed match (FR-4.1)", ws.createWorkspaceSchema],
  ["get", "/workspaces/{id}", "Workspace overview"], ["patch", "/workspaces/{id}", "Update workspace", ws.updateWorkspaceSchema],
  ["post", "/workspaces/{id}/activate", "Activate after setup (FR-4.2)"], ["put", "/workspaces/{id}/agreement", "Attach signed agreement", ws.agreementSchema],
  ["put", "/workspaces/{id}/ip", "Workspace IP record", ws.ipRecordSchema], ["put", "/workspaces/{id}/course", "Link course (FR-4.8)", ws.courseLinkSchema],
  ["get", "/workspaces/{id}/members", "Members"], ["post", "/workspaces/{id}/members", "Add member", ws.memberSchema], ["delete", "/workspaces/{id}/members", "Remove member (?user_id=)"],
  ["get", "/workspaces/{id}/milestones", "Milestones with tasks"], ["post", "/workspaces/{id}/milestones", "Create milestone", ws.milestoneSchema],
  ["patch", "/workspaces/{id}/milestones/{mid}", "Update milestone", ws.milestoneUpdateSchema], ["delete", "/workspaces/{id}/milestones/{mid}", "Delete milestone"],
  ["post", "/workspaces/{id}/tasks", "Create task", ws.taskSchema], ["patch", "/workspaces/{id}/tasks/{tid}", "Update task", ws.taskUpdateSchema], ["delete", "/workspaces/{id}/tasks/{tid}", "Delete task"],
  ["get", "/workspaces/{id}/documents", "Files"], ["get", "/workspaces/{id}/meetings", "Meeting notes"], ["post", "/workspaces/{id}/meetings", "Add meeting note", ws.meetingSchema],
  ["get", "/workspaces/{id}/updates", "Progress updates"], ["post", "/workspaces/{id}/updates", "Post update (FR-4.4)", ws.progressSchema],
  ["get", "/workspaces/{id}/final-report", "Final report"], ["put", "/workspaces/{id}/final-report", "Save final report (FR-4.6)", ws.finalReportSchema],
  ["get", "/workspaces/{id}/final-report/pdf", "Final report PDF (RTL)"], ["post", "/workspaces/{id}/close", "Close and rate (FR-4.7)", ws.closeSchema],
  ["post", "/assistant/summarize", "Summarise document (FR-5.1)", as.summarizeInput], ["post", "/assistant/ask", "RAG question with citations (FR-5.2)", as.askInput],
  ["post", "/assistant/actions/{kind}", "research_questions | related_solutions | project_outline (FR-5.3)", as.actionInput],
  ["get", "/commercialization", "Kanban by stage (FR-6.3)"], ["post", "/commercialization", "Open case (FR-6.1)", cm.openCaseSchema], ["patch", "/commercialization/{id}", "Update case", cm.updateCaseSchema],
  ["get", "/analytics/overview", "Role dashboard KPIs (FR-7.1/7.2)", undefined, analyticsFilterSchema], ["get", "/analytics/breakdown", "By category/sector, k≥3 (FR-7.3/7.4)", undefined, analyticsFilterSchema],
  ["get", "/analytics/export.csv", "CSV export", undefined, analyticsFilterSchema], ["get", "/search", "Combined search", undefined, z.object({ q: z.string(), type: z.enum(["challenge", "project"]).optional() })],
  ["get", "/notifications", "Notifications"], ["post", "/notifications", "Mark read", z.object({ ids: z.union([z.literal("all"), z.array(z.string().uuid())]) })], ["put", "/notifications/prefs", "Email preferences (FR-8.2)"],
  ["get", "/admin/users", "Users", undefined, ad.userListSchema], ["patch", "/admin/users/{id}", "Change role/status", ad.userUpdateSchema],
  ["get", "/admin/taxonomy", "Taxonomy"], ["post", "/admin/taxonomy", "Upsert sector/tag", ad.taxonomySchema], ["get", "/admin/settings", "Settings"], ["put", "/admin/settings", "Update settings", ad.settingsSchema],
  ["get", "/admin/audit-log", "Audit log", undefined, ad.auditListSchema], ["get", "/admin/ai-feedback", "AI feedback reports"], ["get", "/admin/ai-usage", "AI usage"], ["post", "/admin/reindex", "Re-index embeddings"],
];

const json = (s: ZodTypeAny) => zodToJsonSchema(s, { target: "openApi3", $refStrategy: "none" });
const paths: Record<string, Record<string, unknown>> = {};
for (const [method, path, summary, body, q] of E) {
  const params = [...path.matchAll(/\{(\w+)\}/g)].map((m) => ({ name: m[1], in: "path", required: true, schema: { type: "string" } }));
  if (q) {
    const js = json(q) as { properties?: Record<string, unknown> };
    for (const [name, schema] of Object.entries(js.properties ?? {})) params.push({ name, in: "query", required: false, schema } as never);
  }
  (paths[path] ??= {})[method] = {
    summary, ...(params.length ? { parameters: params } : {}),
    ...(body ? { requestBody: { required: true, content: { "application/json": { schema: json(body) } } } } : {}),
    responses: { "200": { description: "OK" }, default: { description: "Error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } } },
  };
}
const doc = {
  openapi: "3.0.3",
  info: { title: "InnovateLink Palestine API", version: "1.0.0", description: "REST API under /api/v1. Auth: HttpOnly session cookie from /auth/login. Errors: {error:{code,message,fields?}}. Pagination: ?page=&limit=." },
  servers: [{ url: "/api/v1" }],
  components: { schemas: { Error: { type: "object", properties: { error: { type: "object", properties: { code: { type: "string" }, message: { type: "string" }, fields: { type: "object", additionalProperties: { type: "array", items: { type: "string" } } } } } } } } },
  paths,
};
// Emit YAML-compatible JSON (JSON is valid YAML 1.2) — no YAML dependency needed.
writeFileSync("openapi.yaml", `# Generated by scripts/openapi.ts from Zod schemas — do not edit by hand.\n${JSON.stringify(doc, null, 2)}\n`);
console.log(`openapi.yaml: ${E.length} operations`);
