import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Điều khoản dịch vụ', alternates: { canonical: '/terms' } };

export default function TermsPage() {
  return (
    <LegalPage

      title="Điều khoản dịch vụ"
      intro="Quy định về việc sử dụng nội dung và quyền sở hữu trí tuệ tại TẤN VA."
      updated="Tháng 4, 2026"
      sections={[
        {
          title: 'Quyền sở hữu trí tuệ',
          body: <p>Toàn bộ video, preset, LUT và tài liệu đính kèm thuộc quyền sở hữu trí tuệ của <strong>TẤN VA</strong>. Học viên được truy cập và học tập trọn đời nhưng <strong>không</strong> được sao chép, phân phối hoặc bán lại nội dung dưới bất kỳ hình thức nào.</p>,
        },
        {
          title: 'Trách nhiệm của học viên',
          body: <p>Mỗi tài khoản chỉ dành cho một cá nhân. Chia sẻ hoặc dùng chung tài khoản sẽ dẫn tới việc đình chỉ truy cập vĩnh viễn và không được hoàn học phí.</p>,
        },
        {
          title: 'Giới hạn trách nhiệm',
          body: <p>TẤN VA cam kết cung cấp kiến thức thực chiến chính xác tại thời điểm phát hành. Kết quả cuối cùng phụ thuộc vào nỗ lực và quá trình thực hành của từng học viên; chúng tôi không đảm bảo mức thu nhập cụ thể sau khóa học.</p>,
        },
        {
          title: 'Thay đổi điều khoản',
          body: <p>Mọi thay đổi về điều khoản sẽ được thông báo trực tiếp tới học viên qua email và trên hệ thống.</p>,
        },
      ]}
    />
  );
}
