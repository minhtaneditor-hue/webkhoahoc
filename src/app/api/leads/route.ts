import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { CHECKLIST, CHECKLIST_TITLE } from '@/lib/checklist';
import { FROM, checklistEmail, unsubscribeHeaders, getFeaturedCourse } from '@/lib/emails';

export const dynamic = 'force-dynamic';

/**
 * POST /api/leads  { name, email, phone, source, website }
 * Saves a lead (one row per email) and emails the free checklist. "website" is a honeypot.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (body.website) return NextResponse.json({ ok: true }); // bots fill hidden fields
  const email = String(body.email || '').trim().toLowerCase().slice(0, 120);
  const name = String(body.name || '').trim().slice(0, 80);
  const phone = String(body.phone || '').replace(/[^\d+ ]/g, '').trim().slice(0, 20);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Email chưa đúng.' }, { status: 400 });

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: 'Máy chủ chưa sẵn sàng.' }, { status: 500 });
  const { error } = await admin.from('leads').upsert(
    { email, name: name || null, phone: phone || null, source: String(body.source || 'website').slice(0, 40) },
    { onConflict: 'email' }
  );
  if (error) return NextResponse.json({ error: 'Chưa lưu được, vui lòng thử lại.' }, { status: 500 });

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
