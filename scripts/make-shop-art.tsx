// Renders the cover image for the "Skill Edit Video Talking Head" product (1200×900, shop cards are 4:3).
// Usage: npx tsx scripts/make-shop-art.tsx <out.png>
import { writeFileSync } from 'node:fs';
import { ImageResponse } from 'next/og';
import { ogAssets, C } from '../src/lib/og';

const FEATURES = ['Tái cấu trúc kịch bản từ transcript', 'Làm đẹp da, tăng sáng', 'Phụ đề gọn trong safe zone', 'Motion graphic & infographic'];

(async () => {
  const a = await ogAssets();
  const img = new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', fontFamily: 'Be Vietnam Pro', color: C.ivory, position: 'relative',
      background: `radial-gradient(circle at 80% 20%, ${C.burgundy} 0%, ${C.onyx} 65%)` }}>
      {/* Left: what it is */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 660, padding: '64px 0 60px 64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src={a.mark} alt="" style={{ width: 52, height: 48 }} />
          <div style={{ display: 'flex', fontSize: 32, fontWeight: 800 }}><span>TẤN</span><span style={{ color: C.goldLight, marginLeft: 8 }}>VA</span></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignSelf: 'flex-start', fontSize: 22, fontWeight: 700, letterSpacing: 3, color: C.onyx, background: C.goldLight, padding: '8px 18px', borderRadius: 999 }}>SKILL AI CHO CLAUDE</div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 24, fontSize: 84, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 }}>
            <span>Edit Video</span><span style={{ color: C.goldLight }}>Talking Head</span>
          </div>
          <div style={{ display: 'flex', marginTop: 20, fontSize: 28, fontWeight: 500, color: C.stone, lineHeight: 1.4 }}>Dựng video người nói theo gu Minh Tấn</div>
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

      {/* Right: a 9:16 talking-head frame being edited */}
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ display: 'flex', position: 'relative', width: 400, height: 712, borderRadius: 44, overflow: 'hidden', border: `10px solid #2C2624`, boxShadow: '0 40px 80px rgba(0,0,0,0.55)', background: '#000' }}>
          <img src={a.portrait} alt="" style={{ position: 'absolute', top: 0, left: -250, height: 712, width: 712, objectFit: 'cover' }} />
          {/* REC + timecode */}
          <div style={{ position: 'absolute', top: 22, left: 22, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.55)', padding: '6px 12px', borderRadius: 999, fontSize: 18, fontWeight: 700 }}>
            <div style={{ display: 'flex', width: 12, height: 12, borderRadius: 999, background: '#E5484D' }} /> 00:12
          </div>
          {/* motion graphic sticker */}
          <div style={{ position: 'absolute', top: 360, right: 14, display: 'flex', flexDirection: 'column', background: 'rgba(245,240,233,0.95)', color: C.onyx, padding: '12px 16px', borderRadius: 18, transform: 'rotate(4deg)' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.gold }}>MẸO #1</span>
            <span style={{ fontSize: 26, fontWeight: 800 }}>Quay hướng sáng</span>
          </div>
          {/* subtitle */}
          <div style={{ position: 'absolute', left: 30, right: 30, bottom: 120, display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.7)', padding: '10px 18px', borderRadius: 12, fontSize: 26, fontWeight: 700 }}>
              hôm nay mình <span style={{ color: '#FFD15C', marginLeft: 8 }}>chia sẻ</span>
            </div>
          </div>
          {/* timeline */}
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 86, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, padding: '0 18px', background: 'rgba(20,16,15,0.9)' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[70, 40, 90, 55, 80].map((w, i) => <div key={i} style={{ display: 'flex', width: w, height: 18, borderRadius: 4, background: i === 2 ? C.goldLight : '#5B4A45' }} />)}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[120, 60, 140].map((w, i) => <div key={i} style={{ display: 'flex', width: w, height: 12, borderRadius: 4, background: i === 1 ? C.gold : '#3E3431' }} />)}
            </div>
          </div>
        </div>
      </div>
    </div>,
    { width: 1200, height: 900, fonts: a.fonts },
  );
  writeFileSync(process.argv[2] || 'skill-cover.png', Buffer.from(await img.arrayBuffer()));
  console.log('saved', process.argv[2]);
})();
