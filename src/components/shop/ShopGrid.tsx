'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Package, Palette } from 'lucide-react';
import { formatVND, savingPercent } from '@/lib/supabase-public';
import { CATEGORY_LABELS, assetPricing, splitDescription, type ShopAsset } from '@/lib/shop';
import { skipOptimizer } from '@/lib/image';

const iconFor = (category?: string | null) => (category === 'ebook' ? BookOpen : category === 'lut' || category === 'preset' ? Palette : Package);

// The shop's list: a filter and one card per product. Each card opens the product's own page,
// which is the link people share and the place to buy.
export default function ShopGrid({ assets }: { assets: ShopAsset[] }) {
  const [active, setActive] = useState('all');
  const categories = useMemo(() => [...new Set(assets.map((a) => a.category).filter(Boolean))] as string[], [assets]);
  const shown = active === 'all' ? assets : assets.filter((a) => a.category === active);
  const chip = (on: boolean) => `shrink-0 min-h-[44px] px-5 rounded-full text-sm font-semibold transition-colors ${on ? 'bg-onyx text-ivory' : 'bg-card border border-line-strong text-stone hover:text-ink'}`;

  return (
    <>
      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1" role="group" aria-label="Lọc theo loại">
          <button type="button" className={chip(active === 'all')} aria-pressed={active === 'all'} onClick={() => setActive('all')}>Tất cả</button>
          {categories.map((c) => (
            <button key={c} type="button" className={chip(active === c)} aria-pressed={active === c} onClick={() => setActive(c)}>{CATEGORY_LABELS[c] || c}</button>
          ))}
        </div>
      )}

      <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((asset) => {
          const free = Number(asset.price) <= 0;
          const { price, oldPrice } = assetPricing(asset);
          const Icon = iconFor(asset.category);
          return (
            <li key={asset.id} className="min-w-0">
              <Link href={`/shop/${asset.id}`} className="card card-hover group h-full overflow-hidden flex flex-col">
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                  {asset.thumbnail_url ? (
                    <Image src={asset.thumbnail_url} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" unoptimized={skipOptimizer(asset.thumbnail_url)} className="!rounded-none object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  ) : (
                    <div className="absolute inset-0 surface-dark flex items-center justify-center"><Icon size={44} className="text-gold-light" aria-hidden="true" /></div>
                  )}
                </div>
                <div className="flex-1 flex flex-col p-5 md:p-6">
                  {asset.category && <p className="text-sm font-semibold text-gold">{CATEGORY_LABELS[asset.category] || asset.category}</p>}
                  <h2 className="mt-1.5 !text-xl !leading-snug line-clamp-2 group-hover:text-gold transition-colors">{asset.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">{splitDescription(asset.description).lead}</p>
                  <div className="mt-auto pt-5 flex items-center justify-between gap-3">
                    <span className="min-w-0">
                      <span className={`block font-display text-2xl font-extrabold tabular-nums ${free ? 'text-gold' : 'text-ink'}`}>{free ? 'Miễn phí' : formatVND(price)}</span>
                      {oldPrice && <span className="block text-sm text-muted-foreground tabular-nums"><s>{formatVND(oldPrice)}</s> <span className="font-semibold text-gold">· Giảm {savingPercent(price, oldPrice)}%</span></span>}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink whitespace-nowrap">Xem chi tiết <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
