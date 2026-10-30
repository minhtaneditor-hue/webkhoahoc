import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { getSessionUser, getSupabaseAdmin } from '@/lib/supabase-server';

// Verifies the caller from their session cookie (never from the request body).
async function requireAdmin() {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return { error: NextResponse.json({ error: 'Config Error: SUPABASE_SERVICE_ROLE_KEY is missing.' }, { status: 500 }) };
  }
  const requester = await getSessionUser();
  if (!requester || !isAdmin(requester.email)) {
    return { error: NextResponse.json({ error: 'Unauthorized Access. Privileged session required.' }, { status: 403 }) };
  }
  return { supabaseAdmin };
}

// Sends the user a password-reset email instead of setting a shared default password.
export async function POST(req: Request) {
  try {
    const { supabaseAdmin, error: authError } = await requireAdmin();
    if (authError) return authError;

    const { userId } = await req.json();
    const { data: target, error: findError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (findError || !target.user?.email) throw findError || new Error('User not found');

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(target.user.email, {
      redirectTo: `${baseUrl}/auth/callback?next=/dashboard`,
    });
    if (error) throw error;

    return NextResponse.json({ message: `Đã gửi email đặt lại mật khẩu tới ${target.user.email}.` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { supabaseAdmin, error: authError } = await requireAdmin();
    if (authError) return authError;

    const { userId } = await req.json();

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;

    return NextResponse.json({ message: 'User permanently removed from the system.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
