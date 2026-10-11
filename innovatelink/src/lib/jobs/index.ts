import PgBoss from "pg-boss";
import { log } from "@/lib/log";

/** Background job names (PRD §4: pg-boss on the same PostgreSQL). */
export type JobName =
  | "embed.entity"
  | "match.challenge"
  | "match.project"
  | "cluster.challenges"
  | "mail.send"
  | "document.process"
  | "deadline.reminders";

export interface JobPayloads {
  "embed.entity": { type: "challenge" | "project" | "researcher" | "lab"; id: string };
  "match.challenge": { challenge_id: string };
  "match.project": { project_id: string };
  "cluster.challenges": Record<string, never>;
  "mail.send": { to: string; subject: string; html: string; text: string };
  "document.process": { document_id: string };
  "deadline.reminders": Record<string, never>;
}

let boss: PgBoss | null = null;
let starting: Promise<PgBoss> | null = null;

/** In tests jobs are captured here instead of being sent to pg-boss. */
export const testQueue: { name: JobName; data: unknown }[] = [];

export async function getBoss(): Promise<PgBoss> {
  if (boss) return boss;
  starting ??= (async () => {
    const b = new PgBoss({ connectionString: process.env.DATABASE_URL! });
    b.on("error", (e) => log.error("pg-boss", { err: String(e) }));
    await b.start();
    boss = b;
    return b;
  })();
  return starting;
}

export async function enqueue<N extends JobName>(name: N, data: JobPayloads[N]): Promise<void> {
  if (process.env.NODE_ENV === "test") {
    testQueue.push({ name, data });
    return;
  }
  // Seeding and maintenance scripts run handlers inline and must not send mail.
  if (process.env.JOBS_DISABLED === "1") return;
  try {
    const b = await getBoss();
    await b.createQueue(name).catch(() => undefined);
    await b.send(name, data as object, { retryLimit: 3, retryBackoff: true });
  } catch (e) {
    log.error("enqueue failed", { name, err: String(e) });
  }
}
