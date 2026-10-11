import { describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { makeChallenge, makeOrg, makeProject, makeUser } from "../../../tests/helpers";
import { chunkText, extractDocx, storeChunks } from "./documents";
import { ask, INSUFFICIENT_AR, runAction, summarizeDocument } from "./service";
import { zipSync, strToU8 } from "fflate";
import { indexEntity } from "@/modules/matching/indexing";

async function setup() {
  const co = await makeOrg("company");
  const admin = await makeUser("company_admin", co.id);
  const r = await makeUser("researcher");
  const c = await makeChallenge(co.id, admin.id, { status: "published", title: "مخلفات قص الحجر", problem_statement: "تتراكم رواسب قص الحجر في ساحة المصنع بمعدل 40 طناً شهرياً." });
  const doc = await db.document.create({ data: { owner_type: "challenge", owner_id: c.id, file_key: "k", filename: "تقرير.pdf", mime: "application/pdf", size: 10, uploaded_by: admin.id, completed: true } });
  await storeChunks(doc.id, [
    { page: 1, text: "تقرير فني عن المصنع. يستخدم المصنع مناشير ماسية لقص الحجر." },
    { page: 2, text: "تحليل الرواسب أظهر أن نسبة كربونات الكالسيوم في الروبة تبلغ 95 بالمئة، مما يجعلها مناسبة لصناعة الطوب والإسمنت." },
  ]);
  return { co, admin, r, c, doc };
}

describe("assistant (FR-5)", () => {
  it("FR-5.2: answers with citations from permitted sources only; insufficient otherwise", async () => {
    const s = await setup();
    const res = await ask(s.r, { question: "ما نسبة كربونات الكالسيوم في الروبة؟", challenge_id: s.c.id });
    expect(res.insufficient).toBe(false);
    expect(res.paragraphs[0]!.text).toContain("95");
    expect(res.paragraphs[0]!.citations[0]).toMatchObject({ source_type: "document", source_id: s.doc.id, page: 2 });
    const none = await ask(s.r, { question: "كم عدد الموظفين في قسم المبيعات والتسويق الإلكتروني؟", challenge_id: s.c.id });
    expect(none).toMatchObject({ insufficient: true, message: INSUFFICIENT_AR });

    // Permission filter before retrieval: a confidential challenge is not usable without access.
    const conf = await makeChallenge(s.co.id, s.admin.id, { status: "published", visibility: "confidential", public_title: "عام" });
    await expect(ask(s.r, { question: "ما المشكلة؟", challenge_id: conf.id })).rejects.toMatchObject({ code: "forbidden" });
  });

  it("FR-5.1 summary and FR-5.3 actions", async () => {
    const s = await setup();
    const sum = await summarizeDocument(s.r, s.doc.id);
    expect(sum.summary.length).toBeGreaterThan(10);
    expect(sum.key_points.length).toBeGreaterThan(0);
    const rq = await runAction(s.r, "research_questions", s.c.id);
    expect(rq.items.length).toBeGreaterThanOrEqual(3);
    const uni = await makeOrg("university");
    const st = await makeUser("student", uni.id);
    const p = await makeProject(uni.id, st.id, { status: "published", title: "طوب من مخلفات الحجر", summary: "استخدام رواسب قص الحجر في إنتاج الطوب" });
    await indexEntity("project", p.id);
    const rel = await runAction(s.r, "related_solutions", s.c.id);
    expect((rel.items[0] as { source_id?: string }).source_id).toBe(p.id);
    const outline = await runAction(s.r, "project_outline", s.c.id);
    expect(outline.items).toHaveLength(5);
  });

  it("chunking and DOCX extraction", () => {
    const chunks = chunkText([{ page: 1, text: "أ".repeat(8000) }], 3200, 400);
    expect(chunks.length).toBe(3);
    const docx = zipSync({ "word/document.xml": strToU8('<w:document><w:body><w:p><w:r><w:t>مرحبا</w:t></w:r></w:p><w:p><w:r><w:t>بالعالم &amp; الجميع</w:t></w:r></w:p></w:body></w:document>') });
    expect(extractDocx(docx)[0]!.text.trim()).toBe("مرحبا\nبالعالم & الجميع");
  });
});
