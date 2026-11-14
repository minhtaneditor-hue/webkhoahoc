import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check, MessageCircle, PlayCircle } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import FaqList from '@/components/FaqList';
import { ShutterImage, Reveal } from '@/components/motion/Motion';
import ShowreelVideo from '@/components/motion/ShowreelVideo';
import CountUp from '@/components/motion/CountUp';
import FeedbackMarquee from '@/components/FeedbackMarquee';
import StudentsMarquee from '@/components/students/StudentsMarquee';
import { getSiteSettings, getStudents, getFeedbackImages, getStudentWorks, getFeedbackVideos, workCounts } from '@/lib/content';
import FeedbackVideos from '@/components/students/FeedbackVideos';
import StudentWorks from '@/components/students/StudentWorks';
import { toYoutubeId, contactFrom } from '@/lib/site-settings';
import JsonLd from '@/components/JsonLd';
import { BRAND_ALIASES, ORGANIZATION, ORG_ID, PERSON } from '@/lib/brand-entity';
import { SITE_URL } from '@/lib/site-url';
import { languageAlternates } from '@/lib/i18n';
import { COACHING_PACKAGES_USD } from '@/lib/coaching-intl';

export const revalidate = 3600;

const HOME_TITLE = 'Learn to make video with your phone, with Minh Tấn | TẤN VA';
const HOME_DESCRIPTION = 'Learn to film, edit and sell with video using just your phone, with Minh Tấn, a TV editor with 10+ years of experience. 1:1 online coaching scheduled in your time zone.';

export const metadata: Metadata = {
  title: { absolute: 'TẤN VA' },
  description: HOME_DESCRIPTION,
  alternates: { canonical: '/en', languages: languageAlternates('/') },
  openGraph: { title: HOME_TITLE, description: HOME_DESCRIPTION, type: 'website', locale: 'en_US', siteName: 'TẤN VA' },
};

const partners = [
  { name: 'Phú Long', logo: '/asset/doi_tac/partner_phulong.webp' },
  { name: 'Viglacera', logo: '/asset/doi_tac/partner_viglacera.webp' },
  { name: 'Suntory PepsiCo', logo: '/asset/doi_tac/partner_pepsico.png' },
  { name: 'HTV', logo: '/asset/doi_tac/partner_htv.png' },
  { name: 'Vietjet', logo: '/asset/doi_tac/partner_vietjet.jpg' },
];

// Show titles stay in Vietnamese (they are the shows' names)
const projects = [
  { title: '2 Ngày 1 Đêm', category: 'TV show', image: '/asset/du_an_tieu_bieu/project_2n1d.webp' },
  { title: 'Anh Trai Say Hi — Movie', category: 'Feature film', image: '/asset/du_an_tieu_bieu/project_atsh_movie.jpg' },
  { title: 'Anh Trai Say Hi — Las Vegas', category: 'International event', image: '/asset/du_an_tieu_bieu/project_atsh_vegas.webp' },
  { title: 'Người Hùng Tí Hon', category: 'Digital content', image: '/asset/du_an_tieu_bieu/project_nhth.jpg' },
  { title: 'Mái Ấm Tình Thương', category: 'Documentary', image: '/asset/du_an_tieu_bieu/project_matn.webp' },
  { title: 'Ký Ức Vui Vẻ', category: 'TV production', image: '/asset/du_an_tieu_bieu/project_kuvv.png' },
];

const outcomes = [
  'Shoot great-looking video with the phone you already have',
  'Write hooks that keep viewers watching past the first 3 seconds',
  'Edit fast with a TV-style workflow, right on your phone',
  'Turn views into customers and sales',
];

