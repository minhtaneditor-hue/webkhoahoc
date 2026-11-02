'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Records one page view per route change in our own table (page_views), so the
// admin can read traffic at /admin/traffic without leaving the site.
// Admin and auth screens are skipped so the owner's own clicks don't count.
const SKIP = /^\/(admin|auth|api)(\/|$)/;

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || SKIP.test(pathname)) return;
    const body = JSON.stringify({ path: pathname, referrer: document.referrer || null });
    try {
      if (!navigator.sendBeacon?.('/api/track', new Blob([body], { type: 'application/json' }))) {
        fetch('/api/track', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'application/json' } }).catch(() => {});
      }
    } catch { /* tracking must never break the page */ }
  }, [pathname]);

  return null;
}
