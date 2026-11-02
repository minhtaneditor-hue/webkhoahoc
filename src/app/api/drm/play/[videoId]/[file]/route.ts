import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { SAFE_FILE, SAFE_ID, checkPlayback, clientIp, noStore, r2Get, r2SignedUrl, segmentOverBudget } from '@/lib/drm/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/drm/play/:videoId/:file?pt=...
 * Playlists come back rewritten so every child URL carries the playback token; encrypted
 * segments redirect to a short-lived signed R2 URL after the risk check.
 */
export async function GET(req: Request, { params }: { params: Promise<{ videoId: string; file: string }> }) {
  const { videoId, file } = await params;
  if (!SAFE_ID.test(videoId) || !SAFE_FILE.test(file)) return new NextResponse('Bad request', { status: 400 });
  const admin = getSupabaseAdmin();
  if (!admin) return new NextResponse('DRM not configured', { status: 500 });

  const check = await checkPlayback(admin, req, videoId);
  if ('error' in check) return new NextResponse(check.error, { status: check.status, headers: noStore });

  if (file.endsWith('.m3u8')) {
    const res = await r2Get(`${videoId}/${file}`);
    if (!res.ok) return new NextResponse('Not found', { status: 404, headers: noStore });
    const pt = encodeURIComponent(new URL(req.url).searchParams.get('pt')!);
    const body = (await res.text()).replace(/^﻿/, '').split(/\r?\n/).map((line) => {
      if (line.startsWith('#EXT-X-KEY')) {
        // tvndrm://key/<videoId>/<n> -> protected key endpoint
        return line.replace(/URI="[^"]*"/, (m) => {
          const n = m.match(/tvndrm:\/\/key\/[a-zA-Z0-9_-]+\/(\d+)/)?.[1] ?? '0';
          return `URI="/api/drm/keys/${videoId}/${n}?pt=${pt}"`;
        });
      }
      return line && !line.startsWith('#') ? `${line.trim()}?pt=${pt}` : line;
    }).join('\n');
    return new NextResponse(body, { headers: { ...noStore, 'Content-Type': 'application/vnd.apple.mpegurl' } });
  }

  const index = Number(file.match(/_(\d+)\.ts$/)?.[1] ?? -1);
  if (index >= 0) {
    const { data: video } = await admin.from('drm_videos').select('segment_duration').eq('id', videoId).maybeSingle();
    if (await segmentOverBudget(admin, check.session, index, video?.segment_duration || 6, clientIp(req))) {
      return new NextResponse('download_tool_suspected', { status: 409, headers: noStore });
    }
  }
  return NextResponse.redirect(await r2SignedUrl(`${videoId}/${file}`), { status: 302, headers: noStore });
}
