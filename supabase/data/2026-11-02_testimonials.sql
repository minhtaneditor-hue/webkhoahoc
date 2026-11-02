-- Students who sent a Facebook link join "Học viên tiêu biểu". No quote is written for them:
-- without one they show as compact profile cards. Requires migration 010. Safe to re-run.
begin;
alter table public.students add column if not exists facebook_url text;
update public.students set facebook_url = 'https://www.facebook.com/hang.truongthinhu' where name = 'Trương Thị Như Hằng';
update public.students set facebook_url = 'https://www.facebook.com/profile.php?id=61577511094936' where name = 'Nguyễn Đăng Hạnh';
delete from public.students where quote is null and story is null and facebook_url like 'https://www.facebook.com/%' and sort_order >= 100;
insert into public.students (name, title, avatar_url, country, city, facebook_url, sort_order) values
  ('Chị Jessica Dang', 'Founder Veloura Nails & Spa', '/hoc-vien/avatars/jessica-dang.webp', 'AU', null, 'https://www.facebook.com/profile.php?id=61590649167105', 100),
  ('Chị Amy Huỳnh', 'Founder tiệm nail', '/hoc-vien/avatars/amy-huynh.webp', 'CA', null, 'https://www.facebook.com/amythanh.huynh', 101),
  ('Chị Phương Anh Vũ', 'Founder Yên Beauty (Cosmetic & Spa)', '/hoc-vien/avatars/phuong-anh-vu.webp', 'AU', 'Melbourne', 'https://www.facebook.com/heo.tova', 102),
  ('Chị Trang Lê', 'Vlog thời trang', '/hoc-vien/avatars/trang-le.webp', 'VN', 'Hải Phòng – Hồ Chí Minh', 'https://www.facebook.com/elly.trangle', 103),
  ('Chị Quỳnh Hương Võ', 'Vlog F&B', '/hoc-vien/avatars/quynh-huong-vo.webp', 'SG', null, 'https://www.facebook.com/quynhhuong.vo.58', 104),
  ('NTH Audio', 'Founder NTH Audio · Kinh doanh nhạc cụ', '/hoc-vien/avatars/nth-audio.webp', 'VN', 'Đắk Nông', 'https://www.facebook.com/nthaudioproduction', 105),
  ('Chị Lý Thu Thảo', 'Founder Bột Đậu Nành Thu Thảo', '/hoc-vien/avatars/thu-thao.webp', 'VN', 'Sóc Trăng', 'https://www.facebook.com/lythuthao898989', 106),
  ('Chị Nguyệt Lê', 'Hoa tươi · Founder Homestay Cô Nhỏ', '/hoc-vien/avatars/nguyet-le.webp', 'VN', 'Đà Lạt', 'https://www.facebook.com/nguyet.le.324875', 107),
  ('Anh Hiếu Trần', 'Tư vấn, cố vấn đầu tư & thẩm định giá BĐS toàn quốc', '/hoc-vien/avatars/hieu-tran.webp', 'VN', 'Hải Phòng', 'https://www.facebook.com/hieu.tran.600382', 108),
  ('Chị Mỹ Phương', 'F&B', '/hoc-vien/avatars/my-phuong.webp', 'US', 'California', 'https://www.facebook.com/my.phuong.528', 109),
  ('Anh Hùng', 'Travel vlogger · Nail', '/hoc-vien/avatars/anh-hung.webp', 'US', 'Camden, Maine', 'https://www.facebook.com/hungkieu.chau', 110),
  ('Chị Ami Trần', 'Chuyên viên tư vấn BĐS tại IQI Vietnam', '/hoc-vien/avatars/ami-tran.webp', 'VN', 'Hồ Chí Minh', 'https://www.facebook.com/tran.t.ngan.73', 111),
  ('Chị Trinh', 'Bất động sản', '/hoc-vien/avatars/chi-trinh.webp', 'VN', 'Hồ Chí Minh', 'https://www.facebook.com/xu.trinh.3', 112),
  ('Chị Thanh', 'Founder Mẹ & Bé · Salon Minh', '/hoc-vien/avatars/chi-thanh.webp', 'VN', 'Quận 7, Hồ Chí Minh', 'https://www.facebook.com/thanh.thanhh.18', 113);
commit;
