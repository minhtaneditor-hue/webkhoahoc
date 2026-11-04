-- 025: students keep their own phone number on their profile (Khu học tập > Hồ sơ).
alter table public.users add column if not exists phone text;
grant update (phone) on public.users to authenticated;
notify pgrst, 'reload schema';
