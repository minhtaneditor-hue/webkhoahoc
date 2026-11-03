import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.minhtanacademy.com';

export const revalidate = 3600;

// Public pages plus every published course page, for Google and other search engines.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ['', '/courses', '/students', '/shop', '/coaching', '/about', '/privacy', '/terms', '/refund']
    .map((p) => ({ url: `${BASE}${p}`, changeFrequency: 'weekly' as const, priority: p === '' ? 1 : 0.7 }));
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data } = await supabase.from('courses').select('id, created_at').eq('is_published', true);
    return [...pages, ...(data || []).map((c) => ({ url: `${BASE}/courses/${c.id}`, lastModified: c.created_at, priority: 0.9 }))];
  } catch {
    return pages;
  }
}
