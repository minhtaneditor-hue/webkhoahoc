import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';

export const metadata: Metadata = {
  title: 'Về Minh Tấn',
  description: 'Sứ mệnh của TẤN VA: giúp người kinh doanh làm chủ kỹ năng video và xây phễu bán hàng tự động.',
};

const values = [
  { t: 'Kỹ năng thực chiến', d: 'Không dạy lý thuyết suông. Mọi bài học đều hướng tới kết quả bạn làm ra được từ chiếc smartphone.' },
  { t: 'Cộng đồng đồng hành', d: 'Gia nhập mạng lưới nhà sáng tạo nội dung luôn sẵn sàng hỗ trợ và chia sẻ kinh nghiệm.' },
  { t: 'Kiến thức đã kiểm chứng', d: 'Đúc kết từ hơn 10 năm sản xuất truyền hình và các chiến dịch video cho thương hiệu lớn.' },
];

export default function AboutPage() {
  return (
    <main>
      <section className="container-lux py-12 md:py-20 grid gap-12 lg:grid-cols-2 items-center">
        <div>
          <SectionHeading
            as="h1"

            title="Về TẤN VA"
            description="Sứ mệnh của chúng tôi là giúp một triệu doanh nhân và nhà sáng tạo làm chủ kỹ năng video chuẩn điện ảnh, rồi biến nó thành phễu bán hàng tự động."
          />
          <Link href="/courses" className="btn btn-gold mt-8">Khám phá khóa học <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
        <div className="relative aspect-[4/3] rounded-[var(--radius-card)] overflow-hidden bg-muted">
          <Image src="/asset/du_an_tieu_bieu/project_2n1d.webp" alt="Hậu trường show 2 Ngày 1 Đêm" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </section>

      <section className="section bg-card">
        <div className="container-lux">
          <SectionHeading title="Điều làm nên TẤN VA" />
          <dl className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-3">
            {values.map(({ t, d }) => (
              <div key={t}>
                <dt className="font-display text-3xl font-bold text-ink">{t}</dt>
                <dd className="mt-2 text-lg text-muted-foreground leading-relaxed">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container-lux section">
        <div className="surface-dark rounded-[var(--radius-card)] px-6 py-14 md:p-16 text-center">
          <h2 className="text-white">Bắt đầu hành trình của bạn</h2>
          <p className="mt-4 text-stone-300 max-w-xl mx-auto">Chiếc điện thoại của bạn đã đủ tốt. Thứ còn thiếu là phương pháp — và chúng tôi ở đây để trao nó cho bạn.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/courses" className="btn btn-gold">Xem khóa học</Link>
            <Link href="/coaching" className="btn btn-outline-light">Coaching 1:1</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
