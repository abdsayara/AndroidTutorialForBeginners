import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src"), "@messages": path.resolve(__dirname, "messages") } },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "tests/unit/**/*.test.ts"],
    globalSetup: ["tests/global-setup.ts"],
    setupFiles: ["tests/setup.ts"],
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 60000,
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? "postgresql://innovate:innovate@localhost:5432/innovatelink_test",
      NODE_ENV: "test", LLM_PROVIDER: "mock", EMBEDDING_DIM: "64", AI_ALLOW_CONFIDENTIAL: "false" },
    coverage: {
      provider: "v8",
      include: ["src/modules/*/service.ts", "src/modules/*/policy.ts"],
      thresholds: {
        "src/modules/*/policy.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
        "src/modules/*/service.ts": { statements: 70, lines: 70 },
      },
    },
  },
});
