"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { isAppShellRoute } from "./Navbar";
import { useSiteSettings } from "./SiteContext";

// Slow announcement marquee: pauses on hover, static under reduced motion (see .marquee-track).
export default function GlobalTicker() {
  const pathname = usePathname();
  const settings = useSiteSettings();
  if (isAppShellRoute(pathname)) return null;
  // Edited in /admin/settings: one message per line
  const messages = settings.ticker_messages.split(/\r?\n/).map((m) => m.trim()).filter(Boolean);
  if (messages.length === 0) return null;

  return (
    <Link href="/courses" className="block surface-dark text-[13px] overflow-hidden group" aria-label={`Xem khóa học: ${messages[0]}`}>
      <div className="marquee-track py-2.5" style={{ ["--marquee-duration" as string]: "40s" }} aria-hidden="true">
        {[...messages, ...messages, ...messages, ...messages].map((m, i) => (
          <span key={i} className="flex items-center gap-3 px-6 whitespace-nowrap text-stone-300 group-hover:text-white transition-colors">
            <Sparkles size={13} className="text-gold-light shrink-0" />
            {m}
          </span>
        ))}
      </div>
    </Link>
  );
}
