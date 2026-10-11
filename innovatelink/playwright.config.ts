import { defineConfig, devices } from "@playwright/test";

/**
 * E2E for the five critical paths (PRD §10). Requires a running app (npm run build && npm start),
 * PostgreSQL with seed data (global setup re-seeds), and S3 storage (MinIO, or `node tests/e2e/s3-server.cjs`).
 */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  globalSetup: "./tests/e2e/global-setup.ts",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    locale: "ar",
    trace: "retain-on-failure",
    launchOptions: { executablePath: process.env.CHROMIUM_PATH || undefined },
  },
  projects: [
    { name: "mobile-360", use: { ...devices["Pixel 5"], viewport: { width: 360, height: 780 } } },
  ],
});
