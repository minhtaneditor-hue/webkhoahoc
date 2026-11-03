-- =====================================================================
-- 017_promo_codes.sql
-- Promo codes managed in Admin > Mã giảm giá. Checkout reads them with the
-- service role (src/lib/promo.ts); only admins can see or change the table.
-- payments.promo_code records which code an order used, for the usage count.
-- Safe to run more than once.
-- =====================================================================
create table if not exists public.promo_codes (
  code text primary key,                         -- stored upper-case
  kind text not null default 'percent' check (kind in ('percent', 'amount')),
  value integer not null check (value > 0),      -- percent (1-100) or VND
  course_id uuid references public.courses(id) on delete cascade,  -- null = every course and product
  max_uses integer check (max_uses > 0),         -- null = unlimited
  starts_at timestamp with time zone,
  expires_at timestamp with time zone,
  is_active boolean not null default true,
  note text,
  created_at timestamp with time zone default now() not null
);
alter table public.promo_codes enable row level security;
drop policy if exists "Admins manage promo codes" on public.promo_codes;
create policy "Admins manage promo codes" on public.promo_codes for all using (public.is_admin()) with check (public.is_admin());

alter table public.payments add column if not exists promo_code text;

-- The one code that still works today, so checkout behaves the same after the switch.
insert into public.promo_codes (code, kind, value, note)
values ('GIAM10', 'percent', 10, 'Giảm 10% (mã cũ)')
on conflict (code) do nothing;
