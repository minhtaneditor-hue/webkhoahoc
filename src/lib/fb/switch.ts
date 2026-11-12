import type { SupabaseClient } from '@supabase/supabase-js';

// Main on/off switch for the Messenger bot (replies to messages and comments). SERVER ONLY.
// Flipped from Admin > Facebook Messenger or with /tat and /bat on Telegram; stored in site_settings.
// FB_BOT_ENABLED=false on Vercel keeps it off whatever the switch says.

const KEY = 'fb_bot_enabled';

export async function botEnabled(db: SupabaseClient) {
  if (process.env.FB_BOT_ENABLED === 'false') return false;
  const { data } = await db.from('site_settings').select('value').eq('key', KEY).maybeSingle();
  return data?.value !== 'false';
}

export async function setBotEnabled(db: SupabaseClient, on: boolean) {
  const { error } = await db.from('site_settings').upsert({
    key: KEY,
    value: on ? 'true' : 'false',
    description: 'Bot Messenger tự trả lời (bật/tắt trong Admin hoặc Telegram)',
    group: 'fb',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'key' });
  if (error) throw new Error(error.message);
  return botEnabled(db);
}

/** Why the bot is off when FB_BOT_ENABLED forces it, so the switch does not look broken. */
export const lockedOff = () => process.env.FB_BOT_ENABLED === 'false';
