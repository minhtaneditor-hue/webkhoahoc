-- =====================================================================
-- 002_fix_schema.sql
-- Run AFTER schema.sql in Supabase → SQL Editor. Safe to run more than once.
-- Adds the tables/columns the app code uses and the RLS policies it needs.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Helper: is the current user an admin? (security definer avoids
--    infinite recursion when policies on public.users check public.users)
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'admin');
$$;

-- ---------------------------------------------------------------------
-- 1. Users: profile row created automatically on sign-up
-- ---------------------------------------------------------------------
alter table public.users add column if not exists last_active_at timestamp with time zone;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill users who signed up before the trigger existed
insert into public.users (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- Promote the owner account to admin
update public.users set role = 'admin' where email = 'minhtaneditor@gmail.com';

drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile" on public.users
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile" on public.users
  for update using (id = auth.uid());

-- Students may only edit these columns (NOT role / funnel_status)
revoke update on public.users from authenticated;
grant update (full_name, avatar_url, last_active_at) on public.users to authenticated;

-- ---------------------------------------------------------------------
-- 2. Courses / chapters / lessons
-- ---------------------------------------------------------------------
drop policy if exists "Anyone can view chapters" on public.chapters;
create policy "Anyone can view chapters" on public.chapters for select using (true);

-- Full lesson rows (incl. video_url) only for free lessons, enrolled students, or admins
drop policy if exists "Enrolled users can view lessons" on public.lessons;
create policy "Enrolled users can view lessons" on public.lessons
  for select using (
    is_free
    or public.is_admin()
    or exists (
      select 1 from public.enrollments e
      where e.user_id = auth.uid() and e.course_id = lessons.course_id and e.status = 'active'
    )
  );

-- Public curriculum for the sales page: titles for everyone, video only for free previews.
-- Views run with the owner's rights, so this intentionally bypasses lessons RLS.
create or replace view public.lesson_outline as
  select l.id, l.course_id, l.chapter_id, l.title, l.order_index, l.duration_seconds, l.is_free,
         case when l.is_free then l.video_url end as video_url
  from public.lessons l
  join public.courses c on c.id = l.course_id
  where c.is_published = true;
grant select on public.lesson_outline to anon, authenticated;

-- ---------------------------------------------------------------------
-- 3. Progress & enrollments
-- ---------------------------------------------------------------------
alter table public.enrollments add column if not exists expires_at timestamp with time zone;
alter table public.enrollments add column if not exists progress_percent integer default 0;

drop policy if exists "Users can view own enrollments" on public.enrollments;
create policy "Users can view own enrollments" on public.enrollments
  for select using (user_id = auth.uid());

drop policy if exists "Admins can manage enrollments" on public.enrollments;
create policy "Admins can manage enrollments" on public.enrollments
  for all using (public.is_admin());

-- ---------------------------------------------------------------------
-- 4. Digital shop (ebooks, presets, LUTs, templates...)
-- ---------------------------------------------------------------------
create table if not exists public.digital_assets (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  price numeric not null default 0,
  thumbnail_url text,
  download_url text,           -- private: only returned by /api/shop/download to buyers
  category text default 'preset',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.digital_assets enable row level security;

drop policy if exists "Admins can manage digital assets" on public.digital_assets;
create policy "Admins can manage digital assets" on public.digital_assets
  for all using (public.is_admin());

create or replace view public.digital_assets_public as
  select id, title, description, price, thumbnail_url, category, created_at
  from public.digital_assets;
grant select on public.digital_assets_public to anon, authenticated;

alter table public.payments add column if not exists asset_id uuid references public.digital_assets(id) on delete set null;

-- ---------------------------------------------------------------------
-- 5. Public showcase content (portfolio + student stories) & settings
-- ---------------------------------------------------------------------
create table if not exists public.projects (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  thumbnail_url text,
  video_url text,
  category text,
  client_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.projects enable row level security;

create table if not exists public.students (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  title text,
  quote text,
  results text,
  story text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.students enable row level security;

alter table public.site_settings add column if not exists "group" text default 'general';

drop policy if exists "Anyone can view projects" on public.projects;
create policy "Anyone can view projects" on public.projects for select using (true);
drop policy if exists "Admins can manage projects" on public.projects;
create policy "Admins can manage projects" on public.projects for all using (public.is_admin());

drop policy if exists "Anyone can view students" on public.students;
create policy "Anyone can view students" on public.students for select using (true);
drop policy if exists "Admins can manage students" on public.students;
create policy "Admins can manage students" on public.students for all using (public.is_admin());

drop policy if exists "Anyone can view site settings" on public.site_settings;
create policy "Anyone can view site settings" on public.site_settings for select using (true);
drop policy if exists "Admins can manage site settings" on public.site_settings;
create policy "Admins can manage site settings" on public.site_settings for all using (public.is_admin());
