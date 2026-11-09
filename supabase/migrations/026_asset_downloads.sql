-- 026: one row each time a shop file link is handed out (Admin > Sản phẩm khác shows the counts).
-- Written by the server with the service role; only admins can read. Safe to run more than once.
create table if not exists public.asset_downloads (
  id bigint generated always as identity primary key,
  asset_id uuid not null references public.digital_assets(id) on delete cascade,
  email text,
  kind text not null,  -- free: form sent, free-email: link in the email, paid: buyer's download
  created_at timestamp with time zone default now() not null
);
create index if not exists asset_downloads_asset_idx on public.asset_downloads (asset_id);
alter table public.asset_downloads enable row level security;

drop policy if exists "Admins read asset downloads" on public.asset_downloads;
create policy "Admins read asset downloads" on public.asset_downloads for select using (public.is_admin());

-- Everyone who took the free 75-repo pack before this table existed
insert into public.asset_downloads (asset_id, email, kind, created_at)
select '494a1c57-1b93-44e5-b7a1-1d863d6b7373', l.email, 'free', l.created_at
from public.leads l
where l.source = 'free-product'
  and exists (select 1 from public.digital_assets a where a.id = '494a1c57-1b93-44e5-b7a1-1d863d6b7373')
  and not exists (select 1 from public.asset_downloads d where d.asset_id = '494a1c57-1b93-44e5-b7a1-1d863d6b7373' and d.email = l.email);

notify pgrst, 'reload schema';
