import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({ subsets: ['latin', 'vietnamese'], weight: ['600', '700'], style: ['normal', 'italic'], display: 'swap' });

export type CertificateData = { name: string; course: string; date: string; code: string };

/** Security-paper lines shaped as a sound wave: the voice track of a video, swelling across the sheet. Vector, so it stays sharp in the PDF. */
function wavePath(offset: number) {
  const points: string[] = [];
  for (let x = 0; x <= 1000; x += 4) {
    const t = x / 1000;
    const swell = Math.sin(Math.PI * t) ** 1.4;
    const voice = Math.sin(t * 19 + offset * 0.5) * 0.55 + Math.sin(t * 43 + offset * 0.9) * 0.3 + Math.sin(t * 7) * 0.15;
    points.push(`${x} ${(350 + offset * 13 * (0.35 + swell) + voice * swell * 95 * (1 - Math.abs(offset) / 26)).toFixed(1)}`);
  }
  return `M${points.join('L')}`;
}

const WAVES = Array.from({ length: 25 }, (_, i) => wavePath(i - 12));

// Camera viewfinder corners instead of a diploma border: the course is about making video
const CORNERS = [
  'top-[2.4cqw] left-[2.4cqw] border-t border-l',
  'top-[2.4cqw] right-[2.4cqw] border-t border-r',
  'bottom-[2.4cqw] left-[2.4cqw] border-b border-l',
  'bottom-[2.4cqw] right-[2.4cqw] border-b border-r',
];

function Seal() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden="true">
      <circle cx="100" cy="100" r="98" fill="#E8956B" />
      <circle cx="100" cy="100" r="92" fill="none" stroke="#5A1F25" strokeWidth="1" />
      <circle cx="100" cy="100" r="60" fill="#FBF7F1" stroke="#5A1F25" strokeWidth="1" />
      <defs><path id="cert-seal-ring" d="M100 100m-71 0a71 71 0 1 1 142 0a71 71 0 1 1 -142 0" /></defs>
      <text fill="#242321" fontSize="15.5" fontWeight="700" letterSpacing="2.05">
        <textPath href="#cert-seal-ring">TẤN VA · CHỨNG NHẬN HOÀN THÀNH ·</textPath>
      </text>
      <image href="/brand/tan-va-mark.png" x="66" y="69" width="68" height="62" />
    </svg>
  );
}

/**
 * The certificate itself, an A4 landscape sheet. Every size is in cqw, so the screen preview
 * and the printed page keep one composition. The watermark prints: it is an image and vector lines.
 */
