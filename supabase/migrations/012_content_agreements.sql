-- =====================================================================
-- 012_content_agreements.sql
-- Students accept "Cam kết bảo mật nội dung" before watching lessons.
-- One row per user per wording version. Safe to run more than once.
-- =====================================================================
create table if not exists public.content_agreements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  version text not null,
  user_agent text,
  accepted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, version)
);
alter table public.content_agreements enable row level security;

drop policy if exists "Users read own agreements" on public.content_agreements;
create policy "Users read own agreements" on public.content_agreements for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "Users accept for themselves" on public.content_agreements;
create policy "Users accept for themselves" on public.content_agreements for insert with check (user_id = auth.uid());
