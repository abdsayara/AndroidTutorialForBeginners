import { describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { testObjects } from "@/lib/storage";
import { makeChallenge, makeOrg, makeUser } from "../../../tests/helpers";
import { completeUpload, downloadUrl, listDocuments, presignUploadFor } from "./service";

const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]);

describe("files service", () => {
  it("presign → upload → complete with MIME sniffing; versions; audited confidential download", async () => {
    const co = await makeOrg("company");
    const admin = await makeUser("company_admin", co.id);
    const outsider = await makeUser("student");
    const c = await makeChallenge(co.id, admin.id, { status: "draft", visibility: "confidential", public_title: "عام" });

    await expect(presignUploadFor(outsider, { owner_type: "challenge", owner_id: c.id, filename: "a.pdf", mime: "application/pdf", size: 6 })).rejects.toMatchObject({ code: "forbidden" });
    const up = await presignUploadFor(admin, { owner_type: "challenge", owner_id: c.id, filename: "صور.pdf", mime: "application/pdf", size: 6 });
    expect(up.upload.url).toContain("X-Amz-Signature");
    const doc = await db.document.findUniqueOrThrow({ where: { id: up.document_id } });
    await expect(completeUpload(admin, doc.id)).rejects.toMatchObject({ message: "upload_missing" });
    testObjects.set(doc.file_key, { size: 6, head: PDF });
    await completeUpload(admin, doc.id);

    const v2 = await presignUploadFor(admin, { owner_type: "challenge", owner_id: c.id, filename: "v2.pdf", mime: "application/pdf", size: 6, previous_id: doc.id });
    const d2 = await db.document.findUniqueOrThrow({ where: { id: v2.document_id } });
    expect(d2.version).toBe(2);
    testObjects.set(d2.file_key, { size: 6, head: new Uint8Array([0x89, 0x50, 0x4e, 0x47]) }); // PNG disguised as PDF
    await expect(completeUpload(admin, d2.id)).rejects.toMatchObject({ message: "mime_mismatch" });

    const docs = await listDocuments(admin, "challenge", c.id);
    expect(docs).toHaveLength(1);
    const dl = await downloadUrl(admin, doc.id, "9.9.9.9");
    expect(dl.url).toContain("X-Amz-Expires=300");
    expect(await db.auditLog.count({ where: { action: "confidential_download", entity_id: doc.id } })).toBe(1);
    await expect(downloadUrl(outsider, doc.id)).rejects.toMatchObject({ code: "forbidden" });
  });
});
