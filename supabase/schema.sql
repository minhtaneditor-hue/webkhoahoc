-- AI-Integrated LMS Database Schema (EE Academy Architecture)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users & Profiles
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  role text check (role in ('admin', 'student')) default 'student',
  full_name text,
  avatar_url text,
  funnel_status text default 'new', -- e.g., 'new', 'lead', 'enrolled', 'loyal'
  referral_source text, -- e.g., 'facebook', 'youtube', 'direct'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Course Infrastructure
create table if not exists public.courses (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  description text,
  price numeric not null default 0,
  old_price numeric,
  thumbnail_url text,
  is_published boolean default false,
  instructor_id uuid references public.users(id) on delete set null,
  seo_title text,
  seo_description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Hierarchical Chapters (EE Academy Style)
create table if not exists public.chapters (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  order_index integer not null,
  is_published boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Lessons Table (Hierarchical under Chapters)
create table if not exists public.lessons (
  id uuid default uuid_generate_v4() primary key,
  chapter_id uuid references public.chapters(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null, -- Redundant but useful for simple queries
  title text not null,
  video_url text, -- HLS / DRM URL
  video_id text, -- Custom Video ID for tracking
  duration_seconds integer default 0,
  order_index integer not null,
  content text,
  is_free boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Student Progress Tracking (Advanced Stats)
create table if not exists public.student_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  watched_seconds integer default 0,
  is_completed boolean default false,
  last_watched_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, lesson_id)
);

-- 4. Enrollments & Sales
create table if not exists public.enrollments (
  user_id uuid references public.users(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  status text check (status in ('active', 'expired', 'paused')) default 'active',
  enrolled_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, course_id)
);

create table if not exists public.payments (
  id uuid default uuid_generate_v4() primary key,
  order_id text unique not null,
  user_id uuid references public.users(id) on delete set null,
  course_id uuid references public.courses(id) on delete set null,
  amount numeric not null,
  transaction_id text,
  payment_method text, -- 'vnpay', 'momo', 'bank_transfer'
  status text check (status in ('pending', 'success', 'failed')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Site Configuration (Admin Controls)
create table if not exists public.site_settings (
  key text primary key,
  value text,
  description text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. RLS (Row Level Security) Configuration
alter table public.users enable row level security;
alter table public.courses enable row level security;
alter table public.chapters enable row level security;
alter table public.lessons enable row level security;
alter table public.student_progress enable row level security;
alter table public.enrollments enable row level security;
alter table public.payments enable row level security;
alter table public.site_settings enable row level security;

-- Policies (Simplified for Admin access)
create policy "Anyone can view published courses" on public.courses for select using (is_published = true);
create policy "Admins can manage courses" on public.courses for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

create policy "Admins can manage chapters" on public.chapters for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

create policy "Admins can manage lessons" on public.lessons for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

create policy "Users can update their own progress" on public.student_progress for all using (user_id = auth.uid());
create policy "Admins can view all progress" on public.student_progress for select using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

create policy "Users can view their own payments" on public.payments for select using (user_id = auth.uid());
create policy "Admins can manage payments" on public.payments for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);
