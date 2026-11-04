'use client';

import { useEffect, useRef } from 'react';
import { youTubeId } from '@/components/video/GuardedYouTube';

// A YouTube link becomes a normal player. A video file plays silently on a loop, unless the
// visitor asked for less motion or the browser refuses: then they get the play button instead.
export default function ProductPreview({ url, poster, title }: { url: string; poster?: string | null; title: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const ytId = youTubeId(url);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const showControls = () => { video.controls = true; };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) showControls();
    else video.play().catch(showControls);
  }, [ytId]);

  if (ytId) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0`}
        title={`Video giới thiệu ${title}`}
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        className="absolute inset-0 w-full h-full"
      />
    );
  }

  return (
    <video
      ref={ref}
      src={url}
      poster={poster || undefined}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={`Video giới thiệu ${title}`}
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
}
