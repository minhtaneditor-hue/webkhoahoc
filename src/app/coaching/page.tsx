import type { Metadata } from 'next';
import Image from 'next/image';
import { Check, ShieldCheck, ArrowRight } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import { CONTACT } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Coaching 1:1',
  description: 'Chương trình đồng hành 1:1 cùng Minh Tấn: chiến lược nội dung, thương hiệu cá nhân và mô hình kinh doanh bằng video.',
};

const packages = [
  {
    name: 'Platinum Companion',
    price: '2.000 USD',
    duration: '1 tháng đồng hành',
    features: [
      '8 buổi học trực tiếp 1:1 cùng mentor',
      'Tư vấn định hướng chiến lược mô hình kinh doanh',
      'Trọn bộ khóa học online (vĩnh viễn)',
      'Cam kết đạt mục tiêu video cụ thể',
      'Hỗ trợ trực tiếp qua Zalo/Zoom',
      'Tặng bộ Sound FX, Transitions, Overlays',
    ],
    cta: 'Đặt lịch tư vấn miễn phí',
    featured: false,
  },
  {
    name: 'Elite Transformation',
    price: '5.000 USD',
    duration: '4 tháng đồng hành',
    features: [
      'Toàn bộ quyền lợi gói Platinum',
      'Đồng hành xây kênh TikTok, YouTube trong 4 tháng',
      '1 buổi Zoom chiến lược mỗi tuần',
      'Giao bài tập và theo sát hành động mỗi ngày',
      'Định hướng thương hiệu cá nhân dài hạn',
      'Tham gia các buổi quay thực tế cùng mentor',
    ],
    cta: 'Đăng ký xét tuyển',
    featured: true,
  },
];

const pillars = [
  { title: 'Chiến lược marketing', desc: 'Xây thương hiệu cá nhân đủ mạnh để nhãn hàng tự tìm đến bạn.' },
  { title: 'Định hướng thu nhập', desc: 'Lộ trình từ 0 tới 1.000 USD đầu tiên và cách nhân bản con số đó.' },
  { title: 'Mô hình kinh doanh', desc: 'Đóng gói kiến thức thành sản phẩm số tạo thu nhập bền vững.' },
];

export default function CoachingPage() {
  return (
    <main>
      {/* Hero */}
      <section className="surface-dark">
        <div className="container-lux py-16 md:py-24 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div>
            <h1 className="text-white">Coaching 1:1 cùng Minh Tấn</h1>
            <p className="mt-6 text-lg text-stone-300 leading-relaxed max-w-xl">
              Học cách kinh doanh bằng hình ảnh trong một chương trình đồng hành riêng, để video trở thành nguồn thu nhập và sự nghiệp tự do thực sự.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a href="#goi-coaching" className="btn btn-gold">Xem các gói đồng hành <ArrowRight size={18} aria-hidden="true" /></a>
              <a href={CONTACT.zaloHref} target="_blank" rel="noopener noreferrer" className="btn btn-outline-light">Nhắn Zalo tư vấn</a>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm text-stone-400"><ShieldCheck size={16} className="text-gold-light" aria-hidden="true" /> Mỗi tháng chỉ nhận tối đa 2 học viên</p>
          </div>
          <div className="relative aspect-[4/5] max-w-md w-full mx-auto rounded-[var(--radius-card)] overflow-hidden">
            <Image src="/asset/avatar/hero_expert.jpg" alt="Minh Tấn" fill priority sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section">
        <div className="container-lux max-w-3xl">
          <h2>Hành trình thoát khỏi vòng xoáy</h2>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-stone">
            <p>Vài năm trước, tôi cũng như bạn: làm văn phòng 8–10 tiếng mỗi ngày, kiệt sức và bế tắc — cho tới khi phải nhập viện vì áp lực.</p>
            <p>Đó là lúc tôi bỏ việc và bắt đầu lại từ con số 0 với nghề làm phim. Gia đình phản đối, bạn bè hoài nghi, nhưng tôi tin video là tương lai.</p>
            <p>Sau nhiều năm, tôi nhận ra khác biệt giữa người làm phim nghiệp dư và người kinh doanh bằng hình ảnh không nằm ở chiếc máy quay, mà ở <strong className="text-ink">tư duy chiến lược</strong>.</p>
          </div>
          <blockquote className="mt-10 font-display text-3xl leading-snug text-ink">
            Hôm nay, tôi ở đây để giúp bạn rút ngắn hành trình đó.
          </blockquote>
        </div>
      </section>

      {/* Pillars */}
      <section className="section bg-card">
        <div className="container-lux">
          <SectionHeading title="Ba trụ cột của chương trình" />
          <dl className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-3">
            {pillars.map(({ title, desc }) => (
              <div key={title}>
                <dt className="font-display text-3xl font-bold text-ink">{title}</dt>
                <dd className="mt-2 text-lg text-muted-foreground leading-relaxed">{desc}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Packages */}
      <section id="goi-coaching" className="section scroll-mt-20">
        <div className="container-lux">
          <SectionHeading title="Chọn gói phù hợp với bạn" align="center" description="Hoàn tiền trong 7 ngày đầu nếu chương trình chưa phù hợp." />
          <div className="mt-12 grid gap-6 lg:grid-cols-2 max-w-5xl mx-auto">
            {packages.map((pkg) => (
              <div key={pkg.name} className={`relative rounded-[var(--radius-card)] p-8 md:p-10 flex flex-col ${pkg.featured ? 'surface-dark shadow-[var(--shadow-lift)]' : 'card'}`}>
                {pkg.featured && <span className="badge absolute -top-3 left-8 !bg-gold-light !text-onyx">Hiệu quả nhất</span>}
                <p className={`text-sm font-semibold ${pkg.featured ? 'text-gold-light' : 'text-gold'}`}>{pkg.duration}</p>
                <h3 className={`mt-2 text-3xl ${pkg.featured ? 'text-white' : ''}`}>{pkg.name}</h3>
                <p className={`mt-4 font-display text-5xl font-bold ${pkg.featured ? 'text-white' : ''}`}>{pkg.price}</p>
                <ul className={`mt-8 space-y-3 flex-1 ${pkg.featured ? 'text-stone-300' : 'text-stone'}`}>
                  {pkg.features.map((f) => (
                    <li key={f} className="flex gap-3"><Check size={18} className={`shrink-0 mt-0.5 ${pkg.featured ? 'text-gold-light' : 'text-gold'}`} aria-hidden="true" /> {f}</li>
                  ))}
                </ul>
                <a href={CONTACT.zaloHref} target="_blank" rel="noopener noreferrer" className={`btn mt-8 w-full ${pkg.featured ? 'btn-gold' : 'btn-dark'}`}>
                  {pkg.cta} <ArrowRight size={18} aria-hidden="true" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
