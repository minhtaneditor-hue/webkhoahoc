"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { formatVND } from '@/lib/supabase-public';
import { Wallet, Users, BookOpen, CreditCard, ArrowRight, Receipt } from 'lucide-react';
import { PageHeader, StatCard, LoadingRow, EmptyState, StatusBadge, thClass, tdClass } from '@/components/admin/AdminUI';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ revenue: 0, revenue30: 0, students: 0, enrollments: 0, courses: 0, pending: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const [paid, students, enrollments, courses, pending, recentPayments] = await Promise.all([
        supabase.from('payments').select('amount, created_at').eq('status', 'success'),
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('enrollments').select('user_id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('payments').select('id, order_id, amount, status, created_at, users ( email ), courses ( title )').order('created_at', { ascending: false }).limit(8),
      ]);
      const rows = paid.data || [];
      setStats({
        revenue: rows.reduce((s, r) => s + Number(r.amount), 0),
        revenue30: rows.filter((r) => r.created_at >= since).reduce((s, r) => s + Number(r.amount), 0),
        students: students.count || 0,
        enrollments: enrollments.count || 0,
        courses: courses.count || 0,
        pending: pending.count || 0,
      });
      setRecent(recentPayments.data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader title="Bảng điều khiển" description="Tình hình kinh doanh và học viên của học viện." />

      {loading ? <LoadingRow /> : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Doanh thu 30 ngày" value={formatVND(stats.revenue30)} icon={Wallet} hint={`Tổng cộng: ${formatVND(stats.revenue)}`} />
            <StatCard label="Tài khoản" value={stats.students} icon={Users} hint="Tổng số người đã đăng ký" />
            <StatCard label="Lượt ghi danh" value={stats.enrollments} icon={BookOpen} hint={`${stats.courses} khóa học trên hệ thống`} />
            <StatCard label="Đơn đang chờ" value={stats.pending} icon={CreditCard} hint="Chưa hoàn tất thanh toán" />
          </div>

          <section>
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-3xl">Đơn hàng gần đây</h2>
              <Link href="/admin/orders" className="text-sm font-semibold text-gold hover:underline underline-offset-4 flex items-center gap-1 min-h-[44px]">Xem tất cả <ArrowRight size={14} aria-hidden="true" /></Link>
            </div>
            {recent.length === 0 ? (
              <EmptyState icon={Receipt} title="Chưa có đơn hàng" text="Đơn hàng sẽ xuất hiện ở đây khi học viên thanh toán." />
            ) : (
              <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-line"><tr><th className={thClass}>Thời gian</th><th className={thClass}>Học viên</th><th className={thClass}>Sản phẩm</th><th className={`${thClass} text-right`}>Số tiền</th><th className={thClass}>Trạng thái</th></tr></thead>
                  <tbody className="divide-y divide-line">
                    {recent.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/60">
                        <td className={`${tdClass} whitespace-nowrap`}>{new Date(p.created_at).toLocaleString('vi-VN')}</td>
                        <td className={tdClass}>{p.users?.email || '—'}</td>
                        <td className={tdClass}>{p.courses?.title || 'Ebook / Preset'}</td>
                        <td className={`${tdClass} text-right font-semibold whitespace-nowrap`}>{formatVND(p.amount)}</td>
                        <td className={tdClass}><StatusBadge status={p.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {[
              { href: '/admin/courses', title: 'Thêm bài học mới', text: 'Cập nhật lộ trình và video cho khóa học.' },
              { href: '/admin/shop', title: 'Đăng ebook / preset', text: 'Thêm sản phẩm số vào cửa hàng.' },
              { href: '/admin/students', title: 'Ghi danh thủ công', text: 'Mở khóa học cho học viên chuyển khoản.' },
            ].map((a) => (
              <Link key={a.href} href={a.href} className="card card-hover p-5">
                <p className="font-semibold flex items-center justify-between">{a.title} <ArrowRight size={16} className="text-gold" aria-hidden="true" /></p>
                <p className="mt-1 text-sm text-muted-foreground">{a.text}</p>
              </Link>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
