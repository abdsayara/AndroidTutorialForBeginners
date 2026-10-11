import { AwsClient } from "aws4fetch";

/**
 * S3-compatible storage via presigned URLs (PRD §4: files never pass through the app server).
 * Download links expire after 5 minutes (PRD §9).
 */
export const DOWNLOAD_TTL_S = 300;
export const UPLOAD_TTL_S = 600;
export const MAX_FILE_BYTES = 50 * 1024 * 1024; // FR-4.5

export const ALLOWED_MIME: Record<string, string[]> = {
  "application/pdf": ["pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["docx"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ["xlsx"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": ["pptx"],
  "image/png": ["png"],
  "image/jpeg": ["jpg", "jpeg"],
  "image/webp": ["webp"],
  "text/csv": ["csv"],
  "text/plain": ["txt"],
  "application/zip": ["zip"],
};

function client() {
  return new AwsClient({
    accessKeyId: process.env.S3_ACCESS_KEY ?? "",
    secretAccessKey: process.env.S3_SECRET_KEY ?? "",
    region: process.env.S3_REGION ?? "us-east-1",
    service: "s3",
  });
}

function objectUrl(key: string, publicEndpoint = false) {
  const base = (publicEndpoint ? process.env.S3_PUBLIC_ENDPOINT : process.env.S3_ENDPOINT) ?? "http://localhost:9000";
  return `${base.replace(/\/$/, "")}/${process.env.S3_BUCKET ?? "innovatelink"}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

async function presign(method: "PUT" | "GET", key: string, ttl: number, extra: Record<string, string> = {}): Promise<string> {
  const url = new URL(objectUrl(key, true));
  url.searchParams.set("X-Amz-Expires", String(ttl));
  for (const [k, v] of Object.entries(extra)) url.searchParams.set(k, v);
  const signed = await client().sign(new Request(url, { method }), { aws: { signQuery: true } });
  return signed.url;
}

export function presignUpload(key: string, mime: string) {
  return presign("PUT", key, UPLOAD_TTL_S, {}).then((url) => ({ url, headers: { "Content-Type": mime } }));
}

export function presignDownload(key: string, filename: string) {
  return presign("GET", key, DOWNLOAD_TTL_S, {
    "response-content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
  });
}

/** Reads the first bytes of an uploaded object (for real MIME sniffing, PRD §9). */
export async function readHead(key: string, bytes = 4100): Promise<{ size: number; head: Uint8Array } | null> {
  if (process.env.NODE_ENV === "test") return testObjects.get(key) ?? null;
  const res = await client().fetch(objectUrl(key), { headers: { Range: `bytes=0-${bytes - 1}` } });
  if (!res.ok) return null;
  const total = Number(res.headers.get("content-range")?.split("/")[1] ?? res.headers.get("content-length") ?? 0);
  return { size: total, head: new Uint8Array(await res.arrayBuffer()) };
}

export async function readObject(key: string): Promise<Uint8Array | null> {
  if (process.env.NODE_ENV === "test") return testObjects.get(key)?.head ?? null;
  const res = await client().fetch(objectUrl(key));
  return res.ok ? new Uint8Array(await res.arrayBuffer()) : null;
}

export async function putObject(key: string, body: Uint8Array, mime: string): Promise<void> {
  if (process.env.NODE_ENV === "test") { testObjects.set(key, { size: body.length, head: body }); return; }
  const res = await client().fetch(objectUrl(key), { method: "PUT", body, headers: { "Content-Type": mime } });
  if (!res.ok) throw new Error(`S3 put failed: ${res.status}`);
}

/** In-memory object store used by tests. */
export const testObjects = new Map<string, { size: number; head: Uint8Array }>();

/** Detects the real file type from magic bytes. */
export function sniffMime(head: Uint8Array, declared: string): string | null {
  const starts = (sig: number[], off = 0) => sig.every((b, i) => head[off + i] === b);
  if (starts([0x25, 0x50, 0x44, 0x46])) return "application/pdf";
  if (starts([0x89, 0x50, 0x4e, 0x47])) return "image/png";
  if (starts([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (starts([0x52, 0x49, 0x46, 0x46]) && starts([0x57, 0x45, 0x42, 0x50], 8)) return "image/webp";
  if (starts([0x50, 0x4b, 0x03, 0x04])) {
    // OOXML and plain zip share the signature; trust the declared OOXML type only for zip containers.
    return declared.startsWith("application/vnd.openxmlformats") || declared === "application/zip" ? declared : "application/zip";
  }
  if (declared === "text/csv" || declared === "text/plain") {
    // Text: reject if it contains NUL bytes (binary disguised as text).
    return head.includes(0) ? null : declared;
  }
  return null;
}
