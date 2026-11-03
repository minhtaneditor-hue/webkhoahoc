"use client";

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { formatVND } from '@/lib/supabase-public';
import { normalizeCode } from '@/lib/promo';
import { TicketPercent, Plus, Pencil, Trash2, Loader2, Shuffle } from 'lucide-react';
import { PageHeader, LoadingRow, EmptyState, Modal, Field, thClass, tdClass } from '@/components/admin/AdminUI';

// Promo codes (migration 017). Checkout validates them on the server (src/lib/promo.ts).
type Promo = {
  code: string; kind: 'percent' | 'amount'; value: number; course_id: string | null; max_uses: number | null;
  starts_at: string | null; expires_at: string | null; is_active: boolean; note: string | null;
};
const EMPTY: Promo = { code: '', kind: 'percent', value: 10, course_id: null, max_uses: null, starts_at: null, expires_at: null, is_active: true, note: '' };

/** timestamptz ⇄ <input type="date"> (start of day / end of day, local time) */
const toDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('sv-SE') : '');
const fromDate = (d: string, end = false) => (d ? new Date(`${d}T${end ? '23:59:59' : '00:00:00'}`).toISOString() : null);

const randomCode = () => 'TANVA' + Math.random().toString(36).slice(2, 6).toUpperCase();

