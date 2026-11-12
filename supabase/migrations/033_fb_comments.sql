-- 033: comments on the Facebook Page that the Messenger bot answered (/api/webhooks/facebook, field "feed").
-- One row per comment: stops double replies when Facebook retries, and shows what the bot did.
-- Safe to run more than once.

create table if not exists public.fb_comments (
  comment_id text primary key,
  post_id text,
  from_id text,
  from_name text,
  message text,
  action text not null default 'pending' check (action in ('pending', 'replied', 'skipped', 'escalated', 'failed')),
  public_reply text,
  private_message text,
  psid text,                              -- Messenger id of the commenter once the private reply went out
  error text,
  created_at timestamptz not null default now()
);
create index if not exists fb_comments_created_idx on public.fb_comments (created_at desc);

alter table public.fb_comments enable row level security;
drop policy if exists "Admins manage fb comments" on public.fb_comments;
create policy "Admins manage fb comments" on public.fb_comments for all using (public.is_admin()) with check (public.is_admin());

notify pgrst, 'reload schema';
