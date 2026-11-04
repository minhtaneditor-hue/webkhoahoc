-- 024: the visitor's Meta cookies, IP and browser, kept on a pending order. The bank webhook
-- has no browser, so the Conversions API Purchase event reads them from here. Cleared once sent.
alter table public.payments add column if not exists meta_context jsonb;
notify pgrst, 'reload schema';
