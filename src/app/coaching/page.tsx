import type { Metadata } from 'next';
import Image from 'next/image';
import { Check, ArrowRight } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import { Reveal } from '@/components/motion/Motion';
import { getSiteSettings } from '@/lib/content';
import { contactFrom } from '@/lib/site-settings';
import ConsultBox from '@/components/ConsultBox';

export const metadata: Metadata = {
  title: 'Coaching 1:1',
  description: 'Học 1-1 cùng Minh Tấn: chụp ảnh, quay và dựng video bằng điện thoại hoặc bằng AI. Audit miễn phí 30 phút, gói 6 buổi và 10 buổi, học online hoặc offline.',
  alternates: { canonical: '/coaching' },
};

const packages = [
  {
    name: 'Gói Audit',
    price: 'Miễn phí',
    kind: 'audit' as const,
    duration: 'Tư vấn online · 30 phút',
    features: [
      'Xem kênh và video hiện tại của bạn',
      'Bắt lỗi hình ảnh, âm thanh, cách nói và cách dựng',
      'Định hướng nội dung phù hợp với bạn',
      'Gợi ý hướng đi và các bước làm tiếp theo',
    ],
    cta: 'Đặt lịch Audit miễn phí',
    featured: false,
  },
  {
    name: 'Gói 6 buổi',
    price: '10.000.000đ',
    kind: 'coaching' as const,
    duration: '6 buổi học 1-1 · online hoặc offline',
    features: [
      'Mỗi buổi 2 tiếng, học cá nhân hóa',
      'Học được toàn bộ nội dung khóa 21 Ngày',
      'Kèm cặp 1-1, đổi chương trình theo nhu cầu riêng',
      'Giao bài tập và quan sát bạn làm bài',
      'Hỗ trợ sửa bài 3 tháng sau khóa học',
    ],
    cta: 'Đăng ký gói 6 buổi',
    featured: true,
  },
  {
    name: 'Gói 10 buổi',
    price: '15.000.000đ',
    kind: 'coaching' as const,
    duration: '10 buổi học 1-1 · online hoặc offline, có thể đến tận nơi',
    features: [
      'Mỗi buổi 2 tiếng, học cá nhân hóa',
      'Học được toàn bộ nội dung khóa 21 Ngày',
      'Kèm cặp 1-1, đổi chương trình theo nhu cầu riêng',
      'Giao bài tập và quan sát bạn làm bài',
      'Hỗ trợ sửa bài vĩnh viễn sau khóa học',
      'Có bản ghi hình (record) từng buổi để xem lại',
    ],
    cta: 'Đăng ký gói 10 buổi',
    featured: false,
  },
];

// What a coaching student can choose to learn
const topics = [
  { title: 'Chụp ảnh bằng điện thoại', desc: 'Bố cục, ánh sáng, chân dung và ảnh sản phẩm đẹp chỉ với chiếc điện thoại.' },
  { title: 'Quay video bằng điện thoại', desc: 'Cài đặt máy, cỡ cảnh, góc máy, chuyển động và tự tin nói trước ống kính.' },
  { title: 'Dựng video bằng điện thoại', desc: 'Dựng nhanh trên CapCut: cắt, chữ, phụ đề, âm thanh, màu và xuất video.' },
  { title: 'Dựng video bằng AI', desc: 'Dùng công cụ AI để viết kịch bản, tạo hình ảnh và dựng video nhanh hơn.' },
];

