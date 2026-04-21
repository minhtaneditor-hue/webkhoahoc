-- Populate 21-Day Video Asset Course Data
INSERT INTO public.courses (id, title, description, price)
VALUES (
  'd290f1ee-6c54-4b01-90e6-d701748f0851',
  '21 Ngày Biến Video Thành Tài Sản',
  'Đừng làm video chỉ để giải trí. Trại huấn luyện 21 ngày giúp bạn xây dựng cỗ máy thu nhập tự động từ smartphone.',
  2500000
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price;

-- Insert Modules/Lessons for the 21-Day Course
INSERT INTO public.lessons (course_id, title, order_index, content)
VALUES
  ('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Tuần 1: Khai mở & Nền móng - Xây dựng "Góc Quay Triệu View"', 1, 'Phá bỏ rào cản tự ti, học cách làm chủ ngôn ngữ cơ thể. Thiết lập góc quay "Triệu View" 0 đồng.'),
  ('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Tuần 2: Cỗ máy sản xuất - Tuyệt chiêu Giật tít (Hook)', 2, 'Thực hành quay, dựng bằng điện thoại. Nắm vững tuyệt chiêu Hook 3 giây đầu tiên.'),
  ('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Tuần 3: Biến View thành tiền - Thiết lập phễu dòng tiền', 3, 'Thiết lập các mỏ vàng: Tiếp thị liên kết (Affiliate), Bán sản phẩm cá nhân. Chiến lược nhân bản kênh tự động.')
ON CONFLICT DO NOTHING;
