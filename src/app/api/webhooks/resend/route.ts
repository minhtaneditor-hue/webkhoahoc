import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// Events can arrive out of order: a late "delivered" must not hide "opened", and nothing replaces a failure.
const RANK: Record<string, number> = { scheduled: 0, sent: 1, delivery_delayed: 2, delivered: 3, opened: 4, clicked: 5, bounced: 6, failed: 6, suppressed: 6, complained: 6 };
const TIME_COLUMN: Record<string, string> = { delivered: 'delivered_at', opened: 'opened_at', clicked: 'clicked_at' };

/** POST /api/webhooks/resend  Resend calls this for every email event, signed with RESEND_WEBHOOK_SECRET. */
export async function POST(req: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  const db = getSupabaseAdmin();
  if (!secret || !db) return NextResponse.json({ error: 'Webhook chưa được cấu hình.' }, { status: 503 });

  const payload = await req.text();
  let event;
  try {
    event = new Resend(process.env.RESEND_API_KEY || 'unused').webhooks.verify({
      payload,
      webhookSecret: secret,
      headers: {
        id: req.headers.get('svix-id') || '',
        timestamp: req.headers.get('svix-timestamp') || '',
        signature: req.headers.get('svix-signature') || '',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Chữ ký không hợp lệ.' }, { status: 400 });
  }

  const status = event.type.startsWith('email.') ? event.type.slice('email.'.length) : '';
  if (!(status in RANK)) return NextResponse.json({ ok: true }); // received mail, contacts, domains: not ours to track

  const data = event.data as unknown as {
    email_id: string; to: string[]; subject?: string; created_at: string;
    bounce?: { message?: string }; failed?: { reason?: string }; suppressed?: { message?: string };
  };
  const { data: current } = await db.from('email_status').select('status').eq('email_id', data.email_id).maybeSingle();
  const row: Record<string, string> = {
    email_id: data.email_id,
    to_email: (data.to?.[0] || '').toLowerCase(),
    subject: data.subject || '',
    sent_at: data.created_at,
    updated_at: new Date().toISOString(),
    status: current && RANK[current.status] > RANK[status] ? current.status : status,
  };
  const reason = data.bounce?.message || data.failed?.reason || data.suppressed?.message;
  if (reason) row.reason = reason;
  if (TIME_COLUMN[status]) row[TIME_COLUMN[status]] = event.created_at;

  const { error } = await db.from('email_status').upsert(row, { onConflict: 'email_id' });
  if (error) {
    console.error('Resend webhook not saved', error.message);
    return NextResponse.json({ error: 'Chưa lưu được.' }, { status: 500 }); // Resend retries
  }
  return NextResponse.json({ ok: true });
}
