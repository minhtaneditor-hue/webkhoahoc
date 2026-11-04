import { ShoppingBag } from 'lucide-react';
import { getPublicSupabase } from '@/lib/supabase-public';
import type { ShopAsset } from '@/lib/shop';
import SectionHeading from '@/components/SectionHeading';
import ShopGrid from '@/components/shop/ShopGrid';

export const revalidate = 60;

export default async function ShopPage() {
  const supabase = getPublicSupabase();
  // Public view without download_url: links are only handed out by the download routes
  const { data } = supabase
    ? await supabase.from('digital_assets_public').select('*').order('created_at', { ascending: false })
    : { data: [] };
  const assets = (data || []) as ShopAsset[];

  return (
    <main>
      <section className="container-lux pt-12 md:pt-20 pb-20 md:pb-28">
        <SectionHeading
          as="h1"
          title="Sản phẩm khác"
          description="Tài nguyên để làm video nhanh và đẹp hơn: ebook và skill AI của Minh Tấn."
        />
        <div className="mt-8">
          {assets.length > 0 ? <ShopGrid assets={assets} /> : (
            <div className="card p-12 text-center">
              <ShoppingBag size={32} className="mx-auto text-gold" aria-hidden="true" />
              <p className="mt-4 font-display text-2xl">Sản phẩm mới đang được chuẩn bị</p>
              <p className="mt-2 text-muted-foreground">Ebook và skill AI sẽ sớm có mặt. Bấm nút Hỗ trợ để được báo khi mở bán.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
