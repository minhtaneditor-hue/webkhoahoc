import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { getSessionUser, getSupabaseAdmin } from '@/lib/supabase-server';
import { buildVoice } from '@/lib/fb/voice';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // the AI reads up to ~160 conversations

/** POST /api/admin/messenger/voice: writes a new draft of Minh Tấn's voice profile (Admin only). */
export async function POST() {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Thiếu SUPABASE_SERVICE_ROLE_KEY.' }, { status: 500 });
  const user = await getSessionUser();
  if (!user || !isAdmin(user.email)) return NextResponse.json({ error: 'Chỉ admin.' }, { status: 403 });
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Thiếu ANTHROPIC_API_KEY.' }, { status: 500 });

  try {
    const r = await buildVoice(db);
    return r.ok ? NextResponse.json(r) : NextResponse.json({ error: r.error }, { status: 400 });
  } catch (err) {
    console.error('fb voice failed', err);
    return NextResponse.json({ error: 'AI chưa viết được hồ sơ giọng, thử lại sau.' }, { status: 502 });
  }
}
