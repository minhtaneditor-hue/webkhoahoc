-- =====================================================================
-- 018_consult_requests.sql
-- "Nhận tư vấn" boxes under prices and the free Audit booking (/api/consult).
-- Written by the server with the service role; admins read and update the
-- status in Admin > Đặt lịch & tư vấn. Safe to run more than once.
-- =====================================================================
create table if not exists public.consult_requests (
  id bigint generated always as identity primary key,
  kind text not null,              -- audit, coaching, course
  product text,                    -- package or course name
  format text,                     -- online / offline
  name text not null,
  email text not null,
  phone text not null,             -- Zalo number
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'done')),
  created_at timestamp with time zone default now() not null
);
alter table public.consult_requests enable row level security;
drop policy if exists "Admins manage consult requests" on public.consult_requests;
create policy "Admins manage consult requests" on public.consult_requests for all using (public.is_admin()) with check (public.is_admin());
