// Renders a 1200×900 shop cover for an ebook: what it is on the left, the real book cover on the right.
// Usage: npx tsx scripts/make-ebook-art.tsx <iphone|anh-mon> <book-cover.png> <out.png>
import { readFileSync, writeFileSync } from 'node:fs';
import { ImageResponse } from 'next/og';
import { ogAssets, C } from '../src/lib/og';

const BOOKS: Record<string, { lines: [string, string]; subtitle: string; pages: number; features: string[] }> = {
  iphone: {
    lines: ['Chụp đẹp', 'bằng iPhone'],
    subtitle: 'Từ ảnh chụp vội đến ảnh có chủ đích',
    pages: 121,
    features: ['Bố cục, ánh sáng, chân dung, du lịch', 'Chỉnh ảnh 5 phút, Lightroom khi cần', 'Hiểu camera và cài đặt iPhone', 'Thử thách 30 ngày + thẻ nhớ'],
  },
  'anh-mon': {
    lines: ['Ảnh Món', 'Ra Đơn'],
    subtitle: 'Chụp món ăn và sản phẩm bằng iPhone để bán hàng',
    pages: 92,
    features: ['Ánh sáng cửa sổ, ba góc chụp cho món', 'Món Việt khó chụp: phở, cơm tấm, lẩu', 'Buổi chụp 60 phút cho 5 món', 'Checklist, shot list mẫu, lộ trình 14 ngày'],
  },
};

(async () => {
  const [key, coverPath, out] = process.argv.slice(2);
  const book = BOOKS[key];
  if (!book || !coverPath || !out) throw new Error('Usage: make-ebook-art.tsx <iphone|anh-mon> <cover.png> <out.png>');
  const a = await ogAssets();
  const cover = `data:image/png;base64,${readFileSync(coverPath).toString('base64')}`;
  const img = new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', fontFamily: 'Be Vietnam Pro', color: C.ivory, position: 'relative',
      background: `radial-gradient(circle at 80% 30%, ${C.burgundy} 0%, ${C.onyx} 65%)` }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 640, padding: '64px 0 60px 64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src={a.mark} alt="" style={{ width: 52, height: 48 }} />
          <div style={{ display: 'flex', fontSize: 32, fontWeight: 800 }}><span>TẤN</span><span style={{ color: C.goldLight, marginLeft: 8 }}>VA</span></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignSelf: 'flex-start', fontSize: 22, fontWeight: 700, letterSpacing: 3, color: C.onyx, background: C.goldLight, padding: '8px 18px', borderRadius: 999 }}>{`EBOOK · ${book.pages} TRANG`}</div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 24, fontSize: 84, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 }}>
            <span>{book.lines[0]}</span><span style={{ color: C.goldLight }}>{book.lines[1]}</span>
          </div>
          <div style={{ display: 'flex', marginTop: 20, fontSize: 28, fontWeight: 500, color: C.stone, lineHeight: 1.4 }}>{book.subtitle}</div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 30, gap: 14 }}>
            {book.features.map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 25, fontWeight: 700 }}>
                <div style={{ display: 'flex', width: 30, height: 30, borderRadius: 999, background: C.gold, alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', width: 8, height: 14, marginTop: -3, borderRight: `3px solid ${C.ivory}`, borderBottom: `3px solid ${C.ivory}`, transform: 'rotate(45deg)' }} />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 24, fontWeight: 700, color: C.goldLight }}>PDF · đọc trên điện thoại và máy tính</div>
      </div>

      {/* The real cover, tilted like a book on a desk */}
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', position: 'relative', transform: 'rotate(4deg)' }}>
          <div style={{ position: 'absolute', left: -14, top: 10, width: 440, height: 621, background: '#0E0B0A', borderRadius: 8, display: 'flex' }} />
          <img src={cover} alt="" style={{ width: 440, height: 621, borderRadius: 8, boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }} />
        </div>
      </div>
    </div>,
    { width: 1200, height: 900, fonts: a.fonts },
  );
  writeFileSync(out, Buffer.from(await img.arrayBuffer()));
  console.log('saved', out);
})();
