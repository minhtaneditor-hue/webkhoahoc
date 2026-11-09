// Which pictures next/image may resize. Local files and the hosts listed in
// next.config.ts (Supabase Storage, YouTube stills) go through the optimizer, so a
// 2MB upload is served as a small WebP. Any other link pasted in the admin is shown
// as-is, because the optimizer refuses hosts it was not told about.

const OPTIMIZABLE_HOSTS = new Set(
  [
    (() => {
      try {
        return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '').hostname;
      } catch {
        return '';
      }
    })(),
    'i.ytimg.com',
  ].filter(Boolean),
);

/** True when the picture must skip the optimizer (an external host not allowed in next.config.ts). */
export function skipOptimizer(src?: string | null): boolean {
  if (!src || !src.startsWith('http')) return false;
  try {
    const url = new URL(src);
    if (url.hostname === 'i.ytimg.com') return false;
    return !(OPTIMIZABLE_HOSTS.has(url.hostname) && url.pathname.startsWith('/storage/v1/object/public/'));
  } catch {
    return true;
  }
}
