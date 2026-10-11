import { unzipSync, strFromU8 } from "fflate";
import { db, toVectorLiteral } from "@/lib/db";
import { embed } from "@/lib/ai";
import { readObject } from "@/lib/storage";
import { log } from "@/lib/log";

/** ~800 tokens ≈ 3,200 chars; overlap ~100 tokens ≈ 400 chars (PRD §7.3). */
export const CHUNK_CHARS = 3200;
export const OVERLAP_CHARS = 400;

export interface PageText { page: number | null; text: string }

export async function extractPdf(bytes: Uint8Array): Promise<PageText[]> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(bytes);
  const { text } = await extractText(pdf, { mergePages: false });
  return (text as string[]).map((t, i) => ({ page: i + 1, text: t }));
}

export function extractDocx(bytes: Uint8Array): PageText[] {
  const files = unzipSync(bytes, { filter: (f) => f.name === "word/document.xml" });
  const xml = files["word/document.xml"];
  if (!xml) return [];
  const text = strFromU8(xml)
    .replace(/<w:p[ >][\s\S]*?<\/w:p>/g, (p) => p.replace(/<w:tab\/>/g, " ").replace(/<[^>]+>/g, "") + "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
  return [{ page: null, text }];
}

/** Splits text into overlapping chunks, preferring paragraph/sentence boundaries. */
export function chunkText(pages: PageText[], size = CHUNK_CHARS, overlap = OVERLAP_CHARS): PageText[] {
  const out: PageText[] = [];
  for (const p of pages) {
    const t = p.text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
    let i = 0;
    while (i < t.length) {
      let end = Math.min(t.length, i + size);
      if (end < t.length) {
        const cut = Math.max(t.lastIndexOf("\n", end), t.lastIndexOf(". ", end), t.lastIndexOf("۔", end), t.lastIndexOf("، ", end));
        if (cut > i + size / 2) end = cut + 1;
      }
      const piece = t.slice(i, end).trim();
      if (piece) out.push({ page: p.page, text: piece });
      if (end >= t.length) break;
      i = Math.max(end - overlap, i + 1);
    }
  }
  return out;
}

/** Background job: extract text, chunk, embed, store as DocumentChunk (PRD §7.3). */
export async function processDocument(documentId: string): Promise<number> {
  const doc = await db.document.findUnique({ where: { id: documentId } });
  if (!doc || !doc.completed) return 0;
  const bytes = await readObject(doc.file_key);
  if (!bytes) return 0;
  let pages: PageText[] = [];
  try {
    if (doc.mime === "application/pdf") pages = await extractPdf(bytes);
    else if (doc.mime.includes("wordprocessingml")) pages = extractDocx(bytes);
    else if (doc.mime === "text/plain") pages = [{ page: null, text: new TextDecoder().decode(bytes) }];
  } catch (e) {
    log.warn("text extraction failed", { documentId, err: String(e) });
    return 0;
  }
  return storeChunks(documentId, pages);
}

export async function storeChunks(documentId: string, pages: PageText[]): Promise<number> {
  const chunks = chunkText(pages);
  await db.document.update({ where: { id: documentId }, data: { extracted_text: pages.map((p) => p.text).join("\n\n").slice(0, 1_000_000) } });
  await db.documentChunk.deleteMany({ where: { document_id: documentId } });
  const vecs = await embed(chunks.map((c) => c.text));
  for (let i = 0; i < chunks.length; i++) {
    const row = await db.documentChunk.create({ data: { document_id: documentId, idx: i, page: chunks[i]!.page, text: chunks[i]!.text } });
    await db.$executeRawUnsafe(`UPDATE document_chunks SET embedding = $1::vector WHERE id = $2::uuid`, toVectorLiteral(vecs[i]!), row.id);
  }
  return chunks.length;
}
