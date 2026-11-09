import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Check, ChevronLeft, Package, Palette } from 'lucide-react';
import { formatVND } from '@/lib/supabase-public';
import { CATEGORY_LABELS, lines, parseDetails, parseFaq, splitDescription, type ShopAsset } from '@/lib/shop';
import FaqList from '@/components/FaqList';
import CopyButton from '@/components/shop/CopyButton';
import ProductBuy from '@/components/shop/ProductBuy';
import ProductPreview from '@/components/shop/ProductPreview';
import { skipOptimizer } from '@/lib/image';

const heading = 'text-2xl md:text-3xl text-ink';

function Picture({ src, sizes, Icon }: { src?: string | null; sizes: string; Icon: typeof Package }) {
  return src ? (
    <Image src={src} alt="" fill sizes={sizes} className="object-cover" unoptimized={skipOptimizer(src)} />
  ) : (
    <div className="absolute inset-0 surface-dark flex items-center justify-center"><Icon size={48} className="text-gold-light" aria-hidden="true" /></div>
  );
}

// Order follows what a buyer asks: what is it, what do I get, can I use it, what do I do first.
// A section the admin left empty doesn't appear.
export default function ProductView({ asset, related }: { asset: ShopAsset; related: ShopAsset[] }) {
  const free = Number(asset.price) <= 0;
  const Icon = asset.category === 'ebook' ? BookOpen : asset.category === 'lut' || asset.category === 'preset' ? Palette : Package;
  const label = asset.category ? CATEGORY_LABELS[asset.category] || asset.category : '';
  const { lead, rest } = splitDescription(asset.description);
  const highlights = lines(asset.highlights);
  const requirements = lines(asset.requirements);
  const samples = lines(asset.samples);
  const faq = parseFaq(asset.faq);
  const chips = [label, ...(free ? [] : ['Mua một lần, dùng mãi', 'Không cần tạo tài khoản'])].filter(Boolean);

  return (
    <main>
      <section className="container-lux pt-6 md:pt-10 pb-14 md:pb-20">
        <Link href="/shop" className="inline-flex items-center gap-1 min-h-[44px] text-sm font-semibold text-stone hover:text-ink">
          <ChevronLeft size={16} aria-hidden="true" /> Tất cả sản phẩm
        </Link>

        <div className="mt-4 grid gap-8 lg:gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] items-start">
          {/* The product comes first on a phone: people see the result before they read */}
          <div className={`relative lg:order-last overflow-hidden bg-muted rounded-[var(--radius-card)] border border-line shadow-[0_24px_60px_-28px_rgba(36,35,33,0.45)] ${asset.preview_url ? 'aspect-video' : 'aspect-[4/3]'}`}>
            {asset.preview_url
              ? <ProductPreview url={asset.preview_url} poster={asset.thumbnail_url} title={asset.title} />
              : <Picture src={asset.thumbnail_url} sizes="(min-width: 1024px) 55vw, 100vw" Icon={Icon} />}
          </div>

          <div id="mua">
            <h1 className="!text-[clamp(1.875rem,3.4vw,3rem)] !leading-[1.15] text-ink [text-wrap:balance]">{asset.title}</h1>
            {lead && <p className="mt-4 text-lg leading-relaxed text-muted-foreground whitespace-pre-line">{lead}</p>}
            {chips.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {chips.map((c) => <li key={c} className="px-3 py-1.5 rounded-full border border-line-strong bg-card text-sm font-medium text-stone">{c}</li>)}
              </ul>
            )}
            <p className="mt-7 font-display text-4xl font-extrabold text-ink tabular-nums">{free ? 'Miễn phí' : formatVND(asset.price)}</p>
            <div className="mt-5 max-w-sm"><ProductBuy asset={asset} /></div>
          </div>
        </div>
      </section>

      {(highlights.length > 0 || requirements.length > 0) && (
        <section className="container-lux pb-14 md:pb-20">
          <div className={`border-t border-line pt-10 grid gap-10 lg:gap-16 ${highlights.length > 0 && requirements.length > 0 ? 'lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]' : ''}`}>
            {highlights.length > 0 && (
              <div>
                <h2 className={heading}>Bạn nhận được gì</h2>
                <ol className="mt-6 space-y-4">
                  {highlights.map((h, i) => (
                    <li key={h} className="flex gap-4">
                      <span className="font-display font-bold text-gold tabular-nums" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-stone leading-relaxed">{h}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {requirements.length > 0 && (
              <div>
                <h2 className={heading}>Bạn cần có gì</h2>
                <ul className="mt-6 space-y-4">
                  {requirements.map((r) => (
                    <li key={r} className="flex gap-3">
                      <Check size={20} className="text-gold shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="text-stone leading-relaxed">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {samples.length > 0 && (
        <section className="container-lux pb-14 md:pb-20">
          <h2 className={heading}>Chép và dùng ngay</h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {samples.map((s) => (
              <li key={s} className="card p-5 flex flex-col items-start gap-4">
                <p className="text-ink leading-relaxed break-words min-w-0 w-full">{s}</p>
                <div className="mt-auto"><CopyButton text={s} label={`Chép: ${s}`} /></div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {rest && (
        <section className="container-lux pb-14 md:pb-20">
          <h2 className={heading}>Thông tin chi tiết</h2>
          <div className="mt-5 max-w-4xl space-y-6">
            {parseDetails(rest).map((block, i) => block.src ? (
              <Image key={i} src={block.src} alt={block.alt || ''} width={1600} height={1000} sizes="(min-width: 1024px) 56rem, 100vw" unoptimized={skipOptimizer(block.src)} className="w-full h-auto rounded-[var(--radius-img)] border border-line" />
            ) : (
              <p key={i} className="max-w-3xl text-stone leading-relaxed whitespace-pre-line">{block.text}</p>
            ))}
          </div>
        </section>
      )}

      {faq.length > 0 && (
        <section className="container-lux pb-14 md:pb-20">
          <h2 className={heading}>Câu hỏi thường gặp</h2>
          <div className="mt-6"><FaqList items={faq} /></div>
        </section>
      )}

      {related.length > 0 && (
        <section className="container-lux pb-14 md:pb-20">
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <h2 className={heading}>Sản phẩm khác</h2>
            <Link href="/shop" className="link-underline text-sm font-semibold text-gold">Xem tất cả →</Link>
          </div>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <li key={r.id}>
                <Link href={`/shop/${r.id}`} className="card overflow-hidden block h-full group">
                  <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                    <Picture src={r.thumbnail_url} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" Icon={Package} />
                  </div>
                  <div className="p-5">
                    <p className="font-semibold text-ink leading-snug group-hover:underline">{r.title}</p>
                    <p className="mt-2 font-display font-bold text-gold tabular-nums">{Number(r.price) > 0 ? formatVND(r.price) : 'Miễn phí'}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Whoever read this far doesn't have to scroll back up to buy */}
      <section className="surface-dark">
        <div className="container-lux py-12 md:py-16 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl text-white">{asset.title}</h2>
            <p className="mt-2 font-display text-2xl font-bold text-gold-light tabular-nums">{free ? 'Miễn phí' : formatVND(asset.price)}</p>
          </div>
          <div className="w-full md:w-72 shrink-0"><ProductBuy asset={asset} light /></div>
        </div>
      </section>
    </main>
  );
}
