-- 032: Minh Tấn's voice for the Messenger bot (Admin > Facebook Messenger > Kiến thức của bot).
-- The AI reads the Page's past conversations and writes a style guide of how Minh Tấn talks to
-- customers, with private details removed. Only the 'active' row goes into the bot's prompt.
-- Safe to run more than once.

create table if not exists public.fb_voice (
  id bigint generated always as identity primary key,
  profile text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  conversations int not null default 0,  -- how many conversations it was written from
  created_at timestamptz not null default now()
);
create index if not exists fb_voice_status_idx on public.fb_voice (status, created_at desc);

alter table public.fb_voice enable row level security;
drop policy if exists "Admins manage fb voice" on public.fb_voice;
create policy "Admins manage fb voice" on public.fb_voice for all using (public.is_admin()) with check (public.is_admin());

notify pgrst, 'reload schema';
