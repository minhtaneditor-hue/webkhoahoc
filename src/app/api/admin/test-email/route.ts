import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { isAdmin } from '@/lib/admin';
import { getSessionUser } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// Admin-only: sends a test email to the logged-in admin and shows Resend's answer,
// so a wrong RESEND_API_KEY or unverified sender is visible instead of failing silently.
export async function GET() {
  const user = await getSessionUser();
  if (!user || !isAdmin(user.email)) return NextResponse.json({ error: 'Admins only' }, { status: 403 });

  const key = process.env.RESEND_API_KEY;
  if (!key) return NextResponse.json({ ok: false, problem: 'RESEND_API_KEY is not set on this deployment' });

  const { data, error } = await new Resend(key).emails.send({
    from: 'Minh Tan Academy <customer@minhtanacademy.com>',
    to: user.email!,
    subject: 'Email thử từ Minh Tấn Academy',
    html: '<p>Nếu bạn đọc được email này, Resend đã gửi được mail từ website.</p>',
  });
  return NextResponse.json({ ok: !error, id: data?.id, error, keyPrefix: key.slice(0, 3), keyLength: key.length });
}
