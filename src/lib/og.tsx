import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Shared pieces for the link-preview images (opengraph-image.tsx files) and the shop artwork.
// Satori (next/og) only reads TTF/OTF fonts and needs images as data URIs or absolute URLs.

export const OG_SIZE = { width: 1200, height: 630 };
export const C = { gold: '#A84E3C', goldLight: '#E8956B', ivory: '#F5F0E9', onyx: '#1E1A19', burgundy: '#5A1F25', stone: '#B9AEA6' };

const asset = (...p: string[]) => join(process.cwd(), 'src/assets', ...p);
const dataUri = async (file: string, type: string) => `data:${type};base64,${(await readFile(asset(file))).toString('base64')}`;

export async function ogAssets() {
  const [medium, bold, extraBold, mark, cutout, portrait] = await Promise.all([
    readFile(asset('fonts/BeVietnamPro-Medium.ttf')),
    readFile(asset('fonts/BeVietnamPro-Bold.ttf')),
    readFile(asset('fonts/BeVietnamPro-ExtraBold.ttf')),
    dataUri('og/mark.png', 'image/png'),
    dataUri('og/minh-tan-cutout.png', 'image/png'),
    dataUri('og/minh-tan.jpg', 'image/jpeg'),
  ]);
  return {
    mark, cutout, portrait,
    fonts: [
      { name: 'Be Vietnam Pro', data: medium, weight: 500 as const, style: 'normal' as const },
      { name: 'Be Vietnam Pro', data: bold, weight: 700 as const, style: 'normal' as const },
      { name: 'Be Vietnam Pro', data: extraBold, weight: 800 as const, style: 'normal' as const },
    ],
  };
}

const vnd = (n: number) => `${new Intl.NumberFormat('vi-VN').format(n)}đ`;

/**
 * 1200×630 share card: logo, eyebrow, headline and details on the left, Minh Tấn on the right.
 * price / oldPrice are optional (course pages).
 */
export function ShareCard({ a, eyebrow, title, subtitle, price, oldPrice }: {
  a: Awaited<ReturnType<typeof ogAssets>>; eyebrow: string; title: string; subtitle: string; price?: number | null; oldPrice?: number | null;
}) {
  const long = title.length > 34;
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', fontFamily: 'Be Vietnam Pro', color: C.ivory,
      background: `radial-gradient(circle at 78% 30%, ${C.burgundy} 0%, ${C.onyx} 62%)` }}>
      {/* warm glow behind the portrait */}
      <div style={{ position: 'absolute', right: 40, bottom: -160, width: 560, height: 560, borderRadius: 9999, background: C.gold, opacity: 0.35, filter: 'blur(90px)', display: 'flex' }} />
      <img src={a.cutout} alt="" style={{ position: 'absolute', right: 10, bottom: 0, height: 600 }} />

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 720, padding: '56px 0 52px 64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src={a.mark} alt="" style={{ width: 58, height: 53 }} />
          <div style={{ display: 'flex', fontSize: 38, fontWeight: 800, letterSpacing: -1 }}>
            <span>TẤN</span><span style={{ color: C.goldLight, marginLeft: 10 }}>VA</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignSelf: 'flex-start', fontSize: 20, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: C.onyx, background: C.goldLight, padding: '8px 18px', borderRadius: 999 }}>
            {eyebrow}
          </div>
          <div style={{ display: 'flex', marginTop: 22, fontSize: long ? 56 : 66, fontWeight: 800, lineHeight: 1.12, letterSpacing: -1.5 }}>{title}</div>
          <div style={{ display: 'flex', marginTop: 18, fontSize: 26, fontWeight: 500, color: C.stone, lineHeight: 1.45 }}>{subtitle}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingRight: 40 }}>
          {price ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
              <span style={{ fontSize: 54, fontWeight: 800, color: C.ivory }}>{vnd(price)}</span>
              {oldPrice && oldPrice > price ? <span style={{ fontSize: 28, fontWeight: 500, color: C.stone, textDecoration: 'line-through' }}>{vnd(oldPrice)}</span> : null}
            </div>
          ) : (
            <span style={{ fontSize: 26, fontWeight: 700, color: C.goldLight }}>minhtanacademy.com</span>
          )}
        </div>
      </div>
    </div>
  );
}
