-- 022: each Trước / Sau side can hold more pictures than its main one.
-- Pair 1's extra pictures live here; pairs 2+ keep theirs inside extra_pairs (same key names).
alter table public.student_works add column if not exists before_more jsonb;
alter table public.student_works add column if not exists after_more jsonb;
notify pgrst, 'reload schema';
