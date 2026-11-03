'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Film, X, ChevronLeft, ChevronRight, Camera, Loader2 } from 'lucide-react';

const FRAME = 1 / 30;
const MAX_SIDE = 1280;

/**
 * Pick a cover image from a clip on this computer: open the file, scrub to a good frame,
 * capture it. The video never leaves the browser; only the captured JPEG is passed to onPick.
 * (Facebook / TikTok embeds cannot be read frame by frame, so the original file is used.)
 */
export default function VideoFramePicker({ onPick, onClose }: { onPick: (image: Blob) => Promise<void>; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState('');
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => () => { if (src) URL.revokeObjectURL(src); }, [src]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (!src) return;
      if (e.key === 'ArrowLeft') seek(time - FRAME);
      if (e.key === 'ArrowRight') seek(time + FRAME);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  const openFile = (file?: File) => {
    setError('');
    if (!file) return;
    if (!file.type.startsWith('video/')) return setError('Hãy chọn file video (MP4, MOV…).');
    if (src) URL.revokeObjectURL(src);
    setSrc(URL.createObjectURL(file));
    setTime(0);
  };

  const seek = (t: number) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const next = Math.min(Math.max(t, 0), Math.max(duration - 0.05, 0));
    v.currentTime = next;
    setTime(next);
  };

  const capture = async () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    setBusy(true);
    setError('');
    try {
      const scale = Math.min(1, MAX_SIDE / Math.max(v.videoWidth, v.videoHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(v.videoWidth * scale);
      canvas.height = Math.round(v.videoHeight * scale);
      canvas.getContext('2d')!.drawImage(v, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.88));
      if (!blob) throw new Error('Không chụp được khung hình.');
      await onPick(blob);
      onClose();
    } catch (e: any) {
      setError(e.message || 'Không chụp được khung hình.');
    } finally {
      setBusy(false);
    }
  };

  const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}.${String(Math.floor((t % 1) * 10))}`;

  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 z-[1100] flex items-start sm:items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Chọn ảnh bìa từ clip">
      <div className="fixed inset-0 bg-onyx/70" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg card shadow-[var(--shadow-lift)] my-8">
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-line">
          <h2 className="text-2xl">Chọn ảnh bìa từ clip</h2>
          <button type="button" onClick={onClose} className="w-11 h-11 -mr-2 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-ink" aria-label="Đóng">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {!src ? (
            <button type="button" onClick={() => fileRef.current?.click()}
                    className="w-full rounded-[var(--radius-md)] border-2 border-dashed border-line-strong p-10 flex flex-col items-center gap-3 text-muted-foreground hover:border-gold hover:text-ink">
              <Film size={32} aria-hidden="true" />
              <span className="font-semibold">Mở file clip trên máy</span>
              <span className="text-sm text-center">Chọn đúng clip feedback (MP4, MOV). File chỉ mở trên máy bạn, không tải lên web.</span>
            </button>
          ) : (
            <>
              <div className="rounded-[var(--radius-md)] overflow-hidden bg-onyx flex justify-center">
                <video ref={videoRef} src={src} muted playsInline preload="auto" className="max-h-[50vh] w-auto"
                       onLoadedMetadata={(e) => { const d = e.currentTarget.duration || 0; const start = Math.min(1, d / 3); setDuration(d); e.currentTarget.currentTime = start; setTime(start); }} />
              </div>
              <div>
                <label htmlFor="frame-time" className="field-label">Kéo để chọn khung hình · {fmt(time)} / {fmt(duration)}</label>
                <input id="frame-time" type="range" min={0} max={duration || 0} step={FRAME} value={time} onChange={(e) => seek(Number(e.target.value))} className="w-full accent-[var(--color-gold)]" />
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  <button type="button" onClick={() => seek(time - FRAME)} className="btn btn-outline !min-h-[40px] !px-3" aria-label="Lùi 1 khung hình"><ChevronLeft size={16} aria-hidden="true" /></button>
                  <button type="button" onClick={() => seek(time + FRAME)} className="btn btn-outline !min-h-[40px] !px-3" aria-label="Tới 1 khung hình"><ChevronRight size={16} aria-hidden="true" /></button>
                </div>
                <button type="button" onClick={() => fileRef.current?.click()} className="text-sm underline underline-offset-4 text-muted-foreground min-h-[40px]">Đổi clip khác</button>
              </div>
              <button type="button" onClick={capture} disabled={busy} className="btn btn-gold w-full">
                {busy ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Camera size={18} aria-hidden="true" />} Dùng khung hình này làm ảnh bìa
              </button>
              <p className="text-xs text-muted-foreground">Mẹo: phím ← → để lùi / tới từng khung hình. Chọn lúc học viên đang cười hoặc nhìn thẳng ống kính.</p>
            </>
          )}
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={(e) => { openFile(e.target.files?.[0]); e.target.value = ''; }} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
