import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Chính sách bảo mật', alternates: { canonical: '/privacy' } };

export default function PrivacyPage() {
  return (
    <LegalPage

      title="Chính sách bảo mật"
      intro="Cam kết giữ an toàn thông tin cá nhân của học viên."
      updated="Tháng 11, 2026"
      sections={[
        {
          title: 'Thông tin chúng tôi thu thập',
          body: <p>Chúng tôi chỉ thu thập thông tin cần thiết cho việc học: họ tên, email và thông tin liên hệ. Dữ liệu này giúp cá nhân hóa trải nghiệm học tập và hỗ trợ bạn kịp thời.</p>,
        },
        {
          title: 'Lưu trữ và bảo mật',
          body: <p>Dữ liệu được lưu trên hệ thống máy chủ mã hóa của Supabase theo tiêu chuẩn an ninh quốc tế. Chúng tôi <strong>không</strong> bán hoặc chia sẻ thông tin cá nhân của bạn cho bên thứ ba vì mục đích quảng cáo.</p>,
        },
        {
          title: 'An toàn thanh toán',
          body: <p>Thanh toán bằng chuyển khoản ngân hàng (mã VietQR, xác nhận tự động qua SePay) hoặc qua cổng VNPay. Chúng tôi không lưu thông tin thẻ hay tài khoản ngân hàng của bạn.</p>,
        },
        {
          title: 'Tin nhắn qua Facebook Messenger',
          body: (
            <>
              <p>Khi bạn nhắn tin cho Fanpage TẤN VA trên Messenger, chúng tôi nhận và lưu: nội dung tin nhắn, tên và ảnh đại diện công khai trên Facebook, mã định danh Messenger do Facebook cấp riêng cho Fanpage, cùng thông tin bạn tự cung cấp khi đăng ký khóa học (họ tên, số điện thoại/Zalo, email).</p>
              <ul>
                <li><strong>Mục đích:</strong> trả lời câu hỏi, tư vấn khóa học, ghi nhận đơn đăng ký và chăm sóc bạn sau đó.</li>
                <li><strong>Trợ lý tự động:</strong> một trợ lý AI (dịch vụ Claude của Anthropic) đọc cuộc trò chuyện để soạn câu trả lời. Nội dung chỉ được gửi tới dịch vụ này để tạo câu trả lời, không dùng cho quảng cáo. Câu hỏi cần người thật (khiếu nại, giảm giá, trường hợp đặc biệt) được chuyển cho Minh Tấn.</li>
                <li><strong>Thông báo nội bộ:</strong> tóm tắt các trường hợp cần hỗ trợ được gửi tới Minh Tấn qua email và Telegram.</li>
                <li><strong>Thời gian lưu:</strong> tối đa 24 tháng kể từ tin nhắn cuối, hoặc tới khi bạn yêu cầu xóa.</li>
                <li>Chúng tôi không bán, không chia sẻ tin nhắn của bạn cho bên thứ ba vì mục đích quảng cáo.</li>
              </ul>
            </>
          ),
        },
        {
          title: 'Yêu cầu xóa dữ liệu',
          body: (
            <>
              <p>Bạn có thể yêu cầu xóa toàn bộ tin nhắn Messenger và thông tin cá nhân chúng tôi đang lưu bằng một trong hai cách:</p>
              <ul>
                <li>Nhắn cho Fanpage TẤN VA trên Messenger: <strong>&ldquo;Xóa dữ liệu của tôi&rdquo;</strong>.</li>
                <li>Gửi email tới <a href="mailto:tanva@minhtanacademy.com" className="underline">tanva@minhtanacademy.com</a> với tiêu đề &ldquo;Yêu cầu xóa dữ liệu&rdquo;, kèm tên Facebook bạn dùng để nhắn tin.</li>
              </ul>
              <p>Chúng tôi xóa dữ liệu trong vòng 30 ngày và xác nhận lại với bạn. Tin nhắn vẫn còn trong hộp thư Messenger của chính bạn; bạn có thể tự xóa trong ứng dụng Messenger.</p>
            </>
          ),
        },
      ]}
    />
  );
}
