import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { findOrderCode, fulfillPayment } from '@/lib/payments';

export const dynamic = 'force-dynamic';

// SePay calls this for every incoming bank transfer (docs.sepay.vn/tich-hop-webhooks.html).
// Auth: header "Authorization: Apikey <SEPAY_WEBHOOK_KEY>". SePay retries until it gets
// 200 + {"success": true}, so transfers we cannot act on are still acknowledged.
const ok = (note: string) => NextResponse.json({ success: true, note });

function authorized(req: Request) {
  const key = process.env.SEPAY_WEBHOOK_KEY;
  if (!key) return false;
  const got = Buffer.from(req.headers.get('authorization') || '');
  const want = Buffer.from(`Apikey ${key}`);
  return got.length === want.length && timingSafeEqual(got, want);
}

export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ success: false, error: 'Server not configured' }, { status: 500 });

  const tx = await req.json().catch(() => null);
  if (!tx || tx.transferType !== 'in') return ok('ignored: not an incoming transfer');

  const orderId = findOrderCode(tx.code, tx.content, tx.description);
  if (!orderId) return ok('ignored: no order code');

  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('order_id', orderId)
    .eq('payment_method', 'bank_transfer')
    .single();
  if (!payment) return ok('ignored: unknown order');
  if (payment.status !== 'pending') return ok('already processed');

  if (Number(tx.transferAmount) < Number(payment.amount)) {
    console.warn(`SePay: order ${orderId} underpaid (${tx.transferAmount} < ${payment.amount}), tx ${tx.id}`);
    return ok('underpaid: left pending');
  }

  // Only the request that flips pending -> success fulfils the order, so retries
  // and duplicate webhooks never enrol or email twice.
  const { data: updated } = await supabase
    .from('payments')
    .update({ status: 'success', transaction_id: `sepay:${tx.id}` })
    .eq('id', payment.id)
    .eq('status', 'pending')
    .select('id');
  if (!updated?.length) return ok('already processed');

  await fulfillPayment(supabase, payment);
  return ok('paid');
}
