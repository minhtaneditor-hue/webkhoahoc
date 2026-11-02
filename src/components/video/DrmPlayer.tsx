'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import type Player from 'video.js/dist/types/player';
import SecuritySDK from '@/lib/drm/SecuritySDK';
import { Lock, Play, ShieldAlert, EyeOff, Loader2 } from 'lucide-react';

// tVNDRM player: opens a playback session (/api/drm/session), keeps it alive with heartbeats,
// and plays AES-128 HLS whose keys are released by /api/drm/keys only to that live session.
// Video files are encrypted in Cloudflare R2; see scripts/drm/encrypt-upload.mjs.

const BLOCK_MESSAGES: Record<string, string> = {
  too_many_violations: 'Phát hiện nhiều thao tác vi phạm. Phiên xem đã bị khóa.',
  revoked_by_admin: 'Phiên xem đã bị quản trị viên thu hồi.',
  replaced: 'Video đang được mở ở cửa sổ khác trên thiết bị này.',
  heartbeat_timeout: 'Mất kết nối bảo mật với máy chủ. Vui lòng tải lại trang.',
  download_tool_suspected: 'Phát hiện công cụ tải video. Phiên xem đã bị khóa.',
};

const post = (url: string, body: unknown) =>
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    .then(async (r) => ({ status: r.status, data: await r.json().catch(() => ({})) }));

