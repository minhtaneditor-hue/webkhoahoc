import { NextResponse } from 'next/server';
import { createVNPPaymentUrl } from '@/lib/vnpay-helper';
import { getSessionUser, getSupabaseAdmin } from '@/lib/supabase-server';
import { calculateDiscount } from '@/lib/promo';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Config Error: SUPABASE_SERVICE_ROLE_KEY is missing.' }, { status: 500 });
    }

    // The buyer is whoever is logged in — never trust a userId sent by the browser.
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập trước khi thanh toán.' }, { status: 401 });
    }

    const { courseId, assetId, promoCode } = await req.json();
    if (!courseId && !assetId) {
      return NextResponse.json({ error: 'Missing courseId or assetId' }, { status: 400 });
    }

    // Price always comes from the database, never from the request body.
    const table = courseId ? 'courses' : 'digital_assets';
    const { data: product, error: productError } = await supabaseAdmin
      .from(table)
      .select('id, title, price')
      .eq('id', courseId || assetId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Sản phẩm không tồn tại.' }, { status: 404 });
    }

    const basePrice = Number(product.price) || 0;
    const finalAmount = Math.max(0, basePrice - calculateDiscount(promoCode, basePrice));
    if (finalAmount <= 0) {
      return NextResponse.json({ error: 'Sản phẩm miễn phí không cần thanh toán qua VNPay.' }, { status: 400 });
    }

    const orderId = `${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const { error: dbError } = await supabaseAdmin
      .from('payments')
      .insert({
        order_id: orderId,
        user_id: user.id,
        course_id: courseId || null,
        asset_id: assetId || null,
        amount: finalAmount,
        payment_method: 'vnpay',
        status: 'pending'
      });

    if (dbError) throw dbError;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
    const paymentUrl = createVNPPaymentUrl({
      orderId,
      amount: finalAmount,
      // VNPay requires ASCII order info without special characters
      orderInfo: `Thanh toan don hang ${orderId}`,
      returnUrl: `${baseUrl}/payment/callback`,
      ipAddr: (req.headers.get('x-forwarded-for') || '127.0.0.1').split(',')[0].trim(),
    });

    return NextResponse.json({ url: paymentUrl });
  } catch (error: any) {
    console.error('VNPay Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
