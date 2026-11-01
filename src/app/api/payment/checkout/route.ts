import { NextResponse } from 'next/server';
import { getSessionUser, getSupabaseAdmin } from '@/lib/supabase-server';
import { bankConfig, createPendingPayment, newBankOrderCode, readBuyer, CheckoutError } from '@/lib/payments';
import { startVnpay } from '@/lib/vnpay-checkout';

export const dynamic = 'force-dynamic';

// One checkout entry point for the course and shop pages. Bank transfer (SePay)
// is used when the receiving account is configured; otherwise VNPay.
export async function POST(req: Request) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: 'Máy chủ chưa cấu hình xong. Vui lòng thử lại sau.' }, { status: 500 });

    // The buyer is whoever is logged in — never trust a userId sent by the browser.
    const user = await getSessionUser();
    const body = await req.json();
    const input = { courseId: body.courseId, assetId: body.assetId, promoCode: body.promoCode } as any;

    // Ebooks, presets, skills can be bought as a guest (name / email / phone); courses need an account.
    if (!user) {
      if (!body.assetId) return NextResponse.json({ error: 'Vui lòng đăng nhập trước khi thanh toán.' }, { status: 401 });
      if (!bankConfig()) return NextResponse.json({ error: 'Thanh toán online đang tạm dừng. Vui lòng liên hệ Zalo để mua.' }, { status: 503 });
      input.buyer = readBuyer(body.buyer);
    } else if (body.buyer) {
      input.buyer = readBuyer(body.buyer);
    }

    if (bankConfig()) {
      const { orderId, accessToken } = await createPendingPayment(supabase, user?.id ?? null, input, 'bank_transfer', newBankOrderCode());
      return NextResponse.json({ url: `/payment/bank/${orderId}?t=${accessToken}` });
    }
    if (process.env.VNP_TMN_CODE && process.env.VNP_HASH_SECRET) {
      return NextResponse.json({ url: await startVnpay(req, user!.id, input) });
    }
    return NextResponse.json({ error: 'Thanh toán online đang tạm dừng. Vui lòng liên hệ Zalo để đăng ký.' }, { status: 503 });
  } catch (error: any) {
    if (error instanceof CheckoutError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('Checkout Error:', error);
    return NextResponse.json({ error: 'Không tạo được đơn thanh toán. Vui lòng thử lại.' }, { status: 500 });
  }
}
