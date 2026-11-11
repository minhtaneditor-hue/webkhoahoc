import type { Metadata } from 'next';
import ChamVideoTool from './ChamVideoTool';

export const metadata: Metadata = {
  title: 'Chấm video miễn phí bằng AI',
  description: 'Chấm điểm video ngắn của bạn theo công thức 3S của Minh Tấn: hook 3 giây đầu, thông điệp, lời kêu gọi, hình ảnh, chữ và lời nói. Lời thoại được tự lấy từ video, không cần dán.',
  alternates: { canonical: '/cham-video' },
};

export default function ChamVideoPage() {
  return (
    <main className="section pt-28 md:pt-32">
      <div className="container-lux max-w-3xl">
        <span className="badge">Miễn phí · 3 lượt mỗi ngày</span>
        <h1 className="mt-4 text-4xl md:text-5xl">Chấm video của bạn trong 1 phút</h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
          AI chấm theo đúng bộ tiêu chí Minh Tấn dùng để sửa bài cho học viên: hook 3 giây đầu, thông điệp, lời kêu gọi, hình ảnh, chữ và lời nói. Bạn nhận điểm từng phần, việc cần sửa trước tiên và 2 câu hook viết lại cho chính video đó.
        </p>
        <ChamVideoTool />
      </div>
    </main>
  );
}
