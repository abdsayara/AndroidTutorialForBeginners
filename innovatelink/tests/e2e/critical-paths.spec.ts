import { expect, test } from "@playwright/test";
import { db, lastMailLink, login, pdf } from "./helpers";

test.describe.configure({ mode: "serial" });

test("1. company registers, is approved, submits a challenge with AI diagnosis, coordinator publishes", async ({ page }) => {
  const email = `owner${Date.now()}@stone-e2e.test`;
  await page.goto("/ar/auth/register");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.getByLabel("الاسم الكامل").fill("خليل التميمي");
  await page.getByLabel("البريد الإلكتروني").fill(email);
  await page.getByLabel("كلمة المرور").fill("very-secure-pass");
  await page.getByLabel("الاسم بالعربية").fill("مصنع جبل الخليل للحجر");
  await page.getByLabel("المدينة").fill("الخليل");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "إنشاء الحساب" }).click();
  await expect(page.getByText("تحقق من بريدك")).toBeVisible();

  await page.goto(`${await lastMailLink(email, "/auth/verify")}`);
  await expect(page.getByText("تم تأكيد بريدك")).toBeVisible();

  // coordinator approves the new company
  await login(page, "coordinator@innovatelink.test");
  await page.goto("/ar/coordinator/review");
  const orgCard = page.locator("div.rounded-lg", { hasText: "مصنع جبل الخليل للحجر" }).first();
  await orgCard.getByRole("button", { name: "اعتماد" }).click();
  await expect(page.getByText("مصنع جبل الخليل للحجر")).toHaveCount(0);

  // company submits a challenge in the 5-step wizard
  await login(page, email, "very-secure-pass");
  await page.goto("/ar/dashboard/challenges/new");
  await page.getByLabel("عنوان التحدي").fill("كسر ألواح الحجر أثناء النقل");
  await page.getByLabel("الفئة").selectOption("operations");
  await page.getByLabel("القطاع").selectOption({ label: "الحجر والرخام" });
  await page.getByRole("button", { name: "التالي" }).click();
  await page.getByLabel("وصف المشكلة").fill("تنكسر نحو 5% من ألواح الحجر أثناء التحميل والنقل بالشاحنات إلى الموانئ بسبب طريقة الربط والتغليف الحالية.");
  await page.getByLabel("النتيجة المطلوبة").fill("تقليل الكسر إلى أقل من 1%");
  await page.getByRole("button", { name: /تشخيص بالذكاء الاصطناعي/ }).click();
  await expect(page.getByText("معلومات ناقصة")).toBeVisible();
  expect(await page.locator("li", { hasText: "؟" }).count()).toBeGreaterThanOrEqual(3);
  await page.getByRole("button", { name: "التالي" }).click();
  await page.getByRole("button", { name: "التالي" }).click();
  await page.getByRole("button", { name: "التالي" }).click();
  await page.getByRole("button", { name: "إرسال للمراجعة" }).click();
  await page.waitForURL("**/dashboard");
  const c = await db.challenge.findFirstOrThrow({ where: { title: "كسر ألواح الحجر أثناء النقل" } });
  expect(c.status).toBe("submitted");

  // not visible to academics before publication
  await login(page, "researcher@ppu.test");
  expect((await page.request.get(`/api/v1/challenges/${c.id}`)).status()).toBe(404);

  await login(page, "coordinator@innovatelink.test");
  await page.goto("/ar/coordinator/review");
  const card = page.locator("div.rounded-lg", { hasText: "كسر ألواح الحجر أثناء النقل" });
  await card.getByRole("button", { name: "نشر" }).click();
  await expect(card).toHaveCount(0);
  await page.goto(`/ar/challenges/${c.id}`);
  await expect(page.getByRole("heading", { name: "كسر ألواح الحجر أثناء النقل" })).toBeVisible();
});

