import { redirect, notFound } from 'next/navigation';
import { getPublicSupabase } from '@/lib/supabase-public';
import { lessonsInOrder } from '@/lib/curriculum';

// /learn/<course> without a lesson: open the first lesson in study order.
export default async function LearnCourse({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const supabase = getPublicSupabase();
  if (!supabase) notFound();
  const [{ data: outline }, { data: chapters }] = await Promise.all([
    supabase.from('lesson_outline').select('id, order_index, chapter_id').eq('course_id', courseId),
    supabase.from('chapters').select('id, title, order_index').eq('course_id', courseId),
  ]);
  const first = lessonsInOrder(chapters || [], outline || [])[0];
  if (!first) notFound();
  redirect(`/learn/${courseId}/${first.id}`);
}
