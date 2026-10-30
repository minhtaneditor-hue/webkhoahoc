-- =====================================================================
-- 003_drop_legacy_policies.sql
-- An earlier version of the database had wide-open RLS policies (USING true)
-- that let ANYONE edit courses/lessons, read paid videos, edit other students'
-- progress, create vouchers and insert "successful" payments. Remove them.
-- Safe to run more than once.
-- =====================================================================

-- Write access for everyone
drop policy if exists "Auth manage courses" on public.courses;
drop policy if exists "Auth manage chapters" on public.chapters;
drop policy if exists "Auth manage lessons" on public.lessons;
drop policy if exists "Auth manage student_progress" on public.student_progress;
drop policy if exists "Auth manage vouchers" on public.vouchers;

-- Read access that bypasses is_published / enrollment checks
drop policy if exists "Anyone can view courses" on public.courses;
drop policy if exists "Public read courses" on public.courses;
drop policy if exists "Public read chapters" on public.chapters;
drop policy if exists "Public read lessons" on public.lessons;
drop policy if exists "Public read student_progress" on public.student_progress;
drop policy if exists "Public read vouchers" on public.vouchers;

-- Payments are created only by the server (service role) in /api/payment/vnpay
drop policy if exists "Users can insert their own payments" on public.payments;

-- Vouchers: admin only (checkout validates codes on the server)
alter table public.vouchers enable row level security;
drop policy if exists "Admins can manage vouchers" on public.vouchers;
create policy "Admins can manage vouchers" on public.vouchers for all using (public.is_admin());
