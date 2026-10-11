import { hash, verify } from "@node-rs/argon2";

const ARGON2ID = 2; // Algorithm.Argon2id (const enum, not importable under isolatedModules)
import { createHash, randomBytes } from "node:crypto";

/** argon2id (PRD §9). */
export async function hashPassword(pw: string): Promise<string> {
  return hash(pw, { algorithm: ARGON2ID, memoryCost: 19456, timeCost: 2, parallelism: 1 });
}

export async function verifyPassword(stored: string, pw: string): Promise<boolean> {
  try {
    return await verify(stored, pw);
  } catch {
    return false;
  }
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}
