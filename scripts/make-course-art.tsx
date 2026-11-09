// Renders the 16:9 covers for the two "Edit Video bằng AI" courses.
// Usage: npx tsx scripts/make-course-art.tsx <cutout.png> <logos-dir> <out-dir>
import { readFileSync, writeFileSync } from 'node:fs';
import { ImageResponse } from 'next/og';
import { ogAssets, C } from '../src/lib/og';

const W = 1600, H = 900;
const CHATGPT_GREEN = '#10A37F', CLAUDE_ORANGE = '#D97757';
const CLIPS: [number, number, number][] = [[0, 210, 0.95], [218, 150, 0.5], [376, 300, 0.95], [684, 180, 0.5], [872, 420, 0.8], [1300, 300, 0.5]];

(async () => {
  const [cutoutPath, logosDir, outDir] = process.argv.slice(2);
  const person = `data:image/png;base64,${readFileSync(cutoutPath).toString('base64')}`;
  const logo = (name: string, fill: string) => {
    const svg = readFileSync(`${logosDir}/${name}.svg`, 'utf8').replace('<svg ', `<svg fill="${fill}" `);
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  };
  const a = await ogAssets();
  const brand = (ink: string, accent: string) => (
    <div style={{ position: 'absolute', right: 44, top: 40, display: 'flex', alignItems: 'center', gap: 10 }}>
      <img src={a.mark} alt="" width={40} height={37} />
      <div style={{ display: 'flex', fontSize: 26, fontWeight: 800, color: ink }}><span>TẤN</span><span style={{ color: accent, marginLeft: 7 }}>VA</span></div>
    </div>
  );

  // ChatGPT Plus: dark green, a chat prompt turning into an edit timeline, him on the right
  const chatgpt = (
    <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', fontFamily: 'Be Vietnam Pro', color: C.ivory, overflow: 'hidden',
      background: 'radial-gradient(circle at 80% 38%, #17705C 0%, #0A2622 60%)' }}>
      <img src={logo('openai', 'rgba(255,255,255,0.09)')} alt="" width={900} height={900} style={{ position: 'absolute', left: 800, top: -60 }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 50, height: 70, display: 'flex' }}>
        {CLIPS.map(([x, w, o]) => <div key={x} style={{ position: 'absolute', left: x, top: 0, width: w, height: 70, borderRadius: 8, background: `rgba(134,224,196,${o})` }} />)}
      </div>
      <div style={{ position: 'absolute', left: 742, bottom: 34, width: 4, height: 102, background: C.ivory, display: 'flex' }} />
      <img src={person} alt="" width={812} height={1113} style={{ position: 'absolute', left: 806, top: 16 }} />
      <div style={{ position: 'absolute', left: 72, top: 130, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 124, fontWeight: 800, lineHeight: 1.03, letterSpacing: -3 }}><span>Edit Video</span><span>bằng AI</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 92, height: 92, borderRadius: 22, background: CHATGPT_GREEN }}>
            <img src={logo('openai', '#FFFFFF')} alt="" width={66} height={66} />
          </div>
          <div style={{ display: 'flex', fontSize: 66, fontWeight: 800, letterSpacing: -1 }}>ChatGPT Plus</div>
        </div>
        <div style={{ display: 'flex', alignSelf: 'flex-start', marginTop: 34, padding: '16px 28px', borderRadius: 30, borderBottomLeftRadius: 6, background: '#F5F0E9', color: '#0A2622', fontSize: 32, fontWeight: 700 }}>Cắt đoạn lặng, thêm phụ đề giúp mình</div>
      </div>
      {brand(C.ivory, '#86E0C4')}
    </div>
  );

  // Claude: warm paper, the starburst as a huge shape behind him, him on the left
  const claude = (
    <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', fontFamily: 'Be Vietnam Pro', color: C.onyx, overflow: 'hidden', background: '#F4EDE2' }}>
      <img src={logo('claude', CLAUDE_ORANGE)} alt="" width={780} height={780} style={{ position: 'absolute', left: 10, top: 20 }} />
      <img src={person} alt="" width={812} height={1113} style={{ position: 'absolute', left: -30, top: 16 }} />
      <div style={{ position: 'absolute', left: 830, top: 190, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 124, fontWeight: 800, lineHeight: 1.03, letterSpacing: -3 }}><span>Edit Video</span><span>bằng AI</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 28 }}>
          <img src={logo('claude', CLAUDE_ORANGE)} alt="" width={88} height={88} />
          <div style={{ display: 'flex', fontSize: 84, fontWeight: 800, letterSpacing: -2, color: '#A8452A' }}>Claude</div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 830, right: 0, bottom: 70, height: 44, display: 'flex', gap: 8 }}>
        {[150, 90, 220, 120, 260].map((w, i) => <div key={i} style={{ display: 'flex', width: w, height: 44, borderRadius: 6, background: i % 2 ? '#1E1A19' : CLAUDE_ORANGE }} />)}
      </div>
      {brand(C.onyx, '#A8452A')}
    </div>
  );

  for (const [file, el] of [['chatgpt-plus', chatgpt], ['claude', claude]] as const) {
    const img = new ImageResponse(el, { width: W, height: H, fonts: a.fonts });
    writeFileSync(`${outDir}/${file}.png`, Buffer.from(await img.arrayBuffer()));
  }
})();
