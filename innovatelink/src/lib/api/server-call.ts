import { notFound } from "next/navigation";
import { AppError } from "./errors";

/** For Server Components: maps not_found → 404 page; returns the error code for access errors. */
export async function load<T>(fn: () => Promise<T>): Promise<{ ok: true; data: T } | { ok: false; code: string }> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    if (e instanceof AppError) {
      if (e.code === "not_found") notFound();
      return { ok: false, code: e.code };
    }
    throw e;
  }
}
