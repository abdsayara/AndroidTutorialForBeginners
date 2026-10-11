import { db } from "@/lib/db";
import { notFound } from "@/lib/api/errors";
import type { Actor } from "@/modules/auth/policy";
import { canViewWorkspace } from "./policy";

/** Loads a workspace and the actor's membership; 404 for anyone who may not see it. */
export async function loadWorkspaceForActor(actor: Actor, id: string) {
  const ws = await db.workspace.findFirst({ where: { id, deleted_at: null } });
  if (!ws) throw notFound();
  const member = await db.workspaceMember.findUnique({ where: { workspace_id_user_id: { workspace_id: id, user_id: actor.id } } });
  if (!canViewWorkspace(actor, member)) throw notFound();
  return { ws, member };
}
