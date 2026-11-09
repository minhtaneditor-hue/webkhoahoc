// Renders a blog post's illustrations (1200×675 PNG, brand colours and font) from a JSON list.
// Covers are designed per post with render-cover.tsx, so they don't all look alike.
// Usage: npx -y tsx scripts/blog/render-images.tsx <images.json> <out-dir>   (run from the repo root)
//
// Each item has "file" and "type":
//   steps   { heading, items: [{ title, note? }] }                       2–5 items
//   compare { heading, columns: [string], rows: [{ label, cells: [string] }] }  2–3 columns, 2–6 rows
//   stats   { heading, items: [{ value, label }] }                       2–4 items, each value a sourced figure
//   list    { heading, items: [string], tone?: "good" | "bad" }          2–6 items
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ReactNode } from 'react';
import { ImageResponse } from 'next/og';
import { ogAssets, C } from '../../src/lib/og';

const SIZE = { width: 1200, height: 675 };
type Assets = Awaited<ReturnType<typeof ogAssets>>;
type Spec = Record<string, any> & { file: string; type: string };

// Long text gets a smaller size so it stays inside its box.
const fit = (text: string, sizes: [number, number][], smallest: number) => sizes.find(([max]) => text.length <= max)?.[1] ?? smallest;

function Brand({ a }: { a: Assets }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <img src={a.mark} alt="" style={{ width: 40, height: 37 }} />
      <div style={{ display: 'flex', fontSize: 26, fontWeight: 800 }}><span>TẤN</span><span style={{ color: C.goldLight, marginLeft: 7 }}>VA</span></div>
    </div>
  );
}

function Page({ a, heading, children }: { a: Assets; heading: string; children: ReactNode }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '44px 56px 34px', fontFamily: 'Be Vietnam Pro', color: C.ivory,
      background: `radial-gradient(circle at 88% 8%, ${C.burgundy} 0%, ${C.onyx} 58%)` }}>
      <div style={{ display: 'flex', fontSize: fit(heading, [[42, 42], [70, 34]], 28), fontWeight: 800, lineHeight: 1.2, letterSpacing: -0.5 }}>{heading}</div>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', padding: '20px 0' }}>{children}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Brand a={a} />
        <span style={{ fontSize: 20, fontWeight: 700, color: C.stone }}>minhtanacademy.com</span>
      </div>
    </div>
  );
}

const panel = { background: 'rgba(245,240,233,0.07)', border: '1px solid rgba(245,240,233,0.16)', borderRadius: 18 };

function Steps({ a, s }: { a: Assets; s: Spec }) {
  const many = s.items.length > 3;
  return (
    <Page a={a} heading={s.heading}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: many ? 10 : 16 }}>
        {s.items.map((it: any, i: number) => (
          <div key={i} style={{ ...panel, display: 'flex', alignItems: 'center', gap: 20, padding: many ? '10px 20px' : '16px 22px' }}>
            <div style={{ display: 'flex', flexShrink: 0, width: 48, height: 48, borderRadius: 99, background: C.gold, alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800 }}>{i + 1}</div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span style={{ fontSize: many ? 24 : 28, fontWeight: 700 }}>{it.title}</span>
              {it.note ? <span style={{ marginTop: 2, fontSize: many ? 18 : 21, fontWeight: 500, color: C.stone }}>{it.note}</span> : null}
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}

function Compare({ a, s }: { a: Assets; s: Spec }) {
  const size = s.rows.length > 4 ? 19 : s.rows.length > 3 ? 22 : 25;
  const label = { display: 'flex', width: 210, flexShrink: 0, fontSize: size, fontWeight: 700, color: C.goldLight };
  return (
    <Page a={a} heading={s.heading}>
      <div style={{ ...panel, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 14, padding: '12px 20px', background: C.gold }}>
          <div style={{ ...label, color: C.ivory }} />
          {s.columns.map((c: string) => <div key={c} style={{ display: 'flex', flex: 1, fontSize: 22, fontWeight: 800 }}>{c}</div>)}
        </div>
        {s.rows.map((r: any, i: number) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '10px 20px', borderTop: '1px solid rgba(245,240,233,0.14)' }}>
            <div style={label}>{r.label}</div>
            {r.cells.map((c: string, j: number) => <div key={j} style={{ display: 'flex', flex: 1, fontSize: size, fontWeight: 500, lineHeight: 1.3 }}>{c}</div>)}
          </div>
        ))}
      </div>
    </Page>
  );
}

function Stats({ a, s }: { a: Assets; s: Spec }) {
  return (
    <Page a={a} heading={s.heading}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
        {s.items.map((it: any, i: number) => (
          <div key={i} style={{ ...panel, display: 'flex', flexDirection: 'column', width: s.items.length === 3 ? 344 : 530, padding: '24px 26px' }}>
            <span style={{ fontSize: fit(String(it.value), [[6, 70], [10, 52]], 38), fontWeight: 800, color: C.goldLight, lineHeight: 1.1 }}>{it.value}</span>
            <span style={{ marginTop: 10, fontSize: 22, fontWeight: 500, lineHeight: 1.35 }}>{it.label}</span>
          </div>
        ))}
      </div>
    </Page>
  );
}

function List({ a, s }: { a: Assets; s: Spec }) {
  const bad = s.tone === 'bad';
  const size = s.items.length > 4 ? 23 : 27;
  return (
    <Page a={a} heading={s.heading}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: s.items.length > 4 ? 12 : 18 }}>
        {s.items.map((t: string, i: number) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', flexShrink: 0, width: 34, height: 34, borderRadius: 99, background: bad ? C.burgundy : C.gold, border: `2px solid ${C.goldLight}`, alignItems: 'center', justifyContent: 'center' }}>
              {/* Drawn, because the brand font has no tick or cross glyph */}
              <svg width="16" height="16" viewBox="0 0 16 16"><path d={bad ? 'M3 3 L13 13 M13 3 L3 13' : 'M2.5 8.5 L6.5 12.5 L13.5 3.5'} stroke={C.ivory} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div style={{ display: 'flex', flex: 1, fontSize: size, fontWeight: 500, lineHeight: 1.3 }}>{t}</div>
          </div>
        ))}
      </div>
    </Page>
  );
}

const TEMPLATES: Record<string, (p: { a: Assets; s: Spec }) => ReactNode> = { steps: Steps, compare: Compare, stats: Stats, list: List };

(async () => {
  const [specFile, outDir] = process.argv.slice(2);
  if (!specFile || !outDir) throw new Error('Usage: render-images.tsx <images.json> <out-dir>');
  const specs: Spec[] = JSON.parse(readFileSync(specFile, 'utf8').replace(/^﻿/, ''));
  mkdirSync(outDir, { recursive: true });
  const a = await ogAssets();
  for (const s of specs) {
    if (s.type === 'cover') throw new Error('Không còn mẫu bìa dựng sẵn: mỗi bài tự dựng bìa bằng render-cover.tsx (xem Bước 5 của skill blog-seo-tan).');
    const Template = TEMPLATES[s.type];
    if (!Template) throw new Error(`Unknown image type "${s.type}" (${s.file})`);
    const image = new ImageResponse(<Template a={a} s={s} />, { ...SIZE, fonts: a.fonts });
    const out = join(outDir, s.file);
    writeFileSync(out, Buffer.from(await image.arrayBuffer()));
    console.log(out);
  }
})().catch((e) => { console.error(e); process.exit(1); });
