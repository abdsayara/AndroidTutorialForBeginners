"use client";

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public fields?: Record<string, string[]>) {
    super(message);
  }
}

/** Fetch wrapper for client components calling /api/v1 (same-origin, cookie session). */
export async function api<T = unknown>(path: string, init: { method?: string; json?: unknown; body?: BodyInit; headers?: Record<string, string> } = {}): Promise<T> {
  const res = await fetch(`/api/v1${path}`, {
    method: init.method ?? (init.json !== undefined || init.body ? "POST" : "GET"),
    headers: { ...(init.json !== undefined ? { "Content-Type": "application/json" } : {}), ...init.headers },
    body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
    credentials: "same-origin",
  });
  if (res.status === 204) return undefined as T;
  const ct = res.headers.get("content-type") ?? "";
  const data = ct.includes("json") ? await res.json() : await res.text();
  if (!res.ok) {
    const e = (data as { error?: { code: string; message: string; fields?: Record<string, string[]> } }).error;
    throw new ApiError(res.status, e?.code ?? "error", e?.message ?? res.statusText, e?.fields);
  }
  return data as T;
}

/** Uploads a file via presigned URL (files never pass through the app server). */
export async function uploadFile(file: File, owner_type: string, owner_id: string, previous_id?: string): Promise<{ id: string }> {
  const { document_id, upload } = await api<{ document_id: string; upload: { url: string; headers: Record<string, string> } }>("/files/presign", {
    json: { owner_type, owner_id, filename: file.name, mime: file.type || "application/octet-stream", size: file.size, previous_id },
  });
  const put = await fetch(upload.url, { method: "PUT", body: file, headers: upload.headers });
  if (!put.ok) throw new ApiError(put.status, "upload_failed", "Upload failed");
  await api("/files/complete", { json: { document_id } });
  return { id: document_id };
}
