'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { supabase } from '@/utils/supabase';
import { formatVND } from '@/lib/supabase-public';
import { ShoppingBag, Download, Loader2, BookOpen, Palette, Package } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';

const CATEGORY_LABELS: Record<string, string> = {
  ebook: 'Ebook',
  preset: 'Preset',
  lut: 'LUT màu',
  template: 'Template',
  wedding: 'Cưới hỏi',
  travel: 'Du lịch',
  vlog: 'Vlog',
  cinematic: 'Điện ảnh',
};

const categoryIcon = (cat?: string) => (cat === 'ebook' ? BookOpen : cat === 'lut' || cat === 'preset' ? Palette : Package);

export default function ShopPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchAssets() {
      // Public view without download_url — links are only handed out by /api/shop/download
      const { data } = await supabase.from('digital_assets_public').select('*').order('created_at', { ascending: false });
      setAssets(data || []);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: paid } = await supabase
          .from('payments')
          .select('asset_id')
          .eq('user_id', user.id)
          .eq('status', 'success')
          .not('asset_id', 'is', null);
        setPurchasedIds((paid || []).map(p => p.asset_id));
      }
      setLoading(false);
    }
    fetchAssets();
  }, []);

  const categories = useMemo(() => ['all', ...Array.from(new Set(assets.map((a) => a.category).filter(Boolean)))], [assets]);
  const filteredAssets = activeCategory === 'all' ? assets : assets.filter((a) => a.category === activeCategory);

  const setError = (id: string, msg: string) => setErrors((e) => ({ ...e, [id]: msg }));

  async function handleDownload(asset: any) {
    setBusyId(asset.id);
    setError(asset.id, '');
    try {
      const response = await fetch(`/api/shop/download?assetId=${asset.id}`);
      const data = await response.json();
      if (data.url) window.open(data.url, '_blank', 'noopener');
      else setError(asset.id, data.error || 'Không lấy được link tải.');
    } finally {
      setBusyId(null);
    }
  }

  async function handlePurchase(asset: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.assign('/auth?redirect=/shop');
      return;
    }
    setBusyId(asset.id);
    setError(asset.id, '');
    try {
      const response = await fetch('/api/payment/vnpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: asset.id }),
      });
      const data = await response.json();
      if (data.url) window.location.assign(data.url);
      else setError(asset.id, data.error || 'Không tạo được đơn thanh toán.');
    } catch {
      setError(asset.id, 'Không kết nối được máy chủ thanh toán.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main>
      <section className="container-lux pt-12 pb-10 md:pt-20">
        <SectionHeading
          as="h1"
          eyebrow="Ebook & Preset"
          title="Tài nguyên để làm video nhanh và đẹp hơn"
          description="Ebook, preset màu, LUT và template do studio của Minh Tấn sử dụng hằng ngày. Mua một lần, tải về dùng mãi."
        />

        {categories.length > 2 && (
          <div className="mt-8 flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5" role="tablist" aria-label="Lọc theo loại">
            {categories.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 min-h-[44px] px-5 rounded-full text-sm font-semibold border transition-colors ${activeCategory === cat ? 'bg-onyx text-white border-onyx' : 'bg-card text-stone border-line-strong hover:border-ink'}`}
              >
                {cat === 'all' ? 'Tất cả' : CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="container-lux pb-24" aria-live="polite">
        {loading ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Đang tải sản phẩm">
            {[0, 1, 2].map((i) => (
              <li key={i} className="card overflow-hidden">
                <div className="aspect-[4/3] bg-muted animate-pulse" />
                <div className="p-6 space-y-3"><div className="h-6 w-2/3 bg-muted rounded animate-pulse" /><div className="h-4 w-full bg-muted rounded animate-pulse" /></div>
              </li>
            ))}
          </ul>
        ) : filteredAssets.length === 0 ? (
          <div className="card p-12 text-center">
            <ShoppingBag size={32} className="mx-auto text-gold" aria-hidden="true" />
            <p className="mt-4 font-display text-2xl">Sản phẩm mới đang được chuẩn bị</p>
            <p className="mt-2 text-muted-foreground">Ebook và preset sẽ sớm có mặt. Bấm nút Hỗ trợ để được báo khi mở bán.</p>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAssets.map((asset) => {
              const owned = purchasedIds.includes(asset.id) || Number(asset.price) === 0;
              const Icon = categoryIcon(asset.category);
              return (
                <li key={asset.id} className="card card-hover overflow-hidden flex flex-col">
                  <div className="relative aspect-[4/3] bg-muted">
                    {asset.thumbnail_url ? (
                      <Image src={asset.thumbnail_url} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" unoptimized={asset.thumbnail_url.startsWith('http')} />
                    ) : (
                      <div className="absolute inset-0 surface-dark flex items-center justify-center"><Icon size={40} className="text-gold-light" aria-hidden="true" /></div>
                    )}
                    {asset.category && <span className="badge absolute top-3 left-3">{CATEGORY_LABELS[asset.category] || asset.category}</span>}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h2 className="text-2xl">{asset.title}</h2>
                    {asset.description && <p className="mt-2 text-muted-foreground line-clamp-3">{asset.description}</p>}
                    <div className="mt-auto pt-6 flex items-center justify-between gap-4">
                      <p className="font-display text-2xl font-semibold">{Number(asset.price) > 0 ? formatVND(asset.price) : 'Miễn phí'}</p>
                      <button
                        onClick={() => (owned ? handleDownload(asset) : handlePurchase(asset))}
                        disabled={busyId === asset.id}
                        className={`btn !min-h-[44px] text-sm ${owned ? 'btn-dark' : 'btn-gold'}`}
                      >
                        {busyId === asset.id ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : owned ? <Download size={16} aria-hidden="true" /> : <ShoppingBag size={16} aria-hidden="true" />}
                        {owned ? 'Tải về' : 'Mua ngay'}
                      </button>
                    </div>
                    {errors[asset.id] && <p role="alert" className="mt-3 text-sm text-danger">{errors[asset.id]}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
