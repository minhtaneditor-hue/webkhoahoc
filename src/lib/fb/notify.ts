import { Resend } from 'resend';
import { FROM, SITE, esc } from '@/lib/emails';
import { getSiteSettings } from '@/lib/content';
import { contactFrom } from '@/lib/site-settings';

// Tells Minh Tấn about a hard case or a new order from Messenger.
// Telegram (instant, on the phone): TELEGRAM_BOT_TOKEN from @BotFather + TELEGRAM_CHAT_ID (send the bot
// a message, then open https://api.telegram.org/bot<token>/getUpdates to read chat.id).
// Email (Resend), only when Telegram is not set up: FB_NOTIFY_EMAIL, or the contact email in Admin > Nội dung & liên hệ.

export type Alert = { title: string; lines: [string, string][]; psid?: string };

export async function notifyAdmin(a: Alert) {
  const link = `${SITE}/admin/messenger${a.psid ? `?c=${encodeURIComponent(a.psid)}` : ''}`;
  const jobs: Promise<unknown>[] = [];

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (token && chat) {
    const text = [`<b>${esc(a.title)}</b>`, ...a.lines.map(([k, v]) => `<b>${esc(k)}:</b> ${esc(v)}`), `<a href="${link}">Mở trong Admin</a>`].join('\n');
    jobs.push(fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text: text.slice(0, 4000), parse_mode: 'HTML', disable_web_page_preview: true }),
    }));
  }

  // Telegram only (Minh Tấn's choice); email is the fallback when Telegram is not set up, so no alert is lost
  if (!(token && chat) && process.env.RESEND_API_KEY) {
    const to = process.env.FB_NOTIFY_EMAIL || contactFrom(await getSiteSettings()).email || 'tanva@minhtanacademy.com';
    const rows = a.lines.map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#78716C;vertical-align:top;white-space:nowrap;">${esc(k)}</td><td style="padding:6px 0;color:#242321;">${esc(v).replace(/\n/g, '<br>')}</td></tr>`).join('');
    jobs.push(new Resend(process.env.RESEND_API_KEY).emails.send({
      from: FROM,
      to,
      subject: `[Messenger] ${a.title}`,
      html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;max-width:560px;">
        <h2 style="margin:0 0 12px;color:#242321;">${esc(a.title)}</h2>
        <table style="border-collapse:collapse;margin:0 0 20px;">${rows}</table>
        <a href="${link}" style="display:inline-block;padding:12px 22px;background:#A84E3C;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;">Mở hội thoại trong Admin</a>
      </div>`,
    }));
  }

  const results = await Promise.allSettled(jobs);
  results.forEach((r) => { if (r.status === 'rejected') console.error('fb notify failed', r.reason); });
}
