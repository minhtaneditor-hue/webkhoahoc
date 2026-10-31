'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Cinematic background video (MotionSites recipe "video-and-media §1"):
 * muted autoplay loop, settles in from scale 1.05, pauses off-screen,
 * and shows the poster as a still under prefers-reduced-motion.
 *
 * Accepts either a self-hosted MP4 (`src`) or a YouTube video id (`youtubeId`).
 * YouTube runs through youtube-nocookie.com, scaled to cover the frame, controlled
 * over postMessage (enablejsapi) so it can be paused when scrolled away.
 */
export default function ShowreelVideo({
  src,
  youtubeId,
  youtubeStart = 0,
  poster,
  className = '',
  objectPosition = 'center',
}: {
  src?: string;
  youtubeId?: string;
  /** Seconds to skip on the first play (e.g. a title card); YouTube loops restart at 0. */
  youtubeStart?: number;
  poster?: string;
  className?: string;
  objectPosition?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [stillOnly, setStillOnly] = useState<boolean | null>(null);

  // Self-hosted MP4
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true; // some browsers ignore the attribute for autoplay

    const reveal = () => setReady(true);
    video.addEventListener('loadeddata', reveal, { once: true });
    if (video.readyState >= 2) queueMicrotask(reveal);

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause(); // poster / first frame stays as a still
      return () => video.removeEventListener('loadeddata', reveal);
    }

    // Play only while on screen: saves battery and data on long pages
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    io.observe(video);
    return () => {
      io.disconnect();
      video.removeEventListener('loadeddata', reveal);
    };
  }, []);

  // YouTube
  useEffect(() => {
    if (!youtubeId) return;
    // Phones get the still poster: YouTube's mobile player often refuses muted autoplay and
    // overlays its own play controls, and a background video costs mobile data.
    const reduce = matchMedia('(prefers-reduced-motion: reduce), (max-width: 767px)').matches;
    queueMicrotask(() => setStillOnly(reduce));
    if (reduce) return;
    const frame = frameRef.current;
    if (!frame) return;
    const command = (func: 'playVideo' | 'pauseVideo') =>
      frame.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*');
    const io = new IntersectionObserver(([entry]) => command(entry.isIntersecting ? 'playVideo' : 'pauseVideo'));
    io.observe(frame);
    return () => io.disconnect();
  }, [youtubeId]);

  const settle = `transition-[opacity,transform] duration-[1800ms] ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none ${ready ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.05]'}`;

  if (youtubeId) {
    const params = new URLSearchParams({
      autoplay: '1', mute: '1', loop: '1', playlist: youtubeId, controls: '0', playsinline: '1',
      rel: '0', modestbranding: '1', disablekb: '1', iv_load_policy: '3', enablejsapi: '1',
      ...(youtubeStart ? { start: String(youtubeStart) } : {}),
    });
    return (
      <div className={`absolute inset-0 overflow-hidden [container-type:size] ${className}`} aria-hidden="true">
        {poster && (
          // eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnail behind the iframe
          <img src={poster} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        {/* Not rendered on the server either, so phones never even load the YouTube player */}
        {stillOnly === false && (
          // Oversized by 15% so YouTube's title bar and edges fall outside the frame
          <div className="absolute inset-0 scale-[1.15]">
          <iframe
            ref={frameRef}
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?${params}`}
            title="Showreel"
            tabIndex={-1}
            allow="autoplay; encrypted-media; picture-in-picture"
            // YouTube shows its own loading UI first; wait a moment before fading the footage in
            onLoad={() => setTimeout(() => setReady(true), 1200)}
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none border-0 w-[max(100cqw,177.78cqh)] h-[max(100cqh,56.25cqw)] ${settle}`}
          />
          </div>
        )}
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      style={{ objectPosition }}
      className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${settle} motion-reduce:opacity-100 motion-reduce:scale-100 ${className}`}
    />
  );
}
