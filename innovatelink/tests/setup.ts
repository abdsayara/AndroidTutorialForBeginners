import { afterAll, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { testQueue } from "@/lib/jobs";
import { testOutbox } from "@/lib/mail";
import { resetRateLimits } from "@/lib/auth/rate-limit";
import { resetDb } from "./helpers";

beforeEach(async () => {
  await resetDb();
  testQueue.length = 0;
  testOutbox.length = 0;
  resetRateLimits();
});

afterAll(async () => {
  await db.$disconnect();
});
