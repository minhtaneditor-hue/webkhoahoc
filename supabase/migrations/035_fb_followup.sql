-- 035: Messenger follow-up. When the customer has not answered for ~a day, Mina sends one
-- reminder ("thông tin em tư vấn đã rõ chưa ạ?") before Facebook's 24h reply window closes.
-- followup_at remembers when that reminder went out, so each silence gets at most one. Safe to rerun.
alter table public.fb_conversations add column if not exists followup_at timestamptz;
notify pgrst, 'reload schema';
