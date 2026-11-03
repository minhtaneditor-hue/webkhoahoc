"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Star, Eye, EyeOff, Trash2 } from 'lucide-react';
import { PageHeader, LoadingRow, EmptyState, thClass, tdClass } from '@/components/admin/AdminUI';

// Course ratings and comments (migration 019). Hidden reviews disappear from the course page.
export default function ReviewsPage() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [error, setError] = useState('');

  const load = () => supabase.from('course_reviews').select('*, courses ( title )').order('created_at', { ascending: false })
    .then(({ data, error: e }) => {
      if (e) setError(`Chưa đọc được đánh giá: ${e.message}. Hãy chạy file SQL 019_course_reviews.sql.`);
      setRows(data || []);
    });
  useEffect(() => { load(); }, []);

  const toggle = async (r: any) => {
    setRows((list) => list?.map((x) => (x.id === r.id ? { ...x, is_hidden: !x.is_hidden } : x)) || null);
    await supabase.from('course_reviews').update({ is_hidden: !r.is_hidden }).eq('id', r.id);
  };
  const remove = async (r: any) => {
    if (!confirm(`Xoá đánh giá của ${r.author_name}? Học viên có thể viết lại.`)) return;
    await supabase.from('course_reviews').delete().eq('id', r.id);
    load();
  };

  const visible = (rows || []).filter((r) => !r.is_hidden);
  const avg = visible.length ? (visible.reduce((n, r) => n + r.rating, 0) / visible.length).toFixed(1) : '—';

  return (
    <div className="space-y-6">
      <PageHeader title="Đánh giá khóa học" description={`Học viên đã đăng ký chấm sao và bình luận dưới trang khóa học. Đang hiện ${visible.length} đánh giá, trung bình ${avg} sao.`} />
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      {!rows ? <LoadingRow /> : rows.length === 0 ? (
        <EmptyState icon={Star} title="Chưa có đánh giá" text="Phần đánh giá nằm dưới lộ trình của mỗi trang khóa học. Chỉ học viên đã đăng ký mới viết được." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead><tr><th className={thClass}>Ngày</th><th className={thClass}>Học viên</th><th className={thClass}>Khóa</th><th className={thClass}>Sao</th><th className={thClass}>Bình luận</th><th className={thClass}><span className="sr-only">Thao tác</span></th></tr></thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id} className={r.is_hidden ? 'opacity-50' : ''}>
                  <td className={`${tdClass} whitespace-nowrap text-sm`}>{new Date(r.created_at).toLocaleDateString('vi-VN')}</td>
                  <td className={`${tdClass} font-semibold text-ink`}>{r.author_name}</td>
                  <td className={`${tdClass} text-sm`}>{r.courses?.title || '—'}</td>
                  <td className={`${tdClass} whitespace-nowrap font-semibold`}>{r.rating} <Star size={14} className="inline -mt-0.5 fill-gold text-gold" aria-hidden="true" /></td>
                  <td className={`${tdClass} text-sm max-w-md whitespace-pre-line`}>{r.comment || '—'}</td>
                  <td className={`${tdClass} whitespace-nowrap text-right`}>
                    <button onClick={() => toggle(r)} className="w-11 h-11 inline-flex items-center justify-center rounded-md hover:bg-muted" aria-label={r.is_hidden ? `Hiện đánh giá của ${r.author_name}` : `Ẩn đánh giá của ${r.author_name}`} title={r.is_hidden ? 'Đang ẩn, bấm để hiện' : 'Đang hiện, bấm để ẩn'}>
                      {r.is_hidden ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                    </button>
                    <button onClick={() => remove(r)} className="w-11 h-11 inline-flex items-center justify-center rounded-md hover:bg-muted text-danger" aria-label={`Xoá đánh giá của ${r.author_name}`}><Trash2 size={16} aria-hidden="true" /></button>
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
