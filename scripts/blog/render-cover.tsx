// Renders one post's own cover (1200×675 PNG). Each post designs its cover, so covers don't repeat.
// Usage: npx -y tsx scripts/blog/render-cover.tsx <folder>/cover.tsx <folder>/cover-ten-mo-ta.png   (run from the repo root)
//
// The cover file has no imports and default-exports a component that receives { a, C }:
//   a  logo (a.mark), portraits and fonts from src/lib/og.tsx      C  brand colours
// It is copied next to this script while rendering, because JSX and next/og only resolve inside the repo.
import { copyFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ImageResponse } from 'next/og';
import { ogAssets, C } from '../../src/lib/og';

(async () => {
  // Optional third argument WxH, e.g. 1200x900 for 4:3 shop thumbnails
  const [source, out, size = '1200x675'] = process.argv.slice(2);
  const [width, height] = size.split('x').map(Number);
  if (!source || !out) throw new Error('Usage: render-cover.tsx <cover.tsx> <out.png>');
  const copy = join(dirname(fileURLToPath(import.meta.url)), `_cover-${process.pid}.tsx`);
  copyFileSync(source, copy);
  try {
    const { default: Cover } = await import(pathToFileURL(copy).href);
    const a = await ogAssets();
    const image = new ImageResponse(<Cover a={a} C={C} />, { width, height, fonts: a.fonts });
    writeFileSync(out, Buffer.from(await image.arrayBuffer()));
    console.log(out);
  } finally {
    rmSync(copy, { force: true });
  }
})().catch((e) => { console.error(e); process.exit(1); });
