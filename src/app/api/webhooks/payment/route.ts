import { NextResponse } from 'next/server';
import { verifyVNPCallback } from '@/lib/vnpay-helper';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { fulfillPayment } from '@/lib/payments';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ RspCode: '99', Message: 'Server not configured' });
    }

    const { searchParams } = new URL(req.url);
    const vnp_Params = Object.fromEntries(searchParams.entries());

    // 1. Verify Hash
    const isValid = verifyVNPCallback({ ...vnp_Params });
    if (!isValid) {
      return NextResponse.json({ RspCode: '97', Message: 'Invalid Checksum' });
    }

    const orderId = vnp_Params['vnp_TxnRef'];
    const responseCode = vnp_Params['vnp_ResponseCode'];
    const amount = Number(vnp_Params['vnp_Amount']) / 100;
    const transactionId = vnp_Params['vnp_TransactionNo'];

    // 2. Find the payment record
    const { data: payment, error: pError } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (pError || !payment) {
      return NextResponse.json({ RspCode: '01', Message: 'Order not found' });
    }

    if (Number(payment.amount) !== amount) {
      return NextResponse.json({ RspCode: '04', Message: 'Invalid amount' });
    }

    if (payment.status !== 'pending') {
      return NextResponse.json({ RspCode: '02', Message: 'Order already confirmed' });
    }

    const isSuccess = responseCode === '00' && vnp_Params['vnp_TransactionStatus'] === '00';

    if (isSuccess) {
      // 3. Update Payment Status
      await supabase
        .from('payments')
        .update({ status: 'success', transaction_id: transactionId })
        .eq('id', payment.id);

      // 4. Enrol and email the buyer
      await fulfillPayment(supabase, payment);

      return NextResponse.json({ RspCode: '00', Message: 'Confirm Success' });
    } else {
      await supabase
        .from('payments')
        .update({ status: 'failed', transaction_id: transactionId })
        .eq('id', payment.id);
      return NextResponse.json({ RspCode: '00', Message: 'Payment Failed or Canceled' });
    }
  } catch (error: any) {
    console.error('IPN Error:', error);
    return NextResponse.json({ RspCode: '99', Message: 'Internal Error' });
  }
}
