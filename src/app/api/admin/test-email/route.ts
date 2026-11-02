import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { isAdmin } from '@/lib/admin';
import { getSessionUser } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// Checks that RESEND_API_KEY works and shows Resend's own answer.
// Admins get the test in their inbox; any other signed-in account sends to
// Resend's test sink (delivered@resend.dev), so nobody real receives it.
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });

  const key = process.env.RESEND_API_KEY;
  if (!key) return NextResponse.json({ ok: false, problem: 'RESEND_API_KEY is not set on this deployment' });

  const to = isAdmin(user.email) ? user.email! : 'delivered@resend.dev';
  const { data, error } = await new Resend(key).emails.send({
    from: 'TẤN VA <customer@minhtanacademy.com>',
    to,
    subject: 'Email thử từ TẤN VA',
    html: '<p>Nếu bạn đọc được email này, website đã gửi được mail qua Resend.</p>',
  });
  return NextResponse.json({ ok: !error, sentTo: to, id: data?.id, error, keyLooksRight: key.startsWith('re_') && key.length > 30, keyLength: key.length });
}
