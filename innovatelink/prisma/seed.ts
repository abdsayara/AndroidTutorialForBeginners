/* eslint-disable no-console */
process.env.JOBS_DISABLED = "1";

import { PrismaClient, type Prisma } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/crypto";
import { CHALLENGES, COMPANIES, LABS, PASSWORD, PROJECTS, RESEARCHERS, SECTORS, TAGS, UNIVERSITIES } from "./seed-data";
import { DEFAULT_NDA } from "../src/modules/access/service";
import { DEFAULT_WEIGHTS } from "../src/modules/matching/schema";
import { defaultChecklist } from "../src/modules/commercialization/service";

const db = new PrismaClient();

async function main() {
  const t0 = Date.now();
  console.log("Resetting data…");
  const tables = await db.$queryRaw<{ tablename: string }[]>`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename NOT LIKE '_prisma%'`;
  await db.$executeRawUnsafe(`TRUNCATE ${tables.map((t) => `"${t.tablename}"`).join(",")} CASCADE`);

  const pw = await hashPassword(PASSWORD);
  const now = new Date();
  const days = (n: number) => new Date(now.getTime() - n * 864e5);

  await db.setting.createMany({ data: [
    { key: "matching_weights", value: DEFAULT_WEIGHTS },
    { key: "nda_template", value: DEFAULT_NDA },
  ] });
  const sector: Record<string, string> = {};
  for (const s of SECTORS) sector[s.slug] = (await db.sector.create({ data: s })).id;
  await db.tag.createMany({ data: TAGS.map(([slug, name_ar, name_en]) => ({ slug, name_ar, name_en })) });

  const platform = await db.organization.create({ data: { type: "platform", name_ar: "وحدة إدارة المنصة — جمعية براعة", name_en: "Platform unit — Bara'a", status: "active", city: "رام الله" } });
  const uni: Record<string, string> = {};
  for (const u of UNIVERSITIES) uni[u.key] = (await db.organization.create({ data: { type: "university", name_ar: u.name_ar, name_en: u.name_en, city: u.city, email_domains: [u.domain], status: "active" } })).id;
  const co: Record<string, string> = {};
  for (const c of COMPANIES) co[c.key] = (await db.organization.create({ data: { type: "company", name_ar: c.name_ar, name_en: c.name_en, city: c.city, size: c.size, sector_id: sector[c.sector], status: "active" } })).id;
  const pendingCo = await db.organization.create({ data: { type: "company", name_ar: "شركة الوادي للصناعات المعدنية", name_en: "Wadi Metal Industries", city: "قلقيلية", size: "small", status: "pending" } });

  const user = (email: string, full_name: string, role: Prisma.UserCreateInput["role"], org_id: string, status: "active" | "pending" = "active", created = 120) =>
    db.user.create({ data: { email, full_name, role, org_id, status, password_hash: pw, email_verified_at: now, consent_version: "2026-10-v1", created_at: days(created) } });

  // ── one user per role (documented in README for development only)
  const admin = await user("admin@innovatelink.test", "مدير النظام", "platform_admin", platform.id);
  const coord = await user("coordinator@innovatelink.test", "منسقة المنصة — ريم", "platform_coordinator", platform.id);
  const ucNajah = await user("coordinator@najah.test", "منسق الابتكار — النجاح", "university_coordinator", uni.najah!);
  for (const k of ["birzeit", "ppu", "aaup"] as const) await user(`coordinator@${UNIVERSITIES.find((u) => u.key === k)!.domain}`, `منسق الابتكار — ${UNIVERSITIES.find((u) => u.key === k)!.name_ar}`, "university_coordinator", uni[k]!);
  const companyAdmins: Record<string, string> = {};
  for (const c of COMPANIES) companyAdmins[c.key] = (await user(c.key === "hebron_stone" ? "company@innovatelink.test" : `admin@${c.key.replace(/_/g, "-")}.test`, `ممثل ${c.name_ar}`, "company_admin", co[c.key]!)).id;
  const member = await user("member@innovatelink.test", "م. سامي — مرشد فني", "company_member", co.hebron_stone!);
  await user("pending.company@innovatelink.test", "ممثل شركة الوادي", "company_admin", pendingCo.id, "pending", 2);

  // researchers
  const researcherIds: Record<string, string[]> = { najah: [], birzeit: [], ppu: [], aaup: [] };
  let rIdx = 0;
  for (const [name, dept, title, tags, u, bio] of RESEARCHERS) {
    const email = rIdx === 0 ? "researcher@ppu.test" : `researcher${rIdx}@${UNIVERSITIES.find((x) => x.key === u)!.domain}`;
    const r = await user(email, name, "researcher", uni[u]!);
    await db.researcherProfile.create({ data: { user_id: r.id, department: dept, title, expertise_tags: tags, bio, availability: "يوم واحد أسبوعياً", lang: "ar" } });
    researcherIds[u]!.push(r.id);
    rIdx++;
  }
  // students (4 per university)
  const studentIds: Record<string, string[]> = { najah: [], birzeit: [], ppu: [], aaup: [] };
  const names = ["أحمد", "سلمى", "محمد", "جنى", "يزن", "نور", "عمر", "تالا", "كرم", "لين", "مالك", "رهف", "قيس", "دانة", "زيد", "سارة"];
  let sIdx = 0;
  for (const u of UNIVERSITIES) for (let i = 0; i < 4; i++) {
    const email = i === 0 ? `student@${u.domain}` : `student${sIdx}@${u.domain}`;
    studentIds[u.key]!.push((await user(email, `${names[sIdx]} — طالب/ة`, "student", uni[u.key]!)).id);
    sIdx++;
  }
  await user("pending.student@najah.test", "طالب بانتظار الاعتماد", "student", uni.najah!, "pending", 1);

  // labs
  for (const [name, description, equipment, services, u] of LABS) {
    await db.lab.create({ data: { org_id: uni[u]!, name, description, equipment, services, contact_user_id: researcherIds[u]![0] } });
  }

  // challenges
  const challengeIds: Record<string, string> = {};
  let ci = 0;
  for (const c of CHALLENGES) {
    const published = c.status === "published";
    const ch = await db.challenge.create({ data: {
      org_id: co[c.company]!, created_by: companyAdmins[c.company]!, title: c.title, public_title: c.public_title ?? null, category: c.category as never,
      sector_id: sector[COMPANIES.find((x) => x.key === c.company)!.sector], tags: c.tags, problem_statement: c.problem, current_situation: c.current || null,
      desired_outcome: c.outcome || null, constraints: c.constraints || null, business_impact: c.impact, resources_offered: c.resources,
      expected_duration_months: c.months, visibility: c.visibility, visibility_org_ids: (c.unis ?? []).map((k) => uni[k]!), status: c.status as never,
      published_at: published ? days(60 - ci * 3) : null, created_at: days(70 - ci * 3), lang: "ar",
    } });
    challengeIds[c.title] = ch.id;
    await db.auditLog.create({ data: { actor_id: published ? coord.id : companyAdmins[c.company]!, action: "status_change", entity_type: "challenge", entity_id: ch.id, diff: { status: ["draft", c.status] }, created_at: days(60 - ci * 3) } });
    ci++;
  }
  // a draft challenge for the demo company admin
  await db.challenge.create({ data: { org_id: co.hebron_stone!, created_by: companyAdmins.hebron_stone!, title: "تحسين تعبئة الحجر للتصدير", problem_statement: "تتعرض ألواح الحجر للكسر أثناء الشحن البحري.", status: "draft", lang: "ar" } });

  // projects
  const projectIds: string[] = [];
  let pi = 0;
  for (const [title, summary, sec, type, trl, tags, u, seeking] of PROJECTS) {
    const sIds = studentIds[u]!;
    const sup = researcherIds[u]![pi % researcherIds[u]!.length]!;
    const status = pi % 15 === 14 ? "pending_approval" : pi % 20 === 19 ? "draft" : "published";
    const p = await db.project.create({ data: {
      org_id: uni[u]!, created_by: type === "research_output" ? sup : sIds[pi % sIds.length]!, type: type as never, title, summary,
      problem_addressed: summary.split("،")[0], sector_id: sector[sec], tags, trl, supervisor_id: sup,
      team_member_ids: type === "research_output" ? [] : [sIds[pi % sIds.length]!, sIds[(pi + 1) % sIds.length]!],
      evidence: trl >= 5 ? "اختبارات مخبرية أولية بنتائج واعدة موثقة في تقرير المشروع." : null,
      ip_status: (trl >= 6 ? "disclosed" : "none") as never, seeking: seeking as never, support_needs: (trl < 5 ? ["technical", "funding"] : ["market_access"]) as never,
      visibility: pi === 10 ? "confidential" : "public", public_title: pi === 10 ? "نظام فحص آلي لخطوط الإنتاج" : null,
      status: status as never, published_at: status === "published" ? days(90 - pi) : null, created_at: days(100 - pi), lang: "ar",
    } });
    projectIds.push(p.id);
    pi++;
  }

  // ── AI indexing + matching on published challenges (mock provider by default)
  console.log("Indexing and matching (AI provider:", process.env.LLM_PROVIDER ?? "mock", ")…");
  const { reindexAll } = await import("../src/modules/matching/indexing");
  const { runChallengeMatching, detectClusters, reviewMatch, respondToMatch } = await import("../src/modules/matching/service");
  await reindexAll();
  for (const id of Object.values(challengeIds)) await runChallengeMatching(id);
  await detectClusters();

  // ── a confirmed match → active workspace (demo of the full cycle)
  const stoneId = challengeIds["مخلفات قص الحجر"]!;
  const target = await db.match.findFirst({ where: { challenge_id: stoneId, target_type: "project", target_id: projectIds[0] } })
    ?? await db.match.create({ data: { challenge_id: stoneId, target_type: "project", target_id: projectIds[0]!, score: 0.8, rationale: "مطابقة يدوية للعرض", criteria_scores: {}, source: "manual", status: "suggested" } });
  const actor = (u: { id: string; role: Prisma.UserCreateInput["role"]; org_id: string }, org_type: "platform" | "company" | "university") => ({ id: u.id, role: u.role, status: "active" as const, org_id: u.org_id, org_type });
  const coordA = actor(coord, "platform");
  if (target.status === "suggested") await reviewMatch(coordA, target.id, { decision: "shortlist" });
  await respondToMatch(actor({ id: companyAdmins.hebron_stone!, role: "company_admin", org_id: co.hebron_stone! }, "company"), target.id, { decision: "accept" });
  const p0 = await db.project.findUniqueOrThrow({ where: { id: projectIds[0]! } });
  await respondToMatch(actor({ id: p0.supervisor_id!, role: "researcher", org_id: p0.org_id }, "university"), target.id, { decision: "accept" });
  const ws = await db.workspace.create({ data: {
    match_id: target.id, challenge_id: stoneId, project_id: p0.id, title: "مخلفات قص الحجر — تعاون مع جامعة بوليتكنك فلسطين", objectives: "إنتاج طوب بناء يحتوي 30% من روبة الحجر ومخلفات الكسر ومطابق للمواصفة الفلسطينية.",
    status: "active", start_date: days(30), course_code: "CE590", semester: "2026-2027/1",
    members: { create: [
      { user_id: companyAdmins.hebron_stone!, ws_role: "company_rep" }, { user_id: member.id, ws_role: "mentor" },
      { user_id: p0.supervisor_id!, ws_role: "supervisor" }, ...p0.team_member_ids.map((id) => ({ user_id: id, ws_role: "student" as const })),
    ] },
  } });
  const agreement = await db.document.create({ data: { owner_type: "workspace", owner_id: ws.id, file_key: `workspace/${ws.id}/seed-agreement.pdf`, filename: "اتفاقية التعاون الموقعة.pdf", mime: "application/pdf", size: 120_000, uploaded_by: companyAdmins.hebron_stone!, completed: true } });
  await db.workspace.update({ where: { id: ws.id }, data: { agreement_doc_id: agreement.id } });
  await db.ipRecord.create({ data: { workspace_id: ws.id, ip_status: "none", owners: [{ name: "مصنع الخليل الحديث للحجر", share: 50 }, { name: "جامعة بوليتكنك فلسطين", share: 50 }], background_ip: "خلطات الطوب الأساسية مملوكة للجامعة.", agreement_doc_id: agreement.id } });
  await db.challenge.update({ where: { id: stoneId }, data: { status: "in_progress" } });
  await db.project.update({ where: { id: p0.id }, data: { status: "in_collaboration" } });
  const m1 = await db.milestone.create({ data: { workspace_id: ws.id, title: "توصيف الروبة ومخلفات الكسر", status: "done", order: 0, due_date: days(15) } });
  const m2 = await db.milestone.create({ data: { workspace_id: ws.id, title: "خلطات تجريبية واختبارات الضغط", status: "in_progress", order: 1, due_date: days(-2) } });
  await db.milestone.create({ data: { workspace_id: ws.id, title: "إنتاج دفعة تجريبية في المصنع", status: "pending", order: 2, due_date: days(-45) } });
  await db.task.createMany({ data: [
    { milestone_id: m1.id, title: "أخذ عينات من أحواض الترسيب", status: "done", assignee_id: p0.team_member_ids[0] },
    { milestone_id: m1.id, title: "تحليل التدرج الحبيبي", status: "done", assignee_id: p0.team_member_ids[1] ?? null },
    { milestone_id: m2.id, title: "تحضير 5 خلطات بنسب 10–50%", status: "doing", assignee_id: p0.team_member_ids[0] },
    { milestone_id: m2.id, title: "فحص مقاومة الضغط بعد 28 يوماً", status: "todo", assignee_id: p0.supervisor_id },
  ] });
  await db.meetingNote.create({ data: { workspace_id: ws.id, held_at: days(28), attendees: ["ممثل المصنع", "المشرف الأكاديمي", "الطلبة"], notes: "اجتماع انطلاق: تم الاتفاق على أخذ العينات من حوضي الترسيب 1 و2، وتوفير المصنع لكميات 500 كغم للتجارب. نسبة الروبة المستهدفة 30%.", action_items: ["تجهيز العينات خلال أسبوع", "مشاركة نتائج التحليل"], created_by: p0.supervisor_id! } });
  await db.progressUpdate.create({ data: { workspace_id: ws.id, author_id: p0.team_member_ids[0]!, body: "أظهر تحليل الروبة أن 95% منها كربونات كالسيوم وأن 80% من حبيباتها أصغر من 75 ميكرون، ما يجعلها مناسبة كمادة مالئة.", prototype_stage: "خلطات مخبرية", test_results: "مقاومة ضغط 9.8 ميغاباسكال لخلطة 30% بعد 7 أيام", created_at: days(10) } });

  // a completed workspace for KPIs (rating + documented impact)
  const otherMatch = await db.match.create({ data: { challenge_id: challengeIds["تقليل الهدر في الخبز غير المباع"]!, target_type: "project", target_id: projectIds[8]!, score: 0.71, rationale: "نموذج التنبؤ بالطلب في المشروع يعالج مباشرة مشكلة المرتجعات في التحدي.", criteria_scores: { technical: 4, expertise: 3.5, maturity: 2.5, resources: 2.5, need_fit: 4 }, status: "confirmed", company_accepted_at: days(80), academic_accepted_at: days(79) } });
  await db.workspace.create({ data: { match_id: otherMatch.id, challenge_id: otherMatch.challenge_id, project_id: projectIds[8], title: "تقليل الهدر في الخبز — نموذج تنبؤ", status: "completed", start_date: days(78), end_date: days(5), rating: 5, rating_comment: "انخفضت المرتجعات بشكل ملموس.", impact: { savings_ils: 4200, productivity_pct: 6 },
    final_report: { summary: "طُوّر نموذج تنبؤ بالطلب اليومي خفّض المرتجعات من 8% إلى 3.5%.", solution: "نموذج انحدار مع متغيرات الطقس والمناسبات.", results: "توفير شهري 4,200 شيكل.", technical_recommendations: "تحديث النموذج شهرياً.", business_recommendations: "تعميمه على الفروع.", next_steps: "ربطه بنظام نقاط البيع." },
    members: { create: [{ user_id: companyAdmins.sanabel_bakery!, ws_role: "company_rep" }] } } });
  await db.challenge.update({ where: { id: otherMatch.challenge_id }, data: { status: "solved", closed_at: days(5) } });

  // commercialization cases
  const commercial = [[projectIds[2]!, "startup", "market_validation"], [projectIds[10]!, "licensing", "ip_assessment"], [projectIds[12]!, "product_sale", "prototype_refinement"]] as const;
  for (const [pid, pathway, stage] of commercial) {
    await db.commercializationCase.create({ data: { project_id: pid, pathway, stage, checklist: defaultChecklist(), coordinator_id: coord.id, notes: "حالة تجريبية من بيانات البذر." } });
    await db.project.update({ where: { id: pid }, data: { status: "commercializing" } });
  }

  // contact request + access request examples
  await db.contactRequest.create({ data: { from_user_id: researcherIds.najah![1]!, target_type: "challenge", target_id: challengeIds["معالجة مياه الصرف في مصنع الألبان"]!, message: "لدي خبرة في وحدات الترشيح بالأغشية وأود مناقشة التحدي.", status: "pending" } });
  await db.accessRequest.create({ data: { subject_type: "challenge", subject_id: challengeIds["تسرب في خط تعبئة الشراب الدوائي"]!, user_id: researcherIds.aaup![1]!, message: "مختبرنا متخصص في الفحص الآلي.", status: "pending" } });

  console.log(`Seed complete in ${((Date.now() - t0) / 1000).toFixed(1)}s:`, {
    universities: UNIVERSITIES.length, companies: COMPANIES.length, challenges: CHALLENGES.length + 1, projects: PROJECTS.length,
    researchers: RESEARCHERS.length, labs: LABS.length, matches: await db.match.count(), clusters: await db.challengeCluster.count(),
  });
  void admin; void ucNajah;
}

main().then(() => db.$disconnect()).catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(1); });
