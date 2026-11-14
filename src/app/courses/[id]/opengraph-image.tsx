import { isComingSoon } from '@/lib/curriculum';
import { ImageResponse } from 'next/og';
import { ogAssets, ShareCard, OG_SIZE } from '@/lib/og';
import { getPublicSupabase } from '@/lib/supabase-public';

// Link preview for a course: its title, lesson count and price
export const alt = 'Khóa học TẤN VA';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getPublicSupabase();
  const [{ data: course }, { count }] = db
    ? await Promise.all([
        db.from('courses').select('title, price, old_price').eq('id', id).maybeSingle(),
        db.from('lesson_outline').select('id', { count: 'exact', head: true }).eq('course_id', id),
      ])
    : [{ data: null }, { count: 0 }];
  const a = await ogAssets();
  return new ImageResponse(
    <ShareCard a={a} eyebrow="Khóa học online"
               title={course?.title || 'Khóa học của Minh Tấn'}
               subtitle={course && isComingSoon(course, count || 0) ? 'Updating · Đặt trước để nhận giá ưu đãi' : `${count ? `${count} bài ngắn · ` : ''}Học trên điện thoại · Có bài học thử miễn phí`}
               price={Number(course?.price) || null} oldPrice={Number(course?.old_price) || null} />,
    { ...size, fonts: a.fonts },
  );
}
