import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check, Quote, PlayCircle } from 'lucide-react';
import { getPublicSupabase, formatVND } from '@/lib/supabase-public';
import SectionHeading from '@/components/SectionHeading';
import FaqList from '@/components/FaqList';
import { ShutterImage, Reveal } from '@/components/motion/Motion';
import ScrollReveal from '@/components/reactbits/ScrollReveal';

export const revalidate = 300;

const FEATURED_COURSE_ID = 'd290f1ee-6c54-4b01-90e6-d701748f0851';

const partners = [
  { name: 'Phú Long', logo: '/asset/doi_tac/partner_phulong.webp' },
  { name: 'Viglacera', logo: '/asset/doi_tac/partner_viglacera.webp' },
  { name: 'Suntory PepsiCo', logo: '/asset/doi_tac/partner_pepsico.png' },
  { name: 'HTV', logo: '/asset/doi_tac/partner_htv.png' },
  { name: 'Vietjet', logo: '/asset/doi_tac/partner_vietjet.jpg' },
];

const projects = [
  { title: '2 Ngày 1 Đêm', category: 'Show truyền hình', image: '/asset/du_an_tieu_bieu/project_2n1d.webp' },
  { title: 'Anh Trai Say Hi — Movie', category: 'Sản xuất điện ảnh', image: '/asset/du_an_tieu_bieu/project_atsh_movie.jpg' },
  { title: 'Anh Trai Say Hi — Las Vegas', category: 'Sự kiện quốc tế', image: '/asset/du_an_tieu_bieu/project_atsh_vegas.webp' },
  { title: 'Nghệ Thuật Truyền Hình', category: 'Nội dung số', image: '/asset/du_an_tieu_bieu/project_nhth.jpg' },
  { title: 'Mái Ấm Tình Thương', category: 'Phim tài liệu', image: '/asset/du_an_tieu_bieu/project_matn.webp' },
  { title: 'Ký Ức Vui Vẻ', category: 'Sản xuất truyền hình', image: '/asset/du_an_tieu_bieu/project_kuvv.png' },
];

const testimonials = [
  { name: 'Trần Thành Tân', title: 'Cinematographer', quote: 'Tôi làm chủ được ngôn ngữ hình ảnh và có video đầu tiên lên top trending.', avatar: '/asset/hoc_vien/tan.jpg', result: 'Top 1 Trending' },
  { name: 'Nguyễn Đăng Hạnh', title: 'Founder Chú Lùn Bakery', quote: 'Tiệm bánh nhỏ của tôi giờ có một cỗ máy nội dung chạy đều mỗi tuần.', avatar: '/asset/hoc_vien/hanh.jpg', result: '+300% doanh thu' },
  { name: 'Nguyễn Tiến Dương', title: 'Founder Thành Đô', quote: 'Video chỉn chu giúp khách hàng tin dịch vụ của chúng tôi ngay từ lần xem đầu.', avatar: '/asset/hoc_vien/duong.jpg', result: 'Nâng tầm uy tín' },
];

const outcomes = [
  'Quay đẹp bằng chính chiếc điện thoại bạn đang có',
  'Viết hook giữ chân người xem trong 3 giây đầu',
  'Dựng video nhanh với quy trình chuẩn truyền hình',
  'Biến lượt xem thành khách hàng và doanh thu',
];

const bonuses = [
  { title: 'Kèm cặp 1:1 trọn đời', desc: 'Hỏi trực tiếp qua Zalo và nhóm kín, không phải tự mò một mình.' },
  { title: 'Kho 100+ kịch bản', desc: 'Mẫu nội dung đã kiểm chứng, chỉ cần điền thông tin của bạn.' },
  { title: 'Thư viện nhạc bản quyền', desc: 'Nhạc nền theo xu hướng, dùng thoải mái không lo bị gỡ video.' },
  { title: 'Template thiết kế', desc: 'Ảnh bìa và hiệu ứng chữ chuyên nghiệp từ studio của Minh Tấn.' },
];

const faqs = [
  { q: 'Điện thoại cũ có học được không?', a: 'Được. Khóa học dạy bạn làm chủ ánh sáng và góc máy để bù lại giới hạn của thiết bị; điện thoại vài năm tuổi vẫn cho ra hình đẹp.' },
  { q: 'Tôi ngại lên hình thì sao?', a: 'Bạn có thể làm video voice-over, quay tay, quay sản phẩm hoặc bối cảnh. Khóa học có riêng chiến lược cho người không muốn lộ mặt.' },
  { q: 'Học xong chưa ra kết quả thì sao?', a: 'Bạn được hỗ trợ 1:1 cho tới khi dựng xong phễu bán hàng đầu tiên. Ngoài ra có chính sách hoàn tiền trong 7 ngày.' },
  { q: 'Tôi học được bao lâu?', a: 'Truy cập trọn đời, bao gồm mọi bài học cập nhật sau này.' },
];

