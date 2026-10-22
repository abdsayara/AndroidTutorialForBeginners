-- فَصيح: المخطط الأساسي (القسم 8.3 من وثيقة المنتج).
-- مبدأ القناتين: الطفل ينتمي إلى أسرة دائماً، وارتباطه بصف مدرسي اختياري
-- ويحتاج موافقة صريحة من ولي الأمر (class_enrollments).

create extension if not exists pgcrypto;

-- ───────────────────────── المدارس ─────────────────────────

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null check (kind in ('school', 'directorate', 'funder')),
  country text not null default 'PS',
  created_at timestamptz not null default now()
);

create table schools (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations (id) on delete set null,
  name text not null,
  governorate text,
  kind text not null check (kind in ('government', 'unrwa', 'private')),
  created_at timestamptz not null default now()
);

create table classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools (id) on delete cascade,
  grade smallint not null check (grade between 1 and 4),
  section text not null default '',
  school_year text not null,
  -- «رمز الصف» الذي تعطيه المعلمة للأهل (P-09).
  join_code text not null unique default upper(substr(md5(gen_random_uuid()::text), 1, 6)),
  created_at timestamptz not null default now()
);

create table teachers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  school_id uuid not null references schools (id) on delete cascade,
  display_name text not null
);

create table teacher_classes (
  teacher_id uuid not null references teachers (id) on delete cascade,
  class_id uuid not null references classes (id) on delete cascade,
  primary key (teacher_id, class_id)
);

-- ───────────────────────── الأسر والأطفال ─────────────────────────

create table guardians (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  phone text not null,
  language text not null default 'ar',
  reminder_time time,
  created_at timestamptz not null default now()
);

create table families (
  id uuid primary key default gen_random_uuid(),
  owner_guardian_id uuid not null references guardians (id) on delete cascade,
  country text not null default 'PS',
  created_at timestamptz not null default now()
);

create table family_guardians (
  family_id uuid not null references families (id) on delete cascade,
  guardian_id uuid not null references guardians (id) on delete cascade,
  primary key (family_id, guardian_id)
);

create table children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families (id) on delete cascade,
  -- تقليل البيانات (القسم 9): الاسم الأول، صورة رمزية، شهر وسنة الميلاد فقط.
  first_name text not null check (length(first_name) between 1 and 40),
  avatar text not null,
  grade smallint not null check (grade between 1 and 4),
  current_level smallint check (current_level between 1 and 5),
  birth_year smallint,
  birth_month smallint check (birth_month between 1 and 12),
  created_at timestamptz not null default now()
);

create table class_enrollments (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children (id) on delete cascade,
  class_id uuid not null references classes (id) on delete cascade,
  consented_by uuid not null references guardians (id),
  consented_at timestamptz not null default now(),
  ended_at timestamptz
);

create unique index one_active_enrollment_per_class
  on class_enrollments (child_id, class_id) where ended_at is null;

create table consents (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references guardians (id) on delete cascade,
  child_id uuid references children (id) on delete cascade,
  kind text not null check (kind in ('app', 'training_audio', 'school_share')),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families (id) on delete cascade,
  school_id uuid references schools (id) on delete cascade,
  plan text not null check (plan in ('free', 'family_monthly', 'family_yearly', 'school_license')),
  status text not null check (status in ('trial', 'active', 'expired', 'cancelled')),
  provider text,
  provider_ref text,
  renews_at timestamptz,
  created_at timestamptz not null default now(),
  check ((family_id is null) <> (school_id is null))
);

-- ───────────────────────── المحتوى ─────────────────────────

