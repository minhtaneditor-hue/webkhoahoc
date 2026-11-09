-- Hội viên TẤN VA: prepaid time, bought by bank transfer (SePay). No auto-renewal:
-- each paid order adds its months on top of whatever time is left.

-- Which membership plan an order buys ('thang' = 1 month, 'nam' = 12 months)
alter table public.payments add column if not exists membership_plan text
  check (membership_plan in ('thang', 'nam'));

create table if not exists public.memberships (
  user_id uuid primary key references public.users(id) on delete cascade,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.memberships enable row level security;

drop policy if exists "Members read own membership" on public.memberships;
create policy "Members read own membership" on public.memberships
  for select using (auth.uid() = user_id);

drop policy if exists "Admins read memberships" on public.memberships;
create policy "Admins read memberships" on public.memberships
  for select using (public.is_admin());

-- Adds months in one statement, so two orders paid at the same moment both count.
-- Still active: extends from the current end. Expired or new: starts from now.
create or replace function public.extend_membership(p_user uuid, p_months int)
returns timestamptz
language sql
security definer
set search_path = public
as $$
  insert into public.memberships as m (user_id, expires_at, updated_at)
  values (p_user, now() + make_interval(months => p_months), now())
  on conflict (user_id) do update
    set expires_at = greatest(m.expires_at, now()) + make_interval(months => p_months),
        updated_at = now()
  returning expires_at;
$$;

-- Only the server (service role) may grant time.
revoke all on function public.extend_membership(uuid, int) from public, anon, authenticated;
