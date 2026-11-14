import { geoEqualEarth } from 'd3-geo';
import { COUNTRY_BY_CODE } from '@/lib/countries';
import type { StudentPlace } from '@/lib/content';

const W = 960;
const H = 470;

// The land is a static file (public/world-land.svg, made by scripts/make-world-map.mjs with this
// same projection): drawn inline it put ~150 KB in the HTML and again in React's page data.
// Only the gold student dots are drawn here, on top of it.
const projection = geoEqualEarth().scale(178).translate([W / 2, H / 2 + 18]);

export default function WorldMap({ places }: { places: StudentPlace[] }) {
  const pins = places
    .map((p) => {
      const c = COUNTRY_BY_CODE[p.code];
      const xy = c && projection([c.lng, c.lat]);
      return xy ? { ...p, name: c.name, x: Math.round(xy[0] * 10) / 10, y: Math.round(xy[1] * 10) / 10 } : null;
    })
    .filter((p): p is NonNullable<typeof p> => !!p);
  const max = Math.max(1, ...pins.map((p) => p.count));

  return (
    <div className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element -- a static vector file, nothing to optimise */}
      <img src="/world-land.svg" alt="" aria-hidden="true" width={W} height={H} loading="lazy" decoding="async" className="block w-full h-auto !rounded-none" />
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" role="img" aria-label={`Bản đồ học viên ở ${pins.length} quốc gia: ${pins.map((p) => p.name).join(', ')}`}>
        {pins.map((p, i) => {
          const r = 4 + 6 * Math.sqrt(p.count / max);
          return (
            <g key={p.code} transform={`translate(${p.x} ${p.y})`}>
              <circle r={r} className="world-pulse" style={{ animationDelay: `${(i % 6) * 0.4}s` }} fill="none" stroke="var(--color-gold-light)" strokeWidth={1.5} />
              <circle r={r} fill="var(--color-gold-light)" />
              <title>{`${p.name}: ${p.count} học viên${p.cities.length ? ` (${p.cities.join(', ')})` : ''}`}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
