import { NextResponse } from 'next/server';
import { getSessionUser, getSupabaseAdmin } from '@/lib/supabase-server';
import { DRM, SAFE_ID, canWatch, clientIp, logViolation, sessionStartSignals, signPlayback } from '@/lib/drm/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/drm/session  { videoId, deviceId }
 * Opens a playback session after checking the licence and the concurrent-device limit.
 */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 });
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: 'Máy chủ chưa cấu hình DRM.' }, { status: 500 });

  const { videoId, deviceId } = await req.json().catch(() => ({}));
  if (typeof videoId !== 'string' || !SAFE_ID.test(videoId)) return NextResponse.json({ error: 'Invalid videoId' }, { status: 400 });
  if (typeof deviceId !== 'string' || !deviceId || deviceId.length > 128) return NextResponse.json({ error: 'Invalid deviceId' }, { status: 400 });

  const { data: video } = await admin.from('drm_videos').select('id').eq('id', videoId).maybeSingle();
  if (!video) return NextResponse.json({ error: 'Video chưa được tải lên.' }, { status: 404 });
  const licence = await canWatch(admin, user, videoId);
  if (!licence.ok) return NextResponse.json({ error: licence.error }, { status: licence.status });

  const ip = clientIp(req);
  // A reload on the same device replaces its old session instead of counting twice
  await admin.from('drm_sessions').update({ revoked: true, revoke_reason: 'replaced' })
    .eq('user_id', user.id).eq('device_id', deviceId).eq('revoked', false);
  const { data: live } = await admin.from('drm_sessions').select('device_id')
    .eq('user_id', user.id).eq('revoked', false).gt('last_seen', new Date(Date.now() - DRM.sessionTimeoutMs).toISOString());
  if (new Set(live?.map((s) => s.device_id)).size >= DRM.maxDevices) {
    await logViolation(admin, { user_id: user.id, video_id: videoId, type: 'concurrent_stream_blocked', ip });
    return NextResponse.json({ error: `Tài khoản đang xem trên thiết bị khác (tối đa ${DRM.maxDevices}).` }, { status: 409 });
  }

  const { data: session, error } = await admin.from('drm_sessions')
    .insert({ user_id: user.id, video_id: videoId, device_id: deviceId, ip, user_agent: (req.headers.get('user-agent') || '').slice(0, 255) })
    .select('id').single();
  if (error || !session) return NextResponse.json({ error: 'Không mở được phiên xem.' }, { status: 500 });

  await sessionStartSignals(admin, { id: session.id, user_id: user.id, video_id: videoId, device_id: deviceId }, ip);

  return NextResponse.json({
    sessionId: session.id,
    playbackToken: signPlayback({ sid: session.id, vid: videoId, uid: user.id, ip }),
    heartbeatInterval: Math.floor(DRM.sessionTimeoutMs / 3),
  });
}
