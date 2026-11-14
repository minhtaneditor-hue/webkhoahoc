import { after } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { answerWaiting, healthCheck } from '@/lib/fb/agent';
import { fbConfigured, subscribePage, tokenInfo } from '@/lib/fb/graph';
import { botEnabled, lockedOff, setBotEnabled } from '@/lib/fb/switch';
import { sendTelegram, validTelegramSecret } from '@/lib/fb/telegram';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Telegram webhook: Minh Tấn controls the Messenger bot from the alert chat.
 *   /tat (/off)          bot stops replying to messages and comments (they are still saved)
 *   /bat (/on)           bot replies again
 *   /trangthai (/status) on or off, and how many customers are waiting for him
 *   /tralo               the bot answers every customer still waiting (paused ones too)
 *   /kiemtra             health check: switch, AI, Facebook token + webhook fields, last 24 h counts
 * Only TELEGRAM_CHAT_ID is obeyed; the secret header proves the call comes from Telegram.
 * Connected from Admin > Facebook Messenger > "Kết nối Telegram".
 */

type Update = { message?: { chat: { id: number }; text?: string } };

function command(text: string) {
  const t = text.trim().toLowerCase().replace(/@\w+$/, '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  if (/^\/?(tat|off|tat bot)$/.test(t)) return 'off';
  if (/^\/?(bat|on|bat bot)$/.test(t)) return 'on';
  if (/^\/?(trangthai|trang thai|status|start)$/.test(t)) return 'status';
  if (/^\/?(tralo|tra loi|tra loi het|tra loi tat ca)$/.test(t)) return 'answer';
  if (/^\/?(kiemtra|kiem tra|check)$/.test(t)) return 'check';
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
      await sendTelegram(msg.chat.id, 'Lệnh: /kiemtra để bot tự kiểm tra, /tralo để bot trả lời hết khách đang chờ, /tat để tắt bot, /bat để bật lại, /trangthai để xem tình trạng.');
      return new Response('ok');
    }
    if (cmd === 'check') {
      const lines = [(await botEnabled(db)) ? '🟢 Công tắc: BẬT' : '🔴 Công tắc: TẮT'];
      if (!fbConfigured()) lines.push('❌ Thiếu FB_PAGE_ACCESS_TOKEN trên Vercel');
      else {
        try {
          const t = await tokenInfo();
          lines.push(`✅ Facebook token của Trang: ${t.name}`);
          const need = ['messages', 'message_echoes'].filter((f) => !t.fields.includes(f));
          if (need.length) {
            // the Page stopped sending messages to the app: subscribe it again right away
            const fields = await subscribePage(t.id).catch((e) => { lines.push(`❌ Đăng ký lại webhook lỗi: ${e instanceof Error ? e.message : e}`); return null; });
            if (fields) lines.push(`🔧 Trang chưa gửi ${need.join(', ')} cho app, đã đăng ký lại: ${fields.join(', ')}`);
          } else lines.push(`✅ Webhook nhận: ${t.fields.join(', ')}`);
        } catch (err) {
          lines.push(`❌ Facebook từ chối token: ${(err instanceof Error ? err.message : String(err)).slice(0, 300)}`);
        }
      }
      lines.push(...(await healthCheck(db)));
      await sendTelegram(msg.chat.id, lines.join('\n'));
      return new Response('ok');
    }
    if (cmd === 'answer') {
      if (!(await botEnabled(db))) {
        await sendTelegram(msg.chat.id, '🔴 Bot đang tắt. Nhắn /bat trước rồi /tralo.');
        return new Response('ok');
      }
      const job = await answerWaiting(db);
      after(job.run);
      await sendTelegram(msg.chat.id, job.waiting ? `🤖 Bot đang trả lời ${job.waiting} khách đang chờ. Nếu gặp lỗi, bot sẽ báo "Bot lỗi kỹ thuật" kèm lý do.` : '✅ Không có khách nào đang chờ trả lời.');
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
