import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { getSessionUser, getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const ALLOWED_MONTHS = [1, 3, 6, 12];

/**
 * POST /api/admin/membership  { email, months }
 * Admin > Hội viên > Cộng tháng: gives free membership time (gift for students, compensation…).
 * Adds on top of any time left, like a paid order. The account must already exist.
 */
export async function POST(req: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Thiếu SUPABASE_SERVICE_ROLE_KEY.' }, { status: 500 });
  const requester = await getSessionUser();
  if (!requester || !isAdmin(requester.email)) return NextResponse.json({ error: 'Chỉ admin mới cộng hội viên được.' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  const months = Number(body.months);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Email chưa đúng.' }, { status: 400 });
  if (!ALLOWED_MONTHS.includes(months)) return NextResponse.json({ error: 'Chọn số tháng cần cộng.' }, { status: 400 });

  const { data: user } = await db.from('users').select('id').eq('email', email).maybeSingle();
  if (!user) return NextResponse.json({ error: 'Email này chưa có tài khoản. Nhờ học viên đăng ký trên website trước.' }, { status: 404 });

  const { data: expiresAt, error } = await db.rpc('extend_membership', { p_user: user.id, p_months: months });
  if (error) return NextResponse.json({ error: `Không cộng được: ${error.message}` }, { status: 500 });
  return NextResponse.json({ ok: true, expiresAt });
}
