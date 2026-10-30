"use client";

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { formatVND } from '@/lib/supabase-public';
import { Receipt, Search, Download } from 'lucide-react';
import { PageHeader, LoadingRow, EmptyState, StatusBadge, thClass, tdClass } from '@/components/admin/AdminUI';

const TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'success', label: 'Thành công' },
  { key: 'pending', label: 'Đang chờ' },
  { key: 'failed', label: 'Thất bại' },
];

export default function OrdersManagement() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    supabase
      .from('payments')
      .select('id, order_id, amount, status, payment_method, transaction_id, created_at, users ( email ), courses ( title ), digital_assets ( title )')
      .order('created_at', { ascending: false })
      .limit(500)
      .then(({ data }) => { setOrders(data || []); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) =>
      (tab === 'all' || o.status === tab) &&
      (!q || [o.order_id, o.users?.email, o.courses?.title, o.digital_assets?.title].some((v) => v?.toLowerCase().includes(q))));
  }, [orders, tab, query]);

  const exportCsv = () => {
    const header = ['Mã đơn', 'Thời gian', 'Email', 'Sản phẩm', 'Số tiền', 'Trạng thái', 'Mã giao dịch'];
    const rows = filtered.map((o) => [o.order_id, new Date(o.created_at).toLocaleString('vi-VN'), o.users?.email || '', o.courses?.title || o.digital_assets?.title || '', o.amount, o.status, o.transaction_id || '']);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `don-hang-${new Date().toISOString().slice(0, 10)}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Đơn hàng"
        description="Mọi giao dịch qua VNPay. Đơn thành công tự động mở khóa học cho học viên."
        actions={<button onClick={exportCsv} disabled={filtered.length === 0} className="btn btn-outline"><Download size={16} aria-hidden="true" /> Xuất CSV</button>}
      />

      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="flex gap-2 overflow-x-auto no-scrollbar" role="tablist" aria-label="Lọc theo trạng thái">
          {TABS.map((t) => (
            <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
                    className={`shrink-0 min-h-[44px] px-4 rounded-md text-sm font-semibold border transition-colors ${tab === t.key ? 'bg-onyx text-white border-onyx' : 'bg-card border-line-strong text-stone hover:border-ink'}`}>
              {t.label} <span className="opacity-60">({t.key === 'all' ? orders.length : orders.filter((o) => o.status === t.key).length})</span>
            </button>
          ))}
        </div>
        <div className="relative md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="order-search" className="sr-only">Tìm đơn hàng</label>
          <input id="order-search" className="input pl-9" placeholder="Mã đơn, email, sản phẩm…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {loading ? <LoadingRow /> : filtered.length === 0 ? (
        <EmptyState icon={Receipt} title="Không có đơn hàng" text={orders.length ? 'Thử đổi bộ lọc hoặc từ khóa.' : 'Đơn hàng sẽ xuất hiện khi học viên thanh toán.'} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line"><tr><th className={thClass}>Mã đơn</th><th className={thClass}>Thời gian</th><th className={thClass}>Học viên</th><th className={thClass}>Sản phẩm</th><th className={`${thClass} text-right`}>Số tiền</th><th className={thClass}>Trạng thái</th></tr></thead>
            <tbody className="divide-y divide-line">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-muted/60">
                  <td className={`${tdClass} font-mono text-xs`}>{o.order_id}</td>
                  <td className={`${tdClass} whitespace-nowrap`}>{new Date(o.created_at).toLocaleString('vi-VN')}</td>
                  <td className={tdClass}>{o.users?.email || '—'}</td>
                  <td className={tdClass}>{o.courses?.title || o.digital_assets?.title || '—'}</td>
                  <td className={`${tdClass} text-right font-semibold whitespace-nowrap`}>{formatVND(o.amount)}</td>
                  <td className={tdClass}><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
