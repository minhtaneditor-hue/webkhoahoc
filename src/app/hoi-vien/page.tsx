import type { Metadata } from 'next';
import { Check, ShieldCheck, RefreshCcw, QrCode, LayoutTemplate, FolderGit2, Radio, BookLock, BadgePercent, Users } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import FaqList from '@/components/FaqList';
import MembershipBuy from '@/components/membership/MembershipBuy';
import { MEMBERSHIP_PLANS, MEMBER_DISCOUNT_PERCENT } from '@/lib/membership';
import { Reveal } from '@/components/motion/Motion';
import { getSiteSettings } from '@/lib/content';
import { contactFrom } from '@/lib/site-settings';

// Trial page: kept out of search and the sitemap until payment for memberships is wired up.
export const metadata: Metadata = {
  title: 'Hội viên TẤN VA',
  description: 'Hội viên TẤN VA: template dựng video mới mỗi tháng, kho repo AI, live hỏi đáp và chữa video, giảm giá khoá học và Shop.',
  alternates: { canonical: '/hoi-vien' },
  robots: { index: false, follow: false },
};

// Same numbers the checkout charges
const MONTHLY = MEMBERSHIP_PLANS.thang.price;
const YEARLY = MEMBERSHIP_PLANS.nam.price;
const vnd = (n: number) => `${n.toLocaleString('vi-VN')}đ`;

const plans = [
  {
    id: 'thang' as const,
    file: 'hoi-vien-thang.mp4',
    length: '01 tháng',
    name: 'Theo tháng',
    price: vnd(MONTHLY),
    per: '/tháng',
    total: null as string | null,
    strike: null as string | null,
    note: 'Linh hoạt, dùng thử trước khi gắn bó.',
    cta: 'Đăng ký gói tháng',
    featured: false,
  },
  {
    id: 'nam' as const,
    file: 'hoi-vien-nam.mp4',
    length: '12 tháng',
    name: 'Theo năm',
    price: `≈${vnd(Math.round(YEARLY / 12 / 1000) * 1000)}`,
    per: '/tháng',
    total: `Trả một lần ${vnd(YEARLY)}`,
    strike: vnd(MONTHLY * 12),
    note: `Tặng 4 tháng: tiết kiệm ${vnd(MONTHLY * 12 - YEARLY)} so với trả theo tháng.`,
    cta: 'Đăng ký gói năm',
    featured: true,
  },
];

const benefits = [
  { icon: LayoutTemplate, title: '2 template dựng video mới mỗi tháng', desc: 'Lấy từ thư viện dựng riêng của Tấn, dùng được ngay cho CapCut và Remotion.' },
  { icon: FolderGit2, title: 'Kho repo AI cho người làm video', desc: 'Các công cụ AI đã chọn lọc, cập nhật khi có repo mới đáng dùng.' },
  { icon: Radio, title: 'Live hỏi đáp và chữa video mỗi tháng', desc: '60 phút cùng Tấn, có bản ghi để xem lại nếu bạn bận.' },
  { icon: BookLock, title: 'Bài viết chuyên sâu chỉ dành cho hội viên', desc: 'Cách làm chi tiết, file mẫu và quy trình Tấn đang dùng thật.' },
  { icon: BadgePercent, title: `Giảm ${MEMBER_DISCOUNT_PERCENT.course}% khoá học, ${MEMBER_DISCOUNT_PERCENT.asset}% Shop`, desc: 'Mua một khoá học là đã gần bù được phí hội viên cả năm.' },
  { icon: Users, title: 'Nhóm Zalo hội viên', desc: 'Hỏi nhanh, chia sẻ video và nhận góp ý từ những người cùng làm.' },
];

const assurances = [
  { icon: QrCode, text: 'Chuyển khoản qua mã QR, kích hoạt tự động' },
  { icon: RefreshCcw, text: 'Không tự gia hạn, mua thêm thì cộng nối tiếp thời hạn' },
  { icon: ShieldCheck, text: 'Hoàn tiền trong 7 ngày nếu chưa phù hợp' },
];

const faqs = [
  { q: 'Hội viên khác gì so với mua khoá học?', a: 'Khoá học dạy bạn một kỹ năng trọn vẹn từ đầu đến cuối. Hội viên là phần đồng hành sau đó: mỗi tháng có template mới, live chữa video và cập nhật công cụ, để bạn không bị tụt lại.' },
  { q: 'Hết hạn có bị trừ tiền tự động không?', a: 'Không. Bạn chuyển khoản qua mã QR cho từng lần mua, không lưu thẻ. Hết hạn thì quyền lợi hội viên tạm dừng, muốn tiếp tục thì mua thêm và thời hạn được cộng nối tiếp.' },
  { q: 'Mình đang là học viên thì có ưu đãi gì không?', a: 'Có. Học viên đã mua khoá học được tặng thời gian hội viên miễn phí. Nhắn Zalo cho Tấn để được kích hoạt.' },
  { q: 'Template và repo có dùng được sau khi hết hạn không?', a: 'Những template bạn đã tải về trong thời gian là hội viên vẫn dùng được. Template mới, live và giảm giá chỉ áp dụng khi bạn còn là hội viên.' },
  { q: 'Mình mới bắt đầu thì có nên tham gia không?', a: 'Nếu bạn chưa từng dựng video, nên bắt đầu từ một khoá học hoặc bài học thử miễn phí trước. Hội viên hợp nhất khi bạn đã làm video đều đặn và muốn làm nhanh, đẹp hơn.' },
];