create table texts (
  id text primary key,
  level smallint not null check (level between 1 and 5),
  kind text not null check (kind in ('practice', 'placement', 'benchmark')),
  title text not null,
  body text not null,
  audio_path text,
  metadata jsonb not null default '{}',
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table text_words (
  id uuid primary key default gen_random_uuid(),
  text_id text not null references texts (id) on delete cascade,
  position int not null,
  word text not null,
  phonemes text,
  distance_category text check (distance_category in ('identical', 'cognate', 'fusha_specific')),
  dialect_equivalent text,
  unique (text_id, position)
);

-- ───────────────────────── الجلسات ─────────────────────────

create table sessions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children (id) on delete cascade,
  text_id text not null references texts (id),
  kind text not null check (kind in ('practice', 'placement', 'benchmark')),
  started_at timestamptz not null default now(),
  duration_ms int not null check (duration_ms >= 0),
  wcpm numeric(6, 2),
  accuracy numeric(5, 4) check (accuracy between 0 and 1),
  comprehension_correct smallint not null default 0,
  comprehension_total smallint not null default 0,
  stars smallint not null default 0,
  audio_quality numeric(4, 3),
  -- لا تُحتسب في التقييم إن اكتُشف قارئ آخر (القسم 4).
  speaker_changed boolean not null default false
);

create index sessions_child_started on sessions (child_id, started_at desc);

create table word_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions (id) on delete cascade,
  position int not null,
  verdict text not null check (verdict in ('correct', 'error', 'not_reached')),
  error_type text check (error_type in
    ('substitution', 'omission', 'insertion', 'internal_vowel', 'final_vowel', 'dialectal')),
  heard text,
  start_ms int,
  end_ms int,
  confidence numeric(4, 3),
  self_corrected boolean not null default false,
  hesitated boolean not null default false,
  -- تصحيح المعلمة (T-06) يُعلَّم كبيانات تدريب.
  teacher_verdict text check (teacher_verdict in ('correct', 'error')),
  teacher_error_type text,
  corrected_by uuid references teachers (id),
  corrected_at timestamptz
);

create table comprehension_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions (id) on delete cascade,
  question_index smallint not null,
  answer smallint not null,
  correct boolean not null
);

create table audio_clips (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions (id) on delete cascade,
  storage_path text not null,
  duration_ms int not null,
  training_consent boolean not null default false,
  -- يُحذف بعد 90 يوماً ما لم يوافق الأهل على التدريب (القسم 9).
  delete_after date default (current_date + 90),
  created_at timestamptz not null default now()
);

create table audio_access_log (
  id bigint generated always as identity primary key,
  -- دون مفتاح أجنبي: سجل التدقيق يبقى بعد حذف التسجيل.
  clip_id uuid not null,
  user_id uuid not null,
  accessed_at timestamptz not null default now()
);

create table weekly_reports (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children (id) on delete cascade,
  week_start date not null,
  metrics jsonb not null,
  pdf_path text,
  audio_path text,
  unique (child_id, week_start)
);

-- ───────────────────────── دوال الصلاحيات ─────────────────────────

create function current_guardian_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from guardians where user_id = auth.uid()
$$;

create function current_teacher_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from teachers where user_id = auth.uid()
$$;

create function is_family_member(fid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from family_guardians fg
    where fg.family_id = fid and fg.guardian_id = current_guardian_id()
  )
$$;

create function is_guardian_of(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from children c
    where c.id = cid and is_family_member(c.family_id)
  )
$$;

-- المعلمة ترى الطفل فقط عبر ارتباط نشط بأحد صفوفها وبموافقة ولي الأمر.
create function is_teacher_of(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from class_enrollments e
    join teacher_classes tc on tc.class_id = e.class_id
    where e.child_id = cid
      and e.ended_at is null
      and tc.teacher_id = current_teacher_id()
  )
$$;

create function can_see_child(cid uuid) returns boolean
language sql stable as $$
  select is_guardian_of(cid) or is_teacher_of(cid)
$$;

-- ───────────────────────── RLS ─────────────────────────

