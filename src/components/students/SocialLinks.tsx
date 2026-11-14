'use client';

import { Globe } from 'lucide-react';
import { useLang } from '@/lib/use-lang';

// Brand marks drawn inline (lucide has no brand icons). 24x24, currentColor.
const PATHS: Record<string, string> = {
  facebook: 'M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14A28 28 0 0 0 14.6 2C11.9 2 10 3.66 10 6.7v2.8H7v4h3V22h4z',
  tiktok: 'M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.6 2.6 0 0 1-2.59-2.6 2.6 2.6 0 0 1 3.36-2.48V9.66a5.73 5.73 0 0 0-.77-.05A5.66 5.66 0 0 0 4.2 15.3 5.66 5.66 0 0 0 9.86 21a5.66 5.66 0 0 0 5.66-5.66V9.01a7.3 7.3 0 0 0 4.28 1.37V7.3s-1.88.09-3.2-1.48z',
  instagram: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zM17.3 5.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zM21.9 7.8c-.1-1.6-.4-3-1.6-4.1S17.8 2.2 16.2 2.1C14.6 2 9.4 2 7.8 2.1c-1.6.1-3 .4-4.1 1.6S2.2 6.2 2.1 7.8C2 9.4 2 14.6 2.1 16.2c.1 1.6.4 3 1.6 4.1s2.5 1.5 4.1 1.6c1.6.1 6.8.1 8.4 0 1.6-.1 3-.4 4.1-1.6s1.5-2.5 1.6-4.1c.1-1.6.1-6.8 0-8.4zm-2.1 10.3a3.3 3.3 0 0 1-1.9 1.9c-1.3.5-4.3.4-5.9.4s-4.6.1-5.9-.4a3.3 3.3 0 0 1-1.9-1.9c-.5-1.3-.4-4.3-.4-5.9s-.1-4.6.4-5.9A3.3 3.3 0 0 1 6.1 4.4c1.3-.5 4.3-.4 5.9-.4s4.6-.1 5.9.4a3.3 3.3 0 0 1 1.9 1.9c.5 1.3.4 4.3.4 5.9s.1 4.6-.4 5.9z',
  youtube: 'M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.8 15V9l5.8 3z',
};
const LABELS: Record<string, string> = { facebook: 'Facebook', tiktok: 'TikTok', instagram: 'Instagram', youtube: 'YouTube', website: 'Website' };

export type Links = Partial<Record<'facebook' | 'tiktok' | 'instagram' | 'youtube' | 'website', string>>;

export default function SocialLinks({ links, name, dark = false }: { links: Links; name: string; dark?: boolean }) {
  const en = useLang() === 'en';
  const items = (Object.entries(links) as [string, string][]).filter(([, url]) => !!url);
  if (!items.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map(([kind, url]) => (
        <li key={kind}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label={en ? `${name} on ${LABELS[kind]}` : `${LABELS[kind]} của ${name}`}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${dark ? 'bg-white/10 text-white hover:bg-gold-light hover:text-onyx' : 'bg-muted text-ink hover:bg-onyx hover:text-gold-light'}`}
          >
            {PATHS[kind] ? (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d={PATHS[kind]} /></svg>
            ) : (
              <Globe size={16} aria-hidden="true" />
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}
