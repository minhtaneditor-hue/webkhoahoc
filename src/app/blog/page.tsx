import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Chiến thuật, tư duy và kỹ thuật làm video, xây thương hiệu cá nhân từ Minh Tấn Academy.',
};

// Topics planned for the blog. Shown as "coming soon" until real posts exist (no dead links).
const upcoming = [
  { title: 'Cách tối ưu ánh sáng điện ảnh cho video quay bằng điện thoại', cat: 'Sản xuất', desc: 'Bí mật đằng sau những cảnh quay triệu view chỉ với một nguồn sáng tự nhiên.' },
  { title: 'Hành trình xây dựng thương hiệu cá nhân từ con số 0', cat: 'Thương hiệu', desc: 'Định vị bản thân trong ngách cạnh tranh và thu hút đúng tệp khách hàng.' },
  { title: 'Xu hướng video 2026: điều gì sẽ lên ngôi?', cat: 'Chiến lược', desc: 'Phân tích số liệu và dự đoán sự bùng nổ của nội dung ngắn kết hợp AI.' },
];

export default function BlogPage() {
  return (
    <main>
      <section className="container-lux pt-12 pb-10 md:pt-20">
        <SectionHeading as="h1" eyebrow="Blog" title="Ghi chép từ phòng dựng" description="Chiến thuật, tư duy và kỹ thuật mới nhất về video và bán hàng bằng nội dung." />
      </section>

      <section className="container-lux pb-20">
        <ul className="grid gap-6 md:grid-cols-3">
          {upcoming.map((post) => (
            <li key={post.title} className="card p-7 flex flex-col">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="badge">{post.cat}</span>
                <span className="flex items-center gap-1.5 text-muted-foreground"><Clock size={14} aria-hidden="true" /> Sắp đăng</span>
              </div>
              <h2 className="mt-5 text-2xl">{post.title}</h2>
              <p className="mt-3 text-muted-foreground flex-1">{post.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-lux pb-24">
        <div className="surface-dark rounded-[var(--radius-card)] p-8 md:p-14 grid gap-8 lg:grid-cols-[1.3fr_1fr] items-center">
          <div>
            <p className="eyebrow !text-gold-light">Muốn đi nhanh hơn?</p>
            <h2 className="mt-4 text-white">Vượt xa kỹ thuật, làm chủ sự nghiệp</h2>
            <p className="mt-4 text-stone-300">Đọc blog cho bạn kiến thức. Coaching 1:1 cho bạn một người đồng hành theo sát trong 4 tháng.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/coaching" className="btn btn-gold">Tìm hiểu Coaching 1:1 <ArrowRight size={18} aria-hidden="true" /></Link>
            <Link href="/courses" className="btn btn-outline-light">Xem khóa học online</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
