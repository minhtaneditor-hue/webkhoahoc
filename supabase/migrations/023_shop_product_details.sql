-- 023: the extra content shown on a product's own page (/shop/[id]).
-- All optional: a section with nothing in it simply doesn't appear on the page.
alter table public.digital_assets add column if not exists preview_url text;   -- video file or YouTube link
alter table public.digital_assets add column if not exists highlights text;    -- "you get", one per line
alter table public.digital_assets add column if not exists requirements text;  -- "you need", one per line
alter table public.digital_assets add column if not exists samples text;       -- ready-to-copy lines, one per line
alter table public.digital_assets add column if not exists faq text;           -- blocks split by a blank line: first line question, rest answer

-- New columns go last, because "create or replace view" can only add columns at the end.
-- download_url stays out: links are only handed out by /api/shop/download.
create or replace view public.digital_assets_public as
  select id, title, description, price, thumbnail_url, category, created_at,
         preview_url, highlights, requirements, samples, faq
  from public.digital_assets;
grant select on public.digital_assets_public to anon, authenticated;

notify pgrst, 'reload schema';
