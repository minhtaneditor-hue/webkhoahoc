import { getSessionUser } from '@/lib/supabase-server';
import { logToolEvent } from '@/lib/tool-events';

export const dynamic = 'force-dynamic';

/**
 * POST /api/feedback { tool, rating: 'up' | 'down', comment?, context? }
 * Visitors rate a result of the free AI tools and say what they want; it lands in
 * public.tool_events and in the periodic tool report.
 */

const DAILY = 10; // per IP
const hits = new Map<string, { day: string; n: number }>();
function allow(ip: string) {
  const day = new Date().toISOString().slice(0, 10);
  const h = hits.get(ip);
  if (!h || h.day !== day) { hits.set(ip, { day, n: 1 }); return true; }
  if (h.n >= DAILY) return false;
  h.n++;
  return true;
}

const clean = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const tool = body.tool === 'cham-video' || body.tool === 'viet-kich-ban' ? body.tool : null;
  const rating = body.rating === 'up' || body.rating === 'down' ? body.rating : null;
  const comment = clean(body.comment, 1000);
  if (!tool || (!rating && !comment)) return Response.json({ error: 'Thiếu nội dung góp ý.' }, { status: 400 });

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  if (!allow(ip)) return Response.json({ error: 'Bạn đã gửi nhiều góp ý hôm nay rồi, cảm ơn bạn!' }, { status: 429 });

  // Small context only (which format/framework, the score), never the user's content.
  const ctx = body.context && typeof body.context === 'object' ? body.context : {};
  const context = {
    dang: clean(ctx.dang, 40) || undefined,
    khung: clean(ctx.khung, 40) || undefined,
    diem: Number.isFinite(Number(ctx.diem)) ? Number(ctx.diem) : undefined,
  };
  const user = await getSessionUser().catch(() => null);
  await logToolEvent(tool, 'feedback', { rating, comment, ...context }, user?.id);
  return Response.json({ ok: true });
}
