-- 010_students_facebook.sql: Facebook link on "Học viên tiêu biểu" (testimonials). Safe to re-run.
alter table public.students add column if not exists facebook_url text;
