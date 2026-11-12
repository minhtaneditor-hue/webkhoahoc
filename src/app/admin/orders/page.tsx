"use client";

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { formatVND } from '@/lib/supabase-public';
import { planOf } from '@/lib/membership';
import { Receipt, Search, Download, BellRing, Loader2 } from 'lucide-react';
import { PageHeader, LoadingRow, EmptyState, StatusBadge, thClass, tdClass } from '@/components/admin/AdminUI';

const productTitle = (o: any): string =>
  planOf(o.membership_plan)?.title || o.courses?.title || o.digital_assets?.title || '';

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
  const [reminded, setReminded] = useState<Record<string, string>>({}); // order id → last reminder time
  const [sending, setSending] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    supabase
      .from('payments')
      .select('*, users ( email ), courses ( title ), digital_assets ( title )')
      .order('created_at', { ascending: false })
      .limit(500)
      .then(({ data }) => { setOrders(data || []); setLoading(false); });
    // Payment reminders already sent: ref is "orderId:day"
    supabase.from('email_log').select('ref, sent_at').eq('kind', 'pay-reminder').order('sent_at', { ascending: true }).limit(1000)
      .then(({ data }) => {
        const last: Record<string, string> = {};
        for (const r of data || []) last[r.ref.split(':')[0]] = r.sent_at;
        setReminded(last);
      });
  }, []);

  const buyerEmail = (o: any): string => o.buyer_email || o.users?.email || '';

  const remind = async (o: any) => {
    if (!window.confirm(`Gửi email nhắc thanh toán đơn ${o.order_id} tới ${buyerEmail(o)}?`)) return;
    setSending(o.order_id);
    setNotice(null);
    const res = await fetch('/api/admin/orders/remind', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: o.order_id }) });
    const json = await res.json().catch(() => ({}));
    setSending(null);
    if (!res.ok) { setNotice({ ok: false, text: json.error || 'Chưa gửi được, thử lại sau.' }); return; }
    setNotice({ ok: true, text: `Đã gửi email nhắc thanh toán đơn ${o.order_id} tới ${json.to}.` });
    setReminded((r) => ({ ...r, [o.order_id]: new Date().toISOString() }));
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) =>
      (tab === 'all' || o.status === tab) &&
      (!q || [o.order_id, buyerEmail(o), productTitle(o)].some((v) => v?.toLowerCase().includes(q))));
  }, [orders, tab, query]);

  const exportCsv = () => {
    const header = ['Mã đơn', 'Thời gian', 'Email', 'Sản phẩm', 'Số tiền', 'Trạng thái', 'Mã giao dịch'];
    const rows = filtered.map((o) => [o.order_id, new Date(o.created_at).toLocaleString('vi-VN'), buyerEmail(o), productTitle(o), o.amount, o.status, o.transaction_id || '']);
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
        description="Mọi giao dịch chuyển khoản QR (SePay) và VNPay. Đơn thành công tự động mở khóa học cho học viên."
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

      {notice && <p role="status" className={`text-sm font-medium ${notice.ok ? 'text-success' : 'text-danger'}`}>{notice.text}</p>}

      {loading ? <LoadingRow /> : filtered.length === 0 ? (
        <EmptyState icon={Receipt} title="Không có đơn hàng" text={orders.length ? 'Thử đổi bộ lọc hoặc từ khóa.' : 'Đơn hàng sẽ xuất hiện khi học viên thanh toán.'} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line"><tr><th className={thClass}>Mã đơn</th><th className={thClass}>Thời gian</th><th className={thClass}>Học viên</th><th className={thClass}>Sản phẩm</th><th className={`${thClass} text-right`}>Số tiền</th><th className={thClass}>Trạng thái</th><th className={thClass}>Nhắc thanh toán</th></tr></thead>
            <tbody className="divide-y divide-line">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-muted/60">
                  <td className={`${tdClass} font-mono text-xs`}>{o.order_id}</td>
                  <td className={`${tdClass} whitespace-nowrap`}>{new Date(o.created_at).toLocaleString('vi-VN')}</td>
                  <td className={tdClass}>{buyerEmail(o) || '—'}</td>
                  <td className={tdClass}>{productTitle(o) || '—'}</td>
                  <td className={`${tdClass} text-right font-semibold whitespace-nowrap`}>{formatVND(o.amount)}</td>
                  <td className={tdClass}><StatusBadge status={o.status} /></td>
                  <td className={`${tdClass} whitespace-nowrap`}>
                    {o.status !== 'pending' ? <span className="text-muted-foreground">—</span>
                      : o.payment_method !== 'bank_transfer' || !buyerEmail(o) ? <span className="text-xs text-muted-foreground">Không nhắc được</span>
                      : (
                        <div className="flex flex-col items-start gap-1">
                          <button type="button" onClick={() => remind(o)} disabled={!!sending} className="btn btn-outline min-h-11 px-3 text-sm" aria-label={`Gửi email nhắc thanh toán đơn ${o.order_id}`}>
                            {sending === o.order_id ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <BellRing size={16} aria-hidden="true" />}
                            {reminded[o.order_id] ? 'Nhắc lại' : 'Gửi nhắc'}
                          </button>
                          {reminded[o.order_id] && <span className="text-xs text-muted-foreground">Đã nhắc {new Date(reminded[o.order_id]).toLocaleString('vi-VN')}</span>}
                        </div>
                      )}
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
