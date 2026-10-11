# InnovateLink Palestine

منصة ويب ثنائية اللغة (عربي أولاً، RTL) تربط تحديات الشركات الفلسطينية بمشاريع التخرج والباحثين والمختبرات الجامعية عبر مطابقة مدعومة بالذكاء الاصطناعي، وتدير التعاون حتى التسويق التجاري. الجهة المالكة: جمعية براعة. تنفيذ لوثيقة الـ PRD (10 أكتوبر 2026).

> Bilingual (Arabic-first, RTL) platform connecting Palestinian companies' challenges with university projects, researchers and labs. Next.js 15 · TypeScript strict · PostgreSQL 16 + pgvector · Prisma · next-intl · Tailwind · pg-boss.

## ما المنفّذ

| الوحدة | الحالة |
| --- | --- |
| 0. التسجيل والاعتماد، RBAC بسبعة أدوار، مستويات السرية الثلاثة، NDA | كاملة |
| 1. تحديات الشركات: نموذج 5 خطوات بحفظ تلقائي، تشخيص AI (قبول/تجاهل لكل اقتراح)، مراجعة ونشر، «تحدياتي»، تعديل السرية مع سحب الوصول | كاملة |
| 2. المطابقة الذكية: استرجاع pgvector + إعادة ترتيب LLM بخمسة معايير وتفسير مستشهد، دورة القبول الثلاثية، مطابقة يدوية، الاتجاه المعاكس، كشف التشابه الأسبوعي، تقييم مفيد/غير مفيد | كاملة |
| 3. دليل المشاريع والبحوث والخبراء والمختبرات، بحث نصي ودلالي، فلاتر، اعتماد الجامعة، استيراد CSV | كاملة |
| 4. مساحة التعاون: بوابة الإعداد (اتفاقية + ملكية فكرية)، مراحل ومهام (قائمة + Kanban)، ملفات بإصدارات، اجتماعات، تحديثات، تقرير ختامي PDF عربي، إغلاق وتقييم وأثر | كاملة |
| 5. المساعد البحثي (مخفف): تلخيص PDF/DOCX، أسئلة RAG باستشهادات، ثلاثة أزرار جاهزة | كاملة |
| 6. التسويق التجاري (مخفف): حالات بمسارات ومراحل وقوائم تحقق ولوحة Kanban، سجل ملكية فكرية مُدقَّق | كاملة |
| 7. لوحات المؤشرات لكل دور، فلاتر، رسوم توزيع، تصدير CSV، قاعدة الحد الأدنى 3 شركات | كاملة |
| الإشعارات داخل المنصة وبالبريد مع تفضيلات لكل نوع | كاملة |
| لوحة الإدارة: مستخدمون، مؤسسات، تصنيفات، أوزان المطابقة، نص NDA، سجل التدقيق، استخدام وبلاغات AI | كاملة |

القيود المعروفة موثقة في نهاية هذا الملف وفي `DECISIONS.md`.

## التشغيل بأمر واحد (Docker)

```bash
cp .env.example .env          # عدّل SESSION_SECRET وكلمات المرور وAPP_URL
docker compose up -d --build  # app + worker + db (pgvector) + minio + backup
docker compose exec app npx tsx prisma/seed.ts   # بيانات تجريبية (للتطوير فقط)
```

ثم افتح http://localhost:3000 . الترحيلات تُطبَّق تلقائياً عند تشغيل `app`.

## التشغيل للتطوير (بدون Docker)

المتطلبات: Node 22، PostgreSQL 16 مع امتداد `pgvector`، وتخزين متوافق مع S3.

```bash
npm ci
cp .env.example .env                 # DATABASE_URL وغيرها
npx prisma migrate deploy
npm run db:seed
npm run dev                          # الواجهة والـ API على :3000
npm run worker                       # المهام الخلفية (embeddings، مطابقة، بريد، تلخيص)
```

