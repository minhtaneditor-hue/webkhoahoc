import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';

// Initialize Supabase fallback or real admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only initialize if key is present to prevent build crash
let supabaseAdmin: any = null;
if (serviceKey) {
  supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}


export async function POST(req: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Config Error: SUPABASE_SERVICE_ROLE_KEY is missing in .env.local' }, { status: 500 });
    }

    // 1. Verify if the requester is the Admin
    const { userId, requesterEmail } = await req.json();
    
    if (!isAdmin(requesterEmail)) {
      return NextResponse.json({ error: 'Unauthorized Access. Privileged session required.' }, { status: 403 });
    }

    // 2. Reset Password for the target user
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: '21day12345' }
    );

    if (error) throw error;

    return NextResponse.json({ message: 'Password reset to 21day12345 successful.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Config Error: SUPABASE_SERVICE_ROLE_KEY is missing.' }, { status: 500 });
    }

    const { userId, requesterEmail } = await req.json();

    if (!isAdmin(requesterEmail)) {
      return NextResponse.json({ error: 'Unauthorized Access.' }, { status: 403 });
    }

    // 1. Delete user from Auth
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;

    return NextResponse.json({ message: 'User permanently removed from the system.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
