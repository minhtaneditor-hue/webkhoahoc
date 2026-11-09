import { NextResponse } from 'next/server';
import { getSessionUser, getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// The signed-in user's membership, so course and shop pages can show member prices.
// Checkout recomputes the price on its own; this is display only.
export async function GET() {
  const user = await getSessionUser();
  const supabase = getSupabaseAdmin();
  if (!user || !supabase) return NextResponse.json({ active: false, expiresAt: null });
  const { data } = await supabase.from('memberships').select('expires_at').eq('user_id', user.id).maybeSingle();
  const active = !!data && Date.parse(data.expires_at) > Date.now();
  return NextResponse.json({ active, expiresAt: data?.expires_at ?? null });
}
