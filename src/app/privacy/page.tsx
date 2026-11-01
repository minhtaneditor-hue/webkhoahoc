import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Chính sách bảo mật' };

export default function PrivacyPage() {
  return (
    <LegalPage

      title="Chính sách bảo mật"
      intro="Cam kết giữ an toàn thông tin cá nhân của học viên."
      updated="Tháng 4, 2026"
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
      ]}
    />
  );
}
