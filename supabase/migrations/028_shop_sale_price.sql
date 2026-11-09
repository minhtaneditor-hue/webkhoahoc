-- 028: a time-limited sale on a shop product.
-- old_price is the listed price shown struck through; price is what people pay during the sale.
-- After sale_ends_on (end of that day, Vietnam time) the site charges old_price again by itself.
alter table public.digital_assets add column if not exists old_price numeric;
alter table public.digital_assets add column if not exists sale_ends_on date;

-- New columns go last, because "create or replace view" can only add columns at the end.
create or replace view public.digital_assets_public as
  select id, title, description, price, thumbnail_url, category, created_at,
         preview_url, highlights, requirements, samples, faq,
         old_price, sale_ends_on
  from public.digital_assets;
grant select on public.digital_assets_public to anon, authenticated;

notify pgrst, 'reload schema';
