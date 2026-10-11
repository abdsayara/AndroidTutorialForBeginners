import { execSync } from "node:child_process";

export default function setup() {
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
}
