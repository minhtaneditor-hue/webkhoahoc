import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { isAdmin } from '@/lib/admin';
import { getSessionUser, getSupabaseAdmin } from '@/lib/supabase-server';
import { planOf } from '@/lib/membership';
import { FROM, SITE, paymentReminder } from '@/lib/emails';

export const dynamic = 'force-dynamic';

/** Vietnam calendar day, so "once a day" matches the admin's day. */
const vnDay = () => new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);

/**
 * POST /api/admin/orders/remind  { orderId }
 * Admin > Đơn hàng: emails the buyer of a pending bank-transfer order the link to its payment page.
 * At most once per order per day (email_log kind 'pay-reminder', ref orderId:day), so a double click is harmless.
 */
export async function POST(req: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Thiếu SUPABASE_SERVICE_ROLE_KEY.' }, { status: 500 });
  const admin = await getSessionUser();
  if (!admin?.email || !isAdmin(admin.email)) return NextResponse.json({ error: 'Chỉ admin mới gửi được.' }, { status: 403 });
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: 'Thiếu RESEND_API_KEY.' }, { status: 500 });

  const { orderId } = await req.json().catch(() => ({}));
  if (typeof orderId !== 'string' || !orderId || orderId.length > 40) return NextResponse.json({ error: 'Thiếu mã đơn.' }, { status: 400 });

  const { data: order } = await db.from('payments')
    .select('*, users ( email, full_name ), courses ( title ), digital_assets ( title )')
    .eq('order_id', orderId).maybeSingle();
  if (!order) return NextResponse.json({ error: 'Không tìm thấy đơn hàng.' }, { status: 404 });
  if (order.status !== 'pending') return NextResponse.json({ error: 'Đơn này không còn chờ thanh toán.' }, { status: 400 });
  if (order.payment_method !== 'bank_transfer' || !order.access_token) {
    return NextResponse.json({ error: 'Chỉ nhắc được đơn chuyển khoản QR có link thanh toán.' }, { status: 400 });
  }
  const email = (order.buyer_email || order.users?.email || '').trim().toLowerCase();
  if (!email) return NextResponse.json({ error: 'Đơn này không có email người mua.' }, { status: 400 });

  const ref = `${order.order_id}:${vnDay()}`;
  const { error: claim } = await db.from('email_log').insert({ email, kind: 'pay-reminder', ref });
  if (claim) {
    const text = claim.code === '23505' ? 'Hôm nay đã nhắc đơn này rồi, mai hãy nhắc lại.' : claim.message;
    return NextResponse.json({ error: text }, { status: 400 });
  }

  const title = planOf(order.membership_plan)?.title || order.courses?.title || order.digital_assets?.title || 'đơn hàng của bạn';
  const mail = paymentReminder({
    name: order.buyer_name || order.users?.full_name,
    title,
    amount: Number(order.amount),
    orderId: order.order_id,
    link: `${SITE}/payment/bank/${order.order_id}?t=${order.access_token}`,
  });
  const { data, error } = await new Resend(process.env.RESEND_API_KEY).emails.send({ from: FROM, to: email, ...mail });
  if (error) {
    await db.from('email_log').delete().match({ email, kind: 'pay-reminder', ref });
    return NextResponse.json({ error: `Resend báo lỗi: ${error.message}` }, { status: 502 });
  }
  return NextResponse.json({ ok: true, to: email, id: data?.id });
}
