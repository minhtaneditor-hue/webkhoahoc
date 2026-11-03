import { TrendingDown, Camera, Clock, Lightbulb, Check } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';

// The four problems the landing page (khoahoc.minhtanacademy.com) opens with, each tied to the
// part of the 21 Ngày course that answers it. Shown on the home page and that course's page.
const PAINS = [
  {
    icon: TrendingDown,
    pain: 'Video có người xem nhưng chưa ra đơn',
    detail: 'Đăng đều, có view, nhưng không hiểu vì sao người xem không mua.',
    fix: 'Phần 1 và Phần 7: ba con đường kiếm tiền từ video và ba loại video khách hàng sẵn sàng trả tiền.',
  },
  {
    icon: Camera,
    pain: 'Ngại đứng trước ống kính',
    detail: 'Bấm quay là run, nói lắp, quay đi quay lại mãi vẫn không ưng.',
    fix: 'Phần 2: bắt đầu từ chính sự thiếu tự tin, học mỗi ngày một bài nhỏ để quen dần với máy quay.',
  },
  {
    icon: Clock,
    pain: 'Quay dựng mất cả buổi mà video vẫn chưa đẹp',
    detail: 'Loay hoay ánh sáng, khung hình, cắt ghép, kết quả vẫn trông nghiệp dư.',
    fix: 'Phần 3 đến 5: biến điện thoại thành máy quay, kỹ thuật quay và quy trình edit 15 phút với CapCut.',
  },
  {
    icon: Lightbulb,
    pain: 'Cạn ý tưởng chỉ sau vài ngày',
    detail: 'Hào hứng được dăm hôm rồi không biết quay gì tiếp, kênh lại bỏ đó.',
    fix: 'Phần 6: dây chuyền sản xuất nội dung, quay một buổi dùng cả tuần, và cách để không bỏ cuộc.',
  },
];

export default function PainPoints({ className = '' }: { className?: string }) {
  return (
    <section aria-labelledby="pain-title" className={className}>
      <SectionHeading
        title={<span id="pain-title">Chăm làm video mà đơn hàng vẫn đứng im?</span>}
        description="Đây là bốn điều Minh Tấn gặp nhiều nhất ở người bán hàng tự làm video, và phần nào trong khóa 21 Ngày giải quyết từng điều."
      />
      <ul className="mt-10 grid gap-5 md:grid-cols-2">
        {PAINS.map(({ icon: Icon, pain, detail, fix }) => (
          <li key={pain} className="card p-6 md:p-7 flex flex-col">
            <div className="flex items-start gap-4">
              <span className="w-12 h-12 shrink-0 rounded-full bg-gold/10 text-gold flex items-center justify-center" aria-hidden="true"><Icon size={22} /></span>
              <div className="min-w-0">
                <h3 className="text-xl md:text-2xl leading-snug">{pain}</h3>
                <p className="mt-1.5 text-muted-foreground leading-relaxed">{detail}</p>
              </div>
            </div>
            <p className="mt-5 pt-5 border-t border-line flex gap-2.5 text-sm leading-relaxed text-ink">
              <Check size={18} className="text-gold shrink-0 mt-0.5" aria-hidden="true" />
              <span><strong className="text-gold">Trong khóa học:</strong> {fix}</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
