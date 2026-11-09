-- =====================================================================
-- 027_email_status.sql
-- What actually happened to each email, one row per Resend email id. Filled by
-- the Resend webhook (/api/webhooks/resend), shown in Admin > Email đã gửi.
-- Written with the service role; only admins can read. Safe to run more than once.
-- =====================================================================
create table if not exists public.email_status (
  email_id text primary key,
  to_email text not null,         -- lower-case
  subject text,
  status text not null,           -- sent, delivery_delayed, delivered, opened, clicked, bounced, failed, suppressed, complained
  reason text,                    -- why it bounced, failed or was suppressed, as Resend words it
  sent_at timestamp with time zone not null,
  delivered_at timestamp with time zone,
  opened_at timestamp with time zone,
  clicked_at timestamp with time zone,
  updated_at timestamp with time zone default now() not null
);
create index if not exists email_status_sent_idx on public.email_status (sent_at desc);
create index if not exists email_status_to_idx on public.email_status (to_email);
alter table public.email_status enable row level security;
drop policy if exists "Admins read email status" on public.email_status;
create policy "Admins read email status" on public.email_status for select using (public.is_admin());
