import { createHmac, timingSafeEqual } from 'crypto';
import { SITE } from '@/lib/emails';

// Telegram commands for the Messenger bot (TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID, the same bot that sends the alerts).
// Admin > Facebook Messenger > "Kết nối Telegram" calls setTelegramWebhook once. SERVER ONLY.

const API = 'https://api.telegram.org/bot';

/** Telegram sends this back in X-Telegram-Bot-Api-Secret-Token; derived from the token, so no extra env var. */
function secret() {
  const token = process.env.TELEGRAM_BOT_TOKEN || '';
  return createHmac('sha256', token).update('tanva-fb-webhook').digest('hex');
}

export function validTelegramSecret(header: string | null) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(secret());
  return a.length === b.length && timingSafeEqual(a, b);
}

async function call(method: string, body: Record<string, unknown>) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('Thiếu TELEGRAM_BOT_TOKEN.');
  const res = await fetch(`${API}${token}/${method}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!data.ok) throw new Error(`Telegram từ chối: ${data.description || res.status}`);
  return data.result;
}

export function sendTelegram(chatId: string | number, text: string) {
  return call('sendMessage', { chat_id: chatId, text: text.slice(0, 4000), parse_mode: 'HTML', disable_web_page_preview: true });
}

export async function setTelegramWebhook() {
  if (!process.env.TELEGRAM_CHAT_ID) throw new Error('Thiếu TELEGRAM_CHAT_ID.');
  await call('setWebhook', { url: `${SITE}/api/webhooks/telegram`, secret_token: secret(), allowed_updates: ['message'] });
  await call('setMyCommands', {
    commands: [
      { command: 'kiemtra', description: 'Bot tự kiểm tra AI, Facebook, số tin đã gửi' },
      { command: 'tralo', description: 'Bot trả lời hết khách đang chờ' },
      { command: 'tat', description: 'Tắt bot Messenger' },
      { command: 'bat', description: 'Bật bot Messenger' },
      { command: 'trangthai', description: 'Xem bot đang bật hay tắt' },
    ],
  });
}