const faqs = [
  { q: 'Do I need a professional camera?', a: 'No. Everything is taught on a smartphone, filming and editing alike. If you already have a camera you can bring it, but you won’t need it.' },
  { q: 'How do sessions work across time zones?', a: 'Sessions are 1:1 online calls of 2 hours. We schedule them in your time zone, whether you are in the US, Canada, Australia, Singapore or elsewhere.' },
  { q: 'How do I pay?', a: 'There is no checkout on this site. Message us on Messenger to book, and we’ll send you a PayPal or Wise payment link.' },
  { q: 'Can I try before buying a program?', a: 'Yes. Start with the free 30-minute audit, or book a single 2-hour session for $99.' },
  { q: 'What if I have questions between sessions?', a: 'Send them by message at any time between sessions and you’ll get an answer, so you never get stuck while practicing.' },
];

export default async function HomeEn() {
  const [settings, students, feedback, works, feedbackVideos] = await Promise.all([
    getSiteSettings(), getStudents(), getFeedbackImages(), getStudentWorks(), getFeedbackVideos(),
  ]);
  const chat = contactFrom(settings).messengerHref;
  const featured = COACHING_PACKAGES_USD.find((p) => p.featured) ?? COACHING_PACKAGES_USD[0];
  const fromPrice = Math.min(...COACHING_PACKAGES_USD.map((p) => p.price));
  const homeFeedback = feedbackVideos.filter((v) => v.orientation !== 'horizontal').slice(0, 5);
  const featuredWorks = works.filter((w) => w.is_featured).slice(0, 3);
  const youtubeId = toYoutubeId(settings.showreel_youtube_id);
  const SHOWREEL = {
    youtubeId,
    youtubeStart: Number(settings.showreel_start) || 0,
    poster: settings.showreel_poster || (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : ''),
    watchUrl: youtubeId ? `https://youtu.be/${youtubeId}` : '',
  };

  return (
    <main>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@graph': [
          ORGANIZATION,
          PERSON,
          { '@type': 'WebSite', name: 'TẤN VA', alternateName: BRAND_ALIASES, url: `${SITE_URL}/en`, inLanguage: 'en', publisher: { '@id': ORG_ID } },
          {
            '@type': 'FAQPage',
            mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
          },
        ],
      }} />
      {/* Video header: Minh Tấn's showreel plays behind the main title */}
      <section aria-labelledby="hero-title" className="container-lux pt-4 md:pt-6">
        <div className="relative isolate overflow-hidden bg-onyx rounded-[var(--radius-xl)] min-h-[440px] md:min-h-0 md:h-[clamp(360px,34vw,460px)] flex items-end">
          {SHOWREEL.youtubeId && (
            <ShowreelVideo youtubeId={SHOWREEL.youtubeId || undefined} youtubeStart={SHOWREEL.youtubeStart} poster={SHOWREEL.poster || undefined} />
          )}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,rgb(28_25_23/.25)_0%,rgb(28_25_23/0)_30%,rgb(28_25_23/.55)_60%,rgb(28_25_23/.92)_100%)]" aria-hidden="true" />
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgb(28_25_23/.6),transparent_65%)]" aria-hidden="true" />
          <Reveal className="relative w-full px-6 md:px-12 pb-8 md:pb-10 max-w-2xl" stagger={0.1}>
            <h1 id="hero-title" className="text-white text-[clamp(2.5rem,5vw,4rem)] leading-[1.15] tracking-[-0.02em]">Video is an asset.</h1>
            <p className="mt-4 text-lg md:text-xl text-stone-200 leading-snug max-w-xl">
              Learn to film, edit and sell with video from a TV professional, using just your phone.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link href="/en/coaching" className="btn btn-gold">See 1:1 coaching <ArrowRight size={18} aria-hidden="true" /></Link>
              {SHOWREEL.watchUrl && <a href={SHOWREEL.watchUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-light">
                <PlayCircle size={18} aria-hidden="true" /> Watch the showreel with sound
              </a>}
            </div>
          </Reveal>
        </div>
      </section>

      {/* About the teacher */}
      <section aria-labelledby="advisor-title" className="container-lux pt-14 md:pt-20 pb-20 md:pb-28 grid gap-10 lg:gap-16 lg:grid-cols-[1.05fr_0.95fr] items-center">
        <Reveal stagger={0.1}>
          <h2 id="advisor-title" className="text-ink text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.15]">Minh Tấn</h2>
          <p className="mt-6 text-xl text-stone leading-relaxed max-w-xl">
            More than 10 years in Vietnamese television, including post-production on 2 Ngày 1 Đêm (2 Days 1 Night) and Anh Trai Say Hi. Now Minh Tấn teaches that same workflow, cut down to fit your phone.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/en/about" className="btn btn-dark">Minh Tấn’s story <ArrowRight size={18} aria-hidden="true" /></Link>
            <Link href="/en/coaching" className="btn btn-outline">Book 1:1 coaching</Link>
          </div>
        </Reveal>

        <ShutterImage className="relative aspect-[4/5] overflow-hidden bg-onyx rounded-[var(--radius-img)]">
          <Image src="/asset/avatar/hero_expert.jpg" alt="Minh Tấn, founder of TẤN VA" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-onyx/80 to-transparent" aria-hidden="true" />
          <p className="absolute left-6 bottom-6 md:left-8 md:bottom-8"><span className="block font-display text-4xl font-bold text-white">Minh Tấn</span><span className="block mt-1 text-gold-light font-semibold">Founder of TẤN VA</span></p>
        </ShutterImage>
      </section>

      {/* Students & feedback */}
      <section aria-labelledby="students-title" className="surface-dark overflow-hidden">
        <div className="container-lux pt-20 md:pt-28">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <Reveal>
              <h2 id="students-title" className="text-white text-[clamp(1.625rem,5vw,4rem)] leading-[1.2]">What students say about Minh Tấn</h2>
              <p className="mt-5 text-lg text-stone-300 max-w-xl">They started just like you: a phone and the wish to make better videos. Here is what they made.</p>
            </Reveal>
            <dl className="grid grid-cols-2 gap-3 sm:gap-6">
              <div className="min-w-0 rounded-[var(--radius-card)] bg-white/[0.05] p-4 sm:p-5 flex flex-col-reverse justify-end">
                <dt className="mt-2 text-sm sm:text-base text-stone-300">students taught</dt>
                <dd className="font-display text-[clamp(2rem,8vw,3rem)] lg:text-[clamp(1.875rem,2.9vw,2.75rem)] leading-none whitespace-nowrap font-bold text-gold-light"><CountUp to={Number(settings.stat_students) || 0} suffix="+" /></dd>
              </div>
              <div className="min-w-0 rounded-[var(--radius-card)] bg-white/[0.05] p-4 sm:p-5 flex flex-col-reverse justify-end">
                <dt className="mt-2 text-sm sm:text-base text-stone-300">years in television</dt>
                <dd className="font-display text-[clamp(2rem,8vw,3rem)] lg:text-[clamp(1.875rem,2.9vw,2.75rem)] leading-none whitespace-nowrap font-bold text-gold-light"><CountUp to={Number(settings.stat_years) || 0} suffix="+" /></dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-14"><StudentsMarquee students={students} counts={workCounts(works)} lang="en" /></div>

        {featuredWorks.length > 0 && (
          <div className="container-lux mt-20">
            <h3 className="text-white text-[clamp(1.375rem,3vw,2.25rem)]">Students’ work, before and after the course</h3>
            <StudentWorks works={featuredWorks} light />
          </div>
        )}

        {homeFeedback.length > 0 && (
          <div className="container-lux mt-20">
            <h3 className="text-white text-[clamp(1.375rem,3vw,2.25rem)]">Video feedback from students</h3>
            <p className="mt-2 text-stone-400">Students talk about the course and about Minh Tấn, in their own words (in Vietnamese).</p>
            <div className="mt-8"><FeedbackVideos videos={homeFeedback} /></div>
            {feedbackVideos.length > homeFeedback.length && (
              <Link href="/en/students#video-feedback" className="btn btn-outline-light mt-8">See more video feedback <ArrowRight size={18} aria-hidden="true" /></Link>
            )}
          </div>
        )}

        <div className="mt-20">
          <p className="container-lux mb-6 font-semibold text-gold-light">Real messages students sent after the course (in Vietnamese)</p>
          <FeedbackMarquee images={feedback} lang="en" />
        </div>

        <div className="container-lux py-14 md:py-20 flex flex-col sm:flex-row gap-3">
          <Link href="/en/coaching" className="btn btn-gold">Start like they did <ArrowRight size={18} aria-hidden="true" /></Link>
          <Link href={works.length ? '/en/students#san-pham' : '/en/students'} className="btn btn-outline-light">See more students’ work</Link>
        </div>
      </section>

      {/* Coaching: outcomes beside the featured international package */}
      <section className="section">
        <div className="container-lux grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-start [&>*]:min-w-0">
          <div>
            <SectionHeading
              title="1:1 coaching, wherever you live"
              description="Don’t make videos just for fun. Learn to film, edit and sell with video, 1:1 online with Minh Tấn, using only your phone."
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
            <p className="text-gold-light font-semibold">{featured.name}</p>
            <div className="mt-3 flex items-baseline gap-3 flex-wrap">
              <p className="font-display text-[clamp(2rem,9vw,2.75rem)] sm:text-5xl lg:text-[2.75rem] xl:text-5xl font-bold whitespace-nowrap text-white">${featured.price}</p>
              <p className="text-lg text-stone-400">USD</p>
            </div>
            <p className="mt-2 text-stone-400">{featured.duration}</p>
            <ul className="mt-8 space-y-3 text-stone-300 text-lg">
              {['Filming and editing with Minh Tấn, then Facebook and TikTok ads with a partner expert', 'Sessions scheduled in your time zone', 'Questions by message between sessions', 'Pay by PayPal or Wise'].map((x) => (
                <li key={x} className="flex gap-3"><Check size={20} className="text-gold-light shrink-0 mt-1" aria-hidden="true" /> {x}</li>
              ))}
            </ul>
            <Link href="/en/coaching#packages" className="btn btn-gold w-full mt-10">
              See all packages <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <p className="mt-3 text-center text-stone-400">Single sessions from ${fromPrice}.</p>
            <a href={chat} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center gap-2 text-gold-light hover:underline min-h-[44px]">
              <MessageCircle size={18} aria-hidden="true" /> Questions? Message us on Messenger
            </a>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="container-lux pb-16 md:pb-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl md:text-3xl">Post-production credits</h2>
          <Link href="/work" hrefLang="vi" className="link-underline text-sm font-semibold text-gold whitespace-nowrap">All projects (in Vietnamese) →</Link>
        </div>
        <Reveal as="ul" className="mt-6 grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4" stagger={0.05}>
          {projects.map((p) => (
            <li key={p.title}>
              <span className="relative block aspect-video overflow-hidden rounded-[var(--radius-md)] bg-muted">
                <Image src={p.image} alt={`${p.title} (${p.category})`} fill sizes="(min-width: 768px) 16vw, 33vw" className="object-cover" />
              </span>
              <span className="mt-2 block text-xs md:text-sm font-medium text-stone leading-snug">{p.title}</span>
              <span className="block text-xs text-muted-foreground">{p.category}</span>
            </li>
          ))}
        </Reveal>

        <h3 className="mt-14 font-sans text-base font-medium text-muted-foreground">Trusted by brands and TV stations</h3>
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
          <SectionHeading title="Questions?" description="Can’t find your answer? Message us on Messenger and we’ll get back to you." />
          <FaqList items={faqs} />
        </div>
      </section>

      {/* Closing call to action */}
      <section className="surface-dark">
        <div className="container-lux py-20 md:py-28 grid gap-10 lg:grid-cols-[1.3fr_0.7fr] items-end">
          <h2 className="text-white text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[1.15]">Start with a free 30-minute audit.</h2>
          <div className="flex flex-col gap-3">
            <a href={chat} target="_blank" rel="noopener noreferrer" className="btn btn-gold">Book on Messenger <ArrowRight size={18} aria-hidden="true" /></a>
            <Link href="/en/coaching" className="btn btn-outline-light">See coaching packages</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
