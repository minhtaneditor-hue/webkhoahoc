-- Populate 21-Day Video Asset Course Data
-- (courses.slug and lessons.chapter_id are NOT NULL in schema.sql, so both are provided here)
INSERT INTO public.courses (id, title, slug, description, price, is_published)
VALUES (
  'd290f1ee-6c54-4b01-90e6-d701748f0851',
  '21 Ngày Biến Video Thành Tài Sản',
  '21-ngay-bien-video-thanh-tai-san',
  'Đừng làm video chỉ để giải trí. Trại huấn luyện 21 ngày giúp bạn xây dựng cỗ máy thu nhập tự động từ smartphone.',
  2500000,
  true
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_published = EXCLUDED.is_published;

-- One chapter per week
INSERT INTO public.chapters (id, course_id, title, order_index)
VALUES
  ('a1000000-0000-4000-8000-000000000001', 'd290f1ee-6c54-4b01-90e6-d701748f0851', 'Tuần 1: Khai mở & Nền móng', 1),
  ('a1000000-0000-4000-8000-000000000002', 'd290f1ee-6c54-4b01-90e6-d701748f0851', 'Tuần 2: Cỗ máy sản xuất', 2),
  ('a1000000-0000-4000-8000-000000000003', 'd290f1ee-6c54-4b01-90e6-d701748f0851', 'Tuần 3: Biến View thành tiền', 3)
ON CONFLICT (id) DO NOTHING;

-- Insert Modules/Lessons for the 21-Day Course
INSERT INTO public.lessons (id, chapter_id, course_id, title, order_index, content, is_free)
VALUES
  ('b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'd290f1ee-6c54-4b01-90e6-d701748f0851', 'Tuần 1: Khai mở & Nền móng - Xây dựng "Góc Quay Triệu View"', 1, 'Phá bỏ rào cản tự ti, học cách làm chủ ngôn ngữ cơ thể. Thiết lập góc quay "Triệu View" 0 đồng.', true),
  ('b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000002', 'd290f1ee-6c54-4b01-90e6-d701748f0851', 'Tuần 2: Cỗ máy sản xuất - Tuyệt chiêu Giật tít (Hook)', 2, 'Thực hành quay, dựng bằng điện thoại. Nắm vững tuyệt chiêu Hook 3 giây đầu tiên.', false),
  ('b1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000003', 'd290f1ee-6c54-4b01-90e6-d701748f0851', 'Tuần 3: Biến View thành tiền - Thiết lập phễu dòng tiền', 3, 'Thiết lập các mỏ vàng: Tiếp thị liên kết (Affiliate), Bán sản phẩm cá nhân. Chiến lược nhân bản kênh tự động.', false)
ON CONFLICT (id) DO NOTHING;
