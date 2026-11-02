"use client";

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { formatVND } from '@/lib/supabase-public';
import { Wallet, Receipt, Calculator, BadgeCheck, TrendingUp, TrendingDown } from 'lucide-react';
import { PageHeader, LoadingRow, EmptyState, thClass, tdClass } from '@/components/admin/AdminUI';

type Range = '7d' | '30d' | '90d' | '12m' | 'all';
const RANGES: { key: Range; label: string; days: number | null }[] = [
  { key: '7d', label: '7 ngày', days: 7 },
  { key: '30d', label: '30 ngày', days: 30 },
  { key: '90d', label: '90 ngày', days: 90 },
  { key: '12m', label: '12 tháng', days: 365 },
  { key: 'all', label: 'Tất cả', days: null },
];

const DAY = 24 * 60 * 60 * 1000;
const compact = (n: number) =>
  n >= 1e9 ? `${(n / 1e9).toFixed(1).replace('.0', '')} tỷ` : n >= 1e6 ? `${(n / 1e6).toFixed(1).replace('.0', '')} tr` : n >= 1e3 ? `${Math.round(n / 1e3)}k` : `${n}`;
const dayKey = (d: Date) => d.toISOString().slice(0, 10);
const monthKey = (d: Date) => d.toISOString().slice(0, 7);

/** KPI tile with the change against the previous period of the same length. */
function Kpi({ label, value, delta, icon: Icon, hint }: { label: string; value: string; delta?: number | null; icon: typeof Wallet; hint?: string }) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="w-9 h-9 rounded-full bg-gold-soft text-gold flex items-center justify-center"><Icon size={18} aria-hidden="true" /></span>
      </div>
      <p className="mt-3 font-display text-3xl md:text-4xl font-bold tabular-nums">{value}</p>
      {delta != null && Number.isFinite(delta) ? (
        <p className={`mt-1 text-sm font-semibold flex items-center gap-1 ${up ? 'text-success' : 'text-danger'}`}>
          {up ? <TrendingUp size={14} aria-hidden="true" /> : <TrendingDown size={14} aria-hidden="true" />}
          {up ? '+' : ''}{delta.toFixed(0)}% <span className="font-normal text-muted-foreground">so với kỳ trước</span>
        </p>
      ) : hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/** Single-series bar chart (one hue, no legend), hover tooltip per bar, recessive grid. */
function RevenueBars({ buckets }: { buckets: { key: string; label: string; value: number; orders: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 960, H = 280, padL = 56, padB = 28, padT = 12;
  const max = Math.max(1, ...buckets.map((b) => b.value));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const step = (W - padL) / Math.max(1, buckets.length);
  const barW = Math.max(2, step - 2); // 2px surface gap between bars
  const y = (v: number) => padT + (H - padT - padB) * (1 - v / max);
  const labelEvery = Math.ceil(buckets.length / 10);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Biểu đồ doanh thu theo thời gian">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W} y1={y(t)} y2={y(t)} stroke="#E7E5E4" strokeWidth={1} />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#57534E">{compact(Math.round(t))}</text>
          </g>
        ))}
        {buckets.map((b, i) => {
          const x = padL + i * step + 1;
          const top = y(b.value);
          const h = Math.max(0, H - padB - top);
          return (
            <g key={b.key} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              {/* hit target taller and wider than the bar */}
              <rect x={padL + i * step} y={padT} width={step} height={H - padT - padB} fill="transparent" />
              {h > 0 && (
                <path
                  d={`M${x},${H - padB} V${top + Math.min(4, h)} Q${x},${top} ${x + Math.min(4, barW / 2)},${top} H${x + barW - Math.min(4, barW / 2)} Q${x + barW},${top} ${x + barW},${top + Math.min(4, h)} V${H - padB} Z`}
                  fill="#A84E3C"
                  opacity={hover === null || hover === i ? 1 : 0.45}
                />
              )}
              {i % labelEvery === 0 && (
                <text x={padL + i * step + step / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="#57534E">{b.label}</text>
              )}
            </g>
          );
        })}
      </svg>
      {hover !== null && buckets[hover] && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 card px-3 py-2 text-sm shadow-[var(--shadow-lift)] whitespace-nowrap"
          style={{ left: `${((padL + hover * step + step / 2) / W) * 100}%` }}
          role="status"
        >
          <p className="text-muted-foreground">{buckets[hover].label}</p>
          <p className="font-semibold tabular-nums">{formatVND(buckets[hover].value)}</p>
          <p className="text-xs text-muted-foreground">{buckets[hover].orders} đơn</p>
        </div>
      )}
    </div>
  );
}

