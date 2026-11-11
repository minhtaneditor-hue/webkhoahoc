import { getSupabaseAdmin } from '@/lib/supabase-server';

// One row in public.tool_events (migration 030). Never throws: a failed log must not break the tool.
export async function logToolEvent(tool: 'cham-video' | 'viet-kich-ban', kind: string, data: Record<string, unknown>, userId?: string | null) {
  try {
    const db = getSupabaseAdmin();
    if (!db) return;
    const { error } = await db.from('tool_events').insert({ tool, kind, data, user_id: userId ?? null });
    if (error) console.error('tool_events', error.message);
  } catch (e) {
    console.error('tool_events', (e as Error).message);
  }
}
