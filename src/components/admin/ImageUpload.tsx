'use client';

import { useRef, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Upload, Loader2, X, ImageIcon, Film } from 'lucide-react';
import VideoFramePicker from './VideoFramePicker';

const MAX_MB = 5;

/** Reads the natural size of an image file (used to lay out feedback screenshots). */
function readSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(url); };
    img.onerror = () => { resolve({ width: 1024, height: 400 }); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

/**
 * Upload an image to the public Supabase Storage bucket "media" (admins only, see migration 004),
 * or paste a link. Calls onChange with the public URL.
 * videoFrame: also offer "Chọn từ clip" (capture a frame of a local video file as the image).
 */
export default function ImageUpload({
  id,
  value,
  onChange,
  folder = 'misc',
  onSize,
  videoFrame = false,
}: {
  id: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  onSize?: (size: { width: number; height: number }) => void;
  videoFrame?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [picking, setPicking] = useState(false);

  async function handleFile(file: File | Blob) {
    setError('');
    if (!file.type.startsWith('image/')) return setError('Vui lòng chọn file ảnh (JPG, PNG, WebP).');
    if (file.size > MAX_MB * 1024 * 1024) return setError(`Ảnh quá lớn, tối đa ${MAX_MB} MB.`);
    setBusy(true);
    try {
      if (onSize) onSize(await readSize(file as File));
      const ext = (file instanceof File ? file.name.split('.').pop()?.toLowerCase() : '') || 'jpg';
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from('media').upload(path, file, { cacheControl: '31536000', upsert: false });
      if (upErr) throw upErr;
      onChange(supabase.storage.from('media').getPublicUrl(path).data.publicUrl);
    } catch (e: any) {
      setError(e.message?.includes('Bucket not found')
        ? 'Chưa có kho ảnh "media". Hãy chạy file migration 004 trong Supabase.'
        : `Tải ảnh thất bại: ${e.message}`);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-3 items-start">
        <div className="w-20 h-20 shrink-0 rounded-[var(--radius-md)] bg-muted overflow-hidden flex items-center justify-center">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin preview of an arbitrary URL
            <img src={value} alt="" className="w-full h-full object-cover !rounded-none" />
          ) : (
            <ImageIcon size={22} className="text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="btn btn-dark !min-h-[40px] !px-3 text-sm">
              {busy ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Upload size={15} aria-hidden="true" />}
              {busy ? 'Đang tải…' : 'Tải ảnh lên'}
            </button>
            {videoFrame && (
              <button type="button" onClick={() => setPicking(true)} disabled={busy} className="btn btn-outline !min-h-[40px] !px-3 text-sm">
                <Film size={15} aria-hidden="true" /> Chọn từ clip
              </button>
            )}
            {value && (
              <button type="button" onClick={() => onChange('')} className="btn btn-outline !min-h-[40px] !px-3 text-sm" aria-label="Xóa ảnh">
                <X size={15} aria-hidden="true" />
              </button>
            )}
          </div>
          <input id={id} className="input !min-h-[40px] text-sm" placeholder="…hoặc dán link ảnh" value={value} onChange={(e) => onChange(e.target.value)} />
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      {picking && <VideoFramePicker onPick={(blob) => handleFile(blob)} onClose={() => setPicking(false)} />}
    </div>
  );
}
