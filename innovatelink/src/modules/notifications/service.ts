import type { Prisma, Role } from "@prisma/client";
import { db, type Tx } from "@/lib/db";
import { enqueue } from "@/lib/jobs";
import { renderEmail } from "@/lib/mail";
import { serverT } from "@/lib/i18n/server-t";
import type { Actor } from "@/modules/auth/policy";
import { pageSchema, skipTake, type PageInput } from "@/lib/api/pagination";

/** FR-8.1 notification types. Keys map to `notifications.types.*` in messages. */
export const NOTIFICATION_TYPES = [
  "challenge_status",
  "project_status",
  "new_match",
  "match_update",
  "contact_request",
  "contact_response",
  "task_assigned",
  "milestone_due",
  "access_granted",
  "access_revoked",
  "access_requested",
  "account_approved",
  "review_needed",
  "progress_update",
  "no_matches",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface NotifyPayload {
  /** Short human label of the entity (e.g. challenge title). */
  subject?: string;
  status?: string;
  url?: string;
  [k: string]: unknown;
}

/**
 * Creates in-app notifications and queues email for users whose
 * email preference for that type is not disabled (FR-8.2).
 */
export async function notify(userIds: string[], type: NotificationType, payload: NotifyPayload, tx: Tx = db): Promise<void> {
  const ids = [...new Set(userIds)].filter(Boolean);
  if (ids.length === 0) return;
  await tx.notification.createMany({
    data: ids.map((user_id) => ({ user_id, type, payload: payload as Prisma.InputJsonValue })),
  });
  const users = await tx.user.findMany({
    where: { id: { in: ids }, deleted_at: null, status: { not: "suspended" } },
    select: { email: true, locale: true, email_prefs: true },
  });
  for (const u of users) {
    const prefs = (u.email_prefs ?? {}) as Record<string, boolean>;
    if (prefs[type] === false) continue;
    const t = serverT(u.locale, "notifications");
    const vars = { subject: payload.subject ?? "", status: payload.status ? t(`statuses.${payload.status}`) : "" };
    const title = t(`types.${type}.title`, vars);
    const bodyText = t(`types.${type}.body`, vars);
    const url = payload.url ? `${process.env.APP_URL ?? ""}/${u.locale}${payload.url}` : undefined;
    const { html, text } = renderEmail({
      locale: u.locale,
      title,
      body: bodyText,
      cta: url ? { label: t("open"), url } : undefined,
      footer: t("footer"),
    });
    await enqueue("mail.send", { to: u.email, subject: title, html, text });
  }
}

export async function notifyRoles(roles: Role[], type: NotificationType, payload: NotifyPayload, orgId?: string, tx: Tx = db) {
  const users = await tx.user.findMany({
    where: { role: { in: roles }, status: "active", deleted_at: null, ...(orgId ? { org_id: orgId } : {}) },
    select: { id: true },
  });
  await notify(users.map((u) => u.id), type, payload, tx);
}

export async function listNotifications(actor: Actor, p: PageInput = pageSchema.parse({})) {
  const where = { user_id: actor.id };
  const [items, total, unread] = await Promise.all([
    db.notification.findMany({ where, orderBy: { created_at: "desc" }, ...skipTake(p) }),
    db.notification.count({ where }),
    db.notification.count({ where: { ...where, read_at: null } }),
  ]);
  return { items, total, unread, page: p.page, limit: p.limit };
}

export async function markRead(actor: Actor, ids: string[] | "all"): Promise<void> {
  await db.notification.updateMany({
    where: { user_id: actor.id, read_at: null, ...(ids === "all" ? {} : { id: { in: ids } }) },
    data: { read_at: new Date() },
  });
}

export async function updateEmailPrefs(actor: Actor, prefs: Partial<Record<NotificationType, boolean>>) {
  const u = await db.user.findUniqueOrThrow({ where: { id: actor.id }, select: { email_prefs: true } });
  const merged = { ...((u.email_prefs ?? {}) as object), ...prefs };
  await db.user.update({ where: { id: actor.id }, data: { email_prefs: merged } });
  return merged;
}
