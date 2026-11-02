import { NextResponse, type NextRequest } from 'next/server';
import { createHash } from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|vercel-screenshot/i;

// Stores one page view (see PageViewTracker). No cookies and no raw IP: the
// visitor id is a hash of IP + browser + day, so it only counts unique visitors per day.
export async function POST(req: NextRequest) {
  const ua = req.headers.get('user-agent') || '';
  if (BOT.test(ua)) return new NextResponse(null, { status: 204 });

  let body: { path?: unknown; referrer?: unknown };
  try { body = await req.json(); } catch { return new NextResponse(null, { status: 400 }); }
  const path = typeof body.path === 'string' ? body.path.slice(0, 200) : '';
  if (!path.startsWith('/') || /^\/(admin|auth|api)(\/|$)/.test(path)) return new NextResponse(null, { status: 204 });

  let referrer: string | null = null;
  if (typeof body.referrer === 'string' && body.referrer) {
    try {
      const host = new URL(body.referrer).hostname.replace(/^www\./, '');
      if (host && host !== req.nextUrl.hostname.replace(/^www\./, '')) referrer = host.slice(0, 100);
    } catch { /* not a URL */ }
  }

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.TRACK_SALT || process.env.DRM_SECRET || 'tanva';
  const visitor = createHash('sha256').update(`${ip}|${ua}|${day}|${salt}`).digest('hex').slice(0, 16);
  const device = /ipad|tablet/i.test(ua) ? 'tablet' : /mobi|android|iphone/i.test(ua) ? 'mobile' : 'desktop';
  const country = req.headers.get('x-vercel-ip-country') || null;

  const supabase = getSupabaseAdmin();
  if (supabase) await supabase.from('page_views').insert({ path, referrer, country, device, visitor });
  return new NextResponse(null, { status: 204 });
}
