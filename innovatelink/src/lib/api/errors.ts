export type ErrorCode =
  | "bad_request"
  | "validation_error"
  | "unauthenticated"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "invalid_transition"
  | "rate_limited"
  | "ai_error"
  | "internal";

const STATUS: Record<ErrorCode, number> = {
  bad_request: 400,
  validation_error: 422,
  unauthenticated: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  invalid_transition: 409,
  rate_limited: 429,
  ai_error: 502,
  internal: 500,
};

export class AppError extends Error {
  readonly status: number;
  constructor(
    readonly code: ErrorCode,
    message?: string,
    readonly fields?: Record<string, string[]>,
  ) {
    super(message ?? code);
    this.status = STATUS[code];
  }
}

export const forbidden = (m?: string) => new AppError("forbidden", m);
export const notFound = (m?: string) => new AppError("not_found", m);
export const badRequest = (m?: string) => new AppError("bad_request", m);
export const invalidTransition = (from: string, to: string) =>
  new AppError("invalid_transition", `Cannot transition from ${from} to ${to}`);

/** Throws `forbidden` unless the condition holds. Use with policy functions. */
export function assertAllowed(ok: boolean, m?: string): asserts ok {
  if (!ok) throw forbidden(m);
}

/**
 * Throws `not_found` unless the condition holds — used where revealing the
 * existence of a resource is itself a leak (e.g. workspaces, FR-4 acceptance).
 */
export function assertVisible(ok: boolean): asserts ok {
  if (!ok) throw notFound();
}
