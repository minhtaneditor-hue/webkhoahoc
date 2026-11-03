import { NextResponse } from 'next/server';
import { getSessionUser, getSupabaseAdmin } from '@/lib/supabase-server';
import { isAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

/**
 * POST /api/reviews  { courseId, rating, comment }
 * Star rating + comment under a course (migration 019). The writer comes from the session
 * cookie and must be enrolled (admins may test). One review per student per course: posting
 * again updates it. A hidden review stays hidden when edited.
 */
export async function POST(req: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Máy chủ chưa sẵn sàng.' }, { status: 500 });
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Vui lòng đăng nhập để đánh giá.' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const courseId = String(body.courseId || '');
  const rating = Math.round(Number(body.rating));
  const comment = String(body.comment || '').trim().slice(0, 1500) || null;
  if (!(rating >= 1 && rating <= 5)) return NextResponse.json({ error: 'Chọn từ 1 đến 5 sao.' }, { status: 400 });

  const { data: enrollment } = await db.from('enrollments').select('status').eq('user_id', user.id).eq('course_id', courseId).maybeSingle();
  if (enrollment?.status !== 'active' && !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Chỉ học viên của khóa mới đánh giá được.' }, { status: 403 });
  }

  const { data: profile } = await db.from('users').select('full_name').eq('id', user.id).maybeSingle();
  const authorName = (profile?.full_name || user.email?.split('@')[0] || 'Học viên').slice(0, 60);
  const { data, error } = await db.from('course_reviews')
    .upsert({ course_id: courseId, user_id: user.id, author_name: authorName, rating, comment, updated_at: new Date().toISOString() }, { onConflict: 'course_id,user_id' })
    .select('id, author_name, rating, comment, created_at, updated_at, is_hidden')
    .single();
  if (error) return NextResponse.json({ error: error.message.includes('course_reviews') ? 'Chưa bật tính năng đánh giá (chạy SQL 019).' : 'Chưa lưu được, vui lòng thử lại.' }, { status: 500 });
  return NextResponse.json({ ok: true, review: data });
}

/** GET /api/reviews?courseId=  the signed-in student's own review (even if hidden), to prefill the form. */
export async function GET(req: Request) {
  const db = getSupabaseAdmin();
  const user = await getSessionUser();
  const courseId = new URL(req.url).searchParams.get('courseId');
  if (!db || !user || !courseId) return NextResponse.json({ review: null });
  const { data } = await db.from('course_reviews').select('rating, comment, is_hidden').eq('course_id', courseId).eq('user_id', user.id).maybeSingle();
  return NextResponse.json({ review: data || null });
}
