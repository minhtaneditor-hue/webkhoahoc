import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.minhtanacademy.com';

export const revalidate = 3600;

// Public pages plus every published course page, shop product and blog post, for Google and other search engines.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ['', '/courses', '/students', '/work', '/shop', '/coaching', '/cham-video', '/about', '/privacy', '/terms', '/refund']
    .map((p) => ({ url: `${BASE}${p}`, changeFrequency: 'weekly' as const, priority: p === '' ? 1 : 0.7 }));
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data } = await supabase.from('courses').select('id, created_at').eq('is_published', true);
    // The blog list only joins the sitemap once there is something to read
    const { data: posts } = await supabase.from('blog_posts').select('slug, updated_at').eq('is_published', true);
    const { data: products } = await supabase.from('digital_assets_public').select('id, created_at');
    return [
      ...pages,
      ...(data || []).map((c) => ({ url: `${BASE}/courses/${c.id}`, lastModified: c.created_at, priority: 0.9 })),
      ...(products || []).map((p) => ({ url: `${BASE}/shop/${p.id}`, lastModified: p.created_at, priority: 0.8 })),
      ...(posts?.length ? [{ url: `${BASE}/blog`, changeFrequency: 'weekly' as const, priority: 0.7 }] : []),
      ...(posts || []).map((p) => ({ url: `${BASE}/blog/${p.slug}`, lastModified: p.updated_at, priority: 0.8 })),
    ];
  } catch {
    return pages;
  }
}
