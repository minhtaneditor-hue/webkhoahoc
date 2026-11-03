"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { CalendarCheck, Download } from 'lucide-react';
import { PageHeader, LoadingRow, EmptyState, thClass, tdClass } from '@/components/admin/AdminUI';

// Free Audit bookings and "Nhận tư vấn" requests (migration 018, /api/consult)
const KINDS: Record<string, string> = { audit: 'Audit miễn phí', coaching: 'Coaching', course: 'Khóa học' };
const STATUSES: Record<string, string> = { new: 'Mới', contacted: 'Đã liên hệ', done: 'Xong' };

export default function ConsultsPage() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('consult_requests').select('*').order('created_at', { ascending: false }).then(({ data, error: e }) => {
      if (e) setError(`Chưa đọc được dữ liệu: ${e.message}. Hãy chạy file SQL 018_consult_requests.sql.`);
      setRows(data || []);
    });
  }, []);

  const setStatus = async (id: number, status: string) => {
    setRows((r) => r?.map((x) => (x.id === id ? { ...x, status } : x)) || null);
    await supabase.from('consult_requests').update({ status }).eq('id', id);
  };

  const shown = (rows || []).filter((r) => filter === 'all' || r.status === filter || r.kind === filter);

  const exportCsv = () => {
    const lines = [['Ngày', 'Loại', 'Gói / khóa', 'Hình thức', 'Tên', 'Zalo', 'Email', 'Lời nhắn', 'Trạng thái'],
      ...shown.map((r) => [new Date(r.created_at).toLocaleString('vi-VN'), KINDS[r.kind] || r.kind, r.product || '', r.format || '', r.name, r.phone, r.email, r.message || '', STATUSES[r.status] || r.status])];
    const csv = '﻿' + lines.map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'dat-lich-tu-van.csv';
    a.click();
  };

  const newCount = (rows || []).filter((r) => r.status === 'new').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Đặt lịch & tư vấn"
        description={`Người đặt lịch Audit miễn phí hoặc bấm “Nhận tư vấn” dưới giá tiền. Mỗi yêu cầu mới cũng được gửi về email của bạn.${newCount ? ` Đang có ${newCount} yêu cầu mới.` : ''}`}
        actions={shown.length ? <button onClick={exportCsv} className="btn btn-outline"><Download size={16} aria-hidden="true" /> Tải CSV</button> : undefined}
      />
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc yêu cầu">
        {[['all', 'Tất cả'], ['new', 'Mới'], ['contacted', 'Đã liên hệ'], ['done', 'Xong'], ['audit', 'Audit'], ['coaching', 'Coaching'], ['course', 'Khóa học']].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} aria-pressed={filter === k} className={`badge cursor-pointer min-h-[36px] ${filter === k ? '!bg-onyx !text-white' : ''}`}>{l}</button>
        ))}
      </div>
      {!rows ? <LoadingRow /> : shown.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="Chưa có yêu cầu nào" text="Nút “Đặt lịch Audit miễn phí” và “Nhận tư vấn” nằm ở trang Coaching, trang khóa học và trang chủ." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead><tr>
              <th className={thClass}>Ngày</th><th className={thClass}>Yêu cầu</th><th className={thClass}>Khách</th>
              <th className={thClass}>Lời nhắn</th><th className={thClass}>Trạng thái</th>
            </tr></thead>
            <tbody className="divide-y divide-line">
              {shown.map((r) => (
                <tr key={r.id} className={r.status === 'new' ? 'bg-gold/5' : ''}>
                  <td className={`${tdClass} whitespace-nowrap text-sm`}>{new Date(r.created_at).toLocaleString('vi-VN')}</td>
                  <td className={tdClass}>
                    <p className="font-semibold text-ink">{KINDS[r.kind] || r.kind}</p>
                    <p className="text-sm text-muted-foreground">{[r.product, r.format].filter(Boolean).join(' · ')}</p>
                  </td>
                  <td className={tdClass}>
                    <p className="font-semibold text-ink">{r.name}</p>
                    <a href={`https://zalo.me/${r.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="block text-sm underline underline-offset-4">{r.phone}</a>
                    <a href={`mailto:${r.email}`} className="block text-sm text-muted-foreground underline underline-offset-4">{r.email}</a>
                  </td>
                  <td className={`${tdClass} text-sm max-w-xs whitespace-pre-line`}>{r.message || '—'}</td>
                  <td className={tdClass}>
                    <label className="sr-only" htmlFor={`st-${r.id}`}>Trạng thái</label>
                    <select id={`st-${r.id}`} className="input !min-h-[40px] !py-1 text-sm" value={r.status} onChange={(e) => setStatus(r.id, e.target.value)}>
                      {Object.entries(STATUSES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
