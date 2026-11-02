import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { SAFE_ID, checkPlayback, clientIp, keyOverBudget, noStore } from '@/lib/drm/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/drm/keys/:videoId/:idx?pt=...
 * Releases one AES-128 key to a live session, only as fast as a person can watch.
 */
export async function GET(req: Request, { params }: { params: Promise<{ videoId: string; idx: string }> }) {
  const { videoId, idx } = await params;
  if (!SAFE_ID.test(videoId) || !/^\d{1,6}$/.test(idx)) return new NextResponse('Bad request', { status: 400 });
  const admin = getSupabaseAdmin();
  if (!admin) return new NextResponse('DRM not configured', { status: 500 });

  const check = await checkPlayback(admin, req, videoId);
  if ('error' in check) return new NextResponse(check.error, { status: check.status, headers: noStore });

  const { data: video } = await admin.from('drm_videos').select('group_duration').eq('id', videoId).maybeSingle();
  if (await keyOverBudget(admin, check.session, Number(idx), video?.group_duration || 30, clientIp(req))) {
    return new NextResponse('download_tool_suspected', { status: 409, headers: noStore });
  }

  const { data: row } = await admin.from('drm_keys').select('key').eq('video_id', videoId).eq('idx', Number(idx)).maybeSingle();
  if (!row) return new NextResponse('Key not found', { status: 404, headers: noStore });
  // PostgREST returns bytea as "\x<hex>"
  const key = Buffer.from(String(row.key).replace(/^\\x/, ''), 'hex');
  return new NextResponse(new Uint8Array(key), { headers: { ...noStore, 'Content-Type': 'application/octet-stream' } });
}
