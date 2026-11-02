import { NextResponse } from 'next/server';
import { getSessionUser, getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/** POST /api/drm/session/end  { sessionId } (sent with keepalive when the page closes) */
export async function POST(req: Request) {
  const user = await getSessionUser();
  const admin = getSupabaseAdmin();
  if (!user || !admin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { sessionId } = await req.json().catch(() => ({}));
  await admin.from('drm_sessions').update({ revoked: true, revoke_reason: 'ended' })
    .eq('id', sessionId).eq('user_id', user.id).eq('revoked', false);
  return NextResponse.json({ status: 'ended' });
}
