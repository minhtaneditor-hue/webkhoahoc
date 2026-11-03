'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { supabase } from '@/utils/supabase';
import { revalidateSite } from '@/lib/revalidate';
import { Plus, Pencil, Trash2, X, type LucideIcon } from 'lucide-react';
import { PageHeader, LoadingRow, EmptyState, Modal, Field } from './AdminUI';
import ImageUpload from './ImageUpload';

export type CrudField = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'select' | 'url' | 'image' | 'checkbox' | 'custom';
  options?: { value: string; label: string }[];
  hint?: string;
  required?: boolean;
  /** number step (default 1000 for prices) */
  step?: number;
  /** image fields: also store the uploaded picture's size in these columns */
  sizeKeys?: { width: string; height: string };
  /** image fields: also offer picking a frame from a local video file */
  videoFrame?: boolean;
  /** custom fields: draws its own editor and owns these columns (saved as is, '' → null) */
  render?: (form: any, update: (patch: Record<string, any>) => void) => ReactNode;
  keys?: string[];
};

// Generic list + create/edit/delete screen for a simple Supabase table.
// Every save or delete also asks the server to refresh the public pages.
export default function AdminCrud({
  table,
  title,
  description,
  icon,
  fields,
  emptyRecord,
  itemLabel,
  renderMeta,
  titleKey = 'title',
  imageKey = 'thumbnail_url',
  orderBy = { column: 'created_at', ascending: false },
  layout = 'cards',
  imageClassName = 'aspect-video',
}: {
  table: string;
  title: string;
  description: string;
  icon: LucideIcon;
  fields: CrudField[];
  emptyRecord: Record<string, any>;
  itemLabel: string;
  renderMeta?: (row: any) => ReactNode;
  titleKey?: string;
  imageKey?: string | null;
  orderBy?: { column: string; ascending: boolean };
  layout?: 'cards' | 'list';
  imageClassName?: string;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [form, setForm] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(
    () => supabase.from(table).select('*').order(orderBy.column, { ascending: orderBy.ascending }).then(({ data, error }) => {
      setRows(data || []);
      setLoadError(error ? `Không đọc được dữ liệu (${error.message}). Có thể bạn chưa chạy migration mới trong Supabase.` : '');
      setLoading(false);
    }),
    [table, orderBy.column, orderBy.ascending]
  );

  useEffect(() => { load(); }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const payload: Record<string, any> = {};
    for (const f of fields) {
      if (f.type === 'custom') {
        // Columns a custom editor never touched stay out, so a missing optional column does not break saving
        for (const k of f.keys ?? [f.key]) if (form[k] !== undefined) payload[k] = form[k] === '' ? null : form[k];
        continue;
      }
      const v = form[f.key];
      payload[f.key] = f.type === 'number' ? Number(v) || 0 : f.type === 'checkbox' ? !!v : v === '' ? null : v;
      if (f.sizeKeys) {
        payload[f.sizeKeys.width] = Number(form[f.sizeKeys.width]) || 1024;
        payload[f.sizeKeys.height] = Number(form[f.sizeKeys.height]) || 400;
      }
    }
    const { error } = form.id
      ? await supabase.from(table).update(payload).eq('id', form.id)
      : await supabase.from(table).insert(payload);
    setBusy(false);
    if (error) return setError(error.message);
    setForm(null);
    load();
    revalidateSite();
  }

  async function remove(row: any) {
    if (!confirm(`Xóa “${row[titleKey] || itemLabel}”? Không thể hoàn tác.`)) return;
    const { error } = await supabase.from(table).delete().eq('id', row.id);
    if (error) return alert(`Không xóa được: ${error.message}`);
    setForm(null);
    load();
    revalidateSite();
  }

  const Icon = icon;
  const openNew = () => setForm({ ...emptyRecord, ...(orderBy.column === 'sort_order' ? { sort_order: rows.length + 1 } : {}) });

  const actions = (row: any) => (
    <>
      <button onClick={() => setForm({ ...emptyRecord, ...row })} className="btn btn-outline !min-h-[40px] !px-3 text-sm"><Pencil size={14} aria-hidden="true" /> Sửa</button>
      <button onClick={() => remove(row)} className="w-10 h-10 rounded-md flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-danger" aria-label={`Xóa ${row[titleKey] || itemLabel}`}><Trash2 size={16} aria-hidden="true" /></button>
    </>
  );

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description}
        actions={<button onClick={openNew} className="btn btn-gold"><Plus size={16} aria-hidden="true" /> Thêm {itemLabel}</button>} />

      {loadError && <p role="alert" className="p-4 rounded-md bg-red-50 text-danger text-sm">{loadError}</p>}

      {loading ? <LoadingRow /> : rows.length === 0 ? (
        <EmptyState icon={Icon} title={`Chưa có ${itemLabel} nào`} text="Khi chưa có dữ liệu, website dùng nội dung mặc định." action={<button onClick={openNew} className="btn btn-gold">Thêm {itemLabel} đầu tiên</button>} />
      ) : layout === 'list' ? (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.id} className="card p-4 md:p-5 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{row[titleKey]}</p>
                {renderMeta && <div className="mt-1 text-sm text-muted-foreground">{renderMeta(row)}</div>}
              </div>
              <div className="flex gap-1 shrink-0">{actions(row)}</div>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => (
            <li key={row.id} className="card overflow-hidden flex flex-col">
              {imageKey && (
                <div className={`relative ${imageClassName} bg-muted`}>
                  {row[imageKey] ? (
                    <Image src={row[imageKey]} alt="" fill sizes="(min-width: 1280px) 33vw, 50vw" className="object-cover" unoptimized={row[imageKey].startsWith('http')} />
                  ) : (
                    <div className="absolute inset-0 surface-dark flex items-center justify-center"><Icon size={28} className="text-gold-light" aria-hidden="true" /></div>
                  )}
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col">
                <h2 className="text-2xl">{row[titleKey] || <span className="text-muted-foreground">(không tên)</span>}</h2>
                {renderMeta && <div className="mt-1 text-sm text-muted-foreground">{renderMeta(row)}</div>}
                <div className="mt-auto pt-4 flex gap-2 [&>button:first-child]:flex-1">{actions(row)}</div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal title={form?.id ? `Sửa ${itemLabel}` : `Thêm ${itemLabel}`} open={!!form} onClose={() => setForm(null)}>
        {form && (
          <form onSubmit={save} className="space-y-5">
            {fields.map((f) => f.type === 'custom' ? (
              <div key={f.key}>{f.render?.(form, (patch) => setForm((cur: any) => ({ ...cur, ...patch })))}</div>
            ) : (
              <Field key={f.key} id={`f-${f.key}`} label={f.label} hint={f.type === 'checkbox' ? undefined : f.hint}>
                {f.type === 'checkbox' ? (
                  <label className="flex items-center gap-3 min-h-[44px]">
                    <input id={`f-${f.key}`} type="checkbox" className="w-5 h-5" checked={!!form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })} />
                    <span className="text-sm">{f.hint || 'Bật'}</span>
                  </label>
                ) : f.type === 'image' ? (
                  <ImageUpload
                    id={`f-${f.key}`}
                    folder={table}
                    videoFrame={f.videoFrame}
                    value={form[f.key] ?? ''}
                    onChange={(url) => setForm((cur: any) => ({ ...cur, [f.key]: url }))}
                    onSize={f.sizeKeys ? (size) => setForm((cur: any) => ({ ...cur, [f.sizeKeys!.width]: size.width, [f.sizeKeys!.height]: size.height })) : undefined}
                  />
                ) : f.type === 'textarea' ? (
                  <textarea id={`f-${f.key}`} className="input min-h-[96px]" required={f.required} value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                ) : f.type === 'select' ? (
                  <select id={`f-${f.key}`} className="input" value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}>
                    {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <input id={`f-${f.key}`} className="input" required={f.required}
                         type={f.type === 'number' ? 'number' : f.type === 'url' ? 'url' : 'text'}
                         {...(f.type === 'number' ? { min: 0, step: f.step ?? 1000 } : {})}
                         value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                )}
              </Field>
            ))}
            {error && <p role="alert" className="p-3 rounded-md bg-red-50 text-danger text-sm flex justify-between">{error}<button type="button" onClick={() => setError('')} aria-label="Đóng"><X size={14} aria-hidden="true" /></button></p>}
            <div className="flex justify-end gap-2">
              {form.id && (
                <button type="button" onClick={() => remove(form)} className="btn btn-outline mr-auto !text-danger hover:!bg-red-50"><Trash2 size={15} aria-hidden="true" /> Xóa {itemLabel}</button>
              )}
              <button type="button" onClick={() => setForm(null)} className="btn btn-outline">Hủy</button>
              <button type="submit" disabled={busy} className="btn btn-gold">Lưu</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
