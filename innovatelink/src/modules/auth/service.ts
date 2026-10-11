import type { User } from "@prisma/client";
import { db } from "@/lib/db";
import { AppError, assertAllowed, notFound } from "@/lib/api/errors";
import { hashPassword, randomToken, sha256, verifyPassword } from "@/lib/auth/crypto";
import { createSession } from "@/lib/auth/session";
import { enqueue } from "@/lib/jobs";
import { renderEmail } from "@/lib/mail";
import { serverT } from "@/lib/i18n/server-t";
import { audit } from "@/lib/audit";
import { notify, notifyRoles } from "@/modules/notifications/service";
import { canApproveUser, canEditOwnProfile, ROLE_ORG_TYPE, type Actor } from "./policy";
import type { RegisterInput } from "./schema";
import type { z } from "zod";
import type { profileSchema, researcherProfileSchema } from "./schema";

export const MAX_FAILED_LOGINS = 5;
export const LOCK_MS = 15 * 60 * 1000;
const VERIFY_TTL_MS = 48 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;
export const CURRENT_CONSENT_VERSION = "2026-10-v1";

export type PublicUser = Pick<User, "id" | "email" | "full_name" | "role" | "status" | "locale" | "org_id">;

export function publicUser(u: User): PublicUser {
  return { id: u.id, email: u.email, full_name: u.full_name, role: u.role, status: u.status, locale: u.locale, org_id: u.org_id };
}

async function issueToken(userId: string, purpose: "verify_email" | "reset_password", ttl: number): Promise<string> {
  const token = randomToken();
  await db.verificationToken.create({
    data: { user_id: userId, purpose, token_hash: sha256(token), expires_at: new Date(Date.now() + ttl) },
  });
  return token;
}

async function consumeToken(token: string, purpose: string) {
  const row = await db.verificationToken.findUnique({ where: { token_hash: sha256(token) } });
  if (!row || row.purpose !== purpose || row.used_at || row.expires_at < new Date()) {
    throw new AppError("bad_request", "invalid_or_expired_token");
  }
  await db.verificationToken.update({ where: { id: row.id }, data: { used_at: new Date() } });
  return row;
}

async function sendTokenMail(u: { email: string; locale: "ar" | "en" }, kind: "verify" | "reset", token: string) {
  const t = serverT(u.locale, "emails");
  const path = kind === "verify" ? "auth/verify" : "auth/reset";
  const url = `${process.env.APP_URL ?? ""}/${u.locale}/${path}?token=${encodeURIComponent(token)}`;
  const { html, text } = renderEmail({
    locale: u.locale,
    title: t(`${kind}.title`),
    body: t(`${kind}.body`),
    cta: { label: t(`${kind}.cta`), url },
    footer: t("footer"),
  });
  await enqueue("mail.send", { to: u.email, subject: t(`${kind}.title`), html, text });
}

/**
 * FR-0.1 / FR-0.4: register with email + password. The user picks an existing
 * organisation or creates one; a registered university email domain links
 * the user to that university automatically. Approval stays manual (FR-0.2).
 */
export async function register(input: RegisterInput): Promise<{ user: PublicUser; verifyToken: string }> {
  const exists = await db.user.findUnique({ where: { email: input.email } });
  if (exists) throw new AppError("conflict", "email_taken", { email: ["email_taken"] });
  if (input.consent_version !== CURRENT_CONSENT_VERSION) {
    throw new AppError("validation_error", "consent_required", { consent_version: ["consent_required"] });
  }

  const requiredType = ROLE_ORG_TYPE[input.role];
  const domain = input.email.split("@")[1]!;
  let orgId = input.org_id;

  if (!orgId && !input.new_org && requiredType === "university") {
    const byDomain = await db.organization.findFirst({
      where: { type: "university", email_domains: { has: domain }, deleted_at: null },
    });
    if (byDomain) orgId = byDomain.id;
  }

  if (orgId) {
    const org = await db.organization.findFirst({ where: { id: orgId, deleted_at: null } });
    if (!org || org.type !== requiredType) {
      throw new AppError("validation_error", "org_type_mismatch", { org_id: ["org_type_mismatch"] });
    }
  } else if (input.new_org) {
    if (input.new_org.type !== requiredType) {
      throw new AppError("validation_error", "org_type_mismatch", { new_org: ["org_type_mismatch"] });
    }
    // Students/researchers must join an existing university.
    if (input.role === "student" || input.role === "researcher") {
      throw new AppError("validation_error", "university_required", { org_id: ["university_required"] });
    }
  } else {
    throw new AppError("validation_error", "org_required", { org_id: ["org_required"] });
  }

  const password_hash = await hashPassword(input.password);
  const user = await db.$transaction(async (tx) => {
    if (!orgId) {
      const org = await tx.organization.create({ data: { ...input.new_org!, status: "pending" } });
      orgId = org.id;
    }
    const u = await tx.user.create({
      data: {
        email: input.email,
        password_hash,
        full_name: input.full_name,
        role: input.role,
        locale: input.locale,
        org_id: orgId,
        status: "pending",
        consent_version: input.consent_version,
      },
    });
    if (input.role === "researcher") await tx.researcherProfile.create({ data: { user_id: u.id } });
    return u;
  });

  const verifyToken = await issueToken(user.id, "verify_email", VERIFY_TTL_MS);
  await sendTokenMail(user, "verify", verifyToken);
  return { user: publicUser(user), verifyToken };
}

export async function verifyEmail(token: string): Promise<void> {
  const row = await consumeToken(token, "verify_email");
  const user = await db.user.update({ where: { id: row.user_id }, data: { email_verified_at: new Date() } });
  // Tell the right approvers a new account is waiting (FR-0.2).
  const payload = { subject: user.full_name, url: "/coordinator/review" };
  if (user.role === "student" || user.role === "researcher") {
    await notifyRoles(["university_coordinator"], "review_needed", payload, user.org_id);
  } else {
    await notifyRoles(["platform_coordinator"], "review_needed", payload);
  }
}

