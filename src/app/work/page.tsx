import { getPublicSupabase } from '@/lib/supabase-public';
import JsonLd from '@/components/JsonLd';
import { ORG_ID, PERSON_ID } from '@/lib/brand-entity';
import { SITE_URL } from '@/lib/site-url';
import WorkGallery, { SHOWCASE } from './WorkGallery';

export const revalidate = 3600;

// Fetched on the server so the project list is in the page HTML, which crawlers that don't run JavaScript can read.
export default async function WorkPage() {
  const { data } = (await getPublicSupabase()?.from('projects').select('*').order('created_at', { ascending: false })) ?? { data: null };
  const projects = data && data.length > 0 ? data : SHOWCASE;
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Dự án tiêu biểu',
        url: `${SITE_URL}/work`,
        inLanguage: 'vi',
        about: { '@id': PERSON_ID },
        publisher: { '@id': ORG_ID },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: projects.map((p: { title: string; client_name?: string | null }, i: number) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: { '@type': 'CreativeWork', name: p.title, ...(p.client_name ? { sourceOrganization: { '@type': 'Organization', name: p.client_name } } : {}) },
          })),
        },
      }} />
      <WorkGallery projects={projects} />
    </>
  );
}
