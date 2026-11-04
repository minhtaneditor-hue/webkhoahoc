import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { getSiteSettings } from '@/lib/content';
import { contactFrom } from '@/lib/site-settings';
import { FROM, consultReceived, consultNotify, type ConsultRequest } from '@/lib/emails';
import { cleanEventId, metaContext, sendMetaEvent, siteUrl } from '@/lib/meta-capi';

export const dynamic = 'force-dynamic';

const KINDS = ['audit', 'coaching', 'course'] as const;
const FORMATS = ['Online', 'Offline'];

/**
 * POST /api/consult  { kind, product, format, name, email, phone, message, website }
 * "Nhận tư vấn" boxes under prices and the free Audit booking. Saves the request
 * (migration 018, Admin > Đặt lịch & tư vấn), emails the customer and Minh Tấn. "website" is a honeypot.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (body.website) return NextResponse.json({ ok: true });
  const clean = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n);
  const r: ConsultRequest = {
    kind: KINDS.includes(body.kind) ? body.kind : 'course',
    product: clean(body.product, 120) || null,
    format: FORMATS.includes(body.format) ? body.format : null,
    name: clean(body.name, 80),
    email: clean(body.email, 120).toLowerCase(),
    phone: clean(body.phone, 20).replace(/[^\d+ ]/g, ''),
    message: clean(body.message, 1000) || null,
  };
  if (!r.name) return NextResponse.json({ error: 'Vui lòng nhập tên.' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) return NextResponse.json({ error: 'Email chưa đúng.' }, { status: 400 });
  if (r.phone.replace(/\D/g, '').length < 9) return NextResponse.json({ error: 'Số Zalo chưa đúng.' }, { status: 400 });

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Máy chủ chưa sẵn sàng.' }, { status: 500 });
  const { error } = await db.from('consult_requests').insert(r);
  if (error) return NextResponse.json({ error: 'Chưa gửi được, vui lòng thử lại hoặc nhắn Zalo.' }, { status: 500 });

  const eventId = cleanEventId(body.eventId);
  if (eventId) {
    sendMetaEvent({
      name: r.kind === 'audit' ? 'Schedule' : 'Lead',
      eventId,
      url: siteUrl('/'),
      context: metaContext(req),
      customer: { email: r.email, phone: r.phone, name: r.name },
      data: { contentName: r.product || r.kind },
    });
  }

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const contact = contactFrom(await getSiteSettings());
    await Promise.allSettled([
      resend.emails.send({ from: FROM, to: r.email, ...consultReceived(r, contact) }),
      resend.emails.send({ from: FROM, to: contact.email || 'tanva@minhtanacademy.com', replyTo: r.email, ...consultNotify(r) }),
    ]);
  }
  return NextResponse.json({ ok: true });
}
