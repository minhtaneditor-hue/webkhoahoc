import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Simple JWT-like token signer using Web Crypto (no external deps)
async function createToken(payload: Record<string, unknown>, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '');
  const body = btoa(JSON.stringify(payload)).replace(/=/g, '');
  const data = `${header}.${body}`;
  
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const sig = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  
  return `${data}.${sig}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json({ error: 'Missing videoId' }, { status: 400 });
  }

  // 1. Verify user session with Supabase
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Generate DRM License Token
  const secret = process.env.DRM_SECRET || '291158ed-795b-4b28-917a-bf47c0f130da';
  
  // The token contains the user's email (for watermark verification on server) 
  // and the video ID to prevent token reuse for other videos.
  const token = await createToken(
    { 
      userId: user.id, 
      email: user.email, 
      videoId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
    }, 
    secret
  );

  return NextResponse.json({ token });
}

