'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { supabase } from '@/utils/supabase';
import { Plus, Pencil, Trash2, X, type LucideIcon } from 'lucide-react';
import { PageHeader, LoadingRow, EmptyState, Modal, Field } from './AdminUI';

export type CrudField = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'select' | 'url';
  options?: { value: string; label: string }[];
  hint?: string;
  required?: boolean;
};

// Generic list + create/edit/delete screen for a simple Supabase table.
export default function AdminCrud({
  table,
  title,
  description,
  icon,
  fields,
  emptyRecord,
  itemLabel,
  renderMeta,
}: {
  table: string;
  title: string;
  description: string;
  icon: LucideIcon;
  fields: CrudField[];
  emptyRecord: Record<string, any>;
  itemLabel: string;
  renderMeta?: (row: any) => ReactNode;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(
    () => supabase.from(table).select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setRows(data || []);
      setLoading(false);
    }),
    [table]
  );

  useEffect(() => { load(); }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const payload: Record<string, any> = {};
    for (const f of fields) {
      const v = form[f.key];
      payload[f.key] = f.type === 'number' ? Number(v) || 0 : v === '' ? null : v;
    }
    const { error } = form.id
      ? await supabase.from(table).update(payload).eq('id', form.id)
      : await supabase.from(table).insert(payload);
    setBusy(false);
    if (error) return setError(error.message);
    setForm(null);
    load();
  }

  async function remove(row: any) {
    if (!confirm(`Xóa “${row.title}”? Không thể hoàn tác.`)) return;
    await supabase.from(table).delete().eq('id', row.id);
    load();
  }

  const Icon = icon;

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description}
        actions={<button onClick={() => setForm({ ...emptyRecord })} className="btn btn-gold"><Plus size={16} aria-hidden="true" /> Thêm {itemLabel}</button>} />

      {loading ? <LoadingRow /> : rows.length === 0 ? (
        <EmptyState icon={Icon} title={`Chưa có ${itemLabel} nào`} action={<button onClick={() => setForm({ ...emptyRecord })} className="btn btn-gold">Thêm {itemLabel} đầu tiên</button>} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => (
            <li key={row.id} className="card overflow-hidden flex flex-col">
              <div className="relative aspect-video bg-muted">
                {row.thumbnail_url ? (
                  <Image src={row.thumbnail_url} alt="" fill sizes="(min-width: 1280px) 33vw, 50vw" className="object-cover" unoptimized={row.thumbnail_url.startsWith('http')} />
                ) : (
                  <div className="absolute inset-0 surface-dark flex items-center justify-center"><Icon size={28} className="text-gold-light" aria-hidden="true" /></div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h2 className="text-2xl">{row.title}</h2>
                {renderMeta && <div className="mt-1 text-sm text-muted-foreground">{renderMeta(row)}</div>}
                <div className="mt-auto pt-4 flex gap-2">
                  <button onClick={() => setForm({ ...emptyRecord, ...row })} className="btn btn-outline !min-h-[40px] !px-3 text-sm flex-1"><Pencil size={14} aria-hidden="true" /> Sửa</button>
                  <button onClick={() => remove(row)} className="w-10 h-10 rounded-md flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-danger" aria-label={`Xóa ${row.title}`}><Trash2 size={16} aria-hidden="true" /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal title={form?.id ? `Sửa ${itemLabel}` : `Thêm ${itemLabel}`} open={!!form} onClose={() => setForm(null)}>
        {form && (
          <form onSubmit={save} className="space-y-5">
            {fields.map((f) => (
              <Field key={f.key} id={`f-${f.key}`} label={f.label} hint={f.hint}>
                {f.type === 'textarea' ? (
                  <textarea id={`f-${f.key}`} className="input min-h-[96px]" value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                ) : f.type === 'select' ? (
                  <select id={`f-${f.key}`} className="input" value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}>
                    {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <input id={`f-${f.key}`} className="input" required={f.required}
                         type={f.type === 'number' ? 'number' : f.type === 'url' ? 'url' : 'text'}
                         {...(f.type === 'number' ? { min: 0, step: 1000 } : {})}
                         value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                )}
              </Field>
            ))}
            {error && <p role="alert" className="p-3 rounded-md bg-red-50 text-danger text-sm flex justify-between">{error}<button type="button" onClick={() => setError('')} aria-label="Đóng"><X size={14} aria-hidden="true" /></button></p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setForm(null)} className="btn btn-outline">Hủy</button>
              <button type="submit" disabled={busy} className="btn btn-gold">Lưu</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
