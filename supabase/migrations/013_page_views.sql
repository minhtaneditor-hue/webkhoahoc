-- =====================================================================
-- 013_page_views.sql
-- Own traffic counter shown at /admin/traffic. Rows are written by
-- /api/track with the service role; only admins can read them.
-- visitor = hash(IP + browser + day): unique visitors per day, no raw IP stored.
-- Safe to run more than once.
-- =====================================================================
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  path text not null,
  referrer text,
  country text,
  device text,
  visitor text not null,
  created_at timestamp with time zone default now() not null
);
create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
alter table public.page_views enable row level security;

drop policy if exists "Admins read page views" on public.page_views;
create policy "Admins read page views" on public.page_views for select using (public.is_admin());

-- One call returns everything the admin page needs for the last N days.
create or replace function public.traffic_summary(days int default 30)
returns json
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  since timestamptz := date_trunc('day', now() at time zone 'Asia/Ho_Chi_Minh') at time zone 'Asia/Ho_Chi_Minh' - make_interval(days => greatest(days, 1) - 1);
  prev_since timestamptz := since - make_interval(days => greatest(days, 1));
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;
  return json_build_object(
    'views', (select count(*) from page_views where created_at >= since),
    'visitors', (select count(distinct (visitor, (created_at at time zone 'Asia/Ho_Chi_Minh')::date)) from page_views where created_at >= since),
    'prev_views', (select count(*) from page_views where created_at >= prev_since and created_at < since),
    'prev_visitors', (select count(distinct (visitor, (created_at at time zone 'Asia/Ho_Chi_Minh')::date)) from page_views where created_at >= prev_since and created_at < since),
    'daily', coalesce((select json_agg(d order by d.day) from (
        select (created_at at time zone 'Asia/Ho_Chi_Minh')::date as day, count(*) as views, count(distinct visitor) as visitors
        from page_views where created_at >= since group by 1) d), '[]'::json),
    'pages', coalesce((select json_agg(p) from (
        select path, count(*) as views, count(distinct visitor) as visitors
        from page_views where created_at >= since group by path order by 2 desc limit 15) p), '[]'::json),
    'referrers', coalesce((select json_agg(r) from (
        select coalesce(referrer, '(trực tiếp)') as referrer, count(*) as views
        from page_views where created_at >= since group by 1 order by 2 desc limit 10) r), '[]'::json),
    'countries', coalesce((select json_agg(c) from (
        select coalesce(country, '??') as country, count(distinct visitor) as visitors
        from page_views where created_at >= since group by 1 order by 2 desc limit 10) c), '[]'::json),
    'devices', coalesce((select json_agg(v) from (
        select coalesce(device, 'khác') as device, count(distinct visitor) as visitors
        from page_views where created_at >= since group by 1 order by 2 desc) v), '[]'::json)
  );
end;
$$;
grant execute on function public.traffic_summary(int) to authenticated;
