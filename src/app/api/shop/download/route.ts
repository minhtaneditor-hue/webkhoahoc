import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { getSessionUser, getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// Returns the download link of a digital asset (ebook, preset, LUT...) only to buyers.
export async function GET(req: Request) {
  const assetId = new URL(req.url).searchParams.get('assetId');
  if (!assetId) {
    return NextResponse.json({ error: 'Missing assetId' }, { status: 400 });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Config Error: SUPABASE_SERVICE_ROLE_KEY is missing.' }, { status: 500 });
  }

  const { data: asset } = await supabaseAdmin
    .from('digital_assets')
    .select('download_url, price')
    .eq('id', assetId)
    .maybeSingle();

  if (!asset?.download_url) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  if (Number(asset.price) > 0 && !isAdmin(user.email)) {
    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('id')
      .eq('user_id', user.id)
      .eq('asset_id', assetId)
      .eq('status', 'success')
      .limit(1)
      .maybeSingle();

    if (!payment) {
      return NextResponse.json({ error: 'Bạn chưa mua sản phẩm này.' }, { status: 403 });
    }
  }

  return NextResponse.json({ url: asset.download_url });
}
