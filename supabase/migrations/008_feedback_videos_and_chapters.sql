-- =====================================================================
-- 008_feedback_videos_and_chapters.sql
-- 1. feedback_videos: students talking about the course and the teacher.
-- 2. Chapters: courses are split into chapters, lessons belong to one.
-- Safe to run more than once. Requires 002 (public.is_admin()).
-- =====================================================================

-- 1. Video feedback ---------------------------------------------------
create table if not exists public.feedback_videos (
  id uuid default uuid_generate_v4() primary key,
  student_name text not null,
  student_title text,
  country text,                  -- ISO alpha-2, e.g. 'VN', 'US'
  quote text,                    -- one-line takeaway shown on the card
  video_url text not null,       -- YouTube / TikTok / Facebook / Drive / mp4
  thumbnail_url text,
  orientation text not null default 'vertical' check (orientation in ('vertical', 'horizontal')),
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.feedback_videos enable row level security;
drop policy if exists "Anyone can view feedback videos" on public.feedback_videos;
create policy "Anyone can view feedback videos" on public.feedback_videos for select using (true);
drop policy if exists "Admins can manage feedback videos" on public.feedback_videos;
create policy "Admins can manage feedback videos" on public.feedback_videos for all using (public.is_admin());

-- 2. Chapters ----------------------------------------------------------
create table if not exists public.chapters (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  order_index integer not null default 0,
  is_published boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.chapters alter column order_index set default 0;
alter table public.chapters enable row level security;
drop policy if exists "Anyone can view chapters" on public.chapters;
create policy "Anyone can view chapters" on public.chapters for select using (true);
drop policy if exists "Admins can manage chapters" on public.chapters;
create policy "Admins can manage chapters" on public.chapters for all using (public.is_admin());

-- A lesson may sit outside any chapter; deleting a chapter keeps its lessons.
alter table public.lessons add column if not exists chapter_id uuid;
alter table public.lessons alter column chapter_id drop not null;
alter table public.lessons drop constraint if exists lessons_chapter_id_fkey;
alter table public.lessons add constraint lessons_chapter_id_fkey
  foreign key (chapter_id) references public.chapters(id) on delete set null;
