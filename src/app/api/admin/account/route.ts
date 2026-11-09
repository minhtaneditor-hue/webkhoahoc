import { randomInt } from 'node:crypto';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { getSessionUser, getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// No look-alike characters: the password is often read out or retyped from a chat message
const PASSWORD_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789';

function generatePassword() {
  return `Hocvien-${Array.from({ length: 10 }, () => PASSWORD_CHARS[randomInt(PASSWORD_CHARS.length)]).join('')}`;
}

/**
 * POST /api/admin/account  { email, name?, courseId?, replacePassword? }
 * Admin > Học viên > Tạo tài khoản: for students who cannot use the emailed set-password link.
 * Creates the account (or, with replacePassword, replaces the password of an existing one) and
 * returns a random password once. It is never stored or logged, and no email is sent.
 */
export async function POST(req: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Thiếu SUPABASE_SERVICE_ROLE_KEY.' }, { status: 500 });
  const requester = await getSessionUser();
  if (!requester || !isAdmin(requester.email)) return NextResponse.json({ error: 'Chỉ admin mới làm được việc này.' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim().slice(0, 80) || null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Email chưa đúng.' }, { status: 400 });

  let course: { id: string; title: string } | null = null;
  if (body.courseId) {
    const { data } = await db.from('courses').select('id, title').eq('id', body.courseId).maybeSingle();
    if (!data) return NextResponse.json({ error: 'Không tìm thấy khóa học.' }, { status: 400 });
    course = data;
  }

  const { data: existing, error: findError } = await db.from('users').select('id, role').eq('email', email).maybeSingle();
  if (findError) return NextResponse.json({ error: `Không kiểm tra được email: ${findError.message}` }, { status: 500 });

  const password = generatePassword();
  let userId: string;
  let created = false;

  if (existing) {
    // Replacing a password locks the owner out of their old one, so it is never implicit
    if (isAdmin(email) || existing.role === 'admin') return NextResponse.json({ error: 'Không đổi mật khẩu tài khoản admin ở đây.' }, { status: 403 });
    if (body.replacePassword !== true) return NextResponse.json({ error: 'Email này đã có tài khoản. Cần xác nhận đổi mật khẩu.' }, { status: 409 });
    const { error } = await db.auth.admin.updateUserById(existing.id, { password, email_confirm: true });
    if (error) return NextResponse.json({ error: `Không đổi được mật khẩu: ${error.message}` }, { status: 500 });
    userId = existing.id;
  } else {
    const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: name ? { full_name: name } : {} });
    if (error || !data.user) return NextResponse.json({ error: `Không tạo được tài khoản: ${error?.message || 'lỗi không rõ'}` }, { status: 500 });
    userId = data.user.id;
    created = true;
    // The on_auth_user_created trigger adds the public.users row; upsert in case it lags
    await db.from('users').upsert({ id: userId, email, full_name: name }, { onConflict: 'id' });
  }

  // The password is already live here, so a failed enrollment must still return it
  let warning: string | null = null;
  if (course) {
    const { error } = await db.from('enrollments').upsert({ user_id: userId, course_id: course.id, status: 'active' }, { onConflict: 'user_id,course_id' });
    if (error) warning = `Chưa mở được khóa “${course.title}”: ${error.message}. Hãy mở lại bằng nút Ghi danh.`;
  }

  return NextResponse.json(
    { email, password, created, courseTitle: warning ? null : course?.title || null, warning },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
