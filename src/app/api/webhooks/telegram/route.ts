import { getSupabaseAdmin } from '@/lib/supabase-server';
import { botEnabled, lockedOff, setBotEnabled } from '@/lib/fb/switch';
import { sendTelegram, validTelegramSecret } from '@/lib/fb/telegram';

export const dynamic = 'force-dynamic';

/**
 * Telegram webhook: Minh Tấn controls the Messenger bot from the alert chat.
 *   /tat (/off)          bot stops replying to messages and comments (they are still saved)
 *   /bat (/on)           bot replies again
 *   /trangthai (/status) on or off, and how many customers are waiting for him
 * Only TELEGRAM_CHAT_ID is obeyed; the secret header proves the call comes from Telegram.
 * Connected from Admin > Facebook Messenger > "Kết nối Telegram".
 */

type Update = { message?: { chat: { id: number }; text?: string } };

function command(text: string) {
  const t = text.trim().toLowerCase().replace(/@\w+$/, '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  if (/^\/?(tat|off|tat bot)$/.test(t)) return 'off';
  if (/^\/?(bat|on|bat bot)$/.test(t)) return 'on';
  if (/^\/?(trangthai|trang thai|status|start)$/.test(t)) return 'status';
  return null;
}

export async function POST(req: Request) {
  if (!validTelegramSecret(req.headers.get('x-telegram-bot-api-secret-token'))) return new Response('Forbidden', { status: 403 });
  const update = (await req.json().catch(() => ({}))) as Update;
  const msg = update.message;
  if (!msg?.text || String(msg.chat.id) !== String(process.env.TELEGRAM_CHAT_ID)) return new Response('ok');

  const db = getSupabaseAdmin();
  if (!db) return new Response('ok');
  const cmd = command(msg.text);

  try {
    if (!cmd) {
      await sendTelegram(msg.chat.id, 'Lệnh: /tat để tắt bot, /bat để bật lại, /trangthai để xem tình trạng.');
      return new Response('ok');
    }
    const on = cmd === 'status' ? await botEnabled(db) : await setBotEnabled(db, cmd === 'on');
    const { count } = await db.from('fb_conversations').select('psid', { count: 'exact', head: true }).eq('needs_human', true);
    const lines = [
      on ? '🟢 <b>Bot Messenger đang BẬT</b>, tự trả lời tin nhắn và bình luận.' : '🔴 <b>Bot Messenger đang TẮT</b>. Tin nhắn vẫn được lưu, bạn trả lời trong Admin hoặc hộp thư Fanpage.',
      cmd === 'on' && lockedOff() ? '⚠️ Trên Vercel đang đặt FB_BOT_ENABLED=false nên bot vẫn tắt. Xóa biến đó rồi deploy lại.' : '',
      count ? `${count} khách đang chờ bạn trả lời.` : '',
    ].filter(Boolean);
    await sendTelegram(msg.chat.id, lines.join('\n'));
  } catch (err) {
    console.error('telegram command failed', err);
  }
  return new Response('ok');
}
