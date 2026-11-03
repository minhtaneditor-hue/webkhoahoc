-- =====================================================================
-- 019_course_reviews.sql
-- Star ratings and comments under each course. Only enrolled students can
-- write (checked by /api/reviews with the service role), one review per
-- student per course, editable. Everyone reads visible reviews; admins can
-- hide or delete in Admin > Đánh giá khóa học. Safe to run more than once.
-- =====================================================================
create table if not exists public.course_reviews (
  id bigint generated always as identity primary key,
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  author_name text not null,       -- shown publicly, copied from the profile at write time
  rating smallint not null check (rating between 1 and 5),
  comment text,
  is_hidden boolean not null default false,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  unique (course_id, user_id)
);
create index if not exists course_reviews_course_idx on public.course_reviews (course_id, created_at desc);
alter table public.course_reviews enable row level security;

drop policy if exists "Anyone reads visible reviews" on public.course_reviews;
create policy "Anyone reads visible reviews" on public.course_reviews for select using (is_hidden = false);
drop policy if exists "Admins manage reviews" on public.course_reviews;
create policy "Admins manage reviews" on public.course_reviews for all using (public.is_admin()) with check (public.is_admin());
