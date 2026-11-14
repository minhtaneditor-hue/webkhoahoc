import { cache } from 'react';
import type { Metadata } from 'next';
import { getPublicSupabase } from '@/lib/supabase-public';
import { isComingSoon, lessonsInOrder, type Chapter } from '@/lib/curriculum';
import CourseView from '@/components/courses/CourseView';
import type { Review } from '@/components/CourseReviews';
import JsonLd from '@/components/JsonLd';
import { ORG_ID } from '@/lib/brand-entity';
import { SITE_URL } from '@/lib/site-url';

export const revalidate = 3600;

// Built on first visit, then cached: new courses need no redeploy.
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ id: string }> };

// cache(): the metadata and the page share one set of queries.
const getCourse = cache(async (id: string) => {
  const supabase = getPublicSupabase();
  if (!supabase) return { course: null, lessons: [], chapters: [] as Chapter[], reviews: [] as Review[] };
  const [{ data: course }, { data: lessons }, { data: chapters }, { data: reviews }] = await Promise.all([
    supabase.from('courses').select('*').eq('id', id).maybeSingle(),
    // lesson_outline is a public view: titles for everyone, video_url only for free preview lessons
    supabase.from('lesson_outline').select('*').eq('course_id', id).order('order_index', { ascending: true }),
    supabase.from('chapters').select('id, title, order_index').eq('course_id', id).order('order_index'),
    // Visible reviews only (RLS); rendered on the server so crawlers see them
    supabase.from('course_reviews').select('id, author_name, rating, comment, created_at, updated_at').eq('course_id', id).order('created_at', { ascending: false }),
  ]);
  return {
    course,
    // Study order: chapter by chapter, so "first lesson" links and numbering follow the outline
    lessons: lessonsInOrder(chapters || [], lessons || []),
    chapters: (chapters || []) as Chapter[],
    reviews: (reviews || []) as Review[],
  };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { course } = await getCourse(id);
  // Not public: the page may still show it to a signed-in admin, but it stays out of search.
  if (!course) return { title: 'Khóa học', robots: { index: false } };
  const description = course.seo_description || course.description || undefined;
  return {
    title: `Khóa học / ${course.title}`,
    description,
    alternates: { canonical: `/courses/${id}` },
    openGraph: { title: course.title, description, type: 'website', locale: 'vi_VN', siteName: 'TẤN VA' },
  };
}

export default async function CoursePage({ params }: Props) {
  const { id } = await params;
  const { course, lessons, chapters, reviews } = await getCourse(id);
  const ratingAvg = reviews.length ? reviews.reduce((n, r) => n + r.rating, 0) / reviews.length : 0;

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
          provider: { '@type': 'Organization', '@id': ORG_ID, name: 'TẤN VA', url: SITE_URL },
          hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online' },
          // Only from real, visible student reviews; left out while there are none
          ...(reviews.length ? {
            aggregateRating: { '@type': 'AggregateRating', ratingValue: Number(ratingAvg.toFixed(1)), ratingCount: reviews.length, bestRating: 5, worstRating: 1 },
            review: reviews.slice(0, 10).map((r) => ({
              '@type': 'Review',
              author: { '@type': 'Person', name: r.author_name },
              datePublished: r.created_at.slice(0, 10),
              reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
              ...(r.comment ? { reviewBody: r.comment } : {}),
            })),
          } : {}),
          // No offer while the price is undisclosed, so search engines don't list it as free
          ...(isComingSoon(course, lessons.length) ? {} : { offers: { '@type': 'Offer', category: 'Paid', price: Number(course.price) || 0, priceCurrency: 'VND', availability: 'https://schema.org/InStock', url: `${SITE_URL}/courses/${id}` } }),
        }} />
      )}
      <CourseView id={id} initialCourse={course} initialLessons={lessons} initialChapters={chapters} initialReviews={reviews} />
    </>
  );
}
