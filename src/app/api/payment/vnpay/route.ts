import { NextResponse } from 'next/server';
import { createVNPPaymentUrl } from '@/lib/vnpay-helper';
import { supabase } from '@/utils/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { courseId, amount: baseAmount, courseTitle, userId, promoCode } = await req.json();

    if (!courseId || !baseAmount || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Apply Promo Code Logic
    let finalAmount = baseAmount;
    if (promoCode) {
      const code = promoCode.toUpperCase();
      if (code === 'TANLAB') finalAmount -= 500000;
      else if (code === 'GIAM10') finalAmount *= 0.9;
      else if (code === 'CHALLENGE') finalAmount -= 1000000;
      
      if (finalAmount < 0) finalAmount = 0;
    }

    const orderId = `${Date.now()}_${courseId.slice(0, 4)}`;
    
    // Create a pending payment record in Supabase
    const { error: dbError } = await supabase
      .from('payments')
      .insert({
        order_id: orderId,
        user_id: userId,
        course_id: courseId,
        amount: finalAmount,
        status: 'pending'
      });

    if (dbError) throw dbError;

    // Build VNPay URL
    const paymentUrl = createVNPPaymentUrl({
      orderId,
      amount: finalAmount,
      orderInfo: `Thanh toan khoa hoc: ${courseTitle}`,
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback`,
      ipAddr: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ url: paymentUrl });
  } catch (error: any) {
    console.error('VNPay Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
