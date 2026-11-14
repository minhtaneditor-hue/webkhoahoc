import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Quote, ArrowRight, Plus, Images } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import { Reveal } from '@/components/motion/Motion';
import { getStudents, getFeedbackImages, getStudentWorks, getFeedbackVideos, getSiteSettings, studentPlaces, studentKey, workCounts, worksLabel } from '@/lib/content';
import StudentShowcase from '@/components/students/StudentShowcase';
import SocialLinks from '@/components/students/SocialLinks';
import { COUNTRY_BY_CODE, flagUrl } from '@/lib/countries';
import WorldStudents from '@/components/students/WorldStudents';
import { skipOptimizer } from '@/lib/image';
import { countryName, languageAlternates } from '@/lib/i18n';

// Same data as /students; student names, stories and work titles stay as the students wrote them.
export const revalidate = 3600;

const DESCRIPTION = 'Real work by TẤN VA students, before and after the course, and stories from students in Vietnam and around the world.';

export const metadata: Metadata = {
  title: 'Students',
  description: DESCRIPTION,
  openGraph: { title: 'Students & their work | TẤN VA', description: DESCRIPTION, type: 'website', locale: 'en_US', siteName: 'TẤN VA' },
  alternates: { canonical: '/en/students', languages: languageAlternates('/students') },
};

