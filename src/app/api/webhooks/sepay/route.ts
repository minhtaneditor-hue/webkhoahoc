import { NextResponse, after } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { findOrderCode, fulfillPayment } from '@/lib/payments';
import { fbTransferReceived, findFbOrderId } from '@/lib/fb/pay';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// SePay calls this for every incoming bank transfer (docs.sepay.vn/tich-hop-webhooks.html).
// Auth, whichever the webhook is set up with in SePay:
//   HMAC-SHA256: X-SePay-Signature = "sha256=" + hex(HMAC(SEPAY_WEBHOOK_SECRET, `${X-SePay-Timestamp}.${rawBody}`))
//   API Key:     Authorization = "Apikey <SEPAY_WEBHOOK_KEY>"
// SePay retries until it gets 200 + {"success": true}, so transfers we cannot act on are still acknowledged.
const ok = (note: string) => NextResponse.json({ success: true, note });

const same = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

function authorized(req: Request, rawBody: string) {
  const secret = process.env.SEPAY_WEBHOOK_SECRET;
  const signature = req.headers.get('x-sepay-signature');
  if (secret && signature) {
    const ts = req.headers.get('x-sepay-timestamp') || '';
    if (!(Math.abs(Date.now() / 1000 - Number(ts)) <= 300)) return false; // replay window, as in SePay's sample
    const expected = 'sha256=' + createHmac('sha256', secret).update(`${ts}.${rawBody}`).digest('hex');
    return same(signature, expected);
  }
  const key = process.env.SEPAY_WEBHOOK_KEY;
  return !!key && same(req.headers.get('authorization') || '', `Apikey ${key}`);
}

export async function POST(req: Request) {
  // The signature covers the exact bytes SePay sent, so read the body as text first.
  const rawBody = await req.text();
  if (!authorized(req, rawBody)) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ success: false, error: 'Server not configured' }, { status: 500 });

  let tx: any = null;
  try { tx = JSON.parse(rawBody); } catch {}
  if (!tx || tx.transferType !== 'in') return ok('ignored: not an incoming transfer');

  // Deposits and payments for orders closed by the Messenger bot (note TANVAFB<id>)
  const fbOrder = findFbOrderId(tx.code, tx.content, tx.description);
  if (fbOrder) {
    // Answer SePay at once; the AI summary for Minh Tấn runs after the response
    after(() => fbTransferReceived(supabase, fbOrder, Number(tx.transferAmount) || 0, String(tx.id)).catch((e) => console.error('fb transfer failed', e)));
    return ok('messenger order: received');
  }

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
