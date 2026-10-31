-- =====================================================================
-- 004_homepage_cms.sql
-- Lets the admin manage homepage content: featured students, feedback
-- screenshots, FAQ, homepage texts (site_settings) and uploaded images.
-- Safe to run more than once. Requires 002 (public.is_admin()).
-- =====================================================================

-- 1. Featured students (table already exists from 002) -----------------
alter table public.students add column if not exists sort_order integer not null default 0;

-- Seed the four students currently shown on the site (only if the table is empty)
insert into public.students (name, title, quote, results, avatar_url, sort_order)
select * from (values
  ('Trần Thành Tân', 'Cinematographer / Visual Artist', 'Tôi làm chủ được ngôn ngữ hình ảnh và có video đầu tiên lên top trending.', 'Top 1 Trending', '/asset/hoc_vien/tan.jpg', 1),
  ('Nguyễn Đăng Hạnh', 'Founder Chú Lùn Bakery', 'Tiệm bánh nhỏ của tôi giờ có một cỗ máy nội dung chạy đều mỗi tuần.', '+300% doanh thu', '/asset/hoc_vien/hanh.jpg', 2),
  ('Nguyễn Tiến Dương', 'Founder Bảo Vệ Thành Đô', 'Video chỉn chu giúp khách hàng tin dịch vụ của chúng tôi ngay từ lần xem đầu.', 'Nâng tầm uy tín', '/asset/hoc_vien/duong.jpg', 3),
  ('Trương Thị Như Hằng', 'Founder Thực phẩm Đồng Tâm', 'Sản phẩm truyền thống của gia đình giờ đã chạm tới khách hàng trẻ.', 'Làm mới thương hiệu', '/asset/hoc_vien/hang.jpg', 4)
) as v(name, title, quote, results, avatar_url, sort_order)
where not exists (select 1 from public.students);

-- 2. Feedback screenshots ---------------------------------------------
create table if not exists public.feedback_images (
  id uuid default uuid_generate_v4() primary key,
  image_url text not null,
  caption text,
  width integer not null default 1024,
  height integer not null default 400,
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.feedback_images enable row level security;

drop policy if exists "Anyone can view feedback images" on public.feedback_images;
create policy "Anyone can view feedback images" on public.feedback_images for select using (true);
drop policy if exists "Admins can manage feedback images" on public.feedback_images;
create policy "Admins can manage feedback images" on public.feedback_images for all using (public.is_admin());

insert into public.feedback_images (image_url, width, height, sort_order)
select * from (values
  ('/asset/feedback/1.jpg', 1024, 277, 1),
  ('/asset/feedback/2.jpg', 1024, 272, 2),
  ('/asset/feedback/3.jpg', 1024, 505, 3),
  ('/asset/feedback/4.jpg', 1024, 392, 4),
  ('/asset/feedback/5.jpg', 1024, 421, 5)
) as v(image_url, width, height, sort_order)
where not exists (select 1 from public.feedback_images);

-- 3. FAQ ----------------------------------------------------------------
create table if not exists public.faqs (
  id uuid default uuid_generate_v4() primary key,
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.faqs enable row level security;

drop policy if exists "Anyone can view faqs" on public.faqs;
create policy "Anyone can view faqs" on public.faqs for select using (true);
drop policy if exists "Admins can manage faqs" on public.faqs;
create policy "Admins can manage faqs" on public.faqs for all using (public.is_admin());

insert into public.faqs (question, answer, sort_order)
select * from (values
  ('Điện thoại cũ có học được không?', 'Được. Khóa học dạy bạn làm chủ ánh sáng và góc máy để bù lại giới hạn của thiết bị; điện thoại vài năm tuổi vẫn cho ra hình đẹp.', 1),
  ('Tôi ngại lên hình thì sao?', 'Bạn có thể làm video voice-over, quay tay, quay sản phẩm hoặc bối cảnh. Khóa học có riêng chiến lược cho người không muốn lộ mặt.', 2),
  ('Học xong chưa ra kết quả thì sao?', 'Bạn được hỗ trợ 1:1 cho tới khi dựng xong phễu bán hàng đầu tiên. Ngoài ra có chính sách hoàn tiền trong 7 ngày.', 3),
  ('Tôi học được bao lâu?', 'Truy cập trọn đời, bao gồm mọi bài học cập nhật sau này.', 4)
) as v(question, answer, sort_order)
where not exists (select 1 from public.faqs);

-- 4. Homepage texts live in site_settings (key/value, from 002). Admins also insert new keys.
--    Defaults are in src/lib/site-settings.ts, so missing keys still render.

-- 5. Image uploads: public "media" bucket, only admins can write ---------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read media" on storage.objects;
create policy "Public can read media" on storage.objects for select using (bucket_id = 'media');
drop policy if exists "Admins can upload media" on storage.objects;
create policy "Admins can upload media" on storage.objects for insert with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "Admins can update media" on storage.objects;
create policy "Admins can update media" on storage.objects for update using (bucket_id = 'media' and public.is_admin());
drop policy if exists "Admins can delete media" on storage.objects;
create policy "Admins can delete media" on storage.objects for delete using (bucket_id = 'media' and public.is_admin());
