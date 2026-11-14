import Link from 'next/link';
import { Check, X, MessageSquareText, PenLine, UserRoundSearch, ArrowRight } from 'lucide-react';

// For the 21 Ngày course page: who the course is and isn't for, and where to go (coaching, with a
// programme built to order) when it is not enough. Plain statements, so readers and AI summaries
// neither oversell nor undersell it.
const FOR = [
  'Chủ shop, người bán hàng online muốn tự làm video bán hàng',
  'Người xây thương hiệu cá nhân: chuyên gia, coach, tư vấn viên',
  'Người mới bắt đầu, chỉ có chiếc điện thoại và CapCut',
  'Người muốn nhận những job quay dựng video ngắn đầu tiên',
];

const NOT_FOR = [
  'Người muốn theo nghề quay phim, dựng phim chuyên nghiệp với máy quay, Premiere hay DaVinci',
  'Người cần hậu kỳ nâng cao: chỉnh màu chuyên sâu, kỹ xảo',
  'Người chỉ xem mà không thực hành: khóa học cần mỗi ngày một bài và nộp bài',
];

// Coaching offer (see /coaching): for students who need more than the course, a 1:1 programme built to order
const CUSTOM = [
  { icon: UserRoundSearch, t: 'Audit miễn phí 30 phút', d: 'Minh Tấn xem kênh và video hiện tại của bạn để biết bạn đang thiếu gì trước khi chọn hướng học.' },
  { icon: PenLine, t: 'Chương trình riêng cho bạn', d: 'Bài giảng thiết kế theo ngành, mục tiêu và trình độ của bạn: chụp ảnh, quay, dựng trên điện thoại hoặc dựng video bằng AI.' },
  { icon: MessageSquareText, t: 'Kèm 1:1, online hoặc offline', d: 'Gói 6 buổi hoặc 10 buổi, mỗi buổi 2 tiếng, giao bài tập và xem bạn làm trực tiếp.' },
];

export default function CourseFit() {
  return (
    <>
      <section aria-labelledby="fit-title">
        <h2 id="fit-title" className="text-4xl">Khóa học này dành cho ai</h2>
        <p className="mt-2 text-muted-foreground">Học để tự làm video tốt cho công việc của mình khác với học để theo nghề quay dựng chuyên nghiệp. Khóa này dành cho mục tiêu thứ nhất. Nếu bạn cần đi xa hơn, xem phần coaching bên dưới.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="card p-6">
            <h3 className="text-xl">Phù hợp với</h3>
            <ul className="mt-4 space-y-3">
              {FOR.map((t) => <li key={t} className="flex gap-3"><Check size={18} className="text-gold shrink-0 mt-1" aria-hidden="true" /> {t}</li>)}
            </ul>
          </div>
          <div className="card p-6">
            <h3 className="text-xl">Chưa phù hợp nếu bạn là</h3>
            <ul className="mt-4 space-y-3 text-muted-foreground">
              {NOT_FOR.map((t) => <li key={t} className="flex gap-3"><X size={18} className="shrink-0 mt-1" aria-hidden="true" /> {t}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="custom-title" className="card p-6 md:p-10 bg-gold-soft border-gold/30">
        <p className="eyebrow">Coaching 1:1</p>
        <h2 id="custom-title" className="mt-3 text-4xl">Cần chuyên sâu hơn? Bài giảng thiết kế theo yêu cầu</h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">Nếu khóa 21 Ngày chưa đủ cho mục tiêu của bạn, hoặc bạn muốn làm video chuyên nghiệp hơn, hãy liên hệ Minh Tấn để được coaching và thiết kế bài giảng theo đúng nhu cầu của bạn.</p>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {CUSTOM.map(({ icon: Icon, t, d }) => (
            <li key={t}>
              <span className="w-11 h-11 rounded-full bg-gold/10 text-gold flex items-center justify-center" aria-hidden="true"><Icon size={20} /></span>
              <h3 className="mt-3 text-xl leading-snug">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{d}</p>
            </li>
          ))}
        </ul>
        <Link href="/coaching" className="btn btn-dark mt-8">Xem gói Coaching <ArrowRight size={18} aria-hidden="true" /></Link>
      </section>
    </>
  );
}
