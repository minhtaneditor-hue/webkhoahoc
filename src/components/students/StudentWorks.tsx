'use client';

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Play, X, ExternalLink } from 'lucide-react';
import { parseMedia, sideThumbnail, WORK_CATEGORIES, type ParsedMedia } from '@/lib/media';
import { COUNTRY_BY_CODE } from '@/lib/countries';
import type { StudentWork } from '@/lib/content';

type Side = { label: 'Trước' | 'Sau'; media: ParsedMedia | null; thumb: string | null };

function sidesOf(w: StudentWork): Side[] {
  const before = parseMedia(w.before_url);
  const after = parseMedia(w.after_url);
  const sides: Side[] = [];
  if (before || w.before_thumbnail_url) sides.push({ label: 'Trước', media: before, thumb: sideThumbnail(before, w.before_thumbnail_url) });
  if (after || w.after_thumbnail_url) sides.push({ label: 'Sau', media: after, thumb: sideThumbnail(after, w.after_thumbnail_url) });
  return sides;
}

function placeOf(w: StudentWork) {
  const c = w.country ? COUNTRY_BY_CODE[w.country] : null;
  if (!c) return w.city || null;
  return `${w.city ? `${w.city}, ` : ''}${c.name}`;
}

// Gallery of former students' work. Each card shows Before / After when both exist;
// clicking opens a dialog that plays both sides next to each other.
export default function StudentWorks({ works, light = false }: { works: StudentWork[]; light?: boolean }) {
  const [category, setCategory] = useState('all');
  const [open, setOpen] = useState<StudentWork | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const categories = useMemo(() => WORK_CATEGORIES.filter((c) => works.some((w) => w.category === c.value)), [works]);
  const shown = category === 'all' ? works : works.filter((w) => w.category === category);

  function show(w: StudentWork) {
    setOpen(w);
    dialog.current?.showModal();
  }
  function close() {
    dialog.current?.close();
  }

  const chip = (active: boolean) =>
    `min-h-[40px] px-4 rounded-full text-sm font-semibold transition-colors ${
      active ? 'bg-gold-light text-onyx' : light ? 'bg-white/[0.08] text-stone-200 hover:bg-white/[0.14]' : 'bg-muted text-ink hover:bg-gold-soft'
    }`;

  return (
    <>
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc theo loại sản phẩm">
          <button type="button" className={chip(category === 'all')} aria-pressed={category === 'all'} onClick={() => setCategory('all')}>Tất cả ({works.length})</button>
          {categories.map((c) => (
            <button key={c.value} type="button" className={chip(category === c.value)} aria-pressed={category === c.value} onClick={() => setCategory(c.value)}>{c.label}</button>
          ))}
        </div>
      )}

      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((w) => {
          const sides = sidesOf(w);
          const vertical = w.orientation !== 'horizontal';
          const place = placeOf(w);
          return (
            <li key={w.id}>
              <button type="button" onClick={() => show(w)} className="group w-full text-left" aria-label={`Xem ${w.title} của ${w.student_name}`}>
                <div className={`grid gap-1.5 overflow-hidden rounded-[var(--radius-img)] ${sides.length === 2 && vertical ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {sides.map((s) => (
                    <div key={s.label} className={`relative ${vertical ? (sides.length === 2 ? 'aspect-[9/16]' : 'aspect-[4/5]') : 'aspect-video'} bg-onyx overflow-hidden`}>
                      {s.thumb ? (
                        <Image src={s.thumb} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" unoptimized={s.thumb.startsWith('http')} className="!rounded-none object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-stone-800 to-onyx text-stone-400 text-sm">{s.media?.label}</div>
                      )}
                      {sides.length === 2 && (
                        <span className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold ${s.label === 'Sau' ? 'bg-gold-light text-onyx' : 'bg-black/60 text-white'}`}>{s.label}</span>
                      )}
                      {s.media && s.media.kind !== 'image' && (
                        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                          <span className="w-12 h-12 rounded-full bg-black/45 backdrop-blur-sm flex items-center justify-center text-white transition-transform group-hover:scale-110"><Play size={20} className="ml-0.5" /></span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-start gap-3">
                  {w.avatar_url && (
                    <Image src={w.avatar_url} alt="" width={44} height={44} unoptimized={w.avatar_url.startsWith('http')} className="!rounded-full w-11 h-11 object-cover shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className={`font-display text-xl font-bold leading-snug ${light ? 'text-white' : 'text-ink'}`}>{w.title}</p>
                    <p className={`mt-1 text-sm ${light ? 'text-stone-300' : 'text-muted-foreground'}`}>
                      {w.student_name}{w.student_title ? ` · ${w.student_title}` : ''}{place ? ` · ${place}` : ''}
                    </p>
                    {w.result && <span className="badge mt-3">{w.result}</span>}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        onClick={(e) => { if (e.target === dialog.current) close(); }}
        className="m-auto w-[min(1100px,calc(100vw-32px))] max-h-[calc(100dvh-32px)] rounded-[var(--radius-card)] bg-onyx text-white p-0 backdrop:bg-black/80 backdrop:backdrop-blur-sm"
        aria-labelledby="work-dialog-title"
      >
        {open && <WorkDetail work={open} onClose={close} />}
      </dialog>
    </>
  );
}

function WorkDetail({ work, onClose }: { work: StudentWork; onClose: () => void }) {
  const sides = sidesOf(work);
  const vertical = work.orientation !== 'horizontal';
  const place = placeOf(work);
  return (
    <div className="p-5 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="work-dialog-title" className="text-white text-[clamp(1.5rem,3vw,2.25rem)] leading-tight">{work.title}</h2>
          <p className="mt-2 text-stone-300">{work.student_name}{work.student_title ? ` · ${work.student_title}` : ''}{place ? ` · ${place}` : ''}</p>
        </div>
        <button type="button" onClick={onClose} className="w-11 h-11 shrink-0 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center" aria-label="Đóng"><X size={20} aria-hidden="true" /></button>
      </div>

      <div className={`mt-6 grid gap-4 ${sides.length === 2 ? (vertical ? 'grid-cols-2' : 'md:grid-cols-2') : ''} ${vertical && sides.length === 1 ? 'max-w-sm mx-auto' : ''}`}>
        {sides.map((s) => (
          <figure key={s.label} className="min-w-0">
            {sides.length === 2 && (
              <figcaption className={`mb-2 text-sm font-bold ${s.label === 'Sau' ? 'text-gold-light' : 'text-stone-300'}`}>
                {s.label === 'Trước' ? 'Trước khi học' : 'Sau khi học'}
              </figcaption>
            )}
            <Player side={s} vertical={vertical} />
          </figure>
        ))}
      </div>

      {(work.result || work.description) && (
        <div className="mt-6 max-w-3xl">
          {work.result && <span className="badge !bg-gold-light !text-onyx">{work.result}</span>}
          {work.description && <p className="mt-3 text-stone-200 leading-relaxed whitespace-pre-line">{work.description}</p>}
        </div>
      )}
    </div>
  );
}

function Player({ side, vertical }: { side: Side; vertical: boolean }) {
  const { media, thumb } = side;
  const frame = `relative w-full overflow-hidden rounded-[var(--radius-img)] bg-black ${vertical ? 'aspect-[9/16] max-h-[70dvh] mx-auto' : 'aspect-video'}`;

  if (media?.embedUrl) {
    return (
      <div className={frame}>
        <iframe src={media.embedUrl} title={`Video ${side.label.toLowerCase()} (${media.label})`} className="absolute inset-0 w-full h-full" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen loading="lazy" />
      </div>
    );
  }
  if (media?.kind === 'video') {
    return (
      <div className={frame}>
        <video src={media.url} poster={thumb || undefined} controls playsInline preload="metadata" className="!rounded-none absolute inset-0 w-full h-full object-contain" />
      </div>
    );
  }
  if (thumb && (!media || media.kind === 'image')) {
    return (
      <div className={frame}>
        <Image src={thumb} alt={`Ảnh ${side.label.toLowerCase()}`} fill sizes="(min-width: 768px) 50vw, 100vw" unoptimized={thumb.startsWith('http')} className="!rounded-none object-contain" />
      </div>
    );
  }
  // Unknown host: show the picture (if any) and link out.
  return (
    <a href={media?.url} target="_blank" rel="noopener noreferrer" className={`${frame} group flex items-center justify-center`}>
      {thumb && <Image src={thumb} alt="" fill sizes="50vw" unoptimized={thumb.startsWith('http')} className="!rounded-none object-cover opacity-60" />}
      <span className="relative btn btn-gold">Mở video <ExternalLink size={16} aria-hidden="true" /></span>
    </a>
  );
}
