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
        icon: <ShieldAlert size={56} className="text-yellow-500" />,
        title: 'Không xác minh được giao dịch',
        text: 'Chữ ký giao dịch không hợp lệ. Nếu bạn đã bị trừ tiền, vui lòng liên hệ hỗ trợ kèm mã đơn hàng.',
      }
    : isSuccess
      ? {
          icon: <CheckCircle2 size={56} className="text-green-500" />,
          title: 'Thanh toán thành công!',
          text: 'Khóa học sẽ được kích hoạt trong giây lát. Email xác nhận đã được gửi tới hộp thư của bạn.',
        }
      : {
          icon: <XCircle size={56} className="text-primary" />,
          title: 'Thanh toán chưa hoàn tất',
          text: 'Giao dịch đã bị hủy hoặc thất bại. Bạn chưa bị trừ tiền — hãy thử lại.',
        };

  return (
    <main className="min-h-screen bg-[#050507] text-white flex items-center justify-center px-6 pt-32 pb-24">
      <div className="w-full max-w-lg p-10 rounded-[3rem] bg-white/[0.03] border border-white/10 text-center">
        <div className="flex justify-center mb-8">{state.icon}</div>
        {/* inline style: globals.css sizes h1 for hero banners, too large for this card */}
        <h1 style={{ fontSize: '1.875rem', lineHeight: 1.2, marginBottom: '1rem' }}>{state.title}</h1>
        <p className="text-text-muted leading-relaxed mb-8">{state.text}</p>

        {isValid && (
          <div className="mb-10 p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-sm text-left space-y-2">
            <p><span className="text-text-muted">Mã đơn hàng:</span> <strong>{params.vnp_TxnRef}</strong></p>
            <p><span className="text-text-muted">Số tiền:</span> <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}</strong></p>
            {params.vnp_BankCode && <p><span className="text-text-muted">Ngân hàng:</span> <strong>{params.vnp_BankCode}</strong></p>}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard" className="btn-premium px-8 py-4 rounded-full font-black text-xs tracking-widest">
            VÀO KHU HỌC TẬP
          </Link>
          <Link href="/courses" className="px-8 py-4 rounded-full border border-white/10 font-black text-xs tracking-widest hover:bg-white/5">
            XEM KHÓA HỌC
          </Link>
        </div>
      </div>
    </main>
  );
}