alter table organizations enable row level security;
alter table schools enable row level security;
alter table classes enable row level security;
alter table teachers enable row level security;
alter table teacher_classes enable row level security;
alter table guardians enable row level security;
alter table families enable row level security;
alter table family_guardians enable row level security;
alter table children enable row level security;
alter table class_enrollments enable row level security;
alter table consents enable row level security;
alter table subscriptions enable row level security;
alter table texts enable row level security;
alter table text_words enable row level security;
alter table sessions enable row level security;
alter table word_attempts enable row level security;
alter table comprehension_answers enable row level security;
alter table audio_clips enable row level security;
alter table audio_access_log enable row level security;
alter table weekly_reports enable row level security;

-- المحتوى المنشور متاح لكل مستخدم مسجّل.
create policy texts_read on texts for select to authenticated using (published);
create policy text_words_read on text_words for select to authenticated
  using (exists (select 1 from texts t where t.id = text_id and t.published));

-- ولي الأمر: سجله وأسرته.
create policy guardians_self on guardians for select to authenticated
  using (user_id = auth.uid());
create policy guardians_self_update on guardians for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy families_member on families for select to authenticated
  using (is_family_member(id));
create policy family_guardians_member on family_guardians for select to authenticated
  using (is_family_member(family_id));

-- الأطفال: الأسرة تقرأ وتكتب وتحذف (حق الحذف)، والمعلمة تقرأ فقط.
create policy children_read on children for select to authenticated
  using (is_family_member(family_id) or is_teacher_of(id));
create policy children_insert on children for insert to authenticated
  with check (is_family_member(family_id));
create policy children_update on children for update to authenticated
  using (is_family_member(family_id)) with check (is_family_member(family_id));
create policy children_delete on children for delete to authenticated
  using (is_family_member(family_id));

-- الارتباط بالصف: يُنشأ عبر join_class() فقط؛ ولي الأمر يفكّه، والمعلمة تراه.
create policy enrollments_read on class_enrollments for select to authenticated
  using (
    is_guardian_of(child_id)
    or exists (select 1 from teacher_classes tc
               where tc.class_id = class_enrollments.class_id
                 and tc.teacher_id = current_teacher_id())
  );
create policy enrollments_unlink on class_enrollments for update to authenticated
  using (is_guardian_of(child_id)) with check (is_guardian_of(child_id));

create policy consents_own on consents for select to authenticated
  using (guardian_id = current_guardian_id());
create policy consents_insert on consents for insert to authenticated
  with check (guardian_id = current_guardian_id()
              and (child_id is null or is_guardian_of(child_id)));
create policy consents_revoke on consents for update to authenticated
  using (guardian_id = current_guardian_id())
  with check (guardian_id = current_guardian_id());

-- الاشتراكات تُكتب من الخادم (service role) بعد التحقق من الدفع.
create policy subscriptions_read on subscriptions for select to authenticated
  using (family_id is not null and is_family_member(family_id));

-- المدرسة: المعلمة ترى مدرستها وصفوفها.
create policy teachers_self on teachers for select to authenticated
  using (user_id = auth.uid());
create policy schools_teacher on schools for select to authenticated
  using (id = (select school_id from teachers where user_id = auth.uid()));
create policy classes_teacher on classes for select to authenticated
  using (exists (select 1 from teacher_classes tc
                 where tc.class_id = classes.id and tc.teacher_id = current_teacher_id()));
create policy teacher_classes_self on teacher_classes for select to authenticated
  using (teacher_id = current_teacher_id());

-- الجلسات ونتائجها.
create policy sessions_read on sessions for select to authenticated
  using (can_see_child(child_id));
create policy sessions_insert on sessions for insert to authenticated
  with check (is_guardian_of(child_id));

create policy attempts_read on word_attempts for select to authenticated
  using (exists (select 1 from sessions s where s.id = session_id and can_see_child(s.child_id)));
create policy attempts_insert on word_attempts for insert to authenticated
  with check (exists (select 1 from sessions s where s.id = session_id and is_guardian_of(s.child_id)));

create policy answers_read on comprehension_answers for select to authenticated
  using (exists (select 1 from sessions s where s.id = session_id and can_see_child(s.child_id)));
