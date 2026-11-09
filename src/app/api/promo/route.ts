import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { checkPromo } from '@/lib/promo';
import { assetPricing } from '@/lib/shop';

export const dynamic = 'force-dynamic';

/**
 * POST /api/promo  { code, courseId } or { code, assetId }
 * Price preview for the "Áp dụng" button. The order itself re-checks the code (createPendingPayment).
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, error: 'Máy chủ chưa sẵn sàng.' }, { status: 500 });
  const table = body.courseId ? 'courses' : 'digital_assets';
  const id = body.courseId || body.assetId;
  if (!id) return NextResponse.json({ ok: false, error: 'Thiếu sản phẩm.' }, { status: 400 });
  const { data: product } = await db.from(table).select(body.courseId ? 'price' : '*').eq('id', id).maybeSingle();
  if (!product) return NextResponse.json({ ok: false, error: 'Sản phẩm không tồn tại.' }, { status: 404 });
  const result = await checkPromo(db, body.code, { courseId: body.courseId, price: body.courseId ? Number((product as any).price) || 0 : assetPricing(product as any).price });
  return NextResponse.json(result);
}
