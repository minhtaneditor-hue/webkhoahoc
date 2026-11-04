'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { supabase } from '@/utils/supabase';
import { formatVND } from '@/lib/supabase-public';
import { ShoppingBag, Download, Loader2, BookOpen, Palette, Package } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import BuyDialog from '@/components/shop/BuyDialog';
import FreeDownloadDialog from '@/components/shop/FreeDownloadDialog';
import { isAdmin } from '@/lib/admin';

const CATEGORY_LABELS: Record<string, string> = {
  ebook: 'Ebook',
  preset: 'Preset',
  lut: 'LUT màu',
  template: 'Template',
  skill: 'Skill AI',
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
  const [buying, setBuying] = useState<any>(null);
  const [gettingFree, setGettingFree] = useState<any>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    async function fetchAssets() {
      // Public view without download_url — links are only handed out by /api/shop/download
      const { data } = await supabase.from('digital_assets_public').select('*').order('created_at', { ascending: false });
      setAssets(data || []);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        // Admins can download every file without buying
        if (isAdmin(user.email)) setPurchasedIds((data || []).map((a: any) => a.id));
        const { data: paid } = await supabase
          .from('payments')
          .select('asset_id')
          .eq('user_id', user.id)
          .eq('status', 'success')
          .not('asset_id', 'is', null);
        if (!isAdmin(user.email)) setPurchasedIds((paid || []).map(p => p.asset_id));
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

  // Opens the quick checkout form; no login needed.
  function handlePurchase(asset: any) {
    setError(asset.id, '');
    setBuying(asset);
  }

  return (
    <main>
      <section className="container-lux pt-12 pb-10 md:pt-20">
        <SectionHeading
          as="h1"

          title="Sản phẩm khác"
          description="Tài nguyên để làm video nhanh và đẹp hơn: ebook, preset màu, LUT và template studio của Minh Tấn dùng hằng ngày. Mua một lần, tải về dùng mãi."
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
          <ul className="space-y-6" aria-busy="true" aria-label="Đang tải sản phẩm">
            {[0, 1].map((i) => (
              <li key={i} className="card overflow-hidden grid md:grid-cols-2">
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
          // One product per row: picture and name on the left, price, details and the buy button on the right
          <ul className="space-y-6">
            {filteredAssets.map((asset) => {
              const free = Number(asset.price) === 0;
              const owned = purchasedIds.includes(asset.id) && !free;
              const Icon = categoryIcon(asset.category);
              return (
                <li key={asset.id} className="card overflow-hidden grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                  <div className="flex flex-col">
                    <div className="relative aspect-[4/3] bg-muted">
                      {asset.thumbnail_url ? (
                        <Image src={asset.thumbnail_url} alt="" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" unoptimized={asset.thumbnail_url.startsWith('http')} />
                      ) : (
                        <div className="absolute inset-0 surface-dark flex items-center justify-center"><Icon size={48} className="text-gold-light" aria-hidden="true" /></div>
                      )}
                      {asset.category && <span className="badge absolute top-3 left-3">{CATEGORY_LABELS[asset.category] || asset.category}</span>}
                    </div>
                    <h2 className="p-6 md:p-7 text-2xl md:text-3xl leading-snug">{asset.title}</h2>
                  </div>

                  <div className="p-6 md:p-8 md:border-l border-t md:border-t-0 border-line flex flex-col">
                    <div className="flex items-baseline justify-between gap-3 flex-wrap">
                      <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{owned && Number(asset.price) > 0 ? 'Bạn đã mua' : 'Giá'}</span>
                      <span className="font-display text-4xl font-extrabold text-ink tabular-nums">{Number(asset.price) > 0 ? formatVND(asset.price) : 'Miễn phí'}</span>
                    </div>
                    {asset.description && (
                      <div className="mt-6">
                        <p className="text-sm font-bold text-ink">Thông tin sản phẩm</p>
                        <p className="mt-2 text-stone leading-relaxed whitespace-pre-line">{asset.description}</p>
                      </div>
                    )}
                    <div className="mt-auto pt-8">
                      <button
                        onClick={() => (free ? setGettingFree(asset) : owned ? handleDownload(asset) : handlePurchase(asset))}
                        disabled={busyId === asset.id}
                        className={`btn w-full ${owned ? 'btn-dark' : 'btn-gold'}`}
                      >
                        {busyId === asset.id ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : owned || free ? <Download size={16} aria-hidden="true" /> : <ShoppingBag size={16} aria-hidden="true" />}
                        {free ? 'Tải miễn phí' : owned ? 'Tải về' : 'Mua ngay'}
                      </button>
                      {free
                        ? <p className="mt-3 text-center text-xs text-muted-foreground">Để lại tên, email và Zalo để nhận link tải ngay.</p>
                        : !owned && <p className="mt-3 text-center text-xs text-muted-foreground">Thanh toán xong nhận link tải ngay qua email.</p>}
                      {errors[asset.id] && <p role="alert" className="mt-3 text-sm text-danger">{errors[asset.id]}</p>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <FreeDownloadDialog asset={gettingFree} defaultEmail={email} onClose={() => setGettingFree(null)} />
      <BuyDialog asset={buying} defaultEmail={email} onClose={() => setBuying(null)} />
    </main>
  );
}