export default function RevenuePage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>('30d');
  const [now] = useState(() => Date.now());

  useEffect(() => {
    supabase
      .from('payments')
      .select('id, amount, status, created_at, course_id, asset_id, courses ( title ), digital_assets ( title )')
      .order('created_at', { ascending: true })
      .then(({ data }) => { setPayments(data || []); setLoading(false); });
  }, []);

  const report = useMemo(() => {
    const days = RANGES.find((r) => r.key === range)!.days;
    const firstPayment = payments[0] ? new Date(payments[0].created_at).getTime() : now;
    const start = days ? now - days * DAY : Math.min(firstPayment, now - 30 * DAY);
    const prevStart = days ? start - days * DAY : null;
    const inRange = payments.filter((p) => new Date(p.created_at).getTime() >= start);
    const prev = prevStart ? payments.filter((p) => { const t = new Date(p.created_at).getTime(); return t >= prevStart && t < start; }) : [];
    const ok = (list: any[]) => list.filter((p) => p.status === 'success');
    const sum = (list: any[]) => list.reduce((s, p) => s + Number(p.amount), 0);
    const pct = (a: number, b: number) => (b > 0 ? ((a - b) / b) * 100 : null);

    const revenue = sum(ok(inRange));
    const orders = ok(inRange).length;
    const aov = orders ? revenue / orders : 0;
    const prevRevenue = sum(ok(prev));
    const prevOrders = ok(prev).length;
    const successRate = inRange.length ? (orders / inRange.length) * 100 : 0;

    // Buckets: days for short ranges, months for long ones
    const byMonth = !days || days > 90;
    const buckets: { key: string; label: string; value: number; orders: number }[] = [];
    const cursor = new Date(start);
    cursor.setHours(0, 0, 0, 0);
    if (byMonth) cursor.setDate(1);
    while (cursor.getTime() <= now) {
      const key = byMonth ? monthKey(cursor) : dayKey(cursor);
      buckets.push({ key, label: byMonth ? `T${cursor.getMonth() + 1}/${String(cursor.getFullYear()).slice(2)}` : `${cursor.getDate()}/${cursor.getMonth() + 1}`, value: 0, orders: 0 });
      if (byMonth) cursor.setMonth(cursor.getMonth() + 1); else cursor.setDate(cursor.getDate() + 1);
    }
    const index = Object.fromEntries(buckets.map((b, i) => [b.key, i]));
    for (const p of ok(inRange)) {
      const d = new Date(p.created_at);
      const i = index[byMonth ? monthKey(d) : dayKey(d)];
      if (i !== undefined) { buckets[i].value += Number(p.amount); buckets[i].orders += 1; }
    }

    // By product
    const products = new Map<string, { name: string; type: string; value: number; orders: number }>();
    for (const p of ok(inRange)) {
      const id = p.course_id || p.asset_id || 'other';
      const cur = products.get(id) || { name: p.courses?.title || p.digital_assets?.title || 'Khác', type: p.course_id ? 'Khóa học' : 'Ebook / Preset', value: 0, orders: 0 };
      cur.value += Number(p.amount);
      cur.orders += 1;
      products.set(id, cur);
    }
    const byProduct = [...products.values()].sort((a, b) => b.value - a.value);

    return {
      revenue, orders, aov, successRate, total: inRange.length,
      revenueDelta: pct(revenue, prevRevenue), ordersDelta: pct(orders, prevOrders),
      aovDelta: pct(aov, prevOrders ? prevRevenue / prevOrders : 0),
      buckets, byProduct, byMonth,
    };
  }, [payments, range, now]);

  const maxProduct = Math.max(1, ...report.byProduct.map((p) => p.value));

  return (
    <div className="space-y-6">
      <PageHeader title="Doanh thu" description="Chỉ tính đơn thanh toán thành công. Các chỉ số so với kỳ trước có cùng độ dài." />

      {/* Filters in one row above the charts */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar" role="tablist" aria-label="Khoảng thời gian">
        {RANGES.map((r) => (
          <button key={r.key} role="tab" aria-selected={range === r.key} onClick={() => setRange(r.key)}
                  className={`shrink-0 min-h-[44px] px-4 rounded-md text-sm font-semibold border transition-colors ${range === r.key ? 'bg-onyx text-white border-onyx' : 'bg-card border-line-strong text-stone hover:border-ink'}`}>
            {r.label}
          </button>
        ))}
      </div>

      {loading ? <LoadingRow /> : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="Doanh thu" value={formatVND(report.revenue)} delta={report.revenueDelta} icon={Wallet} hint="Chưa có kỳ trước để so sánh" />
            <Kpi label="Đơn thành công" value={String(report.orders)} delta={report.ordersDelta} icon={Receipt} hint="Chưa có kỳ trước để so sánh" />
            <Kpi label="Giá trị trung bình / đơn" value={formatVND(report.aov)} delta={report.aovDelta} icon={Calculator} hint="Chưa có kỳ trước để so sánh" />
            <Kpi label="Tỉ lệ thanh toán thành công" value={`${report.successRate.toFixed(0)}%`} icon={BadgeCheck} hint={`${report.orders}/${report.total} đơn tạo ra`} />
          </div>

          <section className="card p-5 md:p-6" aria-labelledby="chart-title">
            <h2 id="chart-title" className="text-2xl">Doanh thu theo {report.byMonth ? 'tháng' : 'ngày'}</h2>
            {report.revenue === 0 ? (
              <p className="mt-6 text-muted-foreground">Chưa có doanh thu trong khoảng thời gian này.</p>
            ) : (
              <>
                <div className="mt-4"><RevenueBars buckets={report.buckets} /></div>
                <details className="mt-3 text-sm">
                  <summary className="text-gold font-semibold min-h-[44px] flex items-center">Xem dạng bảng</summary>
                  <table className="w-full mt-2">
                    <thead><tr><th className={thClass}>{report.byMonth ? 'Tháng' : 'Ngày'}</th><th className={`${thClass} text-right`}>Doanh thu</th><th className={`${thClass} text-right`}>Đơn</th></tr></thead>
                    <tbody className="divide-y divide-line">
                      {report.buckets.filter((b) => b.value > 0).map((b) => (
                        <tr key={b.key}><td className={tdClass}>{b.label}</td><td className={`${tdClass} text-right tabular-nums`}>{formatVND(b.value)}</td><td className={`${tdClass} text-right tabular-nums`}>{b.orders}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              </>
            )}
          </section>

          <section className="card p-5 md:p-6" aria-labelledby="products-title">
            <h2 id="products-title" className="text-2xl">Doanh thu theo sản phẩm</h2>
            {report.byProduct.length === 0 ? (
              <EmptyState icon={Wallet} title="Chưa có sản phẩm nào bán được trong kỳ này" />
            ) : (
              <ul className="mt-5 space-y-4">
                {report.byProduct.map((p) => (
                  <li key={p.name}>
                    <div className="flex items-baseline justify-between gap-4 text-sm">
                      <span className="min-w-0">
                        <span className="font-semibold text-ink">{p.name}</span>
                        <span className="text-muted-foreground"> · {p.type} · {p.orders} đơn</span>
                      </span>
                      <span className="font-semibold tabular-nums whitespace-nowrap">{formatVND(p.value)} <span className="text-muted-foreground font-normal">({Math.round((p.value / report.revenue) * 100)}%)</span></span>
                    </div>
                    <div className="mt-2 h-2.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-gold" style={{ width: `${(p.value / maxProduct) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
