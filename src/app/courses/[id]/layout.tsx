import type { Metadata } from 'next';
import { getPublicSupabase } from '@/lib/supabase-public';

// The course page is a client component, so its title and description for search and
// link previews come from here. The preview image is ./opengraph-image.tsx.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data: course } = (await getPublicSupabase()?.from('courses').select('title, description, seo_title, seo_description').eq('id', id).maybeSingle()) ?? { data: null };
  if (!course) return { title: 'Khóa học' };
  const description = course.seo_description || course.description || undefined;
  return {
    title: course.seo_title || course.title,
    description,
    openGraph: { title: course.title, description, type: 'website' },
  };
}

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
