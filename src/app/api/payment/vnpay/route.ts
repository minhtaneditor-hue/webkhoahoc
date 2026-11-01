import { NextResponse } from 'next/server';
import { getSessionUser, getSupabaseAdmin } from '@/lib/supabase-server';
import { CheckoutError } from '@/lib/payments';
import { startVnpay } from '@/lib/vnpay-checkout';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    if (!getSupabaseAdmin()) {
      return NextResponse.json({ error: 'Config Error: SUPABASE_SERVICE_ROLE_KEY is missing.' }, { status: 500 });
    }
    // The buyer is whoever is logged in — never trust a userId sent by the browser.
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập trước khi thanh toán.' }, { status: 401 });
    }
    return NextResponse.json({ url: await startVnpay(req, user.id, await req.json()) });
  } catch (error: any) {
    if (error instanceof CheckoutError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('VNPay Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
