-- 030: what people do with the free AI tools (/cham-video, /viet-kich-ban) and what they say about them.
-- Feeds the periodic tool report (scripts/bao-cao-cong-cu.mjs). Written by the server with the
-- service role; only admins can read. No video, transcript or script text is stored here.
-- Safe to run more than once.
create table if not exists public.tool_events (
  id bigint generated always as identity primary key,
  tool text not null check (tool in ('cham-video', 'viet-kich-ban')),
  kind text not null,   -- feedback | cham (a scoring) | het-luot (hit the usage limit)
  user_id uuid references public.users(id) on delete set null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists tool_events_created_idx on public.tool_events (created_at desc);

alter table public.tool_events enable row level security;

drop policy if exists "Admins read tool events" on public.tool_events;
create policy "Admins read tool events" on public.tool_events for select using (public.is_admin());

notify pgrst, 'reload schema';
