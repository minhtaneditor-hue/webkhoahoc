'use client';

import { MessageCircle } from 'lucide-react';
import { useSiteSettings } from '@/components/SiteContext';

// Banner inviting advertisers to get in touch. The Zalo link and number come from /admin/settings.
// The background sweep is CSS (globals.css) and stops for reduced-motion users.

/** compact: the small box in the post's side column, under "Muốn học bài bản hơn?". */
export default function AdContactBanner({ compact = false }: { compact?: boolean }) {
  const { contact_zalo: zalo, contact_phone: phone } = useSiteSettings();
  if (compact) {
    return (
      <section aria-label="Liên hệ quảng cáo" className="ad-banner rounded-[var(--radius-card)] p-5 text-ivory">
        <p className="flex items-center gap-2.5 text-lg font-bold leading-snug text-ivory">
          <span aria-hidden="true" className="more-note-dot" />
          Liên hệ quảng cáo
        </p>
        <p className="mt-2 text-sm leading-snug text-stone-300">Giới thiệu sản phẩm, dịch vụ của bạn trên website TẤN VA.</p>
        <a href={zalo} target="_blank" rel="noopener noreferrer" className="btn btn-outline-light w-full mt-4 whitespace-nowrap">
          <MessageCircle size={18} aria-hidden="true" /> Zalo {phone}
        </a>
      </section>
    );
  }
  return (
    <section aria-label="Liên hệ quảng cáo" className="ad-banner rounded-[var(--radius-card)] px-4 py-3 md:px-5 text-ivory flex flex-wrap items-center justify-between gap-x-5 gap-y-2.5">
      <div className="min-w-0 flex-1 basis-56">
        <p className="flex items-center gap-2 text-base font-bold leading-snug text-ivory">
          <span aria-hidden="true" className="more-note-dot" />
          Liên hệ quảng cáo
        </p>
        <p className="mt-0.5 text-sm leading-snug text-stone-300">Giới thiệu sản phẩm, dịch vụ của bạn trên website TẤN VA.</p>
      </div>
      <a href={zalo} target="_blank" rel="noopener noreferrer" className="btn btn-gold !min-h-[40px] !px-4 text-sm whitespace-nowrap">
        <MessageCircle size={16} aria-hidden="true" /> Zalo {phone}
      </a>
    </section>
  );
}
