'use client';

import Link from 'next/link';
import { Globe, MessageCircle } from 'lucide-react';
import { useSiteSettings } from '@/components/SiteContext';

// Moving banner inviting advertisers to get in touch. The Zalo link and number come from
// /admin/settings. All the motion is CSS (globals.css) and stops for reduced-motion users.
const TRACKS = [
  [34, 22, 44],
  [18, 52, 30],
  [58, 42],
];

export default function AdContactBanner() {
  const { contact_zalo: zalo, contact_phone: phone } = useSiteSettings();
  return (
    <section aria-label="Liên hệ quảng cáo" className="ad-banner relative overflow-hidden rounded-[var(--radius-card)] p-6 md:p-8 text-ivory">
      <div className="relative z-10 flex items-center justify-between gap-8">
        <div className="min-w-0">
          <p className="flex items-center gap-3 text-2xl md:text-3xl font-bold leading-tight text-ivory">
            <span aria-hidden="true" className="more-note-dot" />
            Liên hệ quảng cáo
          </p>
          <p className="mt-2 max-w-md text-base leading-relaxed text-stone-300">Giới thiệu sản phẩm, dịch vụ của bạn trên website TẤN VA. Nhắn Zalo hoặc xem website để trao đổi.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={zalo} target="_blank" rel="noopener noreferrer" className="btn btn-gold">
              <MessageCircle size={18} aria-hidden="true" /> Zalo {phone}
            </a>
            <Link href="/" className="btn btn-outline-light">
              <Globe size={18} aria-hidden="true" /> minhtanacademy.com
            </Link>
          </div>
        </div>

        {/* A small editing timeline with a moving playhead */}
        <div aria-hidden="true" className="relative hidden w-44 shrink-0 flex-col gap-2 md:flex">
          {TRACKS.map((track, i) => (
            <div key={i} className="flex gap-1">
              {track.map((width, j) => (
                <span key={j} className="ad-clip h-8 rounded-[var(--radius-sm)] border border-gold-light/60" style={{ width: `${width}%`, animationDelay: `${(i + j) * 0.4}s` }} />
              ))}
            </div>
          ))}
          <span className="ad-playhead absolute -inset-y-1.5 w-0.5 rounded-full bg-ivory" />
        </div>
      </div>
    </section>
  );
}
