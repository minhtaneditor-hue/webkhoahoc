import { NextResponse } from 'next/server';
import { getSessionUser, getSupabaseAdmin } from '@/lib/supabase-server';
import { DRM, revoke, type DrmSession } from '@/lib/drm/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/drm/heartbeat  { sessionId }
 * Keeps the session alive. 409 tells the player to stop immediately.
 */
export async function POST(req: Request) {
  const user = await getSessionUser();
  const admin = getSupabaseAdmin();
  if (!user || !admin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { sessionId } = await req.json().catch(() => ({}));

  const { data: s } = await admin.from('drm_sessions').select('*').eq('id', sessionId).eq('user_id', user.id).maybeSingle<DrmSession>();
  if (!s) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  if (s.revoked) return NextResponse.json({ error: s.revoke_reason || 'revoked' }, { status: 409 });
  if (Date.now() - new Date(s.last_seen).getTime() > DRM.sessionTimeoutMs) {
    await revoke(admin, s.id, 'heartbeat_timeout');
    return NextResponse.json({ error: 'heartbeat_timeout' }, { status: 409 });
  }
  await admin.from('drm_sessions').update({ last_seen: new Date().toISOString() }).eq('id', s.id);
  return NextResponse.json({ status: 'ok' });
}
