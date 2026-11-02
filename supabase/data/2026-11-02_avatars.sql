-- Facebook profile photos (saved to public/hoc-vien/avatars), with the owner's go-ahead. Safe to re-run.
begin;
update public.student_works set avatar_url = '/hoc-vien/avatars/jessica-dang.webp' where student_name = 'Chị Jessica Dang';
update public.student_works set avatar_url = '/hoc-vien/avatars/amy-huynh.webp' where student_name = 'Chị Amy Huỳnh';
update public.student_works set avatar_url = '/hoc-vien/avatars/phuong-anh-vu.webp' where student_name = 'Chị Phương Anh Vũ';
update public.student_works set avatar_url = '/hoc-vien/avatars/quynh-huong-vo.webp' where student_name = 'Chị Quỳnh Hương Võ';
update public.student_works set avatar_url = '/hoc-vien/avatars/thu-thao.webp' where student_name = 'Chị Lý Thu Thảo';
update public.student_works set avatar_url = '/hoc-vien/avatars/hieu-tran.webp' where student_name = 'Anh Hiếu Trần';
update public.student_works set avatar_url = '/hoc-vien/avatars/anh-hung.webp' where student_name = 'Anh Hùng';
update public.student_works set avatar_url = '/hoc-vien/avatars/ami-tran.webp' where student_name = 'Chị Ami Trần';
update public.student_works set avatar_url = '/hoc-vien/avatars/chi-trinh.webp' where student_name = 'Chị Trinh';
-- Học viên tiêu biểu (testimonials)
update public.students set avatar_url = '/hoc-vien/avatars/dang-hanh.webp' where name = 'Nguyễn Đăng Hạnh';
update public.students set avatar_url = '/hoc-vien/avatars/nhu-hang.webp' where name = 'Trương Thị Như Hằng';
commit;
