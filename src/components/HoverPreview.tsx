'use client';

import { useEffect, useRef, useState } from 'react';

/** Muted, looping player URL for a hover preview, or null when the host can't do it (Facebook, TikTok…). */
export function previewSource(url?: string | null): { kind: 'iframe' | 'video'; src: string } | null {
  const u = url?.trim();
  if (!u) return null;
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { kind: 'iframe', src: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&mute=1&loop=1&playlist=${yt[1]}&controls=0&playsinline=1&modestbranding=1&rel=0&disablekb=1` };
  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/(\w+))?/);
  if (vm) return { kind: 'iframe', src: `https://player.vimeo.com/video/${vm[1]}?${vm[2] ? `h=${vm[2]}&` : ''}background=1&autoplay=1&muted=1&loop=1` };
  if (/\.(mp4|webm|mov|m4v)$/i.test(u.split('?')[0])) return { kind: 'video', src: u };
  return null;
}

/**
 * Drop inside a card's picture (the parent must be `relative`): while the mouse is over the
 * card (the closest [data-hover-card], else the parent) the clip plays muted on top of the cover,
 * and it stops when the mouse leaves. The player
 * is only created on hover, so a page of cards stays light. Touch screens keep the cover.
 */
export default function HoverPreview({ url, fit = 'cover' }: { url?: string | null; fit?: 'cover' | 'contain' }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  const source = previewSource(url);

  useEffect(() => {
    const card = (ref.current?.closest('[data-hover-card]') as HTMLElement | null) || ref.current?.parentElement;
    if (!card || !source) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timer: ReturnType<typeof setTimeout>;
    // Short delay so the mouse merely crossing a card does not load a player
    const enter = () => { timer = setTimeout(() => setActive(true), 250); };
    const leave = () => { clearTimeout(timer); setActive(false); setReady(false); };
    card.addEventListener('mouseenter', enter);
    card.addEventListener('mouseleave', leave);
    return () => { clearTimeout(timer); card.removeEventListener('mouseenter', enter); card.removeEventListener('mouseleave', leave); };
  }, [source?.src]); // eslint-disable-line react-hooks/exhaustive-deps

  // Embedded players don't always report "loaded" to the page: fade in after a moment instead
  useEffect(() => {
    if (!active || source?.kind !== 'iframe') return;
    const t = setTimeout(() => setReady(true), 1000);
    return () => clearTimeout(t);
  }, [active, source?.kind]);

  if (!source) return null;
  return (
    <div ref={ref} style={{ containerType: 'size' }} className={`absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true">
      {active && (source.kind === 'video' ? (
        <video src={source.src} muted autoPlay loop playsInline onPlaying={() => setReady(true)}
               className={`!rounded-none absolute inset-0 w-full h-full ${fit === 'cover' ? 'object-cover' : 'object-contain'} bg-black`} />
      ) : (
        // 16:9 player scaled up to fill the card, like object-fit: cover
        <iframe src={source.src} title="" tabIndex={-1} allow="autoplay; encrypted-media"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-0"
                style={fit === 'cover' ? { width: 'max(100%, calc(100cqh * 16 / 9))', height: 'max(100%, calc(100cqw * 9 / 16))' } : { width: '100%', height: '100%' }} />
      ))}
    </div>
  );
}
