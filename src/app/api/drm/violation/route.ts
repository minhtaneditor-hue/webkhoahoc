import { NextResponse } from 'next/server';
import { getSessionUser, getSupabaseAdmin } from '@/lib/supabase-server';
import { DRM, clientIp, logViolation, revoke, type DrmSession } from '@/lib/drm/server';

export const dynamic = 'force-dynamic';

// Happen during normal use: logged, never counted towards a lock
const SOFT = ['focus_lost', 'tab_hidden'];

/**
 * POST /api/drm/violation  { sessionId, type }
 * Logs client-side security events; too many severe ones in a session revoke it.
 */
export async function POST(req: Request) {
  const user = await getSessionUser();
  const admin = getSupabaseAdmin();
  if (!user || !admin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { sessionId, type } = await req.json().catch(() => ({}));
  const safeType = String(type || 'unknown').slice(0, 64);

  const { data: s } = sessionId
    ? await admin.from('drm_sessions').select('*').eq('id', sessionId).eq('user_id', user.id).maybeSingle<DrmSession>()
    : { data: null };
  await logViolation(admin, { user_id: user.id, session_id: s?.id || null, video_id: s?.video_id || null, type: safeType, ip: clientIp(req) });

  if (s && !s.revoked && !SOFT.includes(safeType)) {
    await admin.from('drm_sessions').update({ violations: s.violations + 1 }).eq('id', s.id);
    if (s.violations + 1 >= DRM.maxViolations) {
      await revoke(admin, s.id, 'too_many_violations');
      return NextResponse.json({ error: 'too_many_violations' }, { status: 409 });
    }
  }
  return NextResponse.json({ status: 'logged' });
}
