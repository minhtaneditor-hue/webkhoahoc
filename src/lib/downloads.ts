import type { SupabaseClient } from '@supabase/supabase-js';

/** Counts a file link handed out (migration 026). A counting problem must never block the download. */
export async function logDownload(db: SupabaseClient, assetId: string, email: string | null | undefined, kind: 'free' | 'free-email' | 'paid') {
  const { error } = await db.from('asset_downloads').insert({ asset_id: assetId, email: email?.toLowerCase() || null, kind });
  if (error) console.error('Download not counted', error.message);
}
