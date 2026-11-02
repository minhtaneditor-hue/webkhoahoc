-- Keep the original portraits for the two testimonials, and give every listed
-- student a card (channels only until their before/after photos arrive). Safe to re-run.
begin;
update public.students set avatar_url = '/asset/hoc_vien/hanh.jpg' where name = 'Nguyễn Đăng Hạnh';
update public.students set avatar_url = '/asset/hoc_vien/hang.jpg' where name = 'Trương Thị Như Hằng';

delete from public.student_works
 where student_name in ('Chị Trang Lê', 'NTH Audio', 'Chị Trương Thị Như Hằng', 'Nguyễn Đăng Hạnh', 'Chị Nguyệt Lê', 'Chị Mỹ Phương', 'Chị Thanh', 'Team Quang Salon')
   and before_url is null and after_url is null and before_thumbnail_url is null and after_thumbnail_url is null;

insert into public.student_works (student_name, student_title, title, category, orientation, country, city, avatar_url, facebook_url, website_url, sort_order) values
  ('Chị Trang Lê', 'Vlog thời trang', 'Kênh vlog thời trang', 'sang-tao', 'vertical', 'VN', 'Hải Phòng – Hồ Chí Minh', '/hoc-vien/avatars/trang-le.webp', 'https://www.facebook.com/elly.trangle', null, 210),
  ('NTH Audio', 'Founder NTH Audio · Kinh doanh nhạc cụ', 'Kênh NTH Audio', 'san-pham', 'vertical', 'VN', 'Đắk Nông', '/hoc-vien/avatars/nth-audio.webp', 'https://www.facebook.com/nthaudioproduction', 'https://www.facebook.com/nthaudio', 211),
  ('Chị Trương Thị Như Hằng', 'Founder Đồng Tâm Food', 'Kênh Đồng Tâm Food', 'am-thuc', 'vertical', 'VN', null, '/asset/hoc_vien/hang.jpg', 'https://www.facebook.com/hang.truongthinhu', null, 212),
  ('Nguyễn Đăng Hạnh', 'Founder Kica Bakery', 'Kênh Kica Bakery', 'am-thuc', 'vertical', 'VN', null, '/asset/hoc_vien/hanh.jpg', 'https://www.facebook.com/profile.php?id=61577511094936', null, 213),
  ('Chị Nguyệt Lê', 'Kinh doanh hoa tươi · Founder Homestay Cô Nhỏ', 'Kênh hoa tươi và Homestay Cô Nhỏ', 'san-pham', 'vertical', 'VN', 'Đà Lạt', '/hoc-vien/avatars/nguyet-le.webp', 'https://www.facebook.com/nguyet.le.324875', null, 214),
  ('Chị Mỹ Phương', 'F&B', 'Kênh F&B', 'am-thuc', 'vertical', 'US', 'California', '/hoc-vien/avatars/my-phuong.webp', 'https://www.facebook.com/my.phuong.528', null, 215),
  ('Chị Thanh', 'Founder Mẹ & Bé · Salon Minh', 'Kênh Mẹ & Bé', 'me-va-be', 'vertical', 'VN', 'Quận 7, Hồ Chí Minh', '/hoc-vien/avatars/chi-thanh.webp', 'https://www.facebook.com/thanh.thanhh.18', null, 216),
  ('Team Quang Salon', 'Salon tóc', 'Kênh Quang Salon', 'lam-dep', 'vertical', 'VN', 'Hồ Chí Minh', null, null, null, 217);
commit;
