"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { COUNTRY_BY_CODE, flagUrl } from '@/lib/countries';
import { Eye, Users, Repeat, ExternalLink, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { PageHeader, LoadingRow, EmptyState } from '@/components/admin/AdminUI';

// Own page-view counter (migration 013, /api/track). Vercel Web Analytics holds the
// same traffic with more detail; the button in the header opens it.
const VERCEL_ANALYTICS = 'https://vercel.com/minhtaneditor-hues-projects/webkhoahoc/analytics';

const RANGES = [
  { days: 1, label: 'Hôm nay' },
  { days: 7, label: '7 ngày' },
  { days: 30, label: '30 ngày' },
  { days: 90, label: '90 ngày' },
];

type Summary = {
  views: number; visitors: number; prev_views: number; prev_visitors: number;
  daily: { day: string; views: number; visitors: number }[];
  pages: { path: string; views: number; visitors: number }[];
  referrers: { referrer: string; views: number }[];
  countries: { country: string; visitors: number }[];
  devices: { device: string; visitors: number }[];
};

const PAGE_NAMES: Record<string, string> = {
  '/': 'Trang chủ', '/students': 'Học viên & sản phẩm', '/courses': 'Khóa học', '/shop': 'Ebook & Preset',
  '/about': 'Về Minh Tấn', '/cam-ket-bao-mat': 'Cam kết bảo mật', '/dashboard': 'Trang học viên',
};
const DEVICE_NAMES: Record<string, string> = { mobile: 'Điện thoại', desktop: 'Máy tính', tablet: 'Máy tính bảng' };
const fmt = (n: number) => Number(n).toLocaleString('vi-VN');
const pct = (a: number, b: number) => (b > 0 ? ((a - b) / b) * 100 : null);

function Kpi({ label, value, delta, icon: Icon, hint }: { label: string; value: string; delta?: number | null; icon: typeof Eye; hint?: string }) {
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

/** Daily visitors, one hue, hover tooltip per bar. Missing days are filled with 0. */
function DailyBars({ days, daily }: { days: number; daily: Summary['daily'] }) {
  const [hover, setHover] = useState<number | null>(null);
  const byDay = Object.fromEntries(daily.map((d) => [d.day, d]));
  const buckets = Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() + 7 * 3600e3 - (days - 1 - i) * 86400e3); // Vietnam day
    const key = d.toISOString().slice(0, 10);
    return { key, label: `${d.getUTCDate()}/${d.getUTCMonth() + 1}`, views: Number(byDay[key]?.views || 0), visitors: Number(byDay[key]?.visitors || 0) };
  });
  const W = 960, H = 240, padL = 44, padB = 28, padT = 12;
  const max = Math.max(1, ...buckets.map((b) => b.visitors));
  const step = (W - padL) / buckets.length;
  const barW = Math.max(2, step - 2);
  const y = (v: number) => padT + (H - padT - padB) * (1 - v / max);
  const labelEvery = Math.ceil(buckets.length / 10);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Biểu đồ người truy cập theo ngày">
        {[...new Set([0, Math.round(max / 2), max])].map((v) => (
          <g key={v}>
            <line x1={padL} x2={W} y1={y(v)} y2={y(v)} stroke="#E7E5E4" strokeWidth={1} />
            <text x={padL - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#57534E">{v}</text>
          </g>
        ))}
        {buckets.map((b, i) => {
          const top = y(b.visitors);
          return (
            <g key={b.key} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={padL + i * step} y={padT} width={step} height={H - padT - padB} fill="transparent" />
              {b.visitors > 0 && <rect x={padL + i * step + 1} y={top} width={barW} height={H - padB - top} rx={Math.min(4, barW / 2)} fill="#A84E3C" opacity={hover === null || hover === i ? 1 : 0.45} />}
              {i % labelEvery === 0 && <text x={padL + i * step + step / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="#57534E">{b.label}</text>}
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute top-0 -translate-x-1/2 card px-3 py-2 text-sm shadow-[var(--shadow-lift)] whitespace-nowrap" style={{ left: `${((padL + hover * step + step / 2) / W) * 100}%` }} role="status">
          <p className="text-muted-foreground">{buckets[hover].label}</p>
          <p className="font-semibold tabular-nums">{fmt(buckets[hover].visitors)} người · {fmt(buckets[hover].views)} lượt xem</p>
        </div>
      )}
    </div>
  );
}

/** Ranked list with a proportional bar behind each row. */
function RankList({ title, rows }: { title: string; rows: { key: string; label: React.ReactNode; value: number; sub?: string }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <section className="card p-5 md:p-6">
      <h2 className="text-2xl">{title}</h2>
      {rows.length === 0 ? <p className="mt-4 text-muted-foreground">Chưa có dữ liệu.</p> : (
        <ul className="mt-4 space-y-3">
          {rows.map((r) => (
            <li key={r.key}>
              <div className="flex items-baseline justify-between gap-4 text-sm">
                <span className="min-w-0 truncate font-semibold text-ink">{r.label}</span>
                <span className="tabular-nums whitespace-nowrap font-semibold">{fmt(r.value)}{r.sub && <span className="font-normal text-muted-foreground"> {r.sub}</span>}</span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-gold" style={{ width: `${(r.value / max) * 100}%` }} /></div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function TrafficPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    supabase.rpc('traffic_summary', { days }).then(({ data, error }) => {
      if (!alive) return;
      if (error) setError(error.message.includes('traffic_summary') ? 'Chưa chạy migration 013_page_views.sql trong Supabase.' : error.message);
      else { setError(''); setData(data as Summary); }
    });
    return () => { alive = false; };
  }, [days]);

  const viewsPerVisitor = data && data.visitors ? data.views / data.visitors : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Truy cập website"
        description="Đếm từ khi bật tính năng. Không tính trang quản trị và trang đăng nhập. Người truy cập được tính riêng theo từng ngày."
        actions={<a href={VERCEL_ANALYTICS} target="_blank" rel="noopener noreferrer" className="btn btn-outline"><ExternalLink size={16} aria-hidden="true" /> Xem chi tiết trên Vercel</a>}
      />

      <div className="flex gap-2 overflow-x-auto no-scrollbar" role="tablist" aria-label="Khoảng thời gian">
        {RANGES.map((r) => (
          <button key={r.days} role="tab" aria-selected={days === r.days} onClick={() => { setData(null); setDays(r.days); }}
                  className={`shrink-0 min-h-[44px] px-4 rounded-md text-sm font-semibold border transition-colors ${days === r.days ? 'bg-onyx text-white border-onyx' : 'bg-card border-line-strong text-stone hover:border-ink'}`}>
            {r.label}
          </button>
        ))}
      </div>

      {error ? <EmptyState icon={Activity} title="Chưa đọc được số liệu" text={error} /> : !data ? <LoadingRow /> : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Kpi label="Người truy cập" value={fmt(data.visitors)} delta={pct(data.visitors, data.prev_visitors)} icon={Users} hint="Chưa có kỳ trước để so sánh" />
            <Kpi label="Lượt xem trang" value={fmt(data.views)} delta={pct(data.views, data.prev_views)} icon={Eye} hint="Chưa có kỳ trước để so sánh" />
            <Kpi label="Trang / người" value={viewsPerVisitor.toFixed(1)} icon={Repeat} hint="Mỗi người xem trung bình bao nhiêu trang" />
          </div>

          {days > 1 && (
            <section className="card p-5 md:p-6" aria-labelledby="daily-title">
              <h2 id="daily-title" className="text-2xl">Người truy cập theo ngày</h2>
              {data.views === 0 ? <p className="mt-4 text-muted-foreground">Chưa có lượt truy cập nào trong khoảng này.</p> : <div className="mt-4"><DailyBars days={days} daily={data.daily} /></div>}
            </section>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <RankList title="Trang được xem nhiều" rows={data.pages.map((p) => ({ key: p.path, label: <>{PAGE_NAMES[p.path] || p.path} {PAGE_NAMES[p.path] && <span className="font-normal text-muted-foreground">{p.path}</span>}</>, value: Number(p.views), sub: 'lượt' }))} />
            <RankList title="Đến từ đâu" rows={data.referrers.map((r) => ({ key: r.referrer, label: r.referrer, value: Number(r.views), sub: 'lượt' }))} />
            <RankList title="Quốc gia" rows={data.countries.map((c) => ({
              key: c.country,
              label: COUNTRY_BY_CODE[c.country]
                ? <span className="inline-flex items-center gap-2"><img src={flagUrl(c.country)} alt="" width={20} height={15} className="rounded-sm" />{COUNTRY_BY_CODE[c.country].name}</span>
                : c.country === '??' ? 'Không rõ' : c.country,
              value: Number(c.visitors), sub: 'người',
            }))} />
            <RankList title="Thiết bị" rows={data.devices.map((d) => ({ key: d.device, label: DEVICE_NAMES[d.device] || d.device, value: Number(d.visitors), sub: 'người' }))} />
          </div>
        </>
      )}
    </div>
  );
}