export default function CertificateCard({ data }: { data: CertificateData }) {
  const nameSize = data.name.length > 34 ? 'text-[4.1cqw]' : data.name.length > 22 ? 'text-[5.2cqw]' : 'text-[6.8cqw]';
  return (
    <div className="certificate-frame mx-auto w-full max-w-5xl">
      <article className="certificate relative w-full aspect-[297/210] overflow-hidden bg-paper text-ink shadow-certificate flex [container-type:inline-size]">
        {/* Dark band: who issued it, and the certificate number */}
        <div
          className="relative w-[27%] shrink-0 overflow-hidden flex flex-col justify-between p-[3.2cqw] text-ivory"
          style={{ background: 'radial-gradient(circle at 25% 15%, var(--color-wine) 0%, var(--color-burgundy) 38%, var(--color-onyx) 100%)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- plain img so the PDF always includes it */}
          <img src="/brand/tan-va-mark.png" alt="" className="absolute -left-[9cqw] -bottom-[4cqw] w-[38cqw] max-w-none opacity-[0.1] !rounded-none" />
          <div className="relative">
            <p className="text-[1.15cqw] text-sand">Đơn vị đào tạo</p>
            <div className="mt-[0.8cqw] flex items-center gap-[1cqw]">
              {/* eslint-disable-next-line @next/next/no-img-element -- plain img so the PDF always includes it */}
              <img src="/brand/tan-va-mark.png" alt="" className="w-[4cqw] h-auto !rounded-none" />
              <span className="text-[2.5cqw] font-extrabold tracking-tight leading-none">TẤN <span className="text-gold-light">VA</span></span>
            </div>
          </div>
          <div className="relative">
            <p className="text-[1.15cqw] text-sand">Mã chứng chỉ</p>
            <p className="mt-[0.4cqw] text-[1.45cqw] font-semibold tracking-[0.04em] tabular-nums">{data.code}</p>
            <p className="mt-[1.3cqw] pt-[1.1cqw] border-t border-white/20 text-[1.3cqw] font-semibold">minhtanacademy.com</p>
          </div>
        </div>

        {/* Sheet: watermark first, the words on top of it */}
        <div className="relative flex-1 min-w-0 overflow-hidden flex flex-col px-[7.6cqw] pt-[6.4cqw] pb-[5.6cqw]">
          <div className="absolute inset-0" aria-hidden="true">
            <svg viewBox="0 0 1000 700" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" fill="none" stroke="#A84E3C" strokeWidth="1" strokeOpacity="0.17" vectorEffect="non-scaling-stroke">
              {WAVES.map((d) => <path key={d} d={d} />)}
            </svg>
            {/* eslint-disable-next-line @next/next/no-img-element -- plain img so the PDF always includes it */}
            <img src="/brand/tan-va-mark.png" alt="" className="absolute left-1/2 top-1/2 w-[23cqw] -translate-x-1/2 -translate-y-1/2 opacity-[0.08] !rounded-none" />
          </div>
          {CORNERS.map((c) => <span key={c} className={`absolute w-[3cqw] h-[3cqw] border-gold ${c}`} aria-hidden="true" />)}

          <div className="relative flex-1 flex flex-col justify-center min-h-0">
            <h1 className="!text-[2.5cqw] !font-extrabold !tracking-tight !leading-tight text-gold">Chứng nhận hoàn thành</h1>
            <p className="mt-[3cqw] text-[1.55cqw] text-muted-foreground">Trao cho</p>
            <p className={`${playfair.className} ${nameSize} mt-[0.7cqw] font-bold leading-[1.12] text-burgundy [text-wrap:balance] break-words`}>{data.name}</p>
            <p className="mt-[3cqw] text-[1.55cqw] text-muted-foreground">đã hoàn thành toàn bộ khóa học</p>
            <p className="mt-[0.6cqw] text-[2.7cqw] font-bold leading-snug text-ink [text-wrap:balance]">{data.course}</p>
          </div>

          <div className="relative flex items-end justify-between gap-[4cqw]">
            <div>
              <p className="text-[1.75cqw] font-semibold tabular-nums">{data.date}</p>
              <p className="mt-[0.7cqw] pt-[0.7cqw] border-t border-line-strong text-[1.15cqw] text-muted-foreground min-w-[15cqw]">Ngày hoàn thành</p>
            </div>
            <div className="relative min-w-[19cqw]">
              {/* The signature's own long stroke is the signing line */}
              {/* eslint-disable-next-line @next/next/no-img-element -- plain img so the PDF always includes it */}
              <img src="/brand/signature-minh-tan.png" alt="Chữ ký của Minh Tấn" className="absolute right-0 bottom-full mb-[0.3cqw] w-[19cqw] max-w-none h-auto !rounded-none" />
              <p className="text-[1.45cqw] font-bold">Minh Tấn</p>
              <p className="mt-[0.2cqw] text-[1.15cqw] text-muted-foreground">Giảng viên · TẤN VA</p>
            </div>
          </div>
        </div>

        {/* Seal sits across the fold between the band and the sheet */}
        <div className="absolute left-[27%] top-[60%] w-[11.5cqw] h-[11.5cqw] -translate-x-1/2 -translate-y-1/2 drop-shadow-seal">
          <Seal />
        </div>
      </article>
    </div>
  );
}
