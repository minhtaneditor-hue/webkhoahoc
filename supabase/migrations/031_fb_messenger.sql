-- 031: Facebook Messenger customer care (Admin > Facebook Messenger, /api/webhooks/facebook).
-- The AI answers Page messages from the site's courses/shop/FAQ plus the approved knowledge below,
-- records orders it closes and hands hard cases to Minh Tấn. Written by the server with the
-- service role; admins read and manage everything. Safe to run more than once.

-- One row per person who messaged the Page (psid = Page-scoped user id)
create table if not exists public.fb_conversations (
  psid text primary key,
  name text,
  profile_pic text,
  bot_paused_until timestamptz,          -- bot stays quiet until then (a person took over)
  needs_human boolean not null default false,
  handoff_reason text,                   -- why the AI asked for help
  status text not null default 'open' check (status in ('open', 'done')),
  last_message_at timestamptz not null default now(),
  last_customer_at timestamptz,          -- Facebook only lets the Page reply freely within 24h of this
  created_at timestamptz not null default now()
);
create index if not exists fb_conversations_last_idx on public.fb_conversations (last_message_at desc);

create table if not exists public.fb_messages (
  id bigint generated always as identity primary key,
  psid text not null references public.fb_conversations(psid) on delete cascade,
  role text not null check (role in ('customer', 'bot', 'admin')),
  text text not null,
  mid text unique,                       -- Facebook message id: webhook retries and echoes are ignored
  created_at timestamptz not null default now()
);
create index if not exists fb_messages_psid_idx on public.fb_messages (psid, created_at);

-- Orders the AI closed in chat; Minh Tấn confirms and collects payment
create table if not exists public.fb_orders (
  id bigint generated always as identity primary key,
  psid text references public.fb_conversations(psid) on delete set null,
  customer_name text not null,
  phone text not null,
  email text,
  product text not null,
  price text,
  note text,
  status text not null default 'new' check (status in ('new', 'confirmed', 'paid', 'cancelled')),
  created_at timestamptz not null default now()
);
create index if not exists fb_orders_created_idx on public.fb_orders (created_at desc);

-- What the AI has learned. Only 'approved' rows go into its prompt.
create table if not exists public.fb_knowledge (
  id bigint generated always as identity primary key,
  question text not null,
  answer text not null,
  source text not null default 'manual' check (source in ('manual', 'admin-reply', 'learned')),
  status text not null default 'suggested' check (status in ('suggested', 'approved')),
  psid text,
  created_at timestamptz not null default now()
);
create index if not exists fb_knowledge_status_idx on public.fb_knowledge (status, created_at desc);

alter table public.fb_conversations enable row level security;
alter table public.fb_messages enable row level security;
alter table public.fb_orders enable row level security;
alter table public.fb_knowledge enable row level security;

drop policy if exists "Admins manage fb conversations" on public.fb_conversations;
create policy "Admins manage fb conversations" on public.fb_conversations for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins manage fb messages" on public.fb_messages;
create policy "Admins manage fb messages" on public.fb_messages for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins manage fb orders" on public.fb_orders;
create policy "Admins manage fb orders" on public.fb_orders for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins manage fb knowledge" on public.fb_knowledge;
create policy "Admins manage fb knowledge" on public.fb_knowledge for all using (public.is_admin()) with check (public.is_admin());

notify pgrst, 'reload schema';
