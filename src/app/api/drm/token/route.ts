import { NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json({ error: 'Missing videoId' }, { status: 400 });
  }

  // 1. Verify user session with Supabase
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Generate DRM License Token
  const secret = process.env.DRM_SECRET || '291158ed-795b-4b28-917a-bf47c0f130da';
  
  // The token contains the user's email (for watermark verification on server) 
  // and the video ID to prevent token reuse for other videos.
  const token = sign(
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
