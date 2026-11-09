import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicSupabase } from '@/lib/supabase-public';
import ProductView from '@/components/shop/ProductView';
import { splitDescription, type ShopAsset } from '@/lib/shop';

export const revalidate = 3600;

// Built on first visit, then cached: new products need no redeploy.
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ id: string }> };

// cache(): the metadata and the page share one query.
const getAsset = cache(async (id: string) => {
  const supabase = getPublicSupabase();
  if (!supabase) return null;
  const { data } = await supabase.from('digital_assets_public').select('*').eq('id', id).maybeSingle();
  return data as ShopAsset | null;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const asset = await getAsset(id);
  if (!asset) return { title: { absolute: 'TẤN VA / Sản phẩm khác' } };
  const description = splitDescription(asset.description).lead.replace(/\s+/g, ' ').trim().slice(0, 155) || undefined;
  return {
    // The shop's layout sets its own title, so the "TẤN VA / Tab" path is written out here
    title: { absolute: `TẤN VA / Sản phẩm khác / ${asset.title}` },
    description,
    alternates: { canonical: `/shop/${id}` },
    openGraph: { title: asset.title, description, type: 'website', locale: 'vi_VN', siteName: 'TẤN VA', images: asset.thumbnail_url ? [asset.thumbnail_url] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const asset = await getAsset(id);
  if (!asset) notFound();

  const { data: related } = await getPublicSupabase()!
    .from('digital_assets_public')
    .select('id, title, price, thumbnail_url')
    .neq('id', id)
    .order('created_at', { ascending: false })
    .limit(3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: asset.title,
    description: splitDescription(asset.description).lead || undefined,
    image: asset.thumbnail_url || undefined,
    offers: { '@type': 'Offer', price: Number(asset.price) || 0, priceCurrency: 'VND', availability: 'https://schema.org/InStock' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <ProductView asset={asset} related={(related || []) as ShopAsset[]} />
    </>
  );
}
