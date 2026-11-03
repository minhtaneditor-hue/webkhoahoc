-- 021: a student work can hold more than one Trước / Sau pair.
-- Pair 1 stays in before_url / before_thumbnail_url / after_url / after_thumbnail_url;
-- pairs 2+ are stored here as [{ before_url, before_thumbnail_url, after_url, after_thumbnail_url }, ...].
alter table public.student_works add column if not exists extra_pairs jsonb not null default '[]'::jsonb;
