import { NextResponse } from 'next/server';
import { getSessionUser, getSupabaseAdmin } from '@/lib/supabase-server';
import { bankConfig, vietQrUrl } from '@/lib/payments';

export const dynamic = 'force-dynamic';

// Transfer details + live status for one of the buyer's own bank-transfer orders.
// The payment page polls this until the SePay webhook marks the order paid.
export async function GET(req: Request) {
  const supabase = getSupabaseAdmin();
  const cfg = bankConfig();
  if (!supabase || !cfg) return NextResponse.json({ error: 'Chưa cấu hình chuyển khoản.' }, { status: 503 });

  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 });

  const orderId = new URL(req.url).searchParams.get('orderId') || '';
  const { data: p } = await supabase
    .from('payments')
    .select('order_id, amount, status, course_id, user_id, courses ( title ), digital_assets ( title )')
    .eq('order_id', orderId)
    .eq('payment_method', 'bank_transfer')
    .single();
  if (!p || p.user_id !== user.id) return NextResponse.json({ error: 'Không tìm thấy đơn hàng.' }, { status: 404 });

  const product: any = p.courses || p.digital_assets;
  const amount = Number(p.amount);
  return NextResponse.json({
    orderId: p.order_id,
    status: p.status,
    amount,
    title: product?.title || '',
    courseId: p.course_id,
    bank: cfg.bank,
    account: cfg.account,
    accountName: cfg.accountName,
    content: p.order_id,
    qrUrl: vietQrUrl(cfg, amount, p.order_id),
  });
}
