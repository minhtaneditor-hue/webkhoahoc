import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/lib/admin';
import { getSessionUser } from '@/lib/supabase-server';

// Called by the admin screens after a save so public pages show the change on the next visit
// instead of waiting for the ISR window.
export async function POST() {
  const user = await getSessionUser();
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  revalidatePath('/', 'layout');
  return NextResponse.json({ revalidated: true });
}
