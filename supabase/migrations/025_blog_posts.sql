-- =====================================================================
-- 025_blog_posts.sql
-- Blog posts written in /admin/blog. Visitors read published posts only.
-- Safe to run more than once.
-- =====================================================================
create table if not exists public.blog_posts (
  id uuid default uuid_generate_v4() primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  excerpt text,
  content text not null default '',
  cover_url text,
  seo_title text,
  seo_description text,
  is_published boolean not null default false,
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create index if not exists blog_posts_published_idx on public.blog_posts (published_at desc) where is_published;

-- Keeps the dates right: updated on every save, published_at set the first time a post goes live.
create or replace function public.blog_posts_set_dates() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := timezone('utc'::text, now());
  if new.is_published and new.published_at is null then
    new.published_at := new.updated_at;
  end if;
  return new;
end;
$$;
drop trigger if exists blog_posts_set_dates on public.blog_posts;
create trigger blog_posts_set_dates before insert or update on public.blog_posts
  for each row execute function public.blog_posts_set_dates();

alter table public.blog_posts enable row level security;
drop policy if exists "Anyone can read published posts" on public.blog_posts;
create policy "Anyone can read published posts" on public.blog_posts for select using (is_published or public.is_admin());
drop policy if exists "Admins can manage posts" on public.blog_posts;
create policy "Admins can manage posts" on public.blog_posts for all using (public.is_admin()) with check (public.is_admin());
