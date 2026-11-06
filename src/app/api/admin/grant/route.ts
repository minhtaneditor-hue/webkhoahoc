import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { isAdmin } from '@/lib/admin';
import { getSessionUser, getSupabaseAdmin } from '@/lib/supabase-server';
import { getSiteSettings } from '@/lib/content';
import { contactFrom } from '@/lib/site-settings';
import { DEFAULT_STUDENT_PASSWORD, FROM, welcomeCourse } from '@/lib/emails';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/grant  { email, name?, courseId, sendEmail }
 * Admin > Học viên > Cấp quyền khóa học: opens a course for any email without payment.
 * No account yet → one is created (email confirmed) with the default password, which the
 * welcome email states. Existing accounts keep their password. The caller is checked from the session cookie, never the body.
 */
export async function POST(req: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Thiếu SUPABASE_SERVICE_ROLE_KEY.' }, { status: 500 });
  const requester = await getSessionUser();
  if (!requester || !isAdmin(requester.email)) return NextResponse.json({ error: 'Chỉ admin mới cấp quyền được.' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim().slice(0, 80) || null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Email chưa đúng.' }, { status: 400 });
  const { data: course } = await db.from('courses').select('id, title').eq('id', body.courseId).maybeSingle();
  if (!course) return NextResponse.json({ error: 'Chưa chọn khóa học.' }, { status: 400 });

  // Existing account, or create one
  let { data: user } = await db.from('users').select('id, email, full_name').eq('email', email).maybeSingle();
  let created = false;
  if (!user) {
    const { data, error } = await db.auth.admin.createUser({ email, password: DEFAULT_STUDENT_PASSWORD, email_confirm: true, user_metadata: name ? { full_name: name } : {} });
    if (error || !data.user) return NextResponse.json({ error: `Không tạo được tài khoản: ${error?.message || 'lỗi không rõ'}` }, { status: 500 });
    created = true;
    // The on_auth_user_created trigger adds the public.users row; upsert in case it lags
    await db.from('users').upsert({ id: data.user.id, email, full_name: name }, { onConflict: 'id' });
    user = { id: data.user.id, email, full_name: name };
  }

  const { error: enrollError } = await db.from('enrollments')
    .upsert({ user_id: user.id, course_id: course.id, status: 'active' }, { onConflict: 'user_id,course_id' });
  if (enrollError) return NextResponse.json({ error: `Không mở được khóa học: ${enrollError.message}` }, { status: 500 });

  let emailed = false;
  if (body.sendEmail !== false && process.env.RESEND_API_KEY) {
    const contact = contactFrom(await getSiteSettings());
    const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: FROM, to: email,
      ...welcomeCourse({ name: user.full_name || name, email, courseTitle: course.title, courseId: course.id, contact, defaultPassword: created ? DEFAULT_STUDENT_PASSWORD : undefined }),
    });
    emailed = !error;
    if (emailed) await db.from('email_log').upsert({ email, kind: 'onboard-0', ref: course.id }, { onConflict: 'email,kind,ref', ignoreDuplicates: true });
  }

  return NextResponse.json({
    message: `${created ? 'Đã tạo tài khoản và m' : 'M'}ở khóa “${course.title}” cho ${email}.${created ? ` Mật khẩu mặc định: ${DEFAULT_STUDENT_PASSWORD}.` : ''}${emailed ? ' Đã gửi email chào mừng.' : ''}`,
  });
}
