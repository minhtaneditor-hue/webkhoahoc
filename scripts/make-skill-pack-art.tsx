// Renders the shop cover of the free "Bộ 75 Skill Edit Video" (1200×900, shop cards are 4:3).
// Usage: npx tsx scripts/make-skill-pack-art.tsx <out.png>
import { writeFileSync } from 'node:fs';
import { ImageResponse } from 'next/og';
import { ogAssets, C } from '../src/lib/og';

const FEATURES = ['Clip bán hàng, video giải thích', 'Hoạt hình, ca nhạc, chuyển động', 'Bắt chước video mẫu', 'Dựng từ cảnh quay có sẵn'];
const ROWS: [string, string, number][] = [
  ['Clip bán hàng, ra mắt', '9', 88], ['Video giải thích', '9', 88], ['Hoạt hình và ca nhạc', '9', 88], ['Chuyển động, hiệu ứng', '22', 100],
  ['Bắt chước video mẫu', '3', 40], ['Dựng từ cảnh quay', '11', 94], ['Công cụ nền', '4', 50], ['Danh sách tra thêm', '8', 82],
];

(async () => {
  const a = await ogAssets();
  const img = new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', fontFamily: 'Be Vietnam Pro', color: C.ivory, position: 'relative',
      background: `radial-gradient(circle at 80% 20%, ${C.burgundy} 0%, ${C.onyx} 65%)` }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 660, padding: '64px 0 60px 64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src={a.mark} alt="" style={{ width: 52, height: 48 }} />
          <div style={{ display: 'flex', fontSize: 32, fontWeight: 800 }}><span>TẤN</span><span style={{ color: C.goldLight, marginLeft: 8 }}>VA</span></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignSelf: 'flex-start', fontSize: 22, fontWeight: 700, letterSpacing: 3, color: C.onyx, background: C.goldLight, padding: '8px 18px', borderRadius: 999 }}>SKILL CHO AI AGENT</div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 24, fontSize: 88, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 }}>
            <span>Bộ 75 Skill</span><span style={{ color: C.goldLight }}>Edit Video</span>
          </div>
          <div style={{ display: 'flex', marginTop: 20, fontSize: 28, fontWeight: 500, color: C.stone, lineHeight: 1.4 }}>75 repo chia theo từng loại video</div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 34, gap: 14 }}>
            {FEATURES.map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 26, fontWeight: 700 }}>
                <div style={{ display: 'flex', width: 30, height: 30, borderRadius: 999, background: C.gold, alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', width: 8, height: 14, marginTop: -3, borderRight: `3px solid ${C.ivory}`, borderBottom: `3px solid ${C.ivory}`, transform: 'rotate(45deg)' }} />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 24, fontWeight: 700, color: C.goldLight }}>minhtanacademy.com</div>
      </div>

      {/* Right: the catalogue as a window, one bar per group */}
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', paddingRight: 40 }}>
        <div style={{ display: 'flex', flexDirection: 'column', width: 440, borderRadius: 24, overflow: 'hidden', background: 'rgba(245,240,233,0.07)', border: '2px solid rgba(245,240,233,0.16)', boxShadow: '0 40px 80px rgba(0,0,0,0.55)' }}>
          <div style={{ display: 'flex', gap: 10, padding: '20px 24px', borderBottom: '2px solid rgba(245,240,233,0.12)' }}>
            {[C.goldLight, '#DDC3A7', C.gold].map((c) => <div key={c} style={{ display: 'flex', width: 16, height: 16, borderRadius: 99, background: c }} />)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 19, padding: '26px 24px 30px' }}>
            {ROWS.map(([name, n, w]) => (
              <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 21, fontWeight: 700 }}><span>{name}</span><span style={{ color: C.goldLight }}>{n}</span></div>
                <div style={{ display: 'flex', height: 8, borderRadius: 99, background: 'rgba(245,240,233,0.1)' }}>
                  <div style={{ display: 'flex', width: `${w}%`, height: 8, borderRadius: 99, background: C.goldLight }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    { width: 1200, height: 900, fonts: a.fonts },
  );
  writeFileSync(process.argv[2] || 'skill-pack-cover.png', Buffer.from(await img.arrayBuffer()));
  console.log('saved', process.argv[2]);
})();
