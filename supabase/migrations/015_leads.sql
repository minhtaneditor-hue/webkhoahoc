-- =====================================================================
-- 015_leads.sql
-- Visitors who leave their email/Zalo for the free checklist (/api/leads).
-- Written by the server with the service role; only admins can read.
-- Safe to run more than once.
-- =====================================================================
create table if not exists public.leads (
  id bigint generated always as identity primary key,
  name text,
  email text not null unique,   -- stored lower-case by /api/leads
  phone text,
  source text,
  created_at timestamp with time zone default now() not null
);
alter table public.leads enable row level security;

drop policy if exists "Admins read leads" on public.leads;
create policy "Admins read leads" on public.leads for select using (public.is_admin());
