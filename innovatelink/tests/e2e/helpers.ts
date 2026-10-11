import { expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient();
export const PASSWORD = "InnovateLink#2026";

export async function login(page: Page, email: string, password = PASSWORD) {
  await page.context().clearCookies();
  const r = await page.request.post("/api/v1/auth/login", { data: { email, password } });
  expect(r.ok(), await r.text()).toBeTruthy();
}

/** Reads the latest verification/reset link from the outgoing mail queue (pg-boss), acting as a test inbox. */
export async function lastMailLink(to: string, pathPart: string): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const rows = await db.$queryRawUnsafe<{ data: { to: string; text: string } }[]>(
      `SELECT data FROM pgboss.job WHERE name = 'mail.send' AND data->>'to' = $1 ORDER BY created_on DESC LIMIT 1`, to,
    );
    const m = rows[0]?.data.text.match(new RegExp(`https?://\\S+${pathPart}\\?token=\\S+`));
    if (m) return new URL(m[0]).pathname + new URL(m[0]).search;
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`no mail for ${to}`);
}

export const pdf = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n");