export default function DrmPlayer({ videoId, title, watermark }: { videoId: string; title: string; watermark: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const sdkRef = useRef<SecuritySDK | null>(null);
  const sessionRef = useRef<string | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [starting, setStarting] = useState(false);
  const [blocked, setBlocked] = useState<string | null>(null);
  const [obscured, setObscured] = useState(false);
  // Quality: starts at 720p; 1080p / 480p / auto on request (heights come from the playlist)
  const [heights, setHeights] = useState<number[]>([]);
  const [quality, setQuality] = useState<number | 'auto'>(720);
  const [menuOpen, setMenuOpen] = useState(false);
  const qualityRef = useRef<number | 'auto'>(720);

  const applyQuality = useCallback(() => {
    const levels = (playerRef.current as any)?.qualityLevels?.();
    if (!levels?.length) return;
    const all: number[] = [];
    for (let i = 0; i < levels.length; i++) all.push(levels[i].height);
    setHeights([...new Set(all)].filter(Boolean).sort((a, b) => b - a));
    const want = qualityRef.current;
    const match = want !== 'auto' && all.includes(want);
    for (let i = 0; i < levels.length; i++) levels[i].enabled = !match || levels[i].height === want;
  }, []);

  const chooseQuality = (q: number | 'auto') => {
    qualityRef.current = q;
    setQuality(q);
    setMenuOpen(false);
    applyQuality();
  };

  const stopPlayback = useCallback((reason?: string) => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    sessionRef.current = null;
    const p = playerRef.current;
    if (p && !p.isDisposed()) { p.pause(); p.reset(); }
    setBlocked((reason && BLOCK_MESSAGES[reason]) || reason || 'Phiên xem đã kết thúc.');
  }, []);

  const reportViolation = useCallback((type: string) => {
    const sid = sessionRef.current;
    if (!sid) return;
    post('/api/drm/violation', { sessionId: sid, type }).then((r) => { if (r.status === 409) stopPlayback(r.data.error); }).catch(() => {});
  }, [stopPlayback]);

  // Security SDK: devtools / shortcut / capture detection, blackout when the window loses focus
  useEffect(() => {
    const sdk = new SecuritySDK({ onViolation: reportViolation });
    sdkRef.current = sdk;
    sdk.onSecurityAlert((type) => {
      if (type === 'focus_lost' || type === 'tab_hidden') {
        reportViolation(type);
        if (sessionRef.current) { playerRef.current?.pause(); setObscured(true); }
      } else if (document.visibilityState === 'visible' && document.hasFocus()) {
        setObscured(false);
      }
    });
    return () => sdk.destroy();
  }, [reportViolation]);

  // End the session when the page closes or the lesson changes
  useEffect(() => {
    const end = () => {
      const sid = sessionRef.current;
      if (sid) fetch('/api/drm/session/end', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: sid }) }).catch(() => {});
    };
    window.addEventListener('pagehide', end);
    return () => {
      window.removeEventListener('pagehide', end);
      end();
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [videoId]);

  // video.js owns its element (created here, not by React) so dispose() can't break React's DOM
  useEffect(() => {
    const el = document.createElement('video-js');
    el.className = 'vjs-big-play-centered vjs-fill';
    el.setAttribute('playsinline', '');
    containerRef.current!.appendChild(el);
    const player = videojs(el, {
      autoplay: false,
      controls: true,
      playbackRates: [0.75, 1, 1.25, 1.5, 2],
      controlBar: { pictureInPictureToggle: false },
      // Always use VHS so key/segment requests go through our token-rewritten URLs
      html5: { vhs: { overrideNative: true }, nativeAudioTracks: false, nativeVideoTracks: false },
    });
    player.ready(() => sdkRef.current?.lockElement(player.el().querySelector('video')));
    // Levels exist once the master playlist is parsed; apply the 720p default there
    player.on('loadedmetadata', applyQuality);
    (player as any).qualityLevels().on('addqualitytrack', applyQuality);
    player.on('error', () => {
      const code = player.error()?.code;
      const sid = sessionRef.current;
      if (!sid || !code) return;
      // Ask the server why: a revoked session explains a failed segment/key request
      post('/api/drm/heartbeat', { sessionId: sid })
        .then((r) => stopPlayback(r.status === 200 ? `Không phát được video (mã lỗi ${code}).` : r.data.error));
    });
    playerRef.current = player;
    return () => { player.dispose(); playerRef.current = null; };
  }, [videoId, stopPlayback, applyQuality]);

  const start = async () => {
    if (!playerRef.current || starting) return;
    setStarting(true);
    try {
      const deviceId = await sdkRef.current!.getFingerprint();
      const r = await post('/api/drm/session', { videoId, deviceId });
      if (r.status !== 200) return setBlocked(r.data.error || 'Không mở được phiên xem bảo mật.');
      sessionRef.current = r.data.sessionId;
      heartbeatRef.current = setInterval(() => {
        post('/api/drm/heartbeat', { sessionId: r.data.sessionId })
          .then((h) => { if (h.status === 409 || h.status === 404) stopPlayback(h.data.error); }).catch(() => {});
      }, r.data.heartbeatInterval || 15000);
      playerRef.current.src({ src: `/api/drm/play/${videoId}/index.m3u8?pt=${encodeURIComponent(r.data.playbackToken)}`, type: 'application/x-mpegURL' });
      setLoaded(true);
      playerRef.current.play()?.catch(() => {});
    } catch {
      setBlocked('Không mở được phiên xem bảo mật.');
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="relative w-full h-full bg-black select-none overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
      <div ref={containerRef} className="absolute inset-0" />

      {!loaded && !blocked && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/95 px-6 text-center">
          <span className="mb-5 w-14 h-14 rounded-full flex items-center justify-center border border-gold-light/40 text-gold-light"><Lock size={24} aria-hidden="true" /></span>
          <p className="text-white font-semibold">{title}</p>
          <p className="mt-1 mb-6 text-stone-400 text-sm">Video được mã hoá và gắn mã học viên của bạn.</p>
          <button type="button" onClick={start} disabled={starting} className="btn btn-gold">
            {starting ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Play size={16} fill="currentColor" aria-hidden="true" />}
            {starting ? 'Đang kết nối bảo mật…' : 'Phát video'}
          </button>
        </div>
      )}

      {/* Student ID drifting across the picture, plus a faint tiled copy that can't be cropped out */}
      {loaded && !blocked && (
        <>
          <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden="true">
            <div className="absolute -inset-1/2 grid grid-cols-4 gap-y-24 gap-x-10 -rotate-[25deg] opacity-[0.06]">
              {Array.from({ length: 48 }).map((_, i) => <span key={i} className="text-white text-xs font-mono whitespace-nowrap">{watermark}</span>)}
            </div>
          </div>
          <span className="wm-drift pointer-events-none absolute z-[2] whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] md:text-xs font-semibold text-white/35 bg-black/10" aria-hidden="true">{watermark}</span>
        </>
      )}

      {loaded && !blocked && heights.length > 1 && (
        <div className="absolute top-2 right-2 z-[3]">
          <button type="button" onClick={() => setMenuOpen((o) => !o)} aria-haspopup="menu" aria-expanded={menuOpen}
                  className="min-h-[36px] px-3 rounded-md bg-black/60 text-white text-xs font-semibold hover:bg-black/80">
            {quality === 'auto' ? 'Tự động' : `${quality}p`} ▾
          </button>
          {menuOpen && (
            <ul role="menu" aria-label="Chất lượng video" className="absolute right-0 mt-1 w-32 rounded-md bg-black/90 py-1 text-sm text-white shadow-lg">
              {[...heights, 'auto' as const].map((h) => (
                <li key={h}>
                  <button type="button" role="menuitemradio" aria-checked={quality === h} onClick={() => chooseQuality(h)}
                          className={`w-full text-left px-3 py-2 hover:bg-white/10 ${quality === h ? 'text-gold-light font-semibold' : ''}`}>
                    {h === 'auto' ? 'Tự động' : `${h}p${h >= 1080 ? ' HD' : ''}`}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {obscured && loaded && !blocked && (
        <div className="absolute inset-0 z-40 bg-black flex flex-col items-center justify-center text-center p-8">
          <EyeOff size={40} className="text-white/40 mb-3" aria-hidden="true" />
          <p className="text-white/70">Video tạm ẩn vì cửa sổ không còn được chọn.</p>
          <p className="text-white/40 text-xs mt-1">Bấm vào trang để xem tiếp.</p>
        </div>
      )}

      {blocked && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-8 text-center" role="alert">
          <ShieldAlert size={44} className="text-gold-light mb-4" aria-hidden="true" />
          <p className="text-lg font-semibold text-white">Đã dừng phát video</p>
          <p className="text-stone-400 mt-2 max-w-sm">{blocked}</p>
        </div>
      )}
    </div>
  );
}
