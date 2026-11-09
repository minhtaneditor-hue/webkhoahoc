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

// Student rows edited straight in Supabase show up within an hour (admin saves refresh at once)
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Học viên',
  openGraph: { title: 'Học viên & sản phẩm | TẤN VA', type: 'website', locale: 'vi_VN', siteName: 'TẤN VA' },
  description: 'Sản phẩm thật của học viên TẤN VA, trước và sau khóa học, cùng câu chuyện từ học viên ở Việt Nam và khắp thế giới.',
  alternates: { canonical: '/students' },
};



export default async function StudentsPage() {
  const [students, feedback, works, videos, settings] = await Promise.all([getStudents(), getFeedbackImages(), getStudentWorks(), getFeedbackVideos(), getSiteSettings()]);
  const places = studentPlaces(students, works);
  const counts = workCounts(works);
  const worksLink = (name: string) => {
    const n = counts[studentKey(name)];
    return n !== undefined ? (
      <a href={`#hv-${studentKey(name)}`} className="inline-flex items-center gap-1.5 min-h-[36px] text-sm font-semibold text-gold hover:text-gold-hover">
        <Images size={16} aria-hidden="true" /> {worksLabel(n)} <ArrowRight size={14} aria-hidden="true" />
      </a>
    ) : null;
  };
  // Headline numbers are set in admin (rounded marketing figures, not live counts)
  const plus = (v: string | undefined, fallback: number) => `${(Number(v) || fallback).toLocaleString('vi-VN')}+`;

  return (
    <main>
      {/* Header: what this page proves, in three numbers */}
      <section className="container-lux pt-12 md:pt-20 pb-8">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <SectionHeading as="h1" title="Học viên & sản phẩm" description="Sản phẩm thật học viên làm ra, trước và sau khóa học. Họ bắt đầu giống bạn, với một chiếc điện thoại." />
          <dl className="grid grid-cols-3 gap-3">
            {[
              { n: plus(settings.students_page_learners, 1000), label: 'học viên' },
              { n: places.length, label: 'quốc gia' },
              { n: plus(settings.students_page_works, 500), label: 'sản phẩm' },
            ].map((s) => (
              <div key={s.label} className="min-w-0 rounded-[var(--radius-card)] border border-line bg-card p-3 sm:p-4 flex flex-col-reverse justify-end">
                <dt className="mt-1 text-sm text-muted-foreground">{s.label}</dt>
                <dd className="font-display text-[1.375rem] sm:text-3xl md:text-4xl leading-tight whitespace-nowrap font-bold text-ink">{s.n}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="san-pham" aria-label="Sản phẩm của học viên" className="container-lux pb-20 scroll-mt-24">
        <StudentShowcase works={works} videos={videos} avatars={Object.fromEntries(students.filter((s) => s.avatar_url).map((s) => [studentKey(s.name), s.avatar_url!]))} />
      </section>

      <WorldStudents places={places} />

      <section className="container-lux pt-20 pb-6">
        <h2>Học viên tiêu biểu</h2>
      </section>

      <section className="container-lux pb-20">
        <Reveal as="ul" className="grid gap-6 md:grid-cols-2" from="mask">
          {students.filter((s) => s.quote || s.story).map((s: any, i: number) => (
            <li key={`${s.id}-${i}`} className="card overflow-hidden grid sm:grid-cols-[200px_1fr]">
              <div className="relative aspect-square sm:aspect-auto bg-muted">
                <Image src={s.avatar_url || '/asset/hoc_vien/tan.jpg'} alt={s.name} fill sizes="(min-width: 640px) 200px, 100vw" className="object-cover" unoptimized={!!s.avatar_url?.startsWith('http')} />
              </div>
              <figure className="p-6 md:p-7 flex flex-col">
                {s.results && <span className="badge self-start">{s.results}</span>}
                <Quote size={24} className="mt-4 text-gold" aria-hidden="true" />
                <blockquote className="mt-2 font-display text-2xl leading-snug flex-1">“{s.quote || s.story}”</blockquote>
                <figcaption className="mt-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
                  <span>
                    <span className="block font-semibold">{s.name}</span>
                    <span className="block text-sm text-muted-foreground">{s.title}</span>
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
                <Image src={s.avatar_url || '/asset/hoc_vien/tan.jpg'} alt="" width={64} height={64} unoptimized={!!s.avatar_url?.startsWith('http')} className="!rounded-full w-16 h-16 object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink truncate">{s.name}</p>
                  {s.title && <p className="text-sm text-muted-foreground line-clamp-2">{s.title}</p>}
                  <div className="mt-2 flex items-center gap-2">
                    {s.country && COUNTRY_BY_CODE[s.country] && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={flagUrl(s.country)} alt="" width={16} height={11} className="!rounded-[2px] w-4 h-[11px] object-cover" />
                        {s.city || COUNTRY_BY_CODE[s.country].name}
                      </span>
                    )}
                    {s.facebook_url && <SocialLinks links={{ facebook: s.facebook_url }} name={s.name} />}
                  </div>
                  {worksLink(s.name)}
                </div>
              </li>
            ))}
            {/* Last tile: there are more students than the ones listed */}
            <li>
              <Link href="#san-pham" className="group h-full min-h-[96px] flex items-center gap-4 rounded-[var(--radius-card)] border-2 border-dashed border-line-strong p-4 transition-colors hover:border-gold hover:bg-gold-soft">
                <span className="w-16 h-16 shrink-0 rounded-full bg-onyx text-gold-light flex items-center justify-center transition-transform duration-300 group-hover:rotate-90" aria-hidden="true"><Plus size={28} /></span>
                <span className="min-w-0">
                  <span className="block font-semibold text-ink">Và còn nhiều học viên khác</span>
                  <span className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-gold">Xem sản phẩm học viên <ArrowRight size={14} aria-hidden="true" /></span>
                </span>
              </Link>
            </li>
          </ul>
        )}
      </section>

      <section className="section surface-dark">
        <div className="container-lux">
          <SectionHeading light title="Phản hồi từ học viên" description="Ảnh chụp tin nhắn học viên gửi cho Minh Tấn sau khóa học." />
          <ul className="mt-12 columns-1 md:columns-2 gap-4 [&>li]:mb-4">
            {feedback.map((img, i) => (
              <li key={img.src} className="break-inside-avoid overflow-hidden rounded-[var(--radius-img)] bg-white">
                <Image src={img.src} alt={`Phản hồi học viên ${i + 1}`} width={img.width} height={img.height} unoptimized={img.src.startsWith('http')} sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" className="w-full h-auto" />
              </li>
            ))}
          </ul>
          <div className="mt-12 text-center">
            <Link href="/courses" className="btn btn-gold">Trở thành học viên tiếp theo <ArrowRight size={18} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
