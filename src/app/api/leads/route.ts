import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { checkEmail } from '@/lib/email-check';
import { checkZalo } from '@/lib/phone-check';
import { CHECKLIST, CHECKLIST_TITLE } from '@/lib/checklist';
import { FROM, checklistEmail, unsubscribeHeaders, getFeaturedCourse } from '@/lib/emails';
import { cleanEventId, metaContext, sendMetaEvent, siteUrl } from '@/lib/meta-capi';

export const dynamic = 'force-dynamic';

/**
 * POST /api/leads  { name, email, phone, source, website }
 * Saves a lead (one row per email) and emails the free checklist. "website" is a honeypot.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (body.website) return NextResponse.json({ ok: true }); // bots fill hidden fields
  const checked = await checkEmail(body.email);
  const name = String(body.name || '').trim().slice(0, 80);
  // Zalo stays optional here, but a number that is filled in must be a real one
  const zalo = String(body.phone || '').trim() ? checkZalo(body.phone) : null;
  if (zalo && !zalo.ok) return NextResponse.json({ error: zalo.error }, { status: 400 });
  const phone = zalo?.ok ? zalo.phone : '';
  if (!checked.ok) return NextResponse.json({ error: checked.error }, { status: 400 });
  const { email } = checked;

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: 'Máy chủ chưa sẵn sàng.' }, { status: 500 });
  const { error } = await admin.from('leads').upsert(
    { email, name: name || null, phone: phone || null, source: String(body.source || 'website').slice(0, 40) },
    { onConflict: 'email' }
  );
  if (error) return NextResponse.json({ error: 'Chưa lưu được, vui lòng thử lại.' }, { status: 500 });

  const eventId = cleanEventId(body.eventId);
  if (eventId) {
    sendMetaEvent({
      name: 'Lead',
      eventId,
      url: siteUrl('/'),
      context: metaContext(req),
      customer: { email, phone, name },
    });
  }

  if (process.env.RESEND_API_KEY) {
    await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: FROM,
      to: email,
      headers: unsubscribeHeaders(email),
      ...checklistEmail({ name, email, title: CHECKLIST_TITLE, groups: CHECKLIST, course: await getFeaturedCourse(admin) }),
    }).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}
