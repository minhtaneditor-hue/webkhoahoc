-- =====================================================================
-- 011_admin_by_email.sql
-- Admin accounts see every lesson and file without buying. RLS uses
-- public.is_admin(), which only checked users.role; it now also accepts
-- the owner's admin emails (same list as src/lib/admin.ts). Safe to re-run.
-- =====================================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'admin')
      or lower(coalesce(auth.jwt() ->> 'email', '')) in ('minhtaneditor@gmail.com', 'tan@tanlab.vn');
$$;

-- Mark the admin profiles too, for screens that read users.role
update public.users set role = 'admin' where lower(email) in ('minhtaneditor@gmail.com', 'tan@tanlab.vn');
