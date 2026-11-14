// The visitor's own IP and country, whether the request comes straight to Vercel or through
// the Cloudflare proxy. Behind Cloudflare, Vercel's x-forwarded-for holds a Cloudflare address
// shared by many visitors, so Cloudflare's own headers come first.
//
// cf-connecting-ip can be faked by someone calling the Vercel address directly. It only feeds
// rate limits, visitor counts and payment metadata, never access decisions, so that is acceptable.

type WithHeaders = { headers: Headers };

export function clientIp(req: WithHeaders): string {
  const h = req.headers;
  return (
    h.get('cf-connecting-ip')?.trim() ||
    (h.get('x-forwarded-for') || '').split(',')[0].trim() ||
    h.get('x-real-ip')?.trim() ||
    ''
  );
}

/** Two-letter country code, or null. Cloudflare uses XX for unknown and T1 for Tor. */
export function clientCountry(req: WithHeaders): string | null {
  const cf = req.headers.get('cf-ipcountry')?.trim().toUpperCase();
  if (cf && cf !== 'XX' && cf !== 'T1') return cf;
  return req.headers.get('x-vercel-ip-country') || null;
}
