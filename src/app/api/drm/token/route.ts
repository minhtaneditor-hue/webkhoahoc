import { NextResponse } from 'next/server';
import { getSessionUser, getSupabaseAdmin } from '@/lib/supabase-server';
import { isAdmin } from '@/lib/admin';

const base64url = (input: string) =>
  btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

// Simple JWT-like token signer using Web Crypto (no external deps)
async function createToken(payload: Record<string, unknown>, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify(payload));
  const data = `${header}.${body}`;
  
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const sig = base64url(String.fromCharCode(...new Uint8Array(signature)));
  
  return `${data}.${sig}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json({ error: 'Missing videoId' }, { status: 400 });
  }

  // 1. Verify user session with Supabase
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const secret = process.env.DRM_SECRET;
  const supabaseAdmin = getSupabaseAdmin();
  if (!secret || !supabaseAdmin) {
    return NextResponse.json({ error: 'DRM_SECRET or SUPABASE_SERVICE_ROLE_KEY is missing.' }, { status: 500 });
  }

  // 2. Only issue a license if the user may watch this video: free lesson, enrolled, or admin
  const { data: lesson } = await supabaseAdmin
    .from('lessons')
    .select('course_id, is_free')
    .eq('video_url', `drm:${videoId}`)
    .maybeSingle();

  if (!lesson) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  }

  if (!lesson.is_free && !isAdmin(user.email)) {
    const { data: enrollment } = await supabaseAdmin
      .from('enrollments')
      .select('status')
      .eq('user_id', user.id)
      .eq('course_id', lesson.course_id)
      .eq('status', 'active')
      .maybeSingle();

    if (!enrollment) {
      return NextResponse.json({ error: 'Bạn chưa đăng ký khóa học này.' }, { status: 403 });
    }
  }

  // 3. Generate DRM License Token
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

