import { NextResponse } from 'next/server';
import { getSessionUser, getSupabaseAdmin } from '@/lib/supabase-server';
import { bankConfig, vietQrUrl } from '@/lib/payments';
import { planOf } from '@/lib/membership';

export const dynamic = 'force-dynamic';

// Transfer details + live status for one bank-transfer order (buyer's account or order link).
// The payment page polls this until the SePay webhook marks the order paid.
export async function GET(req: Request) {
  const supabase = getSupabaseAdmin();
  const cfg = bankConfig();
  if (!supabase || !cfg) return NextResponse.json({ error: 'Chưa cấu hình chuyển khoản.' }, { status: 503 });

  const params = new URL(req.url).searchParams;
  const orderId = params.get('orderId') || '';
  const token = params.get('t') || '';
  const { data: p } = await supabase
    .from('payments')
    .select('*, courses ( title ), digital_assets ( title )')
    .eq('order_id', orderId)
    .eq('payment_method', 'bank_transfer')
    .single();
  // Open to the buyer's account, or to anyone holding the order link (guest checkout).
  const tokenOk = !!token && !!p?.access_token && token === p.access_token;
  const user = tokenOk ? null : await getSessionUser();
  if (!p || (!tokenOk && (!user || p.user_id !== user.id))) return NextResponse.json({ error: 'Không tìm thấy đơn hàng.' }, { status: 404 });

  // '*' rather than a column list, so this still works before migration 026 adds membership_plan.
  const plan = planOf(p.membership_plan);
  const product: any = plan || p.courses || p.digital_assets;
  const amount = Number(p.amount);
  return NextResponse.json({
    orderId: p.order_id,
    status: p.status,
    amount,
    title: product?.title || '',
    courseId: p.course_id,
    assetId: p.asset_id,
    membership: !!plan,
    bank: cfg.bank,
    account: cfg.account,
    accountName: cfg.accountName,
    content: p.order_id,
    qrUrl: vietQrUrl(cfg, amount, p.order_id),
  });
}
