import { cache } from 'react';
import type { Metadata } from 'next';
import { getPublicSupabase } from '@/lib/supabase-public';
import { isComingSoon, lessonsInOrder, type Chapter } from '@/lib/curriculum';
import CourseView from '@/components/courses/CourseView';
import JsonLd from '@/components/JsonLd';
import { SITE_URL } from '@/lib/site-url';

export const revalidate = 60;

// Built on first visit, then cached: new courses need no redeploy.
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ id: string }> };

// cache(): the metadata and the page share one set of queries.
const getCourse = cache(async (id: string) => {
  const supabase = getPublicSupabase();
  if (!supabase) return { course: null, lessons: [], chapters: [] as Chapter[] };
  const [{ data: course }, { data: lessons }, { data: chapters }] = await Promise.all([
    supabase.from('courses').select('*').eq('id', id).maybeSingle(),
    // lesson_outline is a public view: titles for everyone, video_url only for free preview lessons
    supabase.from('lesson_outline').select('*').eq('course_id', id).order('order_index', { ascending: true }),
    supabase.from('chapters').select('id, title, order_index').eq('course_id', id).order('order_index'),
  ]);
  return {
    course,
    // Study order: chapter by chapter, so "first lesson" links and numbering follow the outline
    lessons: lessonsInOrder(chapters || [], lessons || []),
    chapters: (chapters || []) as Chapter[],
  };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { course } = await getCourse(id);
  // Not public: the page may still show it to a signed-in admin, but it stays out of search.
  if (!course) return { title: 'Khóa học', robots: { index: false } };
  const description = course.seo_description || course.description || undefined;
  return {
    title: course.seo_title || course.title,
    description,
    alternates: { canonical: `/courses/${id}` },
    openGraph: { title: course.title, description, type: 'website', locale: 'vi_VN', siteName: 'TẤN VA' },
  };
}

export default async function CoursePage({ params }: Props) {
  const { id } = await params;
  const { course, lessons, chapters } = await getCourse(id);

  return (
    <>
      {course && (
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: course.title,
          description: course.seo_description || course.description || course.title,
          url: `${SITE_URL}/courses/${id}`,
          inLanguage: 'vi',
          provider: { '@type': 'Organization', name: 'TẤN VA', url: SITE_URL },
          hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online' },
          // No offer while the price is undisclosed, so search engines don't list it as free
          ...(isComingSoon(course, lessons.length) ? {} : { offers: { '@type': 'Offer', category: 'Paid', price: Number(course.price) || 0, priceCurrency: 'VND', availability: 'https://schema.org/InStock', url: `${SITE_URL}/courses/${id}` } }),
        }} />
      )}
      <CourseView id={id} initialCourse={course} initialLessons={lessons} initialChapters={chapters} />
    </>
  );
}
