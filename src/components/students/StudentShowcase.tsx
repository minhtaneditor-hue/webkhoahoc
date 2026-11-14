'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import HoverPreview from '@/components/HoverPreview';
import { X, ArrowRight, Images, PlayCircle, LayoutGrid } from 'lucide-react';
import { parseMedia, WORK_CATEGORIES } from '@/lib/media';
import { COUNTRY_BY_CODE, flagUrl } from '@/lib/countries';
import { countryName, workCategoryLabel } from '@/lib/i18n';
import { useLang } from '@/lib/use-lang';
import { studentKey, pairsOf, type StudentWork, type FeedbackVideo } from '@/lib/content';
import { sidesOf, sideName, PairView } from './StudentWorks';
import SocialLinks, { type Links } from './SocialLinks';
import FeedbackVideos from './FeedbackVideos';
import { skipOptimizer } from '@/lib/image';

type Kind = 'all' | 'image' | 'video';

const isVideo = (w: StudentWork) => pairsOf(w).some((p) => [p.before_url, p.after_url].some((u) => { const m = parseMedia(u); return !!m && m.kind !== 'image'; }));
// A "work" row with no picture or clip yet: the student is listed with their channels only.
const hasMedia = (w: StudentWork) => pairsOf(w).length > 0;
// One before/after pair = one piece of work, however the admin grouped them
const pieces = (ws: StudentWork[]) => ws.reduce((n, w) => n + pairsOf(w).length, 0);
const isImage = (w: StudentWork) => hasMedia(w) && !isVideo(w);

type Profile = {
  name: string;
  title: string | null;
  country: string | null;
  city: string | null;
  avatar: string | null;
  category: string | null;
  links: Links;
  works: StudentWork[];
};

// Works arrive one row per before/after pair; the page shows one card per student.
function toProfiles(works: StudentWork[]): Profile[] {
  const map = new Map<string, Profile>();
  for (const w of works) {
    const key = studentKey(w.student_name);
    const p = map.get(key) ?? { name: w.student_name, title: null, country: null, city: null, avatar: null, category: null, links: {}, works: [] };
    p.title ||= w.student_title; p.country ||= w.country; p.city ||= w.city; p.avatar ||= w.avatar_url; p.category ||= w.category;
    p.links.facebook ||= w.facebook_url || undefined;
    p.links.tiktok ||= w.tiktok_url || undefined;
    p.links.instagram ||= w.instagram_url || undefined;
    p.links.youtube ||= w.youtube_url || undefined;
    p.links.website ||= w.website_url || undefined;
    p.works.push(w);
    map.set(key, p);
  }
  return [...map.values()];
}

function CountryTag({ code, city, dark = false }: { code: string | null; city?: string | null; dark?: boolean }) {
  const lang = useLang();
  const c = code ? COUNTRY_BY_CODE[code] : null;
  if (!c) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${dark ? 'bg-white/10 text-white' : 'bg-muted text-ink'}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={flagUrl(c.code)} alt="" width={18} height={12} loading="lazy" decoding="async" className="!rounded-[2px] w-[18px] h-3 object-cover" />
      {city ? `${city}, ${countryName(c.code, lang)}` : countryName(c.code, lang)}
    </span>
  );
}