إن لم يتوفر MinIO محلياً: `npm run test:e2e:s3` يشغّل خادم S3 بسيطاً (s3rver) على المنفذ 9000 (اضبط `S3_ACCESS_KEY=S3RVER` و`S3_SECRET_KEY=S3RVER`). لتصدير PDF اضبط `CHROMIUM_PATH` إلى متصفح Chromium.

## حسابات بيئة التطوير (seed فقط — لا تُستخدم في الإنتاج)

كلمة المرور لجميع الحسابات: **`InnovateLink#2026`**

| الدور | البريد |
| --- | --- |
| `platform_admin` | admin@innovatelink.test |
| `platform_coordinator` | coordinator@innovatelink.test |
| `company_admin` (مصنع الخليل الحديث للحجر) | company@innovatelink.test |
| `company_member` | member@innovatelink.test |
| `university_coordinator` (النجاح) | coordinator@najah.test — وأيضاً coordinator@birzeit.test, coordinator@ppu.test, coordinator@aaup.test |
| `researcher` (بوليتكنك فلسطين) | researcher@ppu.test |
| `student` | student@ppu.test (وstudent@najah.test …) |
| حسابات بانتظار الاعتماد | pending.company@innovatelink.test, pending.student@najah.test |

ممثلو الشركات الأخرى: `admin@<company-key>.test` مثل admin@bethlehem-marble.test و admin@shifa-labs.test.

البيانات: 4 جامعات، 12 شركة في 5 قطاعات بمدن مختلفة في الضفة الغربية، 16 تحدياً (منها 3 سرية و3 مقيدة بجامعات وواحد قيد المراجعة ومسودة)، 60 مشروعاً بمستويات TRL متنوعة، 20 باحثاً، 8 مختبرات، مطابقات مُولّدة، مساحة تعاون نشطة وأخرى مكتملة، وثلاث حالات تسويق.

## الاختبارات

```bash
npm test                 # Vitest: وحدات + خدمات على قاعدة اختبار (innovatelink_test)، مزود AI وهمي
npm run test:coverage    # يفرض 100% على policy.ts و70% على service.ts
npm run build && npm start   # ثم:
npm run test:e2e         # Playwright: المسارات الخمسة الحرجة بعرض 360px (يعيد البذر)
npm run i18n:check       # مفاتيح ترجمة ناقصة
npm run openapi          # يولّد openapi.yaml من مخططات Zod
```

الاختبارات لا تحتاج مفاتيح API (`LLM_PROVIDER=mock`). تعيّن `TEST_DATABASE_URL` قاعدة الاختبار (الافتراضي `postgresql://innovate:innovate@localhost:5432/innovatelink_test`).

معايير القبول المغطاة بالاختبارات تحمل رقم المتطلب في اسم الاختبار، منها: 403 لمستخدم من مؤسسة غير مدرجة على تحدٍّ `selected_orgs`؛ محرك المطابقة لا يعيد حقولاً سرية؛ تحدي مخلفات الحجر يعيد مشروع إعادة تدوير مخلفات البناء ضمن أول 3؛ لا انتقال إلى `confirmed` دون ثلاثة أفعال بشرية؛ البحث الدلالي بعبارة «معالجة مياه الصرف الصناعي»؛ استيراد 200 صف في أقل من دقيقة؛ 404 لغير الأعضاء في المساحة؛ PDF عربي RTL.

## المعمارية

```
src/
  app/[locale]/(public|auth|dashboard)/...   صفحات (Server Components)
  app/api/v1/...                             REST (route handlers) — كل نقطة تتحقق من الصلاحية على الخادم
  modules/<module>/{service,policy,schema}.ts
  lib/{ai,db,storage,mail,audit,i18n,auth,api,jobs,pdf,log}/
  worker/                                    pg-boss workers
prisma/{schema.prisma,seed.ts,migrations}
messages/{ar,en}.json
```

