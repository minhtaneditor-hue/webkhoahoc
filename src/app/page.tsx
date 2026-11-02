import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check, Quote, PlayCircle } from 'lucide-react';
import { getPublicSupabase, formatVND } from '@/lib/supabase-public';
import SectionHeading from '@/components/SectionHeading';
import FaqList from '@/components/FaqList';
import { ShutterImage, Reveal } from '@/components/motion/Motion';
import ShowreelVideo from '@/components/motion/ShowreelVideo';
import CountUp from '@/components/motion/CountUp';
import FeedbackMarquee from '@/components/FeedbackMarquee';
import { getSiteSettings, getStudents, getFeedbackImages, getFaqs, getStudentWorks } from '@/lib/content';
import StudentWorks from '@/components/students/StudentWorks';
import { toYoutubeId } from '@/lib/site-settings';

export const revalidate = 60;

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


const outcomes = [
  'Quay đẹp bằng chính chiếc điện thoại bạn đang có',
  'Viết hook giữ chân người xem trong 3 giây đầu',
  'Dựng video nhanh với quy trình chuẩn truyền hình',
  'Biến lượt xem thành khách hàng và doanh thu',
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
  // Everything below is editable in /admin (falls back to built-in content when the tables are empty)
  const [course, settings, students, feedback, faqs, works] = await Promise.all([
    getFeaturedCourse(), getSiteSettings(), getStudents(), getFeedbackImages(), getFaqs(), getStudentWorks(),
  ]);
  const featuredWorks = works.filter((w) => w.is_featured).slice(0, 3);
  const youtubeId = toYoutubeId(settings.showreel_youtube_id);
  const SHOWREEL = {
    youtubeId,
    youtubeStart: Number(settings.showreel_start) || 0,
    poster: settings.showreel_poster || (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : ''),
    watchUrl: youtubeId ? `https://youtu.be/${youtubeId}` : '',
  };
  const courseHref = course ? `/courses/${course.id}` : '/courses';

  return (
    <main>
      {/* Video header: Minh Tấn's showreel plays behind the main title (stills on phones / reduced motion) */}
      <section aria-labelledby="hero-title" className="container-lux pt-4 md:pt-6">
        {/* A wide, short banner: about 21:9 on desktop so it doesn't take over the first screen */}
        <div className="relative isolate overflow-hidden bg-onyx rounded-[var(--radius-xl)] min-h-[440px] md:min-h-0 md:h-[clamp(360px,34vw,460px)] flex items-end">
          {SHOWREEL.youtubeId && (
            <ShowreelVideo youtubeId={SHOWREEL.youtubeId || undefined} youtubeStart={SHOWREEL.youtubeStart} poster={SHOWREEL.poster || undefined} />
          )}
          {/* Scrims: darker toward the bottom-left where the title sits */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,rgb(28_25_23/.25)_0%,rgb(28_25_23/0)_30%,rgb(28_25_23/.55)_60%,rgb(28_25_23/.92)_100%)]" aria-hidden="true" />
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgb(28_25_23/.6),transparent_65%)]" aria-hidden="true" />
          <Reveal className="relative w-full px-6 md:px-12 pb-8 md:pb-10 max-w-2xl" stagger={0.1}>
            <h1 id="hero-title" className="text-white text-[clamp(2.5rem,5vw,4rem)] leading-[1.15] tracking-[-0.02em]">{settings.hero_title}</h1>
            <p className="mt-4 text-lg md:text-xl text-stone-200 leading-snug max-w-xl">
              {settings.hero_subtitle}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link href={courseHref} className="btn btn-gold">Xem khóa học 21 ngày <ArrowRight size={18} aria-hidden="true" /></Link>
              {SHOWREEL.watchUrl && <a href={SHOWREEL.watchUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-light">
                <PlayCircle size={18} aria-hidden="true" /> Xem showreel có tiếng
              </a>}
            </div>
          </Reveal>
        </div>
      </section>

      {/* About the teacher: the portrait opens like a camera shutter (signature move) */}
      <section aria-labelledby="advisor-title" className="container-lux pt-14 md:pt-20 pb-20 md:pb-28 grid gap-10 lg:gap-16 lg:grid-cols-[1.05fr_0.95fr] items-center">
        <Reveal stagger={0.1}>
          <h2 id="advisor-title" className="text-ink text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.15]">Minh Tấn Video Advisor</h2>
          <p className="mt-6 text-xl text-stone leading-relaxed max-w-xl">
            {settings.advisor_bio}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/about" className="btn btn-dark">Câu chuyện của Minh Tấn <ArrowRight size={18} aria-hidden="true" /></Link>
            <Link href="/coaching" className="btn btn-outline">Đặt lịch coaching 1:1</Link>
          </div>
        </Reveal>

        <ShutterImage className="relative aspect-[4/5] overflow-hidden bg-onyx rounded-[var(--radius-img)]">
          <Image src="/asset/avatar/hero_expert.jpg" alt="Minh Tấn, Video Advisor" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-onyx/80 to-transparent" aria-hidden="true" />
          <p className="absolute left-6 bottom-6 md:left-8 md:bottom-8"><span className="block font-display text-4xl font-bold text-white">Minh Tấn</span><span className="block mt-1 text-gold-light font-semibold">Video Advisor</span></p>
        </ShutterImage>
      </section>

      {/* Students & feedback: the heart of the page */}
      <section aria-labelledby="students-title" className="surface-dark overflow-hidden">
        <div className="container-lux pt-20 md:pt-28">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <Reveal>
              <h2 id="students-title" className="text-white text-[clamp(1.625rem,5vw,4rem)] leading-[1.2]">{settings.students_title}</h2>
              <p className="mt-5 text-lg text-stone-300 max-w-xl">{settings.students_subtitle}</p>
            </Reveal>
            <dl className="grid grid-cols-2 gap-3 sm:gap-6">
              <div className="min-w-0 rounded-[var(--radius-card)] bg-white/[0.05] p-4 sm:p-6 flex flex-col-reverse">
                <dt className="mt-2 text-stone-300">học viên đã theo học</dt>
                <dd className="font-display text-[clamp(2rem,8vw,3rem)] lg:text-[clamp(2.25rem,3.6vw,3.25rem)] leading-none whitespace-nowrap font-bold text-gold-light"><CountUp to={Number(settings.stat_students) || 0} suffix="+" /></dd>
              </div>
              <div className="min-w-0 rounded-[var(--radius-card)] bg-white/[0.05] p-4 sm:p-6 flex flex-col-reverse">
                <dt className="mt-2 text-stone-300">năm làm truyền hình</dt>
                <dd className="font-display text-[clamp(2rem,8vw,3rem)] lg:text-[clamp(2.25rem,3.6vw,3.25rem)] leading-none whitespace-nowrap font-bold text-gold-light"><CountUp to={Number(settings.stat_years) || 0} suffix="+" /></dd>
              </div>
            </dl>
          </div>

          <Reveal as="ul" from="mask" className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {students.filter((st) => st.quote).slice(0, 4).map((st) => (
              <li key={st.id}>
                <figure className="group h-full flex flex-col">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-img)] ring-hover">
                    <Image src={st.avatar_url || '/asset/avatar/hero_expert.jpg'} alt={st.name} unoptimized={!!st.avatar_url?.startsWith('http')} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-onyx/90 to-transparent" aria-hidden="true" />
                    {st.results && <span className="badge absolute top-4 left-4 !bg-gold-light !text-onyx">{st.results}</span>}
                    <figcaption className="absolute left-5 right-5 bottom-5">
                      <span className="block font-display text-2xl font-bold text-white">{st.name}</span>
                      <span className="block text-sm text-stone-300">{st.title}</span>
                    </figcaption>
                  </div>
                  <blockquote className="mt-5 text-lg text-stone-200 leading-relaxed">
                    <Quote size={20} className="inline -mt-1 mr-2 text-gold-light" aria-hidden="true" />{st.quote}
                  </blockquote>
                </figure>
              </li>
            ))}
          </Reveal>
        </div>

        {featuredWorks.length > 0 && (
          <div className="container-lux mt-20">
            <h3 className="text-white text-[clamp(1.375rem,3vw,2.25rem)]">Sản phẩm học viên làm ra, trước và sau khóa học</h3>
            <StudentWorks works={featuredWorks} light />
          </div>
        )}

        <div className="mt-20">
          <p className="container-lux mb-6 font-semibold text-gold-light">Tin nhắn thật học viên gửi sau khóa học</p>
          <FeedbackMarquee images={feedback} />
        </div>

        <div className="container-lux py-14 md:py-20 flex flex-col sm:flex-row gap-3">
          <Link href={courseHref} className="btn btn-gold">Bắt đầu như họ <ArrowRight size={18} aria-hidden="true" /></Link>
          <Link href={works.length ? '/students#san-pham' : '/students'} className="btn btn-outline-light">{works.length ? `Xem ${works.length} sản phẩm học viên` : 'Xem tất cả câu chuyện học viên'}</Link>
        </div>
      </section>

      {/* Featured course: outcomes as a plain list beside a filled price panel */}
      <section className="section">
        <div className="container-lux grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-start [&>*]:min-w-0">
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

          <div className="surface-dark p-6 sm:p-8 md:p-10">
            <p className="text-gold-light font-semibold">Học phí trọn gói</p>
            <div className="mt-3 flex items-baseline gap-3 flex-wrap">
              <p className="font-display text-[clamp(2rem,9vw,2.75rem)] sm:text-5xl lg:text-[2.75rem] xl:text-5xl font-bold whitespace-nowrap text-white">{course ? formatVND(course.price) : 'Liên hệ'}</p>
              {course?.old_price && Number(course.old_price) > Number(course.price) && (
                <p className="text-lg text-stone-400 line-through">{formatVND(course.old_price)}</p>
              )}
            </div>
            <ul className="mt-8 space-y-3 text-stone-300 text-lg">
              {['Truy cập trọn đời', 'Hỗ trợ 1:1 qua Zalo', 'Hoàn tiền trong 7 ngày', 'Quét QR, kích hoạt tự động'].map((x) => (
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

      {/* Projects: a compact strip of small thumbnails (supporting proof, not the focus) */}
      <section className="container-lux pb-16 md:pb-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl md:text-3xl">Đã tham gia hậu kỳ</h2>
          <Link href="/work" className="link-underline text-sm font-semibold text-gold whitespace-nowrap">Xem tất cả dự án →</Link>
        </div>
        <Reveal as="ul" className="mt-6 grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4" stagger={0.05}>
          {projects.map((p) => (
            <li key={p.title}>
              <Link href="/work" className="group block">
                <span className="relative block aspect-video overflow-hidden rounded-[var(--radius-md)] bg-muted">
                  <Image src={p.image} alt={p.title} fill sizes="(min-width: 768px) 16vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.08]" />
                </span>
                <span className="mt-2 block text-xs md:text-sm font-medium text-stone leading-snug group-hover:text-gold transition-colors">{p.title}</span>
              </Link>
            </li>
          ))}
        </Reveal>

        {/* Brands and TV stations: large logos drifting right to left, endlessly */}
        <h3 className="mt-14 font-sans text-base font-medium text-muted-foreground">Đồng hành cùng các thương hiệu và đài truyền hình</h3>
        <div className="mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
          <ul className="marquee-track items-center gap-14 md:gap-20" style={{ ['--marquee-duration' as string]: '30s' }}>
            {[...partners, ...partners, ...partners, ...partners].map((p, i) => (
              <li key={`${p.name}-${i}`} aria-hidden={i >= partners.length || undefined} className="relative shrink-0 h-16 w-36 md:h-24 md:w-52">
                <Image src={p.logo} alt={i < partners.length ? p.name : ''} fill sizes="208px" loading="eager" className="object-contain" />
              </li>
            ))}
          </ul>
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
          <h2 className="text-white text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[1.15]">Học thử bài đầu tiên, miễn phí.</h2>
          <div className="flex flex-col gap-3">
            <Link href={courseHref} className="btn btn-gold">Vào học thử <ArrowRight size={18} aria-hidden="true" /></Link>
            <Link href="/courses" className="btn btn-outline-light">Xem tất cả khóa học</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