export default function PromosPage() {
  const [rows, setRows] = useState<Promo[] | null>(null);
  const [used, setUsed] = useState<Record<string, number>>({});
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [editing, setEditing] = useState<{ data: Promo; isNew: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [{ data: promos, error: e }, { data: paid }, { data: cs }] = await Promise.all([
      supabase.from('promo_codes').select('*').order('created_at', { ascending: false }),
      supabase.from('payments').select('promo_code').eq('status', 'success').not('promo_code', 'is', null),
      supabase.from('courses').select('id, title').order('created_at'),
    ]);
    if (e) setError(`Chưa đọc được bảng mã giảm giá: ${e.message}. Hãy chạy file SQL 017_promo_codes.sql.`);
    setRows((promos as Promo[]) || []);
    const counts: Record<string, number> = {};
    for (const p of paid || []) counts[p.promo_code] = (counts[p.promo_code] || 0) + 1;
    setUsed(counts);
    setCourses(cs || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const d = { ...editing.data, code: normalizeCode(editing.data.code), note: editing.data.note?.trim() || null };
    if (!/^[A-Z0-9_-]{3,30}$/.test(d.code)) return setError('Mã gồm 3–30 ký tự: chữ không dấu, số, gạch ngang.');
    if (!(d.value > 0) || (d.kind === 'percent' && d.value > 100)) return setError(d.kind === 'percent' ? 'Phần trăm từ 1 đến 100.' : 'Số tiền giảm phải lớn hơn 0.');
    if (d.starts_at && d.expires_at && d.starts_at > d.expires_at) return setError('Ngày hết hạn phải sau ngày bắt đầu.');
    setSaving(true); setError('');
    const { error: err } = editing.isNew
      ? await supabase.from('promo_codes').insert(d)
      : await supabase.from('promo_codes').update(d).eq('code', d.code);
    setSaving(false);
    if (err) return setError(err.code === '23505' ? 'Mã này đã có, hãy chọn mã khác.' : err.message);
    setEditing(null);
    load();
  };

  const toggle = async (p: Promo) => {
    await supabase.from('promo_codes').update({ is_active: !p.is_active }).eq('code', p.code);
    load();
  };

  const remove = async (p: Promo) => {
    if (!confirm(`Xoá mã ${p.code}? Đơn hàng cũ vẫn giữ nguyên.`)) return;
    await supabase.from('promo_codes').delete().eq('code', p.code);
    load();
  };

  const status = (p: Promo) => {
    const now = Date.now();
    if (!p.is_active) return ['Đã tắt', '!bg-muted !text-muted-foreground'];
    if (p.expires_at && Date.parse(p.expires_at) < now) return ['Hết hạn', '!bg-muted !text-muted-foreground'];
    if (p.max_uses && (used[p.code] || 0) >= p.max_uses) return ['Hết lượt', '!bg-muted !text-muted-foreground'];
    if (p.starts_at && Date.parse(p.starts_at) > now) return ['Chưa bắt đầu', ''];
    return ['Đang dùng được', '!bg-green-50 !text-success'];
  };

  const set = (patch: Partial<Promo>) => editing && setEditing({ ...editing, data: { ...editing.data, ...patch } });
  const d = editing?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mã giảm giá"
        description="Tạo, sửa, bật/tắt mã. Mã được kiểm tra khi khách bấm “Áp dụng” và lần nữa lúc tạo đơn."
        actions={<button onClick={() => { setError(''); setEditing({ data: { ...EMPTY, code: randomCode() }, isNew: true }); }} className="btn btn-gold"><Plus size={16} aria-hidden="true" /> Thêm mã</button>}
      />
      {error && !editing && <p role="alert" className="text-sm text-danger">{error}</p>}

      {!rows ? <LoadingRow /> : rows.length === 0 ? (
        <EmptyState icon={TicketPercent} title="Chưa có mã giảm giá" text="Bấm “Thêm mã” để tạo mã đầu tiên." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead><tr>
              <th className={thClass}>Mã</th><th className={thClass}>Giảm</th><th className={thClass}>Áp dụng</th>
              <th className={thClass}>Đã dùng</th><th className={thClass}>Thời hạn</th><th className={thClass}>Trạng thái</th><th className={thClass}><span className="sr-only">Thao tác</span></th>
            </tr></thead>
            <tbody className="divide-y divide-line">
              {rows.map((p) => {
                const [label, cls] = status(p);
                return (
                  <tr key={p.code}>
                    <td className={tdClass}>
                      <p className="font-mono font-bold text-ink">{p.code}</p>
                      {p.note && <p className="text-xs text-muted-foreground mt-0.5">{p.note}</p>}
                    </td>
                    <td className={`${tdClass} whitespace-nowrap font-semibold`}>{p.kind === 'percent' ? `${p.value}%` : formatVND(p.value)}</td>
                    <td className={`${tdClass} text-sm`}>{p.course_id ? courses.find((c) => c.id === p.course_id)?.title || 'Khóa đã xoá' : 'Tất cả sản phẩm'}</td>
                    <td className={`${tdClass} whitespace-nowrap text-sm`}>{used[p.code] || 0}{p.max_uses ? ` / ${p.max_uses}` : ''} lượt</td>
                    <td className={`${tdClass} whitespace-nowrap text-sm`}>
                      {p.starts_at || p.expires_at ? `${p.starts_at ? new Date(p.starts_at).toLocaleDateString('vi-VN') : '…'} → ${p.expires_at ? new Date(p.expires_at).toLocaleDateString('vi-VN') : '…'}` : 'Không giới hạn'}
                    </td>
                    <td className={tdClass}>
                      <button onClick={() => toggle(p)} className={`badge ${cls} cursor-pointer`} title={p.is_active ? 'Bấm để tắt' : 'Bấm để bật'}>{label}</button>
                    </td>
                    <td className={`${tdClass} whitespace-nowrap text-right`}>
                      <button onClick={() => { setError(''); setEditing({ data: p, isNew: false }); }} className="w-11 h-11 inline-flex items-center justify-center rounded-md hover:bg-muted" aria-label={`Sửa ${p.code}`}><Pencil size={16} aria-hidden="true" /></button>
                      <button onClick={() => remove(p)} className="w-11 h-11 inline-flex items-center justify-center rounded-md hover:bg-muted text-danger" aria-label={`Xoá ${p.code}`}><Trash2 size={16} aria-hidden="true" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal title={editing?.isNew ? 'Thêm mã giảm giá' : `Sửa mã ${d?.code || ''}`} open={!!editing} onClose={() => setEditing(null)}>
        {d && (
          <form onSubmit={save} className="grid gap-4" noValidate>
            <Field id="promo-code" label="Mã" hint={editing?.isNew ? 'Khách nhập mã này khi thanh toán. Không phân biệt hoa thường.' : 'Không đổi được mã sau khi tạo. Muốn mã khác thì tạo mã mới.'}>
              <div className="flex gap-2">
                <input id="promo-code" className="input uppercase font-mono" value={d.code} disabled={!editing?.isNew} onChange={(e) => set({ code: e.target.value })} autoComplete="off" />
                {editing?.isNew && <button type="button" onClick={() => set({ code: randomCode() })} className="btn btn-outline shrink-0" aria-label="Tạo mã ngẫu nhiên"><Shuffle size={16} aria-hidden="true" /></button>}
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field id="promo-kind" label="Kiểu giảm">
                <select id="promo-kind" className="input" value={d.kind} onChange={(e) => set({ kind: e.target.value as Promo['kind'] })}>
                  <option value="percent">Theo %</option>
                  <option value="amount">Số tiền (VNĐ)</option>
                </select>
              </Field>
              <Field id="promo-value" label={d.kind === 'percent' ? 'Giảm bao nhiêu %' : 'Giảm bao nhiêu đồng'}>
                <input id="promo-value" type="number" inputMode="numeric" min={1} max={d.kind === 'percent' ? 100 : undefined} className="input" value={d.value || ''} onChange={(e) => set({ value: Number(e.target.value) })} />
              </Field>
            </div>
            <Field id="promo-course" label="Áp dụng cho">
              <select id="promo-course" className="input" value={d.course_id || ''} onChange={(e) => set({ course_id: e.target.value || null })}>
                <option value="">Tất cả khóa học và sản phẩm</option>
                {courses.map((c) => <option key={c.id} value={c.id}>Chỉ khóa: {c.title}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field id="promo-start" label="Ngày bắt đầu" hint="Để trống: dùng được ngay.">
                <input id="promo-start" type="date" className="input" value={toDate(d.starts_at)} onChange={(e) => set({ starts_at: fromDate(e.target.value) })} />
              </Field>
              <Field id="promo-end" label="Ngày hết hạn" hint="Để trống: không hết hạn.">
                <input id="promo-end" type="date" className="input" value={toDate(d.expires_at)} onChange={(e) => set({ expires_at: fromDate(e.target.value, true) })} />
              </Field>
            </div>
            <Field id="promo-max" label="Số lượt dùng tối đa" hint="Tính theo đơn đã thanh toán. Để trống: không giới hạn.">
              <input id="promo-max" type="number" inputMode="numeric" min={1} className="input" value={d.max_uses ?? ''} onChange={(e) => set({ max_uses: e.target.value ? Number(e.target.value) : null })} />
            </Field>
            <Field id="promo-note" label="Ghi chú (chỉ admin thấy)">
              <input id="promo-note" className="input" value={d.note || ''} onChange={(e) => set({ note: e.target.value })} placeholder="VD: Ưu đãi livestream 11/11" />
            </Field>
            <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
              <input type="checkbox" className="w-5 h-5 accent-[var(--color-gold)]" checked={d.is_active} onChange={(e) => set({ is_active: e.target.checked })} />
              <span className="text-sm font-medium">Đang bật (khách dùng được)</span>
            </label>
            {error && <p role="alert" className="text-sm text-danger">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="btn btn-outline">Huỷ</button>
              <button type="submit" disabled={saving} className="btn btn-gold">{saving && <Loader2 size={16} className="animate-spin" aria-hidden="true" />} Lưu mã</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