- **الصلاحيات**: كل شرط صلاحية في `modules/*/policy.ts` (دوال نقية مغطاة 100%). الخدمات تستدعيها؛ إخفاء الأزرار في الواجهة ليس حماية.
- **AI**: كل الاستدعاءات عبر `lib/ai` (`generateStructured`, `embed`). المزوّد من `LLM_PROVIDER` (`mock` | `openai` (أي واجهة متوافقة) | `anthropic`) و`EMBEDDING_PROVIDER`. كل استدعاء يُسجَّل في `AiRun`، مع حد يومي لكل مستخدم وتخزين مؤقت حسب hash المدخل، وإعادة طلب واحدة عند عدم مطابقة المخطط. لا يوجد استدعاء AI يكتب في حقل `status`.
- **السرية مع AI**: `AI_ALLOW_CONFIDENTIAL=false` افتراضياً، فلا يُرسل من التحدي السري إلا `public_title` والفئة. **عدم الاحتفاظ/التدريب**: يرسل محوّل OpenAI `store: false`؛ واجهة Anthropic لا تستخدم بيانات API للتدريب افتراضياً. فعّل اتفاقيات Zero Data Retention مع المزوّد عند الإنتاج.
- **الملفات**: رفع وتنزيل مباشران عبر presigned URLs (تنتهي روابط التنزيل خلال 5 دقائق)، فحص نوع MIME الفعلي من البايتات الأولى، تدقيق تنزيل ملفات الكيانات غير العامة.
- **الأمان**: argon2id، قفل بعد 5 محاولات، جلسات قاعدة بيانات في كوكي HttpOnly/SameSite=Lax/Secure وتنتهي بعد 7 أيام خمول، rate limiting على `/auth/*` و`/assistant/*`، فحص Origin ضد CSRF، ترويسات CSP، `AuditLog` إلحاقي فقط (trigger في قاعدة البيانات).

## النشر والصيانة

- **النسخ الاحتياطي**: خدمة `backup` في docker-compose تنشئ `backups/innovatelink-YYYY-MM-DD.sql.gz` يومياً وتحذف ما يزيد عن 30 يوماً. **الاستعادة**:
  ```bash
  docker compose stop app worker
  gunzip -c backups/innovatelink-2026-10-11.sql.gz | docker compose exec -T db psql -U innovate -d innovatelink
  docker compose start app worker
  ```
  انسخ مجلد `backups/` وحجم MinIO إلى خادم آخر دورياً.
- **المراقبة**: سجلات JSON منظّمة، `GET /api/health`، وإرسال الأخطاء إلى Sentry عند ضبط `SENTRY_DSN`.
- **البريد**: SMTP عبر Nodemailer (`SMTP_*`). المهام تُرسل من الـ worker.
- **إعادة الفهرسة**: عند تغيير نموذج الـ embeddings أو `EMBEDDING_DIM`: لوحة الإدارة ← الإعدادات ← «إعادة الفهرسة».

## قيود معروفة

- محوّلات المزودين الحقيقيين (OpenAI-compatible/Anthropic) مكتوبة لكنها **لم تُختبر على مفاتيح حقيقية** في هذه البيئة؛ كل الاختبارات تعمل على المزوّد الوهمي.
- **لم يُجرَ** تقييم نموذجي embeddings على العربية (مخاطرة في القسم 11) لعدم توفر مفاتيح؛ الإجراء موثق في `DECISIONS.md` (D-12).
- أهداف الأداء (2.5 ثانية، 800ms عند 5,000 مشروع) لم تُقس باختبار حمل. عمود المتجه بلا بُعد ثابت فلا يوجد فهرس HNSW (مسح كامل مناسب لحجم MVP)؛ انظر D-9.
- إمكانية الوصول: تسميات النماذج والتنقل بلوحة المفاتيح وتباين الألوان مراعاة، لكن لم يُجرَ تدقيق WCAG آلي كامل.