/** Login with lockout after 5 failed attempts (PRD §9). Returns a raw session token. */
export async function login(email: string, password: string, ip?: string): Promise<{ token: string; user: PublicUser }> {
  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  const invalid = new AppError("unauthenticated", "invalid_credentials");
  if (!user || user.deleted_at) {
    await hashPassword(password); // equalise timing
    throw invalid;
  }
  if (user.locked_until && user.locked_until > new Date()) throw new AppError("rate_limited", "account_locked");
  const ok = await verifyPassword(user.password_hash, password);
  if (!ok) {
    const failed = user.failed_logins + 1;
    await db.user.update({
      where: { id: user.id },
      data: failed >= MAX_FAILED_LOGINS
        ? { failed_logins: 0, locked_until: new Date(Date.now() + LOCK_MS) }
        : { failed_logins: failed },
    });
    throw invalid;
  }
  if (user.status === "suspended") throw new AppError("forbidden", "account_suspended");
  if (!user.email_verified_at) throw new AppError("forbidden", "email_not_verified");
  await db.user.update({ where: { id: user.id }, data: { failed_logins: 0, locked_until: null } });
  const token = await createSession(user.id, ip);
  return { token, user: publicUser(user) };
}

/** Always succeeds (no account enumeration). */
export async function forgotPassword(email: string): Promise<string | null> {
  const user = await db.user.findUnique({ where: { email } });
  if (!user || user.deleted_at) return null;
  const token = await issueToken(user.id, "reset_password", RESET_TTL_MS);
  await sendTokenMail(user, "reset", token);
  return token;
}

export async function resetPassword(token: string, password: string): Promise<void> {
  const row = await consumeToken(token, "reset_password");
  await db.user.update({
    where: { id: row.user_id },
    data: { password_hash: await hashPassword(password), failed_logins: 0, locked_until: null },
  });
  await db.session.deleteMany({ where: { user_id: row.user_id } });
}

export async function me(actor: Actor) {
  const u = await db.user.findUniqueOrThrow({
    where: { id: actor.id },
    include: { org: true, researcher: { select: { id: true, department: true, title: true, expertise_tags: true, bio: true, publications_url: true, availability: true, lang: true } } },
  });
  return { ...publicUser(u), org: u.org, researcher: u.researcher, email_prefs: u.email_prefs };
}

export async function updateProfile(actor: Actor, data: z.infer<typeof profileSchema>) {
  assertAllowed(canEditOwnProfile(actor, actor.id));
  const u = await db.user.update({ where: { id: actor.id }, data });
  return publicUser(u);
}

export async function updateResearcherProfile(actor: Actor, data: z.infer<typeof researcherProfileSchema>) {
  assertAllowed(canEditOwnProfile(actor, actor.id) && actor.role === "researcher");
  const p = await db.researcherProfile.upsert({ where: { user_id: actor.id }, create: { user_id: actor.id, ...data }, update: data });
  if (actor.status === "active") await enqueue("embed.entity", { type: "researcher", id: p.id });
  return p;
}

/** FR-0.2: approve a pending account. */
export async function approveUser(actor: Actor, userId: string, ip?: string): Promise<PublicUser> {
  const target = await db.user.findFirst({ where: { id: userId, deleted_at: null } });
  if (!target) throw notFound();
  assertAllowed(canApproveUser(actor, target));
  if (target.status !== "pending") throw new AppError("invalid_transition", "not_pending");
  const u = await db.user.update({ where: { id: userId }, data: { status: "active" } });
  await audit({ actor_id: actor.id, action: "user_approved", entity_type: "user", entity_id: userId, diff: { status: ["pending", "active"] }, ip });
  await notify([userId], "account_approved", { subject: u.full_name, url: "/dashboard" });
  return publicUser(u);
}

/** Users the actor may approve (review queue). */
export async function pendingUsersFor(actor: Actor) {
  const users = await db.user.findMany({
    where: { status: "pending", deleted_at: null, email_verified_at: { not: null } },
    include: { org: { select: { name_ar: true, name_en: true, type: true, status: true } } },
    orderBy: { created_at: "asc" },
    take: 200,
  });
  return users.filter((u) => canApproveUser(actor, u)).map((u) => ({ ...publicUser(u), org: u.org }));
}

/** PRD §9 privacy: export own data. */
export async function exportMyData(actor: Actor) {
  const [user, notifications, contacts, challenges, projects] = await Promise.all([
    me(actor),
    db.notification.findMany({ where: { user_id: actor.id } }),
    db.contactRequest.findMany({ where: { from_user_id: actor.id } }),
    db.challenge.findMany({ where: { created_by: actor.id }, select: { id: true, title: true, status: true, created_at: true } }),
    db.project.findMany({ where: { created_by: actor.id }, select: { id: true, title: true, status: true, created_at: true } }),
  ]);
  return { exported_at: new Date().toISOString(), user, notifications, contact_requests: contacts, challenges, projects };
}

/** PRD §9 privacy: delete own account (soft-delete + anonymise PII). */
export async function deleteMyAccount(actor: Actor, ip?: string): Promise<void> {
  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: actor.id },
      data: {
        deleted_at: new Date(),
        status: "suspended",
        email: `deleted+${actor.id}@invalid.local`,
        full_name: "—",
        password_hash: "!",
      },
    });
    await tx.session.deleteMany({ where: { user_id: actor.id } });
    await audit({ actor_id: actor.id, action: "admin_action", entity_type: "user", entity_id: actor.id, diff: { deleted: true }, ip }, tx);
  });
}
