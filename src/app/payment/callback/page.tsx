import Link from 'next/link';
import { CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import { verifyVNPCallback } from '@/lib/vnpay-helper';

// VNPay's return URL. This page only DISPLAYS the result — the order is actually
// confirmed and the course unlocked by the IPN webhook (/api/webhooks/payment).
export default async function PaymentCallback({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const raw = await searchParams;
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'string' && key.startsWith('vnp_')) params[key] = value;
  }

  const isValid = Object.keys(params).length > 0 && verifyVNPCallback({ ...params });
  const isSuccess = isValid && params.vnp_ResponseCode === '00';
  const amount = Number(params.vnp_Amount || 0) / 100;

  const state = !isValid
    ? {
        icon: <ShieldAlert size={48} className="text-gold" aria-hidden="true" />,
        title: 'Không xác minh được giao dịch',
        text: 'Chữ ký giao dịch không hợp lệ. Nếu bạn đã bị trừ tiền, vui lòng liên hệ hỗ trợ kèm mã đơn hàng.',
      }
    : isSuccess
      ? {
          icon: <CheckCircle2 size={48} className="text-success" aria-hidden="true" />,
          title: 'Thanh toán thành công!',
          text: 'Khóa học sẽ được kích hoạt trong giây lát. Email xác nhận đã được gửi tới hộp thư của bạn.',
        }
      : {
          icon: <XCircle size={48} className="text-danger" aria-hidden="true" />,
          title: 'Thanh toán chưa hoàn tất',
          text: 'Giao dịch đã bị hủy hoặc thất bại. Bạn chưa bị trừ tiền — hãy thử lại.',
        };

  return (
    <main className="container-lux py-16 md:py-24 flex justify-center">
      <div className="card w-full max-w-lg p-8 md:p-10 text-center shadow-[var(--shadow-lift)]">
        <div className="flex justify-center">{state.icon}</div>
        <h1 className="mt-6 text-4xl">{state.title}</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">{state.text}</p>

        {isValid && (
          <dl className="mt-8 rounded-md bg-muted p-5 text-sm text-left space-y-2">
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Mã đơn hàng</dt><dd className="font-semibold">{params.vnp_TxnRef}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Số tiền</dt><dd className="font-semibold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}</dd></div>
            {params.vnp_BankCode && <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Ngân hàng</dt><dd className="font-semibold">{params.vnp_BankCode}</dd></div>}
          </dl>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard" className="btn btn-gold">Vào khu học tập</Link>
          <Link href="/courses" className="btn btn-outline">Xem khóa học</Link>
        </div>
      </div>
    </main>
  );
}
