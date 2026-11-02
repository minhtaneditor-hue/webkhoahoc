-- Two students listed by their channels (no before/after photos yet). Safe to re-run.
begin;
delete from public.student_works where student_name in ('Chị Ami Trần', 'Viên Trương') and before_url is null and after_url is null and before_thumbnail_url is null and after_thumbnail_url is null;
insert into public.student_works (student_name, student_title, title, category, orientation, country, city, facebook_url, tiktok_url, website_url, sort_order) values
  ('Chị Ami Trần', 'Chuyên viên tư vấn bất động sản tại IQI Vietnam', 'Kênh TikTok Ami Lux Living', 'bat-dong-san', 'vertical', 'VN', 'Hồ Chí Minh', 'https://www.facebook.com/tran.t.ngan.73', 'https://www.tiktok.com/@ami.luxliving', null, 200),
  ('Viên Trương', 'Founder A Thủy Food & Bánh Tráng Cô Viên', 'Kênh TikTok A Thủy Food và Bánh Tráng Cô Viên', 'am-thuc', 'vertical', 'VN', null, null, 'https://www.tiktok.com/@anvatthuyfood', 'https://www.tiktok.com/@anvatbanhtrangcovien', 201);
commit;
