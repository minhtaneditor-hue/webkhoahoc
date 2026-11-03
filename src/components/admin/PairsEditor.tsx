'use client';

import { Plus, Trash2, X } from 'lucide-react';
import type { MediaPair } from '@/lib/content';
import ImageUpload from './ImageUpload';

const PAIR_KEYS = ['before_url', 'before_thumbnail_url', 'after_url', 'after_thumbnail_url'] as const;
const EMPTY: MediaPair = { before_url: '', before_thumbnail_url: '', after_url: '', after_thumbnail_url: '' };

/** Columns PairsEditor owns: the first pair's own columns plus extra_pairs. */
export const PAIR_COLUMNS = [...PAIR_KEYS, 'extra_pairs'];

const LINK_HINT = 'Link YouTube, TikTok, Facebook, Instagram, Google Drive, hoặc tải ảnh lên. Để trống nếu không có.';
const IMAGE_HINT = 'Bắt buộc nếu là ảnh. Với video TikTok/Facebook nên tải ảnh chụp màn hình lên.';

/**
 * Trước / Sau pairs of one student work, as a list the admin can grow or shrink.
 * Pair 1 is stored in the row's own columns (what older pages read), pairs 2+ in extra_pairs.
 */
export default function PairsEditor({ form, update, folder }: { form: any; update: (patch: Record<string, any>) => void; folder: string }) {
  const first: MediaPair = Object.fromEntries(PAIR_KEYS.map((k) => [k, form[k] ?? '']));
  const extra: MediaPair[] = Array.isArray(form.extra_pairs) ? form.extra_pairs : [];
  const firstUsed = PAIR_KEYS.some((k) => first[k]) || extra.length > 0 || form._firstPairOpen;
  const pairs = firstUsed ? [first, ...extra] : [];

  function write(next: MediaPair[]) {
    const [head = EMPTY, ...rest] = next;
    update({
      ...Object.fromEntries(PAIR_KEYS.map((k) => [k, head[k] ?? ''])),
      _firstPairOpen: next.length > 0,
      ...(rest.length || form.extra_pairs !== undefined ? { extra_pairs: rest } : {}),
    });
  }
  const set = (i: number, patch: MediaPair) => write(pairs.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const remove = (i: number) => {
    const hasContent = PAIR_KEYS.some((k) => pairs[i][k]);
    if (hasContent && !confirm(`Xóa cặp ${i + 1}? Ảnh và link trong cặp này sẽ bị bỏ khi bạn bấm Lưu.`)) return;
    write(pairs.filter((_, j) => j !== i));
  };

  const side = (i: number, p: MediaPair, which: 'before' | 'after') => {
    const url = `${which}_url` as const;
    const thumb = `${which}_thumbnail_url` as const;
    const filled = !!(p[url] || p[thumb]);
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-sm font-bold ${which === 'after' ? 'text-gold' : 'text-ink'}`}>{which === 'before' ? 'TRƯỚC khi học' : 'SAU khi học'}</p>
          {filled && (
            <button type="button" onClick={() => set(i, { [url]: '', [thumb]: '' })} className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-danger">
              <X size={13} aria-hidden="true" /> Bỏ phần này
            </button>
          )}
        </div>
        <label htmlFor={`pair-${i}-${url}`} className="sr-only">Link video / ảnh {which === 'before' ? 'trước' : 'sau'} khi học, cặp {i + 1}</label>
        <input id={`pair-${i}-${url}`} className="input" placeholder="Link video / ảnh" value={p[url] ?? ''} onChange={(e) => set(i, { [url]: e.target.value })} />
        <ImageUpload id={`pair-${i}-${thumb}`} folder={folder} value={p[thumb] ?? ''} onChange={(v) => set(i, { [thumb]: v })} />
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
