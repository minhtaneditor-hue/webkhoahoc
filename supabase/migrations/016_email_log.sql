-- =====================================================================
-- 016_email_log.sql
-- Email sequences (/api/cron/reminders): every automated email is logged so
-- it goes out once, and people who unsubscribe (/api/unsubscribe) stop
-- receiving reminder and marketing emails. Written with the service role;
-- only admins can read. Safe to run more than once.
-- =====================================================================
create table if not exists public.email_log (
  id bigint generated always as identity primary key,
  email text not null,            -- lower-case
  kind text not null,             -- e.g. onboard-2, inactive, lead-2
  ref text not null default '',   -- course id, or a time bucket for repeating emails
  sent_at timestamp with time zone default now() not null,
  unique (email, kind, ref)
);
alter table public.email_log enable row level security;
drop policy if exists "Admins read email log" on public.email_log;
create policy "Admins read email log" on public.email_log for select using (public.is_admin());

create table if not exists public.email_optouts (
  email text primary key,         -- lower-case
  created_at timestamp with time zone default now() not null
);
alter table public.email_optouts enable row level security;
drop policy if exists "Admins read email optouts" on public.email_optouts;
create policy "Admins read email optouts" on public.email_optouts for select using (public.is_admin());
