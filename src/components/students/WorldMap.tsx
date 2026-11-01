import { geoEqualEarth, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import world from 'world-atlas/countries-110m.json';
import { COUNTRY_BY_CODE } from '@/lib/countries';
import type { StudentPlace } from '@/lib/content';

const W = 960;
const H = 470;

// Drawn once per server render: the land is a single static path, students are gold dots.
const projection = geoEqualEarth().scale(178).translate([W / 2, H / 2 + 18]);
const path = geoPath(projection);
const topo = world as unknown as Topology<{ countries: GeometryCollection }>;
const land = feature(topo, topo.objects.countries);
const LAND_PATH = land.features
  .filter((f) => f.properties && (f.properties as { name?: string }).name !== 'Antarctica')
  .map((f) => path(f) || '')
  .join('');

export default function WorldMap({ places }: { places: StudentPlace[] }) {
  const pins = places
    .map((p) => {
      const c = COUNTRY_BY_CODE[p.code];
      const xy = c && projection([c.lng, c.lat]);
      return xy ? { ...p, name: c.name, x: xy[0], y: xy[1] } : null;
    })
    .filter((p): p is NonNullable<typeof p> => !!p);
  const max = Math.max(1, ...pins.map((p) => p.count));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`Bản đồ học viên ở ${pins.length} quốc gia: ${pins.map((p) => p.name).join(', ')}`}>
      <path d={LAND_PATH} fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.14)" strokeWidth={0.5} />
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
  );
}
