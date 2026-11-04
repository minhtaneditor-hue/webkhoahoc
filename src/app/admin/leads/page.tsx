"use client";

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Download, Inbox } from 'lucide-react';
import { PageHeader, LoadingRow, EmptyState, thClass, tdClass } from '@/components/admin/AdminUI';

// People who left their email for the free checklist (migration 015, /api/leads)
const SOURCES: Record<string, string> = { 'free-product': 'Tải sản phẩm miễn phí', home: 'Trang chủ', courses: 'Trang khóa học' };

export default function LeadsPage() {
  const [rows, setRows] = useState<any[] | null>(null);
  // Which products each email took (migration 026); one lead can take several
  const [taken, setTaken] = useState<Record<string, string[]>>({});
  const [product, setProduct] = useState('');

  useEffect(() => {
    supabase.from('leads').select('*').order('created_at', { ascending: false }).then(({ data }) => setRows(data || []));
    supabase.from('asset_downloads').select('email, digital_assets ( title )').limit(50000).then(({ data }) => {
      const next: Record<string, string[]> = {};
      for (const d of (data || []) as any[]) {
        const title = d.digital_assets?.title;
        if (!d.email || !title) continue;
        const list = (next[d.email] ??= []);
        if (!list.includes(title)) list.push(title);
      }
      setTaken(next);
    });
  }, []);

  const products = useMemo(() => [...new Set(Object.values(taken).flat())].sort(), [taken]);
  const shown = useMemo(() => (rows || []).filter((r) => !product || taken[r.email]?.includes(product)), [rows, taken, product]);

  const exportCsv = () => {
    const lines = [['Tên', 'Email', 'Zalo', 'Nguồn', 'Đã tải', 'Ngày'], ...shown.map((r) => [r.name || '', r.email, r.phone || '', SOURCES[r.source] || r.source || '', (taken[r.email] || []).join(' | '), new Date(r.created_at).toLocaleString('vi-VN')])];
    const csv = '﻿' + lines.map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'khach-tiem-nang.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Khách tiềm năng"
        description="Người để lại thông tin để nhận Checklist quay video hoặc tải sản phẩm miễn phí. Nhắn Zalo hoặc gửi ưu đãi để chuyển họ thành học viên."
        actions={rows?.length ? <button onClick={exportCsv} className="btn btn-outline"><Download size={16} aria-hidden="true" /> Tải CSV</button> : undefined}
      />
      {products.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="lead-product" className="text-sm font-semibold">Đã tải</label>
          <select id="lead-product" className="input !w-auto max-w-full" value={product} onChange={(e) => setProduct(e.target.value)}>
            <option value="">Tất cả khách</option>
            {products.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          {product && <span className="text-sm text-muted-foreground">{shown.length} người</span>}
        </div>
      )}
      {!rows ? <LoadingRow /> : rows.length === 0 ? (
        <EmptyState icon={Inbox} title="Chưa có ai đăng ký" text="Form nhận checklist nằm ở trang chủ và trang Khóa học." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead><tr><th className={thClass}>Tên</th><th className={thClass}>Email</th><th className={thClass}>Zalo</th><th className={thClass}>Nguồn</th><th className={thClass}>Đã tải</th><th className={thClass}>Ngày</th></tr></thead>
            <tbody className="divide-y divide-line">
              {shown.map((r) => (
                <tr key={r.id}>
                  <td className={tdClass}>{r.name || '—'}</td>
                  <td className={tdClass}><a href={`mailto:${r.email}`} className="underline underline-offset-4">{r.email}</a></td>
                  <td className={tdClass}>{r.phone ? <a href={`https://zalo.me/${r.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{r.phone}</a> : '—'}</td>
                  <td className={tdClass}>{SOURCES[r.source] || r.source || '—'}</td>
                  <td className={tdClass}>{taken[r.email]?.length ? <ul className="space-y-1 min-w-[12rem]">{taken[r.email].map((t) => <li key={t}>{t}</li>)}</ul> : '—'}</td>
                  <td className={`${tdClass} whitespace-nowrap`}>{new Date(r.created_at).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