/** avatars: featured students' photos by studentKey, used when a work row has no avatar. */
export default function StudentShowcase({ works, videos, avatars = {} }: { works: StudentWork[]; videos: FeedbackVideo[]; avatars?: Record<string, string> }) {
  const lang = useLang();
  const en = lang === 'en';
  const [kind, setKind] = useState<Kind>('all');
  const [industry, setIndustry] = useState('all');
  const [open, setOpen] = useState<Profile | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const byKind = useMemo(() => (kind === 'all' ? works : works.filter((w) => (kind === 'video' ? isVideo(w) : isImage(w)))), [works, kind]);
  const industries = useMemo(() => WORK_CATEGORIES.filter((c) => byKind.some((w) => w.category === c.value)), [byKind]);
  const withAvatars = (list: Profile[]) => list.map((p) => (p.avatar ? p : { ...p, avatar: avatars[studentKey(p.name)] || null }));
  const profiles = useMemo(
    () => withAvatars(toProfiles(industry === 'all' ? byKind : byKind.filter((w) => w.category === industry))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [byKind, industry, avatars]
  );

  const counts = { all: works.length + videos.length, image: works.filter(isImage).length, video: works.filter(isVideo).length + videos.length };
  const tabs: { value: Kind; label: string; icon: typeof Images }[] = [
    { value: 'all', label: en ? 'All' : 'Tất cả', icon: LayoutGrid },
    { value: 'image', label: en ? 'Photos' : 'Hình ảnh', icon: Images },
    { value: 'video', label: 'Video', icon: PlayCircle },
  ];

  function show(p: Profile) {
    setOpen(p);
    dialog.current?.showModal();
  }

  // "Xem sản phẩm" on a featured student links to #hv-<key> (same page or from the home page):
  // open that student's works. Clicks are caught too, since re-clicking the same hash fires no event.
  useEffect(() => {
    const openKey = (hash: string) => {
      if (!hash.startsWith('#hv-')) return false;
      const p = withAvatars(toProfiles(works)).find((x) => studentKey(x.name) === decodeURIComponent(hash.slice(4)));
      if (!p) return false;
      setKind('all'); setIndustry('all');
      show(p);
      return true;
    };
    openKey(location.hash);
    // Links from the home page ("Xem thêm các video feedback khác") land before this section exists
    if (location.hash === '#video-feedback') setTimeout(() => document.getElementById('video-feedback')?.scrollIntoView({ block: 'start' }), 100);
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href^="#hv-"]') as HTMLAnchorElement | null;
      if (a && openKey(a.getAttribute('href')!)) e.preventDefault();
    };
    const onHash = () => openKey(location.hash);
    document.addEventListener('click', onClick);
    window.addEventListener('hashchange', onHash);
    return () => { document.removeEventListener('click', onClick); window.removeEventListener('hashchange', onHash); };
  }, [works]);

  return (
    <>
      {/* Filter bar: media type, then industry */}
      <div className="sticky top-0 z-20 -mx-5 px-5 py-3 bg-ivory/90 backdrop-blur-md border-b border-line">
        <div className="flex flex-wrap items-center gap-3">
          <div role="tablist" aria-label={en ? 'Type of work' : 'Loại sản phẩm'} className="flex w-full sm:w-auto rounded-full bg-muted p-1">
            {tabs.map((t) => (
              <button
                key={t.value}
                role="tab"
                aria-selected={kind === t.value}
                onClick={() => { setKind(t.value); setIndustry('all'); }}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 whitespace-nowrap min-h-[40px] px-3 sm:px-4 rounded-full text-sm font-semibold transition-colors ${kind === t.value ? 'bg-onyx text-white' : 'text-ink hover:bg-white'}`}
              >
                <t.icon size={16} className="hidden sm:block" aria-hidden="true" /> {t.label} <span className={kind === t.value ? 'text-gold-light' : 'text-muted-foreground'}>{counts[t.value]}</span>
              </button>
            ))}
          </div>
          {industries.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar" role="group" aria-label={en ? 'Filter by industry' : 'Lọc theo ngành nghề'}>
              {[{ value: 'all', label: en ? 'All industries' : 'Mọi ngành' }, ...industries].map((c) => (
                <button
                  key={c.value}
                  type="button"
                  aria-pressed={industry === c.value}
                  onClick={() => setIndustry(c.value)}
                  className={`shrink-0 min-h-[40px] px-4 rounded-full text-sm font-semibold border transition-colors ${industry === c.value ? 'border-gold bg-gold-soft text-ink' : 'border-line text-muted-foreground hover:text-ink hover:border-line-strong'}`}
                >
                  {workCategoryLabel(c, lang)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {profiles.length > 0 && (
        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((p) => {
            const cover = sidesOf(pairsOf(p.works[0])[0] ?? {});
            const cat = WORK_CATEGORIES.find((c) => c.value === p.category);
            const label = cat ? workCategoryLabel(cat, lang) : undefined;
            return (
              <li key={p.name} className="h-full">
                <article className="h-full flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-card">
                  <button type="button" data-hover-card onClick={() => show(p)} className="group relative block aspect-[4/3] overflow-hidden" aria-label={en ? `See ${p.name}'s work` : `Xem sản phẩm của ${p.name}`}>
                    <div className={`absolute inset-0 grid gap-px bg-black/20 ${cover.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {cover.map((s) => (
                        <div key={s.label} className="relative overflow-hidden bg-onyx">
                          {s.thumb && <Image src={s.thumb} alt="" fill sizes="(min-width: 1024px) 17vw, (min-width: 640px) 25vw, 50vw" unoptimized={skipOptimizer(s.thumb)} className="!rounded-none object-cover transition-transform duration-700 group-hover:scale-[1.04]" />}
                          <HoverPreview url={s.media?.url} />
                          <span className={`absolute bottom-2 left-2 rounded-full px-2.5 py-0.5 text-xs font-bold ${s.label === 'Sau' ? 'bg-gold-light text-onyx' : 'bg-black/65 text-white'}`}>{sideName(s.label, lang)}</span>
                        </div>
                      ))}
                    </div>
                    {cover.length === 0 && (
                      <div className="absolute inset-0 surface-dark flex flex-col items-center justify-center gap-3">
                        <span className="w-20 h-20 rounded-full bg-white/10 text-gold-light flex items-center justify-center font-display text-4xl font-bold" aria-hidden="true">{p.name.replace(/^(Anh|Chị|Team|C|A)\s+/i, '').charAt(0)}</span>
                        <span className="text-sm font-semibold text-stone-300">{en ? "See the student's channel" : 'Xem kênh của học viên'}</span>
                      </div>
                    )}
                    {p.works.some(hasMedia) && <span className="absolute top-3 right-3 rounded-full bg-black/65 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white">{pieces(p.works)} {en ? 'pieces' : 'sản phẩm'}</span>}
                  </button>
                  <div className="flex-1 flex flex-col p-5">
                    <div className="flex items-start gap-3">
                      {p.avatar ? (
                        <Image src={p.avatar} alt="" width={48} height={48} unoptimized={skipOptimizer(p.avatar)} className="!rounded-full w-12 h-12 object-cover shrink-0" />
                      ) : (
                        <span className="w-12 h-12 shrink-0 rounded-full bg-onyx text-gold-light flex items-center justify-center font-display text-xl font-bold" aria-hidden="true">{p.name.replace(/^(Anh|Chị|C|A)\s+/i, '').charAt(0)}</span>
                      )}
                      <div className="min-w-0">
                        <h3 className="text-xl leading-snug truncate">{p.name}</h3>
                        {p.title && <p className="text-sm text-muted-foreground line-clamp-2">{p.title}</p>}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <CountryTag code={p.country} city={p.city} />
                      {label && <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-gold-soft text-ink">{label}</span>}
                    </div>
                    <div className="mt-auto pt-5 flex flex-wrap items-center justify-between gap-3">
                      <SocialLinks links={p.links} name={p.name} />
                      <button type="button" onClick={() => show(p)} className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:text-gold-hover">
                        {en ? 'See their work' : 'Xem sản phẩm'} <ArrowRight size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      {profiles.length === 0 && kind !== 'video' && <p className="mt-8 text-muted-foreground">{en ? 'No work in this category yet.' : 'Chưa có sản phẩm trong mục này.'}</p>}

      {/* Closing note under the cards: the list shown is a sample */}
      <div className="mt-10 flex justify-center">
        <p className="more-note inline-flex items-center gap-2.5 rounded-2xl sm:rounded-full px-5 py-2.5 text-sm md:text-base font-semibold text-white text-center">
          <span className="more-note-dot" aria-hidden="true" />
          {en ? <>And many more individual students and <span className="text-gold-light">training centers</span></> : <>Và còn nhiều học viên cá nhân và <span className="text-gold-light">trung tâm đào tạo</span> khác nữa</>}
        </p>
      </div>

      {kind !== 'image' && videos.length > 0 && (
        <section id="video-feedback" aria-labelledby="video-feedback-title" className="mt-16 scroll-mt-40">
          <h2 id="video-feedback-title" className="text-3xl md:text-4xl">{en ? 'Video feedback from students' : 'Video feedback từ học viên'}</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl">{en ? 'Students talk about the course and about Minh Tấn, in their own words (in Vietnamese).' : 'Học viên tự kể về khóa học và về Minh Tấn.'}</p>
          <div className="mt-6"><FeedbackVideos videos={videos} /></div>
        </section>
      )}

      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        onClick={(e) => { if (e.target === dialog.current) dialog.current?.close(); }}
        className="m-auto w-[min(1000px,calc(100vw-32px))] max-h-[calc(100dvh-32px)] rounded-[var(--radius-card)] bg-onyx text-white p-0 backdrop:bg-black/80"
        aria-labelledby="student-dialog-title"
      >
        {open && (
          <div className="p-5 md:p-8">
            {/* Profile header: photo, name, what they do, where, channels */}
            <div className="relative">
              <button type="button" onClick={() => dialog.current?.close()} className="absolute top-0 right-0 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center" aria-label={en ? 'Close' : 'Đóng'}><X size={20} aria-hidden="true" /></button>
              <div className="flex flex-col items-center text-center pt-2 pb-8 border-b border-white/10">
                {open.avatar ? (
                  <Image src={open.avatar} alt={open.name} width={112} height={112} unoptimized={skipOptimizer(open.avatar)} className="!rounded-full w-24 h-24 md:w-28 md:h-28 object-cover ring-4 ring-gold-light/40" />
                ) : (
                  <span className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white/10 text-gold-light flex items-center justify-center font-display text-5xl font-bold ring-4 ring-gold-light/40" aria-hidden="true">{open.name.replace(/^(Anh|Chị|Team|C|A)\s+/i, '').charAt(0)}</span>
                )}
                <h2 id="student-dialog-title" className="mt-4 text-white text-3xl md:text-4xl">{open.name}</h2>
                {open.title && <p className="mt-1 text-stone-300">{open.title}</p>}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <CountryTag code={open.country} city={open.city} dark />
                  {open.works.some(hasMedia) && <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-white/10 text-white">{pieces(open.works)} {en ? 'pieces' : 'sản phẩm'}</span>}
                  <SocialLinks links={open.links} name={open.name} dark />
                </div>
              </div>
            </div>

            {!open.works.some(hasMedia) && <p className="mt-8 text-stone-300">{en ? "This student's work is being added. In the meantime, see their channels with the buttons above." : 'Sản phẩm của học viên đang được cập nhật. Xem kênh của học viên qua các nút ở trên.'}</p>}
            <ol className="mt-8 space-y-10">
              {open.works.filter(hasMedia).map((w, i) => {
                return (
                  <li key={w.id}>
                    <p className="font-semibold text-white">{i + 1}. {w.title}{w.result ? <span className="badge ml-2 !bg-gold-light !text-onyx">{w.result}</span> : null}</p>
                    {pairsOf(w).map((pair, j) => <PairView key={j} sides={sidesOf(pair)} vertical={(pair.orientation || w.orientation) !== 'horizontal'} />)}
                    {w.description && <p className="mt-3 text-stone-300 leading-relaxed">{w.description}</p>}
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </dialog>
    </>
  );
}
