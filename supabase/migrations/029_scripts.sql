-- 029: scripts written by the "Viết kịch bản" tool (/viet-kich-ban).
-- One row per finished script; the row count is also the usage count
-- (free: all time, members: this calendar month). Written by the server with the service role.
-- Safe to run more than once.
create table if not exists public.scripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  dang text not null,        -- video format, e.g. ban-hang
  khung text not null,       -- story framework, e.g. pas
  tieu_de text not null default '',
  input jsonb not null default '{}'::jsonb,    -- what the user typed and answered
  content jsonb not null default '{}'::jsonb,  -- the finished script
  created_at timestamptz not null default now()
);
create index if not exists scripts_user_created_idx on public.scripts (user_id, created_at desc);

alter table public.scripts enable row level security;

drop policy if exists "Users read own scripts" on public.scripts;
create policy "Users read own scripts" on public.scripts for select using (auth.uid() = user_id);

drop policy if exists "Admins read scripts" on public.scripts;
create policy "Admins read scripts" on public.scripts for select using (public.is_admin());

notify pgrst, 'reload schema';
