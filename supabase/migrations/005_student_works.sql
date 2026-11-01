-- =====================================================================
-- 005_student_works.sql
-- Showcase of former students' work, with optional before / after.
-- Each side is a video link (YouTube, TikTok, Facebook, Instagram, Drive)
-- or an image URL; thumbnails are optional (YouTube ones are automatic).
-- Safe to run more than once. Requires 002 (public.is_admin()).
-- =====================================================================

create table if not exists public.student_works (
  id uuid default uuid_generate_v4() primary key,
  student_name text not null,
  student_title text,            -- job / brand, e.g. "Founder Chú Lùn Bakery"
  avatar_url text,
  title text not null,           -- what this piece is, e.g. "Video giới thiệu tiệm bánh"
  description text,
  result text,                   -- headline result, e.g. "1,2 triệu view"
  category text default 'short-video',
  orientation text not null default 'vertical' check (orientation in ('vertical', 'horizontal')),
  before_url text,
  before_thumbnail_url text,
  after_url text,
  after_thumbnail_url text,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.student_works enable row level security;

drop policy if exists "Anyone can view student works" on public.student_works;
create policy "Anyone can view student works" on public.student_works for select using (true);
drop policy if exists "Admins can manage student works" on public.student_works;
create policy "Admins can manage student works" on public.student_works for all using (public.is_admin());

-- Where students live (shown on the world map). `country` is an ISO 3166-1
-- alpha-2 code such as 'VN', 'US', 'AU'; `city` is free text.
alter table public.student_works add column if not exists country text;
alter table public.student_works add column if not exists city text;
alter table public.students add column if not exists country text;
alter table public.students add column if not exists city text;
