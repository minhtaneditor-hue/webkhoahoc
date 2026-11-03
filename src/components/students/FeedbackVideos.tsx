'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Play, X, ExternalLink, Quote, VolumeX } from 'lucide-react';
import { parseMedia, sideThumbnail, type ParsedMedia } from '@/lib/media';
import { COUNTRY_BY_CODE } from '@/lib/countries';
import type { FeedbackVideo } from '@/lib/content';

/**
 * Muted, looping preview for a card. Loads only while the card is on screen (6+ players at
 * once would be heavy) and ignores clicks: the card button opens the dialog with sound.
 * Only YouTube and MP4 can do this: Facebook's embed does not autoplay and covers the card with
 * its own header, so Facebook clips keep the cover image and play in the dialog.
 */
function MutedPreview({ media }: { media: ParsedMedia }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const yt = media.kind === 'youtube' ? media.embedUrl?.match(/embed\/([\w-]{11})/)?.[1] : null;
  const src =
    yt ? `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&mute=1&loop=1&playlist=${yt}&controls=0&playsinline=1&modestbranding=1&rel=0` :
    null;

  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {visible && (media.kind === 'video' ? (
        <video src={media.url} muted autoPlay loop playsInline className="!rounded-none absolute inset-0 w-full h-full object-cover" />
      ) : src ? (
        <iframe src={src} title="" tabIndex={-1} className="absolute inset-0 w-full h-full" allow="autoplay; encrypted-media" />
      ) : null)}
    </div>
  );
}

/** Player URL for the dialog: autoplay with sound after the visitor's click. */
const withSound = (m: ParsedMedia) =>
  m.kind === 'youtube' ? `${m.embedUrl}&autoplay=1` : m.kind === 'facebook' ? `${m.embedUrl}&autoplay=true&mute=false` : m.embedUrl!;

const canPreview = (m: ParsedMedia | null) => !!m && ['youtube', 'video'].includes(m.kind);

// Students' video testimonials: same-size portrait cards that play muted; clicking opens the clip with sound.
export default function FeedbackVideos({ videos }: { videos: FeedbackVideo[] }) {
  const [open, setOpen] = useState<FeedbackVideo | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  function show(v: FeedbackVideo) {
    setOpen(v);
    dialog.current?.showModal();
  }

  const media = open ? parseMedia(open.video_url) : null;

  return (
    <>
      {/* Landscape clips take two columns at 16:9; dense flow fills the gaps they leave */}
      <ul className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-flow-row-dense">
        {videos.map((v) => {
          const m = parseMedia(v.video_url);
          const thumb = sideThumbnail(m, v.thumbnail_url);
          const country = v.country ? COUNTRY_BY_CODE[v.country]?.name : null;
          return (
            <li key={v.id} className={`h-full ${v.orientation === 'horizontal' ? 'col-span-2' : ''}`}>
              <button type="button" onClick={() => show(v)} className="group h-full w-full text-left flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-card hover:shadow-[var(--shadow-lift)] transition-shadow" aria-label={`Xem video feedback của ${v.student_name}`}>
                <div className={`relative bg-onyx overflow-hidden ${v.orientation === 'horizontal' ? 'aspect-video' : 'aspect-[4/5]'}`}>
                  {thumb ? (
                    <Image src={thumb} alt="" fill sizes={v.orientation === 'horizontal' ? '(min-width: 1024px) 50vw, (min-width: 768px) 66vw, 100vw' : '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw'} unoptimized={thumb.startsWith('http')} className="!rounded-none object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-stone-700 to-onyx" />
                  )}
                  {m && canPreview(m) && <MutedPreview media={m} />}
                  {m && canPreview(m) ? (
                    <span className="absolute top-3 right-3 h-9 pl-2.5 pr-3 rounded-full bg-black/60 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-sm" aria-hidden="true">
                      <VolumeX size={14} /> Bấm để nghe
                    </span>
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                      <span className="w-14 h-14 rounded-full bg-gold-light text-onyx flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"><Play size={22} className="ml-1" /></span>
                    </span>
                  )}
                </div>
                <div className="flex-1 flex flex-col p-4">
                  {v.quote && <p className="text-sm leading-relaxed text-ink line-clamp-3"><Quote size={14} className="inline -mt-1 mr-1 text-gold" aria-hidden="true" />{v.quote}</p>}
                  <p className="mt-auto pt-3 text-sm truncate">
                    <span className="font-semibold text-ink">{v.student_name}</span>
                    <span className="text-muted-foreground">{country ? ` · ${country}` : v.student_title ? ` · ${v.student_title}` : ''}</span>
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        onClick={(e) => { if (e.target === dialog.current) dialog.current?.close(); }}
        className="m-auto w-[min(900px,calc(100vw-32px))] max-h-[calc(100dvh-32px)] rounded-[var(--radius-card)] bg-onyx text-white p-0 backdrop:bg-black/80"
        aria-label={open ? `Video feedback của ${open.student_name}` : 'Video feedback'}
      >
        {open && (
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="font-semibold">{open.student_name}{open.student_title ? <span className="text-stone-400 font-normal"> · {open.student_title}</span> : null}</p>
              <button type="button" onClick={() => dialog.current?.close()} className="w-11 h-11 shrink-0 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center" aria-label="Đóng"><X size={20} aria-hidden="true" /></button>
            </div>
            <div className={`mt-4 relative w-full overflow-hidden rounded-[var(--radius-img)] bg-black ${open.orientation === 'horizontal' ? 'aspect-video' : 'aspect-[9/16] max-h-[75dvh] max-w-[calc(75dvh*9/16)] mx-auto'}`}>
              {media?.embedUrl ? (
                <iframe src={withSound(media)} title={`Video feedback của ${open.student_name}`} className="absolute inset-0 w-full h-full" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
              ) : media?.kind === 'video' ? (
                <video src={media.url} controls playsInline autoPlay className="!rounded-none absolute inset-0 w-full h-full object-contain" />
              ) : (
                <a href={open.video_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center"><span className="btn btn-gold">Mở video <ExternalLink size={16} aria-hidden="true" /></span></a>
              )}
            </div>
            {open.quote && <p className="mt-4 text-stone-200 leading-relaxed">“{open.quote}”</p>}
          </div>
        )}
      </dialog>
    </>
  );
}
