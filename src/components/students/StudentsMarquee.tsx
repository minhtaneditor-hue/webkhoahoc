import Image from 'next/image';
import Link from 'next/link';
import { Quote, Images } from 'lucide-react';
import { COUNTRY_BY_CODE, flagUrl } from '@/lib/countries';
import { studentKey, worksLabel, type Student } from '@/lib/content';
import { skipOptimizer } from '@/lib/image';

// Every student with a photo, drifting left to right in one endless row (same
// marquee as the partner logos). Pauses on hover; static wrap under reduced motion.
// counts (works per studentKey) adds a "Xem sản phẩm" link to the student's works on /students.
export default function StudentsMarquee({ students, counts = {} }: { students: Student[]; counts?: Record<string, number> }) {
  const list = students.filter((s) => s.avatar_url);
  if (list.length === 0) return null;
  const loop = [...list, ...list];
  return (
    <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]" aria-label="Học viên của TẤN VA">
      <ul className="marquee-track marquee-reverse gap-5" style={{ ['--marquee-duration' as string]: `${Math.max(40, list.length * 5)}s` }}>
        {loop.map((s, i) => {
          const c = s.country ? COUNTRY_BY_CODE[s.country] : null;
          return (
            <li key={`${s.id}-${i}`} aria-hidden={i >= list.length || undefined} className="shrink-0 w-[230px] md:w-[260px]">
              <figure className="h-full flex flex-col">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-img)]">
                  <Image src={s.avatar_url!} alt={i < list.length ? s.name : ''} fill sizes="260px" unoptimized={skipOptimizer(s.avatar_url!)} className="object-cover" />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-onyx/90 to-transparent" aria-hidden="true" />
                  {s.results && <span className="badge absolute top-3 left-3 !bg-gold-light !text-onyx">{s.results}</span>}
                  <figcaption className="absolute left-4 right-4 bottom-4">
                    <span className="block font-display text-xl font-bold text-white leading-snug line-clamp-2">{s.name}</span>
                    {s.title && <span className="block text-sm text-stone-300 line-clamp-1">{s.title}</span>}
                  </figcaption>
                </div>
                {s.quote ? (
                  <blockquote className="mt-4 text-[15px] text-stone-200 leading-relaxed line-clamp-3">
                    <Quote size={16} className="inline -mt-1 mr-1.5 text-gold-light" aria-hidden="true" />{s.quote}
                  </blockquote>
                ) : c ? (
                  <p className="mt-4 inline-flex items-center gap-2 text-sm text-stone-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={flagUrl(c.code)} alt="" width={18} height={12} className="!rounded-[2px] w-[18px] h-3 object-cover" />
                    {s.city ? `${s.city}, ${c.name}` : c.name}
                  </p>
                ) : null}
                {counts[studentKey(s.name)] !== undefined ? (
                  <Link href={`/students#hv-${studentKey(s.name)}`} tabIndex={i >= list.length ? -1 : undefined}
                        className="mt-3 self-start inline-flex items-center gap-1.5 min-h-[36px] text-sm font-semibold text-gold-light hover:underline">
                    <Images size={15} aria-hidden="true" /> {worksLabel(counts[studentKey(s.name)])}
                  </Link>
                ) : null}
              </figure>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
