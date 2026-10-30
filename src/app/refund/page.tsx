import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Chính sách hoàn tiền' };

export default function RefundPage() {
  return (
    <LegalPage

      title="Chính sách hoàn tiền"
      intro="Học thử yên tâm: hoàn 100% học phí trong 7 ngày nếu khóa học chưa phù hợp với bạn."
      updated="Tháng 4, 2026"
      sections={[
        {
          title: 'Cam kết 7 ngày',
          body: <p>Nếu trong vòng <strong>7 ngày</strong> kể từ ngày đăng ký, bạn thấy nội dung chưa phù hợp, bạn có quyền yêu cầu hoàn 100% học phí mà không cần nêu lý do (áp dụng cho khóa học online bán lẻ).</p>,
        },
        {
          title: 'Điều kiện áp dụng',
          body: (
            <ul>
              <li>Học viên chưa hoàn thành quá 20% thời lượng khóa học.</li>
              <li>Không áp dụng cho gói Coaching 1:1 hoặc các buổi tư vấn trực tiếp đã diễn ra.</li>
              <li>Yêu cầu được gửi qua email hỗ trợ chính thức trong thời hạn quy định.</li>
            </ul>
          ),
        },
        {
          title: 'Quy trình hoàn tiền',
          body: <p>Sau khi nhận yêu cầu hợp lệ, chúng tôi xử lý hoàn tiền trong vòng <strong>3–5 ngày làm việc</strong>. Tiền được hoàn về đúng tài khoản hoặc phương thức bạn đã dùng để thanh toán.</p>,
        },
      ]}
    />
  );
}
