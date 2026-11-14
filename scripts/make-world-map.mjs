// Writes public/world-land.svg: the land outline behind the "students around the world" map.
// It used to be drawn inside the page, which put ~150 KB of path data in the HTML and again in
// React's page data. As a file it loads once, lazily, and stays cached.
// Projection must match src/components/students/WorldMap.tsx. Run: node scripts/make-world-map.mjs
import { writeFileSync, readFileSync } from 'node:fs';
import { geoEqualEarth, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';

const W = 960;
const H = 470;
const world = JSON.parse(readFileSync(new URL('../node_modules/world-atlas/countries-110m.json', import.meta.url), 'utf8'));
const projection = geoEqualEarth().scale(178).translate([W / 2, H / 2 + 18]);
// One decimal is far below a pixel at this size and halves the path text
const path = geoPath(projection).digits(1);
const land = feature(world, world.objects.countries);
const d = land.features
  .filter((f) => f.properties?.name !== 'Antarctica')
  .map((f) => path(f) || '')
  .join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><path d="${d}" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.14)" stroke-width="0.5"/></svg>\n`;
writeFileSync(new URL('../public/world-land.svg', import.meta.url), svg);
console.log(`public/world-land.svg: ${(svg.length / 1024).toFixed(1)} KB`);
