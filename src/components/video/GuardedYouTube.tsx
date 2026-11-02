'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2 } from 'lucide-react';

// Lesson player for unlisted YouTube videos. YouTube's own controls are hidden and a
// transparent layer sits on top, so the title, logo and "Watch on YouTube" links can't be
// clicked; our own controls drive the player through the IFrame API. A moving watermark
// with the viewer's email discourages screen recording. This blocks casual copying; a
// determined person can still dig the video ID out of the page, so true DRM needs a
// hosted service (Bunny Stream / Vimeo with domain lock).

declare global {
  interface Window { YT?: any; onYouTubeIframeAPIReady?: () => void }
}

let apiPromise: Promise<any> | null = null;
function loadApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(window.YT); };
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(s);
    });
  }
  return apiPromise;
}

export function youTubeId(url?: string | null) {
  return url?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)?.[1] ?? null;
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export default function GuardedYouTube({ videoId, title, watermark, autoPlay = false }: { videoId: string; title: string; watermark?: string; autoPlay?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const mount = useRef<HTMLDivElement>(null);
  const player = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [full, setFull] = useState(false);

  useEffect(() => {
    let alive = true;
    setReady(false); setPlaying(false); setTime(0);
    loadApi().then((YT) => {
      if (!alive || !mount.current) return;
      player.current = new YT.Player(mount.current, {
        host: 'https://www.youtube-nocookie.com',
        videoId,
        playerVars: { controls: 0, disablekb: 1, fs: 0, rel: 0, modestbranding: 1, iv_load_policy: 3, playsinline: 1, autoplay: autoPlay ? 1 : 0 },
        events: {
          onReady: (e: any) => { setReady(true); setDuration(e.target.getDuration() || 0); },
          onStateChange: (e: any) => { setPlaying(e.data === 1); setEnded(e.data === 0); },
        },
      });
    });
    return () => { alive = false; player.current?.destroy?.(); player.current = null; };
  }, [videoId, autoPlay]);

  // Progress clock + drifting watermark
  useEffect(() => {
    const t = setInterval(() => {
      const p = player.current;
      if (p?.getCurrentTime) { setTime(p.getCurrentTime()); if (!duration) setDuration(p.getDuration() || 0); }
    }, 500);
    return () => clearInterval(t);
  }, [duration]);

  useEffect(() => {
    const onFs = () => setFull(document.fullscreenElement === box.current);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const p = () => player.current;
  const toggle = () => { if (!ready) return; if (ended) { p().seekTo(0, true); setEnded(false); } playing ? p().pauseVideo() : p().playVideo(); };
  const seek = (v: number) => { p()?.seekTo(v, true); setTime(v); };
  const toggleMute = () => { if (!ready) return; muted ? p().unMute() : p().mute(); setMuted(!muted); };
  const changeSpeed = () => { const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length]; p()?.setPlaybackRate(next); setSpeed(next); };
  const toggleFull = () => (document.fullscreenElement ? document.exitFullscreen() : box.current?.requestFullscreen());

  return (
    <div ref={box} className="group relative w-full h-full bg-black select-none" onContextMenu={(e) => e.preventDefault()}>
      <div className="absolute inset-0 pointer-events-none [&>iframe]:w-full [&>iframe]:h-full"><div ref={mount} /></div>

      {/* Click shield: covers YouTube's title, logo and links; a click plays / pauses */}
      <button type="button" onClick={toggle} onDoubleClick={toggleFull} className="absolute inset-0 w-full h-full cursor-pointer" aria-label={playing ? `Tạm dừng ${title}` : `Phát ${title}`}>
        {!ready && <Loader2 className="absolute inset-0 m-auto animate-spin text-white/70" size={36} aria-hidden="true" />}
        {ready && !playing && (
          <span className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/55 backdrop-blur-sm text-white flex items-center justify-center" aria-hidden="true"><Play size={28} className="ml-1" /></span>
        )}
      </button>

      {/* While paused or not started YouTube prints its own video title top-left: cover it with ours (the Unica title) */}
      {!playing && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black via-black to-black/0 px-4 pt-3" aria-hidden="true">
          <p className="text-white text-sm md:text-base font-semibold truncate">{title}</p>
        </div>
      )}

      {/* End screen: hide YouTube's "more videos" grid */}
      {ended && (
        <div className="pointer-events-none absolute inset-0 bg-black flex flex-col items-center justify-center gap-3 text-white">
          <span className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center"><Play size={28} className="ml-1" aria-hidden="true" /></span>
          <span className="text-sm font-semibold">Xem lại bài học</span>
        </div>
      )}

      {/* Student ID drifting non-stop across the picture (bounces like a screensaver) */}
      {watermark && (
        <span className="wm-drift pointer-events-none absolute z-[1] whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] md:text-xs font-semibold text-white/35 bg-black/10" aria-hidden="true">{watermark}</span>
      )}

      {/* Own controls */}
      <div className={`absolute inset-x-0 bottom-0 px-3 pb-2 pt-8 bg-gradient-to-t from-black/80 to-transparent transition-opacity ${playing ? 'opacity-0 group-hover:opacity-100 focus-within:opacity-100' : 'opacity-100'}`}>
        <input type="range" min={0} max={duration || 0} step={1} value={Math.min(time, duration || 0)} onChange={(e) => seek(Number(e.target.value))} className="w-full accent-[#E8956B] h-1 cursor-pointer" aria-label="Tua video" />
        <div className="mt-1 flex items-center gap-1 text-white text-xs">
          <button type="button" onClick={toggle} className="w-9 h-9 flex items-center justify-center rounded hover:bg-white/10" aria-label={playing ? 'Tạm dừng' : 'Phát'}>{playing ? <Pause size={18} /> : <Play size={18} />}</button>
          <button type="button" onClick={toggleMute} className="w-9 h-9 flex items-center justify-center rounded hover:bg-white/10" aria-label={muted ? 'Bật tiếng' : 'Tắt tiếng'}>{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
          <span className="tabular-nums">{fmt(time)} / {fmt(duration)}</span>
          <button type="button" onClick={changeSpeed} className="ml-auto min-w-9 h-9 px-2 rounded hover:bg-white/10 font-semibold" aria-label="Tốc độ phát">{speed}x</button>
          <button type="button" onClick={toggleFull} className="w-9 h-9 flex items-center justify-center rounded hover:bg-white/10" aria-label={full ? 'Thoát toàn màn hình' : 'Toàn màn hình'}>{full ? <Minimize size={18} /> : <Maximize size={18} />}</button>
        </div>
      </div>
    </div>
  );
}