create policy answers_insert on comprehension_answers for insert to authenticated
  with check (exists (select 1 from sessions s where s.id = session_id and is_guardian_of(s.child_id)));

-- التسجيلات: لا قراءة مباشرة؛ الوصول عبر open_audio_clip() الذي يسجّل كل استماع.
create policy clips_insert on audio_clips for insert to authenticated
  with check (exists (select 1 from sessions s where s.id = session_id and is_guardian_of(s.child_id)));

create policy reports_read on weekly_reports for select to authenticated
  using (can_see_child(child_id));

-- ───────────────────────── دوال التطبيق ─────────────────────────

-- أول دخول لولي الأمر (رقم هاتف + OTP): ينشئ سجله وأسرته. متكررة بأمان.
create function create_family(p_phone text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  gid uuid;
  fid uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  insert into guardians (user_id, phone) values (auth.uid(), p_phone)
  on conflict (user_id) do update set phone = excluded.phone
  returning id into gid;

  select family_id into fid from family_guardians where guardian_id = gid limit 1;
  if fid is null then
    insert into families (owner_guardian_id) values (gid) returning id into fid;
    insert into family_guardians (family_id, guardian_id) values (fid, gid);
    insert into subscriptions (family_id, plan, status, renews_at)
      values (fid, 'free', 'trial', now() + interval '14 days');
  end if;
  return fid;
end
$$;

-- ربط طفل مسجّل ذاتياً بصف عبر «رمز الصف» (P-09). يسجّل الموافقة على المشاركة.
create function join_class(p_child uuid, p_code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  cls uuid;
  eid uuid;
  gid uuid := current_guardian_id();
begin
  if not is_guardian_of(p_child) then
    raise exception 'not your child';
  end if;
  select id into cls from classes where join_code = upper(trim(p_code));
  if cls is null then
    raise exception 'invalid class code';
  end if;
  insert into class_enrollments (child_id, class_id, consented_by)
    values (p_child, cls, gid)
  on conflict (child_id, class_id) where ended_at is null do nothing
  returning id into eid;
  insert into consents (guardian_id, child_id, kind) values (gid, p_child, 'school_share');
  return coalesce(eid, (select id from class_enrollments
                        where child_id = p_child and class_id = cls and ended_at is null));
end
$$;

-- تصحيح المعلمة لحكم التطبيق على كلمة (T-06). لا تعديل مباشر على الجدول.
create function correct_word_attempt(p_attempt uuid, p_verdict text, p_error_type text default null)
returns void
language plpgsql security definer set search_path = public as $$
declare
  cid uuid;
begin
  select s.child_id into cid from word_attempts w join sessions s on s.id = w.session_id
  where w.id = p_attempt;
  if cid is null or not is_teacher_of(cid) then
    raise exception 'not allowed';
  end if;
  update word_attempts
     set teacher_verdict = p_verdict,
         teacher_error_type = p_error_type,
         corrected_by = current_teacher_id(),
         corrected_at = now()
   where id = p_attempt;
end
$$;

-- فتح تسجيل طفل مع سجل تدقيق (من، متى) — القسم 9.
create function open_audio_clip(p_clip uuid) returns text
language plpgsql security definer set search_path = public as $$
declare
  cid uuid;
  path text;
begin
  select s.child_id, a.storage_path into cid, path
  from audio_clips a join sessions s on s.id = a.session_id where a.id = p_clip;
  if cid is null or not can_see_child(cid) then
    raise exception 'not allowed';
  end if;
  insert into audio_access_log (clip_id, user_id) values (p_clip, auth.uid());
  return path;
end
$$;

-- يُجدول يومياً (pg_cron): يحذف التسجيلات المنتهية دون موافقة تدريب.
-- حذف الملف نفسه من Storage تتولاه دالة طرفية تقرأ المسارات المعادة.
create function purge_expired_audio() returns setof text
language sql security definer set search_path = public as $$
  delete from audio_clips
  where not training_consent and delete_after < current_date
  returning storage_path
$$;

revoke execute on function purge_expired_audio() from public;
