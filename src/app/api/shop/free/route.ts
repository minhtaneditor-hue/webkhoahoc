import { createHmac } from 'crypto';
import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { buyerLink, storageFile } from '@/lib/pdf-stamp';
import { logDownload } from '@/lib/downloads';
import { cleanEventId, metaContext, sendMetaEvent, siteUrl } from '@/lib/meta-capi';
import { FROM, SITE, freeDownloadEmail, unsubscribeHeaders } from '@/lib/emails';

export const dynamic = 'force-dynamic';

const emailToken = (assetId: string, email: string) =>
  createHmac('sha256', process.env.CRON_SECRET || 'tanva').update(`${assetId}:${email}`).digest('hex').slice(0, 24);

/** A short-lived link for plain links and private files alike. Paid products never come through here. */
async function freeFileLink(db: SupabaseClient, assetId: string) {
  const { data: asset } = await db.from('digital_assets').select('id, title, price, download_url').eq('id', assetId).maybeSingle();
  if (!asset?.download_url || Number(asset.price) > 0) return null;
  const file = storageFile(asset.download_url);
  return { asset, url: file ? await buyerLink(db, file, null) : asset.download_url };
}

/**
 * POST /api/shop/free  { assetId, name, email, phone, website, eventId }
 * Free products: the visitor leaves name, email and Zalo (saved in Admin > Khách tiềm năng),
 * then gets the file right away and by email. "website" is a honeypot.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (body.website) return NextResponse.json({ error: 'Chưa gửi được, vui lòng thử lại.' }, { status: 400 });
  const clean = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n);
  const name = clean(body.name, 80);
  const email = clean(body.email, 120).toLowerCase();
  const phone = clean(body.phone, 20).replace(/[^\d+ ]/g, '');
  if (!name) return NextResponse.json({ error: 'Vui lòng nhập tên.' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Email chưa đúng.' }, { status: 400 });
  if (phone.replace(/\D/g, '').length < 9) return NextResponse.json({ error: 'Số Zalo chưa đúng.' }, { status: 400 });

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Máy chủ chưa sẵn sàng.' }, { status: 500 });

  let link;
  try {
    link = await freeFileLink(db, clean(body.assetId, 40));
  } catch (error) {
    console.error('Free download failed', error);
    return NextResponse.json({ error: 'Chưa chuẩn bị được file. Vui lòng thử lại sau ít phút hoặc nhắn Zalo.' }, { status: 500 });
  }
  if (!link) return NextResponse.json({ error: 'Không tìm thấy sản phẩm miễn phí này.' }, { status: 404 });

  const { error } = await db.from('leads').upsert({ email, name, phone, source: 'free-product' }, { onConflict: 'email' });
  if (error) return NextResponse.json({ error: 'Chưa lưu được, vui lòng thử lại.' }, { status: 500 });

  await logDownload(db, link.asset.id, email, 'free');

  const eventId = cleanEventId(body.eventId);
  if (eventId) {
    sendMetaEvent({ name: 'Lead', eventId, url: siteUrl('/shop'), context: metaContext(req), customer: { email, phone, name }, data: { contentName: link.asset.title } });
  }

  if (process.env.RESEND_API_KEY) {
    const again = `${SITE}/api/shop/free?asset=${link.asset.id}&e=${encodeURIComponent(email)}&t=${emailToken(link.asset.id, email)}`;
    await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: FROM, to: email, headers: unsubscribeHeaders(email),
      ...freeDownloadEmail({ name, email, title: link.asset.title, url: again }),
    }).catch(() => {});
  }
  return NextResponse.json({ url: link.url });
}

/** GET /api/shop/free?asset=&e=&t=  The email's button: always resolves to a fresh file link. */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const asset = q.get('asset') || '';
  const email = (q.get('e') || '').toLowerCase();
  const db = getSupabaseAdmin();
  if (!db || !asset || q.get('t') !== emailToken(asset, email)) return NextResponse.redirect(`${SITE}/shop`);
  const link = await freeFileLink(db, asset).catch(() => null);
  if (link) await logDownload(db, link.asset.id, email, 'free-email');
  return NextResponse.redirect(link?.url || `${SITE}/shop`);
}
