-- اختبارات سياسات RLS: أسرة مباشرة دون مدرسة، ثم ربط بصف ثم فك الارتباط.
-- G1/G2 = أولياء أمور لأسرتين، T1 = معلمة الصف C1، T2 = معلمة صف آخر.

\set g1 '''11111111-1111-1111-1111-111111111111'''
\set g2 '''22222222-2222-2222-2222-222222222222'''
\set t1 '''33333333-3333-3333-3333-333333333333'''
\set t2 '''44444444-4444-4444-4444-444444444444'''

create or replace function pg_temp.check(ok boolean, msg text) returns void
language plpgsql as $$ begin
  if not ok then raise exception 'FAILED: %', msg; end if;
end $$;

-- ── إعداد بصلاحية المشرف ──
insert into auth.users values (:g1), (:g2), (:t1), (:t2);
insert into schools (id, name, kind) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'مدرسة البيرة الأساسية', 'government');
insert into classes (id, school_id, grade, section, school_year, join_code) values
  ('cccccccc-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 2, 'أ', '2026/2027', 'ABC123'),
  ('cccccccc-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 2, 'ب', '2026/2027', 'XYZ789');
insert into teachers (id, user_id, school_id, display_name) values
  ('dddddddd-0000-0000-0000-000000000001', :t1, 'aaaaaaaa-0000-0000-0000-000000000001', 'أ. منى'),
  ('dddddddd-0000-0000-0000-000000000002', :t2, 'aaaaaaaa-0000-0000-0000-000000000001', 'أ. سعاد');
insert into teacher_classes values
  ('dddddddd-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001'),
  ('dddddddd-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000002');
insert into texts (id, level, kind, title, body, published) values
  ('l1-ahmad-draws', 1, 'practice', 'أَحْمَدُ يَرْسُمُ', 'أَخَذَ أَحْمَدُ القَلَمَ.', true),
  ('draft', 1, 'practice', 'مسودة', '...', false);

set role authenticated;

-- ── G1: أسرة مباشرة دون مدرسة ──
select set_config('request.jwt.claim.sub', :g1, false);
select create_family('+970590000001') as fam_g1 \gset
select set_config('my.fam_g1', :'fam_g1', false);
select create_family('+970590000001') = :'fam_g1' as same_family \gset
select pg_temp.check(:'same_family'::boolean, 'create_family is idempotent');
insert into children (family_id, first_name, avatar, grade)
  values (:'fam_g1', 'ليان', '🦋', 2) returning id as child_a \gset
select set_config('my.child_a', :'child_a', false);
insert into sessions (child_id, text_id, kind, duration_ms, wcpm, accuracy)
  values (:'child_a', 'l1-ahmad-draws', 'practice', 60000, 32, 0.94) returning id as session_a \gset
insert into word_attempts (session_id, position, verdict, error_type, heard)
  values (:'session_a', 0, 'error', 'dialectal', 'أَخَدَ') returning id as attempt_a \gset
select set_config('my.attempt_a', :'attempt_a', false);
-- لا RETURNING: التسجيلات غير قابلة للقراءة المباشرة حتى لصاحبها.
select gen_random_uuid() as clip_a \gset
insert into audio_clips (id, session_id, storage_path, duration_ms)
  values (:'clip_a', :'session_a', 'audio/a.opus', 60000);
select set_config('my.clip_a', :'clip_a', false);
select pg_temp.check((select count(*) from children) = 1, 'G1 sees own child');
select pg_temp.check((select count(*) from subscriptions where status = 'trial') = 1, 'G1 has a trial');
select pg_temp.check((select count(*) from texts) = 1, 'only published texts are visible');
select pg_temp.check((select count(*) from audio_clips) = 0, 'clips are not directly readable');
select pg_temp.check(open_audio_clip(:'clip_a') = 'audio/a.opus', 'G1 opens own clip');

-- ── G2: أسرة أخرى ──
select set_config('request.jwt.claim.sub', :g2, false);
select create_family('+970590000002') as fam_g2 \gset
select pg_temp.check((select count(*) from children) = 0, 'G2 cannot see G1 child');
select pg_temp.check((select count(*) from sessions) = 0, 'G2 cannot see G1 sessions');
select pg_temp.check((select count(*) from subscriptions) = 1, 'G2 sees only own subscription');
do $$ begin
  insert into children (family_id, first_name, avatar, grade)
    values (current_setting('my.fam_g1')::uuid, 'x', '🐼', 1);
  raise exception 'FAILED: G2 inserted into G1 family';
exception when insufficient_privilege or others then
  if sqlerrm like 'FAILED%' then raise; end if;
end $$;
do $$ begin
  perform join_class(current_setting('my.child_a')::uuid, 'ABC123');
  raise exception 'FAILED: G2 linked G1 child';
exception when others then
  if sqlerrm like 'FAILED%' then raise; end if;
end $$;

-- ── T1 قبل الربط: لا يرى الطفل المسجّل مباشرة ──
select set_config('request.jwt.claim.sub', :t1, false);
select pg_temp.check((select count(*) from children) = 0, 'teacher cannot see a direct-family child');
select pg_temp.check((select count(*) from classes) = 1, 'teacher sees only own class');

-- ── G1 يربط طفله بصف T1 ──
select set_config('request.jwt.claim.sub', :g1, false);
select join_class(:'child_a', ' abc123 ') as enrollment \gset
select pg_temp.check((select count(*) from consents where kind = 'school_share') = 1, 'share consent recorded');

select set_config('request.jwt.claim.sub', :t1, false);
select pg_temp.check((select count(*) from children) = 1, 'T1 sees linked child');
select pg_temp.check((select count(*) from sessions) = 1, 'T1 sees history from before linking');
select pg_temp.check((select count(*) from word_attempts) = 1, 'T1 sees word attempts');
update children set first_name = 'تغيير' where id = :'child_a';
select pg_temp.check((select first_name from children where id = :'child_a') = 'ليان', 'teacher cannot edit child');
update word_attempts set verdict = 'correct' where id = :'attempt_a';
select pg_temp.check((select verdict from word_attempts where id = :'attempt_a') = 'error', 'no direct attempt edits');
select correct_word_attempt(:'attempt_a', 'correct');
select pg_temp.check((select teacher_verdict from word_attempts where id = :'attempt_a') = 'correct', 'T1 corrects verdict');
select pg_temp.check(open_audio_clip(:'clip_a') = 'audio/a.opus', 'T1 opens linked child clip');

select set_config('request.jwt.claim.sub', :t2, false);
select pg_temp.check((select count(*) from children) = 0, 'T2 cannot see child of another class');
do $$ begin
  perform correct_word_attempt(current_setting('my.attempt_a')::uuid, 'error');
  raise exception 'FAILED: T2 corrected another class';
exception when others then
  if sqlerrm like 'FAILED%' then raise; end if;
end $$;

-- ── G1 يفك الارتباط ──
select set_config('request.jwt.claim.sub', :g1, false);
update class_enrollments set ended_at = now() where id = :'enrollment';
select set_config('request.jwt.claim.sub', :t1, false);
select pg_temp.check((select count(*) from children) = 0, 'unlinking revokes teacher access');
do $$ begin
  perform open_audio_clip(current_setting('my.clip_a')::uuid);
  raise exception 'FAILED: T1 opened clip after unlink';
exception when others then
  if sqlerrm like 'FAILED%' then raise; end if;
end $$;

-- ── حق الحذف ──
select set_config('request.jwt.claim.sub', :g1, false);
delete from children where id = :'child_a';
reset role;
select pg_temp.check((select count(*) from sessions where child_id = :'child_a') = 0, 'deleting child cascades sessions');
select pg_temp.check((select count(*) from audio_access_log) = 2, 'clip access audited');
