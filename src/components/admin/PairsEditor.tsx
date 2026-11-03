'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Plus, Trash2, X } from 'lucide-react';
import type { MediaPair } from '@/lib/content';
import ImageUpload, { uploadImage } from './ImageUpload';

const PAIR_KEYS = ['before_url', 'before_thumbnail_url', 'after_url', 'after_thumbnail_url'] as const;
const MORE_KEYS = ['before_more', 'after_more'] as const;
const EMPTY: MediaPair = { before_url: '', before_thumbnail_url: '', after_url: '', after_thumbnail_url: '' };

/** Columns PairsEditor owns: the first pair's own columns plus extra_pairs. */
export const PAIR_COLUMNS = [...PAIR_KEYS, ...MORE_KEYS, 'extra_pairs'];

/** Extra pictures on one side: thumbnails with a remove button, and a picker that takes several files at once. */
function MoreImages({ id, images, onChange, folder }: { id: string; images: string[]; onChange: (next: string[]) => void; folder: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState('');

  async function add(files: FileList) {
    setError('');
    setBusy(files.length);
    const added: string[] = [];
    for (const f of Array.from(files)) {
      try { added.push(await uploadImage(f, folder)); } catch (e: any) { setError(`${f.name}: ${e.message}`); }
      setBusy((n) => n - 1);
    }
    if (added.length) onChange([...images, ...added]);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {images.map((src, i) => (
          <div key={src + i} className="relative w-20 h-20 rounded-[var(--radius-md)] overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of an uploaded URL */}
            <img src={src} alt="" className="w-full h-full object-cover !rounded-none" />
            <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-danger" aria-label={`Xóa ảnh thêm ${i + 1}`}>
              <X size={13} aria-hidden="true" />
            </button>
          </div>
        ))}
        <button type="button" id={id} onClick={() => fileRef.current?.click()} disabled={busy > 0} className="w-20 h-20 rounded-[var(--radius-md)] border border-dashed border-line-strong text-muted-foreground hover:text-ink hover:border-gold flex flex-col items-center justify-center gap-1 text-[11px] font-semibold">
          {busy > 0 ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <ImagePlus size={18} aria-hidden="true" />}
          {busy > 0 ? `Còn ${busy}…` : 'Thêm ảnh'}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files?.length && add(e.target.files)} />
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    </div>
  );
}

const LINK_HINT = 'Link YouTube, TikTok, Facebook, Instagram, Google Drive, hoặc tải ảnh lên. Để trống nếu không có.';
const IMAGE_HINT = 'Bắt buộc nếu là ảnh. Với video TikTok/Facebook nên tải ảnh chụp màn hình lên.';

/**
 * Trước / Sau pairs of one student work, as a list the admin can grow or shrink.
 * Pair 1 is stored in the row's own columns (what older pages read), pairs 2+ in extra_pairs.
 */