export default async function CoachingPage() {
  const CONTACT = contactFrom(await getSiteSettings());
  return (
    <main>
      {/* Hero */}
      <section className="surface-dark">
        <div className="container-lux py-16 md:py-24 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div>
            <h1 className="text-white text-[clamp(1.75rem,5.5vw,4rem)]">Coaching 1:1 cùng Minh Tấn</h1>
            <p className="mt-6 text-lg text-stone-300 leading-relaxed max-w-xl">
              Học 1-1 theo đúng nhu cầu của bạn: chụp ảnh, quay video và dựng video bằng điện thoại, hoặc dựng video bằng AI. Minh Tấn kèm cặp, giao bài và sửa bài cho bạn.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a href="#goi-coaching" className="btn btn-gold">Xem các gói học <ArrowRight size={18} aria-hidden="true" /></a>
              <a href={CONTACT.zaloHref} target="_blank" rel="noopener noreferrer" className="btn btn-outline-light">Nhắn Zalo tư vấn</a>
            </div>
          </div>
          <div className="relative aspect-[4/5] max-w-md w-full mx-auto rounded-[var(--radius-card)] overflow-hidden">
            <Image src="/asset/avatar/hero_expert.jpg" alt="Minh Tấn" fill priority sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover" />
          </div>
        </div>
      </section>


      {/* Topics */}
      <section className="section bg-card">
        <div className="container-lux">
          <SectionHeading title="Bạn có thể chọn học" description="Chọn một hoặc kết hợp nhiều nội dung, chương trình được may đo theo bạn." />
          <dl className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {topics.map(({ title, desc }, i) => (
              <div key={title}>
                <span className="w-10 h-10 rounded-full bg-gold text-white font-bold flex items-center justify-center">{i + 1}</span>
                <dt className="mt-4 text-xl font-bold text-ink">{title}</dt>
                <dd className="mt-2 text-muted-foreground leading-relaxed">{desc}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Packages */}
      <section id="goi-coaching" className="section scroll-mt-20">
        <div className="container-lux">
          <SectionHeading title="Chọn gói phù hợp với bạn" align="center" description="Nhắn Zalo để được tư vấn gói hợp với mục tiêu của bạn trước khi đăng ký." />
          <Reveal className="mt-12 grid gap-6 lg:grid-cols-3 max-w-6xl mx-auto items-stretch">
            {packages.map((pkg) => (
              <div key={pkg.name} className={`relative rounded-[var(--radius-card)] p-8 md:p-10 flex flex-col ${pkg.featured ? 'surface-dark shadow-[var(--shadow-lift)]' : 'card'}`}>
                {pkg.featured && <span className="badge absolute -top-3 left-8 !bg-gold-light !text-onyx">Được chọn nhiều nhất</span>}
                <p className={`text-sm font-semibold ${pkg.featured ? 'text-gold-light' : 'text-gold'}`}>{pkg.duration}</p>
                <h3 className={`mt-2 text-3xl ${pkg.featured ? 'text-white' : ''}`}>{pkg.name}</h3>
                <div className="mt-4 flex items-baseline gap-3 flex-wrap">
                  <p className={`text-4xl font-extrabold tabular-nums ${pkg.featured ? 'text-white' : ''}`}>{pkg.price}</p>
                </div>
                <ul className={`mt-8 space-y-3 flex-1 ${pkg.featured ? 'text-stone-300' : 'text-stone'}`}>
                  {pkg.features.map((f) => (
                    <li key={f} className="flex gap-3"><Check size={18} className={`shrink-0 mt-0.5 ${pkg.featured ? 'text-gold-light' : 'text-gold'}`} aria-hidden="true" /> {f}</li>
                  ))}
                </ul>
                <div className="mt-8">
                  {pkg.kind === 'audit' ? (
                    <ConsultBox kind="audit" product={pkg.name} zaloHref={CONTACT.zaloHref} label={pkg.cta} variant="dark" />
                  ) : (
                    <ConsultBox kind="coaching" product={pkg.name} zaloHref={CONTACT.zaloHref} label={pkg.cta} variant={pkg.featured ? 'gold' : 'dark'} />
                  )}
                  <a href={CONTACT.zaloHref} target="_blank" rel="noopener noreferrer" className={`mt-2 flex items-center justify-center gap-2 min-h-[44px] text-sm hover:underline ${pkg.featured ? 'text-gold-light' : 'text-gold'}`}>
                    Hoặc nhắn Zalo hỏi trước <ArrowRight size={16} aria-hidden="true" />
                  </a>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>
    </main>
  );
}
