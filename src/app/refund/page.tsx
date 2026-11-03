import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Chính sách hoàn tiền' };

export default function RefundPage() {
  return (
    <LegalPage
      title="Chính sách hoàn tiền"
      intro="Học phí đã thanh toán không được hoàn lại. Vì vậy bạn hãy học thử và hỏi kỹ trước khi đăng ký."
      updated="Tháng 11, 2026"
      sections={[
        {
          title: 'Không hoàn học phí',
          body: <p>Khóa học online, gói Coaching và sản phẩm số (ebook, preset, template…) được kích hoạt hoặc gửi ngay sau khi thanh toán, nên <strong>học phí đã thanh toán không được hoàn lại</strong> trong mọi trường hợp.</p>,
        },
        {
          title: 'Trước khi đăng ký',
          body: (
            <ul>
              <li>Xem các bài học thử miễn phí trên trang khóa học để biết cách dạy có hợp với bạn không.</li>
              <li>Nhắn Zalo cho Minh Tấn nếu còn băn khoăn về nội dung, thiết bị hay thời gian học.</li>
            </ul>
          ),
        },
        {
          title: 'Chuyển khoản nhầm hoặc chưa được kích hoạt',
          body: <p>Nếu bạn chuyển khoản trùng, chuyển sai số tiền hoặc đã thanh toán mà khóa học chưa mở, hãy trả lời email xác nhận đơn hàng hoặc nhắn Zalo kèm mã đơn để được kiểm tra và xử lý.</p>,
        },
      ]}
    />
  );
}
