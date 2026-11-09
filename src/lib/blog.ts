import { cache } from 'react';
import { getPublicSupabase } from '@/lib/supabase-public';

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string;
  updated_at: string;
};

const LIST_COLUMNS = 'id, slug, title, excerpt, cover_url, published_at, updated_at';
export type BlogPostCard = Pick<BlogPost, 'id' | 'slug' | 'title' | 'excerpt' | 'cover_url' | 'published_at' | 'updated_at'>;

// Row-level security only returns published posts to these cookie-less queries.
// A missing table (migration not run yet) reads as "no posts" rather than an error page.
export const getPublishedPosts = cache(async (limit = 100): Promise<BlogPostCard[]> => {
  const { data } = (await getPublicSupabase()
    ?.from('blog_posts')
    .select(LIST_COLUMNS)
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit)) ?? { data: null };
  return (data as BlogPostCard[] | null) || [];
});

export const getPost = cache(async (slug: string): Promise<BlogPost | null> => {
  const { data } = (await getPublicSupabase()
    ?.from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()) ?? { data: null };
  return data as BlogPost | null;
});
