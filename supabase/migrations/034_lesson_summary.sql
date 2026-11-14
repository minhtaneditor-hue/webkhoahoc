-- =====================================================================
-- 034_lesson_summary.sql
-- A short public "Bạn sẽ học" line under each lesson on the sales page, so
-- readers (and search/AI crawlers) see what a lesson covers, not just its title.
-- lessons.content stays private to enrolled students; summary is public via
-- lesson_outline. Safe to run more than once.
-- =====================================================================
alter table public.lessons add column if not exists summary text;

-- New column goes last: create or replace view can only append columns.
create or replace view public.lesson_outline as
  select l.id, l.course_id, l.chapter_id, l.title, l.order_index, l.duration_seconds, l.is_free,
         case when l.is_free then l.video_url end as video_url,
         l.summary
  from public.lessons l
  join public.courses c on c.id = l.course_id
  where c.is_published = true;
grant select on public.lesson_outline to anon, authenticated;

-- 21 Ngày: summaries for the lessons whose notes are already written (34–39),
-- taken from those notes. Only fills empty summaries, so admin edits are kept.
update public.lessons set summary = v.summary
from (values
  (34, 'Quy trình dựng 10 bước trên CapCut: sắp xếp A-roll/B-roll, chỉnh màu da, khử ồn và cải thiện giọng, cắt "à, ờ", chèn B-roll và ổn định hình rung, chuyển cảnh, chữ, nhạc nền -20dB, xuất 1080p 30fps và soát lỗi.'),
  (35, 'Tách việc viết, quay, sửa thành dây chuyền để không kiệt sức, và công thức kịch bản 3S: Stop – Solution – Sales. Bài tập: viết 3 kịch bản 3S.'),
  (36, 'Chuẩn bị 30 phút buổi tối: gạch ý cho 5–10 video, sạc pin và dọn bộ nhớ, chọn sẵn 3–4 áo để quay một buổi trông như nhiều ngày.'),
  (37, 'Quay một mẻ trong một buổi sáng: lau ống kính, tắt thông báo, luyện giọng, quay liên tục và thay áo sau mỗi 3 clip.'),
  (38, 'Gọt video trong buổi chiều: cắt đoạn thừa, làm tiêu đề chữ to ở giây đầu để giữ người xem qua 3 giây, hẹn giờ đăng cả tuần.'),
  (39, 'Giữ thói quen làm video lâu dài: hoàn thành trước, hoàn hảo sau, và vài mẹo giữ năng lượng khi quay nhiều.')
) as v(order_index, summary)
where lessons.course_id = 'd290f1ee-6c54-4b01-90e6-d701748f0851'
  and lessons.order_index = v.order_index
  and (lessons.summary is null or lessons.summary = '');