test("2. student creates a project, university coordinator approves, it appears in the directory", async ({ page }) => {
  await login(page, "student@ppu.test");
  await page.goto("/ar/dashboard/projects/new");
  await page.getByLabel("العنوان", { exact: true }).fill("ذراع روبوتية لتحميل ألواح الحجر");
  await page.getByLabel("الملخص").fill("ذراع روبوتية بماصات هوائية لتحميل ألواح الحجر وتقليل الكسر أثناء المناولة في المصانع.");
  await page.getByLabel("المشكلة التي يعالجها").fill("كسر الألواح أثناء المناولة اليدوية");
  await page.getByLabel("القطاع").selectOption({ label: "الحجر والرخام" });
  await page.getByLabel("المشرف").selectOption({ index: 1 });
  await page.getByLabel(/مستوى الجاهزية التقنية/).selectOption("4");
  await page.getByRole("button", { name: "إرسال للاعتماد" }).click();
  await page.waitForURL("**/dashboard");

  await login(page, "coordinator@ppu.test");
  await page.goto("/ar/coordinator/review");
  const card = page.locator("div.rounded-lg", { hasText: "ذراع روبوتية لتحميل ألواح الحجر" });
  await card.getByRole("button", { name: "اعتماد ونشر" }).click();
  await expect(card).toHaveCount(0);

  await page.context().clearCookies();
  await page.goto("/ar/projects?q=" + encodeURIComponent("ذراع روبوتية"));
  await expect(page.getByRole("link", { name: "ذراع روبوتية لتحميل ألواح الحجر" })).toBeVisible();
});

