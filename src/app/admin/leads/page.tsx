"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Download, Inbox } from 'lucide-react';
import { PageHeader, LoadingRow, EmptyState, thClass, tdClass } from '@/components/admin/AdminUI';

// People who left their email for the free checklist (migration 015, /api/leads)
const SOURCES: Record<string, string> = { home: 'Trang chủ', courses: 'Trang khóa học' };

export default function LeadsPage() {
  const [rows, setRows] = useState<any[] | null>(null);

  useEffect(() => {
    supabase.from('leads').select('*').order('created_at', { ascending: false }).then(({ data }) => setRows(data || []));
  }, []);

  const exportCsv = () => {
    const lines = [['Tên', 'Email', 'Zalo', 'Nguồn', 'Ngày'], ...(rows || []).map((r) => [r.name || '', r.email, r.phone || '', SOURCES[r.source] || r.source || '', new Date(r.created_at).toLocaleString('vi-VN')])];
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
        description="Người để lại email nhận Checklist quay video. Nhắn Zalo hoặc gửi ưu đãi để chuyển họ thành học viên."
        actions={rows?.length ? <button onClick={exportCsv} className="btn btn-outline"><Download size={16} aria-hidden="true" /> Tải CSV</button> : undefined}
      />
      {!rows ? <LoadingRow /> : rows.length === 0 ? (
        <EmptyState icon={Inbox} title="Chưa có ai đăng ký" text="Form nhận checklist nằm ở trang chủ và trang Khóa học." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead><tr><th className={thClass}>Tên</th><th className={thClass}>Email</th><th className={thClass}>Zalo</th><th className={thClass}>Nguồn</th><th className={thClass}>Ngày</th></tr></thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className={tdClass}>{r.name || '—'}</td>
                  <td className={tdClass}><a href={`mailto:${r.email}`} className="underline underline-offset-4">{r.email}</a></td>
                  <td className={tdClass}>{r.phone ? <a href={`https://zalo.me/${r.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{r.phone}</a> : '—'}</td>
                  <td className={tdClass}>{SOURCES[r.source] || r.source || '—'}</td>
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
