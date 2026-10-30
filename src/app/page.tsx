import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check, Users, FileText, Music, LayoutTemplate, Quote, PlayCircle } from 'lucide-react';
import { getPublicSupabase, formatVND } from '@/lib/supabase-public';
import SectionHeading from '@/components/SectionHeading';
import FaqList from '@/components/FaqList';

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
  { title: 'Kèm cặp 1:1 trọn đời', desc: 'Hỏi trực tiếp qua Zalo và nhóm kín — bạn không phải tự mò một mình.', icon: Users },
  { title: 'Kho 100+ kịch bản', desc: 'Mẫu nội dung đã kiểm chứng, chỉ cần điền thông tin của bạn.', icon: FileText },
  { title: 'Thư viện nhạc bản quyền', desc: 'Nhạc nền theo xu hướng, dùng thoải mái không lo bị gỡ video.', icon: Music },
  { title: 'Template thiết kế', desc: 'Ảnh bìa và hiệu ứng chữ chuyên nghiệp từ studio của Minh Tấn.', icon: LayoutTemplate },
];

const faqs = [
  { q: 'Điện thoại cũ có học được không?', a: 'Được. Khóa học dạy bạn làm chủ ánh sáng và góc máy để bù lại giới hạn của thiết bị — điện thoại vài năm tuổi vẫn cho ra hình đẹp.' },
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
      {/* Hero */}
      <section className="container-lux pt-10 pb-16 md:pt-16 md:pb-24 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <div className="animate-fade-up">
          <p className="eyebrow mb-6"><span className="gold-rule" aria-hidden="true" /> Học viện video của Minh Tấn</p>
          <h1 className="text-ink">
            Video là <em className="text-gold not-italic font-semibold">tài sản</em>,<br className="hidden sm:block" /> không chỉ là nội dung.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
            Học quay, dựng và bán hàng bằng video từ người làm nghề truyền hình — chỉ với chiếc điện thoại của bạn.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href={courseHref} className="btn btn-gold">
              Xem khóa học nổi bật <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href="/coaching" className="btn btn-outline">Đặt lịch coaching 1:1</Link>
          </div>
          <dl className="mt-10 pt-8 border-t border-line grid grid-cols-3 gap-4 sm:gap-6 max-w-md">
            {[
              ['1.000+', 'Học viên'],
              ['10+ năm', 'Làm truyền hình'],
              ['Trọn đời', 'Truy cập khóa học'],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="font-display text-2xl sm:text-3xl font-semibold text-ink mt-1 whitespace-nowrap">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] rounded-[var(--radius-card)] overflow-hidden bg-onyx shadow-[var(--shadow-lift)]">
            <Image src="/asset/avatar/hero_expert.jpg" alt="Minh Tấn — Video Advisor" fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-onyx/80 via-transparent to-transparent" aria-hidden="true" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gold-light">Video Advisor</p>
              <p className="font-display text-4xl font-semibold text-white mt-1">Minh Tấn</p>
            </div>
          </div>
          <div className="hidden md:block absolute -left-6 top-10 card px-5 py-4 shadow-[var(--shadow-lift)]">
            <p className="text-xs text-muted-foreground">Đã tham gia sản xuất</p>
            <p className="font-display text-xl font-semibold">2 Ngày 1 Đêm · Anh Trai Say Hi</p>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="border-y border-line bg-card" aria-labelledby="partners-title">
        <div className="container-lux py-10">
          <p id="partners-title" className="text-center text-sm text-muted-foreground mb-8">Đồng hành cùng các thương hiệu và đài truyền hình</p>
          <ul className="grid grid-cols-3 md:grid-cols-5 gap-x-8 gap-y-6 items-center">
            {partners.map((p) => (
              <li key={p.name} className="relative h-12 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition duration-300">
                <Image src={p.logo} alt={p.name} fill sizes="160px" className="object-contain" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Featured course */}
      <section className="section">
        <div className="container-lux grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <SectionHeading
              eyebrow="Khóa học nổi bật"
              title={course?.title || '21 Ngày Biến Video Thành Tài Sản'}
              description={course?.description || 'Trại huấn luyện 21 ngày giúp bạn xây cỗ máy nội dung và thu nhập từ smartphone.'}
            />
            <ul className="mt-8 space-y-4">
              {outcomes.map((o) => (
                <li key={o} className="flex gap-3">
                  <span className="mt-0.5 w-6 h-6 rounded-full bg-gold-soft text-gold flex items-center justify-center shrink-0"><Check size={14} aria-hidden="true" /></span>
                  <span className="text-ink">{o}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="surface-dark rounded-[var(--radius-card)] p-8 md:p-10 shadow-[var(--shadow-lift)]">
            <p className="eyebrow !text-gold-light">Học phí trọn gói</p>
            <div className="mt-4 flex items-baseline gap-3 flex-wrap">
              <p className="font-display text-5xl font-semibold text-white">{course ? formatVND(course.price) : 'Liên hệ'}</p>
              {course?.old_price && Number(course.old_price) > Number(course.price) && (
                <p className="text-lg text-stone-400 line-through">{formatVND(course.old_price)}</p>
              )}
            </div>
            <ul className="mt-6 space-y-3 text-stone-300">
              {['Truy cập trọn đời', 'Hỗ trợ 1:1 qua Zalo', 'Hoàn tiền trong 7 ngày', 'Thanh toán an toàn qua VNPay'].map((x) => (
                <li key={x} className="flex gap-3"><Check size={18} className="text-gold-light shrink-0 mt-0.5" aria-hidden="true" /> {x}</li>
              ))}
            </ul>
            <Link href={courseHref} className="btn btn-gold w-full mt-8">
              Xem lộ trình & đăng ký <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href={courseHref} className="mt-4 flex items-center justify-center gap-2 text-sm text-gold-light hover:underline underline-offset-4 min-h-[44px]">
              <PlayCircle size={18} aria-hidden="true" /> Học thử miễn phí bài đầu tiên
            </Link>
          </div>
        </div>
      </section>

      {/* Bonuses */}
      <section className="section bg-card border-y border-line">
        <div className="container-lux">
          <SectionHeading eyebrow="Đi kèm khóa học" title="Mọi thứ bạn cần để bắt đầu ngay" align="center" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bonuses.map(({ title, desc, icon: Icon }) => (
              <div key={title} className="card p-6">
                <span className="w-11 h-11 rounded-md bg-onyx text-gold-light flex items-center justify-center"><Icon size={20} aria-hidden="true" /></span>
                <h3 className="mt-5 text-2xl">{title}</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="section">
        <div className="container-lux">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <SectionHeading eyebrow="Kinh nghiệm thực chiến" title="Dự án tiêu biểu" description="Những chương trình truyền hình và sự kiện Minh Tấn đã tham gia sản xuất." />
            <Link href="/work" className="btn btn-outline self-start md:self-auto">Xem tất cả dự án</Link>
          </div>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <li key={p.title}>
                <Link href="/work" className="group block">
                  <div className="relative aspect-[4/3] rounded-[var(--radius-card)] overflow-hidden bg-muted">
                    <Image src={p.image} alt={p.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  </div>
                  <p className="mt-4 text-sm text-gold font-semibold">{p.category}</p>
                  <h3 className="mt-1 text-2xl group-hover:text-gold transition-colors">{p.title}</h3>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section surface-dark">
        <div className="container-lux">
          <SectionHeading eyebrow="Học viên nói gì" title="Kết quả thật từ người đã học" align="center" light />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="rounded-[var(--radius-card)] border border-white/10 bg-white/[0.03] p-7 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Quote size={28} className="text-gold-light shrink-0" aria-hidden="true" />
                  <span className="badge !bg-gold-light/15 !text-gold-light">{t.result}</span>
                </div>
                <blockquote className="mt-4 font-display text-2xl leading-snug text-white flex-1">“{t.quote}”</blockquote>
                <figcaption className="mt-8 flex items-center gap-4">
                  <span className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                    <Image src={t.avatar} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-white">{t.name}</span>
                    <span className="block text-sm text-stone-400">{t.title}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/students" className="btn btn-outline-light">Xem thêm câu chuyện học viên</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container-lux grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading eyebrow="Câu hỏi thường gặp" title="Bạn còn băn khoăn?" description="Không thấy câu trả lời? Bấm nút Hỗ trợ ở góc phải để nhắn trực tiếp cho đội ngũ." />
          <FaqList items={faqs} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="container-lux pb-20">
        <div className="surface-dark rounded-[var(--radius-card)] px-6 py-14 md:px-16 md:py-20 text-center">
          <p className="eyebrow !text-gold-light justify-center">Bắt đầu hôm nay</p>
          <h2 className="mt-4 text-white max-w-2xl mx-auto">Video tiếp theo của bạn có thể là tài sản đầu tiên.</h2>
          <p className="mt-4 text-stone-300 max-w-xl mx-auto">Học thử miễn phí bài đầu tiên — không cần thẻ thanh toán.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={courseHref} className="btn btn-gold">Học thử miễn phí <ArrowRight size={18} aria-hidden="true" /></Link>
            <Link href="/courses" className="btn btn-outline-light">Xem tất cả khóa học</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