test("3. matching: coordinator shortlists, company accepts, researcher accepts, workspace created", async ({ page }) => {
  const ch = await db.challenge.findFirstOrThrow({ where: { title: "استهلاك المياه في مناشير الرخام" } });
  const m = await db.match.findFirstOrThrow({ where: { challenge_id: ch.id, status: "suggested", target_type: "researcher" }, orderBy: { score: "desc" } });
  const prof = await db.researcherProfile.findUniqueOrThrow({ where: { id: m.target_id }, include: { user: true } });

  await login(page, "admin@bethlehem-marble.test");
  expect(await (await page.request.get(`/api/v1/challenges/${ch.id}/matches`)).json()).toHaveLength(0);

  await login(page, "coordinator@innovatelink.test");
  await page.goto(`/ar/dashboard/challenges/${ch.id}/matches`);
  const card = page.locator("div.rounded-lg", { hasText: prof.user.full_name }).first();
  await expect(card.getByText(/\d+%/).first()).toBeVisible();
  await card.getByRole("button", { name: "اختيار" }).click();
  await expect(card.getByText("مرشحة")).toBeVisible();

  await login(page, "admin@bethlehem-marble.test");
  await page.goto(`/ar/dashboard/challenges/${ch.id}/matches`);
  await page.getByRole("button", { name: "قبول" }).first().click();
  await expect(page.getByText("قبلتها الشركة")).toBeVisible();

  await login(page, prof.user.email);
  await page.goto("/ar/dashboard/matches");
  await page.getByRole("button", { name: "قبول" }).first().click();
  await expect(page.getByText("مؤكدة")).toBeVisible();

  await login(page, "admin@bethlehem-marble.test");
  await page.goto(`/ar/dashboard/challenges/${ch.id}/matches`);
  await page.getByRole("button", { name: "إنشاء مساحة تعاون" }).click();
  await page.waitForURL(/\/workspaces\//);
  await expect(page.getByText("المساحة في وضع الإعداد")).toBeVisible();
});

test("4. workspace: setup gate, milestone, task, file, update, final report, close and rate; non-members get 404", async ({ page }) => {
  const ws = await db.workspace.findFirstOrThrow({ where: { status: "setup" }, orderBy: { created_at: "desc" } });
  await login(page, "admin@reef-dairy.test");
  expect((await page.request.get(`/api/v1/workspaces/${ws.id}`)).status()).toBe(404);
  expect((await page.request.get(`/api/v1/workspaces/${ws.id}/milestones`)).status()).toBe(404);
  const visit = await page.goto(`/ar/workspaces/${ws.id}`);
  expect(visit?.status()).toBe(404);

  await login(page, "admin@bethlehem-marble.test");
  await page.goto(`/ar/workspaces/${ws.id}`);
  await page.getByLabel("رفع الاتفاقية").setInputFiles({ name: "agreement.pdf", mimeType: "application/pdf", buffer: pdf });
  await expect(page.getByText(/اتفاقية التعاون الموقعة \(PDF\) ✓/)).toBeVisible({ timeout: 15000 });
  const names = page.getByLabel("الاسم", { exact: true });
  await names.nth(0).fill("شركة رخام المهد");
  await names.nth(1).fill("الجامعة");
  await page.getByRole("button", { name: "حفظ السجل" }).click();
  await page.getByRole("button", { name: "تفعيل المساحة" }).click();
  await expect(page.getByText("نشط").first()).toBeVisible();

  await page.goto(`/ar/workspaces/${ws.id}/tasks`);
  await page.getByLabel("العنوان").first().fill("تصميم دائرة الترشيح");
  await page.getByRole("button", { name: "إضافة" }).first().click();
  await expect(page.getByRole("heading", { name: /تصميم دائرة الترشيح/ })).toBeVisible();
  await page.getByLabel("العنوان").nth(1).fill("قياس استهلاك المياه اليومي");
  await page.getByRole("button", { name: "إضافة" }).nth(1).click();
  await expect(page.getByText("قياس استهلاك المياه اليومي")).toBeVisible();
  await page.getByRole("tab", { name: "لوحة Kanban" }).click();
  await expect(page.getByRole("heading", { name: "للتنفيذ" })).toBeVisible();

  await page.goto(`/ar/workspaces/${ws.id}/files`);
  await page.getByText("رفع ملف").setInputFiles({ name: "measurements.pdf", mimeType: "application/pdf", buffer: pdf });
  await expect(page.getByRole("link", { name: "measurements.pdf" })).toBeVisible({ timeout: 15000 });

  await page.goto(`/ar/workspaces/${ws.id}/updates`);
  await page.getByLabel("ما الذي أُنجز؟").fill("ركّبنا عداد مياه على خط المنشار رقم 1.");
  await page.getByRole("button", { name: "نشر" }).click();
  await expect(page.getByText("ركّبنا عداد مياه")).toBeVisible();

  await page.goto(`/ar/workspaces/${ws.id}/report`);
  await page.getByLabel("الملخص").fill("صُممت دائرة مغلقة خفضت استهلاك المياه 60%.");
  await page.getByRole("button", { name: "حفظ التقرير" }).click();
  const pdfRes = await page.request.get(`/api/v1/workspaces/${ws.id}/final-report/pdf?locale=ar`);
  expect(pdfRes.headers()["content-type"]).toBe("application/pdf");
  expect((await pdfRes.body()).subarray(0, 4).toString()).toBe("%PDF");
  page.once("dialog", (d) => d.accept());
  await page.getByLabel("توفير المياه (م³)").fill("700");
  await page.getByRole("button", { name: "إغلاق المساحة" }).click();
  await expect(page.getByText("مكتمل")).toBeVisible();
  const done = await db.workspace.findUniqueOrThrow({ where: { id: ws.id } });
  expect(done.rating).toBe(5);
});

test("5. confidentiality: teaser only, request access, owner approves, NDA accepted, details appear", async ({ page }) => {
  const ch = await db.challenge.findFirstOrThrow({ where: { title: "تطوير تركيبة كريم موضعي بثبات أعلى" } });
  await login(page, "researcher@ppu.test");
  await page.goto(`/ar/challenges/${ch.id}`);
  await expect(page.getByRole("heading", { name: "تحسين ثبات مستحضر موضعي" })).toBeVisible();
  await expect(page.getByText("تنفصل مكونات")).toHaveCount(0);
  const apiView = await (await page.request.get(`/api/v1/challenges/${ch.id}`)).json();
  expect(apiView.kind).toBe("teaser");
  expect(JSON.stringify(apiView)).not.toContain("تنفصل");
  await page.getByRole("button", { name: "طلب وصول" }).click();
  await expect(page.getByText("طلبك قيد مراجعة المالك")).toBeVisible();

  await login(page, "admin@shifa-labs.test");
  await page.goto("/ar/dashboard/access-requests");
  await page.getByRole("button", { name: "موافقة" }).first().click();
  await expect(page.getByRole("button", { name: "موافقة" })).toHaveCount(0);

  await login(page, "researcher@ppu.test");
  await page.goto(`/ar/challenges/${ch.id}`);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "أقبل الاتفاقية" }).click();
  await expect(page.getByText("تنفصل مكونات أحد الكريمات")).toBeVisible();
  const nda = await db.ndaAcceptance.findFirstOrThrow({ where: { subject_id: ch.id } });
  expect(nda.ip_address).toBeTruthy();
});
