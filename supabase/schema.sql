-- AI-Integrated LMS Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users Table (Extended profiles for Supabase Auth)
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  role text check (role in ('admin', 'student')) default 'student',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Courses Table
create table if not exists public.courses (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  price numeric not null default 0,
  instructor_id uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Lessons Table
create table if not exists public.lessons (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  video_provider_id text, -- DRM ID (e.g., from your custom DRM server)
  order_index integer not null,
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enrollments Table
create table if not exists public.enrollments (
  user_id uuid references public.users(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  status text check (status in ('active', 'expired')) default 'active',
  enrolled_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, course_id)
);

-- Payments Table
create table if not exists public.payments (
  id uuid default uuid_generate_v4() primary key,
  order_id text unique not null, -- VNPay/MoMo order_id
  user_id uuid references public.users(id) on delete set null,
  course_id uuid references public.courses(id) on delete set null,
  amount numeric not null,
  transaction_id text,
  status text check (status in ('pending', 'success', 'failed')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) Configuration
alter table public.users enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.payments enable row level security;

-- Policies for Courses
create policy "Anyone can view courses" on public.courses for select using (true);
create policy "Admins can manage courses" on public.courses for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- Policies for Lessons
create policy "Enrolled students can view lessons" on public.lessons for select using (
  exists (
    select 1 from public.enrollments 
    where user_id = auth.uid() 
    and course_id = public.lessons.course_id 
    and status = 'active'
  )
  or exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);
create policy "Admins can manage lessons" on public.lessons for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- Policies for Enrollments
create policy "Users can view their own enrollments" on public.enrollments for select using (user_id = auth.uid());
create policy "Admins can manage enrollments" on public.enrollments for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- Policies for Payments
create policy "Users can view their own payments" on public.payments for select using (user_id = auth.uid());
create policy "Admins can manage payments" on public.payments for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);
