import { randomUUID } from "node:crypto";
import type { z } from "zod";
import { db } from "@/lib/db";
import { AppError, assertAllowed, assertVisible, notFound } from "@/lib/api/errors";
import { audit } from "@/lib/audit";
import { enqueue } from "@/lib/jobs";
import { ALLOWED_MIME, MAX_FILE_BYTES, presignDownload, presignUpload, readHead, sniffMime } from "@/lib/storage";
import { isPlatformAdmin, type Actor } from "@/modules/auth/policy";
import { hasGrant } from "@/modules/access/grants";
import { canEditChallengeContent, canManageChallenge, canViewChallenge } from "@/modules/challenges/policy";
import { canEditProject, canViewProject } from "@/modules/projects/policy";
import { canEditWorkspace, canViewWorkspace } from "@/modules/workspaces/policy";
import { loadWorkspaceForActor } from "@/modules/workspaces/access";
import { canDownload, canUploadTo } from "./policy";
import type { presignSchema } from "./schema";

interface OwnerAccess { canView: boolean; canEdit: boolean; confidential: boolean; hideExistence: boolean }

/** Resolves view/edit rights on a document's owner entity. */
export async function ownerAccess(actor: Actor, owner_type: string, owner_id: string): Promise<OwnerAccess> {
  switch (owner_type) {
    case "challenge": {
      const c = await db.challenge.findFirst({ where: { id: owner_id, deleted_at: null } });
      if (!c) throw notFound();
      const g = await hasGrant(actor, "challenge", owner_id);
      return { canView: canViewChallenge(actor, c, g), canEdit: canEditChallengeContent(actor, c) || canManageChallenge(actor, c), confidential: c.visibility !== "public", hideExistence: false };
    }
    case "project": {
      const p = await db.project.findFirst({ where: { id: owner_id, deleted_at: null } });
      if (!p) throw notFound();
      const g = await hasGrant(actor, "project", owner_id);
      return { canView: canViewProject(actor, p, g), canEdit: canEditProject(actor, p), confidential: p.visibility !== "public", hideExistence: false };
    }
    case "workspace":
    case "ip_record": {
      const wsId = owner_type === "workspace" ? owner_id : (await db.ipRecord.findUnique({ where: { id: owner_id } }))?.workspace_id;
      if (!wsId) throw notFound();
      const { ws, member } = await loadWorkspaceForActor(actor, wsId);
      return { canView: canViewWorkspace(actor, member), canEdit: canEditWorkspace(actor, member, ws), confidential: true, hideExistence: true };
    }
    case "admin_template":
      return { canView: true, canEdit: isPlatformAdmin(actor), confidential: false, hideExistence: false };
    default:
      throw new AppError("bad_request", "unknown_owner_type");
  }
}

/** Step 1: create a pending Document and return a presigned PUT URL. */
export async function presignUploadFor(actor: Actor, input: z.infer<typeof presignSchema>) {
  const acc = await ownerAccess(actor, input.owner_type, input.owner_id);
  if (acc.hideExistence) assertVisible(acc.canView);
  assertAllowed(canUploadTo(acc.canEdit));
  let version = 1;
  if (input.previous_id) {
    const prev = await db.document.findFirst({ where: { id: input.previous_id, owner_type: input.owner_type, owner_id: input.owner_id, deleted_at: null } });
    if (!prev) throw notFound();
    version = prev.version + 1;
  }
  const ext = ALLOWED_MIME[input.mime]![0]!;
  const file_key = `${input.owner_type}/${input.owner_id}/${randomUUID()}.${ext}`;
  const doc = await db.document.create({
    data: { owner_type: input.owner_type, owner_id: input.owner_id, file_key, filename: input.filename, mime: input.mime, size: input.size, uploaded_by: actor.id, version, previous_id: input.previous_id },
  });
  const upload = await presignUpload(file_key, input.mime);
  return { document_id: doc.id, upload };
}

/** Step 2: verify the object exists, has the right size and real MIME type, then mark complete. */
export async function completeUpload(actor: Actor, documentId: string) {
  const doc = await db.document.findFirst({ where: { id: documentId, deleted_at: null } });
  if (!doc || doc.uploaded_by !== actor.id) throw notFound();
  if (doc.completed) return doc;
  const obj = await readHead(doc.file_key);
  if (!obj) throw new AppError("bad_request", "upload_missing");
  if (obj.size > MAX_FILE_BYTES) throw new AppError("validation_error", "file_too_large");
  const real = sniffMime(obj.head, doc.mime);
  if (real !== doc.mime) {
    await db.document.update({ where: { id: doc.id }, data: { deleted_at: new Date() } });
    throw new AppError("validation_error", "mime_mismatch");
  }
  const done = await db.document.update({ where: { id: doc.id }, data: { completed: true, size: obj.size } });
  if (["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"].includes(doc.mime)) {
    await enqueue("document.process", { document_id: doc.id });
  }
  return done;
}

/** Signed 5-minute download link; downloads of non-public entity files are audited (PRD §9). */
export async function downloadUrl(actor: Actor, documentId: string, ip?: string) {
  const doc = await db.document.findFirst({ where: { id: documentId, deleted_at: null, completed: true } });
  if (!doc) throw notFound();
  const acc = await ownerAccess(actor, doc.owner_type, doc.owner_id);
  if (acc.hideExistence) assertVisible(acc.canView);
  assertAllowed(canDownload(acc.canView));
  if (acc.confidential) {
    await audit({ actor_id: actor.id, action: "confidential_download", entity_type: "document", entity_id: doc.id, diff: { owner_type: doc.owner_type, owner_id: doc.owner_id }, ip });
  }
  return { url: await presignDownload(doc.file_key, doc.filename), expires_in: 300 };
}

/** Latest version of each document chain for an owner, with history. */
export async function listDocuments(actor: Actor, owner_type: string, owner_id: string) {
  const acc = await ownerAccess(actor, owner_type, owner_id);
  if (acc.hideExistence) assertVisible(acc.canView);
  assertAllowed(acc.canView);
  const docs = await db.document.findMany({
    where: { owner_type, owner_id, deleted_at: null, completed: true },
    select: { id: true, filename: true, mime: true, size: true, version: true, previous_id: true, uploaded_by: true, created_at: true },
    orderBy: { created_at: "desc" },
  });
  const superseded = new Set(docs.map((d) => d.previous_id).filter(Boolean));
  return docs.map((d) => ({ ...d, is_latest: !superseded.has(d.id) }));
}
