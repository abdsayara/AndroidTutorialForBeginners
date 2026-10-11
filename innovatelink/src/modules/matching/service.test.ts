import { describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { makeChallenge, makeOrg, makeProject, makeUser } from "../../../tests/helpers";
import { indexEntity } from "./indexing";
import {
  addManualMatch, detectClusters, listAcademicMatches, listChallengeMatches, listClusters, matchFeedback, overallScore, rematch, respondToMatch,
  reviewMatch, runChallengeMatching, runProjectMatching, semanticIds, suggestedMatches,
} from "./service";
import { DEFAULT_WEIGHTS } from "./schema";

async function scenario() {
  const co = await makeOrg("company", { name_ar: "مصنع حجر الخليل" });
  const admin = await makeUser("company_admin", co.id);
  const coord = await makeUser("platform_coordinator");
  const uni = await makeOrg("university");
  const student = await makeUser("student", uni.id);
  const sup = await makeUser("researcher", uni.id);
  const challenge = await makeChallenge(co.id, admin.id, {
    status: "published", category: "energy_water_waste",
    title: "مخلفات قص الحجر",
    problem_statement: "ينتج المصنع يومياً كميات كبيرة من رواسب قص الحجر والرخام (الروبة) ومخلفات الكسر، وتُلقى في المكبات مما يسبب تلوثاً. نبحث عن طريقة لإعادة تدوير هذه المخلفات في مواد البناء.",
  });
  const target = await makeProject(uni.id, student.id, { status: "published", supervisor_id: sup.id, trl: 5, title: "إعادة تدوير مخلفات البناء والهدم في إنتاج الطوب", summary: "استخدام الركام ومخلفات الحجر والخرسانة كبديل جزئي للحصمة في إنتاج طوب البناء." });
  const distractors = [
    ["تطبيق لإدارة مواعيد العيادات", "نظام برمجي لحجز المواعيد في العيادات"],
    ["تحسين تعبئة زيت الزيتون", "خط تعبئة آلي لزيت الزيتون في مصانع الأغذية"],
    ["نظام ذكاء اصطناعي لتصنيف الصور الطبية", "شبكة عصبية لتحليل صور الأشعة"],
    ["تحليل جودة الحليب في الألبان", "فحص جودة الحليب بالحساسات"],
  ];
  for (const [title, summary] of distractors) await makeProject(uni.id, student.id, { status: "published", title, summary, trl: 4 });
  for (const p of await db.project.findMany()) await indexEntity("project", p.id);
  await indexEntity("challenge", challenge.id);
  return { co, admin, coord, uni, student, sup, challenge, target };
}

describe("matching pipeline", () => {
  it("§7.2 / FR-2 acceptance: stone-waste challenge returns the construction-waste recycling project in the top 3, with cited rationale", async () => {
    const s = await scenario();
    const res = await runChallengeMatching(s.challenge.id);
    expect(res.created).toBeGreaterThan(0);
    const all = await suggestedMatches(s.coord);
    const top3 = all.slice(0, 3).map((m) => m.target_id);
    expect(top3).toContain(s.target.id);
    const m = all.find((x) => x.target_id === s.target.id)!;
    expect(m.score).toBeGreaterThanOrEqual(0.55);
    expect(Object.keys(m.criteria_scores as object).sort()).toEqual(["expertise", "maturity", "need_fit", "resources", "technical"]);
    expect(m.rationale).toContain("مخلفات قص الحجر");
    expect(m.rationale).toContain(s.target.title);
    expect(await db.match.count({ where: { status: { not: "suggested" } } })).toBe(0); // AI never moves status
    expect(await db.aiRun.count({ where: { kind: "match.rerank" } })).toBeGreaterThan(0);
  });

  it("FR-2.3/2.4 + E2E path 3: coordinator → company → academic = confirmed; nothing earlier", async () => {
    const s = await scenario();
    await runChallengeMatching(s.challenge.id);
    const m = (await db.match.findFirstOrThrow({ where: { target_id: s.target.id } }));
    // Company sees nothing before shortlist.
    expect(await listChallengeMatches(s.admin, s.challenge.id)).toHaveLength(0);
    expect(await listAcademicMatches(s.student)).toHaveLength(0);
    await expect(respondToMatch(s.admin, m.id, { decision: "accept" })).rejects.toMatchObject({ code: "invalid_transition" });
    await expect(respondToMatch(s.student, m.id, { decision: "accept" })).rejects.toMatchObject({ code: "invalid_transition" });
    await expect(reviewMatch(s.admin, m.id, { decision: "shortlist" })).rejects.toMatchObject({ code: "forbidden" });

    await reviewMatch(s.coord, m.id, { decision: "shortlist" });
    const companyView = await listChallengeMatches(s.admin, s.challenge.id);
    expect(companyView.map((x) => x.id)).toEqual([m.id]);
    expect(companyView[0]!.target).toMatchObject({ kind: "full", title: s.target.title });
    await respondToMatch(s.admin, m.id, { decision: "accept" });
    expect((await db.match.findUniqueOrThrow({ where: { id: m.id } })).status).toBe("accepted_by_company");
    const outsider = await makeUser("student");
    await expect(respondToMatch(outsider, m.id, { decision: "accept" })).rejects.toMatchObject({ code: "forbidden" });
    const acad = await listAcademicMatches(s.sup);
    expect(acad[0]!.challenge.kind).toBe("full");
    await respondToMatch(s.sup, m.id, { decision: "accept" });
    expect((await db.match.findUniqueOrThrow({ where: { id: m.id } })).status).toBe("confirmed");
    expect((await db.challenge.findUniqueOrThrow({ where: { id: s.challenge.id } })).status).toBe("matched");
    expect(await db.auditLog.count({ where: { entity_type: "match", entity_id: m.id } })).toBe(3);

    await matchFeedback(s.admin, m.id, { useful: true });
    const run = await db.aiRun.findUniqueOrThrow({ where: { id: m.ai_run_id! } });
    expect((run.feedback as { entries: unknown[] }).entries).toHaveLength(1);
    await expect(matchFeedback(outsider, m.id, { useful: false })).rejects.toMatchObject({ code: "forbidden" });
  });

  it("rejection requires a reason and is final; manual matches; rematch", async () => {
    const s = await scenario();
    await runChallengeMatching(s.challenge.id);
    const [m1] = await db.match.findMany();
    await reviewMatch(s.coord, m1!.id, { decision: "reject", rejection_reason: "خارج النطاق" });
    await expect(reviewMatch(s.coord, m1!.id, { decision: "shortlist" })).rejects.toMatchObject({ code: "forbidden" });
    const lab = await db.lab.create({ data: { org_id: s.uni.id, name: "مختبر المواد", description: "فحص مواد البناء", contact_user_id: s.sup.id } });
    const manual = await addManualMatch(s.coord, s.challenge.id, { target_type: "lab", target_id: lab.id, rationale: "المختبر يملك أجهزة فحص ضغط الطوب" });
    expect(manual).toMatchObject({ source: "manual", status: "shortlisted" });
    await expect(addManualMatch(s.coord, s.challenge.id, { target_type: "lab", target_id: lab.id, rationale: "مكرر مرة أخرى" })).rejects.toMatchObject({ code: "conflict" });
    await expect(addManualMatch(s.admin, s.challenge.id, { target_type: "lab", target_id: lab.id, rationale: "x".repeat(10) })).rejects.toMatchObject({ code: "forbidden" });
    await respondToMatch(s.sup, manual.id, { decision: "reject", rejection_reason: "لا وقت متاح" });
    expect((await db.match.findUniqueOrThrow({ where: { id: manual.id } })).rejection_reason).toBe("لا وقت متاح");
    await rematch(s.coord, s.challenge.id);
    await expect(rematch(s.admin, s.challenge.id)).rejects.toMatchObject({ code: "forbidden" });
  });

  it("§3 acceptance: confidential challenge is never suggested to a project without access; fields never leak", async () => {
    const s = await scenario();
    await db.challenge.update({ where: { id: s.challenge.id }, data: { visibility: "confidential", public_title: "إعادة تدوير مخلفات الحجر في مواد البناء" } });
    await indexEntity("challenge", s.challenge.id);
    await runChallengeMatching(s.challenge.id);
    expect(await db.match.count({ where: { target_type: "project" } })).toBe(0);
    // Grant the student access: now the project is eligible, and rationale uses the public title only.
    await db.accessGrant.create({ data: { subject_type: "challenge", subject_id: s.challenge.id, user_id: s.student.id, granted_by: s.admin.id, nda_version: "v" } });
    await runChallengeMatching(s.challenge.id);
    const ms = await db.match.findMany({ where: { target_type: "project" } });
    expect(ms.length).toBeGreaterThan(0);
    for (const m of ms) expect(m.rationale).not.toContain("مخلفات قص الحجر");
    // Supervisor (no grant) sees the match with a teaser only.
    const m = ms.find((x) => x.target_id === s.target.id)!;
    await reviewMatch(s.coord, m.id, { decision: "shortlist" });
    const supView = await listAcademicMatches(s.sup);
    expect(supView[0]!.challenge.kind).toBe("teaser");
    expect(JSON.stringify(supView)).not.toContain("الروبة");
  });

  it("FR-2.6 reverse matching and FR-2.7 clusters (coordinators only)", async () => {
    const s = await scenario();
    const rev = await runProjectMatching(s.target.id);
    expect(rev.created).toBe(1);
    const c2 = await makeChallenge(s.co.id, s.admin.id, { status: "published", title: "مخلفات قص الحجر", problem_statement: s.challenge.problem_statement! });
    await indexEntity("challenge", c2.id);
    expect(await detectClusters()).toBe(1);
    const cl = await listClusters(s.coord);
    expect(cl[0]!.challenge_ids.sort()).toEqual([s.challenge.id, c2.id].sort());
    await expect(listClusters(s.admin)).rejects.toMatchObject({ code: "forbidden" });
  });

  it("semantic search finds related projects without the literal phrase (FR-3 acceptance)", async () => {
    const s = await scenario();
    const p = await makeProject(s.uni.id, s.student.id, { status: "published", title: "وحدة ترشيح بالأغشية لمياه المصانع", summary: "تنقية المياه العادمة الناتجة عن مصانع الألبان وإعادة استخدامها في الري" });
    await indexEntity("project", p.id);
    const ids = (await semanticIds("projects", "معالجة مياه الصرف الصناعي", 3)).map((r) => r.id);
    expect(ids[0]).toBe(p.id);
  });

  it("overallScore uses the configured weights", () => {
    expect(overallScore({ technical: 5, expertise: 5, maturity: 5, resources: 5, need_fit: 5 }, DEFAULT_WEIGHTS)).toBe(1);
    expect(overallScore({ technical: 0, expertise: 0, maturity: 0, resources: 0, need_fit: 0 }, DEFAULT_WEIGHTS)).toBe(0);
  });
});
