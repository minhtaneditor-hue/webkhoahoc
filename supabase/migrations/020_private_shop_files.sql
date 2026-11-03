-- =====================================================================
-- 020_private_shop_files.sql
-- Private bucket for shop files. Nobody can read it from the browser;
-- /api/shop/download (service role) hands buyers a 1-hour signed link and
-- stamps PDFs with the buyer's name, phone and order (stamped/<order>/…).
-- In Admin > Cửa hàng set "Link tải file" to storage:shop-files/<file>.pdf
-- Admins upload with the Supabase dashboard. Safe to run more than once.
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('shop-files', 'shop-files', false)
on conflict (id) do update set public = false;

drop policy if exists "Admins can manage shop files" on storage.objects;
create policy "Admins can manage shop files" on storage.objects
  for all using (bucket_id = 'shop-files' and public.is_admin())
  with check (bucket_id = 'shop-files' and public.is_admin());