export default async function MembershipPage() {
  const CONTACT = contactFrom(await getSiteSettings());
  return (
    <main>
      {/* Intro */}
      <section className="container-lux pt-14 md:pt-20 pb-10 md:pb-14 text-center">
        <h1 className="text-ink max-w-4xl mx-auto">
          Hội viên TẤN VA.<br />
          <span className="text-gold">Mỗi tháng một bước mới.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Template dựng video, công cụ AI và buổi chữa video cùng Tấn, đều đặn mỗi tháng, cho người đã làm video và muốn làm tốt hơn.
        </p>
      </section>

      {/* Pricing stage: one dark ember block with a faint grid, the only loud surface on the page */}
      <section id="bang-gia" className="px-3 sm:px-5 scroll-mt-20">
        <div className="surface-dark relative overflow-hidden rounded-[var(--radius-xl)] max-w-[1320px] mx-auto">
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none [background-image:linear-gradient(rgba(245,240,233,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(245,240,233,0.06)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_40%,#000_40%,transparent_100%)]"
          />
          <div className="relative container-lux py-14 md:py-20">
            <SectionHeading light align="center" title="Chọn cách trả phù hợp" description="Cùng một quyền lợi, gói năm rẻ hơn 4 tháng." />

            <Reveal className="mt-12 grid gap-6 md:grid-cols-2 max-w-4xl mx-auto items-stretch">
              {plans.map((p) => (
                <div
                  key={p.id}
                  className={`relative card flex flex-col overflow-hidden text-ink ${p.featured ? 'ring-2 ring-gold-light shadow-[var(--shadow-lift)] order-first md:order-none' : ''}`}
                >
                  {/* Card header styled like a clip in an editing timeline */}
                  <div className="flex items-center gap-2.5 px-6 py-3 border-b border-line bg-ivory text-sm">
                    <span className={`w-2.5 h-2.5 rounded-full ${p.featured ? 'bg-gold' : 'bg-line-strong'}`} aria-hidden="true" />
                    <span className="font-medium text-stone">{p.file}</span>
                    <span className="ml-auto tabular-nums text-muted-foreground">{p.length}</span>
                  </div>

                  <div className="p-7 md:p-8 flex flex-col flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-2xl">{p.name}</h3>
                      {p.featured && <span className="badge">Tặng 4 tháng</span>}
                    </div>

                    <p className="mt-5 flex items-baseline gap-1.5 flex-wrap">
                      <span className={`text-[clamp(2.25rem,5vw,3rem)] font-extrabold tracking-[-0.03em] tabular-nums leading-none ${p.featured ? 'text-gold' : 'text-ink'}`}>{p.price}</span>
                      <span className="text-muted-foreground">{p.per}</span>
                    </p>

                    <p className="mt-3 min-h-[1.5rem] text-sm tabular-nums text-stone">
                      {p.total && <>{p.total} <s className="ml-1 text-muted-foreground">{p.strike}</s></>}
                    </p>
                    <p className={`mt-1 text-sm font-medium ${p.featured ? 'text-success' : 'text-muted-foreground'}`}>{p.note}</p>

                    <div className="mt-auto pt-8">
                      <MembershipBuy plan={p.id} label={p.cta} featured={p.featured} />
                    </div>
                  </div>
                </div>
              ))}
            </Reveal>

            {/* Shared benefits: both plans get exactly the same */}
            <div className="mt-6 max-w-4xl mx-auto card p-7 md:p-10 text-ink">
              <h3 className="text-xl">Cả hai gói đều có</h3>
              <ul className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">
                {benefits.map(({ icon: Icon, title, desc }) => (
                  <li key={title} className="flex gap-4">
                    <span className="w-10 h-10 shrink-0 rounded-[var(--radius-md)] bg-gold-soft text-gold flex items-center justify-center">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-semibold leading-snug">{title}</p>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <ul className="mt-10 flex flex-col sm:flex-row flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-stone-300">
              {assurances.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2">
                  <Icon size={16} className="text-gold-light shrink-0" aria-hidden="true" /> {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Student gift */}
      <section className="container-lux pt-16 md:pt-24">
        <div className="card p-7 md:p-10 grid gap-6 md:grid-cols-[1fr_auto] items-center">
          <div>
            <h2 className="text-[clamp(1.5rem,2.6vw,2rem)]">Đã là học viên? Bạn được tặng thời gian hội viên.</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed max-w-2xl">Mỗi khoá học đã mua đi kèm thời gian hội viên miễn phí. Nhắn Zalo cho Tấn để được kích hoạt.</p>
          </div>
          <a href={CONTACT.zaloHref} target="_blank" rel="noopener noreferrer" className="btn btn-dark">
            <Check size={18} aria-hidden="true" /> Nhắn Zalo kích hoạt
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container-lux max-w-4xl">
          <SectionHeading title="Câu hỏi thường gặp" />
          <div className="mt-10">
            <FaqList items={faqs} />
          </div>
        </div>
      </section>
    </main>
  );
}
