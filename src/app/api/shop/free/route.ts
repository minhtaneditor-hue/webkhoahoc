import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { buyerLink, storageFile } from '@/lib/pdf-stamp';
import { logDownload } from '@/lib/downloads';
import { checkEmail } from '@/lib/email-check';
import { checkZalo } from '@/lib/phone-check';
import { cleanEventId, metaContext, sendMetaEvent, siteUrl } from '@/lib/meta-capi';
import { FROM, SITE, freeDownloadEmail, unsubscribeHeaders } from '@/lib/emails';
import { freeEmailToken, freeEmailUrl } from '@/lib/free-link';

export const dynamic = 'force-dynamic';

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
  const checked = await checkEmail(body.email);
  const zalo = checkZalo(body.phone);
  if (!name) return NextResponse.json({ error: 'Vui lòng nhập tên.' }, { status: 400 });
  if (!checked.ok) return NextResponse.json({ error: checked.error, field: 'email', suggestion: checked.suggestion }, { status: 400 });
  const { email } = checked;
  if (!zalo.ok) return NextResponse.json({ error: zalo.error }, { status: 400 });
  const { phone } = zalo;

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

  // Someone already on the list keeps their original source; what they took is in asset_downloads
  const { data: known } = await db.from('leads').select('id').eq('email', email).maybeSingle();
  const { error } = known
    ? await db.from('leads').update({ name, phone }).eq('id', known.id)
    : await db.from('leads').insert({ email, name, phone, source: 'free-product' });
  if (error) return NextResponse.json({ error: 'Chưa lưu được, vui lòng thử lại.' }, { status: 500 });

  await logDownload(db, link.asset.id, email, 'free');

  const eventId = cleanEventId(body.eventId);
  if (eventId) {
    sendMetaEvent({ name: 'Lead', eventId, url: siteUrl('/shop'), context: metaContext(req), customer: { email, phone, name }, data: { contentName: link.asset.title } });
  }

  if (process.env.RESEND_API_KEY) {
    await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: FROM, to: email, headers: unsubscribeHeaders(email),
      ...freeDownloadEmail({ name, email, title: link.asset.title, url: freeEmailUrl(link.asset.id, email) }),
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
  if (!db || !asset || q.get('t') !== freeEmailToken(asset, email)) return NextResponse.redirect(`${SITE}/shop`);
  const link = await freeFileLink(db, asset).catch(() => null);
  if (link) await logDownload(db, link.asset.id, email, 'free-email');
  // R2 files come back as a site-relative /api/shop/file link; a redirect needs an absolute URL
  return NextResponse.redirect(link?.url ? new URL(link.url, SITE) : `${SITE}/shop`);
}
