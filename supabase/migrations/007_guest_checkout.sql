-- =====================================================================
-- 007_guest_checkout.sql
-- Ebooks, presets, skills… can be bought without an account: the buyer
-- leaves name / email / phone, and a random access_token in the payment
-- link lets them see the order and download the file. Safe to re-run.
-- =====================================================================

alter table public.payments add column if not exists buyer_name text;
alter table public.payments add column if not exists buyer_email text;
alter table public.payments add column if not exists buyer_phone text;
alter table public.payments add column if not exists access_token text;
alter table public.payments alter column user_id drop not null;