export default function PairsEditor({ form, update, folder }: { form: any; update: (patch: Record<string, any>) => void; folder: string }) {
  const first: MediaPair = {
    ...Object.fromEntries(PAIR_KEYS.map((k) => [k, form[k] ?? ''])),
    ...Object.fromEntries(MORE_KEYS.filter((k) => form[k] !== undefined).map((k) => [k, form[k]])),
  };
  const extra: MediaPair[] = Array.isArray(form.extra_pairs) ? form.extra_pairs : [];
  const firstUsed = PAIR_KEYS.some((k) => first[k]) || MORE_KEYS.some((k) => first[k]?.length) || extra.length > 0 || form._firstPairOpen;
  const pairs = firstUsed ? [first, ...extra] : [];

  function write(next: MediaPair[]) {
    const [head = EMPTY, ...rest] = next;
    update({
      ...Object.fromEntries(PAIR_KEYS.map((k) => [k, head[k] ?? ''])),
      // Extra-picture columns are only sent once used, or when the row already has them
      ...Object.fromEntries(MORE_KEYS.filter((k) => head[k] !== undefined || form[k] !== undefined).map((k) => [k, head[k] ?? []])),
      _firstPairOpen: next.length > 0,
      // A pair moved up to first place brings its own frame to the work
      ...(head.orientation ? { orientation: head.orientation } : {}),
      ...(rest.length || form.extra_pairs !== undefined ? { extra_pairs: rest } : {}),
    });
  }
  const set = (i: number, patch: MediaPair) => write(pairs.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const remove = (i: number) => {
    const hasContent = PAIR_KEYS.some((k) => pairs[i][k]) || MORE_KEYS.some((k) => pairs[i][k]?.length);
    if (hasContent && !confirm(`Xóa cặp ${i + 1}? Ảnh và link trong cặp này sẽ bị bỏ khi bạn bấm Lưu.`)) return;
    write(pairs.filter((_, j) => j !== i));
  };

  const side = (i: number, p: MediaPair, which: 'before' | 'after') => {
    const url = `${which}_url` as const;
    const thumb = `${which}_thumbnail_url` as const;
    const more = `${which}_more` as const;
    const filled = !!(p[url] || p[thumb] || p[more]?.length);
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-sm font-bold ${which === 'after' ? 'text-gold' : 'text-ink'}`}>{which === 'before' ? 'TRƯỚC khi học' : 'SAU khi học'}</p>
          {filled && (
            <button type="button" onClick={() => set(i, { [url]: '', [thumb]: '', [more]: [] })} className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-danger">
              <X size={13} aria-hidden="true" /> Bỏ phần này
            </button>
          )}
        </div>
        <label htmlFor={`pair-${i}-${url}`} className="sr-only">Link video / ảnh {which === 'before' ? 'trước' : 'sau'} khi học, cặp {i + 1}</label>
        <input id={`pair-${i}-${url}`} className="input" placeholder="Link video / ảnh" value={p[url] ?? ''} onChange={(e) => set(i, { [url]: e.target.value })} />
        <ImageUpload id={`pair-${i}-${thumb}`} folder={folder} value={p[thumb] ?? ''} onChange={(v) => set(i, { [thumb]: v })} />
        <p className="pt-1 text-xs font-semibold text-muted-foreground">Ảnh thêm (chọn được nhiều ảnh một lần)</p>
        <MoreImages id={`pair-${i}-${more}`} images={p[more] ?? []} folder={folder} onChange={(next) => set(i, { [more]: next })} />
      </div>
    );
  };

  return (
    <fieldset className="space-y-3">
      <legend className="font-semibold">Ảnh / video Trước và Sau</legend>
      <p className="text-sm text-muted-foreground">Mỗi cặp là một lần so sánh Trước → Sau. Thêm bao nhiêu cặp cũng được, phần nào không có thì bỏ trống. {LINK_HINT} Ảnh đại diện: {IMAGE_HINT}</p>

      {pairs.map((p, i) => (
        <div key={i} className="rounded-[var(--radius-md)] border border-line p-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold">Cặp {i + 1}</p>
            {i > 0 && (
              <select aria-label={`Khung hình cặp ${i + 1}`} className="input !min-h-[36px] !w-auto !py-1 text-sm mr-auto" value={p.orientation ?? ''} onChange={(e) => set(i, { orientation: (e.target.value || null) as MediaPair['orientation'] })}>
                <option value="">Khung như cặp 1</option>
                <option value="vertical">Dọc 9:16</option>
                <option value="horizontal">Ngang 16:9</option>
              </select>
            )}
            <button type="button" onClick={() => remove(i)} className="inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-md text-sm font-semibold text-muted-foreground hover:bg-red-50 hover:text-danger">
              <Trash2 size={14} aria-hidden="true" /> Xóa cặp
            </button>
          </div>
          <div className="grid gap-4 [&>div+div]:pt-4 [&>div+div]:border-t [&>div+div]:border-line">
            {side(i, p, 'before')}
            {side(i, p, 'after')}
          </div>
        </div>
      ))}

      <button type="button" onClick={() => write([...pairs, { ...EMPTY }])} className="btn btn-outline w-full border-dashed">
        <Plus size={16} aria-hidden="true" /> Thêm cặp Trước / Sau
      </button>
    </fieldset>
  );
}
