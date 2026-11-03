import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { CHECKLIST, CHECKLIST_TITLE } from '@/lib/checklist';

export const dynamic = 'force-dynamic';

const esc = (v: string) => v.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

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
    const list = CHECKLIST.map((g) => `<h3 style="font-size:16px;margin:20px 0 6px;color:#A84E3C;">${g.group}</h3>` +
      g.items.map((i) => `<p style="margin:4px 0;">☐ ${esc(i)}</p>`).join('')).join('');
    await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: 'TẤN VA <tanva@minhtanacademy.com>',
      to: email,
      subject: `Quà của bạn: ${CHECKLIST_TITLE}`,
      html: `<div style="max-width:560px;margin:0 auto;font-family:Arial,sans-serif;color:#242321;line-height:1.6;">
        <p style="font-size:13px;font-weight:700;color:#A84E3C;letter-spacing:0.08em;">TẤN VA · MINH TẤN VIDEO ADVISOR</p>
        <h1 style="font-size:22px;margin:8px 0;">${CHECKLIST_TITLE}</h1>
        <p>Chào ${esc(name || 'bạn')}, đây là checklist Minh Tấn dùng trước mỗi lần quay. Lưu email này và mở ra trước khi bấm quay nhé.</p>
        ${list}
        <p style="margin-top:24px;">Muốn học bài bản từ đầu? <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.minhtanacademy.com'}/courses" style="color:#A84E3C;font-weight:700;">Học thử miễn phí khoá 21 Ngày</a>.</p>
      </div>`,
    }).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}
