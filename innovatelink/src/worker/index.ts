import { getBoss, type JobName } from "@/lib/jobs";
import { log } from "@/lib/log";
import { handlers } from "./handlers";

/** Background worker (PRD §4: pg-boss on the same PostgreSQL). Run with `npm run worker`. */
async function main() {
  const boss = await getBoss();
  for (const name of Object.keys(handlers) as JobName[]) {
    await boss.createQueue(name).catch(() => undefined);
    await boss.work(name, { batchSize: 1 }, async (jobs) => {
      for (const job of jobs) {
        const t0 = Date.now();
        try {
          await (handlers[name] as (d: unknown) => Promise<unknown>)(job.data);
          log.info("job done", { name, id: job.id, ms: Date.now() - t0 });
        } catch (e) {
          log.error("job failed", { name, id: job.id, err: e instanceof Error ? e.message : String(e) });
          throw e;
        }
      }
    });
  }
  // FR-2.7 weekly clustering (Sunday 02:00), daily milestone reminders (07:00), Asia/Hebron.
  await boss.schedule("cluster.challenges", "0 2 * * 0", {}, { tz: "Asia/Hebron" });
  await boss.schedule("deadline.reminders", "0 7 * * *", {}, { tz: "Asia/Hebron" });
  log.info("worker started", { queues: Object.keys(handlers) });

  const stop = async () => { log.info("worker stopping"); await boss.stop({ graceful: true }); process.exit(0); };
  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);
}

main().catch((e) => { log.error("worker crashed", { err: String(e) }); process.exit(1); });
