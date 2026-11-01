import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createSupabaseServer } from '@/lib/supabase-server';

// Email links (reset password, confirm signup, magic link) land here with a token_hash.
// Unlike the ?code= flow this works in any browser, e.g. the Gmail app on a phone.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const fallback = type === 'recovery' ? '/auth/update-password' : '/dashboard';
  const nextParam = url.searchParams.get('next') || fallback;
  // Only allow same-site paths, so `?next=//evil.com` can't be used as an open redirect
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : fallback;

  if (tokenHash && type) {
    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL(next, request.url));
  }
  return NextResponse.redirect(new URL('/auth?error=link', request.url));
}
