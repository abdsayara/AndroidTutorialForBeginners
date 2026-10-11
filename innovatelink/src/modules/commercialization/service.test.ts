import { describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { makeOrg, makeProject, makeUser } from "../../../tests/helpers";
import { getCaseForProject, getProjectIp, kanban, openCase, putProjectIp, updateCase } from "./service";

describe("commercialization (FR-6)", () => {
  it("open case, move stages on Kanban, IP changes need an agreement and are audited", async () => {
    const coord = await makeUser("platform_coordinator");
    const uni = await makeOrg("university");
    const st = await makeUser("student", uni.id);
    const uc = await makeUser("university_coordinator", uni.id);
    const p = await makeProject(uni.id, st.id, { status: "published" });
    await expect(openCase(st, { project_id: p.id, pathway: "startup" })).rejects.toMatchObject({ code: "forbidden" });
    const c = await openCase(coord, { project_id: p.id, pathway: "startup" });
    await expect(openCase(coord, { project_id: p.id, pathway: "startup" })).rejects.toMatchObject({ code: "conflict" });
    expect((await db.project.findUniqueOrThrow({ where: { id: p.id } })).status).toBe("commercializing");
    expect((c.checklist as Record<string, unknown[]>).ip_assessment).toHaveLength(3);
    await updateCase(coord, c.id, { stage: "market_validation", checklist: { ip_assessment: [{ key: "novelty_search", done: true }] } });
    const board = await kanban(coord);
    expect(board.market_validation).toHaveLength(1);
    expect((await getCaseForProject(st, p.id))?.stage).toBe("market_validation");

    const doc = await db.document.create({ data: { owner_type: "project", owner_id: p.id, file_key: "k", filename: "اتفاقية.pdf", mime: "application/pdf", size: 1, uploaded_by: uc.id, completed: true } });
    await expect(putProjectIp(uc, p.id, { ip_status: "filed", owners: [{ name: "الجامعة", share: 100 }], agreement_doc_id: "00000000-0000-0000-0000-000000000000" })).rejects.toMatchObject({ message: "agreement_required" });
    await putProjectIp(uc, p.id, { ip_status: "filed", owners: [{ name: "الجامعة", share: 70 }, { name: "الطلبة", share: 30 }], agreement_doc_id: doc.id });
    await expect(putProjectIp(st, p.id, { ip_status: "filed", owners: [{ name: "x", share: 100 }], agreement_doc_id: doc.id })).rejects.toMatchObject({ code: "forbidden" });
    expect((await getProjectIp(st, p.id))?.ip_status).toBe("filed");
    expect((await db.project.findUniqueOrThrow({ where: { id: p.id } })).ip_status).toBe("filed");
    expect(await db.auditLog.count({ where: { action: "ip_record_change" } })).toBe(1);
  });
});
