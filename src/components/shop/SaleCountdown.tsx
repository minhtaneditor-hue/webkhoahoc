'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { formatVND } from '@/lib/supabase-public';

/** Same moment assetPricing switches back to the listed price: end of that day, Vietnam time. */
const endOf = (endsOn: string) => Date.parse(`${endsOn.slice(0, 10)}T23:59:59+07:00`);

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

const two = (n: number) => String(n).padStart(2, '0');

/**
 * Time left on a product's sale price. Counts on the visitor's clock, so nothing renders on the
 * server (no mismatch with a cached page) and it disappears by itself once the sale is over.
 * `compact` is the one-line version for shop cards; the full one is a small board of four boxes.
 */
export default function SaleCountdown({ endsOn, listedPrice, compact = false, light = false }: { endsOn: string; listedPrice: number; compact?: boolean; light?: boolean }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const end = endOf(endsOn);
    const tick = () => setLeft(end - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsOn]);

  if (left === null || left <= 0) return null;
  const { d, h, m, s } = parts(left);

  if (compact) {
    return (
      <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-2.5 py-1 text-xs font-semibold text-gold tabular-nums">
        <Clock size={13} aria-hidden="true" />
        Còn {d > 0 ? `${d} ngày ` : ''}{two(h)}:{two(m)}:{two(s)}
      </span>
    );
  }

  const cells = [[d, 'Ngày'], [h, 'Giờ'], [m, 'Phút'], [s, 'Giây']] as const;
  return (
    <div className={`mt-4 max-w-sm rounded-[var(--radius-card)] border p-4 ${light ? 'border-white/15 bg-white/5' : 'border-gold/30 bg-gold/5'}`}>
      <p className={`flex items-center gap-1.5 text-sm font-semibold ${light ? 'text-gold-light' : 'text-gold'}`}>
        <Clock size={16} aria-hidden="true" /> Giá ưu đãi kết thúc sau
      </p>
      <div className="mt-3 grid grid-cols-4 gap-2" role="timer" aria-label={`Còn ${d} ngày ${h} giờ ${m} phút`}>
        {cells.map(([n, label]) => (
          <div key={label} className={`rounded-lg py-2 text-center ${light ? 'bg-white/10' : 'bg-card border border-line'}`}>
            <span className={`block font-display text-2xl font-extrabold tabular-nums leading-none ${light ? 'text-white' : 'text-ink'}`}>{two(n)}</span>
            <span className={`mt-1 block text-xs ${light ? 'text-stone-300' : 'text-muted-foreground'}`}>{label}</span>
          </div>
        ))}
      </div>
      <p className={`mt-3 text-sm ${light ? 'text-stone-300' : 'text-muted-foreground'}`}>
        Sau đó về giá gốc <strong className={`tabular-nums ${light ? 'text-white' : 'text-ink'}`}>{formatVND(listedPrice)}</strong>.
      </p>
    </div>
  );
}
