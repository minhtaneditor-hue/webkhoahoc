'use client';

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import HoverPreview from '@/components/HoverPreview';
import { Play, X, ExternalLink } from 'lucide-react';
import { parseMedia, sideThumbnail, WORK_CATEGORIES, type ParsedMedia } from '@/lib/media';
import { COUNTRY_BY_CODE } from '@/lib/countries';
import { pairsOf, type MediaPair, type StudentWork } from '@/lib/content';

export type Side = { label: 'Trước' | 'Sau'; media: ParsedMedia | null; thumb: string | null };

export function sidesOf(w: MediaPair): Side[] {
  const before = parseMedia(w.before_url);
  const after = parseMedia(w.after_url);
  const sides: Side[] = [];
  if (before || w.before_thumbnail_url) sides.push({ label: 'Trước', media: before, thumb: sideThumbnail(before, w.before_thumbnail_url) });
  if (after || w.after_thumbnail_url) sides.push({ label: 'Sau', media: after, thumb: sideThumbnail(after, w.after_thumbnail_url) });
  return sides;
}

export function placeOf(w: StudentWork) {
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
  // One section per industry, in the admin's category order; unknown categories go last.
  const groups = [...WORK_CATEGORIES, { value: '', label: 'Khác' }]
    .map((c) => ({ ...c, items: shown.filter((w) => (c.value ? w.category === c.value : !WORK_CATEGORIES.some((k) => k.value === w.category))) }))
    .filter((g) => g.items.length > 0);

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
        <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc theo ngành nghề">
          <button type="button" className={chip(category === 'all')} aria-pressed={category === 'all'} onClick={() => setCategory('all')}>Tất cả ({works.length})</button>
          {categories.map((c) => (
            <button key={c.value} type="button" className={chip(category === c.value)} aria-pressed={category === c.value} onClick={() => setCategory(c.value)}>{c.label}</button>
          ))}
        </div>
      )}

      {groups.map((g) => (
        <section key={g.value} aria-labelledby={groups.length > 1 ? `nganh-${g.value}` : undefined} className="mt-10 first:mt-8">
          {groups.length > 1 && (
            <h3 id={`nganh-${g.value}`} className={`text-2xl md:text-3xl ${light ? 'text-white' : 'text-ink'}`}>
              {g.label} <span className={`font-sans text-base font-normal ${light ? 'text-stone-400' : 'text-muted-foreground'}`}>· {g.items.length}</span>
            </h3>
          )}
          {/* Every card has the same frame: a 4:3 picture split Trước | Sau, then a fixed-height caption */}
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((w) => {
              const sides = sidesOf(pairsOf(w)[0] ?? {});
              const place = placeOf(w);
              return (
                <li key={w.id} className="h-full">
                  <button
                    type="button"
                    data-hover-card
                    onClick={() => show(w)}
                    className={`group h-full w-full text-left flex flex-col overflow-hidden rounded-[var(--radius-card)] border transition-shadow hover:shadow-[var(--shadow-lift)] ${light ? 'border-white/10 bg-white/[0.04]' : 'border-line bg-card'}`}
                    aria-label={`Xem ${w.title} của ${w.student_name}`}
                  >
                    <div className={`relative aspect-[4/3] grid gap-px bg-black/20 ${sides.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {sides.map((s) => (
                        <div key={s.label} className="relative overflow-hidden bg-onyx">
                          {s.thumb ? (
                            <Image src={s.thumb} alt="" fill sizes="(min-width: 1024px) 17vw, (min-width: 640px) 25vw, 50vw" unoptimized={s.thumb.startsWith('http')} className="!rounded-none object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-stone-800 to-onyx text-stone-400 text-sm">{s.media?.label}</div>
                          )}
                          <HoverPreview url={s.media?.url} />
                          {s.media && s.media.kind !== 'image' && (
                            <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                              <span className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-sm flex items-center justify-center text-white"><Play size={18} className="ml-0.5" /></span>
                            </span>
                          )}
                          <span className={`absolute bottom-2 left-2 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${s.label === 'Sau' ? 'bg-gold-light text-onyx' : 'bg-black/65 text-white'}`}>{s.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 flex flex-col p-4">
                      <p className={`font-display text-lg font-bold leading-snug line-clamp-2 min-h-[2.75em] ${light ? 'text-white' : 'text-ink'}`}>{w.title}</p>
                      <div className="mt-3 flex items-center gap-2.5 min-w-0">
                        {w.avatar_url && (
                          <Image src={w.avatar_url} alt="" width={32} height={32} unoptimized={w.avatar_url.startsWith('http')} className="!rounded-full w-8 h-8 object-cover shrink-0" />
                        )}
                        <p className={`text-sm truncate ${light ? 'text-stone-300' : 'text-muted-foreground'}`}>
                          <span className={`font-semibold ${light ? 'text-white' : 'text-ink'}`}>{w.student_name}</span>{place ? ` · ${place}` : ''}
                        </p>
                      </div>
                      {(w.result || pairsOf(w).length > 1) && (
                        <div className="mt-3 flex flex-wrap gap-2 min-w-0">
                          {w.result && <span className="badge max-w-full truncate">{w.result}</span>}
                          {pairsOf(w).length > 1 && <span className={`badge ${light ? '!bg-white/10 !text-white' : ''}`}>{pairsOf(w).length} cặp Trước/Sau</span>}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

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

      {pairsOf(work).map((pair, i) => <PairView key={i} sides={sidesOf(pair)} vertical={vertical} />)}

      {(work.result || work.description) && (
        <div className="mt-6 max-w-3xl">
          {work.result && <span className="badge !bg-gold-light !text-onyx">{work.result}</span>}
          {work.description && <p className="mt-3 text-stone-200 leading-relaxed whitespace-pre-line">{work.description}</p>}
        </div>
      )}
    </div>
  );
}

/** One Trước / Sau pair side by side (a lone side is centred). */
export function PairView({ sides, vertical }: { sides: Side[]; vertical: boolean }) {
  return (
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
  );
}

export function Player({ side, vertical }: { side: Side; vertical: boolean }) {
  const { media, thumb } = side;
  // Vertical clips cap their height and their width, so a lone 9:16 clip is not stretched sideways
  const frame = `relative w-full overflow-hidden rounded-[var(--radius-img)] bg-black ${vertical ? 'aspect-[9/16] max-h-[70dvh] max-w-[calc(70dvh*9/16)] mx-auto' : 'aspect-video'}`;

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