export default async function StudentsPageEn() {
  const [students, feedback, works, videos, settings] = await Promise.all([getStudents(), getFeedbackImages(), getStudentWorks(), getFeedbackVideos(), getSiteSettings()]);
  const places = studentPlaces(students, works);
  const counts = workCounts(works);
  const worksLink = (name: string) => {
    const n = counts[studentKey(name)];
    return n !== undefined ? (
      <a href={`#hv-${studentKey(name)}`} className="inline-flex items-center gap-1.5 min-h-[36px] text-sm font-semibold text-gold hover:text-gold-hover">
        <Images size={16} aria-hidden="true" /> {worksLabel(n, 'en')} <ArrowRight size={14} aria-hidden="true" />
      </a>
    ) : null;
  };
  // Headline numbers are set in admin (rounded marketing figures, not live counts)
  const plus = (v: string | undefined, fallback: number) => `${(Number(v) || fallback).toLocaleString('en-US')}+`;

  return (
    <main>
      <section className="container-lux pt-12 md:pt-20 pb-8">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <SectionHeading as="h1" title="Students & their work" description="Real work by our students, before and after the course. They started just like you, with a phone." />
          <dl className="grid grid-cols-3 gap-3">
            {[
              { n: plus(settings.students_page_learners, 1000), label: 'students' },
              { n: places.length, label: 'countries' },
              { n: plus(settings.students_page_works, 500), label: 'pieces of work' },
            ].map((s) => (
              <div key={s.label} className="min-w-0 rounded-[var(--radius-card)] border border-line bg-card p-3 sm:p-4 flex flex-col-reverse justify-end">
                <dt className="mt-1 text-sm text-muted-foreground">{s.label}</dt>
                <dd className="font-display text-[1.375rem] sm:text-3xl md:text-4xl leading-tight whitespace-nowrap font-bold text-ink">{s.n}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">Most of our students are Vietnamese speakers, so their names, stories and video titles appear as they wrote them.</p>
      </section>

      <section id="san-pham" aria-label="Students' work" className="container-lux pb-20 scroll-mt-24">
        <StudentShowcase works={works} videos={videos} avatars={Object.fromEntries(students.filter((s) => s.avatar_url).map((s) => [studentKey(s.name), s.avatar_url!]))} />
      </section>

      <WorldStudents places={places} lang="en" />

      <section className="container-lux pt-20 pb-6">
        <h2>Featured students</h2>
      </section>

      <section className="container-lux pb-20">
        <Reveal as="ul" className="grid gap-6 md:grid-cols-2" from="mask">
          {students.filter((s) => s.quote || s.story).map((s, i) => (
            <li key={`${s.id}-${i}`} className="card overflow-hidden grid sm:grid-cols-[200px_1fr]">
              <div className="relative aspect-square sm:aspect-auto bg-muted">
                <Image src={s.avatar_url || '/asset/hoc_vien/tan.jpg'} alt={s.name} fill sizes="(min-width: 640px) 200px, 100vw" className="object-cover" unoptimized={skipOptimizer(s.avatar_url)} />
              </div>
              <figure className="p-6 md:p-7 flex flex-col">
                {s.results && <span className="badge self-start">{s.results}</span>}
                <Quote size={24} className="mt-4 text-gold" aria-hidden="true" />
                <blockquote lang="vi" className="mt-2 font-display text-2xl leading-snug flex-1">“{s.quote || s.story}”</blockquote>
                <figcaption className="mt-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
                  <span>
                    <span className="block font-semibold">{s.name}</span>
                    <span lang="vi" className="block text-sm text-muted-foreground">{s.title}</span>
                  </span>
                  {worksLink(s.name)}
                </figcaption>
              </figure>
            </li>
          ))}
        </Reveal>

        {/* Students without a written story yet: compact profile cards */}
        {students.some((s) => !s.quote && !s.story) && (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {students.filter((s) => !s.quote && !s.story).map((s) => (
              <li key={s.id} className="flex items-center gap-4 rounded-[var(--radius-card)] border border-line bg-card p-4">
                <Image src={s.avatar_url || '/asset/hoc_vien/tan.jpg'} alt="" width={64} height={64} unoptimized={skipOptimizer(s.avatar_url)} className="!rounded-full w-16 h-16 object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink truncate">{s.name}</p>
                  {s.title && <p lang="vi" className="text-sm text-muted-foreground line-clamp-2">{s.title}</p>}
                  <div className="mt-2 flex items-center gap-2">
                    {s.country && COUNTRY_BY_CODE[s.country] && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={flagUrl(s.country)} alt="" width={16} height={11} className="!rounded-[2px] w-4 h-[11px] object-cover" />
                        {s.city || countryName(s.country, 'en')}
                      </span>
                    )}
                    {s.facebook_url && <SocialLinks links={{ facebook: s.facebook_url }} name={s.name} />}
                  </div>
                  {worksLink(s.name)}
                </div>
              </li>
            ))}
            <li>
              <Link href="#san-pham" className="group h-full min-h-[96px] flex items-center gap-4 rounded-[var(--radius-card)] border-2 border-dashed border-line-strong p-4 transition-colors hover:border-gold hover:bg-gold-soft">
                <span className="w-16 h-16 shrink-0 rounded-full bg-onyx text-gold-light flex items-center justify-center transition-transform duration-300 group-hover:rotate-90" aria-hidden="true"><Plus size={28} /></span>
                <span className="min-w-0">
                  <span className="block font-semibold text-ink">And many more students</span>
                  <span className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-gold">See students’ work <ArrowRight size={14} aria-hidden="true" /></span>
                </span>
              </Link>
            </li>
          </ul>
        )}
      </section>

      <section className="section surface-dark">
        <div className="container-lux">
          <SectionHeading light title="What students tell us" description="Screenshots of messages students sent Minh Tấn after the course (in Vietnamese)." />
          <ul className="mt-12 columns-1 md:columns-2 gap-4 [&>li]:mb-4">
            {feedback.map((img, i) => (
              <li key={img.src} className="break-inside-avoid overflow-hidden rounded-[var(--radius-img)] bg-white">
                <Image src={img.src} alt={`Student feedback ${i + 1}`} width={img.width} height={img.height} unoptimized={skipOptimizer(img.src)} sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" className="w-full h-auto" />
              </li>
            ))}
          </ul>
          <div className="mt-12 text-center">
            <Link href="/en/coaching" className="btn btn-gold">Become our next student <ArrowRight size={18} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
