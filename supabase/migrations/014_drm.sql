-- =====================================================================
-- 014_drm.sql
-- tVNDRM inside the website (Vercel + Cloudflare R2), replacing the old VPS.
-- Encrypted HLS files live in R2; the AES keys live here and are only
-- handed out by /api/drm/keys to a live, non-revoked playback session.
-- A lesson plays a protected video when lessons.video_url = 'drm:<video id>'.
-- Safe to run more than once.
-- =====================================================================

-- One row per encrypted video (written by scripts/drm/encrypt-upload.mjs)
create table if not exists public.drm_videos (
  id text primary key check (id ~ '^[a-zA-Z0-9_-]+$'),
  title text,
  group_duration int not null default 30,   -- seconds of video one key unlocks
  segment_duration int not null default 6,
  key_count int not null default 0,
  created_at timestamp with time zone default now() not null
);

-- AES-128 keys. No policy at all: only the service role (server) can read them.
create table if not exists public.drm_keys (
  video_id text references public.drm_videos(id) on delete cascade not null,
  idx int not null,
  key bytea not null check (octet_length(key) = 16),
  primary key (video_id, idx)
);

-- One row per playback session (device)
create table if not exists public.drm_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  video_id text not null,
  device_id text not null,
  ip text,
  user_agent text,
  violations int not null default 0,
  risk_score int not null default 0,
  segments int[] not null default '{}',   -- distinct segment numbers fetched (risk engine)
  keys int[] not null default '{}',       -- distinct key numbers fetched
  revoked boolean not null default false,
  revoke_reason text,
  created_at timestamp with time zone default now() not null,
  last_seen timestamp with time zone default now() not null
);
create index if not exists drm_sessions_user_idx on public.drm_sessions (user_id, revoked, last_seen desc);

create table if not exists public.drm_violations (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  session_id uuid references public.drm_sessions(id) on delete set null,
  video_id text,
  type text not null,
  ip text,
  created_at timestamp with time zone default now() not null
);
create index if not exists drm_violations_created_idx on public.drm_violations (created_at desc);

alter table public.drm_videos enable row level security;
alter table public.drm_keys enable row level security;
alter table public.drm_sessions enable row level security;
alter table public.drm_violations enable row level security;

-- Admin dashboard (/admin/drm) reads with the admin's own login
drop policy if exists "Admins read drm videos" on public.drm_videos;
create policy "Admins read drm videos" on public.drm_videos for select using (public.is_admin());
drop policy if exists "Admins read drm sessions" on public.drm_sessions;
create policy "Admins read drm sessions" on public.drm_sessions for select using (public.is_admin());
drop policy if exists "Admins revoke drm sessions" on public.drm_sessions;
create policy "Admins revoke drm sessions" on public.drm_sessions for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins read drm violations" on public.drm_violations;
create policy "Admins read drm violations" on public.drm_violations for select using (public.is_admin());

-- Atomically records a fetched segment/key number and returns how many distinct
-- ones this session has fetched, so the risk engine works across serverless instances.
create or replace function public.drm_track(sid uuid, kind text, n int)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  total int;
begin
  if kind = 'segment' then
    update drm_sessions set segments = case when n = any(segments) then segments else array_append(segments, n) end
      where id = sid returning cardinality(segments) into total;
  else
    update drm_sessions set keys = case when n = any(keys) then keys else array_append(keys, n) end
      where id = sid returning cardinality(keys) into total;
  end if;
  return coalesce(total, 0);
end;
$$;
revoke execute on function public.drm_track(uuid, text, int) from public, anon, authenticated;