async function getFeaturedCourse() {
  const supabase = getPublicSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from('courses')
    .select('id, title, description, price, old_price')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  return data?.find((c) => c.id === FEATURED_COURSE_ID) || data?.[0] || null;
}

export default async function Home() {
  const course = await getFeaturedCourse();
  const courseHref = course ? `/courses/${course.id}` : '/courses';

  return (
    <main>
      {/* Hero: a short title, the portrait opens like a camera shutter (signature move) */}
      <section className="container-lux pt-10 pb-16 md:pt-14 md:pb-24 grid gap-10 lg:gap-16 lg:grid-cols-[1.05fr_0.95fr] items-center">
        <Reveal stagger={0.1}>
          <h1 className="text-ink text-[clamp(3rem,8vw,6rem)] leading-[0.95] tracking-[-0.02em]">Video là tài sản.</h1>
          <p className="mt-6 text-xl md:text-2xl text-stone leading-snug max-w-xl">
            Học quay, dựng và bán hàng bằng video từ người làm truyền hình, chỉ với chiếc điện thoại của bạn.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Link href={courseHref} className="btn btn-gold">
              Xem khóa học 21 ngày <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href="/coaching" className="btn btn-outline">Đặt lịch coaching 1:1</Link>
          </div>
          <p className="mt-8 text-muted-foreground">
            Hơn 1.000 học viên đã học. Người dạy đã tham gia sản xuất <span className="text-ink font-semibold">2 Ngày 1 Đêm</span> và <span className="text-ink font-semibold">Anh Trai Say Hi</span>.
          </p>
        </Reveal>

        <ShutterImage className="relative aspect-[4/5] overflow-hidden bg-onyx">
          <Image src="/asset/avatar/hero_expert.jpg" alt="Minh Tấn, Video Advisor" fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-onyx/80 to-transparent" aria-hidden="true" />
          <p className="absolute left-6 bottom-6 md:left-8 md:bottom-8 font-display text-4xl font-semibold text-white">Minh Tấn</p>
        </ShutterImage>
      </section>

      {/* Partners: a quiet strip, no rules */}
      <section aria-labelledby="partners-title" className="container-lux pb-16 md:pb-20">
        <h2 id="partners-title" className="font-sans text-base font-medium text-muted-foreground">Đồng hành cùng các thương hiệu và đài truyền hình</h2>
        <ul className="mt-6 grid grid-cols-3 md:grid-cols-5 gap-x-10 gap-y-6 items-center">
          {partners.map((p) => (
            <li key={p.name} className="relative h-12 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition duration-300">
              <Image src={p.logo} alt={p.name} fill sizes="160px" className="object-contain" />
            </li>
          ))}
        </ul>
      </section>

      {/* Statement: words fill with ink as they rise through the screen (React Bits ScrollReveal) */}
      <section className="bg-card">
        <div className="container-lux py-20 md:py-28">
          <ScrollReveal
            baseOpacity={0.12}
            enableBlur={false}
            baseRotation={0}
            containerClassName="max-w-4xl"
            textClassName="font-display font-semibold text-[clamp(2rem,4.6vw,3.75rem)] leading-[1.15] text-ink"
          >
            Một video quay tử tế sẽ tiếp tục bán hàng cho bạn nhiều năm sau ngày đăng. Khóa học này dạy bạn làm ra những video như thế.
          </ScrollReveal>
        </div>
      </section>

      {/* Featured course: outcomes as a plain list beside a filled price panel */}
      <section className="section">
        <div className="container-lux grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <div>
            <SectionHeading
              title={course?.title || '21 Ngày Biến Video Thành Tài Sản'}
              description={course?.description || 'Trại huấn luyện 21 ngày giúp bạn xây cỗ máy nội dung và thu nhập từ smartphone.'}
            />
            <Reveal as="ul" className="mt-10 space-y-5" from="left">
              {outcomes.map((o) => (
                <li key={o} className="flex gap-4 text-xl text-ink leading-snug">
                  <Check size={22} className="text-gold shrink-0 mt-1" aria-hidden="true" /> {o}
                </li>
              ))}
            </Reveal>
          </div>

          <div className="surface-dark p-8 md:p-10">
            <p className="text-gold-light font-semibold">Học phí trọn gói</p>
            <div className="mt-3 flex items-baseline gap-3 flex-wrap">
              <p className="font-display text-6xl font-semibold text-white">{course ? formatVND(course.price) : 'Liên hệ'}</p>
              {course?.old_price && Number(course.old_price) > Number(course.price) && (
                <p className="text-lg text-stone-400 line-through">{formatVND(course.old_price)}</p>
              )}
            </div>
            <ul className="mt-8 space-y-3 text-stone-300 text-lg">
              {['Truy cập trọn đời', 'Hỗ trợ 1:1 qua Zalo', 'Hoàn tiền trong 7 ngày', 'Thanh toán an toàn qua VNPay'].map((x) => (
                <li key={x} className="flex gap-3"><Check size={20} className="text-gold-light shrink-0 mt-1" aria-hidden="true" /> {x}</li>
              ))}
            </ul>
            <Link href={courseHref} className="btn btn-gold w-full mt-10">
              Xem lộ trình và đăng ký <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href={courseHref} className="mt-3 flex items-center justify-center gap-2 text-gold-light hover:underline min-h-[44px]">
              <PlayCircle size={18} aria-hidden="true" /> Học thử miễn phí bài đầu tiên
            </Link>
          </div>
        </div>
      </section>

      {/* What comes with it: large type in two columns, no icon boxes */}
      <section className="bg-card">
        <div className="container-lux section grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading title="Đi kèm khóa học" description="Mọi thứ cần để bắt đầu ngay trong tuần đầu tiên." />
          <Reveal as="dl" className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {bonuses.map((b) => (
              <div key={b.title}>
                <dt className="font-display text-3xl font-semibold text-ink">{b.title}</dt>
                <dd className="mt-2 text-lg text-muted-foreground leading-relaxed">{b.desc}</dd>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Projects: a drag row of large pictures (scroll-snap, no library) */}
      <section className="section overflow-hidden">
        <div className="container-lux flex flex-col md:flex-row md:items-end justify-between gap-6">
          <SectionHeading title="Từ phim trường truyền hình" description="Những chương trình Minh Tấn đã tham gia sản xuất. Kéo ngang để xem." />
          <Link href="/work" className="btn btn-outline self-start md:self-auto">Xem tất cả dự án</Link>
        </div>
        <ul
          className="mt-12 flex gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 px-5 md:px-[max(2rem,calc((100vw-1200px)/2+2rem))] scroll-px-5 md:scroll-px-[max(2rem,calc((100vw-1200px)/2+2rem))]"
          aria-label="Dự án tiêu biểu"
          tabIndex={0}
        >
          {projects.map((p) => (
            <li key={p.title} className="snap-start shrink-0 w-[78vw] sm:w-[46vw] lg:w-[34vw] max-w-[520px]">
              <Link href="/work" className="group block">
                <span className="relative block aspect-[4/5] overflow-hidden bg-muted">
                  <Image src={p.image} alt={p.title} fill sizes="(min-width: 1024px) 34vw, (min-width: 640px) 46vw, 78vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                </span>
                <span className="mt-4 block text-gold font-semibold">{p.category}</span>
                <span className="mt-1 block font-display text-3xl font-semibold text-ink group-hover:text-gold transition-colors">{p.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Testimonials on a dark field */}
      <section className="surface-dark">
        <div className="container-lux section">
          <SectionHeading title="Kết quả thật từ người đã học" light />
          <Reveal className="mt-14 grid gap-12 md:grid-cols-3" from="mask">
            {testimonials.map((t) => (
              <figure key={t.name} className="flex flex-col">
                <Quote size={32} className="text-gold-light" aria-hidden="true" />
                <blockquote className="mt-4 font-display text-[1.75rem] leading-snug text-white flex-1">{t.quote}</blockquote>
                <figcaption className="mt-8 flex items-center gap-4">
                  <span className="relative w-14 h-14 rounded-full overflow-hidden shrink-0">
                    <Image src={t.avatar} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-white">{t.name}</span>
                    <span className="block text-stone-400">{t.title} · <span className="text-gold-light">{t.result}</span></span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </Reveal>
          <div className="mt-14">
            <Link href="/students" className="btn btn-outline-light">Xem thêm câu chuyện học viên</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container-lux grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading title="Bạn còn băn khoăn?" description="Không thấy câu trả lời? Bấm nút Hỗ trợ ở góc phải để nhắn trực tiếp cho đội ngũ." />
          <FaqList items={faqs} />
        </div>
      </section>

      {/* Closing call to action */}
      <section className="surface-dark">
        <div className="container-lux py-20 md:py-28 grid gap-10 lg:grid-cols-[1.3fr_0.7fr] items-end">
          <h2 className="text-white text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[1]">Học thử bài đầu tiên, miễn phí.</h2>
          <div className="flex flex-col gap-3">
            <Link href={courseHref} className="btn btn-gold">Vào học thử <ArrowRight size={18} aria-hidden="true" /></Link>
            <Link href="/courses" className="btn btn-outline-light">Xem tất cả khóa học</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
