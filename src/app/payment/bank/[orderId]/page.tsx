'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { CheckCircle2, Copy, Check, Loader2, ShieldCheck, Download } from 'lucide-react';
import { formatVND } from '@/lib/supabase-public';

type Order = {
  orderId: string;
  status: 'pending' | 'success' | 'failed';
  amount: number;
  title: string;
  courseId: string | null;
  assetId: string | null;
  bank: string;
  account: string;
  accountName: string;
  content: string;
  qrUrl: string;
};

// Bank transfer checkout (SePay VietQR). Shows the QR and transfer details, then
// polls until the SePay webhook marks the order paid.
export default function BankTransferPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const token = useSearchParams().get('t') || '';
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const load = useCallback(async () => {
    const res = await fetch(`/api/payment/bank?orderId=${encodeURIComponent(orderId)}&t=${encodeURIComponent(token)}`, { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) return setError(data.error || 'Không tải được đơn hàng.');
    setOrder(data);
  }, [orderId, token]);

  useEffect(() => { load(); }, [load]);

  // Check every 4 seconds while waiting for the money to arrive.
  useEffect(() => {
    if (order?.status !== 'pending') return;
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [order?.status, load]);

  // Meta Pixel: checkout opened, then purchase once the webhook confirms (once per order per browser)
  useEffect(() => {
    if (!order) return;
    const key = `fbq-${orderId}-${order.status}`;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, '1'); } catch { /* storage blocked */ }
    // These ids match the server's Conversions API events (lib/payments.ts), so Meta counts each once.
    if (order.status === 'pending') window.fbq?.('track', 'InitiateCheckout', { value: order.amount, currency: 'VND' }, { eventID: `checkout_${orderId}` });
    if (order.status === 'success') window.fbq?.('track', 'Purchase', { value: order.amount, currency: 'VND' }, { eventID: `purchase_${orderId}` });
  }, [order, orderId]);

  const [downloading, setDownloading] = useState(false);
  async function download() {
    setDownloading(true);
    const res = await fetch(`/api/shop/download?order=${encodeURIComponent(orderId)}&t=${encodeURIComponent(token)}`);
    const data = await res.json();
    setDownloading(false);
    if (data.url) window.location.assign(data.url);
    else setError(data.error || 'Không lấy được link tải.');
  }

  function copy(label: string, value: string) {
    navigator.clipboard?.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(''), 1500);
  }

  if (error) {
    return (
      <main className="container-lux py-24 text-center">
        <h1 className="text-4xl">Không mở được đơn hàng</h1>
        <p className="mt-3 text-muted-foreground">{error}</p>
        <Link href="/courses" className="btn btn-dark mt-8">Xem khóa học</Link>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="container-lux py-24 flex items-center justify-center gap-3 text-muted-foreground" aria-busy="true">
        <Loader2 className="animate-spin" size={20} aria-hidden="true" /> Đang tạo mã thanh toán…
      </main>
    );
  }

  if (order.status === 'success') {
    return (
      <main className="container-lux py-16 md:py-24 flex justify-center">
        <div className="card w-full max-w-lg p-8 md:p-10 text-center shadow-[var(--shadow-lift)]">
          <div className="flex justify-center"><CheckCircle2 size={48} className="text-success" aria-hidden="true" /></div>
          <h1 className="mt-6 text-4xl">Thanh toán thành công!</h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Đã nhận {formatVND(order.amount)} cho “{order.title}”. Email xác nhận đã được gửi tới hộp thư của bạn.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            {order.courseId ? (
              <>
                <Link href={`/courses/${order.courseId}`} className="btn btn-gold">Vào học ngay</Link>
                <Link href="/dashboard" className="btn btn-outline">Khu học tập</Link>
              </>
            ) : (
              <>
                <button type="button" onClick={download} disabled={downloading} className="btn btn-gold">
                  {downloading ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Download size={18} aria-hidden="true" />} Tải về
                </button>
                <Link href="/shop" className="btn btn-outline">Xem thêm tài nguyên</Link>
              </>
            )}
          </div>
        </div>
      </main>
    );
  }

  const rows = [
    { label: 'Ngân hàng', value: order.bank },
    { label: 'Số tài khoản', value: order.account, copy: true },
    ...(order.accountName ? [{ label: 'Chủ tài khoản', value: order.accountName }] : []),
    { label: 'Số tiền', value: formatVND(order.amount), raw: String(order.amount), copy: true },
    { label: 'Nội dung chuyển khoản', value: order.content, copy: true, strong: true },
  ];

  return (
    <main className="container-lux py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-[clamp(1.75rem,4vw,3rem)] leading-tight">Quét mã để thanh toán</h1>
        <p className="mt-3 text-lg text-muted-foreground">{order.title}</p>

        <div className="mt-8 grid gap-6 md:grid-cols-[minmax(0,320px)_1fr] md:items-start">
          <div className="card p-5 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={order.qrUrl} alt={`Mã QR chuyển ${formatVND(order.amount)} tới ${order.bank}`} width={320} height={320} className="mx-auto w-full max-w-[280px] h-auto bg-white" />
            <p className="mt-4 text-sm text-muted-foreground">Mở app ngân hàng bất kỳ, chọn quét mã QR.</p>
          </div>

          <div className="card p-6 md:p-7">
            <dl className="space-y-4">
              {rows.map((r) => (
                <div key={r.label} className="flex items-center justify-between gap-4">
                  <dt className="text-sm text-muted-foreground">{r.label}</dt>
                  <dd className="flex items-center gap-2 min-w-0">
                    <span className={`font-semibold break-all text-right ${r.strong ? 'text-gold text-lg' : ''}`}>{r.value}</span>
                    {r.copy && (
                      <button type="button" onClick={() => copy(r.label, r.raw ?? r.value)} className="w-9 h-9 shrink-0 rounded-md flex items-center justify-center hover:bg-muted" aria-label={`Sao chép ${r.label.toLowerCase()}`}>
                        {copied === r.label ? <Check size={16} className="text-success" aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                      </button>
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 p-4 rounded-md bg-gold-soft text-sm leading-relaxed">
              Nếu chuyển khoản tay, hãy ghi <strong>đúng nội dung {order.content}</strong> và đúng số tiền để hệ thống tự kích hoạt.
            </p>

            <p className="mt-6 flex items-center gap-3 text-sm text-muted-foreground" role="status" aria-live="polite">
              <Loader2 className="animate-spin text-gold" size={18} aria-hidden="true" />
              Đang chờ tiền về. Trang sẽ tự chuyển khi thanh toán thành công, thường trong vòng 1 phút.
            </p>
            <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck size={14} aria-hidden="true" /> Tiền chuyển thẳng vào tài khoản ngân hàng của TẤN VA.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
