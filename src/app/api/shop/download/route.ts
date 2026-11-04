import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/admin';
import { getSessionUser, getSupabaseAdmin } from '@/lib/supabase-server';
import { buyerLink, storageFile, type Buyer } from '@/lib/pdf-stamp';
import { logDownload } from '@/lib/downloads';

export const dynamic = 'force-dynamic';
// The first download of a stamped PDF reads, stamps and stores the whole file.
export const maxDuration = 60;

// Returns the download link of a digital asset (ebook, preset, LUT...) only to buyers:
// either a logged-in account that paid, or a guest holding the paid order's link (?order=&t=).
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const order = params.get('order');
  if (order) return guestDownload(order, params.get('t') || '');

  const assetId = params.get('assetId');
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

  const { data: payment } = await supabaseAdmin
    .from('payments')
    .select('order_id, buyer_name, buyer_phone, buyer_email, created_at')
    .eq('user_id', user.id)
    .eq('asset_id', assetId)
    .eq('status', 'success')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (Number(asset.price) > 0 && !payment && !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Bạn chưa mua sản phẩm này.' }, { status: 403 });
  }

  let buyer: Buyer | null = null;
  if (payment) {
    const { data: profile } = await supabaseAdmin.from('users').select('full_name').eq('id', user.id).maybeSingle();
    buyer = {
      name: payment.buyer_name || profile?.full_name || user.email || 'Người mua',
      phone: payment.buyer_phone,
      email: payment.buyer_email || user.email,
      orderId: payment.order_id,
      paidAt: payment.created_at,
    };
  }
  // The owner checking a file is not a download
  if (!isAdmin(user.email)) await logDownload(supabaseAdmin, assetId, buyer?.email || user.email, 'paid');
  return deliver(supabaseAdmin, asset.download_url, buyer);
}

async function guestDownload(orderId: string, token: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  const { data: p } = await supabase
    .from('payments')
    .select('status, access_token, asset_id, buyer_name, buyer_phone, buyer_email, created_at, digital_assets ( download_url )')
    .eq('order_id', orderId)
    .maybeSingle();
  const asset: any = p?.digital_assets;
  if (!p || !token || p.access_token !== token || !asset) return NextResponse.json({ error: 'Không tìm thấy đơn hàng.' }, { status: 404 });
  if (p.status !== 'success') return NextResponse.json({ error: 'Đơn hàng chưa thanh toán.' }, { status: 403 });
  if (!asset.download_url) return NextResponse.json({ error: 'File not found' }, { status: 404 });
  if (p.asset_id) await logDownload(supabase, p.asset_id, p.buyer_email, 'paid');
  return deliver(supabase, asset.download_url, {
    name: p.buyer_name || p.buyer_email || 'Người mua',
    phone: p.buyer_phone,
    email: p.buyer_email,
    orderId,
    paidAt: p.created_at,
  });
}

// Plain links (Google Drive…) are handed out as they are; files in a private bucket get a
// short-lived signed link, and PDFs are stamped for the buyer first.
async function deliver(supabase: SupabaseClient, downloadUrl: string, buyer: Buyer | null) {
  const file = storageFile(downloadUrl);
  if (!file) return NextResponse.json({ url: downloadUrl });
  try {
    return NextResponse.json({ url: await buyerLink(supabase, file, buyer) });
  } catch (error) {
    console.error('Shop download failed', error);
    return NextResponse.json({ error: 'Chưa chuẩn bị được file. Vui lòng thử lại sau ít phút hoặc nhắn Zalo.' }, { status: 500 });
  }
}
