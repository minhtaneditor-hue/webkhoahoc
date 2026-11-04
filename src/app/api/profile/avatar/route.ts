import { NextResponse } from 'next/server';
import { getSessionUser, getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX_BYTES = 1024 * 1024;

/**
 * POST /api/profile/avatar  (form field "file")
 * The media bucket is admin-write only, so a student's photo goes through here: the owner comes
 * from the session cookie, and only small raster images are stored (the browser shrinks them first).
 */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Vui lòng đăng nhập lại.' }, { status: 401 });
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Máy chủ chưa sẵn sàng.' }, { status: 500 });

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Chưa chọn ảnh.' }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: 'Vui lòng chọn ảnh JPG, PNG hoặc WebP.' }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Ảnh quá lớn, vui lòng chọn ảnh khác.' }, { status: 400 });

  const path = `avatars/${user.id}-${Date.now()}.${ext}`;
  const { error } = await db.storage.from('media').upload(path, file, { contentType: file.type, cacheControl: '31536000', upsert: false });
  if (error) return NextResponse.json({ error: 'Chưa tải được ảnh, vui lòng thử lại.' }, { status: 500 });

  const url = db.storage.from('media').getPublicUrl(path).data.publicUrl;
  const { error: saveError } = await db.from('users').update({ avatar_url: url }).eq('id', user.id);
  if (saveError) return NextResponse.json({ error: 'Chưa lưu được ảnh, vui lòng thử lại.' }, { status: 500 });
  return NextResponse.json({ url });
}
