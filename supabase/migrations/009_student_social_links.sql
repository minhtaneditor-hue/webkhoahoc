-- =====================================================================
-- 009_student_social_links.sql
-- Social / fanpage links for each student, shown on the Học viên page.
-- Entered on any one of the student's works (the page groups by name).
-- Safe to run more than once.
-- =====================================================================
alter table public.student_works add column if not exists facebook_url text;
alter table public.student_works add column if not exists tiktok_url text;
alter table public.student_works add column if not exists instagram_url text;
alter table public.student_works add column if not exists youtube_url text;
alter table public.student_works add column if not exists website_url text;
