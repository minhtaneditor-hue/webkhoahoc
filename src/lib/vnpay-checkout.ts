import { createVNPPaymentUrl } from './vnpay-helper';
import { getSupabaseAdmin } from './supabase-server';
import { createPendingPayment, type CheckoutInput } from './payments';

/** Creates a pending order and returns the VNPay payment page URL. */
export async function startVnpay(req: Request, userId: string, input: CheckoutInput) {
  const orderId = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const { amount } = await createPendingPayment(getSupabaseAdmin()!, userId, input, 'vnpay', orderId);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
  return createVNPPaymentUrl({
    orderId,
    amount,
    // VNPay requires ASCII order info without special characters
    orderInfo: `Thanh toan don hang ${orderId}`,
    returnUrl: `${baseUrl}/payment/callback`,
    ipAddr: (req.headers.get('x-forwarded-for') || '127.0.0.1').split(',')[0].trim(),
  });
}
